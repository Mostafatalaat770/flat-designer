import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {JSDOM} from 'jsdom';
import {chromium} from 'playwright';
import {sha256} from './kitchen-r4-candidate.mjs';
const out=process.env.RENDER_OUT_DIR||'renders/kitchen-r5';
const manifest=JSON.parse(fs.readFileSync(out+'/VERIFIED_MANIFEST.json'));
const dom=new JSDOM(fs.readFileSync(out+'/Review.html','utf8'));
const originals=[...dom.window.document.querySelectorAll('img[data-frame]')];
assert.equal(originals.length,18+manifest.historical_r4_frames.length);
for(const img of originals){
 const bytes=Buffer.from(img.src.split(',')[1],'base64');assert.equal(sha256(bytes),img.dataset.sha256);
 assert.ok([...manifest.frames,...manifest.historical_r4_frames].some(f=>f.image_sha256===img.dataset.sha256));
}
for(const a of dom.window.document.querySelectorAll('a'))assert.ok(a.href.startsWith('data:'),'Non-offline link');
for(const i of dom.window.document.querySelectorAll('img[data-reuse]'))assert.ok(originals.some(o=>o.dataset.frame===i.dataset.reuse));
const expected=dom.window.document.images.length;
const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
try{
 const results=[];
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
  const context=await browser.newContext({viewport,offline:true}),page=await context.newPage();const errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
  await page.goto(pathToFileURL(process.cwd()+'/'+out+'/Review.html').href,{waitUntil:'load'});
  await page.waitForFunction(n=>document.images.length===n&&[...document.images].every(i=>i.complete&&i.naturalWidth===1280&&i.naturalHeight===720),expected);
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Page horizontal overflow');
  await page.screenshot({path:'work/kitchen-r5/review-'+viewport.width+'.png'});
  if(viewport.width===1440)await page.locator('section').nth(1).screenshot({path:'work/kitchen-r5/review-door-comparisons.png'});
  const download=await Promise.all([page.waitForEvent('download'),page.locator('.save').first().click()]);
  assert.ok(download[0].suggestedFilename().endsWith('.png'));
  results.push({viewport,original_images:originals.length,decoded_images:expected,errors,external_requests:requests,png_download:'PASS',status:'PASS'});
  await context.close();
 }
 fs.writeFileSync('work/kitchen-r5/browser-review-results.json',JSON.stringify(results,null,2)+'\n');
 console.log('R5 offline review PASS: original PNG bytes, all '+expected+' displayed images, desktop/mobile, downloadable PNG, zero external requests/errors.');
}finally{await browser.close();}
