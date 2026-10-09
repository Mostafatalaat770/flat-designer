# Warm contemporary apartment review

Owner direction: standard generic appliance placeholders; prioritize a beautiful, coherent apartment with considered furniture proportions, materials, lighting and movement. Model/brand shortlisting is not a dependency.

The local candidate `scene-497a734f` applies 83 reversible interior operations to unified furnishing review `scene-c9c055c1`. It retains every furniture plan position, dimension and rotation, all canonical architecture, enclosed L kitchen, opening treatments and the 2500 mm ceiling. The guest outward leaf stays a separate conditional circulation overlay. Neither cloud storage nor the active render snapshot is changed.

Read [the Arabic image review](REVIEW_AR.md) directly on GitHub. Download this folder with `evidence/` to use the offline [interactive comparison](review.html). It has 11 matched views, including two Bedroom 1 compositions and an explicit night state. Choose a room and switch between proposal, source or both. Native images are conceptual renderer output; they are not photometric calculations or manufacturer CAD.

The direction uses chalk ivory, desaturated oak, linen, restrained olive and matte bronze. Reception/hall/kitchen share a light limestone-look floor; bedrooms/dressing retain wood. Joinery shares the oak/ivory family. Explicit living/buffet artwork replaces the automatic reception art. Bedroom 1 artwork is centred above the relocated R4 chest; its 400 x 600 portrait format fits the host wall. Bedroom 2 gains an upholstered headboard within the same frame reserve. Dining pendant changes to a 1100 x 100 x 120 mm linear concept.

Frozen files:

- `proposal.json`, `snapshot.json`, `brief.json`, `summary.json`: reproducible interior proposal and full source-independent review snapshot/brief. Static validation is 192 pass / 76 warning / 0 fail, not a statement that all concerns are resolved.
- `VISUAL_AUDIT_AR.md`, `VISUAL_REVIEW_AR.md`: actual before/after visual judgments and representation limits.
- `cameras.json`, `evidence/*`: 22 native 1600 x 857 frames with exact layout/camera and ready-asset metadata; four desktop/mobile review screenshots.
- `circulation.json`: all 266 source-comparison queries. 228 candidate queries recomputed, 38 baseline queries reused only after exact geometry equivalence. All 212 found candidate paths independently sampled at <=5 mm; 28 source baseline paths already independently audited. All statuses match the unified study, with 240 found paths total. Normal/occupied dining states reach 18 of 19 destinations on both 25/50 mm grids. Storage opening blocks the selected desk stance; DW loading blocks service terrace; master shower needs its separate door sequence. These are nominal planning assumptions, not comfort/site certification.
- `browser-qa.json`, `evidence-manifest.json`: 66 desktop/mobile UI checks and content hashes. Named night captures must differ from the same daytime camera. Camera normalization supplies daytime defaults; `capture.mjs` explicitly applies night after normalization.

Reproduce the proposal and regenerate visuals only when needed:

```sh
npm ci
npm run build
node design-development/aesthetic-v55/build.mjs --write
node design-development/aesthetic-v55/circulation.mjs --write
node design-development/aesthetic-v55/capture.mjs before
node design-development/aesthetic-v55/capture.mjs after
node design-development/aesthetic-v55/build-review.mjs
node design-development/aesthetic-v55/qa.mjs
node design-development/aesthetic-v55/verify.mjs --write
```

Native capture/UI QA require Playwright and Chromium; this environment provides `playwright` and `/usr/bin/chromium`. `CHROMIUM_PATH` can select another Chromium installation. Browser launch needs the environment's socket/network permission even for offline/local pages. Captures use inline native renderer assets and disconnected cloud code.

For frozen evidence verification, run `node design-development/aesthetic-v55/verify.mjs`. It checks deterministic proposal/brief reproduction, all exact frame metadata, matched cameras, PNG dimensions/hashes, route status/audit evidence and UI coverage. It does not rerender the images or repeat the 228 expensive searches. If source renderer/assets change, regenerated images are new evidence and should be reviewed and checkpointed again.

Commit and push each completed logical step and verify the remote branch SHA, as required by the owner and `AGENTS.md`. Do not infer approval to merge, deploy or replace the active cloud scene from this review checkpoint.
