import test from 'node:test';
import assert from 'node:assert/strict';
import {requiredCleanAirCadR,assessCleanAirProduct,assessExperiencePlacement,auditLightingIntent} from './experience.mjs';
const room={id:'TEST',poly:[[0,0],[3000,0],[3000,3000],[0,3000]]};
const floor={id:'air-cleaner-study',category:'air-quality',
 source:'Entirely hypothetical portable floor unit, 300x300; no manufacturer selected',
 position:{mode:'portable-floor',cx:2000,cy:1800,width_mm:300,depth_mm:300,
 operating_clearance_mm:{left_mm:150,right_mm:150,rear_mm:150,front_mm:150}},
 gates:{product_manual:'unknown',electrician:'unknown'}};
test('volumetric clean-air benchmark uses modeled clear ceiling, not marketing room area',()=>{
 const d=requiredCleanAirCadR({area_m2:14.684138489807,clear_height_m:2.5});
 assert.equal(d.room_volume_m3,36.71);
 assert.equal(d.theoretical_cadr_m3h,176.2);
 const low=assessCleanAirProduct({room_area_m2:14.684138489807,clear_height_m:2.5,cadr_m3h:130});
 assert.equal(low.meets_assumed_4_8_reference,false);
 const enough=assessCleanAirProduct({room_area_m2:14.684138489807,clear_height_m:2.5,cadr_m3h:180});
 assert.equal(enough.meets_assumed_4_8_reference,true);
 assert.match(d.limits,/not ventilation/);
});
test('plan geometry checks placed device and explicitly labels missing product verification',()=>{
 const x=assessExperiencePlacement({room,proposal:floor,furniture:[]});
 assert.equal(x.body_fits_nominal_support_or_room,true);
 assert.equal(x.body_overlaps.length,0);
 assert.equal(x.status,'EXPLORATORY_NEEDS_VERIFICATION');
 assert.ok(x.required_verification.includes('product_manual'));
});
test('rejects occupied furniture footprint even when devices are attractive on moodboard',()=>{
 const f={id:'table',cx:2000,cy:1800,w:900,d:900,rot:30,type:'table'};
 const x=assessExperiencePlacement({room,proposal:floor,furniture:[f]});
 assert.equal(x.status,'REJECT_IN_THIS_FORM');
 assert.deepEqual(x.body_overlaps,['table']);
});
test('air fryer may fit an actual counter BODY but lack verified operational heat and service clearance',()=>{
 const counter={id:'counter-1',cx:800,cy:800,w:1200,d:700,rot:0,type:'counter'};
 const proposal={id:'fryer-study',category:'countertop-appliance',source:'500W? NO: electrical not selected / concept only',
  heat_or_steam:true,
  position:{mode:'worktop',support_id:'counter-1',cx:800,cy:800,width_mm:350,depth_mm:350,
   operating_clearance_mm:{left_mm:100,right_mm:100,rear_mm:100,front_mm:450}},
  gates:{manual:'unknown',circuit:'unknown',steam_extraction:'unknown'}};
 const x=assessExperiencePlacement({room,proposal,furniture:[counter]});
 assert.equal(x.body_fits_nominal_support_or_room,true);
 assert.ok(x.physical_warnings.some(x=>x.includes('Vent')));
 assert.equal(x.status,'EXPLORATORY_NEEDS_VERIFICATION');
});
test('device not contained by its counter is a HARD BLOCK, independent of aesthetics',()=>{
 const f={id:'counter',cx:800,cy:800,w:500,d:500,rot:0,type:'counter'};
 const proposal={...floor,position:{...floor.position,mode:'worktop',support_id:'counter',cx:1050,cy:800,width_mm:400,depth_mm:400}};
 const r=assessExperiencePlacement({room,proposal,furniture:[f]});
 assert.equal(r.body_fits_nominal_support_or_room,false);
 assert.equal(r.status,'REJECT_IN_THIS_FORM');
});
test('clearance beyond room edge is flagged even when base device body fits',()=>{
 const p={...floor,position:{...floor.position,cx:2750,cy:2000}};
 const res=assessExperiencePlacement({room,proposal:p,furniture:[]});
 assert.equal(res.body_fits_nominal_support_or_room,true);
 assert.equal(res.operating_envelope_inside_room,false);
 assert.ok(res.physical_warnings.some(x=>x.includes('room')));
});
test('storage-only concept is never silently approved as an operating air fryer',()=>{
 const p={...floor,position:{...floor.position,mode:'storage-only'}};
 const a=assessExperiencePlacement({room,proposal:p,furniture:[]});
 assert.equal(a.status,'STORAGE_ONLY_DO_NOT_OPERATE');
});
test('electrical/MEP hard gate failed overrides good geometric fit',()=>{
 const p={...floor,gates:{product_manual:'verified',site_circuit:'failed'}};
 assert.equal(assessExperiencePlacement({room,proposal:p,furniture:[]}).status,'REJECT_IN_THIS_FORM');
});
test('lighting engine distinguishes independently switched ambient, task and night circuits',()=>{
 const zones=[
  {id:'a',room_id:'MBR',function:'ambient',kelvin:3000,connection:'wired',control:'entry+bed',dimmable:true},
  {id:'b',room_id:'MBR',function:'task',kelvin:2700,connection:'plug-in',control:'left bedside',dimmable:true},
  {id:'c',room_id:'MBR',function:'night',kelvin:2200,connection:'battery',control:'automatic and manual override',dimmable:true}
 ];
 const r=auditLightingIntent({zones});
 assert.equal(r.room_layer_coverage[0].includes_low_level_night,true);
 assert.equal(r.zones[0].status,'DESIGN_INTENT_NOT_ENGINEERED');
 assert.equal(r.zones[1].status,'FUNCTIONAL_INTENT');
 assert.throws(()=>auditLightingIntent({zones:[zones[0],zones[0]]}),/unique/);
});
test('ceiling recess cannot pretend available depth under locked 2500mm ceiling',()=>{
 const z=[{id:'recess',room_id:'RECP',function:'ambient',connection:'wired',control:'dimmer',
  kelvin:3000,requires_ceiling_drop:true}];
 const a=auditLightingIntent({zones:z,clear_height_mm:2500});
 assert.ok(a.zones[0].flags.some(x=>x.includes('2500mm')));
});
