import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { SOURCE, CANDIDATE, sha256, verifyR4Candidate } from './kitchen-r4-candidate.mjs';
import { verifyR4Frame } from './kitchen-r4-render-verification.mjs';

const root = process.cwd();
const out = process.env.RENDER_OUT_DIR || 'renders/kitchen-r4';
const read = file => JSON.parse(fs.readFileSync(file));
const candidate = read(CANDIDATE);
const audit = verifyR4Candidate(root, candidate);
const source = read(SOURCE);
const batch = read(path.join(out, 'batch-manifest.json'));
assert.equal(batch.status, 'ALL_FRAMES_VERIFIED');
assert.equal(batch.frames.length, 16);
assert.equal(batch.variants.length, 2);
assert.ok(batch.browser_version);
assert.equal(batch.capture_template_sha256, sha256(fs.readFileSync('dist/capture-template.json')));
assert.deepEqual(source.views, candidate.views);
assert.equal(source.views.length, 8);
const frames = [];
for (const file of [SOURCE, CANDIDATE]) {
  const snapshot = read(file);
  const key = path.basename(file, '.json');
  const variant = batch.variants.find(x => x.name === key);
  assert.ok(variant);
  const manifest = read(path.join(out, key, 'manifest.json'));
  const snapshotSha = sha256(fs.readFileSync(file));
  assert.equal(manifest.source_file, file);
  assert.equal(manifest.source_sha256, snapshotSha);
  assert.equal(variant.source_sha256, snapshotSha);
  assert.equal(variant.scene_revision, snapshot.scene_revision);
  assert.equal(variant.expected_views, 8);
  assert.equal(manifest.frames.length, 8);
  assert.deepEqual(manifest.cameras, snapshot.views.map(v => ({ id: v.id, room_id: v.room_id, camera: v.camera })));
  assert.equal(new Set(manifest.frames.map(f => f.view_id)).size, 8);
  for (const view of snapshot.views) {
    const base = path.join(out, key, view.id);
    const metadataBytes = fs.readFileSync(base + '.json');
    const verified = verifyR4Frame({
      snapshot, view, manifest,
      record: manifest.frames.find(f => f.view_id === view.id),
      batchRecord: batch.frames.find(f => f.variant === key && f.view_id === view.id),
      metadata: JSON.parse(metadataBytes), png: fs.readFileSync(base + '.png'),
    });
    frames.push({ ...verified, variant: key,
      image: `${key}/${view.id}.png`, metadata: `${key}/${view.id}.json`,
      metadata_file_sha256: sha256(metadataBytes), input_snapshot: file, input_snapshot_sha256: snapshotSha,
    });
  }
}
const pairs = [];
for (const view of source.views) {
  const before = frames.find(f => f.variant === 'A-P0' && f.view_id === view.id);
  const after = frames.find(f => f.variant === 'A-P0-IVORY' && f.view_id === view.id);
  assert.equal(before.camera_signature_sha256, after.camera_signature_sha256);
  const images = await Promise.all([before, after].map(f => loadImage(fs.readFileSync(path.join(out, f.image)))));
  const arrays = images.map(im => {
    const cv = createCanvas(1280, 720); const ctx = cv.getContext('2d'); ctx.drawImage(im, 0, 0);
    return ctx.getImageData(0, 0, 1280, 720).data;
  });
  let changed = 0, maximum = 0, sum = 0;
  let minX = 1280, minY = 720, maxX = -1, maxY = -1;
  for (let p = 0; p < 1280 * 720; p++) {
    let delta = 0;
    for (let ch = 0; ch < 3; ch++) delta = Math.max(delta, Math.abs(arrays[0][p*4+ch] - arrays[1][p*4+ch]));
    maximum = Math.max(maximum, delta); sum += delta;
    if (delta > 2) { changed++; minX = Math.min(minX, p%1280); maxX = Math.max(maxX, p%1280); minY = Math.min(minY, Math.floor(p/1280)); maxY = Math.max(maxY, Math.floor(p/1280)); }
  }
  if (view.id === 'kitchen-work') assert.ok(changed > 1000, 'No visible kitchen finish change');
  pairs.push({ view_id: view.id, before: before.image, after: after.image,
    camera_signature_sha256: before.camera_signature_sha256,
    pixels_changed_over_2: changed, changed_percent: +(changed / (1280*720) * 100).toFixed(3),
    max_channel_delta: maximum, mean_max_channel_delta: +(sum/(1280*720)).toFixed(4),
    change_bounds_px: changed ? [minX,minY,maxX,maxY] : null,
  });
}
const result = {
  schema: 'TypeBKitchenR4MatchedWebGL/1', status: 'ALL_16_FRAMES_VERIFIED',
  canonical_sha256: source.canonical_sha256,
  candidate_audit: audit, frames, pairs,
  capture_template_sha256: sha256(fs.readFileSync('dist/capture-template.json')),
  production_builder_sha256: sha256(fs.readFileSync('studio/renderer/builders.js')),
  browser_version: batch.browser_version,
  capture_started_at: batch.started_at, capture_finished_at: batch.finished_at,
  render_script_sha256: sha256(fs.readFileSync('scripts/render-variants.mjs')),
  capture_builder_sha256: sha256(fs.readFileSync('build_capture.mjs')),
  original_source_sha256: sha256(fs.readFileSync(SOURCE)),
  after_webgl_rendered: true, owner_approved: false, construction_approved: false, cloud_saved: false,
};
fs.writeFileSync(path.join(out, 'VERIFIED_MANIFEST.json'), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify({ status: result.status, pairs }, null, 2));
