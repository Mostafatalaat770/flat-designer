# Master bathroom M2 — quiet spa detailing, not a construction change

**Type B, Oct 10, 2026 · interior reversible design experiment**. Master ensuite's M0 1450×800mm walk-in remains the selected design-development baseline; same 600×2050 fixed glass, 832mm nominal west entry, two 380×115×40mm shelves and 600×850mm mirror. **All physical object dimensions, mounts, plumbing, drains, wall/ceiling geometry, room furniture and household circulation are exactly the same as v55.**

## What is actually different

1. Current fixed panel `BATHM-glass-600-A1` is represented by generic `divider.solid-panel` which renders as a bulky panel. Opt-in `divider.fixed-clear-glass` displays one pale transparent pane with two slim brushed-nickel **concept** clips at foot, **no bulky top rail**. Glass thickness remains 18mm in source model even though visible plate is 9mm: not a spec or shop drawing. No structural fixing choice, drill position or wet seal is implied.
2. Two shower shelves `BATHM-shampoo-shelf-A1/A2` keep exact wall anchors and full **380×115×40mm** envelope. New `shelf.wet-tray` replaces visually boxy multi-shelf furniture with clean removable nickel ledges, shallow upturned lip and cleanable underside; supports shampoo bottles in principle but **rated shelf load and wall anchorage remain TBD**. No unknown-wall recessed niche cut.
3. Mirror `BATHM-A1-mirror` retains 600×850mm location and dims; `mirror.task-lit` shows an integrated **3000K** front-facing light strip, not the full light plan. It adds a non-photometric emissive visual marker; the real electrician must verify lux, glare, IP/zone, RCD/bonding and manufacturer product before wiring. An ordinary rear backlight alone is often poor task lighting; front-task light direction is preferable for facial grooming if implemented correctly.
4. Walls, floor, tile colours, wet-rated grip, shower mixer and ceiling downlights remain exactly source v55; do not try to signal construction quality with random LED strips, giant tile slabs or new duct routes. Separate wet-room and mirror task controls subject to as-built wiring review.

## What to reject even if the mockup looks impressive

- Any **22mm fake curbless floor** if slab, trap, slope and waterproof membrane have not been proved. A supplier-designed low threshold is acceptable if safer.
- A transparent screen that visually hides **dressing door splash**; its effective clear width is *not certified*. Shampoo shelf penetrations must maintain waterproofing.
- Poor lighting around mirror/face or unapproved electrical equipment close to wet splash.
- Metal finishes mixing black, chrome, gold and brushed nickel without a consistent design family; retain coordinated nickel.
- Indulgent recessed wall niches in a shared wall without qualified structural and MEP coordination.

## Exact deliverables

`studio/analysis/master-detail-jury.mjs` generates M0 existing vs M2 detail variants from the same saved current v55 scene, with `a.layout` matching source bit-for-bit. Six precise same-camera WebGL image outputs (2 original saved master views plus a third review-only camera authored from calibrated interior coordinates, identical in A and B), JSON audit, four unchanged physical envelope assertions and material/detail board. Both `interior-scene.js` and `studio/renderer/builders.js` support the three newly available opt-in interior variants, leaving existing variants untouched. Master M0 original remains saved in current snapshot and live cloud `scene-4821689` at revision55. Test evidence is not a substitute for manufacturer selected SKUs and installer/engineer signoff.

**No homeowner purchase / construction approval is being requested or implied.** Evaluate true rendered views before deciding whether to recommend the aesthetic M2 configuration.

## Review visibility amendment

The two original saved v55 master shower cameras point north and do not reliably expose the *south vanity mirror*. A third camera, `bath-master-dry-vanity-authored-review`, is a **newly authored camera for the A/B comparison only**: eye at world coordinates [-1.65, 1.62, 2.66]m, looking [-1.98, 1.33, 3.52]m, fov70; calibrated to the fixed Type B model origin. It is neither a claimed existing cloud capture nor a new wall/furniture position. All six WebGL frames use unchanged true source room geometry and matched camera parameters. Revisit if clip/no-see; do not pretend absence from a shot proves a product feature works.

## 10 October mirror renderer fidelity bug-fix (do not overstate physical realism)

Actual PR #58 guest **closed-door** WebGL shots exposed a visual flaw in the *opt-in* `mirror.task-lit` variant: a `MeshStandardMaterial` with `metalness:0.98` and no stable environment map produced almost BLACK rectangles, like a television screen. This is NOT the intended mirror design and not a meaningful aesthetic judgment. The two renderer pipelines therefore switch **ONLY this opt-in task-lit** mirror surface to a deterministic **neutral gray-blue, non-reflective `MeshBasicMaterial`** that remains legible under headless/no-env captures. It is explicitly labeled `NEUTRAL_GREY_NON_PHOTOREAL_PROXY` with `reflective_simulation:false` and `illuminance:"NOT_CALCULATED"`. The true source mirrors remain their original `rectangle` variants. The line above the panel still does **NOT** model lux, CRI, measured glare, IP/zone, real mirror reflective field or electrical wiring. Selected vendors/electrician and test-fit samples are mandatory before approval.
