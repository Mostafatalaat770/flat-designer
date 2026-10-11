import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createApartmentDomain, LOCKED_CANONICAL } from '../studio/domain/apartment.mjs';

export const SOURCE = 'design-development/reception-sprint/A-P0.json';
export const CANDIDATE = 'design-development/kitchen-finish-r4/A-P0-IVORY.json';
export const SOURCE_SHA = '017a76a5fc6d5ff0e90f1adb10140c7098e3c2cc3e86d18e7a0b0c0fd439ec2a';
export const IDS = ['starter-20', 'K3-corner', 'K3-sink-base', 'K3-dishwasher'];
export const sha256 = value => createHash('sha256').update(value).digest('hex');
const read = (root, file) => JSON.parse(fs.readFileSync(path.join(root, file)));

// Walk every field, including fields that future source versions may add.
export function recursiveDiff(before, after, prefix = '') {
  if (Object.is(before, after)) return [];
  if (before && after && typeof before === 'object' && typeof after === 'object' &&
      Array.isArray(before) === Array.isArray(after)) {
    return [...new Set([...Object.keys(before), ...Object.keys(after)])].flatMap(key =>
      recursiveDiff(before[key], after[key], `${prefix}/${key}`));
  }
  return [{ path: prefix, before, after }];
}

export function loadR4(root) {
  const bytes = fs.readFileSync(path.join(root, SOURCE));
  assert.equal(sha256(bytes), SOURCE_SHA, 'Immutable A/P0 source changed');
  const source = JSON.parse(bytes);
  assert.equal(source.canonical_sha256, LOCKED_CANONICAL);
  assert.equal(source.scene_revision, 'scene-9e86635b');
  assert.equal(source.source_scene_revision, 'scene-4821689');
  assert.equal(source.storage_revision, 55);
  assert.deepEqual(source.layout.demolished, []);
  assert.equal(source.architecture_variant, undefined, 'P0 must retain original architecture');
  const patch = read(root, 'design-development/release-r1/KITCHEN_FINISH_R4_PATCH.json');
  assert.equal(patch.source.sha256, SOURCE_SHA);
  assert.deepEqual(patch.changes.map(x => x.id), IDS);
  assert.deepEqual(patch.saved_theme_colour_changes.map(x => x.id), IDS);
  assert.ok(Object.values(patch.release).every(x => x === false));
  const registry = read(root, 'design-development/decision-registry.json');
  assert.ok(Object.values(registry.approval_flags).every(x => x === false));
  const domain = createApartmentDomain(root);
  assert.equal(domain.revision(source.layout), source.scene_revision);
  return { source, patch, domain };
}

export function createR4Candidate(root) {
  const { source, patch, domain } = loadR4(root);
  const candidate = structuredClone(source);
  for (const change of patch.changes) {
    const f = candidate.layout.furniture.find(x => x.id === change.id);
    assert.ok(f, change.id);
    const expected = { color: '#BCA98F', ...(change.id === 'K3-dishwasher' ? { material_id: 'kitchen-muted-light-oak' } : {}) };
    const set = { color: '#E8E2D7', ...(change.id === 'K3-dishwasher' ? { material_id: 'kitchen-soft-ivory' } : {}) };
    assert.deepEqual(change.expected, expected);
    assert.deepEqual(change.set, set);
    for (const [key, value] of Object.entries(expected)) assert.equal(f[key], value);
    Object.assign(f, set);
  }
  for (const change of patch.saved_theme_colour_changes) {
    assert.equal(change.theme, 'warm');
    assert.equal(change.expected, '#BCA98F');
    assert.equal(change.set, '#E8E2D7');
    assert.equal(candidate.layout.decor.saved.warm.colours[change.id], change.expected);
    candidate.layout.decor.saved.warm.colours[change.id] = change.set;
  }
  candidate.scene_revision = domain.revision(candidate.layout);
  candidate.r4_provenance = {
    schema: 'TypeBKitchenR4Provenance/1',
    status: 'RENDER_ONLY', design_status: 'DESIGN_EXPLORATORY',
    source_snapshot: SOURCE, source_sha256: SOURCE_SHA,
    source_scene_revision: source.scene_revision,
    original_cloud_scene: source.source_scene_revision, original_cloud_storage_revision: 55,
    candidate_scene_revision: candidate.scene_revision,
    owner_approved: false, construction_approved: false, cloud_saved: false,
    manufacturer_selected: false,
  };
  return candidate;
}

export function verifyR4Candidate(root, candidate) {
  const { source, domain } = loadR4(root);
  const expected = createR4Candidate(root);
  assert.deepEqual(candidate, expected, 'Candidate contains unauthorized changes or stale provenance');
  assert.equal(candidate.scene_revision, domain.revision(candidate.layout));
  assert.notEqual(candidate.scene_revision, source.scene_revision);
  const diff = recursiveDiff(source.layout, candidate.layout);
  const allowed = IDS.flatMap(id => {
    const i = source.layout.furniture.findIndex(x => x.id === id);
    return [`/furniture/${i}/color`, ...(id === 'K3-dishwasher' ? [`/furniture/${i}/material_id`] : []), `/decor/saved/warm/colours/${id}`];
  });
  assert.deepEqual(diff.map(x => x.path).sort(), allowed.sort(), 'Exact nine finish fields required');
  const beforeValidation = domain.validate(source.layout);
  const afterValidation = domain.validate(candidate.layout);
  assert.equal(afterValidation.valid, true);
  assert.deepEqual(afterValidation, beforeValidation, 'Existing validation findings must remain unchanged');
  return {
    schema: 'TypeBKitchenR4CandidateAudit/1', status: 'PASS',
    source_sha256: SOURCE_SHA, canonical_sha256: LOCKED_CANONICAL,
    source_scene_revision: source.scene_revision, candidate_scene_revision: candidate.scene_revision,
    changed_ids: IDS, layout_diff: diff, layout_changed_fields: diff.length,
    geometry_drift: 0, camera_drift: 0, architecture_drift: 0,
    furniture_count: candidate.layout.furniture.length,
    validation: { status: afterValidation.status, valid: afterValidation.valid, summary: afterValidation.summary },
    owner_approved: false, construction_approved: false, cloud_saved: false, manufacturer_selected: false,
  };
}
