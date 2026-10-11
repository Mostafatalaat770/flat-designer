# R6 — functional task lighting and source-based joinery detail

Continues exact Draft PR #68 HEAD `b5276a1084dcf118a13aaeba27ba8ee3788d8f85`. Original A/P0, R4 ivory and R5 D1 greige are the lead visual study only. Full source layout remains `scene-3b86c557`; no architecture, ceilings, glazing, door geometry, appliance locations or cloud scene is changed.

## The five isolated candidates

All candidates retain the exact R5 D1 bytes as their locked input and the four original R5 kitchen day/evening cameras, including doors and projection. Renderer experiments are identified by snapshot and capture-template SHA, separately from the unchanged layout revision.

| Candidate | Reversible overlay |
|---|---|
| L0 | Original R5 D1 lighting/detail control; no added fixture or finish mesh |
| L1 | Shielded linear task-light profiles on the three saved uppers only |
| L2 | L1 plus two downward hood-task-light capability proxies |
| L3 | Hood-task-light capability plus two controlled aimed ceiling proxies; no under-cabinet profiles |
| L2-F1 | Identical L2 lighting plus separately labeled finish/detail skins |

No deleted legacy upper or light strip is restored. Under-cabinet profile lengths are saved width minus 50 mm: 1750/250/400 mm, set back 45 mm from the saved front. This illustrates shielding/service access; fixing holes and installation tolerances remain site-dependent. Linear emission is approximated by broad soft downward spot samples, with real shadow-casting lights. Hood emitters sit below the existing source proxy, not inside a selected product. L3 tests an alternative overhead light path where source uppers do not cover the hob and end landing; it does not alter the original downlights. Every source fixture remains unchanged. There are no measured lux, wattage, circuit, product or electrical approval claims.

Exact triangle raycasts additionally show the central L3 ceiling-to-hob ray hitting the hood proxy at approximately1672 mm before reaching the hob; L2 hood rays reach burner geometry around896 mm. This is a source geometry obstruction result for the central ray, not full-beam photometry. It supports using hood-provided task light rather than assuming a ceiling spotlight can illuminate through the hood.

## Geometry and fronts

`GEOMETRY_DETAIL_AUDIT.json` contains actual r160 source mesh fingerprints, bounds and proposed overlay placement. Every one of the 1025 existing scene mesh records, door transform and room footprint is invariant across the five candidates. Actual browser metadata separately verifies the cabinet/hood/panel bounds, door finish geometry and actual fixture/skin placements.

70 mm is exposed wall between the 860 mm counter top and 930 mm panel bottom. Source panels are roughly 4.5–5 mm horizontally behind the counter rear; no sealed junction is modeled. The 30 mm upper band applies only to overlapping panel/cabinet spans. West-low overlaps its backsplash for about 92 mm. North panel extents and corner/landing extents are not coincident. 320 mm is open wall above cabinets ending at 2180 below the fixed 2500 ceiling; it stays open. The hood-zone finish also needs nominal 70 mm above the general 1480 finish line to its 1550 proxy underside. Actual burner top and maker heat/extraction clearances remain HOLD.

F1 is a finish proposal, not extra masonry or cabinets: nominal 5 mm matching lower/upper skins and a hood-zone finish band preserve the original two panel meshes. Prefer a continuous washable facing after survey rather than many dirt-trapping strip joints. Seal worktop junctions/edges with compatible systems; establish corner returns, substrate, movement, thermal/moisture ratings, sockets and removable access before fabrication. The nominal 70/30/70 values are not cut dimensions. No top filler or ceiling drop is added.

`FRONT_SCHEDULE.json` / `.csv` inventory all 15 kitchen source IDs and the actual renderer face diagnostics. Original saved dimensions are separated from implicit renderer heights. Explicit uppers are solid sideboard boxes with generic seams/handles, not three proven hinged doors. Dishwasher and fridge fronts are regions of solid envelopes. Wet-service access, corner hardware, under-hob drawers and washer concealment remain HOLD. Countertop model segments 307/600/593 mm do not guarantee usable openings. The 875 mm dishwasher proxy top exceeds the 860 mm counter top; no continuous worktop/cavity above the machine exists in source data.

`INSTALLER_REQUIREMENTS.json` defines nine measurable sign-off checks. Request minimum clear cavity dimensions, exact manual drawings/tolerances, full-open door/basket envelopes, plumbing/electrical isolation and reachable service/cleaning access. Two-person operation requires a full-size mockup with actual users, appliance doors and kitchen/service doors in intended positions. No appliance is selected or ordered.

## Reproduce without overwriting R5 evidence

```sh
mkdir -p work/kitchen-r6
npm ci
npm run build
npm run check
npm run check:studio
node --test studio/local/current-baseline.test.mjs studio/local/owner-decisions.test.mjs studio/analysis/reception-sprint.test.mjs scripts/kitchen-r4-candidate.test.mjs scripts/kitchen-r5.test.mjs scripts/render-batch-plan.test.mjs
node scripts/verify-kitchen-finish-r4.mjs
node scripts/verify-p0-joinery-r3.mjs
node scripts/build-kitchen-r6.mjs
node --test scripts/kitchen-r6.test.mjs
npm install --no-save --package-lock=false playwright@1.58.2
npx playwright install --with-deps chromium
RENDER_OUT_DIR=renders/kitchen-r6 RENDER_CONCURRENCY=1 node scripts/render-variants.mjs design-development/kitchen-r6/L0.json design-development/kitchen-r6/L1.json design-development/kitchen-r6/L2.json design-development/kitchen-r6/L3.json design-development/kitchen-r6/L2-F1.json
node scripts/verify-kitchen-r6-renders.mjs
node --test scripts/kitchen-r6-render-verification.test.mjs
node scripts/export-kitchen-r6-review.mjs
node scripts/verify-kitchen-r6-review.mjs
```

Save command output using the workflow log names. Existing workspace Playwright/browser installs can be reused. Separate serial batches can be combined via `R6_BATCH_PATHS=...,...`; all must use the identical capture template and source camera inputs. Initial unrefined shadow images are excluded from the final review/ZIP and retained separately. The review embeds original PNG bytes offline and downloads native images, inventory and installer worksheets. Original R4/R5 files and all available prior PNG/metadata SHA values are verified unchanged. On fresh CI checkouts historical PNG preservation tests explicitly skip absent local image directories; committed source preservation never skips.

Local PASS and actual WebGL capture are distinct from mocked provider/storage contract tests. GitHub Actions billing/runner-startup remains a separate blocker; no manual reruns, billing change, merge, deployment or cloud save is performed. Keep PR #68 Draft and all owner/construction/manufacturer flags false.
