/* Real SQL/R2 adapters and PNG fixtures; provider calls are mocked, not WebGL. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {createRequire} from 'node:module';
import worker from './dist/server/index.js';
import {LocalD1,api,rpc,clone,saveInput,key} from './qa-cloud-support.mjs';
const require=createRequire(import.meta.url),{createCanvas}=require(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas');
const template=JSON.parse(fs.readFileSync('dist/capture-template.json','utf8')),fixture=JSON.parse(fs.readFileSync('fixtures/agent-starter-brief.json','utf8'));
const model=JSON.parse(fs.readFileSync('dist/apartment-model.json','utf8')),materials=JSON.parse(fs.readFileSync('interior-materials.json','utf8'));
const c=vm.createContext({HOST_MODEL:model,INTERIOR_MATERIALS:materials});
vm.runInContext(['studio-core.js','interior-core.js','studio-cloud-core.js','studio-storage.js','capture-camera.js'].map(p=>fs.readFileSync(p,'utf8')).join('\n'),c);
const evaluate=s=>vm.runInContext(s,c);
assert.ok(!template.html.includes('void cloudConnect()'));
assert.ok(!template.html.includes('let state = load() || defaultState();'));
assert.ok(!template.html.includes('type="importmap"'));
assert.ok(!/<script\b[^>]*src=/.test(template.html));
assert.ok(!/<img\b[^>]*\bsrc=/.test(template.html));
assert.ok(template.html.includes("connect-src 'none'"));
const {JSDOM}=require('jsdom'),captureDom=new JSDOM(template.html);
assert.equal(captureDom.window.getComputedStyle(captureDom.window.document.getElementById('view3d')).visibility,'visible','The standalone canvas host must be visible without manual setView');
assert.equal(captureDom.window.getComputedStyle(captureDom.window.document.querySelector('.app>header')).display,'none','Capture must exclude viewer header controls');
captureDom.window.close();
const scriptPattern=/<script\b([^>]*)>([\s\S]*?)<\/script>/g;
for(const script of template.html.matchAll(scriptPattern))if(!script[1].includes('application/json'))new vm.Script(script[2]);

class Bucket{
  constructor(){this.objects=new Map();this.failPutAt=0;this.puts=0;}
  async put(k,bytes){if(++this.puts===this.failPutAt)throw new Error('Injected object-storage failure');this.objects.set(k,new Uint8Array(bytes));}
  async get(k){const bytes=this.objects.get(k);return bytes?{arrayBuffer:async()=>bytes.slice().buffer}:null;}
  async delete(k){this.objects.delete(k);}
}
const assets={fetch:async request=>{
  const pathname=new URL(request.url).pathname,filename=path.join('dist',pathname);
  if(!fs.existsSync(filename))return new Response('Missing',{status:404});
  return new Response(fs.readFileSync(filename),{headers:{'Content-Type':pathname.endsWith('.png')?'image/png':'application/json'}});
}};
const png=createCanvas(1280,720),ctx=png.getContext('2d');ctx.fillStyle='#ebe1cc';ctx.fillRect(0,0,1280,720);ctx.fillStyle='#567953';ctx.fillRect(160,160,480,300);const pngBase64=png.toBuffer('image/png').toString('base64');
const inputFromHtml=html=>JSON.parse(html.match(/<script id="apartment-capture-input" type="application\/json">([\s\S]*?)<\/script>/)[1]);
class Provider{
  constructor(){this.calls=0;this.inputs=[];this.hook=null;this.mismatch=null;this.failAt=0;}
  async quickAction(action,options){
    assert.equal(action,'snapshot');assert.ok(!options.url);assert.ok(!options.setExtraHTTPHeaders);assert.ok(!options.cookies);
    assert.deepEqual(options.viewport,{width:1280,height:720,deviceScaleFactor:1});
    const input=inputFromHtml(options.html);this.calls++;this.inputs.push(input);
    assert.equal(key(input.layout),input.scene_revision);assert.equal(input.canonical_sha256,model.canonical_sha256);
    assert.equal(input.camera.viewer.cut_height_m,2.5);assert.equal(input.camera.viewer.furnishings_visible,true);
    assert.equal(options.waitForSelector.selector,'canvas[data-capture-ready="'+input.frame_id+'"]');
    assert.equal(options.waitForSelector.visible,true,'An existing but hidden canvas must never qualify as ready');
    assert.deepEqual(options.formats,['content','screenshot']);assert.equal(options.screenshotOptions.type,'png');
    assert.ok(!options.html.includes('owner_id'));assert.ok(!options.html.includes('verified-email@example.test'));
    if(this.hook)await this.hook(input,this.calls);
    if(this.calls===this.failAt)return new Response('Unavailable',{status:503});
    const frame={schema:'ApartmentSceneCaptureFrame/1',canonical_sha256:input.canonical_sha256,snapshot_sha256:input.snapshot_sha256,rendered_layout_json:JSON.stringify(input.layout),scene_revision:input.scene_revision,storage_revision:input.storage_revision,room_id:input.room_id,camera:input.camera,timestamp:new Date().toISOString(),assets:{pending:0,fallbacks:[]},renderer:{engine:'Three.js WebGL',revision:'160'}};
    if(this.mismatch==='scene')frame.scene_revision='scene-0000';
    if(this.mismatch==='camera')frame.camera={...frame.camera,fov:frame.camera.fov+1};
    if(this.mismatch==='layout')frame.rendered_layout_json=JSON.stringify({...input.layout,furniture:[]});
    if(this.mismatch==='texture')frame.assets.fallbacks=['./art/warm.png'];
    if(this.mismatch==='pending')frame.assets.pending=1;
    if(this.mismatch==='engine')frame.renderer.engine='Canvas mock';
    return new Response(JSON.stringify({success:true,result:{content:'<script id="apartment-capture-result" type="application/json">'+JSON.stringify(frame).replace(/</g,'\\u003c')+'</script>',screenshot:this.mismatch==='png'?'invalid':pngBase64}}),{headers:{'Content-Type':'application/json'}});
  }
}
const env={DB:new LocalD1(),BUCKET:new Bucket(),ASSETS:assets,BROWSER:new Provider()},owner='capture-owner';
let saved=(await api(env,owner,'/api/design','PUT',saveInput({initialized:false},clone(fixture.layout),'capture-initial-save'))).data;
assert.equal(saved.initialized,true);
const original=clone(saved.brief.layout),geometry=JSON.stringify(model),originalHistory=env.DB.sql.prepare('SELECT COUNT(*) AS n FROM apartment_design_history').get().n;
const request=(id,preset='entry-overview')=>({room_id:'RECP-01',preset,expected_scene_revision:saved.scene_revision,request_id:id});
const error=(result,code)=>{assert.equal(result.isError,true);assert.equal(result.structuredContent.error,code);};
let result=await rpc(env,owner,'capture_apartment_scene_view',request('capture-single-001'));
assert.equal(result.isError,false,JSON.stringify(result));assert.equal(result.structuredContent.scene_revision,saved.scene_revision);
assert.equal(result.structuredContent.cloud.storage_revision,saved.storage_revision);assert.equal(result.content.filter(v=>v.type==='image').length,1);
assert.equal(result.content.find(v=>v.type==='image').data,pngBase64);assert.ok(!JSON.stringify(result.structuredContent).includes(pngBase64));
const singleView=result.structuredContent;
assert.equal(env.BUCKET.objects.size,1);assert.equal(env.BROWSER.calls,1);
const reordered={request_id:'capture-single-001',expected_scene_revision:saved.scene_revision,preset:'entry-overview',room_id:'RECP-01'};
result=await rpc(env,owner,'capture_apartment_scene_view',reordered);assert.equal(result.isError,false);assert.equal(result.structuredContent.idempotent,true);assert.equal(result.structuredContent.view_id,singleView.view_id);assert.equal(env.BROWSER.calls,1);
error(await rpc(env,owner,'capture_apartment_scene_view',request('capture-single-001','wide-corner')),'request_id_conflict');
let beforeCalls=env.BROWSER.calls;
error(await rpc(env,owner,'capture_apartment_scene_view',{...request('capture-stale-before'),expected_scene_revision:'scene-0000'}),'stale_scene_revision');
assert.equal(env.BROWSER.calls,beforeCalls);
error(await rpc(env,'another-owner','capture_apartment_scene_view',request('capture-private-other')),'design_not_initialized');
assert.equal((await api(env,'another-owner','/api/scene-view/'+singleView.view_id+'/image')).status,404);

// Five requested presets share the exact saved state and commit together.
const views=['entry-overview','living-to-dining','dining-to-living','terrace-to-room','wide-corner'].map(preset=>({room_id:'RECP-01',preset}));
result=await rpc(env,owner,'capture_apartment_scene_views',{views,expected_scene_revision:saved.scene_revision,request_id:'capture-batch-all-001'});
assert.equal(result.isError,false,JSON.stringify(result));assert.equal(result.structuredContent.views.length,5);assert.equal(result.content.filter(v=>v.type==='image').length,5);
assert.ok(result.structuredContent.views.every(v=>v.scene_revision===saved.scene_revision&&v.cloud.storage_revision===saved.storage_revision));
assert.equal(new Set(result.structuredContent.views.map(v=>JSON.stringify(v.camera.position))).size,5);
assert.ok(env.BROWSER.inputs.every(i=>JSON.stringify(i.layout)===JSON.stringify(original)));
const latestView=result.structuredContent.views.at(-1);
result=await rpc(env,owner,'get_saved_apartment_scene_view',{room_id:'RECP-01'});assert.equal(result.structuredContent.view_id,latestView.view_id);assert.equal(result.content.at(-1).type,'image');
result=await rpc(env,owner,'create_apartment_render_brief',{brief:saved.brief,room_id:'RECP-01',saved_view_id:singleView.view_id});assert.equal(result.isError,false);assert.equal(result.structuredContent.saved_view.view_id,singleView.view_id);assert.equal(result.structuredContent.camera_reference_required,false);
beforeCalls=env.BROWSER.calls;
result=await rpc(env,owner,'capture_apartment_scene_views',{views,expected_scene_revision:saved.scene_revision,request_id:'capture-batch-all-001'});assert.equal(result.structuredContent.idempotent,true);assert.equal(env.BROWSER.calls,beforeCalls);

// Custom cameras use documented Three.js metres, never free plan coordinates.
const camera=singleView.camera;
result=await rpc(env,owner,'capture_apartment_scene_view',{room_id:'RECP-01',position:camera.position,target:camera.target,fov:52,expected_scene_revision:saved.scene_revision,request_id:'capture-custom-001'});
assert.equal(result.isError,false);assert.deepEqual(result.structuredContent.camera.position,camera.position);assert.equal(result.structuredContent.camera.fov,52);
for(const bad of [{room_id:'missing'}, {position:[0,2,0],target:[0,1,0],preset:undefined}, {position:camera.position,preset:undefined}, {fov:121}, {geometry:{}}, {preset:'invented'}, {position:camera.position,target:camera.target}, {preset:'terrace-to-room',room_id:'BR-01'}, {preset:'living-to-dining',room_id:'BR-01'}])assert.equal((await rpc(env,owner,'capture_apartment_scene_view',{...request('capture-invalid-'+Math.random().toString(36).slice(2)),...bad})).isError,true);

// Material references, local artworks and hostile text stay literal snapshot data.
const warm=clone(original);warm.decor.active='warm';warm.rooms['RECP-01'].name='Living </script><script>globalThis.captureAttack=1</script>';
saved=(await api(env,owner,'/api/design','PUT',saveInput(saved,warm,'capture-warm-save'))).data;assert.equal(saved.initialized,true);
result=await rpc(env,owner,'capture_apartment_scene_view',request('capture-warm-art-001'));assert.equal(result.isError,false,JSON.stringify(result));
const artInput=env.BROWSER.inputs.at(-1);assert.ok(artInput.asset_urls['./art/warm.png'].startsWith('data:image/png;base64,'));assert.equal(artInput.layout.rooms['RECP-01'].name,warm.rooms['RECP-01'].name);

// Provider rejects stale/corrupt frames and failed maps. No partial views persist.
for(const mismatch of ['scene','camera','layout','texture','pending','engine','png']){
  const count=env.DB.sql.prepare('SELECT COUNT(*) AS n FROM apartment_scene_views').get().n,objects=env.BUCKET.objects.size;
  env.BROWSER.mismatch=mismatch;result=await rpc(env,owner,'capture_apartment_scene_view',request('capture-bad-frame-'+mismatch));assert.equal(result.isError,true);
  assert.equal(env.DB.sql.prepare('SELECT COUNT(*) AS n FROM apartment_scene_views').get().n,count);assert.equal(env.BUCKET.objects.size,objects);
}
env.BROWSER.mismatch=null;
const smallBatch={views:views.slice(0,2),expected_scene_revision:saved.scene_revision,request_id:'capture-batch-fail-001'};
let count=env.DB.sql.prepare('SELECT COUNT(*) AS n FROM apartment_scene_views').get().n,objects=env.BUCKET.objects.size;
env.BROWSER.failAt=env.BROWSER.calls+2;result=await rpc(env,owner,'capture_apartment_scene_views',smallBatch);error(result,'headless_renderer_unavailable');
assert.equal(env.DB.sql.prepare('SELECT COUNT(*) AS n FROM apartment_scene_views').get().n,count);assert.equal(env.BUCKET.objects.size,objects);
env.BROWSER.failAt=0;result=await rpc(env,owner,'capture_apartment_scene_views',smallBatch);assert.equal(result.isError,false);assert.equal(result.structuredContent.views.length,2);

// A concurrent same-request call cannot start duplicate paid renders.
const concurrent=request('capture-concurrent-001');let release,started;
const gate=new Promise(r=>release=r),firstStarted=new Promise(r=>started=r);
env.BROWSER.hook=async()=>{started();await gate;};
const pending=rpc(env,owner,'capture_apartment_scene_view',concurrent);await firstStarted;
error(await rpc(env,owner,'capture_apartment_scene_view',concurrent),'capture_in_progress');
release();assert.equal((await pending).isError,false);env.BROWSER.hook=null;

// Mid-render edits and storage failures leave no partial batch or R2 orphans.
count=env.DB.sql.prepare('SELECT COUNT(*) AS n FROM apartment_scene_views').get().n;objects=env.BUCKET.objects.size;
let edited=false;
env.BROWSER.hook=async()=>{if(!edited){edited=true;const next=clone(saved.brief.layout);next.rooms['RECP-01'].mat=next.rooms['RECP-01'].mat==='walnut'?'wood':'walnut';saved=(await api(env,owner,'/api/design','PUT',saveInput(saved,next,'capture-midflight-edit'))).data;}};
const oldRevision=smallBatch.expected_scene_revision;
result=await rpc(env,owner,'capture_apartment_scene_views',{...smallBatch,request_id:'capture-race-batch-001'});error(result,'stale_scene_revision');
assert.equal(env.DB.sql.prepare('SELECT COUNT(*) AS n FROM apartment_scene_views').get().n,count);assert.equal(env.BUCKET.objects.size,objects);env.BROWSER.hook=null;
error(await rpc(env,owner,'capture_apartment_scene_view',{...request('capture-stale-retry'),expected_scene_revision:oldRevision}),'stale_scene_revision');
env.BUCKET.failPutAt=env.BUCKET.puts+2;
result=await rpc(env,owner,'capture_apartment_scene_views',{...smallBatch,expected_scene_revision:saved.scene_revision,request_id:'capture-r2-batch-001'});assert.equal(result.isError,true);
assert.equal(env.DB.sql.prepare('SELECT COUNT(*) AS n FROM apartment_scene_views').get().n,count);assert.equal(env.BUCKET.objects.size,objects);env.BUCKET.failPutAt=0;

// No configured service means an explicit unavailable response, not a fake PNG.
const noProvider={...env,BROWSER:undefined};
result=await rpc(noProvider,owner,'get_apartment_design_context');assert.equal(result.structuredContent.scene_capture.available,false);
error(await rpc(noProvider,owner,'capture_apartment_scene_view',request('capture-no-provider')),'headless_renderer_not_configured');
assert.equal(env.DB.sql.prepare('SELECT COUNT(*) AS n FROM apartment_scene_capture_requests WHERE request_id=?').get('capture-no-provider').n,0);
// Exercise the production REST branch with Workers' actual redirect constraint.
// The browser-binding mock alone cannot catch Request construction failures.
const nativeRequest=globalThis.Request,nativeFetch=globalThis.fetch,restProvider=new Provider();
const restEnv={...noProvider,CAPTURE_CLOUDFLARE_ACCOUNT_ID:'a'.repeat(32),CAPTURE_CLOUDFLARE_API_TOKEN:'fixture-render-token-1234567890'};
try{
 globalThis.Request=class extends nativeRequest{constructor(input,options){if(options?.redirect==='error')throw new TypeError('Workers does not support redirect:error');super(input,options);}};
 globalThis.fetch=async req=>{assert.equal(req.redirect,'manual');assert.equal(req.headers.get('Authorization'),'Bearer '+restEnv.CAPTURE_CLOUDFLARE_API_TOKEN);assert.equal(new URL(req.url).hostname,'api.cloudflare.com');return restProvider.quickAction('snapshot',JSON.parse(await req.text()));};
 result=await rpc(restEnv,owner,'capture_apartment_scene_view',request('capture-rest-workers-001'));
 assert.equal(result.isError,false);assert.equal(restProvider.calls,1);assert.ok(result.content.some(c=>c.type==='image'));
 const invalidToken='fixture-secret-with internal-space';
 result=await rpc({...restEnv,CAPTURE_CLOUDFLARE_API_TOKEN:invalidToken},owner,'capture_apartment_scene_view',request('capture-invalid-token'));
 error(result,'invalid_renderer_configuration');assert.ok(!JSON.stringify(result).includes(invalidToken));assert.equal(restProvider.calls,1);
}finally{globalThis.Request=nativeRequest;globalThis.fetch=nativeFetch;}
assert.equal(JSON.stringify(model),geometry);
// Captures never save designs. Only the two explicit fixture edits added history.
assert.equal(env.DB.sql.prepare('SELECT COUNT(*) AS n FROM apartment_design_history').get().n,originalHistory+2);
assert.deepEqual((await api(env,owner)).data.brief.layout,saved.brief.layout);

// Shared async readiness tracks art maps too; errors never yield headless ready.
const ready=vm.createContext({THREE:{TextureLoader:class{load(url,loaded,progress,error){queueMicrotask(()=>url==='bad'?error(new Error('bad')):loaded({url}));return {url};}}},globalThis:null,queueMicrotask,setTimeout,clearTimeout,Date});ready.globalThis=ready;
vm.runInContext(fs.readFileSync('scene-asset-readiness.js','utf8'),ready);
await vm.runInContext("new THREE.TextureLoader().load('art');waitApartmentSceneAssets()",ready);
assert.equal(vm.runInContext('apartmentSceneAssetsPending.size',ready),0);
ready.APARTMENT_CAPTURE_INPUT={asset_urls:{}};
await assert.rejects(vm.runInContext("new THREE.TextureLoader().load('bad');waitApartmentSceneAssets()",ready),/failed to load/);

const report={result:'PASS',checks:['ten-tool contract','isolated production-renderer bundle syntax','all five camera presets and custom camera references','identity isolation','PNG image content and exact camera/revision metadata','current-scene render brief integration','retry idempotency and concurrent request lease','before/after-render stale revision rejection','atomic batch persistence and R2 cleanup','artwork embedding and literal hostile text','mismatched scenes/cameras/maps/renderer rejected','shared material/artwork readiness','canonical geometry and saved-design history unchanged by capture'],verification:'Node SQLite/R2 adapters with genuine PNG fixtures and a mocked Cloudflare provider; no actual headless WebGL or live provider capture was performed.'};
fs.writeFileSync('capture-validation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
