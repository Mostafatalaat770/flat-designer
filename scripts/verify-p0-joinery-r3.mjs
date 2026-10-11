import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const file='design-development/reception-sprint/A-P0.json';
const bytes=fs.readFileSync(file),s=JSON.parse(bytes);
const hash=createHash('sha256').update(bytes).digest('hex');
assert.equal(hash,'017a76a5fc6d5ff0e90f1adb10140c7098e3c2cc3e86d18e7a0b0c0fd439ec2a');
assert.equal(s.canonical_sha256,'734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658');
assert.equal(s.scene_revision,'scene-9e86635b');
assert.equal(s.source_scene_revision,'scene-4821689');
assert.equal(s.storage_revision,55);
assert.deepEqual(s.layout.demolished,[]);
const things=[...s.layout.furniture,...s.layout.interior.objects];
const find=id=>{const x=things.find(v=>v.id===id);assert.ok(x,id);return x;};
const dims=id=>{const x=find(id);return [x.w??x.width_mm,x.d??x.depth_mm,x.height_mm??null]};
const west=find('starter-20'),hob=find('starter-22');
assert.deepEqual(dims('starter-20').slice(0,2),[1500,600]);
assert.deepEqual(dims('starter-22').slice(0,2),[600,400]);
assert.equal(west.rot,270);assert.equal(hob.rot,270);
const regions=[
 Math.round(hob.cy-hob.w/2-(west.cy-west.w/2)),
 hob.w,
 Math.round(west.cy+west.w/2-(hob.cy+hob.w/2))
];
assert.deepEqual(regions,[307,600,593]);
assert.equal(regions.reduce((sum,v)=>sum+v,0),1500);
const known={
 'KIT-A1-upper-north':[1800,330,700],
 'KIT-A1-upper-west-low':[300,330,700],
 'KIT-A1-upper-west-high':[450,330,700],
 'A-dining-sideboard':[2000,400,800],
 'K3-corner':[600,590,null],
 'K3-dishwasher':[600,610,null],
 'K3-laundry-niche':[600,610,null],
 'K3-sink-base':[600,610,null],
 'K3-end-landing':[600,410,null]
};
for(const [id,box] of Object.entries(known))assert.deepEqual(dims(id),box,id);
assert.equal(s.layout.interior.surface_materials['FLOOR-KIT-01'],'S1-stone');
assert.equal(s.layout.interior.materials.find(x=>x.id==='S1-stone').source_status,'GENERIC');
const approval=JSON.parse(fs.readFileSync('design-development/decision-registry.json'));
assert.ok(Object.values(approval.approval_flags).every(x=>x===false));
const separation=(a,b)=>Math.round(Math.hypot(find(a).cx-find(b).cx,find(a).cy-find(b).cy));
assert.equal(separation('K3-dishwasher','A-dining-sideboard'),5690);
assert.equal(separation('K3-dishwasher','starter-20'),1591);
const candidates=[
 {side:'north',model_span_mm:307,concept_front_width_mm:[200,240],status:'HOLD_CORNER_HEAT_WASHER'},
 {side:'hob',model_span_mm:600,concept_front_width_mm:null,status:'HOLD_HOB_GAS_OVEN_MAKER'},
 {side:'south',model_span_mm:593,concept_front_width_mm:[450,500],status:'HOLD_DOOR_HARDWARE_OPERATOR'}
];
assert.ok(candidates.every(x=>x.status.startsWith('HOLD')));
const data={schema:'TypeBP0KitchenJoineryR3/1',status:'DESIGN_ONLY_NOT_SHOP_DRAWING',
 source:{path:file,sha256:hash,canonical_sha256:s.canonical_sha256,scene:s.scene_revision,cloud_scene:s.source_scene_revision},
 west_counter_mm:[west.w,west.d],hob_mm:[hob.w,hob.d],source_regions_mm:regions,candidates,
 north_uppers_mm:[dims('KIT-A1-upper-north'),dims('KIT-A1-upper-west-low'),dims('KIT-A1-upper-west-high')],
 actual_installed_clear_widths_confirmed:false,installed_oven_selected:false,
 cabinet_height_maker_confirmed:false,household_inventory_measured:false,
 actual_door_sweep_verified:false,net_ceiling_mm:2500,
 straight_line_DW_to_buffet_centres_mm:5690,straight_line_DW_to_west_centres_mm:1591,
 approvals:{owner:false,engineering:false,MEP:false,procurement:false,construction:false},
 recommendation:'Study a 450–500mm drawer front on the south 593mm NOMINAL model span only after physical checks. Not a confirmed free cabinet opening.'
};
assert.ok(Object.values(data.approvals).every(x=>x===false));
const out='review-evidence/owner-release-r1/P0_JOINERY_R3.json';
fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({source:hash,west_model_regions_mm:regions,owner_approvals:0}));
