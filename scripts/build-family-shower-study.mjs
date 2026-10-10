import fs from "node:fs";
import {createApartmentDomain} from "../studio/domain/apartment.mjs";
import {makeFamilyShowerOption} from "../studio/analysis/family-shower-option.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const o=makeFamilyShowerOption(read("render-snapshots/current.json"),createApartmentDomain(process.cwd()));
const base="review-evidence/family-shower";fs.mkdirSync(base,{recursive:true});
for(const [name,scene] of [["A-existing",o.a],["B-frameless",o.b]]){
 fs.writeFileSync(base+"/"+name+".json",JSON.stringify(scene,null,2)+"\n");
}
fs.writeFileSync(base+"/audit.json",JSON.stringify(o.audit,null,2)+"\n");
console.log(JSON.stringify({shots:o.a.views.map(x=>x.id),family_shower:o.audit.family_shower_model_footprint_mm,visual:o.audit.visual_geometry_only,status:o.audit.status},null,2));
