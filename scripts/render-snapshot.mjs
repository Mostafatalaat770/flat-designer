import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const snapshotPath=process.argv[2]||'render-snapshots/current.json';
const snapshot=JSON.parse(await fs.readFile(snapshotPath,'utf8'));
const template=JSON.parse(await fs.readFile('dist/capture-template.json','utf8')).html;
const outDir=process.env.RENDER_OUT_DIR||'renders';
await fs.mkdir(outDir,{recursive:true});

function safeJson(value){
  return JSON.stringify(value).replace(/</g,'\\u003c').replace(/<\\/script/gi,'<\\/script');
}
function fnv1a(str){
  let h=0x811c9dc5;
  for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,0x01000193);}
  return (h>>>0).toString(16).padStart(8,'0');
}
const snapshotJson=JSON.stringify(snapshot.layout);
const snapshotHash='branch-'+fnv1a(snapshotJson);

const browser=await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
try{
  for(const view of snapshot.views){
    const page=await browser.newPage({viewport:view.camera.viewport});
    const frameId=`${snapshot.scene_revision}-${view.id}`;
    const input={
      frame_id:frameId,
      room_id:view.room_id,
      canonical_sha256:snapshot.canonical_sha256,
      snapshot_sha256:snapshotHash,
      scene_revision:snapshot.scene_revision,
      storage_revision:snapshot.storage_revision,
      layout:snapshot.layout,
      camera:view.camera
    };
    const html=template.replace('__APARTMENT_CAPTURE_SNAPSHOT_JSON__',safeJson(input));
    await page.setContent(html,{waitUntil:'load'});
    await page.waitForFunction((id)=>{
      const err=document.body?.dataset?.captureError;
      if(err) throw new Error(err);
      return document.querySelector('#apartment-capture-canvas')?.dataset?.captureReady===id;
    },frameId,{timeout:45000});
    const canvas=page.locator('#apartment-capture-canvas');
    await canvas.screenshot({path:path.join(outDir,`${view.id}.png`)});
    const metadata=await page.evaluate(()=>window.__apartmentCaptureFrame);
    await fs.writeFile(path.join(outDir,`${view.id}.json`),JSON.stringify(metadata,null,2));
    await page.close();
    console.log(`rendered ${view.id}`);
  }
  await fs.writeFile(path.join(outDir,'manifest.json'),JSON.stringify({
    schema:'ApartmentGitHubRenderManifest/1',
    snapshot:path.basename(snapshotPath),
    name:snapshot.name,
    scene_revision:snapshot.scene_revision,
    canonical_sha256:snapshot.canonical_sha256,
    views:snapshot.views.map(v=>v.id)
  },null,2));
} finally {
  await browser.close();
}
