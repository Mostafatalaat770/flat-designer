/** Four private rooms; source-locked reversible designs and actual operating envelopes. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
import {rectangle,relation,sweepLeaf,pointInPolygon,minEdgeDistance} from '../studio/analysis/geometry.mjs';
import {findPlanRoute} from '../studio/analysis/route.mjs';
export const dir='design-development/whole-home-m3/group2';
export const baseline='5fd6e9153e521f72a5c2a226a7aa3d90833b9fab';
export const sha=b=>createHash('sha256').update(b).digest('hex');
export const domain=createApartmentDomain(process.cwd());
export const source=JSON.parse(fs.readFileSync('render-snapshots/current.json'));
export const prepared=JSON.parse(fs.readFileSync('design-development/whole-home-m3/group2-preparation/SOURCE_BASELINE.json'));
export const rooms=['BR-02','BR-01','MBR-01','WIC-01'];
export const F=(s,id)=>s.layout.furniture.find(f=>f.id===id);
export const O=(s,id)=>s.layout.interior.objects.find(o=>o.id===id);
export const front=(f,p,w=f.w)=>{const a=(f.rot||0)*Math.PI/180;return rectangle({cx:f.cx-Math.sin(a)*(f.d/2+p/2),cy:f.cy+Math.cos(a)*(f.d/2+p/2),w,d:p,rot:f.rot});};
export const forward=f=>[-Math.sin((f.rot||0)*Math.PI/180),Math.cos((f.rot||0)*Math.PI/180)];
export const actor=(f,p,width=600,depth=600,offset=0)=>{
 const a=(f.rot||0)*Math.PI/180,n=forward(f),t=[Math.cos(a),Math.sin(a)];
 return rectangle({cx:f.cx+n[0]*(f.d/2+p+depth/2)+t[0]*offset,cy:f.cy+n[1]*(f.d/2+p+depth/2)+t[1]*offset,w:width,d:depth,rot:f.rot});
};
export const doors=domain.model.doors.map(d=>{let c=Math.atan2(d.c[1],d.c[0])*180/Math.PI,o=Math.atan2(d.o[1],d.o[0])*180/Math.PI;if(o-c>180)o-=360;if(c-o>180)o+=360;const sweep=sweepLeaf({hinge:d.h,length_mm:d.len,thickness_mm:40,closed_angle_deg:c,open_angle_deg:o,step_deg:2});return {...d,sweep,open:sweep.at(-1)};});
const optionProfile={
 B:{name:'Warm Japandi / daily study',wall:'#EAE7DD',wood:'#A18C70',dark:'#655744',cloth:'#D7D0C3',accent:'#64715A',curtain:'#DFDDD3',matTop:560,head:1080,desk:1100,wicDepth:650,wardFront:'sliding'},
 A:{name:'Organic Contemporary / guest flexibility',wall:'#F0E9E0',wood:'#BC9E7C',dark:'#7D6451',cloth:'#E4D6C5',accent:'#A57861',curtain:'#E8DFD3',matTop:570,head:1140,desk:900,wicDepth:600,wardFront:'hinged'}
};
export function prepareRuntime(){
 fs.mkdirSync(dir,{recursive:true});fs.mkdirSync('work/m3-group2',{recursive:true});
 fs.copyFileSync('dist/index.html','work/m3-group2/built-viewer.html');
 for(const folder of [dir+'/m3assets','dist/m3assets']){fs.mkdirSync(folder,{recursive:true});for(const n of ['A-wood.png','B-wood.png','A-stone.png','B-stone.png'])fs.copyFileSync('design-development/whole-home-m3/group1b/m3assets/'+n,folder+'/'+n);}
}
function addFurniture(s,f){assert.ok(!s.layout.furniture.some(x=>x.id===f.id));s.layout.furniture.push({...f,status:'EXPLORATORY',variant:'style'});}
export function candidate(key){
 const s=structuredClone(source);s.name='M3 Group2 '+key+' / not approved';s.group2_profile=key==='SOURCE'?null:{id:key,...optionProfile[key]};
 if(key!=='SOURCE'){
  const p=s.group2_profile;
  for(const f of s.layout.furniture.filter(f=>rooms.includes(f.room_id))){f.color=f.type==='bed'?p.cloth:f.type==='chair'||f.type==='officechair'?p.accent:f.type==='rug'?'#C7BDAE':p.wood;f.variant='style';if(f.type==='bed')delete f.product_reference_id;}
  for(const o of s.layout.interior.objects.filter(o=>rooms.includes(o.room_id)))if(o.type!=='artwork')o.colour=p.wood;
  for(const rid of rooms)s.layout.studio.rooms[rid].wall=p.wall;
  Object.assign(F(s,'starter-11'),key==='B'?{cx:5860,cy:2160,w:1100,d:580,rot:270}:{cx:5820,cy:2100,w:900,d:500,rot:270});
  Object.assign(F(s,'starter-12'),key==='B'?{cx:6490,cy:2020,w:580,d:580,rot:90}:{cx:6400,cy:2020,w:580,d:580,rot:90});
  Object.assign(F(s,'starter-10'),{cy:2990,w:key==='B'?1240:1280});
  if(key==='B')Object.assign(F(s,'starter-13'),{cx:8570,cy:4275,w:1200,d:600,rot:90});
  Object.assign(F(s,'starter-7'),{cx:5035,cy:3000,d:650});
  if(key==='B')F(s,'starter-6').cx+=225;
  if(key==='B')Object.assign(F(s,'starter-13'),{cx:8545,d:650});else Object.assign(F(s,'starter-13'),{cy:4589,d:600});
  Object.assign(F(s,'starter-8'),{cx:2380,cy:4310,w:1100,d:600,rot:270});
  Object.assign(F(s,'starter-9'),{type:'officechair',cx:3050,cy:4150,w:580,d:580,rot:90});
  Object.assign(O(s,'V7-bedroom1-drawers'),{cx:4150,cy:4710,width_mm:600,depth_mm:350,height_mm:800,rotation:180});
  Object.assign(F(s,'starter-1'),{cy:6800});Object.assign(F(s,'V5-master-rug'),{d:2800});
  Object.assign(F(s,'starter-2'),{cx:690,cy:5580});
  Object.assign(F(s,'starter-3'),{cx:690,cy:8020});
  Object.assign(O(s,'V7-master-drawers'),{cx:3590,width_mm:600});
  if(key==='B'){Object.assign(F(s,'starter-4'),{cy:6640,d:650});Object.assign(F(s,'starter-5'),{cy:8525,d:650});}
  addFurniture(s,{id:'M3G2-BR01-nightstand',type:'nightstand',name:'Open bedside shelf350 / no blind drawer promise',room_id:'BR-01',cx:key==='B'?3865:3640,cy:key==='B'?1935:2060,w:key==='B'?300:350,d:320,rot:270,color:p.wood});
  addFurniture(s,{id:'M3G2-BR02-nightstand',type:'nightstand',name:'Open bedside shelf300 / single guest bed',room_id:'BR-02',cx:8640,cy:2170,w:300,d:300,rot:90,color:p.wood});
  addFurniture(s,{id:'M3G2-BR01-rug',type:'rug',name:'Low-pile bedside rug / grip and edges HOLD',room_id:'BR-01',cx:3120,cy:2700,w:1800,d:2200,rot:0,color:'#C5BCAA'});
  addFurniture(s,{id:'M3G2-BR02-rug',type:'rug',name:'Low-pile guest bed rug / chair rolling clear',room_id:'BR-02',cx:7860,cy:2720,w:1800,d:2000,rot:90,color:'#C5BCAA'});
  Object.assign(O(s,'BR1-A1-art').placement,{host_wall_id:'WALL-BR-01-03',offset_mm:94.6,elevation_mm:1400});
  Object.assign(O(s,'MBR-A1-art'),{width_mm:500});Object.assign(O(s,'MBR-A1-art').placement,{offset_mm:1439.9});
  const mirror=structuredClone(source.layout.interior.objects.find(o=>o.id==='A1-entry-mirror'));Object.assign(mirror,{id:'M3G2-WIC-mirror',room_id:'WIC-01',variant:'rectangle',width_mm:350,depth_mm:25,height_mm:1500,colour:p.dark});mirror.placement={mode:'wall',host_wall_id:'WALL-WIC-01-01',offset_mm:369.1,inset_mm:5,elevation_mm:400};mirror.metadata={role:'Dressing mirror on dry return; neutral non-reflective render proxy / site humidity and anchorage HOLD'};s.layout.interior.objects.push(mirror);
  // These are furniture/soft-treatment hypotheses, never installed measurements.
  for(const [id,rid,host,width,height,offset,elevation]of [['M3G2-Master-art','MBR-01','WALL-MBR-01-01',1000,500,-179.7,1300],['M3G2-BR01-personal-art','BR-01','WALL-BR-01-02',700,350,key==='B'?129.7:-95.3,1400]]){const art=structuredClone(O(source,'MBR-A1-art'));Object.assign(art,{id,room_id:rid,width_mm:width,height_mm:height});art.placement={mode:'wall',host_wall_id:host,offset_mm:offset,elevation_mm:elevation,inset_mm:10};art.metadata={role:'Original artwork concept; anchorage and owner personal selection HOLD'};s.layout.interior.objects.push(art);}
  s.group2_soft_treatments={stack_location:'outside source jambs /90mm assumed finish offset',rooms:Object.fromEntries(['BR-01','BR-02','MBR-01'].map(rid=>[rid,{stack_span_mm:key==='A'&&rid==='BR-01'?300:150,left_stack_span_mm:rid==='MBR-01'?70:key==='A'&&rid==='BR-01'?300:150,right_stack_span_mm:key==='A'&&rid==='BR-01'?240:150,depth_mm:key==='A'&&rid==='BR-01'?250:150,blackout:'raised roller concept / closure and light leakage SITE HOLD'}]))};
  s.group2_joinery={wardrobes:Object.fromEntries(s.layout.furniture.filter(f=>rooms.includes(f.room_id)&&f.type==='wardrobe').map(f=>[f.id,{front:f.room_id==='WIC-01'?p.wardFront:key==='A'&&f.id==='starter-13'?'fabric':'sliding',height_mm:f.id==='starter-13'?2100:2250,drawer_projection_mm:f.room_id==='WIC-01'?350:key==='A'&&f.id==='starter-13'?0:300,back_mm:20,front_allowance_mm:key==='A'&&f.id==='starter-13'?20:(f.room_id==='WIC-01'?p.wardFront:'sliding')==='sliding'?55:25,garment_depth_assumption_mm:550}])),shoes_allocated:false,headboard_upholstered:true,matTop_mm:p.matTop,source_ids_preserved:true};
  // Explicit finish proposal only in these rooms; no shared material is recoloured.
  const floor=structuredClone(JSON.parse(fs.readFileSync('design-development/whole-home-m2/'+key+'.json')).layout.interior.materials.find(m=>m.id==='m2-wood'));
  floor.id='m3g2-wood';floor.albedo_texture='./m3assets/'+key+'-wood.png';s.layout.interior.materials.push(floor);
  for(const rid of rooms)s.layout.interior.surface_materials['FLOOR-'+rid]=floor.id;
  for(const id of ['GLZ-BR01-N','GLZ-BR02-N','GLZ-MBR-TER']){const t=s.layout.interior.opening_treatments[id];t.colour=p.curtain;}
 }
 s.scene_revision=domain.revision(s.layout);s.views=views(s);return s;
}
export const cameras=[
 {id:'BR02-entry',room:'BR-02',pos:[6630,4520],height:1650,target:[7460,2720],targetHeight:1050,fov:65},
 {id:'BR02-storage',room:'BR-02',pos:[6990,1940],height:1650,target:[7830,4350],targetHeight:1100,fov:65},
 {id:'BR01-entry',room:'BR-01',pos:[4650,4520],height:1650,target:[2990,2830],targetHeight:1100,fov:65},
 {id:'BR01-study',room:'BR-01',pos:[4160,2020],height:1650,target:[3050,4330],targetHeight:1050,fov:65},
 {id:'MBR-entry',room:'MBR-01',pos:[3510,6060],height:1650,target:[1570,6920],targetHeight:1100,fov:65},
 {id:'MBR-night-route',room:'MBR-01',pos:[3670,7930],height:1650,target:[1700,6330],targetHeight:1100,fov:65},
 {id:'WIC-south',room:'WIC-01',pos:[3500,7460],height:1450,target:[4740,8525],targetHeight:1125,fov:75},
 {id:'WIC-north',room:'WIC-01',pos:[3890,8080],height:1450,target:[4734,6640],targetHeight:1125,fov:75}
];
export function views(s){
 const base=structuredClone(source.views[0].camera),convert=(v,h)=>[(v[0]-domain.model.width_mm/2)/1000,h/1000,(v[1]-domain.model.depth_mm/2)/1000];
 return cameras.map(c=>({id:c.id,room_id:c.room,camera:{...structuredClone(base),position:convert(c.pos,c.height),target:convert(c.target,c.targetHeight),fov:c.fov,aspect:16/10,viewport:{width:1120,height:700}}}));
}
const bounds=p=>({xmin:Math.min(...p.map(x=>x[0])),xmax:Math.max(...p.map(x=>x[0])),ymin:Math.min(...p.map(x=>x[1])),ymax:Math.max(...p.map(x=>x[1]))});
export function curtains(s,rid,span,depth,matched=false){
 const id={'BR-01':'GLZ-BR01-N','BR-02':'GLZ-BR02-N','MBR-01':'GLZ-MBR-TER'}[rid];if(!id)return [];
 const o=domain.model.openings.find(o=>o.id===id),face=o.from[1]+90;
 const left=matched?s.group2_soft_treatments?.rooms[rid]?.left_stack_span_mm??span:span,right=matched?s.group2_soft_treatments?.rooms[rid]?.right_stack_span_mm??span:span;return [{cx:o.from[0]-left/2,w:left},{cx:o.to[0]+right/2,w:right}].map((c,i)=>({id:id+'-stack'+i,polygon:rectangle({cx:c.cx,cy:face+depth/2,w:c.w,d:depth}),span_mm:c.w,depth_mm:depth}));
}
export function solids(s,rid){
 return [...s.layout.furniture.filter(f=>f.room_id===rid&&!['rug','tv','chair','officechair'].includes(f.type)).map(f=>({id:f.id,type:f.type,polygon:rectangle(f),item:f})),...s.layout.interior.objects.filter(o=>o.room_id===rid&&o.placement.mode==='floor').map(o=>{const f=domain.resolveObject(o);return {id:o.id,type:o.type,polygon:rectangle(f),item:f};})];
}
function walls(rid){return domain.model.wall_segments.filter(w=>w.rooms.includes(rid)).map(w=>rectangle({cx:(w.from[0]+w.to[0])/2,cy:(w.from[1]+w.to[1])/2,w:Math.hypot(w.to[0]-w.from[0],w.to[1]-w.from[1]),d:w.thickness_mm,rot:Math.atan2(w.to[1]-w.from[1],w.to[0]-w.from[0])*180/Math.PI}));}
export function field(s,rid,grid=50){
 const room=domain.model.rooms.find(r=>r.id===rid).poly,b=bounds(room),nx=Math.ceil((b.xmax-b.xmin)/grid),ny=Math.ceil((b.ymax-b.ymin)/grid),n=nx*ny,points=Array.from({length:n},(_,i)=>[b.xmin+(i%nx+.5)*grid,b.ymin+(Math.floor(i/nx)+.5)*grid]),clearance=new Float64Array(n);
 for(let i=0;i<n;i++)clearance[i]=pointInPolygon(points[i],room)?minEdgeDistance(points[i],room):-1;
 const add=(dst,polys)=>{for(const p of polys){const bb=bounds(p);for(let id=0;id<n;id++){if(dst[id]<0)continue;const q=points[id],dx=Math.max(bb.xmin-q[0],q[0]-bb.xmax,0),dy=Math.max(bb.ymin-q[1],q[1]-bb.ymax,0);if(Math.hypot(dx,dy)>dst[id])continue;dst[id]=Math.min(dst[id],pointInPolygon(q,p)?-1:minEdgeDistance(q,p));}}};
 const relevantDoors=doors.filter(d=>domain.model.openings.find(o=>o.id===d.id).between.includes(rid)),span=s.group2_profile&&(s.group2_profile.id==='B'||rid!=='BR-01')?150:300,depth=s.group2_profile&&(s.group2_profile.id==='B'||rid!=='BR-01')?150:250;
 const staticPolys=[...solids(s,rid).map(x=>x.polygon),...walls(rid),...relevantDoors.map(d=>d.open),...curtains(s,rid,span,depth,true).map(x=>x.polygon)];add(clearance,staticPolys);
 return {room,grid,n,nx,ny,points,clearance,add,staticPolys,toId:p=>Math.floor((p[1]-b.ymin)/grid)*nx+Math.floor((p[0]-b.xmin)/grid)};
}
export function route(f,polys,start,goal,diam){
 const dst=new Float64Array(f.clearance);f.add(dst,polys);const margin=diam/2+Math.SQRT2*f.grid/2,si=f.toId(start),gi=f.toId(goal),free=i=>i>=0&&i<f.n&&dst[i]>margin,parent=new Int32Array(f.n).fill(-1),seen=new Uint8Array(f.n),queue=new Int32Array(f.n);let lo=0,hi=0;
 if(!free(si)||!free(gi))return {status:'NO_MODEL_ROUTE',reason:!free(si)?'START_BLOCKED':'GOAL_BLOCKED',route_mm:[],envelope_mm:diam,grid_mm:f.grid};
 queue[hi++]=si;seen[si]=1;while(lo<hi){const id=queue[lo++];if(id===gi)break;const x=id%f.nx,y=Math.floor(id/f.nx);for(const nxt of [x+1<f.nx?id+1:-1,x>0?id-1:-1,y+1<f.ny?id+f.nx:-1,y>0?id-f.nx:-1])if(free(nxt)&&!seen[nxt]){seen[nxt]=1;parent[nxt]=id;queue[hi++]=nxt;}}
 if(!seen[gi])return {status:'NO_MODEL_ROUTE',reason:'DISCONNECTED',route_mm:[],envelope_mm:diam,grid_mm:f.grid};
 const ids=[];for(let i=gi;i>=0;i=parent[i]){ids.push(i);if(i===si)break;}ids.reverse();return {status:'MODEL_ROUTE_FOUND',route_mm:ids.map(i=>f.points[i]),distance_mm:(ids.length-1)*f.grid,envelope_mm:diam,grid_mm:f.grid};
}
export const destinations={
 'BR-02':{start:[6500,4500],bed:[7750,3970],desk:[6270,3250],glazing:[7900,1900]},
 'BR-01':{start:[4800,4500],bed:[3990,3190],desk:[3790,4040],glazing:[4400,1960]},
 'MBR-01':{start:[3520,6150],bed:[3080,6840],wic:[3500,7940],terrace:[1260,5500]},
 'WIC-01':{start:[4450,7800],bath:[5070,7650],north:[4740,7300],south:[4740,7900]}
};
export function pointsFor(s,rid){const p=structuredClone(destinations[rid]);if(rid==='BR-02'){const bed=F(s,'starter-10'),ward=F(s,'starter-13'),foot=bed.cy+bed.w/2;p.bed=[7750,ward.rot===90?foot+400:(foot+ward.cy-ward.d/2)/2];}return p;}
export function operating(s,rid,pull=0,drawer=0,cabinet=null,offset=0,second=null){
 const chairs=s.layout.furniture.filter(f=>f.room_id===rid&&['chair','officechair'].includes(f.type)).map(f=>{const n=forward(f);return {...f,cx:f.cx-n[0]*pull,cy:f.cy-n[1]*pull};});
 const seated=chairs.map(f=>{const n=forward(f);return {id:'seated-'+f.id,polygon:rectangle({cx:f.cx+n[0]*100,cy:f.cy+n[1]*100,w:650,d:350,rot:f.rot})};});
 const use=[];for(const c of [cabinet,second].filter(Boolean)){if(drawer>0)use.push({id:'open-'+c.id,polygon:front(c,drawer)});use.push({id:'user-'+c.id,polygon:actor(c,drawer,600,600,offset)});}
 const cs=solids(s,rid),collisions=[];for(const a of [...chairs.map(f=>({id:'chair-body-'+f.id,polygon:rectangle(f)})),...seated])for(const b of cs){const r=relation(a.polygon,b.polygon);if(r.intersects_positive_area)collisions.push({a:a.id,b:b.id,area_mm2:r.overlap_area_mm2});}for(const a of use.filter(x=>x.id.startsWith('open')))for(const b of [...cs,...chairs.map(f=>({id:f.id,polygon:rectangle(f)})),...seated]){const r=relation(a.polygon,b.polygon);if(r.intersects_positive_area)collisions.push({a:a.id,b:b.id,area_mm2:r.overlap_area_mm2});}for(const a of use.filter(x=>x.id.startsWith('user'))){for(const b of [...cs,...chairs.map(f=>({id:f.id,polygon:rectangle(f)})),...seated,...use.filter(x=>x.id.startsWith('open')&&!x.id.endsWith(a.id.slice(5)))]){const r=relation(a.polygon,b.polygon);if(r.intersects_positive_area)collisions.push({a:a.id,b:b.id,area_mm2:r.overlap_area_mm2});}}
 for(let i=0;i<use.length;i++)if(use[i].id.startsWith('user'))for(const b of use.slice(i+1).filter(x=>x.id.startsWith('user'))){const r=relation(use[i].polygon,b.polygon);if(r.intersects_positive_area)collisions.push({a:use[i].id,b:b.id,area_mm2:r.overlap_area_mm2});}
 return {chairs,seated,use,collisions,obstacles:[...chairs.map(rectangle),...seated.map(x=>x.polygon),...use.map(x=>x.polygon)]};
}
export function audit(s,rid){
 const f=field(s,rid),points=pointsFor(s,rid),start=points.start,goals=Object.entries(points).filter(([k])=>k!=='start'),states=[],questions=[];
 const record=(id,pull,drawer,cabinet=null,offset=0,second=null)=>{const st=operating(s,rid,pull,drawer,cabinet,offset,second);states.push({id,pull_mm:pull,opening_mm:drawer,cabinet: cabinet?.id,offset_mm:offset,collisions:st.collisions,chairs:st.chairs,use:st.use,seated:st.seated});for(const diam of [500,700])for(const [name,goal]of goals)questions.push({state:id,goal:name,...route(f,st.obstacles,start,goal,diam)});return st;};
 for(const pull of [0,300,450])record('chair-'+pull,pull,0);
 const wardrobes=s.layout.furniture.filter(x=>x.room_id===rid&&x.type==='wardrobe');
 for(const w of wardrobes)for(const p of [0,300,450,600])for(const off of [-w.w/2+300,0,w.w/2-300])record(w.id+'-open'+p+'-bay'+off,0,p,w,off);
 for(const w of wardrobes)for(const p of [0,300,450])record(w.id+'-chair450-open'+p,450,p,w);
 for(const chest of solids(s,rid).filter(x=>x.type==='sideboard'))for(const p of [300,500])record(chest.id+'-drawer'+p,0,p,chest.item);
 if(rid==='WIC-01')for(const p of [0,300,450])record('two-users-open'+p,0,p,wardrobes[0],0,wardrobes[1]);
 const typical=operating(s,rid,0,0),sample=route(f,typical.obstacles,start,goals[0][1],500),ordinary=findPlanRoute({room:f.room,start,goal:goals[0][1],obstacles:[...f.staticPolys,...typical.obstacles],agent_radius_mm:250,grid_mm:50,max_cells:60000});
 assert.equal(sample.status==='MODEL_ROUTE_FOUND',ordinary.status==='MODEL_ROUTE_FOUND');
 const sweepChecks=doors.filter(d=>domain.model.openings.find(o=>o.id===d.id).between.includes(rid)).flatMap(d=>solids(s,rid).map(q=>({door:d.id,id:q.id,positive_overlap_samples:d.sweep.filter(p=>relation(p,q.polygon).intersects_positive_area).length,gap_at_open_mm:relation(d.open,q.polygon).gap_mm})));
 const curtainSensitivity=[];for(const span of [150,300,450])for(const depth of [150,250,350])curtainSensitivity.push({span_mm:span,depth_mm:depth,finish_face_conflicts:curtains(s,rid,span,depth).filter(c=>{const r=domain.model.rooms.find(x=>x.id===rid).poly,b=bounds(r);return c.polygon.some(p=>p[0]<b.xmin+90||p[0]>b.xmax-90||p[1]<b.ymin+90||p[1]>b.ymax-90);}).map(x=>x.id),collisions:curtains(s,rid,span,depth).flatMap(c=>solids(s,rid).filter(x=>relation(c.polygon,x.polygon).intersects_positive_area).map(x=>({curtain:c.id,item:x.id})))});
 return {schema:'M3Group2Operation/1',room:rid,profile:s.group2_profile?.id||'SOURCE',source_sha256:sha(fs.readFileSync('render-snapshots/current.json')),endpoints:points,states,questions,door_sweeps:sweepChecks,curtainSensitivity,solver_crosscheck:{result:'MATCH',status:sample.status},limitations:'2D circular-envelope paths from INSIDE each room. Seated650x350, standing600x600,50mm grid+35.36mm radial allowance; no physical thresholds, articulated bodies, code, manufacturer or comfort validation.'};
}
function dimensionFacts(s){
 const bed=id=>{const f=F(s,id),rid=f.room_id,room=domain.model.rooms.find(r=>r.id===rid),b=bounds(rectangle(f)),rb=bounds(room.poly);return {id,frame_mm:[f.w,f.d],mattress_mm:id==='starter-1'?[1800,2000]:[1200,2000],assumed_face_bands_mm:{west:b.xmin-(rb.xmin+90),east:rb.xmax-90-b.xmax,north:b.ymin-(rb.ymin+90),south:rb.ymax-90-b.ymax},mattress_height_mm:s.group2_profile?.matTop||null,not_surveyed:true};};
 return {beds:['starter-1','starter-6','starter-10'].map(bed),wic_aisle_mm:(F(s,'starter-5').cy-F(s,'starter-5').d/2)-(F(s,'starter-4').cy+F(s,'starter-4').d/2),BR02_table_mm:[F(s,'starter-11').w,F(s,'starter-11').d],BR02_wardrobe_width_relative_to_source:F(s,'starter-13').w/1600,master_chest_inner_width_relative_to_source:(O(s,'V7-master-drawers').width_mm-40)/960,BR01_chest_inner_width_relative_to_source:(O(s,'V7-bedroom1-drawers').width_mm-40)/960};
}
if(process.argv[1]?.endsWith('build-whole-home-m3-group2.mjs')){
 prepareRuntime();const design={schema:'M3Group2/1',baseline_head:baseline,source_sha256:sha(fs.readFileSync('render-snapshots/current.json')),canonical_sha256:source.canonical_sha256,owner_inventory:'NOT_PROVIDED; every clothing/shoe quantity conditional',approvals:{owner:false,construction:false,procurement:false,cloud_save:false},options:[],group1_holds_sha256:sha(fs.readFileSync('design-development/whole-home-m3/group1b/SITE_HOLDS.json'))};
 for(const k of ['SOURCE','B','A']){const s=candidate(k);fs.writeFileSync(dir+'/'+k+'.json',JSON.stringify(s,null,2)+'\n');let validation;try{validation=domain.validate(s.layout);}catch(e){validation=e.validation;if(!validation)throw e;}const option={id:k,scene:s.scene_revision,facts:dimensionFacts(s),validation:{summary:validation.summary,failures:validation.checks.filter(c=>c.status==='FAIL')},rooms:[]};for(const rid of rooms){const a=audit(s,rid);fs.writeFileSync(dir+'/AUDIT-'+k+'-'+rid+'.json',JSON.stringify(a,null,2)+'\n');option.rooms.push({id:rid,typical_routes:a.questions.filter(q=>q.state==='chair-0').map(({route_mm,...q})=>q),operating_collisions:a.states.filter(st=>st.collisions.length).map(st=>({id:st.id,collisions:st.collisions})),door_collisions:a.door_sweeps.filter(x=>x.positive_overlap_samples>0)});}design.options.push(option);console.log(k,JSON.stringify({facts:option.facts,failures:option.validation.failures,rooms:option.rooms.map(r=>({id:r.id,typical:r.typical_routes.map(q=>[q.envelope_mm,q.goal,q.status]),door:r.door_collisions,collision_states:r.operating_collisions.map(s=>s.id)}))}));}
 fs.writeFileSync(dir+'/DESIGN.json',JSON.stringify(design,null,2)+'\n');
}
