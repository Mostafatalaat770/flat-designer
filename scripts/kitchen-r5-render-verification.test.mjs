import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {R5_DIR} from './kitchen-r5-experiments.mjs';
import {verifyR5Frame} from './kitchen-r5-render-verification.mjs';
const out=process.env.RENDER_OUT_DIR||'renders/kitchen-r5',read=p=>JSON.parse(fs.readFileSync(p));
const snapshot=read(R5_DIR+'/D1.json'),view=snapshot.views.find(v=>v.id==='kitchen-work-evening');
const manifest=read(out+'/D1/manifest.json'),batch=read(out+'/batch-manifest.json');
const audit=read(R5_DIR+'/GEOMETRY_AUDIT.json');
const fixture={snapshot,view,manifest,record:manifest.frames.find(f=>f.view_id===view.id),
 batchRecord:batch.frames.find(f=>f.variant==='D1'&&f.view_id===view.id),metadata:read(out+'/D1/'+view.id+'.json'),png:fs.readFileSync(out+'/D1/'+view.id+'.png')};
test('genuine R5 night frame proves the source uppers, unchanged doors, exact camera and finish experiment',()=>assert.equal(verifyR5Frame(fixture,audit).validated,true));
for(const [name,mutate] of [
 ['PNG substitution',f=>f.png[99]^=1],
 ['night accidentally switched off',f=>f.metadata.camera.viewer.night=false],
 ['phantom upper mesh',f=>f.metadata.kitchen_geometry.counters[0].generated_upper_mesh_count=1],
 ['source cabinet movement',f=>f.metadata.kitchen_geometry.uppers[0].carcass_bounds.min_mm[0]+=10],
 ['door hinge relocation',f=>f.metadata.door_finish_result.doors[0].after.hinge[0]+=.05],
 ['unapproved finish',f=>f.metadata.render_experiment.finish.colour='#FFFFFF'],
 ['owner approval',f=>f.metadata.door_finish_result.owner_approved=true],
 ['missing texture',f=>f.metadata.assets.fallbacks.push('missing.png')],
 ['shader failure',f=>f.record.console_errors.push('shader error')],
])test('reject '+name,()=>{const f=structuredClone(fixture);f.png=Buffer.from(fixture.png);mutate(f);assert.throws(()=>verifyR5Frame(f,audit));});
