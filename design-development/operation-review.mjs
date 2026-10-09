// Shared local planning helpers. Inputs and output geometry use millimetres.
import {pointInPolygon,minEdgeDistance,rectangle,hingeLeaf,relation,distance} from '../studio/analysis/geometry.mjs';
import {model,resolved} from './circulation-v55/route-library.mjs';

export function solidObstacles(layout,roomIds,{skip=[]}={}){
 const items=resolved(layout).filter(f=>roomIds.includes(f.room_id)&&f.type!=='rug'&&!skip.includes(f.id)&&f.bottom_mm<1800&&f.top_mm>100)
  .map(f=>({id:f.id,kind:'fixture',room_id:f.room_id,polygon:rectangle(f)}));
 const walls=model.wall_segments.flatMap((w,i)=>w.rooms.some(r=>roomIds.includes(r))?[{id:'canonical-wall-'+i,kind:'wall',polygon:rectangle({
  cx:(w.from[0]+w.to[0])/2,cy:(w.from[1]+w.to[1])/2,w:Math.hypot(w.to[0]-w.from[0],w.to[1]-w.from[1]),d:w.thickness_mm,
  rot:Math.atan2(w.to[1]-w.from[1],w.to[0]-w.from[0])*180/Math.PI})}]:[]);
 const leaves=model.doors.filter(d=>model.openings.find(o=>o.id===d.id).between.some(r=>roomIds.includes(r)))
  .map(d=>({id:'open-room-leaf-'+d.id,kind:'room-door',polygon:hingeLeaf({hinge:d.h,length_mm:d.len,angle_deg:Math.atan2(d.o[1],d.o[0])*180/Math.PI})}));
 return [...items,...walls,...leaves];
}
export const reserve=item=>({id:item.id,kind:item.kind||'reserve',polygon:rectangle(item),dimensions:item});
export function circleObstacle(id,p,radius=250){
 const radiusOuter=radius/Math.cos(Math.PI/24);
 return {id,kind:'person',position_mm:p,radius_mm:radius,polygon:Array.from({length:24},(_,i)=>{
  const a=(i+.5)*Math.PI*2/24;return [p[0]+radiusOuter*Math.cos(a),p[1]+radiusOuter*Math.sin(a)];
 })};
}
export function conflicts(added,staticObs,boundary){
 const result=[];
 for(const a of added){
  if(a.polygon.some(p=>!pointInPolygon(p,boundary)))result.push({a:a.id,b:'analysis-boundary',reason:'reserve outside domain'});
  for(const b of staticObs)if(!a.skip_collision_ids?.includes(b.id)){
   const r=relation(a.polygon,b.polygon);if(r.intersects_positive_area)result.push({a:a.id,b:b.id,...r});
  }
 }
 for(let i=0;i<added.length;i++)for(let j=i+1;j<added.length;j++){
  const r=relation(added[i].polygon,added[j].polygon);
  if(r.intersects_positive_area)result.push({a:added[i].id,b:added[j].id,...r});
 }
 return result;
}
export function sampleRoutes({boundary,obstacles,start,goals,grid_mm=25,radius_mm=250}){
 const minx=Math.min(...boundary.map(p=>p[0])),miny=Math.min(...boundary.map(p=>p[1]));
 const nx=Math.ceil((Math.max(...boundary.map(p=>p[0]))-minx)/grid_mm),ny=Math.ceil((Math.max(...boundary.map(p=>p[1]))-miny)/grid_mm),n=nx*ny;
 const margin=radius_mm+grid_mm/Math.SQRT2,at=id=>[minx+(id%nx+.5)*grid_mm,miny+(Math.floor(id/nx)+.5)*grid_mm];
 const cell=p=>Math.floor((p[1]-miny)/grid_mm)*nx+Math.floor((p[0]-minx)/grid_mm);
 const capacity=new Float64Array(n),free=new Uint8Array(n);
 for(let id=0;id<n;id++){
  const p=at(id);if(!pointInPolygon(p,boundary))continue;
  let d=minEdgeDistance(p,boundary);
  for(const o of obstacles){if(pointInPolygon(p,o.polygon)){d=0;break;}d=Math.min(d,minEdgeDistance(p,o.polygon));}
  capacity[id]=d;if(d>margin)free[id]=1;
 }
 const s=cell(start),seen=new Uint8Array(n),parent=new Int32Array(n).fill(-1),queue=new Int32Array(n);
 let lo=0,hi=0;
 if(s>=0&&s<n&&free[s]){seen[s]=1;queue[hi++]=s;}
 while(lo<hi){
  const id=queue[lo++],x=id%nx,y=Math.floor(id/nx);
  for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){
   const xx=x+dx,yy=y+dy;if(xx<0||xx>=nx||yy<0||yy>=ny)continue;
   const next=yy*nx+xx;if(free[next]&&!seen[next]){seen[next]=1;parent[next]=id;queue[hi++]=next;}
  }
 }
 return goals.map(g=>{
  const target=cell(g.position),path=[];
  if(seen[target]){for(let id=target;id!==-1;id=parent[id]){path.push(at(id));if(id===s)break;}path.reverse();}
  const status=!free[s]||!free[target]?'ENDPOINT_BLOCKED':path.length?'MODEL_ROUTE_FOUND':'NO_MODEL_ROUTE';
  return {id:g.id,status,reason:!free[s]?'START_BLOCKED':!free[target]?'GOAL_BLOCKED':!path.length?'SAMPLED_REGION_DISCONNECTED':null,
   start,goal:g.position,endpoint_cell_centres:[at(s),at(target)],grid_mm,radius_mm,cell_safety_pad_mm:grid_mm/Math.SQRT2,
   route_mm:path,minimum_sampled_body_gap_mm:path.length?Math.min(...path.map(p=>capacity[cell(p)]-radius_mm)):null};
 });
}
export function auditPath(route,{boundary,obstacles}){
 if(route.status!=='MODEL_ROUTE_FOUND')return null;
 let min=Infinity,nearest=null,samples=0;
 for(let i=0;i<route.route_mm.length;i++){
  const a=route.route_mm[Math.max(0,i-1)],b=route.route_mm[i],count=Math.max(1,Math.ceil(distance(a,b)/5));
  for(let k=0;k<=count;k++){
   const p=a.map((v,j)=>v+(b[j]-v)*k/count);
   const checks=[['boundary',pointInPolygon(p,boundary)?minEdgeDistance(p,boundary):0],
    ...obstacles.map(o=>[o.id,pointInPolygon(p,o.polygon)?0:minEdgeDistance(p,o.polygon)])];
   for(const [id,gap] of checks)if(gap-route.radius_mm<min){min=gap-route.radius_mm;nearest=id;}
   samples++;
  }
 }
 return {status:min>0?'NO_DETECTED_SAMPLED_CONFLICT':'SAMPLED_CONFLICT',minimum_body_gap_mm:min,nearest_obstacle_id:nearest,samples};
}
