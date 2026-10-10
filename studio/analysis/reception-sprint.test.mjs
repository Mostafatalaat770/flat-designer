import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createApartmentDomain } from "../domain/apartment.mjs";
import {
  buildReceptionSprint,
  lockSource,
  chairState,
  makeSprintCameras,
} from "./reception-sprint.mjs";
import { makeBatchPlan } from "../../scripts/render-batch-plan.mjs";
const domain = createApartmentDomain(process.cwd()),
  source = JSON.parse(fs.readFileSync("render-snapshots/current.json"));
const before = JSON.stringify(source),
  study = buildReceptionSprint(source, domain);
test("source and every outside-sprint room remain pinned; conditional overlay never mutates canonical", () => {
  assert.equal(JSON.stringify(source), before);
  for (const s of Object.values(study.variants)) {
    assert.deepEqual(s.layout.demolished, []);
    assert.equal(domain.revision(s.layout), s.scene_revision);
    assert.deepEqual(
      s.layout.furniture.filter((f) => f.room_id !== "RECP-01"),
      source.layout.furniture.filter((f) => f.room_id !== "RECP-01"),
    );
    assert.deepEqual(
      s.layout.interior.objects.filter((f) => !["RECP-01"].includes(f.room_id)),
      source.layout.interior.objects.filter(
        (f) => !["RECP-01"].includes(f.room_id),
      ),
    );
    assert.deepEqual(
      domain.validate(s.layout).checks.filter((x) => x.status === "FAIL"),
      [],
    );
    assert.equal(
      s.layout.furniture.filter(
        (f) => f.room_id === "RECP-01" && f.type === "chair",
      ).length,
      6,
    );
  }
  assert.deepEqual(
    study.variants["A-P0"].layout,
    study.variants["A-P1-CONDITIONAL"].layout,
  );
  assert.deepEqual(
    study.variants["B-P0"].layout,
    study.variants["B-P1-CONDITIONAL"].layout,
  );
  assert.equal(study.variants["A-P0"].architecture_variant, undefined);
  assert.equal(
    study.variants["A-P1-CONDITIONAL"].architecture_variant.render_only,
    true,
  );
  assert.equal(
    study.variants["A-P1-CONDITIONAL"].architecture_variant.structural_status,
    "TBD",
  );
  assert.deepEqual(
    study.variants["A-P1-CONDITIONAL"].architecture_variant
      .remove_wall_segments,
    [
      {
        from: domain.model.wall_segments[44].from,
        to: domain.model.wall_segments[44].to,
      },
    ],
  );
});
test("same-geometry style matrix has matching cameras, deliberate light hierarchy, no new ceiling drop", () => {
  const inputs = Object.entries(study.variants).map(([name, snapshot]) => ({
    file: name + ".json",
    snapshot,
  }));
  assert.equal(makeBatchPlan(inputs).jobs.length, 32);
  const bad = structuredClone(inputs);
  bad[1].snapshot.views[0].camera.position[0] += 0.01;
  assert.throws(() => makeBatchPlan(bad), /cameras differ/);
  for (const s of Object.values(study.variants))
    assert.equal(s.layout.studio.rooms["RECP-01"].ceiling, "plain");
  const a = study.variants["A-P0"],
    b = study.variants["B-P0"];
  assert.ok(
    !a.layout.interior.objects.some((x) => x.id === "A-dining-pendant"),
  );
  const p = b.layout.interior.objects.find((x) => x.id === "A-dining-pendant");
  assert.equal(p.variant, "linear");
  assert.equal(domain.resolveObject(p).bottom_mm, 1730);
  const day = makeSprintCameras(source, domain.model).find(
      (x) => x.id === "wide-reception",
    ),
    night = makeSprintCameras(source, domain.model).find(
      (x) => x.id === "wide-reception-evening",
    );
  assert.deepEqual(day.camera.position, night.camera.position);
  assert.deepEqual(day.camera.target, night.camera.target);
  assert.equal(night.camera.viewer.night, true);
});
test("reject stale scene, wrong canonical, historical overlay and missing sixth chair", () => {
  for (const mutate of [
    (s) => (s.scene_revision = "scene-e2fcb932"),
    (s) => (s.canonical_sha256 = "0".repeat(64)),
    (s) => (s.architecture_variant = { render_only: true }),
    (s) => s.layout.furniture.pop(),
  ]) {
    const s = structuredClone(source);
    mutate(s);
    assert.throws(() => lockSource(s, domain));
  }
  const missing = structuredClone(source);
  missing.layout.furniture = missing.layout.furniture.filter(
    (x) => x.id !== "A2-dining-chair-south-centre",
  );
  missing.scene_revision = domain.revision(missing.layout);
  assert.throws(() => lockSource(missing, domain));
});
test("six occupied and pull-out states expose baseline conflict and fix without hiding a route failure", () => {
  const baseline = study.audits.baseline,
    proposed = study.audits.proposed;
  assert.equal(chairState(source, 350).length, 6);
  assert.equal(
    proposed.chairStates.find((x) => x.pullback_mm === 200).seated_bodies
      .length,
    6,
  );
  assert.equal(
    proposed.chairStates.find((x) => x.pullback_mm === 200)
      .adjacent_seated_body_gap_mm,
    100,
  );
  assert.equal(
    baseline.chairStates.find((x) => x.pullback_mm === 350)
      .shoe_to_nearest_chair.gap_mm,
    35,
  );
  assert.equal(
    baseline.chairStates.find((x) => x.pullback_mm === 450)
      .shoe_to_nearest_chair.intersects_positive_area,
    true,
  );
  assert.equal(baseline.entry.shoe_user_sweep.any_intersection, true);
  assert.equal(proposed.entry.shoe_user_sweep.any_intersection, false);
  for (const c of proposed.chairStates) {
    assert.equal(c.shoe_to_nearest_chair.intersects_positive_area, false);
    assert.equal(c.shoe_user_to_nearest_chair.intersects_positive_area, false);
  }
  for (const route of proposed.routes)
    assert.equal(route.status, "MODEL_ROUTE_FOUND", route.id);
  assert.equal(
    proposed.chairStates.find((x) => x.pullback_mm === 350)
      .buffet_open_to_nearest_chair.gap_mm,
    785,
  );
  assert.ok(
    proposed.storage.find((x) => x.id === "entry").upper_bound_litres <
      baseline.storage.find((x) => x.id === "entry").upper_bound_litres,
    "Disclose smaller shoe box rather than claim storage gain",
  );
});
test("kitchen constraints persist in both concepts and P1 is not a release", () => {
  const a = study.audits.proposed.appliances;
  assert.equal(a.metrics.dishwasher_open_to_south_nominal_inner_wall_mm, 972.3);
  assert.equal(
    a.metrics.dishwasher_open_plus_user_to_south_nominal_inner_wall_mm,
    372.3,
  );
  assert.equal(
    a.metrics.fridge_open_vs_kitchen_door_sweep.any_intersection,
    true,
  );
  assert.equal(
    a.metrics.oven_open_vs_service_door_sweep.any_intersection,
    true,
  );
  assert.equal(
    a.metrics.washer_user_vs_service_door_sweep.any_intersection,
    true,
  );
  assert.equal(a.kitchenRoutes.length, 20);
});
