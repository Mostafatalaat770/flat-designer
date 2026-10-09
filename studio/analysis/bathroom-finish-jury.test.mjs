import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {createApartmentDomain} from "../domain/apartment.mjs";
import {makeBathroomFinishStudy,finishPaletteSvg} from "./bathroom-finish-jury.mjs";
const current=JSON.parse(fs.readFileSync("render-snapshots/current.json","utf8"));
const domain=createApartmentDomain(process.cwd());
const {a,b,audit}=makeBathroomFinishStudy(current,domain);
test("camera-controlled honest finish comparison from CURRENT v55 scene",()=>{
 assert.equal(a.scene_revision,"scene-9cf45a73");
 assert.notEqual(b.scene_revision,a.scene_revision);
 assert.deepEqual(a.views,b.views);
 assert.equal(a.views.length,3);
 assert.deepEqual(a.layout,current.layout);
 assert.equal(audit.cloud_saved_scene,"scene-4821689");
});
test("all fixtures, wet dimensions, ceiling, wall architecture and bathroom openings are unchanged",()=>{
 assert.deepEqual(a.layout.rooms,b.layout.rooms);
 assert.deepEqual(a.layout.demolished,[]);
 assert.deepEqual(a.layout.studio,b.layout.studio);
 assert.equal(audit.changed_wet_service_locations,0);
 assert.equal(audit.changed_openings,0);
 assert.deepEqual(audit.bathroom_dimensions.master.wet_footprint_mm,[1450,800]);
 assert.deepEqual(audit.bathroom_dimensions.family.wet_footprint_mm,[900,900]);
 assert.equal(audit.bathroom_dimensions.master.model_door_nominal_mm,677.9);
 assert.equal(audit.bathroom_dimensions.family.model_door_nominal_mm,656.7);
});
test("only allowed bathroom finishes change; all six chairs and remaining home are identical",()=>{
 const stripColor=scene=>scene.layout.furniture.map(f=>({...f,color:undefined}));
 assert.deepEqual(stripColor(a),stripColor(b));
 assert.deepEqual(a.layout.furniture.filter(f=>!["BATH-M01","BATH-C01","WC-01"].includes(f.room_id)),b.layout.furniture.filter(f=>!["BATH-M01","BATH-C01","WC-01"].includes(f.room_id)));
 assert.deepEqual(a.layout.interior.objects.map(o=>({...o,colour:undefined})),b.layout.interior.objects.map(o=>({...o,colour:undefined})));
 const surfaces=Object.keys(a.layout.interior.surface_materials);
 for(const id of surfaces.filter(id=>!/^(FLOOR|WALL)-(BATH-M01|BATH-C01|WC-01)/.test(id)))
  assert.equal(a.layout.interior.surface_materials[id],b.layout.interior.surface_materials[id]);
 assert.equal(b.layout.furniture.filter(f=>f.room_id==="RECP-01"&&f.type==="chair"&&/dining/i.test(f.name)).length,6);
 assert.deepEqual(domain.validate(b.layout).checks.filter(x=>x.status==="FAIL"),[]);
});
test("constructability holds remain explicit even if the new finishes look better",()=>{
 assert.equal(audit.status,"FINISH_ONLY_STUDY_NOT_FOR_EXECUTION");
 assert.equal(audit.known_holds.length,7);
 for(const id of ["MASTER-800","FAMILY-DOOR","FAMILY-TRAY","MASTER-WATER","GUEST-SINK","MATERIALS"])
  assert.ok(audit.known_holds.some(x=>x.id===id&&x.status==="HOLD"));
 assert.equal(audit.design_direction.preferred_prior_to_real_images.startsWith("NO_SELECTION"),true);
});
test("material board is identifiable, no fake supplier SKU, no visual signoff",()=>{
 const svg=finishPaletteSvg(audit);
 assert.match(svg,/B3 Refined Warm Stone/);
 assert.match(svg,/Luxury by consistency/);
 assert.match(svg,/No suppliers, wet-slip test/);
 assert.ok(svg.startsWith("<?xml"));
});
