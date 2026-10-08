/**
 * A17: A16 camera coverage repair. Nothing to do with kitchen geometry.
 * Reuse 3 exact-source palette variants; aim a validated camera at the
 * sofa/coffee table rather than falsely labeling a kitchen picture "living".
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
const domain=createApartmentDomain(process.cwd());
const original=JSON.parse(fs.readFileSync('design-development/k12/snapshot.json','utf8'));
assert.equal(original.scene_revision,domain.revision(original.layout));
const tags=['a16-current','a16-pale-stone','a16-olive-oak'];
const base='design-development/advisor/a16/';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const variants=tags.map(tag=>({tag,file:base+tag+'.json',source:read(base+tag+'.json')}));
for(const v of variants){
 assert.equal(v.source.canonical_sha256,domain.model.canonical_sha256);
 assert.equal(v.source.scene_revision,domain.revision(v.source.layout));
 assert.deepEqual(v.source.architecture_variant,original.architecture_variant);
}
const targetId='starter-28';
const sofa=original.layout.furniture.find(f=>f.id===targetId);
const coffee=original.layout.furniture.find(f=>f.id==='starter-29');
const tv=original.layout.furniture.find(f=>f.id==='starter-30');
assert.ok(sofa&&coffee&&tv);
const camera=domain.presetCamera(original.layout,'RECP-01','dining-to-living');
assert.equal(camera.viewport.width,1600);
assert.equal(camera.viewport.height,857);
assert.equal(camera.position[1],1.7);
function projectedPoint([x,y,z]){
 const p=camera.position,t=camera.target;
 const sub=(a,b)=>a.map((v,i)=>v-b[i]);
 const dot=(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0);
 const norm=a=>Math.hypot(...a);
 const scale=(a,k)=>a.map(v=>v*k);
 const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
 const f=scale(sub(t,p),1/norm(sub(t,p))),r=scale(cross(f,[0,1,0]),-1/norm(cross(f,[0,1,0])));
 const up=cross(r,f);
 const v=sub([x,y,z],p),depth=dot(v,f);
 if(depth<0.3)return {within:false,ndc_x:null,ndc_y:null,depth};
 const fovr=camera.fov*Math.PI/180;
 const vf=Math.tan(fovr/2);
 const nx=dot(v,r)/(depth*vf*camera.aspect);
 const ny=dot(v,up)/(depth*vf);
 return {within:Math.abs(nx)<0.85&&Math.abs(ny)<0.85,ndc_x:+nx.toFixed(3),
  ndc_y:+ny.toFixed(3),depth_m:+depth.toFixed(2)};
}
const worldItem=(f,height=0.5)=>[(f.cx-domain.model.width_mm/2)/1000,height,(f.cy-domain.model.depth_mm/2)/1000];
const inspected=[sofa,coffee,tv].map(f=>({id:f.id,...projectedPoint(worldItem(f))}));
assert.ok(inspected.some(x=>x.id==='starter-28'&&x.within),
 'Sofa MUST lie well inside the actual living camera view (no kitchen-only frame).');
assert.ok(inspected.some(x=>x.id==='starter-29'&&x.within),
 'Coffee table MUST lie well inside camera.');
const views=[{id:'A17-actual-sofa-living',room_id:'RECP-01',camera}];
const out='design-development/advisor/a17';
fs.mkdirSync(out,{recursive:true});
const evidence=[];
for(const v of variants){
 const source=structuredClone(v.source);
 const prev=source.scene_revision;
 source.name='A17 living focused '+v.tag;
 source.views=structuredClone(views);
 assert.equal(source.scene_revision,prev,'Changing a camera must not change a verified scene revision');
 assert.equal(domain.revision(source.layout),prev);
 const path=out+'/'+v.tag+'-sofa.json';
 fs.writeFileSync(path,JSON.stringify(source,null,2)+'\n');
 evidence.push({tag:v.tag,file:path,source_scene:prev});
}
const result={schema:'ApartmentA17CameraSubjectGate/1',
 source_sha256:domain.model.canonical_sha256,
 scene_root:original.scene_revision,
 camera_id:views[0].id,subject_room:'RECP-01',
 subject_projections:inspected,
 scene_variants:evidence,
 camera_same_for_all:true,
 coverage_status:'SOFA_AND_COFFEE_TABLE_CENTER_IN_VIEW_FRUSTUM',
 limitations:[
  'Subject centre in projected camera frustum is necessary but not SUFFICIENT for visual legibility: foreground walls/furniture can occlude it.',
  'Still requires human review of real WebGL screenshot; cannot infer comfort or physical presence.',
  'Does not alter furniture placements, canonical source, kitchen wall or saved cloud Studio.'
 ]};
fs.mkdirSync('review-evidence/advisor-a17',{recursive:true});
fs.writeFileSync('review-evidence/advisor-a17/living-camera-coverage.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
