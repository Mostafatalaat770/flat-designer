import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {reconcile,verifyPreservation,hash,OUT,SOURCE,M0,A15,drawing,standalonePlan,ownerHTML} from './build-whole-home-m1.mjs';
import {LAYERS,REACH_REVIEW,REMAPS} from './whole-home-m1-input.mjs';
const read=p=>JSON.parse(fs.readFileSync(p));
const data=read(`${OUT}/COORDINATION.json`),m0=read(M0),model=read('dist/apartment-model.json'),snap=read(SOURCE),old=read(A15);
const get=(v,p)=>p.split('/').slice(1).reduce((o,k)=>o[k.replace(/~1/g,'/').replace(/~0/g,'~')],v);
const svgDOM=s=>new JSDOM(s,{contentType:'image/svg+xml'}).window.document;

test('751 pre-existing files including all M0 artifacts and approvals remain byte-identical',()=>{
 assert.equal(verifyPreservation(),751);
 assert.equal(hash(SOURCE),m0.source.sha256);
 assert.equal(data.source.canonical_sha256,'734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658');
 assert.ok(Object.values(read('design-development/decision-registry.json').approval_flags).every(x=>x===false));
});
test('deterministic derivation uses 37e8844 and exact current M0 source, cloud lineage and P0',()=>{
 assert.deepEqual(reconcile(),data);assert.equal(data.starting_head,'37e88444761919cb8323e51039ed9201328b8e48');
 assert.equal(snap.scene_revision,'scene-9cf45a73');assert.equal(snap.source_scene_revision,'scene-4821689');
 assert.equal(snap.storage_revision,55);assert.deepEqual(snap.layout.demolished,[]);assert.equal(snap.architecture_variant,undefined);
 assert.ok(Object.values(data.approvals).every(x=>x===false));assert.equal(data.handoff.next_issue,71);
});
test('all 65 originals survive exactly once with explicit decisions, scope, classification and current links',()=>{
 assert.deepEqual(data.dispositions.map(x=>x.original_id),old.equipment_points.map(p=>p.id));
 assert.deepEqual(data.summary.disposition_counts,{REANCHOR_WITH_EVIDENCE:24,KEEP_ROOM_LEVEL:38,PARK_ALTERNATIVE:3,RETIRE_DUPLICATE:0});
 for(const p of data.dispositions){
  const original=old.equipment_points.find(x=>x.id===p.original_id);
  assert.equal(p.original_scope,'scene-e2fcb932');assert.deepEqual(p.original_anchor,original.anchor);
  assert.equal(p.original_intent,original.intent);assert.ok(p.owner_use&&p.reach_and_occlusion_review);
  assert.equal(p.TBD_AS_BUILT,true);assert.equal(p.construction_approved,false);
  for(const id of [...p.active_intent_ids,...p.separately_proposed_intent_ids])assert.ok(data.intents.some(z=>z.id===id));
  if(p.disposition!=='PARK_ALTERNATIVE')assert.equal(p.active_intent_ids.length,1);
 }
});
test('five missing kitchen functions map only to verified current objects and a stated service side',()=>{
 for(const [id,objects] of Object.entries(REMAPS)){
  const p=data.dispositions.find(p=>p.original_id===id);assert.deepEqual(p.current_object_ids,objects);
  assert.equal(p.disposition,'REANCHOR_WITH_EVIDENCE');assert.ok(p.service_side.length>40);
  for(const id of objects)assert.ok(data.rooms.find(r=>r.id==='KIT-01').furniture.some(o=>o.id===id));
 }
 assert.ok(data.intents.find(z=>z.original_ids.includes('kit-hood')).operational_tradeoff.includes('مفيش هود مثبت'));
});
test('island, old oven column and terrace washer are parked; indoor niche is an explicit new functional need',()=>{
 for(const id of ['kit-island','kit-oven','svc-washer']){
  const p=data.dispositions.find(p=>p.original_id===id);assert.equal(p.disposition,'PARK_ALTERNATIVE');
  assert.deepEqual(p.active_intent_ids,[]);assert.deepEqual(p.current_object_ids,[]);
  assert.ok(!data.intents.some(z=>z.original_ids.includes(id)));
 }
 assert.deepEqual(data.dispositions.find(p=>p.original_id==='kit-island').separately_proposed_intent_ids,[]);
 const indoor=data.intents.find(z=>z.id==='KIT-01.E4');assert.deepEqual(indoor.current_object_ids,['K3-laundry-niche']);
 assert.deepEqual(indoor.original_ids,[]);
 assert.ok(data.intents.filter(z=>z.room_id==='TER-SVC').every(z=>z.current_object_ids.length===0));
 for(const layer of Object.keys(LAYERS)){
  const s=drawing(data,layer);for(const obsolete of ['E2-island-sink','H1-terrace-washer','E2-oven-column'])assert.ok(!s.includes(obsolete));
 }
});
test('five changed and fourteen same-envelope anchors have explicit operational re-evaluation, never reach approval',()=>{
 const changed=data.dispositions.filter(p=>p.source_classification.startsWith('CHANGED'));
 const same=data.dispositions.filter(p=>p.source_classification.startsWith('SAME'));
 assert.equal(changed.length,5);assert.equal(same.length,14);
 for(const p of [...changed,...same])assert.equal(p.reach_and_occlusion_review,REACH_REVIEW[p.original_id]);
 for(const p of [...changed,...same]){
  assert.ok(p.reach_confirmation.startsWith('NOT_PHYSICALLY_CONFIRMED'));
  const checks=get(m0,p.source_model_screen.source.pointer).checks;
  for(const c of p.source_model_screen.checks)assert.ok(checks.some(x=>JSON.stringify(c)===JSON.stringify(x)));
 }
 for(const p of same)assert.match(p.reach_and_occlusion_review,/SAME envelope/);
 for(const p of changed)assert.match(p.reach_and_occlusion_review,/CHANGED/);
});
test('every source context object resolves to exact saved record, room, footprint, pointer and hash',()=>{
 for(const r of data.rooms){
  assert.deepEqual(r.polygon_mm,model.rooms.find(m=>m.id===r.id).poly);
  for(const o of r.furniture){assert.deepEqual(get(snap,o.source.pointer),o.source_record);assert.equal(hash(o.source.path),o.source.sha256);}
  for(const z of r.zones)for(const id of z.current_object_ids)assert.ok(r.furniture.some(o=>o.id===id));
 }
});
test('all thirteen spaces receive all four services, confidence, reasons, survey and trade signoff',()=>{
 assert.deepEqual(data.rooms.map(r=>r.id),model.rooms.map(r=>r.id));assert.equal(data.intents.length,68);
 for(const r of data.rooms){
  assert.deepEqual([...new Set(r.zones.map(z=>z.layer))].sort(),['E','F','H','L']);
  for(const z of r.zones){assert.ok(z.owner_use&&z.furniture_reason&&z.operational_tradeoff&&z.survey_step&&z.trade_signoff&&z.confidence);assert.equal(z.measurement_status,'NOT_SURVEYED');assert.equal(z.TBD_AS_BUILT,true);assert.equal(z.construction_approved,false);}
 }
 assert.deepEqual(read(`${OUT}/FIRST_FIX_ISSUES.json`).questions,data.intents);
});
test('intent records contain no guessed construction coordinate, electrical sizing, light level or AC load',()=>{
 const forbidden=/^(x|y|z|cx|cy|coordinates|height_mm|mounting_height|lux|watt|voltage|breaker_a|cable_mm2|ac_tons|cooling_load|screed_mm|slope_percent)$/;
 for(const z of data.intents)for(const key of Object.keys(z))assert.ok(!forbidden.test(key),key);
 for(const p of data.dispositions)for(const key of Object.keys(p))assert.ok(!forbidden.test(key),key);
 assert.ok(data.ceiling_policy.includes('No whole-home dropped ceiling'));assert.ok(data.control_policy.includes('not electrical circuits'));
});
test('four standalone views have distinct layer content and every exact source room/object',()=>{
 const svgs=Object.keys(LAYERS).map(k=>standalonePlan(data,k));assert.equal(new Set(svgs).size,4);
 for(const [i,k] of Object.keys(LAYERS).entries()){
  const doc=svgDOM(svgs[i]),mult=k==='F'?2:1;
  assert.equal(doc.querySelectorAll('[data-room]').length,13*mult);
  assert.equal(doc.querySelectorAll('[data-source-object]').length,77*mult);
  assert.equal(doc.querySelectorAll('[data-opening]').length,model.openings.length*mult);
  assert.equal(doc.querySelectorAll('[data-door-sweep]').length,model.doors.length*mult);
 }
 assert.ok(svgs[0].includes('data-control-review'));assert.ok(!svgs[1].includes('data-control-review'));
 assert.ok(svgs[2].includes('data-air-avoid'));assert.ok(!svgs[0].includes('data-air-avoid'));
 assert.ok(svgs[3].includes('data-wet-boundary'));
 const floors=svgDOM(svgs[3]);assert.equal(floors.querySelectorAll('[data-threshold]').length,26);
 for(const el of floors.querySelectorAll('[data-threshold]'))assert.notEqual(model.openings.find(o=>o.id===el.getAttribute('data-threshold')).type,'exterior_window');
});
test('terraces retain no modeled ceiling; interior finished target is separate from site measurement',()=>{
 for(const r of data.rooms){assert.equal(r.ceiling_target_mm,r.id.startsWith('TER-')?null:2500);assert.equal(r.site_status,'TBD_AS_BUILT');}
});
test('no-draught zones follow exact existing bed/sofa shapes; floor A/B differ while architecture stays identical',()=>{
 const doc=svgDOM(standalonePlan(data,'H'));
 for(const el of doc.querySelectorAll('[data-air-avoid]')){
  const o=data.rooms.flatMap(r=>r.furniture).find(o=>o.id===el.dataset.airAvoid);
  assert.equal(el.getAttribute('points'),o.plan_envelope.map(p=>p.join(',')).join(' '));
 }
 assert.notEqual(drawing(data,'F',{option:'A'}),drawing(data,'F',{option:'B'}));
 for(const r of data.rooms)assert.equal(r.source_floor.value,m0.rooms.find(x=>x.id===r.id).source_floor.value);
});
test('all evidence paths/hashes are reproducible and point to inherited material, not invented links',()=>{
 for(const entry of [...data.intents,...data.dispositions])for(const s of entry.evidence_source){
  assert.equal(hash(s.path),s.sha256,s.path);if(s.pointer)assert.ok(get(read(s.path),s.pointer)!==undefined);
 }
});
test('offline review starts with complete disposition, offers four layers/13 crops and contains no network dependencies',()=>{
 const html=ownerHTML(data);assert.equal(html,fs.readFileSync(`${OUT}/Owner-Review.html`,'utf8'));
 const doc=new JSDOM(html).window.document;
 assert.equal(doc.querySelectorAll('tr[data-original]').length,65);assert.equal(doc.querySelectorAll('[data-room-schedule]').length,13);
 assert.equal(doc.querySelectorAll('[data-layer]').length,4);assert.equal(doc.querySelectorAll('img,iframe,link,script[src]').length,0);
 assert.ok(html.indexOf('id="disposition"')<html.indexOf('id="plans"'));
 for(const a of doc.querySelectorAll('a[href^="#"]'))assert.ok(doc.getElementById(a.getAttribute('href').slice(1)));
 const d=JSON.parse(doc.getElementById('embedded-data').textContent);
 for(const k of Object.keys(LAYERS))for(const option of Object.values(d.embedded[k]))assert.equal(Object.keys(option).length,14);
 assert.equal(doc.documentElement.lang,'ar');assert.equal(doc.documentElement.dir,'rtl');
});
