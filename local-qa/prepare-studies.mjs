import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
process.chdir(new URL('..',import.meta.url).pathname);
const version=process.argv[2]||'project-studies-v2';
if(!/^project-studies(?:-v[0-9]+)?$/.test(version))throw new Error('Invalid study folder');
const root='local-qa/'+version,site='local-qa/site/'+version;
fs.mkdirSync(root,{recursive:true});fs.mkdirSync(site,{recursive:true});
const read=p=>JSON.parse(fs.readFileSync(p)),write=(p,v)=>fs.writeFileSync(p,JSON.stringify(v,null,2));
const model=read('dist/apartment-model.json'),base=read('local-qa/realism-r1/layout.json');
const hash=crypto.createHash('sha256').update(fs.readFileSync('dist/sources/Apartment_Master_Spec_Type_B_v0.2.2_Geometry_Heights_Glazing(1).json')).digest('hex');
assert.equal(hash,'734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658');
const ctx=vm.createContext({MODEL:model,INTERIOR_MATERIALS:read('interior-materials.json'),structuredClone});
for(const f of ['studio-core.js','interior-core.js','capture-camera.js','studio-cloud-core.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
const run=s=>vm.runInContext(s,ctx);ctx.layout=base;
const update=(id,changes)=>({type:'update-furniture',furniture_id:id,changes});
const object=(id,changes)=>({type:'update-object',object_id:id,changes});
const add=(id,type,room,cx,cy,w,d,rot,name,color='#C6B18F')=>({type:'add-furniture',furniture:{id,type,room_id:room,cx,cy,w,d,rot,name,color,variant:'style',status:'EXPLORATORY'}});
const floorObject=(id,type,cx,cy,w,d,h,variant='plain',colour='#C6B18F')=>({type:'add-object',object:{id,type,variant,room_id:'RECP-01',placement:{mode:'floor'},cx,cy,rotation:0,width_mm:w,depth_mm:d,height_mm:h,material_references:{primary:'a3-pale-oak'},colour,status:'EXPLORATORY',metadata:{role:'Useful family furniture; custom generic concept'}}});
const fuller=[{type:'room-option',room_id:'RECP-01',key:'lighting',value:'track'},object('A-dining-sideboard',{cx:15720,cy:4750,width_mm:2400,depth_mm:400,height_mm:800,metadata:{role:'Closed family storage: dining linens, games, school supplies; custom concept'}}),
 object('A2-living-plant',{cx:15480,cy:3250}),update('starter-40',{w:1200,cy:9450,name:'1200 mm closed entry shoe storage'}),
 floorObject('S1-entry-bench','bench',13420,9950,1000,340,440,'upholstered','#DDD3C4'),
 add('S1-living-side-table','sidetable','RECP-01',9585,4240,460,460,0,'Living side table · remote, drink and book'),
 floorObject('S1-reading-lamp','floor-lamp',10230,4430,360,360,1500,'shade','#B39860')];
// Different use and TV strategies, not three recolourings of one room.
const studies=[
 {id:'r0-reference',title:'R0 · Calibrated existing layout',scope:['RECP-01'],ops:[],assessment:'Control view: R1 layout, now with manufacturer seat/back height corrections.'},
 {id:'rA-layered',title:'A · Layered warm family',scope:['RECP-01'],ops:fuller,assessment:'Recommended starting direction: add useful storage, entry bench, side table and reading light while keeping straight sofa and open centre.'},
 {id:'rB-chaise',title:'B · Compact chaise family lounge',scope:['RECP-01'],ops:[...fuller,{type:'remove-furniture',furniture_id:'starter-28'},add('S2-compact-chaise','cornersofa','RECP-01',9860,2460,2880,1545,270,'Compact chaise · generic composition · SKU TBD','#DFD3BB'),update('starter-29',{cx:11300})],assessment:'More relaxed lounging and higher occupied footprint. Generic 2880 × 1545 composition, not a verified Muuto SKU. Inspect sofa-to-coffee and coffee-to-TV gaps before selection.'},
 {id:'rC-reversed',title:'C · Soft sculptural, reversed TV wall',scope:['RECP-01'],ops:[...fuller,update('starter-28',{cx:11890,cy:2460,w:2800,d:1000,rot:90,variant:'cocoon',product_reference_id:null,color:'#E0D9CC',name:'Sculptural family sofa · generic, not exact Marenco SKU'}),update('starter-30',{cx:9300,cy:1800,rot:270,color:'#9C8064'}),update('starter-31',{cx:9220,cy:1780,rot:270}),update('starter-32',{cx:10400,cy:4270,rot:225,color:'#8B8F77'}),update('S1-living-side-table',{cx:11890,cy:4210}),object('S1-reading-lamp',{cx:9500,cy:4480}),object('A3-living-art',{placement:{mode:'wall',host_wall_id:'WALL-RECP-01-09',offset_mm:70,elevation_mm:1080,inset_mm:12}})],assessment:'More expressive cocoon silhouette with television west and sofa east. Tests a real change in visual hierarchy; Marenco is an aesthetic reference only. Fixed 42° views allow a fair comparison.'}
];
const kitchenOps=olive=>{
 const colour=olive?'#969B87':'#C6B18F';
 return [{type:'remove-furniture',furniture_id:'starter-19'},update('starter-20',{cx:9381,cy:8038,w:1500,d:600,color:colour,name:'1500 mm west hob counter · custom concept'}),
 add('K-corner','counter','KIT-01',9381,6993,600,610,0,'600 mm closed corner base · access solution TBD',colour),
 add('K-prep','counter','KIT-01',10181,6993,1000,610,0,'1000 mm continuous preparation counter',colour),
 add('K-sink-base','counter','KIT-01',11081,6993,800,610,0,'800 mm sink/waste cabinet',colour),
 add('K-dishwasher','dishwasher','KIT-01',11781,6988,600,600,0,'600 mm dishwasher envelope · appliance SKU TBD',colour),
 update('starter-21',{cx:11081,cy:6988,name:'750 mm sink · plumbing location TBD'}),update('starter-22',{cx:9381,cy:8048}),
 update('starter-23',{cx:10850,cy:8530,name:'650 mm fridge envelope · door/ventilation SKU TBD'}),
 add('K-landing','counter','KIT-01',11570,8575,600,410,180,'600 × 410 mm fridge landing counter',colour),
 {type:'furniture-variant',furniture_id:'K-dishwasher',variant:'integrated'},
 {type:'room-option',room_id:'KIT-01',key:'lighting',value:'downlights'},
 {type:'room-option',room_id:'KIT-01',key:'temperature',value:3000}];
};
studies.push({id:'kA-oak',title:'Kitchen A · Pale oak working L',scope:['KIT-01'],ops:kitchenOps(false),assessment:'Dedicated 1000 mm prep section; sink and adjacent dishwasher; west cooking run; south fridge and shallow landing. Open-appliance envelopes are separately checked. Appliance choices and plumbing are TBD.'},
 {id:'kB-olive',title:'Kitchen B · Muted olive working L',scope:['KIT-01'],ops:kitchenOps(true),assessment:'Same working geometry as kitchen A, alternative quieter olive cabinet finish. Pale worktop concept with Dekton Aeris as real material reference, not a specified installation.'},
 {id:'bA-tub',title:'Bathroom A · Retain family bathtub',scope:['BATH-M01','BATH-C01'],ops:[add('B-family-storage','cabinet','BATH-C01',7430,8640,300,300,0,'Closed towel and cleaning storage · 300 mm')],assessment:'Retain ensuite 1500 × 750 tub and family 900 × 900 shower; complete closed towel storage. Existing drainage, falls and ventilation remain TBD.'},
 {id:'bB-shower',title:'Bathroom B · Ensuite walk-in shower study',scope:['BATH-M01','BATH-C01'],ops:[{type:'remove-furniture',furniture_id:'starter-14'},add('B-ensuite-shower','shower','BATH-M01',6312,6707,1500,800,0,'1500 × 800 shower envelope · drain/door/glass TBD','#C0D6DF'),add('B-family-storage','cabinet','BATH-C01',7430,8640,300,300,0,'Closed towel and cleaning storage · 300 mm')],assessment:'Exploratory replacement of movable bathtub fixture with generous shower; walls and bathroom door unchanged. Wet-area engineering and actual shower screen specification not yet approved.'});
const template=read('dist/capture-template.json').html,assets={};
for(const f of fs.readdirSync('dist/art'))if(f.endsWith('.png'))assets['./art/'+f]='data:image/png;base64,'+fs.readFileSync('dist/art/'+f).toString('base64');
const world=(p,h)=>[(p[0]-model.width_mm/2)/1000,h,(p[1]-model.depth_mm/2)/1000];
const views=[['entry','RECP-01',[14740,9740],[13700,4650],42,1.7,1.4],['family','RECP-01',[13600,5600],[10750,2550],42,1.7,1.4],['dining','RECP-01',[13250,9440],[14400,7600],42,1.7,1.4],['kitchen','KIT-01',[12200,7850],[10230,7270],42,1.7,1.25],['ensuite','BATH-M01',[6500,7510],[6312,6580],42,1.7,.9],['family-bath','BATH-C01',[7540,8050],[8470,6600],42,1.7,.9]];
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
 if(scope.includes('KIT-01')){for(const [name,x,y,w,d] of [['DW open · 600',11781,7588,600,600],['Fridge open · 600',10850,7905,650,600]])s+=`<rect x="${x-w/2}" y="${y-d/2}" width="${w}" height="${d}" fill="#d88358" fill-opacity=".2" stroke="#bf673d" stroke-width="15" stroke-dasharray="55 25"/><text class="small" x="${x}" y="${y}" text-anchor="middle">${name}</text>`;}
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
 ctx.catalog=[...read('studio-catalog.json'),...read('local-qa/realism-r1/references.json')];write(dir+'/brief.json',run('studioDesignBrief(layout,MODEL,catalog)'));
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
write(root+'/kitchen-movement.json',{status:'EXPLORATORY',wall_face_allowance_mm:90,full_opposing_600_runs_clear_mm:Math.round(8960.346-6587.866-180-1200),nkba_planning_reference_url:'https://media.nkba.org/uploads/2022/05/Kitchen-Planning-Guidelines.pdf',guidance_not_local_code:true,working_L:{prep_mm:1000,prep_depth_mm:610,preferred_guideline_depth_mm:610,prep_depth_shortfall_mm:0,hob_landing_north_mm:460,hob_landing_south_mm:440,dishwasher_adjacent_sink:true,dishwasher_open_envelope_mm:[11481,7288,12081,7888],fridge_open_envelope_mm:[10525,7605,11175,8205],open_envelopes_overlap:false,between_north_front_and_south_landing_mm:1072,entrance_to_service_route:'East entry through centre, then west of south fridge to service opening. Exact door hinges, ventilation clearances, and person + open-appliance interaction need appliance specs.'},rejected:['Full-depth opposing north/south run: approximately 992 mm aisle, below 1067 mm one-cook planning guidance.','Island: reduces the existing working and through routes.'],assumptions:['650 mm wide fridge envelope, not selected SKU','600 mm integrated dishwasher','600 mm hob; gas/electric TBD','Washing machine retained on service terrace','North prep/sink/corner counters610 mm deep; exact joinery and corner access hardware TBD']});
fs.writeFileSync(site+'/index.html',`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Apartment Type B · Whole apartment study</title><style>body{margin:0;background:#f4f0e8;color:#302d28;font:16px/1.6 system-ui}main{max-width:1250px;margin:auto;padding:40px}h1{font-size:38px;line-height:1.15}h2{font-size:25px}article{padding:26px;background:#fffdf8;border-radius:14px;margin:28px 0}.views{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:18px}.views img{width:100%;border-radius:8px}a{color:#68624c}svg,img.plan{width:100%;max-height:650px;object-fit:contain}small{color:#756d60}.tag{background:#e9e4d9;padding:4px 8px;border-radius:5px}table{border-collapse:collapse}td,th{padding:10px 16px;border-bottom:1px solid #ded7cc;text-align:left}</style></head><body><main><span class="tag">LOCAL ONLY · Architecture locked · Exploratory</span><h1>A home worth developing</h1><p>Whole-apartment design study, 4 October 2026. Useful furnishing density, family comfort and coherent materials. Options build on recovered live revision scene-c286be16 through A3 and R1; production remains untouched.</p><p><strong>My starting recommendation:</strong> A, layered warm family, with the pale oak working kitchen and the bathtub retained until the family bathing brief is settled. B adds lounging; C tests a different TV wall. These are reversible studies, not final procurement or installation drawings.</p><table><tr><th>Reception</th><th>Occupied footprint*</th><th>Items</th><th>Validation</th></tr>${manifest.filter(s=>s.id.startsWith('r')).map(s=>`<tr><td>${escape(s.title)}</td><td>${s.footprint_area_m2} m²</td><td>${s.furniture_count}</td><td>${s.summary.fail} fail · ${s.summary.warning} warnings</td></tr>`).join('')}</table><small>*Sum of furniture footprint envelopes excluding rugs and TV. Chaise envelope includes its unoccupied inner corner; not an exact measure of floor coverage, density or usable seating.</small>${manifest.map(s=>`<article id="${s.id}"><h2>${escape(s.title)}</h2><p>${escape(s.assessment)}</p><small>${s.revision} · ${s.summary.pass} PASS / ${s.summary.warning} WARNING / ${s.summary.fail} FAIL. Warnings require spatial interpretation.</small><details><summary>Measured canonical plan with furniture dimensions</summary><img class="plan" src="${s.id}-plan.svg"></details><div class="views">${s.views.map(v=>`<figure><a href="${v}.html"><img src="${v}.png" alt="${escape(v)} · Natural 42 degree model view"></a><figcaption>${escape(v)} · Natural 42° · eye 1.70 m</figcaption></figure>`).join('')}</div></article>`).join('')}<article><h2>What remains to resolve</h2><p>Kitchen appliance selection, openings while appliances are in use, upper cabinet and extraction design; bathroom drains, waterproofing, screen doors and towel access; bedrooms, dressing, laundry and terrace detail; real product finishes and local availability; lighting circuits and HVAC feasibility. No invented ducted system is assumed inside the 130 mm ceiling void.</p><p>The 3D viewer is a dimensional concept model. Previous generated photoreal images are separately labelled exploratory visual interpretations; neither its generic meshes nor AI images represent final manufacturer CAD.</p><a href="../realism-r1/review.html">Earlier realism study</a></article></main></body></html>`);
