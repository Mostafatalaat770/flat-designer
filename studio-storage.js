/* Every query is scoped to the trusted Site identity; no client-supplied owner. */
class StudioStorageError extends Error{constructor(message,status=422,code='invalid_design',current){super(message);this.status=status;this.code=code;this.current=current;}}
function studioIdentity(request){
  const id=request.headers.get('oai-authenticated-user-id'),email=request.headers.get('oai-authenticated-user-email');
  if(!id||!email)throw new StudioStorageError('Sign in to save and read your apartment design.',401,'authentication_required');
  return {id,email};
}
function studioDatabase(env){if(!env.DB?.prepare)throw new StudioStorageError('Saved designs are temporarily unavailable. Your device draft is preserved.',503,'storage_unavailable');return env.DB;}
async function studioCurrent(env,owner){return studioDatabase(env).prepare('SELECT * FROM apartment_designs WHERE owner_id = ?').bind(owner).first();}
function studioSaved(row,identity){
  if(!row)return {schema:'ApartmentSavedDesign/1',initialized:false,account:identity,message:'Open the viewer once to save the current device design. No export is required.'};
  const cloud={storage_revision:row.revision,updated_at:row.updated_at,source:row.source,summary:row.summary};
  return {schema:'ApartmentSavedDesign/1',initialized:true,account:identity,storage_revision:row.revision,scene_revision:row.scene_revision,updated_at:row.updated_at,source:row.source,summary:row.summary,brief:studioDesignBrief(JSON.parse(row.layout_json),HOST_MODEL,HOST_CATALOG,cloud)};
}
function studioExpected(input){
  if(!Number.isSafeInteger(input.expected_storage_revision)||input.expected_storage_revision<0||!(input.expected_storage_revision===0?input.expected_scene_revision===null:typeof input.expected_scene_revision==='string'&&/^scene-[0-9a-f]+$/.test(input.expected_scene_revision)))throw new StudioStorageError('Supply both saved revision and scene revision from the current design.');
  if(typeof input.request_id!=='string'||!/^[a-zA-Z0-9_-]{8,100}$/.test(input.request_id))throw new StudioStorageError('Supply a unique request_id of 8–100 letters, digits, hyphens or underscores.');
}
async function studioWrite(env,identity,input,layout,source,summary,variantGuard){
  studioExpected(input);
  try{layout=studioPrepareCloudLayout(layout,HOST_MODEL,HOST_FURNITURE_TYPES);}catch(error){const invalid=new StudioStorageError(error.message);invalid.validation=error.validation;throw invalid;}
  const savedBase=await studioCurrent(env,identity.id);
  if(savedBase&&source==='browser'){
    const previous=JSON.parse(savedBase.layout_json),changed=layout.furniture.filter(f=>{const old=previous.furniture.find(g=>g.id===f.id);return !old||['cx','cy','w','d','rot'].some(k=>f[k]!==old[k]);}).map(f=>f.id);
    if(changed.length){const report=interiorValidation(layout,HOST_MODEL,changed,{circulation:false});if(!report.valid){const invalid=new StudioStorageError('Changed furniture has hard placement failures. Review measured clearances.');invalid.validation=report;throw invalid;}}
  }
  const db=studioDatabase(env),json=JSON.stringify(layout),scene=studioSceneKey(layout),revision=input.expected_storage_revision+1,at=new Date().toISOString();
  const prior=()=>db.prepare('SELECT * FROM apartment_design_history WHERE owner_id = ? AND request_id = ?').bind(identity.id,input.request_id).first();
  const repeat=async()=>{
    const p=await prior();if(!p)return null;
    if(studioLogicalKey(JSON.parse(p.layout_json))!==studioLogicalKey(layout))throw new StudioStorageError('This request_id was already used for a different design.',409,'request_id_conflict');
    return {...studioSaved(p,identity),idempotent:true};
  };
  const existing=await repeat();if(existing)return existing;
  const current=input.expected_storage_revision===0?
    db.prepare('INSERT OR IGNORE INTO apartment_designs (owner_id,revision,scene_revision,layout_json,request_id,source,summary,updated_at) VALUES (?,?,?,?,?,?,?,?)').bind(identity.id,revision,scene,json,input.request_id,source,summary,at):
    db.prepare('UPDATE apartment_designs SET revision=?,scene_revision=?,layout_json=?,request_id=?,source=?,summary=?,updated_at=? WHERE owner_id=? AND revision=? AND scene_revision=?'+(variantGuard?' AND EXISTS (SELECT 1 FROM apartment_design_variants WHERE owner_id=? AND variant_id=? AND revision=? AND scene_revision=?)':'')).bind(revision,scene,json,input.request_id,source,summary,at,identity.id,input.expected_storage_revision,input.expected_scene_revision,...(variantGuard?[identity.id,variantGuard.variant_id,variantGuard.revision,variantGuard.scene_revision]:[]));
  const history=db.prepare('INSERT OR IGNORE INTO apartment_design_history (owner_id,revision,scene_revision,layout_json,request_id,source,summary,updated_at) SELECT owner_id,revision,scene_revision,layout_json,request_id,source,summary,updated_at FROM apartment_designs WHERE owner_id=? AND revision=? AND request_id=?').bind(identity.id,revision,input.request_id);
  const prune=db.prepare('DELETE FROM apartment_design_history WHERE owner_id=? AND revision < ? AND EXISTS (SELECT 1 FROM apartment_designs WHERE owner_id=? AND revision=? AND request_id=?)').bind(identity.id,Math.max(1,revision-149),identity.id,revision,input.request_id);
  const results=await db.batch([current,history,prune]);
  if(!results[0].meta?.changes){
    const repeated=await repeat();if(repeated)return repeated;
    throw new StudioStorageError('The saved design changed. Review the newer version before saving.',409,'revision_conflict',studioSaved(await studioCurrent(env,identity.id),identity));
  }
  const saved=await prior();if(!saved)throw new Error('Committed design history is missing.');
  return {...studioSaved(saved,identity),idempotent:false};
}
async function studioHistory(env,identity){
  const result=await studioDatabase(env).prepare('SELECT revision,scene_revision,source,summary,updated_at FROM apartment_design_history WHERE owner_id=? ORDER BY revision DESC LIMIT 30').bind(identity.id).all();
  return result.results||[];
}
async function studioRestore(env,identity,input){
  if(!Number.isSafeInteger(input.revision)||input.revision<1)throw new StudioStorageError('Choose a saved revision.');
  const row=await studioDatabase(env).prepare('SELECT * FROM apartment_design_history WHERE owner_id=? AND revision=?').bind(identity.id,input.revision).first();
  if(!row)throw new StudioStorageError('Saved revision not found.',404,'revision_not_found');
  return studioWrite(env,identity,input,JSON.parse(row.layout_json),'restore','Restored revision '+input.revision);
}
async function studioApplySaved(env,identity,args){
  if(Object.keys(args).some(k=>!['proposal','expected_storage_revision','request_id'].includes(k)))throw new StudioStorageError('Unknown argument.');
  const row=await studioCurrent(env,identity.id);if(!row)throw new StudioStorageError('Open the viewer once to save your design before applying an agent proposal.',409,'design_not_initialized');
  let base=row;
  if(args.expected_storage_revision!==row.revision){
    const db=studioDatabase(env),repeated=await db.prepare('SELECT * FROM apartment_design_history WHERE owner_id=? AND request_id=?').bind(identity.id,args.request_id).first();
    if(repeated)base=await db.prepare('SELECT * FROM apartment_design_history WHERE owner_id=? AND revision=?').bind(identity.id,args.expected_storage_revision).first();
    if(!repeated||!base)throw new StudioStorageError('The saved design changed. Read a fresh current design brief.',409,'revision_conflict',studioSaved(row,identity));
  }
  // Validation is repeated against the actual stored layout at the write boundary.
  const layout=studioValidateProposal(args.proposal,JSON.parse(base.layout_json),HOST_MODEL);
  const saved=await studioWrite(env,identity,{expected_storage_revision:args.expected_storage_revision,expected_scene_revision:args.proposal.base_scene_revision,request_id:args.request_id},layout,'agent',String(args.proposal.author||'Design agent').slice(0,80)+' · '+args.proposal.operations.length+' changes');
  return {...saved,validation:interiorValidation(layout,HOST_MODEL,interiorProposalFurnitureIds(args.proposal.operations)),applied:true,operation_count:args.proposal.operations.length,previous_storage_revision:args.expected_storage_revision,next_step:'The open viewer syncs this revision automatically. Saved design → History can restore the previous revision.'};
}
async function studioJsonBody(request){
  if(Number(request.headers.get('content-length')||0)>1500000)throw new StudioStorageError('Request exceeds 1.5 MB.',413,'request_too_large');
  const text=await request.text();if(text.length>1500000)throw new StudioStorageError('Request exceeds 1.5 MB.',413,'request_too_large');
  try{const v=JSON.parse(text);if(!v||typeof v!=='object'||Array.isArray(v))throw new Error();return v;}catch{throw new StudioStorageError('Expected a JSON object.',400,'invalid_json');}
}
async function handleDesignApi(request,env){
  try{
    const identity=studioIdentity(request),url=new URL(request.url);
    if(request.method!=='GET'){
      const origin=request.headers.get('origin');if(origin&&origin!==url.origin||request.headers.get('sec-fetch-site')==='cross-site')throw new StudioStorageError('Save requests must come from this Site.',403,'origin_rejected');
    }
    if(url.pathname==='/api/design'&&request.method==='GET')return jsonResponse(studioSaved(await studioCurrent(env,identity.id),identity));
    if(url.pathname==='/api/design/variants'&&request.method==='GET')return jsonResponse({variants:await studioVariants(env,identity)});
    if(url.pathname==='/api/design/variants'&&request.method==='PUT')return jsonResponse(await studioSaveVariant(env,identity,await studioJsonBody(request)));
    if(url.pathname==='/api/design/variants/activate'&&request.method==='POST')return jsonResponse(await studioActivateVariant(env,identity,await studioJsonBody(request)));
    if(url.pathname==='/api/design/history'&&request.method==='GET')return jsonResponse({history:await studioHistory(env,identity)});
    if(url.pathname==='/api/design'&&request.method==='PUT'){
      const input=await studioJsonBody(request);if(Object.keys(input).some(k=>!['layout','expected_storage_revision','expected_scene_revision','request_id'].includes(k)))throw new StudioStorageError('Unknown save field.');
      return jsonResponse(await studioWrite(env,identity,input,input.layout,'browser','Viewer edit'));
    }
    if(url.pathname==='/api/design/restore'&&request.method==='POST'){
      const input=await studioJsonBody(request);if(Object.keys(input).some(k=>!['revision','expected_storage_revision','expected_scene_revision','request_id'].includes(k)))throw new StudioStorageError('Unknown restore field.');
      return jsonResponse(await studioRestore(env,identity,input));
    }
    return jsonResponse({error:'Route not found.'},404);
  }catch(error){
    if(!(error instanceof StudioStorageError)&&!error.message?.startsWith('Invalid')&&!error.message?.startsWith('Only')&&!error.message?.startsWith('Different'))console.error('Apartment storage request failed:',error.message);
    const known=error instanceof StudioStorageError;
    return jsonResponse({error:known?error.message:'Saved designs are temporarily unavailable. Your device draft is preserved.',code:known?error.code:'storage_unavailable',...(error.current?{current:error.current}:{}),...(error.validation?{validation:error.validation}:{})},known?error.status:503);
  }
}
