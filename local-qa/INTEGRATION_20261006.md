# Local Studio integration — 6 October 2026

The working integration branch is `agent/local-studio-integration-20261006`, based on GitHub master `dd2e443` and `agent/whole-apartment-render-pack` through `0884fdf`. The original dirty Sites-export checkout and its generated evidence remain preserved separately. Use the integration checkout for subsequent work.

The pinned local design is **Whole Apartment A3 — Guest WC + Kitchen Usability**, `scene-29d4aa6d`, source storage revision **39**. The connected Studio was read and its complete layout compared with `render-snapshots/current.json`; they matched. Builds use the committed snapshot offline, never production storage. Snapshot SHA-256: `6e8dd764ec3ac2388c26e16c86ea9f0af9c7ada5b4a4d3a6660f9af937520f9e`. Later live edits are not silently pulled into this checkout.

Canonical geometry hash remains `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`. No architectural or furniture changes were made during this integration. Family A.7 (`scene-9e210720`) and all earlier local studies are preserved as historical candidates. The earlier prompt/image pack depicts A.7, not revision 39.

## Branch overlap decisions

| Branch / PR | Decision |
| --- | --- |
| Furniture-editing PR #2; camera/scale PR #3 | Already merged into master; do not remerge their old branches after squash merges. |
| `infra/github-actions-renderer-v1` | Its four commits are ancestors of the whole-apartment render branch; integrate once through that branch. |
| `agent/whole-apartment-render-pack` | Integrated through `0884fdf`, retaining snapshot, review history and GitHub rendering workflow. |
| `chatgpt-reception-renders-20261005-v1` | Image evidence branch remains separate; no generated image assets copied over source files. |
| Dependabot PR #1 | Incorporate exact esbuild 0.28.1 into the full workspace manifest and regenerate its lockfile. Do not take the old lockfile wholesale. The dependency PR remains open for separate review. |

## Local run and review

Use Node 24+:

```sh
npm ci
npm run build
npm run studio:build
npm run studio:review
python3 local-qa/serve.py --port 4176
```

Open http://127.0.0.1:4176/_qa/workspace/ and http://127.0.0.1:4176/_qa/integration-review.html. The preserved historical server on 4174 is separate. The server binds loopback, rejects production API/MCP routes and mutations, and accepts only the validated local GLB/job export route from its exact origin. Traversal cannot expose `local-qa/private/`.

The review generator accepts an ignored `local-qa/reports/integration-captures.json` array of `{id,path}` entries pointing to locally captured PNGs. Screenshots and generated pages remain local artifacts; a fresh clone builds a working Studio and review with live-view links, then captures its own PNGs. The existing six reviewed PNGs and historical prompt pack are preserved in the durable integration checkout.

## Verification

- Classic build and all five original contract suites pass.
- TypeScript/Vite build passes. Eight study/domain tests, eight browser-domain/GLB/mesh-bounds tests and five new seed/history tests pass: **21 targeted tests** in addition to the original suites.
- Current layout: **165 PASS / 74 WARNING / 0 FAIL**. Warnings remain subject to spatial and installation review.
- Eighteen local camera views cover all 13 canonical areas at Natural **42° vertical FOV / 1.70 m eye**. Original source cameras remain unchanged in the branch snapshot; normalized local cameras retain its door presentation states.
- Runtime inspection verifies 1.70 m human, 1.00 m ruler, no pending textures, texture errors or hard scene failures.
- `studio-integration-v39.yaml`: uninterrupted **21-step PASS**, including Scale Check, version history and kitchen/WC/reception navigation. `studio-synced-views-v39.yaml`: uninterrupted **24-step PASS**, capturing six full-size Natural views. These runs assert readiness and provide inspected screenshots; they do not claim new pixel-diff or photorealism approval.
- React Doctor scans all 12 workspace files: **90/100**, zero errors, two existing App complexity/size warnings. Vite reports a large shared 3D bundle. Decomposition and asset persistence remain explicit follow-up work.
- Historical and current render-camera IDs both resolve in the Node runner and Blender script. Existing A.7 Cycles evidence remains exploratory; no new revision-39 Cycles render is claimed by this integration.

## Design log for this integration

| Hypothesis | Change | Validation | Screenshot observation | Decision |
| --- | --- | --- | --- | --- |
| Source history had diverged from the local A.7 candidate. | Pin the matched revision-39 snapshot; retain A.7 as an explicit historical baseline. | Exact complete layout/revision match; seed rejects stale revisions and foreign geometry. | Reception, kitchen and WC appear in the current branch arrangement. | Keep both, do not overwrite either. |
| Wide source cameras distort human-scale judgement. | Derive 42°/1.70 m local cameras without changing source snapshot or door states. | All 18 cameras pass preflight; original source remains byte-identical. | Natural close views reveal density and use constraints but do not show every zone in one frame. | Keep; add reverse and wide overview views for the next design study. |
| The design is ready for a refinement pass, not completion. | Capture and critique six unchanged baseline views. | 0 hard failures; two browser flows pass. | Reception sideboard is visually heavy and competes with pendant/art. Kitchen prep surface and fitted fronts need work. Bathroom bowl, mirror and accessories are generic and do not establish comfortable use. | Keep baseline as evidence; refine furniture/materials in a new named local study. |

Next design work should establish family seating capacity and reception hierarchy, kitchen appliance/prep/use envelopes, and bathroom standing/access views before adding accessories. Any open-kitchen proposal remains an architectural investigation requiring explicit approval. The 130 mm ceiling void does not establish concealed HVAC feasibility. Detailed asset imports still belong to the renderer session; retain source GLB/metadata until per-version asset persistence is implemented.

The final remote-head check found commit `0884fdf` after the initial sync. Its compact-vanity bowl correction was merged without conflicts and ported to the extracted renderer. The scene/storage revisions remain unchanged; only snapshot review notes and generic rendering change. A real Three.js mesh-bounds regression covers compact and standard single/double vanities. Both UI and six-view capture flows were replayed on the resulting build. This is still generic conceptual fixture geometry, not product CAD.
