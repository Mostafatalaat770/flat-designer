/** Source-locked M3 1B: operation tests and two bounded furniture proposals. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {domain,source,F,O,sha} from './build-whole-home-m3-group1.mjs';
import {rectangle,relation,sweepLeaf,sweepRelation,pointInPolygon,minEdgeDistance} from '../studio/analysis/geometry.mjs';
import {findPlanRoute} from '../studio/analysis/route.mjs';
import {CHAIR_IDS,chairState} from '../studio/analysis/reception-sprint.mjs';
export {domain,source,F,O,sha};
export const dir='design-development/whole-home-m3/group1b';
export const baseline='673708eaeec8f2f036a2941a3412e67a9eff7d07';
export const keys=['B','A','B1','B2'];
/** Prepare only local capture inputs; never overwrite an inherited snapshot. */
export function prepareRuntime(){
 fs.mkdirSync('work/m3-session',{recursive:true});
 fs.copyFileSync('dist/index.html','work/m3-session/built-viewer.html');
 fs.mkdirSync('dist/m3assets',{recursive:true});
 fs.mkdirSync(dir+'/m3assets',{recursive:true});
 for(const name of ['A-wood.png','B-wood.png','A-stone.png','B-stone.png']){
  const original='design-development/whole-home-m3/group1/m3assets/'+name;
  fs.copyFileSync(original,'dist/m3assets/'+name);
  fs.copyFileSync(original,dir+'/m3assets/'+name);
 }
}
const load=k=>JSON.parse(fs.readFileSync(`design-development/whole-home-m3/group1/${k}.json`));
export const front=(f,p,w=f.w)=>{const a=(f.rot||0)*Math.PI/180;return rectangle({cx:f.cx-Math.sin(a)*(f.d/2+p/2),cy:f.cy+Math.cos(a)*(f.d/2+p/2),w,d:p,rot:f.rot});};
export const actor=(f,p,offset=0)=>{const a=(f.rot||0)*Math.PI/180;return front({...f,cx:f.cx+Math.cos(a)*offset,cy:f.cy+Math.sin(a)*offset,d:f.d+2*p},600,600);};
export const doors=domain.model.doors.map(d=>{let c=Math.atan2(d.c[1],d.c[0])*180/Math.PI,o=Math.atan2(d.o[1],d.o[0])*180/Math.PI;if(o-c>180)o-=360;if(c-o>180)o+=360;const sweep=sweepLeaf({hinge:d.h,length_mm:d.len,thickness_mm:40,closed_angle_deg:c,open_angle_deg:o,step_deg:2});return {...d,sweep,open:sweep.at(-1)};});
const room=domain.model.rooms.find(r=>r.id==='RECP-01').poly;
const bounds=p=>({xmin:Math.min(...p.map(x=>x[0])),xmax:Math.max(...p.map(x=>x[0])),ymin:Math.min(...p.map(x=>x[1])),ymax:Math.max(...p.map(x=>x[1]))});
function reviewViews(s){const v=structuredClone(s.views[0]);v.id='entry-storage';v.camera.fov=72;v.camera.position=[(13150-domain.model.width_mm/2)/1000,1.55,(9300-domain.model.depth_mm/2)/1000];v.camera.target=[(14700-domain.model.width_mm/2)/1000,1.05,(9550-domain.model.depth_mm/2)/1000];s.views.push(v);return s;}
export function candidate(k){
 if(['B','A'].includes(k))return reviewViews(load(k));
 const s=load('B');s.name=`M3 1B ${k} / unapproved reversible proposal`;
 s.m3b_profile={id:k,sofa_arm_mm:160,armchair_arm_mm:120,table_supports:'two 60×600 timber blades at ±350mm; no low apron; structural design HOLD',shoe_height_mm:k==='B2'?800:780,shoe_front:k==='B2'?'sliding flat shelves; zero forward panel sweep':'retained tilt-bin envelope; unknown hardware projection'};
 for(const f of s.layout.furniture.filter(f=>f.id==='starter-35'||CHAIR_IDS.includes(f.id)))f.cy-=450;
 O(s,'A-dining-pendant').cy-=450;
 Object.assign(O(s,'A-dining-sideboard'),{cy:3925,width_mm:1250,metadata:{role:'Compact dining-only cabinet, 1250×400×800; capacity loss explicit'}});
 O(s,'V5-sideboard-lamp').cy=4325;
 O(s,'M3-buffet-art').placement.offset_mm=3925-(2732.588+10231.317)/2;
 Object.assign(O(s,'A2-living-plant'),{cx:13300,cy:4300});
 Object.assign(F(s,'starter-32'),{w:850,d:850,cy:4350,name:'Supported lounge chair 850×850 / design proxy, seat trial HOLD'});
 Object.assign(F(s,'starter-31'),{cx:12200,rot:78,name:'Source1230mm TV /12° angled study / actual swivel fixing HOLD'});
 if(k==='B2'){
  Object.assign(F(s,'starter-40'),{cx:15755,cy:9050,w:600,d:350,rot:90,name:'600×350×800 sliding flat-shelf shoe prototype / ~4 daily pairs, no SKU'});
  O(s,'A1-entry-mirror').placement.host_wall_id='WALL-RECP-01-18';
  O(s,'A1-entry-mirror').placement.offset_mm=9050-(2732.588+10231.317)/2;
 }
 s.scene_revision=domain.revision(s.layout);return reviewViews(s);
}
export function curtainEnvelopes(s,span=450,depth=350,extension='outside'){
 return ['GLZ-RECP-N','GLZ-RECP-TERMAIN'].flatMap(id=>{
  const op=domain.model.openings.find(o=>o.id===id),face=op.from[1]+90,x0=op.from[0],x1=op.to[0];
  return ['left','right'].map(end=>{const x=end==='left'?(extension==='outside'?x0-span/2:x0+span/2):(extension==='outside'?x1+span/2:x1-span/2);return {id:id+'-'+end,opening_id:id,end,span_mm:span,projection_mm:depth,placement:extension,polygon:rectangle({cx:x,cy:face+depth/2,w:span,d:depth}),assumption:'Compressed fabric study envelope, not measured product; wall half-width 90mm inferred'};});
 });
}
const withPoly=(id,p)=>({id,polygon:p});
const collide=(a,b)=>{const r=relation(a.polygon,b.polygon);return r.intersects_positive_area?{a:a.id,b:b.id,overlap_area_mm2:r.overlap_area_mm2}:null;};
export function operationalState(s,pull,p,standing=[],buffetUse=true){
 const shoes=F(s,'starter-40'),buffet=domain.resolveObject(O(s,'A-dining-sideboard')),chairs=chairState(s,pull);
 const standingPolys=standing.map(id=>{const f=chairs.find(x=>x.id===id),v=[-Math.sin(f.rot*Math.PI/180),Math.cos(f.rot*Math.PI/180)];return withPoly('standing-'+id,rectangle({cx:f.cx-v[0]*(f.d/2+300),cy:f.cy-v[1]*(f.d/2+300),w:600,d:600,rot:f.rot}));});
 const use=[withPoly('shoe-user',actor(shoes,p)),...(p>0?[withPoly('shoe-panel',front(shoes,p))]:[]),...(buffetUse?[withPoly('buffet-panel',front(buffet,500)),withPoly('buffet-south-user',actor(buffet,500,buffet.w/2-300))]:[])];
 const solids=[withPoly('shoe-cabinet',rectangle(shoes)),withPoly('buffet',rectangle(buffet)),...chairs.map(f=>withPoly(f.id,rectangle(f)))];
 const collisions=[];
 for(const a of [...standingPolys,...use.filter(x=>x.id.endsWith('user'))])for(const b of [...solids,...use.filter(x=>x.id.endsWith('panel'))]){const c=collide(a,b);if(c)collisions.push(c);}
 for(let i=0;i<standingPolys.length;i++)for(const b of [...standingPolys.slice(i+1),...use.filter(x=>x.id.endsWith('user'))]){const c=collide(standingPolys[i],b);if(c)collisions.push(c);}
 const occupied=chairs.filter(f=>!standing.includes(f.id)).map(f=>{const r=f.rot*Math.PI/180;return withPoly('seated-'+f.id,rectangle({cx:f.cx-Math.sin(r)*100,cy:f.cy+Math.cos(r)*100,w:600,d:350,rot:f.rot}));});
 return {pull_mm:pull,shoe_projection_mm:p,chairs,occupied,standing:standingPolys,use,collisions,nearest_shoe_chair_mm:Math.min(...chairs.map(f=>relation(actor(shoes,p),rectangle(f)).gap_mm))};
}
function staticPolys(s,withCurtains=true){
 const walls=domain.model.wall_segments.filter(w=>w.rooms.includes('RECP-01')).map(w=>rectangle({cx:(w.from[0]+w.to[0])/2,cy:(w.from[1]+w.to[1])/2,w:Math.hypot(w.to[0]-w.from[0],w.to[1]-w.from[1]),d:w.thickness_mm,rot:Math.atan2(w.to[1]-w.from[1],w.to[0]-w.from[0])*180/Math.PI}));
 return [...walls,...s.layout.furniture.filter(f=>f.room_id==='RECP-01'&&!['chair','rug','tv'].includes(f.type)).map(rectangle),...s.layout.interior.objects.filter(o=>o.room_id==='RECP-01'&&o.placement.mode==='floor'&&o.type!=='table-lamp').map(o=>rectangle(domain.resolveObject(o))),...doors.filter(d=>['OP-ENT-01','OP-RECP-WC','OP-RECP-KIT'].includes(d.id)).map(d=>d.open),...(withCurtains?curtainEnvelopes(s).map(c=>c.polygon):[])];
}
/** Identical conservative 4-neighbour algorithm to findPlanRoute, with cached static distances and multi-goal BFS. */
function field(s,grid=50,curtains=true){
 const b=bounds(room),nx=Math.ceil((b.xmax-b.xmin)/grid),ny=Math.ceil((b.ymax-b.ymin)/grid),n=nx*ny,points=Array.from({length:n},(_,id)=>[b.xmin+(id%nx+.5)*grid,b.ymin+(Math.floor(id/nx)+.5)*grid]);
 const clearance=new Float64Array(n);
 for(let i=0;i<n;i++)clearance[i]=pointInPolygon(points[i],room)?minEdgeDistance(points[i],room):-1;
 const add=(dst,polys)=>{for(const p of polys){const bb=bounds(p);for(let id=0;id<n;id++){if(dst[id]<0)continue;const q=points[id],dx=Math.max(bb.xmin-q[0],q[0]-bb.xmax,0),dy=Math.max(bb.ymin-q[1],q[1]-bb.ymax,0);if(Math.hypot(dx,dy)>dst[id])continue;const d=pointInPolygon(q,p)?-1:minEdgeDistance(q,p);dst[id]=Math.min(dst[id],d);}}};
 add(clearance,staticPolys(s,curtains));
 return {grid,nx,ny,n,points,clearance,add,toId:p=>Math.floor((p[1]-b.ymin)/grid)*nx+Math.floor((p[0]-b.xmin)/grid)};
}
export const goals={glazing:[13950,3500],living:[10650,3450],hall_approach:[9400,5650],kitchen_approach:[13200,7850]};
const start=[14300,9630];
function routes(f,st,diam,goalSet=goals,origin=start){
 const dst=new Float64Array(f.clearance);f.add(dst,[...st.chairs.map(rectangle),...st.occupied.map(x=>x.polygon),...st.use.map(x=>x.polygon),...st.standing.map(x=>x.polygon)]);
 const margin=diam/2+Math.SQRT2*f.grid/2,si=f.toId(origin),free=i=>i>=0&&i<f.n&&dst[i]>margin,parent=new Int32Array(f.n).fill(-1),seen=new Uint8Array(f.n),queue=new Int32Array(f.n);let lo=0,hi=0;
 if(free(si)){queue[hi++]=si;seen[si]=1;}
 while(lo<hi){const id=queue[lo++],x=id%f.nx,y=Math.floor(id/f.nx);for(const nxt of [x+1<f.nx?id+1:-1,x>0?id-1:-1,y+1<f.ny?id+f.nx:-1,y>0?id-f.nx:-1])if(nxt>=0&&free(nxt)&&!seen[nxt]){seen[nxt]=1;parent[nxt]=id;queue[hi++]=nxt;}}
 return Object.entries(goalSet).map(([goal,point])=>{const gi=f.toId(point),status=!free(si)||!free(gi)?'ENDPOINT_BLOCKED':!seen[gi]?'NO_MODEL_ROUTE':'MODEL_ROUTE_FOUND',path=[];if(status==='MODEL_ROUTE_FOUND'){let id=gi;while(id!==-1){path.push(f.points[id]);if(id===si)break;id=parent[id];}path.reverse();}return {goal,start_mm:origin,goal_mm:point,envelope_diameter_mm:diam,status,valid_operation:st.collisions.length===0,grid_mm:f.grid,cell_safety_pad_mm:Math.SQRT2*f.grid/2,distance_mm:path.length?(path.length-1)*f.grid:null,route_mm:path};});
}
export function audit(s){
 const key=s.m3b_profile?.id||s.m3_profile.id,shoe=F(s,'starter-40'),buffet=domain.resolveObject(O(s,'A-dining-sideboard')),base=field(s),states=[],routeRows=[];
 const add=(id,pull,p,standing=[],buffetUse=true)=>{const st=operationalState(s,pull,p,standing,buffetUse);st.id=id;states.push(st);for(const diam of [500,700])routeRows.push(...routes(base,st,diam).map(r=>({state:id,...r})));};
 for(const pull of [200,450])for(const p of [100,200,300,400])add(`chairs${pull}-shoe${p}-both`,pull,p);
 if(key==='B2')for(const pull of [0,200,450])add(`chairs${pull}-sliding0-both`,pull,0);
 const actual=key==='B2'?0:400;
 for(const id of CHAIR_IDS)add('independent-exit-'+id,450,actual,[id]);
 add('six-standing-both',450,actual,CHAIR_IDS);
 if(key==='B2')add('six-standing-open400-both',450,400,CHAIR_IDS);
 // Replay the inherited comparison exactly, without curtains, with the original centre buffet actor.
 const legacy=field(s,50,false),replay=[];
 for(const p of [100,200,300,400]){
  const st=operationalState(s,450,p,[],false);st.occupied=[];st.use.push(withPoly('buffet-panel',front(buffet,500)),withPoly('buffet-user',actor(buffet,500)));
  for(const diam of [500,700])replay.push(...routes(legacy,st,diam,{legacy_glazing:[13950,3150]}).map(r=>({projection_mm:p,...r})));
 }
 // 25mm convergence and original solver cross-check for the decisive worst-opening case.
 const decisive=operationalState(s,450,actual,[],true),fine=field(s,25,true),convergence=routes(fine,decisive,700);
 const crosschecks=[];
 for(const d of [500,700]){const reference=findPlanRoute({room,start,goal:goals.glazing,obstacles:[...staticPolys(s),...decisive.chairs.map(rectangle),...decisive.occupied.map(x=>x.polygon),...decisive.use.map(x=>x.polygon)],agent_radius_mm:d/2,grid_mm:50,max_cells:60000}),fast=routes(base,decisive,d).find(x=>x.goal==='glazing');assert.equal(fast.status,reference.status);assert.equal(fast.distance_mm,reference.distance_mm);crosschecks.push({diameter_mm:d,status:fast.status,distance_mm:fast.distance_mm,result:'MATCH'});}
 const seatGoals=Object.fromEntries(decisive.chairs.map(f=>{const r=f.rot*Math.PI/180;return [f.id,[f.cx+Math.sin(r)*(f.d/2+300),f.cy-Math.cos(r)*(f.d/2+300)]];})),seatAccess=routes(base,decisive,500,seatGoals),entryApproach=routes(base,decisive,700,goals,[14680,9790]);
 const curtainTests=[];
 for(const place of ['inside','outside'])for(const span of [250,350,450])for(const depth of [150,250,350]){
  const curtains=curtainEnvelopes(s,span,depth,place),solids=[withPoly('buffet',rectangle(buffet)),withPoly('plant',rectangle(domain.resolveObject(O(s,'A2-living-plant')))),withPoly('sofa',rectangle(F(s,'starter-28')))];
  curtainTests.push({stack_span_mm:span,projection_mm:depth,placement:place,collisions:curtains.flatMap(c=>solids.map(f=>collide(withPoly(c.id,c.polygon),f)).filter(Boolean)),north_buffet_to_terrace_stack_mm:relation(curtains.find(c=>c.id==='GLZ-RECP-TERMAIN-right').polygon,rectangle(buffet)).gap_mm});
 }
 const main=domain.model.openings.find(x=>x.id==='GLZ-RECP-TERMAIN'),service=[];
 for(const x of [main.from[0]+300,(main.from[0]+main.to[0])/2,main.to[0]-300]){const poly=rectangle({cx:x,cy:main.from[1]+90+350+300,w:600,d:600}),collisions=s.layout.furniture.filter(f=>f.room_id==='RECP-01'&&!['rug','tv'].includes(f.type)).map(f=>collide(withPoly('glazing-service',poly),withPoly(f.id,rectangle(f)))).filter(Boolean);for(const o of s.layout.interior.objects.filter(o=>o.room_id==='RECP-01'&&o.placement.mode==='floor'&&o.type!=='table-lamp')){const c=collide(withPoly('glazing-service',poly),withPoly(o.id,rectangle(domain.resolveObject(o))));if(c)collisions.push(c);}service.push({centre_mm:[x,main.from[1]+740],body_mm:[600,600],polygon:poly,collisions});}
 const sweeps=[0,100,200,300,400].map(p=>({projection_mm:p,cabinet:doors.filter(d=>['OP-ENT-01','OP-RECP-WC'].includes(d.id)).map(d=>({door:d.id,...sweepRelation(d.sweep,rectangle(shoe))})),user:doors.filter(d=>['OP-ENT-01','OP-RECP-WC'].includes(d.id)).map(d=>({door:d.id,...sweepRelation(d.sweep,actor(shoe,p))}))}));
 let valid;try{valid=domain.validate(s.layout);}catch(e){valid=e.validation;if(!valid)throw e;}
 return {schema:'M3FunctionalOptimization/1',key,scene_revision:s.scene_revision,source_sha256:sha(fs.readFileSync('render-snapshots/current.json')),states,routes:routeRows,legacy_replay:replay,grid25_convergence:convergence,solver_crosschecks:crosschecks,seat_access_500:seatAccess,entry_inside_approach_700:entryApproach,curtain_tests:curtainTests,terrace_service:service,door_sweeps:sweeps,buffet:{external_mm:[buffet.w,buffet.d,800],inner_design_mm:[buffet.w-40,340,640],relative_capacity_to_B:(buffet.w-40)/1960,north_end_to_glazing_face_mm:buffet.cy-buffet.w/2-(2732.588+90)},shoe_storage:key==='B2'?{daily_pairs:4,outer_mm:[600,350,800],inner_design_mm:[560,310,680],shoe_assumption_mm:[300,115,150],levels:2,clear_level_height_mm:331,pairs_per_level:2,sliding_half_access_mm:270,forward_door_projection_mm:0,limits:'Design prototype, no maker CAD or load approval. Two flat pairs x230mm plus70mm separation/margins fit530mm in560mm shelf;300mm shoe length leaves10mm depth;150mm height leaves181mm above per331mm level. Large/boot/damp pairs need inventory, ventilation and trays. Front opening270mm fits one230mm pair plus40mm assumed finger room. No six-pair claim.'}:{daily_pairs:4,outer_mm:[520,180,780],reference:'Inherited two 390mm TRONES-like envelope; about2 pairs/unit as prior #64 reference; real bin projection unknown, sensitivity100–400mm'},reserve:{source_id:'starter-5',room_id:'WIC-01',wardrobe_mm:[1250,600],proposed_allocation_mm:[550,350,400],two_shelves_pairs:4,tradeoff:'Reserve study only: requires owner clothing/shoe inventory and internal joinery. Sacrifices one550mm-wide lower bay; no new hall cabinet or shoe/food mix. Group2 gate; no source wardrobe edit.'},validation:{failures:valid.checks.filter(c=>c.status==='FAIL'),warning_count:valid.checks.filter(c=>c.status==='WARNING').length},limits:{opening:'Hardware depths100–400 are sensitivity assumptions, not site measurements. B2 slider nominal0 plus counterfactual tests.',route:'Whole circular500/700 envelopes; 50mm pad35.36mm radius,25mm pad17.68mm; starts INSIDE entry, goals are room approaches, not passage through thresholds.',door:'Full source leaf arcs40mm thick at2° samples; no real jamb/handle/continuous-motion signoff.',actors:'Six600×350 occupied torso zones included; replaced by600×600 standing users at exits. Not six moving articulated adults; states with collision cannot be accepted just because another route exists.',night:'Same geometry checked; image brightness is not measured lux. Bags/tray800+ not claimed.'}};
}
export function plan(s,a,p=400){
 const key=a.key,st=a.states.find(x=>x.id===`chairs450-${key==='B2'?'sliding0':'shoe'+p}-both`),sx=.092,origin=[8981.529,550.754],pt=q=>[60+(q[0]-origin[0])*sx,110+(q[1]-origin[1])*sx],points=q=>q.map(x=>pt(x).join(',')).join(' '),poly=(q,fill,stroke='#6A6255',dash='')=>`<polygon points="${points(q)}" fill="${fill}" stroke="${stroke}" stroke-width="1" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
 const txt=(x,y,t,z=13)=>`<text x="${x}" y="${y}" font-size="${z}">${t}</text>`,label=(q,t)=>{const [x,y]=pt(q);return txt(x,y,t,11);},dim=(q,r,t)=>{const x=pt(q),y=pt(r);return `<path d="M${x}L${y}" stroke="#257D86" marker-start="url(#a)" marker-end="url(#a)"/>`+txt((x[0]+y[0])/2+6,(x[1]+y[1])/2-7,t,12);};
 let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="1120" viewBox="0 0 1280 1120"><defs><marker id="a" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M0 0L6 3L0 6" fill="none" stroke="#257D86"/></marker></defs><rect width="1280" height="1120" fill="#FAF8F2"/><g font-family="Arial,sans-serif" fill="#322F29">${txt(35,38,key+' / six chairs +450 / '+(key==='B2'?'sliding front0':`shoe front${p}`)+' mm',26)}${txt(35,70,'Exact Type B source · MODEL TEST · 600x600 assumed people · NOT FOR CONSTRUCTION',15)}`;
 svg+=poly(room,'#EDE8DB');for(const w of domain.model.wall_segments.filter(w=>w.rooms.includes('RECP-01')))svg+=`<path d="M${pt(w.from)}L${pt(w.to)}" stroke="#645E53" stroke-width="${w.thickness_mm*sx}"/>`;
 for(const o of domain.model.openings.filter(o=>o.between.includes('RECP-01')))svg+=`<path d="M${pt(o.from)}L${pt(o.to)}" stroke="#63A1AD" stroke-width="3"/>`;
 for(const d of doors.filter(d=>['OP-ENT-01','OP-RECP-WC','OP-RECP-KIT'].includes(d.id))){for(const q of d.sweep.filter((_,i)=>i%5===0))svg+=poly(q,'#C4A65415','#AC9258','3 4');svg+=poly(d.open,'#C4A654');}
 for(const f of s.layout.furniture.filter(f=>f.room_id==='RECP-01'&&f.type!=='chair')){svg+=poly(rectangle(f),f.type==='rug'?'#BCB7A340':f.color);if(!['rug','tv'].includes(f.type))svg+=label([f.cx,f.cy],f.type==='table'?`${f.w}x${f.d}`:f.type==='shoecab'?`${f.w}x${f.d} SHOES`:f.type);}
 for(const o of s.layout.interior.objects.filter(o=>o.room_id==='RECP-01'&&o.placement.mode==='floor'&&o.type!=='table-lamp'))svg+=poly(rectangle(domain.resolveObject(o)),'#C3B491');
 for(const f of st.chairs)svg+=poly(rectangle(f),'#8DA1AC');for(const q of st.use)svg+=poly(q.polygon,q.id.endsWith('user')?'#C8788644':'#D8A05444','#AD7451','4 3');
 const all=operationalState(s,450,key==='B2'?0:p,CHAIR_IDS);for(const q of all.standing)svg+=poly(q.polygon,'#C8788612','#B0767C','3 4');
 for(const c of curtainEnvelopes(s))svg+=poly(c.polygon,'#9478B766','#80658B','3 4');
 const r=a.routes.find(r=>r.state===st.id&&r.envelope_diameter_mm===700&&r.goal==='living');if(r?.route_mm.length)svg+=`<polyline points="${points(r.route_mm)}" fill="none" stroke="#33735D" stroke-width="3"/>`;
 const t=F(s,'starter-35'),bu=domain.resolveObject(O(s,'A-dining-sideboard'));
 svg+=dim([t.cx-t.w/2,t.cy-1500],[t.cx+t.w/2,t.cy-1500],'2000 table / 6 seats')+dim([12693.796,t.cy],[t.cx-1000,t.cy],'976.2 polygon band*')+dim([15520,2732.588+90],[15520,bu.cy-bu.w/2],a.buffet.north_end_to_glazing_face_mm.toFixed(1)+' to glazing face')+dim([14340.79,10500],[15145.738,10500],'804.9 entry nominal');
 let y=132;for(const line of [`${key} / measured operating plan`,'Units: source-model millimetres','',`Table centre: ${t.cx}, ${t.cy}`,`Chairs: 510x530; all pulled450`,`Buffet: ${bu.w}x400x800`,`Shoe cabinet: ${F(s,'starter-40').w}x${F(s,'starter-40').d}`,'','Purple:450x350 outside stacks','Rose:600x600 assumed operators','Dotted rose:6 rear-standing bodies','Amber:500 buffet opening strip','Green:700 disc path, if found','',`700 to living: ${r?.status==='MODEL_ROUTE_FOUND'?'FOUND':'NOT FOUND'}`,`Nearest shoe/chair: ${st.nearest_shoe_chair_mm.toFixed(1)}`,`Static hard failures: ${a.validation.failures.length}`,`Source warnings: ${a.validation.warning_count}`,'','*Band is not a comfort certificate.','50mm grid adds35.36mm to radius.','All6 rear bodies must be judged','against actors, not this line alone.','No physical/code/lux validation.','Source floor/walls/openings unchanged.']){svg+=txt(775,y,line,15);y+=29;}
 svg+=txt(35,1055,'Inherited source discrepancy: west band976.2 polygon /997.4 wall segment; east chair band320.4, no500 bypass.',14)+txt(35,1090,'B/B1/A cabinet fronts100–400 tested; B2 slider0 plus100–400 stress. Source scene-9cf45a73 / v55 / 2500mm ceiling.',13)+'</g></svg>';return svg;
}
export function rejectedRotation(){
 const s=candidate('B2'),t=F(s,'starter-35'),old={cx:t.cx,cy:t.cy},cx=(12693.796+15945.418)/2;
 for(const id of CHAIR_IDS){const f=F(s,id),x=f.cx-old.cx,y=f.cy-old.cy;Object.assign(f,{cx:cx-y,cy:old.cy+x,rot:(f.rot+90)%360});}
 t.cx=cx;t.rot=90;
 const chairs=CHAIR_IDS.map(id=>{const f=F(s,id),a=f.rot*Math.PI/180;return {...f,cx:f.cx+Math.sin(a)*450,cy:f.cy-Math.cos(a)*450};}),polys=chairs.map(rectangle),routes=[500,700].map(d=>({diameter_mm:d,...findPlanRoute({room,start,goal:goals.living,obstacles:[...staticPolys(s),...polys,actor(F(s,'starter-40'),0),front(domain.resolveObject(O(s,'A-dining-sideboard')),500)],agent_radius_mm:d/2,grid_mm:50,max_cells:60000})}));
 return {id:'rotation90-recentred-six-seats',table_centre_mm:[cx,old.cy],table_mm:[2000,950],withdraw_mm:450,required_cross_width_mm:2830,available_face_width_mm:3251.622,each_side_projected_band_mm:(3251.622-2830)/2,routes,reason:'Recentering fixes the uncentred139.6mm east-face clash, but leaves210.8mm side bands and no500/700 route through the southern chair row. Six seats retained; rejected.'};
}
if(process.argv[1]?.endsWith('build-whole-home-m3-group1b.mjs')){
 prepareRuntime();
 fs.mkdirSync(dir,{recursive:true});const design={schema:'M3Group1B/1',baseline_head:baseline,canonical_sha256:source.canonical_sha256,source_sha256:sha(fs.readFileSync('render-snapshots/current.json')),approvals:{owner:false,construction:false,procurement:false,cloud_save:false},options:[],rejected:[]};
 for(const k of keys){const s=candidate(k),a=audit(s);fs.writeFileSync(`${dir}/${k}.json`,JSON.stringify(s,null,2)+'\n');fs.writeFileSync(`${dir}/AUDIT-${k}.json`,JSON.stringify(a,null,2)+'\n');fs.writeFileSync(`${dir}/Plan-${k}-450.svg`,plan(s,a));design.options.push({id:k,scene:s.scene_revision,hard_failures:a.validation.failures,legacy:a.legacy_replay.map(({route_mm,...r})=>r),curtain_collisions:a.curtain_tests.filter(x=>x.collisions.length).length,six_standing_collisions:a.states.find(x=>x.id==='six-standing-both').collisions});console.log(k,JSON.stringify({hard:a.validation.failures,curtain_conflicts:a.curtain_tests.filter(x=>x.collisions.length).length,legacy:a.legacy_replay.map(r=>[r.projection_mm,r.envelope_diameter_mm,r.status]),worst:a.routes.filter(r=>r.state===`chairs450-${k==='B2'?'sliding0':'shoe400'}-both`&&r.envelope_diameter_mm===700).map(r=>[r.goal,r.status]),allStanding:design.options.at(-1).six_standing_collisions}));}
 // Exact rejected operating studies; no product/architecture fallback.
 const tableOnly=load('B');for(const f of tableOnly.layout.furniture.filter(f=>f.id==='starter-35'||CHAIR_IDS.includes(f.id)))f.cy-=450;
 const rejectState=operationalState(tableOnly,450,400,CHAIR_IDS),b=load('B'),tab=F(b,'starter-35'),rotated=CHAIR_IDS.map(id=>{const f=F(b,id),x=f.cx-tab.cx,y=f.cy-tab.cy;return {...f,cx:tab.cx-y,cy:tab.cy+x,rot:(f.rot+90)%360};}),withdrawn=rotated.map(f=>{const r=f.rot*Math.PI/180;return {...f,cx:f.cx+Math.sin(r)*450,cy:f.cy-Math.cos(r)*450};}),roomb=bounds(room),eastFace=16035.418-90,westFace=12603.796+90;
 design.rejected=[{id:'table-only-north450',collisions:rejectState.collisions,reason:'North chair rear body intersects existing buffet/opening; moving table alone trades shoe obstruction for dining-storage collision.'},{id:'original2000x950-table-rotated90-with-six',required_cross_width_mm:Math.max(...withdrawn.flatMap(f=>rectangle(f).map(q=>q[0])))-Math.min(...withdrawn.flatMap(f=>rectangle(f).map(q=>q[0]))),available_face_strip_mm:eastFace-westFace,chair_footprints:withdrawn.map(rectangle),reason:'Six original3-per-long-side chairs retained. 450mm withdrawal crosses assumedwallface strip. Reject instead of quietly reducing seats.'}];
 fs.writeFileSync(dir+'/DESIGN.json',JSON.stringify(design,null,2)+'\n');
}
