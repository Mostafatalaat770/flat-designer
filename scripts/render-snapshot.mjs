import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const snapshotPath=process.argv[2]||'render-snapshots/current.json';
const snapshot=JSON.parse(await fs.readFile(snapshotPath,'utf8'));
const template=JSON.parse(await fs.readFile('dist/capture-template.json','utf8')).html;
const outDir=process.env.RENDER_OUT_DIR||'renders';
await fs.mkdir(outDir,{recursive:true});

function safeJson(value){
  // Escaping every "<" is sufficient to prevent an embedded </script> from
  // terminating the JSON script tag, and avoids regex escaping differences.
  return JSON.stringify(value).replace(/</g,'\\u003c');
}
function fnv1a(str){
  let h=0x811c9dc5;
  for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,0x01000193);}
  return (h>>>0).toString(16).padStart(8,'0');
}
const snapshotJson=JSON.stringify(snapshot.layout);
const snapshotHash='branch-'+fnv1a(snapshotJson);

function mimeFor(file){
  const ext=path.extname(file).toLowerCase();
  if(ext==='.png') return 'image/png';
  if(ext==='.jpg'||ext==='.jpeg') return 'image/jpeg';
  if(ext==='.webp') return 'image/webp';
  throw new Error('Unsupported local render asset: '+file);
}
async function addAsset(assetUrls,logicalPath){
  if(!logicalPath.startsWith('./')) return;
  if(assetUrls[logicalPath]) return;
  const file=path.resolve('dist',logicalPath.slice(2));
  const bytes=await fs.readFile(file);
  if(bytes.length>8*1024*1024) throw new Error('Render asset exceeds 8 MB: '+logicalPath);
  assetUrls[logicalPath]=`data:${mimeFor(file)};base64,${bytes.toString('base64')}`;
}
async function collectLocalAssets(layout){
  const assetUrls={};
  // Procedural Studio artwork is referenced dynamically as ./art/<theme>.png,
  // so embed every bundled art image just like the production capture worker.
  try{
    const names=await fs.readdir(path.resolve('dist/art'));
    for(const name of names){
      if(/\.(png|jpe?g|webp)$/i.test(name)) await addAsset(assetUrls,'./art/'+name);
    }
  }catch(error){
    if(error?.code!=='ENOENT') throw error;
  }
  // Also embed relative maps saved directly on materials.
  const visit=value=>{
    if(typeof value==='string'&&value.startsWith('./')) return [value];
    if(Array.isArray(value)) return value.flatMap(visit);
    if(value&&typeof value==='object') return Object.values(value).flatMap(visit);
    return [];
  };
  for(const logicalPath of new Set(visit(layout))) await addAsset(assetUrls,logicalPath);
  return assetUrls;
}
const assetUrls=await collectLocalAssets(snapshot.layout);
console.log(`embedded ${Object.keys(assetUrls).length} local render assets`);

const browser=await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist']});
try{
  for(const view of snapshot.views){
    const page=await browser.newPage({viewport:view.camera.viewport});
    page.on('pageerror', error=>console.error(`page error in ${view.id}: ${error.message}`));
    console.log(`rendering ${view.id}`);
    const frameId=`${snapshot.scene_revision}-${view.id}`;
    const input={
      frame_id:frameId,
      room_id:view.room_id,
      canonical_sha256:snapshot.canonical_sha256,
      snapshot_sha256:snapshotHash,
      scene_revision:snapshot.scene_revision,
      storage_revision:snapshot.storage_revision,
      layout:snapshot.layout,
      camera:view.camera,
      asset_urls:assetUrls
    };
    const html=template.replace('__APARTMENT_CAPTURE_SNAPSHOT_JSON__',safeJson(input));
    await page.setContent(html,{waitUntil:'load'});
    await page.waitForFunction((id)=>{
      const err=document.body?.dataset?.captureError;
      if(err) throw new Error(err);
      return document.querySelector('#apartment-capture-canvas')?.dataset?.captureReady===id;
    },frameId,{timeout:120000});
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
