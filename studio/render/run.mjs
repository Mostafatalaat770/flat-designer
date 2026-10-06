import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createApartmentDomain } from "../domain/apartment.mjs";
const root = path.resolve(import.meta.dirname, "../..");
const argv = process.argv.slice(2);
const arg = (key) => argv[argv.indexOf(key) + 1];
const id = arg("--export-id"),
  view = argv.includes("--view") ? arg("--view") : null,
  samples = Number(argv.includes("--samples") ? arg("--samples") : 64);
if (
  !id ||
  !/^scene-[a-f0-9]+-[a-f0-9]{12}$/.test(id) ||
  !Number.isInteger(samples) ||
  samples < 1 ||
  samples > 2048
)
  throw Error(
    "Use --export-id scene-… --view optional-view-id --samples 1–2048",
  );
const dir = path.join(root, "local-qa/site/render-exports", id),
  views = [
    ...JSON.parse(fs.readFileSync(path.join(root, "studio/app/data/cameras.json"))),
    ...JSON.parse(fs.readFileSync(path.join(root, "studio/app/data/workspace-cameras.json"))),
  ];
if (view && !views.some((v) => v.id === view))
  throw Error("Unknown saved view");
// Validate against this exported layout, rather than assuming baseline views
// remain usable after a local furniture edit.
const job = JSON.parse(fs.readFileSync(path.join(dir, "apartment.job.json")));
const domain = createApartmentDomain(root);
const layout = domain.importBrief({
  schema: "ApartmentDesignBrief/1",
  canonical_sha256: job.canonical_sha256,
  scene_revision: job.scene_revision,
  layout: job.layout,
  ...job.canonical_geometry,
});
if (!domain.validate(layout).valid)
  throw Error("Render layout contains hard failures");
domain.captureCamera(
  layout,
  view ? views.find((v) => v.id === view) : job.camera,
);
const out = path.join(dir, view || "cycles-entry");
fs.mkdirSync(out, { recursive: true });
const log = fs.openSync(path.join(out, "render.log"), "w");
const binary = process.env.BLENDER_BINARY || "blender";
const args = [
  "--background",
  "--python-exit-code",
  "1",
  "--python",
  path.join(root, "studio/render/blender_render.py"),
  "--",
  "--job",
  path.join(dir, "apartment.job.json"),
  "--glb",
  path.join(dir, "apartment.glb"),
  "--output",
  out,
  "--samples",
  String(samples),
  ...(view ? ["--view", view] : []),
];
console.log("Rendering local canonical scene → " + out);
const child = spawn(binary, args, { cwd: root, stdio: ["ignore", log, log] });
child.on("error", (error) => {
  fs.closeSync(log);
  console.error(
    "Set BLENDER_BINARY to an installed Blender executable. " + error.message,
  );
  process.exitCode = 1;
});
child.on("exit", (code) => {
  fs.closeSync(log);
  if (code !== 0) {
    console.error(
      fs
        .readFileSync(path.join(out, "render.log"), "utf8")
        .split("\n")
        .slice(-20)
        .join("\n"),
    );
    process.exitCode = 1;
  } else {
    const report = JSON.parse(
      fs.readFileSync(path.join(out, "roundtrip.json")),
    );
    console.log(JSON.stringify(report));
    console.log("Render: " + path.join(out, "render.png"));
  }
});
