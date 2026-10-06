import fs from "node:fs";
import path from "node:path";
import { createCanvas, loadImage } from "@napi-rs/canvas";
const root = path.resolve(import.meta.dirname, "../..");
const cameras = JSON.parse(
  fs.readFileSync(
    path.join(root, "local-qa/project-studies-v7/family-v7/cameras.json"),
  ),
);
const report = [];
for (const c of cameras) {
  const name = c.id + "__chromium-1600x857.png";
  const paths = ["family-organization-v7", "studio-engine-parity-v1"].map((f) =>
    path.join(root, ".argent/flows/__baselines__", f, name),
  );
  const images = await Promise.all(paths.map((p) => loadImage(p)));
  const data = images.map((im) => {
    const cv = createCanvas(im.width, im.height);
    cv.getContext("2d").drawImage(im, 0, 0);
    return cv.getContext("2d").getImageData(0, 0, im.width, im.height).data;
  });
  let different = 0,
    max = 0,
    total = 0;
  for (let i = 0; i < data[0].length; i += 4) {
    let pixel = 0;
    for (let ch = 0; ch < 3; ch++) {
      const d = Math.abs(data[0][i + ch] - data[1][i + ch]);
      pixel = Math.max(pixel, d);
      max = Math.max(max, d);
      total += d;
    }
    if (pixel > 2) different++;
  }
  report.push({
    view: c.id,
    changed_pixel_percent: (different / (1600 * 857)) * 100,
    max_channel_difference: max,
    mean_channel_difference: total / (1600 * 857 * 3),
  });
}
fs.mkdirSync(path.join(root, "local-qa/reports"), { recursive: true });
fs.writeFileSync(
  path.join(root, "local-qa/reports/renderer-parity.json"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
if (report.some((r) => r.changed_pixel_percent > 0.1)) process.exitCode = 1;
