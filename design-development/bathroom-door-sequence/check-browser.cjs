const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const comparisons=process.argv.includes('--comparisons'),prefix=comparisons?'comparisons-':'',
  reviewFile=comparisons?'comparison-review.html':'review.html',resultsFile=comparisons?'comparisons.json':'results.json',
  active=comparisons?'#north-hinge-outward':'#master';
 const dir=path.resolve('design-development/bathroom-door-sequence'),html=fs.readFileSync(dir+'/'+reviewFile,'utf8');
 fs.mkdirSync(dir+'/evidence',{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const views=[];
 for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
  await page.setViewportSize({width,height});await page.setContent(html,{waitUntil:'load'});
  assert.equal(await page.locator('.card').count(),comparisons?3:2);
  const checks=await page.evaluate(()=>{
   const rows=[];
   for(const card of document.querySelectorAll('.card')){
    const data=JSON.parse(card.querySelector('.sequence-data').textContent),slider=card.querySelector('.step');
    for(const index of [0,Math.floor(data.states.length/2),data.states.length-1]){
     slider.value=index;slider.dispatchEvent(new Event('input',{bubbles:true}));
     const body=card.querySelector('.body'),s=data.states[index];
     rows.push({id:card.id,index,rendered:[Number(body.getAttribute('cx')),Number(body.getAttribute('cy'))],expected:s.position_mm,phase:card.querySelector('.stage').textContent});
    }
    slider.value=0;slider.dispatchEvent(new Event('input',{bubbles:true}));
   }
   return {rows,direction:getComputedStyle(document.documentElement).direction,
    overflow:document.documentElement.scrollWidth>innerWidth,
    external_scripts:[...document.scripts].filter(s=>s.src).length};
  });
  assert.equal(checks.direction,'rtl');assert.equal(checks.overflow,false);assert.equal(checks.external_scripts,0);
  for(const row of checks.rows)assert.deepEqual(row.rendered,row.expected);
  const play=page.locator(active+' .play');await play.click();await page.waitForTimeout(200);
  assert.ok(Number(await page.locator(active+' .step').inputValue())>0);await play.click();
  await page.locator(active+' .step').evaluate(s=>{s.value=0;s.dispatchEvent(new Event('input',{bubbles:true}));});
  const capture_states=comparisons?await page.evaluate(()=>[...document.querySelectorAll('.card')].map(card=>{
   const data=JSON.parse(card.querySelector('.sequence-data').textContent),slider=card.querySelector('.step'),index=data.opening_count-1;
   slider.value=index;slider.dispatchEvent(new Event('input',{bubbles:true}));
   return {variant:card.id,index,...data.states[index]};
  })):null;
  await page.screenshot({path:dir+'/evidence/'+prefix+name+'.png',fullPage:true});
  views.push({name,width,height,...checks,...(capture_states?{capture_states}:{}),playback:'advances and pauses'});
 }
 assert.deepEqual(errors,[]);
 const record={schema:'ApartmentBathroomReviewBrowserCheck/1',source_scene:'scene-9cf45a73',storage_revision:55,
  review_sha256:crypto.createHash('sha256').update(html).digest('hex'),errors,views};
 fs.writeFileSync(dir+'/evidence/'+prefix+'browser-check.json',JSON.stringify(record,null,2)+'\n');
 const hashes={};for(const file of [reviewFile,resultsFile,'evidence/'+prefix+'browser-check.json','evidence/'+prefix+'desktop.png','evidence/'+prefix+'mobile.png'])hashes[file]=crypto.createHash('sha256').update(fs.readFileSync(dir+'/'+file)).digest('hex');
 fs.writeFileSync(dir+'/evidence/'+prefix+'sha256.json',JSON.stringify(hashes,null,2)+'\n');
 console.log(JSON.stringify({views:views.map(v=>({name:v.name,width:v.width,overflow:v.overflow,states_checked:v.rows.length,playback:v.playback})),errors},null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
