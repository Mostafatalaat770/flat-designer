import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {OUT,hash} from './build-whole-home-m1.mjs';
import {LAYERS} from './whole-home-m1-input.mjs';
const {chromium}=createRequire(import.meta.url)('playwright');
const shotDir='work/m1-session/visual';fs.mkdirSync(shotDir,{recursive:true});
const data=JSON.parse(fs.readFileSync(`${OUT}/COORDINATION.json`));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
const errors=[],requests=[],results=[],downloads=[];
try{
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
  const page=await browser.newPage({viewport,acceptDownloads:true});page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>requests.push(r.url()));await page.route('**/*',route=>route.abort());
  await page.setContent(fs.readFileSync(`${OUT}/Owner-Review.html`,'utf8'),{waitUntil:'load'});
  assert.equal(await page.locator('[data-room-schedule]').count(),13);
  assert.equal(await page.locator('tr[data-original]').count(),65);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Page overflows mobile viewport');
  assert.equal(await page.locator('#room-select').inputValue(),viewport.width<650?'RECP-01':'ALL');
  for(const layer of Object.keys(LAYERS)){
   await page.locator(`[data-layer="${layer}"]`).click();
   assert.equal(await page.locator(`[data-layer="${layer}"]`).getAttribute('aria-pressed'),'true');
   for(const option of layer==='F'?['A','B']:['A']){
    if(layer==='F')await page.locator('#floor-select').selectOption(option);
    for(const r of data.rooms){
     await page.locator('#room-select').selectOption(r.id);
     const svg=page.locator('#plan-host svg');assert.equal(await svg.count(),1);
     assert.equal(await svg.locator('[data-room]').count(),1);
     assert.equal(await svg.locator('[data-source-object]').count(),r.furniture.length);
     assert.equal(await page.locator('#zone-summary').locator('.zone').count(),1);
     assert.ok((await page.locator('#zone-summary').textContent()).includes(r.id));
     assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
     const box=await svg.boundingBox();assert.ok(box.width>=300);
     results.push({viewport,layer,option,room:r.id,source_objects:r.furniture.length,pass:true});
     if(viewport.width===390&&[['E','BR-02'],['L','KIT-01'],['H','BATH-C01'],['F','WIC-01']].some(([k,id])=>k===layer&&id===r.id)){
      await page.locator('#plans').screenshot({path:`${shotDir}/mobile-${layer}-${r.id}-${option}.png`});
     }
    }
   }
   await page.locator('#room-select').selectOption('ALL');
   const dl=page.waitForEvent('download');await page.locator('#download-plan').click();const download=await dl;
   const p=`${shotDir}/${viewport.width}-${download.suggestedFilename()}`;await download.saveAs(p);
   assert.equal((fs.readFileSync(p,'utf8').match(/data-room=/g)||[]).length,13);
   downloads.push({viewport:viewport.width,layer,name:download.suggestedFilename(),pass:true});
  }
  await page.close();
 }
 // Direct plan files also parse and render; screenshots are for actual visual inspection.
 const page=await browser.newPage({viewport:{width:1240,height:1000}});
 for(const [layer,info] of Object.entries(LAYERS)){
  await page.setContent(`<body style="margin:0">${fs.readFileSync(`${OUT}/${info.file}`,'utf8')}</body>`);
  const clipped=await page.evaluate(()=>{
   const outer=document.querySelector('svg').getBoundingClientRect();
   return [...document.querySelectorAll('svg text')].filter(t=>{
    const r=t.getBoundingClientRect();return r.left<outer.left-1||r.right>outer.right+1||r.top<outer.top-1||r.bottom>outer.bottom+1;
   }).map(t=>t.textContent);
  });assert.deepEqual(clipped,[],`Clipped text in standalone ${layer}`);
  await page.locator('svg').screenshot({path:`${shotDir}/sheet-${layer}.png`});
 }
 await page.close();assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
 const report={schema:'TypeBWholeHomeM1Browser/1',browser:browser.version(),method:'Offline setContent exact committed HTML; all network blocked; real Chromium SVG rendering, tabs, crops, download',
  html_sha256:hash(`${OUT}/Owner-Review.html`),checked_views:results.length,results,downloads,errors,network_requests:requests,
  screenshots_directory:shotDir,visual_review_status:'PENDING_HUMAN_VISUAL_INSPECTION'};
 fs.writeFileSync(`${OUT}/BROWSER_VALIDATION.json`,JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({views:results.length,downloads:downloads.length,errors,network_requests:requests,screenshots:shotDir}));
}finally{await browser.close();}
