/* Device drafts are recoverable; the signed-in saved design is authoritative. */
const cloudTypes=[...new Set(LIB.flatMap(c=>c.items.map(i=>i[0])))];
const cloudMetaKey='type-b-cloud-v1',cloudDraftKey='type-b-conflict-draft-v1';
let cloudMeta={};try{cloudMeta=JSON.parse(localStorage.getItem(cloudMetaKey))||{};}catch{}
const cloud={ready:false,busy:false,dirty:false,suppress:false,base:null,conflict:null,pending:null,timer:null,retryAt:0,failures:0,pointer:false,status:'Connecting saved design…'};
const cloudFingerprint=l=>studioLogicalKey(studioPrepareCloudLayout(l,MODEL,cloudTypes));
const cloudRequestId=()=>globalThis.crypto?.randomUUID?.()||'browser-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
function cloudPaint(message){
  if(message)cloud.status=message;
  const el=$('#cloudIndicator');if(el){el.textContent=cloud.status;el.dataset.state=cloud.conflict?'conflict':cloud.dirty?'draft':cloud.ready?'saved':'connecting';}
  if($('#cloudStatus'))$('#cloudStatus').textContent=cloud.status;
  if($('#cloudConflict'))$('#cloudConflict').hidden=!cloud.conflict;
  if($('#cloudAccount'))$('#cloudAccount').textContent=cloud.base?.account?.email?`Saved for ${cloud.base.account.email}`:'Your saved design is available to this ChatGPT account.';
  if($('#cloudSavedAt'))$('#cloudSavedAt').textContent=cloud.base?.initialized?`Revision ${cloud.base.storage_revision} · ${new Date(cloud.base.updated_at).toLocaleString()} · ${cloud.base.summary}`:'The first completed save creates your design.';
  if($('#cloudSignIn'))$('#cloudSignIn').hidden=!!cloud.base?.account;
}
function cloudMarkBase(saved){
  cloud.base=saved;
  if(saved.initialized){
    cloudMeta={owner_id:saved.account.id,fingerprint:cloudFingerprint(saved.brief.layout),storage_revision:saved.storage_revision,scene_revision:saved.scene_revision};
    try{localStorage.setItem(cloudMetaKey,JSON.stringify(cloudMeta));}catch{}
  }
}
function cloudBackup(){try{localStorage.setItem(cloudDraftKey,JSON.stringify({owner_id:cloud.base?.account?.id||cloudMeta.owner_id||null,brief:studioBrief(),at:new Date().toISOString()}));}catch{}}
function cloudAccept(saved,undoable=false){
  const next=saved.brief.layout;studioAssertLayout(next,MODEL,cloudTypes);
  const changed=cloudFingerprint(state)!==cloudFingerprint(next),before=snap();
  cloud.suppress=true;
  try{
    state=JSON.parse(JSON.stringify(next));
    if(undoable&&changed){undoStack.push(before);if(undoStack.length>150)undoStack.shift();redoStack.length=0;}
    validateSel();save();renderAll();
    if($('#studioDialog').open)studioRenderPanel();
  }finally{cloud.suppress=false;}
  cloud.dirty=false;cloud.pending=null;cloud.conflict=null;cloudMarkBase(saved);
  cloudPaint('Saved · revision '+saved.storage_revision);
  if(undoable&&changed)toast(saved.source==='agent'?'Agent design received. Undo or Saved design → History restores the previous scene.':'Saved design updated. Undo restores the previous scene.');
}
function cloudConflict(saved){
  cloudBackup();cloud.conflict=saved;cloud.pending=null;cloud.dirty=true;
  cloudPaint('Review versions');
  if($('#cloudConflictText'))$('#cloudConflictText').textContent=`A saved version${saved.initialized?' (revision '+saved.storage_revision+')':''} differs from this device draft. Choose which design to continue. Your draft is preserved.`;
}
async function cloudFetch(path,options={}){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
  try{
    const response=await fetch(path,{credentials:'same-origin',cache:'no-store',signal:controller.signal,...options});
    const data=await response.json();
    if(!response.ok){const error=new Error(data.error||'Saved design is unavailable.');error.status=response.status;error.current=data.current;throw error;}
    return data;
  }finally{clearTimeout(timeout);}
}
function cloudFailure(error){
  if(error.status===409&&error.current){cloudConflict(error.current);return;}
  cloud.failures++;cloud.retryAt=Date.now()+Math.min(30000,3000*2**Math.min(cloud.failures-1,4));
  cloudPaint(error.status===401?'Sign in to save':cloud.dirty?'Device draft · save pending':'Saved design unavailable');
  if($('#cloudError'))$('#cloudError').textContent=error.status===401?'Sign in with ChatGPT to read and save your design.':error.message||'Connection lost. Your device draft is preserved.';
}
function cloudSuccess(){cloud.failures=0;cloud.retryAt=0;if($('#cloudError'))$('#cloudError').textContent='';}
async function cloudConnect(){
  if(cloud.busy||typeof fetch!=='function')return;
  cloud.busy=true;
  try{
    const saved=await cloudFetch('/api/design');cloudSuccess();
    if(cloudMeta.owner_id&&cloudMeta.owner_id!==saved.account.id){
      cloudBackup();cloud.suppress=true;state=fixState(defaultState());save();renderAll();cloud.suppress=false;cloud.dirty=false;cloud.pending=null;
    }
    const fingerprint=cloudFingerprint(state),matches=saved.initialized&&fingerprint===cloudFingerprint(saved.brief.layout);
    const hasDraft=!!localStorage.getItem(STORE)&&fingerprint!==cloudFingerprint(fixState(defaultState()));
    const previouslySaved=cloudMeta.owner_id===saved.account.id&&cloudMeta.fingerprint===fingerprint;
    const sameSavedBase=cloudMeta.owner_id===saved.account.id&&cloudMeta.storage_revision===saved.storage_revision&&cloudMeta.scene_revision===saved.scene_revision;
    cloud.ready=true;
    if(saved.initialized){
      if(matches||!cloud.dirty&&(!hasDraft||previouslySaved))cloudAccept(saved);
      else if(sameSavedBase){cloudMarkBase(saved);cloud.dirty=true;cloudPaint('Saving recovered device draft…');}
      else {cloud.base=saved;cloudConflict(saved);}
    }else{cloud.base=saved;cloud.dirty=true;cloudPaint('Saving first design…');}
  }catch(error){cloudFailure(error);}finally{cloud.busy=false;}
  if(cloud.ready&&cloud.dirty&&!cloud.conflict&&Date.now()>=cloud.retryAt)void cloudFlush();
}
function cloudChanged(){
  if(cloud.suppress)return;
  cloud.dirty=true;cloudPaint(cloud.conflict?'Review versions':'Saving…');
  clearTimeout(cloud.timer);cloud.timer=setTimeout(()=>void cloudFlush(),650);
}
async function cloudFlush(force=false){
  if(cloud.busy||cloud.conflict)return;
  if(!cloud.ready){await cloudConnect();return;}
  if(!cloud.dirty&&!cloud.pending)return;
  if(!force&&Date.now()<cloud.retryAt)return;
  cloud.busy=true;
  try{
    if(!cloud.pending){const layout=studioPrepareCloudLayout(state,MODEL,cloudTypes);cloud.pending={layout,fingerprint:cloudFingerprint(layout),request_id:cloudRequestId(),expected_storage_revision:cloud.base.initialized?cloud.base.storage_revision:0,expected_scene_revision:cloud.base.initialized?cloud.base.scene_revision:null};}
    const pending=cloud.pending,{fingerprint,...input}=pending;
    cloudPaint('Saving…');
    const body=JSON.stringify(input),saved=await cloudFetch('/api/design',{method:'PUT',headers:{'Content-Type':'application/json'},body,keepalive:body.length<60000});
    cloudSuccess();cloud.pending=null;
    if(cloudFingerprint(state)===fingerprint)cloudAccept(saved);
    else {cloudMarkBase(saved);cloud.dirty=true;cloudPaint('Saving…');}
  }catch(error){cloudFailure(error);}finally{cloud.busy=false;}
  if(cloud.dirty&&!cloud.conflict&&Date.now()>=cloud.retryAt){clearTimeout(cloud.timer);cloud.timer=setTimeout(()=>void cloudFlush(),650);}
}
async function cloudPoll(){
  if(document.hidden||cloud.busy||cloud.conflict||cloud.pointer||Date.now()<cloud.retryAt||document.activeElement?.matches('input,textarea,select'))return;
  if(!cloud.ready){await cloudConnect();return;}
  if(cloud.dirty||cloud.pending){await cloudFlush();return;}
  cloud.busy=true;
  try{
    const saved=await cloudFetch('/api/design');cloudSuccess();
    if(saved.account.id!==cloud.base.account.id){cloud.ready=false;cloudPaint('Account changed · reconnect');return;}
    if(saved.initialized&&saved.storage_revision!==cloud.base.storage_revision){
      const draftChanged=cloud.dirty||cloud.pending||cloudFingerprint(state)!==cloudFingerprint(cloud.base.brief.layout);
      if(draftChanged&&cloudFingerprint(state)!==cloudFingerprint(saved.brief.layout))cloudConflict(saved);
      else cloudAccept(saved,true);
    }
  }catch(error){cloudFailure(error);}finally{cloud.busy=false;}
}
async function cloudLoadHistory(){
  $('#cloudHistory').textContent='Loading previous designs…';
  try{
    const data=await cloudFetch('/api/design/history');cloudSuccess();
    const list=$('#cloudHistory');list.replaceChildren();
    if(!data.history.length){list.textContent='No previous saves yet.';return;}
    for(const h of data.history){
      const row=document.createElement('div');row.className='cloud-history-row';
      const text=document.createElement('span');text.textContent=`Revision ${h.revision} · ${h.summary}\n${new Date(h.updated_at).toLocaleString()}`;
      const button=document.createElement('button');button.className='btn';button.textContent=h.revision===cloud.base?.storage_revision?'Current':'Restore';button.disabled=h.revision===cloud.base?.storage_revision;
      button.onclick=async()=>{
        if(cloud.busy||cloud.dirty||cloud.conflict){toast('Save or resolve this device draft before restoring a previous design.');return;}
        cloud.busy=true;button.disabled=true;const before=cloudFingerprint(state);
        try{const saved=await cloudFetch('/api/design/restore',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:h.revision,expected_storage_revision:cloud.base.storage_revision,expected_scene_revision:cloud.base.scene_revision,request_id:cloudRequestId()})});if(cloudFingerprint(state)!==before)cloudConflict(saved);else cloudAccept(saved,true);cloudSuccess();await cloudLoadHistory();}
        catch(error){cloudFailure(error);button.disabled=false;}finally{cloud.busy=false;}
      };
      row.append(text,button);list.append(row);
    }
  }catch(error){$('#cloudHistory').textContent=error.message;cloudFailure(error);}
}
function cloudOpen(){cloudPaint();$('#cloudDialog').showModal();if(cloud.base?.initialized)void cloudLoadHistory();}
$('#cloudDesign').onclick=cloudOpen;$('#cloudClose').onclick=()=>$('#cloudDialog').close();
$('#cloudSyncNow').onclick=async()=>{cloud.retryAt=0;if(cloud.dirty)await cloudFlush(true);else await cloudPoll();};
$('#cloudUseSaved').onclick=()=>{if(!cloud.conflict?.initialized)return;cloudBackup();cloudAccept(cloud.conflict,true);void cloudLoadHistory();};
$('#cloudUseDevice').onclick=()=>{if(!cloud.conflict)return;cloudBackup();cloudMarkBase(cloud.conflict);cloud.conflict=null;cloud.pending=null;cloud.dirty=true;cloudPaint('Saving selected device draft…');void cloudFlush(true);};
$('#cloudDownloadDraft').onclick=()=>studioDownload('type-b-device-draft.json',studioBrief());
$('#cloudRecoverDraft').onclick=()=>{
  try{const backup=JSON.parse(localStorage.getItem(cloudDraftKey));if(!backup?.brief||backup.owner_id!==cloud.base?.account?.id)throw new Error('No recovery draft for this account.');
    const before=snap();state=fixState(backup.brief.layout);commit(before);renderAll();cloudConflict(cloud.base);toast('Recovery draft loaded. Choose a version to continue.');
  }catch(error){toast(error.message);}
};
window.ApartmentCloud={changed:cloudChanged,flush:()=>cloudFlush(true),poll:cloudPoll,connect:cloudConnect,open:cloudOpen,briefInfo:()=>cloud.base?.initialized?{storage_revision:cloud.base.storage_revision,scene_revision:cloud.base.scene_revision,status:cloud.conflict?'conflict':cloud.dirty?'pending':'saved'}:undefined};
document.addEventListener('pointerdown',()=>cloud.pointer=true);
document.addEventListener('pointerup',()=>cloud.pointer=false);document.addEventListener('pointercancel',()=>cloud.pointer=false);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)void cloudPoll();});
addEventListener('online',()=>{cloud.retryAt=0;void cloudPoll();});
addEventListener('pagehide',()=>{clearTimeout(cloud.timer);if(cloud.dirty)void cloudFlush(true);});
cloudPaint();if(typeof fetch==='function'){void cloudConnect();setInterval(()=>void cloudPoll(),3000);}
