import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { createApartmentDomain } from "../domain/apartment.mjs";
const root = path.resolve(import.meta.dirname, "../.."),
  payload = JSON.parse(fs.readFileSync(0, "utf8")),
  domain = createApartmentDomain(root),
  job = payload.job;
if (
  job.schema !== "ApartmentRenderJob/1" ||
  job.canonical_sha256 !== domain.model.canonical_sha256
)
  throw Error("Canonical render job mismatch");
const layout = domain.importBrief({
  schema: "ApartmentDesignBrief/1",
  canonical_sha256: job.canonical_sha256,
  scene_revision: job.scene_revision,
  layout: job.layout,
  ...job.canonical_geometry,
});
if (![42, 60].includes(job.camera.fov) || job.camera.position[1] !== 1.7)
  throw Error("Export a Natural42 or named Wide60 standing camera");
const bytes = Buffer.from(payload.glb, "base64");
if (
  bytes.length > 40 * 1024 * 1024 ||
  bytes.readUInt32LE(0) !== 0x46546c67 ||
  bytes.readUInt32LE(4) !== 2 ||
  bytes.readUInt32LE(8) !== bytes.length
)
  throw Error("Invalid binary glTF");
job.glb_sha256 = crypto.createHash("sha256").update(bytes).digest("hex");
const id = job.scene_revision + "-" + job.glb_sha256.slice(0, 12),
  out = path.join(root, "local-qa/site/render-exports", id);
fs.mkdirSync(out, { recursive: true });
const target = path.join(out, "apartment.glb");
if (fs.existsSync(target) && !fs.readFileSync(target).equals(bytes))
  throw Error("Render history cannot be overwritten");
fs.writeFileSync(target, bytes);
fs.writeFileSync(
  path.join(out, "apartment.job.json"),
  JSON.stringify(job, null, 2),
);
console.log(
  JSON.stringify({
    id,
    glb: "/_qa/render-exports/" + id + "/apartment.glb",
    job: "/_qa/render-exports/" + id + "/apartment.job.json",
  }),
);
