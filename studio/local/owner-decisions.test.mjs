import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createApartmentDomain } from "../domain/apartment.mjs";

const read = path => JSON.parse(fs.readFileSync(path, "utf8"));
const registry = read("design-development/decision-registry.json");
const current = read(registry.working_source.path);
const archived = read(registry.historical_unapproved.path);
const domain = createApartmentDomain(process.cwd());

test("owner review is pinned to the saved v55 cloud source and untouched canonical geometry", () => {
  assert.equal(registry.schema, "ApartmentOwnerDecisionRegistry/1");
  assert.equal(current.canonical_sha256, domain.model.canonical_sha256);
  assert.equal(registry.canonical_sha256, current.canonical_sha256);
  assert.equal(current.scene_revision, registry.working_source.scene_revision);
  assert.equal(current.source_scene_revision, registry.working_source.cloud_source_scene_revision);
  assert.equal(current.storage_revision, registry.working_source.cloud_storage_revision);
  assert.equal(current.scene_revision, domain.revision(current.layout));
  assert.deepEqual(current.layout.demolished, [], "No silently removed verified partition");
  assert.equal(current.architecture_variant, undefined, "No K12 architectural overlay in current source");
  assert.deepEqual(domain.validate(current.layout).checks.filter(c => c.status === "FAIL"), []);
});

test("historical K12 is clearly archived; it cannot silently become the active review source", () => {
  assert.equal(archived.scene_revision, registry.historical_unapproved.scene_revision);
  assert.notEqual(archived.scene_revision, current.scene_revision);
  assert.ok(archived.architecture_variant, "Keep K12 overlay for traceable historical evidence");
});

test("six real dining chair objects stay linked to a 2000x950 nominal table", () => {
  const furniture = current.layout.furniture;
  const table = furniture.filter(f => f.room_id === "RECP-01" && f.type === "table");
  const chairs = furniture.filter(f => f.room_id === "RECP-01" && f.type === "chair" && /dining/i.test(f.name));
  assert.equal(table.length, 1);
  assert.deepEqual([table[0].w, table[0].d], [2000, 950]);
  assert.equal(chairs.length, 6, "Never hide a missing sixth chair behind camera angles");
  for (const chair of chairs) assert.deepEqual([chair.w, chair.d], [510, 530]);
  assert.equal(registry.decisions.dining.approved_for_construction, false);
});

test("enclosed current kitchen retains its actual dishwasher, sink and washer rather than an unapproved island", () => {
  const f = current.layout.furniture.filter(f => f.room_id === "KIT-01");
  const dw = f.filter(x => x.type === "dishwasher");
  const sink = f.filter(x => x.type === "ksink");
  const washer = f.filter(x => x.type === "washer");
  assert.equal(dw.length, 1);
  assert.equal(sink.length, 1);
  assert.equal(washer.length, 1);
  assert.equal(Math.abs(dw[0].cx - sink[0].cx), 600, "Nominal centres only, NOT actual door clearance");
  assert.equal(registry.decisions.kitchen.approved_for_construction, false);
});

test("open shower render is separate from fixed glass and shelves; cloud remains a different revision", () => {
  const fixtures = current.layout.furniture.filter(f => f.room_id === "BATH-M01" && f.type === "shower");
  const objects = current.layout.interior.objects;
  assert.equal(fixtures.length, 1);
  assert.deepEqual([fixtures[0].w, fixtures[0].d], [1450, 800]);
  assert.equal(fixtures[0].variant, "walk-in");
  assert.equal(objects.filter(x => x.id === "BATHM-glass-600-A1" && x.type === "divider").length, 1);
  assert.equal(objects.filter(x => /^BATHM-shampoo-shelf-A[12]$/.test(x.id) && x.type === "shelf").length, 2);
  assert.notEqual(current.scene_revision, current.source_scene_revision, "Candidate rendering is NOT saved cloud state");
  assert.equal(registry.decisions.master_shower.approved_for_construction, false);
});

test("no incomplete owner decision or external construction hold is described as approved", () => {
  for (const [key, approved] of Object.entries(registry.approval_flags)) {
    assert.equal(approved, false, key + " must have verified external evidence before a status change");
  }
  for (const [key, decision] of Object.entries(registry.decisions)) {
    assert.equal(decision.approved_for_construction, false, key);
    assert.ok(decision.active.length > 10, key);
    assert.ok(Array.isArray(decision.hold_points) && decision.hold_points.length >= 2, key);
    assert.notEqual(decision.status, "APPROVED", key);
  }
});


test("family F1 is the owner preferred visual direction, NEVER a physical door or plumbing approval",()=>{
 const family=registry.decisions.family_bath;
 assert.equal(family.preferred_concept.id,"F1-frameless-low-profile");
 assert.equal(family.preferred_concept.review_pr,54);
 assert.deepEqual(family.preferred_concept.shower_footprint_mm,[900,900]);
 assert.equal(family.preferred_concept.assumed_south_outward_overlap_into_wc_envelope_mm,260.4);
 assert.equal(family.preferred_concept.assumed_west_outward_remaining_mm,198.6);
 for(const key of ["actual_hinge_orientation_selected","safe_occupied_swing_approved","waterproofing_and_drain_approved","supplier_product_selected"]) assert.equal(family.preferred_concept[key],false,key);
 assert.equal(family.approved_for_construction,false);
 assert.equal(current.layout.furniture.find(f=>f.id==="starter-16").variant,"style");
 assert.equal(current.source_scene_revision,"scene-4821689");
});


test("master M0 800mm is design preference only, larger depth blocked for engineering review",()=>{
 const m=registry.decisions.master_shower;
 assert.equal(m.preferred_concept.id,"M0-1450x800-open-walkin");
 assert.deepEqual(m.preferred_concept.current_wet_footprint_mm,[1450,800]);
 assert.deepEqual(m.preferred_concept.fixed_screen_nominal_mm,[600,2050]);
 assert.equal(m.preferred_concept.modeled_west_entry_band_mm,832);
 assert.equal(m.preferred_concept.current_y_projection_to_dressing_door_north_jamb_mm,115.7);
 assert.equal(m.preferred_concept.alternate_900_y_projection_to_same_jamb_mm,15.7);
 assert.equal(m.preferred_concept.alternate_M1_900mm_status,"UNSELECTED_PENDING_AS_BUILT_WET_DOOR_SURVEY");
 for(const flag of ["construction_approval","approved_shower_splash","approved_wet_floor_buildup_drain","glass_supplier_selected"])assert.equal(m.preferred_concept[flag],false,flag);
 assert.equal(m.approved_for_construction,false);
 assert.equal(current.layout.furniture.find(f=>f.id==="BATHM-WALKIN-A1").d,800);
});
