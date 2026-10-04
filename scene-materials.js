/* Reusable PBR microstructure; these maps describe material relief, not artwork. */
const sceneSurfaceCache=new Map(),sceneMicroMaps=new Map();
function batchSceneMeshes(g){
  // Keep one editable furniture group, but draw repeated weave/slats by material.
  const meshes=[];g.traverse(o=>{if(o.isMesh)meshes.push(o);});
  g.userData.renderBatch={before:meshes.length,after:meshes.length};
  if(meshes.length<2||meshes.some(o=>Array.isArray(o.material)))return;
  g.updateMatrixWorld(true);
  const inverse=g.matrixWorld.clone().invert(),batches=new Map();
  for(const o of meshes){
    const key=o.material.uuid+':'+o.castShadow+':'+o.receiveShadow;
    const relative=inverse.clone().multiply(o.matrixWorld);
    const part=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();
    part.applyMatrix4(relative);
    if(!batches.has(key))batches.set(key,{material:o.material,cast:o.castShadow,receive:o.receiveShadow,parts:[],count:0});
    const b=batches.get(key);b.parts.push(part);b.count+=part.attributes.position.count;
  }
  g.clear();
  for(const b of batches.values()){
    const geometry=new THREE.BufferGeometry();
    for(const [name,size] of [['position',3],['normal',3],['uv',2]]){
      const data=new Float32Array(b.count*size);let offset=0;
      for(const part of b.parts){
        const attr=part.getAttribute(name);
        if(attr)data.set(attr.array,offset);
        offset+=part.attributes.position.count*size;
      }
      geometry.setAttribute(name,new THREE.BufferAttribute(data,size));
    }
    const mesh=new THREE.Mesh(geometry,b.material);mesh.castShadow=b.cast;mesh.receiveShadow=b.receive;g.add(mesh);
    b.parts.forEach(p=>p.dispose());
  }
  meshes.forEach(o=>o.geometry.dispose());
  g.userData.renderBatch={before:meshes.length,after:g.children.length};
}
function microMap(kind){
  if(sceneMicroMaps.has(kind))return sceneMicroMaps.get(kind);
  const cv=document.createElement('canvas');cv.width=cv.height=256;
  const ctx=cv.getContext('2d'),R=rng(kind.length*829),im=ctx.createImageData(256,256);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
    const n=R(),cloth=kind==='linen'||kind==='wool';
    let v=cloth?212+25*Math.sin(x*Math.PI/3)*Math.sin(y*Math.PI/3)+(n-.5)*25:
      kind==='wood'?221+19*Math.sin(y*.22+Math.sin(x*.035)*1.7)+(n-.5)*10:233+(n-.5)*30;
    if(kind==='wool')v=204+40*n;
    const k=(y*256+x)*4;im.data[k]=im.data[k+1]=im.data[k+2]=Math.max(0,Math.min(255,v));im.data[k+3]=255;
  }
  ctx.putImageData(im,0,0);
  const t=new THREE.CanvasTexture(cv);t.wrapS=t.wrapT=THREE.RepeatWrapping;
  t.repeat.set(kind==='wood'?1:6,kind==='wood'?3:6);t.colorSpace=THREE.SRGBColorSpace;
  if(renderer)t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());
  sceneMicroMaps.set(kind,t);return t;
}
function sceneSurface(kind,color){
  const key=kind+':'+color;
  if(sceneSurfaceCache.has(key))return sceneSurfaceCache.get(key);
  const m=new THREE.MeshPhysicalMaterial({color,map:microMap(kind),bumpMap:microMap(kind),
    bumpScale:kind==='wood'?.003:kind==='stone'?.0015:.008,
    roughness:kind==='wood'?.58:kind==='stone'?.48:.92,
    clearcoat:kind==='wood'?.12:kind==='stone'?.15:0,clearcoatRoughness:.65,
    envMap:envTex,envMapIntensity:.35*envK,sheen:kind==='linen'?.3:0,sheenColor:new THREE.Color('#e8e2d5')});
  m.userData.surfaceKind=kind;sceneSurfaceCache.set(key,m);return m;
}
function ellipseTop(g,w,d,height,material,y=0,x=0,z=0){
  const o=cyl(1,1,height,material,x,y,z,64);o.scale.x=w/2;o.scale.z=d/2;g.add(o);return o;
}
function canePanel(g,w,h,x,y,z,color){
  const m=woodM(color);
  // A narrow frame and open weave let light pass through the furniture.
  g.add(box(w,.025,.025,m,x,y,z),box(w,.025,.025,m,x,y+h-.025,z),
    box(.025,h,.025,m,x-w/2+.0125,y,z),box(.025,h,.025,m,x+w/2-.0125,y,z));
  const innerW=w-.045,innerH=h-.045;
  for(let q=-innerW/2;q<=innerW/2;q+=.036)g.add(rod([x+q,y+.024,z],[x+q,y+h-.024,z],.0038,m,.0038,5));
  for(let q=.024;q<h-.024;q+=.036)g.add(rod([x-innerW/2,y+q,z+.004],[x+innerW/2,y+q,z+.004],.0035,m,.0035,5));
}
function caneDrum(g,w,d,h,y,color){
  const m=woodM(color),rx=w/2-.015,rz=d/2-.015;
  for(let k=0;k<36;k++){
    const a=k*Math.PI/18,x=Math.cos(a)*rx,z=Math.sin(a)*rz;
    g.add(rod([x,y,z],[x,y+h,z],.008,m,.006,6));
  }
  for(let j=0;j<6;j++){
    const pts=[];for(let k=0;k<=48;k++){const a=k*Math.PI/24;pts.push([Math.cos(a)*rx,y+j*h/5,Math.sin(a)*rz]);}
    g.add(tube(pts,.007,m,64));
  }
}
function cushion(g,w,h,d,c,x,y,z,tilt=0){
  const o=rbox(w,h,d,fabric(c),x,y,z,Math.min(.065,h*.4));o.rotation.x=tilt;g.add(o);return o;
}
function tabletopObjects(g,w,d,y,theme){
  const pos=w*.24;
  g.add(rbox(Math.min(.30,w*.32),.025,Math.min(.20,d*.42),woodM(theme.woodDark),-pos,y,0,.008));
  g.add(cyl(.039,.039,.09,ceramic(),-pos,y+.025,0,20));
  if(w>.6)vase(g,pos,y,0,.045,.15,theme.pot,rng(Math.round(w*101)),theme.id!=='japandi');
}
