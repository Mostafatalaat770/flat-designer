/**
 * Reviewer correction: the four inherited K12 angles largely face away from dining.
 * Generate strictly identical natural 42-degree standing cameras for the K12 control
 * and both six-seat A2 alternatives; only then compare appearance and usability.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
const domain=createApartmentDomain(process.cwd());
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const parent=read('design-development/k12/snapshot.json');
const variants=[
 ['control-k12','design-development/k12/snapshot.json'],
 ['compact-six','design-development/advisor/a2/dining-compact-six.json'],
 ['shift-six','design-development/advisor/a2/dining-shift-six.json'],
];
const cameraSpecs=[
 {id:'A2-entry-dining-island',room_id:'RECP-01',position:[5.732291,1.7,4.4843415],target:[5.60,1.20,2.30],fov:42},
 {id:'A2-family-living-to-dining',room_id:'RECP-01',position:[3.782291,1.7,-0.3156585],target:[5.20,1.22,2.00],fov:42}
];
const norm=([x,z])=>Math.hypot(x,z);
function angularOffset(camera,xy){
 const v=[xy[0]-camera.position[0],xy[1]-camera.position[2]];
 const aim=[camera.target[0]-camera.position[0],camera.target[2]-camera.position[2]];
 return Math.acos(Math.max(-1,Math.min(1,(v[0]*aim[0]+v[1]*aim[1])/(norm(v)*norm(aim)))));
}
const cameras=cameraSpecs.map(({id,room_id,position,target,fov})=>({
 id,room_id,camera:domain.captureCamera(parent.layout,{room_id,position,target,fov})
}));
for(const v of cameras){
 const a=v.camera.aspect??(1600/857);
 const hfov=2*Math.atan(Math.tan(v.camera.fov*Math.PI/360)*a);
 const toTable=angularOffset(v.camera,[6.652291,2.6843415]);
 const toIsland=angularOffset(v.camera,[3.732291,1.4343415]);
 console.log('CAMERA '+v.id+' half-HFOV '+(hfov*180/Math.PI/2).toFixed(1)+' tableAngle '+(toTable*180/Math.PI).toFixed(1)+' islandAngle '+(toIsland*180/Math.PI).toFixed(1));
 assert.ok(toTable < hfov/2-.02,'Dining table outside view: '+v.id);
 assert.ok(toIsland < hfov/2-.02,'Island outside view: '+v.id);
}
const outputDir='design-development/advisor/a2/new-cameras';
fs.mkdirSync(outputDir,{recursive:true});
for(const [key,file] of variants){
 const src=read(file);
 assert.equal(src.scene_revision,domain.revision(src.layout));
 assert.deepEqual(src.architecture_variant,parent.architecture_variant);
 const next=structuredClone(src);
 next.name='A2 actual DINING evidence / '+key;
 next.views=cameras;
 assert.deepEqual(next.layout,src.layout);
 fs.writeFileSync(path.join(outputDir,key+'.json'),JSON.stringify(next,null,2)+'\n');
}
console.log('Review snapshots ready: '+variants.map(x=>x[0]).join(', '));
