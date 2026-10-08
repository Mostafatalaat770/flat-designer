/**
 * Advisor A1: compare frozen K11/K12 models and explicitly separate
 * geometry checks from unapproved lifestyle/construction decisions.
 *
 * Run: node scripts/audit-advisor-01.mjs
 * Deliberately READ-ONLY. No design, cloud, or canonical writes.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const load = (path) => JSON.parse(readFileSync(path, 'utf8'));
const k11 = load('design-development/k11/snapshot.json');
const k12 = load('design-development/k12/snapshot.json');
const k12Audit = load('design-development/k12/function-audit.json');

const check = (name, test) => {
  assert.ok(test, name);
  console.log('PASS', name);
};
const close = (a, b, tolerance = 0.05) => Math.abs(a - b) <= tolerance;
const find = (snapshot, id) => {
  const result = snapshot.layout.furniture.find((f) => f.id === id);
  assert.ok(result, 'Missing furniture ' + id);
  return result;
};
const box = (f) => {
  const quarterTurn = Math.abs(Math.round((f.rot || 0) / 90)) % 2 === 1;
  const width = quarterTurn ? f.d : f.w;
  const depth = quarterTurn ? f.w : f.d;
  return {
    x0: f.cx - width / 2, x1: f.cx + width / 2,
    y0: f.cy - depth / 2, y1: f.cy + depth / 2,
  };
};
const oldIsland = find(k11, 'E2-island');
const island = find(k12, 'E2-island');
const cook = find(k12, 'E2-cooking-base');
const tall = find(k12, 'E2-oven-column');
const table = find(k12, 'starter-35');
const nearChair = find(k12, 'starter-36');
const oldB = box(oldIsland);
const islandB = box(island);
const cookB = box(cook);
const tallB = box(tall);
const tableB = box(table);
const chairB = box(nearChair);
const operator = k12Audit.end_operator_proxy;

console.log('A1 K11/K12 geometry and family-use audit (all dimensions mm)');
check('canonical SHA identical to stored audit',
  k11.canonical_sha256 === k12.canonical_sha256 &&
  k12.canonical_sha256 === k12Audit.canonical_sha256);
check('architecture overlay byte-equivalent',
  JSON.stringify(k11.architecture_variant) === JSON.stringify(k12.architecture_variant));
check('locked room descriptions unchanged',
  JSON.stringify(k11.layout.rooms) === JSON.stringify(k12.layout.rooms));
check('ceiling and room studio options unchanged',
  JSON.stringify(k11.layout.studio) === JSON.stringify(k12.layout.studio));
const oldMap = new Map(k11.layout.furniture.map((f) => [f.id, f]));
const nextMap = new Map(k12.layout.furniture.map((f) => [f.id, f]));
const changed = [...new Set([...oldMap.keys(), ...nextMap.keys()])]
  .filter((id) => JSON.stringify(oldMap.get(id)) !== JSON.stringify(nextMap.get(id)))
  .sort();
check('only E2-island furniture changed', JSON.stringify(changed) === JSON.stringify(['E2-island']));
check('K11 exactly 1700 x 900, K12 exactly 1700 x 1000',
  oldIsland.w === 1700 && oldIsland.d === 900 && island.w === 1700 && island.d === 1000);
check('sink world position did not change',
  JSON.stringify(find(k11, 'E2-island-sink')) === JSON.stringify(find(k12, 'E2-island-sink')));
check('island working south edge remains at y=7050',
  close(oldB.y1, 7050) && close(islandB.y1, 7050));
const cookingAisle = islandB.x0 - cookB.x1;
const tallAisle = tallB.y0 - islandB.y1;
const diningEdge = tableB.x0 - islandB.x1;
const operatorToTable = tableB.x0 - operator.x1;
const operatorToChair = chairB.x0 - operator.x1;
check('recomputed cooking and tall closed-front aisles equal study',
  close(cookingAisle, 1219) && close(tallAisle, 1220));
check('recomputed island to dining-table edge equals study',
  close(diningEdge, 1070));
check('standing operator proxy exactly 600 x 600',
  close(operator.x1 - operator.x0, 600) && close(operator.y1 - operator.y0, 600));
check('working at island short end narrows table-edge corridor to 465',
  close(operatorToTable, 465) && close(operatorToTable, k12Audit.end_operator_remaining_to_table_edge_mm));
check('nominal nearest chair footprint is 510 from operator',
  close(operatorToChair, 510));
const sinkPrep = k12Audit.prep;
const prep = sinkPrep.permanent_end_rectangle_mm;
check('uncovered end prep rectangle exactly 914 x 610',
  prep.y1 - prep.y0 === 914 && prep.x1 - prep.x0 === 610 &&
  sinkPrep.open_sink_and_end_prep_do_not_overlap === true &&
  sinkPrep.requires_sink_cover === false);
check('dishwasher-open proxy reduces passage to 570',
  close(tallAisle - 650, 570) &&
  k12Audit.appliance_opening_proxy.dishwasher_open_remaining_to_closed_tall_front_mm === 570);
check('canonical 2 FAILs still declared, not silently treated as PASS',
  k12Audit.canonical_summary.fail === 2 &&
  k12Audit.canonical_reported_failures.length === 2 &&
  k12Audit.status === 'EXPLORATORY');

console.log(JSON.stringify({
  model_validation: 'PASS',
  design_approval: 'NOT_APPROVED',
  units: 'mm',
  models: [k11.scene_revision, k12.scene_revision],
  k12: {
    cooking_closed_aisle: cookingAisle,
    tall_closed_aisle: tallAisle,
    dishwasher_open_proxy_aisle: tallAisle - 650,
    island_to_table_edge: diningEdge,
    operator_to_table_edge: operatorToTable,
    operator_to_nearest_nominal_chair: operatorToChair,
    permanent_end_prep_size: [914, 610],
  },
  still_blocking: [
    'Canonical two FAILs / architectural-opening consent and services',
    'Six occupied dining chairs and simultaneous human movements not modeled as certification',
    'Manufacturer door and handle models not selected',
    'Complete family storage inventory missing',
    'Actual drainage/extraction/finish heights and installed products not measured',
  ],
}, null, 2));
