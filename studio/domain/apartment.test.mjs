import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApartmentDomain, LOCKED_CANONICAL } from "./apartment.mjs";
import { prepareStudy } from "../local/study.mjs";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
const read = (file) =>
  JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const domain = createApartmentDomain(root);
const spec = read("local-qa/studies/family-a7.json");
const brief = read(spec.base_brief);
const current = read("local-qa/project-studies-v7/family-v7/layout.json");

test("standing bathroom presets keep canonical geometry and validate eye placement", () => {
  for (const room of ["BATH-M01", "WC-01"]) {
    const camera = domain.presetCamera(current, room);
    assert.equal(camera.position[1], 1.7);
    assert.equal(camera.fov, 42);
    assert.equal(
      domain.captureCamera(current, { ...camera, room_id: room }).position[1],
      1.7,
    );
  }
  assert.throws(() => domain.presetCamera(current, "missing-room"));
});

test("shared contracts reproduce the measured candidate without changing input or architecture", () => {
  const before = JSON.stringify(brief);
  const layout = domain.applyProposal(domain.importBrief(brief), spec.proposal);
  assert.deepEqual(layout, current);
  assert.equal(domain.revision(layout), "scene-9e210720");
  assert.equal(JSON.stringify(brief), before);
  assert.equal(domain.model.canonical_sha256, LOCKED_CANONICAL);
  assert.ok(Object.isFrozen(domain.model.rooms[0].poly));
});

test("imports reject a mismatched canonical hash, scene revision or architectural geometry", () => {
  assert.throws(
    () => domain.importBrief({ ...brief, canonical_sha256: "0".repeat(64) }),
    /different geometry/,
  );
  assert.throws(
    () => domain.importBrief({ ...brief, scene_revision: "scene-deadbeef" }),
    /scene revision/,
  );
  const changed = structuredClone(brief);
  changed.rooms[0].poly[0][0] += 100;
  assert.throws(() => domain.importBrief(changed), /architecture differs/);
  assert.throws(
    () => domain.validate({ ...current, demolished: ["wall-01"] }),
    /locked/,
  );
});

test("stale proposal cannot silently apply to a newer local design", () => {
  assert.throws(
    () => domain.applyProposal(current, spec.proposal),
    /older scene|revision/i,
  );
});

test("invalid cameras fail with the actual contract error, and stop a study before writing", () => {
  const input = {
    ...spec.cameras[0],
    position: [0, 1.7, 0],
    target: [0, 1.2, 0],
  };
  assert.throws(
    () => domain.captureCamera(current, input),
    (error) =>
      error.code === "invalid_camera_placement" &&
      /Camera must/.test(error.message),
  );
  const bad = {
    ...spec,
    id: "must-not-be-written",
    output: "must-not-be-written",
    cameras: [input],
  };
  assert.throws(() => prepareStudy(root, bad), /Camera must/);
  assert.equal(
    fs.existsSync(path.join(root, "local-qa/must-not-be-written")),
    false,
  );
});

test("primary views enforce human-scale lens and eye calibration", () => {
  const input = spec.cameras[0];
  const result = domain.captureCamera(current, input);
  assert.equal(result.position[1], 1.7);
  assert.equal(result.fov, 42);
  assert.throws(
    () => domain.captureCamera(current, { ...input, fov: 90 }),
    /Natural42/,
  );
  assert.throws(
    () =>
      domain.captureCamera(current, {
        ...input,
        position: [input.position[0], 1.2, input.position[2]],
      }),
    /eye height/,
  );
});

test("renderer pipeline preserves previous design versions", () => {
  const changed = { ...spec, proposal: { ...spec.proposal, operations: [] } };
  assert.throws(() => prepareStudy(root, changed), /new output version/);
});

test("study room scope protects kitchen finishes/options during bedroom work", () => {
  const changed = {
    ...spec,
    proposal: {
      ...spec.proposal,
      operations: [
        ...spec.proposal.operations,
        {
          type: "room-option",
          room_id: "KIT-01",
          key: "temperature",
          value: 4000,
        },
      ],
    },
  };
  assert.throws(
    () => prepareStudy(root, changed),
    /Room changed outside study scope: KIT-01/,
  );
});
