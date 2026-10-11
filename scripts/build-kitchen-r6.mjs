import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {R6_BASE,R6_DIR,R6_OPTIONS,createR6Candidate,verifyR6Candidate} from './kitchen-r6-experiments.mjs';
import {measureR6} from './kitchen-r6-measure.mjs';
import {sha256,SOURCE,SOURCE_SHA,CANDIDATE} from './kitchen-r4-candidate.mjs';
fs.mkdirSync(R6_DIR,{recursive:true});fs.mkdirSync('work/kitchen-r6',{recursive:true});
assert.equal(sha256(fs.readFileSync(SOURCE)),SOURCE_SHA);
for(const dir of ['design-development/kitchen-r5','design-development/kitchen-finish-r4']){
 const paths=execFileSync('git',['ls-tree','-r','--name-only',R6_BASE,dir],{encoding:'utf8'}).trim().split('\n');
 for(const file of paths)assert.equal(sha256(fs.readFileSync(file)),sha256(execFileSync('git',['show',R6_BASE+':'+file])),'Prior evidence drift: '+file);
}
const results={};
for(const id of R6_OPTIONS){const s=createR6Candidate(id);verifyR6Candidate(s,id);fs.writeFileSync(R6_DIR+'/'+id+'.json',JSON.stringify(s,null,2)+'\n');
 const m=await measureR6(s.layout,s.kitchen_r6_study);assert.deepEqual(m.original,m.after,'Existing mesh or architecture mutation');
 assert.deepEqual(m.overlay.source_geometry_before,m.overlay.source_geometry_after);
 if(results.L0)assert.deepEqual(m.original,results.L0.original);
 results[id]=m;
}
const base=results.L0,geometry=base.overlay.source_geometry_before;
const audit={schema:'KitchenR6GeometryDetailAudit/1',status:'PASS',base_commit:R6_BASE,original_ap0_sha256:SOURCE_SHA,r4_sha256:sha256(fs.readFileSync(CANDIDATE)),
 source_fingerprints:base.original,source_geometry:geometry,source_objects:base.objects,openings:base.openings,room:base.room,
 direct_light_ray_probes:Object.fromEntries(R6_OPTIONS.map(id=>[id,results[id].central_ray_probes])),
 measured_gaps:[
  {id:'BOTTOM',nominal_mm:70,derivation:'source panel bottom 930 minus actual counter worktop top 860',meaning:'Uncovered wall band, not a modeled open cavity. Panels are separated horizontally from counter rear by about 4.5–5 mm; watertight junction is absent.',acceptance:'HOLD: not acceptable as an unprotected wet/grease band; actual wall substrate, worktop/upstand and sealing need site survey.'},
  {id:'TOP',nominal_mm:30,derivation:'upper underside 1480 minus source panel top 1450',meaning:'Exposed wall band only where the panel and saved upper overlap along the wall. West-low cabinet overlaps the panel for only about 92 mm; source extents do not automatically form a complete L corner.',acceptance:'Finish continuity needed; not a structural void or a cabinet fabrication tolerance.'},
  {id:'ABOVE',nominal_mm:320,derivation:'fixed ceiling 2500 minus saved upper top 2180',meaning:'Open wall/head space, not omitted cabinetry.',acceptance:'Retain open. Cleanable wall finish and safe access to cabinet tops; no new cabinet, bulkhead, cornice or ceiling drop.'},
  {id:'HOOD',nominal_mm:70,derivation:'hood lower bound 1550 minus proposed general panel finish top 1480',meaning:'Additional exposed wall behind cooking zone; hob burner geometry begins around 874 and extends higher. 676 mm is the difference to the nominal hob reference, not a certified minimum from burner/pan/support top.',acceptance:'HOLD: gas/electric manufacturer clearance and extraction installation must confirm any actual hood/finish geometry.'}],
 detail_proposal:{id:'F1',status:'REVERSIBLE_FINISH_STUDY',source_panels_unchanged:true,proposal_meshes:results['L2-F1'].overlay.finishes,
  notes:['Nominal flush matching removable lower 70 mm and upper 30 mm finish skins use existing 5 mm panel depth/width; separate 70 mm cooking-zone skin reaches hood proxy underside. These are visual extents, not cut sizes.',
   'Prefer a continuous washable heat/moisture-compatible facing when site fabrication allows; removable strip rendering illustrates coverage and does not approve multiple dirt-trapping joints.',
   'Non-porous matte/satin light finish; flush closed edges, compatible flexible sealed worktop junction, no open capillary path. Adhesive, sealant, substrate waterproofing, expansion, thermal rating and tolerances supplied by installer/material maker.',
   'Corner and panel ends are not coincident; survey return and end exposures before cutting. Do not extend a panel through an opening, heat clearance, socket or ventilation path.',
   'Keep optics/profile accessible without removing cabinet or hood filter. No electrical components buried behind the proposed skins.']},
 options:Object.fromEntries(R6_OPTIONS.map(id=>[id,{spec:results[id].overlay.spec,fixtures:results[id].overlay.fixtures,finishes:results[id].overlay.finishes}])),
 owner_approved:false,construction_approved:false,cloud_saved:false,manufacturer_selected:false};
fs.writeFileSync(R6_DIR+'/GEOMETRY_DETAIL_AUDIT.json',JSON.stringify(audit,null,2)+'\n');
const source=createR6Candidate('L0').layout,rows=[];
const roles={
 'starter-20':['RENDERER_BASE_FRONTS','West cooking base; oven reservation only. No oven object, cavity or under-hob drawer proven.'],
 'starter-21':['WET_APPLIANCE','Sink/tap envelope; bowl, cutout, clips, trap and supply/waste TBD.'],
 'starter-22':['APPLIANCE_HOOD_PROXY','Gas hob and attached legacy hood envelope, no product selected.'],
 'starter-23':['APPLIANCE_FRONT','Integrated-colour refrigerator envelope; hinge, panel, ventilation and door opening HOLD.'],
 'K3-corner':['CONDITIONAL_STORAGE','Closed corner proxy; no proven access opening, corner hardware or usable capacity.'],
 'K3-dishwasher':['APPLIANCE_FRONT','Integrated dishwasher envelope, not a measured cavity; custom fascia/hinge/toe-kick HOLD.'],
 'K3-sink-base':['WET_SERVICE_BASE','Sink/waste/trap services. Generic drawer-looking top row is not usable drawer storage. Cleaning cupboard must separate chemicals from food and permit valve/trap access.'],
 'K3-end-landing':['RENDERER_BASE_FRONTS','Shallow refrigerator landing; storage and handle accessibility conditional.'],
 'K3-laundry-niche':['APPLIANCE_FRONT','Exposed washer; no hidden front/panel or added enclosure.'],
 'KIT-A1-upper-north':['EXPLICIT_SAVED_CABINET','1800 mm upper run; actual door count/hinges/shelves/clear openings HOLD.'],
 'KIT-A1-upper-west-low':['EXPLICIT_SAVED_CABINET','300 mm flanking upper; proposed single-door direction subject to hardware/hood heat clearance.'],
 'KIT-A1-upper-west-high':['EXPLICIT_SAVED_CABINET','450 mm flanking upper; proposed single-door direction subject to hardware/hood heat clearance.'],
 'KIT-fridge-end-panel':['EXPLICIT_FINISH_PANEL','18 mm side panel, not a storage cabinet or permission to restrict fridge ventilation.'],
 'KIT-A1-north-backsplash':['EXPLICIT_FINISH_PANEL','Source backsplash north; F1 separate finish proposal.'],
 'KIT-A1-west-backsplash':['EXPLICIT_FINISH_PANEL','Source backsplash west; F1 separate finish proposal.']};
for(const o of [...source.furniture,...source.interior.objects].filter(o=>o.room_id==='KIT-01')){
 const measured=base.objects.find(g=>g.id===o.id),interior=Object.hasOwn(o,'width_mm');
 const faces=measured.meshes.filter(m=>m.local_dimensions_mm[2]>=7&&m.local_dimensions_mm[2]<=31&&m.local_dimensions_mm[0]>80&&m.local_dimensions_mm[1]>50&&m.local_position[2]>0);
 const [category,intended_function]=roles[o.id]||['HOLD','Unclassified source item'];
 rows.push({source_id:o.id,category,original_width_mm:interior?o.width_mm:o.w,original_depth_mm:interior?o.depth_mm:o.d,original_height_mm:interior?o.height_mm:null,
  source_height_status:interior?'SAVED':'NOT_STORED; builder height is a proxy',mounting:interior?o.placement:{mode:'floor-envelope',cx:o.cx,cy:o.cy,rotation_deg:o.rot},rendered_bounds:measured.bounds,intended_function,
  visible_renderer_fronts:faces.map(f=>({...f,status:'DIAGNOSTIC_RENDERER_FACE_ID; not a saved door/cabinet ID or usable opening'})),
  visible_front_regions:o.type==='sideboard'?[{id:o.id+'::solid-front-region',width_mm:o.width_mm,height_mm:o.height_mm,door_count:null,status:'SOLID_BOX_WITH_2_SEAMS_2_HANDLES; no movable doors'}]:
    o.type==='fridge'?[{id:o.id+'::lower-region',width_mm:o.w,height_mm:655},{id:o.id+'::upper-region',width_mm:o.w,height_mm:1279}]:
    o.type==='dishwasher'?[{id:o.id+'::integrated-front-region',width_mm:o.w,height_mm:840,status:'ONE_SOLID_ENVELOPE; not panel fabrication size'}]:
    o.type==='washer'?[{id:o.id+'::machine-front',width_mm:o.w,height_mm:810,status:'EXPOSED_MACHINE_PROXY; circular door has no operation kinematics'}]:[],
  division_note:o.type==='sideboard'?'One solid box, two generic seams and two 55 mm handles; seams do not create actual doors.':o.type==='counter'?'Generic rows/handles; functions not inferred from face shape.':null,
  finish_direction:['starter-20','K3-corner','K3-sink-base','K3-dishwasher','KIT-A1-upper-north','KIT-A1-upper-west-low','KIT-A1-upper-west-high','starter-23','KIT-fridge-end-panel'].includes(o.id)?'Retain R4 ivory; easy-clean matte sample and edge sealing HOLD.':'Retain source finish; no concealment',approval:'HOLD'});
}
const schedule={schema:'KitchenR6FrontSchedule/1',status:'SOURCE_INVENTORY_COMPLETE_EXECUTION_HOLD',rows,
  handle_direction:'Conservative proposal: one satin closed-ended pull family for cabinetry; rounded accessible ends, minimal recess dirt traps, position templates and screw fixing checked on real fronts. Keep appliance/door hardware maker-compatible. No handle relocation or source front change performed.',
  front_direction:'R4 ivory washable matte sample; stain/heat/moisture test and sealed edges required. D1 greige doors remain visual lead. Do not infer openings from countertop segments 307/600/593 mm or generic rendered seams.',
  conditional_concepts:[{id:'CONCEPT-UNDER-HOB-DRAWERS',status:'HOLD',reason:'No oven/cutout/heat shield/cavity confirmed.'},{id:'CONCEPT-CORNER-HARDWARE',status:'HOLD',reason:'No door clear aperture, carcass partitions or hardware sweep confirmed.'},{id:'CONCEPT-WASHER-CONCEALMENT',status:'HOLD',reason:'No ventilation, hinge, hose depth, service path or operating clearances proven; not rendered.'}],
  owner_approved:false,construction_approved:false};
fs.writeFileSync(R6_DIR+'/FRONT_SCHEDULE.json',JSON.stringify(schedule,null,2)+'\n');
const csv=['source_id,category,source_width_mm,source_depth_mm,source_height_mm,status',...rows.map(r=>[r.source_id,r.category,r.original_width_mm,r.original_depth_mm,r.original_height_mm??'NOT_STORED','HOLD'].join(','))].join('\n')+'\n';fs.writeFileSync(R6_DIR+'/FRONT_SCHEDULE.csv',csv);
console.log('R6 source/detail audit PASS: 5 source-locked studies; all source mesh fingerprints, architecture, doors and footprints unchanged; 15 kitchen source IDs inventoried.');
