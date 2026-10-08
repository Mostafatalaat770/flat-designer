import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {renderContactSheet} from './make-render-contact-sheet.mjs';
const sha=b=>createHash('sha256').update(b).digest('hex');
async function fixture(){
 const dir=await fs.mkdtemp(path.join(os.tmpdir(),'apt-batch-sheet-'));
 const variants=['a','b'],cameraIds=['entry','corner'];
 const frames=[];
 for(const [vi,v] of variants.entries()){
  await fs.mkdir(path.join(dir,v));
  for(const [ci,id] of cameraIds.entries()){
   const c=createCanvas(64,48),ctx=c.getContext('2d');
   ctx.fillStyle=['#eeeeee','#aaaaaa','#555555','#222222'][vi*2+ci];
   ctx.fillRect(0,0,64,48);
   const png=c.toBuffer('image/png');
   await fs.writeFile(path.join(dir,v,id+'.png'),png);
   frames.push({variant:v,view_id:id,image_sha256:sha(png),validated:true,
    camera_signature_sha256:sha(id)});
  }
 }
 const manifest={schema:'ApartmentBatchRender/1',status:'ALL_FRAMES_VERIFIED',
  variants:variants.map(name=>({name})),frames};
 await fs.writeFile(path.join(dir,'batch-manifest.json'),JSON.stringify(manifest,null,2));
 return dir;
}
test('composes 2x2 original PNG grid and publishes traceable manifest',async()=>{
 const dir=await fixture();
 try{
  const result=await renderContactSheet(dir);
  const file=await fs.readFile(path.join(dir,result.png_file));
  const im=await loadImage(file);
  assert.equal(result.images.length,4);
  assert.ok(im.width>1000 && im.height>600);
  assert.equal(sha(file),result.png_sha256);
  assert.deepEqual(result.grid.columns,['a','b']);
  assert.deepEqual(result.grid.rows,['corner','entry']);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
test('rejects manipulated source image rather than generating a false comparison',async()=>{
 const dir=await fixture();
 try{
  await fs.writeFile(path.join(dir,'b','entry.png'),Buffer.from('not a PNG'));
  await assert.rejects(renderContactSheet(dir),/PNG hash mismatch/);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
test('rejects frames from mismatched cameras',async()=>{
 const dir=await fixture();
 try{
  const p=path.join(dir,'batch-manifest.json');
  const x=JSON.parse(await fs.readFile(p,'utf8'));
  x.frames.find(f=>f.variant==='b'&&f.view_id==='entry').camera_signature_sha256='changed';
  await fs.writeFile(p,JSON.stringify(x));
  await assert.rejects(renderContactSheet(dir),/Camera identity differs/);
 }finally{await fs.rm(dir,{recursive:true,force:true});}
});
