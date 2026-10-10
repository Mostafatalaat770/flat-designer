/**
 * Convert an EXACT verified variant-render artifact into a labeled contact sheet.
 * Re-hash every PNG against the attested batch-manifest before drawing; layout
 * and camera identity stay auditable. No generative visuals, no image distortion.
 *
 * Usage: node scripts/make-render-contact-sheet.mjs renders/verified-batch
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createCanvas,loadImage} from '@napi-rs/canvas';
import {pathToFileURL} from 'node:url';

const sha=b=>createHash('sha256').update(b).digest('hex');

export async function renderContactSheet(root,outputName='comparison-contact-sheet.png'){
 const data=JSON.parse(await fs.readFile(path.join(root,'batch-manifest.json'),'utf8'));
 assert.equal(data.schema,'ApartmentBatchRender/1');
 assert.equal(data.status,'ALL_FRAMES_VERIFIED');
 assert.ok(data.variants?.length>=2 && data.frames?.length>0);
 assert.match(outputName,/^[A-Za-z0-9_-]+\.png$/);
 const columns=data.variants.map(x=>x.name);
 const cameraIds=data.frames.filter(x=>x.variant===columns[0]).map(x=>x.view_id).sort();
 assert.ok(cameraIds.length>0);
 assert.equal(new Set(cameraIds).size,cameraIds.length);
 const table=[];
 for(const variant of columns){
  const frames=data.frames.filter(x=>x.variant===variant);
  const ids=frames.map(x=>x.view_id).sort();
  assert.deepEqual(ids,cameraIds,'Cannot contact-sheet mismatched camera sets');
  const row=[];
  for(const id of cameraIds){
   const frame=frames.find(f=>f.view_id===id);
   assert.ok(frame?.validated,'Unverified source frame');
   assert.match(id,/^[A-Za-z0-9_-]+$/);
   assert.match(variant,/^[A-Za-z0-9_-]+$/);
   const bytes=await fs.readFile(path.join(root,variant,id+'.png'));
   assert.equal(sha(bytes),frame.image_sha256,'PNG hash mismatch: '+variant+'/'+id);
   const other=data.frames.find(x=>x.variant===columns[0]&&x.view_id===id);
   assert.equal(frame.camera_signature_sha256,other.camera_signature_sha256,
    'Camera identity differs: '+variant+'/'+id);
   const image=await loadImage(bytes);
   row.push({variant,view:id,image,source_sha256:frame.image_sha256});
  }
  table.push(row);
 }
 const tileW=520,tileH=310,top=48,left=16,side=18,footer=22;
 const totalW=left*2+columns.length*tileW+(columns.length-1)*side;
 const totalH=top+cameraIds.length*(tileH+footer+side)+32;
 assert.ok(totalW<=10000 && totalH<=10000,'Too many variants for contact sheet');
 const canvas=createCanvas(totalW,totalH);
 const ctx=canvas.getContext('2d');
 ctx.fillStyle='#F4F4F1';ctx.fillRect(0,0,totalW,totalH);
 ctx.font='bold 18px sans-serif';ctx.fillStyle='#22272B';
 for(let c=0;c<columns.length;c++){
  const x=left+c*(tileW+side);
  ctx.fillText(columns[c],x+7,top-15,tileW-14);
  for(let r=0;r<cameraIds.length;r++){
   const y=top+r*(tileH+footer+side);
   const cell=table[c][r];
   ctx.fillStyle='#D9DCDA';ctx.fillRect(x,y,tileW,tileH);
   const scale=Math.min(tileW/cell.image.width,tileH/cell.image.height);
   const dw=cell.image.width*scale,dh=cell.image.height*scale;
   ctx.drawImage(cell.image,x+(tileW-dw)/2,y+(tileH-dh)/2,dw,dh);
   ctx.fillStyle='#363B3C';ctx.font='13px sans-serif';
   ctx.fillText(cameraIds[r],x+5,y+tileH+16,tileW-10);
  }
 }
 ctx.fillStyle='#5A6362';ctx.font='12px sans-serif';
 ctx.fillText('Source-backed matched-camera render comparison · exact PNG hashes verified',left,totalH-10,totalW-2*left);
 const out=path.join(root,outputName);
 const png=canvas.toBuffer('image/png');
 await fs.writeFile(out,png);
 const proof={
  schema:'ApartmentBatchContactSheet/1',
  source_manifest_sha256:sha(await fs.readFile(path.join(root,'batch-manifest.json'))),
  png_file:outputName,png_sha256:sha(png),
  grid:{columns,rows:cameraIds,tile_width_px:tileW,tile_height_px:tileH},
  images:table.flat().map(c=>({variant:c.variant,view:c.view,original_sha256:c.source_sha256}))
 };
 await fs.writeFile(path.join(root,'comparison-contact-sheet.json'),JSON.stringify(proof,null,2)+'\n');
 return proof;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 const root=process.argv[2];
 assert.ok(root,'Usage: node scripts/make-render-contact-sheet.mjs <batch directory>');
 const result=await renderContactSheet(root);
 console.log('CONTACT SHEET VERIFIED '+result.png_file+' / '+result.images.length+' source PNGs');
}
