import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import { createApartmentDomain } from '../domain/apartment.mjs';

// Derive an isolated workspace from a pinned Git snapshot. Never contact Site storage.
export function createWorkspaceSeed(root, suppliedSnapshot) {
  const domain = createApartmentDomain(root);
  const source = 'studio/local/sources/verified-master-v50.json';
  const sourceBytes = fs.readFileSync(path.join(root, source));
  const snapshot = suppliedSnapshot || JSON.parse(sourceBytes);
  assert.equal(snapshot.schema, 'ApartmentGitHubRenderSnapshot/1');
  assert.equal(snapshot.canonical_sha256, domain.model.canonical_sha256);
  assert.equal(snapshot.scene_revision, domain.revision(snapshot.layout), 'Snapshot revision mismatch');
  assert.ok(Number.isInteger(snapshot.storage_revision) && snapshot.storage_revision > 0, 'Missing source storage revision');
  assert.ok(domain.validate(snapshot.layout).valid, 'Snapshot has hard validation failures');
  const historical = JSON.parse(fs.readFileSync(path.join(root, 'studio/app/data/family-a7.brief.json')));
  assert.equal(domain.revision(domain.importBrief(historical)), 'scene-9e210720', 'Preserve historical A.7');
  const layout = structuredClone(snapshot.layout);
  const cameras = snapshot.views.map(view => ({
    ...domain.captureCamera(layout, {
      ...view.camera, room_id: view.room_id, fov: 42,
      position: [view.camera.position[0], 1.7, view.camera.position[2]],
    }),
    id: 'synced-' + view.id,
    // The shared camera validator supplies default open doors. Preserve reviewed
    // open/closed presentation states after checking the standing position.
    viewer: structuredClone(view.camera.viewer),
    room_id: view.room_id,
    label: view.id.replaceAll('-', ' ') + ' · Natural',
    source_camera: { fov: view.camera.fov, eye_height_m: view.camera.position[1] },
  }));
  cameras.sort((a, b) => Number(b.id === 'synced-reception-entry') - Number(a.id === 'synced-reception-entry'));
  const historicalCameras = JSON.parse(fs.readFileSync(path.join(root, 'studio/app/data/cameras.json')));
  for (const room of domain.model.rooms) {
    if (cameras.some(c => c.room_id === room.id)) continue;
    const previous = historicalCameras.find(c => c.room_id === room.id);
    const camera = previous ? domain.captureCamera(layout, previous) : domain.presetCamera(layout, room.id);
    cameras.push({ ...camera, room_id: room.id, id: 'synced-' + room.id.toLowerCase(), label: room.name + ' · Natural' });
  }
  for (const c of cameras) {
    domain.captureCamera(layout, c);
    assert.equal(c.viewer.cut_height_m, 2.5, 'Do not hide architectural walls');
    assert.equal(c.viewer.furnishings_visible, true);
  }
  const brief = domain.designBrief(layout, JSON.parse(fs.readFileSync(path.join(root, 'studio-catalog.json'))));
  domain.importBrief(brief);
  return {
    brief, cameras,
    config: {
      name: snapshot.name,
      scene_revision: snapshot.scene_revision,
      storage_revision: snapshot.storage_revision,
      source_snapshot: source,
      source_snapshot_sha256: crypto.createHash('sha256').update(sourceBytes).digest('hex'),
      production_connected: false,
      camera_status: 'Calibrated local views; original branch cameras retained in source snapshot',
    },
  };
}
