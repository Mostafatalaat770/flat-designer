import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { sha256, SOURCE_SHA } from './kitchen-r4-candidate.mjs';
const out = process.env.RENDER_OUT_DIR || 'renders/kitchen-r4';
const html = fs.readFileSync(path.join(out,'Review.html'),'utf8');
const doc = new JSDOM(html).window.document;
const manifest = JSON.parse(fs.readFileSync(path.join(out,'VERIFIED_MANIFEST.json')));
assert.equal(doc.documentElement.lang, 'ar');
assert.equal(doc.documentElement.dir, 'rtl');
assert.equal(doc.querySelectorAll('img').length,16);
const seen = new Set();
for (const image of doc.querySelectorAll('img')) {
  const key = image.dataset.imagePath;
  assert.ok(!seen.has(key)); seen.add(key);
  const frame = manifest.frames.find(f=>f.image===key); assert.ok(frame);
  assert.equal(image.width,1280); assert.equal(image.height,720);
  assert.match(image.src,/^data:image\/png;base64,/);
  const bytes=Buffer.from(image.src.split(',')[1],'base64');
  assert.equal(sha256(bytes),frame.image_sha256);
  assert.equal(image.dataset.sha256,frame.image_sha256);
  assert.equal(image.closest('a').href,image.src);
}
assert.deepEqual([...seen].sort(),manifest.frames.map(f=>f.image).sort());
assert.equal(doc.querySelectorAll('script[src],link[href],iframe,video').length,0);
for(const anchor of doc.querySelectorAll('a')) {
  assert.match(anchor.href,/^data:/,'Review link has an external dependency');
  assert.ok(anchor.download);
}
assert.equal(sha256(fs.readFileSync(path.join(out,'sources/A-P0.json'))),SOURCE_SHA);
for (const line of fs.readFileSync(path.join(out,'MANIFEST.sha256'),'utf8').trim().split('\n')) {
  const [hash,file] = line.split('  ');
  assert.equal(sha256(fs.readFileSync(path.join(out,file))),hash,file);
}
console.log('Offline review PASS: 16 unchanged embedded PNGs, all links local data downloads, source and bundle checksums verified.');
