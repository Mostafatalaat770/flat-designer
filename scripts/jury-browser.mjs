import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {createHash} from 'node:crypto';import path from 'node:path';
const {chromium}=createRequire(import.meta.url)('playwright'),dir='design-development/whole-home-m3/jury',records=[];
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{for(const viewport of [{width:1440,height:1000},{width:390,height:844}]){
 const page=await browser.newPage({viewport}),errors=[],external=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('data:')&&!r.url().startsWith('file:')&&!r.url().startsWith('blob:'))external.push(r.url());});
 await page.setContent(fs.readFileSync(dir+'/Owner-Review.html','utf8'),{waitUntil:'load',timeout:120000});
 await page.evaluate(()=>document.querySelectorAll('img[data-frame]').forEach(x=>x.loading='eager'));
 await page.waitForFunction(()=>[...document.querySelectorAll('img[data-frame]')].every(x=>x.complete&&x.naturalWidth>0),undefined,{timeout:120000});
 assert.equal(await page.locator('.room').count(),13);assert.equal(await page.locator('.hold-row').count(),52);
 const overflow=await page.evaluate(()=>({document:document.documentElement.scrollWidth,viewport:innerWidth}));assert.ok(overflow.document<=overflow.viewport+1,JSON.stringify(overflow));
 const modes=[];for(const id of ['reception','master','hall-to-public','public-to-terrace','wic-to-bath','kitchen'])for(const mode of ['night','day']){
  await page.locator(`[data-pair="${id}"][data-mode="${mode}"]`).click();const url=await page.locator('#pair-'+id).getAttribute('src'),bytes=Buffer.from(url.split(',')[1],'base64'),file=fs.readFileSync(`${dir}/frames/SCENARIO-${id}${mode==='night'?'-night':''}.png`);assert.ok(bytes.equals(file));modes.push(id+'-'+mode);
 }
 const filters=[];for(const [priority,count]of [['P0',30],['P1',19],['P2',3],['ALL',52]]){await page.locator(`[data-filter="${priority}"]`).click();assert.equal(await page.locator('.hold-row:not([hidden])').count(),count);filters.push({priority,count});}
 await page.locator('#hold-search').fill('G3-H03');assert.equal(await page.locator('.hold-row:not([hidden])').count(),1);await page.locator('#hold-search').fill('');
 await page.locator('a[href="#G3-H03"]').first().click();assert.equal(await page.locator('#G3-H03').getAttribute('open'),'');
 const links=[];for(const rid of ['BR-02','WIC-01','TER-SVC']){await page.locator(`.plan-panel [data-room="${rid}"]`).evaluate(x=>x.dispatchEvent(new MouseEvent('click',{bubbles:true})));await page.waitForFunction(id=>{const y=document.querySelector('#room-'+id).getBoundingClientRect().top;return y>=0&&y<innerHeight;},rid);links.push(rid);}
 await page.locator('[data-zoom="SCENARIO-master"]').first().click();assert.equal(await page.locator('dialog').evaluate(x=>x.open),true);assert.ok((await page.locator('dialog img').getAttribute('src')).startsWith('data:image/png'));await page.locator('#close-zoom').click();
 await page.locator('#inventory tbody input[name="count"]').first().fill('12');await page.locator('#inventory tbody input[name="dimensions"]').first().fill('300x400x100');const downloaded=page.waitForEvent('download');await page.locator('#inventory-export').click();const download=await downloaded;await download.saveAs('work/jury/inventory-test-'+viewport.width+'.csv');const csv=fs.readFileSync('work/jury/inventory-test-'+viewport.width+'.csv','utf8');assert.ok(csv.includes('"12"')&&csv.includes('300x400x100'));
 await page.locator('#overview').scrollIntoViewIfNeeded();await page.screenshot({path:'work/jury/book-'+viewport.width+'.png'});
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);records.push({viewport,source:'Exact local HTML bytes via setContent; no network resources',file_url_limit:'Managed browser policy blocks file:// navigation; file URL opening not claimed as tested',room_cards:13,hold_rows:52,mode_checks:modes,filters,room_navigation:links,inventory_export:'PASS',overflow,errors,external_requests:external,book_sha256:createHash('sha256').update(fs.readFileSync(dir+'/Owner-Review.html')).digest('hex')});await page.close();
}}finally{await browser.close();}
fs.writeFileSync(dir+'/BROWSER_VERIFICATION.json',JSON.stringify({schema:'WholeHomeOfflineBookBrowser/1',records},null,2)+'\n');console.log('Desktop/mobile offline review,12 day/night states each, HOLD filters, plan links, zoom and inventory export PASS');
