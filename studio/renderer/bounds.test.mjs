import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createCanvas} from '@napi-rs/canvas';
import {createBuilders} from './builders.js';

const root = path.resolve(import.meta.dirname, '../..');
const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'type-b-mesh-bounds-')), 'domain.mjs');
await build({entryPoints:[path.join(root, 'studio/domain/browser.js')], bundle:true, platform:'node', format:'esm', outfile:out});
const domain = await import(out);
// Actual r160 geometry; only texture I/O is replaced for this Node test.
globalThis.document = {createElement(name) {assert.equal(name,'canvas'); return createCanvas(512,512);}};
const three = {...THREE, TextureLoader: class {load(){return new THREE.Texture();}}};

test('compact vanity meshes fit their declared footprint without changing standard basin geometry', () => {
  const source = JSON.parse(fs.readFileSync(path.join(root,'studio/app/data/workspace-seed.json')));
  for (const [w,d] of [[400,220],[600,280],[800,500],[1200,500]]) {
    const layout = structuredClone(source.layout);
    layout.furniture = [{id:'bounds-vanity',type:'vanity',cx:domain.MODEL.width_mm/2,cy:domain.MODEL.depth_mm/2,w,d,rot:0,color:'#e5d8c1'}];
    layout.interior.objects=[];
    const scene = new THREE.Scene();
    const builders = createBuilders({THREE:three,RoundedBoxGeometry,MODEL:domain.MODEL,domain,layout,
      INTERIOR_MATERIALS:domain.INTERIOR_MATERIALS,scene,renderer:{capabilities:{getMaxAnisotropy:()=>1}},
      camera:new THREE.PerspectiveCamera(),orbit:{target:new THREE.Vector3()},hemi:new THREE.HemisphereLight(),
      sun:new THREE.DirectionalLight(),ground:new THREE.Mesh(new THREE.PlaneGeometry(),new THREE.MeshStandardMaterial()),envTex:new THREE.Texture()});
    builders.build(layout, {cut:2.5,furn:true,labels:false,night:false,hour:10});
    const vanity=builders.groups.furnG.children.find(o=>o.userData.fid==='bounds-vanity');
    assert.ok(vanity,'Actual vanity mesh was built');
    const bounds = new THREE.Box3().setFromObject(vanity);
    const bowls = vanity.children.filter(o => o.geometry?.type === 'LatheGeometry' && Math.abs(o.position.y - 0.81) < 0.0001);
    assert.equal(bowls.length, w >= 1100 ? 2 : 1);
    for (const bowl of bowls) {
      if (d >= 300) {
        assert.equal(bowl.scale.z, 1, 'Standard bowl shape must stay unchanged');
        assert.equal(bowl.position.z, 0.03, 'Standard bowl offset must stay unchanged');
      }
    }
    assert.ok(bounds.min.z >= -d/2000-0.001 && bounds.max.z <= d/2000+0.001, `Depth overflow for ${w} × ${d}: ${bounds.min.z}, ${bounds.max.z}`);
    assert.ok(bounds.min.x >= -w/2000-0.001 && bounds.max.x <= w/2000+0.001);
    assert.ok(bounds.max.y < 2.5);
    builders.dispose();
  }
});

test('dimensioned island has working and reception fronts inside the unchanged footprint', () => {
  const source=JSON.parse(fs.readFileSync(path.join(root,'design-development/k10/snapshot.json')));
  for(const rot of [0,90]){
    const layout=structuredClone(source.layout);
    const item=layout.furniture.find(f=>f.id==='E2-island');
    item.cx=domain.MODEL.width_mm/2;item.cy=domain.MODEL.depth_mm/2;item.rot=rot;
    layout.furniture=[item];layout.interior.objects=[];
    const scene=new THREE.Scene();
    const builders=createBuilders({THREE:three,RoundedBoxGeometry,MODEL:domain.MODEL,domain,layout,
      INTERIOR_MATERIALS:domain.INTERIOR_MATERIALS,scene,renderer:{capabilities:{getMaxAnisotropy:()=>1}},
      camera:new THREE.PerspectiveCamera(),orbit:{target:new THREE.Vector3()},hemi:new THREE.HemisphereLight(),
      sun:new THREE.DirectionalLight(),ground:new THREE.Mesh(new THREE.PlaneGeometry(),new THREE.MeshStandardMaterial()),envTex:new THREE.Texture()});
    builders.build(layout,{cut:2.5,furn:true,labels:false,night:false,hour:10});
    const island=builders.groups.furnG.children.find(o=>o.userData.fid==='E2-island');
    assert.ok(island?.userData.counterJoinery,'Actual dimensioned builder must run');
    const bounds=new THREE.Box3().setFromObject(island);
    const halfX=(rot===0?1700:900)/2000,halfZ=(rot===0?900:1700)/2000;
    assert.ok(bounds.min.x>=-halfX-.006&&bounds.max.x<=halfX+.006,'Only the existing 5 mm worktop lip is allowed');
    assert.ok(bounds.min.z>=-halfZ-.006&&bounds.max.z<=halfZ+.006);
    assert.ok(bounds.max.y<=.861,'Retain the existing counter height');
    const faces=island.userData.counterJoinery.module_geometry;
    assert.equal(faces.length,6);
    for(const face of faces){
      assert.ok(face.min_mm[0]>=-850&&face.max_mm[0]<=850);
      assert.ok(face.max_mm[1]<=821&&face.min_mm[1]>=79);
      if(face.side==='working')assert.ok(face.min_mm[2]>=419&&face.max_mm[2]<=450,'All working fronts face the south aisle');
      else assert.ok(face.min_mm[2]>=-450&&face.max_mm[2]<=-419,'Reception storage opens toward living');
    }
    assert.deepEqual(faces.filter(f=>f.side==='working').map(f=>f.role),['dishwasher','sink','drawers']);
    assert.equal(item.joinery.work_modules[0].width_mm,600,'Preserve the full appliance reservation');
    builders.dispose();
  }
});

test('K11 washing and prep modes build a real sink recess and a flush removable cover', () => {
  for(const mode of ['snapshot','prep-mode']){
    const source=JSON.parse(fs.readFileSync(path.join(root,'design-development/k11/'+mode+'.json')));
    const layout=structuredClone(source.layout),originalIsland=layout.furniture.find(f=>f.id==='E2-island');
    const dx=domain.MODEL.width_mm/2-originalIsland.cx,dz=domain.MODEL.depth_mm/2-originalIsland.cy;
    layout.furniture=layout.furniture.filter(f=>['E2-island','E2-island-sink'].includes(f.id));
    for(const f of layout.furniture){f.cx+=dx;f.cy+=dz;}
    layout.interior.objects=[];
    const builders=createBuilders({THREE:three,RoundedBoxGeometry,MODEL:domain.MODEL,domain,layout,
      INTERIOR_MATERIALS:domain.INTERIOR_MATERIALS,scene:new THREE.Scene(),renderer:{capabilities:{getMaxAnisotropy:()=>1}},
      camera:new THREE.PerspectiveCamera(),orbit:{target:new THREE.Vector3()},hemi:new THREE.HemisphereLight(),
      sun:new THREE.DirectionalLight(),ground:new THREE.Mesh(new THREE.PlaneGeometry(),new THREE.MeshStandardMaterial()),envTex:new THREE.Texture()});
    builders.build(layout,{cut:2.5,furn:true,labels:false,night:false,hour:10});
    const island=builders.groups.furnG.children.find(o=>o.userData.fid==='E2-island'),sink=builders.groups.furnG.children.find(o=>o.userData.fid==='E2-island-sink');
    assert.deepEqual(island.userData.counterJoinery.work_modules.map(m=>m.role),['waste','sink','dishwasher']);
    assert.equal(island.userData.counterJoinery.work_modules[2].width_mm,600);
    const bounds=new THREE.Box3().setFromObject(island);
    // The production builder batches the slab by material, replacing the source
    // ExtrudeGeometry and its child metadata. Inspect the actual resulting mesh.
    const slab=island.children.find(o=>{
      if(!o.isMesh)return false;
      const b=new THREE.Box3().setFromObject(o);
      return b.min.y>=.819&&b.max.y<=.861;
    });
    assert.ok(slab,'Actual perforated countertop mesh must be built');
    assert.ok(bounds.min.x>=-.856&&bounds.max.x<=.856&&bounds.min.z>=-.451&&bounds.max.z<=.451&&bounds.max.y<=.861);
    const sinkBounds=new THREE.Box3().setFromObject(sink);
    assert.ok(sinkBounds.min.x>=(-68-275)/1000-.001&&sinkBounds.max.x<=(-68+275)/1000+.001);
    assert.ok(sinkBounds.min.z>=-.076&&sinkBounds.max.z<=.376,'Tap, rim and cover fit the 550 × 450 mm sink reserve');
    const tap=sink.children.find(o=>o.userData.workstationTap),tapBounds=new THREE.Box3().setFromObject(tap);
    assert.ok(tapBounds.max.x<(11668-11750)/1000,'Actual tap and lever mesh stay west of the cover-enabled prep rectangle');
    const ray=new THREE.Raycaster(new THREE.Vector3(-.068,1.3,.160),new THREE.Vector3(0,-1,0));
    builders.groups.furnG.updateMatrixWorld(true);
    assert.equal(ray.intersectObject(slab,true).length,0,'The bowl cutout must not be filled by an opaque countertop');
    const solidRay=new THREE.Raycaster(new THREE.Vector3(-.4,1.3,.160),new THREE.Vector3(0,-1,0));
    assert.ok(solidRay.intersectObject(slab,true).some(hit=>Math.abs(hit.point.y-.86)<.0001),'The adjoining counter surface must still exist at the same height');
    const cover=sink.children.find(o=>o.userData.workstationCover);
    if(mode==='prep-mode'){
      assert.ok(cover,'Prep mode shows the actual removable cover mesh');
      const cb=new THREE.Box3().setFromObject(cover);
      assert.ok(Math.abs(cb.max.y-.86)<.0001,'Cover is flush with the counter top at concept level');
      assert.deepEqual(cover.userData.workstationCover.nominal_mm,[480,350,16]);
      assert.ok(ray.intersectObject(cover,true).length>0);
    }else{
      assert.equal(cover,undefined,'Washing mode must not imply a covered sink');
      const bowl=sink.children.find(o=>o.userData.workstationBowl);
      const hits=ray.intersectObject(bowl,true);
      assert.ok(hits.length>0&&hits.every(hit=>hit.point.y<.7),'Visible bowl bottom lies below the worktop');
    }
    builders.dispose();
  }
});

test('K11 cooking drawers and appliance niche retain the declared cabinet envelopes', () => {
  const source=JSON.parse(fs.readFileSync(path.join(root,'design-development/k11/snapshot.json')));
  for(const id of ['E2-cooking-base','E2-pantry-tall']){
    const layout=structuredClone(source.layout);
    layout.furniture=layout.furniture.filter(f=>f.id===id);layout.interior.objects=layout.interior.objects.filter(o=>o.id===id);
    const f=layout.furniture[0]||layout.interior.objects[0];f.cx=domain.MODEL.width_mm/2;f.cy=domain.MODEL.depth_mm/2;
    if(layout.furniture.length)f.rot=0;else f.rotation=0;
    const builders=createBuilders({THREE:three,RoundedBoxGeometry,MODEL:domain.MODEL,domain,layout,
      INTERIOR_MATERIALS:domain.INTERIOR_MATERIALS,scene:new THREE.Scene(),renderer:{capabilities:{getMaxAnisotropy:()=>1}},
      camera:new THREE.PerspectiveCamera(),orbit:{target:new THREE.Vector3()},hemi:new THREE.HemisphereLight(),
      sun:new THREE.DirectionalLight(),ground:new THREE.Mesh(new THREE.PlaneGeometry(),new THREE.MeshStandardMaterial()),envTex:new THREE.Texture()});
    builders.build(layout,{cut:2.5,furn:true,labels:false,night:false,hour:10});
    const object=builders.groups.furnG.children.find(o=>o.userData.fid===id||o.userData.interiorObjectId===id);
    assert.ok(object);
    const b=new THREE.Box3().setFromObject(object);
    if(id==='E2-cooking-base'){
      assert.deepEqual(object.userData.counterJoinery.work_modules.map(m=>m.width_mm),[582,600,582]);
      assert.equal(object.userData.counterJoinery.rear_modules.length,0);
      assert.ok(b.min.x>=-.906&&b.max.x<=.906&&b.min.z>=-.301&&b.max.z<=.301&&b.max.y<=.861);
    }else{
      assert.ok(object.userData.applianceStation,'Generic whole-cabinet box must be replaced by the explicit niche');
      assert.ok(b.min.x>=-.301&&b.max.x<=.301&&b.min.z>=-.301&&b.max.z<=.301&&b.max.y<=2.201);
      const units=object.children.filter(o=>o.userData.smallAppliance);
      assert.equal(units.length,2);
      for(const u of units){const a=new THREE.Box3().setFromObject(u);assert.ok(a.min.x>=-.282&&a.max.x<=.282&&a.min.z>=-.282&&a.max.z<=.282&&a.min.y>=.859&&a.max.y<=1.451);}
    }
    builders.dispose();
  }
});
