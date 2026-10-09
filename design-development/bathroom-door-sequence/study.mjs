import fs from 'node:fs';
import {source,domain,model,resolved,approach,room} from '../circulation-v55/route-library.mjs';
import {rectangle,hingeLeaf,pointInPolygon,sweepLeaf,sweepRelation} from '../../studio/analysis/geometry.mjs';
import {findPlanRoute} from '../../studio/analysis/route.mjs';
import {planSequence,auditSequence} from './planner.mjs';

const angle=v=>Math.atan2(v[1],v[0])*180/Math.PI;
const box=(x0,y0,x1,y1)=>[[x0,y0],[x1,y0],[x1,y1],[x0,y1]];
const cases=[
 {id:'master',bath:'BATH-M01',other:'WIC-01',opening:'OP-WIC-BATHM',
  boundary:box(4003.559,6206.575,7180.986,8960.346),
  boundary_description:'Exact union of dressing room and master bathroom; separating canonical wall retained.',
  goals:[{id:'shower',position:[6000,6750]},{id:'basin',position:[5980,8090]},{id:'toilet-approach',position:[6714.964,7870]}]},
 {id:'guest',bath:'WC-01',other:'RECP-01',opening:'OP-RECP-WC',
  boundary:box(10739.705,8960.346,13603.796,10231.317),
  boundary_description:'Guest bathroom plus exact reception floor within a local window extending 1000 mm east of the room edge. East edge is an analysis crop, not a wall.',
  goals:[{id:'basin-front-300',position:[11968.31,9564.54]},{id:'toilet-approach',position:[11944.276,9701.745]}]}
];
function withinWindow(polygon,boundary){
 const bounds=p=>[Math.min(...p.map(v=>v[0])),Math.min(...p.map(v=>v[1])),Math.max(...p.map(v=>v[0])),Math.max(...p.map(v=>v[1]))];
 const a=bounds(polygon),b=bounds(boundary),pad=500;
 return a[0]<b[2]+pad&&a[2]>b[0]-pad&&a[1]<b[3]+pad&&a[3]>b[1]-pad;
}
export function inputs({guestBoundary=null}={}){
 return cases.map(original=>{
  const c=original.id==='guest'&&guestBoundary?{...original,boundary:guestBoundary,
   boundary_description:'Guest bathroom plus exact adjoining reception floor cropped 800 mm north of the bathroom top; full canonical reception width retained. North edge is an analysis crop; grid origin phase matches the baseline.'}:original;
  const ids=[c.bath,c.other],d=model.doors.find(d=>d.id===c.opening),bath=room(c.bath).poly;
  const fixtures=resolved(source.layout).filter(f=>ids.includes(f.room_id)&&f.type!=='rug'&&f.id!=='BATHM-WALKIN-A1'&&f.bottom_mm<1800&&f.top_mm>100)
   .map(f=>({id:f.id,polygon:rectangle(f),kind:'fixture',room_id:f.room_id}));
  const walls=model.wall_segments.flatMap((w,i)=>!w.rooms.some(r=>ids.includes(r))?[]:[{id:'canonical-wall-'+i,kind:'wall',polygon:rectangle({
   cx:(w.from[0]+w.to[0])/2,cy:(w.from[1]+w.to[1])/2,w:Math.hypot(w.to[0]-w.from[0],w.to[1]-w.from[1]),d:w.thickness_mm,
   rot:Math.atan2(w.to[1]-w.from[1],w.to[0]-w.from[0])*180/Math.PI})}]);
  const otherLeaves=model.doors.filter(d=>d.id!==c.opening&&model.openings.find(o=>o.id===d.id).between.some(r=>ids.includes(r)))
   .map(d=>({id:'other-open-leaf-'+d.id,kind:'other-door',polygon:hingeLeaf({hinge:d.h,length_mm:d.len,angle_deg:angle(d.o)})}));
  return {...c,bathroom_polygon:bath,start:approach(c.opening,c.other),
   obstacles:[...fixtures,...walls,...otherLeaves].filter(o=>withinWindow(o.polygon,c.boundary)),
   door:{id:d.id,hinge:d.h,length_mm:d.len,open_angle_deg:angle(d.o),closed_angle_deg:angle(d.c)}};
 });
}
export const insideFor=c=>(p,margin)=>pointInPolygon(p,c.bathroom_polygon)&&
 // For this shared vertical doorway, keep the entire disk inside the bathroom
 // while changing the leaf angle; radius includes the grid pad in planning.
 (c.id==='master'?p[0]-c.door.hinge[0]>=margin:c.door.hinge[0]-p[0]>=margin);

export function runStudy(){
 const data=inputs(),sequences=[],fixedOpen=[],sweeps=[];
 for(const c of data){
  const leaf=angle_deg=>hingeLeaf({hinge:c.door.hinge,length_mm:c.door.length_mm,angle_deg});
  const swing=sweepLeaf({hinge:c.door.hinge,length_mm:c.door.length_mm,
   open_angle_deg:c.door.open_angle_deg,closed_angle_deg:c.door.closed_angle_deg,step_deg:1});
  sweeps.push({room:c.id,fixture_checks:c.obstacles.filter(o=>o.kind==='fixture').map(o=>({id:o.id,...sweepRelation(swing,o.polygon)}))});
  for(const grid_mm of [50,25]){
   const openGoals=c.id==='master'?[c.goals[0]]:[c.goals[0],{id:'basin-front-400',position:[11968.31,9664.54]}];
   for(const goal of openGoals)fixedOpen.push({room:c.id,goal_id:goal.id,grid_mm,
    ...findPlanRoute({room:c.boundary,obstacles:[...c.obstacles.map(o=>o.polygon),leaf(c.door.open_angle_deg)],
     start:c.start,goal:goal.position,agent_radius_mm:250,grid_mm,max_cells:60000})});
   for(const radius_mm of [250,275]){
    const first=c.goals[0],openInside=approach(c.opening,c.bath);
    // A 25 mm shift south keeps the master intermediate stance away from the
    // open leaf; preserve this declared waypoint rather than changing the grid.
    if(c.id==='master')openInside[1]+=25;
    const opening=planSequence({...c,inside:insideFor(c),goal:openInside,grid_mm,radius_mm,
     door:{...c.door,open_angle_deg:c.door.closed_angle_deg,closed_angle_deg:c.door.open_angle_deg}});
    const closing=opening.status==='SAMPLED_SEQUENCE_FOUND'?planSequence({...c,inside:insideFor(c),start:openInside,
     goal:first.position,grid_mm,radius_mm}):null;
    const sequence=opening.status==='SAMPLED_SEQUENCE_FOUND'&&closing?.status==='SAMPLED_SEQUENCE_FOUND'?
     {...closing,start:c.start,endpoint_cell_centres:[opening.states[0].position_mm,closing.states.at(-1).position_mm],
      states:[...opening.states,...closing.states.slice(1)],opening_phase_states:opening.states.length,
      phase_summary:'Closed outside → open inside → closed at fixture. Reverse to reopen, exit and close outside.'}:
     {...(closing||opening),states:[],status:'NO_SAMPLED_SEQUENCE',failed_phase:closing?'inside-close-use':'outside-open-enter'};
    const audit=auditSequence(sequence,{...c,inside:insideFor(c)});
    const fixtureRoutes=sequence.status==='SAMPLED_SEQUENCE_FOUND'?c.goals.slice(1).map(goal=>({id:goal.id,
     ...findPlanRoute({room:c.boundary,obstacles:[...c.obstacles.map(o=>o.polygon),leaf(c.door.closed_angle_deg)],
      start:sequence.states.at(-1).position_mm,goal:goal.position,agent_radius_mm:radius_mm,grid_mm,max_cells:60000})})):[];
    sequences.push({room:c.id,goal_id:first.id,...sequence,
     phase_evidence:{opening,closing,open_inside_waypoint_mm:openInside},audit,closed_fixture_routes:fixtureRoutes});
   }
  }
 }
 return {schema:'ApartmentBathroomDoorReview/1',source_scene:source.scene_revision,
  saved_cloud_scene:'scene-4821689',storage_revision:55,canonical_sha256:source.canonical_sha256,
  assumption:'Inferred hinges, generic 18 mm leaves, 500/550 mm circular body and 600 mm centre-to-handle reach proxy; planning evidence, not site or ergonomic certification.',
  data,sequences,fixed_open:fixedOpen,door_fixture_sweeps:sweeps};
}
if(process.argv[1]===new URL(import.meta.url).pathname){
 const result=runStudy();
 if(process.argv.includes('--write'))fs.writeFileSync(new URL('./results.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
 console.log(JSON.stringify({source:result.source_scene,sequences:result.sequences.map(s=>({room:s.room,grid:s.parameters.grid_mm,diameter:2*s.parameters.radius_mm,status:s.status,reason:s.reason,audit:s.audit,fixtures:s.closed_fixture_routes.map(r=>({id:r.id,status:r.status}))})),fixed_open:result.fixed_open.map(r=>({room:r.room,goal:r.goal_id,grid:r.grid_mm,status:r.status,reason:r.reason}))},null,2));
}
