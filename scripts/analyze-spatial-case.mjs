/**
 * Portable analysis CLI for agents/designers. One evidence JSON case can
 * describe furniture-pair metrics and stage-specific occupied routes; each
 * point and object is explicitly named. READ ONLY source scenes.
 *
 * Usage: npm run build && node scripts/analyze-spatial-case.mjs design-development/advisor/cases/wic-access.json
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
import {rectangle,relation} from '../studio/analysis/geometry.mjs';
import {checkActivityStages} from '../studio/analysis/route.mjs';

const root=process.cwd(),file=process.argv[2];
assert.ok(file&&file.endsWith('.json'),'Expected scenario JSON argument');
const abs=path.resolve(root,file);
assert.ok(abs.startsWith(root+path.sep),'Scenario must belong to current repository');
const caseFile=JSON.parse(fs.readFileSync(abs,'utf8'));
assert.equal(caseFile.schema,'ApartmentSpatialCase/1');
const source=path.resolve(root,caseFile.snapshot);
assert.ok(source.startsWith(root+path.sep)&&source.endsWith('.json'),'Snapshot must be a repository JSON');
const brief=JSON.parse(fs.readFileSync(source,'utf8'));
const domain=createApartmentDomain(root);
assert.equal(brief.canonical_sha256,domain.model.canonical_sha256);
assert.equal(brief.scene_revision,domain.revision(brief.layout));
const room=domain.model.rooms.find(o=>o.id===caseFile.room_id);
assert.ok(room,'Room must exist in canonical geometry');
const fixture=id=>{
 const f=brief.layout.furniture.find(o=>o.id===id);
 assert.ok(f,'Unknown furniture ID: '+id);
 assert.equal(f.room_id,room.id,'Case furniture must belong to named room');
 return f;
};
const results=(caseFile.pairs||[]).map(p=>{
 assert.ok(p.id&&p.a&&p.b,'Every pair needs id,a,b');
 return {id:p.id,a:p.a,b:p.b,measure:relation(rectangle(fixture(p.a)),rectangle(fixture(p.b)))};
});
const stages=(caseFile.routes||[]).map(s=>{
 assert.ok(s.id&&Array.isArray(s.obstacle_ids));
 const objects=s.obstacle_ids.map(id=>({id,furniture:fixture(id)}));
 const explicit=(s.extra_obstacles||[]).map(e=>{
  assert.ok(e.id);
  return e.polygon?{id:e.id,polygon:e.polygon}:{id:e.id,furniture:e.furniture};
 });
 return {id:s.id,start:s.start,goal:s.goal,obstacles:[...objects,...explicit]};
});
const routeResults=stages.length?checkActivityStages({room:room.poly,stages,
 agent_radius_mm:caseFile.agent_radius_mm??250,grid_mm:caseFile.grid_mm??50}):[];
const out={
 schema:'ApartmentSpatialCaseResult/1',
 name:caseFile.name,canonical_sha256:brief.canonical_sha256,scene_revision:brief.scene_revision,
 room_id:room.id, room_source:'canonical room polygon, image-calibrated',
 case_provenance:caseFile.provenance||'unspecified: NOT VERIFIED',
 pairs:results,routes:routeResults,
 limitations:[
  'Full circular-person body + one-cell conservative uncertainty pad, not actual posture, wheelchair or a building-code assessment',
  'Activity extra obstacle dimensions MUST be sourced or explicitly declared hypothetical, not guessed as real installed furniture',
  'Source scene may itself contain unrelated failed architectural checks; this CLI does not authorize changing them',
  'Site finished dimensions, selected hardware and true person movement remain required'
 ]};
const outfile=path.resolve(root,caseFile.output||'review-evidence/foundation/case-result.json');
assert.ok(outfile.startsWith(path.resolve(root,'review-evidence')+path.sep),
 'Output path must be in review-evidence/');
fs.mkdirSync(path.dirname(outfile),{recursive:true});
fs.writeFileSync(outfile,JSON.stringify(out,null,2)+'\n');
console.log('ANALYSIS '+out.name+' room='+out.room_id+' pairs='+out.pairs.length+
 ' stages='+out.routes.length+' results='+out.routes.map(x=>x.stage+':'+x.status).join(','));
