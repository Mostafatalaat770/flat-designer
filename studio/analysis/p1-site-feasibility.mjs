/** P1 kitchen first-fix field packet: exact source coordinates + labelled sensitivity proxies. */
import assert from "node:assert/strict";
import {rectangle,polygonGap,pointInPolygon} from "./geometry.mjs";
import {prepareSixSeatDining} from "./kitchen-dining.mjs";
const round=n=>+n.toFixed(1);
const box=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
const bounds=p=>({
 xmin:Math.min(...p.map(q=>q[0])),xmax:Math.max(...p.map(q=>q[0])),
 ymin:Math.min(...p.map(q=>q[1])),ymax:Math.max(...p.map(q=>q[1]))
});
const overlap=(a,b)=>a.ymin<=b.ymax&&b.ymin<=a.ymax;
export function makeP1SiteSurvey(domain,source,registry){
 const model=domain.model;
 assert.equal(source.canonical_sha256,model.canonical_sha256);
 assert.equal(registry.canonical_sha256,model.canonical_sha256);
 assert.equal(registry.working_source.scene_revision,source.scene_revision);
 assert.equal(registry.decisions.kitchen.preferred_concept.id,"P1-F1");
 assert.equal(registry.decisions.kitchen.approved_for_construction,false);
 assert.deepEqual(source.layout.demolished,[]);
 assert.equal(source.architecture_variant,undefined);
 assert.equal(source.scene_revision,domain.revision(source.layout));
 const door=model.openings.find(x=>x.id==="OP-RECP-KIT");
 const walls=model.wall_segments;
 const upper=walls[44],lower=walls[45];
 assert.ok(door&&upper&&lower);
 assert.equal(door.from[0],upper.to[0]);
 assert.equal(door.from[1],upper.to[1]);
 assert.equal(door.to[1],lower.from[1]);
 assert.equal(door.from[0],door.to[0]);
 const x=door.from[0],face=x+upper.thickness_mm/2;
 const y0=upper.from[1],y1=door.to[1];
 const width=y1-y0;
 const table=source.layout.furniture.find(f=>f.id==="starter-35");
 const dw=source.layout.furniture.find(f=>f.id==="K3-dishwasher");
 const fridge=source.layout.furniture.find(f=>f.id==="starter-23");
 const sink=source.layout.furniture.find(f=>f.id==="starter-21");
 assert.ok(table&&dw&&fridge&&sink);
 const tableFoot=bounds(rectangle(table));
 assert.ok(tableFoot.ymin<y1&&tableFoot.ymax>y0);
 const tableSpan=tableFoot.xmin-face;
 assert.ok(tableSpan>0);
 const sixPullback=[0,300,400].map(mm=>{
  const state=prepareSixSeatDining(source.layout.furniture,{chair_pullback_mm:mm});
  const adjacent=state.pulled.map(c=>({id:c.id,...bounds(rectangle(c))}))
   .filter(b=>overlap(b,{ymin:y0,ymax:y1}));
  const projected=adjacent.length?Math.min(...adjacent.map(c=>c.xmin-face)):null;
  return {
   chair_pullback_mm:mm,all_six_present:state.pulled.length===6,
   chairs_with_y_overlap_of_portal:adjacent.map(c=>c.id),
   nearest_chair_projected_east_gap_mm:projected===null?null:round(projected),
   nearest_table_projected_east_gap_mm:round(tableSpan),
   note:"Projected horizontal footprint clearance from modeled east wall face, NOT a usable route width or a seated-human clearance."
  };
 });
 const dishFoot=bounds(rectangle(dw));
 const doorProxy=[600,700].map(depth=>{
  const startY=dishFoot.ymax;
  const footprint=box(dishFoot.xmin,startY,dishFoot.xmax,startY+depth);
  const user=box(dishFoot.xmin,startY+depth,dishFoot.xmax,startY+depth+550);
  const lowerPortal=box(x-upper.thickness_mm/2,y0,x+upper.thickness_mm/2,y1);
  return {
   assumed_door_projection_mm:depth,
   assumed_unloading_body_zone_mm:[dw.w,550],
   dishwasher_center_mm:[dw.cx,dw.cy],
   projection_to_portal_wall_model_gap_mm:round(polygonGap(footprint,lowerPortal)),
   person_to_portal_wall_model_gap_mm:round(polygonGap(user,lowerPortal)),
   uses_actual_selected_appliance_manual:false,
   interpretation:"Sensitivity of ONE possible front-opening orientation; does not establish real door hinge, radius, unloading body position or a traversable kitchen path."
  };
 });
 const jambSens=[15,20,35].map(j=>({
  per_side_finish_reserve_mm:j,
  approximate_p1_clear_mm:round(width-2*j),
  approximate_p0_clear_mm:round(door.length_mm-2*j),
  caveat:"Independent jamb/profile allowance sensitivity only; ignores structural head, trim, glass parking, swing and tolerance."
 }));
 const release={
  site_survey_complete:false,
  developer_written_permission:false,
  qualified_egyptian_engineer_structural_signoff:false,
  beam_lintel_and_load_path_verified:false,
  electrical_gas_plumbing_in_removed_return_checked:false,
  ceiling_head_dimension_verified:false,
  selected_dishwasher_fridge_hood_manuals_checked:false,
  actual_furniture_and_six_diner_test_complete:false,
  safe_extraction_makeup_air_verified:false,
  flooring_and_profile_substrate_approved:false,
  glazing_system_selected_and_installer_approved:false
 };
 const questions=[
  {id:"RFI-01",scope:"Developer + structural engineer",question:"Is short kitchen-facing wall segment #44 nonstructural and legally removable? Document exact permitted rough-opening limits, bearing/lintel/head/beam constraints and required written approvals.",evidence:["Engineer-marked current as-built plan","Written developer permission","Photos both sides incl. top/ceiling"],status:"REQUIRED"},
  {id:"RFI-02",scope:"Site measurement",question:"Record opening before and after plaster: width at top/middle/bottom, wall thickness, ceiling-to-head height, return length and any offset compared with canonical image-calibrated plan.",evidence:["Tape/range measurements with dated images","Marked datum and scale"],status:"REQUIRED"},
  {id:"RFI-03",scope:"MEP and gas/ventilation",question:"Inspect segment #44 for pipes/conduits and review ducted hood extraction, makeup-air and gas-appliance rules for a kitchen opening to the reception.",evidence:["Qualified MEP signoff","Hood/extraction route and maintenance access"],status:"REQUIRED"},
  {id:"RFI-04",scope:"Kitchen appliances and joinery",question:"Collect exact selected DW/fridge/hob/hood model specs, doors fully opened, standing zone, upper cabinet access, indoor washer niche and usable dry/cookware storage.",evidence:["Manufacturer drawings","1:1 appliance+chair mock-up","Cabinet net storage inventory"],status:"REQUIRED"},
  {id:"RFI-05",scope:"Dining household use",question:"Test kitchen guest route with all six dining chairs in seated and pulled-out states while someone unloads the DW; use actual chair sizes.",evidence:["Full-size tape layout and observation","Photographs with operating doors"],status:"REQUIRED"},
  {id:"RFI-06",scope:"Finishes",question:"Can flush dry-side / kitchen wet-rated floor transition and narrow warm-ivory reveal be completed without raised trip lip or unapproved structural drilling?",evidence:["Finish mock-up","Substrate/movement joint review","Suppliers actual chosen profiles"],status:"REQUIRED"},
  {id:"RFI-07",scope:"Optional glass F2",question:"Only if odors/noise require closure: quote certified folding/stacking glass with actual stow, safety, track/head fixing and clear-width drawings. Do not assume a full-width hidden pocket.",evidence:["Manufacturer shop drawings","Cleaning and safe glass data"],status:"OPTIONAL"}
 ];
 return {
  schema:"TypeBP1SiteFeasibility/1",
  status:"PREFERRED_VISUAL_CONCEPT_NOT_FOR_CONSTRUCTION",
  sources:{canonical_sha256:model.canonical_sha256,saved_cloud_scene:source.source_scene_revision,github_working_scene:source.scene_revision},
  geometry:{
   wall_segment_for_conditional_visual_opening:44,
   nominal_opening_p0_mm:round(door.length_mm),nominal_opening_p1_mm:round(width),
   expanded_mm:round(width-door.length_mm),
   retained_lower_wall_length_mm:round(Math.hypot(lower.to[0]-lower.from[0],lower.to[1]-lower.from[1])),
   nominal_wall_thickness_mm:upper.thickness_mm,
   nominal_east_wall_face_x_mm:round(face),
   six_seat_table_nearest_horizontal_projected_gap_from_wall_face_mm:round(tableSpan),
   original_kitchen_room_area_m2:round(model.rooms.find(r=>r.id==="KIT-01").area_estimate_m2),
   jamb_finish_sensitivities:jambSens
  },
  activity:{
   dining_states:sixPullback,
   dishwasher_sensitivity:doorProxy,
   fridge_present_unchanged:true,
   wall_opened_in_canonical_layout:false,
   judgement:"The wider P1 opening increases nominal opening length ALONG the kitchen wall, not the east-west table-to-wall clearance. No functional route approval can follow from this horizontal gap alone."
  },
  questions,release_flags:release,
  release_status:"WAITING_ON_FIELD_EVIDENCE",
  policy:"Do not call this a permit, measured access, guaranteed cooking ventilation or field-approved 10/10 layout."
 };
}
export function p1SiteSvg(report){
 const g=report.geometry,st=report.activity.dining_states;
 const cell=(x,y,v)=>'<text x="'+x+'" y="'+y+'" fill="#33443c" font-family="Arial" font-size="16">'+String(v)+'</text>';
 let s='<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1140 670" role="img" aria-label="P1 nominal opening, table clearance and household use sensitivity">';
 s+='<rect width="1140" height="670" fill="#faf8f3"/><text x="48" y="54" font-size="28" font-family="Arial" font-weight="700" fill="#22382e">P1 / FUNCTIONAL SITE REVIEW - CONCEPT ONLY</text>';
 s+=cell(49,88,"Same saved Type B v55 furniture; nothing demolished or repositioned");
 s+='<rect x="44" y="118" width="1052" height="345" rx="12" fill="#f2eee6" stroke="#c6ccc3"/>';
 s+='<rect x="85" y="154" width="402" height="260" fill="#e4eee7"/><rect x="513" y="154" width="538" height="260" fill="#f0e3d4"/>';
 s+=cell(161,181,"KITCHEN / unchanged wet services");s+=cell(663,181,"DINING / original six-seat table");
 s+='<line x1="501" y1="159" x2="501" y2="313" stroke="#37816b" stroke-width="9" stroke-dasharray="12 9"/>';
 s+='<line x1="501" y1="313" x2="501" y2="414" stroke="#5c6a61" stroke-width="15"/>';
 s+='<rect x="694" y="218" width="245" height="115" rx="9" fill="#cdb797" stroke="#a18b70" stroke-width="2"/>';
 for(const x of [704,786,868]){
  s+='<rect x="'+x+'" y="190" width="58" height="24" fill="#f6f0e7" stroke="#a9a091"/>';
  s+='<rect x="'+x+'" y="339" width="58" height="24" fill="#f6f0e7" stroke="#a9a091"/>';
 }
 s+='<line x1="510" y1="277" x2="694" y2="277" stroke="#876340" stroke-width="2"/>';
 s+='<text x="539" y="263" font-size="18" font-family="Arial" fill="#876340">997 mm projected</text>';
 s+=cell(80,434,"Nominal model only · P1 aperture "+g.nominal_opening_p1_mm+" mm");
 s+=cell(58,502,"P0 opening: "+g.nominal_opening_p0_mm+" mm   →   P1 opening: "+g.nominal_opening_p1_mm+" mm (+"+g.expanded_mm+" mm)");
 s+=cell(58,535,"Table-to-wall projected gap: "+g.six_seat_table_nearest_horizontal_projected_gap_from_wall_face_mm+" mm in BOTH options");
 s+=cell(58,570,"All six chairs modeled; sampled pullbacks: "+st.map(q=>q.chair_pullback_mm).join(" / ")+" mm");
 s+='<text x="58" y="605" font-size="16" fill="#a15143" font-family="Arial">CAUTION: not a clear walking corridor, door-opening proof, survey or permission to remove wall.</text>';
 s+='<text x="58" y="637" font-size="14" fill="#728078" font-family="Arial">Developer + qualified engineer + appliance suppliers must verify as built before execution.</text></svg>';
 return s;
}
