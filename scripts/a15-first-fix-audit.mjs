/**
 * Read-only Type B MEP first-fix coordination pack. Not construction drawings.
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
import {validateFirstFix} from '../studio/analysis/first-fix.mjs';
const load=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const domain=createApartmentDomain(process.cwd());
const brief=load('design-development/advisor/cases/typeb-wholehome-firstfix.json');
const scene=load(brief.source_scene);
assert.equal(brief.canonical_sha256,domain.model.canonical_sha256);
assert.equal(scene.canonical_sha256,domain.model.canonical_sha256);
assert.equal(scene.scene_revision,domain.revision(scene.layout));
const audit=validateFirstFix({brief,model:domain.model,scene});
assert.equal(audit.validation.passed,true,JSON.stringify(audit.validation.errors,null,2));
assert.equal(audit.source.original_rooms,13);
assert.equal(audit.source.locked_finished_ceiling_mm,2500);
let validation;try{validation=domain.validate(scene.layout)}catch(e){
 if(e.validation)validation=JSON.parse(JSON.stringify(e.validation));else throw e;
}
const inherited=validation.checks.filter(x=>x.status==='FAIL')
 .map(x=>({kind:x.kind,object_id:x.object_id??null,source_wall_index:x.source_wall_index??null}));
assert.equal(inherited.length,2,'Keep unresolved K12 architecture failures visible');
const result={
 ...audit,
 source_unchanged_after_validation:scene.scene_revision===domain.revision(scene.layout),
 inherited_k12_architecture_failures:inherited,
 engineering_status:'NOT_APPROVED',
 workstreams:[
  {order:1,id:'site',task:'Finished wall/ceiling/door and electrical-panel as-built survey',responsible:'licensed local architect/electrician'},
  {order:2,id:'selections',task:'Bed/carpentry/appliance/hob/lighting final model and loads',responsible:'owner, designer and manufacturer'},
  {order:3,id:'hvac',task:'Room heat-load analysis, indoor unit location, outdoor condenser developer approval, condensate fall and noise',responsible:'HVAC engineer'},
  {order:4,id:'electrical',task:'Switch zones, luminaire photometry, RCD/earthing, panel circuit/load/wiring and bathroom wet protection',responsible:'qualified Egypt electrical engineer'},
  {order:5,id:'coordinated_rcp',task:'MEP overlay, 2500mm finished-height conflict review and verified tender/installation plans',responsible:'architect plus trades'}
 ],
 governance:{allow_installation:false,allow_demolition:false,allow_master_merge:false,
  allow_saved_studio_mutation:false,allow_aircon_tonnage_inference:false,
  allow_exact_socket_xy_inference:false,allow_circuit_rating_inference:false}
};
fs.mkdirSync('review-evidence/advisor-a15',{recursive:true});
fs.writeFileSync('review-evidence/advisor-a15/first-fix-source-audit.json',JSON.stringify(result,null,2)+'\n');
const lines=[
 '# Type B · Electrical, lighting and HVAC first-fix coordination',
 '',
 '**EXPLORATORY REQUIREMENTS — NOT an electrical installation, ceiling RCP or HVAC design.**',
 '',
 'Canonical Type B v0.2.2 SHA: '+brief.canonical_sha256+'. Frozen K12 scene: '+scene.scene_revision+'.',
 '**2500mm finished clear ceiling preserved. Original K12 structural FAIL count: 2, NOT approved.**',
 '',
 '## Room-by-room functional register',
 '| Room | Model area m² | Needed functional categories | Conceptual needs |',
 '|---|---:|---|---:|',
 ...Object.entries(audit.rooms).map(([id,r])=>'| '+id+' | '+r.area_m2+' | '+r.needs.join(', ')+' | '+r.intent_count+' |'),
 '',
 '## Order of engineering coordination',
 ...result.workstreams.map(x=>x.order+'. **'+x.id+'**: '+x.task+' — '+x.responsible+'.'),
 '',
 '## Site/engineering gates',
 ...Object.entries(brief.approvals).map(([k,v])=>'- '+k+': '+v),
 '',
 '## What the next team must NOT infer',
 '- No exact fixture count, lumens, circuit breakers, phase allocations, cable sizes, 2D outlet coordinates, AC tonnage or selected condenser location are approved.',
 '- Control groups are desired independently controllable **scenes**, not guaranteed separate electrician circuits.',
 '- Enclosed apartment wet rooms and terraces require local safety/IP protection, qualified electrician design and real service access.',
 '- Smart controls/scene systems must offer reliable local/manual fallback and serviceable replaceable components.',
 '- Air conditioner heat-load, full-height glazing load, draft and condensate drainage routes require actual HVAC engineering and developer signoff.',
 '- Preserve 2500mm finished clear height; do not lower ceiling or hide drivers to make a render prettier.',
 '- K12 kitchen open partition and moving wet island are still unapproved architecture/MEP conceptual changes.',
 '',
 'Machine-readable source register: design-development/advisor/cases/typeb-wholehome-firstfix.json',
 'Machine-readable audit: review-evidence/advisor-a15/first-fix-source-audit.json',
 ''
];
fs.writeFileSync('review-evidence/advisor-a15/FIRST_FIX_REQUIREMENTS.md',lines.join('\n'));
console.log(JSON.stringify({source:result.source,pass:result.validation.passed,
 rooms:result.summary.room_count,items:result.summary.service_intents,
 kinds:result.summary.kinds,lighting_scenes:Object.keys(result.summary.conceptual_light_groups).length,
 inherited_structural_failures:inherited.length,engineering_status:result.engineering_status},null,2));
