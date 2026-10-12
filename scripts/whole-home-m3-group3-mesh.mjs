/** Bounded generic bathroom concepts on the unchanged production architecture. Not supplier CAD. */
export const furnitureHook=String.raw`
function m3g3Furniture(f){
 const p=APARTMENT_CAPTURE_INPUT.group3_profile,detail=APARTMENT_CAPTURE_INPUT.group3_detail;if(!p||!['BATH-M01','BATH-C01','WC-01'].includes(f.room_id))return null;
 const w=M(f.w),d=M(f.d),g=new THREE.Group(),wood=woodM(p.wood),stone=mat('#EEEAE1',{roughness:.65}),nickel=mat('#AAB4B4',{metalness:.65,roughness:.33}),part=(o,n)=>{o.userData.component=n;g.add(o);return o;};
 if(f.type==='vanity'){
  const guest=f.room_id==='WC-01',spec=detail.basin_proxy[guest?(p.id==='B'?'B_guest':'A_guest'):'large'],bw=spec.outer[0]/1000,bd=spec.outer[1]/1000,iw=spec.inner[0]/1000,id=spec.inner[1]/1000,depth=spec.water_depth/1000,top=.850,bottom=guest?.54:.40,ch=top-.045-bottom;
  for(const x of [-w/2+.009,w/2-.009])part(box(.018,ch,d-.02,wood,x,bottom,0),'case-side');part(box(w,ch,.018,wood,0,bottom,-d/2+.009),'case-back');part(box(w,.018,d-.02,wood,0,bottom,0),'case-bottom');
  part(rbox(w-.006,ch,.020,wood,0,bottom,d/2-.012,.008),'closed-front');if(!guest)g.add(box(f.room_id==='BATH-C01'&&p.id==='B'?.004:w-.024,f.room_id==='BATH-C01'&&p.id==='B'?ch-.025:.005,.022,mat(p.dark),0,f.room_id==='BATH-C01'&&p.id==='B'?bottom+.01:.60,d/2-.010));
  for(const y of guest?[.67]:[.52,.72])g.add(box(w*.48,.007,.015,nickel,0,y,d/2-.004));
  // Counter and rim have a real visible opening, not a solid white block covering a bowl.
  const side=(w-bw)/2,rear=(d-bd)/2;for(const x of [-1,1])part(rbox(side,.028,d,stone,x*(bw/2+side/2),top-.028,0,.006),'counter-side');for(const z of [-1,1])part(box(bw,.028,rear,stone,0,top-.028,z*(bd/2+rear/2)),'counter-return');
  const ceramic=mat('#F3F1EB',{roughness:.27}),thx=(bw-iw)/2,thz=(bd-id)/2;
  for(const x of [-1,1])part(box(thx,depth,bd,ceramic,x*(iw/2+thx/2),top-depth,0),'bowl-wall');for(const z of [-1,1])part(box(iw,depth,thz,ceramic,0,top-depth,z*(id/2+thz/2)),'bowl-wall');part(box(iw,.012,id,ceramic,0,top-depth,0),'bowl-bottom');part(cyl(.018,.018,.002,nickel,0,top-depth+.013,0),'waste-visual');
  const tapZ=-d/2+.025,proj=spec.tap_projection/1000;g.add(cyl(.018,.018,.015,nickel,0,top,tapZ));g.add(tube([[0,top+.01,tapZ],[0,top+.16,tapZ],[0,top+.16,tapZ+proj],[0,top+.14,tapZ+proj]],.007,nickel));
  if(!guest)g.add(rbox(.050,.13,.045,mat(p.accent),w/2-.034,top,-.025,.005));
  g.userData.basinConcept={inner_mm:spec.inner,outer_mm:spec.outer,depth_mm:spec.water_depth,not_water_tested:true};
 }else if(f.id==='starter-16'){
  const glass=mat('#D9E3DF',{transparent:true,opacity:.14,depthWrite:false,side:THREE.DoubleSide,roughness:.10}),h=1.96,base=.035;
  part(rbox(w,base,d,mat(p.floor,{roughness:.87}),0,0,0,.006),'base-visual-HOLD');
  // Actual plan: shower is south-east, so its WC-facing fixed pane is local -Z/NORTH.
  part(box(w,h,.008,glass,0,base,-d/2+.004),'fixed-north');part(box(.008,h,.320,glass,-w/2+.004,base,d/2-.160),'west-fixed');
  const hinge=[-w/2,.130],open=detail.glass_state==='OPEN',t=open?90:0,first=(-90+t)*Math.PI/180,second=(-90-t)*Math.PI/180,panels=detail.family_mechanism.startsWith('INWARD_BIFOLD')?[[hinge,.290,first],[[hinge[0]+.290*Math.cos(first),hinge[1]+.290*Math.sin(first)],.290,second]]:[[hinge,.580,first]];
  for(const [pt,len,a]of panels){const panel=box(len,h,.008,glass,0,base,0);panel.position.x=pt[0]+len/2*Math.cos(a);panel.position.z=pt[1]+len/2*Math.sin(a);panel.rotation.y=-a;part(panel,'moving-panel');}
  part(box(.012,h,.012,nickel,hinge[0],base,hinge[1]),'hinge-visual-HOLD');
  // Retain source mixer/rainhead relationship; add hand shower and cleanable hose concept.
  const x=-w*.25,z=d/2-.055;g.add(rbox(.14,.09,.035,nickel,x,1.04,z,.012),rod([x,1.13,z],[x,2.01,z],.012,nickel),rod([x,2.01,z],[x,2.01,z-.18],.012,nickel),box(.23,.012,.23,nickel,x,2.0,z-.18));
  g.add(rod([x+.10,1.20,z-.018],[x+.10,1.45,z-.018],.009,nickel),rbox(.035,.08,.018,nickel,x+.10,1.45,z-.018,.008));g.add(tube([[x+.06,1.08,z-.015],[x+.10,.65,z-.025],[x+.21,.69,z-.055],[x+.10,1.20,z-.018]],.005,nickel));
  g.userData.glassConcept={mechanism:detail.family_mechanism,open,all_products_HOLD:true};
 }else return null;
 g.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(g);if(b.min.x<-w/2-.007||b.max.x>w/2+.007||b.min.z<-d/2-.007||b.max.z>d/2+.007)throw Error('Group3 mesh outside declared footprint '+f.id);
 const mm=x=>Math.round(x*100000)/100;globalThis.__g3Mesh=globalThis.__g3Mesh||{};const parts={};g.traverse(m=>{if(m.isMesh&&m.userData.component){const bb=new THREE.Box3().setFromObject(m);(parts[m.userData.component]||=[]).push({min:bb.min.toArray().map(mm),max:bb.max.toArray().map(mm)});}});globalThis.__g3Mesh[f.id]={footprint_mm:[f.w,f.d],bounds_mm:{min:b.min.toArray().map(mm),max:b.max.toArray().map(mm)},parts,concept:g.userData};
 g.position.set(wx(f.cx),0,wz(f.cy));g.rotation.y=-f.rot*Math.PI/180;g.userData.fid=f.id;g.userData.roomId=f.room_id;return g;
}
`;
export const diagnostics=String.raw`
const g3OldPbr=interiorPbr;interiorPbr=function(id,...args){const m=g3OldPbr(id,...args);if(id?.startsWith('m3g3-')){m.bumpMap=null;m.normalMap=null;m.needsUpdate=true;}return m;};

const g3OldInterior=interiorMesh;interiorMesh=function(o){
 const g=g3OldInterior(o),p=APARTMENT_CAPTURE_INPUT.group3_profile;if(!p||!['BATH-M01','BATH-C01','WC-01'].includes(o.room_id))return g;
 if(o.type==='mirror'){
  g.clear();const w=o.width_mm/1000,h=o.height_mm/1000,d=o.depth_mm/1000,nickel=mat('#AAB4B4',{metalness:.62,roughness:.35});
  g.add(rbox(w,h,d,woodM(p.dark),0,0,0,.012));g.add(box(w-.025,h-.025,.003,new THREE.MeshBasicMaterial({color:'#B9C7C3'}),0,.012,d/2+.002));
  const glow=new THREE.MeshBasicMaterial({color:'#FFEACB'});if(p.id==='B')for(const x of [-w/2+.021,w/2-.021])g.add(rbox(.012,h-.14,.015,glow,x,.07,d/2+.009,.004));else g.add(rbox(w-.08,.012,.016,glow,0,h-.03,d/2+.009,.004));
  const l=new THREE.PointLight('#FFE8CC',0,2,2);l.position.set(0,h*.56,.12);l.userData.interiorLight=true;l.userData.roomId=o.room_id;l.userData.basePower=.18;g.add(l);g.userData.optical={reflective_simulation:false,illuminance:'NOT_CALCULATED',cabinet_mm:p.id==='B'&&o.room_id!=='WC-01'?100:0};
 }else if(o.type==='divider'){
  g.clear();const w=o.width_mm/1000,h=o.height_mm/1000,d=o.depth_mm/1000,glass=mat('#D8E4DF',{transparent:true,opacity:.14,depthWrite:false,side:THREE.DoubleSide,roughness:.1});g.add(box(w,h,d,glass,0,0,0));for(const x of [-w*.35,w*.35])g.add(box(.035,.04,.018,mat('#AAB4B4',{metalness:.6,roughness:.3}),x,0,0));
 }else if(o.id==='BATHC-wall-towel-cabinet-A2'){
  g.clear();const w=.520,h=.420,d=.170,wood=mat(p.id==='B'?p.wall:p.wood,{roughness:.75});g.add(rbox(w,h,d,wood,0,0,0,.009));g.add(box(.003,h-.03,.005,mat(p.dark),0,.015,d/2+.001));g.add(box(.22,.005,.008,mat(p.dark),0,.04,d/2+.002));g.userData.storage='520x170x420 source envelope / sealed twin fronts;182deep folded bath towel does not fit assumed134depth';
 }
 globalThis.__g3Interiors=globalThis.__g3Interiors||{};g.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(g);globalThis.__g3Interiors[o.id]={bounds_world_m:{min:b.min.toArray(),max:b.max.toArray()},optical:g.userData.optical||null};return g;
};
const g3OldFurniture=buildFurniture;buildFurniture=function(f){const g=g3OldFurniture(f),p=APARTMENT_CAPTURE_INPUT.group3_profile;if(p&&f.id==='BATHM-WALKIN-A1'){
 const w=f.w/1000,d=f.d/1000,x=-w*.25,z=-d/2+.09,n=mat('#AAB4B4',{metalness:.65,roughness:.3});g.add(rod([x+.11,1.2,z+.02],[x+.11,1.45,z+.02],.009,n),rbox(.035,.08,.018,n,x+.11,1.45,z+.02,.008),tube([[x+.05,1.09,z+.025],[x+.1,.62,z+.03],[x+.22,.68,z+.055],[x+.11,1.2,z+.02]],.005,n));}return g;};
const g3OldBuild=buildInteriorObjects;buildInteriorObjects=function(){const r=g3OldBuild();const p=APARTMENT_CAPTURE_INPUT.group3_profile,detail=APARTMENT_CAPTURE_INPUT.group3_detail;if(!p)return r;
 globalThis.__g3Accessories={};for(const a of detail.accessories){const g=new THREE.Group(),w=a.w/1000,d=a.d/1000,h=a.h/1000,n=mat('#AAB4B4',{metalness:.65,roughness:.32}),cloth=fabric(p.accent);
  if(a.kind==='bar'){g.add(rod([-w/2,h-.025,-.01],[w/2,h-.025,-.01],.006,n));g.add(box(w*.72,h-.04,.012,cloth,0,.01,.01));}
  if(a.kind==='hooks'){for(const x of [-w*.32,w*.32]){g.add(box(.018,.035,.04,n,x,h-.035,0));g.add(box(.065,h-.06,.012,cloth,x,0,.012));}}
  if(a.kind==='roll'){g.add(rod([-w/2,h/2,0],[w/2,h/2,0],.005,n),box(w*.65,.10,.05,mat('#F0EBE1'),0,0,0));}
  if(a.kind==='bin'){g.add(rbox(w,h,d,mat(p.dark),0,0,0,.012));g.add(rbox(w-.016,.009,d-.016,n,0,h-.009,0,.008));}
  g.position.set(wx(a.cx),a.bottom/1000,wz(a.cy));g.rotation.y=-a.rot*Math.PI/180;g.userData.roomId=a.room;g.userData.group3ConceptAccessory=a.id;g.updateMatrixWorld(true);const bb=new THREE.Box3().setFromObject(g),toMM=v=>[(v.x-wx(0))*1000,v.y*1000,(v.z-wz(0))*1000];globalThis.__g3Accessories[a.id]={min:toMM(bb.min),max:toMM(bb.max),dimensions:a,product:false};furnG.add(g);
 }return r;};
`;
