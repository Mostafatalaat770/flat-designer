import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {createApartmentDomain} from "../domain/apartment.mjs";
import {makeFamilyShowerHardwareStudy,familyShowerPlanSvg} from "./family-glass-study.mjs";
const cur=JSON.parse(fs.readFileSync("render-snapshots/current.json","utf8"));
const domain=createApartmentDomain(process.cwd());
const {base,candidate,audit}=makeFamilyShowerHardwareStudy(cur,domain);
test("exact saved-v55-derived source and same two family cameras",()=>{
 assert.equal(base.scene_revision,"scene-9cf45a73");
 assert.equal(candidate.source_scene_revision,"scene-4821689");
 assert.equal(audit.cloud_revision,55);
 assert.deepEqual(base.views,candidate.views);
 assert.equal(base.views.length,2);
});
test("renderer change is opt-in only for original 900x900 family shower and no other apartment changes",()=>{
 assert.equal(candidate.layout.furniture.find(f=>f.id==="starter-16").variant,"minimal-glass");
 assert.equal(base.layout.furniture.find(f=>f.id==="starter-16").variant,"style");
 assert.deepEqual(base.layout.furniture.filter(f=>f.id!=="starter-16"),candidate.layout.furniture.filter(f=>f.id!=="starter-16"));
 assert.deepEqual(base.layout.interior,candidate.layout.interior);
 assert.deepEqual(base.layout.rooms,candidate.layout.rooms);
 assert.deepEqual(base.layout.demolished,[]);
 assert.equal(candidate.architecture_variant,undefined);
 assert.deepEqual(domain.validate(candidate.layout).checks.filter(c=>c.status==="FAIL"),[]);
});
test("nominal wet access flags impractical default OUTWARD door sweep, not a false safety certification",()=>{
 assert.deepEqual(audit.shower_footprint_mm,[900,900]);
 assert.equal(audit.dimensions.proposed_closed_leaf_model_mm,570);
 assert.equal(audit.dimensions.proposed_visual_base_height_mm,22);
 assert.equal(audit.dimensions.west_nominal_edge_space_mm,778.6);
 assert.equal(audit.dimensions.south_glass_face_to_wc_nominal_gap_mm,319.6);
 assert.equal(audit.dimensions.worst_proxy_outward_swing_remainder_mm,208.6);
 assert.ok(audit.hard_gates.every(x=>x.passed===false));
 assert.match(audit.spatial_caveat,/NOT an acceptable occupied circulation/);
});
test("plan's real nominal metrics are explanatory, not physical door/product approval",()=>{
 const svg=familyShowerPlanSvg({base,candidate,audit},domain);
 assert.match(svg,/900×900/);
 assert.match(svg,/OUTWARD SWING IS NOT APPROVED/);
 assert.match(svg,/208.6 mm/);
 assert.match(svg,/NO structural slab cut/);
});
