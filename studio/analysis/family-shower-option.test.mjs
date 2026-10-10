import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {createApartmentDomain} from "../domain/apartment.mjs";
import {makeFamilyShowerOption} from "./family-shower-option.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const source=read("render-snapshots/current.json"),domain=createApartmentDomain(process.cwd());
const {a,b,audit}=makeFamilyShowerOption(source,domain);
test("both candidates use exact current v55 scene and identical saved cameras",()=>{
 assert.equal(a.scene_revision,"scene-9cf45a73");
 assert.deepEqual(a.layout,source.layout);
 assert.deepEqual(a.views,b.views);
 assert.deepEqual(a.views.map(x=>x.id),["bath55-family-entry","bath55-family-dry-cabinet"]);
 assert.equal(audit.cloud_scene,"scene-4821689");
});
test("one family shower rendering option only; never move sanitaryware or walls",()=>{
 const same=structuredClone(b.layout);
 same.furniture.find(x=>x.id==="starter-16").variant="style";
 assert.deepEqual(same,a.layout);
 assert.equal(b.layout.furniture.find(x=>x.id==="starter-16").variant,"frameless-low-profile");
 assert.deepEqual(b.layout.demolished,[]);
 assert.equal(b.architecture_variant,undefined);
 assert.equal(audit.locked.master_walkin_1450x800_unchanged,true);
 assert.equal(audit.locked.family_toilet_and_vanity_unchanged,true);
 assert.equal(audit.locked.guest_unchanged,true);
});
test("nominal model dimensions and actual operational holds stay honest",()=>{
 assert.deepEqual(audit.family_shower_model_footprint_mm,[900,900]);
 assert.equal(audit.shower_nominal_floor_area_m2,0.81);
 assert.equal(audit.family_room_nominal_door_mm,656.7);
 assert.equal(audit.visual_geometry_only.front_pivot_leaf_nominal_mm,580);
 assert.equal(audit.visual_geometry_only.actual_door_swing_rendered,false);
 assert.equal(audit.visual_geometry_only.base_tray_height_mm,35);
 assert.equal(audit.status,"DESIGN_ONLY_NOT_FOR_WET_INSTALLATION");
 assert.equal(audit.required_before_any_order.length,6);
});


test("safety-driven south-panel and west-access geometry corrected, no false door approval",()=>{
 assert.equal(audit.family_model_west_shower_footprint_gap_mm,778.6);
 assert.equal(audit.south_splash_face_to_wc_footprint_gap_mm,319.6);
 assert.equal(audit.if_south_580mm_door_swung_outward_gap_mm,-260.4);
 assert.equal(audit.if_west_580mm_door_swung_outward_remaining_mm,198.6);
 assert.equal(audit.actual_west_pivot_outward_approved,false);
 assert.equal(audit.shower_glass_access_side,"WEST");
 assert.equal(audit.closed_glass_splash_side,"SOUTH");
 assert.equal(audit.visual_geometry_only.actual_door_swing_rendered,false);
});
test("hosted and local render correct glazing orientations, not a door on WC-facing south",()=>{
 const hosted=fs.readFileSync("studio-scene.js","utf8");
 const local=fs.readFileSync("studio/renderer/builders.js","utf8");
 for(const code of [hosted,local]){
  assert.match(code,/familyEnclosure/);
  assert.match(code,/accessFace:\s*["']WEST["']/);
  assert.match(code,/splashFace:\s*["']SOUTH["']/);
  assert.match(code,/realSwingApproved:\s*false/);
  assert.match(code,/CLOSED_DOOR_NO_CLEARANCE_CERTIFICATION/);
 }
});
