import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {source,domain} from '../circulation-v55/route-library.mjs';
import {rectangle,polygonGap} from '../../studio/analysis/geometry.mjs';
const dir=import.meta.dirname,root=new URL('../../',import.meta.url);
const inputFiles=['render-snapshots/current.json','design-development/kitchen-operation-v55/results.json',
 'design-development/unified-furnishing-v55/snapshot.json'];
const input_hashes=Object.fromEntries(inputFiles.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(new URL(file,root))).digest('hex')]));
const kitchen=JSON.parse(fs.readFileSync(new URL('../kitchen-operation-v55/results.json',import.meta.url)));
const unified=JSON.parse(fs.readFileSync(new URL('../unified-furnishing-v55/snapshot.json',import.meta.url)));
const fridge=source.layout.furniture.find(f=>f.id==='starter-23'),panel=domain.resolveObject(source.layout.interior.objects.find(o=>o.id==='KIT-fridge-end-panel'));
assert.equal(source.scene_revision,'scene-9cf45a73');assert.equal(kitchen.source_scene,source.scene_revision);
assert.equal(unified.scene_revision,'scene-c9c055c1');assert.equal(unified.source_scene_revision,source.scene_revision);
assert.deepEqual(unified.layout.furniture.filter(f=>f.room_id==='KIT-01'),source.layout.furniture.filter(f=>f.room_id==='KIT-01'));
const item=id=>{const f=source.layout.furniture.find(f=>f.id===id);return {source_object_id:id,width_mm:f.w,depth_mm:f.d,height_mm:null,
 cx_mm:f.cx,cy_mm:f.cy,rotation_deg:f.rot,meaning:'Nominal source-model reservation; not a measured installation opening or an approved product maximum.'};};
const pending={status:'UNSELECTED',manufacturer:null,model:null,manual_url:null,device_width_mm:null,device_height_mm:null,
 closed_depth_including_door_handle_mm:null,installation_opening_required_mm:null,rear_connection_space_mm:null,
 manufacturer_clearances_mm:null,open_door_projection_mm:null,fits_existing_layout:null};
const data={schema:'ApartmentApplianceSelectionBrief/1',source_scene:source.scene_revision,source_storage_revision:55,
 canonical_sha256:source.canonical_sha256,local_furnishing_candidate_scene:'scene-c9c055c1',input_hashes,
 owner_confirmation:{date:'2026-10-09',answer:'لسه هنختار الموديلات',models_selected:false},
 buying_location:null,budget:null,measured_installation_dimensions_available:false,
 principles:['Compare body, installed connections/clearances and operating envelope separately.',
  'A device fitting the nominal footprint is not installation approval. Heights and actual site dimensions remain unknown.',
  'A different size, door type or position requires a new local proposal and operation review before adoption.'],
 appliances:[
  {id:'fridge',label:'الثلاجة',reservation:item('starter-23'),selection_basis:'Match the 650 × 650 mm nominal body reserve first; confirm actual integration type, hinge, ventilation and drawer-removal angle.',
   operation_evidence:{source:'kitchen-operation-v55/results.json',preferred_hinge_location_in_plan:'east',manufacturer_hinge_label:null,
    body_to_side_panel_gap_mm:polygonGap(rectangle(fridge),rectangle(panel)),side_panel_id:panel.id,
    sequences:kitchen.operation_sequences.map(s=>({hinge_location:s.hinge_location,grid_mm:s.parameters.grid_mm,status:s.status})),
    interpretation:'The 2 mm modeled side gap is not a manufacturer-approved hinge or ventilation clearance. Plan east/west must be matched to the actual front-view manual.'},
   manual_fields:['Total installed depth including handle and rear ventilation','Hinge reversibility and required side clearance beside panel',
    'Opening angle needed for drawers, shelves and removal','Approved integration/niche dimensions and ventilation route'],actual:{...pending}},
  {id:'dishwasher',label:'غسالة الأطباق',reservation:item('K3-dishwasher'),selection_basis:'Start comparison with a 60 cm integrated-module class; the 600 × 610 reservation is not the clear installation niche.',
   operation_evidence:{source:'kitchen-operation-v55/results.json',door_projection_trials_mm:[600,650],loader_reserve_mm:[600,500],
    terrace_passage_during_loading:'NO_MODEL_ROUTE at both grids in the declared trial',interpretation:'Do not promise simultaneous loading and service-terrace passage.'},
   manual_fields:['Clear niche width, depth and height with adjustable feet','Water/drain/electrical connection space',
    'Door and furniture-front projection, hinge system and plinth interference','Standing/loading position and actual terrace-passage trial'],actual:{...pending}},
  {id:'washer',label:'الغسالة',reservation:item('K3-laundry-niche'),selection_basis:'Compare a front-loading candidate against the nominal 600 × 610 reserve; under-counter height, lid treatment and rear hoses require its manual.',
   operation_evidence:{source:'kitchen-operation-v55/results.json',opening_trial_projection_mm:500,loader_east_offset_trial_mm:150,
    interpretation:'Centered loading overlaps the open terrace leaf. The 150 mm-east stance removes that overlap but still disconnects terrace passage in the modeled stage.'},
   manual_fields:['Full closed depth including door and connections','Approved under-counter dimensions and any manufacturer-supported lid treatment',
    'Actual door hinge, swing and loading stance','Specified side/rear installation and service clearances'],actual:{...pending}},
  {id:'oven',label:'الفرن',reservation:{source_object_id:'starter-20',width_mm:null,depth_mm:null,height_mm:null,
    assumed_door_width_mm:600,meaning:'No separate oven object or measured oven niche. The operation study assumes an under-hob oven in the west counter.'},
   selection_basis:'Confirm whether an under-hob oven is wanted before matching cabinet, support and services.',
   operation_evidence:{source:'kitchen-operation-v55/results.json',door_projection_trials_mm:[500,600],
    interpretation:'Oven/operator trial admits service passage; simultaneous open dishwasher overlaps that operator. These are assumed envelopes.'},
   manual_fields:['Actual installation niche dimensions and support','Total open-door projection and standing position','Compatibility and clearances with the selected hob','Electrical/services and ventilation requirements from the product manual'],actual:{...pending}},
  {id:'hob',label:'الموقد والشفاط',reservation:item('starter-22'),selection_basis:'The 600 × 400 hob is a drawing placeholder. Match a real hob and hood using their installation drawings; the placeholder is not a worktop cutout.',
   operation_evidence:{source:'render-snapshots/current.json',interpretation:'Gas hob concept; hood/exhaust and heat clearances remain unresolved.'},
   manual_fields:['Hob overall dimensions and manufacturer worktop cutout','Worktop depth/thickness and edge clearances',
    'Hob/oven compatibility and nearby upper-cabinet clearances','Hood width, installation height and exhaust route for the selected products'],actual:{...pending}}
 ]};
fs.writeFileSync(dir+'/selection.json',JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({source:data.source_scene,appliances:data.appliances.length,models_selected:false,fridge_panel_gap_mm:data.appliances[0].operation_evidence.body_to_side_panel_gap_mm,input_hashes_checked:Object.keys(input_hashes).length}));
