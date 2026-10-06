import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createApartmentDomain } from '../studio/domain/apartment.mjs';

const root=path.resolve(import.meta.dirname,'..');
const snapshot=JSON.parse(fs.readFileSync(path.join(root,'render-snapshots/current.json'),'utf8'));
const domain=createApartmentDomain(root);

assert.equal(snapshot.schema,'ApartmentGitHubRenderSnapshot/1');
assert.equal(snapshot.canonical_sha256,domain.model.canonical_sha256);
assert.equal(snapshot.scene_revision,domain.revision(snapshot.layout),'Snapshot revision mismatch');
assert.equal(snapshot.architecture_variant?.render_only,true,'Architectural candidate must remain render-only');

let report;
try{
  report=domain.validate(snapshot.layout);
}catch(error){
  report=error?.validation;
  if(!report)throw error;
}
const fails=(report?.checks||[]).filter(c=>c.status==='FAIL');
const allowed=fails.filter(c=>c.kind==='placement'&&c.object_id==='E2-island');
const unexpected=fails.filter(c=>!(c.kind==='placement'&&c.object_id==='E2-island'));

assert.equal(unexpected.length,0,'Unexpected hard validation failures: '+JSON.stringify(unexpected,null,2));
assert.ok(allowed.length<=1,'Unexpected duplicate island exception');
if(allowed.length){
  const removed=snapshot.architecture_variant.remove_wall_segments||[];
  const main=removed.some(s=>{
    const a=s.from,b=s.to;
    const match=(p,q)=>Math.abs(p[0]-q[0])<1&&Math.abs(p[1]-q[1])<1;
    return (match(a,[8981.529,6587.866])&&match(b,[12116.59,6587.866]))||
           (match(b,[8981.529,6587.866])&&match(a,[12116.59,6587.866]));
  });
  assert.ok(main,'Cross-room island exception requires the main kitchen/reception wall to be removed in the render-only variant');
}

console.log(JSON.stringify({
  result:'PASS',
  scene_revision:snapshot.scene_revision,
  canonical_sha256:snapshot.canonical_sha256,
  hard_failures:fails,
  allowed_architectural_exceptions:allowed.map(c=>({kind:c.kind,object_id:c.object_id,message:c.message})),
  summary:report?.summary||null,
  note:'Production/canonical domain remains architecture-locked; this validator allows only the reviewed render-only cross-room island exception.'
},null,2));
