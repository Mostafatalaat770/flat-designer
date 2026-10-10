# R2 — Everyday plates and cabinet depth, on unchanged A/P0

**Design research only. No construction or purchase release.** Pin to `design-development/reception-sprint/A-P0.json`, SHA256 `017a76a5fc6d5ff0e90f1adb10140c7098e3c2cc3e86d18e7a0b0c0fd439ec2a` (scene-9e86635b; cloud source scene-4821689 v55; canonical Type B SHA `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`). 2500mm model ceiling. Do not change architecture, source scene or original kitchen doors.

## Design recommendation, not an approved placement

**D1 — preferred for development:** KEEP 330mm source north upper for cups/small bowls. Test the possibility of a genuinely accessible **deep base drawer for larger heavy daily plates**, only if real oven-under-hob installation, the 1500×600 west cooking run, service-door operation and actual cabinet hardware leave a usable aperture. We do **not** know that such a free drawer already exists.

**D0 — fallback:** Keep 330mm source upper and put large serving/plate stock in the 2000×400×800 dining buffet. Buffet is not a frictionless everyday unloading destination; exact model centres are 5690mm apart from the dishwasher in straight-line plan, NOT walking distance, and six occupied chairs plus open doors have not been approved in a 1:1 mockup.

**D2 — alternate only:** Hypothetical north upper 350–360mm deep instead of existing 330mm, without moving walls or expanding floor footprint. This is a reversible furniture-only prototype, conditional on weight, head clearance, hinge, reach, wall anchoring and real operating mockup. More depth is not automatically better.

## Exact transparent dimensional sensitivity

Model north upper has **1800×330×700mm EXTERIOR**. Assumed back 18mm, front allowance 18mm, and a *trial* 10mm handling margin on BOTH sides of a flat plate. Required **EXTERIOR depth = example plate diameter + 56mm**. All millimetres are hypothetical for the plate and joinery interiors, not as-built or product-data facts.

| Sample plate diameter | Minimum external depth by trial assumptions | Original 330 | Trial 350 | Trial 360 |
|---|---:|---|---|---|
| 270mm | 326mm | Model pass | Model pass | Model pass |
| 285mm | 341mm | **Model fail** | Model pass | Model pass |
| 300mm | 356mm | **Model fail** | Model fail | Model pass |

The original 330mm cupboard's trial clear depth is 294mm; 350mm -> 314mm; 360mm -> 324mm. No 12-plate mixed packing, door/rack, real plate height or weight, cleaning, supplier/installer performance, physical corridor or safe upper loading is certified. Where food preparation or safe access is affected, prioritise safe movement over maximizing cabinet litres.

Original source objects: dishwasher model niche nominal 600×610mm, north upper 1800×330×700mm, dining buffet 2000×400×800mm and west cooktop counter 1500×600mm. Dishwasher-to-west-run *centre-to-centre STRAIGHT distance* 1591mm — not a confirmed physical access route. Preserve indoor washer, original doors and all wet/gas points. No K4/K11/K12 island/pantry, and no unapproved wall44 portal.

## Before release: six mandatory checks

1. **Owner family:** real dinner plate/pot/stock size and count, not sample objects.
2. **Kitchen joiner & qualified oven/hob installer:** whole 1500mm west run and real gas, oven and unobstructed drawer opening; nobody should assume a free empty cabinet.
3. **Site engineer & joiner:** physical 350/360mm upper cabinet mockup: wall fixation, 2.5m net ceiling, head/reach, service clearance and hinge.
4. **Appliance installer:** 600mm CLEAR integrated DW cavity, opened leaf, extended lower basket and standing user.
5. **Six household dining users:** buffet door/fully pulled chairs/kitchen-to-dining tray route test.
6. **Qualified MEP:** power, extraction, drainage, protection and maintenance access.

## Actual files and validation status

- Independent R2 review ZIP supplied in conversation: `Owner-Dailyware-Decision.html`, exact original source snapshot, 3 *original signed SHA-verified* A/P0 WebGL frames, `DAILYWARE_DECISION_R2.json`, 15 source-derived plate/depth trials CSV, 6 field RFIs, SVG cross-section. The original source image and A/P0 snapshot SHA verified against GitHub Action run #38046581713.
- We independently repeated all 15 arithmetic cases from GitHub source data. These 15 are **calculated**, not verified installation passes.
- GitHub Actions latest owner-release workflows **fail before any runner job steps**; do not describe later branch changes as CI passed. Last successful prior owner review build was HEAD 14cd2d24 on 2026-10-10. Do not approve master merge, wall change or joinery ordering until new exact-head tests and real site evidence.
