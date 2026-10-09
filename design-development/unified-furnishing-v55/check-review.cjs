const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {chromium}=require('playwright');let browser;
(async()=>{
 const dir=__dirname,html=fs.readFileSync(dir+'/review.html','utf8'),r=JSON.parse(fs.readFileSync(dir+'/results.json'));
 fs.mkdirSync(dir+'/evidence',{recursive:true});const errors=[],views=[];
 browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [name,width,height]of [['desktop',1440,1000],['mobile',390,844]]){
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));await page.setViewportSize({width,height});await page.setContent(html,{waitUntil:'load'});
  const rows=await page.evaluate(()=>{const r=JSON.parse(document.querySelector('#review-data').textContent).result,rows=[];
   for(const s of r.stages)for(const grid of [50,25])for(const g of r.goals){
    for(const [id,v]of [['stage',s.id],['grid',grid],['goal',g.id]]){const e=document.querySelector('#'+id);e.value=v;e.dispatchEvent(new Event('change',{bubbles:true}));}
    const plan=document.querySelector('#plan'),expected=s.routes.find(r=>r.id===g.id&&r.grid_mm===grid),line=plan.querySelector('#selected-route');
    rows.push({stage:s.id,grid,goal:g.id,status:plan.dataset.routeStatus,expected:expected.status,
     path_matches:expected.route_mm.length?line?.getAttribute('points')===expected.route_mm.map(p=>p.join(',')).join(' '):!line,
     obstacles:plan.querySelectorAll('[data-obstacle]').length,expected_obstacles:s.obstacles.length+s.added.length});
   }return rows;});
  for(const row of rows){assert.equal(row.status,row.expected);assert.equal(row.path_matches,true);assert.equal(row.obstacles,row.expected_obstacles);}
  await page.locator('#stage').selectOption('dining-six');await page.locator('#goal').selectOption('bedroom1-desk');await page.locator('#grid').selectOption('25');
  const before=await page.locator('#plan').getAttribute('viewBox');await page.locator('#focus').click();const after=await page.locator('#plan').getAttribute('viewBox');assert.notEqual(before,after);
  await page.screenshot({path:dir+'/evidence/'+name+'-bedroom.png',fullPage:true});await page.locator('#whole').click();assert.equal(await page.locator('#plan').getAttribute('viewBox'),before);
  const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,direction:getComputedStyle(document.documentElement).direction,external_scripts:[...document.scripts].filter(s=>s.src).length}));
  assert.equal(layout.overflow,false);assert.equal(layout.direction,'rtl');assert.equal(layout.external_scripts,0);
  await page.screenshot({path:dir+'/evidence/'+name+'.png',fullPage:true});views.push({name,width,height,cases:rows.length,...layout,focus_changes_viewbox:true,rows});await page.close();
 }
 assert.deepEqual(errors,[]);await browser.close();browser=null;
 const record={schema:'ApartmentUnifiedReviewBrowserCheck/1',source_scene:r.source_scene,candidate_scene:r.candidate_scene,views,errors};
 fs.writeFileSync(dir+'/evidence/browser-check.json',JSON.stringify(record,null,2)+'\n');
 const files=['proposal.json','snapshot.json','brief.json','composition.json','compose.mjs','floor.mjs','study.mjs','verify.mjs',
  'measurements.json','build-review.mjs','check-review.cjs','results.json','verification.json','review.html','evidence/browser-check.json',
  ...['desktop','mobile'].flatMap(n=>['evidence/'+n+'.png','evidence/'+n+'-bedroom.png'])];
 const hashes={};for(const f of files)hashes[f]=crypto.createHash('sha256').update(fs.readFileSync(dir+'/'+f)).digest('hex');
 fs.writeFileSync(dir+'/evidence/sha256.json',JSON.stringify(hashes,null,2)+'\n');
 console.log(JSON.stringify({views:views.map(v=>({name:v.name,cases:v.cases,overflow:v.overflow,focus:v.focus_changes_viewbox})),errors},null,2));
})().catch(async e=>{console.error(e);await browser?.close();process.exitCode=1;});
