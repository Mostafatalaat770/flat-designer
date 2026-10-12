/** Bounded outdoor furniture, planting/drying/light visualization. No new architecture. */
export const furnitureHook=String.raw`
function g5Stone(col){const cv=document.createElement('canvas');cv.width=cv.height=128;const c=cv.getContext('2d');c.fillStyle=col;c.fillRect(0,0,128,128);let n=73;for(let i=0;i<1300;i++){n=(n*1664525+1013904223)>>>0;const x=n%128;n=(n*1664525+1013904223)>>>0;const y=n%128;c.fillStyle=i%2?'rgba(60,65,55,.035)':'rgba(255,255,255,.075)';c.fillRect(x,y,1,1);}const t=new THREE.CanvasTexture(cv);t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;return mat('#FFFFFF',{map:t,roughness:.84});}
function g5Seat(w,d,p,h=.43){const g=new THREE.Group(),metal=mat(p.metal,{metalness:.35,roughness:.60}),wood=woodM(p.wood),cloth=fabric(p.fabric),accent=fabric(p.accent);
 for(const x of [-w/2+.065,w/2-.065])for(const z of [-d/2+.075,d/2-.075])g.add(rod([x,0,z],[x,h-.04,z],.018,metal));
 g.add(box(w-.06,.04,d-.06,wood,0,h-.065,0),rbox(w-.11,.09,d-.15,cloth,0,h-.025,.015,.028));
 g.add(rbox(w-.07,.28,.055,wood,0,h+.10,-d/2+.044,.016),rbox(w-.14,.26,.105,cloth,0,h+.115,-d/2+.098,.028));
 for(const x of [-w/2+.035,w/2-.035])g.add(rod([x,h-.03,-d/2+.08],[x,h+.23,-d/2+.07],.013,metal),rod([x,h+.23,-d/2+.07],[x,h+.23,d/2-.08],.013,metal),rbox(.055,.030,d-.13,wood,x,h+.23,0,.009));
 g.add(rbox(w*.40,.16,.09,accent,0,h+.12,-d/2+.18,.025));return g;
}
function g5Plant(w,d,h,p){const g=new THREE.Group(),pot=mat(p.pot,{roughness:.86}),leaf=mat('#7C896C',{roughness:.90}),trunk=woodM('#8B795C'),r=Math.min(w,d)/2,ph=Math.min(.38,h*.40);g.add(cyl(r*.78,r*.67,ph,pot,0,0,0,40),cyl(r*.83,r*.83,.016,pot,0,ph-.015,0,40),cyl(r*.76,r*.76,.010,mat('#625F4B'),0,ph-.003,0,32));
 const crown=h-ph;for(let i=0;i<9;i++){const a=i*Math.PI*2/9,x=Math.cos(a)*r*.53,z=Math.sin(a)*r*.53;g.add(rod([0,ph,0],[x,ph+crown*.67,z],.006,trunk));const m=new THREE.Mesh(new THREE.SphereGeometry(1,12,9),leaf);m.scale.set(r*.33,crown*.25,r*.33);m.position.set(x,ph+crown*.72,z);m.castShadow=m.receiveShadow=true;g.add(m);}return g;}
function m3g5Furniture(f){const p=APARTMENT_CAPTURE_INPUT.group5_profile;if(!p||!['TER-MAIN','TER-MBR','TER-SVC'].includes(f.room_id))return null;let g;const w=f.w/1000,d=f.d/1000;
 if(f.type==='armchair')g=g5Seat(w,d,p,p.id==='A'?.43:.46);
 else if(f.type==='roundtable'){g=new THREE.Group();const top=p.table_height_mm/1000;g.add(cyl(w/2,w/2,.025,g5Stone(p.stone),0,top-.025,0,64),cyl(.06,.06,top-.045,mat(p.metal,{metalness:.35,roughness:.6}),0,.02,0,32),cyl(.14,.14,.020,mat(p.metal,{roughness:.75}),0,0,0,40));
  // Removable tray and two cups; no permanent plant cluster occupying tea service.
  g.add(rbox(.35,.018,.25,woodM(p.wood),0,top,0,.012));for(const x of [-.105,.105])g.add(cyl(.033,.033,.072,mat('#E8E4D8'),x,top+.018,0,20));
 }else if(f.type==='plant')g=g5Plant(w,d,.95,p);else return null;
 g.position.set(wx(f.cx),0,wz(f.cy));g.rotation.y=-f.rot*Math.PI/180;g.userData.fid=f.id;g.userData.roomId=f.room_id;g.userData.g5Bounded=true;return g;
}
`;
export const diagnostics=String.raw`
const g5Surface=interiorSurfaceMaterial;interiorSurfaceMaterial=function(id,fallback,kind){const p=APARTMENT_CAPTURE_INPUT.group5_profile;if(p&&['FLOOR-TER-MAIN','FLOOR-TER-MBR','FLOOR-TER-SVC'].includes(id))return g5Stone(p.floor);return g5Surface(id,fallback,kind);};
const g5Build=buildInteriorObjects;buildInteriorObjects=function(){const r=g5Build(),p=APARTMENT_CAPTURE_INPUT.group5_profile;if(!p)return r;
 for(const c of APARTMENT_CAPTURE_INPUT.group5_concepts){let g=new THREE.Group(),w=c.w/1000,d=c.d/1000,h=c.h/1000,metal=mat(p.metal,{roughness:.55,metalness:.4});
  if(c.kind==='seat'){g=g5Seat(w,d,p,c.seat_h/1000);if(c.arm_tray)g.add(rbox(.20,.025,.26,woodM(p.wood),w/2-.105,.685,.03,.01));}
  else if(c.kind==='plant')g=g5Plant(w,d,h,p);
  else if(c.kind.startsWith('rack')){
   const folded=APARTMENT_CAPTURE_INPUT.group5_detail.rack_state==='FOLDED',depth=folded?.12:d;
   for(const x of [-w/2+.03,w/2-.03]){g.add(rod([x,0,-depth/2+.02],[x,h,depth/2-.02],.010,metal),rod([x,0,depth/2-.02],[x,h,-depth/2+.02],.010,metal));}
   for(const yy of c.kind==='rack-tower'?[.45,.82,h]:[h])for(let i=0;i<5;i++){const z=-depth/2+.035+i*(depth-.07)/4;g.add(rod([-w/2+.02,yy,z],[w/2-.02,yy,z],.007,metal));}
   // Small removable towels; real family loads/wind resistance are unverified.
   if(!folded){const fh=c.kind==='rack-tower'?.42:.55;g.add(box(w*.45,fh,.010,fabric('#D7DBCD'),-w*.16,h-fh,-d*.14),box(w*.30,fh*.83,.010,fabric('#BDCCB7'),w*.23,h-fh*.83,d*.20));}
   g.userData.rack={kind:c.kind,folded,nominal_mm:[c.w,folded?120:c.d,c.h],capacity_kg:null,anchoring_approved:false};
  }else if(c.kind==='caddy'){
   g.add(rbox(w,.32,d,mat('#B5B4A5',{roughness:.85}),0,.03,0,.025),rbox(w-.025,.020,d-.025,mat('#7A8173'),0,.35,0,.015));
   for(const x of [-.065,.065])g.add(rod([x,.05,-.03],[x,h-.14,-.03],.007,woodM(p.wood)),rbox(.11,.09,.05,mat('#B6B9A9'),x,h-.14,-.03,.01));g.userData.storage='Portable closed caddy/handle concept, no facade fixings or chemical/weather approval';
  }
  g.position.set(wx(c.cx),0,wz(c.cy));g.rotation.y=-c.rot*Math.PI/180;g.userData.g5Concept=c.id;g.userData.roomId=c.room;g.userData.g5Bounded=true;furnG.add(g);
 }
 // Portable shielded light capabilities, no roof/ceiling/facade electrical locations.
 const night=APARTMENT_CAPTURE_INPUT.camera.viewer.night;
 const addLamp=(id,x,y,z,height,power)=>{const g=new THREE.Group(),dark=mat(p.metal,{roughness:.7}),diff=new THREE.MeshBasicMaterial({color:night?'#F2DAB4':'#CECFC4'});g.add(cyl(.065,.065,.016,dark,0,0,0),cyl(.047,.047,height*.7,diff,0,.016,0),cyl(.073,.073,.022,dark,0,height*.72,0));const l=new THREE.PointLight('#FFE2B5',night?power:0,2.5,2);l.position.set(0,height*.40,0);g.add(l);g.position.set(wx(x),y,wz(z));g.userData.g5Concept=id;g.userData.light_capability='PORTABLE SHIELDED VISUAL ONLY / no lux/IP/wiring';furnG.add(g);};
 const table=state.furniture.find(f=>f.id==='starter-41');addLamp('G5-main-lantern',table.cx, p.table_height_mm/1000,table.cy-.17,.23,.32);
 addLamp('G5-master-marker',1040,.02,4360,.20,.12);
 return r;
};
globalThis.__g5Details=()=>{
 scene.updateMatrixWorld(true);const bounds=g=>{const b=new THREE.Box3().setFromObject(g);return {min_mm:[b.min.x*1000+MODEL.width_mm/2,b.min.z*1000+MODEL.depth_mm/2,b.min.y*1000],max_mm:[b.max.x*1000+MODEL.width_mm/2,b.max.z*1000+MODEL.depth_mm/2,b.max.y*1000]};};
 const furniture=furnG.children.filter(g=>g.userData.g5Bounded||g.userData.g5Concept||state.furniture.some(f=>f.id===g.userData.fid&&['TER-MAIN','TER-MBR','TER-SVC'].includes(f.room_id))).map(g=>({id:g.userData.fid||g.userData.g5Concept,room:g.userData.roomId,bounds:bounds(g),rack:g.userData.rack||null,light:g.userData.light_capability||null}));
 const walls=archUp.children.filter(g=>g.userData.wallSegment).map(g=>({source:g.userData.wallSegment,matrix:g.matrixWorld.toArray(),positions:Array.from(g.geometry.attributes.position.array)}));
 const ceilings=archUp.children.filter(g=>g.userData.ceilingFor).map(g=>g.userData.ceilingFor);
 const glass=doors.filter(d=>d.sliding).map(d=>({id:d.id,open:d.open,cur:d.cur,L_mm:d.L*1000,panels:d.panels.map(p=>({matrix:p.matrixWorld.toArray(),bounds:bounds(p)}))}));
 return {furniture,architecture:{walls,ceilings},glass,scope:'Source geometry; visible planter/caddy/rack/lantern are reversible design proxies, never approved products or loads.'};
};
`;
