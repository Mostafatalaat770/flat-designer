# A8 — Wet-room and Dressing Review (8 October 2026)

Status: **FUNCTIONAL REVIEW / EXPLORATORY / no construction approval**. Canonical Type B v0.2.2 hash `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`; parent snapshot K12 `scene-e2fcb932`. Saved cloud Studio and architectural walls/openings have not changed.

## Reproducible evidence

- [A8 GitHub Actions run](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37759082515) succeeded.
- Measured room/fixture projections from exact canonical model; `scripts/advisor-a8-private-wet-storage.mjs` produces `review-evidence/advisor-a8/private-wet-storage.json`.
- Room width/length inferred from calibrated diagram, **not measured finished plaster/tile surfaces**; do not treat exact decimals as construction precision.

## Most important findings

### Dressing
Two **1250 × 600 mm** wardrobes stand opposite one another in a 2754-mm model length, leaving **1335 mm between closed fronts**. Two opposed **625 mm hinged leaves** opened together theoretically leave **85 mm between leaf-tip boundaries**. This is not physically comfortable, even though *the closed-wardrobe scene looks spacious*. A person using one wardrobe while another is open on the opposite side is especially inconvenient.

| Model-only cabinet door concepts | One wardrobe open | One leaf on BOTH facing cabinets open | Other tradeoff |
|---|---:|---:|---|
| Each wardrobe 2 hinged leaves, 625 each | 710 mm | **85 mm** | Normal joinery/fully open access, serious simultaneous-use conflict |
| 3 hinged leaves, ~417 each | 918 mm | 502 mm | More seams/hinges; still poor two-person operation |
| 4 narrow hinged leaves, ~312 each | 1023 mm | 710 mm | Many seams; greater maintenance and hardware count |
| 2-track sliders, no swinging projection | 1335 mm nominal | 1335 mm nominal | Only roughly half-width cabinet access at a time, internal drawer clearance/track buildup must be validated |

**Lead direction:** Open an A9 hardware-feasibility comparison using factory technical data for a 4-panel, 2-pair folding system versus 2-panel sliders (and possibly asymmetric hinged fronts). **Do not select hardware just from the theoretical aisle.** Compare door heights/weights, leaf clearance, drawer access, installed price, local spares, exact slide/fold interference and long-term maintenance.

### Master ensuite
- Source fixture envelope **shower 1500 × 800 mm; vanity 600 × 460; WC 400 × 700**.
- Vanity/WC closed rectangular projections have around **235 mm side gap** (not the measured approach/leg room).
- The shower-to-lower-edge-of-original-dressing/ensuite-door y-distance is ~**159 mm** in the model, making exact screen/wet splashing/door opening orientation crucial.
- **KEEP** shower and compact vanity/wc footprint pending selected shower glass, correct drainage slope, mixer reach, waterproofing, cleaning and real opening. **Do not approve pocket-door widening** until the wall is surveyed for structure/services.

### Family bathroom
- Family-flexibility concept: **1500 × 750 mm tub, 600 × 460 vanity, WC retained**.
- Closed fixture edge gaps: vanity–toilet about **484 mm**, toilet–tub about **570 mm**. Those separations don't equal occupant clearance.
- A hypothetical 600-mm-deep user standing directly at the vanity overlaps the WC rectangle by **69,600 mm²**. That signals likely contention when two people use the room concurrently, not a legal clearance failure nor necessarily a reason to shrink the 600 vanity.
- **KEEP bathtub**, don't replace it with a shower based on appearance alone. Request exact sanitaryware and occupied-person/hinged bath screen review.

### Guest WC
- **350 × 180 mm** compact handrinse and the original WC, nominal entrance ~**657 mm**. This can reduce crowding but the handwash basin may splash; test with actual SKUs rather than an impossibly tiny stylish bowl. Current outward-swing is an **exploratory proposal** until the hallway/reception door arc is measured.

## Technical hard gates

Before waterproofing, screed or opening alterations: site-measured finished dimensions, exact WCs/vanities/tub/shower/manuals, drainage gradients and riser positions, local exhaust ducting, correctly detailed waterproofing and leakage tests, maintenance panels, shower screen hinge reach, pocket door wall feasibility, real cabinetry hardware and manufacturer drawings. Keep target **2500 mm clear ceiling** unless engineer designs localized MEP portions with actual equipment depth.

## What NOT to do

- Don't demolish/shift bathroom walls to chase a 3D image.
- Don't shrink good storage or a family bathtub just to make a scalar clearance bigger.
- Don't describe a model-only 625 mm door-leaf sweep as an actual manufacturer spec.
- Don't treat successful GitHub validator output as building regulations clearance.
- Don't merge A8 conclusions into a construction-ready package or saved cloud geometry without site validation.

**Result: REVISE dressing door mechanism first; KEEP wet fixture program provisionally; DEFER door opening and wet-area modifications to real MEP/architecture review.**
