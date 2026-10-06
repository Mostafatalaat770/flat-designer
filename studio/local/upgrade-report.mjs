import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const root = path.resolve(import.meta.dirname, "../..");
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, p)));
const scene = "scene-9e210720",
  exportId = scene + "-ef95c7247897";
const cameras = read("studio/app/data/cameras.json");
const parity = read("local-qa/reports/renderer-parity.json");
assert.equal(parity.length, 13);
assert.ok(parity.every((p) => p.max_channel_difference === 0));
const views = ["family-v7-entry", "family-v7-family", "family-v7-dining"];
const rounds = views.map((v) =>
  read(`local-qa/site/render-exports/${exportId}/${v}/roundtrip.json`),
);
for (let i = 0; i < rounds.length; i++) {
  const r = rounds[i];
  assert.equal(r.scene_revision, scene);
  assert.equal(r.render_camera.view, views[i]);
  assert.equal(r.render_camera.verified, true);
  assert.deepEqual(r.failures, []);
}
const site = path.join(root, "local-qa/site"),
  out = path.join(site, "upgrade-v1");
fs.mkdirSync(out, { recursive: true });
const copy = (src, name) => {
  fs.copyFileSync(path.join(root, src), path.join(out, name));
  return "upgrade-v1/" + name;
};
copy(
  ".argent/flows/__baselines__/studio-workspace-v1/workspace-2__chromium-1600x857.png",
  "workspace.png",
);
for (const v of parity)
  copy(
    `.argent/flows/__baselines__/studio-engine-parity-v1/${v.view}__chromium-1600x857.png`,
    v.view + ".png",
  );
for (const id of [
  "workspace-kitchen",
  "workspace-family-bath",
  "workspace-bath-m01",
])
  copy(
    `.argent/flows/__baselines__/studio-utility-views-v1/${id}__chromium-1600x857.png`,
    id + ".png",
  );
for (const v of views)
  copy(
    `local-qa/site/render-exports/${exportId}/${v}/render.png`,
    v + "-cycles.png",
  );
const report = {
  schema: "ApartmentStudioUpgrade/1",
  date: "2026-10-05",
  canonical_sha256: rounds[0].canonical_sha256,
  scene_revision: scene,
  production_writes: false,
  architecture_changes: false,
  renderer_parity: parity,
  cycles_roundtrips: rounds,
  tests: {
    study_domain: 8,
    browser_domain_and_assets: 7,
    original_contract_suites: 5,
    status: "PASS",
  },
  browser: {
    device: "chromium-cdp-9222",
    viewport: [1600, 857],
    eye_m: 1.7,
    natural_vertical_fov: 42,
    wide_vertical_fov: 60,
    standing_cameras: cameras.length,
    rooms: 10,
    flows: [
      "studio-engine-parity-v1",
      "studio-workspace-v1",
      "studio-controls-v1",
      "studio-edit-v2",
      "studio-asset-v1",
      "studio-asset-finish-v2",
      "studio-utility-views-v1",
    ],
  },
  limitations: [
    "Generic furniture; manufacturer CAD population pending",
    "Dim exploratory Cycles lighting; curtain/glazing/PBR calibration pending",
    "Imported GLB and finish choices are session state, not durable per-version assets",
    "Desktop Chromium verified; mobile UI not manually verified",
    "76 spatial warnings remain; zero hard failures is not construction or service approval",
    "Large renderer bundle and App controller complexity remain",
  ],
};
fs.writeFileSync(
  path.join(root, "local-qa/reports/studio-upgrade.json"),
  JSON.stringify(report, null, 2) + "\n",
);
fs.writeFileSync(
  path.join(out, "evidence.json"),
  JSON.stringify(report, null, 2) + "\n",
);
const esc = (s) =>
  s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;");
const figure = (img, label, caption) =>
  `<figure><a href="upgrade-v1/${img}"><img loading="lazy" src="upgrade-v1/${img}" alt="${esc(label)}" width="1600" height="857"></a><figcaption><strong>${esc(label)}</strong><p>${esc(caption)}</p></figcaption></figure>`;
const cycles = views
  .map((v) =>
    figure(
      v + "-cycles.png",
      cameras.find((c) => c.id === v).label,
      "Blender/Cycles · 42° · eye 1.70 m · geometry/camera verified; lighting and generic furniture exploratory.",
    ),
  )
  .join("");
const utilities = [
  [
    "workspace-kitchen",
    "Kitchen",
    "Gas cooking, indoor laundry and closed storage retained. Cabinet/appliance geometry is generic; this is not a final kitchen elevation.",
  ],
  [
    "workspace-family-bath",
    "Family bathroom",
    "Standing view of existing vanity/WC. Fixture details and material junctions need refinement.",
  ],
  [
    "workspace-bath-m01",
    "Ensuite",
    "Standing view re-aimed toward existing vanity/WC. No fixtures or boundaries moved.",
  ],
]
  .map(([id, label, caption]) => figure(id + ".png", label, caption))
  .join("");
const retained = parity
  .map((p) =>
    figure(
      p.view + ".png",
      cameras.find((c) => c.id === p.view).label,
      "Extracted Three renderer · exact match to the classic reference.",
    ),
  )
  .join("");
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Apartment Type B — local upgrade review</title><style>
:root{color-scheme:light;font:16px/1.55 system-ui,sans-serif;color:#293229;background:#f5f3ed}body{margin:0}main{max-width:1250px;margin:auto;padding:40px 28px}header{border-bottom:1px solid #c9ccbf;padding-bottom:28px}.eyebrow{font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#556246}h1,h2{font-family:Georgia,serif;font-weight:500;line-height:1.15}h1{font-size:clamp(32px,5vw,56px);margin:12px 0}h2{font-size:30px;margin-top:46px}p{max-width:850px}.links{display:flex;flex-wrap:wrap;gap:12px;margin-top:20px}a{color:#3e5236}.links a{padding:10px 16px;border:1px solid #abb49e;border-radius:5px;text-decoration:none}.links a:first-child{background:#536146;color:white}figure{margin:0 0 24px;background:#fff;border:1px solid #dddcd3}img{display:block;width:100%;height:auto}figcaption{padding:15px 18px}figcaption p{font-size:14px;margin:6px 0;color:#53604e}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}.grid figure{margin:0}table{border-collapse:collapse;width:100%;font-size:14px}td,th{text-align:left;padding:12px 10px;border-bottom:1px solid #d6d9ce}summary{cursor:pointer;padding:14px 0;font-size:18px}footer{margin-top:40px;border-top:1px solid #c9ccbf;padding:20px 0;font-size:13px}@media(max-width:750px){main{padding:25px 16px}.grid{grid-template-columns:1fr}h2{font-size:25px}}
</style><main><header><div class="eyebrow">Apartment Type B · Local upgrade v1 · 05 October 2026</div><h1>A stronger workspace.<br>The same measured apartment.</h1><p>The new editor, measured GLB import and canonical Blender handoff now run locally. Family A.7 is preserved. Architecture and production saved state are unchanged.</p><div class="links"><a href="workspace/">Open the new Studio</a><a href="project-studies-v7/index.html">Current apartment study</a><a href="upgrade-v1/evidence.json">Verification record</a></div></header><h2>The delivered workspace</h2><p>Room navigation, furniture dimensions, checks, local versions and design notes sit beside the apartment. Compare versions with matching camera positions and lenses. This capture compares the same retained baseline on both sides to verify the comparison mechanism.</p>${figure("workspace.png", "Local React / TypeScript workspace", "Natural42° comparison, furniture inspector and validation. No design changes retained during upgrade QA.")}<h2>What Blender produced</h2><p>These are real Cycles renders of the exported Studio scene. Canonical walls, openings, floors, ceilings, furniture transforms and cameras passed round-trip checks. The present treatment is too dim and still uses generic meshes. It is a verified render path, not a finished photorealistic design.</p>${cycles}<h2>Kitchen and bathroom review views</h2><p>These remain measured interactive previews. Use them for spatial review while the detailed model and finish library develops.</p><div class="grid">${utilities}</div><h2>What passed</h2><table><thead><tr><th>Check</th><th>Result</th></tr></thead><tbody><tr><td>Extracted renderer versus classic</td><td>13 views · zero changed pixels</td></tr><tr><td>Final renderer replay</td><td>52 steps · 0.00% screenshot difference</td></tr><tr><td>Study, browser contracts and GLB assets</td><td>15 tests pass; 5 original suites pass</td></tr><tr><td>Local candidate</td><td>126 PASS / 76 WARNING / 0 FAIL</td></tr><tr><td>Blender geometry/camera</td><td>64 walls · 52 opening parts · 13 floors · 10 ceilings · 51 furniture transforms · 42° / 1.70 m</td></tr><tr><td>UI behaviour</td><td>Comparison, room navigation, lens/scale, edit/undo, generic GLB and two finishes exercised in Chromium</td></tr></tbody></table><details><summary>All 13 retained apartment reference views</summary><div class="grid">${retained}</div></details><h2>The next design work</h2><p>Replace the sofa, dining furniture and key lamps with licensed models that match the measured envelopes. Calibrate daylight, curtain transmission and fabric/wood/stone surfaces. Then detail kitchen and bathroom fixtures and inspect circulation from several Natural views. Generic linen and stone remain concepts, not real material SKUs.</p><p>Imported assets are currently session-based: keep their original files and re-import after reload. Per-version asset persistence, mobile QA and bundle/controller refinement remain engineering follow-up.</p><footer>Local only · Family A.7 / ${scene} · canonical geometry locked · no production deployment or saved-state writes</footer></main></html>`;
fs.writeFileSync(path.join(site, "upgrade-v1.html"), html);
console.log("Review: http://127.0.0.1:4174/_qa/upgrade-v1.html");
