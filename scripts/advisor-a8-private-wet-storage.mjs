/**
 * Advisor A8 — family-first private wet rooms and dressing use envelopes.
 * Audits canonical room bounds, existing K12 fixture and wardrobe footprints,
 * and clearly labeled hypothetical service/door-use envelopes. READ ONLY.
 *
 * npm run build && node scripts/advisor-a8-private-wet-storage.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';

const domain=createApartmentDomain(process.cwd());
const model=domain.model;
const snapshot=JSON.parse(fs.readFileSync('design-development/k12/snapshot.json','utf8'));
assert.equal(snapshot.canonical_sha256,model.canonical_sha256);
assert.equal(snapshot.scene_revision,domain.revision(snapshot.layout));
const find=id=>{let x=snapshot.layout.furniture.find(z=>z.id===id);assert.ok(x,'Missing '+id);return x};
const rect=f=>{
 const rot=((f.rot||0)%360+360)%360;
 const flip=rot===90||rot===270;
 assert.ok([0,90,180,270].includes(rot),'A8 rectangle cannot infer angled geometry for '+f.id);
 const w=flip?f.d:f.w,d=flip?f.w:f.d;
 return {x0:f.cx-w/2,x1:f.cx+w/2,y0:f.cy-d/2,y1:f.cy+d/2};
};
const gap=(a,b)=>{
 const x=Math.max(0,b.x0-a.x1,a.x0-b.x1);
 const y=Math.max(0,b.y0-a.y1,a.y0-b.y1);
 const xOverlap=Math.max(0,Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0));
 const yOverlap=Math.max(0,Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0));
 return {separation_mm:+Math.hypot(x,y).toFixed(1),horizontal_mm:x,vertical_mm:y,overlap_area_mm2:+(xOverlap*yOverlap).toFixed(1)};
};
const room=id=>{const r=model.rooms.find(x=>x.id===id);assert.ok(r);return r;};
const bounds=id=>{let p=room(id).poly;return{x0:Math.min(...p.map(x=>x[0])),x1:Math.max(...p.map(x=>x[0])),y0:Math.min(...p.map(x=>x[1])),y1:Math.max(...p.map(x=>x[1]))};};
const size=b=>[+(b.x1-b.x0).toFixed(1),+(b.y1-b.y0).toFixed(1)];
const door=id=>{let o=model.doors.find(x=>x.id===id);assert.ok(o,id);return o;};
const testingRooms=['WIC-01','BATH-M01','BATH-C01','WC-01'];
for(const id of testingRooms) assert.ok(room(id).printed.includes('m'));
const wic=bounds('WIC-01');
const north=rect(find('starter-4')),south=rect(find('starter-5'));
assert.equal(find('starter-4').room_id,'WIC-01');
assert.equal(find('starter-5').room_id,'WIC-01');
assert.equal(find('starter-4').w,1250);
assert.equal(find('starter-5').w,1250);
const actualWardrobeGap=+(south.y0-north.y1).toFixed(1);
assert.equal(actualWardrobeGap,1335);
assert.equal(door('OP-WIC-BATHM').len,677.8510000000006);
const widthPerDoor=[
 {scheme:'2 hinged leaves per 1250mm cabinet',leaf_count_per_cabinet:2,door_open_depth_mm:625},
 {scheme:'3 narrower hinged leaves per cabinet',leaf_count_per_cabinet:3,door_open_depth_mm:1250/3},
 {scheme:'4 narrower hinged leaves per cabinet',leaf_count_per_cabinet:4,door_open_depth_mm:312.5},
 {scheme:'2-track sliding cabinet fronts (concept)',leaf_count_per_cabinet:2,door_open_depth_mm:0},
].map(o=>({
 ...o,
 one_cabinet_open_remaining_mm:+(actualWardrobeGap-o.door_open_depth_mm).toFixed(1),
 both_opposed_open_remaining_mm:+(actualWardrobeGap-2*o.door_open_depth_mm).toFixed(1),
 user_alert:o.door_open_depth_mm===0
  ?'Clear floor not occupied by swinging leaf, but nominal half-width access; rails/door overlap, internal drawer opening and handle thickness unknown'
  : 'Generic leaf radial swing estimate only; no person envelope, hinge geometry or drawer front verified'
}));
assert.equal(widthPerDoor[0].both_opposed_open_remaining_mm,85);
assert.equal(widthPerDoor[2].both_opposed_open_remaining_mm,710);
const ceiling=model.height_m;
assert.equal(ceiling,2.5);
const ensuite=bounds('BATH-M01'),family=bounds('BATH-C01'),guest=bounds('WC-01');
const shower=rect(find('I1-master-shower'));
const tub=rect(find('I2-family-tub'));
const wcMaster=rect(find('starter-15'));
const wcFamily=rect(find('starter-17'));
const wcGuest=rect(find('starter-25'));
const vanityMaster=rect(find('R1-ensuite-vanity'));
const vanityFamily=rect(find('starter-18'));
const vanityGuest=rect(find('starter-26'));
assert.deepEqual(size(shower),[1500,800]);
assert.deepEqual(size(tub),[1500,750]);
assert.deepEqual(size(vanityMaster),[600,460]);
assert.deepEqual(size(vanityFamily),[600,460]);
assert.deepEqual(size(vanityGuest),[350,180]);
const ensuiteEntry=door('OP-WIC-BATHM'),familyEntry=door('OP-HALL-BATHC'),guestEntry=door('OP-RECP-WC');
const vanityMasterWC=gap(vanityMaster,wcMaster),familyVanityWC=gap(vanityFamily,wcFamily),familyTubWC=gap(tub,wcFamily);
const familyStanding={x0:8200,x1:8800,y0:vanityFamily.y1,y1:vanityFamily.y1+600};
const testStandFamily=gap(familyStanding,wcFamily);
const masterStanding={x0:vanityMaster.x0,x1:vanityMaster.x1,y0:vanityMaster.y0-600,y1:vanityMaster.y0};
const testStandMaster=gap(masterStanding,wcMaster);
const gapToWall={
 master_toilet_center_east_mm:+(ensuite.x1-find('starter-15').cx).toFixed(1),
 family_toilet_center_east_mm:+(family.x1-find('starter-17').cx).toFixed(1),
 guest_toilet_center_south_mm:+(guest.y1-find('starter-25').cy).toFixed(1)
};
assert.ok(Math.abs(gapToWall.master_toilet_center_east_mm-466.02)<1);
assert.ok(Math.abs(gapToWall.family_toilet_center_east_mm-440.529)<1);
const doorData=[
 {id:ensuiteEntry.id,opening_nominal_mm:+ensuiteEntry.len.toFixed(1),kind:'Master dressing→ensuite',status:'canonical hinged-door geometry; proposed widening/pocket system has no approved details'},
 {id:familyEntry.id,opening_nominal_mm:+familyEntry.len.toFixed(1),kind:'Private hall→family bath',status:'canonical hinged-door geometry; pocket/wider door speculative'},
 {id:guestEntry.id,opening_nominal_mm:+guestEntry.len.toFixed(1),kind:'Reception→guest WC',status:'canonical hinged-door geometry; outward swing study exploratory until hinge/entrance verification'}
];
const roomReport={
 schema:'AdvisorA8PrivateRoomsFunctionalAudit/1',status:'EXPLORATORY / NO FABRICATION OR WATERPROOFING APPROVAL',
 source:{canonical_sha256:model.canonical_sha256,scene_revision:snapshot.scene_revision,canonical_version:model.canonical_version,clear_height_m:ceiling},
 measured_from_image_calibrated_model:{
  room_boxes_mm:{WIC:size(wic),master_ensuite:size(ensuite),family_bath:size(family),guest_wc:size(guest)},
  doors:doorData,
  dressing:{
   wardrobes:[{id:'starter-4',size_mm:[1250,600]},{id:'starter-5',size_mm:[1250,600]}],
   between_closed_fronts_mm:actualWardrobeGap,
   wardrobe_front_options:widthPerDoor,
   warning:'Simultaneously fully open 625mm hinged leaves opposite each other leave only ~85mm nominal between leaf-tip extents, not walkable or ergonomic. This is a hypothetical full 90-degree leaf-sweep, not verified hardware or body position.'
  },
  master_bath:{
   shower_mm:[1500,800],vanity_mm:[600,460],toilet_mm:[400,700],
   vanity_to_wc_bbox:vanityMasterWC,
   hypothetical_vanity_user_600mm_vs_toilet_bbox:testStandMaster,
   toilet_centre_to_east_room_boundary_mm:gapToWall.master_toilet_center_east_mm,
   shower_footprint_to_ensuite_door_lower_y_mm:+(ensuiteEntry.h[1]-shower.y1).toFixed(1),
   caution:'Fixture centerline and visual shower dimensions are planning assumptions; drain, glass splash, niche and toilet rough-in must be measured.'
  },
  family_bath:{
   tub_mm:[1500,750],vanity_mm:[600,460],toilet_mm:[700,400],
   vanity_to_wc_bbox:familyVanityWC,tub_to_wc_bbox:familyTubWC,
   hypothetical_vanity_user_600mm_vs_toilet_bbox:testStandFamily,
   toilet_centre_to_east_room_boundary_mm:gapToWall.family_toilet_center_east_mm,
   caution:'A 600mm deep hypothetical user zone directly in front of basin may overlap WC footprint even if closed fixture clearances pass. Does not establish that a real user and sitter can occupy both.'
  },
  guest_wc:{vanity_mm:[350,180],toilet_mm:[650,400],vanity_to_wc_bbox:gap(vanityGuest,wcGuest),
   toilet_centre_to_south_room_boundary_mm:gapToWall.guest_toilet_center_south_mm,
   caution:'The compact hand-rinse basin is furniture concept only; ensure basin size, handwashing splash and door opening in situ.'}
 },
 clinical_not_applicable:'No accessible-route or sanitary-code certification. Fixture planning dimensions and user rectangles are hypothetical.',
 engineering_hard_gates:[
  'Do not change wall, opening, plumbing penetration or wet-zone layout without actual as-built site measurements plus structural/developer review.',
  'Master shower and family bathtub require measured drainage invert/falls and verified waterproofing layers, joints, curb and maintenance access before screed.',
  'Product-specific cistern/WC, basin, vanity, shower screen and tub drawings, plus access-panel/cleanout map before shop drawings.',
  'Bathroom extraction air flow and quiet fan routes must be designed separately from living AC and kitchen hood.',
  'Test real pocket door cavities for conflicts with plumbing/electrics/structural wall; if unsafe, retain original door and investigate out-swing or surface slider.',
  'Confirm door leaf widths and any actual opening changes by survey, not only image-calibrated metadata.',
  'Dressing leaf system should retain drawer accessibility; sliding wardrobes need reachable, unblocked 600mm storage module/drawer access.',
  'Real tile thickness and finished wall build-up could reduce usable clearances; use site-finished dimensions.'
 ],
 advisor_decision:{
  master:'KEEP shower 1500×800, 600 vanity, WC as starting envelopes; compare fixed screen against swing only after splash+door+access analysis. Do not authorize pocket door yet.',
  family:'KEEP 1500×750 tub as family flexibility; prioritize waterproofing and actual user/door behavior rather than shrinking vanity for a scalar clearance.',
  guest:'KEEP compact 350×180 handrinse for now, user-test handwash and outward-swing without constricting reception.',
  dressing:'REVISE actual wardrobe-door hardware specification. Avoid blindly using two opposed pairs of 625mm hinged leaves; simulate narrow leaves vs sliders with drawers and standing person before shop drawings.'
 }
};
assert.equal(testStandFamily.overlap_area_mm2>0,true);
const dir='review-evidence/advisor-a8';fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(path.join(dir,'private-wet-storage.json'),JSON.stringify(roomReport,null,2)+'\n');
console.log(JSON.stringify(roomReport,null,2));
