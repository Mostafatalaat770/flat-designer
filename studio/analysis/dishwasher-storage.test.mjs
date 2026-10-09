import test from 'node:test';
import assert from 'node:assert/strict';
import {evaluateDishWorkflow} from './dishwasher-storage.mjs';
const inventory=[{id:'six-demo-plates',quantity:6,size_mm:{width_mm:280,depth_mm:280,height_mm:22},stackable:true}];
const option=(id,side,h=170)=>({
 id,title:id,storage_group:side,
 bay:{id:'bay-'+id,net_mm:{width_mm:520,depth_mm:440,height_mm:h},
  source_reference:'Illustrative product-clearance values: kitchen modeled source width/depth, not site',
  access:{kind:'drawer',clear_width_mm:480,clear_height_mm:130}},
 allocations:[{id:'allocation-'+id,bay_id:'bay-'+id,item_id:'six-demo-plates',count:6}],
 displaced_functions:side==='kitchen_work_side'?['pot storage displaced']:[],
 unknowns:['runner load and actual drawer aperture']
});
test('two sides can both fit plates physically but only one requires changing island face',()=>{
 const a=evaluateDishWorkflow({options:[option('rear','reception_presentation_side'),option('cook','kitchen_work_side')],
  sample_inventory:inventory,production_source:'Nominal K12 original Type B scene'});
 assert.equal(a.options[0].fit[0].status,'SINGLE_TYPE_FIT_PLAUSIBLE');
 assert.equal(a.options[1].fit[0].status,'SINGLE_TYPE_FIT_PLAUSIBLE');
 assert.equal(a.options[0].workflow.dry_plate_unloading_from_kitchen_side_requires_walk_around_island,true);
 assert.equal(a.options[1].workflow.direct_same_side_worktop_access,true);
 assert.equal(a.options[1].displaced_functions.length,1);
 assert.equal(a.options[0].workflow.transfer_distance_mm,null);
 assert.ok(a.options.every(x=>x.verdict==='PROVISIONAL_NEEDS_DATA'));
});
test('fewer interior layers than six plate heights explicitly rejects optimistic drawer assumption',()=>{
 const r=evaluateDishWorkflow({options:[option('shallow','kitchen_work_side',110),option('regular','kitchen_work_side',170)],
  sample_inventory:inventory,production_source:'K12 testing only'});
 assert.equal(r.options[0].fit[0].status,'EXCEEDS_SINGLE_TYPE_UPPER_BOUND');
 assert.equal(r.options[0].verdict,'REJECT_THIS_EXAMPLE_FIT');
 assert.equal(r.options[1].verdict,'PROVISIONAL_NEEDS_DATA');
});
test('unknown kitchen cabinet face is invalid rather than guessed',()=>{
 assert.throws(()=>evaluateDishWorkflow({options:[option('a','unspecified'),option('b','kitchen_work_side')],sample_inventory:inventory,
  production_source:'Source'}),/Invalid cabinet side/);
});
test('duplicate choices cannot masquerade as independent options',()=>{
 assert.throws(()=>evaluateDishWorkflow({options:[option('a','kitchen_work_side'),option('a','kitchen_work_side')],
  sample_inventory:inventory,production_source:'Source'}),/Unique option ID/);
});
test('fewer than two alternatives and unspecified source rejected',()=>{
 assert.throws(()=>evaluateDishWorkflow({options:[option('a','kitchen_work_side')],sample_inventory:inventory,production_source:'Source'}),
 /Need option alternatives/);
 assert.throws(()=>evaluateDishWorkflow({options:[option('a','kitchen_work_side'),option('b','kitchen_work_side')],
  sample_inventory:inventory,production_source:''}),/provenance/);
});

test('unmodeled washing-station sides cannot receive a misleading kitchen-side topology',()=>{
 for(const side of ['reception_presentation_side','upper_work_side']) {
  assert.throws(()=>evaluateDishWorkflow({options:[option('a','kitchen_work_side'),option('b','reception_presentation_side')],
   sample_inventory:inventory,production_source:'Source',washing_station_group:side}),/modeled kitchen work side/);
 }
});
