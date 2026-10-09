import fs from 'node:fs';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {source,domain} from '../circulation-v55/route-library.mjs';

const dir=import.meta.dirname;
const read=file=>JSON.parse(fs.readFileSync(new URL(file,import.meta.url)));
export function compose(){
 const components=[
  {id:'bedroom1-r4',file:'../bedroom1-r4/proposal.json'},
  {id:'table-north-150',file:'../dining-operation-v55/candidates/table-north-150/proposal.json'}
 ].map(c=>({...c,proposal:read(c.file),sha256:crypto.createHash('sha256').update(fs.readFileSync(new URL(c.file,import.meta.url))).digest('hex')}));
 assert.equal(source.scene_revision,'scene-9cf45a73');assert.equal(source.storage_revision,55);
 const operations=components.flatMap(c=>{
  assert.equal(c.proposal.base_scene_revision,source.scene_revision);
  assert.equal(c.proposal.canonical_sha256,source.canonical_sha256);
  return c.proposal.operations;
 });
 const ids=operations.map(o=>o.furniture_id||o.object_id);
 assert.equal(new Set(ids).size,ids.length,'Component operations must target distinct objects.');
 const proposal={schema:'ApartmentDesignProposal/2',canonical_sha256:source.canonical_sha256,
  base_scene_revision:source.scene_revision,operations,
  notes:['LOCAL combined furnishing review: bedroom R4 and dining group 150 mm north. Canonical architecture and current enclosed kitchen retained. Guest outward door is a separate analysis overlay, absent from this proposal.']};
 const layout=domain.applyProposal(source.layout,proposal);
 const forward=components.reduce((l,c)=>domain.applyProposal(l,{...c.proposal,base_scene_revision:domain.revision(l)}),source.layout);
 const reverse=[...components].reverse().reduce((l,c)=>domain.applyProposal(l,{...c.proposal,base_scene_revision:domain.revision(l)}),source.layout);
 assert.deepEqual(layout,forward);assert.deepEqual(layout,reverse);
 assert.deepEqual(layout.rooms,source.layout.rooms);assert.deepEqual(layout.demolished,source.layout.demolished);
 assert.deepEqual(layout.studio,source.layout.studio);
 assert.deepEqual(layout.interior.surface_materials,source.layout.interior.surface_materials);
 assert.deepEqual(layout.interior.opening_treatments,source.layout.interior.opening_treatments);
 for(const f of source.layout.furniture.filter(f=>!ids.includes(f.id)))assert.deepEqual(layout.furniture.find(v=>v.id===f.id),f);
 for(const o of source.layout.interior.objects.filter(o=>!ids.includes(o.id)))assert.deepEqual(layout.interior.objects.find(v=>v.id===o.id),o);
 const validation=domain.validate(layout).summary;assert.equal(validation.fail,0);
 const scene_revision=domain.revision(layout);
 const snapshot={schema:'ApartmentGitHubRenderSnapshot/1',name:'Unified local furnishing review — R4 + dining north 150',
  canonical_sha256:source.canonical_sha256,scene_revision,storage_revision:null,source_scene_revision:source.scene_revision,
  saved_source_scene_revision:'scene-4821689',source_storage_revision:55,production_connected:false,layout};
 const brief=domain.designBrief(layout);
 brief.review_provenance={source_scene:source.scene_revision,source_storage_revision:55,production_connected:false,
  components:components.map(c=>({id:c.id,proposal_sha256:c.sha256}))};
 assert.deepEqual(domain.importBrief(brief),layout);
 const composition={schema:'ApartmentFurnishingComposition/1',source_scene:source.scene_revision,saved_cloud_scene:'scene-4821689',
  source_storage_revision:55,canonical_sha256:source.canonical_sha256,candidate_scene:scene_revision,
  components:components.map(({proposal,...c})=>c),operation_count:operations.length,target_ids:ids,validation,
  operations_commute:true,unrelated_contents_unchanged:true,architecture_unchanged:true,production_connected:false};
 return {proposal,snapshot,brief,composition};
}
if(process.argv[1]===new URL(import.meta.url).pathname){
 const candidate=compose();
 for(const [name,value] of Object.entries(candidate)){
  const file=dir+'/'+name+'.json';
  if(process.argv.includes('--write'))fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n');
  else assert.deepEqual(read('./'+name+'.json'),value,name+' differs from frozen composition.');
 }
 console.log(JSON.stringify(candidate.composition,null,2));
}
