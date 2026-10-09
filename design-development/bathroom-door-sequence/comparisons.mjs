import fs from 'node:fs';
import {inputs,insideFor} from './study.mjs';
import {planSequence,auditSequence} from './planner.mjs';
import {approach} from '../circulation-v55/route-library.mjs';
import {hingeLeaf,sweepLeaf,sweepRelation} from '../../studio/analysis/geometry.mjs';
import {findPlanRoute} from '../../studio/analysis/route.mjs';

export function runComparisons(){
 const guestBoundary=[[10739.705,8960.346],[12603.796,8960.346],[12603.796,8160.346],
  [16035.418,8160.346],[16035.418,10231.317],[10739.705,10231.317]];
 const input=inputs({guestBoundary}).find(c=>c.id==='guest');
 const variants=[
  {id:'baseline',door:input.door},
  {id:'south-hinge-inward',door:{...input.door,hinge:[input.door.hinge[0],input.door.hinge[1]+input.door.length_mm],closed_angle_deg:-90,open_angle_deg:-180}},
  {id:'north-hinge-outward',door:{...input.door,open_angle_deg:0}}
 ];
 const sequences=[],checks=[],reception=[];
 for(const variant of variants){
  const c={...input,door:variant.door},inside=insideFor(c),waypoint=approach(c.opening,c.bath);
  const swing=sweepLeaf({hinge:c.door.hinge,length_mm:c.door.length_mm,
   open_angle_deg:c.door.open_angle_deg,closed_angle_deg:c.door.closed_angle_deg,step_deg:1});
  checks.push({variant:variant.id,fixtures:c.obstacles.filter(o=>o.kind==='fixture').map(o=>({id:o.id,...sweepRelation(swing,o.polygon)})),
   entry_leaf_angle_span_deg:Math.abs(c.door.open_angle_deg-c.door.closed_angle_deg)});
  for(const grid_mm of [50,25])for(const radius_mm of [250,275]){
   const opening=planSequence({...c,inside,goal:waypoint,grid_mm,radius_mm,
    door:{...c.door,open_angle_deg:c.door.closed_angle_deg,closed_angle_deg:c.door.open_angle_deg}});
   const closing=opening.status==='SAMPLED_SEQUENCE_FOUND'?planSequence({...c,start:waypoint,
    inside,goal:c.goals[0].position,grid_mm,radius_mm}):null;
   const sequence=opening.status==='SAMPLED_SEQUENCE_FOUND'&&closing?.status==='SAMPLED_SEQUENCE_FOUND'?
    {...closing,start:c.start,endpoint_cell_centres:[opening.states[0].position_mm,closing.states.at(-1).position_mm],
     states:[...opening.states,...closing.states.slice(1)],opening_phase_states:opening.states.length}:
    {...(closing||opening),states:[],status:'NO_SAMPLED_SEQUENCE',failed_phase:closing?'inside-close-use':'outside-open-enter'};
   const audit=auditSequence(sequence,{...c,inside});
   const closed=hingeLeaf({hinge:c.door.hinge,length_mm:c.door.length_mm,angle_deg:c.door.closed_angle_deg});
   const toilet=sequence.status==='SAMPLED_SEQUENCE_FOUND'?findPlanRoute({room:c.boundary,
    obstacles:[...c.obstacles.map(o=>o.polygon),closed],start:sequence.states.at(-1).position_mm,
    goal:c.goals[1].position,agent_radius_mm:radius_mm,grid_mm,max_cells:60000}):null;
   sequences.push({variant:variant.id,...sequence,phase_evidence:{opening,closing,open_inside_waypoint_mm:waypoint},audit,toilet_approach:toilet});
  }
 }
 const outward=variants.find(v=>v.id==='north-hinge-outward').door;
 for(const point of [{id:'blocked-chair-trial',start:[14000,8800],goal:[13175,9775]},
  {id:'near-sweep-endpoint',start:[13700,9050],goal:[13175,9775]},
  {id:'clear-beyond-sweep',start:[13700,9050],goal:[13800,9800]}])for(const angle_deg of [outward.closed_angle_deg,45,outward.open_angle_deg])for(const grid_mm of [50,25]){
  const leaf=hingeLeaf({hinge:outward.hinge,length_mm:outward.length_mm,angle_deg});
  reception.push({id:point.id,door_angle_deg:angle_deg,grid_mm,start:point.start,goal:point.goal,
   ...findPlanRoute({room:input.boundary,obstacles:[...input.obstacles.map(o=>o.polygon),leaf],
    start:point.start,goal:point.goal,agent_radius_mm:250,grid_mm,max_cells:60000})});
 }
 return {schema:'ApartmentGuestDoorComparison/1',source_scene:'scene-9cf45a73',storage_revision:55,
  architecture_changed:false,active_design_changed:false,input,variants,sequences,fixture_sweeps:checks,reception_crossing:reception,
  conditional_scope:'Door overlays only, at the existing 656.668 mm opening. No wall widening, pocket, layout replacement or construction approval.'};
}
if(process.argv[1]===new URL(import.meta.url).pathname){
 const r=runComparisons();
 if(process.argv.includes('--write'))fs.writeFileSync(new URL('./comparisons.json',import.meta.url),JSON.stringify(r,null,2)+'\n');
 console.log(JSON.stringify({sequences:r.sequences.map(s=>({variant:s.variant,grid:s.parameters.grid_mm,
  diameter:2*s.parameters.radius_mm,status:s.status,phase:s.failed_phase,reason:s.reason,audit:s.audit,toilet:s.toilet_approach?.status})),
  sweep_conflicts:r.fixture_sweeps.map(v=>({variant:v.variant,conflicts:v.fixtures.filter(f=>f.any_intersection)})),
  reception:r.reception_crossing.map(x=>({angle:x.door_angle_deg,grid:x.grid_mm,status:x.status,reason:x.reason}))},null,2));
}
