import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import * as THREE from '../dist/vendor/three/build/three.module.js';

const model=JSON.parse(fs.readFileSync('dist/apartment-model.json','utf8'));
const snapshot=JSON.parse(fs.readFileSync(process.argv[2] || 'render-snapshots/current.json','utf8'));
const original=JSON.stringify({model,snapshot});
const source=fs.readFileSync('capture-renderer.js','utf8').split('/* This boot')[0];
const groups={archUp:new THREE.Group(),archFloor:new THREE.Group(),sceneDecorG:new THREE.Group()};
const removed=snapshot.architecture_variant.remove_wall_segments[0];
const retained=model.wall_segments.find(s=>s.from[1]===550.754);
assert.ok(retained);
function fixture(group,key,value){const mesh=new THREE.Mesh(new THREE.BoxGeometry(.1,.1,.1),new THREE.MeshBasicMaterial());mesh.userData[key]=value;group.add(mesh);return mesh;}
const removedWall=fixture(groups.archUp,'wallSegment',removed);
const retainedWall=fixture(groups.archUp,'wallSegment',retained);
const removedTrim=fixture(groups.sceneDecorG,'hostWallSegment',{from:removed.to,to:removed.from});
const retainedTrim=fixture(groups.sceneDecorG,'hostWallSegment',retained);
const freeFurniture=fixture(groups.sceneDecorG,'fid','independent-furniture');
const hiddenThreshold=fixture(groups.archFloor,'openingId','OP-RECP-KIT');
const entryThreshold=fixture(groups.archFloor,'openingId','OP-ENT-01');
for(const id of ['RECP-01','KIT-01'])fixture(groups.archUp,'ceilingFor',id);
const shapeOf=(poly,flip)=>{const s=new THREE.Shape();poly.forEach(([x,z],i)=>s[i?'lineTo':'moveTo']((x-model.width_mm/2)/1000,flip?(z-model.depth_mm/2)/1000:-(z-model.depth_mm/2)/1000));return s;};
const context=vm.createContext({...groups,THREE,H:2.5,M:n=>n/1000,wx:n=>(n-model.width_mm/2)/1000,wz:n=>(n-model.depth_mm/2)/1000,shapeOf,doors:[],wallMat:new THREE.MeshBasicMaterial(),capMat:new THREE.MeshBasicMaterial()});
vm.runInContext(source,context);
const result=context.applyApartmentArchitectureVariant(snapshot.architecture_variant);
assert.equal(removedWall.visible,false);
assert.equal(removedTrim.visible,false,'A removed wall must not leave its skirting behind');
assert.equal(hiddenThreshold.visible,false,'A hidden door must not leave its threshold behind');
for(const o of [retainedWall,retainedTrim,entryThreshold,freeFurniture])assert.equal(o.visible,true,'Unrelated geometry must stay visible');
assert.equal(result.wall_finishes_hidden,1);
assert.equal(result.opening_thresholds_hidden,1);
assert.throws(()=>context.applyApartmentArchitectureVariant({render_only:false}),/render-only/);

const merged=groups.archUp.children.find(o=>o.userData.mergedCeilingStudy);
assert.ok(merged);
assert.equal(merged.position.y,2.5,'Keep the verified clear height');
const raycaster=new THREE.Raycaster();
function covered([x,z]){groups.archUp.updateMatrixWorld(true);raycaster.set(new THREE.Vector3((x-model.width_mm/2)/1000,1.7,(z-model.depth_mm/2)/1000),new THREE.Vector3(0,1,0));return raycaster.intersectObject(merged).length>0;}
const recp=model.rooms.find(r=>r.id==='RECP-01').poly;
const kit=model.rooms.find(r=>r.id==='KIT-01').poly;
for(const z of [7050,7700,8850])assert.ok(covered([(recp[6][0]+kit[3][0])/2,z]),'The former traced separator seam must have a ceiling');
assert.ok(covered([11000,6500]),'Interior kitchen/reception ceiling remains present');
assert.equal(covered([14000,1500]),false,'Do not roof over the main terrace');
assert.equal(covered([11000,9500]),false,'Do not enlarge the merged ceiling into service/WC rooms');
assert.equal(JSON.stringify({model,snapshot}),original,'Overlay must not mutate model or saved layout');
const canonical=fs.readFileSync('dist/sources/Apartment_Master_Spec_Type_B_v0.2.2_Geometry_Heights_Glazing(1).json');
assert.equal(crypto.createHash('sha256').update(canonical).digest('hex'),snapshot.canonical_sha256);

// Cabinet fronts use local +depth. Check the actual snapshot, including the
// island across the former room boundary, without editing the canonical model.
const domainContext=vm.createContext({MODEL:model,INTERIOR_MATERIALS:JSON.parse(fs.readFileSync('interior-materials.json','utf8')),structuredClone});
for(const file of ['studio-core.js','interior-core.js'])vm.runInContext(fs.readFileSync(file,'utf8'),domainContext);
const solids=domainContext.interiorSolids(snapshot.layout,model);
const tallIds=['E2-oven-column','E2-fridge','E2-pantry-tall'];
const tall=solids.filter(o=>tallIds.includes(o.id));
assert.equal(tall.length,3);
const k11=/^K(?:11|12) —/.test(snapshot.name);
for(const o of tall){
  assert.equal(o.rot,180,o.id+' must face the north work aisle');
  const expectedX=(k11?{'E2-pantry-tall':12250,'E2-oven-column':11650,'E2-fridge':11050}:{'E2-pantry-tall':11050,'E2-oven-column':11650,'E2-fridge':12250})[o.id];
  assert.deepEqual([o.cx,o.cy,o.w,o.d],[expectedX,8570,600,600],'Preserve the existing cabinet footprint');
  assert.ok(domainContext.interiorOperatingDistance({...o,rot:0},solids,model)<1,'The previous orientation faces the wall');
}
const overlayModel=structuredClone(model);
overlayModel.rooms.find(r=>r.id==='KIT-01').poly=snapshot.architecture_variant.merged_ceilings[0].poly;
const segmentKey=s=>[s.from,s.to].map(p=>p.join(',')).sort().join('|');
overlayModel.wall_segments=overlayModel.wall_segments.filter(s=>!snapshot.architecture_variant.remove_wall_segments.some(r=>segmentKey(r)===segmentKey(s)));
const mergedSolids=solids.map(o=>({...o,room_id:o.room_id==='RECP-01'?'KIT-01':o.room_id}));
const operating=tall.map(o=>({id:o.id,mm:domainContext.interiorOperatingDistance(o,mergedSolids,overlayModel)}));
for(const r of operating)assert.ok(r.mm>=900,r.id+' must have an unobstructed conceptual front approach');
for(const id of ['E2-oven-column','E2-pantry-tall'])assert.ok(Math.abs(operating.find(r=>r.id===id).mm-1220)<.001,'Include the cross-room island in the approach calculation');

const washer=solids.find(o=>o.id==='H1-terrace-washer');
assert.ok(washer);
assert.deepEqual([washer.cx,washer.cy,washer.w,washer.d,washer.rot],[9170,9600,600,650,270],'Preserve the laundry footprint and face its door toward the east use area');
const washerOperating=domainContext.interiorOperatingDistance(washer,solids,model);
assert.ok(Math.abs(washerOperating-1154.705)<.001,'Check the washer against the actual terrace parapets');
assert.equal(domainContext.interiorOperatingDistance({...washer,rot:90},solids,model),0,'The old washer front faces the west parapet');

// A flush adjacent cabinet is a tangent; a cabinet in front remains an obstacle.
const cabinet={id:'test-unit',room_id:'TEST',cx:0,cy:0,w:600,d:600,rot:0,bottom_mm:0,top_mm:2200,type:'ovencol'};
const testModel={wall_segments:[],rooms:[{id:'TEST',poly:[[-5000,-5000],[5000,-5000],[5000,5000],[-5000,5000]]}]};
const adjacent={...cabinet,id:'side-unit',cx:600};
assert.equal(domainContext.interiorOperatingDistance(cabinet,[cabinet,adjacent],testModel),4700,'Do not treat a shared side edge as a blocked front');
const blocker={...cabinet,id:'front-unit',cy:1200};
assert.equal(domainContext.interiorOperatingDistance(cabinet,[cabinet,adjacent,blocker],testModel),600,'Keep a real front obstruction');
assert.equal(JSON.stringify({model,snapshot}),original,'Diagnostics must not alter the architectural source or candidate');
console.log(JSON.stringify({result:'PASS',checks:'wall-linked trims, opening thresholds, retained geometry, seam coverage, external exclusions, 2.50 m height, tall-unit and washer orientation, genuine operating obstructions and immutable canonical source',overlay:result,render_only_operating_diagnostic:operating,washer_front_clearance_mm:washerOperating}));
