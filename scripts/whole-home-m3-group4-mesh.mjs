/** Source-sized cosmetic/joinery visualization. All front divisions/cavities are assumptions. */
export const furnitureHook=String.raw`
function g4Stone(col){
 const cv=document.createElement('canvas');cv.width=cv.height=128;const ctx=cv.getContext('2d');ctx.fillStyle=col;ctx.fillRect(0,0,128,128);let seed=41;const r=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<2200;i++){ctx.fillStyle=r()>.5?'rgba(255,255,255,.07)':'rgba(56,58,49,.045)';ctx.fillRect(r()*128,r()*128,1+r(),1+r());}
 const tex=new THREE.CanvasTexture(cv);tex.colorSpace=THREE.SRGBColorSpace;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(2,1);return mat('#ffffff',{map:tex,roughness:.72});
}
function m3g4Furniture(f){
 const p=APARTMENT_CAPTURE_INPUT.group4_profile;if(!p||f.room_id!=='KIT-01'||!['counter','ksink'].includes(f.type))return null;
 const w=M(f.w),d=M(f.d),g=new THREE.Group(),iv=mat(p.ivory,{roughness:.65}),oak=woodM(p.wood),st=g4Stone(p.stone),n=mat(p.metal,{roughness:.38,metalness:.65}),front=d/2-.019;
 const part=(m,id)=>{m.userData.g4Part=id;g.add(m);return m;};
 if(f.type==='ksink'){
  const steel=mat('#B8C0BD',{roughness:.33,metalness:.65}),iw=.385,id=.264,bottom=.710,top=.870,cz=.030;
  for(const x of [-1,1])part(box((w-iw)/2,.008,d,steel,x*(iw/2+(w-iw)/4),.862,0),'generic-sink-flange');const rear=d/2+cz-id/2,forward=d/2-cz-id/2;part(box(iw,.008,rear,steel,0,.862,-d/2+rear/2),'generic-sink-flange');part(box(iw,.008,forward,steel,0,.862,d/2-forward/2),'generic-sink-flange');
  for(const x of [-1,1])part(box(.012,top-bottom,id,steel,x*(iw/2-.006),bottom,cz),'generic-bowl');for(const z of [-1,1])part(box(iw,top-bottom,.012,steel,0,bottom,cz+z*(id/2-.006)),'generic-bowl');part(box(iw,.012,id,steel,0,bottom,cz),'generic-bowl');part(cyl(.020,.02,.004,n,0,bottom+.014,cz),'generic-waste');
  const fx=w*.3,bz=-d/2;g.add(cyl(.025,.028,.03,n,fx,.87,bz+.06),tube([[fx,.90,bz+.06],[fx,1.12,bz+.06],[fx,1.17,bz+.10],[fx,1.14,bz+.18],[fx,1.08,bz+.20]],.012,n));
 }else{
 if(f.id==='K3-sink-base'){
  for(const x of [-1,1])part(box(.018,.72,d-.04,iv,x*(w/2-.009),.10,-.02),'assumed-case-sides');part(box(w,.018,d-.04,iv,0,.10,-.02),'assumed-case-bottom');part(box(w,.72,.018,iv,0,.10,-d/2+.009),'assumed-case-back');
  const iw=.385,id=.264,cz=.030;for(const x of [-1,1])part(box((w-iw)/2,.04,d,st,x*(iw/2+(w-iw)/4),.82,0),'assumed-cutout-HOLD');
  const rear=d/2+cz-id/2,forward=d/2-cz-id/2;part(box(iw,.04,rear,st,0,.82,-d/2+rear/2),'assumed-cutout-HOLD');part(box(iw,.04,forward,st,0,.82,d/2-forward/2),'assumed-cutout-HOLD');
 }else{part(box(w,.72,d-.04,iv,0,.10,-.02),'source-base-proxy-not-cavity');part(rbox(w+.01,.04,d,st,0,.82,0,.004),'source-sized-worktop');}
 part(box(w-.01,.10,d-.10,mat('#57574E'),0,0,-.05),'recessed-plinth-concept');
 const face=(x,ww,y,h,wood=false)=>{part(rbox(ww-.006,h-.005,.018,wood?oak:iv,x,y,front,.003),'front-assumption');part(box(Math.min(ww*.55,.30),.008,.014,n,x,y+h-.035,front+.009),'grasp-pull-HOLD');};
 if(f.id==='starter-20'){
  // Local x maps north for source rotation270. Source intervals593/600/307 from south.
  const north=.5965,south=-.4535,oven=.143;
  face(north,.307,.10,.72);
  if(p.south_front==='SLIDING_FIXED_SHELVES'&&APARTMENT_CAPTURE_INPUT.group4_detail?.version!==1){
   // Two overlapping fronts stay in the source envelope. About270mm access is a hypothesis.
   for(const x of [south-.1465,south+.1465]){part(rbox(.297,.715,.010,oak,x,.103,front,.003),'sliding-front-HOLD');part(box(.006,.09,.008,n,x,.68,front+.007),'sliding-grip-HOLD');}
  }else for(const [y,h] of [[.10,.30],[.405,.245],[.655,.165]])face(south,.593,y,h,true);
  // An oven front is a labelled study, not a saved fitted appliance or a cutout.
  part(box(.588,.595,.023,mat('#424644',{roughness:.36,metalness:.35}),oven,.14,front+.003),'oven-reservation-HOLD');part(box(.46,.32,.004,mat('#232827',{roughness:.18}),oven,.27,front+.017),'oven-reservation-HOLD');part(box(.42,.014,.021,n,oven,.65,front+.014),'oven-grasp-HOLD');
  // Keep both small work surfaces clear. Initial review alone includes a board to critique.
  if(APARTMENT_CAPTURE_INPUT.group4_detail?.version===1)part(rbox(.36,.018,.25,oak,south,.86,0,.004),'initial-board-blocking-prep');
 }else if(f.id==='K3-sink-base'){face(0,w,.10,.72);}
 else if(f.id==='K3-end-landing'){face(0,w,.10,.35,true);face(0,w,.455,.365,true);}
 else face(0,w,.10,.72);
 }
 g.position.set(wx(f.cx),0,wz(f.cy));g.rotation.y=-f.rot*Math.PI/180;g.userData.fid=f.id;g.userData.roomId=f.room_id;g.userData.g4SourceBox=[f.w,f.d];return g;
}
`;
export const diagnostics=String.raw`
const g4OldInterior=interiorMesh;interiorMesh=function(o){
 const g=g4OldInterior(o),p=APARTMENT_CAPTURE_INPUT.group4_profile;if(!p||o.room_id!=='KIT-01')return g;
 if(o.type==='wall-panel'){
  // Keep original source mesh, add a facing concept. These are not shop dimensions.
  const w=o.width_mm/1000,base=g.children[0];base.material=g4Stone(p.splash);
  const north=o.id.includes('north'),span=north?3.000:2.090,offset=north?.0319405:.295006;
  const facing=box(span,.620,.003,g4Stone(p.splash),offset,-.070,o.depth_mm/2000+.002);facing.userData.g4Part='continuous-facing-HOLD';g.add(facing);
  if(o.id.includes('west')){const hood=box(.60,.070,.003,g4Stone(p.splash),.143,.55,o.depth_mm/2000+.002);hood.userData.g4Part='hood-finish-band-HOLD';g.add(hood);}
 }else if(o.type==='sideboard'){
  const w=o.width_mm/1000,d=o.depth_mm/1000,h=o.height_mm/1000,iv=mat(p.ivory,{roughness:.65}),oak=woodM(p.wood),n=mat(p.metal,{roughness:.38,metalness:.65});
  // Hidden original first mesh keeps the source-sized reference box for R6 geometry; no extra storage.
  g.children.forEach(x=>x.visible=false);const open=p.open_cubby&&o.id==='KIT-A1-upper-north',cw=open?.300:0,closed=w-cw;
  // Recess the closed-body proxy so front panels/seams are genuinely visible,
  // while all components remain inside the original330mm depth envelope.
  g.add(box(closed,h,d-.024,iv,-cw/2,0,-.012));
  const count=Math.ceil(closed/.6),fw=closed/count;
  for(let i=0;i<count;i++){const x=-w/2+fw*(i+.5);g.add(rbox(fw-.004,h-.006,.018,iv,x,.003,d/2-.010,.003),box(.12,.006,.012,n,x,.03,d/2+.002));}
  if(open){const x=w/2-cw/2;
   g.add(box(cw,h,.018,oak,x,0,-d/2+.009));for(const xx of [x-cw/2+.009,x+cw/2-.009])g.add(box(.018,h,d,oak,xx,0,0));for(const yy of [0,.34,h-.018])g.add(box(cw,.018,d,oak,x,yy,0));
   // Two cups, no racks of invented capacity.
   for(const xx of [x-.055,x+.045]){g.add(cyl(.027,.028,.072,mat('#EAE5D9',{roughness:.38}),xx,.358,.025));}
  }
  g.userData.g4Cabinet={source_id:o.id,source_box_mm:[o.width_mm,o.depth_mm,o.height_mm],hidden_source_reference:true,open_cubby_mm:open?[300,330,700]:null,front_divisions_are_design_hypotheses:true};
 }
 return g;
};
const g4OldSurface=interiorSurfaceMaterial;interiorSurfaceMaterial=function(id,fallback,kind){const p=APARTMENT_CAPTURE_INPUT.group4_profile;if(p&&id==='FLOOR-KIT-01')return g4Stone(p.floor);return g4OldSurface(id,fallback,kind);};
// Only source kitchen walls receive this paint-tone study; ceiling/doors are unchanged.
const g4OldFurniture=buildFurniture;buildFurniture=function(f){const g=g4OldFurniture(f),p=APARTMENT_CAPTURE_INPUT.group4_profile;if(p&&f.room_id==='KIT-01'&&f.id==='K3-dishwasher')g.traverse(m=>{if(m.isMesh&&m.material?.color&&m.position.z>.27)m.material=mat(p.ivory,{roughness:.65});});return g;};
globalThis.__g4Details=()=>{
 const records=[];furnG.updateMatrixWorld(true);for(const g of furnG.children){if(g.userData.roomId!=='KIT-01'&&!state.interior.objects.some(o=>o.room_id==='KIT-01'&&o.id===g.userData.interiorObjectId))continue;
 const b=new THREE.Box3().setFromObject(g),parts=[];g.traverse(m=>{if(m.isMesh&&m.userData.g4Part){const q=new THREE.Box3().setFromObject(m);parts.push({id:m.userData.g4Part,min:q.min.toArray(),max:q.max.toArray()});}});records.push({id:g.userData.fid||g.userData.interiorObjectId,bounds_world_m:{min:b.min.toArray(),max:b.max.toArray()},parts,concept:g.userData.g4Cabinet||null});}return records;
};
`;
