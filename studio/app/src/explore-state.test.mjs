import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createApartmentDomain} from '../../domain/apartment.mjs';
import {PALETTES,snapshotExplore,verifyExplore,assertExploreChoices} from './explore-state.mjs';
const domain=createApartmentDomain(process.cwd());
const snapshot=JSON.parse(fs.readFileSync('studio/local/sources/verified-master-v50.json','utf8'));
const source=snapshot.layout;
const make=k=>{const {name,...choices}=PALETTES[k];return choices};
test('true saved Type B source is immutable when trying 2 different finishes',()=>{
 assert.equal(snapshot.canonical_sha256,domain.model.canonical_sha256);
 assert.equal(snapshot.scene_revision,domain.revision(source));
 const before=JSON.stringify(source);
 const a=snapshotExplore(source,'RECP-01',make('calm'));
 const b=snapshotExplore(source,'RECP-01',make('japandi'));
 assert.equal(JSON.stringify(source),before);
 assert.deepEqual(a.furniture,source.furniture);
 assert.deepEqual(b.demolished,source.demolished);
 assert.deepEqual(b.rooms,source.rooms);
 assert.deepEqual(b.interior,source.interior);
 assert.notDeepEqual(a.studio.rooms['RECP-01'],b.studio.rooms['RECP-01']);
 assert.deepEqual(b.studio.rooms['KIT-01'],source.studio.rooms['KIT-01']);
});
test('real geometry check allows one cosmetic room, logs exact source and warnings',()=>{
 const choices=make('calm'),c=snapshotExplore(source,'RECP-01',choices);
 const r=verifyExplore({baseline:source,candidate:c,roomId:'RECP-01',choice:choices,
  validate:x=>domain.validate(x),revision:x=>domain.revision(x),canonical:domain.model.canonical_sha256});
 assert.equal(r.pass,true);
 assert.equal(r.base_scene_revision,snapshot.scene_revision);
 assert.equal(r.proposed_scene_revision,domain.revision(c));
 assert.equal(r.canonical_sha256,domain.model.canonical_sha256);
 assert.ok(!r.allowed_changes.some(x=>x.includes('walls moved')));
});
test('reject hidden geometry edits, cabinet relocation and unrelated rooms even if cosmetically plausible',()=>{
 const choices=make('japandi'),c=snapshotExplore(source,'RECP-01',choices);
 c.furniture[0].cx+=25;
 assert.throws(()=>verifyExplore({baseline:source,candidate:c,roomId:'RECP-01',choice:choices,
  validate:x=>domain.validate(x),revision:x=>domain.revision(x),canonical:domain.model.canonical_sha256}),/extra edits/);
 const another=snapshotExplore(source,'RECP-01',choices);
 another.studio.rooms['KIT-01'].wall='#ffffff';
 assert.throws(()=>verifyExplore({baseline:source,candidate:another,roomId:'RECP-01',choice:choices,
  validate:x=>domain.validate(x),revision:x=>domain.revision(x),canonical:domain.model.canonical_sha256}),/extra edits/);
});
test('unknown floor type, out of range brightness and unauthorized properties cannot be previewed',()=>{
 assert.throws(()=>assertExploreChoices({...make('calm'),kitchen_wall:'#aaaabb'}),/only/);
 assert.throws(()=>snapshotExplore(source,'RECP-01',{...make('calm'),flooring:'magic-alabaster'}),/Invalid Explore/);
 assert.throws(()=>snapshotExplore(source,'RECP-01',{...make('calm'),brightness:110}),/Invalid Explore/);
 assert.throws(()=>snapshotExplore(source,'invented-room',make('calm')),/canonical room/);
});
test('fail closed with bad source or failed geometry, never certify actual sunlight/MEP',()=>{
 const x=snapshotExplore(source,'RECP-01',make('calm'));
 assert.throws(()=>verifyExplore({baseline:source,candidate:x,roomId:'RECP-01',choice:make('calm'),
  validate:()=>({checks:[{status:'FAIL',message:'Cabinet hits wall'}]}),
  revision:domain.revision,canonical:domain.model.canonical_sha256}),/Cabinet hits wall/);
 const invalid=structuredClone(source);invalid.sourceCanonicalHash='bad';
 assert.throws(()=>verifyExplore({baseline:invalid,candidate:snapshotExplore(invalid,'RECP-01',make('calm')),
  roomId:'RECP-01',choice:make('calm'),validate:()=>({checks:[]}),revision:domain.revision,
  canonical:domain.model.canonical_sha256}),/Source canonical/);
 const report=verifyExplore({baseline:source,candidate:x,roomId:'RECP-01',choice:make('calm'),
  validate:y=>domain.validate(y),revision:domain.revision,canonical:domain.model.canonical_sha256});
 assert.ok(report.excluded.includes('real sunlight/solar geography'));
 assert.ok(report.excluded.includes('electrical wattage/circuits'));
});
