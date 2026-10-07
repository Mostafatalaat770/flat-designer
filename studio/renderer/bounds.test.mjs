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
