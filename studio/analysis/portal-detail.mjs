/**
 * Owner-facing dimension + finishes audit for the conditional P1 aperture.
 * Exact canonical plan measurements, not a structural or installation drawing.
 */
import assert from "node:assert/strict";
const round=n=>+n.toFixed(1);
const dist=(a,b)=>Math.hypot(a[0]-b[0],a[1]-b[1]);
export function portalDetail(domain,source){
 assert.equal(source.canonical_sha256,domain.model.canonical_sha256);
 assert.equal(source.scene_revision,domain.revision(source.layout));
 const mdl=domain.model;
 const wall44=mdl.wall_segments[44],wall45=mdl.wall_segments[45];
 const entry=mdl.openings.find(x=>x.id==="OP-RECP-KIT");
 const table=source.layout.furniture.find(x=>x.id==="starter-35");
 assert.ok(entry&&table);
 assert.deepEqual(wall44.rooms,["KIT-01","RECP-01"]);
 assert.deepEqual(wall45.rooms,["KIT-01","RECP-01"]);
 assert.equal(wall44.to[1],entry.from[1]);
 assert.equal(wall45.from[1],entry.to[1]);
 assert.equal(wall44.from[0],entry.from[0]);
 assert.equal(table.w,2000);assert.equal(table.d,950);
 const original=dist(entry.from,entry.to);
 const portal=dist(wall44.from,entry.to);
 const jamb=20;
 const lower=dist(wall45.from,wall45.to);
 const pocketMargin=lower-portal;
 const toTable=table.cx-table.w/2-entry.from[0];
 assert.ok(original>700&&original<740);
 assert.ok(portal>1200&&portal<1220);
 assert.ok(toTable>1000);
 const item={
  schema:"TypeBPortalFinishDecision/1",status:"VISUAL_PRELIMINARY_ONLY",source_scene:source.scene_revision,
  canonical_sha256:source.canonical_sha256,
  geometry:{
   opened_wall_segment_index:44,original_hinged_opening_nominal_mm:round(original),
   proposed_portal_nominal_mm:round(portal),nominal_gain_mm:round(portal-original),
   upper_removed_return_mm:round(dist(wall44.from,wall44.to)),
   lower_retained_return_mm:round(lower),wall_thickness_model_mm:wall44.thickness_mm,
   finished_ceiling_model_mm:Math.round(mdl.height_m*1000),
   proposed_20mm_each_side_reveal_nominal_remaining_mm:round(portal-2*jamb),
   door_panel_full_width_pocket_side_shortfall_mm:round(Math.max(0,portal-lower)),
   aperture_wall_x_mm:entry.from[0],
   aperture_y_min_mm:wall44.from[1],aperture_y_max_mm:entry.to[1],
   adjacent_2000mm_table_nearest_projected_x_gap_mm:round(toTable),
   lower_wall_segment_index:45,
   caveat:"Plan-calibrated coordinates. Opening and panel dimensions exclude site tolerance, structural beam, head/jamb, hinge tracks and skirtings. Table projection is NOT free walking width."
  },
  proposed_design:{
   preferred:"F1_OPEN_REVEAL",
   F1_OPEN_REVEAL:{status:"PREFERRED_VISUAL_DETAIL_NOT_AUTHORISED",
    jamb_finish:"Warm off-white microcement/plaster return, 20mm indicative edge allowance per side",
    edges:"Rounded impact-resistant exposed corners; flush architrave-free opening where feasible",
    threshold:"Floor transition aligned with opening plane; slim low-profile coordinating metal/stone joint, flush and slip-safe after site substrate survey",
    lighting:"3000K layered work lights over kitchen worktops, no speculative dropped soffit or recess into unknown lintel",
    advantages:["Open sightlines","No pocket panel parking","Simple wipe-clean maintenance"],
    disadvantages:["Cooking odors and noise transmit to reception","Sink and washer remain visibly accessible"]
   },
   F2_OPTIONAL_GLAZING:{status:"CONDITIONAL_IF_PRIVACY_OR_ODOUR_IMPORTANT",
    system:"Vendor-dimensioned multi-leaf folding/stacking glazing or approved surface-mounted sliding alternative; NO presumed hidden pocket",
    requirements:["Supplier track/stack drawings, real parking footprint and effective clear walking opening","Structural beam and head-fixing load approval","Tempered or laminated safety glazing and edge clearances per specialist","Ventilation path and cleaning/maintenance strategy"],
    note:"One leaf equal to nominal portal width cannot stow in the only 783.8mm lower adjacent wall return."
   }
  },
  function_gates:{
   fixed_sink_and_dishwasher:true,wet_island_added:false,
   existing_indoor_washer_retained:true,six_chairs_retained:true,
   domestic_hood_ventilation_verified:false,wall_removal_permitted:false,
   real_six_people_and_unloading_scenario_verified:false,
   fitted_opening_head_height_verified:false,real_flooring_joint_verified:false
  },
  release:"HOLD_FOR_DEVELOPER_AND_QUALIFIED_ENGINEER",
  next_review:[
   "Architect/structural engineer on site identifies segment 44, concealed services and beam/lintel, confirms what opening dimensions are allowed",
   "Measure actual plastered side faces and full opening with structural head clearance; ask for a sketch of eligible edge and reveal detail",
   "Choose precise DW/fridge/hob/hood models and verify full doors plus one user unloading and six occupied dining chairs",
   "Obtain ventilation, safe gas/extraction and illumination design with no assumed hidden ceiling volume",
   "Only after above, show matched P1/F1 finish rendering and an optional verified glazed version if required"
  ]
 };
 return item;
}
const esc=s=>String(s).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
export function portalDetailSvg(report){
 assert.equal(report.schema,"TypeBPortalFinishDecision/1");
 const g=report.geometry,s=.29,x0=120,y0=110;
 const Y=y=>y0+(y-g.aperture_y_min_mm)*s,lo=Y(g.aperture_y_min_mm),hi=Y(g.aperture_y_max_mm);
 const side=g.lower_retained_return_mm*s;
 const open=(hi-lo).toFixed(1);
 const line=(x1,y1,x2,y2,col,w=2,dash="")=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+col+'" stroke-width="'+w+'" '+(dash?'stroke-dasharray="'+dash+'"':'')+'/>';
 let out='<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1470 790" role="img" aria-label="Type B conditional kitchen portal dimensions and finishes">';
 out+='<rect width="1470" height="790" fill="#faf8f4"/>';
 out+='<text x="58" y="57" font-family="Arial" font-size="28" font-weight="700" fill="#273e35">P1 / SEMI-OPEN KITCHEN - CONCEPT DETAIL</text>';
 out+='<text x="58" y="85" font-family="Arial" font-size="15" fill="#5c6a61">From measured model coordinates only  •  NOT an as-built drawing, demolition approval or glazing shop detail</text>';
 out+='<rect x="58" y="115" width="650" height="455" rx="12" fill="#f1eee8" stroke="#d3d0c8"/>';
 out+='<text x="80" y="150" font-family="Arial" font-size="19" font-weight="700" fill="#293c34">PLAN / along kitchen east wall</text>';
 // local plan axis: vertical along wall; side room columns
 const xx=343,yy=180,scale=.205;
 const origin=g.aperture_y_min_mm;
 const p=y=>yy+(y-origin)*scale;
 const top=p(origin),bottom=p(g.aperture_y_max_mm),tail=p(g.aperture_y_max_mm+g.lower_retained_return_mm);
 out+='<rect x="95" y="185" width="230" height="340" fill="#e1e8e0" opacity=".62"/>';
 out+='<rect x="365" y="185" width="298" height="340" fill="#ede4d6" opacity=".7"/>';
 out+='<text x="145" y="208" font-size="15" font-family="Arial" fill="#4f6257">KITCHEN</text>';
 out+='<text x="515" y="208" font-size="15" font-family="Arial" fill="#4f6257">DINING</text>';
 out+=line(xx,p(origin),xx,p(g.aperture_y_max_mm),"#34816b",9,"10 8");
 out+=line(xx,bottom,xx,tail,"#575f5c",15);
 out+=line(xx-36,p(origin),xx-36,bottom,"#366555",2);
 out+=line(xx-45,p(origin),xx-27,p(origin),"#366555",2);
 out+=line(xx-45,bottom,xx-27,bottom,"#366555",2);
 out+='<text x="98" y="'+(p(origin)+133)+'" font-family="Arial" font-size="17" fill="#2e5d4c">PORTAL '+g.proposed_portal_nominal_mm+' mm</text>';
 out+='<text x="388" y="'+(bottom+33)+'" font-family="Arial" font-size="15" fill="#5f6663">Retain '+g.lower_retained_return_mm+' mm wall</text>';
 out+='<text x="391" y="'+(bottom+56)+'" font-family="Arial" font-size="14" fill="#a04e3c">Hidden wall segment #44 only</text>';
 out+='<rect x="760" y="115" width="650" height="455" rx="12" fill="#f1eee8" stroke="#d3d0c8"/>';
 out+='<text x="784" y="150" font-family="Arial" font-size="19" font-weight="700" fill="#293c34">ELEVATION / schematic unfinished opening</text>';
 const left=855,topEl=211,w=400,h=280;
 out+='<rect x="'+left+'" y="'+topEl+'" width="'+w+'" height="'+h+'" fill="#e5ded1" stroke="#9b9c92" stroke-width="8"/>';
 out+='<rect x="'+(left+20)+'" y="'+(topEl+20)+'" width="'+(w-40)+'" height="'+(h-20)+'" fill="#f7f6f2" stroke="#d3c8b8" stroke-width="2"/>';
 out+=line(left,topEl-26,left+w,topEl-26,"#537967",2);
 out+='<text x="'+(left+145)+'" y="'+(topEl-42)+'" font-family="Arial" font-size="16" fill="#315e4c">'+g.proposed_portal_nominal_mm+' mm NOMINAL</text>';
 out+='<text x="'+(left+95)+'" y="'+(topEl+118)+'" font-family="Arial" font-size="17" fill="#566d60">F1 warm ivory reveals</text>';
 out+='<text x="'+(left+100)+'" y="'+(topEl+149)+'" font-family="Arial" font-size="15" fill="#566d60">20 mm each side: concept</text>';
 out+='<text x="'+(left+84)+'" y="'+(topEl+194)+'" font-family="Arial" font-size="15" fill="#9b5545">Head/lintel HEIGHT UNKNOWN</text>';
 out+='<text x="790" y="528" font-family="Arial" font-size="15" fill="#6e6b63">Finished 2.50m ceiling is model context, NOT clear opening height</text>';
 out+='<text x="65" y="625" font-family="Arial" font-size="18" font-weight="700" fill="#293c34">DESIGN DECISIONS</text>';
 out+='<text x="65" y="661" font-family="Arial" font-size="16" fill="#384941">F1 preferred: open painted reveal + flush floor transition + 3000K task lighting.</text>';
 out+='<text x="65" y="690" font-family="Arial" font-size="16" fill="#384941">F2 optional: supplier-verified folding/stacking safety glazing (do not assume hidden pocket).</text>';
 out+='<text x="65" y="722" font-family="Arial" font-size="16" fill="#a04e3c">Single full-width hidden pocket needs '+g.proposed_portal_nominal_mm+' mm but has only '+g.lower_retained_return_mm+' mm on the short return.</text>';
 out+='<text x="65" y="751" font-family="Arial" font-size="14" fill="#697770">Type B v0.2.2 locked  •  cloud v55 unchanged  •  developer and structural review REQUIRED</text></svg>';
 return out;
}
