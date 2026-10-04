// DOM and Three.js geometry smoke checks; this does not render a WebGL frame.
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import os from 'node:os';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import * as THREE from './dist/vendor/three/build/three.module.js';

const require=createRequire(import.meta.url);
const {JSDOM}=require('jsdom');
const {createCanvas}=require(path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'@napi-rs/canvas'));
const html=fs.readFileSync(new URL('./dist/index.html',import.meta.url),'utf8');
const scripts=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
const classic=scripts.find(m=>!m[1].trim())[2];
const moduleScript=scripts.find(m=>m[1].includes('type="module"'))[2];
new vm.Script(classic);
// Check the entire actual module syntax, keeping its import declarations.
fs.writeFileSync(path.join(os.tmpdir(),'viewer-module-check.mjs'),moduleScript);
const dom=new JSDOM(html,{url:'https://example.test/#2d',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,context=dom.getInternalVMContext(),registered=new Map();
w.structuredClone=globalThis.structuredClone;
w.matchMedia=q=>({matches:false,media:q,addEventListener(){},removeEventListener(){}});
w.ResizeObserver=class{constructor(cb){this.cb=cb;}observe(){this.cb();}disconnect(){}};
w.confirm=()=>true;
w.URL.createObjectURL=()=>'';w.URL.revokeObjectURL=()=>{};
w.HTMLElement.prototype.setPointerCapture=function(){};
w.HTMLElement.prototype.releasePointerCapture=function(){};
w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
w.HTMLDialogElement.prototype.show=function(){this.open=true;};
w.HTMLDialogElement.prototype.close=function(){this.open=false;};
w.HTMLCanvasElement.prototype.getContext=function(type){
  if(type!=='2d')throw new Error('WebGL is intentionally not emulated.');
  this.__canvas??=createCanvas(this.width||300,this.height||150);
  const ctx=this.__canvas.getContext('2d');if(!ctx.__htmlCanvasAdapted){const original=ctx.drawImage.bind(ctx);ctx.drawImage=(source,...args)=>original(source.__canvas||source,...args);ctx.__htmlCanvasAdapted=true;}return ctx;
};
w.Blob=globalThis.Blob;
w.HTMLCanvasElement.prototype.toBlob=function(callback,type){callback(new Blob([this.__canvas.toBuffer(type||'image/png')],{type:type||'image/png'}));};
for(const id of ['stage','plan','view3d']){
 const el=w.document.getElementById(id);
 Object.defineProperty(el,'clientWidth',{get:()=>900});
 Object.defineProperty(el,'clientHeight',{get:()=>700});
 el.getBoundingClientRect=()=>({x:0,y:0,left:0,top:0,right:900,bottom:700,width:900,height:700});
}
w.document.modelContext={registerTool(t){registered.set(t.name,t);}};
vm.runInContext(fs.readFileSync(new URL('./dist/apartment-model.js',import.meta.url),'utf8'),context);
vm.runInContext(classic,context);
const evaluate=s=>vm.runInContext(s,context);
assert.equal(w.document.documentElement.lang,'en');
assert.equal(w.document.title,'Apartment Type B · 3D Studio');
assert.equal(w.document.querySelectorAll('#gRooms .room').length,13);
assert.equal(evaluate('DOORS.length + WINS.length + SLIDES.length + PASSAGES.length'),16);
assert.equal(evaluate("ROOMS.filter(r=>r.kind==='reception').length"),1);
assert.equal(evaluate('state.furniture.length'),44);
assert.ok(!/[\u3400-\u9fff]/.test(w.document.querySelector('#lib').textContent),'Furniture library must be entirely English.');
assert.ok(!w.document.querySelector('#panel').textContent.includes('¥'));
const before=evaluate('JSON.stringify(WALL_SEGMENTS)');
w.document.getElementById('shellPreset').click();
assert.equal(evaluate('state.furniture.length'),0);
w.document.getElementById('undo').click();
assert.equal(evaluate('state.furniture.length'),44);
w.document.getElementById('starterPreset').click();
assert.equal(evaluate('state.furniture.length'),44);
evaluate("toggleWall('w0');setTool('demolish');");
assert.equal(evaluate('ui.tool'),'select');
assert.equal(evaluate('state.demolished.length'),0);
assert.equal(evaluate('JSON.stringify(WALL_SEGMENTS)'),before);
evaluate("select({kind:'room',id:'RECP-01'})");
assert.ok(w.document.querySelector('#panel').textContent.includes('single open space'));
evaluate("select({kind:'room',id:'BR-01'})");
w.document.querySelector('[data-mat="walnut"]').click();
assert.equal(evaluate("state.rooms['BR-01'].mat"),'walnut');
evaluate('undo()');
assert.equal(evaluate("state.rooms['BR-01'].mat"),'wood');
assert.equal(evaluate("fixState({...defaultState(),demolished:['w0']}).demolished.length"),0);
assert.throws(()=>evaluate('fixState({furniture:[{type:"bed",w:-1,d:400,cx:0,cy:0,rot:0}]})'));
w.document.getElementById('originalPlan').click();assert.equal(w.document.getElementById('sourceDialog').open,true);
w.document.getElementById('closeSource').click();assert.equal(w.document.getElementById('sourceDialog').open,false);
await new Promise(r=>setTimeout(r,0));
assert.ok(registered.has('inspect_apartment')&&registered.has('set_apartment_view'));
assert.equal(registered.get('inspect_apartment').execute({}).opening_count,16);
await assert.rejects(()=>registered.get('set_apartment_view').execute({view:'bad'}));

// Exercise the actual dropdown and edit controls; all styles share one layout.
const changeStyle=id=>{
 const el=w.document.getElementById('decorTheme');el.value=id;el.dispatchEvent(new w.Event('change',{bubbles:true}));
 assert.equal(evaluate('state.decor.active'),id);
};
const placement=()=>evaluate('JSON.stringify(state.furniture.map(({id,type,cx,cy,w,d,rot})=>({id,type,cx,cy,w,d,rot})))');
let originalPlacement=placement();const originalFinishes=evaluate('JSON.stringify(captureDecor())');
assert.equal(w.document.getElementById('decorTheme').options.length,4);
assert.equal(evaluate('state.decor.active'),'custom');
changeStyle('warm');
assert.equal(evaluate("state.rooms['RECP-01'].mat"),'parquet');
assert.equal(placement(),originalPlacement);
evaluate("select({kind:'furn',id:state.furniture.find(f=>f.type==='sofa').id})");
const xInput=w.document.getElementById('fX');xInput.value=String(Number(xInput.value)+120);xInput.dispatchEvent(new w.Event('change',{bubbles:true}));
assert.notEqual(placement(),originalPlacement);originalPlacement=placement();
const colourInput=w.document.getElementById('fC');colourInput.value='#789abc';colourInput.dispatchEvent(new w.Event('change',{bubbles:true}));
const warmEditedColour=evaluate("state.furniture.find(f=>f.type==='sofa').color");
assert.equal(warmEditedColour,'#789abc');
evaluate("select({kind:'room',id:'BR-01'})");w.document.querySelector('[data-mat="walnut"]').click();
changeStyle('japandi');
assert.equal(evaluate("state.rooms['RECP-01'].mat"),'lightoak');
assert.ok(w.document.querySelector('#m-lightoak'));
assert.ok(w.document.querySelector('#gRooms [data-room="RECP-01"]').getAttribute('fill').includes('lightoak'));
changeStyle('boho');assert.equal(evaluate("state.rooms['RECP-01'].mat"),'travertine');
assert.equal(placement(),originalPlacement);
changeStyle('warm');
assert.equal(evaluate("state.furniture.find(f=>f.type==='sofa').color"),warmEditedColour);
assert.equal(evaluate("state.rooms['BR-01'].mat"),'walnut');
changeStyle('custom');assert.equal(evaluate('JSON.stringify(captureDecor())'),originalFinishes);
changeStyle('japandi');evaluate('undo()');assert.equal(evaluate('state.decor.active'),'custom');
evaluate('redo()');assert.equal(evaluate('state.decor.active'),'japandi');
// Reload goes through the same validator as imports, keeping finish-cache IDs.
evaluate('state=fixState(JSON.parse(localStorage.getItem(STORE)));renderAll();');
assert.equal(evaluate('state.decor.active'),'japandi');assert.equal(placement(),originalPlacement);
changeStyle('warm');assert.equal(evaluate("state.furniture.find(f=>f.type==='sofa').color"),warmEditedColour);
changeStyle('custom');assert.equal(evaluate('JSON.stringify(captureDecor())'),originalFinishes);
assert.equal(evaluate('JSON.stringify(WALL_SEGMENTS)'),before);
assert.equal(evaluate('fixState({...defaultState(),decor:{active:"unknown"}}).decor.active'),'custom');
assert.equal(evaluate('fixState({...defaultState(),decor:undefined}).decor.active'),'custom');

// Use the actual geometry classes and material creation, replacing only WebGL
// output and browser-only controls. Scene generation is not mocked.
class FakeRenderer{
 constructor(){this.domElement=w.document.createElement('canvas');this.shadowMap={};this.capabilities={getMaxAnisotropy:()=>1};}
 setPixelRatio(){}setSize(width,height){this.domElement.width=width;this.domElement.height=height;this.domElement.__canvas=createCanvas(width,height);}render(){const ctx=this.domElement.getContext('2d');ctx.fillStyle='#dde5ef';ctx.fillRect(0,0,this.domElement.width,this.domElement.height);}dispose(){}
 compile(){}async compileAsync(){}getContext(){return {isContextLost:()=>false};}
}
class Orbit{
 constructor(camera,el){this.object=camera;this.target=new THREE.Vector3();this.enabled=true;}
 update(){}
}
class PointerLock{
 constructor(camera){this.camera=camera;this.isLocked=false;}
 addEventListener(){}unlock(){this.isLocked=false;}lock(){this.isLocked=true;}
}
class Labels{
 constructor(){this.domElement=w.document.createElement('div');}
 setSize(){}render(){}
}
class LabelObject extends THREE.Object3D{constructor(el){super();this.element=el;}}
class Environment extends THREE.Scene{}
const fakeThree={...THREE,WebGLRenderer:FakeRenderer,TextureLoader:class{setCrossOrigin(){return this;}load(url,onLoad,progress,onError){const t=new THREE.Texture();t.userData.assetPath=url;if(onLoad)queueMicrotask(()=>url.includes('unavailable')?onError?.():onLoad(t));return t;}},PMREMGenerator:class{fromScene(){return{texture:new THREE.Texture()};}dispose(){}}};
context.THREE=fakeThree;context.OrbitControls=Orbit;context.PointerLockControls=PointerLock;
context.CSS2DRenderer=Labels;context.CSS2DObject=LabelObject;context.RoomEnvironment=Environment;
const {RoundedBoxGeometry}=await import('./dist/vendor/three/examples/jsm/geometries/RoundedBoxGeometry.js');
context.RoundedBoxGeometry=RoundedBoxGeometry;
let mod=moduleScript.replace(/^import .*?;\s*$/gm,'').replace("if(location.hash!=='#2d')void setView('3d');",'');
mod+='\n'+fs.readFileSync('capture-renderer.js','utf8').replace('void bootApartmentAgentCapture();','')+'\nwindow.__sceneQA={clearCaptureAssetFailures:()=>apartmentSceneAssetsFailed.clear(),bootApartmentAgentCapture,init,buildArch,buildFurn,buildSceneDecor,applyLight,showInterior,interiorPose,blocked,setMode,fitWhole,opt,get camera(){return camera;},get scene(){return scene;},get lamps(){return lampG;},get decor(){return sceneDecorG;},get floors(){return archFloor;},get walls(){return archUp;},get doors(){return doors;},get furniture(){return furnG;},interiorMesh,interiorPbr,buildInteriorObjects,set active(v){active=v;}};';
vm.runInContext('(function(){'+mod+'\n})()',context);
const qa=w.__sceneQA;qa.init();qa.buildArch();qa.buildFurn();
assert.equal(qa.floors.children.filter(o=>o.userData.room).length,13);
assert.equal(qa.walls.children.filter(o=>o.userData.ceilingFor).length,10);
assert.equal(qa.walls.children.filter(o=>o.userData.wallSegment).length,64);
assert.equal(qa.doors.length,11);
assert.equal(qa.furniture.children.length,44);
for(const o of qa.walls.children.filter(o=>o.userData.wallSegment))assert.ok(o.geometry.parameters.height<=1.05+1e-8);
qa.active=true;
const cameraBefore=qa.camera.position.toArray(),rotationBefore=qa.camera.quaternion.toArray();
qa.opt.hour=14;qa.opt.night=true;
const changedDoor=qa.doors[0];changedDoor.open=false;changedDoor.cur=changedDoor.a0;
const doorBefore={id:changedDoor.id,open:changedDoor.open,cur:changedDoor.cur};
const wallColours=new Set(),floorMaps=new Set();
for(const id of ['warm','japandi','boho']){
 changeStyle(id);
 const wall=qa.walls.children.find(o=>o.userData.wallSegment);
 const expected=evaluate("decorSurface('wall','#f4f7fa')");
 assert.equal('#'+wall.material[0].color.getHexString(),expected);
 wallColours.add(expected);
 const floor=qa.floors.children.find(o=>o.userData.room==='RECP-01');floorMaps.add(floor.material.map.uuid);
 assert.equal(qa.furniture.children.length,44);
 const sofa=evaluate("state.furniture.find(f=>f.type==='sofa')");
 const colours=new Set();qa.furniture.traverse(o=>{if(o.material?.color)colours.add('#'+o.material.color.getHexString());});
 assert.ok(colours.has(sofa.color),'Furniture colour must reach the actual Three.js materials.');
 assert.equal(placement(),originalPlacement);
 assert.deepEqual(qa.camera.position.toArray(),cameraBefore);
 assert.deepEqual(qa.camera.quaternion.toArray(),rotationBefore);
 assert.equal(qa.opt.hour,14);assert.equal(qa.opt.night,true);
 const door=qa.doors.find(d=>d.id===doorBefore.id);assert.equal(door.open,doorBefore.open);assert.equal(door.cur,doorBefore.cur);
 assert.equal(qa.walls.children.filter(o=>o.userData.wallSegment).length,64);
}
assert.equal(wallColours.size,3);assert.equal(floorMaps.size,3);
// Full scenes must change furniture geometry and fit the existing apartment.
const sofaForms=new Set(),bedForms=new Set(),fixtureForms=new Set();
for(const id of ['warm','japandi','boho']){
 changeStyle(id);qa.showInterior('living',false);
 const sofa=evaluate("state.furniture.find(f=>f.type==='sofa')"),bed=evaluate("state.furniture.find(f=>f.type==='bed')");
 const sofaModel=qa.furniture.children.find(g=>g.userData.fid===sofa.id),bedModel=qa.furniture.children.find(g=>g.userData.fid===bed.id);
 assert.equal(sofaModel.userData.sceneStyle,id);assert.equal(bedModel.userData.sceneStyle,id);
 sofaForms.add(sofaModel.userData.modelForm);bedForms.add(bedModel.userData.modelForm);
 for(const g of qa.furniture.children.filter(g=>g.userData.sceneStyle)){
  assert.ok(g.userData.renderBatch.after<=g.userData.renderBatch.before);
  g.traverse(o=>assert.equal(o.userData.fid,g.userData.fid,'Batched furniture must retain its editable identity.'));
 }
 const art=qa.decor.children.filter(o=>o.userData.sceneFeature==='artwork');
 assert.equal(art.length,5);
 for(const a of art){
  const rid=a.userData.roomId,mount=a.userData.mount;
  assert.equal(evaluate(`pointInRoom(${JSON.stringify(mount)},ROOMS.find(r=>r.id==='${rid}').poly)`),true);
  const canvas=a.children.find(o=>o.material?.map?.userData.assetPath);
  assert.ok(canvas);assert.ok(fs.existsSync(new URL('./dist/'+canvas.material.map.userData.assetPath.replace('./',''),import.meta.url)));
 }
 assert.equal(qa.decor.children.filter(o=>o.userData.sceneFeature==='curtains').length,5);
 assert.equal(qa.decor.children.filter(o=>o.userData.sceneFeature==='pendant').length,5);
 for(const o of qa.decor.children.filter(o=>o.userData.sceneFeature==='pendant'))fixtureForms.add(o.userData.fixtureType);
 qa.scene.updateMatrixWorld(true);
 for(const o of qa.decor.children.filter(o=>o.userData.sceneFeature)){
  const bounds=new THREE.Box3().setFromObject(o);assert.ok(bounds.max.y<=2.5001,'Decor must not raise the canonical ceiling.');
 }
 for(const view of ['living','dining','master','bedroom1','bedroom2']){
  qa.showInterior(view,false);
  assert.equal(qa.blocked(qa.camera.position.x,qa.camera.position.z),false,`${id}/${view}: interior camera must not start in furniture, a door or a wall.`);
  assert.equal(qa.camera.position.y,1.62);
 }
 assert.equal(evaluate('JSON.stringify(WALL_SEGMENTS)'),before);
}
assert.equal(sofaForms.size,3);assert.equal(bedForms.size,3);assert.equal(fixtureForms.size,3);
// The same live lighting function used by the Night control must update fixtures.
qa.opt.night=false;qa.applyLight();
const styleLights=qa.decor.children.filter(o=>o.userData.sceneLight),dayPower=styleLights.map(o=>o.intensity);
const emitters=new Set();qa.decor.traverse(o=>{if(o.material?.userData.sceneEmitter)emitters.add(o.material);});
assert.equal(styleLights.length,5);assert.ok(emitters.size>0);
for(const g of qa.decor.children.filter(o=>o.userData.sceneFeature==='pendant'))assert.ok(g.children.some(o=>o.material?.userData.sceneEmitter));
for(const m of emitters)assert.equal(m.emissiveIntensity,.18);
qa.opt.night=true;qa.applyLight();
styleLights.forEach((o,i)=>assert.ok(Math.abs(o.intensity-dayPower[i]*5)<1e-8));
for(const m of emitters)assert.equal(m.emissiveIntensity,.75);
// Independent room options, real shapes, persistence and an agent round trip.
evaluate("state=defaultState();renderAll();");changeStyle('warm');
w.document.getElementById('studioOptions').click();
assert.equal(w.document.getElementById('studioDialog').open,true);
const setRoomControl=(id,value)=>{const el=w.document.getElementById(id);el.value=value;el.dispatchEvent(new w.Event('change',{bubbles:true}));};
setRoomControl('studioHvac','wall-split');setRoomControl('studioCeiling','perimeter-led');setRoomControl('studioLighting','track-lamps');setRoomControl('studioTemperature','2700');setRoomControl('studioBrightness','60');setRoomControl('studioFlooring','walnut');
assert.equal(evaluate("state.rooms['RECP-01'].mat"),'walnut');
assert.equal(evaluate("studioRoomOptions(state,'MBR-01').lighting"),'style');
const shapeFid=evaluate("state.furniture.find(f=>f.type==='sofa').id");
const originalItem=evaluate(`JSON.stringify(state.furniture.find(f=>f.id==='${shapeFid}'))`);
evaluate(`studioSetVariant('${shapeFid}','modular');`);
assert.equal(evaluate(`state.furniture.find(f=>f.id==='${shapeFid}').cx`),JSON.parse(originalItem).cx);
qa.buildArch();qa.buildFurn();qa.buildSceneDecor();qa.showInterior('living',false);qa.scene.updateMatrixWorld(true);
assert.equal(qa.furniture.children.find(g=>g.userData.fid===shapeFid).userData.modelForm,'independent-modular');
assert.ok(qa.decor.children.some(g=>g.userData.sceneFeature==='wall-ac'&&g.userData.roomId==='RECP-01'));
assert.ok(qa.decor.children.some(g=>g.userData.sceneFeature==='track'&&g.userData.roomId==='RECP-01'));
assert.ok(qa.decor.children.some(g=>g.userData.sceneFeature==='floor-lamp'&&g.userData.roomId==='RECP-01'));
assert.ok(!qa.decor.children.some(g=>g.userData.sceneFeature==='pendant'&&g.userData.roomId==='RECP-01'));
for(const g of qa.decor.children.filter(g=>g.userData.sceneFeature)){assert.ok(new THREE.Box3().setFromObject(g).max.y<=2.5001);}
for(const g of qa.walls.children.filter(g=>g.userData.ceilingFor))assert.equal(g.position.y,2.5);
assert.equal(qa.blocked(qa.camera.position.x,qa.camera.position.z),false);
qa.opt.night=true;qa.applyLight();
const roomLights=qa.decor.children.filter(o=>o.userData.sceneLight&&o.userData.roomId==='RECP-01');
roomLights.forEach(o=>assert.ok(Math.abs(o.intensity-o.userData.basePower*.8)<1e-8));
assert.ok(qa.lamps.children.filter(o=>o.userData.roomId==='RECP-01').every(o=>o.intensity===0));
const savedOptions=evaluate('JSON.stringify(state.studio)');evaluate('state=fixState(JSON.parse(localStorage.getItem(STORE)));renderAll();');
assert.equal(evaluate('JSON.stringify(state.studio)'),savedOptions);assert.equal(evaluate(`state.furniture.find(f=>f.id==='${shapeFid}').variant`),'modular');
const brief=w.ApartmentStudio.exportBrief();
const proposal={...brief.proposal_template,operations:[{type:'room-option',room_id:'MBR-01',key:'lighting',value:'lamps'},{type:'room-option',room_id:'MBR-01',key:'flooring',value:'lightoak'}]};
assert.equal(w.ApartmentStudio.validateProposal(proposal).valid,true);
assert.throws(()=>w.ApartmentStudio.validateProposal({...proposal,canonical_sha256:'different'}));
assert.throws(()=>w.ApartmentStudio.validateProposal({...proposal,operations:[{type:'room-option',room_id:'MBR-01',key:'ceiling_height_m',value:2.7}]}));
assert.throws(()=>w.ApartmentStudio.validateProposal({...proposal,operations:[{type:'furniture-placement',furniture_id:shapeFid,cx:0,cy:0}]}));
const beforeProposal=evaluate('snap()');w.ApartmentStudio.applyProposal(proposal);
assert.equal(evaluate("studioRoomOptions(state,'MBR-01').lighting"),'lamps');assert.equal(evaluate("state.rooms['MBR-01'].mat"),'lightoak');
assert.throws(()=>w.ApartmentStudio.applyProposal(proposal));evaluate('undo()');assert.equal(evaluate('snap()'),beforeProposal);evaluate('redo()');
evaluate("studioSetRoom('RECP-01','hvac','concealed-slots');studioSetRoom('RECP-01','lighting','none');studioSetRoom('RECP-01','ceiling','plain');");
qa.buildArch();qa.buildSceneDecor();qa.applyLight();
assert.ok(qa.decor.children.some(g=>g.userData.sceneFeature==='concealed-grille'&&g.userData.roomId==='RECP-01'));
assert.ok(!qa.decor.children.some(g=>g.userData.sceneLight&&g.userData.roomId==='RECP-01'));
for(const g of qa.walls.children.filter(g=>g.userData.ceilingFor))assert.equal(g.position.y,2.5);
evaluate("studioSetRoom('RECP-01','lighting','downlights');");qa.buildSceneDecor();
assert.ok(qa.decor.children.some(g=>g.userData.sceneFeature==='downlight'&&g.userData.roomId==='RECP-01'));
const rb=w.ApartmentStudio.renderBrief('RECP-01');assert.equal(rb.clear_ceiling_m,2.5);assert.equal(rb.options.flooring,'walnut');assert.ok(rb.prompt.includes('130 mm'));
fs.writeFileSync(path.join(os.tmpdir(),'apartment-type-b-qa-brief.json'),JSON.stringify(w.ApartmentStudio.exportBrief()));
assert.equal(evaluate('JSON.stringify(WALL_SEGMENTS)'),before);
// Execute the actual isolated capture boot with the explicitly stubbed renderer.
// It must freeze the exact saved furnishing JSON, camera and door metadata.
const originalViewerFov=qa.camera.fov;
evaluate('state=defaultState();');
const bootLayout=JSON.parse(evaluate('JSON.stringify(state)')),bootRevision=evaluate('studioSceneKey(state)');
const bootCamera={position:[6.5,1.68,4.4],target:[4.7,1.4,1.0],fov:52,projection_type:'perspective',coordinate_system:'Three.js metres: x=plan x minus half width; y=height; z=plan y minus half depth',aspect:16/9,near:.05,far:300,viewport:{width:1280,height:720},viewer:{cut_height_m:2.5,furnishings_visible:true,night:false,hour:10,mode:'orbit',doors:evaluate('MODEL.doors.map(d=>({id:d.id,open:true,position:Math.atan2(-d.o[1],d.o[0])})).concat(MODEL.slides.map(d=>({id:d.id,open:true,position:1})))')}};
w.APARTMENT_CAPTURE_INPUT={layout:bootLayout,scene_revision:bootRevision,storage_revision:1,canonical_sha256:evaluate('MODEL.canonical_sha256'),snapshot_sha256:'test-frame-sha',room_id:'RECP-01',camera:bootCamera,frame_id:'test-capture-ready',asset_urls:{}};
// A previous manual fallback belongs to that page, not this isolated snapshot.
qa.clearCaptureAssetFailures();
await qa.bootApartmentAgentCapture();
assert.ok(w.__apartmentCaptureFrame,w.__apartmentCaptureError);
assert.equal(w.__apartmentCaptureFrame.rendered_layout_json,JSON.stringify(bootLayout));
assert.deepEqual(JSON.parse(JSON.stringify(w.__apartmentCaptureFrame.camera)),JSON.parse(JSON.stringify(bootCamera)));
assert.equal(w.document.querySelector('canvas[data-capture-ready="test-capture-ready"]').width,1280);
assert.equal(w.__apartmentCaptureFrame.assets.pending,0);assert.equal(w.__apartmentCaptureFrame.assets.fallbacks.length,0);delete w.APARTMENT_CAPTURE_INPUT;
qa.camera.fov=originalViewerFov;qa.camera.updateProjectionMatrix();
assert.equal(evaluate('JSON.stringify(WALL_SEGMENTS)'),before);
w.document.getElementById('studioClose').click();
evaluate('state=defaultState();renderAll();');
// Optional deterministic mesh export for standalone graphics QA; no browser is used.
if(process.env.EXPORT_SCENE_QA==='1'||process.env.EXPORT_CONFIGURATOR_QA==='1'){
 const base='/workspace/scratch/c3b983db68af/scene-qa';fs.mkdirSync(base+'/textures',{recursive:true});
 evaluate('state=defaultState();renderAll();');
 for(const id of process.env.EXPORT_CONFIGURATOR_QA==='1'?['configured']:['warm','japandi','boho']){
  changeStyle(id==='configured'?'warm':id);
  if(id==='configured')evaluate("studioSetRoom('RECP-01','hvac','wall-split');studioSetRoom('RECP-01','ceiling','gypsum-shadow-gap');studioSetRoom('RECP-01','lighting','track-lamps');studioSetVariant(state.furniture.find(f=>f.type==='sofa').id,'modular');");
  qa.opt.night=false;qa.applyLight();qa.showInterior('living',false);qa.scene.updateMatrixWorld(true);qa.camera.updateMatrixWorld(true);
  const meshes=[],textures={};
  qa.scene.traverseVisible(o=>{
   if(!o.isMesh||!o.geometry.attributes.position)return;
   const geo=o.geometry,mats=Array.isArray(o.material)?o.material:[o.material],groups=Array.isArray(o.material)&&geo.groups.length?geo.groups:[{start:0,count:geo.index?.count||geo.attributes.position.count,materialIndex:0}];
   for(const gr of groups){
    const m=mats[gr.materialIndex]||mats[0];if(!m?.color)continue;
    const map=m.map;
    if(map&&!textures[map.uuid]){
     let texPath=null;
     if(map.userData.assetPath)texPath=path.resolve('dist',map.userData.assetPath);
     else if(map.image?.__canvas){texPath=base+'/textures/'+map.uuid+'.png';fs.writeFileSync(texPath,map.image.__canvas.toBuffer('image/png'));}
     textures[map.uuid]={path:texPath,repeat:map.repeat.toArray(),wrap:map.wrapS===THREE.RepeatWrapping};
    }
    const indices=geo.index?Array.from(geo.index.array.slice(gr.start,gr.start+gr.count)):Array.from({length:gr.count},(_,i)=>gr.start+i);
    meshes.push({positions:Array.from(geo.attributes.position.array),normals:Array.from(geo.attributes.normal?.array||[]),uv:Array.from(geo.attributes.uv?.array||[]),indices,matrix:o.matrixWorld.toArray(),color:m.color.toArray(),roughness:m.roughness??.7,metalness:m.metalness??0,opacity:m.opacity,map:map?.uuid||null,emissive:m.emissive?.toArray()||[0,0,0],emissiveIntensity:m.emissiveIntensity||0,doubleSide:m.side===THREE.DoubleSide});
   }
  });
  const cameras={};
  for(const view of ['living','dining','master','bedroom1','bedroom2']){
   qa.showInterior(view,false);qa.camera.updateMatrixWorld(true);
   cameras[view]={position:qa.camera.position.toArray(),matrix:qa.camera.matrixWorld.toArray(),projection:qa.camera.projectionMatrix.toArray()};
  }
  fs.writeFileSync(base+'/'+id+'.json',JSON.stringify({meshes,textures,camera:cameras.living,cameras,lights:qa.decor.children.filter(o=>o.userData.sceneLight).map(o=>({position:o.position.toArray(),color:o.color.toArray(),power:o.userData.basePower}))}));
 }
}
changeStyle('custom');qa.opt.hour=10;qa.opt.night=false;
qa.opt.cut=2.5;qa.buildArch();
const glass=qa.walls.children.find(o=>o.userData.openingId==='GLZ-RECP-N');
assert.ok(glass);assert.equal(glass.geometry.parameters.height,2.5);assert.equal(glass.position.y,1.25);
for(const c of qa.walls.children.filter(o=>o.userData.ceilingFor))assert.equal(c.position.y,2.5);
assert.equal(qa.walls.children.filter(o=>o.userData.ceilingFor&&o.userData.ceilingFor.startsWith('TER-')).length,0);
const angled=qa.walls.children.find(o=>o.userData.wallSegment&&o.userData.wallSegment.from[0]!==o.userData.wallSegment.to[0]&&o.userData.wallSegment.from[1]!==o.userData.wallSegment.to[1]);
assert.ok(angled&&Math.abs(angled.rotation.y)>.1);
// Doorless passages should be physically open in the collision model.
for(const id of ['OP-HALL-RECP','OP-MBR-WIC']){
 const o=evaluate(`MODEL.openings.find(o=>o.id==='${id}')`),cx=(o.from[0]+o.to[0])/2,cy=(o.from[1]+o.to[1])/2;
 const width=evaluate('MODEL.width_mm'),depth=evaluate('MODEL.depth_mm');
 assert.equal(qa.blocked((cx-width/2)/1000,(cy-depth/2)/1000),false,id);
}
qa.active=true;qa.setMode('walk');
assert.equal(qa.opt.cut,2.5);
assert.equal(qa.camera.position.y,1.7);
const sofa=evaluate("state.furniture.find(f=>f.type==='sofa')"),mw=evaluate('MODEL.width_mm'),md=evaluate('MODEL.depth_mm');
assert.equal(qa.blocked((sofa.cx-mw/2)/1000,(sofa.cy-md/2)/1000),true);
for(const aspect of [.65,900/700,2.5])for(const direction of [new THREE.Vector3(.3,.74,.6),new THREE.Vector3(0,1,.00001)]){
 const p=qa.fitWhole(direction,aspect),cam=new THREE.PerspectiveCamera(qa.camera.fov,aspect,.05,300);
 cam.position.copy(p.p);cam.lookAt(p.t);cam.updateMatrixWorld();
 for(const r of evaluate('ROOMS'))for(const [x,z] of r.poly)for(const y of [0,2.5]){
  const v=new THREE.Vector3((x-mw/2)/1000,y,(z-md/2)/1000).project(cam);
  assert.ok(Math.abs(v.x)<.96&&Math.abs(v.y)<.96,'Whole-apartment framing must fit desktop and portrait mobile.');
 }
}
// Actual Three.js object generation; raster capture uses the explicitly stubbed renderer.
evaluate("state=defaultState();state.furniture=[];state.interior=interiorDefaults();renderAll();");
const objectTypes=evaluate('INTERIOR_OBJECT_TYPES'),forms=[];
for(const [type,spec] of Object.entries(objectTypes))for(const variant of spec.variants){
 const o=evaluate(`interiorDraft('${type}','BR-01')`);o.variant=variant;const g=qa.interiorMesh(o);g.updateMatrixWorld(true);
 assert.ok(g.children.length>0,type+' '+variant+' has a model');const bounds=new THREE.Box3().setFromObject(g);
 assert.ok(bounds.min.y>=-.002&&bounds.max.y<=2.502,type+' '+variant+' fits the canonical ceiling');
 assert.equal(g.userData.approximate,true);forms.push(type+':'+variant);
}
const divider=evaluate("interiorDraft('divider','BR-01')");divider.cx=3200;divider.cy=3000;
evaluate(`state.interior.objects=[${JSON.stringify(divider)}];renderAll();`);qa.buildFurn();
assert.equal(qa.blocked((3200-mw/2)/1000,(3000-md/2)/1000),true,'Divider obstructs walking');
assert.equal(evaluate('WALL_SEGMENTS.length'),64,'Divider does not become a wall');
const wallRef=evaluate("interiorSurfaces(MODEL).surfaces.find(s=>s.type==='wall'&&s.room_id==='BR-01'&&s.length_mm>1200)");
evaluate(`state.interior.surface_materials['${wallRef.id}']='generic-plaster';state.interior.surface_materials['FLOOR-BR-01']='generic-travertine';`);qa.buildArch();
const finishedWall=qa.walls.children.find(g=>g.userData.wallSegment===evaluate(`WALL_SEGMENTS[${wallRef.source_wall_index}]`));
assert.ok(finishedWall.material.some(m=>m.userData.interiorMaterialId==='generic-plaster'));
assert.equal(qa.floors.children.find(g=>g.userData.room==='BR-01').material.userData.interiorMaterialId,'generic-travertine');
evaluate("state.interior.materials.push({schema:'InteriorMaterial/1',id:'qa-pbr',name:'PBR map reference',category:'stone',source_status:'REFERENCE',base_colour:'#cccccc',roughness:.6,metallic:0,texture_scale_mm:{width:600,height:1200},albedo_texture:'./art/warm.png',normal_map:'./art/warm.png',roughness_map:'./art/warm.png'});");
const mapped=qa.interiorPbr('qa-pbr','#cccccc',{width:1200,height:2400});await new Promise(r=>setTimeout(r,0));
assert.ok(mapped.map&&mapped.normalMap&&mapped.roughnessMap);assert.deepEqual(mapped.map.repeat.toArray(),[2,2]);assert.equal(mapped.map.colorSpace,THREE.SRGBColorSpace);assert.equal(mapped.normalMap.colorSpace,THREE.NoColorSpace);
evaluate("state.interior.materials.push({schema:'InteriorMaterial/1',id:'qa-fallback',name:'Unavailable map',category:'paint',source_status:'GENERIC',base_colour:'#abcdef',roughness:.8,albedo_texture:'./unavailable.png'});");
const fallback=qa.interiorPbr('qa-fallback');await new Promise(r=>setTimeout(r,0));assert.equal(fallback.userData.textureFallback,true);assert.equal(fallback.color.getHexString(),'abcdef');
qa.opt.cut=2.5;qa.opt.furn=true;qa.active=true;assert.equal(w.View3D.currentRoom(),'RECP-01');await assert.rejects(()=>w.View3D.captureAiView('BR-01'),/another room/);const captured=await w.View3D.captureAiView('RECP-01');
assert.equal(captured.scene_revision,evaluate('studioSceneKey(state)'));assert.deepEqual(Array.from(captured.camera.position),qa.camera.position.toArray());assert.equal(captured.camera.projection_type,'perspective');assert.equal(captured.camera.fov,qa.camera.fov);assert.equal(captured.camera.viewer.cut_height_m,2.5);
const capturedBytes=Buffer.from(await captured.png.arrayBuffer());assert.ok(capturedBytes.length>100);assert.equal(capturedBytes.subarray(1,4).toString(),'PNG');assert.equal(capturedBytes.readUInt32BE(16),captured.camera.viewport.width);assert.equal(capturedBytes.readUInt32BE(20),captured.camera.viewport.height);
const encode=w.HTMLCanvasElement.prototype.toBlob,framePosition=qa.camera.position.toArray(),frameRevision=evaluate('studioSceneKey(state)');
w.HTMLCanvasElement.prototype.toBlob=function(callback,type){encode.call(this,callback,type);qa.camera.position.x+=.20;evaluate("state.studio.rooms['RECP-01']={brightness:60};");};
const immutableFrame=await w.View3D.captureAiView('RECP-01');assert.deepEqual(Array.from(immutableFrame.camera.position),framePosition);assert.equal(immutableFrame.scene_revision,frameRevision);assert.notEqual(immutableFrame.scene_revision,evaluate('studioSceneKey(state)'));qa.camera.position.fromArray(framePosition);w.HTMLCanvasElement.prototype.toBlob=encode;
qa.opt.cut=1.05;await assert.rejects(()=>w.View3D.captureAiView('RECP-01'),/full 2.50/);qa.opt.cut=2.5;qa.opt.furn=false;await assert.rejects(()=>w.View3D.captureAiView('RECP-01'),/Show furnishings/);qa.opt.furn=true;
assert.equal(evaluate('JSON.stringify(WALL_SEGMENTS)'),before);
const report={result:'PASS',checks:['JavaScript syntax','13 room polygons','16 distinct openings','single reception space','English furniture catalog','empty shell and undo','starter furniture','locked geometry and imports','room flooring changes','original plan dialog','four-option decor selector','three distinct wall colours and 3D floor textures','shared furniture placement across all styles','per-style colour and floor edits retained','Your design finish restoration','decor undo and redo','decor persistence/import validation with stable furniture IDs','old layouts without decor metadata','camera, lighting and opening states retained during switching','actual Three.js floor/wall/furniture generation','three distinct sofa and bed geometries','three distinct pendant fixture forms','five canonical wall-mounted artworks per style with existing assets','five curtains aligned with glazing per style','furniture-linked fixtures within the 2.50 m ceiling','five collision-free interior cameras per style','Night control changes fixture power and visible emission','canonical wall segments unchanged by complete scenes','10 indoor ceilings; no terrace ceilings','correct diagonal partition','floor-to-ceiling living glazing','doorless passage collision clearance','walk starts at entry at 1.70 m eye level','furniture collision in walk mode','camera framing at mobile, desktop and wide aspect ratios'],browser_rendering:'UNAVAILABLE',webmcp_live_context:'UNAVAILABLE',webmcp_mock_registration_and_invalid_input:'PASS'};
report.checks.push('Independent per-room HVAC, gypsum, lighting, CCT, brightness and flooring controls','Selectable furniture shapes preserve size and placement','Configured fixture bounds stay below 2.50 m','Configured living camera remains collision-free','Room lighting overrides suppress style pendants and ambient fixture power','Studio options and variants survive reload','Agent proposal canonical hash and scene revision validated','Geometry/height changes and invalid placements rejected','Agent apply, undo and redo round trip','Concealed grille remains a concept at the original ceiling plane');
report.checks.push('Every generic interior object and divider variant builds an actual Three.js model below 2.50 m','Freestanding divider blocks walking and leaves all 64 architectural walls intact','Stable wall and floor assignments render custom PBR materials','Albedo/normal/roughness maps have correct scale and colour space; load failure falls back','Camera and PNG capture path matches scene revision and viewport with renderer stub','Cut-away and hidden-furnishing captures rejected','Camera and scene revision frozen before asynchronous PNG encoding');
fs.writeFileSync(new URL('./viewer-validation.json',import.meta.url),JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
w.close();
