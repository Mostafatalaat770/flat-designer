# Unified local furnishing review — v55

This candidate combines the preserved bedroom `R4` proposal with dining `table-north-150` against review source `scene-9cf45a73`, saved cloud `scene-4821689`, storage 55. Its normalized proposal contains 12 updates to distinct objects. Applying either component first produces exactly the same final layout. `compose.mjs` checks this, full brief import, zero static validation failures, unchanged architecture and unchanged unrelated contents.

The bedroom retains the bed, uses the 1100 × 600 mm west desk, moves the wardrobe 120 mm north and uses south storage 800 × 350 × 1000 mm. The table, six chairs and pendant move 150 mm north without reducing seat spacing. The current enclosed L kitchen is retained. The guest outward door remains conditional analysis; it is absent from the furnishing proposal and snapshot.

`proposal.json`, `snapshot.json`, `brief.json` and `composition.json` preserve the complete local candidate `scene-c9c055c1` and hashes of its two source proposals. Static validation is 186 pass / 74 warning / 0 fail. The candidate is production-disconnected and has no cloud storage revision.

## Connected circulation

`results.json` preserves **seven fixed states, 19 destinations and both 25/50 mm grids: 266 route queries**. Routes start 600 mm inside reception and cross actual modeled thresholds. Baseline, combined closed furniture, six dining occupants, dining plus open bedroom storage, dining plus desk occupant, dining plus dishwasher loading, and a conditional outward guest-door overlay are separate states.

- The combined closed and six-occupied dining states reach all 18 tested destinations other than the ensuite shower at both resolutions, including the selected bedroom 1 bed, wardrobe, desk and storage positions. Source bedroom 1 endpoints fail; other room destinations retain their routes. Desk/storage comparison endpoints follow their respective source and candidate positions; they are declared standing proxies, not all possible access positions.
- Dining plus 350 mm storage opening retains bed, wardrobe and open-storage access, but blocks the selected desk approach at both grids. This finding was outside R4's earlier open-storage goal set. It does not show every possible desk stance is impossible. The desk-occupant state is separate; opening storage alongside that occupant is not certified.
- Dishwasher loading disconnects the service terrace at both grids while the other normally available destinations retain their paths.
- The conditional guest outward leaf, with entrance closed and dining occupied, retains the tested routes. This is an explicit fixed-angle overlay, absent from the saved proposal; use the earlier door-cycle study for the moving leaf and its unresolved neighbouring-person interaction.
- The ensuite shower remains disconnected with its room leaf fully open. The separate bathroom sequence found an opening/entry/closure/use/reverse-exit cycle. A closed leaf inside that sequence must not be substituted into an entrance-to-room static route, which would incorrectly block entry.

The floor is the union of canonical room polygons and **180 mm strips at internal openings**. These source-position strips bridge threshold discrepancies, including the small kitchen/reception gap. Exterior entrance/window strips are excluded. Extracted outer and hole rings retain canonical wall solids; no wall, opening or room is edited. Ring membership is checked against the original room/threshold union at 25 mm samples. Internal terrace glazing is assumed clear at its drawn full width; actual sliding sash clearance is unresolved. Start/goal cell centres are saved explicitly. A 500 mm circular traveller plus half-cell-diagonal margin is an estimate, not comfort, accessibility or site certification.

Found paths have separate continuous-segment samples at intervals no larger than 5 mm against all actual obstacles and the floor union. `verify.mjs` reconstructs stage geometry from the current frozen source, audits every saved found path, checks component composition and compares four important whole-floor cases with the repository BFS, including failure cases. Numerical checks share canonical geometry and are not an independent site survey.

## Review and measured fit

Open `review.html` for the standalone Arabic selector, whole-apartment plan, bedroom focus, source comparison and measurement checklist. `measurements.json` retains eight unresolved measurement groups with actual values explicitly null: appliances, six-person dining/table underframe/shoe storage, bedroom joinery/window, door hardware, family shower and terrace glazing. No products or actual dimensions have been selected by this review.

```sh
node design-development/unified-furnishing-v55/compose.mjs
node design-development/unified-furnishing-v55/verify.mjs
```

Add `--write` to `compose.mjs` to regenerate candidate files. To regenerate the analysis and browser evidence:

```sh
node design-development/unified-furnishing-v55/study.mjs --write
node design-development/unified-furnishing-v55/verify.mjs --geometry-only --write
node design-development/unified-furnishing-v55/build-review.mjs
node design-development/unified-furnishing-v55/check-review.cjs
node design-development/unified-furnishing-v55/verify.mjs --evidence-only
```

Browser checking needs development-only Playwright and Chromium; set `CHROMIUM_PATH` when required. Desktop/mobile checks exercise all 266 selector combinations, exact saved path rendering, focus/reset controls, RTL and overflow. Captures include full-apartment and bedroom-focus views. The evidence manifest covers the candidate, analysis, geometry verification, measurement requests, report, browser checker and captures. `--evidence-only` rechecks those hashes without repeating completed geometry work.

Continue with real appliance models and site measurements before choosing a final fit. Do not replace the active design, widen openings or inherit old island studies as part of this review.
