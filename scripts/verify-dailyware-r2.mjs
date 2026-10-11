import fs from "node:fs";
import assert from "node:assert/strict";
import {createHash} from "node:crypto";
// Pure reproducible dimensional review of unchanged Type B A/P0 source.
const f="design-development/reception-sprint/A-P0.json";
const b=fs.readFileSync(f),s=JSON.parse(b);
const result=JSON.parse(fs.readFileSync("design-development/release-r1/DAILYWARE_R2_TRIALS.json"));
assert.equal(createHash("sha256").update(b).digest("hex"),result.source.sha256);
assert.equal(s.scene_revision,"scene-9e86635b");
assert.equal(s.source_scene_revision,"scene-4821689");
assert.equal(s.canonical_sha256,result.source.canonical);
assert.deepEqual(s.layout.demolished,[]);
const upper=s.layout.interior.objects.find(z=>z.id==="KIT-A1-upper-north");
assert.deepEqual([upper.width_mm,upper.depth_mm,upper.height_mm],[1800,330,700]);
const a=result.assumptions;
const expected=[270,285,300].flatMap(d=>[330,350,360,380,400].map(e=>{
 const clear=e-a.back_mm-a.front_mm,needed=d+2*a.edge_margin_each_mm;
 return {plate_diameter_mm:d,proposed_upper_external_depth_mm:e,
 hypothetical_clear_depth_mm:clear,required_depth_mm:needed,model_gap_mm:clear-needed,
 outcome:clear>=needed?"MODEL_PASS_ONLY":"MODEL_FAIL",construction_approved:false};
}));
assert.deepEqual(result.cases,expected);
assert.equal(result.cases.length,15);
assert.ok(result.cases.every(x=>x.construction_approved===false));
assert.ok(Object.values(result.authorizations).every(v=>v===false));
const reg=JSON.parse(fs.readFileSync("design-development/decision-registry.json"));
assert.ok(Object.values(reg.approval_flags).every(v=>v===false));
console.log("R2 P0 dailyware: 15 model cases validated on exact source; ZERO construction releases.");
