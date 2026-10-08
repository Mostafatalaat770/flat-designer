/**
 * Advisor A3: Bedroom 1 desk + door/bed/wardrobe use-envelope experiments.
 * Controls are K12 as a frozen whole-apartment baseline (not live Studio).
 * Writes only local generated alternatives for review.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
const domain=createApartmentDomain(process.cwd());
const base=JSON.parse(fs.readFileSync('design-development/k12/snapshot.json','utf8'));
assert.equal(base.scene_revision,domain.revision(base.layout));
const clone=x=>structuredClone(x);
const get=(layout,id)=>{const x=layout.furniture.find(o=>o.id===id);assert.ok(x,'Missing '+id);return x;};
const {furniture}=base.layout;
const desk=get(base.layout,'starter-8'),chair=get(base.layout,'starter-9');
const bed=get(base.layout,'starter-6'),wardrobe=get(base.layout,'starter-7');
const room=domain.model.rooms.find(r=>r.id==='BR-01');
assert.ok(room);
assert.equal(desk.room_id,'BR-01');
assert.deepEqual([desk.cx,desk.cy,desk.w,desk.d,desk.rot],[3800,4590,1200,600,180]);
assert.deepEqual([chair.cx,chair.cy,chair.w,chair.d],[3720,3930,480,500]);
const originalKey=JSON.stringify(furniture.filter(o=>!['starter-8','starter-9'].includes(o.id)));
const bbox=item=>{
  const flip=Math.abs(Math.round((item.rot||0)/90))%2===1;
  const w=flip?item.d:item.w,d=flip?item.w:item.d;
  return {x0:item.cx-w/2,x1:item.cx+w/2,y0:item.cy-d/2,y1:item.cy+d/2};
};
const gap=(a,b)=>{
  const dx=Math.max(0,a.x0-b.x1,b.x0-a.x1);
  const dy=Math.max(0,a.y0-b.y1,b.y0-a.y1);
  return Math.hypot(dx,dy);
};
const getReport=layout=>{
  try{return domain.validate(layout);}
  catch(e){if(e.validation)return JSON.parse(JSON.stringify(e.validation));throw e;}
};
const before=getReport(base.layout);
const failures=r=>r.checks.filter(c=>c.status==='FAIL').map(c=>[c.kind,c.object_id,c.source_wall_index??null]);
assert.equal(failures(before).length,2);
const warnings=(rep,kind,id)=>rep.checks.filter(c=>c.status==='WARNING'&&c.kind===kind&&(id===null||c.object_id===id||c.room_id===id));
const doorSweepWarning=rep=>rep.checks.filter(c=>c.kind==='door-swing'&&c.object_id==='starter-8').map(c=>c.measured_clearance_mm)[0]??null;
const routeWarn=rep=>warnings(rep,'circulation','BR-01').map(c=>c.measured_clearance_mm)[0]??null;
const configs=[
 {name:'control',width:1200,depth:600,cx:3800,cy:4590},
 {name:'shift-1200',width:1200,depth:600,cx:3650,cy:4590},
 {name:'shift-1100',width:1100,depth:600,cx:3650,cy:4590},
 {name:'shift-1000',width:1000,depth:600,cx:3650,cy:4590},
 {name:'compact-1000-safe-gap',width:1000,depth:600,cx:3750,cy:4590},
 {name:'compact-950-safe-gap',width:950,depth:600,cx:3700,cy:4590},
 {name:'north-1200-200',width:1200,depth:600,cx:3800,cy:4390,chairDY:-200},
 {name:'north-1200-300',width:1200,depth:600,cx:3800,cy:4290,chairDY:-300},
 {name:'north-1100-250',width:1100,depth:600,cx:3800,cy:4340,chairDY:-250}
];
const outDir='design-development/advisor/a3';
fs.mkdirSync(outDir,{recursive:true});
const candidates=[];
for(const config of configs){
  const next=clone(base);
  const target=get(next.layout,'starter-8');
  Object.assign(target,{cx:config.cx,cy:config.cy,w:config.width,d:config.depth,name:'A3 Bedroom 1 study desk '+config.width+' × '+config.depth+' mm ('+config.name+')'});
  if(config.name==='control')Object.assign(target,desk);
  const candidateChair=get(next.layout,'starter-9');
  candidateChair.cy+=(config.chairDY||0);
  assert.equal(JSON.stringify(next.layout.furniture.filter(o=>!['starter-8','starter-9'].includes(o.id))),originalKey);
  assert.deepEqual(next.architecture_variant,base.architecture_variant);
  assert.deepEqual(next.layout.rooms,base.layout.rooms);
  next.scene_revision=domain.revision(next.layout);
  const report=getReport(next.layout);
  const safe=JSON.stringify(failures(report))===JSON.stringify(failures(before));
  const newlyFailed=report.checks.filter(c=>c.status==='FAIL').filter(c=>!before.checks.some(b=>b.status==='FAIL'&&b.kind===c.kind&&b.object_id===c.object_id&&b.source_wall_index===c.source_wall_index));
  const source=bbox(bed),work=bbox(target),seat=bbox(candidateChair),cabinet=bbox(wardrobe);
  const values={
    door_sweep_warning_mm:doorSweepWarning(report),
    conservative_route_sample_mm:routeWarn(report),
    chair_to_bed_footprint_gap_mm:Math.round(gap(source,seat)*10)/10,
    chair_centre_y_mm:candidateChair.cy,
    desk_to_wardrobe_footprint_gap_mm:Math.round(gap(work,cabinet)*10)/10,
    actual_desk_mm:[target.w,target.d],
    desk_right_edge_mm:work.x1,
    study_chair_remains_movable:'Real pulled-out chair + human access envelope must still be inspected.',
  };
  candidates.push({variant:config.name,scene_revision:next.scene_revision,status:safe?'NO_NEW_FAIL':'REJECT_NEW_COLLISION',values,
    newly_failed_checks:newlyFailed,
    known_canonical_failures:failures(report),
    caution:'Clearance numbers are model warnings, not a safety or accessibility signoff.'});
  if(config.name!=='control'&&safe)fs.writeFileSync(path.join(outDir,config.name+'.json'),JSON.stringify(next,null,2)+'\n');
}
const baseDoor=candidates[0].values.door_sweep_warning_mm;
const options=candidates.slice(1);
assert.ok(options.some(x=>x.status==='NO_NEW_FAIL'&&x.values.door_sweep_warning_mm!==null&&x.values.door_sweep_warning_mm>baseDoor),'No safe improvement to desk/door proximity.');
const result={
  schema:'AdvisorBedroom1UseAudit/1',
  canonical_sha256:base.canonical_sha256,
  status:'EXPLORATORY',
  baseline_scene_revision:base.scene_revision,
  room_id:room.id,
  canonical_room_printed:room.printed,
  bed:{envelope_mm:[bed.w,bed.d],centre_mm:[bed.cx,bed.cy]},
  wardrobe:{envelope_mm:[wardrobe.w,wardrobe.d],centre_mm:[wardrobe.cx,wardrobe.cy]},
  chair:{envelope_mm:[chair.w,chair.d],centre_mm:[chair.cx,chair.cy]},
  candidates,
  decision:'Review shifted 1100 desk as a reasonable function-preserving hypothesis; do not automatically select smallest desk from a better scalar clearance. Verify desk ergonomics for real equipment, chair pulled out, drawer, wardrobe and door swings on 1.70m natural views.',
  blockers:['Door hinge orientation inferred','Chair-use envelope not certified','Actual furniture SKUs TBD','Room dimensions based on plan calibration until on-site survey'],
};
fs.writeFileSync(path.join(outDir,'functional-review.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
