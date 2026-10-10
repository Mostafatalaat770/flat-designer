/**
 * Multi-variant verified WebGL rendering: ONE Chromium instance and a global
 * concurrent view pool across several exact snapshots. Original single-scene
 * renderer is unchanged. No production Studio, architecture or master writes.
 *
 * RENDER_OUT_DIR=renders/batch RENDER_CONCURRENCY=2 node scripts/render-variants.mjs \
 *    design-development/advisor/a10/current-1000.json \
 *    design-development/advisor/a10/flex-no-desk.json
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import { chromium } from 'playwright';
import { captureCanvasPng } from './capture-canvas-png.mjs';
import { makeBatchPlan } from './render-batch-plan.mjs';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';

const files=process.argv.slice(2);
const inputs=await Promise.all(files.map(async file=>({
 file, snapshot:JSON.parse(await fs.readFile(file,'utf8'))
})));
const plan=makeBatchPlan(inputs);
const domain=createApartmentDomain(process.cwd());
for (const v of plan.variants) {
 assert.equal(v.snapshot.canonical_sha256,domain.model.canonical_sha256,
   'Comparison architecture must match built canonical');
 assert.equal(v.snapshot.scene_revision,domain.revision(v.snapshot.layout),
   'Stale or manipulated scene_revision: '+v.file);
}
const output=process.env.RENDER_OUT_DIR||'renders/variants';
const template=JSON.parse(await fs.readFile('dist/capture-template.json','utf8')).html;
await fs.mkdir(output,{recursive:true});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const started=new Date().toISOString();
const perfStart=performance.now();
const pathsByVariant=new Map();
for(const v of plan.variants){
 const dir=path.join(output,v.key);
 pathsByVariant.set(v.key,dir);
 await fs.mkdir(dir,{recursive:true});
}
function safeJson(value){
 return JSON.stringify(value).replace(/</g,'\\u003c');
}
function fnv1a(str){
 let h=0x811c9dc5;
 for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,0x01000193);}
 return (h>>>0).toString(16).padStart(8,'0');
}
function mimeFor(file){
 const ext=path.extname(file).toLowerCase();
 if(ext==='.png')return 'image/png';
 if(ext==='.jpg'||ext==='.jpeg')return 'image/jpeg';
 if(ext==='.webp')return 'image/webp';
 throw new Error('Unsupported render asset '+file);
}
const assets=new Map();
async function encodeAsset(file){
 if(!assets.has(file)){
  const abs=path.resolve('dist',file.slice(2));
  const bytes=await fs.readFile(abs);
  assert.ok(bytes.byteLength<=8*1024*1024,'Asset over 8MB: '+file);
  assets.set(file,'data:'+mimeFor(file)+';base64,'+bytes.toString('base64'));
 }
 return assets.get(file);
}
const artFiles=(await fs.readdir('dist/art').catch(e=>e?.code==='ENOENT'?[]:Promise.reject(e)))
 .filter(x=>/\.(png|jpe?g|webp)$/i.test(x)).map(x=>'./art/'+x);
function visit(value, found){
 if(typeof value==='string'&&value.startsWith('./'))found.add(value);
 else if(Array.isArray(value))for(const x of value)visit(x,found);
 else if(value&&typeof value==='object')for(const x of Object.values(value))visit(x,found);
}
async function getAssets(layout){
 const wanted=new Set(artFiles);
 visit(layout,wanted);
 const entries=await Promise.all([...wanted].map(async key=>[key,await encodeAsset(key)]));
 return Object.fromEntries(entries);
}
const prepared=await Promise.all(plan.variants.map(async v=>{
 const layoutJson=JSON.stringify(v.snapshot.layout);
 return {...v,layoutJson,snapshot_hash:'branch-'+fnv1a(layoutJson),
  input_sha256:sha(await fs.readFile(v.file)),asset_urls:await getAssets(v.snapshot.layout)};
}));
const preparedByKey=new Map(prepared.map(x=>[x.key,x]));
console.log('Batch variants '+prepared.length+', frames '+plan.jobs.length+
 ', unique base64 assets '+assets.size+', one browser planned.');
const timings=[];
const browser=await chromium.launch({headless:true,args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-webgl','--ignore-gpu-blocklist','--disable-dev-shm-usage']});
try{
 const render=async job=>{
  const v=preparedByKey.get(job.key);
  const view=job.view;
  const frame=String(v.snapshot.scene_revision)+'-'+view.id;
  const page=await browser.newPage({viewport:view.camera.viewport});
  const pageErrors=[];
  const consoleErrors=[];
  const t0=performance.now();
  try{
   page.on('pageerror',err=>pageErrors.push(String(err?.message||err)));
   page.on('console',msg=>{if(msg.type()==='error')consoleErrors.push(msg.text());});
   const input={
    frame_id:frame,room_id:view.room_id,
    canonical_sha256:v.snapshot.canonical_sha256,
    snapshot_sha256:v.snapshot_hash,
    scene_revision:v.snapshot.scene_revision,
    storage_revision:v.snapshot.storage_revision,
    layout:v.snapshot.layout,
    camera:view.camera,
    asset_urls:v.asset_urls,
    architecture_variant:v.snapshot.architecture_variant||null
   };
   const html=template.replace('__APARTMENT_CAPTURE_SNAPSHOT_JSON__',safeJson(input));
   await page.setContent(html,{waitUntil:'load'});
   await page.waitForFunction(id=>{
    const error=document.body?.dataset?.captureError;
    if(error)throw new Error(error);
    return document.querySelector('#apartment-capture-canvas')?.dataset?.captureReady===id;
   },frame,{timeout:180000});
   const base=path.join(pathsByVariant.get(v.key),view.id);
   const canvas=page.locator('#apartment-capture-canvas');
   await fs.writeFile(base+'.png',await captureCanvasPng(canvas));
   const meta=await page.evaluate(()=>window.__apartmentCaptureFrame);
   assert.ok(meta,'No capture metadata');
   assert.equal(meta.scene_revision,v.snapshot.scene_revision);
   assert.equal(meta.canonical_sha256,v.snapshot.canonical_sha256);
   assert.equal(meta.rendered_layout_json,v.layoutJson);
   assert.equal(meta.room_id,view.room_id);
   assert.deepEqual(meta.architecture_variant,input.architecture_variant);
   for (const prop of ['position','target','fov','aspect','near','far','viewport']) {
    assert.deepEqual(meta.camera[prop],view.camera[prop],
      'Camera changed at '+job.key+'/'+view.id+': '+prop);
   }
   assert.equal(meta.assets.pending,0);
   assert.deepEqual(meta.assets.fallbacks,[]);
   assert.deepEqual(pageErrors,[],'Page errors occurred during WebGL capture');
   assert.deepEqual(consoleErrors,[],'Console/shader errors occurred during WebGL capture');
   const webgl=await canvas.evaluate(element=>{
    const gl=element.getContext('webgl2')||element.getContext('webgl');
    if(!gl)throw new Error('Capture canvas has no WebGL context');
    const debug=gl.getExtension('WEBGL_debug_renderer_info');
    return {version:gl.getParameter(gl.VERSION),
     renderer:gl.getParameter(debug?debug.UNMASKED_RENDERER_WEBGL:gl.RENDERER),
     vendor:gl.getParameter(debug?debug.UNMASKED_VENDOR_WEBGL:gl.VENDOR),
     context_lost:gl.isContextLost()};
   });
   assert.equal(webgl.context_lost,false);
   await fs.writeFile(base+'.json',JSON.stringify(meta,null,2));
   const pngBytes=await fs.readFile(base+'.png');
   assert.ok(pngBytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])),
      'Invalid PNG header');
   const record={
    variant:v.key,view_id:view.id,
    image_sha256:sha(pngBytes),
    image_bytes:pngBytes.byteLength,
    elapsed_ms:Math.round(performance.now()-t0),
    scene_revision:v.snapshot.scene_revision,
    camera_signature_sha256:sha(JSON.stringify(view.camera)),
    webgl, page_errors:pageErrors, console_errors:consoleErrors,
    validated:true
   };
   timings.push(record);
   console.log('VERIFIED '+job.key+'/'+view.id+' '+record.elapsed_ms+'ms');
  }finally{await page.close();}
 };
 const raw=Number(process.env.RENDER_CONCURRENCY||2);
 assert.ok(Number.isInteger(raw)&&raw>=1&&raw<=6,'RENDER_CONCURRENCY must be 1–6');
 const count=Math.min(raw,plan.jobs.length);
 let cursor=0;
 await Promise.all(Array.from({length:count},async()=>{
  while(cursor<plan.jobs.length){
   const job=plan.jobs[cursor++];
   try{await render(job);}
   catch(err){
    if(err?.name!=='TimeoutError')throw err;
    console.warn('Retry once after WebGL timeout for '+job.key+'/'+job.view.id);
    await render(job);
   }
  }
 }));
 for(const v of prepared){
  const frames=timings.filter(x=>x.variant===v.key);
  assert.equal(frames.length,v.views.length,
   'Render incomplete for '+v.key);
  await fs.writeFile(path.join(pathsByVariant.get(v.key),'manifest.json'),JSON.stringify({
   schema:'ApartmentGitHubRenderManifest/2',
   source_file:v.file,
   source_sha256:v.input_sha256,
   scene_revision:v.snapshot.scene_revision,
   canonical_sha256:v.snapshot.canonical_sha256,
   architecture_variant:v.snapshot.architecture_variant||null,
   cameras:v.views.map(x=>({id:x.id,room_id:x.room_id,camera:x.camera})),
   frames
  },null,2)+'\n');
 }
 const manifest={
  schema:'ApartmentBatchRender/1',
  status:'ALL_FRAMES_VERIFIED',
  started_at:started,
  finished_at:new Date().toISOString(),
  total_elapsed_ms:Math.round(performance.now()-perfStart),
  browser_launches:1,
  browser_version:browser.version(),
  capture_template_sha256:sha(await fs.readFile('dist/capture-template.json')),
  asset_encodings:assets.size,
  concurrency:count,
  canonical_sha256:plan.canonical_sha256,
  shared_cameras_sha256:sha(plan.camera_signature),
  variants:prepared.map(v=>({
   name:v.key,source:v.file,source_sha256:v.input_sha256,
   scene_revision:v.snapshot.scene_revision,expected_views:v.views.length
  })),
  frames:timings.sort((a,b)=>a.variant.localeCompare(b.variant)||a.view_id.localeCompare(b.view_id))
 };
 assert.equal(manifest.frames.length,plan.jobs.length,'Missing frames in batch manifest');
 await fs.writeFile(path.join(output,'batch-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log('BATCH VERIFIED '+manifest.frames.length+' images, '+manifest.total_elapsed_ms+'ms in ONE browser');
}finally{await browser.close();}
