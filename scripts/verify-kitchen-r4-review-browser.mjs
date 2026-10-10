import fs from 'node:fs';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
const out=process.env.RENDER_OUT_DIR||'renders/kitchen-r4';
fs.mkdirSync('work/kitchen-r4',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--disable-dev-shm-usage']});
try {
 const results=[];
 for(const viewport of [{width:1440,height:1000},{width:390,height:844}]) {
  const context=await browser.newContext({viewport,offline:true});
  const page=await context.newPage();const errors=[];const network=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
  page.on('request',r=>{if(/^https?:/.test(r.url()))network.push(r.url())});
  await page.goto(pathToFileURL(process.cwd()+'/'+out+'/Review.html').href,{waitUntil:'load'});
  await page.waitForFunction(()=>[...document.images].length===16 && [...document.images].every(i=>i.complete&&i.naturalWidth===1280&&i.naturalHeight===720));
  await page.locator('details.comparison').first().evaluate(el=>el.open=true);
  const dimensions=await page.evaluate(()=>({width:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,images:document.images.length}));
  assert.ok(dimensions.width<=viewport.width,'Horizontal overflow');assert.deepEqual(errors,[]);assert.deepEqual(network,[]);
  await page.screenshot({path:`work/kitchen-r4/review-${viewport.width}.png`,fullPage:false});
  if(viewport.width===1440)await page.locator('section').first().screenshot({path:'work/kitchen-r4/review-comparisons.png'});
  results.push({viewport,dimensions,errors,external_requests:network,status:'PASS'});
  await context.close();
 }
 fs.writeFileSync('work/kitchen-r4/browser-review-results.json',JSON.stringify(results,null,2)+'\n');
 console.log('Offline browser PASS: all 16 images decoded, desktop/mobile layouts fit, no external requests or errors.');
}finally{await browser.close();}
