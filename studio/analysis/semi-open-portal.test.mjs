import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {createApartmentDomain} from "../domain/apartment.mjs";
import {buildSemiOpenPortalStudy} from "./semi-open-portal.mjs";
const source=JSON.parse(fs.readFileSync("render-snapshots/current.json","utf8"));
const model=createApartmentDomain(process.cwd());
const {closed,portal,audit}=buildSemiOpenPortalStudy(source,model);
test("same pinned v55 layout and architecture for both matched views",()=>{
 assert.deepEqual(closed.layout,source.layout);
 assert.deepEqual(portal.layout,source.layout);
 assert.deepEqual(portal.views,closed.views);
 assert.equal(closed.architecture_variant,undefined);
 assert.equal(closed.scene_revision,portal.scene_revision);
 assert.deepEqual(model.validate(portal.layout).checks.filter(x=>x.status==="FAIL"),[]);
});
test("P1 removes exactly ONE short kitchen-facing return above existing door, without bath edits",()=>{
 assert.equal(portal.architecture_variant.render_only,true);
 assert.equal(portal.architecture_variant.structural_status,"TBD");
 assert.equal(portal.architecture_variant.remove_wall_segments.length,1);
 assert.deepEqual(portal.architecture_variant.hide_openings,["OP-RECP-KIT"]);
 assert.deepEqual(portal.architecture_variant.add_wall_segments,[]);
 assert.deepEqual(portal.layout.demolished,[]);
 assert.equal(audit.changes.bathroom_wall_segments_changed,0);
 assert.equal(audit.changes.canonical_walls_changed,0);
 assert.equal(audit.changes.existing_nominal_opening_mm,720.2);
 assert.equal(audit.changes.proposed_visual_opening_mm,1207.4);
});
test("family and every model object remain exactly as v55 including current sink, DW and washer",()=>{
 assert.equal(audit.changes.layout_items_changed,0);
 assert.equal(audit.changes.wet_services_relocated,0);
 assert.equal(audit.changes.six_dining_chairs_preserved,true);
 assert.equal(source.layout.furniture.filter(x=>x.room_id==="RECP-01"&&x.type==="chair"&&/dining/i.test(x.name)).length,6);
 assert.equal(portal.layout.furniture.filter(x=>x.room_id==="KIT-01"&&x.type==="washer").length,1);
 assert.equal(portal.layout.furniture.filter(x=>x.room_id==="KIT-01"&&x.type==="dishwasher").length,1);
 assert.equal(portal.layout.furniture.filter(x=>x.id==="E2-island").length,0);
});
test("no false structural release or occupied-door test claim",()=>{
 assert.equal(audit.checks.as_built_and_structural_permission,false);
 assert.equal(audit.checks.actual_occupied_six_chair_access_verified,false);
 assert.equal(audit.checks.physically_measured_clear_opening,false);
 assert.equal(audit.status,"DESIGN_STUDY_ONLY");
 assert.equal(audit.blockers.length,5);
});
