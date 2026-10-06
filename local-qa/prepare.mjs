import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..');process.chdir(root);
const qa=path.join(root,'local-qa');
const name=process.argv[2]||'baseline';
const brief=JSON.parse(fs.readFileSync(path.join(qa,'private','production-baseline-brief.json'),'utf8'));
const model=JSON.parse(fs.readFileSync('dist/apartment-model.json','utf8'));
const canonical='dist/sources/Apartment_Master_Spec_Type_B_v0.2.2_Geometry_Heights_Glazing(1).json';
const hash=crypto.createHash('sha256').update(fs.readFileSync(canonical)).digest('hex');
assert.equal(hash,'734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658');
assert.equal(hash,brief.canonical_sha256);
const context=vm.createContext({MODEL:model,INTERIOR_MATERIALS:JSON.parse(fs.readFileSync('interior-materials.json')),structuredClone});
for(const f of ['studio-core.js','interior-core.js','capture-camera.js'])vm.runInContext(fs.readFileSync(f,'utf8'),context);
context.layout=brief.layout;
assert.equal(vm.runInContext('studioSceneKey(layout)',context),brief.scene_revision);
if(name!=='baseline'){
  context.p=JSON.parse(fs.readFileSync(path.join(qa,name+'-proposal.json'),'utf8'));
  try{context.layout=vm.runInContext('studioValidateProposal(p,layout,MODEL)',context);}catch(e){fs.writeFileSync(path.join(qa,name+'-rejected.json'),JSON.stringify(e.validation||{error:e.message},null,2));throw e;}
}
const layout=JSON.parse(JSON.stringify(context.layout));
const revision=vm.runInContext('studioSceneKey(layout)',context);
const validation=vm.runInContext('interiorValidation(layout,MODEL)',context);
fs.writeFileSync(path.join(qa,name+'-layout.json'),JSON.stringify(layout,null,2));
fs.writeFileSync(path.join(qa,name+'-validation.json'),JSON.stringify(validation,null,2));
const asset_urls={};for(const f of fs.readdirSync('dist/art')){if(f.endsWith('.png'))asset_urls['./art/'+f]='data:image/png;base64,'+fs.readFileSync('dist/art/'+f).toString('base64');}
const template=JSON.parse(fs.readFileSync('dist/capture-template.json')).html;
const views=[
  ['entry-natural',[14740,9740],[13700,4650],42],
  ['living-to-dining',[10800,3350],[14200,7950],42],
  ['dining-to-living',[14450,9140],[11000,2800],42],
  ['living-eye',[11400,4570],[10600,1600],42],
  ['dining-eye',[13250,9440],[14400,7600],42],
  ['wide-corner',[12950,9680],[14700,5450],60],
  ['living-family-natural',[13600,5600],[10750,2550],42],
  ['living-family-wide',[13600,5600],[10750,2550],60]
];
const world=(p,height)=>[(p[0]-model.width_mm/2)/1000,height,(p[1]-model.depth_mm/2)/1000];
const out=path.join(qa,'site',name);fs.mkdirSync(out,{recursive:true});
const cameras=[];
for(const [view,p,t,fov] of views){
  context.input={room_id:'RECP-01',position:world(p,1.70),target:world(t,1.40),fov};
  const camera=JSON.parse(JSON.stringify(vm.runInContext('studioCaptureCamera(input,layout,MODEL)',context)));
  camera.viewport={width:1600,height:857};camera.aspect=1600/857;
  const input={layout,canonical_sha256:hash,scene_revision:revision,storage_revision:brief.cloud.storage_revision,room_id:'RECP-01',frame_id:name+'-'+view,snapshot_sha256:crypto.createHash('sha256').update(JSON.stringify(layout)).digest('hex'),camera,asset_urls};
  fs.writeFileSync(path.join(out,view+'.html'),template.replace('<head>','<head><meta charset="utf-8">').replace('__APARTMENT_CAPTURE_SNAPSHOT_JSON__',()=>JSON.stringify(input).replace(/</g,'\\u003c')));
  cameras.push({view,...camera});
}
fs.writeFileSync(path.join(qa,name+'-cameras.json'),JSON.stringify(cameras,null,2));
vm.runInContext(fs.readFileSync('studio-cloud-core.js','utf8'),context);
context.catalog=JSON.parse(fs.readFileSync('studio-catalog.json','utf8'));
const exportBrief=vm.runInContext('studioDesignBrief(layout,MODEL,catalog)',context);
fs.writeFileSync(path.join(qa,name==='pass3'?'reception-a3-brief.json':name+'-brief.json'),JSON.stringify(exportBrief,null,2));
let html=fs.readFileSync('dist/index.html','utf8');
html=html.replace(fs.readFileSync('studio-cloud.js','utf8'),'/* Local QA only: account sync, autosave and polling removed. */');
html=html.replace("const STORE = 'type-b-studio-v1';",`const STORE = 'type-b-local-qa-${name}';`);
html=html.replace('let state = load() || defaultState();','let state = load() || '+JSON.stringify(layout).replace(/</g,'\\u003c')+';');
html=html.replace('</head>','<style>#cloudDesign,#saveAiView{display:none!important}#localOnly{padding:5px 10px;background:#edf3e9;border-radius:6px;color:#344e32;font-size:12px}</style></head>');
html=html.replace('<header>','<header><span id="localOnly">LOCAL ONLY · Reception '+name+' · cloud disconnected</span>');
html=html.replace('Completed edits save to your account. Saved design shows sync status and previous versions.','Edits save to this browser only. Production sync is disconnected.');
html=html.replace("if(location.hash!=='#2d')void setView('3d');",`window.LocalQA={
  info:()=>({canonical:MODEL.canonical_sha256,revision:studioSceneKey(state),fov:camera?.fov,eye:camera?.position.y,lens:walkLens,scaleVisible:scaleRefG?.visible,humanHeight:scaleRefG?new THREE.Box3().setFromObject(scaleRefG).max.y:null,rulerHeight:scaleRefG?.children[4]?.geometry.parameters.height,objects:state.furniture.length}),
  walk:()=>setMode('walk'),
  view:(p,t,fov=42)=>{opt.cut=H;opt.furn=true;sync(true);grow=furnGrow=1;applyGrow();setMode('orbit');anim=fly=null;orbit.enabled=false;camera.position.set(wx(p[0]),1.70,wz(p[1]));orbit.target.set(wx(t[0]),1.40,wz(t[1]));setCameraFov(fov);camera.lookAt(orbit.target);for(const d of doors){d.open=true;d.cur=d.sliding?1:d.a1;if(d.sliding)positionSlide(d);else d.pivot.rotation.y=d.cur;}renderer.render(scene,camera);return LocalQA.info();}
};if(location.hash!=='#2d')void setView('3d');`);
fs.writeFileSync(path.join(qa,'site','index.html'),html);
console.log(JSON.stringify({name,revision,validation:validation.summary,views:views.length,canonical:hash}));
