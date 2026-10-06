import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
process.chdir(new URL('..',import.meta.url).pathname);
const dir='local-qa/realism-r1',site='local-qa/site/realism-r1';
fs.mkdirSync(dir,{recursive:true});fs.mkdirSync(site,{recursive:true});
const model=JSON.parse(fs.readFileSync('dist/apartment-model.json'));
const base=JSON.parse(fs.readFileSync('local-qa/pass3-layout.json'));
const canonical=crypto.createHash('sha256').update(fs.readFileSync('dist/sources/Apartment_Master_Spec_Type_B_v0.2.2_Geometry_Heights_Glazing(1).json')).digest('hex');
assert.equal(canonical,'734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658');
const ctx=vm.createContext({MODEL:model,INTERIOR_MATERIALS:JSON.parse(fs.readFileSync('interior-materials.json')),structuredClone});
for(const f of ['studio-core.js','interior-core.js','capture-camera.js','studio-cloud-core.js'])vm.runInContext(fs.readFileSync(f,'utf8'),ctx);
ctx.layout=base;
const ops=[];
for(const f of base.furniture.filter(f=>f.room_id==='RECP-01'&&f.type==='chair'))ops.push({type:'update-furniture',furniture_id:f.id,changes:{w:510,d:530,product_reference_id:'r1-fiber-side-tube',name:'Fiber side chair dimensional reference · mushroom concept'}});
ops.push({type:'update-furniture',furniture_id:'starter-15',changes:{cy:8520,rot:180,name:'Ensuite WC · rear toward south wall · plumbing TBD'}},
 {type:'update-furniture',furniture_id:'starter-17',changes:{cx:8541,cy:7440,rot:90,name:'Family WC · rear toward east wall · plumbing TBD'}},
 {type:'update-furniture',furniture_id:'starter-18',changes:{w:600,d:460,cx:8500,cy:6526,color:'#C6B18F',name:'600 mm D-Neo basin reference on custom closed vanity',product_reference_id:'r1-dneo-basin-custom-vanity'}},
 {type:'add-furniture',furniture:{id:'R1-ensuite-vanity',type:'vanity',room_id:'BATH-M01',cx:5980,cy:8620,w:600,d:460,rot:180,color:'#C6B18F',variant:'style',status:'EXPLORATORY',name:'600 mm D-Neo basin reference on custom closed vanity',product_reference_id:'r1-dneo-basin-custom-vanity'}});
const tile={schema:'InteriorMaterial/1',id:'r1-bath-porcelain',name:'Warm ivory bathroom porcelain concept',category:'stone',source_status:'GENERIC',base_colour:'#E5DFD3',finish:'matte',roughness:.72,metallic:0,texture_scale_mm:{width:600,height:600},fallback_generic_id:'tile600',notes:'No selected SKU; wet-area slip rating and waterproofing TBD.'};
ops.push({type:'upsert-material',material:tile});
for(const rid of ['BATH-M01','BATH-C01','WC-01']){
 ops.push({type:'set-room-surface-material',room_id:rid,surface:'floor',material_id:tile.id});
 for(const wall of vm.runInContext('interiorSurfaces(MODEL).surfaces',ctx).filter(w=>w.type==='wall'&&w.room_id===rid))ops.push({type:'set-wall-surface-material',host_wall_id:wall.id,material_id:tile.id});
}
ctx.proposal={schema:'ApartmentDesignProposal/2',canonical_sha256:canonical,base_scene_revision:vm.runInContext('studioSceneKey(layout)',ctx),author:'Local realism R1',notes:'Exploratory fixture completion and real chair footprint audit. Architecture locked. Drain/soil-stack positions unverified; plumbing wall feasibility TBD.',operations:ops};
try{ctx.layout=vm.runInContext('studioValidateProposal(proposal,layout,MODEL)',ctx);}catch(e){fs.writeFileSync(dir+'/rejection.json',JSON.stringify(e.validation||{message:e.message},null,2));throw e;}
const layout=JSON.parse(JSON.stringify(ctx.layout)),revision=vm.runInContext('studioSceneKey(layout)',ctx),validation=vm.runInContext('interiorValidation(layout,MODEL)',ctx);
assert.equal(validation.checks.filter(c=>c.status==='FAIL').length,0);
assert.deepEqual(layout.demolished,base.demolished);
for(const f of base.furniture.filter(f=>!['RECP-01','BATH-M01','BATH-C01'].includes(f.room_id)))assert.deepEqual(layout.furniture.find(x=>x.id===f.id),f);
fs.writeFileSync(dir+'/proposal.json',JSON.stringify(ctx.proposal,null,2));fs.writeFileSync(dir+'/layout.json',JSON.stringify(layout,null,2));fs.writeFileSync(dir+'/validation.json',JSON.stringify(validation,null,2));
const references=[{id:'r1-fiber-side-tube',name:'Fiber Side Chair Tube Base',maker:'Muuto',url:'https://www.muuto.com/product/fiber-side-chair-tube-base-p3089/23216-whit_dkye/',type:'chair',dimensions_mm:[510,530,770],variant:'style',hex:null,image:null,checked_on:'2026-10-04',description:'REAL_PRODUCT footprint reference, official seat height460mm. Viewer mesh REFERENCE approximation, mushroom upholstery GENERIC; exact upholstered variant SKU and local availability TBD.'},{id:'r1-dneo-basin-custom-vanity',name:'Duravit D-Neo 236660 basin reference + exploratory custom vanity',maker:'Duravit / custom cabinet',url:'https://la.pro.duravit.com/pro/content/homepage/productos/series/resumen/productos~402880943a1b6e1b013a1bd20b39003d.es-es.html?ncat=washbasins&nser=0998&product=6434569',type:'vanity',dimensions_mm:[600,460,930],variant:'style',hex:null,image:null,checked_on:'2026-10-04',description:'REFERENCE custom assembly, not a purchasable Duravit vanity SKU. REAL_PRODUCT basin2366600000 dimensions600x440x165mm. Custom cabinet envelope600x460mm; mounting height and actual basin/mesh TBD.'}];
ctx.catalog=[...JSON.parse(fs.readFileSync('studio-catalog.json')),...references];
fs.writeFileSync(dir+'/references.json',JSON.stringify(references,null,2));fs.writeFileSync(dir+'/brief.json',JSON.stringify(vm.runInContext('studioDesignBrief(layout,MODEL,catalog)',ctx),null,2));
const sourceCameras=JSON.parse(fs.readFileSync('local-qa/pass3-cameras.json'));
const views=sourceCameras.filter(c=>['living-family-natural','dining-to-living','dining-eye'].includes(c.view)).map(c=>[c.view,'RECP-01',c.position,c.target,c.fov]);
const world=(p,h)=>[(p[0]-model.width_mm/2)/1000,h,(p[1]-model.depth_mm/2)/1000];
views.push(['living-seated-natural','RECP-01',world([9840,2460],1.10),world([12243.688,1779.359],1.15),42]);
for(const [view,rid,p,t,fov] of [['ensuite-natural','BATH-M01',[5800,7410],[6530,8580],42],['ensuite-wide','BATH-M01',[5800,7410],[6530,8580],60],['family-vanity-natural','BATH-C01',[7540,8050],[8470,6600],42],['family-shower-natural','BATH-C01',[7560,6750],[8430,8270],42]])views.push([view,rid,world(p,1.7),world(t,.90),fov]);
const assets={};for(const f of fs.readdirSync('dist/art'))if(f.endsWith('.png'))assets['./art/'+f]='data:image/png;base64,'+fs.readFileSync('dist/art/'+f).toString('base64');
const template=JSON.parse(fs.readFileSync('dist/capture-template.json')).html,cameras=[];
for(const [view,rid,position,target,fov] of views){ctx.input={room_id:rid,position,target,fov};const camera=JSON.parse(JSON.stringify(vm.runInContext('studioCaptureCamera(input,layout,MODEL)',ctx)));camera.viewport={width:1600,height:857};camera.aspect=1600/857;
 const snapshot={layout,canonical_sha256:canonical,scene_revision:revision,storage_revision:null,room_id:rid,frame_id:'realism-r1-'+view,snapshot_sha256:crypto.createHash('sha256').update(JSON.stringify(layout)).digest('hex'),camera,asset_urls:assets};
 fs.writeFileSync(site+'/'+view+'.html',template.replaceAll('apartment-capture-canvas','capture-'+view).replace('<head>','<head><meta charset="utf-8">').replace('__APARTMENT_CAPTURE_SNAPSHOT_JSON__',()=>JSON.stringify(snapshot).replace(/</g,'\\u003c')));cameras.push({view,room_id:rid,...camera});
}
fs.writeFileSync(dir+'/cameras.json',JSON.stringify(cameras,null,2));
console.log(JSON.stringify({revision,canonical,summary:validation.summary,views:cameras.length}));
