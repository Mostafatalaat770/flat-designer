import fs from "node:fs";
import { createHash } from "node:crypto";
import { createApartmentDomain } from "../studio/domain/apartment.mjs";
import { buildReceptionSprint } from "../studio/analysis/reception-sprint.mjs";
import { receptionPlanSvg } from "../studio/analysis/reception-sprint-plan.mjs";
const root = "design-development/reception-sprint";
fs.mkdirSync(root, { recursive: true });
const sourceBytes = fs.readFileSync("render-snapshots/current.json");
const source = JSON.parse(sourceBytes),
  domain = createApartmentDomain(process.cwd());
const result = buildReceptionSprint(source, domain);
const write = (name, value) =>
  fs.writeFileSync(
    `${root}/${name}.json`,
    JSON.stringify(value, null, 2) + "\n",
  );
for (const [key, value] of Object.entries(result.variants)) write(key, value);
for (const [key, audit] of Object.entries(result.audits)) {
  write(`audit-${key}`, audit);
  for (const pull of [200, 350, 450])
    fs.writeFileSync(
      `${root}/plan-${key}-${pull}.svg`,
      receptionPlanSvg(
        key === "baseline" ? source : result.variants["A-P0"],
        audit,
        domain,
        pull,
      ),
    );
}
write("source-contract", {
  schema: "TypeBReceptionSprintContract/1",
  base_git_commit: "cfb7e8dee8621280c87121b6e60f7bb908b12695",
  render_git_commit:
    process.env.GITHUB_SHA || process.env.RENDER_GIT_COMMIT || null,
  source_path: "render-snapshots/current.json",
  source_sha256: createHash("sha256").update(sourceBytes).digest("hex"),
  source_scene: source.scene_revision,
  cloud_scene: source.source_scene_revision,
  cloud_storage_revision: source.storage_revision,
  canonical_sha256: source.canonical_sha256,
  ceiling_m: 2.5,
  approval: "DESIGN REVIEW ONLY",
  shared_changes: result.shared_changes,
  variants: Object.entries(result.variants).map(([key, s]) => ({
    key,
    scene_revision: s.scene_revision,
    architecture_variant: s.architecture_variant ?? null,
  })),
  cameras: result.variants["A-P0"].views,
});
console.log(
  JSON.stringify(
    {
      variants: Object.keys(result.variants),
      canonical_sha256: source.canonical_sha256,
      source_unchanged: fs
        .readFileSync("render-snapshots/current.json")
        .equals(sourceBytes),
      route_summary: Object.fromEntries(
        Object.entries(result.audits).map(([k, a]) => [
          k,
          a.routes.reduce(
            (counts, x) => ({
              ...counts,
              [x.status]: (counts[x.status] || 0) + 1,
            }),
            {},
          ),
        ]),
      ),
    },
    null,
    2,
  ),
);
