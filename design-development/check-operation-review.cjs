const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const {chromium}=require('playwright');
let operationBrowser;
(async()=>{
 const folder=process.argv[2];assert.match(folder,/^[a-z0-9-]+$/);
 const dir=path.resolve('design-development',folder),html=fs.readFileSync(dir+'/review.html','utf8');
 const results=JSON.parse(fs.readFileSync(dir+'/results.json'));fs.mkdirSync(dir+'/evidence',{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 operationBrowser=browser;const errors=[],views=[];
 for(const [name,width,height] of [['desktop',1440,1000],['mobile',390,844]]){
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height});await page.setContent(html,{waitUntil:'load'});
  const initialStage=await page.locator('#stage').inputValue();
  const checks=await page.evaluate(()=>{
   const {result}=JSON.parse(document.querySelector('#review-data').textContent),rows=[];
   for(const stage of result.stages)for(const grid of [50,25])for(const goal of result.input.goals){
    const set=(id,value)=>{const e=document.querySelector('#'+id);e.value=value;e.dispatchEvent(new Event('change',{bubbles:true}));};
    set('stage',stage.id);set('grid',grid);set('goal',goal.id);
    const p=document.querySelector('#plan'),r=stage.routes.find(r=>r.grid_mm===grid&&r.id===goal.id);
    rows.push({stage:stage.id,grid,goal:goal.id,rendered_status:p.dataset.routeStatus,expected_status:r.status,
     rendered_valid:p.dataset.reservationsValid,expected_valid:String(stage.reservations_valid),
     rendered_obstacles:p.querySelectorAll('[data-obstacle]').length,expected_obstacles:result.input.obstacles.length+stage.added.length});
   }
   return {rows,direction:getComputedStyle(document.documentElement).direction,
    overflow:document.documentElement.scrollWidth>innerWidth,external_scripts:[...document.scripts].filter(s=>s.src).length};
  });
  assert.equal(checks.direction,'rtl');assert.equal(checks.overflow,false);assert.equal(checks.external_scripts,0);
  for(const r of checks.rows){assert.equal(r.rendered_status,r.expected_status);assert.equal(r.rendered_valid,r.expected_valid);assert.equal(r.rendered_obstacles,r.expected_obstacles);}
  await page.locator('#stage').selectOption(initialStage);
  await page.locator('#grid').selectOption('25');await page.locator('#goal').selectOption(results.input.goals[0].id);
  let sequence=null;
  if(await page.locator('#play').count()){
   await page.locator('#play').click();await page.waitForTimeout(220);assert.ok(Number(await page.locator('#sequence-step').inputValue())>0);await page.locator('#play').click();
   sequence=await page.evaluate(()=>{const {result}=JSON.parse(document.querySelector('#review-data').textContent),s=result.operation_sequences.find(s=>s.status==='SAMPLED_SEQUENCE_FOUND'&&s.parameters.grid_mm===25),slider=document.querySelector('#sequence-step'),rows=[];
    for(const i of [0,s.states.length-1,Number(slider.max)]){slider.value=i;slider.dispatchEvent(new Event('input',{bubbles:true}));const actor=document.querySelector('#sequence-plan [data-actor="operator"]'),expected=i<s.states.length?s.states[i]:s.states[2*s.states.length-2-i];rows.push({index:i,position:[Number(actor.getAttribute('cx')),Number(actor.getAttribute('cy'))],expected:expected.position_mm});}
    slider.value=s.states.length-1;slider.dispatchEvent(new Event('input',{bubbles:true}));return {rows,capture_state:s.states.at(-1),playback:'advances and pauses'};
   });for(const row of sequence.rows)assert.deepEqual(row.position,row.expected);
  }
  await page.screenshot({path:dir+'/evidence/'+name+'.png',fullPage:true});views.push({name,width,height,...checks,sequence});await page.close();
 }
 assert.deepEqual(errors,[]);await browser.close();
 const record={schema:'ApartmentOperationReviewBrowserCheck/1',source_scene:results.source_scene,views,errors,
  review_sha256:crypto.createHash('sha256').update(html).digest('hex')};
 fs.writeFileSync(dir+'/evidence/browser-check.json',JSON.stringify(record,null,2)+'\n');
 const hashes={};for(const f of ['review.html','results.json','evidence/browser-check.json','evidence/desktop.png','evidence/mobile.png'])hashes[f]=crypto.createHash('sha256').update(fs.readFileSync(dir+'/'+f)).digest('hex');
 fs.writeFileSync(dir+'/evidence/sha256.json',JSON.stringify(hashes,null,2)+'\n');
 console.log(JSON.stringify({views:views.map(v=>({name:v.name,overflow:v.overflow,cases:v.rows.length,animation:v.sequence?.playback||null})),errors},null,2));
})().catch(async e=>{console.error(e);await operationBrowser?.close();process.exitCode=1;});
