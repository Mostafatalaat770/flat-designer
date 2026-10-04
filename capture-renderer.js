/* This boot runs only in an isolated headless page made from the real viewer. */
async function bootApartmentAgentCapture(){
  const input=APARTMENT_CAPTURE_INPUT;
  try{
    if(studioSceneKey(state)!==input.scene_revision||MODEL.canonical_sha256!==input.canonical_sha256)throw new Error('Capture snapshot does not match its revision.');
    init();active=true;anim=fly=null;
    Object.assign(opt,input.camera.viewer);opt.cut=H;opt.furn=true;opt.labels=false;opt.mode='orbit';
    // No animation, camera fitting, background sync or local draft loading.
    sync(true);grow=furnGrow=1;applyGrow();showLabels(false);orbit.enabled=false;
    renderer.setPixelRatio(1);renderer.setSize(input.camera.viewport.width,input.camera.viewport.height);
    camera.position.fromArray(input.camera.position);orbit.target.fromArray(input.camera.target);
    camera.fov=input.camera.fov;camera.aspect=input.camera.aspect;camera.near=input.camera.near;camera.far=input.camera.far;camera.updateProjectionMatrix();camera.lookAt(orbit.target);
    opt.night=input.camera.viewer.night;opt.hour=input.camera.viewer.hour;
    for(const d of doors){const recorded=input.camera.viewer.doors.find(v=>v.id===d.id);if(!recorded)throw new Error('Missing door state.');d.open=recorded.open;d.cur=recorded.position;if(d.sliding)positionSlide(d);else d.pivot.rotation.y=d.cur;}
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
    const result={schema:'ApartmentSceneCaptureFrame/1',canonical_sha256:MODEL.canonical_sha256,snapshot_sha256:input.snapshot_sha256,rendered_layout_json:JSON.stringify(state),scene_revision:input.scene_revision,storage_revision:input.storage_revision,room_id:input.room_id,camera:{...input.camera,position:camera.position.toArray(),target:orbit.target.toArray(),fov:camera.fov,aspect:camera.aspect,viewer:{...input.camera.viewer,doors:doors.map(d=>({id:d.id,open:d.open,position:d.cur}))}},timestamp:new Date().toISOString(),assets:{pending:apartmentSceneAssetsPending.size,fallbacks:[...apartmentSceneAssetsFailed]},renderer:{engine:'Three.js WebGL',revision:THREE.REVISION}};
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
