import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'esbuild';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { createCanvas } from '@napi-rs/canvas';
import { kitchenGeometryEvidence } from '../kitchen-render-truth.js';
import { sha256 } from './kitchen-r4-candidate.mjs';

export async function buildMeasuredKitchen(layout, builderFile = 'studio/renderer/builders.js') {
  const root = process.cwd();
  const domainFile = path.join(root, 'work/kitchen-r5/domain.mjs');
  fs.mkdirSync(path.dirname(domainFile), {recursive:true});
  await build({entryPoints:['studio/domain/browser.js'],bundle:true,platform:'node',format:'esm',outfile:domainFile});
  const domain = await import(pathToFileURL(domainFile).href);
  const {createBuilders} = await import(pathToFileURL(path.resolve(builderFile)).href);
  globalThis.document = {createElement(name) {if(name !== 'canvas') throw Error(name); return createCanvas(512,512);}};
  const three = {...THREE,TextureLoader:class {load(){return new THREE.Texture();}}};
  const scene = new THREE.Scene();
  const builders = createBuilders({THREE:three,RoundedBoxGeometry,MODEL:domain.MODEL,domain,layout,
    INTERIOR_MATERIALS:domain.INTERIOR_MATERIALS,scene,renderer:{capabilities:{getMaxAnisotropy:()=>1}},
    camera:new THREE.PerspectiveCamera(),orbit:{target:new THREE.Vector3()},hemi:new THREE.HemisphereLight(),
    sun:new THREE.DirectionalLight(),ground:new THREE.Mesh(new THREE.PlaneGeometry(),new THREE.MeshStandardMaterial()),envTex:new THREE.Texture()});
  builders.build(layout,{cut:2.5,furn:true,labels:false,night:false,hour:10});
  scene.updateMatrixWorld(true);
  const geometry = kitchenGeometryEvidence(THREE,domain.MODEL,layout,builders.groups.furnG);
  const objects = builders.groups.furnG.children.map(g => {
    const meshes=[];
    g.traverse(n=>{if(n.geometry)meshes.push({type:n.geometry.type,
      matrix:n.matrixWorld.toArray(),position_sha256:sha256(Buffer.from(n.geometry.attributes.position.array.buffer)),
      index_sha256:n.geometry.index?sha256(Buffer.from(n.geometry.index.array.buffer)):null});});
    return {id:g.userData.fid || g.userData.interiorObjectId,meshes};
  });
  const architecture=[];
  builders.groups.archUp.traverse(n=>{if(n.geometry)architecture.push({type:n.geometry.type,matrix:n.matrixWorld.toArray(),position_sha256:sha256(Buffer.from(n.geometry.attributes.position.array.buffer))});});
  const doors=builders.doors.map(d=>({id:d.id,width:d.width,a0:d.a0,a1:d.a1,cur:d.cur,open:d.open,pivot:d.pivot?.position.toArray()}));
  builders.dispose();
  return {geometry,objects,architecture,doors,room_footprints:domain.MODEL.rooms.map(r=>({id:r.id,poly:r.poly})),source_json_sha256:sha256(JSON.stringify(layout))};
}

export function intersectBounds(a,b) {
  if(!a || !b) return null;
  const min_mm=a.min_mm.map((n,i)=>Math.max(n,b.min_mm[i]));
  const max_mm=a.max_mm.map((n,i)=>Math.min(n,b.max_mm[i]));
  const extent_mm=min_mm.map((n,i)=>max_mm[i]-n);
  return extent_mm.every(n=>n>.1) ? {min_mm,max_mm,extent_mm,litres:extent_mm.reduce((n,x)=>n*x,1)/1e6} : null;
}
