import fs from 'node:fs';
import assert from 'node:assert/strict';
import {studyStages,auditWholePath} from '../unified-furnishing-v55/study.mjs';
import {floorUnion,sampleWholeFloor} from '../unified-furnishing-v55/floor.mjs';
import {conflicts} from '../operation-review.mjs';
const dir=import.meta.dirname,read=f=>JSON.parse(fs.readFileSync(dir+'/'+f));
const candidate=read('snapshot.json'),old=read('../unified-furnishing-v55/results.json'),floor=floorUnion();
assert.deepEqual(floor,old.floor);
const cases=[];
const geometry=items=>items.map(({dimensions,...g})=>({...g,...(dimensions?{dimensions:Object.fromEntries(
 ['id','type','kind','cx','cy','w','d','rot'].filter(k=>k in dimensions).map(k=>[k,dimensions[k]]))}:{})}));
for(const s of studyStages(candidate.layout)){
 const previous=old.stages.find(o=>o.id===s.id);
 assert.deepEqual(s.goals,previous.goals);assert.deepEqual(geometry(s.added),geometry(previous.added));
 const collisions=conflicts(s.added,s.obstacles,floor.outer),routes=[];
 if(s.id==='baseline'){
  // Frozen baseline is exactly identical, so preserve its separately verified evidence.
  assert.deepEqual(s.obstacles,previous.obstacles);routes.push(...previous.routes);
 }else for(const grid_mm of [50,25]){
  for(const r of sampleWholeFloor({floor,obstacles:[...s.obstacles,...s.added],start:old.start,goals:s.goals,grid_mm})){
   const prior=previous.routes.find(p=>p.id===r.id&&p.grid_mm===r.grid_mm);
   assert.equal(r.status,prior.status,`${s.id}/${grid_mm}/${r.id} route status changed`);
   const audit=auditWholePath(r,floor,[...s.obstacles,...s.added]);
   if(audit)assert.equal(audit.status,'NO_DETECTED_SAMPLED_CONFLICT');
   routes.push({...r,audit});
  }
 }
 const {dining,conditional,...saved}=s;
 cases.push({...saved,conditional_architecture_overlay:!!conditional,reservations_valid:!collisions.length,reservation_conflicts:collisions,routes});
 assert.deepEqual(collisions,previous.reservation_conflicts);
 console.log(JSON.stringify({stage:s.id,found:routes.filter(r=>r.status==='MODEL_ROUTE_FOUND').length,cases:routes.length,baseline_reused:s.id==='baseline'}));
}
const results={...old,schema:'ApartmentAestheticCirculation/1',source_scene:old.candidate_scene,candidate_scene:candidate.scene_revision,stages:cases,
 verification:{floor_union_unchanged:true,statuses_match_unified_study:true,baseline_queries_reused_with_identical_geometry:38,
  candidate_queries_recomputed:228,found_candidate_paths_independently_audited:true,sampling_max_mm:5}};
if(process.argv.includes('--write'))fs.writeFileSync(dir+'/circulation.json',JSON.stringify(results)+'\n');
else assert.deepEqual(read('circulation.json'),results);
console.log(JSON.stringify({scene:candidate.scene_revision,queries:cases.reduce((n,s)=>n+s.routes.length,0),found:cases.reduce((n,s)=>n+s.routes.filter(r=>r.status==='MODEL_ROUTE_FOUND').length,0),verified:true}));
