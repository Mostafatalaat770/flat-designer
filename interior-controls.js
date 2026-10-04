const interiorUI={object:null,draft:null,lastReport:null,views:new Map(),loadingView:false,pendingCapture:null,variants:[],savingView:false};
const interiorLabel=s=>String(s).replaceAll('-',' ').replace(/\b\w/g,c=>c.toUpperCase());
const interiorOptions=(items,value)=>items.map(([id,name])=>`<option value="${esc(id)}" ${id===value?'selected':''}>${esc(name)}</option>`).join('');
function interiorReviewProposal(p){
  try{const next=studioValidateProposal(p,state,MODEL),validation=interiorValidation(next,MODEL,p.operations.filter(o=>o.type==='furniture-placement').map(o=>o.furniture_id));return {valid:validation.valid,validation,candidate_scene_revision:studioSceneKey(next)};}
  catch(error){return {valid:false,validation:error.validation||{schema:'ApartmentInteriorValidation/1',status:'FAIL',valid:false,checks:[{kind:'contract',status:'FAIL',message:error.message}],summary:{pass:0,warning:0,fail:1}}};}
}
function interiorProposal(operations){return {schema:'ApartmentDesignProposal/2',canonical_sha256:MODEL.canonical_sha256,base_scene_revision:studioSceneKey(state),operations,author:'Viewer',notes:[]};}
function interiorCommit(operations){
  try{const p=interiorProposal(operations),review=interiorReviewProposal(p);interiorUI.lastReport=review.validation;if(!review.valid){interiorShowReport(review.validation);return false;}studioApplyProposal(p);interiorUI.draft=null;for(const op of operations){if(op.type==='add-object')interiorUI.object=op.object.id;if(op.type==='update-object')interiorUI.object=op.object_id;if(op.type==='remove-object')interiorUI.object=null;}studioRenderPanel();toast(review.validation.status==='WARNING'?'Design updated. Clearance warnings are available in the report.':'Interior design updated. Undo restores it.');return true;}
  catch(error){toast(error.message);return false;}
}
function interiorShowReport(report){
  $('#proposalPreview').textContent=JSON.stringify(report,null,2);$('#applyProposal').disabled=true;$('#proposalDialog').showModal();
}
function interiorDraft(type,roomId){
  const spec=INTERIOR_OBJECT_TYPES[type],room=ROOMS.find(r=>r.id===roomId),surfaces=interiorSurfaces(MODEL).surfaces,mode=spec.modes[0];
  const o={id:'obj-'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)),type,variant:spec.variants[0],room_id:roomId,placement:{mode},cx:room.at[0],cy:room.at[1],rotation:0,width_mm:spec.size[0],depth_mm:spec.size[1],height_mm:spec.size[2],material_references:{primary:['curtain','bench'].includes(type)?'generic-linen':'generic-lightoak'},colour:'#c3a783',status:'EXPLORATORY',metadata:{}};
  if(mode==='wall'){const host=surfaces.filter(s=>s.type==='wall'&&s.room_id===roomId&&s.length_mm>=o.width_mm).sort((a,b)=>b.length_mm-a.length_mm)[0];if(host)o.placement.host_wall_id=host.id;o.placement.offset_mm=0;o.placement.elevation_mm=['artwork','mirror'].includes(type)?1100:0;o.height_mm=Math.min(o.height_mm,2500-o.placement.elevation_mm);}
  if(mode==='opening'){const host=surfaces.find(s=>s.type==='opening'&&s.room_ids.includes(roomId)&&s.id.startsWith('GLZ-'));if(host){o.placement.host_opening_id=host.id;o.width_mm=Math.min(o.width_mm,host.length_mm);}o.metadata.openness=.7;}
  if(mode==='ceiling'){o.placement.drop_mm=80;}
  if(type==='artwork')o.material_references.primary='reference-art-warm';
  if(['pendant','floor-lamp','table-lamp'].includes(type))o.material_references.primary='generic-linen';
  // Find an initially unoccupied position; the owner can still adjust every dimension.
  if(['floor','ceiling'].includes(mode)){
    const solids=interiorSolids(state,MODEL),xs=room.poly.map(p=>p[0]),ys=room.poly.map(p=>p[1]);let found=false;
    for(let y=Math.min(...ys)+o.depth_mm/2+180;y<Math.max(...ys)&&!found;y+=300)for(let x=Math.min(...xs)+o.width_mm/2+180;x<Math.max(...xs);x+=300){
      o.cx=x;o.cy=y;const r=interiorResolved(o,MODEL);if(!interiorFits(r,room))continue;
      if(solids.some(f=>f.room_id===roomId&&f.bottom_mm<r.top_mm&&f.top_mm>r.bottom_mm&&interiorPolygonGap(studioFootprint(f),studioFootprint(r))<100))continue;
      if(MODEL.doors.some(d=>interiorPolygonGap(studioFootprint(r),interiorDoorSector(d))<150))continue;found=true;break;
    }
    if(!found){o.cx=room.at[0];o.cy=room.at[1];}
  }return o;
}
function interiorObjectPanel(){
  const objects=interiorLayer(state).objects.filter(o=>o.room_id===studioUI.room);
  if(interiorUI.object&&!objects.some(o=>o.id===interiorUI.object)){interiorUI.object=null;interiorUI.draft=null;}
  let o=interiorUI.draft||objects.find(o=>o.id===interiorUI.object);
  if(!o||o.room_id!==studioUI.room)o=interiorUI.draft=interiorDraft('divider',studioUI.room);
  const spec=INTERIOR_OBJECT_TYPES[o.type],surfaces=interiorSurfaces(MODEL).surfaces,m=o.placement.mode,numeric=(id,label,v,step=10)=>`<label>${label}<input id="${id}" type="number" step="${step}" value="${v}"></label>`;
  return `<div class="interior-layout"><div><div class="interior-toolbar"><button class="btn" id="interiorNew">New object</button><span>${objects.length} objects in this room</span></div><div class="interior-list">${objects.map(x=>`<button class="interior-card ${x.id===interiorUI.object?'selected':''}" data-interior-id="${x.id}"><b>${esc(interiorLabel(x.type))}</b><span>${esc(interiorLabel(x.variant))} · ${x.width_mm} × ${x.depth_mm} × ${x.height_mm} mm</span><small>${esc(x.placement.host_wall_id||x.placement.host_opening_id||x.placement.mode)} · approximate model</small></button>`).join('')||'<p>Add a divider, artwork, lighting or storage. Each item is removable and stays separate from architecture.</p>'}</div></div><form id="interiorEditor"><h3>${interiorUI.object?'Edit object':'Add interior object'}</h3><div class="studio-grid">${studioOptionSelect('interiorType','Object type',Object.keys(INTERIOR_OBJECT_TYPES).map(k=>[k,interiorLabel(k)]),o.type)}${studioOptionSelect('interiorVariant','Form',spec.variants.map(k=>[k,interiorLabel(k)]),o.variant)}${studioOptionSelect('interiorMode','Mounting',spec.modes.map(k=>[k,interiorLabel(k)+' mounted']),m)}${studioOptionSelect('interiorMaterial','Primary material',interiorMaterials(state).map(k=>[k.id,k.name+' · '+k.source_status]),o.material_references.primary)}${numeric('interiorWidth','Width · mm',o.width_mm)}${numeric('interiorDepth','Depth · mm',o.depth_mm)}${numeric('interiorHeight','Height · mm',o.height_mm)}<label>Colour fallback<input type="color" id="interiorColour" value="${o.colour}"></label>${['floor','ceiling'].includes(m)?numeric('interiorX','Plan X · mm',o.cx)+numeric('interiorY','Plan Y · mm',o.cy)+numeric('interiorRotation','Rotation · degrees',o.rotation,1):''}${m==='wall'?studioOptionSelect('interiorHost','Host wall',surfaces.filter(s=>s.type==='wall'&&s.room_id===o.room_id).map(s=>[s.id,s.id+' · '+Math.round(s.length_mm)+' mm']),o.placement.host_wall_id):''}${m==='opening'?studioOptionSelect('interiorHost','Existing opening',surfaces.filter(s=>s.type==='opening'&&s.room_ids.includes(o.room_id)).map(s=>[s.id,s.id+' · '+Math.round(s.length_mm)+' mm']),o.placement.host_opening_id):''}${['wall','opening'].includes(m)?numeric('interiorOffset','Offset from host midpoint · mm',o.placement.offset_mm||0)+numeric('interiorInset','Inset from wall face · mm',o.placement.inset_mm??1):''}${m==='ceiling'?numeric('interiorDrop','Drop from fixed ceiling to top · mm',o.placement.drop_mm||0):numeric('interiorElevation','Object bottom above floor · mm',o.placement.elevation_mm||0)}${o.type==='curtain'?numeric('interiorOpenness','Curtain openness · 0 to 1',o.metadata.openness??.7,.1):''}</div><div class="interior-toolbar"><button type="submit" class="btn primary">${interiorUI.object?'Validate & update':'Validate & add'}</button>${interiorUI.object?'<button type="button" class="btn" id="interiorRemove">Remove object</button>':''}</div><p class="studio-note">Wall offsets follow the canonical segment direction. Table lamps can sit on a surface using bottom elevation. Mounted items follow their host; dimensions must fit below the fixed 2500 mm ceiling. Models approximate a form and material.</p></form></div>`;
}
function interiorReadEditor(){
  const o=interiorClone(interiorUI.draft||interiorLayer(state).objects.find(o=>o.id===interiorUI.object)),num=id=>Number($('#'+id).value),mode=$('#interiorMode').value;
  o.variant=$('#interiorVariant').value;o.colour=$('#interiorColour').value;o.material_references.primary=$('#interiorMaterial').value;
  for(const [key,id] of [['width_mm','interiorWidth'],['depth_mm','interiorDepth'],['height_mm','interiorHeight']])o[key]=num(id);
  o.placement={mode};if(['floor','ceiling'].includes(mode)){o.cx=num('interiorX');o.cy=num('interiorY');o.rotation=num('interiorRotation');}
  if(['wall','opening'].includes(mode)){o.placement[mode==='wall'?'host_wall_id':'host_opening_id']=$('#interiorHost').value;o.placement.offset_mm=num('interiorOffset');o.placement.inset_mm=num('interiorInset');}
  if(mode==='ceiling')o.placement.drop_mm=num('interiorDrop');else o.placement.elevation_mm=num('interiorElevation');
  if(o.type==='curtain')o.metadata.openness=num('interiorOpenness');return o;
}
function interiorMaterialsPanel(){
  const surfaces=interiorSurfaces(MODEL).surfaces.filter(s=>s.room_id===studioUI.room&&s.type!=='opening'),materials=interiorMaterials(state),selected=state.interior?.surface_materials||{};
  const opening=MODEL.openings.filter(o=>o.between.includes(studioUI.room)&&o.id.startsWith('GLZ-'));
  return `<p>Assign a material to an exact floor, ceiling or wall segment. No walls or openings move. Missing textures fall back to procedural or simple PBR materials.</p><div class="studio-grid">${surfaces.map(s=>`<label>${esc(s.id)}<select data-surface-id="${s.id}">${interiorOptions([['','Follow existing room/style finish'],...materials.map(m=>[m.id,m.name])],selected[s.id]||'')}</select></label>`).join('')}</div><h3>Opening treatments</h3><div class="studio-grid">${opening.map(o=>{const t=interiorLayer(state).opening_treatments[o.id];return `<label>${o.id}<select data-treatment-id="${o.id}">${interiorOptions([['','Follow existing style'],['none','No treatment'],['sheer','Sheer curtain'],['drapery','Drapery'],['layered','Layered curtain'],['roller','Roller blind']],t?t.type==='none'?'none':t.variant:'')}</select></label>`;}).join('')}</div><p class="studio-note">Treatments start 70% open. For precise widths, heights and openness, add an opening-mounted curtain in Interior objects or use an agent proposal.</p><h3>Extend the material library</h3><p>Import an InteriorMaterial/1 JSON definition, or an array of definitions. Include product provenance, optional tile dimensions and texture URLs. New materials become available throughout this design.</p><label class="btn">Import materials<input type="file" id="interiorMaterialFile" accept="application/json,.json" hidden></label><button class="btn" id="interiorMaterialExport">Export material library</button><div class="interior-materials">${materials.map(m=>`<article><i style="background:${m.base_colour}"></i><div><b>${esc(m.name)}</b><small>${esc(m.category)} · ${m.source_status} · ${esc(m.finish||'matte')}</small>${m.product_url?`<a href="${esc(m.product_url)}" target="_blank" rel="noopener">${esc(m.manufacturer||'Source')} · ${esc(m.product_name||'Reference')}</a>`:''}</div></article>`).join('')}</div>`;
}
function interiorClearancePanel(){
  const report=interiorValidation(state,MODEL),checks=report.checks.filter(c=>!c.room_id||c.room_id===studioUI.room),rank={FAIL:0,WARNING:1,PASS:2};checks.sort((a,b)=>rank[a.status]-rank[b.status]);
  return `<div class="interior-summary" data-status="${report.status}"><b>${report.status}</b><span>${report.summary.fail} failures · ${report.summary.warning} review warnings · ${report.summary.pass} passes</span><button class="btn" id="interiorReportExport">Download measured report</button></div><p class="studio-note">Distances use the displayed conceptual geometry. Negative values mean overlap. Circulation uses a conservative 125 mm sampled path; nearest gaps are separate pinch candidates. 900 mm is a comfort target, 750 mm a review threshold. Confirm construction and equipment clearances separately.</p><div class="interior-report"><table><thead><tr><th>Check / object</th><th>Status</th><th>Measured mm</th><th>Meaning</th></tr></thead><tbody>${checks.map(c=>`<tr><td>${esc(interiorLabel(c.kind))}<small>${esc(c.object_id||c.object_ids?.join(' / ')||c.opening_id||c.from||'')}${c.to?' → '+esc(c.to):''}</small></td><td><b data-status="${c.status}">${c.status}</b></td><td>${c.measured_clearance_mm===undefined?'—':c.measured_clearance_mm}</td><td>${esc(c.message)}${c.preferred_clearance_mm?'<small>Preferred: '+c.preferred_clearance_mm+' mm</small>':''}</td></tr>`).join('')}</tbody></table></div>`;
}
function interiorMatchingView(roomId){const view=interiorUI.views.get(roomId);return view?.scene_revision===studioSceneKey(state)?view:null;}
async function interiorLoadView(){
  if(interiorUI.loadingView)return;interiorUI.loadingView=true;const room=studioUI.room;
  try{const data=await cloudFetch('/api/scene-view?room_id='+encodeURIComponent(room));if(data.initialized)interiorUI.views.set(room,data);if(studioUI.tab==='render'&&studioUI.room===room)interiorPaintView();}catch(error){if($('#interiorViewStatus'))$('#interiorViewStatus').textContent=error.message;}finally{interiorUI.loadingView=false;}
}
function interiorPaintView(){
  const holder=$('#interiorSavedView');if(!holder)return;const view=interiorUI.views.get(studioUI.room),match=interiorMatchingView(studioUI.room);
  holder.replaceChildren();if(!view){holder.textContent='No saved camera for this room yet. Position the 3D camera, choose full walls, then save the view.';return;}
  const status=document.createElement('p');status.textContent=(match?'Current render reference':'Older view — save this scene again')+' · '+view.scene_revision+' · '+new Date(view.timestamp).toLocaleString();holder.append(status);
  const img=document.createElement('img');img.src=view.image.url;img.alt='Saved WebGL view at '+view.scene_revision;img.loading='lazy';holder.append(img);
}
async function interiorEnsureSaved(){
  const deadline=Date.now()+12000;while(cloud.busy&&Date.now()<deadline)await new Promise(r=>setTimeout(r,50));await window.ApartmentCloud.flush();const info=window.ApartmentCloud.briefInfo();
  if(!info||info.status!=='saved'||info.scene_revision!==studioSceneKey(state))throw new Error('Finish saving or resolve the device draft before capturing this design.');return info;
}
async function interiorSaveView(){
  if(interiorUI.savingView)return;interiorUI.savingView=true;
  const button=$('#saveAiView');if(button)button.disabled=true;
  try{
    if(!is3D())throw new Error('Open the 3D viewer and position the camera first.');const info=await interiorEnsureSaved(),report=interiorValidation(state,MODEL);if(!report.valid){interiorShowReport(report);throw new Error('Resolve hard placement failures before saving a render reference.');}
    const roomId=window.View3D.currentRoom?.()||studioUI.room;if(studioUI.room!==roomId){studioUI.room=roomId;if($('#studioDialog').open)studioRenderPanel();}const capture=await window.View3D.captureAiView(roomId);if(capture.scene_revision!==info.scene_revision)throw new Error('The scene changed during capture. Save the current design and try again.');
    const metadata={schema:'ApartmentSceneView/1',view_id:cloudRequestId(),scene_revision:capture.scene_revision,expected_storage_revision:info.storage_revision,room_id:capture.room_id,camera:capture.camera,timestamp:capture.timestamp};
    interiorUI.pendingCapture={capture,metadata};if($('#interiorRetryView'))$('#interiorRetryView').hidden=false;await interiorSendCapture();
  }catch(error){toast(error.message);if($('#interiorViewStatus'))$('#interiorViewStatus').textContent=error.message;}finally{interiorUI.savingView=false;if(button)button.disabled=false;}
}
async function interiorSendCapture(){
  const pending=interiorUI.pendingCapture;if(!pending)return;
  const body=new FormData();body.append('metadata',JSON.stringify(pending.metadata));body.append('image',pending.capture.png,'scene.png');
  const data=await cloudFetch('/api/scene-view',{method:'POST',body});interiorUI.views.set(data.room_id,data);interiorUI.pendingCapture=null;if($('#interiorRetryView'))$('#interiorRetryView').hidden=true;interiorPaintView();if($('#interiorViewStatus'))$('#interiorViewStatus').textContent='PNG and exact camera saved for connected agents.';toast('View saved for AI render. Connected agents can retrieve the PNG.');
}
function interiorExtendPanel(){
  const body=$('#studioBody');if(studioUI.tab==='objects'){body.insertAdjacentHTML('beforeend',interiorObjectPanel());
    $('#interiorNew').onclick=()=>{interiorUI.object=null;interiorUI.draft=null;studioRenderPanel();};
    document.querySelectorAll('[data-interior-id]').forEach(b=>b.onclick=()=>{interiorUI.object=b.dataset.interiorId;interiorUI.draft=null;studioRenderPanel();});
    $('#interiorType').onchange=e=>{const draft=interiorDraft(e.target.value,studioUI.room);if(interiorUI.object)draft.id=interiorUI.object;interiorUI.draft=draft;studioRenderPanel();};
    $('#interiorMode').onchange=e=>{const o=interiorClone(interiorUI.draft||interiorLayer(state).objects.find(o=>o.id===interiorUI.object)),base=interiorDraft(o.type,o.room_id);o.placement={mode:e.target.value};if(e.target.value==='wall')o.placement.host_wall_id=interiorSurfaces(MODEL).surfaces.find(s=>s.type==='wall'&&s.room_id===o.room_id)?.id;if(e.target.value==='opening')o.placement.host_opening_id=base.placement.host_opening_id;interiorUI.draft=o;studioRenderPanel();};
    $('#interiorEditor').onsubmit=e=>{e.preventDefault();const o=interiorReadEditor(),operation=interiorUI.object?{type:'update-object',object_id:o.id,changes:Object.fromEntries(Object.entries(o).filter(([k])=>k!=='id'))}:{type:'add-object',object:o};if(interiorCommit([operation])){interiorUI.object=o.id;studioRenderPanel();}};
    if($('#interiorRemove'))$('#interiorRemove').onclick=()=>{if(interiorCommit([{type:'remove-object',object_id:interiorUI.object}])){interiorUI.object=null;studioRenderPanel();}};
  }
  if(studioUI.tab==='materials'){body.insertAdjacentHTML('beforeend',interiorMaterialsPanel());
    document.querySelectorAll('[data-surface-id]').forEach(s=>s.onchange=()=>{const ref=interiorSurfaces(MODEL).surfaces.find(x=>x.id===s.dataset.surfaceId);interiorCommit([ref.type==='wall'?{type:'set-wall-surface-material',host_wall_id:ref.id,material_id:s.value||null}:{type:'set-room-surface-material',room_id:ref.room_id,surface:ref.type,material_id:s.value||null}]);});
    document.querySelectorAll('[data-treatment-id]').forEach(s=>s.onchange=()=>{const value=s.value;interiorCommit([{type:'set-opening-treatment',opening_id:s.dataset.treatmentId,treatment:value?{type:value==='none'?'none':value==='roller'?'blind':'curtain',variant:value==='none'?'sheer':value,material_id:'generic-linen',colour:'#dfd3bb',openness:.7,room_id:studioUI.room}:null}]);});
    $('#interiorMaterialFile').onchange=async e=>{try{const f=e.target.files[0];if(!f)return;if(f.size>250000)throw new Error('Material definitions exceed 250 KB.');const value=JSON.parse(await f.text()),materials=Array.isArray(value)?value:[value];if(materials.length>100)throw new Error('Import up to 100 material definitions.');interiorCommit(materials.map(material=>({type:'upsert-material',material})));}catch(error){toast(error.message);}};
    $('#interiorMaterialExport').onclick=()=>studioDownload('type-b-material-library.json',interiorMaterials(state));
  }
  if(studioUI.tab==='clearances'){body.insertAdjacentHTML('beforeend',interiorClearancePanel());$('#interiorReportExport').onclick=()=>studioDownload('type-b-clearance-report.json',interiorValidation(state,MODEL));}
  if(studioUI.tab==='variants'){
    body.insertAdjacentHTML('beforeend','<section class="interior-variants"><h3>Keep alternative designs</h3><p>Save the current design with a name, then explore another arrangement. Loading a variant copies it into the active design and creates a history entry. Other variants keep their own furniture, finishes and scene revision.</p><form id="interiorVariantForm" class="interior-toolbar"><label>Variant name<input id="interiorVariantName" maxlength="80" placeholder="Reception A — Warm Organic" required></label><button class="btn primary" type="submit">Save current as new variant</button></form><p class="studio-note">After editing a loaded design, use Update from current design to store it back in that named variant. Branches are changed only by that action.</p><p id="interiorVariantStatus" role="status"></p><div id="interiorVariantList"></div></section>');
    $('#interiorVariantForm').onsubmit=async e=>{e.preventDefault();const name=$('#interiorVariantName').value.trim();if(!name)return;await interiorSaveVariant(name);};
    void interiorLoadVariants();
  }
  if(studioUI.tab==='render'){
    body.insertAdjacentHTML('beforeend','<section class="interior-render"><h3>Exact camera reference</h3><p>Position the 3D camera in this room and choose full 2.50 m walls. Save captures the current WebGL PNG, camera and saved design revision together.</p><button class="btn primary" id="interiorSaveView">Save view for AI render</button><button class="btn" id="interiorRetryView">Retry last capture upload</button><p id="interiorViewStatus" role="status"></p><div id="interiorSavedView"></div></section>');
    $('#interiorSaveView').onclick=interiorSaveView;$('#interiorRetryView').hidden=!interiorUI.pendingCapture;$('#interiorRetryView').onclick=()=>interiorSendCapture().catch(e=>toast(e.message));interiorPaintView();void interiorLoadView();
  }
}
async function interiorLoadVariants(){
  try{const data=await cloudFetch('/api/design/variants');interiorUI.variants=data.variants;interiorPaintVariants();}catch(error){if($('#interiorVariantStatus'))$('#interiorVariantStatus').textContent=error.message;}
}
function interiorPaintVariants(){
  const list=$('#interiorVariantList');if(!list)return;list.replaceChildren();
  if(!interiorUI.variants.length){list.textContent='No variants saved yet.';return;}
  for(const v of interiorUI.variants){
    const row=document.createElement('article');row.className='interior-card';const name=document.createElement('b');name.textContent=v.name;const note=document.createElement('small');note.textContent='Variant revision '+v.variant_revision+' · '+v.scene_revision;const actions=document.createElement('div');actions.className='interior-toolbar';
    const load=document.createElement('button');load.className='btn';load.textContent='Load for editing';load.onclick=()=>interiorActivateVariant(v);
    const save=document.createElement('button');save.className='btn';save.textContent='Update from current design';save.onclick=()=>interiorSaveVariant(v.name,v);actions.append(load,save);row.append(name,note,actions);list.append(row);
  }
}
async function interiorSaveVariant(name,variant){
  try{const info=await interiorEnsureSaved(),report=interiorValidation(state,MODEL);if(!report.valid){interiorShowReport(report);return;}const data=await cloudFetch('/api/design/variants',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({variant_id:variant?.variant_id||'variant-'+cloudRequestId(),name,expected_variant_revision:variant?.variant_revision||0,expected_storage_revision:info.storage_revision,expected_scene_revision:info.scene_revision,request_id:cloudRequestId()})});if($('#interiorVariantStatus'))$('#interiorVariantStatus').textContent='Saved '+data.variant.name+' independently.';await interiorLoadVariants();toast('Named variant saved.');}
  catch(error){toast(error.message);if($('#interiorVariantStatus'))$('#interiorVariantStatus').textContent=error.message;}
}
async function interiorActivateVariant(variant){
  try{const info=await interiorEnsureSaved(),before=cloudFingerprint(state),saved=await cloudFetch('/api/design/variants/activate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({variant_id:variant.variant_id,expected_variant_revision:variant.variant_revision,expected_storage_revision:info.storage_revision,expected_scene_revision:info.scene_revision,request_id:cloudRequestId()})});if(cloudFingerprint(state)!==before)cloudConflict(saved);else cloudAccept(saved,true);toast('Loaded '+variant.name+'. The previous design is in History.');}
  catch(error){toast(error.message);if($('#interiorVariantStatus'))$('#interiorVariantStatus').textContent=error.message;}
}
function interiorRenderPlan(){const g=$('#gInterior');if(!g)return;g.setAttribute('display',ui.layers.furn?'inline':'none');g.innerHTML=interiorLayer(state).objects.map(o=>{const r=interiorResolved(o,MODEL);return `<g data-interior-plan="${o.id}" transform="translate(${r.cx} ${r.cy}) rotate(${r.rot})"><title>${esc(interiorLabel(o.type))} · ${esc(o.id)} · reversible object</title><rect x="${-r.w/2}" y="${-r.d/2}" width="${r.w}" height="${r.d}" rx="12" fill="${o.colour}" fill-opacity=".65" stroke="#315d80" stroke-width="12" ${o.placement.mode==='ceiling'?'stroke-dasharray="35 20"':''}/></g>`;}).join('');g.querySelectorAll('[data-interior-plan]').forEach(el=>{el.onpointerdown=e=>e.stopPropagation();el.onclick=e=>{e.stopPropagation();const o=interiorLayer(state).objects.find(o=>o.id===el.dataset.interiorPlan);studioUI.room=o.room_id;studioUI.tab='objects';interiorUI.object=o.id;interiorUI.draft=null;studioOpen();};});}
function interiorSelect(id){const o=interiorLayer(state).objects.find(o=>o.id===id),t=Object.entries(interiorLayer(state).opening_treatments).find(([key])=>'treatment-'+key===id);if(o){studioUI.room=o.room_id;studioUI.tab='objects';interiorUI.object=o.id;interiorUI.draft=null;studioRenderPanel();$('#studioDialog').show();}else if(t){studioUI.room=t[1].room_id;studioUI.tab='materials';studioRenderPanel();$('#studioDialog').show();}}
$('#saveAiView').onclick=interiorSaveView;
