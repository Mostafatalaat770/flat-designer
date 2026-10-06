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
