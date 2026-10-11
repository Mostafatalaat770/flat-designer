# Kitchen R5 — source-defined cabinetry, door finishes and kitchen night review

R5 retains the complete R4 ivory layout `scene-3b86c557`. The production viewer and extracted Studio builder now give the saved elevated wall sideboards authority over the demo counter's optional upper stack. Source snapshots, cabinet IDs, appliances, canonical architecture and every door opening/hinge/swing are preserved. No cloud layout or installed door finish is changed.

## Actual geometry findings

[GEOMETRY_AUDIT.json](GEOMETRY_AUDIT.json) measures the actual Three.js r160 meshes before and after the renderer correction. Coordinates are canonical plan X, plan Y and elevation in millimetres, not screenshot estimates.

- The four legacy counters `starter-20`, `K3-corner`, `K3-sink-base`, `K3-end-landing` generated an extra upper stack each. Four AABB intersections with the explicit uppers and another AABB intersection with the hood proxy were demonstrated. `K3-end-landing` generated an unsupported 600mm upper outside the saved north run.
- Authority: `KIT-A1-upper-north` (1800×330×700), `KIT-A1-upper-west-low` (300×330×700), `KIT-A1-upper-west-high` (450×330×700), all at 1480–2180mm. Host walls are `WALL-KIT-01-02` and `WALL-KIT-01-01`. Every explicit upper mesh and placement is unchanged.
- Four upper stacks, their four emissive proxy strips, and four fallback backsplash skins are suppressed. The two explicit backsplash panels remain. This removes 22 top-level meshes / 40 descendant meshes. All retained base fronts, worktops, props, source interior objects, hood/appliance meshes and architecture vertices are identical.
- The shared rule applies to kitchens with explicitly saved elevated wall sideboards. Legacy-only kitchens and other rooms keep their fallback. Separate source backsplash panels supersede generic skins independently of upper cabinets.
- AABB intersections flag geometric conflicts; they are not exact CSG intersections, usable storage quantities or physical clearance certifications. Generic front seams/handles and the hood remain approximate. The source backsplash starts at 930mm above an 860mm worktop proxy; its 70mm lower band and 30mm top gap need joinery/site detailing.

## Isolated finish experiments and cameras

[D0.json](D0.json), [D1.json](D1.json), [D2.json](D2.json) contain identical R4 layouts and the same six camera configurations. Door finishes are separate render-only inputs on the two existing leaves `OP-RECP-KIT` and `OP-KIT-TERSVC`:

| Option | Render finish |
|---|---|
| D0 | Original rendered brown `#A5825C`; no override |
| D1 | Warm greige paint proxy `#D8D1C5`, roughness 0.72 |
| D2 | Restrained procedural wood proxy `#BCA98F`, roughness 0.72 |

The unchanged layout correctly retains its computed `scene-3b86c557`; snapshot SHA, separate experiment metadata and capture-template SHA distinguish the visual experiments. This does not invent a new domain revision for unchanged source data. Actual leaf bounds, matrices, hinge position, width and swing are recorded before/after the finish application and asserted equal. No other leaf or hardware material is modified.

Four exact original day views are retained: entry-overview, wide-reception, kitchen-work, kitchen-relationship. New kitchen-work-evening and kitchen-relationship-evening copy the entire respective saved camera, changing only view ID and `viewer.night=true`, `viewer.hour=20`. Viewport is 1280×720. No geometry, door state, lighting fixture, brightness, temperature, lux, wiring or wattage is added or changed.

## Reproduce locally

```sh
mkdir -p work/kitchen-r5
npm ci
npm run build
npm run check
npm run check:studio
node --test studio/local/current-baseline.test.mjs studio/local/owner-decisions.test.mjs studio/analysis/reception-sprint.test.mjs
node scripts/verify-kitchen-finish-r4.mjs
node scripts/verify-p0-joinery-r3.mjs
node --test scripts/kitchen-r4-candidate.test.mjs scripts/render-batch-plan.test.mjs
node scripts/build-kitchen-r5.mjs
node --test scripts/kitchen-r5.test.mjs
npm install --no-save --package-lock=false playwright@1.58.2
npx playwright install --with-deps chromium
RENDER_OUT_DIR=renders/kitchen-r5 RENDER_CONCURRENCY=1 node scripts/render-variants.mjs design-development/kitchen-r5/D0.json design-development/kitchen-r5/D1.json design-development/kitchen-r5/D2.json
node scripts/verify-kitchen-r5-renders.mjs
node --test scripts/kitchen-r5-render-verification.test.mjs
node scripts/export-kitchen-r5-review.mjs
node scripts/verify-kitchen-r5-review.mjs
node scripts/export-kitchen-r5-review.mjs
```

Save command output using the names in `.github/workflows/kitchen-r5-webgl-review.yml`; export requires genuine successful logs. The managed workspace's already installed Playwright runtime and browser directory can be reused. Build regenerates the production viewer and capture template from source; historical generated viewer output is not the renderer implementation. An initial two-option capture exposed Playwright's default 30-second inline-page deadline. `render-variants.mjs` now uses the same explicit 180-second deadline for page load and frame readiness. Final captures run one software GPU task at a time; no screenshot recoloring or AI generation is used.

Outputs are the independent `renders/kitchen-r5/Review.html` and `Kitchen-R5-Review.zip`. The HTML embeds unchanged PNG bytes and supports offline native-PNG downloads. The ZIP contains sources, actual frame metadata, camera/PNG SHA manifests, geometry audit, command logs and delivery commit. Where the existing R4 image directory is available, two original SHA-verified R4 reference frames are included unchanged. In a fresh CI checkout those historical PNGs are absent; that explicitly named preservation test is skipped, while all committed R4 files are still byte-checked. R4's 16 local PNGs and metadata were all verified unchanged during this task.

## Review and release status

[DESIGN_QA.json](DESIGN_QA.json) records the inspection of all 18 final frames and the door/day-night assessment. [WEBGL_EVIDENCE.json](WEBGL_EVIDENCE.json) binds every final PNG and metadata file to its snapshot and actual WebGL context. Source A/P0 SHA remains `017a76a5fc6d5ff0e90f1adb10140c7098e3c2cc3e86d18e7a0b0c0fd439ec2a`; R4 SHA remains `6a745bdcde16a2b3820e26de0f367c4ac32d8b0a00204895eac1d2ef161b69ff`; canonical Type B v0.2.2 SHA remains `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`.

Local execution is separate from GitHub Actions. The account's confirmed failed-payments/spending-limit annotation prevents runner assignment; no repeated manual runs or billing/security changes are performed. Keep PR #68 Draft. Finish alternatives, task lighting, functional capacity, hood/gas/oven/dishwasher/washer clearances, physical samples, procurement, fabrication, MEP and owner construction release remain HOLD.
