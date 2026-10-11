import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
import {sha256} from './kitchen-r4-candidate.mjs';
import {kitchenR6Spec} from '../kitchen-r6-study.js';
export const R6_BASE='b5276a1084dcf118a13aaeba27ba8ee3788d8f85';
export const R5_D1_SHA='14cf1c20bc3f78c2d21c14c904926ace5f60e6b6b59b7dbaf77d57dc68a57b1f';
export const R6_DIR='design-development/kitchen-r6';
export const R6_OPTIONS=['L0','L1','L2','L3','L2-F1'];
export function createR6Candidate(id){
  assert.ok(R6_OPTIONS.includes(id));
  const bytes=fs.readFileSync('design-development/kitchen-r5/D1.json');
  assert.equal(sha256(bytes),R5_D1_SHA,'Immutable R5 D1 snapshot changed');
  const s=JSON.parse(bytes);s.name='R6 '+id+' — source-locked functional lighting/detail study';
  s.views=s.views.filter(v=>v.id.startsWith('kitchen-'));
  s.kitchen_r6_study=kitchenR6Spec(id==='L2-F1'?'L2':id,id==='L2-F1');
  s.r6_provenance={schema:'TypeBKitchenR6Provenance/1',source_commit:R6_BASE,r5_d1_sha256:sha256(bytes),layout_changed:false,
    lighting_and_finish_proposal_only:true,owner_approved:false,construction_approved:false,cloud_saved:false,manufacturer_selected:false};
  return s;
}
export function verifyR6Candidate(s,id){
  assert.deepEqual(s,createR6Candidate(id),'R6 candidate/source/camera/approval drift');
  assert.equal(s.scene_revision,createApartmentDomain(process.cwd()).revision(s.layout));
  assert.equal(s.layout.ceiling_height_mm,createR6Candidate(id).layout.ceiling_height_mm);
  return {id,source_locked:true,owner_approved:false,construction_approved:false};
}
