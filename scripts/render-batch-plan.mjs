/**
 * Pure planner for exact multi-variant comparisons. No browser or filesystem.
 * Fail closed on mismatched architecture, cameras or duplicate output names.
 */
import assert from 'node:assert/strict';
import path from 'node:path';

export function makeBatchPlan(inputs) {
  assert.ok(Array.isArray(inputs) && inputs.length >= 2, 'A comparison needs at least two snapshots.');
  assert.ok(inputs.length <= 16, 'Refusing unbounded variant batch (>16).');
  const expected = inputs[0].snapshot;
  assert.ok(typeof expected.canonical_sha256 === 'string' && expected.canonical_sha256.length === 64,
    'Missing canonical SHA-256');
  const cameraSignature = JSON.stringify(expected.views?.map(v => ({
    id:v.id, room_id:v.room_id, camera:v.camera
  })));
  assert.ok(expected.views?.length, 'Missing saved exact comparison cameras');
  const outputNames = new Set();
  const plan = inputs.map(({file, snapshot}, index) => {
    assert.ok(snapshot && snapshot.layout && snapshot.scene_revision && snapshot.canonical_sha256,
      'Missing snapshot identity/layout');
    assert.equal(snapshot.canonical_sha256, expected.canonical_sha256,
      'Canonical architecture differs among comparison options');
    const signature = JSON.stringify(snapshot.views?.map(v => ({
      id:v.id, room_id:v.room_id, camera:v.camera
    })));
    assert.equal(signature, cameraSignature, 'Comparison cameras differ: ' + file);
    const ids = snapshot.views.map(x=>x.id);
    assert.equal(new Set(ids).size,ids.length,'Duplicate camera IDs: '+file);
    for (const view of snapshot.views) {
      assert.ok(view.camera?.viewport?.width > 0 && view.camera.viewport.height > 0,
        'Invalid image viewport: '+view.id);
      assert.match(view.id,/^[A-Za-z0-9_-]+$/,'Unsafe view filename');
    }
    const key = path.basename(file).replace(/\.json$/i,'');
    assert.match(key,/^[a-zA-Z0-9_-]+$/,'Unsafe variant output name');
    assert.ok(!outputNames.has(key),'Duplicate variant output name: '+key);
    outputNames.add(key);
    return {index,key,file,snapshot,views:snapshot.views};
  });
  return {
    variants: plan,
    jobs: plan.flatMap(v => v.views.map(view=>({key:v.key,index:v.index,view}))),
    canonical_sha256: expected.canonical_sha256,
    camera_signature:cameraSignature
  };
}
