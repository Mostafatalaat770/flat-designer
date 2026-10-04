/* Cameras are references only. These functions never modify a saved layout. */
const APARTMENT_CAPTURE_PRESETS=['entry-overview','living-to-dining','dining-to-living','terrace-to-room','wide-corner'];
const APARTMENT_CAPTURE_VIEWPORT={width:1280,height:720};
const APARTMENT_CAPTURE_COORDINATES='Three.js metres: x=plan x minus half width; y=height; z=plan y minus half depth';
function studioCaptureCapability(env){
  const configured=!!env.BROWSER?.quickAction||!!(typeof env.CAPTURE_CLOUDFLARE_ACCOUNT_ID==='string'&&/^[a-f0-9]{32}$/i.test(env.CAPTURE_CLOUDFLARE_ACCOUNT_ID)&&typeof env.CAPTURE_CLOUDFLARE_API_TOKEN==='string'&&env.CAPTURE_CLOUDFLARE_API_TOKEN.length>=20);
  return {available:configured,execution:'server-headless',presets:APARTMENT_CAPTURE_PRESETS,viewport:APARTMENT_CAPTURE_VIEWPORT,coordinate_system:APARTMENT_CAPTURE_COORDINATES,maximum_batch_views:5,...(!configured?{reason:'headless_renderer_not_configured',message:'Server capture needs a configured headless rendering service. Manual Save view for AI render remains available.'}:{})};
}
function studioCaptureInputs(args,batch=false){
  if(!interiorObject(args)||Object.keys(args).some(k=>!(batch?['views','expected_scene_revision','request_id']:['room_id','preset','position','target','fov','expected_scene_revision','request_id']).includes(k))||typeof args.expected_scene_revision!=='string'||!/^scene-[0-9a-f]+$/.test(args.expected_scene_revision)||typeof args.request_id!=='string'||!/^[a-zA-Z0-9_-]{8,100}$/.test(args.request_id))throw new StudioStorageError('Supply expected_scene_revision and a unique request_id (8–100 letters, digits, _ or -).',400,'invalid_capture_request');
  const inputs=batch?args.views:[Object.fromEntries(Object.entries(args).filter(([k])=>!['expected_scene_revision','request_id'].includes(k)))];
  if(!Array.isArray(inputs)||!inputs.length||inputs.length>5)throw new StudioStorageError('Capture between one and five views.',400,'invalid_capture_request');
  const vector=v=>Array.isArray(v)&&v.length===3&&v.every(n=>Number.isFinite(n)&&Math.abs(n)<=250);
  for(const v of inputs){
    if(!interiorObject(v)||Object.keys(v).some(k=>!['room_id','preset','position','target','fov'].includes(k))||!HOST_MODEL.rooms.some(r=>r.id===v.room_id&&!r.isTerrace)||v.fov!==undefined&&(!Number.isFinite(v.fov)||v.fov<10||v.fov>120))throw new StudioStorageError('Invalid room, camera fields or FOV (10–120 degrees).',400,'invalid_camera');
    if(v.preset!==undefined?(!APARTMENT_CAPTURE_PRESETS.includes(v.preset)||v.position!==undefined||v.target!==undefined):(!vector(v.position)||!vector(v.target)||Math.hypot(...v.position.map((n,i)=>n-v.target[i]))<.05))throw new StudioStorageError('Choose a preset, or supply distinct position and target arrays in Three.js metres.',400,'invalid_camera');
  }
  return inputs.map(v=>interiorClone(v));
}
function studioCaptureSpace(room,preset,model){
  if(preset!=='terrace-to-room')return room;
  const opening=model.openings.find(o=>o.type==='glazed_terrace_opening'&&o.between.includes(room.id)&&o.between.some(id=>model.rooms.find(r=>r.id===id)?.isTerrace));
  if(!opening)throw new StudioStorageError('This room has no canonical terrace opening. Use entry-overview or wide-corner.',400,'unsupported_camera_preset');
  return model.rooms.find(r=>r.isTerrace&&opening.between.includes(r.id));
}
function studioCameraFits(point,height,space,layout,model){
  if(!studioInside(point,space.poly)||height<100||height>2450)return false;
  for(const wall of model.wall_segments)if(height<wall.height_m*1000+30&&studioDistanceToSegment(point,wall.from,wall.to)<wall.thickness_mm/2+65)return false;
  const solids=interiorSolids(layout,model);
  for(const f of solids)if(height>f.bottom_mm-40&&height<f.top_mm+40&&f.type!=='curtain'){
    const a=f.rot*Math.PI/180,dx=point[0]-f.cx,dy=point[1]-f.cy;
    if(Math.abs(dx*Math.cos(a)+dy*Math.sin(a))<f.w/2+65&&Math.abs(-dx*Math.sin(a)+dy*Math.cos(a))<f.d/2+65)return false;
  }
  return true;
}
function studioCaptureCamera(input,layout,model){
  const room=model.rooms.find(r=>r.id===input.room_id),toWorld=([x,y,z])=>[(x-model.width_mm/2)/1000,y,(z-model.depth_mm/2)/1000];
  let position,target,fov=input.fov??60;
  if(!input.preset){
    position=input.position;target=input.target;
    const point=[position[0]*1000+model.width_mm/2,position[2]*1000+model.depth_mm/2],space=model.rooms.find(r=>studioInside(point,r.poly));
    const linkedTerrace=space?.isTerrace&&model.openings.some(o=>o.type==='glazed_terrace_opening'&&o.between.includes(room.id)&&o.between.includes(space.id));
    if(!space||(space.id!==room.id&&!linkedTerrace)||!studioCameraFits(point,position[1]*1000,space,layout,model)||!studioInside([target[0]*1000+model.width_mm/2,target[2]*1000+model.depth_mm/2],room.poly)||target[1]<0||target[1]>2.5)throw new StudioStorageError('Camera must be clear of walls and tall furniture, inside this room or its connected terrace, and target the selected room below the locked 2.50 m ceiling.',400,'invalid_camera_placement');
  }else{
    const preset=input.preset,space=studioCaptureSpace(room,preset,model);
    if(['living-to-dining','dining-to-living'].includes(preset)&&room.kind!=='reception')throw new StudioStorageError('Living/dining presets require the reception. Use entry-overview or wide-corner for another room.',400,'unsupported_camera_preset');
    let desired,aim=room.at;
    if(room.id==='RECP-01'&&preset!=='terrace-to-room'){
      const refs={'entry-overview':[[14740,9740],[12800,5600],65],'living-to-dining':[[10600,1900],[14200,8200],65],'dining-to-living':[[14450,9140],[10700,2350],65],'wide-corner':[[12950,9680],[14700,5450],70]};
      [desired,aim,fov]=refs[preset];fov=input.fov??fov;
    }else if(preset==='terrace-to-room'){
      const opening=model.openings.find(o=>o.type==='glazed_terrace_opening'&&o.between.includes(room.id)&&o.between.includes(space.id));
      const mid=[(opening.from[0]+opening.to[0])/2,(opening.from[1]+opening.to[1])/2],dx=space.at[0]-mid[0],dy=space.at[1]-mid[1],len=Math.hypot(dx,dy)||1;
      desired=[mid[0]+dx/len*700,mid[1]+dy/len*700];
      if(room.id==='RECP-01')aim=[14200,6850];fov=input.fov??65;
    }else if(preset==='entry-overview'){
      const opening=model.openings.find(o=>o.between.includes(room.id)&&/door|passage|entry/.test(o.type));
      if(opening){const mid=[(opening.from[0]+opening.to[0])/2,(opening.from[1]+opening.to[1])/2],dx=room.at[0]-mid[0],dy=room.at[1]-mid[1],len=Math.hypot(dx,dy)||1;desired=[mid[0]+dx/len*450,mid[1]+dy/len*450];}
      else desired=room.poly[0];fov=input.fov??65;
    }else {desired=room.poly.reduce((a,b)=>Math.hypot(...a.map((n,i)=>n-room.at[i]))>Math.hypot(...b.map((n,i)=>n-room.at[i]))?a:b);fov=input.fov??70;}
    const xs=space.poly.map(p=>p[0]),ys=space.poly.map(p=>p[1]);let best=null,bestDistance=Infinity;
    const inspect=p=>{const d=Math.hypot(p[0]-desired[0],p[1]-desired[1]);if(d<bestDistance&&studioCameraFits(p,1680,space,layout,model)){best=p;bestDistance=d;}};
    inspect(desired);
    for(let x=Math.min(...xs)+150;x<Math.max(...xs);x+=200)for(let y=Math.min(...ys)+150;y<Math.max(...ys);y+=200)inspect([x,y]);
    if(!best)throw new StudioStorageError('No unobstructed camera position for this preset. Review tall furnishings or provide a custom camera.',422,'camera_obstructed');
    position=toWorld([best[0],1.68,best[1]]);target=toWorld([aim[0],1.40,aim[1]]);
  }
  const doors=[...model.doors.map(d=>({id:d.id,open:true,position:Math.atan2(-d.o[1],d.o[0])})),...model.slides.map(d=>({id:d.id,open:true,position:1}))];
  return {position,target,fov,projection_type:'perspective',coordinate_system:APARTMENT_CAPTURE_COORDINATES,aspect:16/9,near:.05,far:300,viewport:{...APARTMENT_CAPTURE_VIEWPORT},viewer:{cut_height_m:2.5,furnishings_visible:true,night:false,hour:10,mode:'orbit',doors}};
}
