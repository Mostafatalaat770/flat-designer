/* Render the reversible overlay in the furniture group, using canonical host IDs. */
const interiorPbrCache=new Map(),interiorPendingTextures=new Set();
function interiorPbr(id,colour='#ddd5c8',scale={width:1000,height:1000},surface=false,appearance='default'){
  const descriptor=interiorMaterial(state,id);if(!descriptor)return mat(colour,{roughness:.8});
  const key=JSON.stringify([descriptor,colour,scale,surface,appearance]);if(interiorPbrCache.has(key))return interiorPbrCache.get(key);
  let m;
  if(surface&&descriptor.fallback_generic_id)m=floorMat(descriptor.fallback_generic_id).clone();
  else if(['wood','fabric','stone'].includes(descriptor.category))m=sceneSurface(descriptor.category==='fabric'?'linen':descriptor.category,descriptor.base_colour).clone();
  else m=new THREE.MeshStandardMaterial({color:descriptor.base_colour,roughness:.8});
  m.roughness=descriptor.roughness??.8;m.metalness=descriptor.metallic??0;m.side=THREE.DoubleSide;m.userData={interiorMaterialId:id,sourceStatus:descriptor.source_status};
  if(appearance==='ceiling'&&m.isMeshStandardMaterial){m.emissive=new THREE.Color(descriptor.base_colour);m.emissiveIntensity=.20;m.userData.ceilingColourCompensation=true;}
  if(descriptor.category==='glass'){m.transparent=true;m.opacity=.45;m.depthWrite=false;}
  const tile=descriptor.texture_scale_mm||descriptor.physical_dimensions_mm||{width:1000,height:1000},repeat=[scale.width/(tile.width||1000),scale.height/(tile.height||tile.width||1000)];
  const configure=t=>{t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...repeat);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());};
  for(const slot of ['map','bumpMap'])if(m[slot]){m[slot]=m[slot].clone();configure(m[slot]);m[slot].needsUpdate=true;}
  for(const [field,slot] of [['albedo_texture','map'],['normal_map','normalMap'],['roughness_map','roughnessMap']])if(descriptor[field]){
    let done;const pending=new Promise(resolve=>done=resolve);interiorPendingTextures.add(pending);
    const loader=new THREE.TextureLoader();loader.setCrossOrigin?.('anonymous');
    loader.load(descriptor[field],t=>{configure(t);if(slot==='map'){t.colorSpace=THREE.SRGBColorSpace;m.color.set('#ffffff');}m[slot]=t;m.needsUpdate=true;done();interiorPendingTextures.delete(pending);},undefined,()=>{m.userData.textureFallback=true;done();interiorPendingTextures.delete(pending);});
  }
  interiorPbrCache.set(key,m);return m;
}
function interiorSurfaceMaterial(id,fallback,kind){
  const material=state.interior?.surface_materials[id];if(!material)return fallback;
  // Ceiling faces point downward, so the viewer's warm lower hemisphere otherwise tints even a near-white finish brown.
  // Use a separate cached material rather than cloning: async texture callbacks must update the exact material on the mesh.
  return interiorPbr(material,'#ffffff',{width:1000,height:1000},true,kind==='ceiling'?'ceiling':'surface');
}
function interiorWallMaterials(segment,fallback,height){
  const refs=interiorSurfaces(MODEL).surfaces.filter(s=>s.type==='wall'&&s.source_wall_index===WALL_SEGMENTS.indexOf(segment)),out=[...fallback],dx=segment.to[0]-segment.from[0],dy=segment.to[1]-segment.from[1],L=Math.hypot(dx,dy);
  for(const ref of refs){const id=state.interior?.surface_materials[ref.id];if(!id)continue;const sign=(-dy/L*ref.inward_normal[0]+dx/L*ref.inward_normal[1]);out[sign>0?4:5]=interiorPbr(id,'#ffffff',{width:L,height:height*1000});}
  return out;
}
function interiorMesh(o){
  const r=interiorResolved(o,MODEL),w=M(o.width_mm),d=M(o.depth_mm),h=M(o.height_mm),g=new THREE.Group(),primary=interiorPbr(o.material_references.primary,o.colour,{width:o.width_mm,height:o.height_mm}),accent=interiorPbr(o.material_references.accent||'generic-brass',o.colour),white=mat('#f4f0e5',{roughness:.85});
  const B=(ww,hh,dd,m=primary,x=0,y=0,z=0)=>g.add(box(Math.max(.003,ww),Math.max(.003,hh),Math.max(.003,dd),m,x,y,z));
  if(o.type==='divider'){
    const frame=Math.min(.03,w*.08,d*.25);B(w,frame,d,primary,0,0);B(w,frame,d,primary,0,h-frame);
    if(o.variant==='vertical-slats'){const N=Math.max(3,Math.round(w/.085));for(let i=0;i<N;i++)B(Math.min(.032,w/N*.5),h-2*frame,d,primary,-w/2+(i+.5)*w/N,frame);}
    else if(o.variant==='fluted-glass'){
      B(frame,h,d,primary,-w/2+frame/2);B(frame,h,d,primary,w/2-frame/2);const glass=interiorPbr(o.material_references.glass||'generic-glass');B(w-2*frame,h-2*frame,Math.min(d,.015),glass,0,frame);
      for(let x=-w/2+frame;x<w/2-frame;x+=.022)B(.004,h-2*frame,.012,glass,x,frame,.009);
    }else if(['open-shelf','storage-screen'].includes(o.variant)){
      B(frame,h,d,primary,-w/2+frame/2);B(frame,h,d,primary,w/2-frame/2);for(let y=.35;y<h-frame;y+=.38)B(w,frame,d,primary,0,y);B(frame,h,d,primary);
      if(o.variant==='storage-screen'){B(w-2*frame,Math.min(.68,h*.4),d,primary,0,frame);for(const x of [-w*.22,w*.22])B(.08,.012,.008,accent,x,.48,d/2+.004);}
    }else B(w,h,d,primary);
  }else if(['console','sideboard','media-unit','shelf'].includes(o.type)){
    const t=Math.min(.03,w/10,d/5,h/8),open=o.type==='shelf';
    if(open){B(w,t,d);B(w,t,d,primary,0,h-t);B(t,h,d,primary,-w/2+t/2);B(t,h,d,primary,w/2-t/2);for(let y=.30;y<h-t;y+=.32)B(w,t,d,primary,0,y);}
    else {const legs=o.placement.mode==='floor'?Math.min(.12,h*.2):0;B(w,h-legs,d,primary,0,legs);for(const x of [-w*.44,w*.44])for(const z of [-d*.38,d*.38])B(.025,legs,.025,accent,x,0,z);for(let x=-w/2+w/3;x<w/2;x+=w/3)B(.004,h-legs-.02,.005,accent,x,legs+.01,d/2);for(const x of [-w*.25,w*.25])B(.055,.008,.009,accent,x,h*.72,d/2+.002);}
  }else if(o.type==='bench'){
    const top=Math.min(.12,h*.28);B(w,top,d,o.variant==='upholstered'?interiorPbr(o.material_references.fabric||'generic-linen'):primary,0,h-top);for(const x of [-w*.42,w*.42])for(const z of [-d*.34,d*.34])B(.04,h-top,.04,primary,x,0,z);
  }else if(o.type==='wall-panel'){
    B(w,h,d,primary);if(o.variant==='fluted')for(let x=-w/2+.018;x<w/2;x+=.035)B(.012,h,.009,primary,x,0,d/2-.005);
  }else if(o.type==='artwork'){
    const frame=Math.min(.028,w*.05,h*.05);B(w,h,d,accent);const art=interiorPbr(o.material_references.artwork||o.material_references.primary||'reference-art-warm',o.colour,{width:1000,height:1000});
    const face=new THREE.Mesh(new THREE.PlaneGeometry(w-2*frame,h-2*frame),art);face.position.set(0,h/2,d/2+.001);g.add(face);
  }else if(o.type==='mirror'){
    const mirror=new THREE.MeshStandardMaterial({color:'#b9c8ce',metalness:.98,roughness:.07,envMap:envTex,envMapIntensity:1});
    if(o.variant==='round'){g.add(blob(w/2,h/2,d/2,accent,0,h/2,0));g.add(blob(w*.47,h*.47,.002,mirror,0,h/2,d/2));}else {B(w,h,d,accent);B(w-.04,h-.04,.003,mirror,0,.02,d/2);}
  }else if(o.type==='curtain'){
    B(w,.016,.018,accent,0,h-.016);const open=o.metadata.openness??.7,pw=Math.max(w*.08,w/2*(1-open)),curtainMaterial=primary;
    for(const side of [-1,1]){const panel=curtainPanel(pw,h-.03,o.colour,o.variant==='sheer');panel.material=curtainMaterial.clone();if(o.variant==='sheer'){panel.material.transparent=true;panel.material.opacity=.5;panel.material.depthWrite=false;}panel.position.set(side*(w/2-pw/2),h/2-.015,0);g.add(panel);}
    if(o.variant==='layered'){const sheer=curtainPanel(w,h-.03,'#f8f4eb',true);sheer.position.set(0,h/2-.015,-Math.min(.035,d*.25));g.add(sheer);}
  }else if(['pendant','floor-lamp','table-lamp'].includes(o.type)){
    const radius=Math.min(w,d)/2,emit=new THREE.MeshStandardMaterial({color:'#fff1ce',emissive:studioLightColour(studioRoomOptions(state,o.room_id).temperature),emissiveIntensity:.2,roughness:.55});emit.userData.interiorEmitter=true;
    if(o.type==='pendant'){
      B(.012,Math.max(.03,h*.55),.012,accent,0,h*.45);
      if(o.variant==='linear')B(w,Math.min(.10,h*.45),d,emit);else g.add(blob(w/2,Math.min(h*.22,w/2),d/2,emit,0,Math.min(h*.22,w/2),0));
    }else {
      g.add(cyl(radius*.80,radius*.80,.025,accent));B(.016,h*.7,.016,accent,0,.025);
      if(o.variant==='globe')g.add(blob(w/2,h*.22,d/2,emit,0,h*.78,0));
      else {const shade=new THREE.Mesh(new THREE.CylinderGeometry(radius*.65,radius,h*.28,32,1,true),primary);shade.position.y=h*.85;shade.material=primary.clone();shade.material.side=THREE.DoubleSide;g.add(shade);g.add(blob(radius*.20,h*.10,radius*.20,emit,0,h*.81,0));}
      if(o.variant==='arc')g.add(rod([0,h*.66,0],[w*.26,h*.85,0],.008,accent));
    }
    const light=new THREE.PointLight(studioLightColour(studioRoomOptions(state,o.room_id).temperature),0,6,2);light.position.y=o.type==='pendant'?h*.20:h*.78;light.userData.interiorLight=true;light.userData.roomId=o.room_id;light.userData.basePower=o.type==='pendant'?1.3:.85;g.add(light);
  }else if(o.type==='plant'){
    const radius=Math.min(w,d)*.27,potH=Math.min(.30,h*.28);g.add(cyl(radius,radius*.8,potH,primary));B(.012,h*.8,.012,mat('#597346'),0,potH*.6);
    const leaf=mat('#557844',{roughness:.9});for(let i=0;i<12;i++){const a=i*2.399,y=potH+(h-potH)*(.15+.7*i/12),rr=Math.min(w,d)*.24;const mesh=blob(Math.min(w,d)*.13,.055,Math.min(w,d)*.085,leaf,Math.cos(a)*rr,y,Math.sin(a)*rr);mesh.rotation.z=Math.sin(a)*.4;g.add(mesh);}
  }
  g.position.set(wx(r.cx),M(r.bottom_mm),wz(r.cy));g.rotation.y=-r.rot*Math.PI/180;g.userData.interiorObjectId=o.id;g.userData.roomId=o.room_id;g.userData.placementMode=o.placement.mode;g.userData.approximate=true;g.name=o.type+' · '+o.variant;
  g.visible=o.placement.mode==='floor'||opt.cut>=H;g.traverse(n=>{n.userData.interiorObjectId=o.id;});return g;
}
function buildInteriorObjects(){
  for(const o of interiorLayer(state).objects)furnG.add(interiorMesh(o));
  for(const [id,t] of Object.entries(interiorLayer(state).opening_treatments)){
    if(t.type==='none')continue;const host=interiorSurfaces(MODEL).surfaces.find(s=>s.id===id),o={id:'treatment-'+id,type:'curtain',variant:t.type==='blind'?'drapery':t.variant,room_id:t.room_id,placement:{mode:'opening',host_opening_id:id,elevation_mm:0},rotation:0,width_mm:host.length_mm,depth_mm:100,height_mm:2450,material_references:{primary:t.material_id},colour:t.colour,status:'EXPLORATORY',metadata:{openness:t.openness}};
    const mesh=interiorMesh(o);mesh.userData.openingTreatmentId=id;
    if(t.type==='blind'){mesh.clear();const h=2.45*(1-t.openness);if(h>.005)mesh.add(box(M(host.length_mm),h,.025,interiorPbr(t.material_id,t.colour),0,2.45-h,0));mesh.add(box(M(host.length_mm),.04,.045,mat('#e3ded4'),0,2.45-.04,0));}
    furnG.add(mesh);
  }
  interiorApplyLight();
}
function interiorApplyLight(){if(!furnG)return;furnG.traverse(o=>{const rid=o.userData.roomId||o.parent?.userData.roomId,options=studioRoomOptions(state,rid);if(o.userData.interiorLight){o.color.set(studioLightColour(options.temperature));o.intensity=o.userData.basePower*(options.brightness/75)*(opt.night?1:.2);}if(o.material?.userData.interiorEmitter){o.material.emissive.set(studioLightColour(options.temperature));o.material.emissiveIntensity=(opt.night?.9:.2)*options.brightness/75;}});}
function currentInteriorRoom(){
  if(!camera||!orbit)return null;const p=opt.mode==='walk'?camera.position:orbit.target;return ROOMS.find(r=>!r.isTerrace&&pointInRoom([p.x*1000+OX,p.z*1000+OY],r.poly))?.id||null;
}
async function captureAiView(roomId){
  if(!active||!renderer||!ROOMS.some(r=>r.id===roomId&&!r.isTerrace))throw new Error('Open a 3D room view before saving the camera.');
  while(anim)await wait(50);sync(true);grow=furnGrow=1;applyGrow();
  if(currentInteriorRoom()&&currentInteriorRoom()!==roomId)throw new Error('The camera is currently in or aimed at another room. Use that room for this render reference.');
  if(!opt.furn)throw new Error('Show furnishings before saving an AI render reference.');
  if(opt.cut<H)throw new Error('Choose the full 2.50 m wall view before saving an AI room render.');
  await waitApartmentSceneAssets();
  if(interiorPendingTextures.size){let timer;try{await Promise.race([Promise.all([...interiorPendingTextures]),new Promise((_,reject)=>timer=setTimeout(()=>reject(new Error('Material images are still loading. Try saving the view again.')),10000))]);}finally{clearTimeout(timer);}}
  if(currentInteriorRoom()&&currentInteriorRoom()!==roomId)throw new Error('The camera moved to another room while material images loaded. Save that room again.');
  const target=opt.mode==='walk'?camera.position.clone().add(camera.getWorldDirection(new THREE.Vector3()).multiplyScalar(3)):orbit.target.clone();
  const sceneRevision=studioSceneKey(state),timestamp=new Date().toISOString();
  scene.updateMatrixWorld(true);renderer.render(scene,camera);
  const original=renderer.domElement,canvas=document.createElement('canvas'),ratio=Math.min(1,1600/Math.max(original.width,original.height));canvas.width=Math.round(original.width*ratio);canvas.height=Math.round(original.height*ratio);
  try{canvas.getContext('2d').drawImage(original,0,0,canvas.width,canvas.height);}catch{throw new Error('A texture prevents PNG capture. Replace that external material image and retry.');}
  const cameraData={position:camera.position.toArray(),target:target.toArray(),fov:camera.fov,projection_type:camera.isOrthographicCamera?'orthographic':'perspective',coordinate_system:'Three.js metres: x=plan x minus half width; y=height; z=plan y minus half depth',aspect:camera.aspect,near:camera.near,far:camera.far,viewport:{width:canvas.width,height:canvas.height},viewer:{cut_height_m:opt.cut,furnishings_visible:opt.furn,night:opt.night,hour:opt.hour,mode:opt.mode,doors:doors.map(d=>({id:d.id,open:d.open,position:d.cur}))}};
  const png=await new Promise((resolve,reject)=>{try{canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG capture failed.')), 'image/png');}catch{reject(new Error('This material image does not allow screenshot export. Replace it and retry.'));}});
  return {png,camera:cameraData,room_id:roomId,scene_revision:sceneRevision,timestamp};
}
