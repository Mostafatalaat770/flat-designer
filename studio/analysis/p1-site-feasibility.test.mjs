import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {createApartmentDomain} from "../domain/apartment.mjs";
import {makeP1SiteSurvey,p1SiteSvg} from "./p1-site-feasibility.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const src=read("render-snapshots/current.json"),reg=read("design-development/decision-registry.json"),domain=createApartmentDomain(process.cwd());
const report=makeP1SiteSurvey(domain,src,reg);
test("P1 nominal physical width and furniture gap are distinct, not fabricated usable clear width",()=>{
 assert.equal(report.geometry.nominal_opening_p0_mm,720.2);
 assert.equal(report.geometry.nominal_opening_p1_mm,1207.4);
 assert.equal(report.geometry.expanded_mm,487.2);
 assert.equal(report.geometry.six_seat_table_nearest_horizontal_projected_gap_from_wall_face_mm,997.4);
 assert.equal(report.geometry.nominal_wall_thickness_mm,180);
});
test("all six actual v55 chairs modeled in pushed and 300/400mm pulled scenarios",()=>{
 assert.deepEqual(report.activity.dining_states.map(x=>x.chair_pullback_mm),[0,300,400]);
 for(const s of report.activity.dining_states) assert.equal(s.all_six_present,true);
 assert.equal(report.activity.dining_states[0].chairs_with_y_overlap_of_portal.length,6);
 assert.equal(report.activity.dining_states[1].chairs_with_y_overlap_of_portal.length,0);
 assert.equal(report.activity.dining_states[2].chairs_with_y_overlap_of_portal.length,0);
});
test("dishwasher nominal illustrative opening is separate from selected manufacturer proof",()=>{
 assert.deepEqual(report.activity.dishwasher_sensitivity.map(x=>x.assumed_door_projection_mm),[600,700]);
 for(const p of report.activity.dishwasher_sensitivity){
  assert.equal(p.uses_actual_selected_appliance_manual,false);
  assert.ok(p.projection_to_portal_wall_model_gap_mm>1500);
 }
});
test("opening never changes canonical layout and every field authorization remains blocked",()=>{
 assert.equal(report.activity.wall_opened_in_canonical_layout,false);
 assert.equal(report.release_status,"WAITING_ON_FIELD_EVIDENCE");
 assert.equal(report.questions.filter(x=>x.status==="REQUIRED").length,6);
 assert.equal(Object.values(report.release_flags).filter(Boolean).length,0);
 assert.match(report.activity.judgement,/not the east-west/);
 const svg=p1SiteSvg(report);
 assert.match(svg,/997.4 mm in BOTH options/);
 assert.match(svg,/not a clear walking corridor/);
});
test("source identity guard rejects misleading stale preferred variant",()=>{
 const altered=structuredClone(reg);
 altered.decisions.kitchen.preferred_concept.id="B2";
 assert.throws(()=>makeP1SiteSurvey(domain,src,altered),/P1-F1/);
});
