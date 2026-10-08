/**
 * A15: prevent "six-seat" visual approval from cameras that clip chair shells.
 * Independent branch, source K12/A13 only; no changes to canonical/master/Studio.
 * Camera frustum projection checks all 6 chair FOOTPRINT corners at 0.85m.
 * Visibility is necessary, NOT sufficient: walls/table/people may still occlude.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
const mode=process.argv[2]||'prepare';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const domain=createApartmentDomain(process.cwd());
const a13=read('review-evidence/advisor-a13-seat-options.json');
const base=read('design-development/k12/snapshot.json');
const dir='design-development/advisor/a15',out='review-evidence/advisor-a15';
const chairs=['starter-36','A2-dining-chair-north-centre','starter-37','starter-38','A2-dining-chair-south-centre','starter-39'];
const tableId='starter-35';
assert.equal(a13.canonical_sha256,domain.model.canonical_sha256);
assert.equal(base.canonical_sha256,a13.canonical_sha256);
assert.equal(base.scene_revision,domain.revision(base.layout));
assert.equal(base.architecture_variant.render_only,true);
const vec=(x,y,z)=>[x,y,z];
const sub=(a,b)=>a.map((n,i)=>n-b[i]);
const dot=(a,b)=>a.reduce((s,n,i)=>s+n*b[i],0);
const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
const norm=a=>{const d=Math.hypot(...a);if(d<1e-9)throw Error('Degenerate camera vector');return a.map(n=>n/d)};
const world=(xy,h)=>[(xy[0]-domain.model.width_mm/2)/1000,h,(xy[1]-domain.model.depth_mm/2)/1000];
function project(worldPoint,camera){
 const forward=norm(sub(camera.target,camera.position));
 const right=norm(cross(forward,[0,1,0]));
 const up=cross(right,forward);
 const relative=sub(worldPoint,camera.position),z=dot(relative,forward);
 if(z<=0)return {x:Infinity,y:Infinity,z};
 const vertical=Math.tan(camera.fov*Math.PI/360);
 return {x:dot(relative,right)/(z*vertical*camera.aspect),y:dot(relative,up)/(z*vertical),z};
}
function footprintProjection(layout,camera){
 const result=[];
 for(const id of chairs){
  const c=layout.furniture.find(x=>x.id===id);assert.ok(c,'missing '+id);
  assert.equal(c.type,'chair');assert.equal(c.w,510);assert.equal(c.d,530);
  const rad=c.rot*Math.PI/180,cos=Math.cos(rad),sin=Math.sin(rad);
  const corners=[];
  for(const dx of [-c.w/2,c.w/2])for(const dy of [-c.d/2,c.d/2]){
   const x=c.cx+dx*cos-dy*sin,y=c.cy+dx*sin+dy*cos;
   corners.push(project(world([x,y],0.85),camera));
  }
  const bbox={
   min_x:Math.min(...corners.map(p=>p.x)),max_x:Math.max(...corners.map(p=>p.x)),
   min_y:Math.min(...corners.map(p=>p.y)),max_y:Math.max(...corners.map(p=>p.y))
  };
  result.push({id,bbox,all_corners_inside_12pct_margin:corners.every(p=>p.z>0&&Math.abs(p.x)<.88&&Math.abs(p.y)<.88)});
 }
 return result;
}
function failures(layout){
 try{return domain.validate(layout).checks.filter(c=>c.status==='FAIL').map(c=>[c.kind,c.object_id??null,c.source_wall_index??null]);}
 catch(e){if(e.validation)return e.validation.checks.filter(c=>c.status==='FAIL').map(c=>[c.kind,c.object_id??null,c.source_wall_index??null]);throw e;}
}
if(mode==='prepare'){
 fs.mkdirSync(dir,{recursive:true});fs.mkdirSync(out,{recursive:true});
 const scenes=[],originalFails=failures(base.layout);assert.equal(originalFails.length,2);
 const defs=[
  {id:'A15-six-chairs-overhead',from:[14670,7700],eye_m:2.45,aim:[14670,7500],target_m:.65,fov:76},
  {id:'A15-six-chairs-oblique',from:[14200,8700],eye_m:2.30,aim:[14670,7500],target_m:.75,fov:70}
 ];
 for(const inset of [0,75]){
  const old=read('design-development/advisor/a13/combined-island150-seats'+inset+'.json');
  assert.equal(old.canonical_sha256,base.canonical_sha256);
  assert.equal(old.scene_revision,domain.revision(old.layout));
  assert.deepEqual(failures(old.layout),originalFails);
  assert.equal(old.layout.furniture.filter(x=>chairs.includes(x.id)).length,6);
  const table=old.layout.furniture.find(x=>x.id===tableId);
  assert.deepEqual([table.w,table.d],[2000,950]);
  const scene=structuredClone(old);
  scene.views=defs.map(d=>({id:d.id,room_id:'RECP-01',
   camera:domain.captureCamera(scene.layout,{
    room_id:'RECP-01',position:world(d.from,d.eye_m),
    target:world(d.aim,d.target_m),fov:d.fov
   })
  }));
  const footprints=footprintProjection(scene.layout,scene.views[0].camera);
  assert.equal(footprints.length,6);
  assert.ok(footprints.every(x=>x.all_corners_inside_12pct_margin),
   'Overhead view must show complete six-chair footprint, including margins: '+JSON.stringify(footprints));
  const file=path.join(dir,'island150-seats'+inset+'-coverage.json');
  fs.writeFileSync(file,JSON.stringify(scene,null,2)+'\n');
  scenes.push({inset_mm:inset,file,scene_revision:scene.scene_revision,
   camera_ids:scene.views.map(v=>v.id),cameras:scene.views.map(v=>v.camera),
   overhead_footprints:footprints});
 }
 assert.deepEqual(scenes[0].cameras,scenes[1].cameras,'Matched comparison cameras must be identical');
 const report={
  schema:'A15SixSeatCameraCoverage/1',
  status:'GEOMETRY_FRUSTUM_PRECHECK_ONLY_NOT_VISUAL_APPROVAL',
  canonical_sha256:base.canonical_sha256,base_k12_revision:base.scene_revision,
  inherited_architectural_failures:originalFails,
  scenes,
  limitations:[
   'Projected six chair shell corners at 0.85m fit within 12% image margins; no hidden-surface or wall-occlusion analysis.',
   'Only actual PNG inspection can confirm all six chairs visible; human body/elbow comfort not tested.',
   'All architecture and wet MEP unapproved; renders are exploratory snapshots.'
  ]
 };
 fs.writeFileSync(path.join(out,'camera-coverage.json'),JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({status:report.status,cameras:defs.map(x=>x.id),
  scenes:scenes.map(x=>({inset:x.inset_mm,revision:x.scene_revision,chair_shells_in_frame:x.overhead_footprints.filter(p=>p.all_corners_inside_12pct_margin).length})),
  inherited_architecture_fails:originalFails.length},null,2));
}else if(mode==='verify'){
 const report=read(path.join(out,'camera-coverage.json'));
 assert.equal(report.scenes.length,2);
 for(const scene of report.scenes){
  const renderedDir='renders/a15-seat-'+scene.inset_mm;
  const layout=read(scene.file);
  for(const view of layout.views){
   const p=path.join(renderedDir,view.id+'.json'),meta=read(p);
   assert.equal(meta.canonical_sha256,report.canonical_sha256);
   assert.equal(meta.scene_revision,scene.scene_revision);
   assert.deepEqual(meta.camera,view.camera);
   assert.equal(meta.assets.pending,0);
   assert.deepEqual(meta.assets.fallbacks,[]);
   assert.equal(meta.renderer.engine,'Three.js WebGL');
   assert.equal(meta.renderer.revision,'160');
   const png=fs.readFileSync(path.join(renderedDir,view.id+'.png'));
   assert.equal(png.toString('hex',0,8),'89504e470d0a1a0a');
   assert.deepEqual([png.readUInt32BE(16),png.readUInt32BE(20)],[1600,857]);
   assert.deepEqual(JSON.parse(meta.rendered_layout_json),layout.layout);
  }
  assert.equal(scene.overhead_footprints.filter(x=>x.all_corners_inside_12pct_margin).length,6);
 }
 fs.writeFileSync(path.join(out,'verified-captures.json'),JSON.stringify({
  schema:'A15CaptureVerification/1',status:'SOURCE_RENDER_AND_FRUSTUM_VERIFIED_NOT_OCCLUSION',
  canonical_sha256:report.canonical_sha256,
  scene_revisions:report.scenes.map(x=>x.scene_revision),
  matched_cameras:true,
  rendered_images:4,images_dimensions_px:[1600,857],
  six_chair_shells_in_overhead_frame_each:6,
  fallbacks:0,structural_approval:false,
  caveat:'Image pixels require independent human visual inspection for occlusion; a 2D projected bbox cannot guarantee physical seat comfort.'
 },null,2)+'\n');
 console.log('PASS: 4 WebGL images, 2 exactly matched cameras, all 6 chairs inside overhead frustum, source SHA and no fallback');
}else throw Error('Unknown mode '+mode);
