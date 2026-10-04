/* Private PNG bytes in R2; camera/revision/ownership metadata in D1. */
function studioBucket(env){if(!env.BUCKET?.put||!env.BUCKET?.get)throw new StudioStorageError('Scene images are temporarily unavailable. Keep this view and retry.',503,'image_storage_unavailable');return env.BUCKET;}
async function studioViewRow(env,owner,{view_id,room_id}={}){
  const db=studioDatabase(env);
  if(view_id)return db.prepare('SELECT * FROM apartment_scene_views WHERE owner_id=? AND view_id=?').bind(owner,view_id).first();
  if(room_id)return db.prepare('SELECT * FROM apartment_scene_views WHERE owner_id=? AND room_id=? ORDER BY seq DESC LIMIT 1').bind(owner,room_id).first();
  return db.prepare('SELECT * FROM apartment_scene_views WHERE owner_id=? ORDER BY seq DESC LIMIT 1').bind(owner).first();
}
function studioViewMetadata(row,current){
  if(!row)return {schema:'ApartmentSceneView/1',initialized:false,message:'Capture a saved scene with capture_apartment_scene_view, or use Save view for AI render in the viewer.'};
  return {schema:'ApartmentSceneView/1',initialized:true,view_id:row.view_id,canonical_sha256:HOST_MODEL.canonical_sha256,scene_revision:row.scene_revision,cloud:{storage_revision:row.storage_revision},room_id:row.room_id,camera:JSON.parse(row.camera_json),timestamp:row.timestamp,saved_at:row.created_at,matches_current_scene:!!current&&current.scene_revision===row.scene_revision,image:{mime_type:'image/png',width:row.image_width,height:row.image_height,sha256:row.image_hash,url:'/api/scene-view/'+encodeURIComponent(row.view_id)+'/image'},representation:'Exact WebGL screenshot of the validated conceptual scene; product models are approximate.'};
}
function studioAssertCamera(metadata){
  const m=metadata,c=m?.camera,vec=v=>Array.isArray(v)&&v.length===3&&v.every(n=>Number.isFinite(n)&&Math.abs(n)<=250);
  if(!interiorObject(m)||m.schema!=='ApartmentSceneView/1'||Object.keys(m).some(k=>!['schema','view_id','scene_revision','expected_storage_revision','room_id','camera','timestamp'].includes(k))||!interiorObjectId(m.view_id)||m.view_id.length<8||!Number.isSafeInteger(m.expected_storage_revision)||m.expected_storage_revision<1||typeof m.scene_revision!=='string'||!/^scene-[0-9a-f]+$/.test(m.scene_revision)||!HOST_MODEL.rooms.some(r=>r.id===m.room_id&&!r.isTerrace)||!Number.isFinite(Date.parse(m.timestamp)))throw new StudioStorageError('Invalid saved view metadata.');
  if(!interiorObject(c)||Object.keys(c).some(k=>!['position','target','fov','projection_type','coordinate_system','aspect','near','far','viewport','viewer','orthographic_frustum'].includes(k))||!vec(c.position)||!vec(c.target)||Math.hypot(...c.position.map((n,i)=>n-c.target[i]))<.001||!Number.isFinite(c.fov)||c.fov<10||c.fov>120||!['perspective','orthographic'].includes(c.projection_type)||!Number.isFinite(c.aspect)||c.aspect<=0||c.aspect>10||typeof c.coordinate_system!=='string'||c.coordinate_system.length>300||!interiorObject(c.viewport)||!Number.isSafeInteger(c.viewport.width)||!Number.isSafeInteger(c.viewport.height)||Math.min(c.viewport.width,c.viewport.height)<1||Math.max(c.viewport.width,c.viewport.height)>1600||Math.abs(c.aspect-c.viewport.width/c.viewport.height)>.02||!Number.isFinite(c.near)||!Number.isFinite(c.far)||c.near<=0||c.far<=c.near||c.far>2000)throw new StudioStorageError('Invalid camera or viewport.');
  if(c.projection_type==='orthographic'&&(!interiorObject(c.orthographic_frustum)||!['left','right','top','bottom'].every(k=>Number.isFinite(c.orthographic_frustum[k]))||c.orthographic_frustum.left>=c.orthographic_frustum.right||c.orthographic_frustum.bottom>=c.orthographic_frustum.top))throw new StudioStorageError('Orthographic references need their exact frustum.');
  if(!interiorObject(c.viewer)||c.viewer.cut_height_m!==2.5||c.viewer.furnishings_visible!==true||typeof c.viewer.night!=='boolean'||!Number.isFinite(c.viewer.hour)||c.viewer.hour<0||c.viewer.hour>24||!['walk','orbit'].includes(c.viewer.mode)||!Array.isArray(c.viewer.doors)||c.viewer.doors.length>30||c.viewer.doors.some(d=>!HOST_MODEL.openings.some(o=>o.id===d.id)||typeof d.open!=='boolean'||!Number.isFinite(d.position)))throw new StudioStorageError('Save a full-height 3D scene with furnishings visible.');
}
function studioPngDimensions(bytes){
  const sig=[137,80,78,71,13,10,26,10];if(bytes.byteLength<45||bytes.byteLength>4000000||sig.some((v,i)=>bytes[i]!==v)||String.fromCharCode(...bytes.slice(12,16))!=='IHDR')throw new StudioStorageError('Supply a PNG screenshot no larger than 4 MB.',413,'invalid_png');
  const v=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength),width=v.getUint32(16),height=v.getUint32(20);if(v.getUint32(8)!==13||width<1||height<1||width>1600||height>1600||String.fromCharCode(...bytes.slice(-8,-4))!=='IEND')throw new StudioStorageError('PNG dimensions or final image chunk are invalid.');return {width,height};
}
async function studioSaveView(env,identity,m,bytes){
  studioAssertCamera(m);const size=studioPngDimensions(bytes);if(size.width!==m.camera.viewport.width||size.height!==m.camera.viewport.height)throw new StudioStorageError('PNG dimensions do not match the saved camera viewport.');
  const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join(''),db=studioDatabase(env),current=await studioCurrent(env,identity.id),existing=await studioViewRow(env,identity.id,{view_id:m.view_id});
  if(existing){if(existing.image_hash!==hash||existing.camera_json!==JSON.stringify(m.camera)||existing.scene_revision!==m.scene_revision||existing.storage_revision!==m.expected_storage_revision||existing.room_id!==m.room_id)throw new StudioStorageError('This view_id was used for another capture.',409,'view_id_conflict');return {...studioViewMetadata(existing,current),idempotent:true};}
  if(!current||current.revision!==m.expected_storage_revision||current.scene_revision!==m.scene_revision)throw new StudioStorageError('The saved scene changed. Capture the current camera and design again.',409,'revision_conflict');
  const validation=interiorValidation(JSON.parse(current.layout_json),HOST_MODEL);if(!validation.valid)throw new StudioStorageError('Resolve hard placement failures before saving a render view.');
  const bucket=studioBucket(env),objectKey='scene-views/'+encodeURIComponent(identity.id)+'/'+m.view_id+'-'+hash.slice(0,16)+'.png';await bucket.put(objectKey,bytes,{httpMetadata:{contentType:'image/png'}});
  try{
    const statement=db.prepare('INSERT OR IGNORE INTO apartment_scene_views (view_id,owner_id,scene_revision,storage_revision,room_id,camera_json,object_key,image_hash,image_width,image_height,timestamp,created_at) SELECT ?,owner_id,scene_revision,revision,?,?,?,?,?,?,?,? FROM apartment_designs WHERE owner_id=? AND revision=? AND scene_revision=?').bind(m.view_id,m.room_id,JSON.stringify(m.camera),objectKey,hash,size.width,size.height,m.timestamp,new Date().toISOString(),identity.id,m.expected_storage_revision,m.scene_revision);
    const result=await statement.run();if(!result.meta?.changes){const raced=await studioViewRow(env,identity.id,{view_id:m.view_id});if(raced&&raced.image_hash===hash&&raced.camera_json===JSON.stringify(m.camera)&&raced.scene_revision===m.scene_revision&&raced.room_id===m.room_id&&raced.storage_revision===m.expected_storage_revision)return {...studioViewMetadata(raced,await studioCurrent(env,identity.id)),idempotent:true};throw new StudioStorageError('The design changed while the PNG was saving. Capture the current scene again.',409,'revision_conflict');}
    return {...studioViewMetadata(await studioViewRow(env,identity.id,{view_id:m.view_id}),current),idempotent:false};
  }catch(error){if(!(await studioViewRow(env,identity.id,{view_id:m.view_id})))await bucket.delete(objectKey).catch(()=>{});throw error;}
}
async function studioViewBytes(env,row){const blob=await studioBucket(env).get(row.object_key);if(!blob)throw new StudioStorageError('Saved PNG is unavailable. Save the view again.',503,'image_unavailable');return new Uint8Array(await blob.arrayBuffer());}
function studioBase64(bytes){let text='';for(let i=0;i<bytes.length;i+=8192)text+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(text);}
async function studioGetView(env,identity,args={}){
  if(Object.keys(args).some(k=>!['room_id','view_id','include_image'].includes(k))||args.room_id&&!HOST_MODEL.rooms.some(r=>r.id===args.room_id&&!r.isTerrace)||args.view_id&&!interiorObjectId(args.view_id)||args.include_image!==undefined&&typeof args.include_image!=='boolean')throw new StudioStorageError('Invalid saved view arguments.');
  const row=await studioViewRow(env,identity.id,args);if(args.view_id&&!row)throw new StudioStorageError('Saved view not found.',404,'view_not_found');if(row&&args.room_id&&row.room_id!==args.room_id)throw new StudioStorageError('Saved view belongs to another room.');const metadata=studioViewMetadata(row,await studioCurrent(env,identity.id));
  if(row&&args.include_image!==false)return {...metadata,image_content:{type:'image',mimeType:'image/png',data:studioBase64(await studioViewBytes(env,row))}};return metadata;
}
async function studioReadViewBody(request){
  if(Number(request.headers.get('content-length')||0)>4500000)throw new StudioStorageError('Capture exceeds 4.5 MB.',413,'request_too_large');
  const reader=request.body?.getReader();if(!reader)throw new StudioStorageError('Missing capture body.');let total=0;const chunks=[];while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>4500000){await reader.cancel();throw new StudioStorageError('Capture exceeds 4.5 MB.',413,'request_too_large');}chunks.push(value);}
  const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return new Response(bytes,{headers:{'Content-Type':request.headers.get('content-type')||''}}).formData();
}
async function handleSceneViewApi(request,env){
  try{
    const identity=studioIdentity(request),url=new URL(request.url);
    if(request.method==='POST'){
      if(request.headers.get('origin')&&request.headers.get('origin')!==url.origin||request.headers.get('sec-fetch-site')==='cross-site')throw new StudioStorageError('Capture must come from this Site.',403,'origin_rejected');
      if(url.pathname!=='/api/scene-view')throw new StudioStorageError('View route not found.',404);
      const form=await studioReadViewBody(request),raw=form.get('metadata'),image=form.get('image');if([...form.keys()].length!==2||typeof raw!=='string'||raw.length>12000||!image?.arrayBuffer||image.type!=='image/png')throw new StudioStorageError('Expected camera metadata and a PNG file.');
      let m;try{m=JSON.parse(raw);}catch{throw new StudioStorageError('Invalid camera JSON.');}return jsonResponse(await studioSaveView(env,identity,m,new Uint8Array(await image.arrayBuffer())));
    }
    if(request.method==='GET'&&url.pathname==='/api/scene-view')return jsonResponse(await studioGetView(env,identity,{...(url.searchParams.get('room_id')?{room_id:url.searchParams.get('room_id')}:{}),include_image:false}));
    const match=url.pathname.match(/^\/api\/scene-view\/([a-zA-Z0-9_-]+)\/image$/);
    if(match&&request.method==='GET'){const row=await studioViewRow(env,identity.id,{view_id:match[1]});if(!row)throw new StudioStorageError('Saved view not found.',404,'view_not_found');return new Response(await studioViewBytes(env,row),{headers:{'Content-Type':'image/png','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});}
    return jsonResponse({error:'View route not found.'},404);
  }catch(error){const known=error instanceof StudioStorageError;if(!known)console.error('Scene view storage failed:',error.message);return jsonResponse({error:known?error.message:'Scene view storage is unavailable. Keep the camera and retry.',code:known?error.code:'image_storage_unavailable'},known?error.status:503);}
}
