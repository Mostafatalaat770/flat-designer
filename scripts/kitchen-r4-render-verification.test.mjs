import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { verifyR4Frame } from './kitchen-r4-render-verification.mjs';
const out = process.env.RENDER_OUT_DIR || 'renders/kitchen-r4';
const read = file => JSON.parse(fs.readFileSync(file));
const snapshot = read('design-development/kitchen-finish-r4/A-P0-IVORY.json');
const view = snapshot.views.find(v => v.id === 'kitchen-work');
const manifest = read(path.join(out, 'A-P0-IVORY/manifest.json'));
const batch = read(path.join(out, 'batch-manifest.json'));
const fixture = {
  snapshot, view, manifest,
  record: manifest.frames.find(f => f.view_id === view.id),
  batchRecord: batch.frames.find(f => f.variant === 'A-P0-IVORY' && f.view_id === view.id),
  metadata: read(path.join(out, 'A-P0-IVORY/kitchen-work.json')),
  png: fs.readFileSync(path.join(out, 'A-P0-IVORY/kitchen-work.png')),
};
test('actual R4 frame and full camera pass verification', () => {
  assert.equal(verifyR4Frame(fixture).validated, true);
});
for (const [name, mutate] of [
  ['image bytes', f => { f.png[100] ^= 1; }],
  ['projection', f => { f.metadata.camera.projection_type = 'orthographic'; }],
  ['camera target', f => { f.metadata.camera.target[0] += .01; }],
  ['viewport', f => { f.metadata.camera.viewport.width = 1600; }],
  ['wrong scene', f => { f.metadata.scene_revision = 'scene-9e86635b'; }],
  ['old rendered layout', f => { f.metadata.rendered_layout_json = '{}'; }],
  ['missing texture', f => { f.metadata.assets.fallbacks.push('missing.png'); }],
  ['hidden partition', f => { f.metadata.architecture_result.wall_segments_hidden = 1; }],
  ['shader failure', f => { f.record.console_errors.push('shader compilation failed'); }],
]) test(`reject ${name}`, () => {
  const f = structuredClone(fixture); f.png = Buffer.from(fixture.png); mutate(f);
  assert.throws(() => verifyR4Frame(f));
});
