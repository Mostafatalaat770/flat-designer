/* Exercise the real Worker, generated SQL and browser sync with local identities. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {LocalD1,clone,api,rpc,saveInput,proposal,applyArgs,key,settle,viewer} from './qa-cloud-support.mjs';

const env={DB:new LocalD1()},owner='owner-a';
const baseline=JSON.parse(fs.readFileSync('fixtures/agent-starter-brief.json','utf8'));
assert.equal((await api(env,null)).status,401);
assert.equal((await api({},owner)).status,503);
assert.equal((await rpc(env,owner,'get_current_apartment_design_brief')).structuredContent.initialized,false);
const fresh=(await api(env,owner)).data;
let r=await api(env,owner,'/api/design','PUT',saveInput(fresh,baseline.layout,'qa-initial-design'));
assert.equal(r.status,200);let saved=r.data;
assert.equal(saved.storage_revision,1);assert.equal(saved.scene_revision,key(saved.brief.layout));
assert.equal(saved.brief.canonical_sha256,baseline.canonical_sha256);assert.equal(saved.brief.verified.clear_ceiling_m,2.5);
assert.equal((await rpc(env,owner,'get_current_apartment_design_brief')).structuredContent.scene_revision,saved.scene_revision);
assert.equal((await api(env,'other-user')).data.initialized,false);
assert.equal((await api(env,'other-user','/api/design/history')).data.history.length,0);
assert.equal((await api(env,'other-user','/api/design/restore','POST',{...saveInput(fresh,undefined,'qa-foreign-restore'),revision:1})).status,404);
assert.equal((await api(env,owner,'/api/design','PUT',{...saveInput(saved,saved.brief.layout,'qa-owner-spoofing'),owner_id:'other-user'})).status,422);
assert.equal((await api(env,owner,'/api/design','PUT',saveInput(saved,saved.brief.layout,'qa-cross-origin'),{Origin:'https://foreign.test'})).status,403);

const p=proposal(saved,[{type:'room-option',room_id:'RECP-01',key:'lighting',value:'lamps'},{type:'room-option',room_id:'MBR-01',key:'flooring',value:'lightoak'}]);
const validated=await rpc(env,owner,'validate_apartment_design_proposal',{brief:saved.brief,proposal:p});assert.equal(validated.isError,false);
const applied=await rpc(env,owner,'apply_apartment_design_proposal',applyArgs(saved,p,'qa-agent-apply-01'));
assert.equal(applied.isError,false);saved=applied.structuredContent;
assert.equal(saved.storage_revision,2);assert.equal(saved.scene_revision,validated.structuredContent.candidate_scene_revision);
const repeated=await rpc(env,owner,'apply_apartment_design_proposal',{proposal:p,expected_storage_revision:1,request_id:'qa-agent-apply-01'});
assert.equal(repeated.isError,false);assert.equal(repeated.structuredContent.idempotent,true);assert.equal(repeated.structuredContent.storage_revision,2);
assert.equal((await rpc(env,owner,'apply_apartment_design_proposal',{proposal:p,expected_storage_revision:1,request_id:'qa-agent-stale-02'})).isError,true);
assert.equal((await rpc(env,owner,'apply_apartment_design_proposal',applyArgs(saved,proposal(saved,[{type:'room-option',room_id:'RECP-01',key:'ceiling_height_m',value:2.7}]),'qa-height-change'))).isError,true);
assert.equal((await api(env,owner)).data.storage_revision,2);
for(const mutate of [l=>l.demolished.push('wall-1'),l=>l.height_m=3,l=>l.rooms['RECP-01'].mat='unknown',l=>l.furniture[0].id='__proto__',l=>l.studio.rooms['RECP-01']={ceiling_height_m:3}]){
  const layout=clone(saved.brief.layout);mutate(layout);
  assert.equal((await api(env,owner,'/api/design','PUT',saveInput(saved,layout,'qa-invalid-'+Math.random().toString(36).slice(2)))).status,422);
}
const left=clone(saved.brief.layout),right=clone(saved.brief.layout);left.rooms['RECP-01'].mat='walnut';right.rooms['RECP-01'].mat='lightoak';
const concurrent=await Promise.all([api(env,owner,'/api/design','PUT',saveInput(saved,left,'qa-concurrent-left')),api(env,owner,'/api/design','PUT',saveInput(saved,right,'qa-concurrent-right'))]);
assert.deepEqual(concurrent.map(x=>x.status).sort(),[200,409]);saved=(await api(env,owner)).data;
assert.equal(saved.storage_revision,3);assert.equal((await api(env,owner,'/api/design/history')).data.history.length,3);
const beforeFailure=clone(saved);env.DB.failHistory=true;
const failure=await api(env,owner,'/api/design','PUT',saveInput(saved,left,'qa-batch-rollback'));
assert.equal(failure.status,503);env.DB.failHistory=false;
assert.equal((await api(env,owner)).data.scene_revision,beforeFailure.scene_revision);
assert.equal((await api(env,owner)).data.storage_revision,3);
const restore=await api(env,owner,'/api/design/restore','POST',{expected_storage_revision:3,expected_scene_revision:saved.scene_revision,request_id:'qa-restore-original',revision:1});
assert.equal(restore.status,200);assert.equal(restore.data.storage_revision,4);assert.equal(restore.data.source,'restore');
assert.equal(restore.data.brief.layout.rooms['RECP-01'].mat,baseline.layout.rooms['RECP-01'].mat);

// Use the actual viewer classic script and DOM controls, wired to the real Worker.
const ownerUi='viewer-owner',network={},v=await viewer(env,ownerUi,{},network),{w,evaluate}=v;
let uiSaved=(await api(env,ownerUi)).data;
assert.equal(uiSaved.storage_revision,1);assert.equal(w.ApartmentStudio.exportBrief().scene_revision,uiSaved.scene_revision);
evaluate("studioSetRoom('RECP-01','lighting','track');");await w.ApartmentCloud.flush();
uiSaved=(await api(env,ownerUi)).data;assert.equal(uiSaved.brief.layout.studio.rooms['RECP-01'].lighting,'track');
const remote=await rpc(env,ownerUi,'apply_apartment_design_proposal',applyArgs(uiSaved,proposal(uiSaved,[{type:'room-option',room_id:'RECP-01',key:'lighting',value:'lamps'},{type:'room-option',room_id:'RECP-01',key:'flooring',value:'walnut'}]),'qa-ui-agent-apply'));
assert.equal(remote.isError,false);await w.ApartmentCloud.poll();
assert.equal(evaluate("state.rooms['RECP-01'].mat"),'walnut');assert.equal(evaluate("studioRoomOptions(state,'RECP-01').lighting"),'lamps');
evaluate('undo()');await w.ApartmentCloud.flush();
uiSaved=(await api(env,ownerUi)).data;assert.equal(uiSaved.brief.layout.studio.rooms['RECP-01'].lighting,'track');
assert.notEqual(uiSaved.brief.layout.rooms['RECP-01'].mat,'walnut');

// A server edit cannot erase an unsaved device edit; choosing either is explicit.
const other=await rpc(env,ownerUi,'apply_apartment_design_proposal',applyArgs(uiSaved,proposal(uiSaved,[{type:'room-option',room_id:'RECP-01',key:'lighting',value:'downlights'}]),'qa-ui-agent-conflict'));
assert.equal(other.isError,false);
evaluate("studioSetRoom('RECP-01','wall','#123456');");await w.ApartmentCloud.flush();
assert.equal(evaluate('!!cloud.conflict'),true);assert.equal(evaluate("studioRoomOptions(state,'RECP-01').wall"),'#123456');
assert.ok(w.localStorage.getItem('type-b-conflict-draft-v1'));assert.equal(w.document.getElementById('cloudConflict').hidden,false);
w.document.getElementById('cloudUseSaved').click();
assert.equal(evaluate('!!cloud.conflict'),false);assert.equal(evaluate("studioRoomOptions(state,'RECP-01').lighting"),'downlights');
assert.notEqual(evaluate("studioRoomOptions(state,'RECP-01').wall"),'#123456');
uiSaved=(await api(env,ownerUi)).data;
await rpc(env,ownerUi,'apply_apartment_design_proposal',applyArgs(uiSaved,proposal(uiSaved,[{type:'room-option',room_id:'RECP-01',key:'lighting',value:'lamps'}]),'qa-ui-agent-conflict-2'));
evaluate("studioSetRoom('RECP-01','wall','#abcdef');");await w.ApartmentCloud.flush();
assert.equal(evaluate('!!cloud.conflict'),true);w.document.getElementById('cloudUseDevice').click();
await settle(()=>evaluate('!cloud.busy&&!cloud.dirty'));
uiSaved=(await api(env,ownerUi)).data;assert.equal(uiSaved.brief.layout.studio.rooms['RECP-01'].wall,'#abcdef');
assert.equal(uiSaved.brief.layout.studio.rooms['RECP-01'].lighting,'downlights');

// A lost response retries the same request once, then saves edits made in flight.
const revisionBeforeRetry=uiSaved.storage_revision;network.dropAfterCommit=true;
evaluate("studioSetRoom('RECP-01','brightness',44);");await w.ApartmentCloud.flush();
assert.equal(evaluate('!!cloud.pending'),true);assert.equal((await api(env,ownerUi)).data.storage_revision,revisionBeforeRetry+1);
evaluate("studioSetRoom('RECP-01','temperature',2700);");await w.ApartmentCloud.flush();await w.ApartmentCloud.flush();
await settle(()=>evaluate('!cloud.busy&&!cloud.dirty'));
uiSaved=(await api(env,ownerUi)).data;assert.equal(uiSaved.storage_revision,revisionBeforeRetry+2);
assert.equal(uiSaved.brief.layout.studio.rooms['RECP-01'].brightness,44);assert.equal(uiSaved.brief.layout.studio.rooms['RECP-01'].temperature,2700);

// Reload preserves the saved revision despite fixState's object-key order.
const local=v.storage();w.close();
await rpc(env,ownerUi,'apply_apartment_design_proposal',applyArgs(uiSaved,proposal(uiSaved,[{type:'room-option',room_id:'RECP-01',key:'flooring',value:'lightoak'}]),'qa-offline-agent-edit'));
const reloaded=await viewer(env,ownerUi,local);
assert.equal(reloaded.evaluate('!!cloud.conflict'),false);assert.equal(reloaded.evaluate("state.rooms['RECP-01'].mat"),'lightoak');
assert.equal(reloaded.w.ApartmentStudio.exportBrief().scene_revision,(await api(env,ownerUi)).data.scene_revision);
const ownerLocal=reloaded.storage();reloaded.w.close();
// An offline draft on the same saved base resumes without a needless conflict.
const recoveredDraft=clone(JSON.parse(ownerLocal['type-b-studio-v1']));recoveredDraft.studio.rooms['RECP-01'].brightness=51;
const draftLocal={...ownerLocal,'type-b-studio-v1':JSON.stringify(recoveredDraft)};
const recovered=await viewer(env,ownerUi,draftLocal);
assert.equal(recovered.evaluate('!!cloud.conflict'),false);assert.equal((await api(env,ownerUi)).data.brief.layout.studio.rooms['RECP-01'].brightness,51);recovered.w.close();
const otherAccount=await viewer(env,'fresh-account',ownerLocal);
assert.equal(otherAccount.evaluate('state.decor.active'),'custom');assert.notEqual(otherAccount.evaluate("studioRoomOptions(state,'RECP-01').wall"),'#abcdef');
otherAccount.w.close();

const retainedOwner='retention-test';let retained=(await api(env,retainedOwner)).data;
for(let i=0;i<152;i++){
  const layout=clone(baseline.layout);layout.rooms['RECP-01'].name='Reception '+i;
  const result=await api(env,retainedOwner,'/api/design','PUT',saveInput(retained,layout,'qa-retention-'+String(i).padStart(4,'0')));assert.equal(result.status,200);retained=result.data;
}
assert.equal(env.DB.sql.prepare('SELECT count(*) AS n FROM apartment_design_history WHERE owner_id=?').get(retainedOwner).n,150);
assert.equal((await api(env,retainedOwner,'/api/design/history')).data.history.length,30);
assert.equal((await api(env,retainedOwner,'/api/design/restore','POST',{expected_storage_revision:retained.storage_revision,expected_scene_revision:retained.scene_revision,request_id:'qa-pruned-revision',revision:1})).status,404);
const report={result:'PASS',checks:['Generated Drizzle migration executes in SQLite','Existing MCP tools and saved design reads','Trusted identity required; per-user isolation; foreign restore denied','Canonical layout and height locks enforced at save and apply','Browser and validator candidate revisions agree','Agent apply retries are idempotent','Concurrent writes produce one success and one conflict','Current design and history commit atomically; failed history write rolls back','Previous revision restore creates a new revision','Actual viewer automatically creates its first saved design','Viewer edits persist and agent edits sync without import','Undo of received agent edits saves the previous scene','Conflicting device draft is preserved; both resolution choices work','Lost save response retries without duplicate history','Edits made during retry are saved after the retried commit','Reload adopts newer agent edits without a false key-order conflict','Account changes do not publish the previous account’s draft','150-revision retention and 30-entry history page'],method:'Real Worker and browser DOM code with a local SQLite D1 adapter; no live identity headers fabricated'};
report.checks.push('Offline drafts resume automatically when the saved base has not changed');
fs.writeFileSync('cloud-validation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
