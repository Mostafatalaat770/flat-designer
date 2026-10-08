/**
 * A14: keep cabinet FIT, access path and displaced kitchen functions separate.
 * All item dimensions / aperture sizes that lack an actual SKU must be explicit
 * hypotheses; never equate nominal volumetric FIT with useful everyday storage.
 */
import {auditCabinetAllocations} from './storage.mjs';
const groups=new Set(['kitchen_work_side','reception_presentation_side','upper_work_side']);
const check=s=>{if(!s||typeof s!=='string')throw new Error('Explicit provenance required');return s;};
export function evaluateDishWorkflow({
  options, sample_inventory, production_source, washing_station_group='kitchen_work_side'
}){
 check(production_source);
 if(!groups.has(washing_station_group))throw new Error('Unknown dishwasher working group');
 if(!Array.isArray(options)||options.length<2||!Array.isArray(sample_inventory)||!sample_inventory.length)
  throw new Error('Need option alternatives and explicit illustrative sample items');
 const ids=new Set();
 const evaluations=options.map(o=>{
  if(!o.id||ids.has(o.id))throw new Error('Unique option ID required');ids.add(o.id);
  if(!groups.has(o.storage_group))throw new Error('Invalid cabinet side/topology');
  if(!Array.isArray(o.displaced_functions)||!Array.isArray(o.unknowns))throw new Error('Explicit displaced storage and unknown gates required');
  const fitted=auditCabinetAllocations({
   bays:[o.bay],
   inventory:sample_inventory,
   allocations:o.allocations
  });
  const poorFit=fitted.hard_fit_rejections.length>0||fitted.inventory_mismatch.length>0;
  const crossFace=o.storage_group==='reception_presentation_side';
  const overhead=o.storage_group==='upper_work_side';
  const hardStatus=poorFit?'REJECT_THIS_EXAMPLE_FIT':
    fitted.unresolved.length||o.unknowns.length?'PROVISIONAL_NEEDS_DATA':'MODEL_FIT_ONLY';
  return {
   id:o.id,title:o.title,source_reference:check(o.bay.source_reference),
   access_side:o.storage_group,
   workflow:{
    dry_plate_unloading_from_kitchen_side_requires_walk_around_island:crossFace,
    overhead_plates_while_unloading:overhead,
    direct_same_side_worktop_access:!crossFace&&!overhead,
    transfer_distance_mm:null,
    caveat:'Qualitative access topology from actual K12 cabinet faces: no measured travel distance or occupied 2D route calculated. K12 opening remains unapproved.'
   },
   displaced_functions:o.displaced_functions,
   fit:fitted.inspections,
   net_bay_mm:o.bay.net_mm,
   item_count_mismatch:fitted.inventory_mismatch,
   conflicting_mixed_packing:fitted.unresolved,
   unknowns:o.unknowns,
   verdict:hardStatus,
   policy:'A single-SKU packing upper bound is NOT evidence that 6 mixed plates, bowls, mugs, pots and cleaning accessories fit together or can be unloaded by a real family.'
  };
 });
 return {
  schema:'ApartmentDishwasherUnloadingOptions/1',
  source:production_source,
  washing_station_group,
  illustrative_inventory:sample_inventory,
  options:evaluations,
  decision:'Retain presentation-side cabinets for serving use, explore daily plates near DW without sacrificing cooking pot capacity. No winning layout before actual cabinet/shop drawings, appliance doors and household inventory.',
  nonnegotiable:'No final kitchen, MEP or demolition approval based on a product-less simulation; source K12 render-only separator has 2 canonical FAILs.'
 };
}
