import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../../studio/domain/apartment.mjs';
import {rectangle,pointInPolygon,minEdgeDistance,relation,hingeLeaf,sweepLeaf,sweepRelation} from '../../studio/analysis/geometry.mjs';
import {findPlanRoute} from '../../studio/analysis/route.mjs';

const root=path.resolve(import.meta.dirname,'../..'), work=import.meta.dirname;
const saved=JSON.parse(fs.readFileSync(work+'/saved-v55.json'));
const source=JSON.parse(fs.readFileSync(root+'/render-snapshots/current.json'));
const domain=createApartmentDomain(root), model=domain.model;
assert.equal(saved.scene_revision,domain.revision(saved.layout));
assert.equal(source.scene_revision,domain.revision(source.layout));
assert.equal(saved.cloud.storage_revision,55);
const originalLayout=JSON.stringify(source.layout);
const room=id=>model.rooms.find(r=>r.id===id);
const opening=id=>model.openings.find(o=>o.id===id);
function approach(id,roomId,inset=600){
 const o=opening(id),r=room(roomId),mid=[(o.from[0]+o.to[0])/2,(o.from[1]+o.to[1])/2];
 const len=o.length_mm, t=[(o.to[0]-o.from[0])/len,(o.to[1]-o.from[1])/len];
 let n=[-t[1],t[0]];if(!pointInPolygon([mid[0]+n[0]*250,mid[1]+n[1]*250],r.poly))n=n.map(v=>-v);
 return mid.map((v,i)=>v+inset*n[i]);
}
function resolved(layout){return [...layout.furniture.filter(f=>f.type!=='rug').map(f=>({...f,bottom_mm:0,top_mm:1800})),...layout.interior.objects.map(o=>domain.resolveObject(o))];}
function obstacles(layout,roomId,{skip=[],extra=[],doors=true}={}){
 const items=resolved(layout).filter(f=>f.room_id===roomId&&!skip.includes(f.id)&&f.bottom_mm<1800&&f.top_mm>100);
 // The ensuite walk-in rectangle is a floor reserve, not a solid cubicle. Its fixed glass remains an obstacle.
 const bodies=items.filter(f=>!(f.id==='BATHM-WALKIN-A1')).map(f=>({id:f.id,polygon:rectangle(f),item:f}));
 const walls=model.wall_segments.filter(w=>w.rooms.includes(roomId)).map((w,i)=>({id:'wall-'+i,polygon:rectangle({cx:(w.from[0]+w.to[0])/2,cy:(w.from[1]+w.to[1])/2,w:Math.hypot(w.to[0]-w.from[0],w.to[1]-w.from[1]),d:w.thickness_mm,rot:Math.atan2(w.to[1]-w.from[1],w.to[0]-w.from[0])*180/Math.PI})}));
 const leaves=doors?model.doors.filter(d=>opening(d.id).between.includes(roomId)).map(d=>({id:(doors==='closed'?'closed-leaf-':'open-leaf-')+d.id,polygon:hingeLeaf({hinge:d.h,length_mm:d.len,thickness_mm:18,angle_deg:Math.atan2((doors==='closed'?d.c:d.o)[1],(doors==='closed'?d.c:d.o)[0])*180/Math.PI})})):[];
 return [...bodies,...walls,...leaves,...extra.map(f=>({id:f.id,polygon:rectangle(f),item:f}))];
}
// Cache the grid clearance field, then search for the widest sampled path.
// Every radius uses a half-cell diagonal safety pad, including the displayed 180 mm wall bodies.
const grids=new Map();
function gridFor(roomId,obs,step){
 const r=room(roomId), key=JSON.stringify([roomId,step,obs]);if(grids.has(key))return grids.get(key);
 const minx=Math.min(...r.poly.map(p=>p[0])),miny=Math.min(...r.poly.map(p=>p[1]));
 const nx=Math.ceil((Math.max(...r.poly.map(p=>p[0]))-minx)/step),ny=Math.ceil((Math.max(...r.poly.map(p=>p[1]))-miny)/step);
 const at=id=>[minx+(id%nx+.5)*step,miny+(Math.floor(id/nx)+.5)*step];
 const capacity=new Float64Array(nx*ny),pad=step/Math.SQRT2;
 for(let id=0;id<capacity.length;id++){
  const p=at(id);if(!pointInPolygon(p,r.poly))continue;
  let clearance=minEdgeDistance(p,r.poly);
  for(const o of obs){if(pointInPolygon(p,o.polygon)){clearance=0;break;}clearance=Math.min(clearance,minEdgeDistance(p,o.polygon));}
  capacity[id]=Math.max(0,clearance-pad);
 }
 const g={nx,ny,minx,miny,step,at,capacity,pad};grids.set(key,g);return g;
}
function route(caseFile,layout=source.layout,step=50){
 const obs=obstacles(layout,caseFile.room_id,caseFile),g=gridFor(caseFile.room_id,obs,step),{nx,ny,capacity,at}=g;
 const cell=p=>Math.floor((p[1]-g.miny)/step)*nx+Math.floor((p[0]-g.minx)/step);
 const s=cell(caseFile.start),t=cell(caseFile.goal);
 assert.ok(s>=0&&s<capacity.length&&t>=0&&t<capacity.length,'Endpoint outside '+caseFile.id);
 const best=new Float64Array(capacity.length).fill(-1),parent=new Int32Array(capacity.length).fill(-1),heap=[];
 const push=(id,value)=>{let i=heap.length;heap.push({id,value});while(i){const p=(i-1)>>1;if(heap[p].value>=value)break;heap[i]=heap[p];i=p;}heap[i]={id,value};};
 const pop=()=>{const out=heap[0],last=heap.pop();if(heap.length){let i=0;while(i*2+1<heap.length){let c=i*2+1;if(c+1<heap.length&&heap[c+1].value>heap[c].value)c++;if(heap[c].value<=last.value)break;heap[i]=heap[c];i=c;}heap[i]=last;}return out;};
 best[s]=capacity[s];push(s,best[s]);
 while(heap.length){const {id,value}=pop();if(value!==best[id])continue;if(id===t)break;
  const x=id%nx,y=Math.floor(id/nx);
  for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){const xx=x+dx,yy=y+dy;if(xx<0||xx>=nx||yy<0||yy>=ny)continue;const next=yy*nx+xx,newValue=Math.min(value,capacity[next]);if(newValue>best[next]){best[next]=newValue;parent[next]=id;push(next,newValue);}}
 }
 const path=[];if(best[t]>0){let id=t;for(let n=0;id!==-1&&n<capacity.length;n++){path.push(at(id));if(id===s)break;id=parent[id];}path.reverse();}
 const width=Math.max(0,Math.floor(2*best[t]));
 return {...caseFile,grid_mm:step,cell_safety_pad_mm:g.pad,assumed_circle_diameter_mm:500,route_found_500mm:width>=500,conservative_sampled_diameter_mm:width,endpoint_cell_centres:[at(s),at(t)],route_mm:path,obstacle_ids:obs.map(o=>o.id),obs};
}

export {source,domain,model,route,obstacles,approach,resolved,room};
