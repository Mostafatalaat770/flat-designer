# Local Apartment Type B workspace

The isolated workspace in this experimental branch starts from a frozen **Whole Apartment A11.1 (scene-85fd2cac, storage revision 50)** snapshot from `master`, copied to `studio/local/sources/verified-master-v50.json`. It intentionally does **not** import the unapproved K12 kitchen-open study in this branch's `render-snapshots/current.json`, which still has two architectural hard failures. **Family A.7 / scene-9e210720** and all earlier studies are retained as historical candidates. Build-time seed generation is offline and validates the full layout before writing generated app data. See [integration evidence](../local-qa/INTEGRATION_20261006.md). Its architecture is the locked repository model:

`734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`

For the reversible design workbench, read [Explore & Verify](EXPLORE_VERIFY.md): A/B true Three.js views, live material/light settings, a hard canonical verification gate, and explicit new immutable local version saving. No public Site deployment is performed.

## Run

Use Node 24+ (tested on Node 26). From this repository:

```sh
npm ci
npm run build
npm run studio:build
npm run studio:review
python3 local-qa/serve.py --port 4176
```

Open **http://127.0.0.1:4176/_qa/workspace/** and **http://127.0.0.1:4176/_qa/workspace/explore.html** for live A/B materials and Verify Mode. Review evidence at **http://127.0.0.1:4176/_qa/integration-review.html**. Historical generated evidence remains in the preserved earlier checkout on port 4174; its sources and complete study data are retained here. The integration review includes six new Natural views. For hot reload, leave the local server running and run `npm run studio:dev`; open http://127.0.0.1:4175/_qa/workspace/.

The server binds loopback only. Production API/MCP routes and cloud persistence are disconnected. The sole local POST route, `/_qa/workspace-export`, validates the brief, canonical geometry and binary GLB before saving an immutable local render export. It accepts the exact local origin, not production credentials. Export jobs, generated pages and private production recovery files are ignored by Git; keep backups of those local artifacts.

## Design workflow

Select a room and a standing camera. Natural **42° vertical FOV / 1.70 m eye** is the primary spatial view; Wide 60° is for composition. Scale Check displays a 1.70 m human and a 1.00 m ruler. Saved, orbit and walking modes share the canonical scale; standing camera preflight rejects blocked viewpoints.

Select furniture in the view or inspector. Dimensions mean its **outer footprint**. Apply edits through the existing `ApartmentDesignProposal/2` contract. Hard validation failures reject the whole proposal; warnings require spatial context. The current baseline counts are computed by the validator against the frozen v50 source, not copied from the old v39 report; historical A.7 retains its earlier evidence.

Undo/redo works during the current session. Drafts and the design log persist separately in local browser storage. Versions are immutable named snapshots; import/export uses the existing `ApartmentDesignBrief/1`. Export important versions rather than relying solely on browser storage. The before/current comparison uses matching camera positions and lenses. Finish each controlled change by writing its observation and keep/revert decision after inspecting several Natural views.

Browser keys are scoped to the v50 seed: `type-b-workspace-draft-scene-85fd2cac-v1` and `type-b-workspace-scene-85fd2cac-v1`. Older drafts are retained without auto-loading; versions from the legacy key and earlier seed keys remain available. Legacy study keys and production history remain separate. Malformed saved data is rejected rather than silently overwritten. Historical variants are retained.

## Detailed furniture

Import a **self-contained binary GLB plus ApartmentAsset/1 metadata JSON**, together. Declare actual outside dimensions `[width, height, depth]` in millimetres, source, licence, attribution, metres/millimetres units, +Y up, +Z/-Z forward and centre-floor origin. Measured dimensions must match the declaration within 1%/5 mm and the selected footprint within 5 mm. Conversion is uniform; no independent axis stretching.

`GENERIC`, `REFERENCE` and `REAL_PRODUCT` are distinct. REAL_PRODUCT requires a product reference. Material variants match GLB material names and record colours, roughness and metalness; REAL_MATERIAL also requires a material reference and source. Embedded glTF PBR textures load with the model; standalone texture-library authoring remains future work. A named conceptual reference does not turn a procedural mesh into manufacturer CAD.

The locally authored, CC0 generic table sample exercises import and finish controls; it is not a real SKU. Template metadata contains explicit TBD values and must be completed before import. This first importer supports freestanding floor furniture. Mounted fixtures require a future explicit mounting-height contract.

**Asset imports and finish choices currently live in the renderer session.** Retain original GLB/metadata files and re-import after a reload or version restore. The brief alone cannot reproduce those imported meshes. The render export includes the actual imported mesh and its asset records. Durable per-version asset storage is the next integration, before treating detailed-asset variants as complete saved designs.

## Blender / Cycles

In Versions, prepare and download the GLB and render-job JSON. Automated local QA may also save those bytes through `/_qa/workspace-export`. Outputs live under `local-qa/site/render-exports/<scene-revision>-<GLB-hash-prefix>/`. Both files must come from the same export.

```sh
BLENDER_BINARY=/path/to/Blender npm run render:local -- \
  --export-id scene-9e210720-ef95c7247897 \
  --view family-v7-family --samples 64
```

Blender 4.5.3 LTS arm64 was downloaded from Blender's official distribution and checksum verified. This session uses `/private/tmp/flat-designer-Blender.app/Contents/MacOS/Blender`; the runtime is not bundled with the repository. Set BLENDER_BINARY to a permanent installation for future sessions. Omit `--view` to use the exported camera. Both historical `family-v7-*` and current `synced-*` view overrides are checked against the exported layout before launching Blender; Blender then checks actual position, quaternion direction and vertical lens after import.

Round-trip checks cover 64 canonical wall transforms, 52 exported opening components, 13 floor polygons, 10 finished ceilings, 51 furniture transforms/bounds and the standing camera. Geometry mismatch fails with a nonzero exit. The scene is imported from the real exported GLB; architecture is not independently remodelled. Three `[x,y,z]` converts to Blender `[x,-z,y]`.

The reproducible daylight preset, generic geometry and 32-sample evidence images are **EXPLORATORY**. Present images are dim and lack detailed fabric/wood/stone response. Glazing, curtains, decorative lights, exposure and real product geometry require deliberate calibration. These are working render handoffs, not finished photorealistic design approval.

## Verification and boundaries

```sh
npm run check:study
npm run check:studio
npm run check:workspace
npm run check
node studio/renderer/parity-check.mjs
```

Eight study/domain tests, eight browser-domain/GLB/mesh-bounds tests and five seed/history tests pass. The five original contract suites pass. TypeScript/Vite builds pass. Historical A.7 evidence: thirteen full-size extracted-renderer views are pixel-identical to their classic references; the final 52-step Argent replay passes at 0.00% difference. Kitchen, family bath and ensuite have additional repeatable standing captures. Historical workspace comparison/navigation/panels, lens/scale, edit/undo, GLB loading and finish flows pass in Chromium at 1600 × 857. The current revision-39 integration adds a 21-step UI replay and a 24-step six-view capture replay, both passing; these provide structural checks and inspected screenshots, not new pixel-diff approval. Historical pixel baselines are stable desktop evidence; mobile layout has not been manually verified.

The UI lives in `app/`; `domain/apartment.mjs` adapts unchanged Node contracts and `build-domain.mjs` compiles the same declarations for the browser. `renderer/builders.js` is extracted source, not rebuilt by patching HTML; `renderer/engine.js` owns WebGL, camera and lifecycle. `assets/` owns metadata, measured placement and tests. `render/` owns GLB handoff validation and Blender jobs. Keep the classic build separate until its final retirement is explicitly planned.

Known engineering follow-up: split the remaining large renderer closure, reduce App controller complexity, lazy-load exporters and asset tools, persist assets per saved version, and broaden device QA. React Doctor reports 90/100, 0 errors and two maintainability warnings (controller complexity and component size); Vite reports a large shared 3D bundle. No production migration, deployment or architecture changes were performed.
