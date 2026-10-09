import fs from 'node:fs';
import {domain} from '../circulation-v55/route-library.mjs';
const dir=import.meta.dirname,r=JSON.parse(fs.readFileSync(dir+'/results.json'));
for(const c of r.candidates){
 const folder=dir+'/candidates/'+c.id;fs.mkdirSync(folder,{recursive:true});
 const snapshot={schema:'ApartmentGitHubRenderSnapshot/1',name:'Dining operation comparison — '+c.id,
  canonical_sha256:r.canonical_sha256,scene_revision:c.scene_revision,storage_revision:null,
  source_scene_revision:r.source_scene,saved_source_scene_revision:r.saved_cloud_scene,
  source_storage_revision:55,production_connected:false,layout:c.layout};
 const brief=domain.designBrief(c.layout);brief.review_provenance={source_scene:r.source_scene,source_storage_revision:55,production_connected:false};
 for(const [file,value] of Object.entries({'proposal.json':c.proposal,'snapshot.json':snapshot,'brief.json':brief}))
  fs.writeFileSync(folder+'/'+file,JSON.stringify(value,null,2)+'\n');
}
console.log('Preserved both local candidate proposals, snapshots and design briefs.');
