# Sprint 3 — real shoe cabinet envelopes, without imaginary storage capacity

**10 Oct 2026 · Source-locked Option A/P0 study · NO PRODUCT ORDER / NO SITE APPROVAL.**

This adds a supplier-constrained parameter sweep on top of PR #63. It does **not** change the apartment geometry, 2.50 m ceiling, six-place table or layout in any snapshot. The prior 700×240×~1000 mm custom shoe unit is **not** a specified real product. The previous worst-case standing-user/chair gap was **15 mm** with all six chairs +450 mm back.

## Verified product references in Egypt

| Candidate | Dimensions (width × depth × height) | Supplier's approximate shoe-pair guidance | What is actually verified |
|---|---|---|---|
| Custom placeholder | 700×240×1000 mm | **6 pairs is an unverified target** | Only model dimensions; no hinge, no SKU |
| IKEA Egypt TRONES two modules | **520×180×780 mm** stacked | **~4 pairs total per 2-pack** | Width/depth/each unit 390 mm high; manufacturer says 4 pairs for the two-pack, **requires wall fixing**. [Supplier](https://www.ikea.com/eg/en/p/trones-shoe-cabinet-storage-white-00397307/) |
| Three TRONES units stacked | **520×180×1170 mm** | **~6 pairs extrapolated**, not supplier-certified | Derived using 390 mm/unit; potential collision with the existing mirror and upper access. Requires 3 units, and typically buying two 2-packs leaves a spare |
| IKEA Egypt BISSA two compartments | **490×280×930 mm** | **~8 pairs** | Manufacturer figures; rear wall fixing required. [Supplier](https://www.ikea.com/eg/en/p/bissa-shoe-cabinet-with-2-compartments-white-70530256/) |

**Pricing snapshot, not availability promise:** TRONES **EGP 1,999 per 2-pack** and BISSA **EGP 4,495** on IKEA Egypt at research time. Supplier page may change; availability, delivery area, installer price and all materials remain unverified.

## What the computer experiment means

Run \`node scripts/sprint3-shoe-sku-screen.mjs\` after \`npm run build\` and \`npm ci\`. It exports \`SKU_SCREEN.json\` and a one-page comparison SVG.

- Reuse exact audited **46 sampled door-leaf positions**, exact six chair positions at +450 mm, source canonical hash and original A/P0 furniture.
- Use external product dimensions instead of pretending a generic 700×240 unit fits all products.
- Sweep **17 candidate positions × 4 door-opening projections (100/200/300/400 mm) × 2 nominal human widths (500/600 mm)** for each candidate. None of the assumed opening distances is a real hinge drawing.
- Report independently: static cabinet/site-face fit, source domain hard failures, open-panel/main-door collision, user/main-door collision, and person-to-nearest-chair gap.
- **500 mm is just a screening sensitivity** — neither a legal clearance nor proof of passage or emergency exit. A hypothetical green outcome would still need physical mockup.

## Reproducible CI result (2026-10-10)

**PASS:** [GitHub Actions run #38052569866](https://github.com/Mostafatalaat770/flat-designer/actions/runs/38052569866). The generator completed with 544/544 scenario records and original-source regression at 15 mm. [Original evidence artifact](https://github.com/Mostafatalaat770/flat-designer/actions/runs/38052569866/artifacts/11670001800) includes JSON with every trial and an SVG summary.

**Core verdict: 0/544 scenarios satisfied the complete hypothetical 500mm screen.** Tested four cabinet categories, 17 centres each, four assumed door projections and two widths of standing user. This statement applies only to those discrete samples, not all possible shoe designs or household behaviours.

| Product | Shoe-user vs +450mm chair at original centre (opening 200mm, person 600mm) | Best gap across sampled positions/projections for a 600mm user | Screen passes / 136 |
| --- | ---: | ---: | ---: |
| Unspecified 700×240 custom concept | 15mm | 135mm | 0 |
| TRONES two stacked | **45mm** | 165mm | 0 |
| TRONES three stacked | **45mm** | 165mm | 0 |
| BISSA two compartments | **0mm, footprint contact in the proxy** | 115mm (some non-door-clear states); at most 95mm when static/open/user door screens clear | 0 |

The first table measurement is a **polygon gap**, not a walking width. **Even 165mm is not a viable concurrent passing width.** Choosing TRONES just because it is slimmer improves the cabinet box and standing-user envelope slightly but **does not solve** simultaneous shoe use with all six chairs withdrawn. None of the calculated values certifies egress, accessible passage, real cabinet operation or legal compliance.

**Design implication:** preserve the dining positions and buffet while prioritising an entry routine and a daily/reserve storage split. Candidate solution: four everyday pairs in two stacked TRONES-size units (or a comparably shallow custom case) and remaining pairs in **verified** closed storage outside the public entry, with a household policy of one person operating the shoe unit at a time. This is an operational proposal, not owner-approved installation. Three stacked TRONES units may interfere with the mirror; BISSA gains manufacturer-rated capacity but sacrifices depth. No unit should be purchased or built before physical verification.

## Recommendation / decision gate

Keep **Option A Calm Contemporary** as the aesthetic lead and preserve the **2,000×950 mm six-seat dining table**. Do not shift the table/buffet or remove the wall just to make a green number.

**My working preference is a shallower entry/day-use system, not a fictional six-pair cabinet.** Two stacked TRONES are a helpful *dimensional benchmark* for 4 daily pairs but require acceptance of the material/look or a genuinely verified similar custom cabinet. A third TRONES trades height/mirror composition for a possible sixth pair. BISSA is narrower but deeper and must be tested with real hinge front clearance. Do not blindly purchase any of them.

Before final joinery, check actual family shoe inventory, adult largest shoe lengths/widths, daily versus reserve pairs, wall-fixing permission/substrate, operation with entrance door open, mirror lower edge and finished skirting. If actual 6 pairs cannot fit without an occupied bottleneck, accept a daily 2–4 pair entry drop zone **only after verifying a separate enclosed reserve location** (e.g. within an existing wardrobe, without stealing needed clothing storage).

**Reject** optimistic capacity by cubic litres alone and reject "comfortable 6-chair circulation" while shoe user conflicts persist. A person standing to put shoes away can block access briefly; this is a household sequencing question, not something a decorative render can conceal.

Next: source-locked kitchen appliance operating states using real fridge, dishwasher, under-hob oven and washer maker installation diagrams, plus same-camera photographed/full-size on-site mockups.
