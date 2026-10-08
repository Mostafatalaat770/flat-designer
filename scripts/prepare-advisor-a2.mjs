/**
 * A2: reproducible, read-only source Kitchen K12 -> two six-seat dining alternatives.
 * Builds review snapshots, not the canonical architectural model or production Studio.
 *
 * Usage: node scripts/prepare-advisor-a2.mjs
 * Requires built dist/ from npm run build.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import { createApartmentDomain } from '../studio/domain/apartment.mjs';

const root=process.cwd();
const domain=createApartmentDomain(root);
const input=JSON.parse(fs.readFileSync('design-development/k12/snapshot.json','utf8'));
const referenceAudit=JSON.parse(fs.readFileSync('design-development/k12/function-audit.json','utf8'));
assert.equal(input.canonical_sha256,domain.model.canonical_sha256);
assert.equal(input.scene_revision,domain.revision(input.layout));
assert.equal(referenceAudit.canonical_summary.fail,2,'Do not erase existing architecture blockers.');
assert.equal(input.architecture_variant?.render_only,true);
const clone=x=>structuredClone(x);
const furniture=(snapshot,id)=>{
  const f=snapshot.layout.furniture.find(o=>o.id===id);
  assert.ok(f,'Missing furniture '+id);
  return f;
};
const tableId='starter-35';
const chairIds=['starter-36','A2-dining-chair-north-centre','starter-37','starter-38','A2-dining-chair-south-centre','starter-39'];
const movedIds=[tableId,...chairIds];
const operator=referenceAudit.end_operator_proxy;
const tableBounds=f=>({x0:f.cx-f.w/2,x1:f.cx+f.w/2,y0:f.cy-f.d/2,y1:f.cy+f.d/2});
const chairBounds=f=>({x0:f.cx-f.w/2,x1:f.cx+f.w/2,y0:f.cy-f.d/2,y1:f.cy+f.d/2});
const delta=(a,b)=>Math.max(0,a.x0-b.x1,b.x0-a.x1);
const sep=(a,b)=>{
  const dx=Math.max(0,a.x0-b.x1,b.x0-a.x1);
  const dy=Math.max(0,a.y0-b.y1,b.y0-a.y1);
  return Math.hypot(dx,dy);
};
const round=n=>Math.round(n*10)/10;
function validate(snapshot,label){
  assert.equal(snapshot.scene_revision,domain.revision(snapshot.layout),'Scene mismatch: '+label);
  let report; try { report=domain.validate(snapshot.layout); }
  catch(err){if(!err.validation)throw err;report=JSON.parse(JSON.stringify(err.validation));}
  const fails=(report.checks||[]).filter(c=>c.status==='FAIL');
  const expected=referenceAudit.canonical_reported_failures.map(x=>[x.kind,x.object_id,x.source_wall_index??null]);
  const actual=fails.map(x=>[x.kind,x.object_id,x.source_wall_index??null]);
  assert.deepEqual(actual,expected,'New/missing hard failures are not acceptable for '+label);
  return {
    summary: report.summary||{pass:report.checks.filter(x=>x.status==='PASS').length,warning:report.checks.filter(x=>x.status==='WARNING').length,fail:fails.length},
    architecturalBlockers: fails.map(x=>({kind:x.kind,id:x.object_id,source_wall_index:x.source_wall_index??null})),
  };
}
function digest(candidate,label) {
  const table=furniture(candidate,tableId);
  const allChairs=chairIds.map(id=>furniture(candidate,id));
  const operatorBox={x0:operator.x0,x1:operator.x1,y0:operator.y0,y1:operator.y1};
  const t=tableBounds(table),chairs=allChairs.map(chairBounds);
  const northern=chairs.slice(0,3),southern=chairs.slice(3);
  const eastEnd=12600;
  assert.equal(table.rot,0);
  assert.equal(table.cx,14670);
  assert.equal(allChairs.length,6);
  assert.ok(table.w===2000||table.w===1800);
  const northCols=allChairs.slice(0,3).map(c=>c.cx).sort((a,b)=>a-b);
  const seatPitch=Math.min(northCols[1]-northCols[0],northCols[2]-northCols[1]);
  assert.ok(seatPitch>=600,'Six-seat pitch under 600 mm');
  assert.ok(t.x0>eastEnd,'Dining has invaded the island footprint');
  const nearestNorth=Math.min(...northern.map(c=>sep(operatorBox,c)));
  const nearestAny=Math.min(...chairs.map(c=>sep(operatorBox,c)));
  const nominalEdgeGap=t.x0-eastEnd;
  const shortestExit=Math.min(...southern.map(c=>10141.317-c.y1));
  const summary=validate(candidate,label);
  return {
    label,scene_revision:candidate.scene_revision,
    dining:{width_mm:table.w,depth_mm:table.d,centre_y_mm:table.cy,seat_count:6,north_seat_pitch_mm:seatPitch},
    dimensions_mm:{
      island_east_end_to_table:round(nominalEdgeGap),
      end_prep_stationary_person_to_table_horizontal:round(t.x0-operatorBox.x1),
      end_prep_stationary_person_to_nearest_chair:round(nearestAny),
      north_row_nearest_corner_to_person:round(nearestNorth),
      north_row_chair_min_x:round(Math.min(...northern.map(c=>c.x0))),
      south_row_to_entry_door_plan_y_only:round(shortestExit),
    },
    use_assessments:{
      end_prep_through_route:'RESTRICTED in all models: 600 mm person envelope; cannot certify simultaneous passage.',
      dishwasher_open:'K12 same fixed 570 mm nominal passage; no appliance SKU is modeled.',
      six_real_people:'UNVERIFIED: pulled out chairs, bodies and hinge swings require manual review.',
      services:'UNCHANGED exploratory K4 wall-removal overlay; developer/structural/MEP approval required.',
      title:'Do not declare a winner from distances or render alone.',
    },
    canonical_validation:summary
  };
}
const baseline=digest(input,'K12 original dining; control');
const opts=[
  {
    key:'dining-compact-six',
    name:'A2.1 — 1800 x 900 six-seat dining, 350 mm south of K12',
    tableWidth:1800,tableDepth:900,moveSouth:350,
    chairXs:[14070,14670,15270,14070,14670,15270],
    hypothesis:'A compact six-seat table frees 100 mm to island end while shifting the chair group away from kitchen work. The prep station remains a restricted pass-through.'
  },
  {
    key:'dining-shift-six',
    name:'A2.2 — original 2000 x 950 six-seat dining, 350 mm south of K12',
    tableWidth:2000,tableDepth:950,moveSouth:350,
    chairXs:[13970,14670,15370,13970,14670,15370],
    hypothesis:'Move the original family-size table and six chairs without sacrificing the 2000 mm dining width; test tradeoff against entrance and passage.'
  }
];
const outDir='design-development/advisor/a2';
fs.mkdirSync(outDir,{recursive:true});
const reports=[{...baseline,hypothesis:'Control only; do not alter furniture'}];
for(const option of opts){
  const next=clone(input);
  next.name=option.name;
  const table=furniture(next,tableId);
  table.w=option.tableWidth;table.d=option.tableDepth;
  table.cy+=option.moveSouth;
  table.name=option.name+' · dining table';
  chairIds.forEach((id,i)=>{
    const item=furniture(next,id);
    item.cx=option.chairXs[i];
    item.cy+=option.moveSouth;
    item.name='A2 six-seat dining chair '+(i+1)+' / '+option.key;
  });
  assert.deepEqual(next.architecture_variant,input.architecture_variant);
  assert.deepEqual(next.layout.rooms,input.layout.rooms);
  assert.deepEqual(next.layout.interior,input.layout.interior);
  assert.deepEqual(next.layout.studio,input.layout.studio);
  assert.deepEqual(next.layout.decor,input.layout.decor);
  assert.deepEqual(next.views,input.views,'Cameras must remain identical.');
  const sourceMap=new Map(input.layout.furniture.map(x=>[x.id,x]));
  const diffs=next.layout.furniture.filter(x=>JSON.stringify(x)!==JSON.stringify(sourceMap.get(x.id))).map(x=>x.id).sort();
  assert.deepEqual(diffs,movedIds.slice().sort(),'Only dining family allowed to change.');
  next.scene_revision=domain.revision(next.layout);
  const report={...digest(next,option.key),hypothesis:option.hypothesis};
  // One matching-camera render for each of the four existing K12 angles.
  fs.writeFileSync(path.join(outDir,option.key+'.json'),JSON.stringify(next,null,2)+'\n');
  reports.push(report);
}
const dryIslandStudy={
  status:'NO-GO WITHOUT RELOCATION STUDY',
  basis:'Current 1800 mm west cooking run already contains 600 mm hob plus two 600 mm cooking/landing modules; 1800 mm south tall wall is fully allocated to pantry/oven/fridge. Putting 600 sink + 600 dishwasher + 600 hob in the 1800 cooking run consumes all frontage before required preparation and cleaning landings. Moving a sink to the tall wall sacrifices at least two tall modules; the oven and family pantry would need explicit replacement and a real drain route.',
  next_task:'Architecture and MEP feasibility first, then only render a geometrically proven dry-island candidate.',
  label:'This is a screening argument, not a formal rejection of every possible dry island scheme.'
};
const diagnostics={
  schema:'AdvisorA2KitchenDiningReview/1',
  status:'EXPLORATORY',
  canonical_sha256:input.canonical_sha256,
  parent_scene_revision:input.scene_revision,
  camera_consistency:'exact same four K12 camera objects',
  operator_proxy_mm:operator,
  comparable_models:reports,
  dry_island_feasibility:dryIslandStudy,
  recommendation:'Investigate the compact dining candidate through exact visual review. None solves 600 mm person blocking a concurrent island end-prep walkway. Do not call any variant final.',
  existing_known_canonical_failures:2,
  changes_scope:'Dining table and six dining chairs only; source canonical and render-only architecture remain fixed.'
};
fs.writeFileSync(path.join(outDir,'measurements.json'),JSON.stringify(diagnostics,null,2)+'\n');
console.log(JSON.stringify(diagnostics,null,2));
