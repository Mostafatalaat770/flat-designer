# CURRENT BASELINE — Type B, updated 2026-10-10

**Authoritative GitHub owner-review source**, not a construction approval. Read [the current owner decision sheet](./OWNER_REVIEW_20261010.md) and [machine-checkable decision registry](./decision-registry.json) before starting another design branch.

| Layer | Source / identity | Status |
|---|---|---|
| Architecture | Type B v0.2.2, SHA `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`; net clear ceiling **2.50m**, living glazing as modeled | MODEL-LOCKED; actual as-built survey still TBD |
| Last saved cloud Studio | v55, `scene-4821689`, storage revision **55** | SAVED; cloud renderer not changed by GitHub |
| GitHub owner-review input | `render-snapshots/current.json`, visual `scene-9cf45a73`, derived from cloud v55 | **SOLE WORKING REVIEW SOURCE**, merged to `master` by PR #45 |
| Historic v50 reference | `studio/local/sources/verified-master-v50.json` | ARCHIVED, not current |
| Archived K12 open kitchen | `render-snapshots/study-k12-unapproved-20261008.json`, `scene-e2fcb932` | UNAPPROVED CONCEPT; model geometry gates failed |

## Guest WC — B floating-compact preferred for DESIGN only, not ordered

[PR #58](https://github.com/Mostafatalaat770/flat-designer/pull/58) studies the 350×180mm current guest handrinse against a conditional **450×250mm** wall-mounted, visually floating walnut unit with 500×800mm nickel/task-lit mirror and one restrained taupe stone wall. From the same saved v55 cameras, real 4-frame source-locked WebGL screenshot review supports a cleaner look and more generous exterior basin envelope, but **does not certify actual bowl usability or body clearance**. Door and WC unchanged; original brown door visibly obstructs the camera, not a justification to modify it without survey. Exact source geometry: toilet vs proposed basin polygon gap **251.2mm**; sink front to door northern Y jamb projection **42.1mm** versus **77.1mm** in the small-basin source — neither a human route width nor door swing. A real 450×250 sink SKU, wall brackets, drain/tap rough-in, door clear opening, task lighting IP/CRI/lux and finishes are all **HOLD**. Do not change current snapshot or cloud v55 until independently approved.

## Master shower current decision — M0 800mm retained after measured M1 900mm study

[PR #56](https://github.com/Mostafatalaat770/flat-designer/pull/56) compared the current **1450×800mm** master walk-in (M0) with a conditional **1450×900mm** alternative (M1), moving the existing 600×2050mm independent fixed glass with its wet edge. Four true same-camera WebGL screenshots and exact-plan SVG are archived. **M0 is retained as design direction**, NOT a construction sign-off. M1 leaves only **15.7mm model Y-band projection** to the start of the dressing opening vs **115.7mm** in M0. Both have zero domain hard FAILs, but that does NOT validate wet-floor sloping, dressing splash or physical door swing. M1 stays unselected pending qualified site measurement and fully waterproof/door/mockup review. Model nominal entry 832mm is NOT installed clear walking width. Source snapshot and saved cloud v55 remain unchanged.

## Owner-preferred family shower — F1 frameless visual, NOT first-fix approved

[PR #52](https://github.com/Mostafatalaat770/flat-designer/pull/52) introduced an opt-in transparent glass visual, and [PR #54](https://github.com/Mostafatalaat770/flat-designer/pull/54) corrected the glass to the exposed SOUTH and WEST shower faces using exact 900×900mm Type B model geometry. A two-view genuine same-camera WebGL comparison shows a significant visual improvement over the current heavy dark-framed shower. **Owner direction for DESIGN DEVELOPMENT: F1 frameless/minimal brushed nickel; current live v55 remains its original `style` variant.** The 35mm base is a conceptual visualization only and can be deeper in real construction.

Critical source risk: the 580mm visual door cannot be assumed to open outward to the WC-facing south (WC only 319.6mm away) or toward the west bathroom wall (nominal 778.6mm strip, only 198.6mm left with outward leaf). Manufacturer + competent qualified wet-zone/sanitary engineer must specify actual safe inward/bifold/pivot operation, sealed enclosure, usable width, drain/waterproofing and service. Existing family hall opening is 656.7mm **nominal**; effective finished clear width is not verified. No vendor, tile/glass purchase or structural change is approved. [Geometry and release matrix](./FAMILY_SHOWER_GLASS_STUDY_20261010.md).

## Verified in the current GitHub review snapshot

- Canonical room geometry is preserved, with no demolition. Kitchen **is enclosed**, awaiting the two-option owner/engineer decision, not because an open layout has been permanently rejected.
- Master ensuite has **1450×800 mm** conceptual true open walk-in rendering (no default enclosure/tray), one separately modeled fixed glass panel and two shelves. The **cloud's live shower mesh may still differ** until the server renderer and contracts receive the same opt-in variant. All wet build details are exploratory.
- Family bathroom retains the **900×900 mm** shower and a shallow dry-side wall-hung cabinet. Its actual occupied clearance remains a hold. Do not treat sampled route metrics as physical clear width.
- Reception includes one **2000×950 mm** dining table with **six** chair objects. An actual occupied-six-person mockup and safe pulled-out-chair circulation are still required.
- The study registry records **no** physical/structural/MEP/procurement approval. A green WebGL capture is *not* an installed-space inspection.

## Current kitchen interior-direction milestone — P1/F1 (concept only)

After direct image review of exact same-camera real P0/P1 WebGL, the **preferred design direction to develop** is **P1 semi-open kitchen portal**, with **F1 warm off-white narrow plaster return and simple, flush floor threshold**. This **does not approve demolition**. Original plan opening nominal **720.2mm**, conditional P1 nominal **1207.4mm** by render-only omission of kitchen-facing wall #44; finish and structural details may reduce this. The proposed floor/trim/lighting and any glazed screen are not installed or ordered.

**Important:** `render-snapshots/current.json` and the saved cloud v55 **remain the unchanged enclosed baseline**, and the canonical architecture is unchanged. PR #49 is a comparative design package, not a production room mutation. Physical developer/qualified engineer confirmation for wall 44 and services, measured lintel/head, safe gas ventilation, true appliance-door and six-chair operation are mandatory. Full-width hidden pocket is not selected: the adjacent nominal return is only 783.8mm for a 1207.4mm opening.

Source: [P1 conditional option](./SEMI_OPEN_PORTAL_REVIEW.md), [P1/F1 engineering & finishing gates](./P1_PORTAL_FINISH_AND_FUNCTION_20261010.md). Alternative historical full-open wet island K12/B1/B2 stays unapproved; do not import those kitchen+potential-bath demolition overlays.

## Workflow after PR #45 merge

1. **Branch from current `master`** (not the historical integration branch). Base every review on `render-snapshots/current.json` and assert its provenance, canonical hash, active revision and registered construction hold points.
2. Produce at most two useful design options per high-impact room decision, using source-faithful geometry and real furniture operating states; do not silently import the failed K12 overlay.
3. Run builds, validation, studio tests and `node --test studio/local/owner-decisions.test.mjs`; visually inspect matched room images with visible camera and screenshot provenance.
4. For a source change, intentionally revise the decision registry/owner document along with the snapshot after validation; otherwise the new gate will fail, as desired.
5. Keep Vercel authenticated. Browser local `localStorage` saves do not sync to the original cloud Studio; verify source IDs. Cloud design mutations and structural alterations should not be conflated with GitHub merges.
6. No fabrication, slab change, wet first-fix, MEP works, procurement or construction claim without measured survey and relevant Egyptian qualified professional and developer approvals.

**Next public-zone design sprint (started 2026-10-10):** [Reception + entry + dining + kitchen connection](./RECEPTION_ENTRY_DINING_SPRINT_20261010.md) is the active visual/functional coordination brief. Test an arrival hierarchy, buffet material weight and two whole-zone lighting/finish concepts on v55, and compare conditional **P1/F1** against closed P0 using identical cameras and the six occupied-chair / appliance-door usage states. **P1 remains a structural/developer/MEP HOLD**, not a building change. Bathrooms remain documented technical holds; do not silently import historical K4/K12 or treat a scene comparison as an as-built drawing.
