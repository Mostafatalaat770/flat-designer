import fs from "node:fs";
import {createApartmentDomain} from "../studio/domain/apartment.mjs";
import {makeP1SiteSurvey,p1SiteSvg} from "../studio/analysis/p1-site-feasibility.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const d=makeP1SiteSurvey(createApartmentDomain(process.cwd()),read("render-snapshots/current.json"),read("design-development/decision-registry.json"));
const dir="review-evidence/p1-site";fs.mkdirSync(dir,{recursive:true});
fs.writeFileSync(dir+"/field-audit.json",JSON.stringify(d,null,2)+"\n");
fs.writeFileSync(dir+"/functional-section.svg",p1SiteSvg(d)+"\n");
console.log(JSON.stringify({source:d.sources,dimensions:d.geometry,chair_states:d.activity.dining_states.map(x=>({pullback:x.chair_pullback_mm,portalYChairs:x.chairs_with_y_overlap_of_portal.length})),rfi_count:d.questions.length,release:d.release_status},null,2));
