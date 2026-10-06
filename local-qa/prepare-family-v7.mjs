import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
process.chdir(new URL('..',import.meta.url).pathname);
const version=process.argv[2]||'project-studies-v7';
if(!/^project-studies(?:-v[0-9]+)?$/.test(version))throw new Error('Invalid study folder');
const root='local-qa/'+version,site='local-qa/site/'+version;
fs.mkdirSync(root,{recursive:true});fs.mkdirSync(site,{recursive:true});
const read=p=>JSON.parse(fs.readFileSync(p)),write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2));
const model=read('dist/apartment-model.json'),base=read('local-qa/project-studies-v4/home-a-utility/layout.json');
const hash=crypto.createHash('sha256').update(fs.readFileSync('dist/sources/Apartment_Master_Spec_Type_B_v0.2.2_Geometry_Heights_Glazing(1).json')).digest('hex');
assert.equal(hash,'734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658');
const ctx=vm.createContext({MODEL:model,INTERIOR_MATERIALS:read('interior-materials.json'),structuredClone});
for(const f of ['studio-core.js','interior-core.js','capture-camera.js','studio-cloud-core.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);ctx.layout=base;
const update=(id,changes)=>({type:'update-furniture',furniture_id:id,changes});
const object=(id,changes)=>({type:'update-object',object_id:id,changes});
const add=(id,type,room,cx,cy,w,d,rot,name,color='#C6B18F')=>({type:'add-furniture',furniture:{id,type,room_id:room,cx,cy,w,d,rot,name,color,variant:'style',status:'EXPLORATORY'}});
const floorObject=(id,type,cx,cy,w,d,h,variant='plain',colour='#C6B18F')=>({type:'add-object',object:{id,type,variant,room_id:'RECP-01',placement:{mode:'floor'},cx,cy,rotation:0,width_mm:w,depth_mm:d,height_mm:h,material_references:{primary:'a3-pale-oak'},colour,status:'EXPLORATORY',metadata:{role:'Useful family furniture; custom generic concept'}}});
const wallObject=(id,type,room,host,width,depth,height,elevation,offset=0,variant='rectangle')=>({type:'add-object',object:{id,type,variant,room_id:room,placement:{mode:'wall',host_wall_id:host,offset_mm:offset,inset_mm:12,elevation_mm:elevation},rotation:0,width_mm:width,depth_mm:depth,height_mm:height,material_references:{frame:'a3-pale-oak'},colour:'#C6B18F',status:'EXPLORATORY',metadata:{role:'Functional wall furnishing; no architectural change'}}});
const warmRoom=id=>[{type:'room-option',room_id:id,key:'lighting',value:'downlights'},{type:'room-option',room_id:id,key:'temperature',value:3000},{type:'room-option',room_id:id,key:'brightness',value:70}];
const familyOps=[
 // Improve the large wall composition using the existing single artwork.
 object('A3-living-art',{width_mm:1400,height_mm:900,placement:{mode:'wall',host_wall_id:'WALL-RECP-01-18',offset_mm:4750-(2732.588+10231.317)/2,elevation_mm:1040,inset_mm:12},metadata:{role:'One large artwork centered above useful closed sideboard; generic concept art'}}),
 object('A2-living-plant',{width_mm:500,depth_mm:500,height_mm:1650,metadata:{role:'One taller specimen; species / daylight / pet compatibility TBD, glazing kept clear'}}),
 {type:'add-object',object:{id:'V5-sideboard-lamp',type:'table-lamp',variant:'shade',room_id:'RECP-01',placement:{mode:'floor',elevation_mm:800},cx:15720,cy:5450,rotation:0,width_mm:260,depth_mm:260,height_mm:400,material_references:{primary:'a3-pale-oak'},colour:'#D9CEBC',status:'EXPLORATORY',metadata:{role:'One practical sideboard lamp; surface-supported concept'}}},
 // Private hall: keep passage clear; linen lives in a bedroom wardrobe.
 ...warmRoom('HALL-01'),wallObject('V5-hall-mirror','mirror','HALL-01','WALL-HALL-01-07',500,35,1100,750,200),
 // Master: improve north-side route and add useful foot bench + drawer chest.
 update('starter-1',{cx:1516,cy:6835,w:1870,d:2220,color:'#DDD3C4',product_reference_id:'bed-idanas-180-reference',name:'King frame 1870 × 2220 · mattress 1800 × 2000'}),
 update('starter-2',{cy:5650,color:'#C6B18F'}),update('starter-3',{cy:8050,color:'#C6B18F'}),
 {type:'add-object',object:{...floorObject('V7-master-drawers','sideboard',3340,8650,1000,400,800).object,room_id:'MBR-01',rotation:180,metadata:{role:'Closed master drawer chest; generic custom joinery, not a vanity'}}},
 {type:'add-object',object:{id:'V5-master-bench',type:'bench',variant:'upholstered',room_id:'MBR-01',placement:{mode:'floor'},cx:1700,cy:8610,rotation:180,width_mm:1000,depth_mm:350,height_mm:440,material_references:{primary:'a3-pale-oak'},colour:'#DDD3C4',status:'EXPLORATORY',metadata:{role:'South-wall dressing bench; leave the entire east-side main path open'}}},
 add('V5-master-rug','rug','MBR-01',1900,6800,2600,3000,270,'Quiet master rug · generic 2600 × 3000','#D9D1C3'),
 ...warmRoom('MBR-01'),{type:'room-option',room_id:'MBR-01',key:'flooring',value:'lightoak'},
 // More credible wardrobe depths with both ends and the cross route intact.
 update('starter-4',{cx:4734,cy:6615,w:1250,d:600,color:'#C6B18F',name:'North dressing wardrobe · 1250 × 600 mm'}),
 update('starter-5',{cx:4734,cy:8550,w:1250,d:600,color:'#C6B18F',name:'South dressing wardrobe · 1250 × 600 mm'}),
 ...warmRoom('WIC-01'),
 // Bedroom 1: existing bed kept; desk chair shifted off its occupied footprint.
 update('starter-7',{cx:5060,cy:3150,w:1800,d:600,color:'#C6B18F',name:'Bedroom 1 wardrobe · 1800 × 600 mm'}),
 update('starter-8',{cx:3800,cy:4590,w:1200,d:600,color:'#C6B18F',name:'Bedroom 1 study desk · 1200 × 600 mm'}),
 update('starter-9',{cx:3720,cy:3930,w:480,d:500,color:'#8D9381',name:'Bedroom 1 study chair · bed overlap corrected'}),
 {type:'add-object',object:{...floorObject('V7-bedroom1-drawers','sideboard',2675,4720,1000,350,800).object,room_id:'BR-01',rotation:180,metadata:{role:'Closed books / toys / daily drawers; generic custom joinery'}}},
 update('starter-6',{cy:2680,w:1280,d:2100,color:'#DDD3C4',name:'Single frame reserve 1280 × 2100 · mattress 1200 × 2000'}),...warmRoom('BR-01'),{type:'room-option',room_id:'BR-01',key:'flooring',value:'lightoak'},
 // Bedroom 2: move headboard from glazing to east solid wall, expand storage.
 update('starter-10',{cx:7820,cy:2800,w:1280,d:2100,rot:90,color:'#DDD3C4',name:'1280 × 2100 frame reserve · headboard on east wall'}),
 update('starter-11',{cx:6140,cy:1920,w:1000,d:600,color:'#C6B18F',name:'Bedroom 2 study desk · 1000 × 600 mm'}),
 update('starter-12',{cx:6140,cy:2730,w:560,d:560,color:'#8A8F82',name:'Bedroom 2 compact task chair · generic'}),
 update('starter-13',{cx:7990,cy:4589,w:1600,d:600,color:'#C6B18F',name:'1600 mm closed wardrobe · one family-linen bay'}),
 ...warmRoom('BR-02'),{type:'room-option',room_id:'BR-02',key:'flooring',value:'lightoak'}
];
const scope=['RECP-01','HALL-01','MBR-01','BR-01','BR-02','WIC-01'];
const studies=[
 {id:'family-v7',title:'Family A.7 · Useful density, honest furniture scale',scope,ops:familyOps,assessment:'Reposition one large reception artwork over the sideboard, increase the single plant scale, add one surface lamp; keep hall free with mirror/light; organize all bedrooms and dressing; replace vanity proxies with closed drawers; reserve actual king-frame dimensions and conservative single-frame envelopes; move the bench to the south wall. Preserve kitchen, baths, six dining seats, TV and main sofa.'}
];
const template=read('dist/capture-template.json').html,assets={};
for(const f of fs.readdirSync('dist/art'))if(f.endsWith('.png'))assets['./art/'+f]='data:image/png;base64,'+fs.readFileSync('dist/art/'+f).toString('base64');
const world=(p,h)=>[(p[0]-model.width_mm/2)/1000,h,(p[1]-model.depth_mm/2)/1000];
const views=[
 ['entry','RECP-01',[14740,9740],[13700,4650],42,1.7,1.4],
 ['family','RECP-01',[13600,5600],[10750,2550],42,1.7,1.4],
 ['dining','RECP-01',[13250,9440],[14400,7600],42,1.7,1.4],
 ['hall','HALL-01',[8650,5600],[4600,5600],42,1.7,1.45],
 ['master','MBR-01',[3450,8350],[1400,6500],42,1.7,1.25],
 ['master-entry','MBR-01',[3450,5700],[1700,7050],42,1.7,1.25],
 ['bedroom1','BR-01',[4740,4540],[2850,2700],42,1.7,1.25],
 ['bedroom1-study','BR-01',[4230,3050],[3800,4520],42,1.7,1.0],
 ['bedroom2','BR-02',[6720,4590],[7850,2750],42,1.7,1.2],
 ['bedroom2-window','BR-02',[6500,3670],[7300,2020],42,1.7,1.25],
 ['dressing','WIC-01',[4700,7700],[4700,6550],60,1.7,1.05],
 ['master-storage','MBR-01',[3450,7580],[2650,8620],42,1.7,.9],
 ['master-wide','MBR-01',[3450,8350],[1400,6600],60,1.7,.85],
 ['dressing-entry','MBR-01',[3700,7800],[4840,7210],42,1.7,1.15]
];
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function plan(layout,scope){
 const rs=model.rooms.filter(r=>scope.includes(r.id)),points=rs.flatMap(r=>r.poly),xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
 const minX=Math.min(...xs)-300,minY=Math.min(...ys)-300,width=Math.max(...xs)-minX+300,height=Math.max(...ys)-minY+300;
 let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${minX} ${minY} ${width} ${height}" role="img" aria-label="Canonical plan and exploratory furniture"><style>text{font:160px sans-serif;fill:#342f29}.small{font-size:115px}</style>`;
 for(const r of rs)s+=`<polygon points="${r.poly.map(p=>p.join(',')).join(' ')}" fill="#f8f4ec" stroke="#a49b8b" stroke-width="22"/>`;
 for(const wall of model.wall_segments.filter(w=>w.rooms.some(r=>scope.includes(r))))s+=`<path d="M${wall.from.join(',')} L${wall.to.join(',')}" stroke="#5e564b" stroke-width="${wall.thickness_mm}"/>`;
 for(const op of model.openings.filter(o=>o.between.some(r=>scope.includes(r))))s+=`<path d="M${op.from.join(',')} L${op.to.join(',')}" stroke="${op.id.startsWith('GLZ')?'#4c99b2':'#c58442'}" stroke-width="70"/>`;
 ctx.layout=layout;
 for(const f of layout.furniture.filter(f=>scope.includes(f.room_id)&&!['tv','stove','ksink','acwall','aircon','waterheater'].includes(f.type))){ctx.item=f;const p=run('studioFootprint(item)');s+=`<polygon points="${p.map(p=>p.join(',')).join(' ')}" fill="${f.color}" fill-opacity="${f.type==='rug'?'.28':'.85'}" stroke="#746b5d" stroke-width="16"/><text class="small" x="${f.cx}" y="${f.cy}" text-anchor="middle">${escape(f.type)} ${f.w}×${f.d}</text>`;}
 for(const o of layout.interior.objects.filter(o=>scope.includes(o.room_id)&&o.placement.mode==='floor')){ctx.item=o;const r=run('interiorResolved(item,MODEL)');ctx.item=r;const p=run('studioFootprint(item)');s+=`<polygon points="${p.map(p=>p.join(',')).join(' ')}" fill="${o.colour}" stroke="#746b5d" stroke-width="16"/><text class="small" x="${r.cx}" y="${r.cy}" text-anchor="middle">${escape(o.type)} ${o.width_mm}×${o.depth_mm}</text>`;}
 if(scope.includes('KIT-01')){for(const [name,x,y,w,d] of [['DW open · assumed 600',10581,7598,600,600],['Fridge open · assumed 600',12120,7895,650,600],['Washer open · assumed 412',9981,7504,596,412]])s+=`<rect x="${x-w/2}" y="${y-d/2}" width="${w}" height="${d}" fill="#d88358" fill-opacity=".2" stroke="#bf673d" stroke-width="15" stroke-dasharray="55 25"/><text class="small" x="${x}" y="${y}" text-anchor="middle">${name}</text>`;}
 s+='</svg>';return s;
}
const manifest=[];
for(const study of studies){
 const dir=root+'/'+study.id;fs.mkdirSync(dir,{recursive:true});ctx.layout=base;
 ctx.proposal={schema:'ApartmentDesignProposal/2',canonical_sha256:hash,base_scene_revision:run('studioSceneKey(layout)'),author:'Whole-apartment local study',notes:study.assessment,operations:study.ops};
 let layout;try{layout=study.ops.length?JSON.parse(JSON.stringify(run('studioValidateProposal(proposal,layout,MODEL)'))):structuredClone(base);}catch(e){write(dir+'/rejected.json',e.validation||{message:e.message});console.log(study.id+' REJECTED '+e.message);continue;}
 assert.deepEqual(layout.demolished,base.demolished);
 for(const f of base.furniture.filter(f=>!study.scope.includes(f.room_id)))assert.deepEqual(layout.furniture.find(x=>x.id===f.id),f);
 ctx.layout=layout;const validation=run('interiorValidation(layout,MODEL)'),revision=run('studioSceneKey(layout)');assert.equal(validation.summary.fail,0);
 write(dir+'/layout.json',layout);write(dir+'/proposal.json',ctx.proposal);write(dir+'/validation.json',validation);
 ctx.catalog=[...read('studio-catalog.json'),...read('local-qa/realism-r1/references.json'),...read('local-qa/family-references.json')];write(dir+'/brief.json',run('studioDesignBrief(layout,MODEL,catalog)'));
 const cameras=[];
 for(const [view,room,position,target,fov,eye,aim] of views.filter(v=>study.scope.includes(v[1]))){ctx.input={room_id:room,position:world(position,eye),target:world(target,aim),fov};let camera;try{camera=JSON.parse(JSON.stringify(run('studioCaptureCamera(input,layout,MODEL)')));}catch(e){console.log(study.id+' '+view+' camera rejected: '+e.message);continue;}
  camera.viewport={width:1600,height:857};camera.aspect=1600/857;const id=study.id+'-'+view;
  const snapshot={layout,canonical_sha256:hash,scene_revision:revision,storage_revision:null,room_id:room,frame_id:id,snapshot_sha256:crypto.createHash('sha256').update(JSON.stringify(layout)).digest('hex'),camera,asset_urls:assets};
  fs.writeFileSync(site+'/'+id+'.html',template.replaceAll('apartment-capture-canvas','capture-'+id).replace('<head>','<head><meta charset="utf-8">').replace('__APARTMENT_CAPTURE_SNAPSHOT_JSON__',()=>JSON.stringify(snapshot).replace(/</g,'\\u003c')));cameras.push({view,id,...camera});
 }
 write(dir+'/cameras.json',cameras);fs.writeFileSync(dir+'/plan.svg',plan(layout,study.scope));fs.copyFileSync(dir+'/plan.svg',site+'/'+study.id+'-plan.svg');
 const furniture=layout.furniture.filter(f=>study.scope.includes(f.room_id)&&!['rug','tv','stove','ksink','aircon','acwall'].includes(f.type));
 const overlay=layout.interior.objects.filter(o=>study.scope.includes(o.room_id)&&o.placement.mode==='floor');
 const area=furniture.reduce((a,f)=>a+f.w*f.d,0)+overlay.reduce((a,o)=>a+o.width_mm*o.depth_mm,0);
 manifest.push({...study,ops:undefined,revision,canonical:hash,summary:validation.summary,footprint_area_m2:Math.round(area/10000)/100,furniture_count:furniture.length+overlay.length,views:cameras.map(c=>c.id)});
 console.log(JSON.stringify({id:study.id,revision,summary:validation.summary,views:cameras.length}));
}
write(root+'/manifest.json',manifest);
write(root+'/space-decisions.json',{
 status:'EXPLORATORY',canonical_sha256:hash,architectural_changes:[],
 private_hall:{canonical_depth_mm:6206.575-4999.153,modeled_wall_allowance_mm:180,modeled_face_clear_mm:6206.575-4999.153-180,with_250_cabinet_mm:6206.575-4999.153-180-250,decision:'No floor furniture. Mirror and ceiling lights; family linen in expanded bedroom wardrobe.'},
 kitchen_island:{canonical_depth_mm:8960.346-6587.866,modeled_face_depth_mm:8960.346-6587.866-180,north_run_depth_mm:610,trial_island_depth_mm:600,remaining_combined_aisles_mm:8960.346-6587.866-180-610-600,one_cook_work_aisle_guideline_mm:1067,rear_walkway_guideline_mm:914,source:'https://media.nkba.org/uploads/2022/05/Kitchen-Planning-Guidelines.pdf',assessment:'The longitudinal fit leaves only 982 mm for both aisles combined. Rotating a practical island would still require end access in the remaining 1582 mm depth and interfere with east entry / service flow. Reject an island inside the existing enclosed kitchen.'},
 open_kitchen:{status:'TBD architectural option, not approved',decision:'Do not change canonical geometry. A separate wall/structure/extraction and furniture study would be needed after explicit architectural approval. No island substituted for the comfortable six-seat dining arrangement.'},
 measured_candidate:{master_north_bedside_face_gap_mm:5900-(4999.153+90),master_east_main_path_beyond_frame_mm:(4003.559-90)-(1516+2220/2),master_south_bench_approach_mm:(8610-350/2)-(6835+1870/2),bedroom2_wardrobe_front_gap_mm:(4589-600/2)-(2800+1280/2),dressing_between_fronts_mm:(8550-600/2)-(6615+600/2)},
 planting:{decision:'One 1650 mm high specimen in reception, not multiple small floor pots; exact species depends on daylight and household needs, TBD. No kitchen worktop or hall plant added.'},
 accessories:{decision:'Use the existing single large artwork, one sideboard lamp, purposeful rugs and bedroom closed storage. No gallery wall or third reception seating group.'}
});
fs.writeFileSync(site+'/index.html',`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Apartment Type B · Family A.7</title><style>body{background:#f4f0e8;color:#302d28;font:16px/1.6 system-ui;margin:0}main{max-width:1300px;margin:auto;padding:40px}article{background:#fffdf8;padding:26px;border-radius:14px;margin:24px 0}.views{display:grid;grid-template-columns:repeat(auto-fit,minmax(400px,1fr));gap:18px}img{width:100%;border-radius:8px}.plan{max-height:750px;object-fit:contain}a{color:#62583f}table{border-collapse:collapse}td,th{padding:12px;text-align:left;border-bottom:1px solid #dcd3c4}@media(max-width:500px){.views{display:block}main{padding:20px}}</style></head><body><main><p>LOCAL ONLY · Architecture locked · EXPLORATORY</p><h1>Useful density, better organized rooms</h1><p>Family A.7 develops the accepted straight-sofa reception with purposeful storage and quiet decoration, then improves the bedrooms and dressing. The private hall remains a clear passage; the kitchen stays enclosed.</p><p><a href="../project-dossier.html">Project register</a> · <a href="../project-studies-v2/index.html">Reception alternatives / photoreal interpretations</a> · <a href="../project-studies-v4/index.html">Kitchen and laundry</a> · <a href="../home-v7.html">Local Studio A.7</a></p><article><h2>My recommendation</h2><p>Add useful bedroom storage and a south-wall dressing bench; improve the scale of the single reception plant; compose the sideboard wall with the existing artwork and one lamp. Keep the six-seat dining table and open central space. Do not add floor cabinets to the 1027 mm modeled hall: a 250 mm cabinet would leave only 777 mm.</p><p>An island inside the enclosed kitchen is rejected: after the north counter and a modest 600 mm island, only 982 mm would remain for both aisles combined. Opening the kitchen is a separate architectural decision; no walls or openings have been altered for this study.</p></article>${manifest.map(s=>`<article><h2>${escape(s.title)}</h2><p>${escape(s.assessment)}</p><p>${s.revision} · ${s.summary.pass} PASS / ${s.summary.warning} WARNING / ${s.summary.fail} FAIL</p><details><summary>Canonical plan and furniture dimensions</summary><img class="plan" src="${s.id}-plan.svg"></details><div class="views">${s.views.map(v=>`<figure><a href="${v}.html"><img src="${v}.png" alt="${v}"></a><figcaption>${v} · ${v.endsWith('wide')||v.endsWith('dressing')?'Wide 60° overview':'Natural 42°'} · eye 1.70 m</figcaption></figure>`).join('')}</div></article>`).join('')}<p>King-frame footprint is a manufacturer dimension reference (1870 × 2220 mm, 1800 × 2000 mattress); the generic mesh and warm upholstery are not a replica. Single-bed frames reserve 1280 × 2100 mm around 1200 × 2000 mattresses, an INFERRED allowance pending product choice. Generic furniture remains illustrative. Door hinges are inferred, product selection/site survey remain necessary, and inherited bathroom/kitchen warnings are not cleared by this study.</p></main></body></html>`);
