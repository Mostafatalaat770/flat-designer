import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {createApartmentDomain} from "../domain/apartment.mjs";
import {masterDetailJury,masterDetailBoardSvg} from "./master-detail-jury.mjs";
const source=JSON.parse(fs.readFileSync("render-snapshots/current.json","utf8"));
const domain=createApartmentDomain(process.cwd());
const {a,b,audit}=masterDetailJury(source,domain);
test("M0 snapshot source pinned to real cloud v55 and same two cameras",()=>{
 assert.equal(a.scene_revision,"scene-9cf45a73");
 assert.equal(a.source_scene_revision,"scene-4821689");
 assert.equal(a.storage_revision,55);
 assert.deepEqual(a.views,b.views);
 assert.equal(a.views.length,3);
 assert.equal(a.views[2].id,"bath-master-dry-vanity-authored-review");
 assert.deepEqual(a.views[2].camera.position,[-1.65,1.62,2.66]);
 assert.match(audit.vanity_camera_provenance,/NOT AN EXISTING CLOUD CAPTURE/);
 assert.deepEqual(a.layout,source.layout);
});
test("only four reversibly opt-in interior variants change; no spatial or plumbing drift",()=>{
 assert.deepEqual(a.layout.furniture,b.layout.furniture);
 assert.deepEqual(a.layout.rooms,b.layout.rooms);
 assert.deepEqual(a.layout.interior.objects.map(o=>({id:o.id,placement:o.placement,room:o.room_id,cx:o.cx,cy:o.cy,rot:o.rotation,
  w:o.width_mm,d:o.depth_mm,h:o.height_mm})),b.layout.interior.objects.map(o=>({id:o.id,placement:o.placement,room:o.room_id,cx:o.cx,cy:o.cy,rot:o.rotation,
    w:o.width_mm,d:o.depth_mm,h:o.height_mm})));
 assert.equal(b.layout.furniture.find(f=>f.id==="BATHM-WALKIN-A1").d,800);
 assert.equal(b.layout.interior.objects.find(o=>o.id==="BATHM-glass-600-A1").variant,"fixed-clear-glass");
 assert.equal(b.layout.interior.objects.filter(o=>o.variant==="wet-tray").length,2);
 assert.equal(b.layout.interior.objects.find(o=>o.id==="BATHM-A1-mirror").variant,"task-lit");
 assert.deepEqual(domain.validate(b.layout).checks.filter(c=>c.status==="FAIL"),[]);
});
test("optical LED is NOT actual IP/illumination compliance and all wet/build holds remain",()=>{
 assert.equal(audit.status,"REVERSIBLE_DESIGN_ONLY");
 assert.equal(audit.optical_lighting_temperature_k,3000);
 assert.equal(audit.approximate_open_entry_mm,832);
 assert.equal(Object.values(audit.construction_holds).filter(Boolean).length,0);
 assert.equal(audit.exact_unchanged_physical_geometry,true);
});
test("renderer parity: all three opt-in variants available in hosted and GitHub WebGL",()=>{
 const core=fs.readFileSync("interior-core.js","utf8");
 const h=fs.readFileSync("interior-scene.js","utf8");
 const s=fs.readFileSync("studio/renderer/builders.js","utf8");
 for(const v of ["fixed-clear-glass","wet-tray","task-lit"]){
  assert.ok(core.includes(v));
  assert.ok(h.includes(v));
  assert.ok(s.includes(v));
 }
 for(const token of ["glassConcept","showerTrayConcept","mirrorLightConcept"]){
  assert.ok(h.includes(token));
  assert.ok(s.includes(token));
 }
});
test("mood board explicitly flags unapproved vendor and waterproofing design",()=>{
 const svg=masterDetailBoardSvg(audit);
 assert.match(svg,/1450 × 800/);
 assert.match(svg,/UNVERIFIED/);
 assert.match(svg,/cloud v55 unchanged/);
});


test("task-lit mirrors render visibly in headless WebGL with honest non-reflective optical proxy",()=>{
 const host=fs.readFileSync("interior-scene.js","utf8");
 const local=fs.readFileSync("studio/renderer/builders.js","utf8");
 for(const renderer of [host,local]){
  const i=renderer.indexOf('if (o.variant === "task-lit")');
  assert.ok(i>0,"mirror task variant exists");
  const block=renderer.slice(i,i+1250);
  assert.match(block,/new THREE\.MeshBasicMaterial\(\{color:"#B6C8C7"/);
  assert.match(block,/reflective_simulation:false/);
  assert.match(block,/NEUTRAL_GREY_NON_PHOTOREAL_PROXY/);
  assert.match(block,/illuminance:"NOT_CALCULATED"/);
  assert.doesNotMatch(block,/metalness:\.98/);
 }
 assert.equal(source.layout.interior.objects.find(o=>o.id==="BATHM-A1-mirror").variant,"rectangle");
 assert.equal(source.layout.interior.objects.find(o=>o.id==="WC-A1-mirror").variant,"rectangle");
});
