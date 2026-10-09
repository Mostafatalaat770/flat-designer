import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {compose} from './compose.mjs';
import {floorUnion,insideFloor,floorGap} from './floor.mjs';
import {studyStages,goals} from './study.mjs';
import {pointInPolygon,minEdgeDistance,distance} from '../../studio/analysis/geometry.mjs';
import {findPlanRoute} from '../../studio/analysis/route.mjs';
import {conflicts} from '../operation-review.mjs';
const dir=import.meta.dirname,read=name=>JSON.parse(fs.readFileSync(dir+'/'+name));
const hash=name=>crypto.createHash('sha256').update(fs.readFileSync(dir+'/'+name)).digest('hex');
function verifyEvidence(){
 const hashes=read('evidence/sha256.json');for(const [file,value]of Object.entries(hashes))assert.equal(hash(file),value,file+' hash changed.');
 const browser=read('evidence/browser-check.json');assert.deepEqual(browser.errors,[]);
 for(const view of browser.views){assert.equal(view.cases,266);assert.equal(view.overflow,false);assert.equal(view.focus_changes_viewbox,true);}
 const verification=read('verification.json');assert.equal(verification.results_sha256,hash('results.json'));
 console.log(JSON.stringify({evidence_hashes:Object.keys(hashes).length,browser_cases_per_view:266,geometry_record_matches_current_results:true}));
}
if(process.argv.includes('--evidence-only')){verifyEvidence();process.exit(0);}
const composed=compose();for(const [name,value]of Object.entries(composed))assert.deepEqual(read(name+'.json'),value,name+' differs from source proposals.');
const r=read('results.json');assert.equal(r.candidate_scene,composed.snapshot.scene_revision);assert.equal(r.source_scene,'scene-9cf45a73');
assert.equal(r.production_connected,false);assert.deepEqual(r.goals,goals);
const floor=floorUnion();assert.deepEqual(r.floor,floor);
let floorSamples=0;
for(let y=12.5;y<10231.317;y+=25)for(let x=12.5;x<16035.418;x+=25){
 const p=[x,y],represented=pointInPolygon(p,floor.outer)&&!floor.holes.some(h=>pointInPolygon(p,h));
 assert.equal(represented,insideFloor(p,floor),'Floor rings differ from canonical rooms/threshold strips.');floorSamples++;
}
let pathSamples=0,found=0;
const expectedStages=studyStages(composed.snapshot.layout);assert.equal(r.stages.length,expectedStages.length);
for(const stage of r.stages){
 const expected=expectedStages.find(s=>s.id===stage.id);assert.ok(expected);
 for(const key of ['added','obstacles','goals'])assert.deepEqual(stage[key],expected[key],stage.id+' '+key);
 assert.equal(stage.conditional_architecture_overlay,!!expected.conditional);
 assert.deepEqual(stage.reservation_conflicts,conflicts(stage.added,stage.obstacles,floor.outer));assert.equal(stage.reservations_valid,true);
 const obs=[...stage.obstacles,...stage.added].map(o=>({...o,box:[Math.min(...o.polygon.map(p=>p[0])),Math.min(...o.polygon.map(p=>p[1])),Math.max(...o.polygon.map(p=>p[0])),Math.max(...o.polygon.map(p=>p[1]))]}));
 assert.equal(stage.routes.length,goals.length*2);
 for(const grid of [50,25])assert.equal(new Set(stage.routes.filter(s=>s.grid_mm===grid).map(s=>s.id)).size,goals.length);
 for(const route of stage.routes){
  assert.deepEqual(route.goal,expected.goals.find(g=>g.id===route.id).position);assert.deepEqual(route.start,r.start);
  assert.equal(route.radius_mm,250);assert.equal(route.cell_safety_pad_mm,route.grid_mm/Math.SQRT2);
  if(route.status!=='MODEL_ROUTE_FOUND'){assert.deepEqual(route.route_mm,[]);assert.equal(route.audit,null);continue;}
  found++;assert.equal(route.audit.status,'NO_DETECTED_SAMPLED_CONFLICT');
  assert.deepEqual(route.route_mm[0],route.endpoint_cell_centres[0]);assert.deepEqual(route.route_mm.at(-1),route.endpoint_cell_centres[1]);
  for(let i=0;i<route.route_mm.length;i++){
   const a=route.route_mm[Math.max(0,i-1)],b=route.route_mm[i];if(i)assert.ok(Math.abs(distance(a,b)-route.grid_mm)<1e-6,'Path jumps a grid cell.');
   const n=Math.max(1,Math.ceil(distance(a,b)/5));
   for(let k=0;k<=n;k++){
    const p=a.map((v,j)=>v+(b[j]-v)*k/n);assert.ok(insideFloor(p,floor));assert.ok(floorGap(p,floor)>250);
    for(const o of obs){const [x0,y0,x1,y1]=o.box;if(p[0]<x0-250||p[0]>x1+250||p[1]<y0-250||p[1]>y1+250)continue;
     assert.ok(!pointInPolygon(p,o.polygon)&&minEdgeDistance(p,o.polygon)>250,stage.id+' / '+route.id+' body conflict '+o.id);}
    pathSamples++;
   }
  }
 }
 console.log(JSON.stringify({stage:stage.id,independent_saved_path_audit:'clear'}));
}
const independent=[];
for(const [stageId,goalId,grid_mm]of [['baseline','bedroom1-bed',50],['unified','bedroom1-desk',25],
 ['dining-dw-loading','service-terrace',50],['conditional-guest','guest-WC',50]]){
 const stage=r.stages.find(s=>s.id===stageId),stored=stage.routes.find(r=>r.id===goalId&&r.grid_mm===grid_mm);
 const actual=findPlanRoute({room:floor.outer,obstacles:[...stage.obstacles,...stage.added].map(o=>o.polygon).concat(floor.holes),
  start:r.start,goal:stored.goal,agent_radius_mm:250,grid_mm,max_cells:300000});
 assert.equal(actual.status,stored.status,stageId+' / '+goalId+' independent whole-floor BFS');
 independent.push({stage:stageId,goal:goalId,grid_mm,status:actual.status});console.log(JSON.stringify(independent.at(-1)));
}
for(const stage of r.stages.filter(s=>s.id!=='baseline'))for(const route of stage.routes){
 const blocked=route.id==='ensuite-shower'||stage.id==='dining-storage'&&route.id==='bedroom1-desk'||
  stage.id==='dining-dw-loading'&&route.id==='service-terrace';
 assert.equal(route.status==='MODEL_ROUTE_FOUND',!blocked,stage.id+' '+route.id+' '+route.grid_mm);
}
const report={schema:'ApartmentUnifiedCirculationVerification/1',source_scene:r.source_scene,candidate_scene:r.candidate_scene,
 results_sha256:hash('results.json'),geometry_verified:true,stages:r.stages.length,route_cases:r.stages.reduce((n,s)=>n+s.routes.length,0),
 found_routes:found,independent_five_mm_path_samples:pathSamples,floor_union_samples:floorSamples,independent_repository_routes:independent,
 static_validation:composed.composition.validation,architecture_unchanged:true,unrelated_contents_unchanged:true};
if(process.argv.includes('--write'))fs.writeFileSync(dir+'/verification.json',JSON.stringify(report,null,2)+'\n');
if(!process.argv.includes('--geometry-only'))verifyEvidence();
console.log(JSON.stringify(report,null,2));
