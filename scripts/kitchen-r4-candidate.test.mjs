import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import { CANDIDATE, IDS, createR4Candidate, verifyR4Candidate, loadR4 } from './kitchen-r4-candidate.mjs';
const root = process.cwd();

test('committed candidate exactly matches source-locked patch, computed revision and all validation findings', () => {
  const candidate = JSON.parse(fs.readFileSync(CANDIDATE));
  const audit = verifyR4Candidate(root, candidate);
  assert.equal(audit.layout_changed_fields, 9);
  assert.equal(audit.validation.summary.fail, 0);
});

test('production theme switch away and back retains all four ivory fronts', () => {
  const { domain } = loadR4(root);
  const state = createR4Candidate(root);
  const context = vm.createContext({
    state: state.layout, MODEL: domain.model, ROOMS: domain.model.rooms, MATS: {},
    snap: () => ({}), commit: () => {}, renderAll: () => {}, is3D: () => false, toast: () => {},
    interiorMaterial: (s, id) => s.interior.materials.find(x => x.id === id),
    typeColor: () => '#ffffff',
  });
  vm.runInContext(fs.readFileSync('decor-presets.js', 'utf8'), context);
  vm.runInContext("setDecorTheme('japandi'); setDecorTheme('warm');", context);
  for (const id of IDS) assert.equal(context.state.furniture.find(x => x.id === id).color, '#E8E2D7', id);
});

for (const [name, mutate] of [
  ['changed footprint', s => { s.layout.furniture[0].w += 1; }],
  ['changed camera', s => { s.views[0].camera.fov += 1; }],
  ['missing warm color', s => { s.layout.decor.saved.warm.colours['starter-20'] = '#BCA98F'; }],
  ['wall demolition', s => { s.layout.demolished.push(44); }],
  ['unrelated surface', s => { s.layout.interior.surface_materials['FLOOR-KIT-01'] = 'kitchen-soft-ivory'; }],
  ['stale revision', s => { s.scene_revision = 'scene-9e86635b'; }],
  ['false approval', s => { s.r4_provenance.construction_approved = true; }],
]) test(`reject ${name}`, () => {
  const s = createR4Candidate(root); mutate(s);
  assert.throws(() => verifyR4Candidate(root, s));
});
