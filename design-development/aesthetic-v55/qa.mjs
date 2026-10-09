import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const dir=import.meta.dirname,root=path.resolve(dir,'../..'),views=JSON.parse(fs.readFileSync(dir+'/cameras.json'));
const {chromium}=createRequire(import.meta.url)('playwright');
for(const v of views)for(const phase of ['before','after'])assert.ok(fs.existsSync(dir+'/evidence/'+phase+'-'+v.id+'.png'),'Capture must complete before UI QA.');
const server=http.createServer((req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname==='/favicon.ico'){res.writeHead(204);res.end();return;}
  const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(!file.startsWith(root+'/design-development/'))throw Error('Outside review files');
  const body=fs.readFileSync(file),type={'.html':'text/html; charset=utf-8','.png':'image/png','.json':'application/json','.md':'text/markdown; charset=utf-8'}[path.extname(file)]||'application/octet-stream';
  res.writeHead(200,{'content-type':type});res.end(body);
 }catch{res.writeHead(404);res.end('Not found');}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const url=`http://127.0.0.1:${server.address().port}/design-development/aesthetic-v55/review.html`,errors=[],checks=[];
let browser;
try{
 browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [screen,viewport] of [['desktop',{width:1440,height:1100}],['mobile',{width:390,height:844}]]){
  const page=await browser.newPage({viewport});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('requestfailed',r=>errors.push(r.url()+': '+r.failure()?.errorText));
  page.on('response',r=>{if(r.status()>=400)errors.push(r.status()+': '+r.url());});
  await page.goto(url,{waitUntil:'networkidle'});
  for(const v of views)for(const mode of ['after','split','before']){
   await page.selectOption('#room',v.id);await page.selectOption('#mode',mode);
   await page.waitForFunction(()=>['before','after'].every(p=>{const i=document.querySelector('#'+p);return i.complete&&i.naturalWidth===1600&&i.naturalHeight===857;}));
   const info=await page.evaluate(()=>({view:document.body.dataset.view,mode:document.body.dataset.mode,
    overflow:document.documentElement.scrollWidth>innerWidth,
    before_visible:getComputedStyle(document.querySelector('#before-figure')).display!=='none',
    after_visible:getComputedStyle(document.querySelector('#after-figure')).display!=='none',
    sources:['before','after'].map(p=>document.querySelector('#'+p).getAttribute('src'))}));
   assert.equal(info.view,v.id);assert.equal(info.mode,mode);assert.equal(info.overflow,false);
   assert.equal(info.before_visible,mode!=='after');assert.equal(info.after_visible,mode!=='before');
   assert.deepEqual(info.sources,['before','after'].map(p=>'evidence/'+p+'-'+v.id+'.png'));
   checks.push({screen,view:v.id,mode,passed:true});
  }
  const shots=screen==='desktop'?[['entry','after'],['living','split']]:[['bedroom1','split'],['dining','after']];
  for(const [view,mode] of shots){
   await page.selectOption('#room',view);await page.selectOption('#mode',mode);
   await page.waitForFunction(()=>Array.from(document.querySelectorAll('.frames img')).every(i=>i.complete&&i.naturalWidth===1600));
   await page.screenshot({path:dir+'/evidence/review-'+screen+'-'+view+'.png',fullPage:true});
  }
  await page.close();
 }
 assert.deepEqual(errors,[]);
 fs.writeFileSync(dir+'/browser-qa.json',JSON.stringify({schema:'ApartmentAestheticBrowserQA/1',view_count:views.length,
  review_html_sha256:crypto.createHash('sha256').update(fs.readFileSync(dir+'/review.html')).digest('hex'),checks,errors,overflow:false},null,2)+'\n');
 console.log(JSON.stringify({views:views.length,checks:checks.length,errors:errors.length,desktop_mobile:true}));
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
