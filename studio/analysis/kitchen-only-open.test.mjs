import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {createApartmentDomain} from "../domain/apartment.mjs";
import {buildKitchenOnlyOpen,auditKitchenOnlyCandidate} from "./kitchen-only-open.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const current=read("render-snapshots/current.json");
const old=read("render-snapshots/study-k12-unapproved-20261008.json");
const domain=createApartmentDomain(process.cwd());
const out=buildKitchenOnlyOpen(current,old,domain);
const audit=auditKitchenOnlyCandidate(current,old,out,domain);
test("exact cloud-v55-derived canonical current is preserved; study is a DIFFERENT revision",()=>{
 assert.equal(out.canonical_sha256,domain.model.canonical_sha256);
 assert.equal(out.source_scene_revision,current.scene_revision);
 assert.notEqual(out.scene_revision,current.scene_revision);
 assert.equal(audit.release_status,"NOT_READY_FOR_CONSTRUCTION_OR_CLOUD");
});
test("open kitchen only, four related walls and no bathroom opening hidden",()=>{
 assert.equal(out.architecture_variant.remove_wall_segments.length,4);
 assert.deepEqual(out.architecture_variant.hide_openings,["OP-RECP-KIT"]);
 assert.ok(out.architecture_variant.remove_wall_segments.every(s=>s.from[0]>=8900&&s.to[0]>=8900));
 assert.deepEqual(out.architecture_variant.add_wall_segments,[]);
 assert.deepEqual(out.architecture_variant.add_wall_boxes,[]);
 assert.equal(out.architecture_variant.render_only,true);
 assert.deepEqual(out.layout.demolished,[]);
});
test("no v55 bathroom, bedroom, terrace, six-chair dining or living furniture is modified",()=>{
 const original=current.layout.furniture.filter(x=>x.room_id!=="KIT-01");
 const comparison=out.layout.furniture.filter(x=>x.room_id!=="KIT-01"&&!["E2-island","E2-island-sink"].includes(x.id));
 assert.deepEqual(comparison,original);
 assert.deepEqual(out.layout.interior.objects.filter(x=>x.room_id!=="KIT-01"),
 current.layout.interior.objects.filter(x=>x.room_id!=="KIT-01"));
 const get=(scene,id)=>scene.layout.furniture.find(x=>x.id===id);
 assert.deepEqual(get(out,"starter-35"),get(current,"starter-35"));
 assert.equal(out.layout.furniture.filter(x=>x.room_id==="RECP-01"&&x.type==="chair"&&/dining/i.test(x.name)).length,6);
});
test("candidate is clearly advisory and uses actual K12 workstation source, not silently approved",()=>{
 assert.equal(out.layout.furniture.filter(f=>f.id==="E2-island").length,1);
 assert.equal(out.layout.furniture.filter(f=>f.id==="E2-island-sink").length,1);
 assert.equal(out.layout.furniture.filter(f=>f.room_id==="KIT-01"&&f.type==="washer").length,0);
 assert.equal(audit.changed_bathroom_walls,0);
 assert.equal(audit.changed_non_kitchen_v55_furniture,0);
 assert.ok(audit.blocking.length>=4);
 assert.equal(audit.status,"EXPLORATORY_MODEL_WITH_UNRESOLVED_CONSTRUCTION_GATES");
});
