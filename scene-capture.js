/* Identity-scoped server captures. No architectural or design writes occur here. */
const studioCaptureSha=async value=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',typeof value==='string'?new TextEncoder().encode(value):value))].map(n=>n.toString(16).padStart(2,'0')).join('');
function studioCaptureCanonical(value){return JSON.stringify((function ordered(v){return Array.isArray(v)?v.map(ordered):interiorObject(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,ordered(v[k])])):v;})(value));}
function studioCaptureStale(row,identity){return new StudioStorageError('The saved scene changed. Read get_current_apartment_design_brief and capture its scene_revision.',409,'stale_scene_revision',studioSaved(row,identity));}
async function studioCaptureCurrent(env,identity,expected){
  const row=await studioCurrent(env,identity.id);
  if(!row)throw new StudioStorageError('Save the first apartment design before agent capture.',409,'design_not_initialized');
  if(row.scene_revision!==expected)throw studioCaptureStale(row,identity);
  return row;
}
async function studioCaptureAssets(env,layout){
  if(!env.ASSETS?.fetch)throw new StudioStorageError('The headless scene template is unavailable.',503,'capture_assets_unavailable');
  const refs=new Set([...interiorLayer(layout).objects.flatMap(o=>Object.values(o.material_references)),...Object.values(interiorLayer(layout).surface_materials),...Object.values(interiorLayer(layout).opening_treatments).map(t=>t.material_id)]);
  if(interiorLayer(layout).objects.some(o=>o.type==='artwork'&&!o.material_references.artwork&&!o.material_references.primary))refs.add('reference-art-warm');
  const paths=new Set(layout.decor.active!=='custom'?['./art/'+layout.decor.active+'.png']:[]);
  for(const material of interiorMaterials(layout).filter(m=>refs.has(m.id)))for(const field of ['albedo_texture','normal_map','roughness_map'])if(material[field]&&!/^https:\/\//.test(material[field]))paths.add(material[field]);
  const urls={};let total=0;
  for(const path of paths){
    const url=new URL(path,'https://apartment-capture.invalid/');
    if(url.origin!=='https://apartment-capture.invalid'||!/^\/[a-zA-Z0-9_./%-]+\.(png|jpe?g|webp)$/i.test(url.pathname))throw new StudioStorageError('A local material texture is not a supported bundled image asset.',422,'capture_texture_unavailable');
    const response=await env.ASSETS.fetch(new Request(url));
    if(!response.ok||!/^image\/(png|jpeg|webp)/.test(response.headers.get('content-type')||''))throw new StudioStorageError('A saved artwork or texture asset is unavailable: '+path,503,'capture_texture_unavailable');
    const bytes=new Uint8Array(await response.arrayBuffer());total+=bytes.length;
    if(total>8000000)throw new StudioStorageError('Bundled scene images exceed the capture memory budget.',413,'capture_asset_limit');
    urls[path]='data:'+response.headers.get('content-type').split(';')[0]+';base64,'+studioBase64(bytes);
  }
  const response=await env.ASSETS.fetch(new Request('https://apartment-capture.invalid/capture-template.json'));
  if(!response.ok)throw new StudioStorageError('The server render template is unavailable.',503,'capture_assets_unavailable');
  const template=await response.json();
  if(template.schema!=='ApartmentSceneCaptureTemplate/1'||typeof template.html!=='string'||template.html.split('__APARTMENT_CAPTURE_SNAPSHOT_JSON__').length!==2)throw new StudioStorageError('The render template is invalid.',503,'capture_assets_unavailable');
  return {html:template.html,asset_urls:urls};
}
function studioCapturePage(assets,input){
  const safe=JSON.stringify({...input,asset_urls:assets.asset_urls}).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  return assets.html.replace('__APARTMENT_CAPTURE_SNAPSHOT_JSON__',()=>safe);
}
async function studioCaptureProviderPayload(response){
  const reader=response.body?.getReader();if(!reader)throw new StudioStorageError('The renderer returned an empty result.',502,'invalid_capture_result');
  const decoder=new TextDecoder(),parts=[];let size=0;
  try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>8000000){await reader.cancel();throw new StudioStorageError('Headless capture response exceeds its image budget.',502,'invalid_capture_result');}parts.push(decoder.decode(value,{stream:true}));}parts.push(decoder.decode());return JSON.parse(parts.join(''));}finally{reader.releaseLock();}
}
async function studioCaptureProvider(env,html,input){
  const params={html,formats:['content','screenshot'],viewport:{...APARTMENT_CAPTURE_VIEWPORT,deviceScaleFactor:1},gotoOptions:{waitUntil:'domcontentloaded',timeout:30000},waitForSelector:{selector:'canvas[data-capture-ready="'+input.frame_id+'"]',timeout:40000,visible:true},actionTimeout:45000,screenshotOptions:{type:'png',fullPage:false,clip:{x:0,y:0,...APARTMENT_CAPTURE_VIEWPORT},captureBeyondViewport:false},rejectResourceTypes:['media','font','xhr','fetch','eventsource','websocket','ping'],rejectRequestPattern:['^http://','^https://(?:localhost|127\\.|10\\.|192\\.168\\.|169\\.254\\.|172\\.(?:1[6-9]|2[0-9]|3[01])\\.|\\[)']};
  let response,timer,phase='request';const controller=new AbortController();
  try{
    timer=setTimeout(()=>controller.abort(),55000);
    if(env.BROWSER?.quickAction)response=await env.BROWSER.quickAction('snapshot',params);
    else {
      const token=env.CAPTURE_CLOUDFLARE_API_TOKEN.trim();
      if(/[^\x21-\x7e]/.test(token))throw new StudioStorageError('The rendering API token contains whitespace or non-ASCII characters. Replace the Site secret with the actual Cloudflare token.',503,'invalid_renderer_configuration');
      // Workers supports manual/follow, not the browser-only redirect:error.
      // Manual prevents the secret from following a provider redirect.
      phase='request-build';const request=new Request('https://api.cloudflare.com/client/v4/accounts/'+env.CAPTURE_CLOUDFLARE_ACCOUNT_ID.trim()+'/browser-rendering/snapshot?cacheTTL=0',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(params),signal:controller.signal,redirect:'manual'});
      phase='request';response=await fetch(request);
    }
    if(!response.ok)throw new StudioStorageError(response.status===429?'The headless renderer is busy or has reached its usage limit. Retry this request_id.':'The headless renderer could not finish the scene. Check its configuration and saved texture availability; retry this request_id.',503,'headless_renderer_unavailable');
    phase='response-json';const payload=await studioCaptureProviderPayload(response),result=payload.result??payload;
    if(payload.success===false||typeof result.screenshot!=='string'||result.screenshot.length>5400000||typeof result.content!=='string')throw new StudioStorageError('The renderer did not return a complete PNG and frame metadata.',502,'invalid_capture_result');
    const match=result.content.match(/<script\b(?=[^>]*\bid=["']apartment-capture-result["'])(?=[^>]*\btype=["']application\/json["'])[^>]*>([\s\S]*?)<\/script>/i);
    if(!match)throw new StudioStorageError('The rendered scene did not reach its verified ready state.',502,'invalid_capture_result');
    phase='frame-json';const frame=JSON.parse(match[1]);
    if(frame.schema!=='ApartmentSceneCaptureFrame/1'||frame.scene_revision!==input.scene_revision||frame.storage_revision!==input.storage_revision||frame.canonical_sha256!==input.canonical_sha256||frame.snapshot_sha256!==input.snapshot_sha256||typeof frame.rendered_layout_json!=='string'||await studioCaptureSha(frame.rendered_layout_json)!==input.snapshot_sha256||frame.room_id!==input.room_id||frame.assets?.pending!==0||frame.assets.fallbacks?.length!==0||frame.renderer?.engine!=='Three.js WebGL'||frame.renderer.revision!=='160'||JSON.stringify(frame.camera)!==JSON.stringify(input.camera)||!Number.isFinite(Date.parse(frame.timestamp)))throw new StudioStorageError('Captured geometry, camera or loaded materials do not match the requested saved scene.',502,'capture_scene_mismatch');
    phase='png-decode';const b64=result.screenshot.replace(/^data:image\/png;base64,/,''),raw=atob(b64),bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));
    const size=studioPngDimensions(bytes);if(size.width!==APARTMENT_CAPTURE_VIEWPORT.width||size.height!==APARTMENT_CAPTURE_VIEWPORT.height)throw new StudioStorageError('Headless PNG does not match the camera viewport.',502,'capture_scene_mismatch');
    return {frame,bytes};
  }catch(error){if(error instanceof StudioStorageError)throw error;const kind=['TypeError','SyntaxError','InvalidCharacterError','AbortError'].includes(error.name)?error.name:'Error',hint=['header','signal','redirect','size','network','fetch','url'].find(s=>String(error.message).toLowerCase().includes(s))||'unknown';console.error('Headless capture failed',JSON.stringify({phase,kind,hint,http_status:response?.status||null}));throw new StudioStorageError(controller.signal.aborted?'Headless scene capture timed out. Retry the same request_id.':'The headless renderer failed at '+phase+' ('+kind+'; '+hint+'). Retry the same request_id.',503,'headless_renderer_unavailable');}finally{clearTimeout(timer);}
}
async function studioCaptureRequestRow(env,owner,requestId){return studioDatabase(env).prepare('SELECT * FROM apartment_scene_capture_requests WHERE owner_id=? AND request_id=?').bind(owner,requestId).first();}
async function studioCaptureResults(env,identity,job,current,idempotent,batch){
  const ids=JSON.parse(job.view_ids_json),views=[],images=[];
  for(const id of ids){const row=await studioViewRow(env,identity.id,{view_id:id});if(!row)throw new StudioStorageError('A capture image is temporarily unavailable. Retry this request_id.',503,'image_storage_unavailable');views.push(studioViewMetadata(row,current));images.push({type:'image',mimeType:'image/png',data:studioBase64(await studioViewBytes(env,row))});}
  const latest=await studioCaptureCurrent(env,identity,current.scene_revision);
  if(latest.revision!==current.revision)throw studioCaptureStale(latest,identity);
  return batch?{schema:'ApartmentSceneViewsCapture/1',request_id:job.request_id,scene_revision:job.scene_revision,cloud:{storage_revision:job.storage_revision},views,idempotent,image_contents:images}:{...views[0],request_id:job.request_id,idempotent,image_content:images[0]};
}
async function studioCaptureViews(env,identity,args,batch=false){
  const inputs=studioCaptureInputs(args,batch),current=await studioCaptureCurrent(env,identity,args.expected_scene_revision),layout=JSON.parse(current.layout_json);
  studioAssertLayout(layout,HOST_MODEL,HOST_FURNITURE_TYPES);
  if(studioSceneKey(layout)!==current.scene_revision)throw new StudioStorageError('Saved scene content does not match its revision.',422,'invalid_saved_scene');
  const requestHash=await studioCaptureSha(studioCaptureCanonical({batch,scene_revision:current.scene_revision,inputs}));
  let existing=await studioCaptureRequestRow(env,identity.id,args.request_id);
  if(existing&&existing.request_hash!==requestHash)throw new StudioStorageError('This request_id already describes a different capture. Use a new request_id.',409,'request_id_conflict');
  if(existing?.status==='COMPLETED')return studioCaptureResults(env,identity,existing,current,true,batch);
  if(existing?.status==='RUNNING'&&Date.parse(existing.lease_until)>Date.now())throw new StudioStorageError('This capture is still rendering. Retry the same request_id after it finishes.',409,'capture_in_progress');
  const capability=studioCaptureCapability(env);
  if(!capability.available)throw new StudioStorageError('Server capture is not configured. Set CAPTURE_CLOUDFLARE_ACCOUNT_ID and the secret CAPTURE_CLOUDFLARE_API_TOKEN with Browser Rendering permission, then deploy. No browser interaction is needed once configured.',503,'headless_renderer_not_configured');
  const cameras=inputs.map(input=>studioCaptureCamera(input,layout,HOST_MODEL)),snapshotHash=await studioCaptureSha(current.layout_json),assets=await studioCaptureAssets(env,layout),db=studioDatabase(env),bucket=studioBucket(env);
  const lease=crypto.randomUUID(),now=new Date().toISOString(),until=new Date(Date.now()+600000).toISOString();
  if(!existing){
    await db.prepare('INSERT OR IGNORE INTO apartment_scene_capture_requests (owner_id,request_id,request_hash,scene_revision,storage_revision,status,lease_token,lease_until,view_ids_json,created_at,updated_at) SELECT ?,?,?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM apartment_designs WHERE owner_id=? AND revision=? AND scene_revision=?)').bind(identity.id,args.request_id,requestHash,current.scene_revision,current.revision,'RUNNING',lease,until,'[]',now,now,identity.id,current.revision,current.scene_revision).run();
  }else{
    await db.prepare('UPDATE apartment_scene_capture_requests SET status=?,lease_token=?,lease_until=?,storage_revision=?,updated_at=? WHERE owner_id=? AND request_id=? AND request_hash=? AND (status=? OR (status=? AND lease_until<=?)) AND EXISTS (SELECT 1 FROM apartment_designs WHERE owner_id=? AND revision=? AND scene_revision=?)').bind('RUNNING',lease,until,current.revision,now,identity.id,args.request_id,requestHash,'FAILED','RUNNING',now,identity.id,current.revision,current.scene_revision).run();
  }
  const claimed=await studioCaptureRequestRow(env,identity.id,args.request_id);
  if(claimed?.lease_token!==lease){
    const latest=await studioCaptureCurrent(env,identity,current.scene_revision);if(latest.revision!==current.revision)throw studioCaptureStale(latest,identity);
    if(claimed?.request_hash!==requestHash)throw new StudioStorageError('Concurrent capture request_id conflict.',409,'request_id_conflict');
    if(claimed.status==='COMPLETED')return studioCaptureResults(env,identity,claimed,current,true,batch);
    throw new StudioStorageError('This capture is already running. Retry the same request_id.',409,'capture_in_progress');
  }
  const stored=[],viewIds=[],records=[];let committed=false;
  try{
    // Sequential launches bound headless sessions and Worker memory. All outputs
    // share one immutable snapshot, and are committed as one database batch.
    for(let i=0;i<inputs.length;i++){
      const latest=await studioCaptureCurrent(env,identity,current.scene_revision);if(latest.revision!==current.revision)throw studioCaptureStale(latest,identity);
      const viewId='capture-'+(await studioCaptureSha(identity.id+'\n'+args.request_id)).slice(0,24)+'-'+i;
      const input={layout,canonical_sha256:HOST_MODEL.canonical_sha256,snapshot_sha256:snapshotHash,scene_revision:current.scene_revision,storage_revision:current.revision,room_id:inputs[i].room_id,camera:cameras[i],frame_id:lease+'-'+i};
      const {frame,bytes}=await studioCaptureProvider(env,studioCapturePage(assets,input),input),hash=await studioCaptureSha(bytes),objectKey='scene-captures/'+encodeURIComponent(identity.id)+'/'+lease+'/'+i+'-'+hash+'.png';
      const metadata={schema:'ApartmentSceneView/1',view_id:viewId,scene_revision:current.scene_revision,expected_storage_revision:current.revision,room_id:input.room_id,camera:frame.camera,timestamp:frame.timestamp};studioAssertCamera(metadata);
      stored.push(objectKey);await bucket.put(objectKey,bytes,{httpMetadata:{contentType:'image/png'}});viewIds.push(viewId);
      records.push({viewId,roomId:input.room_id,camera:frame.camera,hash,objectKey,timestamp:frame.timestamp});
    }
    const at=new Date().toISOString(),guard=' WHERE EXISTS (SELECT 1 FROM apartment_designs WHERE owner_id=? AND revision=? AND scene_revision=?) AND EXISTS (SELECT 1 FROM apartment_scene_capture_requests WHERE owner_id=? AND request_id=? AND status=? AND lease_token=?)';
    const statements=records.map(r=>db.prepare('INSERT INTO apartment_scene_views (view_id,owner_id,scene_revision,storage_revision,room_id,camera_json,object_key,image_hash,image_width,image_height,timestamp,created_at) SELECT ?,?,?,?,?,?,?,?,?,?,?,?'+guard).bind(r.viewId,identity.id,current.scene_revision,current.revision,r.roomId,JSON.stringify(r.camera),r.objectKey,r.hash,1280,720,r.timestamp,at,identity.id,current.revision,current.scene_revision,identity.id,args.request_id,'RUNNING',lease));
    statements.push(db.prepare('UPDATE apartment_scene_capture_requests SET status=?,view_ids_json=?,updated_at=? WHERE owner_id=? AND request_id=? AND lease_token=? AND status=? AND EXISTS (SELECT 1 FROM apartment_designs WHERE owner_id=? AND revision=? AND scene_revision=?)').bind('COMPLETED',JSON.stringify(viewIds),at,identity.id,args.request_id,lease,'RUNNING',identity.id,current.revision,current.scene_revision));
    const results=await db.batch(statements);committed=results.every(r=>r.meta?.changes===1);
    if(!committed)throw studioCaptureStale(await studioCurrent(env,identity.id),identity);
    return await studioCaptureResults(env,identity,await studioCaptureRequestRow(env,identity.id,args.request_id),current,false,batch);
  }catch(error){
    if(!committed){
      for(const key of stored)try{await bucket.delete(key);}catch{}
      try{await db.prepare('UPDATE apartment_scene_capture_requests SET status=?,updated_at=? WHERE owner_id=? AND request_id=? AND lease_token=? AND status=?').bind('FAILED',new Date().toISOString(),identity.id,args.request_id,lease,'RUNNING').run();}catch{}
    }
    throw error;
  }
}
