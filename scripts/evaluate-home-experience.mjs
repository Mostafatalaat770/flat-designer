/**
 * A reusable idea-lab CLI that does NOT create a new apartment scene by guessing.
 * Exact Type B rooms, frozen parent snapshot, explicit proposals and no purchases.
 *
 * npm run build && node scripts/evaluate-home-experience.mjs \
 *   design-development/advisor/cases/typeb-home-experience.json
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
import {rectangle,polygonGap} from '../studio/analysis/geometry.mjs';
import {requiredCleanAirCadR,assessCleanAirProduct,assessExperiencePlacement,auditLightingIntent}
 from '../studio/analysis/experience.mjs';

const root=process.cwd();
const insideRepo=p=>{
 assert.ok(typeof p==='string'&&p.endsWith('.json'),'Only known repo JSON inputs');
 const out=path.resolve(root,p);
 assert.ok(out.startsWith(root+path.sep),'Refuse external input path');
 return out;
};
const file=process.argv[2];
assert.ok(file,'Usage: node scripts/evaluate-home-experience.mjs <case.json>');
const data=JSON.parse(fs.readFileSync(insideRepo(file),'utf8'));
assert.equal(data.schema,'ApartmentExperienceBrief/1');
assert.equal(data.source_status,'EXPLORATORY_K12_KITCHEN_ARCHITECTURE_NOT_APPROVED');
const domain=createApartmentDomain(root);
const scene=JSON.parse(fs.readFileSync(insideRepo(data.snapshot),'utf8'));
assert.equal(scene.canonical_sha256,data.canonical_sha256);
assert.equal(data.canonical_sha256,domain.model.canonical_sha256);
assert.equal(scene.scene_revision,domain.revision(scene.layout));
assert.equal(data.clear_height_mm,2500);
function validation(layout){
 try{return domain.validate(layout);}
 catch(e){if(e.validation)return JSON.parse(JSON.stringify(e.validation));throw e;}
}
const canonical=validation(scene.layout);
const fails=canonical.checks.filter(x=>x.status==='FAIL').map(x=>({
 kind:x.kind,object_id:x.object_id??null,source_wall_index:x.source_wall_index??null}));
assert.equal(fails.length,2,'Historical K12 architecture failures may not be waived');
const roomFor=id=>{
 const r=domain.model.rooms.find(x=>x.id===id);
 assert.ok(r,'Invalid canonical room '+id);return r;
};
const clearance=assess=>{
 const rating=assess.meets_assumed_4_8_reference?'AT_OR_ABOVE_ASSUMED_REFERENCE':'BELOW_ASSUMED_REFERENCE';
 return {category:'clean_air',...assess,rating};
};
const clean=data.clean_air.map(x=>{
 const r=roomFor(x.room_id);
 const volume=requiredCleanAirCadR({area_m2:r.area_estimate_m2,clear_height_m:data.clear_height_mm/1000,
  clean_air_changes_per_hour:x.design_eACH});
 const sample=assessCleanAirProduct({room_area_m2:r.area_estimate_m2,clear_height_m:data.clear_height_mm/1000,
  cadr_m3h:x.hypothetical_cadr_m3h,assumed_turbo:true});
 return {id:x.id,room_id:r.id,area_m2:+r.area_estimate_m2.toFixed(2),
  source_area:'source model image-calibrated Type B polygon (NOT installed plaster measurement)',
  reference:volume,sample:clearance(sample),note:x.note};
});
const placement=data.proposals.map(p=>{
 const r=roomFor(p.room_id);
 const furniture=scene.layout.furniture.filter(x=>x.room_id===r.id);
 const interior=scene.layout.interior.objects.filter(x=>x.room_id===r.id);
 const measured=assessExperiencePlacement({room:r,proposal:p,furniture,interior});
 const vicinity={};
 if(p.id==='air-fryer-west-cooking-counter'){
  const hob=furniture.find(x=>x.id==='E2-hob');
  assert.ok(hob,'Missing exact K12 gas hob');
  const item={cx:p.position.cx,cy:p.position.cy,w:p.position.width_mm,d:p.position.depth_mm,rot:p.position.rot||0};
  vicinity.hob_body_gap_mm=+polygonGap(rectangle(item),rectangle(hob)).toFixed(1);
  vicinity.kitchen_hood_exhaust_route='NOT_ENGINEERED';
  vicinity.actual_basket_drawer_open_envelope='UNVERIFIED';
  vicinity.note='Distance to nominal hob solid is not a safe hot-surface clearance. Manual and cooking workflow dominate.';
 }
 return {...measured,vicinity,priority:p.category==='countertop-appliance'?'TEST_DAILY_WORKFLOW_BEFORE_PERMANENT_PARKING'
   :'RESERVE_FLEXIBLE_FLOOR_AND_POWER_OPTION_FIRST',intent:p.intent};
});
const lighting=auditLightingIntent({zones:data.lighting_zones,clear_height_mm:data.clear_height_mm});
const kinds=new Set(data.proposals.map(p=>p.id));
assert.equal(kinds.size,data.proposals.length);
assert.ok(clean.some(x=>x.room_id==='MBR-01'));
assert.ok(lighting.room_layer_coverage.some(x=>x.room_id==='MBR-01'&&x.includes_low_level_night));
const report={
 schema:'ApartmentHomeExperienceEvaluation/1',
 source:{canonical_sha256:scene.canonical_sha256,scene_revision:scene.scene_revision,
  source_case:path.relative(root,insideRepo(file)),source_status:data.source_status,
  room_height_mm:data.clear_height_mm},
 creativity_brief:'Owner/family-first functional addition lab: benefits, hidden work, clutter, power, noise, safety, ongoing costs and reversible utility. No image-first shopping.',
 clean_air:clean,placement,lighting,selection_matrix:data.selection_matrix,
 readme_summary:[
  'Explore portable air purifier with quiet-night fan CADR and filter spares, but prioritize ventilation/source control, avoid built-in cabinet integrations.',
  'Keep air fryer portable: evaluate worktop landing, steam/heat/hob proximity, clear pullout and circuit before a dedicated niche or appliance-garage.',
  'Reserve layered light circuits/positions now, select fixtures later against measured 2500mm clear height and actual RCP.',
  'Treat purifier and air-fryer nominal locations as test geometry, not purchase/installation drawings.'
 ],
 blockers:{
  canonical_hard_failures:fails,
  site_survey:'TBD',
  structural_kitchen_opening:'NOT_APPROVED',
  exact_product_manuals:'TBD',
  electrical_first_fix:'ELECTRICIAN_REQUIRED',
  ac_exhaust_waterproofing:'MEP_REQUIRED',
  performance_at_quiet_operating_mode:'TBD'
 },
 status:'EXPLORATORY_OPTIONS_ONLY',
 unknowns:data.prerequisites,
 no_auto_purchase_or_geometry_mutation:true};
fs.mkdirSync('review-evidence/experience',{recursive:true});
fs.writeFileSync('review-evidence/experience/idea-lab-evaluation.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({
 source:report.source,clean_air:clean.map(x=>({room:x.room_id,reference_cadr_m3h:x.reference.theoretical_cadr_m3h,
  simulated_cadr_m3h:x.sample.product_cadr_m3h,eACH:x.sample.equivalent_clean_air_changes_h,
  status:x.sample.rating})),
 positions:placement.map(x=>({id:x.id,body_fits:x.body_fits_nominal_support_or_room,status:x.status,
  warnings:x.physical_warnings.length,required_verification:x.required_verification.length,vicinity:x.vicinity})),
 lights:{zones:lighting.zones.length,room_coverage:lighting.room_layer_coverage},
 canonical_errors_unwaived:fails.length,status:report.status
},null,2));
