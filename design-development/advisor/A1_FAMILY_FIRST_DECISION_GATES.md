# Advisor A1 — family-first design decisions (8 October 2026)

**Purpose:** This is the owner's design-advisor control sheet. It defines what to test *before* another decoration or layout iteration is called "better". It does not replace the canonical architecture or approve construction.

## Authoritative sources and separation

- **Architecture:** canonical Type B v0.2.2, SHA-256 \`734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658\`; clear finished height 2500 mm. Never mutate or silently "correct" this source in an exploratory branch.
- **Saved cloud Studio:** A11.1, \`scene-85fd2cac\`, storage revision 50 (read on 8 Oct). It is the saved model, NOT the newest kitchen alternative.
- **Exploratory studies:** K11 \`scene-fa8547b9\`, K12 \`scene-e2fcb932\`, both downstream of render-only K4 opening overlay. They are not cloud-activated or structurally approved.
- **K12 checks:** \`review-evidence/k12/verification.json\` documents successful export/render checks and **152 PASS / 49 WARNING / 2 FAIL** in the unchanged canonical checker. Both existing FAIL items relate to the as-yet-unapproved open-plan overlay. Do not turn workflow success into architectural approval.
- **No irreversible actions in this iteration:** no cloud Studio mutation, no demolition, no opening change, no purchase, and no merge into master.

## The lead recommendation

**Keep K12 as a promising reference candidate, NOT the winner.** It provides a permanent 914 × 610 mm *end-accessed* prep rectangle with the sink open and increases nominal rear storage depth to 400 mm; it does **not** deliver that entire counter on the normal washing side.

A plausible 600 × 600 mm standing-person envelope at that end leaves only **465 mm** to the nominal dining-table edge (**about 494 mm to its physical nearest corner and 510 mm to the closest chair footprint per K12 study**). This means the end prep cannot be sold as simultaneously comfortable preparation AND passage. The dishwasher proxy leaves **570 mm** to the closed tall front when open; these envelopes are generic, not manufacturer CAD.

The first design task is to solve this usage tension, not to add 100 mm to another object. Do not stretch the island to 2000 mm unless the dining-chair condition is resolved with equal rigor.

## A1 decision gates — evaluate, never manufacture a green score

| Gate | Evidence required | At 8 October 2026 |
|---|---|---|
| Architectural feasibility | As-built survey + structural/developer approval of separator and bathroom doorway changes | **BLOCKED / no construction permission** |
| Services feasibility | Drain fall, island supply/waste, gas and ducted hood outlet, washing-machine weather exposure | **TBD / needs qualified engineer** |
| Daily prep | Uncovered sink and simultaneously usable, reachable dry prep; show working-person position | **K12: partial, end-access only** |
| Circulation | Two persons carrying things; oven or dishwasher open; dining chair occupied; entry/terrace passage | **PARTIAL / K12 end route restricted** |
| Storage | Household inventory assigned to actual net clear shelves/drawers including large pots and plates | **TBD / compact allocation, not proven sufficient** |
| Cleaning / durability | Splash, water joints, bin access, under-island cleaning, wipeable finishes, maintenance panels | **TBD** |
| Visual harmony | Same 42°/1.70 m human camera, daylight/evening and contextual reception views | **PROMISING / conceptual renderer only** |
| Procurement & costs | Real Egyptian-market SKUs and installed quotation, plus maintenance cost | **TBD** |

**No weighted score until hard gates are satisfied.** Compare choices by evidence and tradeoffs instead of aesthetic confidence or count of PASS checks.

## Experiment sequence (separate reversible branches, same snapshots and cameras)

### A2 — Kitchen alternatives (highest priority)

**A2a: K12 wet island (control).** Freeze island 1700 × 1000 mm, dining and user envelopes, stove, tall bays, and the render-only overlay. Test working sink + end prep + 2-person movement, dishwasher/oven/fridge openings, coffee workflow, 280 mm plates, largest family pan, bins and appliance cleaning.

**A2b: Dry island / wall sink (hypothesis, not a design yet).** Can the existing 1800 mm cooking wall, tall wall or legally permitted short return really fit a full working sink, dishwasher, waste and 600 mm hob without sacrificing vital worktop and storage? Prove it with **dimensioned plans plus drainage and extractor route** first. If not, reject rather than producing a pretty render. Do not invent a wall run outside canonical boundaries.

**A2c: Semi-open alternative.** Use a feasible closable kitchen edge only after measuring door parking, hood odor containment, island and table access. Compare with A2a in full open and fully closed modes. If this requires unauthorized demolition, keep only as a feasibility concept.

**A2d: Better dining interaction.** Before shrinking family seating, test moving/shaping dining furniture with 6 real chair pullouts and entry access. Simulate a person using the island end while another walks to WC, kitchen and entrance. No stools at the island unless specifically justified.

**Reference measurements, not certification:** family scenario script \`scripts/audit-advisor-01.mjs\` independently derives K11/K12 control gaps from exact snapshots and flags unapproved decisions. Representative guidance: NKBA kitchen planning guidelines (public edition) are design benchmarks, not Egyptian law.

### A3 — Reception and family use

Retain one comfortable ~2880 mm sofa, one lounge chair, six-seat dining scenario as an initial test, not a contract. Re-evaluate the 2000 mm buffet/sideboard and additional lamps/decor based on actual routes before deleting the family's daily seating. Test TV/sofa viewing and glare from the full-height reception glazing; leave accessible sockets and real charging locations. Prioritize circulation over guest-formal symmetry.

### A4 — Private rooms, storage and household evolution

Test two real modes for each 3.5 × 3.5 m secondary bedroom: current bed+desk+wardrobe, and future child/guest/quiet work mode. Validate pulled-out office chair, wardrobe doors, bed-making and night circulation. The master stays sleep-first: bed, blackout/privacy, quiet AC airflow and night lighting precede drawers and artwork. Keep the ~1.15 m private hall clear. Build an actual wardrobe item count before final joinery sections.

### A5 — Bathrooms, laundry and MEP

Verify master shower and family tub from finished wall/door/fixture footprints, real plumbing and waterproofing; check standing/swing and cleaning. Do not design pockets/ducts into the nominal 130 mm ceiling void without equipment-section proof. Service-terrace washer requires manufacturer outdoor permission, drainage, shading and protected electrics.

### A6 — Styling and product freeze

Warm restrained palette is a hypothesis: coordinated ivory, natural muted oak, warm stone, limited olive/bronze accents. Compare physical full-size floor samples, door-front samples and worktop samples in daylight and 3000 K evening light. Show real furniture dimensions/SKU, durability, maintenance, budget and lead time. Render evidence is not a source of real material fidelity.

### A7 — Construction handoff (hard final gate)

Signed-off as-built measurements, approved wall/opening schedule, architectural sections, MEP load and routes, waterproofing/falls, electrical and reflected ceiling plans, appliance install manuals, complete joinery elevations, door swings, priced BOQ and trade coordination. No "ready to execute" badge without these.

## Iteration review contract

Every option must declare:
1. **VERIFIED / INFERRED / EXPLORATORY / TBD** per material geometry and services.
2. Parent snapshot, commit SHA and canonical hash. No silent baseline changes.
3. The *single* design hypothesis and exact things changed.
4. Machine validation **including FAILs**, plus 42° human-scale and alternative wide camera review; compare same cameras in competing options.
5. Activity tests: cooking, washing, storage, seated dining, passage, cleaning, nighttime, family future-use.
6. Quantified gain **and loss**, and an explicit **KEEP / REVISE / REJECT**, with unresolved construction gates.
7. Photos/renders are linked to immutable build artifacts; never substitute generative approximation for dimensioned proof.

## Owner-first policy

The goal is the most comfortable, maintainable family home possible under actual geometry, services and budget. No need to fill empty corners. No idea, including our own earlier designs, is immune to challenge.
