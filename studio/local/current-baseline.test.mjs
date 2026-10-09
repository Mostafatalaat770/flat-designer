import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {createApartmentDomain} from "../studio/domain/apartment.mjs";
const source=JSON.parse(fs.readFileSync("render-snapshots/current.json","utf8"));
const old=JSON.parse(fs.readFileSync("studio/local/sources/verified-master-v50.json","utf8"));
const archive=JSON.parse(fs.readFileSync("render-snapshots/study-k12-unapproved-20261008.json","utf8"));
test("one v55 working source: closed canonical walls, true independent walk-in visual",()=>{
 const d=createApartmentDomain(process.cwd());
 assert.equal(source.canonical_sha256,d.model.canonical_sha256);
 assert.equal(source.canonical_sha256,old.canonical_sha256);
 assert.equal(source.storage_revision,55);
 assert.equal(source.source_scene_revision,"scene-4821689");
 assert.equal(source.scene_revision,d.revision(source.layout));
 assert.deepEqual(source.layout.demolished,[]);
 assert.equal(source.layout.furniture.filter(f=>f.room_id==="BATH-M01"&&f.type==="bathtub").length,0);
 assert.equal(source.layout.furniture.filter(f=>f.room_id==="BATH-M01"&&f.type==="shower"&&f.variant==="walk-in").length,1);
 assert.ok(source.views.some(x=>x.id==="reception-entry"));
 assert.ok(source.views.some(x=>x.room_id==="BATH-C01"));
 const errs=d.validate(source.layout).checks.filter(x=>x.status==="FAIL");
 assert.equal(errs.length,0,JSON.stringify(errs));
});
test("K12 is archived and cannot silently reappear as the reference",()=>{
 assert.equal(archive.scene_revision,"scene-e2fcb932");
 assert.notEqual(archive.scene_revision,source.scene_revision);
});
