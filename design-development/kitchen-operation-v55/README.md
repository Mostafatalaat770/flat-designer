# Current enclosed kitchen operation — v55

This study uses the **current enclosed L kitchen**, not the older K4/K12 island alternatives. It preserves architecture, service positions, furniture and the cloud design. Saved source remains `scene-4821689`, storage 55; review source is `scene-9cf45a73`. Canonical SHA-256: `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`.

Sixteen fixed stages contain 96 route queries, at 50/25 mm grids. Routes start 600 mm inside the kitchen. The terrace destination lies **inside the terrace after crossing the actual door threshold**, resolving the limitation of the older inside-kitchen terrace endpoint. Exact canonical kitchen/terrace floor union is used, with their separating wall and both inferred room-door leaves retained fully open.

## Findings and operation recommendation

- Closed appliances and the hypothetical dishwasher open 600/650 mm have a 500 mm-body route across the terrace threshold on both grids. Adding a 600 × 500 mm loading reserve 100 mm beyond the open dishwasher disconnects that route on both grids. Close the dishwasher before another person uses the terrace path; no furniture relocation is established by this result.
- A 600 × 500 mm centred laundry loader intersects the fully open terrace leaf. Moving that reserve 150 mm east removes the nominal overlap, but the terrace route remains disconnected. This is a **posture hypothesis**, not proof of loading reach, comfort or a final washer-door configuration.
- The assumed under-hob oven open 500/600 mm allows the terrace route. Its standing reserve allows passage too, but when the dishwasher is also open the oven operator overlaps its panel. A route existing in that **invalid operating state** must not be treated as usability.
- Sink approach is endpoint/grid-sensitive in some stages. The 50 mm-grid failure and 25 mm success are retained; neither establishes every possible sink-use stance.
- Inferred refrigerator hinges at the **east side of the plan** admit a coupled body/leaf opening to 90° and front approach at both grids; reversing the paths closes it and returns the body. The west-side hinge does not admit the tested sequence. This is a conditional hardware-review candidate; plan east/west is intentionally distinguished from manufacturer left/right terminology viewed from the appliance front.
- The open refrigerator affects the kitchen entry and cross-kitchen connections. A static route starting in a door-occupied point fails even when one person can move while operating it. Do not leave the fridge open while another person enters; a second moving occupant is unmodeled.

## Assumptions and limits

Dishwasher projection 600/650 mm; washer projection is a conservative generic **600 mm-wide / 500 mm-deep opening reserve**, not a modeled drum-door hinge. Oven projection 500/600 mm is centered under the current hob, whose oven position and exact SKU remain unconfirmed. Loading bodies are fixed 600 × 500 mm rectangles, not measured people or verified stooping postures. Only their nominal collision-free fit and a separate 500 mm circular traveller are tested.

Refrigerator hinges/face are inferred from the 650 × 650 mm source envelope and its rotation. Leaf thickness 18 mm, handle 60 mm from latch end, maximum centre-to-handle reach 600 mm. The shared door planner alternates body translation and door rotation; 5° rotation steps have ≤1° intermediate samples and a motion bound. An independent saved-trajectory audit uses ≤5 mm translations / ≤0.25° rotations. Actual handles, frame, integrated hinge, ventilation, pull-out drawers and opening beyond 90° need the final manufacturer's manual. Operation begins inside the kitchen; room-door open/close entry is not certified here.

All fixed routes use a half-cell-diagonal safety pad and four neighbouring cells. Found paths are independently sampled against polygons, and 14 important outcomes are cross-checked with the repository BFS. Both numerical checks share canonical geometry; neither supplies independent site dimensions or a code/ergonomic approval.

## Review and reproduce

Open `review.html` for the standalone Arabic stage selector and the east-hinge fridge animation. `results.json` contains full geometry, reserves, successful paths, rejected states and all four fridge-operation searches. Desktop/mobile PNGs, browser observations and hashes are in `evidence/`.

```sh
node design-development/kitchen-operation-v55/verify.mjs
node design-development/kitchen-operation-v55/study.mjs --write
node design-development/kitchen-operation-v55/build-review.mjs
node design-development/check-operation-review.cjs kitchen-operation-v55
```

The geometry scripts use the normal repository model build. Browser evidence regeneration needs development-only Playwright and Chromium; set `CHROMIUM_PATH` for another installed browser. It rewrites the evidence files deliberately. `--geometry-only` skips evidence hash verification while authoring. No product has been purchased and no model, active saved design or deployment is changed.

Next: six-chair dining occupation/pull-back with passage, then actual appliance opening/installation drawings and site measurements before a combined fit decision.
