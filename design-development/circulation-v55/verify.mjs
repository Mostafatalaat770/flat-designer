import fs from 'node:fs';
import assert from 'node:assert/strict';
import {source,domain,model,route,room} from './route-library.mjs';
import {findPlanRoute} from '../../studio/analysis/route.mjs';

const audit=JSON.parse(fs.readFileSync(new URL('./audit.json',import.meta.url),'utf8'));
assert.equal(source.scene_revision,'scene-9cf45a73');
assert.deepEqual(audit.layout,source.layout);
assert.deepEqual(audit.model,model);
assert.equal(audit.routes.length,31);
assert.equal(new Set(audit.routes.map(r=>r.room_id)).size,13);
assert.equal(audit.candidates.length,6);
assert.deepEqual(domain.validate(source.layout).summary,audit.validation.summary);
const dining=structuredClone(source.layout);
for(const f of dining.furniture.filter(f=>f.room_id==='RECP-01'&&f.type==='chair'))f.cy+=f.cy<7650?-300:300;
let independent=0,sensitivity=0;
for(const stored of audit.routes){
 const layout=stored.id==='R22-dining-six-chairs-pulled-300mm'?dining:source.layout;
 const actual=route(stored,layout,50);
 assert.equal(actual.route_found_500mm,stored.route_found_500mm,stored.id);
 assert.equal(actual.conservative_sampled_diameter_mm,stored.conservative_sampled_diameter_mm,stored.id+' diameter');
 if(audit.sensitivity.some(s=>s.id===stored.id)){
  const fine=route(stored,layout,25);
  assert.equal(fine.route_found_500mm,stored.route_found_500mm,stored.id+' fine grid');
  sensitivity++;
 }
 if(audit.independent_repository_route_checks.some(s=>s.id===stored.id)){
  const r=findPlanRoute({room:room(stored.room_id).poly,obstacles:actual.obs.map(o=>o.polygon),start:stored.start,goal:stored.goal,agent_radius_mm:250,grid_mm:50,max_cells:60000});
  assert.equal(r.status==='MODEL_ROUTE_FOUND',stored.route_found_500mm,stored.id+' independent route');
  independent++;
 }
}
for(const candidate of audit.candidates){
 const actual=domain.applyProposal(source.layout,candidate.proposal);
 assert.deepEqual(actual,candidate.layout,candidate.id+' proposal layout');
 assert.equal(domain.revision(actual),candidate.revision);
 assert.equal(domain.validate(actual).summary.fail,0);
 for(const stored of candidate.routes){
  assert.equal(route(stored,actual,50).route_found_500mm,stored.route_found_500mm,candidate.id+' / '+stored.id);
  const expected=candidate.sensitivity.find(s=>stored.id.endsWith(s.id));
  assert.ok(expected,'Missing alternative sensitivity record: '+stored.id);
  assert.equal(route(stored,actual,25).route_found_500mm,expected.route_found_500mm,candidate.id+' / fine grid');
 }
}
console.log(JSON.stringify({source:source.scene_revision,areas:13,scenarios:31,candidate_contracts:6,independent_routes:independent,fine_grid_baseline_checks:sensitivity,canonical_geometry_unchanged:true}));
