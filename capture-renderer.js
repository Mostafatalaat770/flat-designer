/* Render-only architectural study overlay. Canonical geometry remains untouched. */
function applyApartmentArchitectureVariant(variant){
  if(!variant)return {wall_segments_hidden:0,wall_segments_added:0,wall_boxes_added:0,openings_hidden:0,opening_headers_hidden:0,door_overrides:0};
  if(variant.render_only!==true)throw new Error('Architecture variant must be explicitly render-only.');
  const samePoint=(a,b)=>Math.abs(a[0]-b[0])<0.6&&Math.abs(a[1]-b[1])<0.6;
  const sameSegment=(s,r)=>(samePoint(s.from,r.from)&&samePoint(s.to,r.to))||(samePoint(s.from,r.to)&&samePoint(s.to,r.from));
  const removals=Array.isArray(variant.remove_wall_segments)?variant.remove_wall_segments:[];
  let wallSegmentsHidden=0;
  archUp.traverse(o=>{
    const s=o.userData?.wallSegment;
    if(s&&removals.some(r=>sameSegment(s,r))){o.visible=false;wallSegmentsHidden++;}
  });

  let wallSegmentsAdded=0;
  for(const s of Array.isArray(variant.add_wall_segments)?variant.add_wall_segments:[]){
    const [x0,z0]=s.from,[x1,z1]=s.to,dx=M(x1-x0),dz=M(z1-z0),height=s.height_m??2.5,thickness=s.thickness_mm??180;
    const o=new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(dx,dz),height,M(thickness)),[wallMat,wallMat,capMat,wallMat,wallMat,wallMat]);
    o.position.set(wx((x0+x1)/2),height/2,wz((z0+z1)/2));o.rotation.y=-Math.atan2(dz,dx);o.castShadow=o.receiveShadow=true;
    o.userData.architectureStudyWall=s;archUp.add(o);wallSegmentsAdded++;
  }

  let wallBoxesAdded=0;
  for(const b of Array.isArray(variant.add_wall_boxes)?variant.add_wall_boxes:[]){
    const [x0,z0,x1,z1]=b.rect,bottom=b.bottom_m??0,top=b.top_m??2.5,h=Math.max(0,top-bottom);
    if(h<=0)continue;
    const o=new THREE.Mesh(new THREE.BoxGeometry(M(x1-x0),h,M(z1-z0)),[wallMat,wallMat,capMat,wallMat,wallMat,wallMat]);
    o.position.set(wx((x0+x1)/2),bottom+h/2,wz((z0+z1)/2));o.castShadow=o.receiveShadow=true;
    o.userData.architectureStudyWallBox=b;archUp.add(o);wallBoxesAdded++;
  }

  const hiddenIds=new Set(Array.isArray(variant.hide_openings)?variant.hide_openings:[]);
  let openingsHidden=0;
  for(const d of doors){
    if(!hiddenIds.has(d.id))continue;
    openingsHidden++;
    if(d.sliding)d.panels?.forEach(p=>p.visible=false);
    else if(d.pivot)d.pivot.visible=false;
  }
  let openingHeadersHidden=0;
  archUp.traverse(o=>{
    if(o.userData?.openingHeaderId&&hiddenIds.has(o.userData.openingHeaderId)){
      o.visible=false;openingHeadersHidden++;
    }
  });
  return {wall_segments_hidden:wallSegmentsHidden,wall_segments_added:wallSegmentsAdded,wall_boxes_added:wallBoxesAdded,openings_hidden:openingsHidden,opening_headers_hidden:openingHeadersHidden,door_overrides:0};
}
function applyApartmentDoorOverrides(variant,result){
  const overrides=Array.isArray(variant?.door_overrides)?variant.door_overrides:[];
  const ang=v=>Math.atan2(-v[1],v[0]);
  let count=0;
  for(const spec of overrides){
    const d=doors.find(x=>x.id===spec.id);
    if(!d||d.sliding)continue;
    if(Array.isArray(spec.open_vector)&&spec.open_vector.length===2){
      d.a1=ang(spec.open_vector);
      if(d.a1-d.a0>Math.PI)d.a1-=Math.PI*2;
      if(d.a0-d.a1>Math.PI)d.a1+=Math.PI*2;
    }
    if(typeof spec.force_open==='boolean')d.open=spec.force_open;
    d.cur=d.open?d.a1:d.a0;d.pivot.rotation.y=d.cur;count++;
  }
  if(result)result.door_overrides=count;
  return count;
}

/* This boot runs only in an isolated headless page made from the real viewer. */
async function bootApartmentAgentCapture(){
  const input=APARTMENT_CAPTURE_INPUT;
  try{
    if(studioSceneKey(state)!==input.scene_revision||MODEL.canonical_sha256!==input.canonical_sha256)throw new Error('Capture snapshot does not match its revision.');
    init();active=true;anim=fly=null;
    Object.assign(opt,input.camera.viewer);opt.cut=H;opt.furn=true;opt.labels=false;opt.mode='orbit';
    // No animation, camera fitting, background sync or local draft loading.
    sync(true);const architectureResult=applyApartmentArchitectureVariant(input.architecture_variant);grow=furnGrow=1;applyGrow();showLabels(false);orbit.enabled=false;
    renderer.setPixelRatio(1);renderer.setSize(input.camera.viewport.width,input.camera.viewport.height);
    camera.position.fromArray(input.camera.position);orbit.target.fromArray(input.camera.target);
    camera.fov=input.camera.fov;camera.aspect=input.camera.aspect;camera.near=input.camera.near;camera.far=input.camera.far;camera.updateProjectionMatrix();camera.lookAt(orbit.target);
    opt.night=input.camera.viewer.night;opt.hour=input.camera.viewer.hour;
    for(const d of doors){const recorded=input.camera.viewer.doors.find(v=>v.id===d.id);if(!recorded)throw new Error('Missing door state.');d.open=recorded.open;d.cur=recorded.position;if(d.sliding)positionSlide(d);else d.pivot.rotation.y=d.cur;}
    applyApartmentDoorOverrides(input.architecture_variant,architectureResult);
    applyLight();
    await waitApartmentSceneAssets(25000);
    if(document.fonts?.ready)await document.fonts.ready;
    if(studioSceneKey(state)!==input.scene_revision)throw new Error('The render snapshot changed while loading.');
    scene.updateMatrixWorld(true);
    if(renderer.compileAsync)await renderer.compileAsync(scene,camera);else renderer.compile(scene,camera);
    renderer.render(scene,camera);
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    // Freeze one exact frame. The provider screenshots this canvas after ready.
    camera.position.fromArray(input.camera.position);orbit.target.fromArray(input.camera.target);camera.lookAt(orbit.target);renderer.render(scene,camera);
    if(renderer.getContext().isContextLost())throw new Error('WebGL context lost during capture.');
    const result={schema:'ApartmentSceneCaptureFrame/1',canonical_sha256:MODEL.canonical_sha256,snapshot_sha256:input.snapshot_sha256,rendered_layout_json:JSON.stringify(state),scene_revision:input.scene_revision,storage_revision:input.storage_revision,room_id:input.room_id,camera:{...input.camera,position:camera.position.toArray(),target:orbit.target.toArray(),fov:camera.fov,aspect:camera.aspect,viewer:{...input.camera.viewer,doors:doors.map(d=>({id:d.id,open:d.open,position:d.cur}))}},timestamp:new Date().toISOString(),assets:{pending:apartmentSceneAssetsPending.size,fallbacks:[...apartmentSceneAssetsFailed]},renderer:{engine:'Three.js WebGL',revision:THREE.REVISION},architecture_variant:input.architecture_variant||null,architecture_result:architectureResult};
    const cv=renderer.domElement;cv.id='apartment-capture-canvas';
    // Drop large inline scripts/snapshot data from the provider's HTML result.
    document.querySelectorAll('script').forEach(s=>s.remove());
    const metadata=document.createElement('script');metadata.id='apartment-capture-result';metadata.type='application/json';metadata.textContent=JSON.stringify(result).replace(/</g,'\\u003c');document.body.appendChild(metadata);
    cv.dataset.captureReady=input.frame_id;
    window.__apartmentCaptureFrame=result;
  }catch(error){
    document.body.dataset.captureError=error.message;
    window.__apartmentCaptureError=error.message;
    // Never mark a failed/missing texture or renderer as ready for a screenshot.
  }
}
void bootApartmentAgentCapture();
