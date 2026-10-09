import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {createRequire} from 'node:module';
import {createApartmentDomain} from '../../studio/domain/apartment.mjs';
import {createLocalRenderer} from '../../studio/local/renderer.mjs';
import {captureCanvasPng} from '../../scripts/capture-canvas-png.mjs';
const dir=import.meta.dirname,root=path.resolve(dir,'../..'),domain=createApartmentDomain(root);
const read=f=>JSON.parse(fs.readFileSync(f));
const [phase='before',...only]=process.argv.slice(2);assert.ok(['before','after'].includes(phase));
const before=read(root+'/design-development/unified-furnishing-v55/snapshot.json');
const snapshot=phase==='before'?before:read(dir+'/snapshot.json'),layout=snapshot.layout,brief=domain.designBrief(layout);
const family=read(root+'/local-qa/project-studies-v7/family-v7/cameras.json');
const utility=read(root+'/local-qa/project-studies-v3/home-a-utility/cameras.json');
const realism=read(root+'/local-qa/realism-r1/cameras.json');
const bedroom=read(root+'/design-development/bedroom1-r4/snapshot.json').views;
const selections=[
 ['entry','RECP-01',family.find(v=>v.id==='family-v7-entry')],
 ['living','RECP-01',family.find(v=>v.id==='family-v7-family')],
 ['dining','RECP-01',family.find(v=>v.id==='family-v7-dining')],
 ['kitchen','KIT-01',utility.find(v=>v.id==='home-a-utility-kitchen')],
 ['master','MBR-01',family.find(v=>v.id==='family-v7-master-wide')],
 ['bedroom1','BR-01',bedroom.find(v=>v.id==='window-to-study').camera],
 ['bedroom1-bed','BR-01',family.find(v=>v.id==='family-v7-bedroom1')],
 ['bedroom2','BR-02',family.find(v=>v.id==='family-v7-bedroom2')],
 ['ensuite','BATH-M01',realism.find(v=>v.view==='ensuite-wide')],
 ['family-bath','BATH-C01',realism.find(v=>v.view==='family-vanity-natural')],
 ['living-night','RECP-01',{...family.find(v=>v.id==='family-v7-family'),viewer:{...family.find(v=>v.id==='family-v7-family').viewer,night:true,hour:21}}]
];
const views=selections.map(([id,room_id,c])=>{
 const camera=domain.captureCamera(before.layout,{room_id,...c});
 // Camera normalization supplies daytime defaults; apply the named night state afterwards.
 if(id==='living-night')camera.viewer={...camera.viewer,night:true,hour:21};
 return {id,room_id,camera};
});
fs.mkdirSync(dir+'/evidence',{recursive:true});
const camerasFile=dir+'/cameras.json';
if(fs.existsSync(camerasFile))assert.deepEqual(read(camerasFile),views);else fs.writeFileSync(camerasFile,JSON.stringify(views,null,2)+'\n');
const renderer=createLocalRenderer(root),{chromium}=createRequire(import.meta.url)('playwright');let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
 for(const v of views.filter(v=>!only.length||only.includes(v.id))){
  const id=phase+'-'+v.id,page=await browser.newPage({viewport:v.camera.viewport}),errors=[];
  try{
   page.on('pageerror',e=>errors.push(e.message));
   domain.captureCamera(layout,{room_id:v.room_id,...v.camera});
   await page.setContent(renderer.capture(layout,brief,{room_id:v.room_id,...v.camera},id),{waitUntil:'load'});
   await page.waitForFunction(id=>{if(document.body?.dataset.captureError)throw Error(document.body.dataset.captureError);return document.querySelector('canvas')?.dataset.captureReady===id;},id,{timeout:60000});
   const meta=await page.evaluate(()=>window.__apartmentCaptureFrame);
   assert.deepEqual(errors,[]);assert.equal(meta.scene_revision,domain.revision(layout));assert.equal(meta.rendered_layout_json,JSON.stringify(layout));
   assert.equal(meta.assets.pending,0);assert.deepEqual(meta.assets.fallbacks,[]);
   for(const key of ['position','target','fov','aspect','near','far','viewport','viewer'])assert.deepEqual(meta.camera[key],v.camera[key]);
   const png=await captureCanvasPng(page.locator('canvas'));assert.equal(png.readUInt32BE(16),1600);assert.equal(png.readUInt32BE(20),857);
   fs.writeFileSync(dir+'/evidence/'+id+'.png',png);fs.writeFileSync(dir+'/evidence/'+id+'.json',JSON.stringify(meta,null,2)+'\n');
   console.log(JSON.stringify({id,scene:meta.scene_revision,sha256:crypto.createHash('sha256').update(png).digest('hex'),assets_ready:true}));
  }finally{await page.close();}
 }
}finally{await browser?.close();}
