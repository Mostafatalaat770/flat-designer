/**
 * Conservative GRID route sampling. A cell is walkable ONLY when a whole
 * assumed circular person (plus cell half-diagonal) fits within room and does
 * not hit any solid furniture/occupied actor/door polygon.
 * This detects NO route in the model, not legal code or physical accessibility.
 */
import {pointInPolygon,minEdgeDistance,polygonGap,rectangle} from './geometry.mjs';
import assert from 'node:assert/strict';

export function findPlanRoute({room,obstacles=[],start,goal,agent_radius_mm=250,grid_mm=50,max_cells=25000}){
 for(const [name,value] of Object.entries({agent_radius_mm,grid_mm,max_cells}))
  if(!Number.isFinite(value)||value<=0)throw new Error('Invalid '+name);
 if(!(grid_mm>=20&&grid_mm<=150))throw new Error('grid_mm must be 20–150mm to bound rounding error');
 if(!Array.isArray(room)||room.length<3)throw new Error('Missing room polygon');
 if(!Array.isArray(obstacles)||obstacles.some(o=>!Array.isArray(o)||o.length<3))
  throw new Error('Obstacles must be polygons (body rectangles should call rectangle(item))');
 const minx=Math.min(...room.map(x=>x[0])),maxx=Math.max(...room.map(x=>x[0]));
 const miny=Math.min(...room.map(x=>x[1])),maxy=Math.max(...room.map(x=>x[1]));
 const nx=Math.ceil((maxx-minx)/grid_mm),ny=Math.ceil((maxy-miny)/grid_mm);
 if(nx*ny>max_cells)throw new Error('Route domain exceeds max_cells; reduce resolution or split room');
 const margin=agent_radius_mm+Math.SQRT2*grid_mm/2;
 const at=(i,j)=>[minx+(i+.5)*grid_mm,miny+(j+.5)*grid_mm];
 const toGrid=p=>[Math.floor((p[0]-minx)/grid_mm),Math.floor((p[1]-miny)/grid_mm)];
 const inside=(i,j)=>i>=0&&j>=0&&i<nx&&j<ny;
 const free=new Uint8Array(nx*ny);
 const index=(i,j)=>j*nx+i;
 for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
  const centre=at(i,j);
  if(!pointInPolygon(centre,room)||minEdgeDistance(centre,room)<margin)continue;
  if(obstacles.some(o=>pointInPolygon(centre,o)||minEdgeDistance(centre,o)<=margin))continue;
  free[index(i,j)]=1;
 }
 const [si,sj]=toGrid(start),[gi,gj]=toGrid(goal);
 const endpoint=(i,j,name)=>{
  if(!inside(i,j))return name+'_OUTSIDE_GRID';
  if(!pointInPolygon(at(i,j),room))return name+'_OUTSIDE_ROOM';
  if(free[index(i,j)]!==1)return name+'_BLOCKED';
  return null;
 };
 const a=endpoint(si,sj,'START'),b=endpoint(gi,gj,'GOAL');
 const evidence={schema:'ApartmentRouteEstimate/1',
  status:(a||b)?'ENDPOINT_BLOCKED':'UNKNOWN',
  reason:a||b||null,
  parameters:{radius_mm:agent_radius_mm,grid_mm,cell_safety_pad_mm:+(margin-agent_radius_mm).toFixed(3),
    sample_count:nx*ny,obstacle_count:obstacles.length},
  constraints:'Conservative 2D circular-agent centre route through fixed polygons. No wheelchair, tray, door kinematics, posture, code or as-built certification.',
  route_mm:[],distance_mm:null};
 if(a||b)return evidence;
 const startId=index(si,sj),goalId=index(gi,gj);
 const parent=new Int32Array(nx*ny).fill(-1);
 const seen=new Uint8Array(nx*ny);
 const queue=new Int32Array(nx*ny);
 let lo=0,hi=1;queue[0]=startId;seen[startId]=1;
 const moves=[[1,0],[0,1],[-1,0],[0,-1]];
 while(lo<hi){
  const id=queue[lo++];if(id===goalId)break;
  const i=id%nx,j=Math.floor(id/nx);
  for(const [di,dj] of moves){
   const ii=i+di,jj=j+dj;if(!inside(ii,jj))continue;
   const next=index(ii,jj);
   if(free[next]&&!seen[next]){seen[next]=1;parent[next]=id;queue[hi++]=next;}
  }
 }
 if(!seen[goalId])return {...evidence,status:'NO_MODEL_ROUTE',reason:'SAMPLED_REGION_DISCONNECTED'};
 const reverse=[];let id=goalId;
 for(let safety=0;id!==-1&&safety<nx*ny;safety++){reverse.push(at(id%nx,Math.floor(id/nx)));if(id===startId)break;id=parent[id];}
 assert.deepEqual(reverse.at(-1),at(si,sj),'Broken parent chain');
 const route=reverse.reverse();
 return {...evidence,status:'MODEL_ROUTE_FOUND',reason:null,route_mm:route,
  distance_mm:Math.round((route.length-1)*grid_mm),
  caution:'A route being found is only evidence for the chosen conservative discrete circular envelope and nominal obstacles, not a safe physical route.'};
}
/**
 * For each instant/stage, evaluate an independent route with its occupied set.
 * The user must explicitly encode open door/occupied chairs in the named stage.
 */
export function checkActivityStages({room,stages,agent_radius_mm=250,grid_mm=50}){
 if(!Array.isArray(stages)||!stages.length)throw new Error('Missing named activity stages');
 const ids=new Set();
 return stages.map(s=>{
  assert.ok(typeof s.id==='string'&&s.id.length&& !ids.has(s.id),'Unique stage IDs required');
  ids.add(s.id);
  const polygons=s.obstacles.map(x=>{
   if(x.polygon)return x.polygon;
   if(x.furniture)return rectangle(x.furniture);
   throw new Error('Activity obstacle needs exact polygon or furniture: '+s.id);
  });
  const route=findPlanRoute({room,start:s.start,goal:s.goal,obstacles:polygons,agent_radius_mm,grid_mm});
  return {stage:s.id,source_ids:s.obstacles.map(x=>x.id),...route};
 });
}
