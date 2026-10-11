/** M3 Group 1: isolated proposals and explicit operating envelopes, never a saved scene. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
import {rectangle,relation,sweepLeaf,sweepRelation} from '../studio/analysis/geometry.mjs';
import {findPlanRoute} from '../studio/analysis/route.mjs';
import {CHAIR_IDS,chairState,makeSprintCameras} from '../studio/analysis/reception-sprint.mjs';
export const dir='design-development/whole-home-m3/group1';
export const sha=b=>createHash('sha256').update(b).digest('hex');
export const source=JSON.parse(fs.readFileSync('render-snapshots/current.json'));
export const domain=createApartmentDomain(process.cwd());
export const F=(s,id)=>s.layout.furniture.find(f=>f.id===id);
export const O=(s,id)=>s.layout.interior.objects.find(o=>o.id===id);
const front=(f,projection,w=f.w)=>{const a=(f.rot||0)*Math.PI/180;return rectangle({cx:f.cx-Math.sin(a)*(f.d/2+projection/2),cy:f.cy+Math.cos(a)*(f.d/2+projection/2),w,d:projection,rot:f.rot});};
const user=(f,p)=>front({...f,d:f.d+2*p},600,600);
const doors=domain.model.doors.map(d=>{let c=Math.atan2(d.c[1],d.c[0])*180/Math.PI,o=Math.atan2(d.o[1],d.o[0])*180/Math.PI;if(o-c>180)o-=360;if(c-o>180)o+=360;const sweep=sweepLeaf({hinge:d.h,length_mm:d.len,thickness_mm:40,closed_angle_deg:c,open_angle_deg:o,step_deg:2});return {...d,sweep,open:sweep.at(-1)};});
export function candidate(key){
 const s=structuredClone(source),l=s.layout,b=JSON.parse(fs.readFileSync(`design-development/whole-home-m2/${key}.json`));
 s.name=`M3 Group 1 ${key} / reversible DESIGN PROPOSAL`;s.m2_profile={...b.m2_profile};s.m3_profile={id:key,shoe_height_mm:780,sofa_seat_target_mm:450};
 for(const f of l.furniture.filter(f=>f.room_id==='RECP-01')){const ref=F(b,f.id);f.color=ref.color;f.variant=['sofa','armchair'].includes(f.type)?(key==='B'?'style':'cocoon'):'style';}
 l.decor.active=b.layout.decor.active;
 for(const rid of ['RECP-01','HALL-01'])l.studio.rooms[rid].wall=b.layout.studio.rooms[rid].wall;
 // Copy material samples to NEW IDs; no shared source material is recoloured.
 for(const kind of ['wood','stone']){const mat=structuredClone(b.layout.interior.materials.find(m=>m.id==='m2-'+kind));mat.id='m3-'+kind;const asset=`${key}-${kind}.png`;fs.mkdirSync(dir+'/m3assets',{recursive:true});fs.mkdirSync('dist/m3assets',{recursive:true});const bytes=Buffer.from(mat.albedo_texture.split(',')[1],'base64');fs.writeFileSync(dir+'/m3assets/'+asset,bytes);fs.writeFileSync('dist/m3assets/'+asset,bytes);mat.albedo_texture='./m3assets/'+asset;l.interior.materials.push(mat);}
 for(const rid of ['RECP-01','HALL-01']){l.rooms[rid].mat='lightoak';l.interior.surface_materials['FLOOR-'+rid]='m3-wood';}
 const newmat=(id,color,category)=>{l.interior.materials.push({schema:'InteriorMaterial/1',id,name:'M3 proposal '+id,category,source_status:'GENERIC',base_colour:color,roughness:.85,metallic:0,finish:'matte'});return id;};
 const wood=newmat('m3-casework',key==='B'?'#B2A18B':'#C5B393','wood'),cloth=newmat('m3-curtain',key==='B'?'#DEDCD2':'#E6DED3','fabric');
 for(const f of l.furniture.filter(f=>f.room_id==='RECP-01'&&['tvstand','shoecab'].includes(f.type)))f.material_id=wood;
 for(const o of l.interior.objects.filter(o=>['RECP-01','HALL-01'].includes(o.room_id))){if(o.type==='sideboard'){o.material_references.body=wood;o.colour=key==='B'?'#B2A18B':'#C5B393';}if(o.type==='mirror')o.colour='#827B6E';}
 O(s,'A2-living-plant').colour='#B6ADA0';O(s,'A2-living-plant').material_references={primary:newmat('m3-pot','#B6ADA0','ceramic')};
 for(const [id,t] of Object.entries(l.interior.opening_treatments))if(id.startsWith('GLZ-RECP')){t.material_id=cloth;t.colour=key==='B'?'#DEDCD2':'#E6DED3';}
 Object.assign(F(s,'starter-40'),{cx:13600,cy:10015,w:520,d:180,rot:180,name:'M3 daily shoes · 520×180×780 · ~4 pairs / SITE HOLD'});
 const mirror=O(s,'A1-entry-mirror');Object.assign(mirror,{width_mm:520,height_mm:620,variant:'rectangle'});Object.assign(mirror.placement,{host_wall_id:'WALL-RECP-01-15',offset_mm:13600-(12603.796+14340.79)/2,elevation_mm:1100,inset_mm:10});
 if(key==='A'){for(const f of l.furniture.filter(f=>f.id==='starter-35'||CHAIR_IDS.includes(f.id)))f.cy-=350;O(s,'A-dining-pendant').cy-=350;O(s,'A-dining-sideboard').cy-=500;O(s,'V5-sideboard-lamp').cy-=500;Object.assign(O(s,'A2-living-plant'),{cx:12650,cy:3800});}
 if(key==='B'){
  for(const f of l.furniture.filter(f=>f.id==='starter-35'||CHAIR_IDS.includes(f.id)))f.cy-=550;
  O(s,'A-dining-pendant').cy-=550;
  Object.assign(O(s,'A-dining-pendant'),{variant:'linear',width_mm:1000,depth_mm:70,height_mm:150});O(s,'A-dining-pendant').placement.drop_mm=450;
  O(s,'A-dining-sideboard').cy-=750;O(s,'V5-sideboard-lamp').cy-=750;
  Object.assign(O(s,'A2-living-plant'),{cx:12650,cy:3800});
 }
 // One artwork, on the actual east wall; no screen or wall removal.
 l.interior.objects.push({id:'M3-buffet-art',type:'artwork',variant:'framed',room_id:'RECP-01',placement:{mode:'wall',host_wall_id:'WALL-RECP-01-18',offset_mm:O(s,'A-dining-sideboard').cy-(2732.588+10231.317)/2,elevation_mm:1120,inset_mm:12},rotation:0,width_mm:1200,depth_mm:25,height_mm:650,material_references:{frame:wood},colour:key==='B'?'#828575':'#A7AB8D',status:'EXPLORATORY',metadata:{role:'Single original landscape artwork; composition proposal'}});
 s.views=makeSprintCameras(source,domain.model).filter(v=>['entry-overview','dining-to-living','living-to-dining','seated-tv'].includes(v.id));
 s.views[0].camera.fov=72;
 s.scene_revision=domain.revision(l);assert.equal(s.architecture_variant,undefined);return s;
}
export function audit(s,runRoutes=true){
 const shoe=F(s,'starter-40'),buffet=domain.resolveObject(O(s,'A-dining-sideboard')),entry=doors.find(d=>d.id==='OP-ENT-01'),wc=doors.find(d=>d.id==='OP-RECP-WC');
 const states=[];
 for(const pull of [0,200,350,450])for(const opening of [100,200,300,400]){
  const chairs=chairState(s,pull),u=user(shoe,opening),panel=front(shoe,opening),bo=front(buffet,500),bu=user(buffet,500);
  const nearest=p=>chairs.map(f=>({id:f.id,...relation(p,rectangle(f))})).sort((a,b)=>a.gap_mm-b.gap_mm)[0];
  const exits=chairs.map(f=>{const sign=f.cy<F(s,'starter-35').cy?-1:1;const p=rectangle({cx:f.cx,cy:f.cy+sign*(f.d/2+300),w:600,d:600});return {id:f.id,polygon:p,buffet:relation(p,rectangle(buffet)),buffet_open:relation(p,bo),shoe_user:relation(p,u),entry:sweepRelation(entry.sweep,p)};});
  states.push({pull_mm:pull,shoe_projection_mm:opening,chairs,shoe_open:panel,shoe_user:u,buffet_open:bo,buffet_user:bu,shoe_chair:nearest(u),buffet_open_chair:nearest(bo),buffet_user_chair:nearest(bu),exit_bodies:exits,shoe_door:sweepRelation(entry.sweep,rectangle(shoe)),shoe_user_entry:sweepRelation(entry.sweep,u),shoe_user_wc:sweepRelation(wc.sweep,u)});
 }
 const walls=domain.model.wall_segments.filter(w=>w.rooms.includes('RECP-01')).map(w=>rectangle({cx:(w.from[0]+w.to[0])/2,cy:(w.from[1]+w.to[1])/2,w:Math.hypot(w.to[0]-w.from[0],w.to[1]-w.from[1]),d:w.thickness_mm,rot:Math.atan2(w.to[1]-w.from[1],w.to[0]-w.from[0])*180/Math.PI}));
 const solids=s.layout.furniture.filter(f=>f.room_id==='RECP-01'&&!['chair','rug','tv'].includes(f.type)).map(rectangle),objects=s.layout.interior.objects.filter(o=>o.room_id==='RECP-01'&&o.placement.mode==='floor'&&o.type!=='table-lamp').map(o=>rectangle(domain.resolveObject(o)));
 const routes=[];
 if(runRoutes)for(const pull of [200,450])for(const use of ['normal','shoe-user','buffet-user','both-users'])for(const diam of [500,700]){
  const st=states.find(x=>x.pull_mm===pull&&x.shoe_projection_mm===200),extras=[...(use.includes('shoe')||use==='both-users'?[st.shoe_open,st.shoe_user]:[]),...(use.includes('buffet')||use==='both-users'?[st.buffet_open,st.buffet_user]:[])];
  const r=findPlanRoute({room:domain.model.rooms.find(r=>r.id==='RECP-01').poly,start:[14300,9630],goal:[13950,3150],obstacles:[...walls,...solids,...objects,...st.chairs.map(rectangle),entry.open,...extras],agent_radius_mm:diam/2,grid_mm:50,max_cells:60000});
  routes.push({pull_mm:pull,use,envelope_diameter_mm:diam,...r});
 }
 const sensitivity_routes=[];
 if(runRoutes)for(const opening of [300,400])for(const diam of [500,700]){
  const st=states.find(x=>x.pull_mm===450&&x.shoe_projection_mm===opening);
  const r=findPlanRoute({room:domain.model.rooms.find(r=>r.id==='RECP-01').poly,start:[14300,9630],goal:[13950,3150],obstacles:[...walls,...solids,...objects,...st.chairs.map(rectangle),entry.open,st.shoe_open,st.shoe_user],agent_radius_mm:diam/2,grid_mm:50,max_cells:60000});
  sensitivity_routes.push({pull_mm:450,shoe_projection_mm:opening,use:'shoe-user',envelope_diameter_mm:diam,...r});
 }
 const sofa=F(s,'starter-28'),coffee=F(s,'starter-29'),tv=F(s,'starter-31'),hallMirror=domain.resolveObject(O(s,'V5-hall-mirror'));
 const view=[-900,0,900].map(dy=>{const eye=[sofa.cx+250,sofa.cy+dy],dx=tv.cx-eye[0],dy2=tv.cy-eye[1];return {eye_plan_mm:eye,distance_mm:Math.hypot(dx,dy2),off_normal_deg:Math.abs(Math.atan2(dy2,dx)*180/Math.PI)};});
 const curtains=['GLZ-RECP-N','GLZ-RECP-TERMAIN'].map(id=>{const op=domain.model.openings.find(x=>x.id===id),t=s.layout.interior.opening_treatments[id];return {id,nominal_span_mm:op.length_mm,render_panel_per_end_mm:Math.max(op.length_mm*.08,op.length_mm/2*(1-t.openness)),physical_stack_sensitivity_mm:[250,350,450],status:'SITE HOLD: renderer panels overlap aperture; no verified extension, fabric compression or clear sliding width'};});
 let valid;try{valid=domain.validate(s.layout);}catch(e){valid=e.validation;if(!valid)throw e;}
 return {schema:'M3Group1Operation/1',source_sha256:sha(fs.readFileSync('render-snapshots/current.json')),canonical_sha256:source.canonical_sha256,scene:s.scene_revision,states,routes,sensitivity_routes,failures:valid.checks.filter(c=>c.status==='FAIL'),warning_count:valid.checks.filter(c=>c.status==='WARNING').length,warnings:valid.checks.filter(c=>c.status==='WARNING'),hall:{nominal_polygon_width_mm:6206.575-4999.153,assumed_wall_face_strip_mm:6206.575-4999.153-180,at_existing_mirror_face_mm:hallMirror.cy-hallMirror.d/2-(4999.153+90),reception_passage_nominal_mm:1016.777,door_handing:'Source doors open into rooms, not the hall; installed handing, jambs, handles and simultaneous users remain HOLD',two_people_600mm:'1200 mm combined assumed bodies exceed 1027.4 wall-face strip; no comfortable two-person passing claim'},living:{sofa_footprint_mm:[sofa.w,sofa.d],sofa_coffee_gap_mm:relation(rectangle(sofa),rectangle(coffee)).gap_mm,view,screen_size_mm:tv.w,seat_and_arm_status:'DESIGN PROPOSAL: seat top 450, usable seat depth 540–580, padded arm top 600–650 mm; source heights absent, rendered dimensions only; full-size family sit/stand trial required'},curtains,buffet_glazing:{north_end_to_assumed_inner_glazing_face_mm:buffet.cy-buffet.w/2-(2732.588+90),west_edge_to_terrace_opening_east_end_mm:buffet.cx-buffet.d/2-15209.287,status:'SITE HOLD: source panels sit inside aperture; physical rail extension and forward fabric bulk could crowd north buffet end. No installed stack/service envelope verified.'},door_arcs:doors.filter(d=>d.id==='OP-ENT-01'||d.id==='OP-RECP-WC'||d.id.includes('HALL')),assumptions:{chair_pull_mm:[0,200,350,450],shoe_front_mm:[100,200,300,400],body_mm:[600,600],buffet_front_mm:500,door_leaf_mm:40,door_step_deg:2,route_grid_mm:50,route_diameter_mm:[500,700],limits:'Source-calibrated model / sampled motion / assumed bodies. No legal or comfort certificate. Routes omit 3D reach, handles, bags and cushion compression. Standing behind each chair is checked separately; all six simultaneous exits not certified.'}};
}
export function plan(s,a,pull=450){
 const scale=.074,ox=50,oy=90,p=([x,y])=>[ox+(x-3800)*scale,oy+(y-350)*scale],pts=poly=>poly.map(q=>p(q).join(',')).join(' '),e=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;');
 const polygon=(q,fill,stroke='#675E53',dash='')=>`<polygon points="${pts(q)}" fill="${fill}" stroke="${stroke}" stroke-width="1" ${dash?`stroke-dasharray="${dash}"`:''}/>`;
 const text=(x,y,t,size=13)=>`<text x="${x}" y="${y}" font-size="${size}">${e(t)}</text>`;
 const label=(q,t)=>{const [x,y]=p(q);return text(x,y,t,10);};
 const dim=(q,r,t)=>{const u=p(q),v=p(r);return `<path d="M${u} L${v}" stroke="#25778D" marker-start="url(#arr)" marker-end="url(#arr)"/>`+text((u[0]+v[0])/2+5,(u[1]+v[1])/2-6,t,11);};
 const st=a.states.find(x=>x.pull_mm===pull&&x.shoe_projection_mm===200);let svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1320" height="910" viewBox="0 0 1320 910"><defs><marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto-start-reverse"><path d="M0 0L6 3L0 6" fill="none" stroke="#25778D"/></marker></defs><rect width="1320" height="910" fill="#FAF8F3"/><g font-family="Arial,sans-serif" fill="#302F28">${text(30,35,`${s.m3_profile?.id||'SOURCE'} / six chairs +${pull} mm / model mm`,24)}${text(30,62,'Type B v0.2.2 · exact canonical plan · assumed use zones · SITE HOLD / NOT FOR CONSTRUCTION',13)}`;
 for(const r of domain.model.rooms.filter(r=>['RECP-01','HALL-01','KIT-01','WC-01'].includes(r.id)))svg+=polygon(r.poly,r.id==='HALL-01'?'#ECE7DC':'#F0ECE2')+label(r.at,r.id);
 for(const w of domain.model.wall_segments.filter(w=>w.rooms.some(r=>['RECP-01','HALL-01'].includes(r))))svg+=`<path d="M${p(w.from)} L${p(w.to)}" stroke="#554F46" stroke-width="${w.thickness_mm*scale}"/>`;
 for(const o of domain.model.openings.filter(o=>o.between.some(r=>['RECP-01','HALL-01'].includes(r))))svg+=`<path d="M${p(o.from)} L${p(o.to)}" stroke="#65A1AD" stroke-width="3"/>`;
 for(const d of a.door_arcs){for(const poly of d.sweep.filter((_,i)=>i%5===0))svg+=polygon(poly,'#CEB67E18','#A88C53','3 3');svg+=polygon(d.open,'#CEB67E');}
 for(const f of s.layout.furniture.filter(f=>f.room_id==='RECP-01'&&f.type!=='chair')){svg+=polygon(rectangle(f),f.type==='rug'?'#D4CBBE60':f.color||'#C6BAA5');if(!['rug','tv'].includes(f.type))svg+=label([f.cx,f.cy],f.type==='table'?`${f.w}×${f.d}`:f.type==='shoecab'?`${f.w}×${f.d} SHOES`:f.type);}
 for(const o of s.layout.interior.objects.filter(o=>o.room_id==='RECP-01'&&o.placement.mode==='floor'&&o.type!=='table-lamp'))svg+=polygon(rectangle(domain.resolveObject(o)),'#BFB39A');
 const hm=domain.resolveObject(O(s,'V5-hall-mirror'));svg+=polygon(rectangle(hm),'#A9C1C2')+label([hm.cx,hm.cy+180],'existing mirror 500×35');
 for(const f of st.chairs)svg+=polygon(rectangle(f),'#809CA6');
 for(const ex of st.exit_bodies)svg+=polygon(ex.polygon,'#C47A8318','#A65B68','2 3');
 for(const z of [st.shoe_open,st.buffet_open])svg+=polygon(z,'#CF96514A','#AE762C','4 3');for(const z of [st.shoe_user,st.buffet_user])svg+=polygon(z,'#C4717F40','#A65B68','4 3');
 const route=a.routes.find(r=>r.pull_mm===pull&&r.use==='both-users'&&r.envelope_diameter_mm===500);if(route?.route_mm?.length)svg+=`<polyline points="${pts(route.route_mm)}" fill="none" stroke="#25786C" stroke-width="2"/>`;
 svg+=dim([8500,4999.153],[8500,6206.575],'1207.4 nominal')+dim([14340.79,10440],[15145.738,10440],'804.9 entry nominal');
 svg+=dim([hm.cx,5089.153],[hm.cx,hm.cy-hm.d/2],'980.4 at mirror*');
 svg+=dim([12693.796,7300],[F(s,'starter-35').cx-1000,7300],'976.2 polygon / 997.4 wall*')+dim([15625,8500],[15945.418,8500],'320.4 east chair band*');
 const t=F(s,'starter-35'),sh=F(s,'starter-40');svg+=dim([t.cx-1000,t.cy-1500],[t.cx+1000,t.cy-1500],'2000 table')+label([13400,10570],s.m3_profile?`${sh.w}×${sh.d}×780 / ~4 daily pairs, no six-pair claim`:`${sh.w}×${sh.d} source shoes / height and capacity not recorded`);
 let y=130;for(const line of ['MODEL-TESTED / assumed operation','Blue: six withdrawn chairs','Rose dotted: 600×600 exit bodies','Rose filled: shoe / buffet operators','Amber: assumed opening projections','Door sweep: 2 degree samples','Green route: 500 mm disc only','No route ≠ impossible for all people','No code / comfort approval','',`Shoe/person → chair: ${st.shoe_chair.gap_mm.toFixed(1)} mm`,`Buffet open → chair: ${st.buffet_open_chair.gap_mm.toFixed(1)} mm`,`Sofa → coffee: ${a.living.sofa_coffee_gap_mm} mm`,'Hall assumed face strip: 1027.4 mm','At mirror local strip: 980.4 mm','','*Projected bands, not clear paths.','East side has no 500 mm bypass.','Opening 200 mm illustrated only.','100/300/400 sensitivities in JSON.','Chair lift/turn and bags not proved.','2500 mm ceiling; full-height glazing.']){svg+=text(1005,y,line,12);y+=24;}
 svg+=text(35,858,`Source scene-9cf45a73 / cloud scene-4821689 v55 / candidate ${s.scene_revision}`,13)+text(35,886,'All architecture retained. Furniture replacements / moves are separate reversible proposals; installation and products remain HOLD.',12)+'</g></svg>';return svg;
}
if(process.argv[1]?.endsWith('build-whole-home-m3-group1.mjs')){
 fs.mkdirSync(dir,{recursive:true});const summary={schema:'M3Group1/1',baseline_head:'42faaa195d81ffa1ec39e9cd30e1c0bcb1f818dd',source_sha256:sha(fs.readFileSync('render-snapshots/current.json')),canonical_sha256:source.canonical_sha256,approvals:{owner:false,construction:false,procurement:false,cloud_save:false},options:[]};
 for(const key of ['B','A']){const s=candidate(key),a=audit(s);fs.writeFileSync(`${dir}/${key}.json`,JSON.stringify(s,null,2)+'\n');fs.writeFileSync(`${dir}/AUDIT-${key}.json`,JSON.stringify(a,null,2)+'\n');for(const pull of [200,450])fs.writeFileSync(`${dir}/Plan-${key}-${pull}.svg`,plan(s,a,pull));summary.options.push({id:key,scene:s.scene_revision,failures:a.failures,route_results:a.routes.map(({route_mm,...r})=>r),chair450:a.states.filter(x=>x.pull_mm===450).map(x=>({projection:x.shoe_projection_mm,shoe_chair:x.shoe_chair.gap_mm,buffet_open:x.buffet_open_chair.gap_mm,standing_buffet_collisions:x.exit_bodies.filter(e=>e.buffet.intersects_positive_area).map(e=>e.id)}))});}
 const a=audit(source,false);fs.writeFileSync(`${dir}/AUDIT-SOURCE.json`,JSON.stringify(a,null,2)+'\n');fs.writeFileSync(`${dir}/Plan-SOURCE-450.svg`,plan(source,a));fs.writeFileSync(`${dir}/DESIGN.json`,JSON.stringify(summary,null,2)+'\n');console.log(JSON.stringify(summary.options.map(x=>({id:x.id,failures:x.failures,chair450:x.chair450,routes:x.route_results.map(r=>[r.pull_mm,r.use,r.envelope_diameter_mm,r.status])})),null,2));
}
