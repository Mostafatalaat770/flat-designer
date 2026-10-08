/**
 * A9: Compare manufacturable wardrobe access families using K12 cabinet width,
 * A8 measured corridor and published hardware dimensional LIMITS.
 *
 * DISCLAIMER: Panel sizes may fit catalog envelope but no installation or
 * Egyptian stock/cost/shop drawing is approved. Geometry-only screening.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const snapshot=read('design-development/k12/snapshot.json');
const audit=read('review-evidence/advisor-a8/private-wet-storage.json');
assert.equal(snapshot.canonical_sha256,audit.source.canonical_sha256);
assert.equal(snapshot.scene_revision,audit.source.scene_revision);
const w=1250,d=600,aisle=audit.measured_from_image_calibrated_model.dressing.between_closed_fronts_mm;
assert.equal(aisle,1335);
const manufacturers={
 hettichWingLineL:{
  officialEgyptPage:'https://www.hettich.com/en-eg/products/folding-door-systems',
  officialSpecs:'https://www.hettich.com/fileadmin/Media_Center/Catalogue/Hettich_Product_Leaflet_WingLine_L_2023.pdf',
  doorWingMinWidthMm:250,doorWingMaxWidthMm:600,
  maxHeightMm:2400,maxDoorWingWeightKg:25,
  notes:'Official WingLine L is a TWO-WING folding unit. A 1250 cabinet could hypothetically be split into two opposing 625-mm pair-width units each with two 312.5-mm panels; hardware and mounting compatibility, handedness, center gap and full drawer access MUST be engineered.'
 },
 blumRevegoDuo:{
  officialSpecs:'https://www.blum.com/in/en/products/pocketsystems/revego/programme/',
  mountingWidthRangeMm:[900,1500],pocketWidthMm:150,minimumMountDepthMm:573,
  frontWidthRangeMm:[442,748],
  notes:'Pocket system with full-height fronts; one 150-mm pocket is a real installation width cost. If the 1250mm wardrobe must absorb this pocket, nominal internal usable application width can fall by roughly 150mm, subject to exact configuration.'
 }
};
const make=(id,title,method,extra={})=>{
 const one=+(aisle-method.swingProjectionPerCabinetMm).toFixed(1);
 const both=+(aisle-2*method.swingProjectionPerCabinetMm).toFixed(1);
 return {id,title,operation_method:method,
   nominal_corridor_mm:{both_closed:aisle,one_side_operating:one,both_sides_operating:both},
   can_fit_generic_600mm_stationary_person_at_one_open:one>=600,
   can_fit_generic_600mm_stationary_person_both_open:both>=600,
   ...extra};
};
const options=[
 make('H2','2 conventional hinged doors per wardrobe',{panelWidthsMm:[625,625],swingProjectionPerCabinetMm:625},{
  verdict:'REJECT simultaneous opening as family-first default. 85mm door-tip space, although one cabinet alone leaves 710mm.',
  cabinet_nominal_retained_mm:1250,access:'Full front when both leafs swung away, but two opposite active doors block corridor.'
 }),
 make('H4','4 narrow independent hinged doors per wardrobe',{panelWidthsMm:[312.5,312.5,312.5,312.5],swingProjectionPerCabinetMm:312.5},{
  verdict:'POSSIBLE but high 4-leaf seam/hinge count and access obstruction; an aesthetic/maintenance penalty.',
  cabinet_nominal_retained_mm:1250,access:'Potentially full front if all four opens, but many hinges and interruption to drawers.'
 }),
 make('SL2','2-track sliding cabinet doors',{panelWidthsMm:[625,625],swingProjectionPerCabinetMm:0},{
  verdict:'LOW-PROJECTION SIMPLE CONTROL; requires exact drawer and rail access study.',
  cabinet_nominal_retained_mm:1250,
  approximate_simultaneous_opening_width_mm:625,
  caution:'The 625mm number is optimistic nominal; true opening less because of track overlap, door edge, carcass and handle. One part of cabinet remains covered.'
 }),
 make('BF4','two 2-wing folding pairs per 1250 cabinet (4×312.5 panels)',{panelWidthsMm:[312.5,312.5,312.5,312.5],swingProjectionPerCabinetMm:312.5},{
  verdict:'PROMISING CANDIDATE: investigate Hettich WingLine L or technically equivalent. Projected 312.5mm is a conservative STUDY ASSUMPTION, not Hettich manufacturer clearance.',
  manufacturer_family:manufacturers.hettichWingLineL,
  dimension_screen:{panel_312_5_within_250_to_600_mm_range:true,door_height_tbd:true,max_door_weight_tbd:true,
  pairing_625mm_replaces_single_prohibited_625mm_panel:true},
  cabinet_nominal_retained_mm:1250,
  access:'Folding pairs could expose a wider cabinet opening than an ordinary 2-track slider, but center/hardware and drawer geometry unverified.'
 }),
 make('PO2','double-pocket slide-in doors within cabinet width',{panelWidthsMm:[550,550],swingProjectionPerCabinetMm:0},{
  verdict:'LUXURY FEASIBILITY-ONLY, NOT RECOMMENDED DEFAULT: hardware complexity and likely lost cabinet width.',
  manufacturer_family:manufacturers.blumRevegoDuo,
  nominal_width_if_150mm_pocket_consumes_1250_mm_cabinet:1100,
  loss_of_nominal_width_percent:12,
  caution:'Actual usable space must be read from product configurator: depends on one vs two pockets, internal application and installed depth.'
 })
];
assert.equal(options[0].nominal_corridor_mm.both_sides_operating,85);
assert.equal(options[3].nominal_corridor_mm.both_sides_operating,710);
assert.equal(options[3].operation_method.panelWidthsMm.reduce((a,b)=>a+b,0),w);
assert.ok(options[3].operation_method.panelWidthsMm.every(x=>x>=manufacturers.hettichWingLineL.doorWingMinWidthMm&&x<=manufacturers.hettichWingLineL.doorWingMaxWidthMm));
assert.ok(manufacturers.blumRevegoDuo.mountingWidthRangeMm[0]<=w&&w<=manufacturers.blumRevegoDuo.mountingWidthRangeMm[1]);
const result={
 schema:'AdvisorA9WardrobeDoorSystemComparison/1',
 status:'CONCEPT FEASIBILITY / NEEDS HARDWARE CONFIGURATION AND SHOP DRAWINGS',
 source:{scene_revision:snapshot.scene_revision,canonical_sha256:snapshot.canonical_sha256,closed_wardrobe_aisle_mm:aisle,wardrobe_size_mm:[w,d]},
 options,
 household_intent:'Owner/family-first, two opposite wardrobes must be usable in a 1335mm gap with low annoyance, easy maintenance and clear drawers.',
 lead_recommendation:'SHORTLIST 2-pair bifolding hardware and quality 2-panel sliding. The folding system may offer full access with little operating corridor projection, but requires manufacturer CAD/part list for each 1250mm cabinet. Do not choose a premium pocket system by default.',
 full_joinery_validation_needed:[
  'Two cabinet site widths after plaster and fillers, height of fronts, actual hinge/guide location, door material and weight',
  'Actual manufacturer section for 4×312.5mm fronts; WingLine L typically operates two panels per set, so prove handedness, two sets in 1250mm and center clearance',
  'For sliding: measured FULLY OPEN clear aperture including handle and door overlap, and whether internal 450mm wide drawer can extend past sliding leaf',
  'For folding: prove internal drawers, hanging section and door stacks remain accessible when folding pairs parked; no protruding handles',
  'Measure standing person + pull-out drawers while opposite cabinet is in daily use, service/cleaning and replacement access',
  'Verified Egypt-market quotations, spares availability and guarantee/maintenance terms; do not infer local price or stocked SKU from global website'
 ],
 restrictions:'Hardware catalogs are feasibility input ONLY, not Egypt code, contract or manufacturer installation certification.'
};
fs.mkdirSync('review-evidence/advisor-a9',{recursive:true});
fs.writeFileSync('review-evidence/advisor-a9/wardrobe-door-options.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({schema:result.schema,status:result.status,summary:options.map(x=>({id:x.id,one:x.nominal_corridor_mm.one_side_operating,both:x.nominal_corridor_mm.both_sides_operating,verdict:x.verdict})),manufacturer_sources:manufacturers},null,2));
