/** Issue74: isolated bathroom design. Dimensions are model/proxy evidence, never site approval. */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
import {rectangle,relation,sweepLeaf,hingeLeaf,sweepRelation,pointInPolygon} from '../studio/analysis/geometry.mjs';
export const dir='design-development/whole-home-m3/group3';
export const baseline='8b91b69e861fabe4c292502b66af8dd2140d456d';
export const sha=b=>createHash('sha256').update(b).digest('hex');
export const domain=createApartmentDomain(process.cwd());
export const source=JSON.parse(fs.readFileSync('render-snapshots/current.json'));
export const prepared=JSON.parse(fs.readFileSync('design-development/whole-home-m3/group3-preparation/SOURCE_BASELINE.json'));
export const rooms=['BATH-M01','BATH-C01','WC-01'];
export const F=(s,id)=>s.layout.furniture.find(f=>f.id===id);
export const O=(s,id)=>s.layout.interior.objects.find(o=>o.id===id);
export const bounds=p=>({xmin:Math.min(...p.map(p=>p[0])),xmax:Math.max(...p.map(p=>p[0])),ymin:Math.min(...p.map(p=>p[1])),ymax:Math.max(...p.map(p=>p[1]))});
export const doors=prepared.rooms.flatMap(r=>r.doors).map(d=>{let c=Math.atan2(d.c[1],d.c[0])*180/Math.PI,o=Math.atan2(d.o[1],d.o[0])*180/Math.PI;if(o-c>180)o-=360;if(c-o>180)o+=360;return {...d,sweep:sweepLeaf({hinge:d.h,length_mm:d.len,thickness_mm:40,closed_angle_deg:c,open_angle_deg:o,step_deg:1})};});
export const profiles={B:{name:'Warm Japandi / stone, smoked oak, nickel',wall:'#E9E5DA',stone:'#969D89',wood:'#95795B',dark:'#675B49',accent:'#727C65',floor:'#CAC4B6'},A:{name:'Organic Contemporary / clay, walnut, nickel',wall:'#F0E6DD',stone:'#B89076',wood:'#987050',dark:'#6D4C39',accent:'#AA7052',floor:'#D2C6B8'}};
export function candidate(key){
 const s=structuredClone(source);s.name='M3 Group3 '+key+' / independent unapproved review';s.group3_profile=key==='SOURCE'?null:{id:key,...profiles[key]};
 if(key!=='SOURCE'){
  const p=s.group3_profile;for(const f of s.layout.furniture.filter(f=>rooms.includes(f.room_id)&&f.type==='vanity')){f.color=p.wood;delete f.product_reference_id;}
  Object.assign(F(s,'starter-26'),{w:key==='B'?450:350,d:key==='B'?250:180,variant:'floating-compact'});
  F(s,'starter-16').variant='frameless-low-profile';
  for(const o of s.layout.interior.objects.filter(o=>rooms.includes(o.room_id))){if(o.type==='mirror'){o.variant='task-lit';o.material_references={frame:'bath-brushed-nickel'};if(key==='B'&&o.room_id!=='WC-01')o.depth_mm=100;}if(o.type==='shelf'){o.variant='wet-tray';if(key==='B'&&o.room_id==='BATH-M01')o.placement={...o.placement,host_wall_id:'WALL-BATH-M01-02',offset_mm:-53.08};}}
  O(s,'BATHM-glass-600-A1').variant='fixed-clear-glass';if(key==='A')Object.assign(O(s,'BATHM-glass-600-A1'),{cx:6680,width_mm:700});
  for(const [suffix,col,rough]of [['wall',p.wall,.85],['feature',p.stone,.72],['floor',p.floor,.9]])s.layout.interior.materials.push({schema:'InteriorMaterial/1',id:'m3g3-'+suffix,name:'Generic '+key+' '+suffix,category:'stone',source_status:'GENERIC',base_colour:col,finish:'matte visual / wet suitability HOLD',roughness:rough,metallic:0,albedo_texture:'./m3g3assets/'+key+'-'+suffix+'.png',texture_scale_mm:{width:suffix==='floor'?600:1200,height:600},notes:'Not a product, slip test, waterproofing assembly or site-approved texture.'});
  for(const rid of rooms){s.layout.studio.rooms[rid].wall=p.wall;s.layout.interior.surface_materials['FLOOR-'+rid]='m3g3-floor';for(const wall of domain.surfaces().filter(x=>x.type==='wall'&&x.room_id===rid))s.layout.interior.surface_materials[wall.id]='m3g3-wall';}
  for(const id of ['WALL-BATH-M01-02','WALL-BATH-C01-07','WALL-WC-01-02'])s.layout.interior.surface_materials[id]='m3g3-feature';
  s.group3_detail={family_mechanism:key==='B'?'INWARD_BIFOLD_2x290':'INWARD_PIVOT_580',glass_state:'CLOSED',glass_thickness_proxy_mm:8,base_height_proxy_mm:35,mirror:key==='B'?'SIDE_FACE_LIGHT_AND_100_DEEP_CABINET':'TOP_FACE_LIGHT_PLAIN_MIRROR',hand_shower:'source shower controls retained / hose and handhead concept',accessories:[
   {id:'master-towel',room:'BATH-M01',kind:'bar',cx:7060,cy:7540,rot:90,w:360,d:60,bottom:1000,h:500},
   {id:'master-roll',room:'BATH-M01',kind:'roll',cx:7050,cy:8380,rot:90,w:180,d:70,bottom:650,h:150},
   {id:'master-bin',room:'BATH-M01',kind:'bin',cx:6350,cy:8730,rot:0,w:130,d:170,bottom:0,h:280},
   {id:'family-towel',room:'BATH-C01',kind:'hooks',cx:7300,cy:8150,rot:270,w:220,d:60,bottom:1180,h:450},
   {id:'family-handtowel',room:'BATH-C01',kind:'bar',cx:8790,cy:6850,rot:90,w:220,d:50,bottom:1150,h:300},
   {id:'family-roll',room:'BATH-C01',kind:'roll',cx:8720,cy:7750,rot:90,w:160,d:70,bottom:650,h:150},
   {id:'family-bin',room:'BATH-C01',kind:'bin',cx:8810,cy:7800,rot:0,w:130,d:150,bottom:0,h:280},
   {id:'guest-handtowel',room:'WC-01',kind:'bar',cx:11570,cy:9080,rot:0,w:220,d:50,bottom:1130,h:300},
   {id:'guest-roll',room:'WC-01',kind:'roll',cx:10900,cy:9350,rot:270,w:160,d:70,bottom:650,h:150},
   {id:'guest-bin',room:'WC-01',kind:'bin',cx:10950,cy:10040,rot:0,w:130,d:170,bottom:0,h:280}
  ],basin_proxy:{large:{outer:[460,360],inner:[410,300],water_depth:110,tap_projection:120,top:850},B_guest:{outer:[390,190],inner:[350,150],water_depth:90,tap_projection:90,top:850},A_guest:{outer:[300,130],inner:[260,90],water_depth:80,tap_projection:60,top:850}},approvals:{owner:false,product:false,electrical:false,glass:false,waterproofing:false,procurement:false,cloud:false}};
 }
 const convert=(xy,h)=>[(xy[0]-domain.model.width_mm/2)/1000,h/1000,(xy[1]-domain.model.depth_mm/2)/1000];
 const saved=id=>structuredClone(source.views.find(v=>v.id===id));
 const master=saved('bath55-master-walkin-correct-door');master.id='master-shower';
 const family=saved('bath55-family-entry');family.id='family-shower';
 const guest=saved('guest-wc-use-closed');guest.id='guest-closed';
 const guestOpen=saved('guest-wc-entry-open');guestOpen.id='guest-open';
 const authored=(id,room,pos,target)=>({id,room_id:room,camera:{...structuredClone(master.camera),position:convert(pos,1620),target:convert(target,1250),fov:72,provenance:undefined}});
 s.views=[master,authored('master-wide','BATH-M01',[5710,8110],[6500,6750]),authored('master-vanity','BATH-M01',[6550,7580],[5990,8870]),family,authored('family-vanity','BATH-C01',[7850,7720],[8460,6380]),guest,guestOpen];
 s.scene_revision=domain.revision(s.layout);return s;
}
export function foldStates(){
 const hinge=[7959.592,8539.592],states=[];for(let a=0;a<=90;a++){
  const rad=(-90+a)*Math.PI/180,joint=[hinge[0]+290*Math.cos(rad),hinge[1]+290*Math.sin(rad)];
  states.push({angle:a,bifold:[hingeLeaf({hinge,length_mm:290,thickness_mm:8,angle_deg:-90+a}),hingeLeaf({hinge:joint,length_mm:290,thickness_mm:8,angle_deg:-90-a})],pivot:[hingeLeaf({hinge,length_mm:580,thickness_mm:8,angle_deg:-90+a})]});
 }return states;
}
export const actor=(id,cx,cy,w=600,d=600,rot=0)=>({id,polygon:rectangle({cx,cy,w,d,rot}),body_proxy_mm:[w,d]});
export function operations(s){
 const records=[];for(const rid of rooms){const room=prepared.rooms.find(r=>r.geometry.id===rid),door=doors.find(d=>d.id===room.doors[0].id);
 const solids=s.layout.furniture.filter(f=>f.room_id===rid&&f.type!=='shower').map(f=>({id:f.id,polygon:rectangle(f)}));
 const glass=s.layout.interior.objects.filter(o=>o.room_id===rid&&o.type==='divider').map(o=>({id:o.id,polygon:rectangle(domain.resolveObject(o))}));
 const use=rid==='BATH-M01'?[actor('shower600',6180,6750),actor('vanity500',5980,8140,500,500),actor('vanity600',5980,8090),actor('WC600',6715,7870),actor('entry-wait600',5930,7590)]:rid==='BATH-C01'?[actor('shower-retreat500',8510,8230,500,500),actor('shower-retreat600',8510,8230),actor('vanity600',8500,7056),actor('vanity600x400',8500,6956,600,400),actor('vanity500',8500,7006,500,500),actor('WC600',7891,7440),actor('entry-wait600',7750,6650)]:[actor('handwash500',11968, F(s,'starter-26').cy+F(s,'starter-26').d/2+250,500,500),actor('handwash600',11968,F(s,'starter-26').cy+F(s,'starter-26').d/2+300),actor('WC600',11894.276,9701.745),actor('entry-wait600',12120,9660)];
 const accessories=(s.group3_detail?.accessories||[]).filter(a=>a.room===rid).map(a=>({...a,polygon:rectangle(a)}));
 records.push({room:rid,solids,glass,users:use,accessories,door:{id:door.id,samples:door.sweep.length,fixture:solids.concat(glass).map(x=>({id:x.id,...sweepRelation(door.sweep,x.polygon)})),occupied:use.map(x=>({id:x.id,...sweepRelation(door.sweep,x.polygon)})),accessories:accessories.map(x=>({id:x.id,...sweepRelation(door.sweep,x.polygon)}))},user_obstacles:use.map(u=>({id:u.id,collisions:solids.concat(glass,accessories.filter(a=>a.kind==='bin')).filter(x=>relation(u.polygon,x.polygon).intersects_positive_area).map(x=>x.id)})),floor_accessory_conflicts:accessories.filter(a=>a.kind==='bin').map(a=>({id:a.id,collisions:solids.concat(glass).filter(x=>relation(a.polygon,x.polygon).intersects_positive_area).map(x=>x.id)}))});
 }
 const states=foldStates(),body500=actor('retreat500',8510,8230,500,500).polygon,body600=actor('retreat600',8510,8230).polygon;
 const shelf=rectangle(domain.resolveObject(O(s,'BATHC-shampoo-shelf-A1'))),shower=rectangle(F(s,'starter-16'));
 const family={hinge:[7959.592,8539.592],aperture_band_mm:580,thickness_proxy_mm:8,states:states.map(st=>({angle:st.angle,bifold:st.bifold,pivot:st.pivot})),mechanisms:['bifold','pivot'].map(k=>({id:k,max_inward_projection_mm:Math.max(...states.flatMap(st=>st[k].flat().map(p=>p[0]-7959.592))),body500_collision_samples:states.filter(st=>st[k].some(p=>relation(p,body500).intersects_positive_area)).length,body600_collision_samples:states.filter(st=>st[k].some(p=>relation(p,body600).intersects_positive_area)).length,shelf_collision_samples:states.filter(st=>st[k].some(p=>relation(p,shelf).intersects_positive_area)).length,outside_wet_footprint_samples:states.filter(st=>st[k].some(p=>p.some(q=>!pointInPolygon(q,shower)))).length})),opening_after_concept_20mm_allowance_mm:560,not_installed_clear_width:true,limitations:'No hinge offset, handle, gasket, product tolerance, articulated occupant, finger safety, seals or supplier certification. Fold mechanism remains HOLD. Full moving panel rectangles at1deg.'};
 const vanity=(id)=>{const f=F(s,id),guest=id==='starter-26',size=guest?(s.group3_profile?.id==='B'?'B_guest':'A_guest'):'large',p=s.group3_detail?.basin_proxy[size];return {id,external_mm:[f.w,f.d],generic_internal_bowl_mm:p?.inner||null,generic_side_landing_mm:p?(f.w-p.outer[0])/2:null,drawer_clear_assumption_mm:guest?[f.w-36,f.d-50,120]:[564,370,180],drawer_gross_L_assumption:guest?(f.w-36)*(f.d-50)*120/1e6:564*370*180/1e6,central_trap_box_mm:guest?[120,100,120]:[140,200,180],net_upper_drawer_L_assumption:guest?((f.w-36)*(f.d-50)*120-120*100*120)/1e6:(564*370*180-140*200*180)/1e6,opening_strokes_mm:[250,350],not_vendor_capacity:true};};
 const masterGlass=domain.resolveObject(O(s,'BATHM-glass-600-A1')),mF=F(s,'BATHM-WALKIN-A1');
 return {schema:'M3Group3Operations/1',option:s.group3_profile?.id||'SOURCE',records,family,vanities:['R1-ensuite-vanity','starter-18','starter-26'].map(vanity),master:{wet_mm:[1450,800],screen_mm:[masterGlass.w,masterGlass.d,2050],west_open_band_mm:masterGlass.cx-masterGlass.w/2-(mF.cx-mF.w/2),wet_edge_to_WIC_jamb_y_projection_mm:7265.718-(mF.cy+mF.d/2),rejected900_projection_mm:15.718,splash:'NOT_SIMULATED / dynamic real-water trial needed',screen_extension:'A700 extends west100, preserves east edge / not selected'},orientation_correction:'Source plan y increases south. Family shower is southeast: exposed WC-facing edge is NORTH (y7959.592), west access x7959.592. Inherited PR54 calls this south; coordinates, not the old cardinal label, govern this study.',limits:'Source-model mm;2D rectangles at1deg with40mm room leaf/8mm conceptual glass. Body proxies500/600 are stress cases, not comfort, access, compliance or site dimensions. Floor wet marker is not treated as a solid.'};
}
if(process.argv[1]?.endsWith('build-whole-home-m3-group3.mjs')){
 fs.mkdirSync(dir+'/plans',{recursive:true});fs.mkdirSync('work/m3-group3',{recursive:true});fs.copyFileSync('dist/index.html','work/m3-group3/built-viewer.html');
 const design={schema:'M3Group3Design/1',baseline_head:baseline,source_sha256:sha(fs.readFileSync('render-snapshots/current.json')),canonical_sha256:source.canonical_sha256,ceiling_mm:2500,m1_intents:prepared.rooms.flatMap(r=>r.m1_intents),approvals:{owner:false,construction:false,cloud:false,procurement:false},options:[]};
 for(const key of ['SOURCE','B','A']){const s=candidate(key);fs.writeFileSync(dir+'/'+key+'.json',JSON.stringify(s,null,2)+'\n');const audit=operations(s);fs.writeFileSync(dir+'/OPERATIONS-'+key+'.json',JSON.stringify(audit,null,2)+'\n');let validation;try{validation=domain.validate(s.layout)}catch(e){validation=e.validation;if(!validation)throw e;}const fails=validation.checks.filter(c=>c.status==='FAIL');design.options.push({id:key,scene:s.scene_revision,validation:{summary:validation.summary,failures:fails}});console.log(key,JSON.stringify({fails,doors:audit.records.map(r=>({room:r.room,fixtures:r.door.fixture.filter(x=>x.positive_overlap_samples),occupied:r.door.occupied.filter(x=>x.positive_overlap_samples),accessories:r.door.accessories.filter(x=>x.positive_overlap_samples),floor:r.floor_accessory_conflicts})),family:audit.family.mechanisms}));}
 fs.writeFileSync(dir+'/DESIGN.json',JSON.stringify(design,null,2)+'\n');
}
