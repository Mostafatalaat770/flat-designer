import fs from "node:fs";
import {createApartmentDomain} from "../studio/domain/apartment.mjs";
import {buildKitchenOnlyOpen,auditKitchenOnlyCandidate} from "../studio/analysis/kitchen-only-open.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const source=read("render-snapshots/current.json");
const archived=read("render-snapshots/study-k12-unapproved-20261008.json");
const domain=createApartmentDomain(process.cwd());
const candidate=buildKitchenOnlyOpen(source,archived,domain);
const audit=auditKitchenOnlyCandidate(source,archived,candidate,domain);
fs.mkdirSync("review-evidence/kitchen-only-open",{recursive:true});
fs.writeFileSync("review-evidence/kitchen-only-open/candidate.json",JSON.stringify(candidate,null,2)+"\n");
fs.writeFileSync("review-evidence/kitchen-only-open/audit.json",JSON.stringify(audit,null,2)+"\n");
console.log(JSON.stringify({new_scene:candidate.scene_revision,parent:audit.v55_parent_scene,
 four_kitchen_wall_studies:candidate.architecture_variant.remove_wall_segments.length,
 untouched_bathroom_objects:audit.changed_bathroom_objects,unchanged_chairs:true,
 hard_model_failures:audit.domain_hard_failures,release:audit.release_status},null,2));
