/**
 * Browser acceptance: Explore is real WebGL, live state updates, no persistence
 * before explicit verified local version save, and shared camera controls.
 * Run only against isolated local-qa/serve.py (never production cloud).
 */
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
await fs.mkdir('review-evidence/explore',{recursive:true});
const browser=await chromium.launch({
 headless:true,args:['--no-sandbox','--enable-webgl','--use-gl=angle','--use-angle=swiftshader','--disable-dev-shm-usage']
});
const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
const errors=[];
page.on('pageerror',e=>errors.push(e.message));
try{
 const response=await page.goto('http://127.0.0.1:4176/_qa/workspace/explore.html',
  {waitUntil:'domcontentloaded',timeout:40000});
 assert.equal(response?.status(),200,'Explore bundled page did not serve');
 await page.getByRole('heading',{name:'Explore & Verify'}).waitFor({timeout:25000});
 await page.waitForFunction(()=>document.querySelectorAll('.explore-canvas canvas').length===2,null,{timeout:50000});
 await page.getByRole('button',{name:'Verify B against original Type B'}).waitFor({state:'visible',timeout:40000});
 const localBefore=await page.evaluate(()=>Object.keys(localStorage).sort());
 assert.equal(localBefore.length,0,'Fresh browser must start with no local versions/drafts');
 await page.getByRole('button',{name:'Warm Japandi'}).click();
 await page.getByLabel('Flooring option').selectOption('travertine');
 await page.getByLabel('Light temperature').selectOption('3000');
 await page.getByRole('slider',{name:'Visual brightness'}).press('ArrowLeft');
 await page.getByRole('button',{name:'Snapshot B → A'}).click();
 await page.getByRole('button',{name:'Calm Contemporary'}).click();
 await page.getByRole('checkbox',{name:'Side-by-side A/B'}).uncheck();
 await page.getByRole('checkbox',{name:'Side-by-side A/B'}).check();
 const afterExplore=await page.evaluate(()=>Object.keys(localStorage).sort());
 assert.deepEqual(afterExplore,localBefore,'Preview wrote browser draft or versions without an explicit save!');
 await page.getByRole('button',{name:'Verify B against original Type B'}).click();
 await page.getByText('0 FAIL').waitFor({timeout:15000});
 const verifyStatus=await page.getByText(/PASS · \d+ WARN · 0 FAIL/).first().textContent();
 assert.ok(verifyStatus?.includes('0 FAIL'),'Expected explicit, real canonical validation report');
 const noDraftBeforeSave=await page.evaluate(()=>Object.keys(localStorage).every(k=>!k.includes('draft')));
 assert.equal(noDraftBeforeSave,true);
 await page.getByRole('button',{name:'Save verified local variant'}).click();
 await page.getByText(/Saved a new IMMUTABLE LOCAL version/).waitFor({timeout:15000});
 const saved=await page.evaluate(()=>({keys:Object.keys(localStorage),canvasCount:document.querySelectorAll('.explore-canvas canvas').length}));
 assert.equal(saved.canvasCount,2);
 assert.ok(saved.keys.some(k=>/^type-b-workspace-scene-.*-v1$/.test(k)),'No saved immutable local variant');
 assert.ok(saved.keys.every(k=>!k.includes('-draft-')),'Saved variant must not overwrite local workspace draft');
 await page.screenshot({path:'review-evidence/explore/explore-verify-browser-smoke.png',fullPage:true});
 assert.equal(errors.length,0,'Browser runtime error: '+JSON.stringify(errors));
 const report={schema:'ApartmentExploreBrowserQA/1',local_server_only:true,
  compare_real_threejs_canvases:2,canonical_verified:true,unverified_preview_wrote_nothing:true,
  wrote_immutable_local_version_after_explicit_verification:true,
  wrote_cloud:false,wrote_original_workspace_draft:false,
  accepted_controls:['floor','wall/visual palette','lighting','temperature','brightness','A/B snapshot','matched camera','verify','local immutable save'],
  screenshot:'review-evidence/explore/explore-verify-browser-smoke.png',
  browser_errors:errors};
 await fs.writeFile('review-evidence/explore/explore-verify-browser-smoke.json',JSON.stringify(report,null,2)+'\n');
 console.log('PASS: real interactive two-canvas 3D page, live mood controls, no save until verified, immutable local snapshot');
}finally{await browser.close();}
