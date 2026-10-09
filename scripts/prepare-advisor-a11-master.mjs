/**
 * A11 — Master's bedroom sleep-first inventory vs floor-use study.
 * A reversible staging study: do not delete joinery from live Studio or
 * presume WIC holds all bedroom linen/clothes.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';

const domain=createApartmentDomain(process.cwd());
const base=JSON.parse(fs.readFileSync('design-development/k12/snapshot.json','utf8'));
assert.equal(base.scene_revision,domain.revision(base.layout));
assert.equal(base.canonical_sha256,domain.model.canonical_sha256);
const room=domain.model.rooms.find(x=>x.id==='MBR-01');
assert.ok(room);
const bounds={x0:Math.min(...room.poly.map(x=>x[0])),x1:Math.max(...room.poly.map(x=>x[0])),
 y0:Math.min(...room.poly.map(x=>x[1])),y1:Math.max(...room.poly.map(x=>x[1]))};
const bed=base.layout.furniture.find(x=>x.id==='starter-1');
assert.ok(bed);
const b={x0:bed.cx-bed.d/2,x1:bed.cx+bed.d/2,y0:bed.cy-bed.w/2,y1:bed.cy+bed.w/2};
const chest=base.layout.interior.objects.find(x=>x.id==='V7-master-drawers');
const bench=base.layout.interior.objects.find(x=>x.id==='V5-master-bench');
assert.deepEqual([chest.width_mm,chest.depth_mm,bench.width_mm,bench.depth_mm],[1000,400,1000,350]);
const nWic=base.layout.furniture.filter(x=>x.room_id==='WIC-01'&&x.type==='wardrobe');
assert.equal(nWic.length,2);
assert.ok(nWic.every(x=>x.w===1250&&x.d===600));
const validate=layout=>{try{return domain.validate(layout)}catch(e){if(e.validation)return JSON.parse(JSON.stringify(e.validation));throw e}};
const failed=layout=>validate(layout).checks.filter(c=>c.status==='FAIL').map(c=>[c.kind,c.object_id??null,c.source_wall_index??null]);
const baseline=failed(base.layout);
assert.equal(baseline.length,2);
const cameras=[
 {id:'A11-master-from-entry',room_id:'MBR-01',camera:domain.captureCamera(base.layout,
  {room_id:'MBR-01',position:[-4.52,1.70,1.08],target:[-5.82,1.05,3.13],fov:42})},
 {id:'A11-master-foot-zone',room_id:'MBR-01',camera:domain.captureCamera(base.layout,
  {room_id:'MBR-01',position:[-7.37,1.70,3.20],target:[-5.50,1.08,2.40],fov:42})}
];
const options=[
 {id:'current',remove:[],claim:'Baseline with optional bedroom bench and 1000mm drawers'},
 {id:'no-bench',remove:['V5-master-bench'],claim:'Retain dresser but open foot-of-bed floor'},
 {id:'no-drawers',remove:['V7-master-drawers'],claim:'Retain dressing bench but move drawers to WIC if inventory allows'},
 {id:'open-foot-wall',remove:['V7-master-drawers','V5-master-bench'],claim:'Keep bedroom as restful sleep-only space; all drawers in dressing ONLY after inventory'}
];
const srcOthers=base.layout.interior.objects.filter(x=>!['V7-master-drawers','V5-master-bench'].includes(x.id));
const floorGap=(o)=>b.y1<o.cy-o.depth_mm/2?o.cy-o.depth_mm/2-b.y1:0;
const dir='design-development/advisor/a11';fs.mkdirSync(dir,{recursive:true});
const scores=[];
for(const opt of options){
 const scene=structuredClone(base);
 scene.layout.interior.objects=scene.layout.interior.objects.filter(x=>!opt.remove.includes(x.id));
 assert.deepEqual(scene.layout.interior.objects.filter(x=>!['V7-master-drawers','V5-master-bench'].includes(x.id)),srcOthers);
 assert.deepEqual(scene.layout.furniture,base.layout.furniture);
 assert.deepEqual(scene.layout.rooms,base.layout.rooms);
 assert.deepEqual(scene.architecture_variant,base.architecture_variant);
 assert.deepEqual(scene.layout.studio,base.layout.studio);
 assert.deepEqual(scene.layout.decor,base.layout.decor);
 scene.name='A11 Master: '+opt.claim;
 scene.scene_revision=domain.revision(scene.layout);
 scene.views=cameras;
 assert.deepEqual(failed(scene.layout),baseline,'New architecture failure is not acceptable.');
 const remaining=[bench,chest].filter(x=>!opt.remove.includes(x.id));
 const footGap=remaining.length?Math.min(...remaining.map(floorGap)):bounds.y1-b.y1;
 assert.ok(footGap>=650);
 const released=opt.remove.includes(bench.id)?bench.width_mm*bench.depth_mm:0;
 const releasedTotal=released+(opt.remove.includes(chest.id)?chest.width_mm*chest.depth_mm:0);
 const metric={id:opt.id,scene_revision:scene.scene_revision,
  removed_optional_objects:opt.remove,remaining_bed_to_nearest_south_furniture_or_wall_mm:+footGap.toFixed(1),
  nominal_furniture_floor_area_not_occupied_m2:+(releasedTotal/1e6).toFixed(3),
  functional_tradeoff:opt.remove.length?'Storage or dressing use lost unless fully reallocated to existing 2×1250 WIC wardrobes':'Baseline drawer/bench convenience but more visual and foot-end furniture',
  caveats:['Foot clearance is measured to envelope only, not bed-making person or wardrobe route','Curtain tracks/AC airflow and sockets must still be developed','WIC capacity inventory remains unknown']};
 scores.push(metric);
 if(['current','no-bench','open-foot-wall'].includes(opt.id)){
  fs.writeFileSync(path.join(dir,opt.id+'.json'),JSON.stringify(scene,null,2)+'\n');
 }
}
const output={schema:'AdvisorA11MasterSleepFirst/1',status:'EXPLORATORY / NO CLOUD OR FURNITURE ORDER',
 canonical_sha256:base.canonical_sha256,parent_scene_revision:base.scene_revision,
 printed_room:room.printed,
 master_bed_nominal_mm:[bed.w,bed.d],
 wardrobe_provision_existing_dressing:'2 opposing wardrobes each 1250×600 mm, internal inventory NOT VERIFIED',
 options:scores,
 lead_direction:'Keep the 1000×400 master drawers until an actual family clothing/linen inventory demonstrates that WIC accommodates them. Test removing the optional 1000×350 bench first for a calmer accessible bed-foot zone, subject to actual use.',
 bedroom_sleep_first_hard_gates:['Exact bed and mattress SKU, blackout and noise/light leakage strategy','Bedroom AC airflow away from sleeper, tested acoustic/no-draft approach','Both bedside outlets, 2-way switches, USB-C/reading lamps without glare','Floor-to-ceiling curtain/glazing exact plan + maintenance','Evaluate night path to ensuite from bed without bench/chest obstructions','One or two real adults making bed and opening drawers from actual furniture envelopes'],
 zero_new_canonical_failures:true};
fs.writeFileSync(path.join(dir,'review.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output,null,2));
