import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {createApartmentDomain} from "../domain/apartment.mjs";
import {compareKitchen,kitchenComparisonSvg} from "./kitchen-owner-compare.mjs";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const domain=createApartmentDomain(process.cwd());
const current=read("render-snapshots/current.json");
const archive=read("render-snapshots/study-k12-unapproved-20261008.json");
const r=compareKitchen(domain,current,archive);
test("one current clean source; original archived K12 must preserve two geometry blockers",()=>{
 assert.equal(r.source.current.scene,"scene-9cf45a73");
 assert.equal(r.source.historical.scene,"scene-e2fcb932");
 assert.equal(r.model.current_failures.length,0);
 assert.equal(r.model.unapproved_k12_failures.length,2);
 assert.equal(r.verdict.approved,false);
});
test("K12 wall changes are NOT solely in the kitchen, and two bathroom openings are hidden",()=>{
 assert.equal(r.model.removed_wall_segments,8);
 assert.equal(r.model.kitchen_related_wall_segments,4);
 assert.equal(r.model.bathroom_area_wall_segments,4);
 assert.deepEqual(r.model.hidden_openings,["OP-RECP-KIT","OP-HALL-BATHC","OP-WIC-BATHM"]);
});
test("actual appliance modelling distinguishes discrete closed dishwasher from conjectural island module",()=>{
 assert.equal(r.closed.indoor_washer,1);
 assert.equal(r.closed.discrete_dishwasher,1);
 assert.equal(r.closed.sink_to_dw_x_mm,600);
 assert.equal(r.historical_open.discrete_dishwasher,0);
 assert.equal(r.historical_open.conceptual_island_dishwasher_modules,1);
 assert.equal(r.historical_open.service_terrace_approved,false);
});
test("both have six chairs and 2000x950 table but historical dining is 150mm offset",()=>{
 assert.deepEqual(r.dining.table_mm,[2000,950]);
 assert.equal(r.dining.six_seats_both,true);
 assert.equal(r.dining.archived_minus_current_mm,-150);
 assert.equal(r.dining.controlled_same_layout_comparison,false);
});
test("SVG keeps both source identities and clearly marks nonapproved wall changes",()=>{
 const svg=kitchenComparisonSvg(domain,current,archive,r);
 assert.match(svg,/scene-9cf45a73/);
 assert.match(svg,/scene-e2fcb932/);
 assert.match(svg,/stroke-dasharray="9 6"/);
 assert.match(svg,/8 wall cuts/);
 assert.match(svg,/not actual demolished walls/);
});
