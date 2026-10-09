import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const node=(material)=>({material,userData:{},position:{set(){}},rotation:{y:0},children:[],add(...items){this.children.push(...items);},traverse(fn){fn(this);for(const child of this.children)child.traverse(fn);}});
class Group {constructor(){Object.assign(this,node());}}
class Mesh {constructor(geometry,material){Object.assign(this,node(material));}}
const pbr=(id,colour)=>({id,colour}),mat=colour=>({colour});
const c=vm.createContext({THREE:{Group,Mesh,PlaneGeometry:class {}},M:v=>v/1000,wx:v=>v/1000,wz:v=>v/1000,mat,fabric:mat,woodM:mat,box:(w,h,d,m)=>node(m),rbox:(w,h,d,m)=>node(m),batchSceneMeshes(){},currentDecor:()=>({id:'warm',wood:'#60432e',metal:'#999999'}),STUDIO_VARIANTS:{fridge:['integrated','steel'],dishwasher:['integrated','steel']},interiorPbr:pbr,state:{},interiorMaterial:(_state,id)=>id?{base_colour:'#E8E2D7',category:'paint'}:null,interiorResolved:o=>({cx:0,cy:0,rot:0,bottom_mm:0}),MODEL:{},opt:{cut:2.5},H:2.5});
vm.runInContext(fs.readFileSync('studio-scene.js','utf8')+'\n'+fs.readFileSync('interior-scene.js','utf8').replace('function interiorPbr(', 'function unusedInteriorPbr('),c);
for(const type of ['fridge','dishwasher']){
  c.item={id:type,type,variant:'integrated',w:600,d:650,cx:0,cy:0,rot:0,color:'#E8E2D7',material_id:'kitchen-soft-ivory'};
  let mesh=vm.runInContext('makeStudioVariant(item)',c);
  assert.equal(mesh.children[0].material.id,'kitchen-soft-ivory');
  delete c.item.material_id;mesh=vm.runInContext('makeStudioVariant(item)',c);
  assert.equal(mesh.children[0].material.colour,'#E8E2D7');
  c.item.variant='steel';mesh=vm.runInContext('makeStudioVariant(item)',c);
  assert.notEqual(mesh.children[0].material.colour,'#E8E2D7');
}
const object={id:'saved-reference',type:'sideboard',variant:'plain',room_id:'RECP-01',placement:{mode:'floor'},width_mm:1000,depth_mm:400,height_mm:800,material_references:{body:'saved-oak'},colour:'#aabbcc'};
c.item=object;assert.equal(vm.runInContext('interiorMesh(item)',c).children[0].material.id,'saved-oak');
c.item={...object,type:'artwork',material_references:{art:'saved-art',frame:'saved-frame'}};
let mesh=vm.runInContext('interiorMesh(item)',c);
assert.equal(mesh.children[0].material.id,'saved-frame');assert.equal(mesh.children[1].material.id,'saved-art');
c.item={...c.item,material_references:{primary:'legacy-art',artwork:'preferred-art',accent:'preferred-frame',art:'saved-art',frame:'saved-frame'}};
mesh=vm.runInContext('interiorMesh(item)',c);assert.equal(mesh.children[0].material.id,'preferred-frame');assert.equal(mesh.children[1].material.id,'preferred-art');

const g=vm.createContext({INTERIOR_MATERIALS:[]});
vm.runInContext(fs.readFileSync('studio-core.js','utf8')+'\n'+fs.readFileSync('interior-core.js','utf8'),g);
const appliance={id:'appliance',room_id:'R',cx:0,cy:0,w:600,d:600,rot:0,bottom_mm:0,top_mm:900};
const model={wall_segments:[],rooms:[{id:'R',poly:[[-2000,-2000],[2000,-2000],[2000,2300],[-2000,2300]]}]};
const measure=(solids)=>{g.appliance=appliance;g.solids=[appliance,...solids];g.model=model;return vm.runInContext('interiorOperatingDistance(appliance,solids,model)',g);};
const beside=[-1,1].map(sign=>({...appliance,id:'beside'+sign,cx:sign*600}));
assert.equal(measure(beside),2000);
assert.equal(measure([...beside,{...appliance,id:'ahead',cy:1000}]),400);
assert.equal(measure([...beside,{...appliance,id:'partial',cx:599,cy:600}]),0);
assert.equal(measure([...beside,{...appliance,id:'narrow',cx:0,cy:600,w:5}]),0);
console.log('PASS: saved integrated finishes, overlay reference aliases and appliance front-strip contacts.');
