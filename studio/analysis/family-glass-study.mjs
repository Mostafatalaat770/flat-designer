/** Precisely v55 family shower glass/hardware alternative. Never changes actual bathroom geometry. */
import assert from "node:assert/strict";
import {rectangle,polygonGap} from "./geometry.mjs";
const clone=v=>structuredClone(v);
const extents=vertices=>({xmin:Math.min(...vertices.map(p=>p[0])),xmax:Math.max(...vertices.map(p=>p[0])),
 ymin:Math.min(...vertices.map(p=>p[1])),ymax:Math.max(...vertices.map(p=>p[1]))});
export function makeFamilyShowerHardwareStudy(current,domain){
 assert.equal(current.canonical_sha256,domain.model.canonical_sha256);
 assert.equal(current.source_scene_revision,"scene-4821689");
 assert.equal(current.storage_revision,55);
 assert.equal(current.scene_revision,domain.revision(current.layout));
 assert.deepEqual(current.layout.demolished,[]);
 assert.equal(current.architecture_variant,undefined);
 const cameraIds=["bath55-family-entry","bath55-family-dry-cabinet"];
 const cams=cameraIds.map(id=>{const view=current.views.find(v=>v.id===id);assert.ok(view,"Missing locked family camera "+id);return clone(view)});
 const room=domain.model.rooms.find(r=>r.id==="BATH-C01");
 const family=current.layout.furniture.find(f=>f.id==="starter-16");
 const wc=current.layout.furniture.find(f=>f.id==="starter-17");
 const vanity=current.layout.furniture.find(f=>f.id==="starter-18");
 const door=domain.model.openings.find(o=>o.id==="OP-HALL-BATHC");
 assert.ok(room&&family&&wc&&vanity&&door);
 assert.deepEqual([family.w,family.d,family.rot,family.variant],[900,900,0,"style"]);
 const base=clone(current);
 base.name="Family shower F0 / old bulky and visually inaccurate style - study control";
 base.views=clone(cams);
 const candidate=clone(base);
 candidate.name="Family shower F1 / minimal safety-glass CLOSED-Door + low tray proxy";
 candidate.layout.furniture.find(f=>f.id==="starter-16").variant="minimal-glass";
 candidate.scene_revision=domain.revision(candidate.layout);
 assert.notEqual(candidate.scene_revision,base.scene_revision);
 const others=f=>f.layout.furniture.filter(x=>x.id!=="starter-16");
 assert.deepEqual(others(base),others(candidate));
 assert.deepEqual(base.layout.interior,candidate.layout.interior);
 assert.deepEqual(base.layout.rooms,candidate.layout.rooms);
 assert.deepEqual(base.layout.demolished,candidate.layout.demolished);
 assert.deepEqual(base.views,candidate.views);
 assert.equal(candidate.architecture_variant,undefined);
 assert.deepEqual(domain.validate(candidate.layout).checks.filter(c=>c.status==="FAIL"),[]);
 const showerBox=extents(rectangle(family));
 const wcBox=extents(rectangle(wc));
 const boundaries=extents(room.poly);
 const westSpace=showerBox.xmin-boundaries.xmin;
 const southGap=showerBox.ymin-wcBox.ymax;
 // Only geometry sensitivity: a 570mm leaf swinging outwards could protrude
 // into the nominal 779mm west strip, leaving ~209mm, an UNUSABLE route.
 // The leaf is CLOSED in both WebGL frames and no swing is implied.
 const doorLeaf=family.d-330;
 const outwardRemaining=westSpace-doorLeaf;
 assert.ok(westSpace>700&&westSpace<850);
 assert.ok(outwardRemaining>150&&outwardRemaining<250);
 const audit={
  schema:"TypeBFamilyShowerHardwareStudy/1",status:"UNAPPROVED_VISUAL_VARIANT",
  canonical_sha256:current.canonical_sha256,source_scene:current.scene_revision,
  cloud_source_scene:current.source_scene_revision,cloud_revision:current.storage_revision,
  candidate_scene:candidate.scene_revision,cameras:cameraIds,
  changed_fixture_variant_only:"starter-16",shower_footprint_mm:[family.w,family.d],
  unchanged_canonical_architecture:true,unchanged_door_opening:true,unchanged_drain_location:true,
  dimensions:{
   room_model_width_mm:+(boundaries.xmax-boundaries.xmin).toFixed(1),
   west_nominal_edge_space_mm:+westSpace.toFixed(1),
   south_glass_face_to_wc_nominal_gap_mm:+southGap.toFixed(1),
   hall_door_nominal_mm:+door.length_mm.toFixed(1),
   proposed_closed_leaf_model_mm:doorLeaf,
   proposed_fixed_panel_model_mm:330,
   proposed_visual_base_height_mm:22,
   proposed_glass_height_mm:1980,
   worst_proxy_outward_swing_remainder_mm:+outwardRemaining.toFixed(1)
  },
  spatial_caveat:"A west-facing hinged 570mm door swung outward into the 779mm nominal west strip would leave only about 209mm of gap: NOT an acceptable occupied circulation path. This is NOT a tested swing, final glass hinge or as-built dimension. Do not specify outward swing from the visualization.",
  design_goal:"A real supplier-designed easy-clean safety-glass solution spanning exposed SOUTH and WEST shower sides (the north/east are masonry). Slim clips; no dark overhead rails. Glass door shown CLOSED only; supplier must decide safe inward/pivot/folding actual entry.",
  decision:"HOLD. Appearance can be visually compared; installer must provide actual 900x900 enclosure with water-seal and door sweep, client must trial standing, WC seating and cleaning.",
  hard_gates:[
   {id:"FAMILY-GLASS",passed:false,description:"Safety-glass specification and certified manufacturer system, correct exposed faces, seal/gasket maintenance and threshold / hinge details"},
   {id:"FAMILY-ENTRY",passed:false,description:"Supplier’s measured door position and full sweep with another person in room, WC seating, nominal 657mm hall doorway and showering access"},
   {id:"FAMILY-DRAIN",passed:false,description:"Slab/screed build-up, waterproof system, trap outlet and permitted 22mm or alternative low-profile shower base with tested falls"},
   {id:"FAMILY-SPLASH",passed:false,description:"Full wet/dry shower splash containment including door junction and floor upstands, no leak to room"},
   {id:"FAMILY-MAINTENANCE",passed:false,description:"Reach to gaskets, doors, trap, valves and cleaning under/around the high dry storage cabinet"}
  ]
 };
 return {base,candidate,audit};
}
export function familyShowerPlanSvg(result,domain){
 const {audit}=result,g=audit.dimensions;
 const room=domain.model.rooms.find(r=>r.id==="BATH-C01");
 const bounds=extents(room.poly);
 const shower=extents(rectangle(result.base.layout.furniture.find(f=>f.id==="starter-16")));
 const wc=extents(rectangle(result.base.layout.furniture.find(f=>f.id==="starter-17")));
 const scale=.22,xx=100,yy=142;
 const PX=x=>xx+(x-bounds.xmin)*scale,PY=y=>yy+(y-bounds.ymin)*scale;
 const rect=(b,colour,stroke)=>'<rect x="'+PX(b.xmin)+'" y="'+PY(b.ymin)+'" width="'+(b.xmax-b.xmin)*scale+'" height="'+(b.ymax-b.ymin)*scale+'" fill="'+colour+'" stroke="'+stroke+'" stroke-width="2"/>';
 let svg='<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1090 800" role="img" aria-label="900 by 900 family shower enclosure expose walls and cautious leaf sweep">';
 svg+='<rect width="1090" height="800" fill="#FBF9F5"/><text x="42" y="52" fill="#283E33" font-size="28" font-weight="700" font-family="Arial">FAMILY BATH · MINIMAL GLASS STUDY</text>';
 svg+='<text x="42" y="86" font-size="16" font-family="Arial" fill="#637369">Current Type B footprint only · not an installed glass / waterproofing drawing</text>';
 svg+=rect(bounds,"#EFE8DD","#999F95")+rect(shower,"#DCE8E5","#78968C")+rect(wc,"#F8F7F2","#8D9B91");
 svg+='<line x1="'+PX(shower.xmin)+'" y1="'+PY(shower.ymin)+'" x2="'+PX(shower.xmax)+'" y2="'+PY(shower.ymin)+'" stroke="#476C63" stroke-width="5"/>';
 svg+='<line x1="'+PX(shower.xmin)+'" y1="'+PY(shower.ymin)+'" x2="'+PX(shower.xmin)+'" y2="'+PY(shower.ymax)+'" stroke="#476C63" stroke-width="5"/>';
 svg+='<text x="'+PX(shower.xmin+80)+'" y="'+PY(shower.ymin+420)+'" fill="#28463C" font-size="15" font-family="Arial">900×900</text>';
 svg+='<text x="'+PX(wc.xmin)+'" y="'+(PY(wc.ymin)-12)+'" fill="#5A6961" font-size="15" font-family="Arial">WC unchanged</text>';
 svg+='<text x="540" y="185" font-size="20" font-family="Arial" font-weight="700" fill="#283E33">Existing geometry — exact model</text>';
 svg+='<text x="540" y="235" font-size="18" font-family="Arial" fill="#4C6255">West strip nominal: '+g.west_nominal_edge_space_mm+' mm</text>';
 svg+='<text x="540" y="276" font-size="18" font-family="Arial" fill="#4C6255">South glass / WC gap: '+g.south_glass_face_to_wc_nominal_gap_mm+' mm</text>';
 svg+='<text x="540" y="318" font-size="18" font-family="Arial" fill="#4C6255">Hall door nominal: '+g.hall_door_nominal_mm+' mm</text>';
 svg+='<text x="540" y="372" font-size="18" font-family="Arial" fill="#4C6255">Glass west leaf proxy: '+g.proposed_closed_leaf_model_mm+' mm</text>';
 svg+='<text x="540" y="410" font-size="18" font-family="Arial" fill="#4C6255">Slender base visual: '+g.proposed_visual_base_height_mm+' mm</text>';
 svg+='<text x="540" y="480" font-size="18" font-family="Arial" font-weight="700" fill="#9B5141">OUTWARD SWING IS NOT APPROVED</text>';
 svg+='<text x="540" y="518" font-size="17" font-family="Arial" fill="#9B5141">If 570 mm swings west: just '+g.worst_proxy_outward_swing_remainder_mm+' mm remaining</text>';
 svg+='<text x="540" y="556" font-size="17" font-family="Arial" fill="#677369">Door shown CLOSED in render. Hinge / folding / pivot TBD.</text>';
 svg+='<text x="42" y="744" font-size="16" font-family="Arial" fill="#9B5141">NO structural slab cut, waterproof certification, product approval, or measured human access is inferred.</text>';
 svg+='<text x="42" y="779" font-size="14" font-family="Arial" fill="#61746A">Cloud Studio v55 untouched • Room geometry / door locations / sanitary fixtures unchanged</text></svg>';
 return svg;
}
