import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {createApartmentDomain} from "../domain/apartment.mjs";
import {portalDetail,portalDetailSvg} from "./portal-detail.mjs";
const root=process.cwd(),domain=createApartmentDomain(root);
const source=JSON.parse(fs.readFileSync("render-snapshots/current.json","utf8"));
const data=portalDetail(domain,source);
test("P1 opening derived from real canonical adjacent wall and saved door",()=>{
 assert.equal(data.geometry.opened_wall_segment_index,44);
 assert.equal(data.geometry.original_hinged_opening_nominal_mm,720.2);
 assert.equal(data.geometry.proposed_portal_nominal_mm,1207.4);
 assert.equal(data.geometry.upper_removed_return_mm,487.2);
 assert.equal(data.geometry.lower_retained_return_mm,783.8);
 assert.equal(data.geometry.wall_thickness_model_mm,180);
 assert.equal(data.geometry.finished_ceiling_model_mm,2500);
});
test("no full-width hidden pocket possible in short remaining wall at nominal coordinates",()=>{
 assert.equal(data.geometry.door_panel_full_width_pocket_side_shortfall_mm,423.7);
 assert.ok(data.geometry.proposed_20mm_each_side_reveal_nominal_remaining_mm>1150);
 assert.equal(data.proposed_design.preferred,"F1_OPEN_REVEAL");
 assert.match(data.proposed_design.F2_OPTIONAL_GLAZING.note,/cannot stow/);
});
test("all unsupported construction and real operating states remain blocking",()=>{
 for(const key of ["wall_removal_permitted","domestic_hood_ventilation_verified",
 "real_six_people_and_unloading_scenario_verified","fitted_opening_head_height_verified","real_flooring_joint_verified"])
  assert.equal(data.function_gates[key],false,key);
 assert.equal(data.release,"HOLD_FOR_DEVELOPER_AND_QUALIFIED_ENGINEER");
 assert.equal(data.function_gates.existing_indoor_washer_retained,true);
 assert.equal(data.function_gates.wet_island_added,false);
});
test("architectural detail SVG states conditional engineering and no fabricated head height",()=>{
 const svg=portalDetailSvg(data);
 assert.match(svg,/1207.4 mm NOMINAL/);
 assert.match(svg,/783.8 mm/);
 assert.match(svg,/Head\/lintel HEIGHT UNKNOWN/);
 assert.match(svg,/structural review REQUIRED/);
 assert.ok(svg.startsWith('<?xml'));
});
