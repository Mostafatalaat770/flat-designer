import assert from 'node:assert/strict';
import {verifyR4Frame} from './kitchen-r4-render-verification.mjs';
export function verifyR5Frame(fixture,audit) {
  const verified=verifyR4Frame(fixture);
  const {metadata,snapshot}=fixture;
  assert.deepEqual(metadata.render_experiment,snapshot.render_experiment);
  const result=metadata.door_finish_result;
  assert.ok(result);assert.equal(result.geometry_changed,false);
  for(const [key,value] of Object.entries(snapshot.render_experiment))assert.deepEqual(result[key],value);
  assert.deepEqual(result.doors.map(d=>d.id),snapshot.render_experiment.door_ids);
  for(const door of result.doors){
    assert.deepEqual(door.before,door.after,'Door geometry or hinge/swing changed');
    const recorded=snapshot.views.find(v=>v.id===fixture.view.id).camera.viewer.doors.find(d=>d.id===door.id);
    assert.equal(door.after.position,recorded.position);assert.equal(door.after.open,recorded.open);
    assert.equal(door.rendered_colour,snapshot.render_experiment.finish?.colour.toLowerCase() || door.original_colour);
  }
  const numericEqual=(a,b,p='')=>{
    if(typeof a==='number'&&typeof b==='number')assert.ok(Math.abs(a-b)<.02,`Measured mesh drift ${p}: ${a} / ${b}`);
    else if(a&&b&&typeof a==='object'&&typeof b==='object'){
      assert.deepEqual(Object.keys(a),Object.keys(b));for(const k of Object.keys(a))numericEqual(a[k],b[k],p+'/'+k);
    }else assert.equal(a,b,'Geometry field changed '+p);
  };
  numericEqual(metadata.kitchen_geometry,audit.after);
  assert.ok(metadata.kitchen_geometry.counters.every(c=>!c.generated_upper_bounds && !c.generated_backsplash_bounds));
  assert.equal(metadata.kitchen_geometry.uppers.length,3);
  return {...verified,experiment:snapshot.render_experiment.variant,door_geometry_preserved:true,source_upper_geometry_preserved:true};
}
