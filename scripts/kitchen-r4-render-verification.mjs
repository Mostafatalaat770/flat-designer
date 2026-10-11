import assert from 'node:assert/strict';
import { sha256 } from './kitchen-r4-candidate.mjs';

export function verifyR4Frame({ snapshot, view, manifest, record, batchRecord, metadata, png }) {
  assert.ok(record && batchRecord, 'Missing per-frame manifest record');
  assert.equal(manifest.scene_revision, snapshot.scene_revision);
  assert.equal(manifest.canonical_sha256, snapshot.canonical_sha256);
  assert.equal(record.validated, true);
  assert.deepEqual(record.page_errors, []);
  assert.deepEqual(record.console_errors, []);
  assert.equal(record.webgl.context_lost, false);
  assert.match(record.webgl.version, /^WebGL/);
  assert.ok(record.webgl.renderer.length > 0);
  assert.deepEqual(batchRecord, record);
  assert.equal(record.scene_revision, snapshot.scene_revision);
  assert.equal(record.view_id, view.id);
  assert.equal(record.image_sha256, sha256(png), 'PNG checksum mismatch');
  assert.equal(record.image_bytes, png.byteLength);
  assert.ok(png.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])), 'Invalid PNG');
  assert.equal(png.toString('ascii', 12, 16), 'IHDR');
  assert.equal(png.readUInt32BE(16), 1280);
  assert.equal(png.readUInt32BE(20), 720);
  assert.deepEqual(view.camera.viewport, { width: 1280, height: 720 });
  assert.equal(record.camera_signature_sha256, sha256(JSON.stringify(view.camera)));
  assert.equal(metadata.schema, 'ApartmentSceneCaptureFrame/1');
  assert.equal(metadata.canonical_sha256, snapshot.canonical_sha256);
  assert.equal(metadata.scene_revision, snapshot.scene_revision);
  assert.equal(metadata.storage_revision, snapshot.storage_revision);
  assert.equal(metadata.rendered_layout_json, JSON.stringify(snapshot.layout));
  assert.equal(metadata.room_id, view.room_id);
  // Full camera comparison includes projection, clipping, viewport, doors and night/hour.
  assert.deepEqual(metadata.camera, view.camera);
  assert.deepEqual(metadata.architecture_variant, snapshot.architecture_variant ?? null);
  assert.deepEqual(manifest.architecture_variant, snapshot.architecture_variant ?? null);
  assert.ok(Object.values(metadata.architecture_result).every(x => x === 0), 'P0 architecture overlay detected');
  assert.equal(metadata.assets.pending, 0);
  assert.deepEqual(metadata.assets.fallbacks, []);
  assert.equal(metadata.renderer.engine, 'Three.js WebGL');
  assert.equal(metadata.renderer.revision, '160');
  return {
    view_id: view.id, image_sha256: sha256(png), image_bytes: png.length,
    scene_revision: snapshot.scene_revision,
    canonical_sha256: snapshot.canonical_sha256,
    camera_signature_sha256: record.camera_signature_sha256,
    metadata_sha256: sha256(JSON.stringify(metadata)),
    renderer: metadata.renderer, webgl: record.webgl, assets: metadata.assets,
    viewport: view.camera.viewport, validated: true,
  };
}
