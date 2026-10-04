/* Mounted decor and fixtures are exploratory, downstream of canonical surfaces. */
const sceneArtTextures=new Map();
function sceneArtTexture(id){
  if(sceneArtTextures.has(id))return sceneArtTextures.get(id);
  const path='./art/'+id+'.png',t=new THREE.TextureLoader().load(path);
  t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  t.userData.assetPath=path;sceneArtTextures.set(id,t);return t;
}
function nearestSolidMount(rid,point,width){
  const room=ROOMS.find(r=>r.id===rid);if(!room)return null;
  let best=null;
  for(const wall of WALL_SEGMENTS.filter(s=>s.rooms.includes(rid)&&s.kind!=='low')){
    const [ax,az]=wall.from,[bx,bz]=wall.to,dx=bx-ax,dz=bz-az,L=Math.hypot(dx,dz),margin=width*500+110;
    if(L<margin*2)continue;
    let along=((point[0]-ax)*dx+(point[1]-az)*dz)/L;along=Math.max(margin,Math.min(L-margin,along));
    const px=ax+dx/L*along,pz=az+dz/L*along;
    let nx=-dz/L,nz=dx/L,offset=wall.thickness_mm/2+40;
    if(!pointInRoom([px+nx*(offset+50),pz+nz*(offset+50)],room.poly)){nx=-nx;nz=-nz;}
    const centre=[px+nx*offset,pz+nz*offset];
    if(!pointInRoom(centre,room.poly))continue;
    const distance=Math.hypot(px-point[0],pz-point[1]);
    if(!best||distance<best.distance)best={x:wx(centre[0]),z:wz(centre[1]),nx,nz,wall,rid,distance,centre};
  }
  return best;
}
function framedArtwork(mount,theme,width=.72,centreY=1.64){
  const g=new THREE.Group(),h=width*1.5,frame=.024,depth=.025;
  const m=woodM(theme.id==='warm'?theme.metal:theme.woodDark);
  g.add(box(width+frame*2,h+frame*2,.025,m,0,-h/2-frame,0));
  const canvas=new THREE.Mesh(new THREE.PlaneGeometry(width,h),new THREE.MeshStandardMaterial({map:sceneArtTexture(theme.id),roughness:.94}));
  canvas.position.z=depth/2+.003;g.add(canvas);
  g.position.set(mount.x,centreY,mount.z);g.rotation.y=Math.atan2(mount.nx,mount.nz);
  g.userData.sceneFeature='artwork';g.userData.roomId=mount.rid;g.userData.mount=mount.centre;g.userData.wallSource=mount.wall.source_px;
  g.visible=opt.cut>=H;sceneDecorG.add(g);
}
function curtainPanel(w,h,color,sheer=false){
  const geo=new THREE.PlaneGeometry(w,h,32,12),pos=geo.attributes.position;
  for(let i=0;i<pos.count;i++){
    const x=pos.getX(i),y=pos.getY(i),fold=.032*Math.cos((x/w+.5)*Math.PI*14);
    pos.setZ(i,fold*(.65+.35*(.5-y/h)));
  }
  geo.computeVertexNormals();
  const material=new THREE.MeshPhysicalMaterial({color,map:microMap('linen'),bumpMap:microMap('linen'),bumpScale:.005,
    roughness:1,side:THREE.DoubleSide,transparent:sheer,opacity:sheer?.52:1,depthWrite:!sheer,sheen:.35});
  const o=new THREE.Mesh(geo,material);o.castShadow=!sheer;o.receiveShadow=true;return o;
}
function openingCurtains(o,theme){
  const rid=o.between.find(id=>ROOMS.some(r=>r.id===id&&!r.isTerrace));
  const room=ROOMS.find(r=>r.id===rid);if(!room||!['bedroom','reception'].includes(room.kind))return;
  const [a,b]=[o.from,o.to],dx=b[0]-a[0],dz=b[1]-a[1],L=Math.hypot(dx,dz),mx=(a[0]+b[0])/2,mz=(a[1]+b[1])/2;
  let nx=-dz/L,nz=dx/L;
  if(!pointInRoom([mx+nx*250,mz+nz*250],room.poly)){nx=-nx;nz=-nz;}
  const g=new THREE.Group(),span=L/1000+.16,height=H-.12,pw=Math.min(.48,span*.21);
  g.rotation.y=Math.atan2(nx,nz);g.position.set(wx(mx+nx*155),H/2,wz(mz+nz*155));
  const rail=box(span+.06,.020,.020,mat(theme.metal,{metalness:.65,roughness:.4}),0,H/2-.07,0);g.add(rail);
  for(const sign of [-1,1]){
    const panel=curtainPanel(pw,height,theme.id==='warm'?'#cec3af':theme.id==='japandi'?'#d9d5c9':'#d6bc90');
    panel.position.x=sign*(span/2-pw/2);g.add(panel);
    const sheer=curtainPanel(pw*.7,height,'#f7f2e8',true);sheer.position.set(sign*(span/2-pw*.85),0,-.045);g.add(sheer);
  }
  g.userData.sceneFeature='curtains';g.userData.openingId=o.id;g.userData.roomId=rid;g.visible=opt.cut>=H;sceneDecorG.add(g);
}
function sceneLight(color,power,x,y,z,roomId){
  const p=new THREE.PointLight(color,power,8,2);p.position.set(x,y,z);p.userData.sceneLight=true;p.userData.basePower=power;p.userData.roomId=roomId;
  sceneDecorG.add(p);return p;
}
function pendantAt(x,z,theme,rid,dining=false){
  const g=new THREE.Group(),m=mat(theme.metal,{metalness:.7,roughness:.4}),lightColor=theme.id==='warm'?'#ffe3bd':theme.id==='japandi'?'#ffe1ae':'#ffdaa1';
  const luminous=mat('#f6eddb',{roughness:.8,emissive:lightColor,emissiveIntensity:.42,side:THREE.DoubleSide});
  luminous.userData.sceneEmitter=true;
  g.add(cyl(.05,.05,.025,m,0,H-.025,0));
  const y=dining?H-.50:H-.29;
  g.add(cyl(.004,.004,H-y-.015,m,0,y,0,8));
  if(theme.id==='warm'){
    if(dining){
      g.add(box(1.08,.025,.025,m,0,y+.07,0));
      for(const q of [-.36,0,.36])g.add(blob(.10,.10,.10,luminous,q,y,0,24));
    }else{
      g.add(ring(.26,.013,m,0,y,0));g.add(cyl(.235,.235,.023,luminous,0,y-.012,0,48));
    }
  }else if(theme.id==='japandi'){
    const radius=dining?.26:.21;
    g.add(blob(radius,.20,radius,luminous,0,y,0,32));
    for(let q=-.16;q<=.16;q+=.04){const r=radius*Math.sqrt(Math.max(.05,1-q*q/.04));g.add(ring(r,.003,woodM(theme.wood),0,y+q,0));}
  }else{
    const radius=dining?.30:.24,wm=woodM(theme.wood);
    for(let k=0;k<28;k++){
      const a=k*Math.PI/14,pts=[];
      for(let q=0;q<=12;q++){const tt=q/12,r=radius*(.28+.72*tt);pts.push([Math.cos(a)*r,y+.12-.25*tt,Math.sin(a)*r]);}
      g.add(tube(pts,.006,wm,24));
    }
    for(let q=0;q<=5;q++)g.add(ring(radius*(.28+.72*q/5),.006,wm,0,y+.12-.25*q/5,0));
    g.add(blob(.045,.055,.045,luminous,0,y-.04,0,20));
  }
  batchSceneMeshes(g);
  g.position.set(x,0,z);g.userData.sceneFeature='pendant';g.userData.roomId=rid;g.userData.fixtureType=theme.id+'-pendant';g.visible=opt.cut>=H;sceneDecorG.add(g);
  const light=sceneLight(lightColor,dining?2.5:1.7,x,y-.24,z,rid);
  if(rid==='RECP-01'&&!dining){light.castShadow=true;light.shadow.mapSize.setScalar(COARSE?512:1024);light.shadow.bias=-.0007;light.shadow.normalBias=.018;}
}
function buildSceneDecor(){
  clearGroup(sceneDecorG);const theme=currentDecor();if(theme.id==='custom'||!state.furniture.length)return;
  MODEL.openings.filter(o=>o.id.startsWith('GLZ-')).forEach(o=>openingCurtains(o,theme));
  const sofa=state.furniture.find(f=>['sofa','cornersofa'].includes(f.type)&&pointInRoom([f.cx,f.cy],ROOMS.find(r=>r.id==='RECP-01').poly));
  const dining=state.furniture.find(f=>f.type==='table'&&pointInRoom([f.cx,f.cy],ROOMS.find(r=>r.id==='RECP-01').poly));
  const artItems=[...(sofa?[{rid:'RECP-01',f:sofa,w:.72,y:1.64}]:[]),...(dining?[{rid:'RECP-01',f:dining,w:.8,y:1.65}]:[])];
  for(const r of ROOMS.filter(r=>r.kind==='bedroom')){
    const bed=state.furniture.find(f=>f.type==='bed'&&pointInRoom([f.cx,f.cy],r.poly));
    if(bed)artItems.push({rid:r.id,f:bed,w:.55,y:1.76});
  }
  for(const {rid,f,w,y} of artItems){const mount=nearestSolidMount(rid,[f.cx,f.cy],w);if(mount)framedArtwork(mount,theme,w,y);}
  const coffee=state.furniture.find(f=>f.type==='coffeetable'&&pointInRoom([f.cx,f.cy],ROOMS.find(r=>r.id==='RECP-01').poly));
  if(coffee)pendantAt(wx(coffee.cx),wz(coffee.cy),theme,'RECP-01');
  if(dining)pendantAt(wx(dining.cx),wz(dining.cy),theme,'RECP-01',true);
  for(const r of ROOMS.filter(r=>r.kind==='bedroom')){
    const bed=state.furniture.find(f=>f.type==='bed'&&pointInRoom([f.cx,f.cy],r.poly));
    if(bed)pendantAt(wx(bed.cx),wz(bed.cy),theme,r.id);
  }
  // Low, removable surface details; wall envelopes and ceiling planes stay fixed.
  for(const s of WALL_SEGMENTS.filter(s=>s.kind!=='low')){
    const rid=s.rooms.find(id=>ROOMS.some(r=>r.id===id&&!r.isTerrace));if(!rid)continue;
    const L=Math.hypot(s.to[0]-s.from[0],s.to[1]-s.from[1])/1000;if(L<.25)continue;
    const mount=nearestSolidMount(rid,[(s.from[0]+s.to[0])/2,(s.from[1]+s.to[1])/2],Math.max(.03,L-.22));
    if(!mount)continue;
    const skirting=box(Math.max(.03,L-.02),.055,.012,woodM(theme.woodDark));
    skirting.position.set(mount.x,.004,mount.z);skirting.rotation.y=Math.atan2(mount.nx,mount.nz);
    skirting.userData.sceneFeature='skirting';sceneDecorG.add(skirting);
  }
  applySceneLighting();
}
function applySceneLighting(){
  if(!sceneDecorG)return;
  sceneSurfaceCache.forEach(m=>{m.envMapIntensity=.35*(opt.night?.15:1);});
  sceneDecorG.traverse(o=>{
    if(o.userData.sceneLight)o.intensity=o.userData.basePower*(opt.night?1:.20);
    for(const m of Array.isArray(o.material)?o.material:[o.material]){
      if(m?.userData.sceneEmitter)m.emissiveIntensity=opt.night?.75:.18;
    }
  });
}
const INTERIOR_POSES={
  living:{room:'RECP-01',p:[11400,1.62,4570],t:[10600,1.12,1600]},
  dining:{room:'RECP-01',p:[13250,1.62,9440],t:[14300,1.10,7400]},
  master:{room:'MBR-01',p:[3400,1.62,8380],t:[1400,1.02,6320]},
  bedroom1:{room:'BR-01',p:[4700,1.62,4650],t:[2830,1.02,2670]},
  bedroom2:{room:'BR-02',p:[6100,1.62,4700],t:[8100,1.02,2700]}
};
function interiorPose(id='living'){
  const v=INTERIOR_POSES[id];if(!v)throw new Error('Unknown interior view.');
  return pose(new THREE.Vector3(wx(v.t[0]),v.t[1],wz(v.t[2])),new THREE.Vector3(wx(v.p[0]),v.p[1],wz(v.p[2])));
}
function showInterior(id='living',smooth=true){
  if(!INTERIOR_POSES[id])throw new Error('Unknown interior view.');
  if(opt.mode==='walk'){walkCtl.unlock();stopTouchWalk();}
  opt.mode='orbit';orbit.enabled=true;syncModeBtns();fly=null;
  $('#walkOverlay').style.display='none';$('#cross').style.display='none';
  opt.cut=H;syncCutBtns();sync(true);showLabels(false);window.select(null);
  const p=interiorPose(id);smooth?flyTo(p):setPose(p);
  $('#interiorView').value=id;syncHint3d();
}
