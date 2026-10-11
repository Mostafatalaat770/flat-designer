/** Actual rendered-triangle / ray diagnostics, applied equally to controls and proposals. */
export const meshDiagnostics=String.raw`
const m3bOriginalBuildFurniture=buildFurniture;
buildFurniture=function(f){
 const g=m3bOriginalBuildFurniture(f);if(f.room_id!=='RECP-01'||!['sofa','armchair','chair','table','tv','tvstand'].includes(f.type))return g;
 const pos=g.position.clone(),q=g.quaternion.clone();g.position.set(0,0,0);g.quaternion.identity();g.updateMatrixWorld(true);
 const meshes=[];g.traverse(m=>{if(m.isMesh&&m.geometry?.attributes?.position){const b=new THREE.Box3().setFromObject(m);meshes.push({m,b});}});
 const mm=x=>Math.round(x*100000)/100,record={declared_mm:[f.w,f.d],actual_bounds_mm:{min:new THREE.Box3().setFromObject(g).min.toArray().map(mm),max:new THREE.Box3().setFromObject(g).max.toArray().map(mm)}};
 if(['sofa','armchair','chair'].includes(f.type)){
  const seats=meshes.filter(({b})=>b.min.y>=.20&&b.min.y<=.43&&b.max.y>=.39&&b.max.y<=.48&&b.max.z-b.min.z>.35&&b.max.x-b.min.x>.30);
  if(!seats.length)record.unclassified_meshes=meshes.map(({b})=>({min:b.min.toArray().map(mm),max:b.max.toArray().map(mm)}));
  if(!seats.length&&f.type==='armchair'){
   const hit=new THREE.Raycaster(new THREE.Vector3(0,1.2,.08),new THREE.Vector3(0,-1,0)).intersectObjects(meshes.map(x=>x.m),false)[0],fabricMesh=meshes.find(z=>z.b.min.y>=.20&&z.b.max.z>.20&&z.b.max.x-z.b.min.x>.30);
   if(hit&&fabricMesh){const b=fabricMesh.b.clone();b.max.y=hit.point.y;seats.push({m:fabricMesh.m,b,merged:true});record.seat_measurement_method='Native batched seat/back mesh: actual vertical centre ray for seat top, fabric mesh front/width; cushion-only depth unavailable. Back rays include merged mesh.';}
  }
  record.seat_cushions=seats.map(({b,m,merged})=>({width_mm:mm(b.max.x-b.min.x),depth_mm:merged?null:mm(b.max.z-b.min.z),top_mm:mm(b.max.y),front_mm:mm(b.max.z)}));
  record.usable_depth_rays=[];
  for(const {b,m,merged} of seats){const x=(b.min.x+b.max.x)/2;for(const y of [b.max.y+.01,b.max.y+.10,b.max.y+.20]){
   const targets=meshes.filter(z=>(merged||z.m!==m)&&z.b.max.y>y&&z.b.min.z<b.max.z).map(z=>z.m),ray=new THREE.Raycaster(new THREE.Vector3(x,y,f.d/2000+.20),new THREE.Vector3(0,0,-1)),hits=ray.intersectObjects(targets,false).filter(h=>h.point.z<=b.max.z+.001);
   record.usable_depth_rays.push({seat_x_mm:mm(x),height_mm:mm(y),seat_front_mm:mm(b.max.z),first_support_mm:hits.length?mm(hits[0].point.z):null,usable_depth_mm:hits.length?mm(b.max.z-hits[0].point.z):null});
  }}
  const caps=meshes.filter(({b})=>b.min.y>=.57&&b.max.y<=.70&&b.max.x-b.min.x<.25&&b.max.z-b.min.z>.3);
  record.arm_caps=caps.map(({m,b})=>{const xs=[],v=new THREE.Vector3(),arr=m.geometry.attributes.position;for(let i=0;i<arr.count;i++){v.fromBufferAttribute(arr,i).applyMatrix4(m.matrixWorld);if(v.y>=b.max.y-.00015)xs.push(v.x);}return {width_mm:mm(b.max.x-b.min.x),crest_flat_width_mm:xs.length?mm(Math.max(...xs)-Math.min(...xs)):null,top_mm:mm(b.max.y),height_above_seat_mm:seats.length?mm(b.max.y-seats[0].b.max.y):null};});
 }
 if(f.type==='table'){
  const top=meshes.filter(z=>z.b.min.y>=.68&&z.b.max.y>=.74).sort((a,b)=>(b.b.max.x-b.b.min.x)-(a.b.max.x-a.b.min.x))[0];record.tabletop=top?{underside_mm:mm(top.b.min.y),top_mm:mm(top.b.max.y),apron:'Geometry checked below, not inferred from footprint'}:null;
  const chairs=APARTMENT_CAPTURE_INPUT.layout.furniture.filter(c=>c.room_id==='RECP-01'&&c.type==='chair'),a=f.rot*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a),tri=new THREE.Triangle(),va=new THREE.Vector3(),vb=new THREE.Vector3(),vc=new THREE.Vector3();record.knee_tests=[];
  for(const pull of [0,100,200])for(const width of [400,500,600])for(const c of chairs){const r=c.rot*Math.PI/180,nx=-Math.sin(r),nz=Math.cos(r),cx=(c.cx+nx*(250-pull)-f.cx)/1000,cz=(c.cy+nz*(250-pull)-f.cy)/1000,x=cx*ca+cz*sa,z=-cx*sa+cz*ca,bb=new THREE.Box3(new THREE.Vector3(x-width/2000,.46,z-.225),new THREE.Vector3(x+width/2000,.66,z+.225));let hits=0;
   for(const {m,b} of meshes){if(!bb.intersectsBox(b)||b.min.y>=.705-.00001)continue;const arr=m.geometry.attributes.position,idx=m.geometry.index,count=idx?idx.count:arr.count;let hit=false;for(let i=0;i<count;i+=3){va.fromBufferAttribute(arr,idx?idx.getX(i):i).applyMatrix4(m.matrixWorld);vb.fromBufferAttribute(arr,idx?idx.getX(i+1):i+1).applyMatrix4(m.matrixWorld);vc.fromBufferAttribute(arr,idx?idx.getX(i+2):i+2).applyMatrix4(m.matrixWorld);tri.set(va,vb,vc);if(bb.intersectsTriangle(tri)){hit=true;break;}}if(hit)hits++;
   }record.knee_tests.push({chair:c.id,pull_mm:pull,knee_width_mm:width,forward_zone_mm:450,vertical_mm:[460,660],intersecting_actual_meshes:hits});
  }
 }
 globalThis.__m3ComfortMesh=globalThis.__m3ComfortMesh||{};globalThis.__m3ComfortMesh[f.id]=record;
 g.position.copy(pos);g.quaternion.copy(q);g.updateMatrixWorld(true);return g;
};
const m3bOriginalStudioFeature=studioFeature;
studioFeature=function(g,feature,rid){const result=m3bOriginalStudioFeature(g,feature,rid);if(rid==='RECP-01'&&feature==='wall-ac'){
 g.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(g),normal=new THREE.Vector3(0,0,1).applyQuaternion(g.quaternion),x=(g.position.x-wx(0))*1000,z=(g.position.z-wz(0))*1000;
 globalThis.__m3ComfortMesh=globalThis.__m3ComfortMesh||{};globalThis.__m3ComfortMesh.AC={placement_kind:'SOURCE_SETTING / production nearestSolidMount heuristic, NOT site surveyed',centre_plan_mm:[x,z],normal_plan:[normal.x,normal.z],bottom_mm:b.min.y*1000,top_mm:b.max.y*1000,ceiling_gap_mm:2500-b.max.y*1000,assumed_service_floor:{cx:x+normal.x*900,cy:z+normal.z*900,w:600,d:900,rot:-g.rotation.y*180/Math.PI},limits:'600x900 assumed floor access envelope, offset900 from proxy centre. Real ladder/filter/front/top/side/manual control/drain service strokes require installed-unit and manufacturer measurements.'};
 }return result;};
`;
