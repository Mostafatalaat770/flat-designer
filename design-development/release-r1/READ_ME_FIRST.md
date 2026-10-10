# Release R1 — موحّد لمراجعة التصميم قبل التنفيذ

**Owner review only. Not a construction drawing.** Current source stays `render-snapshots/current.json` derived from cloud v55, Type B canonical SHA `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`, 2.50m clear ceiling.

## Recommended design direction

**Option A Calm Contemporary** for reception aesthetics, preserve six 2000×950 dining places and keep P0 original kitchen enclosure as the only non-demolition baseline. Option B is a controlled visual/light/material comparison, NOT extra movement space.

**P1 semi-open** is still a render-only single-wall/door option and remains conditional on written developer, qualified structural and MEP permission, exact measured opening and hood/odor/cabinet/door closure details.

## Evidence package

Run `node scripts/build-owner-release-r1.mjs`, or download the GitHub Action output. Open **Owner-Review.html** offline for a 16-gate filtered decision view; **SITE_RFI_MATRIX.csv** is ready for trades, **OWNER_RELEASE_GATES.json** contains SHA, source metrics, provenance and approval flags. The genuine 32-WebGL A/B images stay in the linked original reviewed artifact (not recreated/rendered here).

Source hierarchy is checked automatically: original canonical -> current GitHub v55 source -> matching A/B furniture -> opt-in *render-only* P1 overlay -> model test measurements. No cloud saves or canonical layout writes.

## Real release prerequisites

1. Entry + six actual chairs with open buffet and shoe inventory/hinge mechanism.
2. Dishwasher **600mm actual free niche**, actual 1150mm open depth plus rack/user and room movement.
3. Fridge hinge and P0 door; washer and service door; selected oven under original hob with maker gas/heat instructions.
4. Qualified kitchen first-fix: hood exhaust, intake, drains, sockets and access.
5. Wet build and waterproofing/glass master/family bathrooms; guest WC basin product/sweep.
6. Bedrooms/dressing storage and real wardrobe swing; material-light/glare sampling.
7. Finished as-built survey and explicit owner plus structural/MEP release. **No orders, walls, doors, or wet services released by any of these PRs.**

## Source-verified facts

- Shoe standing user to the nearest chair (+450mm all chairs) is **15mm polygon gap**, not a usable bypass. Supplier simulation 0/544 scenarios meeting stated hypothetical 500mm screen.
- Dishwasher unloader to assumed nominal wall **372.3mm**; modeled fridge vs interior door 26/46 sampled positive overlaps; washer user vs service door 18/46.
- Under-hob oven study improves door compatibility but not two-person standing conflict. No actual oven or integrated dishwasher has been owner-selected.
- Real manufacturer references are research, not supplier orders; height and width of final installed cavity not yet confirmed.
- All six current owner registry approval flags are `false`. `master` and Studio saved cloud must not be altered without explicit decision.

## Why one more PR?

This is the **one consolidated readout** of PR #62–#67, stacked on the existing source-verified designs. Do not create further isolated style/appliance experiment branches without a release-review action. Its value is a single owner/trades handoff and machine-verifiable blockers, not new unvalidated room geometry.
