import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createApartmentDomain } from '../studio/domain/apartment.mjs';
import { CANDIDATE, SOURCE_SHA, sha256, verifyR4Candidate } from './kitchen-r4-candidate.mjs';
export const BASE_COMMIT='4211f1ddcd82ed18b1afe0b0e1e933c2f97220e8';
export const R4_SHA='6a745bdcde16a2b3820e26de0f367c4ac32d8b0a00204895eac1d2ef161b69ff';
export const R5_DIR='design-development/kitchen-r5';
export const DOOR_IDS=['OP-RECP-KIT','OP-KIT-TERSVC'];
export const FINISHES={D0:null,D1:{colour:'#D8D1C5',roughness:.72,appearance:'PAINT_PROXY'},D2:{colour:'#BCA98F',roughness:.72,appearance:'PROCEDURAL_WOOD_PROXY'}};
export function createR5Experiment(variant) {
  assert.ok(Object.hasOwn(FINISHES,variant));
  const bytes=fs.readFileSync(CANDIDATE);assert.equal(sha256(bytes),R4_SHA);
  const r4=JSON.parse(bytes);verifyR4Candidate(process.cwd(),r4);
  const snapshot=structuredClone(r4);
  snapshot.name='R5 '+variant+' — renderer-only kitchen review';
  const chosen=['entry-overview','wide-reception','kitchen-relationship','kitchen-work'];
  snapshot.views=r4.views.filter(v=>chosen.includes(v.id));
  for(const id of ['kitchen-work','kitchen-relationship']){
    const view=structuredClone(r4.views.find(v=>v.id===id));
    view.id+='-evening';view.camera.viewer.night=true;view.camera.viewer.hour=20;
    snapshot.views.push(view);
  }
  snapshot.render_experiment={schema:'KitchenDoorFinishExperiment/1',status:'RENDER_ONLY',variant,
    door_ids:[...DOOR_IDS],finish:structuredClone(FINISHES[variant]),owner_approved:false,construction_approved:false,cloud_saved:false,manufacturer_selected:false};
  snapshot.r5_provenance={schema:'TypeBKitchenR5Provenance/1',status:'DESIGN_EXPLORATORY',
    original_source_sha256:SOURCE_SHA,r4_source_sha256:R4_SHA,source_commit:BASE_COMMIT,
    layout_revision:r4.scene_revision,layout_changed:false,
    note:'Door finish is an isolated renderer input; scene revision remains the actual unchanged R4 layout revision. New evening views clone the two original saved camera objects, changing only view ID, night and hour.',
    owner_approved:false,construction_approved:false,cloud_saved:false,manufacturer_selected:false};
  return snapshot;
}
export function verifyR5Experiment(snapshot,variant=snapshot.render_experiment.variant) {
  assert.deepEqual(snapshot,createR5Experiment(variant),'R5 source or experiment drift');
  assert.equal(snapshot.scene_revision,createApartmentDomain(process.cwd()).revision(snapshot.layout));
  return {variant,layout_revision:snapshot.scene_revision,layout_changes:0,views:snapshot.views.length,door_ids:DOOR_IDS,owner_approved:false,construction_approved:false};
}
