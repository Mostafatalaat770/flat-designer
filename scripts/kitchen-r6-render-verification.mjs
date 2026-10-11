import assert from 'node:assert/strict';
import {verifyR5Frame} from './kitchen-r5-render-verification.mjs';
export function numericEqual(a,b,path='',tolerance=.00002){
 if(typeof a==='number'&&typeof b==='number')assert.ok(Math.abs(a-b)<tolerance,'Geometry drift '+path);
 else if(a&&b&&typeof a==='object'&&typeof b==='object'){
  assert.deepEqual(Object.keys(a),Object.keys(b),'Missing evidence field '+path);for(const k of Object.keys(a))numericEqual(a[k],b[k],path+'/'+k,tolerance);
 }else assert.equal(a,b,'Evidence mismatch '+path);
}
export function verifyR6Frame(fixture,r5audit,audit,id){
 const result=verifyR5Frame(fixture,r5audit),m=fixture.metadata;
 assert.deepEqual(m.kitchen_r6_study,fixture.snapshot.kitchen_r6_study);
 const evidence=m.kitchen_r6_result;assert.ok(evidence);assert.deepEqual(evidence.spec,m.kitchen_r6_study);
 assert.equal(evidence.source_changed,false);assert.equal(evidence.measured_lux,null);assert.equal(evidence.wattage,null);assert.equal(evidence.wiring,null);assert.equal(evidence.product_selected,false);
 numericEqual(evidence.source_geometry_before,evidence.source_geometry_after);
 numericEqual(evidence.fixtures,audit.options[id].fixtures);numericEqual(evidence.finishes,audit.options[id].finishes);
 assert.ok(evidence.fixtures.filter(f=>f.kind==='SHIELDED_LINEAR_PROFILE_PROXY').every(f=>r5audit.after.uppers.some(u=>u.source_id===f.source_id)));
 return {...result,option:id,overlay_verified:true,fixture_count:evidence.fixtures.length,finish_mesh_count:evidence.finishes.length};
}
