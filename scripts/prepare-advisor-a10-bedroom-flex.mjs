/**
 * A10 Bedroom 2: preserve room geometry, compare a daily work room with
 * flexible family/guest room. No spending commitment, user identity or use presumed.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
const domain=createApartmentDomain(process.cwd());
const base=JSON.parse(fs.readFileSync('design-development/k12/snapshot.json','utf8'));
assert.equal(base.scene_revision,domain.revision(base.layout));
assert.equal(base.canonical_sha256,domain.model.canonical_sha256);
const room=domain.model.rooms.find(o=>o.id==='BR-02');assert.ok(room);
const left=Math.min(...room.poly.map(p=>p[0])),right=Math.max(...room.poly.map(p=>p[0]));
const get=(l,id)=>{const x=l.furniture.find(f=>f.id===id);assert.ok(x,id);return x;};
const desk=get(base.layout,'starter-11'),chair=get(base.layout,'starter-12'),bed=get(base.layout,'starter-10'),wardrobe=get(base.layout,'starter-13');
assert.deepEqual([desk.cx,desk.cy,desk.w,desk.d],[6140,1920,1000,600]);
assert.deepEqual([chair.cx,chair.cy,chair.w,chair.d],[6140,2730,560,560]);
assert.equal(bed.rot,90);
const footprint=f=>{
 const flipped=Math.abs(Math.round((f.rot||0)/90))%2===1;
 const w=flipped?f.d:f.w, d=flipped?f.w:f.d;
 return {x0:f.cx-w/2,x1:f.cx+w/2,y0:f.cy-d/2,y1:f.cy+d/2};
};
const baseBed=footprint(bed);
assert.equal(baseBed.x0,6770);
const getValidation=l=>{try{return domain.validate(l);}catch(e){if(e.validation)return JSON.parse(JSON.stringify(e.validation));throw e;}};
const fails=x=>x.checks.filter(c=>c.status==='FAIL').map(c=>[c.kind,c.object_id??null,c.source_wall_index??null]);
const knownFails=fails(getValidation(base.layout));assert.equal(knownFails.length,2);
const specs=[
 {id:'current-1000',description:'K12 bed + 1600 wardrobe + 1000 desk and task chair',type:'control'},
 {id:'shift-1000-west90',description:'Keep full 1000 desk and shift both desk and chair 90mm toward room west wall',type:'shift',cx:6050,w:1000},
 {id:'shift-900-west120',description:'900mm desk and chair shifted 120mm west to restore chair-to-bed gap',type:'shift',cx:6020,w:900},
 {id:'flex-no-desk',description:'Guest/future-child-flex stage: retain 1280 bed and 1600 wardrobe, defer desk and task chair',type:'defer'}
];
const cams=[
 {id:'A10-room-entry',room_id:'BR-02',camera:domain.captureCamera(base.layout,{room_id:'BR-02',position:[-1.55,1.7,-0.45],target:[-1.0,1.15,-2.3],fov:42})},
 {id:'A10-room-window',room_id:'BR-02',camera:domain.captureCamera(base.layout,{room_id:'BR-02',position:[0.45,1.7,-3.5],target:[-1.2,1.15,-2.2],fov:42})}
];
const dir='design-development/advisor/a10';fs.mkdirSync(dir,{recursive:true});
const originalOthers=base.layout.furniture.filter(f=>!['starter-11','starter-12'].includes(f.id));
const info=[];
for(const spec of specs){
 const next=structuredClone(base);
 const a=get(next.layout,'starter-11'),b=get(next.layout,'starter-12');
 if(spec.type==='shift'){a.cx=spec.cx;a.w=spec.w;b.cx=spec.cx;a.name='A10 worktop '+spec.w+'mm '+spec.id;b.name='A10 task chair '+spec.id;}
 if(spec.type==='defer'){next.layout.furniture=next.layout.furniture.filter(f=>!['starter-11','starter-12'].includes(f.id));}
 assert.deepEqual(next.layout.furniture.filter(f=>!['starter-11','starter-12'].includes(f.id)),originalOthers);
 assert.deepEqual(next.layout.interior,base.layout.interior);
 assert.deepEqual(next.layout.rooms,base.layout.rooms);
 assert.deepEqual(next.layout.studio,base.layout.studio);
 assert.deepEqual(next.architecture_variant,base.architecture_variant);
 next.name='A10 secondary bedroom 2 — '+spec.description;
 next.scene_revision=domain.revision(next.layout);
 next.views=cams;
 const actual=fails(getValidation(next.layout));
 assert.deepEqual(actual,knownFails,'Unsafe new canonical issue in '+spec.id);
 const deskF=next.layout.furniture.find(f=>f.id==='starter-11');
 const chairF=next.layout.furniture.find(f=>f.id==='starter-12');
 const deskB=deskF&&footprint(deskF),chairB=chairF&&footprint(chairF);
 const result={
  id:spec.id,scene_revision:next.scene_revision,mode:spec.description,
  room_printed:room.printed,unchanged_bed_mm:[bed.w,bed.d],unchanged_wardrobe_mm:[wardrobe.w,wardrobe.d],
  desk_mm:deskF?[deskF.w,deskF.d]:null,
  desk_to_west_calibrated_wall_mm:deskB?+(deskB.x0-left).toFixed(1):null,
  chair_closed_to_bed_horizontal_gap_mm:chairB?+(baseBed.x0-chairB.x1).toFixed(1):null,
  original_nominal_floor_footprint_no_longer_used_mm2:spec.type==='defer'?desk.w*desk.d+chair.w*chair.d:0,
  inherited_canonical_failures:actual,
  caveat:spec.type==='defer'
    ?'Not a final removal of a required work/study function; can be staged before buying furniture, keep power/data provision'
    :'Closed chair box only: with seated person or pulled-out task chair, actual body reach and foot circulation can be worse'
 };
 if(spec.type!=='defer'){
  assert.ok(result.desk_to_west_calibrated_wall_mm>=75,'Too tight to west wall for plausible skirting/site tolerance.');
  assert.ok(result.chair_closed_to_bed_horizontal_gap_mm>=350);
 }
 fs.writeFileSync(path.join(dir,spec.id+'.json'),JSON.stringify(next,null,2)+'\n');
 info.push(result);
}
assert.equal(info[0].chair_closed_to_bed_horizontal_gap_mm,350);
assert.equal(info[1].chair_closed_to_bed_horizontal_gap_mm,440);
assert.equal(info[2].chair_closed_to_bed_horizontal_gap_mm,470);
const conclusion={
 schema:'AdvisorA10SecondaryBedroomFutureFlex/1',status:'EXPLORATORY / NO PURCHASE DECISION',
 source_scene_revision:base.scene_revision,canonical_sha256:base.canonical_sha256,
 variants:info,
 recommended_modes:{
  daily_study:'Prefer keeping full 1000mm desk and testing -90mm shift vs baseline; 440mm instead of 350mm CLOSED chair-bed side gap, but desk remains close to wall and cannot count as occupant passage.',
  flexible_guest_or_future_child:'Defer buying a desk/task chair until actual household use is decided, keep bed+1600 wardrobe, sockets and data for future reconfiguration; approx 0.914m2 nominal furniture footprint absent from stage-one room.',
  not_recommended:'Narrow 900 desk gives a further 30mm nominal side gap but loses 10% useful worktop; not compelling if a workstation is actually required.',
 },
 physical_validation:['Measure actual finished bedroom west wall / entry and window opening','Confirm desk chair with its back fully pulled out and occupant seated, rather than closed footprint','Choose real 1600 wardrobe door hinges and drawer access without opening into bed path','Keep power/data, bed/reading and blackout positions adaptable','Test light/glare and AC throw relative to bed and future desk'],
 no_new_canonical_failures:true
};
fs.writeFileSync(path.join(dir,'comparison.json'),JSON.stringify(conclusion,null,2)+'\n');
console.log(JSON.stringify({source:base.scene_revision,comparisons:info,recommendations:conclusion.recommended_modes},null,2));
