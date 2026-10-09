import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
import {createLocalRenderer} from '../studio/local/renderer.mjs';
import {captureCanvasPng} from '../scripts/capture-canvas-png.mjs';

const root=path.resolve(import.meta.dirname,'..');
const [action,study,viewId]=process.argv.slice(2);
if(!['prepare','capture','check','verify-evidence'].includes(action)||!['bedroom1-r1','bedroom1-r4'].includes(study))throw Error('Use: node design-development/bedroom-review.mjs prepare|capture|check|verify-evidence bedroom1-r1|bedroom1-r4 [view-id]');
const dir=path.join(root,'design-development',study),site=path.join(root,'local-qa/site',study);
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const source=read(path.join(root,'render-snapshots/current.json'));
const snapshot=read(path.join(dir,'snapshot.json')),brief=read(path.join(dir,'brief.json'));
const domain=createApartmentDomain(root);
assert.equal(source.scene_revision,'scene-9cf45a73','Rebase the review when the active source changes.');
assert.equal(snapshot.source_scene_revision,source.scene_revision);
assert.equal(brief.scene_revision,snapshot.scene_revision);
assert.equal(snapshot.scene_revision,domain.revision(snapshot.layout));
assert.deepEqual(domain.importBrief(brief),snapshot.layout);
const views=snapshot.views.filter(v=>!viewId||v.id===viewId);
assert.ok(views.length,'Unknown review view');

function verifyMetadata(meta,l,c){
 assert.equal(meta.scene_revision,domain.revision(l));
 assert.equal(meta.canonical_sha256,snapshot.canonical_sha256);
 assert.equal(meta.rendered_layout_json,JSON.stringify(l));
 assert.equal(meta.assets.pending,0);assert.deepEqual(meta.assets.fallbacks,[]);
 for(const key of ['position','target','fov','aspect','near','far','viewport'])assert.deepEqual(meta.camera[key],c[key]);
}
function verifyPng(bytes,camera){
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
 if(camera){assert.equal(bytes.readUInt32BE(16),camera.viewport.width);assert.equal(bytes.readUInt32BE(20),camera.viewport.height);}
}
if(action==='verify-evidence'){
 const evidence=path.join(dir,'evidence'),manifest=read(path.join(evidence,'manifest.json'));
 for(const [file,expected] of Object.entries(manifest.files)){
  const bytes=fs.readFileSync(path.join(evidence,file));
  assert.equal(bytes.length,expected.bytes);
  assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),expected.sha256,file+' hash');
 }
 for(const v of views)for(const [label,l] of [['before',source.layout],['after',snapshot.layout]]){
  const id=label+'-'+v.id;
  verifyMetadata(read(path.join(evidence,id+'.json')),l,v.camera);
  verifyPng(fs.readFileSync(path.join(evidence,id+'.png')),v.camera);
 }
 console.log(study+': committed PNG hashes, layouts and matched cameras PASS.');
}else if(action==='prepare'){
 fs.mkdirSync(site,{recursive:true});
 const renderer=createLocalRenderer(root),baseBrief=domain.designBrief(source.layout);
 for(const v of views)for(const [label,l,b] of [['before',source.layout,baseBrief],['after',snapshot.layout,brief]]){
  domain.captureCamera(l,{room_id:v.room_id,...v.camera});
  const id=label+'-'+v.id;
  fs.writeFileSync(path.join(site,id+'.html'),renderer.capture(l,b,{room_id:v.room_id,...v.camera},id));
 }
 fs.cpSync(path.join(dir,'evidence'),path.join(site,'evidence'),{recursive:true});
 for(const file of ['brief.json','verification.json'])fs.copyFileSync(path.join(dir,file),path.join(site,file));
 fs.writeFileSync(path.join(site,'studio.html'),renderer.interactive(snapshot.layout,study));
 const html=fs.readFileSync(path.join(dir,'review.html'),'utf8').replace('<a class="button" href="brief.json"','<a class="button" href="studio.html">افتح النموذج التجريبي</a><a class="button" href="brief.json"');
 fs.writeFileSync(path.join(site,'index.html'),html);
 console.log('Prepared local-only review at /_qa/'+study+'/');
}else{
 const require=createRequire(import.meta.url),{chromium}=require('playwright');
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage','--disable-background-networking','--disable-component-update',...(action==='capture'?['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-webgl','--ignore-gpu-blocklist']:[])]});
 try{
  if(action==='capture'){
   const report=[];
   for(const v of views)for(const [label,l] of [['before',source.layout],['after',snapshot.layout]]){
    const id=label+'-'+v.id,errors=[];
    const page=await browser.newPage({viewport:v.camera.viewport});
    try{
     page.on('pageerror',e=>errors.push(e.message));
     await page.setContent(fs.readFileSync(path.join(site,id+'.html'),'utf8'),{waitUntil:'load'});
     await page.waitForFunction(id=>{const error=document.body?.dataset?.captureError;if(error)throw Error(error);return document.querySelector('canvas')?.dataset?.captureReady===id},id,{timeout:60000});
     const meta=await page.evaluate(()=>window.__apartmentCaptureFrame);
     verifyMetadata(meta,l,v.camera);assert.deepEqual(errors,[]);
     const png=await captureCanvasPng(page.locator('canvas'));verifyPng(png,v.camera);
     fs.writeFileSync(path.join(site,'evidence',id+'.png'),png);
     fs.writeFileSync(path.join(site,'evidence',id+'.json'),JSON.stringify(meta,null,2)+'\n');
     report.push({id,scene_revision:meta.scene_revision,layout_verified:true,camera_verified:true});
     console.log('Captured '+id+' '+meta.scene_revision);
    }finally{await page.close();}
   }
   fs.writeFileSync(path.join(site,'capture-report.json'),JSON.stringify(report,null,2)+'\n');
  }else{
   const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   let html=fs.readFileSync(path.join(dir,'review.html'),'utf8');
   html=html.replace(/\.\/evidence\/([a-z0-9-]+\.png)/g,(_,file)=>'data:image/png;base64,'+fs.readFileSync(path.join(dir,'evidence',file)).toString('base64'));
   await page.setContent(html,{waitUntil:'load'});await page.evaluate(()=>document.fonts.ready);
   assert.equal(await page.locator('html').getAttribute('dir'),'rtl');
   assert.equal(await page.locator('img').count(),5);
   assert.ok(await page.evaluate(()=>[...document.images].every(i=>i.complete&&i.naturalWidth>0)));
   for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
    await page.setViewportSize(viewport);
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),'Horizontal overflow');
    for(const label of ['before','after']){
     await page.locator('[data-layout="'+label+'"]').click();
     assert.equal(await page.locator('[data-panel="'+label+'"]').isVisible(),true);
     assert.equal(await page.locator('[data-panel]:visible').count(),1);
     assert.equal(await page.locator('[data-layout="'+label+'"]').getAttribute('aria-pressed'),'true');
    }
   }
   assert.deepEqual(errors,[]);
   console.log(study+': RTL, five images, desktop/mobile viewport and comparison controls PASS.');
  }
 }finally{await browser.close();}
}
