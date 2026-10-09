# Six-seat dining operation — v55

The **preferred local furnishing candidate is `table-north-150`, scene `scene-6681e65b`**: move the 2000 × 950 mm table, all six 510 × 530 mm chairs and the pendant 150 mm north, retaining all sizes and relative seat spacing. This is a review candidate, not an active saved design or construction decision. The `end-inset-60` alternative, scene `scene-4fb2b52b`, retains table/pendant positions and moves four end chairs 60 mm inward; both are preserved under `candidates/` as normalized proposals, complete local snapshots and design briefs.

The review uses current enclosed-kitchen v55 geometry, not historical island/open-plan layouts. Source `scene-9cf45a73`, saved cloud `scene-4821689`, storage 55; canonical SHA-256 `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`.

## What the checks establish

- **Current layout:** pulling six chairs 350 mm with nominal seated bodies preserves the tested paths. At 400 mm the southeast chair overlaps shoe storage; at 500 mm both the chair and its nominal occupant conflict. A main walking route remains present even in those invalid occupied states, so route success alone must not certify them.
- **End chairs 60 mm inward:** no modeled furniture/body conflicts at 350/400/500 mm pulls with 550 mm seated bodies. Chair centre spacing falls from 700 to 640 mm; nominal neighbouring chair edge gap falls from 190 to 130 mm. Main movement paths pass, but a direct serving endpoint becomes blocked at 500 mm pull. A diagonal serving endpoint is retained as an explicit alternative.
- **Table group 150 mm north:** 700 mm seat spacing is retained. All nominal 350/400/500 mm occupied stages avoid conflicts and retain main paths. The exact directly-behind northeast serving endpoint is blocked near the sideboard corner; a point 150 mm west of it is reachable on both grids. This is endpoint sensitivity, not proof that serving is impossible.
- **Seat access with five others occupied:** at 400 mm pull, a 500 mm traveller can reach every temporarily vacant chair centre in the north-move candidate with the entrance door open or closed, at 25 mm resolution. In the end-inset candidate, five of six are reachable with the entrance leaf fully open; the southeast transfer point is disconnected. Closing the entrance leaf restores all six. A coupled circular-person/leaf closure from inside reception is separately found and independently audited for both candidates at both grids. Initial entry from the unmodeled lobby and actual sitting motion remain unproved.
- **Conditional guest outward door:** with the entrance closed and six nominal people seated at 400 mm pull, north-move main living/kitchen and diagonal-serving routes survive 90° closed / 45° intermediate / 0° fully outward-open fixed guest-leaf states on both grids. End-inset is grid-sensitive fully open: those routes fail at 50 mm and pass at 25 mm. Both alternatives' chosen guest-door approach endpoint is blocked at 45°. These are fixed-angle interface checks, not simultaneous moving-person/door safety.
- **Stress retained:** in the end-inset comparison, a 600 mm pull and nominal 600 mm seated body causes southeast-occupant/shoe-storage overlap. Do not treat a model success at smaller envelopes as a universal fit.

## Evidence and method

Twelve stages contain **120 main route queries**. There are **24 seat-access cases**, **60 combined guest-door route cases**, and **four coupled entrance-closure searches**. Sixteen important route results are cross-checked with the repository BFS. All found routes and body/leaf trajectories have independent numerical audits against their actual polygons. Both methods share nominal canonical geometry, so neither is an independent site survey.

Reception is clipped at y=4950.754 mm, aligned with the original grid phase, retaining only actual canonical floor. The top edge is an analysis crop. Seat-transfer checks use a smaller rectangular subset of actual reception floor. Four-neighbour 25/50 mm grids use a half-cell-diagonal safety pad; traveller radius 250 mm. Seated circles of 275 mm radius are circumscribed 24-gons, combined with the actual chair rectangles. Each body may overlap its own chair intentionally; different occupants and other furniture are checked. Stowed chair/table tuck overlaps in the original closed arrangement are retained intentionally. The pendant's projection lies entirely above the already-solid table footprint and is redundant for these floor paths; its position is retained/aligned in the saved candidate layout.

The seated circle is a generic occupied envelope, not a measured human, leg position or comfort/accessibility standard. Seat access removes one person's circle and their chair obstacle to inspect transfer to the centre; it does **not** prove seating, standing up or chair translation kinematics. Serving points test standing connectivity, not tray reach or all possible service stances. Pulled chairs are simultaneous fixed states, not a continuous animation. Shoe storage is closed; its real opening, chair/body size, table underframe and actual six-person comfort remain to be checked.

## Reproduce

```sh
node design-development/dining-operation-v55/verify.mjs
node design-development/dining-operation-v55/study.mjs --write
node design-development/dining-operation-v55/write-candidates.mjs
node design-development/dining-operation-v55/build-review.mjs
node design-development/check-operation-review.cjs dining-operation-v55
```

Open `review.html` for the standalone Arabic stage/goal/grid selector and the source-backed north-move dining/guest-door diagram. Full geometry, candidates, rejected states and paths are in `results.json`; desktop/mobile browser records, PNGs and hashes are under `evidence/`. Evidence regeneration needs development-only Playwright/Chromium; set `CHROMIUM_PATH` as required. `--geometry-only` is available while authoring before browser hashes exist.

The active design, ceiling, walls and openings are unchanged. Next: combine preferred furnishing studies for a coherent review, then site-measure the real appliances, hinges, chair movement, table, joinery, window operation and family shower enclosure before selecting a final fit. The guest-door overlay remains conditional architecture/hardware analysis.
