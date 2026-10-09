# Family-first decision dossier · A13 Dining + A14 Cabinet-Unloading Audit

**8 October 2026 · independent read-only branches · not a construction document**

## Truth contract
- Type B v0.2.2 SHA: `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`.
- Frozen K12 conceptual open kitchen scene: `scene-e2fcb932`; **two inherited canonical architectural FAILs** remain. This is **not** developer/structural demolition approval.
- All 2500mm finished ceiling geometry, wall openings, production `master` and saved cloud Studio are untouched. Wet +150mm sink/island remains **MEP TBC**.
- Always label product/user/door dimensions **VERIFIED / INFERRED / EXPLORATORY / TBD**.

## A13: visual/camera feedback — verified, with a seating comfort limit

[PR #29](https://github.com/Mostafatalaat770/flat-designer/pull/29), [run 37773758185](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37773758185), real-three-eye image artifact **11549031339**.

### Render authenticity
The two exact K12-derived scenes have:
- `scene-91cbab2` — wet island +150mm; **six seats unchanged**.
- `scene-97e9df72` — same wet island +150mm; **four end-chair centres 75mm inward**.
- Same original canonical SHA and *exactly identical camera metadata for each of the three views*: `A13-living-to-six-seat`, `A13-six-seat-eye`, `A13-dining-to-island-end`.
- Six 1600×857 actual Three.js WebGL r160 PNGs, all **zero pending image assets, zero fallback textures**.

### What the camera tells us (and does not)
- It **shows the table and several of the actual six chairs** with consistent kitchen/living arrangement. Subtle 75mm inward rebalancing has little visible aesthetic penalty.
- It cannot assess six people seated shoulder-to-shoulder, width of the actual bought chair backs/armrests, tabletop support/legs, or elbows and serving in use. Some chairs are partially outside/hidden from a given frame. **Image fidelity PASS, occupied seating usability remains UNKNOWN.**
- For design validation rather than photography, 60–75mm inward symmetric seating is a plausible **reversible furniture layout**; no reason to modify the 2000×950mm table or buy new chair SKU solely from these renders.
- **Next QA enhancement:** true top-down dimension-overlay and human silhouette/chair pulled-out tests; camera target-coverage preflight preventing "six-seat" approval from an image with missing seats.

## A14: dishwasher unloading — verified sample fit, no approved joinery yet

[PR #30](https://github.com/Mostafatalaat770/flat-designer/pull/30), [run 37774927475](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37774927475), artifact **11549636665**.

The exact K12 `KitchenStorageAllocation/2` data has:
- **Rear presentation-side island:** estimated net 564×359mm per wide cupboard; 280mm sample plate fits nominal depth, subject actual hinged opening, shelf height, and service access. From kitchen DW unloading requires crossing to the opposite island face; route length not measured.
- **Cooking-side drawer:** two nominal 582mm cabinets with drawer estimates ~520×440mm interior width/depth; can theoretically fit six illustrated 280×280×22mm plates in a **hypothetical** 170mm interior height. But **displaces cookware/pans/spices**; don't approve without household inventory and exact drawer front/runner load/height.
- **Upper kitchen unit:** estimated 564×289mm clear width/depth; a 280mm plate yields only **9mm nominal extra depth**, before hinges/door, and raises ergonomic concerns for heavy stacks. **Do not certify as a solution**.
- **Cutlery/waste-side shallow drawer:** nominal front height 160mm; *illustrative* useful interior height 110mm cannot accommodate six stacked 22mm plate models (132mm stack). This hypothetical mode **REJECTED**, but a real taller drawer would need retesting. The original cutlery function also needs a home.

All real plate sizes, other family goods, hardware, runners, internal heights, elevation and load unknown. Current storage engine tests plate envelope individually plus stack upper bound, not mixed 6-person dish/cupboard full storage, nor owner comfort. Never invent travel metres.

### Preliminary design judgment
**KEEP as provisional:** preserve table 2000×950 and six seating places; try a real family mockup of +60–75mm endpoint chair movement. **Keep wet island +150mm CONDITIONAL** (structural/drawings/drain). **REVIEW rather than move cabinet immediately:** try daily dinnerware kitchen-side in one cooking drawer **only after** proving a working alternative storage location for pots/pans and runner/load support. Keep presentation-side cabinets for serving items and occasional storage if inventory supports it. **REJECT as default** putting heavy stacks in marginal 289mm-deep upper cabinets or a shallow 110mm effective drawer.

## Site and joinery checklist

1. **Architect/developer + structural:** verify open separator may lawfully/structurally change; survey finished Type B walls/door positions before any MEP / cabinetry.
2. **Plumber/MEP/electrician:** DW, island sink, wastewater fall, actual gas/oven/fridge/hood extraction; obtain real appliance manuals and operating envelope.
3. **Owner inventory:** measure/count 6–12 dinner plates, bowls, mugs, cutlery, six-person setting, serving trays, pots, pans/lids, food stocks, small appliances and cleaning/garbage needs; count *frequently reached* vs occasional items.
4. **Carpenter shop drawings:** front elevation plus inside net width/depth/height, opening aperture, hinges, runner capacity, shelves and end grain/protective clearance.
5. **Practical mockup:** six adults seated to test end-seat compression + pulling chairs out + carrying tray between island and table; dishwasher door open and someone unloading plates/pans while another uses hob.
6. **Engineer authorization:** only after the above can "fabrication / procurement / construction ready" become a candidate status.

### Sprint outcome
**A13 geometric/dining render verification PASSED** (not human comfort), **A14 four cabinet/workflow experiment CI PASSED** (not family inventory sufficiency). **No final kitchen layout approved.** Track unresolved storage in [#15](https://github.com/Mostafatalaat770/flat-designer/issues/15), structural/MEP in [#19](https://github.com/Mostafatalaat770/flat-designer/issues/19), orchestrator in [#11](https://github.com/Mostafatalaat770/flat-designer/issues/11).
