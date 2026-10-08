/**
 * A4 follow-up — factor-isolated SIDEBOARD camera to compare:
 * original 2400 walnut, 2400 light oak, 2000 light oak and 1800 light oak.
 * One shared 42° standing camera aimed at the sideboard itself.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
const domain=createApartmentDomain(process.cwd());
const base=JSON.parse(fs.readFileSync('design-development/k12/snapshot.json','utf8'));
const find=x=>x.layout.interior.objects.find(o=>o.id==='A-dining-sideboard');
const camera={
 id:'A4-sideboard-front-detail',
 room_id:'RECP-01',
 camera:domain.captureCamera(base.layout,{
  room_id:'RECP-01',position:[5.582291,1.7,0.0843415],
  target:[7.702291,1.15,-0.3656585],fov:42
 })
};
const fail=x=>{
 let r;try{r=domain.validate(x.layout);}catch(e){if(!e.validation)throw e;r=JSON.parse(JSON.stringify(e.validation));}
 return r.checks.filter(c=>c.status==='FAIL').map(c=>[c.kind,c.object_id??null,c.source_wall_index??null]);
};
const expected=fail(base);
assert.equal(expected.length,2);
const options=[
 {key:'walnut-2400',origin:'design-development/k12/snapshot.json',w:2400,material:'generic-walnut',colour:'#60432E'},
 {key:'oak-2400',origin:'design-development/k12/snapshot.json',w:2400,material:'a1-natural-oak',colour:'#B88C5E'},
 {key:'oak-2000',origin:'design-development/advisor/a4/muted-oak-2000.json',w:2000,material:'a1-natural-oak',colour:'#B88C5E'},
 {key:'oak-1800',origin:'design-development/advisor/a4/muted-oak-1800.json',w:1800,material:'a1-natural-oak',colour:'#B88C5E'}
];
const dir='design-development/advisor/a4/detail';
fs.mkdirSync(dir,{recursive:true});
for(const a of options){
 const snap=JSON.parse(fs.readFileSync(a.origin,'utf8'));
 const s=find(snap);
 assert.ok(s);
 s.width_mm=a.w;s.colour=a.colour;s.material_references={...s.material_references,body:a.material};
 snap.name='A4 SIDEBOARD FACTOR COMPARISON — '+a.key;
 snap.scene_revision=domain.revision(snap.layout);
 snap.views=[camera];
 assert.deepEqual(snap.architecture_variant,base.architecture_variant);
 assert.deepEqual(snap.layout.furniture,base.layout.furniture);
 assert.equal(snap.canonical_sha256,base.canonical_sha256);
 assert.deepEqual(fail(snap),expected,'No extra canonical hard failure');
 fs.writeFileSync(path.join(dir,a.key+'.json'),JSON.stringify(snap,null,2)+'\n');
}
console.log('A4 same-camera factor-isolated 4 cabinets: '+options.map(x=>x.key).join(', '));
