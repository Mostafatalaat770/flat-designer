/* InteriorDesign/1 is a reversible overlay, never an architectural model. Units: mm. */
const INTERIOR_OBJECT_TYPES={
  divider:{variants:['vertical-slats','fluted-glass','open-shelf','storage-screen','solid-panel'],modes:['floor'],size:[1200,180,2200]},
  console:{variants:['plain'],modes:['floor','wall'],size:[1100,350,800],operating:600},
  sideboard:{variants:['plain'],modes:['floor','wall'],size:[1500,450,800],operating:800},
  bench:{variants:['plain','upholstered'],modes:['floor'],size:[1100,420,450],operating:600},
  artwork:{variants:['framed','canvas'],modes:['wall'],size:[800,40,650]},
  mirror:{variants:['rectangle','round'],modes:['wall'],size:[650,40,1000]},
  'wall-panel':{variants:['plain','fluted'],modes:['wall'],size:[1000,35,2200]},
  'media-unit':{variants:['plain','floating'],modes:['floor','wall'],size:[1800,380,500],operating:600},
  shelf:{variants:['open','floating'],modes:['wall','floor'],size:[900,280,450],operating:600},
  curtain:{variants:['sheer','drapery','layered'],modes:['opening','ceiling'],size:[1600,120,2450]},
  pendant:{variants:['globe','linear'],modes:['ceiling'],size:[360,360,650]},
  'floor-lamp':{variants:['shade','arc'],modes:['floor'],size:[380,380,1650]},
  'table-lamp':{variants:['shade','globe'],modes:['floor'],size:[260,260,420]},
  plant:{variants:['potted'],modes:['floor'],size:[450,450,1300]}
};
const INTERIOR_FURNITURE_TYPES=['bed','crib','nightstand','wardrobe','dresser','desk','chair','bookshelf','baycushion','sofa','cornersofa','armchair','beanbag','coffeetable','sidetable','tvstand','rug','shoecab','floorlamp','plant','table','roundtable','island','barstool','counter','stove','ksink','fridge','cabinet','toilet','vanity','shower','bathtub','washer','waterheater','tv','aircon','acwall','dishwasher','ovencol','dryer','purifier','officechair','piano','treadmill'];
const interiorObjectId=v=>typeof v==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(v)&&!['__proto__','prototype','constructor'].includes(v);
const interiorObject=v=>v&&typeof v==='object'&&!Array.isArray(v);
const interiorColour=v=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
const interiorClone=v=>JSON.parse(JSON.stringify(v));
const interiorRound=n=>Math.round(n*10)/10;
const interiorDefaults=()=>({version:1,objects:[],materials:[],surface_materials:{},opening_treatments:{}});
const interiorLayer=l=>l.interior||interiorDefaults();
const interiorUrl=v=>typeof v==='string'&&(v.startsWith('./')&&!v.includes('..')||/^https:\/\//.test(v));
const interiorMaterials=l=>[...INTERIOR_MATERIALS,...(l.interior?.materials||[])];
const interiorMaterial=(l,id)=>interiorMaterials(l).find(m=>m.id===id);
const interiorSurfacesCache=new WeakMap();
function interiorSurfaces(model){
  if(interiorSurfacesCache.has(model))return interiorSurfacesCache.get(model);
  const list=[];
  for(const room of model.rooms){
    list.push({id:'FLOOR-'+room.id,type:'floor',room_id:room.id,polygon_mm:room.poly,elevation_mm:0});
    if(!room.isTerrace)list.push({id:'CEILING-'+room.id,type:'ceiling',room_id:room.id,polygon_mm:room.poly,elevation_mm:2500});
    const walls=model.wall_segments.map((s,i)=>({s,i})).filter(({s})=>s.rooms.includes(room.id)&&s.kind!=='low').sort((a,b)=>{
      const A=[...a.s.from,...a.s.to],B=[...b.s.from,...b.s.to];for(let k=0;k<4;k++)if(A[k]!==B[k])return A[k]-B[k];return a.i-b.i;
    });
    for(const [{s,i},n] of walls.map((s,n)=>[s,n])){
      const dx=s.to[0]-s.from[0],dy=s.to[1]-s.from[1],length=Math.hypot(dx,dy),t=[dx/length,dy/length],mid=[(s.from[0]+s.to[0])/2,(s.from[1]+s.to[1])/2];
      let normal=[-t[1],t[0]];
      if(!studioInside([mid[0]+normal[0]*140,mid[1]+normal[1]*140],room.poly))normal=normal.map(v=>-v);
      list.push({id:'WALL-'+room.id+'-'+String(n+1).padStart(2,'0'),type:'wall',room_id:room.id,source_wall_index:i,from:s.from,to:s.to,tangent:t,inward_normal:normal,length_mm:interiorRound(length),height_mm:2500,wall_half_mm:s.thickness_mm/2,status:'INFERRED'});
    }
  }
  for(const o of model.openings)list.push({id:o.id,type:'opening',opening_type:o.type,room_ids:o.between.filter(id=>model.rooms.some(r=>r.id===id)),from:o.from,to:o.to,length_mm:interiorRound(o.length_mm)});
  const result={schema:'ApartmentInteriorSurfaces/1',canonical_sha256:model.canonical_sha256,coordinate_system:'canonical plan x/y millimetres; wall offsets measured from segment midpoint',surfaces:list};
  interiorSurfacesCache.set(model,result);return result;
}
function interiorAssertMaterial(m){
  if(!interiorObject(m)||m.schema!=='InteriorMaterial/1'||!interiorObjectId(m.id)||typeof m.name!=='string'||!m.name.trim()||m.name.length>120||typeof m.category!=='string'||!m.category||m.category.length>60||!['REAL_PRODUCT','REAL_MATERIAL','REFERENCE','GENERIC'].includes(m.source_status)||!interiorColour(m.base_colour))throw new Error('Invalid InteriorMaterial/1.');
  const fields=['schema','id','name','category','manufacturer','product_name','product_url','source_status','physical_dimensions_mm','texture_scale_mm','base_colour','finish','roughness','metallic','albedo_texture','normal_map','roughness_map','reference_images','notes','fallback_generic_id'];
  if(Object.keys(m).some(k=>!fields.includes(k)))throw new Error('Unknown material field.');
  for(const k of ['roughness','metallic'])if(m[k]!==undefined&&(!Number.isFinite(m[k])||m[k]<0||m[k]>1))throw new Error('PBR values must be between 0 and 1.');
  for(const k of ['manufacturer','product_name','finish','notes'])if(m[k]!==undefined&&(typeof m[k]!=='string'||m[k].length>3000))throw new Error('Invalid material description.');
  for(const k of ['product_url','albedo_texture','normal_map','roughness_map'])if(m[k]!==undefined&&m[k]!==null&&!interiorUrl(m[k]))throw new Error('Material assets require HTTPS or a relative asset path.');
  for(const k of ['physical_dimensions_mm','texture_scale_mm'])if(m[k]!==undefined&&(!interiorObject(m[k])||Object.entries(m[k]).some(([axis,v])=>!['width','height','depth'].includes(axis)||!Number.isFinite(v)||v<=0||v>100000)))throw new Error('Invalid material dimensions or texture scale.');
  if(m.reference_images!==undefined&&(!Array.isArray(m.reference_images)||m.reference_images.length>10||m.reference_images.some(v=>!interiorUrl(v))))throw new Error('Invalid reference images.');
  if(m.fallback_generic_id!==undefined&&!STUDIO_OPTIONS.flooring.includes(m.fallback_generic_id))throw new Error('Unknown generic fallback material.');
  if(m.source_status==='REAL_PRODUCT'&&(!m.manufacturer||!m.product_name||!m.product_url))throw new Error('Real products need manufacturer, product name and source URL.');
}
function interiorAssertFurniture(f,layout,model){
  if(!interiorObject(f)||!interiorObjectId(f.id)||f.id.length>80||!INTERIOR_FURNITURE_TYPES.includes(f.type)||typeof f.name!=='string'||!f.name.trim()||f.name.length>80||!interiorColour(f.color)||!['cx','cy','w','d','rot'].every(k=>Number.isFinite(f[k]))||f.w<50||f.d<50||f.w>10000||f.d>10000||Math.abs(f.cx)>100000||Math.abs(f.cy)>100000||Math.abs(f.rot)>360000)throw new Error('Invalid furniture record.');
  if(f.variant!==undefined&&f.variant!=='style'&&!STUDIO_VARIANTS[f.type]?.includes(f.variant))throw new Error('Invalid furniture shape.');
  if(f.status!==undefined&&!['EXPLORATORY','INFERRED','TBD','VERIFIED'].includes(f.status))throw new Error('Invalid furniture status.');
  if(f.material_id!==undefined&&f.material_id!==null&&(typeof f.material_id!=='string'||!interiorMaterial(layout,f.material_id)))throw new Error('Unknown furniture material.');
  if(f.product_reference_id!==undefined&&f.product_reference_id!==null&&(!interiorObjectId(f.product_reference_id)||f.product_reference_id.length>100))throw new Error('Invalid furniture product reference.');
  const room=studioFit(f,model);if(!room)throw new Error('Furniture footprint must fit an interior room.');return room;
}
function interiorFurnitureMaterial(layout,f,id){
  if(id===null){delete f.material_id;return;}
  if(typeof id!=='string')throw new Error('Invalid furniture material.');const material=interiorMaterial(layout,id);if(!material)throw new Error('Unknown furniture material.');f.material_id=id;f.color=material.base_colour;
}
function interiorForgetFurniture(layout,id){
  for(const saved of Object.values(layout.decor?.saved||{}))if(saved?.colours)delete saved.colours[id];
}
function interiorResolved(o,model){
  const p=o.placement,room=model.rooms.find(r=>r.id===o.room_id),w=o.width_mm,d=o.depth_mm,h=o.height_mm;
  let cx=o.cx,cy=o.cy,rotation=o.rotation||0,bottom=p.elevation_mm||0,host=null;
  if(p.mode==='wall'||p.mode==='opening'){
    host=interiorSurfaces(model).surfaces.find(s=>s.id===(p.host_wall_id||p.host_opening_id));
    let normal=host.inward_normal,t=host.tangent;
    if(p.mode==='opening'){
      const dx=host.to[0]-host.from[0],dy=host.to[1]-host.from[1],L=Math.hypot(dx,dy);t=[dx/L,dy/L];normal=[-t[1],t[0]];
      const mid=[(host.from[0]+host.to[0])/2,(host.from[1]+host.to[1])/2];if(!studioInside([mid[0]+normal[0]*200,mid[1]+normal[1]*200],room.poly))normal=normal.map(v=>-v);
    }
    const offset=p.offset_mm||0,inset=(host.wall_half_mm||90)+d/2+(p.inset_mm??1);
    cx=(host.from[0]+host.to[0])/2+t[0]*offset+normal[0]*inset;cy=(host.from[1]+host.to[1])/2+t[1]*offset+normal[1]*inset;rotation=Math.atan2(t[1],t[0])*180/Math.PI+((-t[1]*normal[0]+t[0]*normal[1])<0?180:0);
  }
  if(p.mode==='ceiling')bottom=2500-(p.drop_mm||0)-h;
  return {id:o.id,type:o.type,room_id:o.room_id,cx,cy,w,d,rot:rotation,bottom_mm:bottom,top_mm:bottom+h,host,object:o,interior:true};
}
function interiorAssertLayer(layout,model){
  if(!layout.interior)return;
  const layer=layout.interior,registry=interiorSurfaces(model).surfaces;
  if(!interiorObject(layer)||layer.version!==1||Object.keys(layer).some(k=>!['version','objects','materials','surface_materials','opening_treatments'].includes(k))||!Array.isArray(layer.objects)||layer.objects.length>150||!Array.isArray(layer.materials)||layer.materials.length>100||!interiorObject(layer.surface_materials)||!interiorObject(layer.opening_treatments))throw new Error('Invalid InteriorDesign/1 overlay.');
  const materialIds=new Set(INTERIOR_MATERIALS.map(m=>m.id));for(const m of layer.materials){interiorAssertMaterial(m);if(materialIds.has(m.id))throw new Error('Duplicate material ID.');materialIds.add(m.id);}
  const ids=new Set(layout.furniture.map(f=>f.id));
  for(const f of layout.furniture){
    if(f.material_id!==undefined&&f.material_id!==null&&!materialIds.has(f.material_id))throw new Error('Invalid furniture material reference.');
    if(f.status!==undefined&&!['EXPLORATORY','INFERRED','TBD','VERIFIED'].includes(f.status))throw new Error('Invalid furniture status.');
    if(f.product_reference_id!==undefined&&f.product_reference_id!==null&&(!interiorObjectId(f.product_reference_id)||f.product_reference_id.length>100))throw new Error('Invalid furniture product reference.');
  }
  for(const o of layer.objects){
    const spec=INTERIOR_OBJECT_TYPES[o.type];
    if(!interiorObject(o)||!spec||!interiorObjectId(o.id)||ids.has(o.id)||!spec.variants.includes(o.variant)||!model.rooms.some(r=>r.id===o.room_id&&!r.isTerrace)||!interiorObject(o.placement)||!spec.modes.includes(o.placement.mode)||!['width_mm','depth_mm','height_mm'].every(k=>Number.isFinite(o[k])&&o[k]>=5&&o[k]<=10000)||!Number.isFinite(o.rotation)||!interiorColour(o.colour)||!['EXPLORATORY','INFERRED','TBD','VERIFIED'].includes(o.status))throw new Error('Invalid interior object.');
    if(Object.keys(o).some(k=>!['id','type','variant','room_id','placement','cx','cy','rotation','width_mm','depth_mm','height_mm','material_references','colour','status','metadata'].includes(k)))throw new Error('Unsupported object fields. Architecture is locked.');
    if(Object.keys(o.placement).some(k=>!['mode','host_wall_id','host_opening_id','offset_mm','inset_mm','elevation_mm','drop_mm'].includes(k)))throw new Error('Invalid placement field.');
    for(const k of ['offset_mm','inset_mm','elevation_mm','drop_mm'])if(o.placement[k]!==undefined&&(!Number.isFinite(o.placement[k])||Math.abs(o.placement[k])>10000||k!=='offset_mm'&&o.placement[k]<0))throw new Error('Invalid host offset.');
    if(['floor','ceiling'].includes(o.placement.mode)&&![o.cx,o.cy].every(Number.isFinite))throw new Error('Floor and ceiling objects need finite cx/cy.');
    if(o.placement.mode==='wall'&&!registry.some(s=>s.id===o.placement.host_wall_id&&s.type==='wall'&&s.room_id===o.room_id))throw new Error('Invalid host_wall_id for this room.');
    if(o.placement.mode==='opening'&&!registry.some(s=>s.id===o.placement.host_opening_id&&s.type==='opening'&&s.room_ids.includes(o.room_id)))throw new Error('Invalid host_opening_id for this room.');
    if(!interiorObject(o.material_references)||Object.entries(o.material_references).some(([slot,id])=>!interiorObjectId(slot)||!materialIds.has(id)))throw new Error('Invalid object material reference.');
    if(!interiorObject(o.metadata)||JSON.stringify(o.metadata).length>6000||Object.keys(o.metadata).some(k=>['wall_segments','openings','room_geometry','ceiling_height_m'].includes(k)))throw new Error('Invalid decorative metadata.');
    if(o.metadata.operating_clearance_mm!==undefined&&(!Number.isFinite(o.metadata.operating_clearance_mm)||o.metadata.operating_clearance_mm<0||o.metadata.operating_clearance_mm>3000))throw new Error('Invalid operating clearance.');
    if(o.metadata.openness!==undefined&&(!Number.isFinite(o.metadata.openness)||o.metadata.openness<0||o.metadata.openness>1))throw new Error('Invalid curtain openness.');
    const r=interiorResolved(o,model);if(r.bottom_mm<0||r.top_mm>2500.01)throw new Error('Object must fit below the verified 2500 mm finished ceiling.');
    if(r.host&&o.placement.mode==='wall'&&Math.abs(o.placement.offset_mm||0)+o.width_mm/2>r.host.length_mm/2+.5)throw new Error('Object exceeds its usable wall segment.');
    ids.add(o.id);
  }
  for(const [id,material] of Object.entries(layer.surface_materials))if(!registry.some(s=>s.id===id&&s.type!=='opening')||!materialIds.has(material))throw new Error('Invalid surface or material reference.');
  for(const [id,t] of Object.entries(layer.opening_treatments)){
    if(!registry.some(s=>s.id===id&&s.type==='opening')||!interiorObject(t)||Object.keys(t).some(k=>!['type','variant','material_id','colour','openness','room_id'].includes(k))||!['none','curtain','blind'].includes(t.type)||!['sheer','drapery','layered','roller'].includes(t.variant)||!materialIds.has(t.material_id)||!interiorColour(t.colour)||!Number.isFinite(t.openness)||t.openness<0||t.openness>1||!model.openings.find(o=>o.id===id).between.includes(t.room_id))throw new Error('Invalid reversible opening treatment.');
  }
}
function interiorContains(p,poly){return studioInside(p,poly)||poly.some((a,i)=>studioDistanceToSegment(p,a,poly[(i+1)%poly.length])<.1);}
function interiorFits(r,room){
  const poly=studioFootprint(r);
  // Split each object edge at every polygon intersection; test each exact interval.
  for(let i=0;i<4;i++){
    const a=poly[i],b=poly[(i+1)%4],ts=[0,1],dx=b[0]-a[0],dy=b[1]-a[1];
    for(let j=0;j<room.poly.length;j++){
      const c=room.poly[j],d=room.poly[(j+1)%room.poly.length],ex=d[0]-c[0],ey=d[1]-c[1],den=dx*ey-dy*ex;if(Math.abs(den)<1e-8)continue;
      const t=((c[0]-a[0])*ey-(c[1]-a[1])*ex)/den,u=((c[0]-a[0])*dy-(c[1]-a[1])*dx)/den;
      if(t>=0&&t<=1&&u>=0&&u<=1)ts.push(t);
    }
    ts.sort((x,y)=>x-y);for(let j=0;j<ts.length;j++){const t=ts[j];if(!interiorContains([a[0]+dx*t,a[1]+dy*t],room.poly))return false;if(j){const m=(ts[j-1]+t)/2;if(!interiorContains([a[0]+dx*m,a[1]+dy*m],room.poly))return false;}}
  }return true;
}
function interiorSegmentDistance(a,b,c,d){
  const cross=(p,q,r)=>(q[0]-p[0])*(r[1]-p[1])-(q[1]-p[1])*(r[0]-p[0]);
  if(cross(a,b,c)*cross(a,b,d)<=0&&cross(c,d,a)*cross(c,d,b)<=0&&Math.max(Math.min(a[0],b[0]),Math.min(c[0],d[0]))<=Math.min(Math.max(a[0],b[0]),Math.max(c[0],d[0]))+.001&&Math.max(Math.min(a[1],b[1]),Math.min(c[1],d[1]))<=Math.min(Math.max(a[1],b[1]),Math.max(c[1],d[1]))+.001)return 0;
  return Math.min(studioDistanceToSegment(a,c,d),studioDistanceToSegment(b,c,d),studioDistanceToSegment(c,a,b),studioDistanceToSegment(d,a,b));
}
function interiorPolygonGap(A,B){
  if(A.some(p=>studioInside(p,B))||B.some(p=>studioInside(p,A)))return 0;
  let distance=Infinity;for(let i=0;i<A.length;i++)for(let j=0;j<B.length;j++)distance=Math.min(distance,interiorSegmentDistance(A[i],A[(i+1)%A.length],B[j],B[(j+1)%B.length]));return distance;
}
function interiorPenetration(A,B){
  let depth=Infinity;for(const poly of [A,B])for(let i=0;i<poly.length;i++){
    const a=poly[i],b=poly[(i+1)%poly.length],L=Math.hypot(b[0]-a[0],b[1]-a[1]),n=[(a[1]-b[1])/L,(b[0]-a[0])/L],dot=p=>p[0]*n[0]+p[1]*n[1],x=A.map(dot),y=B.map(dot),overlap=Math.min(Math.max(...x),Math.max(...y))-Math.max(Math.min(...x),Math.min(...y));
    if(overlap<=0)return 0;depth=Math.min(depth,overlap);
  }return depth;
}
function interiorLegacyItem(f,model){
  const heights={rug:15,coffeetable:420,table:760,roundtable:760,bed:700,sofa:850,chair:850,wardrobe:2300,fridge:1800,ovencol:2200,counter:900,island:900,tv:1400,acwall:2450};
  return {...f,room_id:model.rooms.find(r=>studioInside([f.cx,f.cy],r.poly))?.id,bottom_mm:0,top_mm:heights[f.type]||1000,interior:false};
}
const interiorFlat=new Set(['rug','tv','acwall','aircon','stove','ksink','waterheater','baycushion']);
function interiorSolids(layout,model){return [...layout.furniture.filter(f=>!interiorFlat.has(f.type)).map(f=>interiorLegacyItem(f,model)),...interiorLayer(layout).objects.map(o=>interiorResolved(o,model))];}
function interiorDoorSector(d){
  const a=Math.atan2(d.c[1],d.c[0]),b=Math.atan2(d.o[1],d.o[0]);let delta=((b-a+Math.PI*3)%(Math.PI*2))-Math.PI;
  const N=Math.ceil(Math.abs(delta)/(Math.PI/90)),poly=[d.h];for(let i=0;i<=N;i++)poly.push([d.h[0]+d.len*Math.cos(a+delta*i/N),d.h[1]+d.len*Math.sin(a+delta*i/N)]);return poly;
}
function interiorOpeningWidth(o,room,solids){
  const dx=o.to[0]-o.from[0],dy=o.to[1]-o.from[1],L=Math.hypot(dx,dy),t=[dx/L,dy/L];let n=[-t[1],t[0]];const mid=[(o.from[0]+o.to[0])/2,(o.from[1]+o.to[1])/2];
  if(!studioInside([mid[0]+n[0]*250,mid[1]+n[1]*250],room.poly))n=n.map(v=>-v);
  const approach=[o.from,o.to,[o.to[0]+n[0]*600,o.to[1]+n[1]*600],[o.from[0]+n[0]*600,o.from[1]+n[1]*600]],blocked=[],blockers=[];
  for(const r of solids.filter(r=>r.room_id===room.id&&r.bottom_mm<2000&&r.top_mm>100&&r.type!=='curtain')){
    const p=studioFootprint(r);if(interiorPolygonGap(p,approach)>0)continue;
    const values=p.map(p=>(p[0]-o.from[0])*t[0]+(p[1]-o.from[1])*t[1]);blocked.push([Math.max(0,Math.min(...values)),Math.min(L,Math.max(...values))]);blockers.push(r.id);
  }
  blocked.sort((a,b)=>a[0]-b[0]);let cursor=0,best=0;for(const [a,b] of blocked){if(b<=a)continue;best=Math.max(best,a-cursor);cursor=Math.max(cursor,b);}best=Math.max(best,L-cursor);return {width:Math.max(0,best),blockers};
}
function interiorValidation(layout,model,focusIds,options={}){
  interiorAssertLayer(layout,model);
  const solids=interiorSolids(layout,model),checks=[],active=focusIds?new Set(focusIds):null;
  const emit=(kind,status,data)=>checks.push({kind,status,...data});
  const relevant=(...ids)=>!active||ids.some(id=>active.has(id));
  for(const r of solids){
    const room=model.rooms.find(room=>room.id===r.room_id),footprint=studioFootprint(r);
    if(!room){emit('placement','FAIL',{object_id:r.id,message:'Object centre is outside all valid interior room space.'});continue;}
    emit('placement',interiorFits(r,room)?'PASS':'FAIL',{object_id:r.id,room_id:r.room_id,measured_clearance_mm:interiorRound(Math.min(...footprint.map(p=>Math.min(...room.poly.map((a,i)=>studioDistanceToSegment(p,a,room.poly[(i+1)%room.poly.length])))))),message:'Full footprint must remain in its assigned room.'});
    if(r.host?.type==='wall')emit('host-clearance','PASS',{object_id:r.id,host_wall_id:r.host.id,room_id:r.room_id,measured_clearance_mm:interiorRound(r.object.placement.inset_mm??1),message:'Mounting gap to the room-facing modeled host wall face.'});
    if(!r.interior&&!active?.has(r.id))continue;
    for(let i=0;i<model.wall_segments.length;i++){
      const wall=model.wall_segments[i];if(r.host?.source_wall_index===i)continue;
      const W={cx:(wall.from[0]+wall.to[0])/2,cy:(wall.from[1]+wall.to[1])/2,w:Math.hypot(wall.to[0]-wall.from[0],wall.to[1]-wall.from[1]),d:wall.thickness_mm,rot:Math.atan2(wall.to[1]-wall.from[1],wall.to[0]-wall.from[0])*180/Math.PI},gap=interiorPolygonGap(footprint,studioFootprint(W)),penetration=interiorPenetration(footprint,studioFootprint(W));
      if(gap<150&&r.bottom_mm<wall.height_m*1000)emit('object-wall',penetration>2?'FAIL':gap<20?'WARNING':'PASS',{object_id:r.id,source_wall_index:i,measured_clearance_mm:interiorRound(penetration?-penetration:gap),message:penetration?'Object intersects a modeled wall.':'Clearance to the displayed wall face.'});
    }
  }
  for(let i=0;i<solids.length;i++)for(let j=i+1;j<solids.length;j++){
    const a=solids[i],b=solids[j];if(a.room_id!==b.room_id||a.bottom_mm>=b.top_mm||b.bottom_mm>=a.top_mm||a.type==='curtain'||b.type==='curtain')continue;
    const A=studioFootprint(a),B=studioFootprint(b),gap=interiorPolygonGap(A,B),penetration=interiorPenetration(A,B);
    if(gap>950)continue;
    const deliberateTablePair=['table','roundtable','coffeetable'].includes(a.type)&&['chair','sofa'].includes(b.type)||['table','roundtable','coffeetable'].includes(b.type)&&['chair','sofa'].includes(a.type);
    const hard=penetration>40&&(a.interior||b.interior||relevant(a.id,b.id)&&!!active)&&!deliberateTablePair;
    if(penetration>0)emit('object-object',hard?'FAIL':'WARNING',{object_ids:[a.id,b.id],measured_clearance_mm:-interiorRound(penetration),baseline_issue:!a.interior&&!b.interior&&!active,message:deliberateTablePair?'Furniture footprint interface: inspect the actual leg/seat geometry.':'Overlapping occupied volumes.'});
    else if(gap<950&&relevant(a.id,b.id)&&Math.min(a.top_mm,b.top_mm)>300&&Math.max(a.bottom_mm,b.bottom_mm)<1800)emit('pinch-point',gap<750?'WARNING':'PASS',{object_ids:[a.id,b.id],measured_clearance_mm:interiorRound(gap),preferred_clearance_mm:900,message:'Nearest edge gap, not automatically a designated walking route.'});
  }
  for(const opening of model.openings){
    const isGlazing=opening.id.startsWith('GLZ-');
    for(const roomId of opening.between){const room=model.rooms.find(r=>r.id===roomId);if(!room)continue;
      const {width,blockers}=interiorOpeningWidth(opening,room,solids);
      emit(isGlazing?'glazing-obstruction':'opening-obstruction',!isGlazing&&width<300&&solids.some(r=>blockers.includes(r.id)&&(r.interior||active?.has(r.id)))?'FAIL':width<Math.min(750,opening.length_mm-1)?'WARNING':'PASS',{opening_id:opening.id,room_id:roomId,object_ids:blockers,measured_clearance_mm:interiorRound(width),canonical_opening_width_mm:interiorRound(opening.length_mm),assessment_depth_mm:600,message:isGlazing?'Free frontage at glazing; curtains are intentional treatments.':'Conservative free width through the 600 mm approach band.'});
    }
  }
  for(const door of model.doors){
    const sweep=interiorDoorSector(door);
    for(const r of solids.filter(r=>r.bottom_mm<2100&&r.top_mm>100&&r.type!=='curtain')){
      const gap=interiorPolygonGap(studioFootprint(r),sweep);if(gap>350)continue;
      const overlap=interiorPenetration(studioFootprint(r),sweep);
      emit('door-swing',overlap>40&&(r.interior||active?.has(r.id))?'FAIL':overlap>0||gap<100?'WARNING':'PASS',{object_id:r.id,opening_id:door.id,measured_clearance_mm:interiorRound(overlap?-overlap:gap),status_of_hinge_geometry:'INFERRED',angular_sample_degrees:2,message:'Clearance to the displayed full door sweep; hinge convention is inferred.'});
    }
  }
  for(const r of solids){
    const required=r.interior?(r.object.metadata.operating_clearance_mm??INTERIOR_OBJECT_TYPES[r.type].operating):({wardrobe:800,fridge:900,dishwasher:1000,ovencol:900}[r.type]);
    if(!required)continue;
    const measured=interiorOperatingDistance(r,solids,model);
    emit('operating-clearance',measured+1<required?'WARNING':'PASS',{object_id:r.id,room_id:r.room_id,measured_clearance_mm:interiorRound(measured),preferred_clearance_mm:required,front_convention:'Full front width, local +depth; review manufacturer opening direction',message:'Measured free depth to the first footprint, wall face or room boundary. Preferred depth is a planning assumption.'});
  }
  if(options.circulation!==false)for(const room of model.rooms.filter(r=>!r.isTerrace))for(const route of interiorCirculation(room,model,solids))emit('circulation',route.measured_clearance_mm<750?'WARNING':'PASS',route);
  const status=checks.some(c=>c.status==='FAIL')?'FAIL':checks.some(c=>c.status==='WARNING')?'WARNING':'PASS';
  return {schema:'ApartmentInteriorValidation/1',status,valid:status!=='FAIL',canonical_sha256:model.canonical_sha256,checks,summary:{pass:checks.filter(c=>c.status==='PASS').length,warning:checks.filter(c=>c.status==='WARNING').length,fail:checks.filter(c=>c.status==='FAIL').length},policy:{preferred_circulation_mm:900,review_circulation_mm:750,severe_overlap_mm:40},limitations:['Distances come from the conceptual millimetre geometry, not a site survey.','Nearest pair gaps identify pinch candidates; route analysis is reported separately.','Legacy table/chair interfaces and existing coarse footprints are review warnings.','Door hinge/swing conventions and operating depths are inferred, not manufacturer-certified.']};
}
function interiorClip(poly,axis,bound,above){
  if(!poly.length)return [];const out=[],inside=p=>above?p[axis]>=bound:p[axis]<=bound;
  for(let i=0;i<poly.length;i++){const a=poly[(i+poly.length-1)%poly.length],b=poly[i],A=inside(a),B=inside(b);if(A!==B){const t=(bound-a[axis])/(b[axis]-a[axis]);out.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t]);}if(B)out.push(b);}return out;
}
function interiorOperatingDistance(r,solids,model){
  const angle=r.rot*Math.PI/180,t=[Math.cos(angle),Math.sin(angle)],n=[-t[1],t[0]],front=[r.cx+n[0]*r.d/2,r.cy+n[1]*r.d/2],local=p=>[(p[0]-front[0])*t[0]+(p[1]-front[1])*t[1],(p[0]-front[0])*n[0]+(p[1]-front[1])*n[1]];
  const strip=poly=>interiorClip(interiorClip(interiorClip(poly.map(local),0,-r.w/2,true),0,r.w/2,false),1,0,true);
  let measured=Infinity;
  const inspect=poly=>{const clipped=strip(poly);if(clipped.length)measured=Math.min(measured,Math.max(0,Math.min(...clipped.map(p=>p[1]))));};
  for(const g of solids)if(g.id!==r.id&&g.room_id===r.room_id&&g.bottom_mm<r.top_mm&&g.top_mm>r.bottom_mm&&g.type!=='curtain')inspect(studioFootprint(g));
  for(const w of model.wall_segments)if(r.bottom_mm<w.height_m*1000)inspect(studioFootprint({cx:(w.from[0]+w.to[0])/2,cy:(w.from[1]+w.to[1])/2,w:Math.hypot(w.to[0]-w.from[0],w.to[1]-w.from[1]),d:w.thickness_mm,rot:Math.atan2(w.to[1]-w.from[1],w.to[0]-w.from[0])*180/Math.PI}));
  const room=model.rooms.find(room=>room.id===r.room_id);if(room)for(let i=0;i<room.poly.length;i++)inspect([room.poly[i],room.poly[(i+1)%room.poly.length]]);
  return Number.isFinite(measured)?measured:0;
}
function interiorApplyProposal(p,layout,model){
  if(p?.schema!=='ApartmentDesignProposal/2')return studioValidateProposalV1(p,layout,model);
  if(p.canonical_sha256!==model.canonical_sha256||p.base_scene_revision!==studioSceneKey(layout))throw new Error('Different canonical apartment or stale scene revision.');
  if(!Array.isArray(p.operations)||p.operations.length>100||Object.keys(p).some(k=>!['schema','canonical_sha256','base_scene_revision','operations','author','notes'].includes(k)))throw new Error('Invalid ApartmentDesignProposal/2.');
  const next=interiorClone(layout);next.interior=interiorClone(interiorLayer(next));const changed=new Set();
  const fields=(op,allowed)=>{if(!interiorObject(op)||Object.keys(op).some(k=>!allowed.includes(k)))throw new Error('Unsupported operation field. Architecture is locked.');};
  for(const op of p.operations){
    if(['room-option','furniture-variant'].includes(op.type)){
      const one={schema:'ApartmentDesignProposal/1',canonical_sha256:model.canonical_sha256,base_scene_revision:studioSceneKey(next),operations:[op]};Object.assign(next,studioValidateProposalV1(one,next,model));
      if(op.key==='flooring')delete next.interior.surface_materials['FLOOR-'+op.room_id];
    }else if(op.type==='furniture-placement'){
      fields(op,['type','furniture_id','cx','cy','w','d','rot']);const f=next.furniture.find(f=>f.id===op.furniture_id);if(!f)throw new Error('Unknown furniture ID.');
      for(const k of ['cx','cy','w','d','rot'])if(op[k]!==undefined){if(!Number.isFinite(op[k]))throw new Error('Invalid placement.');f[k]=op[k];}
      interiorAssertFurniture(f,next,model);changed.add(f.id);
    }else if(op.type==='add-furniture'){
      fields(op,['type','furniture']);if(next.furniture.length>=300)throw new Error('Furniture limit reached.');const f=interiorClone(op.furniture);f.variant??='style';f.status??='EXPLORATORY';if(next.furniture.some(x=>x.id===f.id)||next.interior.objects.some(x=>x.id===f.id))throw new Error('Furniture ID already exists.');if(f.material_id)interiorFurnitureMaterial(next,f,f.material_id);interiorAssertFurniture(f,next,model);next.furniture.push(f);changed.add(f.id);
    }else if(op.type==='update-furniture'){
      fields(op,['type','furniture_id','changes']);const i=next.furniture.findIndex(f=>f.id===op.furniture_id);if(i<0||!interiorObject(op.changes)||Object.keys(op.changes).some(k=>!['name','cx','cy','w','d','rot','color','variant','status','material_id','product_reference_id'].includes(k)))throw new Error('Invalid furniture update.');
      const before=next.furniture[i],f={...before,...interiorClone(op.changes)};if(op.changes.material_id===null)delete f.material_id;else if(op.changes.material_id!==undefined)interiorFurnitureMaterial(next,f,op.changes.material_id);else if(op.changes.color!==undefined)delete f.material_id;if(op.changes.product_reference_id===null)delete f.product_reference_id;interiorAssertFurniture(f,next,model);next.furniture[i]=f;if(['cx','cy','w','d','rot'].some(k=>op.changes[k]!==undefined))changed.add(f.id);
    }else if(op.type==='remove-furniture'){
      fields(op,['type','furniture_id']);const i=next.furniture.findIndex(f=>f.id===op.furniture_id);if(i<0)throw new Error('Unknown furniture ID.');next.furniture.splice(i,1);interiorForgetFurniture(next,op.furniture_id);
    }else if(op.type==='duplicate-furniture'){
      fields(op,['type','furniture_id','new_id','cx','cy','rot']);const source=next.furniture.find(f=>f.id===op.furniture_id);if(!source)throw new Error('Unknown furniture ID.');if(next.furniture.length>=300||next.furniture.some(f=>f.id===op.new_id)||next.interior.objects.some(o=>o.id===op.new_id))throw new Error('Invalid or duplicate new furniture ID.');const f=interiorClone(source);f.id=op.new_id;f.name=(String(source.name||source.type)+' copy').slice(0,80);for(const k of ['cx','cy','rot'])if(op[k]!==undefined){if(!Number.isFinite(op[k]))throw new Error('Invalid duplicate placement.');f[k]=op[k];}interiorAssertFurniture(f,next,model);next.furniture.push(f);changed.add(f.id);
    }else if(op.type==='set-furniture-material'){
      fields(op,['type','furniture_id','material_id']);const f=next.furniture.find(f=>f.id===op.furniture_id);if(!f)throw new Error('Unknown furniture ID.');interiorFurnitureMaterial(next,f,op.material_id);interiorAssertFurniture(f,next,model);
    }else if(op.type==='set-furniture-colour'){
      fields(op,['type','furniture_id','colour']);const f=next.furniture.find(f=>f.id===op.furniture_id);if(!f||!interiorColour(op.colour))throw new Error('Invalid furniture colour.');f.color=op.colour;delete f.material_id;interiorAssertFurniture(f,next,model);
    }else if(op.type==='add-object'){
      fields(op,['type','object']);next.interior.objects.push(interiorClone(op.object));changed.add(op.object.id);
    }else if(op.type==='update-object'){
      fields(op,['type','object_id','changes']);const i=next.interior.objects.findIndex(o=>o.id===op.object_id);if(i<0||!interiorObject(op.changes)||'id' in op.changes)throw new Error('Invalid object update.');
      next.interior.objects[i]={...next.interior.objects[i],...interiorClone(op.changes)};changed.add(op.object_id);
    }else if(op.type==='remove-object'){
      fields(op,['type','object_id']);const i=next.interior.objects.findIndex(o=>o.id===op.object_id);if(i<0)throw new Error('Unknown object ID.');next.interior.objects.splice(i,1);
    }else if(op.type==='upsert-material'){
      fields(op,['type','material']);interiorAssertMaterial(op.material);if(INTERIOR_MATERIALS.some(m=>m.id===op.material.id))throw new Error('Built-in material IDs are immutable.');const i=next.interior.materials.findIndex(m=>m.id===op.material.id);if(i<0)next.interior.materials.push(interiorClone(op.material));else next.interior.materials[i]=interiorClone(op.material);
    }else if(op.type==='set-room-surface-material'){
      fields(op,['type','room_id','surface','material_id']);if(!['floor','ceiling'].includes(op.surface))throw new Error('Choose floor or ceiling.');const id=op.surface.toUpperCase()+'-'+op.room_id;if(!interiorSurfaces(model).surfaces.some(s=>s.id===id))throw new Error('Invalid room surface.');if(op.material_id===null)delete next.interior.surface_materials[id];else next.interior.surface_materials[id]=op.material_id;
    }else if(op.type==='set-wall-surface-material'){
      fields(op,['type','host_wall_id','material_id']);if(!interiorSurfaces(model).surfaces.some(s=>s.id===op.host_wall_id&&s.type==='wall'))throw new Error('Invalid wall surface.');if(op.material_id===null)delete next.interior.surface_materials[op.host_wall_id];else next.interior.surface_materials[op.host_wall_id]=op.material_id;
    }else if(op.type==='set-opening-treatment'){
      fields(op,['type','opening_id','treatment']);if(!model.openings.some(s=>s.id===op.opening_id))throw new Error('Invalid opening reference.');if(op.treatment===null)delete next.interior.opening_treatments[op.opening_id];else next.interior.opening_treatments[op.opening_id]=interiorClone(op.treatment);
    }else throw new Error('Unsupported furnishing operation. Walls, openings, room geometry and verified heights are immutable.');
  }
  interiorAssertLayer(next,model);const report=interiorValidation(next,model,changed);
  if(!report.valid){const error=new Error('Interior proposal has hard failures. Review the measured validation report.');error.validation=report;throw error;}
  return next;
}
function interiorCirculation(room,model,solids){
  const access=model.openings.filter(o=>o.between.includes(room.id)&&!o.id.startsWith('GLZ-')&&['hinged_door','main_entry_hinged_door','open_passage','open_or_doorway'].includes(o.type));if(!access.length)return [];
  const step=125,x0=Math.min(...room.poly.map(p=>p[0])),y0=Math.min(...room.poly.map(p=>p[1])),nx=Math.ceil((Math.max(...room.poly.map(p=>p[0]))-x0)/step),ny=Math.ceil((Math.max(...room.poly.map(p=>p[1]))-y0)/step);
  const walls=model.wall_segments.filter(w=>w.rooms.includes(room.id)),obs=solids.filter(r=>r.room_id===room.id&&r.bottom_mm<2100&&r.top_mm>100&&r.type!=='curtain').map(studioFootprint),cap=new Float64Array(nx*ny),pts=new Array(nx*ny);
  for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){
    const i=y*nx+x,p=[x0+(x+.5)*step,y0+(y+.5)*step];pts[i]=p;if(!studioInside(p,room.poly)||obs.some(poly=>studioInside(p,poly)))continue;
    let d=walls.length?Math.min(...walls.map(w=>studioDistanceToSegment(p,w.from,w.to)-w.thickness_mm/2)):Math.min(...room.poly.map((a,j)=>studioDistanceToSegment(p,a,room.poly[(j+1)%room.poly.length])))-90;
    for(const poly of obs)for(let j=0;j<poly.length;j++)d=Math.min(d,studioDistanceToSegment(p,poly[j],poly[(j+1)%poly.length]));cap[i]=Math.max(0,2*d);
  }
  const nearest=p=>{let best=-1,d=Infinity;for(let i=0;i<pts.length;i++)if(cap[i]>0){const v=Math.hypot(pts[i][0]-p[0],pts[i][1]-p[1]);if(v<d){d=v;best=i;}}return {i:best,d};};
  const portals=access.map(o=>{
    const dx=o.to[0]-o.from[0],dy=o.to[1]-o.from[1],L=Math.hypot(dx,dy),mid=[(o.from[0]+o.to[0])/2,(o.from[1]+o.to[1])/2];let n=[-dy/L,dx/L];if(!studioInside([mid[0]+n[0]*500,mid[1]+n[1]*500],room.poly))n=n.map(v=>-v);
    return {...nearest([mid[0]+n[0]*500,mid[1]+n[1]*500]),id:o.id,width:interiorOpeningWidth(o,room,solids).width};
  });
  const anchor={...nearest(room.at),id:'free-space-near-room-centre',width:Infinity},targets=portals.length>1?portals.slice(1):[anchor],start=portals[0];
  if(start.i<0)return [{room_id:room.id,from:start.id,to:anchor.id,measured_clearance_mm:0,grid_resolution_mm:step,message:'No free sampled circulation space.'}];
  const scores=new Float64Array(cap.length),heap=[];
  const push=(v,i)=>{heap.push([v,i]);let k=heap.length-1;while(k){const p=(k-1)>>1;if(heap[p][0]>=v)break;[heap[p],heap[k]]=[heap[k],heap[p]];k=p;}};
  const pop=()=>{const first=heap[0],last=heap.pop();if(heap.length){heap[0]=last;let k=0;while(k*2+1<heap.length){let c=k*2+1;if(c+1<heap.length&&heap[c+1][0]>heap[c][0])c++;if(heap[k][0]>=heap[c][0])break;[heap[k],heap[c]]=[heap[c],heap[k]];k=c;}}return first;};
  scores[start.i]=Math.min(cap[start.i],start.width);push(scores[start.i],start.i);
  while(heap.length){const [score,i]=pop();if(score<scores[i])continue;const x=i%nx,y=Math.floor(i/nx);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
    const xx=x+dx,yy=y+dy;if(xx<0||yy<0||xx>=nx||yy>=ny)continue;const j=yy*nx+xx;if(!cap[j])continue;
    const candidate=Math.min(score,Math.max(0,Math.min(cap[i],cap[j])-step));if(candidate>scores[j]){scores[j]=candidate;push(candidate,j);}
  }}
  return targets.map(t=>({room_id:room.id,from:start.id,to:t.id,measured_clearance_mm:interiorRound(t.i<0||start.d>400||t.d>500?0:Math.min(scores[t.i],t.width)),preferred_clearance_mm:900,grid_resolution_mm:step,method:'Conservative widest sampled path; centreline widths minus 125 mm sampling allowance',message:'Circulation estimate between access approaches and free room space. Confirm usable routes with actual furniture and site dimensions.'}));
}
function interiorProposalFurnitureIds(operations){
  const ids=new Set();for(const op of operations||[]){
    if(op.type==='furniture-placement'&&op.furniture_id)ids.add(op.furniture_id);
    if(op.type==='add-furniture'&&op.furniture?.id)ids.add(op.furniture.id);
    if(op.type==='duplicate-furniture'&&op.new_id)ids.add(op.new_id);
    if(op.type==='update-furniture'&&op.furniture_id&&['cx','cy','w','d','rot'].some(k=>op.changes?.[k]!==undefined))ids.add(op.furniture_id);
  }return [...ids];
}
function studioValidateProposal(p,layout,model){
  const next=interiorApplyProposal(p,layout,model);
  if(p.schema==='ApartmentDesignProposal/1'&&next.interior){
    for(const op of p.operations)if(op.type==='room-option'&&op.key==='flooring')delete next.interior.surface_materials['FLOOR-'+op.room_id];
    const report=interiorValidation(next,model,p.operations.filter(o=>o.type==='furniture-placement').map(o=>o.furniture_id));if(!report.valid){const error=new Error('Proposal has hard interior placement failures.');error.validation=report;throw error;}
  }return next;
}
function interiorContext(model,layout){
  const number={type:'number'},dimension={type:'number',minimum:5,maximum:10000},text={type:'string'};
  const object_schema={type:'object',additionalProperties:false,required:['id','type','variant','room_id','placement','rotation','width_mm','depth_mm','height_mm','material_references','colour','status','metadata'],properties:{id:{type:'string',pattern:'^[a-zA-Z0-9_-]{1,100}$'},type:{type:'string',enum:Object.keys(INTERIOR_OBJECT_TYPES)},variant:text,room_id:{type:'string',enum:model.rooms.filter(r=>!r.isTerrace).map(r=>r.id)},placement:{type:'object',additionalProperties:false,required:['mode'],properties:{mode:{type:'string',enum:['floor','wall','ceiling','opening']},host_wall_id:text,host_opening_id:text,offset_mm:number,inset_mm:number,elevation_mm:number,drop_mm:number}},cx:number,cy:number,rotation:number,width_mm:dimension,depth_mm:dimension,height_mm:dimension,material_references:{type:'object',additionalProperties:text},colour:{type:'string',pattern:'^#[0-9a-fA-F]{6}$'},status:{type:'string',enum:['EXPLORATORY','INFERRED','TBD','VERIFIED']},metadata:{type:'object'}}};
  const operation_fields={'room-option':['room_id','key','value'],'furniture-variant':['furniture_id','variant'],'furniture-placement':['furniture_id','cx?','cy?','w?','d?','rot?'],'add-furniture':['furniture'],'update-furniture':['furniture_id','changes'],'remove-furniture':['furniture_id'],'duplicate-furniture':['furniture_id','new_id','cx?','cy?','rot?'],'set-furniture-material':['furniture_id','material_id (ID|null)'],'set-furniture-colour':['furniture_id','colour'],'add-object':['object'],'update-object':['object_id','changes (partial object; id immutable; nested fields replace)'],'remove-object':['object_id'],'upsert-material':['material (InteriorMaterial/1)'],'set-room-surface-material':['room_id','surface (floor|ceiling)','material_id (ID|null)'],'set-wall-surface-material':['host_wall_id','material_id (ID|null)'],'set-opening-treatment':['opening_id','treatment ({type,variant,material_id,colour,openness,room_id}|null)']};
  return {schema:'ApartmentInteriorDesignContext/1',architecture_mutable:false,surfaces:interiorSurfaces(model),object_types:INTERIOR_OBJECT_TYPES,object_schema,furniture_types:INTERIOR_FURNITURE_TYPES,furniture_template:{id:'agent-chair-01',type:'chair',name:'Dining chair',cx:0,cy:0,w:480,d:520,rot:0,color:'#d8d0c4',variant:'style',status:'EXPLORATORY',material_id:null,product_reference_id:null},furniture_optional_fields:['variant','status','material_id','product_reference_id'],materials:layout?interiorMaterials(layout):INTERIOR_MATERIALS,material_schema:'InteriorMaterial/1',material_template:{schema:'InteriorMaterial/1',id:'custom-material-01',name:'Custom matte finish',category:'paint',source_status:'GENERIC',base_colour:'#e8e0d2',roughness:.9,metallic:0,finish:'matte',notes:'No texture maps required.'},material_optional_fields:['manufacturer','product_name','product_url','physical_dimensions_mm: {width,height,depth}','texture_scale_mm: {width,height}','albedo_texture','normal_map','roughness_map','reference_images','notes','fallback_generic_id'],overlay_schema:'InteriorDesign/1',proposal_versions:['ApartmentDesignProposal/1','ApartmentDesignProposal/2'],proposal_v2_contract:{required:['schema','canonical_sha256','base_scene_revision','operations'],optional:['author','notes'],maximum_operations:100,operation_fields},operations:Object.keys(operation_fields),placement:{modes:['floor','wall','ceiling','opening'],wall:'placement.host_wall_id, offset_mm from segment midpoint, elevation_mm at object bottom, inset_mm from finished wall face',ceiling:'cx/cy in canonical mm; drop_mm from the fixed 2500 mm ceiling to the object top',opening:'placement.host_opening_id, offset_mm, elevation_mm; reversible treatment only'},representation:'Approximate conceptual 3D objects and furniture; material/product references constrain intent but do not certify manufacturer CAD or fit.'};
}
function interiorRenderBrief(layout,model,roomId,catalog,view){
  const result=studioRenderBrief(layout,model,roomId,catalog),objects=interiorLayer(layout).objects.filter(o=>o.room_id===roomId),surfaces=interiorLayer(layout).surface_materials,treatments=Object.fromEntries(Object.entries(interiorLayer(layout).opening_treatments).filter(([,t])=>t.room_id===roomId));
  const materialIds=new Set([...objects.flatMap(o=>Object.values(o.material_references)),...result.items.map(f=>f.material_id).filter(Boolean),...Object.entries(surfaces).filter(([id])=>interiorSurfaces(model).surfaces.find(s=>s.id===id)?.room_id===roomId).map(([,id])=>id),...Object.values(treatments).map(t=>t.material_id)]);
  return {...result,schema:'ApartmentRenderBrief/2',interior_objects:objects,surface_materials:surfaces,opening_treatments:treatments,materials:interiorMaterials(layout).filter(m=>materialIds.has(m.id)),validation:interiorValidation(layout,model),saved_view:view||null,camera_reference_required:!view,prompt:result.prompt+' Reversible interior objects: '+JSON.stringify(objects)+'. Assigned surfaces: '+JSON.stringify(surfaces)+'. Opening treatments: '+JSON.stringify(treatments)+'. '+(view?'Use the saved PNG as the exact visual constraint. Preserve its projection, framing, object placements and visible openings. Camera: '+JSON.stringify(view.camera)+'. Saved view '+view.view_id+' at '+view.scene_revision+'.':'A matching current WebGL screenshot is still required before image generation. Do not infer an exact camera from this brief alone.')};
}
