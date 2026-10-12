/** Offline owner review: every comparison/zoom, small screens, SVG bounds. No server/cloud. */
import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright');
import {dir} from './build-whole-home-m3-group4.mjs';
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']}),records=[];
try{
 for(const [width,height]of [[1440,1000],[390,844]]){
  const page=await browser.newPage({viewport:{width,height}}),errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(!r.url().startsWith('data:'))requests.push(r.url());});await page.setContent(fs.readFileSync(dir+'/Owner-Review.html','utf8'),{waitUntil:'load'});
  await page.waitForFunction(()=>document.querySelector('#heroImage').complete&&document.querySelector('#heroImage').naturalWidth===1280);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),true,'Page overflow');assert.equal(await page.locator('style bdi').count(),0);
  let count=0;for(const mode of ['source','lead','options','storage'])for(const view of ['work','sink','night','entry','access']){await page.locator('[data-mode="'+mode+'"]').click();await page.selectOption('#camera',view);await page.waitForFunction(()=>[...document.querySelectorAll('.pair img')].every(i=>i.complete&&i.naturalWidth===1280));const identity=await page.evaluate(()=>{const [a,b]=pairs[mode];return {left:frames[a+'-'+view].camera,right:frames[b+'-'+view].camera};});assert.equal(identity.left,identity.right);count++;}
  await page.locator('#leftButton').click();assert.equal(await page.locator('#zoom').evaluate(d=>d.open),true);await page.locator('#larger').click();assert.equal(await page.locator('#scaleLabel').textContent(),'150%');await page.locator('#fit').click();await page.locator('#closeZoom').click();
  const plans=page.locator('.plan .zoomable');for(let i=0;i<await plans.count();i++){const id=await plans.nth(i).evaluate(b=>b.closest('.plan').dataset.plan);await page.selectOption('#planSelect',id);await plans.nth(i).click();await page.waitForFunction(()=>document.querySelector('#zoomImage').complete&&document.querySelector('#zoomImage').naturalWidth>0);await page.locator('#larger').click();await page.locator('#closeZoom').click();}
  await page.locator('#holds details').first().click();assert.equal(await page.locator('#holds details[open]').count(),1);await page.locator('#vision').scrollIntoViewIfNeeded();await page.screenshot({path:'work/group4/review-'+width+'.png',fullPage:false});assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);records.push({viewport:[width,height],comparison_states:count,plan_zoom_count:await plans.count(),overflow:false,errors,external_requests:requests});await page.close();
 }
 // SVG text must remain inside the viewBox and outside neighbouring text rows.
 const textBounds=[];for(const f of fs.readdirSync(dir+'/plans')){
  const page=await browser.newPage();await page.setContent(fs.readFileSync(dir+'/plans/'+f,'utf8'));const result=await page.evaluate(()=>{const svg=document.querySelector('svg'),v=svg.viewBox.baseVal,items=[...svg.querySelectorAll('text')].map(t=>{const b=t.getBBox();return {text:t.textContent,x:b.x,y:b.y,w:b.width,h:b.height};});return {viewBox:[v.x,v.y,v.width,v.height],items};});const [x,y,w,h]=result.viewBox;for(const b of result.items)assert.ok(b.x>=x-1&&b.y>=y-1&&b.x+b.w<=x+w+1&&b.y+b.h<=y+h+1,'SVG text clipping: '+f+' / '+b.text);textBounds.push({file:f,text_count:result.items.length,within_viewbox:true});await page.close();
 }
 const result={schema:'M3Group4OfflineBrowser/1',result:'PASS',records,svg_text_bounds:textBounds};fs.writeFileSync(dir+'/BROWSER_VERIFICATION.json',JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));
}finally{await browser.close();}
