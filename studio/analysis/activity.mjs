/**
 * Spatial Foundation v2 — named occupants and time-staged, linear planar motion.
 *
 * Values in model MILLIMETRES, times in milliseconds. Moving occupant disks
 * are checked ANALYTICALLY against each other along linear keyframe segments,
 * and conservatively sampled against the room/solid furniture. This is not
 * human ergonomics, gait analysis, swept chair kinematics or construction code.
 */
import {distance,pointInPolygon,minEdgeDistance,polygonGap,
  rectangle,sweepLeaf} from './geometry.mjs';
import {findPlanRoute} from './route.mjs';

const finite=(x,label)=>{if(!Number.isFinite(x))throw new Error('Expected finite '+label);return x;};
const xy=(p,label)=>{if(!Array.isArray(p)||p.length!==2)throw new Error('Expected 2D '+label);
  p.forEach((x,i)=>finite(x,label+i));return p;};
const round=x=>+x.toFixed(3);
function circlePolygon(center,radius,count=24){
 const outer=radius/Math.cos(Math.PI/count); // CIRCUMSCRIBED: does not underestimate human occupied radius
 return Array.from({length:count},(_,i)=>{
  const a=(i+.5)*Math.PI*2/count;
  return [center[0]+outer*Math.cos(a),center[1]+outer*Math.sin(a)];
 });
}
function objectPolygon(x){
 if(x.polygon)return x.polygon;
 if(x.furniture)return rectangle(x.furniture);
 throw new Error('Missing named furniture or polygon geometry');
}
function resolveObstacles(list){
 if(!Array.isArray(list))throw new Error('Obstacles should be an array');
 const names=new Set();
 return list.map(o=>{
  if(typeof o.id!=='string'||!o.id||names.has(o.id))throw new Error('Obstacle IDs required and unique');
  names.add(o.id);
  return {id:o.id,polygon:objectPolygon(o),provenance:o.provenance||'TBD'};
 });
}
function resolveActors(frame){
 if(!Array.isArray(frame.actors))throw new Error('Frame actors required');
 const ids=new Set();
 return frame.actors.map(a=>{
  if(typeof a.id!=='string'||!a.id||ids.has(a.id))throw new Error('Actor IDs required and unique');
  ids.add(a.id);
  xy(a.position,'actor position');
  if(!(finite(a.radius_mm,'actor radius')>0))throw new Error('Actor radius must be positive');
  return {id:a.id,position:a.position,radius_mm:a.radius_mm,role:a.role||'unspecified'};
 });
}
export function closestApproachLinear(a0,a1,b0,b1){
 // both move at uniform constant velocity during the SAME keyframe interval.
 const p=[a0[0]-b0[0],a0[1]-b0[1]];
 const v=[a1[0]-a0[0]-b1[0]+b0[0],a1[1]-a0[1]-b1[1]+b0[1]];
 const vv=v[0]**2+v[1]**2;
 const t=vv===0?0:Math.max(0,Math.min(1,-(p[0]*v[0]+p[1]*v[1])/vv));
 return {fraction:t,distance_mm:Math.hypot(p[0]+t*v[0],p[1]+t*v[1])};
}
function minClear(actor,room,obstacles){
 const wall=pointInPolygon(actor.position,room)
  ?minEdgeDistance(actor.position,room)-actor.radius_mm:-actor.radius_mm;
 let id='room_boundary',clearance=wall;
 for(const o of obstacles){
  const dist=pointInPolygon(actor.position,o.polygon)
   ?-actor.radius_mm: minEdgeDistance(actor.position,o.polygon)-actor.radius_mm;
  if(dist<clearance){clearance=dist;id=o.id;}
 }
 return {clearance_mm:round(clearance),nearest_obstacle_id:id};
}
function segmentSamples(a,b,maxStep){
 const segments=Math.max(1,Math.ceil(distance(a,b)/maxStep));
 return Array.from({length:segments+1},(_,i)=>{
  const t=i/segments;
  return [a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];
 });
}
function doorPanels(door){
 if(!door.id)throw new Error('A door must have ID');
 if(door.polygon)return [{id:door.id+'-at-rest',polygon:door.polygon}];
 if(!door.sweep)throw new Error('Door requires polygon or swept hinge geometry');
 const sw=door.sweep;
 if(!sw.provenance)throw new Error('Door sweep must declare manufacturer/proxy provenance');
 const polys=sweepLeaf(sw);
 return polys.map((polygon,i)=>({id:door.id+'-swept-'+i,polygon}));
}
export function analyzeOccupancyTimeline({
 room,static_obstacles=[],frames,collision_tolerance_mm=0,
 max_motion_sample_mm=20,route_grid_mm=50
}){
 if(!Array.isArray(room)||room.length<3)throw new Error('Room polygon required');
 if(!Array.isArray(frames)||!frames.length)throw new Error('At least one frame required');
 if(frames.length>120)throw new Error('Too many time frames; cap 120');
 if(!(finite(max_motion_sample_mm,'motion step')>=5&&max_motion_sample_mm<=100))
  throw new Error('Motion sample step must be 5..100mm');
 if(!(finite(collision_tolerance_mm,'tolerance')>=0))throw new Error('Invalid tolerance');
 const staticPolys=resolveObstacles(static_obstacles);
 const seen=new Set();
 const stages=frames.map((f,index)=>{
  if(!f.id||seen.has(f.id))throw new Error('Frame IDs required and unique');
  seen.add(f.id);
  finite(f.t_ms,'frame t_ms');
  if(index>0 && !(f.t_ms>frames[index-1].t_ms))throw new Error('Frames must have increasing times');
  const actors=resolveActors(f);
  const doorPolys=(f.doors||[]).flatMap(doorPanels);
  const obstacles=[...staticPolys,...doorPolys];
  const occupancy=actors.map(a=>({actor_id:a.id,...minClear(a,room,obstacles)}));
  const pairs=[];
  for(let i=0;i<actors.length;i++)for(let j=i+1;j<actors.length;j++){
   const a=actors[i],b=actors[j],free=distance(a.position,b.position)-a.radius_mm-b.radius_mm;
   pairs.push({a:a.id,b:b.id,clearance_mm:round(free),collision:free<=collision_tolerance_mm});
  }
  const routes=(f.routes||[]).map(q=>{
   const actor=actors.find(a=>a.id===q.actor_id);
   if(!actor)throw new Error('Route queries must name a live actor');
   const otherBodies=actors.filter(a=>a.id!==actor.id).map(a=>circlePolygon(a.position,a.radius_mm));
   const route=findPlanRoute({room,start:q.start||actor.position,goal:q.goal,
     agent_radius_mm:actor.radius_mm+collision_tolerance_mm,
     grid_mm:route_grid_mm,obstacles:[...obstacles.map(o=>o.polygon),...otherBodies]});
   return {actor_id:actor.id,blocked_by_state_ids:obstacles.map(o=>o.id).concat(actors.filter(a=>a.id!==actor.id).map(a=>a.id)),
    ...route};
  });
  return {id:f.id,t_ms:f.t_ms,actors,obstacles,
   actor_clearances:occupancy,actor_pairs:pairs,routes,
   door_sweep_sample_count:doorPolys.length};
 });
 const continuous=[];
 for(let i=1;i<stages.length;i++){
  const prev=stages[i-1],curr=stages[i];
  const shared=curr.actors.filter(a=>prev.actors.some(z=>z.id===a.id));
  const movement=[];
  for(let j=0;j<shared.length;j++)for(let k=j+1;k<shared.length;k++){
   const a=shared[j],b=shared[k];
   const ap=prev.actors.find(x=>x.id===a.id),bp=prev.actors.find(x=>x.id===b.id);
   if(a.radius_mm!==ap.radius_mm||b.radius_mm!==bp.radius_mm)
    throw new Error('Actor radius cannot jump during a motion interval');
   const near=closestApproachLinear(ap.position,a.position,bp.position,b.position);
   const clear=near.distance_mm-a.radius_mm-b.radius_mm;
   movement.push({a:a.id,b:b.id,min_clearance_mm:round(clear),
    closest_at_ms:round(prev.t_ms+(curr.t_ms-prev.t_ms)*near.fraction),
    collision:clear<=collision_tolerance_mm});
  }
  const obstacleHazards=[];
  // Conservative static obstacle check at BOTH endpoints, with samples.
  // If door changes from one frame to next, swept envelope is attached to its
  // frame explicitly. We never infer a physical hinge animation from nowhere.
  const union=[...prev.obstacles,...curr.obstacles];
  for(const a of shared){
   const ap=prev.actors.find(x=>x.id===a.id);
   const dots=segmentSamples(ap.position,a.position,max_motion_sample_mm);
   let minimum={clearance_mm:Infinity,nearest_obstacle_id:null};
   for(const p of dots){
    const m=minClear({...a,position:p},room,union);
    if(m.clearance_mm<minimum.clearance_mm)minimum=m;
   }
   if(minimum.clearance_mm<=collision_tolerance_mm)obstacleHazards.push({
    actor_id:a.id,...minimum,
    sampled_points:dots.length,
    caution:'Room/fixture path sampled conservatively, not exact continuous swept polygon intersection'});
  }
  continuous.push({from:prev.id,to:curr.id,from_ms:prev.t_ms,to_ms:curr.t_ms,
   actor_pair_swept_motion:movement,body_solid_motion_hazards:obstacleHazards});
 }
 const frameHazards=stages.some(s=>s.actor_clearances.some(a=>a.clearance_mm<=collision_tolerance_mm)
   ||s.actor_pairs.some(p=>p.collision));
 const motionHazards=continuous.some(s=>s.actor_pair_swept_motion.some(p=>p.collision)
   ||s.body_solid_motion_hazards.length);
 const report={schema:'ApartmentTimedActivity/1',status:frameHazards||motionHazards?'MODEL_CONFLICT':'NO_DETECTED_MODEL_CONFLICT',
  frames:stages.map(({obstacles,actors,...rest})=>({
   ...rest,actors:actors.map(a=>({...a})),obstacle_ids:obstacles.map(o=>o.id)})),
  intervals:continuous,
  limits:['Actor trajectories assume constant velocity BETWEEN supplied keyframes. Pairwise disk closest approach is analytic, not human kinetics.',
   'Wardrobe doors as sweep envelopes conservatively reserve every angle sampled, even if used at different times.',
   'Actor-vs-solid motion sampled with max step, and source polygon may be image-calibrated; no code compliance or accessibility certification.',
   'Unspecified actors or moving fixtures cannot be inferred; route solves static states only.']};
 return report;
}
