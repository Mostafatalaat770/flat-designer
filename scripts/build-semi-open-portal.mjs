import fs from "node:fs";
import assert from "node:assert/strict";
import {createApartmentDomain} from "../studio/domain/apartment.mjs";
import {buildSemiOpenPortalStudy} from "../studio/analysis/semi-open-portal.mjs";
const source=JSON.parse(fs.readFileSync("render-snapshots/current.json","utf8"));
const registry=JSON.parse(fs.readFileSync("design-development/decision-registry.json","utf8"));
assert.equal(source.scene_revision,registry.working_source.scene_revision);
const result=buildSemiOpenPortalStudy(source,createApartmentDomain(process.cwd()));
const folder="review-evidence/semi-open-portal";
fs.mkdirSync(folder,{recursive:true});
for(const key of ["closed","portal"]){
 fs.writeFileSync(folder+"/"+key+".json",JSON.stringify(result[key],null,2)+"\n");
}
fs.writeFileSync(folder+"/audit.json",JSON.stringify(result.audit,null,2)+"\n");
console.log(JSON.stringify({schema:result.audit.schema,identical_layout:true,
 changes:result.audit.changes,structural_approval:false,render_views:result.portal.views.map(v=>v.id)},null,2));
