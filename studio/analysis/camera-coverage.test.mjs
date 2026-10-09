import test from 'node:test';
import assert from 'node:assert/strict';
import {assessLivingCameraCoverage} from './camera-coverage.mjs';
const model={width_mm:16035.418,depth_mm:10231.317};
const lamps=[{id:'S1-reading-lamp',type:'floor-lamp',room_id:'RECP-01',cx:10230,cy:4430,width_mm:360,depth_mm:360,height_mm:1500}];
const furniture=[
{id:'sofa',type:'sofa',cx:9585,cy:2460,room_id:'RECP-01'},
{id:'coffee',type:'coffeetable',cx:10900,cy:2350,room_id:'RECP-01'},
{id:'tv',type:'tv',cx:12243,cy:1779,room_id:'RECP-01'},
{id:'chair',type:'armchair',cx:11620,cy:3890,room_id:'RECP-01'}
];
const world=(p,h)=>[(p[0]-model.width_mm/2)/1000,h,(p[1]-model.depth_mm/2)/1000];
const cam=(p,t)=>({position:world(p,1.7),target:world(t,1.15),fov:60,aspect:1600/857,viewport:{width:1600,height:857}});
test('actual room lounge eye cameras show sofa, coffee, TV and armchair in inner view',()=>{
 for(const [p,t] of [[[12400,5800],[11000,2200]],[[13600,5500],[11000,2500]]]){
  const a=assessLivingCameraCoverage({camera:cam(p,t),model,furniture,
    ids:furniture.map(x=>x.id),min_count:4,min_inner_margin:.15,interior_objects:lamps});
  assert.equal(a.passed,true,JSON.stringify(a.subjects));
  assert.equal(a.proxy_visible_count,4);
  assert.equal(a.frame_blockers.length,0);
  assert.ok(a.subjects.every(o=>o.inside_safe_frame));
 }
});
test('original visually bad camera is rejected because foreground floor lamp masks centre',()=>{
 const v=assessLivingCameraCoverage({camera:cam([9900,5500],[11100,2400]),model,furniture,
 ids:furniture.map(x=>x.id),min_count:4,interior_objects:lamps});
 assert.equal(v.proxy_visible_count,4,'Four subject centres were in frame, so previous test was a false positive');
 assert.equal(v.passed,false);
 assert.equal(v.frame_blockers[0].id,'S1-reading-lamp');
});
test('camera facing away cannot falsely approve family sofa',()=>{
 const a=assessLivingCameraCoverage({camera:cam([9900,5500],[10100,6300]),model,furniture,
   ids:['sofa','coffee','tv','chair'],min_count:4});
 assert.equal(a.passed,false);
 assert.ok(a.subjects.some(x=>!x.in_frustum));
});
test('invalid target or reference cannot be treated as a clear image',()=>{
 assert.throws(()=>assessLivingCameraCoverage({camera:cam([9900,5500],[11100,2400]),model,
  furniture,ids:['invented']}),/Subject not in source furniture/);
 assert.throws(()=>assessLivingCameraCoverage({camera:cam([9900,5500],[11100,2400]),model,
  furniture,ids:['sofa','sofa']}),/Unique/);
});
test('geometry-only preflight does not certify occlusion or comfort',()=>{
 const a=assessLivingCameraCoverage({camera:cam([9900,5500],[11100,2400]),model,furniture,
  ids:furniture.map(x=>x.id),min_count:4});
 assert.match(a.caveat,/occlusion/);
 assert.match(a.caveat,/human/);
});
