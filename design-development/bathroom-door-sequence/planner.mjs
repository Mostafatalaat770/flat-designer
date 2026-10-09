// Local review planner: a circular body moves on a conservative grid while one
// inferred hinged door changes angle. No architecture or saved layout is edited.
import {hingeLeaf,pointInPolygon,minEdgeDistance,distance} from '../../studio/analysis/geometry.mjs';

export function planSequence({boundary,obstacles,door,inside,start,goal,grid_mm=25,
 radius_mm=250,reach_mm=600,angle_step_deg=5,handle_inset_mm=60}){
 const bounds=[Math.min(...boundary.map(p=>p[0])),Math.min(...boundary.map(p=>p[1])),
  Math.max(...boundary.map(p=>p[0])),Math.max(...boundary.map(p=>p[1]))];
 const nx=Math.ceil((bounds[2]-bounds[0])/grid_mm),ny=Math.ceil((bounds[3]-bounds[1])/grid_mm),cells=nx*ny;
 const count=Math.ceil(Math.abs(door.closed_angle_deg-door.open_angle_deg)/angle_step_deg);
 const angles=Array.from({length:count+1},(_,k)=>door.open_angle_deg+(door.closed_angle_deg-door.open_angle_deg)*k/count);
 const pad=grid_mm/Math.SQRT2,margin=radius_mm+pad;
 const at=id=>[bounds[0]+(id%nx+.5)*grid_mm,bounds[1]+(Math.floor(id/nx)+.5)*grid_mm];
 const cell=p=>Math.floor((p[1]-bounds[1])/grid_mm)*nx+Math.floor((p[0]-bounds[0])/grid_mm);
 const leaf=angle_deg=>hingeLeaf({hinge:door.hinge,length_mm:door.length_mm,thickness_mm:18,angle_deg});
 const handle=angle_deg=>{const a=angle_deg*Math.PI/180;return door.hinge.map((v,i)=>v+(door.length_mm-handle_inset_mm)*(i?Math.sin(a):Math.cos(a)));};
 const clear=(p,poly)=>!pointInPolygon(p,poly)&&minEdgeDistance(p,poly)>margin;
 const staticFree=new Uint8Array(cells);
 for(let id=0;id<cells;id++){
  const p=at(id);
  if(pointInPolygon(p,boundary)&&minEdgeDistance(p,boundary)>margin&&obstacles.every(o=>clear(p,o.polygon)))staticFree[id]=1;
 }
 const free=angles.map(a=>{
  const out=new Uint8Array(cells),panel=leaf(a);
  for(let id=0;id<cells;id++)if(staticFree[id]&&clear(at(id),panel))out[id]=1;
  return out;
 });
 // Rotation intervals are checked lazily, at <=1 degree samples. An additional
 // leaf-motion bound covers between-sample angles: max corner radius * delta/2.
 const turn=Array.from({length:count},()=>new Int8Array(cells).fill(-1));
 const canTurn=(id,k)=>{
  if(turn[k][id]!==-1)return turn[k][id]===1;
  const p=at(id),a=angles[k],b=angles[k+1],n=Math.ceil(Math.abs(b-a));
  const arcPad=Math.hypot(door.length_mm,9)*Math.abs(b-a)/n*Math.PI/360;
  // Door handling may begin while crossing the threshold. Requiring the whole
  // disk inside for every rotation would reject normal push/pull entry motions.
  let valid=!!staticFree[id];
  for(let s=0;valid&&s<=n;s++){
   const angle=a+(b-a)*s/n,panel=leaf(angle);
   valid=!pointInPolygon(p,panel)&&minEdgeDistance(p,panel)>margin+arcPad&&
    distance(p,handle(angle))+(door.length_mm-handle_inset_mm)*Math.abs(b-a)/n*Math.PI/360<=reach_mm;
  }
  turn[k][id]=valid?1:0;return !!valid;
 };
 const startCell=cell(start),goalCell=cell(goal);
 const parameters={grid_mm,radius_mm,cell_safety_pad_mm:pad,reach_mm,angle_step_deg,
  rotation_sample_max_deg:1,handle_inset_mm,door_thickness_mm:18};
 const out={schema:'ApartmentDoorSequence/1',parameters,start,goal,
  endpoint_cell_centres:[at(startCell),at(goalCell)],door,states:[],status:'NO_SAMPLED_SEQUENCE',reason:null};
 if(startCell<0||startCell>=cells||!free[0][startCell])return {...out,reason:'OPEN_START_BLOCKED'};
 if(goalCell<0||goalCell>=cells||!free[count][goalCell]||!inside(at(goalCell),margin))return {...out,reason:'FINAL_GOAL_BLOCKED'};
 const nodes=cells*(count+1),parent=new Int32Array(nodes).fill(-1),seen=new Uint8Array(nodes),queue=new Int32Array(nodes);
 const s=startCell,t=count*cells+goalCell;
 let lo=0,hi=1;queue[0]=s;seen[s]=1;
 const visit=(next,id)=>{if(!seen[next]){seen[next]=1;parent[next]=id;queue[hi++]=next;}};
 while(lo<hi){
  const node=queue[lo++];if(node===t)break;
  const k=Math.floor(node/cells),id=node%cells,x=id%nx,y=Math.floor(id/nx);
  for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){
   const xx=x+dx,yy=y+dy;if(xx<0||xx>=nx||yy<0||yy>=ny)continue;
   const next=yy*nx+xx;if(free[k][next])visit(k*cells+next,node);
  }
  // Each component is monotone in angle; combine opening then closing to enter.
  // Reversing the combined trajectory supplies reopening, exit and closure.
  if(k<count&&free[k+1][id]&&canTurn(id,k))visit((k+1)*cells+id,node);
 }
 if(!seen[t])return {...out,reason:'DISCRETE_POSITION_ANGLE_REGION_DISCONNECTED',visited_nodes:hi};
 const states=[];
 for(let node=t;node!==-1;node=parent[node]){
  states.push({position_mm:at(node%cells),door_angle_deg:angles[Math.floor(node/cells)]});
  if(node===s)break;
 }
 states.reverse();
 return {...out,status:'SAMPLED_SEQUENCE_FOUND',visited_nodes:hi,states};
}

// Independent trajectory audit at <=5 mm body translations / <=0.25 degree
// rotations. It consumes saved positions and angles, not the planner's grid.
export function auditSequence(sequence,{boundary,obstacles,inside}){
 if(sequence.status!=='SAMPLED_SEQUENCE_FOUND')return null;
 const {radius_mm,reach_mm,handle_inset_mm}=sequence.parameters,d=sequence.door;
 let minimum=Infinity,limiting=null,maximumReach=0,turns=0,bodyDistance=0,samples=0;
 const check=(p,a,turning)=>{
  const panel=hingeLeaf({hinge:d.hinge,length_mm:d.length_mm,thickness_mm:18,angle_deg:a});
  const pairs=[['analysis_boundary',pointInPolygon(p,boundary)?minEdgeDistance(p,boundary):-Infinity],
   ...obstacles.map(o=>[o.id,pointInPolygon(p,o.polygon)?0:minEdgeDistance(p,o.polygon)]),
   ['moving_door',pointInPolygon(p,panel)?0:minEdgeDistance(p,panel)]];
  for(const [id,clearance] of pairs)if(clearance-radius_mm<minimum){minimum=clearance-radius_mm;limiting=id;}
  if(turning){
   const r=a*Math.PI/180,h=d.hinge.map((v,i)=>v+(d.length_mm-handle_inset_mm)*(i?Math.sin(r):Math.cos(r)));
   maximumReach=Math.max(maximumReach,distance(p,h));
  }
  samples++;
 };
 check(sequence.states[0].position_mm,sequence.states[0].door_angle_deg,false);
 for(let i=1;i<sequence.states.length;i++){
  const before=sequence.states[i-1],after=sequence.states[i],length=distance(before.position_mm,after.position_mm);
  const angle=Math.abs(after.door_angle_deg-before.door_angle_deg),turning=angle>0;
  if(turning&&length>0)throw new Error('Independent audit requires separate translation and rotation steps');
  if(turning)turns++;bodyDistance+=length;
  const n=Math.max(1,Math.ceil(length/5),Math.ceil(angle/.25));
  for(let k=0;k<=n;k++){
   const t=k/n,p=before.position_mm.map((v,j)=>v+(after.position_mm[j]-v)*t);
   check(p,before.door_angle_deg+(after.door_angle_deg-before.door_angle_deg)*t,turning);
  }
 }
 if(!inside(sequence.states.at(-1).position_mm,radius_mm))throw new Error('Final body is not wholly inside');
 return {status:minimum>0&&maximumReach<=reach_mm?'NO_DETECTED_SAMPLED_CONFLICT':'SAMPLED_CONFLICT',
  minimum_body_to_obstacle_gap_mm:minimum,limiting_obstacle_id:limiting,
  maximum_centre_to_handle_reach_mm:maximumReach,door_rotation_steps:turns,
  body_translation_mm:bodyDistance,independent_samples:samples,
  reverse_sequence:'Same clearances and handle reach; reopen then exit by reversing these states.'};
}
