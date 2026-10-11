# Kitchen R4: implemented, matched WebGL owner review

The four existing A/P0 furniture fronts now use soft ivory in an isolated render-only candidate. The integrated dishwasher also resolves `kitchen-soft-ivory`, and all four saved warm-theme colors persist through a real production theme switch. The original source, room geometry, architecture, appliances, cameras and all approval flags are preserved.

- Source: `../reception-sprint/A-P0.json`, SHA256 `017a76a5fc6d5ff0e90f1adb10140c7098e3c2cc3e86d18e7a0b0c0fd439ec2a`, `scene-9e86635b`, original cloud `scene-4821689` v55.
- Candidate: [A-P0-IVORY.json](A-P0-IVORY.json), true domain revision `scene-3b86c557`, SHA256 `6a745bdcde16a2b3820e26de0f367c4ac32d8b0a00204895eac1d2ef161b69ff`.
- [CANDIDATE_AUDIT.json](CANDIDATE_AUDIT.json): exactly nine layout leaf changes; full recursive comparison, identical full cameras and domain validation. Existing 77 warnings remain, with zero failures.
- [WEBGL_EVIDENCE.json](WEBGL_EVIDENCE.json): 16 newly executed 1280×720 Three.js WebGL captures, matching all eight original cameras, input snapshot/image/metadata/camera hashes and actual SwiftShader context. Five reception pairs are pixel-identical because the edited fronts are outside those views.
- [DESIGN_QA.json](DESIGN_QA.json): visual verdict after opening the actual kitchen images and all comparison views. Keep R4 for design review; the brown original doors, legacy synthetic upper masses, generic seams/shadows and all functional HOLDs are disclosed.

## Reproduce

Node 24 and Python 3 are used by the existing project pipeline. Install Playwright separately without changing the package lock.

```sh
npm ci
npm run build
npm run check
npm run check:studio
node --test studio/local/current-baseline.test.mjs studio/local/owner-decisions.test.mjs studio/analysis/reception-sprint.test.mjs
node scripts/verify-kitchen-finish-r4.mjs
node scripts/verify-p0-joinery-r3.mjs
node scripts/build-kitchen-r4-candidate.mjs
node --test scripts/kitchen-r4-candidate.test.mjs scripts/render-batch-plan.test.mjs
npm install --no-save --package-lock=false playwright@1.58.2
npx playwright install --with-deps chromium
RENDER_OUT_DIR=renders/kitchen-r4 RENDER_CONCURRENCY=2 node scripts/render-variants.mjs design-development/reception-sprint/A-P0.json design-development/kitchen-finish-r4/A-P0-IVORY.json
node scripts/verify-kitchen-r4-renders.mjs
node --test scripts/kitchen-r4-render-verification.test.mjs
node scripts/export-kitchen-r4-review.mjs
node scripts/verify-kitchen-r4-review.mjs
node scripts/verify-kitchen-r4-review-browser.mjs
```

Keep the command output in `work/kitchen-r4/` using the log filenames in `.github/workflows/kitchen-r4-webgl-review.yml`; the exporter requires genuine success logs. In the managed environment, npm cache and Playwright browsers were stored under `work/` because the default home cache was not writable. One original and one candidate evening view needed the existing one-time timeout retry; both final captures passed.

Outputs are `renders/kitchen-r4/Review.html`, a fully standalone Arabic review with the original PNG bytes embedded, and `Kitchen-R4-Review.zip`, containing the same HTML, all original PNGs/metadata, exact source/candidate/canonical JSON, SHA manifests and execution logs. Large generated evidence stays outside Git. The downloadable ZIP is linked from PR #68 and delivered in the task output.

## Rendering and pipeline corrections

The hidden production 2D SVG now retains finite dimensions in the isolated capture page. Its initial `fitView()` previously generated a `NaN` viewBox. WebGL captures now reject page, console and shader errors, record their actual GL implementation, and retain existing missing-texture checks. No apartment renderer geometry or finish shader was changed.

The existing owner workflow had three latent local failures, fixed without relaxing source/approval contracts: its R3 assertion referenced an absent output field, its floor precedence regex rejected an equivalent trailing comma, and it rejected the valid two-row prototypes CSV for being under 500 bytes. The checks now use the real `source_regions_mm`, accept a syntactic trailing comma, and validate the exact expected CSV record counts. All owner board builders and the complete inline integrity gate executed locally after importing the SHA-verified original PR62 artifact; that historical artifact is kept separate from the new R4 render evidence.

GitHub Actions run `38082633258` did not execute any steps or receive a runner. Its failure annotation explicitly identifies failed account payments or a spending limit. Local PASS is not GitHub Actions PASS. The owner must resolve Billing & plans before a cloud run can certify the new head. No billing, security, access settings, master merge, cloud scene write or production site deployment was performed.

## Design limit

The legacy `counter` asset includes synthetic upper masses that inherit `f.color`. R4 therefore also recolors those existing portions of each permitted counter proxy. The separately recorded upper objects remain ivory with unchanged geometry and material references. No synthetic cupboard is certified as usable storage, no 450–500mm drawer is added, and the saved evening reception camera does not directly test the new kitchen fronts at night. Next: manufacturer manuals and a full-size dishwasher/hob/oven operating mockup, then physical finish samples beside the preserved brown doors.
