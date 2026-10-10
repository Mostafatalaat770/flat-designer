import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {createApartmentDomain} from "../domain/apartment.mjs";
import {guestWcJury,guestWcBoardSvg} from "./guest-wc-jury.mjs";
const source=JSON.parse(fs.readFileSync("render-snapshots/current.json","utf8"));
const domain=createApartmentDomain(process.cwd());
const {A,B,audit}=guestWcJury(source,domain);
test("source-identical current v55 and two real matching guest cameras",()=>{
 assert.equal(A.scene_revision,"scene-9cf45a73");
 assert.equal(audit.unchanged_saved_cloud,"scene-4821689");
 assert.equal(A.storage_revision,55);
 assert.deepEqual(A.layout,source.layout);
 assert.deepEqual(A.views,B.views);
 assert.deepEqual(audit.views,["guest-wc","guest-wc-entry-open"]);
});
test("B improves compact handwash within unchanged guest footprint, and no other room changes",()=>{
 const a=A.layout.furniture.find(f=>f.id==="starter-26");
 const b=B.layout.furniture.find(f=>f.id==="starter-26");
 assert.deepEqual([a.w,a.d],[350,180]);
 assert.deepEqual([b.w,b.d],[450,250]);
 assert.equal(b.variant,"floating-compact");
 assert.equal(a.variant,"style");
 assert.deepEqual([a.cx,a.cy,a.rot],[b.cx,b.cy,b.rot]);
 assert.deepEqual(A.layout.furniture.filter(f=>f.id!=="starter-26"),B.layout.furniture.filter(f=>f.id!=="starter-26"));
 assert.deepEqual(A.layout.rooms,B.layout.rooms);
 assert.deepEqual(A.layout.demolished,[]);
 assert.equal(B.architecture_variant,undefined);
 assert.equal(B.layout.interior.objects.find(o=>o.id==="WC-A1-mirror").variant,"task-lit");
 assert.deepEqual(A.layout.interior.objects.filter(o=>o.id!=="WC-A1-mirror"),B.layout.interior.objects.filter(o=>o.id!=="WC-A1-mirror"));
});
test("door-jamb proximity and WC envelope remain explicit measured projections",()=>{
 const a=audit.candidates.A,b=audit.candidates.B;
 assert.deepEqual(a.basin_mm,[350,180]);
 assert.deepEqual(b.basin_mm,[450,250]);
 assert.equal(a.sink_front_to_door_north_jamb_y_projection_mm,77.1);
 assert.equal(b.sink_front_to_door_north_jamb_y_projection_mm,42.1);
 assert.equal(a.door_nominal_opening_mm,656.7);
 assert.equal(b.door_nominal_opening_mm,656.7);
 assert.equal(b.sink_to_toilet_positive_area_overlap_mm2,0);
 assert.ok(b.sink_to_toilet_footprint_gap_mm>150);
});
test("better mirror and warm single-wall stone stay purely reversible; physical approvals all false",()=>{
 assert.equal(B.layout.interior.surface_materials["WALL-WC-01-02"],"wc2-mineral-taupe-matt");
 assert.equal(audit.wall_material_change_one_surface,"WALL-WC-01-02");
 assert.equal(B.layout.interior.objects.find(o=>o.id==="WC-A1-mirror").colour,"#B9BDC0");
 assert.equal(audit.mirror_envelope_unchanged,true);
 assert.ok(Object.values(audit.practical_gates).every(x=>x===false));
 assert.match(audit.preferred_before_actual_vendor_fit,/NO APPROVAL/);
 assert.deepEqual(audit.candidates.A.model_domain_failures,[]);
});
test("board reports actual numeric model differences and not fake sweep",()=>{
 const svg=guestWcBoardSvg(audit);
 assert.match(svg,/350×180/);
 assert.match(svg,/450×250/);
 assert.match(svg,/door-jamb Y/);
 assert.match(svg,/NOT a simulated swing/);
});


test("opt-in floating vanity design is available in both real renderers and marked not installable",()=>{
 const core=fs.readFileSync("studio-core.js","utf8");
 const host=fs.readFileSync("studio-scene.js","utf8");
 const server=fs.readFileSync("studio/renderer/builders.js","utf8");
 assert.match(core,/vanity:\['style','floating-compact'\]/);
 for(const t of [host,server]){
  assert.match(t,/floating-compact/);
  assert.match(t,/guestCompactVanity/);
  assert.match(t,/real_wall_bracket_drain_and_bowl_fit_approved:false/);
  assert.match(t,/NOT_FOR_INSTALLATION/);
 }
 assert.equal(audit.drawer_brackets_and_waterproof_service_connection_approved,false);
});
