import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createApartmentDomain, LOCKED_CANONICAL } from "../studio/domain/apartment.mjs";

// Verify saved Studio v53 as a pinned *study*: only the shower render variant
// differs from live. Every room, wall, opening and other fixture stays locked.
const root = process.cwd();
const sourceFile = "render-snapshots/bathroom-a2-walkin-v55.json";
const study = JSON.parse(fs.readFileSync(sourceFile, "utf8"));
const frozen = JSON.parse(fs.readFileSync("render-snapshots/current.json", "utf8"));
const domain = createApartmentDomain(root);
assert.equal(study.schema, "ApartmentGitHubRenderSnapshot/1");
assert.equal(study.canonical_sha256, LOCKED_CANONICAL);
assert.equal(study.canonical_sha256, frozen.canonical_sha256);
assert.equal(study.source_scene_revision, "scene-4821689");
assert.equal(study.storage_revision, 55);
assert.equal(study.scene_revision, domain.revision(study.layout), "Scene hash must be deterministic and exact");
assert.deepEqual(study.layout.demolished, frozen.layout.demolished, "Never change architectural demolition state");
assert.equal(study.layout.modelVersion, frozen.layout.modelVersion);
assert.ok(domain.validate(study.layout).valid, "Candidate must have no hard geometry failures");
assert.equal(study.layout.furniture.filter(x => x.id==="BATHM-WALKIN-A1"&&x.type==="shower"&&x.variant==="walk-in").length, 1);
assert.equal(study.layout.interior.objects.filter(x=>x.id==="BATHM-glass-600-A1"&&x.type==="divider").length,1);
assert.ok(study.views.length>=3, "Require multiple source cameras, not one cherry-picked screenshot");
assert.equal(study.views.every(v=>["BATH-M01","BATH-C01"].includes(v.room_id)),true);
const masterDoor=study.views[0].camera.viewer.doors.find(d=>d.id==="OP-WIC-BATHM");
const familyDoor=study.views[0].camera.viewer.doors.find(d=>d.id==="OP-HALL-BATHC");
assert.equal(masterDoor.open,false);
assert.equal(masterDoor.position,-Math.PI/2,"Master door closed with canonical hinge angle; no false open-leaf visual obstruction");
assert.equal(familyDoor.open,false);
assert.equal(familyDoor.position,0);
if(process.argv.includes("--check-images")){
  const dir="renders/bathroom-a2";
  const manifest=JSON.parse(fs.readFileSync(path.join(dir,"manifest.json"),"utf8"));
  assert.equal(manifest.scene_revision,study.scene_revision);
  assert.deepEqual(manifest.views,study.views.map(v=>v.id));
  for(const v of study.views){
    const filename=path.join(dir,v.id+".png");
    const buf=fs.readFileSync(filename);
    assert.ok(buf.length>15000,"Nontrivial real WebGL frame: "+v.id);
    assert.equal(buf.subarray(0,8).toString("hex"),"89504e470d0a1a0a","PNG signature "+v.id);
    assert.equal(buf.readUInt32BE(16),v.camera.viewport.width,"Width mismatch "+v.id);
    assert.equal(buf.readUInt32BE(20),v.camera.viewport.height,"Height mismatch "+v.id);
    const evidence=JSON.parse(fs.readFileSync(path.join(dir,v.id+".json"),"utf8"));
    assert.equal(evidence.schema,"ApartmentSceneCaptureFrame/1");
    assert.equal(evidence.canonical_sha256,LOCKED_CANONICAL);
    assert.equal(evidence.scene_revision,study.scene_revision);
    assert.equal(evidence.room_id,v.room_id);
    assert.equal(evidence.renderer.engine,"Three.js WebGL");
    assert.equal(evidence.assets.pending,0);
    assert.deepEqual(evidence.assets.fallbacks,[]);
    assert.deepEqual(evidence.camera.position,v.camera.position);
    assert.deepEqual(evidence.camera.target,v.camera.target);
    assert.equal(evidence.rendered_layout_json,JSON.stringify(study.layout));
    console.log("VERIFIED",v.id,buf.length,"bytes, genuine WebGL");
  }
}
console.log("Bathroom A2 geometry, source hash, wet-zone variant and evidence: PASS");
