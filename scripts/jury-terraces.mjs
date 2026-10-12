import fs from 'node:fs';import assert from 'node:assert/strict';
import {dir,read,domain,sha} from './jury-build.mjs';
import {rectangle,relation,pointInPolygon} from '../studio/analysis/geometry.mjs';
import {findPlanRoute} from '../studio/analysis/route.mjs';
const s=read(dir+'/SCENARIO.json'),result=[];
for(const rid of ['TER-MAIN','TER-MBR','TER-SVC']){
 const selected=read(`design-development/whole-home-m3/group5/${rid==='TER-SVC'?'B':'A'}.json`);
 for(const f of s.layout.furniture.filter(f=>f.room_id===rid)){const old=selected.layout.furniture.find(x=>x.id===f.id);for(const k of ['cx','cy','w','d','rot'])assert.equal(f[k],old[k]);}
 for(const c of s.group5_concepts.filter(x=>x.room===rid)){const old=selected.group5_concepts.find(x=>x.id===c.id);for(const k of ['cx','cy','w','d','rot','h'])assert.equal(c[k],old[k]);}
 const poly=domain.model.rooms.find(r=>r.id===rid).poly,x=poly.map(p=>p[0]),y=poly.map(p=>p[1]),room=[[Math.min(...x)+90,Math.min(...y)+90],[Math.max(...x)-90,Math.min(...y)+90],[Math.max(...x)-90,Math.max(...y)-90],[Math.min(...x)+90,Math.max(...y)-90]];
 const furniture=s.layout.furniture.filter(f=>f.room_id===rid),concepts=s.group5_concepts.filter(c=>c.room===rid);
 const chairs=[...furniture.filter(f=>f.type==='armchair'),...concepts.filter(c=>c.kind==='seat')],actors=chairs.map(f=>{const a=f.rot*Math.PI/180;return {id:f.id,polygon:rectangle({...f,cx:f.cx-Math.sin(a)*(f.d/2-80),cy:f.cy+Math.cos(a)*(f.d/2-80),w:600,d:350})};});
 const start=rid==='TER-MAIN'?[14780,2290]:rid==='TER-MBR'?[1510,4570]:[10104,9390],goal=rid==='TER-MAIN'?[13500,1980]:rid==='TER-MBR'?[1220,4200]:[10300,9730];
 const tests=[];for(const grid of [25,20])for(const diameter of [500,600])for(const state of rid==='TER-SVC'?['DEPLOYED','FOLDED_ON_TERRACE','REMOVED_FOR_CLEANING']:['furniture-only','occupied-rising']){
  const current=concepts.filter(c=>state!=='REMOVED_FOR_CLEANING'||!['rack-tower','caddy'].includes(c.kind)).map(c=>({...c,d:state==='FOLDED_ON_TERRACE'&&c.kind==='rack-tower'?120:c.d}));
  const obstacles=[...furniture.map(rectangle),...current.map(rectangle),...(state==='occupied-rising'?actors.map(a=>a.polygon):[])];
  const test=findPlanRoute({room,obstacles,start,goal,agent_radius_mm:diameter/2,grid_mm:grid,max_cells:30000});const control=findPlanRoute({room,obstacles:[],start,goal,agent_radius_mm:diameter/2,grid_mm:grid,max_cells:30000});tests.push({state,grid_mm:grid,diameter_assumed_mm:diameter,...test,empty_control:control.status,reliability:control.status==='MODEL_ROUTE_FOUND'?test.status==='MODEL_ROUTE_FOUND'?'MODEL_ROUTE':'MODEL_LIMIT_AT_NAMED_APPROACH':'INCONCLUSIVE_ENDPOINT'});
 }
 result.push({room:rid,selected_input_sha256:sha(fs.readFileSync(`design-development/whole-home-m3/group5/${rid==='TER-SVC'?'B':'A'}.json`)),combined_operating_envelopes_equal_to_selected_input:true,actor_assumption:'600wide x350 rising torso; not articulated body',tests,maintenance:'Named inside approach only. Actual drain/guard/handhold/load/wind/cleaning and carry route UNKNOWN. REMOVED requires unallocated indoor parking; no storage credit.',source_ceiling:null});
}
fs.writeFileSync(dir+'/TERRACE_OPERATIONS.json',JSON.stringify({schema:'CombinedTerraceRetest/1',scenario_sha256:sha(fs.readFileSync(dir+'/SCENARIO.json')),results:result},null,2)+'\n');console.log('Combined terrace states re-tested; selected source envelopes verified, no inferred roof or indoor parking.');
