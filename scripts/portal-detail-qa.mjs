import fs from "node:fs";
import {createApartmentDomain} from "../studio/domain/apartment.mjs";
import {portalDetail,portalDetailSvg} from "../studio/analysis/portal-detail.mjs";
const domain=createApartmentDomain(process.cwd());
const source=JSON.parse(fs.readFileSync("render-snapshots/current.json","utf8"));
const result=portalDetail(domain,source);
fs.mkdirSync("review-evidence/semi-open-portal",{recursive:true});
fs.writeFileSync("review-evidence/semi-open-portal/portal-detail.json",JSON.stringify(result,null,2)+"\n");
fs.writeFileSync("review-evidence/semi-open-portal/portal-detail.svg",portalDetailSvg(result)+"\n");
console.log(JSON.stringify({opening:result.geometry.proposed_portal_nominal_mm,
existing:result.geometry.original_hinged_opening_nominal_mm,
pocketShortfall:result.geometry.door_panel_full_width_pocket_side_shortfall_mm,
preferred:result.proposed_design.preferred,approval:result.release},null,2));
