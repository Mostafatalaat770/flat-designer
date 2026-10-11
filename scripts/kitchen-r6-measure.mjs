import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {build} from 'esbuild';
import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {createCanvas} from '@napi-rs/canvas';
import {createBuilders} from '../studio/renderer/builders.js';
import {applyKitchenR6Study} from '../kitchen-r6-study.js';
import {sha256} from './kitchen-r4-candidate.mjs';
export async function measureR6(layout,spec){
 fs.mkdirSync('work/kitchen-r6',{recursive:true});
 const file=path.resolve('work/kitchen-r6/domain.mjs');
 await build({entryPoints:['studio/domain/browser.js'],bundle:true,platform:'node',format:'esm',outfile:file});
 const domain=await import(pathToFileURL(file));
 globalThis.document={createElement:n=>{if(n!=='canvas')throw Error(n);return createCanvas(512,512);}};
 const three={...THREE,TextureLoader:class{load(){return new THREE.Texture();}}};
 const scene=new THREE.Scene(),builders=createBuilders({THREE:three,RoundedBoxGeometry,MODEL:domain.MODEL,domain,layout,INTERIOR_MATERIALS:domain.INTERIOR_MATERIALS,scene,
  renderer:{capabilities:{getMaxAnisotropy:()=>1}},camera:new THREE.PerspectiveCamera(),orbit:{target:new THREE.Vector3()},hemi:new THREE.HemisphereLight(),sun:new THREE.DirectionalLight(),ground:new THREE.Mesh(new THREE.PlaneGeometry(),new THREE.MeshStandardMaterial()),envTex:new THREE.Texture()});
 builders.build(layout,{cut:2.5,furn:true,labels:false,night:false,hour:10});scene.updateMatrixWorld(true);
 const bounds=n=>{const b=new THREE.Box3().setFromObject(n);return {min_mm:[b.min.x*1000+domain.MODEL.width_mm/2,b.min.z*1000+domain.MODEL.depth_mm/2,b.min.y*1000],max_mm:[b.max.x*1000+domain.MODEL.width_mm/2,b.max.z*1000+domain.MODEL.depth_mm/2,b.max.y*1000]};};
 const fingerprint=()=>{
  const meshes=[];for(const [group,g] of Object.entries(builders.groups))g.traverse(n=>{if(n.geometry)meshes.push({group,matrix:n.matrixWorld.toArray(),positions:sha256(Buffer.from(n.geometry.attributes.position.array.buffer)),index:n.geometry.index?sha256(Buffer.from(n.geometry.index.array.buffer)):null});});
  return {meshes_sha256:sha256(JSON.stringify(meshes)),mesh_count:meshes.length,doors:builders.doors.map(d=>({id:d.id,width:d.width,a0:d.a0,a1:d.a1,cur:d.cur,open:d.open,pivot:d.pivot?.position.toArray()})),rooms:domain.MODEL.rooms.map(r=>({id:r.id,poly:r.poly})),source_sha256:sha256(JSON.stringify(layout))};
 };
 const original=fingerprint(),objects=[];
 for(const g of builders.groups.furnG.children){
  const id=g.userData.fid||g.userData.interiorObjectId;
  if(![...layout.furniture,...layout.interior.objects].some(o=>o.id===id&&o.room_id==='KIT-01'))continue;
  const meshes=[];g.children.forEach((n,i)=>{if(!n.geometry)return;n.geometry.computeBoundingBox();const b=n.geometry.boundingBox;
   meshes.push({diagnostic_id:id+'::mesh-'+i,type:n.geometry.type,local_dimensions_mm:b.getSize(new THREE.Vector3()).toArray().map(x=>x*1000),local_position:n.position.toArray(),bounds:bounds(n)});
  });objects.push({id,bounds:bounds(g),meshes});
 }
 const result=applyKitchenR6Study(THREE,domain.MODEL,layout,builders.groups.furnG,scene,spec);
 scene.updateMatrixWorld(true);const after=fingerprint();
 const rays=result.fixtures.flatMap(f=>f.emitters.map(e=>{
  const origin=new THREE.Vector3().fromArray(e.position),end=new THREE.Vector3().fromArray(e.target),length=origin.distanceTo(end);
  const ray=new THREE.Raycaster(origin,end.clone().sub(origin).normalize(),.005,length-.02);
  const hit=ray.intersectObjects(builders.groups.furnG.children,true).find(h=>h.object.castShadow);
  let host=hit?.object;while(host&&!host.userData.fid&&!host.userData.interiorObjectId)host=host.parent;
  const source_id=host?.userData.fid||host?.userData.interiorObjectId||null;
  return {emitter_id:e.id,method:'Exact r160 triangle raycast of central aim ray through unchanged source shadow-casting furniture. Excludes final20 mm near target; not a complete beam/IES or user-shadow simulation.',
   first_source_hit:source_id,hit_elevation_mm:hit?hit.point.y*1000:null,
   hood_blocks_central_ray:source_id==='starter-22'&&hit.point.y>=1.5};
 }));
 const data={original,after,objects,overlay:result,central_ray_probes:rays,openings:domain.MODEL.openings.filter(o=>['OP-RECP-KIT','OP-KIT-TERSVC'].includes(o.id)),room:domain.MODEL.rooms.find(r=>r.id==='KIT-01')};
 builders.dispose();return data;
}
