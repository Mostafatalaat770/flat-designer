/* Concept finishes and equipment; canonical architectural planes remain fixed. */
let studioLampFootprints=[];
function studioLightColour(k){return k===2700?'#ffd5a0':k===4000?'#fff4e6':'#ffe3bf';}
function studioFurnitureTheme(f){
  const current=currentDecor(),base=current.id==='custom'?DECOR_THEMES.find(t=>t.id==='warm'):current;
  const id={'upholstered':'warm','oak-platform':'japandi','woven-headboard':'boho'}[f.variant];
  const theme=id?{...base,id}:current,material=interiorMaterial(state,f.material_id);
  // A primary wood assignment controls the wood components of mixed furniture.
  return material?.category==='wood'?{...theme,wood:material.base_colour,woodDark:darker(material.base_colour,.76)}:theme;
}
function studioWallMaterials(s,base,cap){
  const [a,b]=[s.from,s.to],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];
  const face=sign=>{const point=[mid[0]-sign*dz/L*180,mid[1]+sign*dx/L*180],r=ROOMS.find(r=>pointInRoom(point,r.poly));const color=r&&studioRoomOptions(state,r.id).wall;return color?mat(color,{roughness:.92}):base;};
  return [base,base,cap,base,face(1),face(-1)];
}
/* Explicit, dimensioned closed-front joinery concept; not a manufacturer model. */
function studioCounterJoinery(g,f,w,d,cm){
  const j=f.joinery;
  if(!j)return false;
  const validModules=a=>Array.isArray(a)&&a.length>0&&a.every(m=>Number.isFinite(m.width_mm)&&m.width_mm>=100&&['dishwasher','sink','drawers','storage'].includes(m.role));
  if(j.schema!=='CounterJoineryConcept/1'||j.status!=='EXPLORATORY'||!Number.isFinite(j.end_panel_mm)||j.end_panel_mm<12||j.end_panel_mm>30||!validModules(j.work_modules)||!validModules(j.rear_modules)||!Number.isFinite(j.working_depth_mm)||!Number.isFinite(j.rear_depth_mm)||j.working_depth_mm<500||j.rear_depth_mm<200)throw new Error('Invalid counter joinery concept.');
  for(const modules of [j.work_modules,j.rear_modules])if(Math.abs(modules.reduce((n,m)=>n+m.width_mm,2*j.end_panel_mm)-f.w)>.01)throw new Error('Joinery widths exceed the declared counter.');
  if(Math.abs(j.working_depth_mm+j.rear_depth_mm-f.d)>.01)throw new Error('Joinery depths exceed the declared counter.');
  const p=M(j.end_panel_mm),work=M(j.working_depth_mm),rear=M(j.rear_depth_mm);
  g.add(box(w-.012,.08,d-.08,'#4a4641',0,0,0));
  for(const side of [-1,1])g.add(box(p,.74,d-.04,cm,side*(w/2-p/2),.08,0));
  // The rear mass is a shallow storage reservation. Plumbing access remains TBD.
  g.add(box(w-2*p,.74,rear-.04,cm,0,.08,-d/2+rear/2));
  const renderedModules=[];
  const record=front=>{g.updateMatrixWorld(true);const b=new THREE.Box3().setFromObject(front);renderedModules.push({...front.userData.counterModule,min_mm:b.min.toArray().map(n=>n*1000),max_mm:b.max.toArray().map(n=>n*1000)});};
  let x=-w/2+p;
  for(const [index,m] of j.work_modules.entries()){
    const mw=M(m.width_mm),front=new THREE.Group();
    fronts(front,-mw/2,.08,mw,.72,0,m.role==='sink'?2:1,m.role==='drawers'?3:1,cm,'edge');
    front.position.set(x+mw/2,0,d/2-.03);
    front.userData.counterModule={side:'working',index,role:m.role,width_mm:m.width_mm,depth_mm:j.working_depth_mm};
    g.add(front);record(front);
    if(m.role==='dishwasher'){
      // Preserve a full 600 mm clear lateral bay; its closed integrated front is shown.
      g.add(box(mw-.02,.70,work-.06,mat('#8b9297',{roughness:.5}),x+mw/2,.09,d/2-work/2-.02));
    }else{
      for(const sx of [x+p/2,x+mw-p/2])g.add(box(p,.74,work-.04,cm,sx,.08,d/2-work/2-.02));
      g.add(box(mw,.018,work-.04,cm,x+mw/2,.08,d/2-work/2-.02));
    }
    x+=mw;
  }
  x=-w/2+p;
  for(const [index,m] of j.rear_modules.entries()){
    const mw=M(m.width_mm),front=new THREE.Group();
    fronts(front,-mw/2,.08,mw,.72,0,1,1,cm,'edge');
    front.position.set(x+mw/2,0,-d/2+.03);front.rotation.y=Math.PI;
    front.userData.counterModule={side:'reception',index,role:m.role,width_mm:m.width_mm,depth_mm:j.rear_depth_mm};
    g.add(front);record(front);x+=mw;
  }
  g.userData.counterJoinery={module_geometry:renderedModules,schema:j.schema,working_depth_mm:j.working_depth_mm,rear_depth_mm:j.rear_depth_mm,end_panel_mm:j.end_panel_mm,work_modules:j.work_modules.map(m=>({...m})),rear_modules:j.rear_modules.map(m=>({...m}))};
  return true;
}

function makeStudioVariant(f){
  if(!f.variant||f.variant==='style'||!STUDIO_VARIANTS[f.type]?.includes(f.variant)||f.type==='bed')return null;
  const t=currentDecor().id==='custom'?DECOR_THEMES.find(t=>t.id==='warm'):currentDecor(),g=new THREE.Group(),w=M(f.w),d=M(f.d),c=f.color,fab=fabric(c),assigned=interiorMaterial(state,f.material_id),wood=woodM(t.wood),assignedMat=assigned?(assigned.category==='wood'?woodM(assigned.base_colour):mat(assigned.base_colour,{roughness:assigned.roughness??.7,metalness:assigned.metallic??0})):null;
  const connect=f.type==='sofa'&&f.variant==='modular'&&f.product_reference_id==='sofa-connect-soft-3',seats=[];
  if(['sofa','armchair'].includes(f.type)){
    const n=f.type==='armchair'?1:f.variant==='modular'?Math.max(2,Math.round(w/.96)):2,sw=w/n;
    if(f.variant==='cocoon'){
      for(let i=0;i<n;i++){const x=-w/2+sw*(i+.5);
        g.add(rbox(sw-.025,.48,d-.02,fab,x,.09,0,.16));
        g.add(rbox(sw-.05,.40,.22,fab,x,.38,-d/2+.13,.105));
        cushion(g,sw-.15,.15,d-.23,c,x,.30,.04);
      }
      for(const side of [-1,1])g.add(rbox(Math.min(.16,w*.18),.45,d*.80,fab,side*(w/2-.08),.24,.05,.075));
    }else if(f.variant==='modular'){
      for(let i=0;i<n;i++){const x=-w/2+sw*(i+.5);
        g.add(rbox(sw-.02,connect?.20:.25,d,fabric(darker(c,.86)),x,connect?.02:.045,0,.055));
        seats.push(cushion(g,sw-.03,.17,d-.23,c,x,connect?.23:.295,.105));
        cushion(g,sw-.04,.36,.20,c,x,connect?.3282:.35,-d/2+.11,-.06);
      }
      for(const side of [-1,1])g.add(rbox(.12,connect?.28:.34,d*.86,fab,side*(w/2-.06),connect?.25:.27,.04,.04));
    }else{
      legs(g,w-.03,d-.03,.17,mat(t.metal,{metalness:.65,roughness:.38}),.025,.013);
      g.add(rbox(w-.06,.12,d,fab,0,.17,0,.022));
      g.add(rbox(w,.53,.09,fab,0,.29,-d/2+.045,.025));
      for(const side of [-1,1])g.add(rbox(.085,.40,d,fab,side*(w/2-.0425),.29,0,.022));
      for(let i=0;i<n;i++){const x=-(w-.17)/2+(w-.17)/n*(i+.5);cushion(g,(w-.17)/n-.015,.13,d-.15,c,x,.29,.04);cushion(g,(w-.17)/n-.02,.37,.12,c,x,.44,-d/2+.12,-.05);}
    }
    if(f.type==='sofa')cushion(g,.30,.30,.12,t.accent,-w*.28,connect?.34:.43,-d*.14,-.09);
  }else if(f.type==='counter'){
    const assigned=interiorMaterial(state,f.material_id),cm=assigned?.category==='wood'?woodM(assigned.base_colour):mat(c,{roughness:.45}),stone=mat('#dcd7cf',{roughness:.22}),n=Math.max(1,Math.round(w/.6)),fz=d/2-.04;
    if(!studioCounterJoinery(g,f,w,d,cm)){
      g.add(box(w-.01,.08,d-.08,'#4a4641',0,0,-.04),box(w,.74,d-.04,cm,0,.08,-.02));
      fronts(g,-w/2+.005,.08,w-.01,.72,fz,n,1,cm,'edge',.48);
    }
    g.add(rbox(w+.01,.04,d,stone,0,.82,0,.004));
  }else if(f.type==='fridge'){
    const m=f.variant==='integrated'?(assignedMat||wood):mat('#a4abb0',{metalness:.72,roughness:.30});
    g.add(rbox(w,1.94,d,m,0,.015,0,.025));
    g.add(box(w-.02,.006,.01,mat('#30343a'),0,.67,d/2+.001));
    for(const y of [.32,1.13])g.add(box(.025,.25,.033,mat(t.metal,{metalness:.8,roughness:.32}),w*.34,y,d/2+.01));
  }else if(f.type==='dishwasher'){
    const m=f.variant==='integrated'?wood:mat('#a8afb4',{metalness:.7,roughness:.3});
    g.add(rbox(w,.84,d,m,0,.035,0,.014));g.add(box(w*.80,.014,.025,mat('#383b40'),0,.75,d/2+.005));
    if(f.variant==='steel')g.add(box(w-.01,.07,.012,mat('#24282c'),0,.80,d/2+.012));
  }else if(f.type==='ovencol'){
    g.add(rbox(w,2.15,d,assignedMat||wood,0,.025,0,.008));const m=f.variant==='steel'?mat('#a7aeb2',{metalness:.75,roughness:.26}):mat('#171b20',{roughness:.25,metalness:.2});
    g.add(box(w-.04,.60,.025,m,0,.87,d/2+.002));g.add(box(w*.74,.37,.012,mat('#0c1218',{roughness:.08,metalness:.3}),0,.97,d/2+.025));
    g.add(box(w*.68,.021,.030,mat('#b7bec1',{metalness:.8,roughness:.25}),0,1.30,d/2+.04));
  }
  if(connect){g.updateMatrixWorld(true);g.userData.referenceGeometry={product_reference_id:f.product_reference_id,seat_top_mm:Math.max(...seats.map(s=>new THREE.Box3().setFromObject(s).max.y))*1000};}
  batchSceneMeshes(g);g.position.set(wx(f.cx),0,wz(f.cy));g.rotation.y=-f.rot*Math.PI/180;g.userData.fid=f.id;g.userData.modelForm='independent-'+f.variant;g.userData.referenceVariant=f.variant;
  g.traverse(o=>o.userData.fid=f.id);return g;
}
function studioFeature(g,feature,rid){g.userData.sceneFeature=feature;g.userData.roomId=rid;g.visible=opt.cut>=H;sceneDecorG.add(g);return g;}
function studioSpot(options,power,x,y,z,rid,shadows=false){
  const light=new THREE.SpotLight(studioLightColour(options.temperature),power,7,Math.PI/5,.38,2);
  light.position.set(x,y,z);light.target.position.set(x,0,z);light.castShadow=shadows;light.shadow.mapSize.set(512,512);light.shadow.bias=-.0004;
  light.userData.sceneLight=true;light.userData.basePower=power;light.userData.roomId=rid;sceneDecorG.add(light,light.target);return light;
}
function studioRoomTrack(room,options){
  const candidates=state.furniture.filter(f=>['coffeetable','table','bed'].includes(f.type)&&pointInRoom([f.cx,f.cy],room.poly));
  const anchors=candidates.length?candidates.filter(f=>!interiorLayer(state).objects.some(o=>o.type==='pendant'&&o.room_id===room.id&&Math.hypot(o.cx-f.cx,o.cy-f.cy)<600)).map(f=>[f.cx,f.cy]):[room.at];
  for(const [x,z] of anchors){
    let alongX=true,L=1.65;
    if(!pointInRoom([x-L*500,z],room.poly)||!pointInRoom([x+L*500,z],room.poly))alongX=false;
    if(!pointInRoom([x,z-L*500],room.poly)||!pointInRoom([x,z+L*500],room.poly)){if(!alongX)L=.70;}
    const g=new THREE.Group(),metal=mat('#272c32',{metalness:.6,roughness:.4});
    g.add(box(alongX?L:.026,.026,alongX?.026:L,metal,0,H-.035,0));
    for(const q of [-.30,0,.30]){
      const px=alongX?q*L:0,pz=alongX?0:q*L;
      g.add(cyl(.034,.038,.115,metal,px,H-.155,pz,24));
      const em=mat('#fff4dc',{emissive:'#ffd5a0',emissiveIntensity:.18});em.userData.sceneEmitter=true;
      g.add(cyl(.030,.030,.004,em,px,H-.158,pz,20));
      const light=studioSpot(options,5.0,wx(x)+px,H-.18,wz(z)+pz,room.id,q===0);light.userData.fixtureType='track-spot';
    }
    batchSceneMeshes(g);g.position.set(wx(x),0,wz(z));studioFeature(g,'track',room.id);
  }
}
function studioRoomDownlights(room,options){
  const [x,z]=room.at;
  for(const [dx,dz] of [[-450,-450],[450,-450],[-450,450],[450,450]]){
    if(!pointInRoom([x+dx,z+dz],room.poly))continue;
    const em=mat('#fff3dd',{emissive:'#ffe0b7',emissiveIntensity:.18});em.userData.sceneEmitter=true;
    const g=new THREE.Group();g.add(cyl(.055,.055,.008,mat('#faf7ee'),0,H-.012,0),cyl(.042,.042,.004,em,0,H-.017,0));g.position.set(wx(x+dx),0,wz(z+dz));studioFeature(g,'downlight',room.id);
    studioSpot(options,4.0,wx(x+dx),H-.06,wz(z+dz),room.id);
  }
}
function studioRoomLamps(room,options){
  const sofa=state.furniture.find(f=>['sofa','bed'].includes(f.type)&&pointInRoom([f.cx,f.cy],room.poly));
  const anchors=sofa?[[-sofa.w/2-500,0],[sofa.w/2+500,0],[0,sofa.d/2+500],[0,-sofa.d/2-500]].map(([x,z])=>{const a=sofa.rot*Math.PI/180;return [sofa.cx+x*Math.cos(a)-z*Math.sin(a),sofa.cy+x*Math.sin(a)+z*Math.cos(a)];}):[room.at];
  const flat=new Set(['rug','tv','acwall','aircon','stove','ksink','waterheater','baycushion']);let mount=null;
  for(const anchor of anchors){
    const m=nearestSolidMount(room.id,anchor,.44);if(!m)continue;
    const footprint={cx:MODEL.width_mm/2+(m.x+m.nx*.24)*1000,cy:MODEL.depth_mm/2+(m.z+m.nz*.24)*1000,w:440,d:440,rot:0};
    if(studioFit(footprint,MODEL)?.id===room.id&&!state.furniture.some(f=>!flat.has(f.type)&&studioOverlaps(footprint,f))){mount=m;break;}
  }
  const wallMount=mount||nearestSolidMount(room.id,room.at,.20);if(!wallMount)return;
  const g=new THREE.Group(),metal=mat('#6e6453',{metalness:.7,roughness:.4}),em=mat('#eee6d7',{emissive:'#ffd3a0',emissiveIntensity:.18,side:THREE.DoubleSide});em.userData.sceneEmitter=true;
  g.add(cyl(.13,.13,.03,metal),cyl(.012,.012,1.32,metal,0,.03,0),cyl(.14,.20,.25,em,0,1.25,0));
  if(mount){const x=mount.x+mount.nx*.24,z=mount.z+mount.nz*.24;g.position.set(x,0,z);batchSceneMeshes(g);studioFeature(g,'floor-lamp',room.id);
    studioLampFootprints.push({x,z,radius:.20,roomId:room.id});sceneLight(studioLightColour(options.temperature),2.2,x,1.34,z,room.id);}
  const wall=new THREE.Group();wall.add(box(.12,.18,.028,metal,0,-.09,0),blob(.075,.09,.08,em,0,0,.08));wall.position.set(wallMount.x,1.68,wallMount.z);wall.rotation.y=Math.atan2(wallMount.nx,wallMount.nz);studioFeature(wall,'wall-lamp',room.id);
  sceneLight(studioLightColour(options.temperature),1.0,wallMount.x+wallMount.nx*.13,1.68,wallMount.z+wallMount.nz*.13,room.id);
}
function buildStudioRoomScene(){
  studioLampFootprints=[];
  for(const room of ROOMS.filter(r=>!r.isTerrace)){
    const o=studioRoomOptions(state,room.id);
    if(o.hvac!=='none'){
      const tv=state.furniture.find(f=>f.type==='tv'&&pointInRoom([f.cx,f.cy],room.poly));
      const zs=room.poly.map(p=>p[1]),mount=nearestSolidMount(room.id,tv?[tv.cx,tv.cy]:[room.at[0]+600,Math.max(...zs)-240],o.hvac==='wall-split'?.86:1.18);
      if(mount){
        const g=new THREE.Group(),white=mat('#f3f4f1',{roughness:.35});
        if(o.hvac==='wall-split'){
          g.add(rbox(.86,.25,.18,white,0,-.125,.04,.03),box(.75,.024,.01,mat('#303b40'),0,-.085,.14),box(.05,.014,.008,mat('#779eae'),.30,.045,.139));g.position.y=H-.23;
        }else{
          g.add(box(1.18,.058,.015,white,0,-.029,0));for(const y of [-.015,.006])g.add(box(1.10,.008,.010,mat('#30363a'),0,y,.014));g.position.y=H-.095;
        }
        g.position.x=mount.x;g.position.z=mount.z;g.rotation.y=Math.atan2(mount.nx,mount.nz);g.userData.feasibility='TBD';studioFeature(g,o.hvac==='wall-split'?'wall-ac':'concealed-grille',room.id);
      }
    }
    if(o.ceiling!=='plain'){
      const g=new THREE.Group(),led=o.ceiling==='perimeter-led',m=led?mat('#fff2d3',{emissive:'#ffe0a3',emissiveIntensity:.18}):mat('#34383b');if(led)m.userData.sceneEmitter=true;
      for(let i=0;i<room.poly.length;i++){
        const a=room.poly[i],b=room.poly[(i+1)%room.poly.length],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz);if(L<250)continue;
        let nx=-dz/L,nz=dx/L;const mid=[(a[0]+b[0])/2,(a[1]+b[1])/2];if(!pointInRoom([mid[0]+nx*180,mid[1]+nz*180],room.poly)){nx=-nx;nz=-nz;}
        const start=[a[0]+nx*180+dx/L*200,a[1]+nz*180+dz/L*200],end=[b[0]+nx*180-dx/L*200,b[1]+nz*180-dz/L*200];
        if(!pointInRoom(start,room.poly)||!pointInRoom(end,room.poly)||L<450)continue;
        g.add(rod([wx(start[0]),H-.012,wz(start[1])],[wx(end[0]),H-.012,wz(end[1])],led?.007:.004,m,.004,8));
      }
      batchSceneMeshes(g);studioFeature(g,led?'perimeter-led':'gypsum-shadow-gap',room.id);
      if(led)sceneLight(studioLightColour(o.temperature),1.1,wx(room.at[0]),H-.10,wz(room.at[1]),room.id);
    }
    if(['track','track-lamps'].includes(o.lighting))studioRoomTrack(room,o);
    if(o.lighting==='downlights')studioRoomDownlights(room,o);
    if(['lamps','track-lamps'].includes(o.lighting))studioRoomLamps(room,o);
  }
}
