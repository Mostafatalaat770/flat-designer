import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
process.chdir(new URL('..',import.meta.url).pathname);
const version=process.argv[2]||'project-studies-v4';
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
const utilityOps=olive=>{
 const colour=olive?'#969B87':'#C6B18F';
 return [{type:'remove-furniture',furniture_id:'starter-19'},
 update('starter-20',{cx:9381,cy:8038,w:1500,d:600,color:colour,name:'West cooking counter · 1500 mm · oven reserved, SKU TBD'}),
 add('K3-corner','counter','KIT-01',9381,6993,600,610,0,'600 mm closed corner cabinet · access hardware TBD',colour),

 add('K3-dishwasher','dishwasher','KIT-01',10581,6993,600,610,0,'600 mm integrated dishwasher niche · SKU TBD',colour),
 {type:'furniture-variant',furniture_id:'K3-dishwasher',variant:'integrated'},
 add('K3-sink-base','counter','KIT-01',11181,6993,600,610,0,'600 mm sink / waste cabinet',colour),
 add('K3-end-landing','counter','KIT-01',11781,6893,600,410,0,'Shallow 600 × 410 mm refrigerator landing',colour),
 update('starter-21',{cx:11181,cy:6993,w:550,name:'550 mm sink · drain/water positions TBD'}),
 update('starter-22',{cx:9381,cy:7895,name:'600 mm gas hob · ventilation and clearances TBD'}),
 update('starter-23',{cx:12120,cy:8520,rot:180,name:'650 mm fridge envelope · door/ventilation TBD'}),
 {type:'remove-furniture',furniture_id:'starter-24'},
 add('K3-laundry-niche','washer','KIT-01',9981,6993,600,610,0,'600 × 610 mm indoor laundry niche · generic envelope',colour),
 {type:'room-option',room_id:'KIT-01',key:'lighting',value:'downlights'},
 {type:'room-option',room_id:'KIT-01',key:'temperature',value:3000}];
};
const bathStorage=add('B-family-storage','cabinet','BATH-C01',7430,8640,300,300,0,'Closed towel and cleaning storage · 300 mm');
const assessment='Gas cooking on the west run, dishwasher beneath the continuous 1200 mm preparation zone, sink next to it, southeast fridge, shallow landing opposite, and indoor washer niche. Appliance bodies, fitted countertops, cabinet doors, gas/oven heat separation and services still require installation design. Generic viewer meshes show reserved envelopes, not approved cabinet construction.';
const studies=[
 {id:'k3-oak-laundry',title:'Kitchen 3 · Pale oak + indoor laundry',scope:['KIT-01','TER-SVC'],ops:utilityOps(false),assessment},
 {id:'k3-olive-laundry',title:'Kitchen 3 · Muted olive + indoor laundry',scope:['KIT-01','TER-SVC'],ops:utilityOps(true),assessment},
 {id:'home-a-utility',title:'Coordinated candidate · Family A + indoor utility',scope:['RECP-01','KIT-01','TER-SVC','BATH-C01'],ops:[...fuller,...utilityOps(false),bathStorage],assessment:'Current recommended local study: fuller straight-sofa reception, six dining seats, pale oak kitchen with gas, dishwasher and indoor laundry, retained master bathtub and closed family-bathroom storage. Bedrooms and bathroom engineering are still development work.'}
];
const template=read('dist/capture-template.json').html,assets={};
for(const f of fs.readdirSync('dist/art'))if(f.endsWith('.png'))assets['./art/'+f]='data:image/png;base64,'+fs.readFileSync('dist/art/'+f).toString('base64');
const world=(p,h)=>[(p[0]-model.width_mm/2)/1000,h,(p[1]-model.depth_mm/2)/1000];
const views=[['entry','RECP-01',[14740,9740],[13700,4650],42,1.7,1.4],['family','RECP-01',[13600,5600],[10750,2550],42,1.7,1.4],['dining','RECP-01',[13250,9440],[14400,7600],42,1.7,1.4],['kitchen','KIT-01',[12200,7850],[10230,7270],42,1.7,1.25],['laundry','KIT-01',[10750,8250],[10181,6950],42,1.7,1.05],['ensuite','BATH-M01',[6500,7510],[6312,6580],42,1.7,.9],['family-bath','BATH-C01',[7540,8050],[8470,6600],42,1.7,.9]];
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
write(root+'/kitchen-movement.json',{
 status:'EXPLORATORY',canonical_sha256:hash,
 guidance_source:'https://media.nkba.org/uploads/2022/05/Kitchen-Planning-Guidelines.pdf',guidance_is_not_local_code:true,
 verified_user_choices:{hob:'gas',dishwasher:true},
 measured_plan:{fridge_front_y:8195,opposing_shallow_landing_front_y:7098,fridge_working_gap_mm:1097,one_cook_guideline_mm:1067,multiple_cooks_guideline_mm:1219,prep_total_width_mm:1200,prep_depth_mm:610,prep_note:'600 washer + 600 dishwasher under a continuous countertop; no joinery fabrication approved',sink_landing_left_mm:1200,sink_landing_right_mm:600,right_landing_depth_mm:410,hob_landing_north_mm:307,hob_landing_south_mm:593,sink_dishwasher_edge_gap_mm:0,fridge_to_landing_distance_mm:1097,kitchen_entrance_fridge_plan_separation_mm:18.42,dishwasher_side_to_perpendicular_west_counter_mm:600},
 assumed_open_envelopes:{dishwasher:[10281,7298,10881,7898],fridge:[11795,7595,12445,8195],washer:[9683,7298,10279,7710],mutual_overlap:false,scope:'Approximate door envelopes only; no simultaneous user occupancy, door-hinge collision, tolerance or installation certification'},
 washer_reference:{source_status:'REFERENCE',manufacturer:'Bosch',model:'WIW28302GB',product_body_mm:[596,544,818],depth_with_front_door_mm:574,planned_niche_mm:[600,610],url:'https://media3.bosch-home.com/Documents/specsheet/en-GB/WIW28302GB.pdf',viewer:'Generic niche envelope, not product mesh. Continuous worktop / door / service void construction TBD',local_availability:'TBD'},
 laundry_decision:'Indoor installation preferred. Service balcony reserved for drying and utility use; roof alone does not satisfy the manufacturer indoor-use condition.',
 rejected:['Old central fridge: approximately 907 mm to full-depth north run.','Full opposing 600 mm cabinet runs: approximately 992 mm, below one-cook 1067 mm guidance.','Northwest corner fridge: either front orientation conflicts with an adjacent L-run when opened.','West-run washer: open service-balcony door obscures access; rejected after actual screenshot review.','Island: blocks useful routes.'],
 unresolved:['Gas supply, ventilation and manufacturer installation clearances','Oven/hob appliance clearances and gas installation','Continuous fitted countertop and service access','Fridge SKU/hinge/ventilation; 18 mm proximity to entrance requires construction-tolerance review','600 mm DW door projection is assumed; user standing zone and door interaction need selected SKU','Water/drain/electrical connections; washer door beside the west return: verify usable opening with selected installation, do not assume full 130° swing','Sink tap position and actual usable uninterrupted preparation surface','Existing canonical door widths remain fixed; these plans do not enlarge them']
});
fs.writeFileSync(site+'/index.html',`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Apartment Type B · Utility refinement</title><style>body{background:#f4f0e8;color:#302d28;font:16px/1.6 system-ui;margin:0}main{max-width:1250px;margin:auto;padding:40px}article{background:#fffdf8;padding:26px;border-radius:14px;margin:24px 0}.views{display:grid;grid-template-columns:repeat(auto-fit,minmax(290px,1fr));gap:18px}img{width:100%}.plan{max-height:650px;object-fit:contain}a{color:#62583f}</style></head><body><main><p>LOCAL ONLY · Architecture locked · EXPLORATORY</p><h1>A better working kitchen</h1><p>Confirmed gas cooking and dishwasher. Indoor laundry is the recommended direction, with exact services and cabinet construction still TBD. The measured refrigerator gap is 1097 mm; that exceeds the 1067 mm one-cook planning guideline but does not meet the 1219 mm multiple-cook guideline. This is a measured furniture study, not an installation sign-off.</p><p><a href="../project-studies-v2/index.html">Reception, photoreal options and earlier bathroom studies</a> · <a href="../project-dossier.html">Whole-apartment project register</a></p>${manifest.map(s=>`<article><h2>${escape(s.title)}</h2><p>${escape(s.assessment)}</p><p>${s.revision} · ${s.summary.pass} PASS / ${s.summary.warning} WARNING / ${s.summary.fail} FAIL</p><details><summary>Dimensioned canonical furniture plan and assumed appliance opening envelopes</summary><img class="plan" src="${s.id}-plan.svg"></details><div class="views">${s.views.map(v=>`<figure><a href="${v}.html"><img src="${v}.png" alt="${v}"></a><figcaption>${v} · Natural 42° · standing eye 1.70 m</figcaption></figure>`).join('')}</div></article>`).join('')}<p>Generic appliance models do not yet show the final continuous worktop over the integrated dishwasher and washer. Read measured plans and installation notes alongside the images.</p></main></body></html>`);
