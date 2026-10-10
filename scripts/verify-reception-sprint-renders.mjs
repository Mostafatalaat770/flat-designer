import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createCanvas, loadImage } from "@napi-rs/canvas";
const root = process.env.RENDER_OUT_DIR || "renders/reception-sprint",
  sources = "design-development/reception-sprint";
const hash = (x) => createHash("sha256").update(x).digest("hex");
const read = (p) => JSON.parse(fs.readFileSync(p));
const contract = read(`${sources}/source-contract.json`),
  batch = read(`${root}/batch-manifest.json`);
assert.equal(
  hash(fs.readFileSync(contract.source_path)),
  contract.source_sha256,
  "Working source mutated",
);
assert.equal(batch.status, "ALL_FRAMES_VERIFIED");
assert.equal(batch.frames.length, 32);
const signatures = new Set(),
  records = [];
for (const variant of contract.variants) {
  const inputPath = `${sources}/${variant.key}.json`,
    s = read(inputPath),
    m = read(`${root}/${variant.key}/manifest.json`);
  assert.equal(hash(fs.readFileSync(inputPath)), m.source_sha256);
  assert.equal(s.scene_revision, m.scene_revision);
  assert.deepEqual(s.architecture_variant ?? null, m.architecture_variant);
  assert.equal(m.frames.length, 8);
  signatures.add(hash(JSON.stringify(s.views)));
  for (const view of s.views) {
    const file = `${root}/${variant.key}/${view.id}`,
      bytes = fs.readFileSync(file + ".png"),
      meta = read(file + ".json");
    const frame = m.frames.find((x) => x.view_id === view.id);
    assert.ok(frame);
    assert.equal(hash(bytes), frame.image_sha256);
    assert.ok(bytes.length > 15000);
    assert.equal(bytes.readUInt32BE(16), 1280);
    assert.equal(bytes.readUInt32BE(20), 720);
    assert.equal(meta.rendered_layout_json, JSON.stringify(s.layout));
    assert.equal(meta.scene_revision, s.scene_revision);
    assert.equal(meta.canonical_sha256, contract.canonical_sha256);
    assert.deepEqual(meta.camera, view.camera);
    assert.deepEqual(meta.architecture_variant, s.architecture_variant ?? null);
    assert.equal(meta.assets.pending, 0);
    assert.deepEqual(meta.assets.fallbacks, []);
    records.push({
      ...frame,
      architecture_sha256: hash(JSON.stringify(s.architecture_variant ?? null)),
      snapshot_sha256: m.source_sha256,
      source_scene: contract.source_scene,
      cloud_scene: contract.cloud_scene,
      cloud_storage_revision: 55,
      canonical_sha256: contract.canonical_sha256,
      camera: view.camera,
    });
  }
}
assert.equal(signatures.size, 1, "Style/topology cameras differ");
// Reject a color-only A/B or accidentally duplicated topology capture at a useful kitchen camera.
for (const id of ["entry-overview", "wide-reception", "kitchen-relationship"]) {
  assert.notEqual(
    records.find((x) => x.variant === "A-P0" && x.view_id === id).image_sha256,
    records.find((x) => x.variant === "B-P0" && x.view_id === id).image_sha256,
  );
}
assert.notEqual(
  records.find(
    (x) => x.variant === "A-P0" && x.view_id === "kitchen-relationship",
  ).image_sha256,
  records.find(
    (x) =>
      x.variant === "A-P1-CONDITIONAL" && x.view_id === "kitchen-relationship",
  ).image_sha256,
);
const find = (variant, id) =>
  records.find((x) => x.variant === variant && x.view_id === id);
async function sheet(name, pairs, cols = 2) {
  const w = 720,
    h = 468,
    rows = Math.ceil(pairs.length / cols),
    c = createCanvas(cols * w, rows * h + 90),
    ctx = c.getContext("2d");
  ctx.fillStyle = "#f6f1e8";
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = "#302b25";
  ctx.font = "bold 23px sans-serif";
  ctx.fillText(name, 22, 30);
  ctx.font = "13px sans-serif";
  ctx.fillText(
    "True WebGL · Type B v0.2.2 · 2500mm ceiling · source scene-9cf45a73 / distinct cloud scene-4821689 v55",
    22,
    53,
  );
  ctx.fillText(
    "P1 = conditional wall 44 omission; NOT FOR CONSTRUCTION. Scaled, unretouched thumbnails; original PNGs retained.",
    22,
    75,
  );
  for (let i = 0; i < pairs.length; i++) {
    const [variant, id] = pairs[i],
      x = (i % cols) * w,
      y = Math.floor(i / cols) * h + 90,
      r = find(variant, id);
    assert.ok(r);
    const img = await loadImage(`${root}/${variant}/${id}.png`);
    ctx.drawImage(img, x + 10, y + 58, 700, 394);
    ctx.fillStyle = "#302b25";
    ctx.font = "bold 15px sans-serif";
    ctx.fillText(
      `${variant.replace("P1-CONDITIONAL", "P1 HOLD")} · ${id} · ${r.scene_revision}`,
      x + 12,
      y + 19,
    );
    ctx.font = "11px sans-serif";
    ctx.fillText(
      `PNG ${r.image_sha256.slice(0, 16)} | camera ${r.camera_signature_sha256.slice(0, 12)} | architecture ${r.architecture_sha256.slice(0, 12)}`,
      x + 12,
      y + 38,
    );
  }
  fs.writeFileSync(`${root}/${name}.png`, c.toBuffer("image/png"));
}
const views = [
  "entry-overview",
  "living-to-dining",
  "dining-to-living",
  "wide-reception",
];
await sheet(
  "AB-P0-contact",
  views.flatMap((id) => [
    ["A-P0", id],
    ["B-P0", id],
  ]),
);
await sheet(
  "Kitchen-style-topology-matrix",
  contract.variants.map((v) => [v.key, "kitchen-relationship"]),
);
await sheet(
  "Day-evening-comparison",
  ["wide-reception", "wide-reception-evening"].flatMap((id) => [
    ["A-P0", id],
    ["B-P0", id],
  ]),
);
await sheet(
  "Kitchen-and-seated-TV",
  ["kitchen-work", "seated-tv"].flatMap((id) => [
    ["A-P0", id],
    ["B-P0", id],
  ]),
);
for (const v of contract.variants)
  await sheet(
    `${v.key}-all-views`,
    contract.cameras.map((c) => [v.key, c.id]),
  );
fs.writeFileSync(
  `${root}/verification.json`,
  JSON.stringify(
    {
      schema: "TypeBReceptionRenderVerification/1",
      status: "32_PNGS_SOURCE_CAMERA_ARCHITECTURE_HASH_VERIFIED",
      source_contract: contract,
      frames: records,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  "32 genuine PNGs verified; 8 contact sheets written. Human visual review still required.",
);
