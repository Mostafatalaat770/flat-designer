import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
const artifact = process.argv[2],
  destination = process.argv[3],
  run = process.argv[4];
assert.ok(
  artifact && destination && run,
  "Artifact root, destination and reviewed render run required",
);
const render = path.join(artifact, "renders/reception-sprint");
const v = JSON.parse(fs.readFileSync(path.join(render, "verification.json")));
const c = v.source_contract;
const hash = (p) =>
  createHash("sha256").update(fs.readFileSync(p)).digest("hex");
assert.equal(
  c.canonical_sha256,
  "734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658",
);
assert.equal(hash("render-snapshots/current.json"), c.source_sha256);
const canonical =
  "dist/sources/Apartment_Master_Spec_Type_B_v0.2.2_Geometry_Heights_Glazing(1).json";
assert.equal(hash(canonical), c.canonical_sha256);
assert.equal(v.frames.length, 32);
for (const name of [
  "A-P0.json",
  "B-P0.json",
  "A-P1-CONDITIONAL.json",
  "B-P1-CONDITIONAL.json",
  "audit-baseline.json",
  "audit-proposed.json",
  ...["baseline", "proposed"].flatMap((s) =>
    [200, 350, 450].map((p) => `plan-${s}-${p}.svg`),
  ),
]) {
  const file = "design-development/reception-sprint/" + name;
  assert.equal(
    hash(file),
    hash(path.join(artifact, file)),
    "Captured input/plan differs from current review: " + name,
  );
}
for (const f of v.frames) {
  const file = path.join(render, f.variant, f.view_id);
  assert.equal(hash(file + ".png"), f.image_sha256);
  const m = JSON.parse(fs.readFileSync(file + ".json"));
  const s = JSON.parse(
    fs.readFileSync(
      path.join(
        artifact,
        "design-development/reception-sprint",
        f.variant + ".json",
      ),
    ),
  );
  assert.deepEqual(m.camera, f.camera);
  assert.equal(m.rendered_layout_json, JSON.stringify(s.layout));
  assert.equal(m.scene_revision, s.scene_revision);
  assert.deepEqual(m.architecture_variant, s.architecture_variant ?? null);
  assert.equal(m.assets.pending, 0);
  assert.deepEqual(m.assets.fallbacks, []);
}
const ui = JSON.parse(
  fs.readFileSync(
    "design-development/reception-sprint/offline-review-validation.json",
  ),
);
assert.equal(ui.status, "PASS");
assert.equal(ui.frames_checked, 32);
assert.equal(ui.plans_checked, 6);
assert.deepEqual(ui.javascript_errors, []);
for (const f of ui.frames)
  assert.equal(
    f.image_sha256,
    v.frames.find((x) => x.variant === f.variant && x.view_id === f.view_id)
      ?.image_sha256,
  );
fs.cpSync(artifact, destination, { recursive: true });
for (const name of fs
  .readdirSync("design-development/reception-sprint")
  .filter(
    (n) =>
      n.endsWith(".md") ||
      n === "Design-Review.pdf" ||
      n === "offline-review-validation.json",
  ))
  fs.copyFileSync(
    "design-development/reception-sprint/" + name,
    path.join(destination, "design-development/reception-sprint", name),
  );
fs.renameSync(
  path.join(destination, "renders/reception-sprint/Review.html"),
  path.join(destination, "Review.html"),
);
fs.copyFileSync(
  "design-development/reception-sprint/Design-Review.pdf",
  path.join(destination, "Design-Review.pdf"),
);
for (const file of ["render-snapshots/current.json", canonical]) {
  fs.mkdirSync(path.dirname(path.join(destination, file)), { recursive: true });
  fs.copyFileSync(file, path.join(destination, file));
}
fs.writeFileSync(
  path.join(destination, "provenance.json"),
  JSON.stringify(
    {
      render_run_id: run,
      render_run_url: `https://github.com/Mostafatalaat770/flat-designer/actions/runs/${run}`,
      render_checkout_sha: c.render_git_commit,
      delivery_checkout_sha: process.env.GITHUB_SHA ?? null,
      delivery_run_id: process.env.GITHUB_RUN_ID ?? null,
      canonical_sha256: c.canonical_sha256,
      source_sha256: c.source_sha256,
      source_scene: c.source_scene,
      cloud_scene: c.cloud_scene,
      cloud_storage_revision: 55,
      frames: 32,
      contact_sheets: 8,
      dimensioned_plans: 6,
      offline_ui_validation:
        "32 exact PNG selections + six plans / desktop + mobile / PASS",
      approval: "DESIGN REVIEW ONLY",
    },
    null,
    2,
  ) + "\n",
);
fs.writeFileSync(
  path.join(destination, "README.md"),
  `# Type B reception design review\n\nOpen **Review.html** for the complete offline A/B comparison, eight matched viewpoints and six operating-state plans. Read **Design-Review.pdf** for the six-page recommendation and evidence brief.\n\nLead: **A Calm Contemporary** with the measured common layout. Conditional P1/F1 needs written structural/developer/service approval; A/P0 is the enclosed fallback. No construction, procurement, master merge or cloud save is approved.\n\nOriginal 32 PNGs, their metadata/manifests, verification and eight scaled unretouched sheets are under renders/reception-sprint. Detailed audit, both concepts, critical review, validation, release checklist, six SVGs, four study snapshots and full audit JSON are under design-development/reception-sprint. The original working input and canonical specification bytes are included. provenance.json distinguishes the capture checkout from this final document checkout; MANIFEST.sha256 lists every included file except itself.\n\nThe original image and numerical files remain unchanged from reviewed render run ${run}. Final narrative documents and PDF come from the delivery checkout. The HTML is moved to the archive root for convenience. No signed download links or credentials are included.\n\nWorking scene-9cf45a73 is distinct from saved cloud scene-4821689 v55. Dimensions are model/use-envelope results, not surveyed installed clearances. Shoe capacity loses 36% assumed volume and six pairs remain unverified; the +450mm shoe-user/chair gap is only 15mm. Kitchen operating conflicts and all release gates remain unresolved. Successful rendering cannot certify physical comfort, glare, extraction or construction.\n\nReview PR: https://github.com/Mostafatalaat770/flat-designer/pull/62\n`,
);
function files(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? files(path.join(dir, e.name))
        : [path.join(dir, e.name)],
    );
}
fs.writeFileSync(
  path.join(destination, "MANIFEST.sha256"),
  files(destination)
    .sort()
    .map(
      (p) =>
        hash(p) +
        "  " +
        path.relative(destination, p).split(path.sep).join("/"),
    )
    .join("\n") + "\n",
);
console.log(
  "Final reviewed evidence packaged: 32 original PNGs, eight sheets, six plans, complete narrative, PDF and offline comparison; all hashes and current inputs verified.",
);
