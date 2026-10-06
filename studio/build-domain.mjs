import fs from "node:fs";
import { parse } from "acorn";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApartmentDomain } from "./domain/apartment.mjs";
const root =
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..") + "/";
createApartmentDomain(root);
const files = [
  "studio-core.js",
  "interior-core.js",
  "studio-cloud-core.js",
  "capture-camera.js",
];
const nodes = [];
for (const file of files) {
  const s = fs.readFileSync(root + file, "utf8");
  for (const n of parse(s, { ecmaVersion: "latest" }).body)
    nodes.push({ n, s: s.slice(n.start, n.end) });
}
const names = new Set();
for (let i = nodes.length - 1; i >= 0; i--) {
  const { n } = nodes[i];
  if (n.type === "FunctionDeclaration") {
    if (names.has(n.id.name)) nodes.splice(i, 1);
    else names.add(n.id.name);
  } else if (n.type === "VariableDeclaration")
    for (const d of n.declarations) names.add(d.id.name);
}
const error = fs
  .readFileSync(root + "studio-storage.js", "utf8")
  .match(/^class StudioStorageError[^\n]+/m)[0];
fs.writeFileSync(
  root + "studio/domain/browser.js",
  `// Compiled from the shared contracts by studio/build-domain.mjs. No cloud/persistence adapter.\nimport MODEL from '../../dist/apartment-model.json';\nimport INTERIOR_MATERIALS from '../../interior-materials.json';\nconst freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};freeze(MODEL);\n${error}\n${nodes.map((x) => x.s).join("\n")}\nexport {MODEL,INTERIOR_MATERIALS,${[...names].join(",")}};\n`,
);
