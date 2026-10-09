// Exact polygon-union boundary for canonical rooms and internal threshold strips.
import assert from 'node:assert/strict';
import {model} from '../circulation-v55/route-library.mjs';
import {pointInPolygon,rectangle,distancePointSegment,minEdgeDistance} from '../../studio/analysis/geometry.mjs';
const cross=(a,b)=>a[0]*b[1]-a[1]*b[0];
const sub=(a,b)=>a.map((v,i)=>v-b[i]);
const key=p=>p.map(v=>v.toFixed(6)).join(',');
const area=p=>p.reduce((s,a,i)=>{const b=p[(i+1)%p.length];return s+cross(a,b)/2;},0);
export function floorUnion(){
 const rooms=model.rooms.map(r=>({id:r.id,polygon:r.poly}));
 const thresholds=model.openings.filter(o=>!o.between.includes('EXTERIOR')).map(o=>({id:o.id,polygon:rectangle({
  cx:(o.from[0]+o.to[0])/2,cy:(o.from[1]+o.to[1])/2,w:o.length_mm,d:180,
  rot:Math.atan2(o.to[1]-o.from[1],o.to[0]-o.from[0])*180/Math.PI})}));
 const polygons=[...rooms,...thresholds].map(r=>r.polygon);
 const inside=p=>polygons.some(poly=>pointInPolygon(p,poly));
 const edges=polygons.flatMap(poly=>poly.map((a,i)=>({a,b:poly[(i+1)%poly.length]}))),boundary=new Map();
 for(const {a,b} of edges){
  const r=sub(b,a),rr=r[0]**2+r[1]**2,length=Math.sqrt(rr),cuts=[0,1];
  for(const {a:c,b:d} of edges){
   const s=sub(d,c),ca=sub(c,a),den=cross(r,s);
   if(Math.abs(den)>1e-7){
    const t=cross(ca,s)/den,u=cross(ca,r)/den;
    if(t>1e-10&&t<1-1e-10&&u>=-1e-10&&u<=1+1e-10)cuts.push(t);
   }else if(Math.abs(cross(ca,r))<1e-5){
    for(const p of [c,d]){const v=sub(p,a),t=(v[0]*r[0]+v[1]*r[1])/rr;if(t>1e-10&&t<1-1e-10)cuts.push(t);}
   }
  }
  const sorted=cuts.sort((a,b)=>a-b).filter((v,i,c)=>!i||v-c[i-1]>1e-10);
  for(let i=1;i<sorted.length;i++){
   const p=a.map((v,j)=>v+r[j]*sorted[i-1]),q=a.map((v,j)=>v+r[j]*sorted[i]),m=p.map((v,j)=>(v+q[j])/2);
   const normal=[-r[1]/length*.02,r[0]/length*.02],left=inside(m.map((v,j)=>v+normal[j])),right=inside(m.map((v,j)=>v-normal[j]));
   if(left===right)continue;
   const edge=left?[p,q]:[q,p];boundary.set(key(edge[0])+'>'+key(edge[1]),edge);
  }
 }
 const segments=[...boundary.values()],outgoing=new Map();
 for(const [a,b] of segments){assert.ok(!outgoing.has(key(a)),'Ambiguous floor boundary vertex.');outgoing.set(key(a),[a,b]);}
 const rings=[];
 while(outgoing.size){
  const first=outgoing.values().next().value[0],ring=[];let p=first;
  do {const edge=outgoing.get(key(p));assert.ok(edge,'Open floor-union boundary.');ring.push(edge[0]);outgoing.delete(key(p));p=edge[1];assert.ok(ring.length<=segments.length);}while(key(p)!==key(first));
  rings.push(ring);
 }
 const outers=rings.filter(r=>area(r)>0),holes=rings.filter(r=>area(r)<0);
 assert.equal(outers.length,1,'Whole-apartment floor must form one connected outer polygon.');
 return {rooms,thresholds,outer:outers[0],holes,segments,
  definition:'Union of canonical room polygons plus 180 mm internal opening strips. Strips bridge modeled threshold gaps; external openings are excluded. Wall solids remain obstacles. Internal glazing passages are assumed clear at their drawn full width.'};
}
export const insideFloor=(p,floor)=>[...floor.rooms,...floor.thresholds].some(o=>pointInPolygon(p,o.polygon));
export function floorGap(p,floor){
 if(!insideFloor(p,floor))return 0;
 return Math.min(...floor.segments.map(([a,b])=>distancePointSegment(p,a,b)));
}
const bounds=poly=>[Math.min(...poly.map(p=>p[0])),Math.min(...poly.map(p=>p[1])),Math.max(...poly.map(p=>p[0])),Math.max(...poly.map(p=>p[1]))];
export function sampleWholeFloor({floor,obstacles,start,goals,grid_mm=50,radius_mm=250}){
 const box=bounds(floor.outer),nx=Math.ceil((box[2]-box[0])/grid_mm),ny=Math.ceil((box[3]-box[1])/grid_mm),n=nx*ny;
 const at=id=>[box[0]+(id%nx+.5)*grid_mm,box[1]+(Math.floor(id/nx)+.5)*grid_mm];
 const cell=p=>Math.floor((p[1]-box[1])/grid_mm)*nx+Math.floor((p[0]-box[0])/grid_mm);
 const margin=radius_mm+grid_mm/Math.SQRT2,free=new Uint8Array(n),compiled=obstacles.map(o=>({...o,bounds:bounds(o.polygon)}));
 for(let id=0;id<n;id++){
  const p=at(id);if(!insideFloor(p,floor)||floorGap(p,floor)<margin)continue;
  if(compiled.some(o=>{
   const [x0,y0,x1,y1]=o.bounds;
   return p[0]>=x0-margin&&p[0]<=x1+margin&&p[1]>=y0-margin&&p[1]<=y1+margin&&
    (pointInPolygon(p,o.polygon)||minEdgeDistance(p,o.polygon)<=margin);
  }))continue;
  free[id]=1;
 }
 const s=cell(start),seen=new Uint8Array(n),parent=new Int32Array(n).fill(-1),queue=new Int32Array(n);let lo=0,hi=0;
 if(s>=0&&s<n&&free[s]){seen[s]=1;queue[hi++]=s;}
 while(lo<hi){const id=queue[lo++],x=id%nx,y=Math.floor(id/nx);
  for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){const xx=x+dx,yy=y+dy;if(xx<0||xx>=nx||yy<0||yy>=ny)continue;
   const next=yy*nx+xx;if(free[next]&&!seen[next]){seen[next]=1;parent[next]=id;queue[hi++]=next;}}
 }
 return goals.map(g=>{const t=cell(g.position),route_mm=[];
  if(seen[t]){for(let id=t;id!==-1;id=parent[id]){route_mm.push(at(id));if(id===s)break;}route_mm.reverse();}
  return {id:g.id,start,goal:g.position,grid_mm,radius_mm,cell_safety_pad_mm:grid_mm/Math.SQRT2,
   endpoint_cell_centres:[at(s),at(t)],status:!free[s]||!free[t]?'ENDPOINT_BLOCKED':route_mm.length?'MODEL_ROUTE_FOUND':'NO_MODEL_ROUTE',
   reason:!free[s]?'START_BLOCKED':!free[t]?'GOAL_BLOCKED':!route_mm.length?'SAMPLED_REGION_DISCONNECTED':null,route_mm};
 });
}
