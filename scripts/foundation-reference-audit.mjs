/**
 * Reference integration proof for the new reusable spatial/evidence engine.
 *
 * K12 wet kitchen (and reversible +150mm experiment) plus two WIC wardrobe
 * opening scenarios are derived from actual canonical/snapshot objects. No
 * scene mutations leave this program; no Studio or construction approval.
 *
 * npm run build && node scripts/foundation-reference-audit.mjs
 */
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createApartmentDomain} from '../studio/domain/apartment.mjs';
import {rectangle,polygonGap,hingeLeaf,relation} from '../studio/analysis/geometry.mjs';
import {dimension,difference,compareOptions} from '../studio/analysis/evidence.mjs';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const domain=createApartmentDomain(process.cwd());
const snapshot=read('design-development/k12/snapshot.json');
const audit=read('design-development/k12/function-audit.json');
assert.equal(snapshot.canonical_sha256,domain.model.canonical_sha256);
assert.equal(snapshot.scene_revision,domain.revision(snapshot.layout));
assert.equal(audit.scene_revision,snapshot.scene_revision);
assert.equal(snapshot.architecture_variant.render_only,true,'The K12 open-plan alteration MUST remain unapproved');
const object=(layout,id)=>{const obj=layout.furniture.find(x=>x.id===id);assert.ok(obj,id);return obj;};
const domainFail=layout=>{
 let val;try{val=domain.validate(layout);}catch(e){if(e.validation)val=JSON.parse(JSON.stringify(e.validation));else throw e;}
 return val.checks.filter(x=>x.status==='FAIL').map(x=>[x.kind,x.object_id??null,x.source_wall_index??null]);
};
const failures=domainFail(snapshot.layout);assert.equal(failures.length,2,'Disclose inherited construction blockers');
const kitchen=[];
const tall=rectangle(object(snapshot.layout,'E2-oven-column'));
const cook=rectangle(object(snapshot.layout,'E2-cooking-base'));
const chair=rectangle(object(snapshot.layout,'starter-32'));
const dining=rectangle(object(snapshot.layout,'starter-35'));
const door=dimension({value_mm:650,uncertainty_mm:50,source:'illustrative_proxy',
 reference:'K12 function-audit nominal dishwasher open projection; 50mm is ASSUMED sensitivity, not real SKU tolerance'});
for(const shift of [0,150,200]){
 const scene=structuredClone(snapshot);
 const island=object(scene.layout,'E2-island'),sink=object(scene.layout,'E2-island-sink');
 const origSink=object(snapshot.layout,'E2-island-sink');
 island.cy-=shift;sink.cy-=shift;
 if(shift){island.name='Foundation experimental island shift '+shift;sink.name='Foundation experimental sink shift '+shift;}
 assert.equal(island.w,1700);assert.equal(island.d,1000);
 assert.equal(sink.cy-island.cy,origSink.cy-object(snapshot.layout,'E2-island').cy);
 assert.deepEqual(domainFail(scene.layout),failures,'Never conceal/create canonical architecture failures');
 const islandPolygon=rectangle(island);
 const tallToIsland=polygonGap(islandPolygon,tall);
 const west=polygonGap(islandPolygon,cook);
 const westProjected=Math.min(...islandPolygon.map(p=>p[0]))-Math.max(...cook.map(p=>p[0]));
 const diningToIsland=polygonGap(islandPolygon,dining);
 const livingToIsland=polygonGap(islandPolygon,chair);
 // This is a sensitivity analysis only: +/-50mm is not from on-site survey.
 const tallDimension=dimension({value_mm:tallToIsland,uncertainty_mm:50,source:'image_calibrated',
  reference:'Type B v0.2.2 K12 plan geometry (illustrative +/-50mm sensitivity, not a measured error bound)'});
 const dwFree=difference(tallDimension,door);
 kitchen.push({id:'island_'+shift,shift_mm:shift,
  nominal_closed_tall_mm:+tallToIsland.toFixed(1),
  nominal_open_dw_mm:+dwFree.nominal_mm.toFixed(1),
  sensitivity_open_dw_range_mm:[+dwFree.low_mm.toFixed(1),+dwFree.high_mm.toFixed(1)],
  west_cook_projected_mm:+westProjected.toFixed(1),west_cook_actual_polygon_gap_mm:+west.toFixed(1),island_to_dining_mm:+diningToIsland.toFixed(1),
  island_to_lounge_mm:+livingToIsland.toFixed(1),
  horizontal_spotlight:'Full stage simulation for pulled-out dining chairs is NOT present. This is a closed-footprint-only geometry comparison.'});
}
assert.deepEqual(kitchen.map(x=>x.nominal_open_dw_mm),[570,720,770]);
assert.deepEqual(kitchen.map(x=>x.west_cook_projected_mm),[1219,1219,1219]);
assert.ok(kitchen.every(x=>x.west_cook_actual_polygon_gap_mm>=x.west_cook_projected_mm-0.01),
 'A 2D nearest-corner Euclidean distance cannot be smaller than its horizontal projection');
const objectiveModels=kitchen.map(k=>({
 id:k.id,gates:{architecture:'unknown',plumbing:k.shift_mm===0?'unknown':'unknown',
  site_measurements:'unknown'},
 metrics:{dishwasher_open_clear:{value_mm:k.nominal_open_dw_mm,uncertainty_mm:100},
  living_clear:{value_mm:k.island_to_lounge_mm,uncertainty_mm:50}}
}));
const comparison=compareOptions({candidates:objectiveModels,
 objectives:[{key:'dishwasher_open_clear',goal:'maximize'},{key:'living_clear',goal:'maximize'}],
 requiredGates:['architecture','plumbing','site_measurements']});
assert.ok(comparison.candidates.every(x=>x.status==='PROVISIONAL_PARETO'));
const north=object(snapshot.layout,'starter-4'),south=object(snapshot.layout,'starter-5');
const np=rectangle(north),sp=rectangle(south);
const northFront=Math.max(...np.map(p=>p[1])),southFront=Math.min(...sp.map(p=>p[1]));
const hingeX=Math.min(...np.map(p=>p[0]));
const closedGap=southFront-northFront;
assert.equal(closedGap,1335);
const dressing=[625,312.5].map(leaf=>{
 const a=hingeLeaf({hinge:[hingeX,northFront],length_mm:leaf,angle_deg:90});
 const b=hingeLeaf({hinge:[hingeX,southFront],length_mm:leaf,angle_deg:-90});
 return {leaf_length_mm:leaf,nominal_tip_gap_mm:+polygonGap(a,b).toFixed(1),
  bounded_test:'Perfect 90° abstract opposite leaves, not product kinematics, human occupancy or a walkable route',
  doors_relation:relation(a,b)};
});
assert.deepEqual(dressing.map(x=>x.nominal_tip_gap_mm),[85,710]);
const report={schema:'ApartmentSpatialFoundationReference/1',date:'2026-10-08',
 canonical_sha256:snapshot.canonical_sha256,scene_revision:snapshot.scene_revision,
 version_status:'EXPLORATORY / engineering and site data NOT verified',
 engine_capabilities:['rotated furniture footprints','polygon clearance/overlap','hinged leaf geometry','conservative staged circle-agent route sampler','bounded measurement provenance','unweighted Pareto multi-objective review'],
 kitchen,comparison,dressing,
 hard_construction_blockers:{inherited_canonical_failures:failures,
  missing:['structural/developer approval of render-only kitchen opening','real appliance/door product geometry',
    'plumbing/drain fall','on-site plastered finished dimensions','true human/chair occupied movement']},
 conclusion:'Nominal gain from moving island 150mm is robust in the parametric geometry but absolute service gap/site comfort and buildability are NOT established. Original K12 and A7 remain conditional tradeoffs, not a winner. Dress 625mm opposing wings remain an access risk under the shown hinge assumptions.'};
fs.mkdirSync('review-evidence/foundation',{recursive:true});
fs.writeFileSync('review-evidence/foundation/reference-audit.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({schema:report.schema,source:report.scene_revision,
 kitchen,wardrobe_tip_gaps:dressing.map(x=>x.nominal_tip_gap_mm),
 option_outcomes:comparison.candidates.map(x=>({id:x.id,status:x.status,unknown_gates:x.unknown_gates})),
 canonical_hard_failures:failures.length},null,2));
