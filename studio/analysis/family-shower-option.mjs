/** Exact source comparison: FAMILY shower style vs reversible frameless-low-profile visual. */
import assert from "node:assert/strict";
import {rectangle} from "./geometry.mjs";
const clone=x=>structuredClone(x);
const VIEWS=["bath55-family-entry","bath55-family-dry-cabinet"];
const ALLOWED_ROOM="BATH-C01";
export function makeFamilyShowerOption(current,domain){
 assert.equal(current.canonical_sha256,domain.model.canonical_sha256);
 assert.equal(current.scene_revision,domain.revision(current.layout));
 assert.equal(current.source_scene_revision,"scene-4821689");
 assert.equal(current.storage_revision,55);
 assert.deepEqual(current.layout.demolished,[]);
 assert.equal(current.architecture_variant,undefined);
 const a=clone(current),b=clone(current);
 a.name="FAMILY SHOWER | current 900mm heavy tray style, exact v55 reference";
 b.name="FAMILY SHOWER | optional frameless closed-pivot low-profile visual only";
 a.views=VIEWS.map(id=>{const x=current.views.find(v=>v.id===id);assert.ok(x,id);return clone(x)});
 b.views=clone(a.views);
 const base=a.layout.furniture.find(x=>x.id==="starter-16"),opt=b.layout.furniture.find(x=>x.id==="starter-16");
 assert.ok(base&&opt&&base.room_id===ALLOWED_ROOM);
 assert.equal(base.variant,"style");assert.deepEqual([base.w,base.d],[900,900]);
 opt.variant="frameless-low-profile";
 b.scene_revision=domain.revision(b.layout);
 assert.notEqual(a.scene_revision,b.scene_revision);
 assert.deepEqual(a.views,b.views);
 const restore=clone(b.layout);restore.furniture.find(x=>x.id==="starter-16").variant="style";
 assert.deepEqual(restore,a.layout,"Only the family-shower renderer variant may differ");
 assert.deepEqual(b.layout.demolished,[]);
 assert.equal(domain.validate(b.layout).checks.filter(x=>x.status==="FAIL").length,0);
 const nominalDoorMm=Math.min(580,opt.d*.68);
 const box=f=>{const corners=rectangle(f);return {xmin:Math.min(...corners.map(x=>x[0])),xmax:Math.max(...corners.map(x=>x[0])),
  ymin:Math.min(...corners.map(x=>x[1])),ymax:Math.max(...corners.map(x=>x[1]))};};
 const showerBounds=box(opt),wcBounds=box(b.layout.furniture.find(x=>x.id==="starter-17"));
 const room=domain.model.rooms.find(r=>r.id===ALLOWED_ROOM);
 assert.ok(room);
 const audit={
  schema:"FamilyShowerMinimalGlassReview/1",
  status:"DESIGN_ONLY_NOT_FOR_WET_INSTALLATION",
  canonical_sha256:current.canonical_sha256,
  cloud_scene:current.source_scene_revision,
  cloud_storage_revision:current.storage_revision,
  source_scene:a.scene_revision,alternative_scene:b.scene_revision,
  compared_cameras:VIEWS,
  family_shower_model_footprint_mm:[opt.w,opt.d],
  shower_nominal_floor_area_m2:+(opt.w*opt.d/1000000).toFixed(3),
  family_room_nominal_door_mm:+domain.model.openings.find(x=>x.id==="OP-HALL-BATHC").length_mm.toFixed(1),
  family_model_west_shower_footprint_gap_mm:+((opt.cx-opt.w/2)-Math.min(...room.poly.map(p=>p[0]))).toFixed(1),
  south_splash_face_to_wc_footprint_gap_mm:+(showerBounds.ymin-wcBounds.ymax).toFixed(1),
  if_south_580mm_door_swung_outward_gap_mm:+((showerBounds.ymin-wcBounds.ymax)-nominalDoorMm).toFixed(1),
  if_west_580mm_door_swung_outward_remaining_mm:+((showerBounds.xmin-Math.min(...room.poly.map(p=>p[0])))-nominalDoorMm).toFixed(1),
  actual_west_pivot_outward_approved:false,
  shower_glass_access_side:"WEST",closed_glass_splash_side:"SOUTH",
  swing_caveat:"The old south-facing door would intersect the toilet envelope if swung outward; the corrected west-facing concept also blocks the west strip at full outward leaf. No physical hinge/opening mechanism has been approved.",
  visual_geometry_only:{
   base_tray_height_mm:35,
   clear_glass_height_mm:1960,
   front_pivot_leaf_nominal_mm:+nominalDoorMm.toFixed(0),
   west_entry_pivot_leaf_nominal_mm:+nominalDoorMm.toFixed(0),
   south_wall_glazed_fixed:true,
   closed_door_rendered:true,
   actual_door_swing_rendered:false,
   door_leaf_sweep_certified:false,
   nominal_leaf_remainder_mm:+(opt.w-nominalDoorMm).toFixed(0),
   rail_ceiling_frame_visual:false
  },
  locked:{
   walls_unchanged:true,doors_unchanged:true,
   wet_services_unchanged:true,all_bathroom_fixtures_unchanged:true,
   master_walkin_1450x800_unchanged:true,
   family_toilet_and_vanity_unchanged:true,guest_unchanged:true,
   family_high_towel_cabinet_unchanged:true,cloud_untouched:true
  },
  required_before_any_order:[
   "Manufacturer technical specification for exact nominal 900x900 shower tray, real outside profile and floor drainage, servicing and installed height",
   "Qualified wet-area specialist + site engineer verify floor buildup, slope, substrate and compatible continuous waterproofing including upstands and door threshold",
   "Glass fabricator verify tempered/laminated safety glass, hinge support, door direction, handle, gasket, safe stop, serviceability and effective entrance clear width",
   "Actual family WC, vanity and inward hall door sweep interaction with fully opened shower door and real person using shower",
   "Extractor to outdoors, wet splash containment, floor wet slip resistance certificate and anti-mold washable grout/silicone maintenance",
   "Site tape as-built 1801x2754 nominal model room dimensions and 657mm nominal hall opening; no structural or plumbing change approved"
  ],
  design_jury:{
   priority:"Compare existing dark bulky cage with transparent frameless/satin nickel glass. Avoid artificial top rails and high-profile staged tray.",
   not_solved:"Even real WebGL cannot confirm exit comfort with door open, water leakage, trap access, or constructability; visual improvement alone cannot select low-tray product.",
   verdict:"Keep F1 visually preferred only after real WebGL side-by-side; west door shown CLOSED. Reject physical outward swing without a fabricator-verified entrance."
  }
 };
 return {a,b,audit};
}
