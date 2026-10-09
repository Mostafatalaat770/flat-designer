# K11 — daily-use kitchen study

K11 organizes daily work within the frozen K10 cabinet envelopes. The island remains **1700 × 900 mm**. Living/dining furniture, finishes, comparison cameras, 2.50 m clear height, canonical architecture and the earlier exploratory opening overlay are preserved. This branch is a review study; it is not a live activation or construction package.

## What changes

| Zone | K10 | K11 |
|---|---|---|
| Island working side, west to east | Dishwasher 600 / sink 600 / drawers 464 mm | Waste + top utility drawer 464 / sink 600 / dishwasher 600 mm |
| Tall bays, west to east | Pantry / oven / fridge | Fridge / oven / pantry with coffee niche |
| Sink outer reserve | 550 × 400 mm at x=11800 | 550 × 450 mm at x=11682; illustrative 480 × 350 × 210 mm bowl |
| Cooking run | Three nominal 600 mm fronts | 18 + 582 drawers + 600 hob + 582 drawers + 18 mm |
| Rear island storage | 600 / 600 / 464 mm, nominal 300 mm deep | Same; west cabinet also stores the removable bowl cover upright |

The full **600 mm clear lateral dishwasher bay** is preserved. The 464 mm waste module includes one shallow utensil drawer; exact two-bin fittings and capacity remain unselected. Under the hob, only two lower drawers are allocated conditionally; the upper 160 mm frontage is a service reservation.

## Washing versus preparation

The open sink leaves **507 mm west / 643 mm east** landing widths. It still does **not** provide the published NKBA 914 × 610 mm continuous prep reference beside an uncovered sink.

`snapshot.json` shows **washing mode**. `prep-mode.json` shows an optional **flush removable 480 × 350 × 16 mm bowl cover**. In the latter mode a 914 × 610 mm countertop rectangle is available at concept level, with the tap and lever to its west. Washing and that larger prep surface are sequential. The cover is not a permanent countertop extension or a selected product; fit, joints, supports, hygiene and exact sink/rail geometry require product review.

The two mode snapshots have separate scene revisions and render metadata. The three inherited comparison cameras remain exact; the existing close working-front camera is also retained. Prep mode renders the dining and close-front cameras only.

## Doors and circulation

The same hypothetical open projections used in K10 are retained: dishwasher 650 mm, oven/fridge 600 mm, utility pullout 500 mm. K10 dishwasher/oven rectangles overlapped by **168 × 30 mm**. K11's four recorded door/pullout rectangles have **zero area overlap**, with **32 mm nominal lateral separation** between dishwasher and oven.

This improvement does not certify manufacturer doors, hinge sweeps, handles, pantry doors, bodies or simultaneous use. The closed-front aisle remains **1220 mm**; an open dishwasher still leaves only **570 mm** to the closed tall fronts. Waste pullout and fridge-open rectangles have a 120 mm longitudinal gap, unsuitable as a passage. The island-to-table-edge gap remains 1070 mm; occupied-chair clearance is not inferred from that figure.

## Storage: useful allocation, real tradeoffs

`storage-allocation.json` distinguishes general dry storage, equipment, waste, services and unverified spare space. Proposed compartments are totals across each allocation's listed quantity, not a capacity guarantee.

| Allocation | Proposed use | Limitation |
|---|---|---|
| Six side cooking drawers | Pots/lids, pans/containers, tools/spices | 582 mm exterior width; approximately 520 mm box width under stated panel/runner assumptions |
| Two lower hob drawers | Additional cookware | Conditional on actual hob/gas/ventilation/thermal clearances |
| One island top utility drawer | Cutlery and frequently used tools | Approximately 402 mm box width; waste occupies the lower module |
| Three rear island cabinets | Mugs, glasses, small dishes, serving supplies | Nominal depth 300 mm; assumed usable depth 259 mm. Do not assume 280 mm dinner plates fit |
| Two 600 mm wall cabinets | Cups and small bowls | Shelf spacing/plate fit need the family inventory |
| Pantry lower + upper | Heavy dry goods below; light reserves above | Coffee niche removes 620 mm of full-width pantry height; high upper shelves are occasional-use storage |
| Oven column | Equipment/services | Spare dry-storage capacity is excluded until real appliances are fixed |

The coffee niche reserves a generic **250 × 410 × 370 mm** machine and **160 × 200 × 260 mm** kettle inside a 564 mm clear width. These are not measurements of the user's exact products. Power, steam protection, reservoir filling, access and ventilation are unresolved. Coffee uses some pantry capacity; it keeps these appliances off the island prep surface.

The pantry tradeoff removes a **600 × 600 × 620 mm gross envelope** from general dry storage. Its 223.2 L bounding-box volume is **not** usable storage or an estimate of the family's needs. The old island's two lower general drawers become waste storage. Explicit cooking drawers organize the existing run without creating extra exterior storage volume.

Assessment: organized **compact storage**, not proven generous storage. Large plates should use full-depth lower drawers. A stocktake of pots, plates, food reserves and the exact small appliances is needed to assess sufficiency.

## Source integrity and disclosed architecture dependencies

Canonical SHA-256 remains `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`. No canonical geometry or production validation guard is changed.

The canonical report has **152 PASS / 49 WARNING / 2 FAIL**. Both failures are disclosed: the retained cross-room island placement and the native pantry's intersection with canonical wall 45. The latter is newly reported because the native pantry checker is stricter than the legacy fridge checker; the pantry exactly reuses the frozen K10 fridge footprint. Wall 45 is already removed by the unchanged render-only opening overlay. The study validator verifies those exact facts; it does not treat canonical geometry as approved for construction. All other hard failures remain rejected.

Structural approval of the opening overlay, extraction, gas/electric/water/drainage routes, actual equipment and site dimensions remain unresolved.

## Reproduction and review

Run `node scripts/prepare-k11-kitchen.mjs design-development/k10/snapshot.json`. The K11 workflow compares all generated files byte for byte against the committed study, runs the core/domain/renderer tests, checks the architectural overlay and measures the actual Three.js meshes. Dedicated tests verify the real countertop opening, sink recess, flush cover, tap clearance, cabinet bounds and appliance niche bounds.

The render workflow uses the actual Studio capture template, embeds local assets and checks exact layout/camera metadata. Visual inspection and CI results are recorded separately after the render completes.

Planning reference: [NKBA Kitchen Planning Guidelines](https://media.nkba.org/uploads/2022/05/Kitchen-Planning-Guidelines.pdf), prep/landing/cleanup guidelines 11–13. This published reference is not local code or a claim of current-edition compliance.
