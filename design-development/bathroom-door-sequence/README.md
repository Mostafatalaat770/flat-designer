# Bathroom door sequence — v55 baseline

The master bathroom has a modeled **closed outside → open and enter → close → shower approach → reopen, exit and close outside** sequence for a 500 mm circular body, at both 50 and 25 mm grids. With the door closed, the tested basin and toilet approach points are connected too. The fully open leaf blocks the selected shower route. This resolves the gap in the earlier review, whose closed-door cases started inside.

The guest bathroom admits the 500 mm body while fully open, but the planner cannot connect that entry state to a closed-door basin-use state at either grid. A point 300 mm in front of the basin is blocked with the door open; a point 400 mm in front is reachable on both grids. Do not interpret the earlier single blocked endpoint as proof that all handwashing positions are impossible.

| Baseline | 500 mm / 50 grid | 500 mm / 25 grid | 550 mm / 50 grid | 550 mm / 25 grid |
| --- | --- | --- | --- | --- |
| Master complete sequence | Found | Found | Not found | Found |
| Guest complete sequence | Not found | Not found | Not found | Not found |

These are discrete search outcomes under fixed waypoints and declared assumptions. In particular, failure does **not** prove that a real person cannot use the room. A fully open intermediate pose is imposed; a partial-opening strategy, an oval body/posture, continuous simultaneous body/door motion and other handle geometries are not established by this study.

## Reproduction

From the repository root, after the normal project build when needed:

```sh
node design-development/bathroom-door-sequence/verify.mjs
node design-development/bathroom-door-sequence/study.mjs --write
node design-development/bathroom-door-sequence/build-review.mjs
```

`verify.mjs` reproduces every saved result, rejects changed source/architecture, verifies opening/closing continuity, independently samples successful trajectories and reversed exit, and checks fixed-open and fixture-sweep conclusions. No new production runtime or dependencies are required. `review.html` is a standalone Arabic interactive plan: move the slider to inspect the body, leaf and handle across each tested stage. Its guest baseline animation stops after opening/entry because the closing continuation is not established.

Committed desktop/mobile PNGs, browser observations and five SHA-256 hashes are in `evidence/`. Both widths have no overflow or script errors; position/slider agreement and playback were checked. To regenerate this evidence, install development-only Playwright and Chromium, adjust the installed browser path in `check-browser.cjs` if required, and run `node design-development/bathroom-door-sequence/check-browser.cjs` from the repository root. This deliberately rewrites the evidence files; inspect and checkpoint any intended updates. Chromium uses `setContent` to render the self-contained report without a server or external scripts.

## Geometry and operation assumptions

- The exact canonical dressing/master-room union is used for master entry. Guest entry uses the exact guest floor plus a local portion of reception extending 1000 mm east of the room edge; that edge is an analysis crop, not a new wall. Canonical separating walls and their real model openings remain solid except at the modeled opening.
- All relevant floor furniture and resolved interior objects below 1800 mm are obstacles. The master walk-in shower rectangle is a traversable floor reserve; its fixed glass remains solid. Other inferred door leaves in the window are fully open.
- Body diameters are 500 and 550 mm, with a half-cell-diagonal clearance pad. Moving the body at a fixed angle and rotating the leaf at a fixed body position are separate transitions. Body translation uses four grid neighbours; each component's angles are monotone at 5° intervals.
- Leaf thickness is 18 mm. Door rotation is sampled at ≤1°, with a corner-motion bound covering the intervening angle. A corresponding handle-motion pad bounds the maximum modeled reach between samples. The handle is 60 mm from the latch tip; maximum body-centre-to-handle distance is an explicitly **assumed** 600 mm.
- The person may operate the door while crossing the threshold; requiring their full disk inside during every angle change would reject valid entry strategies. The end of each component must be fully inside. The master intermediate waypoint is the nominal 600 mm interior approach, shifted 25 mm south; guest uses its nominal interior approach. Their quantized centres are recorded.
- A second trajectory audit uses ≤5 mm translations and ≤0.25° rotations, checking actual polygons rather than the cached planner field. This is an independent numerical check with shared geometry primitives, not an independent source of site dimensions. Nominal gaps of roughly 24–41 mm on successful 500 mm master paths are **body-to-nearest-obstacle gaps**, not passage widths or comfort margins.
- Fixture endpoints test approach-space connectivity. Toilet sitting, body posture, handwashing reach, shower hardware, handles, hinge clearances, frame rebates, emergency access and code compliance remain unmodeled. Timings in the review animation are illustrative only.

Source: `scene-9cf45a73`, derived from saved cloud `scene-4821689`, storage 55. Locked canonical SHA-256: `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`. No architecture, active layout, saved cloud design or deployment is changed.

Next: compare the guest south-hinge inward leaf and north-hinge outward leaf at the **same current opening**, then test neighbouring reception interference. Historical widened/pocket-door studies are not approved architecture and are not inherited here.
