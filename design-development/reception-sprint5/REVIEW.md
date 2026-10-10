# Sprint 5 · actual manufacturer dimensions, not imaginary product placement

**Source:** PR #62 Option A/P0, scene-9e86635b; stored cloud-origin scene-4821689 v55; canonical Type B untouched, ceiling 2500mm. **No SKU is owner-selected. Do not order kitchen cabinetry or demolish any wall.**

## Product examples from official sources

| Category | Official evidence | Body and open dimensions | Critical issue |
| --- | --- | --- | --- |
| Washer | [LG Egypt F4Y2TYG6X](https://www.lg.com/eg_en/washer-dryers/front-loading-washing-machines/f4y2tyg6x/) | 600 W × 550 D × 850 H mm; depth to door 590mm, total when 90° open **1030mm** | Source washer nominal 600 W×610 D; **0mm nominal side slack** and 20mm body-to-front-depth difference, without hoses or other installation reserves |
| Fridge | [LG Egypt GBF339SVAM](https://www.lg.com/eg_en/refrigerators/bottom-freezer/gbf339svam/) | 595 W × 650 D × 1860 H mm; annotated manufacturer's open total depth **1149mm** | Source box 650 W×650 D: 55mm total nominal width difference, **not** ventilation/hinge clearance; existing P0 kitchen door may conflict |
| DW benchmark | [LG Egypt DFC811FL](https://www.lg.com/eg_en/dishwashers/dfc811fl/) | 600 W × 596 D × 845 H mm; freestanding, 1750–2100W | **Wrong installation class for a matching-front integrated cabinet**; original 600mm DW conceptual niche has 0mm width slack and no verified under-counter height |
| Oven benchmark | [Bosch official Iraq HBF011BV1T](https://www.bosch-home.com/iq/ar/mkt-product/cooking-and-baking/cookers-an-dovens/builtin-oven/HBF011BV1T), regional catalog only | 594 W × 548 D × 595 H mm; installation cutout 560–568W, 550D minimum, 575–597H; 2850W | Egypt availability, under-gas-hob compatibility, gas/electrical/vent details and real oven-door projection unverified |

Bosch Egypt [integrated dishwasher explanation](https://www.bosch-home.com/eg/en/shop/dishwashers/built-in-dishwashers/installation-faq) clarifies that a matching-front door is specific to integrated models. A 60cm freestanding DW is **not** automatically a panel-ready integrated unit.

**Important measurement distinction:** the furniture objects in the model are outer boxes, not field-measured free openings. Zero arithmetic side allowance is a **hold point**, not a conclusive claim that the device will not fit.

## Completed study

Run: \`node scripts/sprint5-manufacturer-kitchen-fit.mjs\` after \`npm ci && npm run build\`. It writes:
- \`MANUFACTURER_FIT.json\` with link-identified manufacturer dimensions, parent scene SHA and **36 nominal sensitivity cases**, occupant-body and original door-leaf interaction reports.
- \`FIT_AT_A_GLANCE.svg\` concise report.
- Dedicated GitHub Actions verifies 36 cases, immutable source bytes, 0mm slot-vs-product body comparison, 440mm additional open depth for LG washer measured from depth-to-door, 499mm additional fridge open depth, and pre-existing source protections.

**This is not a precise real-world collision simulation:** LG open-total-depth is a manufacturer **linear overall depth bound**, not a full plan-view hinged door polygon. The script uses simplified rectangle forward projections. Bosch oven/DW door projections and adult standing rectangles are **assumptions**, not verified product data.

## Verified model result (GitHub Actions, 10 October 2026)

**Full CI PASS:** [source-locked run #38055380328](https://github.com/Mostafatalaat770/flat-designer/actions/runs/38055380328) verifies frozen original source, original owner decisions, 36 input scenarios, all seven HOLD flags and machine-generated source evidence. [Original JSON, SVG and document artifact](https://github.com/Mostafatalaat770/flat-designer/actions/runs/38055380328/artifacts/11671205666).

| 36 separate product-body/assumed-person/projection cases | Model result | Decision |
| --- | ---: | --- |
| Fridge **rectangular open-depth proxy** intersects P0 kitchen door sampled swing | **36 / 36** | Urgent hinge-side and actual appliance-door *arc* drawing; do not trust P0 frontal picture |
| Washer open-user envelope intersects original service-door swing | **24 / 36** | Test exact washer hinge/water hoses with service door before locating sockets/drains |
| Under-hob oven panel versus original service-door sweep | **0 / 36** | KEEP for compatible oven+gas hob supplier-template test only; not a construction clearance certificate |
| Oven/washer operating-person positive polygon overlap | **36 / 36** | Assumed two-person simultaneous operation fails this model |
| Oven/DW operating-person positive polygon overlap | **36 / 36** | Do not claim simultaneous unloaded dishwasher + oven comfort |
| Dishwasher+washer operating-person overlap | **12 / 36** | Need manual basket movement/full-scale family-use test |
| Refrigerator/DW operator-body overlap | **0 / 36** | Mere lack of body-box overlap does not clear the source kitchen leaf or through-route |

**Nominal scenario** with assumed 600×600 mm person, 600 mm DW and 550 mm oven opening: washer body/service door collides in **12/46 sampled positions**; source-position fridge 595-mm-wide rectangle open-depth proxy hits the kitchen door in **19/46 sampled positions**; oven under-hob has a **90.2 mm** nominal minimum gap to the service-door sweep; DW occupied body leaves **379.3 mm** to the assumed room boundary. This is not a safe walking lane.

Unlike the earlier purely assumed Sprint 4 `+500mm` washer envelope, the new 440mm forward increment comes from an actual 1030mm rear-to-fully-open-door LG size minus 590mm rear-to-front-closed-door. **Still, a single depth increment is not a real two-dimensional hinge arc; NO manufacturer says this full width blocks the entire rectangle.** Do not convert model overlaps to claims about real equipment without maker mounting diagrams.

The **two zero-width-slack alerts** are arithmetic against existing 600mm nominal *furniture boxes*, NOT field measurements of the clear installed recess. They are enough to block cabinet shop drawings until a site survey. Likewise, do not substitute a freestanding LG dishwasher for an integrated door-front and do not assume that Bosch's Iraq-market model can be sourced or installed under this gas hob in Egypt.

## Release gates and next work

1. Measure as-built finished clear appliance apertures, door swing and worktop height; re-evaluate equipment elevations and hoses rather than trusting model box width.
2. Choose actual **integrated** dishwasher SKU (or explicitly redesign the cabinet for freestanding installation), obtain installation drawing, front hinge/toe kick, rack and basket pullout.
3. For washing machine, validate 1030mm full-open LG example with service-door swing and water/electrical/maintenance access.
4. For refrigerator, identify hinge-hand/actual plan-opening drawing, air circulation clearance and drawer accessibility. Never size cabinetry from closed-body dimensions alone.
5. For oven, source an actual Egypt-supplied compatible under-gas-hob model; verify manufacturer instructions, heat clearance, cutout, power and accessible isolation.
6. Qualified site MEP must approve exhaust route to outdoors, gas distances, fresh air, DW and washer drains/traps/water, sink, water ingress protection and dedicated electrical design. No invented amperage/cable specification.
7. **P1 semi-open kitchen remains render-only** pending developer structural/hidden-services and owner approvals. P0 original rooms and doors are retained.

**Decision:** retain Option A public aesthetic; retain P0 as fallback; provisionally explore under-hob oven **without moving the original hob**; decline to certify construction/functional comfort from pixel geometry or an unverified appliance class.
