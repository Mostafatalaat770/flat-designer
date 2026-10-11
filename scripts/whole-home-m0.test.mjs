import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import {extractInventory,verifyLocks,validateEditorial,TAGS,OUT,SOURCE,CANONICAL,hash} from './build-whole-home-m0.mjs';

const load=p=>JSON.parse(fs.readFileSync(p));
const source=load(SOURCE),model=load('dist/apartment-model.json');
const input=load(`${OUT}/REVIEW_INPUT.json`),data=load(`${OUT}/ROOM_MATRIX.json`);
const roomIds=model.rooms.map(r=>r.id);
const pointer=(value,p)=>p.split('/').slice(1).reduce((v,key)=>v[key.replace(/~1/g,'/').replace(/~0/g,'~')],value);

test('all 143 inherited sources, archived evidence and decision approvals remain byte-identical',()=>{
  assert.equal(Object.keys(verifyLocks().files).length,143);
  assert.equal(hash(CANONICAL),data.source.canonical_sha256);
  assert.ok(Object.values(load('design-development/decision-registry.json').approval_flags).every(v=>v===false));
});
test('complete deterministic extraction uses current, not kitchen lead or archived K12',()=>{
  assert.deepEqual(data,extractInventory());
  assert.equal(data.source.scene_revision,'scene-9cf45a73');
  assert.equal(data.source.cloud_origin_scene,'scene-4821689');
  assert.equal(data.source.finished_ceiling_mm,2500);
  assert.deepEqual(data.rooms.map(r=>r.id),roomIds);
});
test('every saved object appears once with exact source pointer, dimensions and placement; no invented height',()=>{
  const objects=data.rooms.flatMap(r=>r.furniture);
  assert.equal(objects.length,77);assert.equal(new Set(objects.map(o=>o.id)).size,77);
  for(const o of objects){
    const original=pointer(source,o.source.pointer);
    assert.deepEqual(original,o.source_record);
    assert.equal(o.source.sha256,hash(SOURCE));
    assert.equal(o.room_id,original.room_id);
    assert.equal(o.size_mm.width,original.w??original.width_mm);
    assert.equal(o.size_mm.depth,original.d??original.depth_mm);
    assert.equal(o.size_mm.height,original.height_mm??null);
    if(original.w){assert.deepEqual(o.placement.centre_mm,[original.cx,original.cy]);assert.equal(o.placement.rotation_deg,original.rot);}
    else assert.equal(o.placement.host_wall_id,original.placement.host_wall_id);
  }
});
test('all room polygons, printed dimensions and opening lengths retain distinct exact sources',()=>{
  const canonical=load(CANONICAL);
  for(const r of data.rooms){
    assert.deepEqual(r.geometry.polygon_mm,model.rooms.find(m=>m.id===r.id).poly);
    assert.deepEqual(r.geometry.printed_dimensions_m,canonical.spaces[r.id].printed_dimensions_m??null);
    for(const o of r.openings){assert.equal(o.length_mm,pointer(model,o.source.pointer).length_mm);assert.ok(o.width_status.includes('unknown'));}
  }
  assert.equal(data.rooms.find(r=>r.id==='TER-SVC').furniture.length,0);
  assert.equal(data.rooms.find(r=>r.id==='HALL-01').furniture.some(o=>o.id==='starter-40'),false);
});
test('source furniture collision remains visible while A/P0 feasibility evidence stays in its own lineage',()=>{
  const state=data.inherited_current_public_audit.chair_450;
  assert.equal(state.shoe_to_nearest_chair.intersects_positive_area,true);
  assert.equal(data.inherited_current_public_audit.entry_shoe_user_sweep.any_intersection,true);
  assert.ok(data.evidence.find(e=>e.id==='entry').source_scope.includes('scene-9e86635b'));
  assert.ok(data.evidence.find(e=>e.id==='bedrooms').source_scope.includes('ARCHIVED K12'));
  assert.ok(data.rooms.find(r=>r.id==='BR-02').model_checks.checks.some(c=>c.kind==='circulation'&&c.measured_clearance_mm===0));
});
test('A15 intent migration flags removed and changed anchors without proposing electrical coordinates',()=>{
  assert.equal(data.a15_reanchor.length,65);
  assert.ok(data.a15_reanchor.some(p=>p.current_anchor_state==='MISSING_FROM_CURRENT'));
  assert.ok(data.a15_reanchor.some(p=>p.current_anchor_state.startsWith('CHANGED')));
  for(const p of data.a15_reanchor){
    assert.equal(p.original_scope,'scene-e2fcb932');assert.equal(p.actual_location,'TBD_AS_BUILT');
    assert.equal(p.construction_approved,false);
    for(const k of ['x','y','cx','cy','watt','lux','cable_mm2','breaker_a','ac_tons'])assert.equal(p[k],undefined);
  }
});
test('every recommendation has a known proof tag and source, and decisions never exceed two alternatives',()=>{
  validateEditorial(input,roomIds);
  assert.equal(data.handoff.next_issue,70);assert.equal(data.handoff.style_issue,71);assert.equal(data.handoff.site_release_issue,19);
  assert.ok(Object.values(data.approvals).every(x=>x===false));
  for(const r of data.rooms){assert.equal(r.construction_approved,false);assert.equal(r.site_status,'SITE-HOLD');}
  assert.equal(data.evidence.find(e=>e.id==='r6').source_scope.includes('no geometry mutation'),true);
});
test('reject omitted terrace, extra geometry alternatives and unsupported proof labels',()=>{
  let tamper=structuredClone(input);delete tamper.rooms['TER-SVC'];assert.throws(()=>validateEditorial(tamper,roomIds),/13 canonical/);
  tamper=structuredClone(input);tamper.decisions[0].alternatives.push('third guess');assert.throws(()=>validateEditorial(tamper,roomIds));
  tamper=structuredClone(input);tamper.rooms['KIT-01'].opportunities[0].proof='APPROVED_FOR_CONSTRUCTION';assert.throws(()=>validateEditorial(tamper,roomIds));
});
test('offline document has every space, evidence, decision and working internal anchor',()=>{
  const html=fs.readFileSync(`${OUT}/Owner-Review.html`,'utf8'),dom=new JSDOM(html),doc=dom.window.document;
  assert.equal(doc.querySelectorAll('article[data-room]').length,13);
  assert.equal(doc.querySelectorAll('table tbody tr').length,78); // 77 objects + explicit empty service terrace
  assert.equal(doc.querySelectorAll('img,iframe,link,script[src]').length,0);
  for(const a of doc.querySelectorAll('a[href^="#"]'))assert.ok(doc.getElementById(a.getAttribute('href').slice(1)),a.href);
  for(const d of data.decisions)assert.ok(doc.getElementById(d.id));
  for(const e of data.evidence)assert.ok(doc.getElementById('e-'+e.id));
  for(const tag of TAGS)assert.ok(html.includes(tag));
  assert.equal(doc.documentElement.lang,'ar');assert.equal(doc.documentElement.dir,'rtl');
});
