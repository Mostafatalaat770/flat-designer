/**
 * A3 QA: render identical Natural42/1.70 m eye cameras for furniture tradeoffs
 * without changing the canonical apartment, saved cloud, or other rooms.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
const domain=createApartmentDomain(process.cwd());
const base=JSON.parse(fs.readFileSync('design-development/k12/snapshot.json','utf8'));
const source=[
 ['control','design-development/k12/snapshot.json'],
 ['desk-1000','design-development/advisor/a3/shift-1000.json'],
 ['desk-1200-no-extra-drawers','design-development/advisor/a3/1200-desk-drop-extra-drawers.json'],
 ['desk-1200-smaller-drawers','design-development/advisor/a3/1200-desk-smaller-drawers.json']
];
const specs=[
 {id:'BR1-window-to-desk',room_id:'BR-01',position:[-3.817709,1.7,-3.2156585],target:[-4.367709,1.20,-0.6256585],fov:42},
 {id:'BR1-bed-foot-to-desk',room_id:'BR-01',position:[-5.667709,1.7,-0.9956585],target:[-4.317709,1.20,-0.5956585],fov:42}
];
const cameras=specs.map(s=>({id:s.id,room_id:s.room_id,camera:domain.captureCamera(base.layout,s)}));
const dir='design-development/advisor/a3/cameras';
fs.mkdirSync(dir,{recursive:true});
for(const [name,file] of source){
 const snapshot=JSON.parse(fs.readFileSync(file,'utf8'));
 assert.equal(snapshot.canonical_sha256,base.canonical_sha256);
 assert.deepEqual(snapshot.architecture_variant,base.architecture_variant);
 assert.deepEqual(snapshot.layout.rooms,base.layout.rooms);
 assert.equal(snapshot.scene_revision,domain.revision(snapshot.layout));
 const out=structuredClone(snapshot);
 out.name='A3 bedroom furniture study — '+name;
 out.views=cameras;
 assert.deepEqual(out.views,cameras);
 fs.writeFileSync(path.join(dir,name+'.json'),JSON.stringify(out,null,2)+'\n');
}
console.log('A3 42-degree matched-camera snapshots: '+source.map(([name])=>name).join(', '));
