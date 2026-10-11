/** Isolated source-room furniture concepts. All actual proxy triangles stay within declared footprints. */
export const furnitureHook=String.raw`
function m3g2Furniture(f){
 const p=APARTMENT_CAPTURE_INPUT.group2_profile;if(!p||!['BR-01','BR-02','MBR-01','WIC-01'].includes(f.room_id))return null;
 const w=M(f.w),d=M(f.d),g=new THREE.Group(),wm=woodM(p.wood),dark=woodM(p.dark),fab=fabric(p.cloth),mark=(o,n)=>{o.userData.component=n;g.add(o);return o;};
 if(f.type==='rug'){mark(rbox(w,.01,d,fabric(f.color),0,0,0,.004),'rug');for(const side of [-1,1])g.add(box(.006,.001,d-.03,fabric(p.cloth),side*(w/2-.018),.01,0));
 }else if(f.type==='bed'){
  const mw=f.id==='starter-1'?1.8:1.2,md=2.,mt=p.matTop/1000;
  legs(g,w-.13,d-.13,.12,dark,.04,.032);mark(rbox(w,mt-.20-.12,d-.09,p.id==='A'?fab:wm,0,.12,.045,.026),'frame');
  mark(rbox(mw,.20,md,fab,0,mt-.20,-d/2+.09+md/2,.035),'mattress');
  mark(rbox(w,p.head/1000-.12,.08,fab,0,.12,-d/2+.04,p.id==='A'?.07:.03),'headboard');
  for(const x of f.id==='starter-1'?[-.45,.45]:[0]){cushion(g,f.id==='starter-1'?.63:.70,.11,.40,'#F2EEE5',x,mt,-d/2+.40);cushion(g,f.id==='starter-1'?.58:.64,.09,.35,'#DED6C7',x,mt+.055,-d/2+.39);cushion(g,.38,.08,.26,p.accent,x,mt+.04,-d/2+.66);}
  mark(rbox(mw-.02,.038,.53,fabric(p.accent),0,mt+.008,d/2-.40,.018),'throw');
  for(let i=0;i<9;i++)g.add(box(mw-.04,.004,.005,fabric(p.cloth),0,mt+.048,d/2-.65+i*.055));
 }else if(f.type==='desk'){
  mark(rbox(w,.035,d,wm,0,.715,0,.02),'tabletop');
  for(const x of [-1,1])for(const z of [-1,1])mark(box(.045,.715,.045,dark,x*(w/2-.055),0,z*(d/2-.055)),'leg');
  mark(box(w-.12,.04,.025,dark,0,.67,-d/2+.055),'rear-cable-rail');
  // 330x230 laptop + task lamp, all inside the table footprint. Generic study objects, no product SKU.
  g.add(rbox(.33,.012,.23,mat('#686B65'),-.07,.75,-.015,.004));const screen=rbox(.33,.20,.012,mat('#494F48'),-.07,.755,-.135,.005);screen.rotation.x=-.08;g.add(screen);
  g.add(box(.27,.14,.003,mat('#B4C0B3'),-.07,.78,-.125));tableLamp(g,w/2-.15,.75,-d/2+.14,.48);
  const l=new THREE.PointLight('#FFE6BD',0,3,2);l.position.set(w/2-.15,.93,-d/2+.14);l.userData.interiorLight=true;l.userData.roomId=f.room_id;l.userData.basePower=.28;g.add(l);
  g.add(rbox(.16,.012,.11,mat('#DFD9C7'),w/2-.13,.75,d/2-.10,.004));
 }else if(['officechair','chair'].includes(f.type)){
  const seatW=.48,seatD=.45,seatTop=.46;
  g.add(cyl(.027,.035,.30,dark,0,.08));for(let i=0;i<5;i++){const a=i*Math.PI*2/5;g.add(rod([0,.07,0],[Math.cos(a)*.25,.035,Math.sin(a)*.25],.012,dark));g.add(cyl(.028,.028,.025,dark,Math.cos(a)*.25,.012,Math.sin(a)*.25));}
  mark(rbox(seatW,.065,seatD,fabric(f.color),0,seatTop-.065,.015,.025),'seat');
  mark(rbox(.45,.56,.055,fabric(f.color),0,.47,-.235,.025),'back');
  for(const x of [-.265,.265]){g.add(rod([x,.37,-.10],[x,.64,-.10],.012,dark));mark(rbox(.05,.025,.29,fabric(f.color),x,.64,-.005,.01),'arm');}
 }else if(f.type==='nightstand'){
  const h=p.matTop/1000+.01;legs(g,w-.05,d-.05,.12,dark,.025,.02);mark(rbox(w,h-.12,d,wm,0,.12,0,.012),'case');
  mark(box(w-.045,.16,.004,mat(p.dark),0,.20,d/2+.001- .008),'open-shelf-recess');mark(rbox(w,.025,d,wm,0,h,0,.01),'top');
  tableLamp(g,-w*.15,h+.025,-d*.08,.55);g.add(rbox(.085,.01,.15,mat('#504A42'),w*.23,h+.025,d*.16,.004));
  const l=new THREE.PointLight('#FFE6BD',0,3,2);l.position.set(-w*.15,h+.23,-d*.08);l.userData.interiorLight=true;l.userData.roomId=f.room_id;l.userData.basePower=.35;g.add(l);
 }else if(f.type==='wardrobe'){
  const join=APARTMENT_CAPTURE_INPUT.group2_joinery.wardrobes[f.id],h=join.height_mm/1000,th=.018,inner=w-.054,bay=inner/2,back=.020,front=join.front_allowance_mm/1000;
  mark(box(w,h,.02,wm,0,0,-d/2+.01),'back');for(const x of [-w/2+th/2,0,w/2-th/2])mark(box(th,h,d-.04,wm,x,0,0),'side');
  for(const y of [.12,h-.24,h-.018])mark(box(w,.018,d-.04,wm,0,y,0),'shelf');
  const north=f.id==='starter-4',folded=f.id==='starter-5'||f.id==='starter-13';
  for(const x of [-inner/4,inner/4]){
   if(folded&&(f.id==='starter-13'?x>0:x<0)){for(const y of [.51,.90,1.29,1.68]){mark(box(bay-.02,.018,d-back-front,wm,x,y,-.015),'shelf');for(const xx of [x-bay*.24,x+bay*.24])for(let i=0;i<3;i++)g.add(rbox(.25,.027,.31,fabric(i===0?p.accent:p.cloth),xx,y+.02+i*.029,.02,.012));}}
   else{for(const y of north&&x>0?[Math.min(1.92,h-.33)]:[.98,Math.min(1.92,h-.33)]){
    mark(rod([x-bay/2+.018,y,-.015],[x+bay/2-.018,y,-.015],.007,dark),'rail');
    for(let i=0;i<6;i++){const xx=x-bay*.34+i*bay*.136;g.add(rod([xx,y-.08,-.24],[xx,y,-.015],.005,dark));g.add(rod([xx,y,-.015],[xx,y-.08,.21],.005,dark));g.add(rbox(.045,north&&x>0?1.28:.65,.50,fabric(i%3===0?p.accent:i%2===0?'#ABA897':p.cloth),xx,y-(north&&x>0?1.4:.77),-.015,.016));}
   }}
  }
  if(join.front==='fabric'){const panel=curtainPanel(.15,h-.06,p.curtain,false);panel.scale.z=.25;panel.position.set(-w/2+.075,h/2,d/2-.012);g.add(panel);g.add(box(w,.012,.012,dark,0,h-.02,d/2-.02));
  }else if(join.front==='sliding'){
   // One panel slid over the other: half bay visible, zero forward swing; same envelope as closed.
   mark(rbox(w/2-.004,h-.12,.020,wm,-w/4,.06,d/2-.035,.008),'sliding-panel');mark(rbox(w/2-.004,h-.12,.020,wm,-w/4+.008,.06,d/2-.010,.008),'sliding-panel');g.add(box(.015,.50,.012,dark,-w*.06,.91,d/2-.012));
  }else{
   for(const x of [-w/4,w/4]){mark(rbox(w/2-.004,h-.12,.020,wm,x,.06,d/2-.010,.008),'hinged-panel');g.add(box(.015,.50,.009,dark,x+(x<0?.18:-.18),.91,d/2-.005));}
  }
  // Soft integrated wardrobe light is a concept, never a lux or electrical validation.
  const l=new THREE.PointLight('#FFE6BD',0,2,2);l.position.set(.25,1.90,d/2-.05);l.userData.interiorLight=true;l.userData.roomId=f.room_id;l.userData.basePower=.18;g.add(l);
 }else return null;
 g.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(g);if(bb.min.x<-w/2-.001||bb.max.x>w/2+.001||bb.min.z<-d/2-.001||bb.max.z>d/2+.001)throw Error('Group2 mesh outside footprint '+f.id+' '+JSON.stringify({min:bb.min.toArray(),max:bb.max.toArray(),w,d}));
 globalThis.__g2Mesh=globalThis.__g2Mesh||{};const mm=x=>Math.round(x*100000)/100,parts={};g.traverse(o=>{if(o.isMesh&&o.userData.component){const b=new THREE.Box3().setFromObject(o);(parts[o.userData.component]||=[]).push({min_mm:b.min.toArray().map(mm),max_mm:b.max.toArray().map(mm)});}});
 globalThis.__g2Mesh[f.id]={declared_mm:[f.w,f.d],actual_bounds_mm:{min:bb.min.toArray().map(mm),max:bb.max.toArray().map(mm)},parts,front_local:'+Z; camera-independent mesh evidence',proxy:true};
 g.position.set(wx(f.cx),0,wz(f.cy));g.rotation.y=-f.rot*Math.PI/180;g.userData.fid=f.id;g.userData.roomId=f.room_id;g.userData.modelForm='M3Group2-'+p.id+'-'+f.type;return g;
}
`;
export const diagnostics=String.raw`
const g2OldFurniture=buildFurniture;
buildFurniture=function(f){const g=g2OldFurniture(f);if(!['BR-01','BR-02','MBR-01','WIC-01'].includes(f.room_id))return g;
 const pos=g.position.clone(),quat=g.quaternion.clone();g.position.set(0,0,0);g.quaternion.identity();g.updateMatrixWorld(true);const mm=x=>Math.round(x*100000)/100,b=new THREE.Box3().setFromObject(g),rec={declared_mm:[f.w,f.d],bounds_mm:{min:b.min.toArray().map(mm),max:b.max.toArray().map(mm)},type:f.type};
 const meshes=[];g.traverse(m=>{if(m.isMesh)meshes.push({m,b:new THREE.Box3().setFromObject(m)});});
 if(['officechair','chair'].includes(f.type)){
  const down=new THREE.Raycaster(new THREE.Vector3(0,1.3,.02),new THREE.Vector3(0,-1,0)).intersectObjects(meshes.map(x=>x.m),false)[0];rec.seat_top_mm=down?mm(down.point.y):null;rec.usable_depth_rays=[];
  if(down)for(const y of [down.point.y+.02,down.point.y+.15,down.point.y+.25]){const targets=meshes.filter(x=>x.b.max.y>y&&x.b.min.z<0).map(x=>x.m),hit=new THREE.Raycaster(new THREE.Vector3(0,y,.4),new THREE.Vector3(0,0,-1)).intersectObjects(targets,false)[0];const seat=meshes.filter(x=>x.b.min.y>=.30&&x.b.max.y<=.50&&x.b.max.z-x.b.min.z>.20).sort((a,b)=>(b.b.max.z-b.b.min.z)-(a.b.max.z-a.b.min.z))[0];rec.usable_depth_rays.push({height_mm:mm(y),back_hit_mm:hit?mm(hit.point.z):null,depth_mm:hit&&seat?mm(seat.b.max.z-hit.point.z):null});}
 }
 if(f.type==='desk'){
  const top=meshes.filter(x=>x.b.max.x-x.b.min.x>f.w/1000*.8&&x.b.max.z-x.b.min.z>f.d/1000*.7&&x.b.min.y>.65).sort((a,b)=>a.b.min.y-b.b.min.y)[0];rec.tabletop=top?{underside_mm:mm(top.b.min.y),top_mm:mm(top.b.max.y)}:null;rec.knee_tests=[];
  const c=APARTMENT_CAPTURE_INPUT.layout.furniture.find(c=>c.room_id===f.room_id&&['chair','officechair'].includes(c.type));if(c){const a=f.rot*Math.PI/180,ca=Math.cos(a),sa=Math.sin(a),r=c.rot*Math.PI/180;for(const width of [500,600])for(const pull of [0,100]){const cx=(c.cx-Math.sin(r)*(250-pull)-f.cx)/1000,cz=(c.cy+Math.cos(r)*(250-pull)-f.cy)/1000,x=cx*ca+cz*sa,z=-cx*sa+cz*ca,bb=new THREE.Box3(new THREE.Vector3(x-width/2000,.46,z-.225),new THREE.Vector3(x+width/2000,.66,z+.225)),tri=new THREE.Triangle(),va=new THREE.Vector3(),vb=new THREE.Vector3(),vc=new THREE.Vector3();let hits=0;
   for(const {m,b}of meshes){if(!bb.intersectsBox(b))continue;const ar=m.geometry.attributes.position,ix=m.geometry.index,n=ix?ix.count:ar.count;for(let i=0;i<n;i+=3){va.fromBufferAttribute(ar,ix?ix.getX(i):i).applyMatrix4(m.matrixWorld);vb.fromBufferAttribute(ar,ix?ix.getX(i+1):i+1).applyMatrix4(m.matrixWorld);vc.fromBufferAttribute(ar,ix?ix.getX(i+2):i+2).applyMatrix4(m.matrixWorld);tri.set(va,vb,vc);if(bb.intersectsTriangle(tri)){hits++;break;}}}rec.knee_tests.push({chair:c.id,width_mm:width,pull_mm:pull,height_mm:[460,660],depth_mm:450,intersecting_actual_meshes:hits});}}
 }
 globalThis.__g2Diagnostics=globalThis.__g2Diagnostics||{};globalThis.__g2Diagnostics[f.id]=rec;g.position.copy(pos);g.quaternion.copy(quat);g.updateMatrixWorld(true);return g;
};
const g2OldStudioFeature=studioFeature;studioFeature=function(g,feature,rid){const result=g2OldStudioFeature(g,feature,rid);if(feature==='wall-ac'&&['BR-01','BR-02','MBR-01'].includes(rid)){g.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(g),n=new THREE.Vector3(0,0,1).applyQuaternion(g.quaternion);globalThis.__g2AC=globalThis.__g2AC||{};globalThis.__g2AC[rid]={source_heuristic:true,position_mm:[(g.position.x-wx(0))*1000,(g.position.z-wz(0))*1000],bottom_mm:b.min.y*1000,top_mm:b.max.y*1000,ceiling_gap_mm:2500-b.max.y*1000,normal_plan:[n.x,n.z],bounds_world_mm:{min:[(b.min.x-wx(0))*1000,b.min.y*1000,(b.min.z-wz(0))*1000],max:[(b.max.x-wx(0))*1000,b.max.y*1000,(b.max.z-wz(0))*1000]},limits:'Not an installed position, airflow simulation or manufacturer service clearance; ladder600x900 to be checked on site.'};}return result;};
const g2OldInterior=interiorMesh;interiorMesh=function(o){const g=g2OldInterior(o),p=APARTMENT_CAPTURE_INPUT.group2_profile;
 if(p&&['BR-01','BR-02','MBR-01','WIC-01'].includes(o.room_id)&&o.type==='artwork'){g.clear();const w=o.width_mm/1000,h=o.height_mm/1000,d=o.depth_mm/1000;g.add(rbox(w,h,d,woodM(p.dark),0,0,0,.008));const cv=document.createElement('canvas');cv.width=512;cv.height=512;const cx=cv.getContext('2d');cx.fillStyle='#EEE6D5';cx.fillRect(0,0,512,512);if(p.id==='B'){cx.strokeStyle='#65705A';cx.lineWidth=14;cx.beginPath();cx.moveTo(25,345);cx.bezierCurveTo(130,220,295,420,490,240);cx.stroke();cx.fillStyle='#B19F83';cx.beginPath();cx.arc(385,130,55,0,Math.PI*2);cx.fill();}else{for(const [x,y,rx,ry,col]of [[170,150,100,110,'#B38266'],[350,330,85,125,'#AEAE96'],[210,360,150,42,'#C8B596']]){cx.fillStyle=col;cx.beginPath();cx.ellipse(x,y,rx,ry,-.18,0,Math.PI*2);cx.fill();}}const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;g.add(box(w-.04,h-.04,.002,new THREE.MeshStandardMaterial({map:tx,roughness:.9}),0,.02,d/2+.001));g.userData.artwork='Original procedural abstract, not a purchased or referenced artist work';}
 if(p&&o.id==='M3G2-WIC-mirror'){g.traverse(m=>{if(m.isMesh&&m.material?.metalness>.7)m.material=new THREE.MeshBasicMaterial({color:'#B6C8C7'});});g.userData.group2Concept=true;}
 if(p&&o.type==='curtain'&&['BR-01','BR-02','MBR-01'].includes(o.room_id)){
  g.clear();const full=p.id==='A'&&o.room_id==='BR-01',span=full?.30:.15,depth=full?.25:.15,w=o.width_mm/1000,h=2.45,material=fabric(p.curtain);
  // Source-hosted, reversible treatment: actual150/300-wide folded panel envelopes plus raised blackout roller.
  const opening=MODEL.openings.find(x=>x.id===o.placement.host_opening_id),face=opening.from[1]+90;g.updateMatrixWorld(true);
  const stackBounds=[];for(const side of [-1,1]){const actualSpan=side<0?APARTMENT_CAPTURE_INPUT.group2_soft_treatments.rooms[o.room_id].left_stack_span_mm/1000:APARTMENT_CAPTURE_INPUT.group2_soft_treatments.rooms[o.room_id].right_stack_span_mm/1000,panel=curtainPanel(actualSpan,h-.03,p.curtain,false),centre=side<0?opening.from[0]-actualSpan*500:opening.to[0]+actualSpan*500;panel.position.copy(g.worldToLocal(new THREE.Vector3(wx(centre),h/2,wz(face+depth*500))));g.add(panel);g.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(panel);stackBounds.push({side,span_mm:actualSpan*1000,min_mm:[(b.min.x-wx(0))*1000,b.min.y*1000,(b.min.z-wz(0))*1000],max_mm:[(b.max.x-wx(0))*1000,b.max.y*1000,(b.max.z-wz(0))*1000]});}
  globalThis.__g2Curtains=globalThis.__g2Curtains||{};globalThis.__g2Curtains[o.placement.host_opening_id]={span_mm:span*1000,depth_mm:depth*1000,face_mm:face,stack_bounds:stackBounds,location:'outside jambs; actual folded triangles inside tested envelope'};
  g.add(rbox(w,.09,.07,woodM(p.wall),0,2.36,.035,.015));g.add(rbox(w-.02,.14,.035,material,0,2.20,.04,.015));g.userData.treatment_concept={type:full?'Full drapery envelope300x250':'Raised blackout roller + slim sheer envelope150x150',closure_unvalidated:true};
 }
 if(p&&['BR-01','BR-02','MBR-01','WIC-01'].includes(o.room_id)&&['artwork','mirror','curtain'].includes(o.type)){globalThis.__g2ConceptInteriors=globalThis.__g2ConceptInteriors||{};globalThis.__g2ConceptInteriors[o.id]={room:o.room_id,type:o.type};}
 return g;};
`;
