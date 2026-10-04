/* Shared, deterministic contract used by the viewer and the remote agent tools. */
const STUDIO_OPTIONS={
  hvac:['none','wall-split','concealed-slots'],
  ceiling:['plain','gypsum-shadow-gap','perimeter-led'],
  lighting:['style','track','downlights','lamps','track-lamps','none'],
  flooring:['wood','walnut','tile800','tile600','marble','antislip','terrazzo','carpet','lightoak','parquet','travertine'],
  temperature:[2700,3000,4000],brightness:[0,100]
};
const STUDIO_VARIANTS={sofa:['style','cocoon','modular','tailored'],armchair:['style','cocoon','tailored'],bed:['style','upholstered','oak-platform','woven-headboard'],fridge:['style','integrated','steel'],ovencol:['style','black-glass','steel'],dishwasher:['style','integrated','steel']};
function studioDefaults(){return {version:1,rooms:{}};}
function studioRoomDefaults(){return {hvac:'none',ceiling:'plain',lighting:'style',temperature:3000,brightness:75,wall:null};}
function studioRoomOptions(scene,id){return {...studioRoomDefaults(),...scene.studio?.rooms?.[id]};}
function studioValidateOption(key,value){
  if(key==='wall')return value===null||typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value);
  if(key==='brightness')return Number.isFinite(value)&&value>=0&&value<=100;
  return Array.isArray(STUDIO_OPTIONS[key])&&STUDIO_OPTIONS[key].includes(value);
}
function studioNormalize(raw,rooms){
  const out=studioDefaults();
  for(const r of rooms){const source=raw?.rooms?.[r.id];if(!source||r.isTerrace)continue;
    const options={};for(const key of [...Object.keys(STUDIO_OPTIONS),'wall'])if(studioValidateOption(key,source[key]))options[key]=source[key];out.rooms[r.id]=options;
  }return out;
}
function studioSceneKey(scene){let h=2166136261;for(const c of JSON.stringify(scene)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return 'scene-'+(h>>>0).toString(16);}
function studioInside(point,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const [x,y]=poly[i],[a,b]=poly[j];if((y>point[1])!==(b>point[1])&&point[0]<(a-x)*(point[1]-y)/(b-y)+x)inside=!inside;
}return inside;}
function studioFootprint(f){const a=f.rot*Math.PI/180;return [[-1,-1],[1,-1],[1,1],[-1,1]].map(([x,y])=>[f.cx+x*f.w/2*Math.cos(a)-y*f.d/2*Math.sin(a),f.cy+x*f.w/2*Math.sin(a)+y*f.d/2*Math.cos(a)]);}
function studioFit(f,model){const points=studioFootprint(f);return model.rooms.find(r=>!r.isTerrace&&points.every((p,i)=>studioInside(p,r.poly)&&studioInside([(p[0]+points[(i+1)%4][0])/2,(p[1]+points[(i+1)%4][1])/2],r.poly)));}
function studioDistanceToSegment(p,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);}
function studioOverlaps(a,b){
  const A=studioFootprint(a),B=studioFootprint(b);
  for(const poly of [A,B])for(let i=0;i<4;i++){
    const p=poly[i],q=poly[(i+1)%4],axis=[p[1]-q[1],q[0]-p[0]],dot=v=>v[0]*axis[0]+v[1]*axis[1],x=A.map(dot),y=B.map(dot);
    if(Math.max(...x)<=Math.min(...y)+1||Math.max(...y)<=Math.min(...x)+1)return false;
  }return true;
}
function studioValidateProposalV1(proposal,layout,model){
  if(proposal?.schema!=='ApartmentDesignProposal/1')throw new Error('Expected ApartmentDesignProposal/1.');
  if(proposal.canonical_sha256!==model.canonical_sha256)throw new Error('Different canonical apartment.');
  if(proposal.base_scene_revision!==studioSceneKey(layout))throw new Error('This proposal is based on an older scene. Export a fresh brief.');
  if(!Array.isArray(proposal.operations)||proposal.operations.length>100)throw new Error('Expected up to 100 operations.');
  const next=JSON.parse(JSON.stringify(layout));next.studio=studioNormalize(next.studio,model.rooms);
  const unknown=Object.keys(proposal).filter(k=>!['schema','canonical_sha256','base_scene_revision','operations','author','notes'].includes(k));
  if(unknown.length)throw new Error('Unsupported proposal fields: '+unknown.join(', '));
  const moved=new Set();
  for(const op of proposal.operations){
    if(op.type==='room-option'){
      if(Object.keys(op).some(k=>!['type','room_id','key','value'].includes(k)))throw new Error('Unexpected room operation field.');
      const room=model.rooms.find(r=>r.id===op.room_id&&!r.isTerrace);if(!room)throw new Error('Unknown interior room.');
      if(!studioValidateOption(op.key,op.value))throw new Error('Invalid room option; ceiling height and walls are locked.');
      if(op.key==='flooring')next.rooms[room.id].mat=op.value;
      else (next.studio.rooms[room.id]??={})[op.key]=op.value;
    }else if(op.type==='furniture-variant'){
      if(Object.keys(op).some(k=>!['type','furniture_id','variant'].includes(k)))throw new Error('Unexpected furniture operation field.');
      const f=next.furniture.find(f=>f.id===op.furniture_id);if(!f||!STUDIO_VARIANTS[f.type]?.includes(op.variant))throw new Error('Invalid furniture variant.');f.variant=op.variant;
    }else if(op.type==='furniture-placement'){
      if(Object.keys(op).some(k=>!['type','furniture_id','cx','cy','w','d','rot'].includes(k)))throw new Error('Unexpected placement field.');
      const f=next.furniture.find(f=>f.id===op.furniture_id);if(!f)throw new Error('Unknown furniture item.');
      for(const k of ['cx','cy','w','d','rot'])if(op[k]!==undefined){if(!Number.isFinite(op[k]))throw new Error('Invalid placement number.');f[k]=op[k];}
      if(f.w<50||f.d<50||f.w>10000||f.d>10000||!studioFit(f,model))throw new Error('Furniture footprint must fit an interior room.');
      moved.add(f.id);
    }else throw new Error('Only room options, furniture variants and furniture placement are supported. Architecture is locked.');
  }
  const flat=new Set(['rug','tv','acwall','aircon','stove','ksink','waterheater','baycushion']);
  for(const id of moved){
    const f=next.furniture.find(f=>f.id===id),corners=studioFootprint(f);
    if((model.wall_segments||[]).some(s=>corners.some(p=>studioDistanceToSegment(p,s.from,s.to)<(s.thickness_mm||180)/2)))throw new Error('Furniture touches a modeled wall.');
    if((model.openings||[]).filter(o=>['hinged_door','doorless_passage','sliding_door'].includes(o.type)).some(o=>corners.some(p=>studioDistanceToSegment(p,o.from,o.to)<350)||studioInside(o.from,corners)||studioInside(o.to,corners)))throw new Error('Furniture obstructs an opening clearance.');
    if(!flat.has(f.type)&&next.furniture.some(g=>g.id!==f.id&&!flat.has(g.type)&&studioOverlaps(f,g)))throw new Error('Furniture overlaps another solid item.');
  }return next;
}
function studioRenderBrief(layout,model,roomId,catalog=[]){
  const room=model.rooms.find(r=>r.id===roomId&&!r.isTerrace);if(!room)throw new Error('Choose an interior room.');
  const options={...studioRoomOptions(layout,roomId),flooring:layout.rooms[roomId].mat},items=layout.furniture.filter(f=>studioInside([f.cx,f.cy],room.poly));
  return {schema:'ApartmentRenderBrief/1',room_id:roomId,canonical_sha256:model.canonical_sha256,scene_revision:studioSceneKey(layout),status:'EXPLORATORY',room_polygon_mm:room.poly,printed_dimensions_m:room.printed_dimensions_m||room.callouts,clear_ceiling_m:2.50,options,items,
    reference_products:catalog.filter(p=>items.some(f=>f.product_reference_id?p.id===f.product_reference_id:(p.variant===f.variant&&p.type===f.type))),
    prompt:`Create a photorealistic architectural interior concept of ${room.name}, Apartment Type B. Use the attached 3D screenshot as the exact geometry and camera reference, and the original plan as the topology reference. Preserve the room footprint, all doors and windows, furniture footprints and camera. Clear finished ceiling stays 2.50 m. Living glazing GLZ-RECP-N stays full-height. Decor style: ${layout.decor?.active||'custom'}. Room options: ${JSON.stringify(options)}. Furniture: ${JSON.stringify(items.map(({type,variant,w,d,rot,color,material_id,product_reference_id,status})=>({type,variant:variant||'style',w_mm:w,d_mm:d,rotation:rot,color,material_id:material_id||null,product_reference_id:product_reference_id||null,status:status||'EXPLORATORY'})))}. Show physically plausible fabric, wood, stone and paint textures, soft daylight, contact shadows and layered ${options.temperature} K lighting. ${options.hvac==='concealed-slots'?'Show only conceptual supply/return grille faces; do not invent a lowered ceiling or claim the hidden equipment fits the 130 mm void.':''} Do not add rooms, move glazing, raise or lower the ceiling, widen walls, or invent fitted cabinetry. No text or watermark. Treat this as an exploratory visual, not a construction drawing or exact branded product replica.`,
    required_references:['Current 3D room screenshot (use the viewer Screenshot control)','Original plan ./source-plan.jpeg'],
    validation:['Compare opening positions and proportions with the 3D screenshot','Check ceiling and furniture scale','Mark any generated geometry drift as unverified']};
}
