import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {JSDOM} from 'jsdom';
import {chromium} from 'playwright';
import {sha256} from './kitchen-r4-candidate.mjs';
const out=process.env.RENDER_OUT_DIR||'renders/kitchen-r6',m=JSON.parse(fs.readFileSync(out+'/VERIFIED_MANIFEST.json'));
const dom=new JSDOM(fs.readFileSync(out+'/Review.html','utf8')),originals=[...dom.window.document.querySelectorAll('img[data-frame]')];assert.equal(originals.length,20);
for(const i of originals){assert.equal(sha256(Buffer.from(i.src.split(',')[1],'base64')),i.dataset.sha256);assert.ok(m.frames.some(f=>f.image_sha256===i.dataset.sha256&&f.variant+'/'+f.view_id===i.dataset.frame));}
for(const a of dom.window.document.querySelectorAll('a'))assert.ok(a.href.startsWith('data:'));
for(const i of dom.window.document.querySelectorAll('img[data-reuse]'))assert.ok(originals.some(o=>o.dataset.frame===i.dataset.reuse));
const expected=dom.window.document.images.length,browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
try{
 const results=[];
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
  const ctx=await browser.newContext({viewport,offline:true}),page=await ctx.newPage(),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',c=>{if(c.type()==='error')errors.push(c.text());});page.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
  await page.goto(pathToFileURL(process.cwd()+'/'+out+'/Review.html').href,{waitUntil:'load'});
  await page.waitForFunction(n=>document.images.length===n&&[...document.images].every(i=>i.complete&&i.naturalWidth===1280&&i.naturalHeight===720),expected);
  assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:'work/kitchen-r6/review-'+viewport.width+'.png'});
  if(viewport.width===1440){await page.locator('section').nth(2).screenshot({path:'work/kitchen-r6/review-detail-section.png'});await page.locator('section').nth(4).screenshot({path:'work/kitchen-r6/review-functional-section.png'});}
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('.save').first().click()]);assert.match(download.suggestedFilename(),/\.png$/);
  const buffer=fs.readFileSync(await download.path());assert.ok(m.frames.some(f=>f.image_sha256===sha256(buffer)),'Downloaded image differs');
  results.push({viewport,decoded_images:expected,original_images:20,errors,external_requests:requests,source_png_download_sha_verified:true,status:'PASS'});await ctx.close();
 }
 fs.writeFileSync('work/kitchen-r6/browser-review-results.json',JSON.stringify(results,null,2)+'\n');
 console.log('R6 offline review PASS: 20 original PNG bytes; all '+expected+' images decoded; desktop/mobile; native PNG download; zero external requests/errors/overflow.');
}finally{await browser.close();}
