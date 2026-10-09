/**
 * Generate an ISOLATED kitchen-only open study from current v55 + historic K12.
 * Architecture remains canonical; render-only overlay is NOT a structural permit.
 * Critically, do NOT transplant any bath/bedroom/corridor walls, furniture or decor.
 */
import assert from "node:assert/strict";
import {createApartmentDomain} from "../studio/domain/apartment.mjs";
const clone=x=>structuredClone(x);
export function buildKitchenOnlyOpen(current,k12,domain){
 assert.equal(current.canonical_sha256,domain.model.canonical_sha256);
 assert.equal(k12.canonical_sha256,current.canonical_sha256);
 assert.equal(current.scene_revision,domain.revision(current.layout));
 assert.equal(k12.scene_revision,domain.revision(k12.layout));
 assert.equal(current.architecture_variant,undefined);
 assert.deepEqual(current.layout.demolished,[]);
 assert.equal(k12.architecture_variant?.render_only,true);
 const cuts=k12.architecture_variant.remove_wall_segments.filter(s=>Math.min(s.from[0],s.to[0])>=8900);
 assert.equal(cuts.length,4);
 assert.equal(k12.architecture_variant.remove_wall_segments.length,8);
 const scene=clone(current);
 scene.name="REVIEW ONLY · kitchen-only open study derived from current v55, no bathroom changes";
 const kitchenFurniture=k12.layout.furniture.filter(x=>x.room_id==="KIT-01");
 const islandFurniture=k12.layout.furniture.filter(x=>["E2-island","E2-island-sink"].includes(x.id));
 assert.ok(kitchenFurniture.length>=4);
 assert.equal(islandFurniture.length,2);
 scene.layout.furniture=scene.layout.furniture.filter(x=>x.room_id!=="KIT-01").concat(clone(kitchenFurniture),clone(islandFurniture));
 const historicalInterior=k12.layout.interior.objects.filter(x=>x.room_id==="KIT-01");
 assert.ok(historicalInterior.length>=4);
 scene.layout.interior.objects=scene.layout.interior.objects.filter(x=>x.room_id!=="KIT-01").concat(clone(historicalInterior));
 const overlay={
  id:"kitchen-only-open-from-v55-20261010",name:"KITCHEN-ONLY architectural overlay, exploratory",
  render_only:true,structural_status:"TBD",
  remove_wall_segments:clone(cuts),hide_openings:["OP-RECP-KIT"],
  add_wall_segments:[],add_wall_boxes:[],door_overrides:[],merged_ceilings:[]
 };
 scene.architecture_variant=overlay;
 scene.views=clone(current.views.filter(x=>["reception-dining","kitchen-work-run","reception-entry"].includes(x.id)));
 assert.equal(scene.views.length,3);
 scene.source_scene_revision=current.scene_revision;
 scene.scene_revision=domain.revision(scene.layout);
 scene.notes=[
  "Source is the exact saved-cloud v55-derived GitHub review; transplant ONLY historic K12 kitchen furniture and island fixtures.",
  "The canonical Type B architecture and v55 bathrooms, bedroom, service terrace, reception furniture incl. six chairs, lighting and 2.50m finished ceiling remain unchanged.",
  "Renderer removes four kitchen-facing wall segments and hides ONLY kitchen door; this overlay is not an approved demolition or permission.",
  "The archived K12 original has two hard geometry failures; this isolated candidate must independently disclose its own failures and must never be silently promoted to current.json or cloud.",
  "Gas, cooker hood/extraction, island plumbing, dishwasher real door, existing washer relocation, structural/developer approvals and real cabinet storage all TBD."
 ];
 const originalOther=current.layout.furniture.filter(x=>x.room_id!=="KIT-01");
 const candidateOther=scene.layout.furniture.filter(x=>x.room_id!=="KIT-01"&&!["E2-island","E2-island-sink"].includes(x.id));
 assert.deepEqual(candidateOther,originalOther,"All non-kitchen v55 furniture must remain unchanged");
 const originalOtherInterior=current.layout.interior.objects.filter(x=>x.room_id!=="KIT-01");
 const candidateOtherInterior=scene.layout.interior.objects.filter(x=>x.room_id!=="KIT-01");
 assert.deepEqual(candidateOtherInterior,originalOtherInterior,"All non-kitchen v55 interior items must remain unchanged");
 assert.deepEqual(scene.layout.rooms,current.layout.rooms);
 assert.deepEqual(scene.layout.demolished,current.layout.demolished);
 return scene;
}
export function auditKitchenOnlyCandidate(current,k12,candidate,domain){
 assert.equal(candidate.canonical_sha256,current.canonical_sha256);
 assert.equal(candidate.scene_revision,domain.revision(candidate.layout));
 assert.notEqual(candidate.scene_revision,current.scene_revision);
 assert.notEqual(candidate.scene_revision,k12.scene_revision);
 assert.equal(candidate.architecture_variant.remove_wall_segments.length,4);
 assert.deepEqual(candidate.architecture_variant.hide_openings,["OP-RECP-KIT"]);
 let validation;
 try{validation=domain.validate(candidate.layout)}
 catch(e){if(!e.validation)throw e;validation=JSON.parse(JSON.stringify(e.validation))}
 assert.ok(Array.isArray(validation.checks));
 const hard=validation.checks.filter(c=>c.status==="FAIL").map(c=>({
  kind:c.kind??null,id:c.object_id??null,wall:c.source_wall_index??null
 }));
 // Deliberately DO NOT demand a pass: domain still has locked, separate kitchen and reception polygons.
 // Visual removal of a wall is not canonical architecture approval.
 return {
  schema:"ApartmentKitchenOnlyOpenOwnerReview/1",
  status:"EXPLORATORY_MODEL_WITH_UNRESOLVED_CONSTRUCTION_GATES",
  canonical_sha256:candidate.canonical_sha256,
  v55_parent_scene:current.scene_revision,archived_k12_source_scene:k12.scene_revision,
  kitchen_only_candidate_scene:candidate.scene_revision,
  kept_current_dining_table:current.layout.furniture.find(x=>x.id==="starter-35"),
  active_dining_table:candidate.layout.furniture.find(x=>x.id==="starter-35"),
  changed_bathroom_walls:0,changed_bathroom_objects:0,changed_non_kitchen_v55_furniture:0,
  render_only_wall_removals:4,hidden_kitchen_door:true,
  domain_hard_failures:hard,
  release_status:"NOT_READY_FOR_CONSTRUCTION_OR_CLOUD",
  blocking:[
   "Canonical image-calibrated geometry does not authorize construction wall removal or merged kitchen-reception topology",
   "Independent remaining model failures (listed) require root-cause correction; no pass by visual overlay",
   "On-site beams/walls, developer permissions, HVAC, smoke/odor extraction and gas must be checked",
   "Dishwasher opening/standing position, six occupied chairs, service terrace washer and wet routes TBD",
   "Render is for critique of separate kitchen-only intervention; no materials or orders approved"
  ]
 };
}
