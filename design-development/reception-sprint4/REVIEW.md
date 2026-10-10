# Sprint 4 — kitchen operation and family access gates

**10 October 2026 · design review only · no procurement, construction, cloud save or master merge**

This audit starts **only** from PR #62 **A/P0** and its pinned appliance operating audit (source scene \`scene-9e86635b\`, cloud origin \`scene-4821689\` revision 55). It retains exactly the original Type B geometry, **2.50 m ceiling, service door, fridge, dishwasher, washer, stove and sink coordinates.** It makes **no kitchen island** and does **not** import old K12 geometry.

## Why this matters

An attractive kitchen with shut doors can hide problems during *daily operation*. The output checks four device door proxies, their users and the original kitchen/service door leaves under multiple assumptions. We distinguish **positive occupied-body overlap** from **touching** and from the **minimum sampled polygon gap**; none of those constitutes a human-access certificate.

### Source-locked nominal audit — previously hidden risk

| Daily-use test, nominal proxies | Working result in current P0 | Recommendation |
| --- | --- | --- |
| Dishwasher door fully out 600 mm | 972.3 mm to assumed south interior face | Single-user operation candidate; product and as-built dimensions HOLD |
| Dishwasher unloading with 600×600 mm standing person | **372.3 mm** remaining behind person | **HOLD** walking behind person during unload; counterevidence to frictionless simultaneous circulation |
| Fridge assumed 650 mm forward envelope vs original kitchen door | Original audit intersects **26/46** sampled kitchen-door positions; fridge-user intersects **8/46** | **HOLD** kitchen leaf / fridge handedness/actual width and handle; P1 removes *only* modeled leaf if approved |
| Washer user vs opening service door | **18/46** sampled leaf positions overlap | **HOLD** simultaneous laundry and terrace access |
| Generic oven opening vs service door | **13/46** overlapping service-door positions | Study oven position and real service-door swing before cabinet manufacturing |
| Oven operating person vs washer operating person | **54,000 mm²** sampled rectangular overlap | **REJECT** "two cooks/users pass easily" from a closed-state render |

These are *calculated nominal scene values*, not manufacturer/field measurements.

### Under-hob oven positioning sensitivity

The model retains the original stove/cooking counter and shifts **only the *assumed* oven access envelope** from counter-centre y=8038 mm to hob-centre y=7895 mm, a 143 mm difference. This is not an actual fitted oven or moved hob/wet service.

- It can eliminate **sampled oven-panel versus service-door polygon overlap** in the original nominal test. More realistic handles and the **continuous** hinge sweep may still be different.
- It **does not** create a 2-person kitchen: oven/washer operating bodies still overlap, and washer user/service door clash persists.
- Keep the fridge in its original slot until a real model (including hinge side, opening degrees, vent clearance) is chosen; the current fridge's 650 mm swing is a rectangular *stand-in*, **not a real door arc**.

### P0 versus conditional P1

**P0:** current approved/source enclosure and kitchen door. **P1:** a *render-only hypothetical* overlay removing wall 44 / that kitchen door, not written approval. As expected, P1 removes that door's fridge collision from the calculation, but **does not fix dishwasher, laundry/service door, gas/hood extraction, odor/smoke closure or family storage**.

The portal remains a **structural and services HOLD**. Design around **P0 as the safe fallback**, even if we prefer the P1 visual connection in the future.

## Reproducible deliverables

\`scripts/sprint4-kitchen-operation.mjs\` exports:

1. \`KITCHEN_OPERATING_ENVELOPES.json\`: **108** transparent tests (3 door projections, 3 user widths, 3 user depths, 2 oven access centres, 2 kitchen topologies), plus exact P0 audit regression and operating-pair separations.
2. \`KITCHEN_OPERATION_PLAN.svg\`: side-by-side scaled model-plan illustration, P0 generic oven proxy and P0 under-hob access proposal; all source cabinets/doors identical, no fabricated open-wall geometry.
3. An automated source hash/scene/doors/test-count guard in CI. **Never overwrite the source current snapshot or cloud scene.**

The sensitivity scenarios are **not vendor dimensions**. They're compact/nominal/large hypothetical opening envelopes: dishwasher 500/600/700 mm, washer 400/500/600 mm, oven 400/500/600 mm, fridge 500/650/800 mm, with people 500–700 mm both axes. No purchasing decision follows from a "pass".

## CI-verified sensitivity outcome — 10 October 2026

**CI SUCCESS:** [Full source-locked run #38054315435](https://github.com/Mostafatalaat770/flat-designer/actions/runs/38054315435), including old geometry/owner controls, 108 source-pinned operation scenarios, exact nominal regression, SVG drawing and immutable-snapshot checks. [Download original JSON, SVG and review brief](https://github.com/Mostafatalaat770/flat-designer/actions/runs/38054315435/artifacts/11670388673).

**108 generated scenarios ≠ 108 passing household scenarios.** They are model calculations covering three size profiles, three assumed person widths, three assumed person depths, two proposed oven locations and two topology comparisons. Any model-body intersection is reported, not hidden.

| P0-only comparison across 27 person/projection combinations per oven option | Generic oven centre | Under-hob oven centre |
| --- | ---: | ---: |
| Oven panel intersects 46-position *service-door sample sweep* | **27 / 27** | **0 / 27** |
| Oven and washer operator body proxies positively overlap | **21 / 27** | **21 / 27** |
| Dishwasher and oven operator body proxies positively overlap | **27 / 27** | **27 / 27** |

The oven re-centering is worthwhile for service-door opening, **but a two-person kitchen is not established**. Even in the proposed under-hob condition the model's oven operator and dishwasher operator still overlap in **all 27 P0 cases**. The washer conflicts remain even after removing the P0 kitchen leaf in P1.

Nominal baseline-to-under-hob detail: service-door/oven-panel overlap changes **13 sampled angles → 0**; the minimum door-panel gap increases to **87.2 mm**. Oven/washer standing-body polygon overlap drops **54,000 → 39,700 mm²**. This does **not** prove a safe door-handle margin or real person clearance.

Sensitivity of nominal *dishwasher behind-person wall band* spans **172.3–572.3 mm** across the assumed profiles and person depths (nominal original **372.3 mm**); it is never a confirmed two-person bypass. Fridge assumed door panel intersects P0 kitchen leaf in all **27/27** P0 combinations on the three size profiles; P1 merely *removes the tested leaf* and has no developer approval.

**Decision:** accept under-hob oven **for a vendor-backed fit test only**. Keep the P0 architectural source. Hold final fridge handedness, oven and washer installation, service access/egress, DW unloading, cabinet door/rack access and any P1 structural change until professional survey, manuals, real door kinematics and household test.

## Decision and physical verification order

1. **Freeze equipment schedule before joinery:** check fridge **actual swing/hinge/handle**, width/depth and required ventilation; full DW door and two racks extended; front-load washer depth/door; oven under-hob compatible SKU and heat, hob manufacturer instructions.
2. **Map the service-door operation:** live door leaf, handle and possible stops with standing washer user, oven front and rack/drawer open. Explicitly keep terrace access/egress usable.
3. **Test dishwasher unloading** with **one operating adult plus a second person traversing**. The nominal remaining 372.3 mm behind the adult is not a bypass.
4. **Keep storage functional:** the exact existing base and upper runs, sink waste/trap, dead corner, overhead access and appliance niches deducted. The proposed oven position may affect drawers and cupboard layout; no installation documents yet.
5. **Structural/MEP:** if pursuing P1, engineer/developer written structural, gas/extraction and closure approval is mandatory before any wall removal.

**Recommendation:** proceed with the elegant Option A public finish palette, but **do not authorize kitchen cabinetry or wall works** until the product-driven operation/MEP review passes. The "one-at-a-time" sequencing proposed for crowded appliance/service activities is temporary usability guidance, **not an approved escape strategy**.
