# Whole-apartment design master plan — continuity contract · 11 October 2026

**Purpose:** Create a beautiful, coherent, comfortable **entire apartment**, with practical spatial decisions and concept-level engineering coordinated early. This is an exploratory owner design project; there is **no decision yet to execute the presented design**. Do not prematurely optimize individual appliance specifications. The end goal is an owner-reviewed concept and a separate, later, qualified construction release if requested.

**Canonical tracking index:** [GitHub Issue #41](https://github.com/Mostafatalaat770/flat-designer/issues/41). **Live task status belongs in GitHub Issues**, not duplicated in this document or scattered chat logs. [Site & professional MEP gate #19](https://github.com/Mostafatalaat770/flat-designer/issues/19) is a separate future release requirement.

## How we work — lasting ownership

**Owner direction · 11 October 2026 (M3 Group 1B):** Exhaust meaningful reversible furniture/storage/curtain and seating improvements in the exact source model before requesting physical measurements. B Warm Japandi is promising, **not approved**. After delivering the functional optimization owner review, prepare the independent bedrooms/WIC group while retaining Group 1's unresolved site gates. Missing physical measurements for one group do not block independent model-based work elsewhere; site, procurement and construction release remain HOLD.

- **Owner:** direction, priorities, taste, optional budget range and explicit design approvals. Silence is NOT approval.
- **ChatGPT / design lead:** architecture & interior design critique, coherent priorities, synthesis of real references, prompt/acceptance-quality ownership and progress review.
- **Codex / implementation lead:** repo search, measured model checks, original 2D/3D WebGL, reversible candidates, scripts/tests, visual artifacts and issue/PR traceability. One work item at a time.
- **Licensed architect / Egyptian electrical, plumbing, structural and HVAC specialists when needed:** verify real site conditions, safety, code, construction and installation; simulations cannot replace them.

## Scope priority (in order of value, not novelty)

1. **Truthful function:** geometry/source traceability; circulation; rooms and doors; zoning; furniture and storage that are comfortable for family. Preserve model floor-to-ceiling living glazing.
2. **Early architectural/first-fix intent:** electrical socket and switch locations based on furniture; lighting layers/RCP and controls; AC/exhaust/drain logic; waterproofing and safety zones; bathroom usability; floor material transitions and ceiling strategy.
3. **Real interior design exploration:** look at contemporary designers' projects, Pinterest/Houzz and physical-style precedent; compare three aesthetically DISTINCT whole-home schemes (not 3 adjacent hex values). Materials, color, sofa/bed forms, cushions, curtains, mirrors, art, plants, bath accessories and tactile/maintenance quality.
4. **Room-by-room concept validation:** source-traceable plan + fit/circulation + controlled realistic WebGL images + plain-language professional critique and owner-ready tradeoff.
5. **Only when owner commits to execution:** as-built survey, chosen manufacturer SKUs, shop drawings, cable schedules, fixture photometry, BOQ and professional construction signoff.

## Source hierarchy — DO NOT confuse sources

| Layer | What it means | Decision status |
|---|---|---|
| Canonical Type B `v0.2.2`; SHA `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658` | 13 room/terrace geometry, openings; nominal **2500mm finished ceiling**, full-height living glazing | MODEL-LOCKED, **not site surveyed** |
| Last saved cloud v55 `scene-4821689` | Cloud saved user state, storage 55 | Original user state; no changes without permission |
| `render-snapshots/current.json` visual `scene-9cf45a73` | Source-aligned whole-home owner-review input derived from v55; current GitHub master review baseline | **Whole-home planning reference** |
| `design-development/reception-sprint/A-P0.json` `scene-9e86635b` | Option A reception/kitchen visual study, **original enclosed kitchen** | **Design alternate**, not global physical source |
| R4 `scene-3b86c557`, R5 D1 and R6 L2 | Ivory cabinets / greige doors / task-lighting concepts, all with provenance | **Kitchen visual leads only; no vendor/construction approval** |
| Historical v50, K4, K11/K12 full-open layouts | Archived exploratory options, including unresolved geometry/MEP holds | **NOT current architecture or default variant** |

Canonical master status and original bathroom conditions are also documented in [CURRENT_BASELINE.md](CURRENT_BASELINE.md), [OWNER_REVIEW_20261010.md](OWNER_REVIEW_20261010.md), and [decision-registry.json](decision-registry.json). Preserve these records and their actual review statuses.

## Whole apartment coverage

Exactly 13 original spaces (must all appear in review matrix):
- **Public:** `RECP-01` (living + six-person dining), `HALL-01` (entry/hall), `WC-01` (guest WC).
- **Private:** `MBR-01` (master bedroom), `BR-01`, `BR-02`, `WIC-01`.
- **Wet/utility:** `KIT-01`, `BATH-M01`, `BATH-C01`.
- **Outdoor:** `TER-MAIN`, `TER-MBR`, `TER-SVC`.

Function-specific focus, to avoid overinvesting in one room:
- Reception/dining: sofa/TV/readability, glazing/daylight/glare, 2000×950 model dining with six seats, comfortable standing/pull-out/serving space, entry screen/privacy, sideboard, feature lighting, rugs and plants.
- Bedrooms/WIC: bed/desk wardrobes, access/swing/storage, reading/charging, acoustic comfort, curtain/AC airflow, child/guest flexibility.
- Bathrooms/WC: walk-in/shower ergonomics, WC/basin, mirror task lighting, towel/shampoo access, anti-slip, waterproofing, niche vs surface shelving and maintenance.
- Hall/entry: usable shoe storage, drop zone, mirror, lighting, switch accessibility and continuity of flooring.
- Kitchen: function, existing closed-P0 and visual R6 source safe; keep detailed appliance/installation SKU selection deferred.
- Terraces: safe access, weather-rated finishes/lights, service usability, planting and drainage.

## Milestones, GitHub links & definition of done

| Order | GitHub task | Deliverable / quality bar | Depends on |
|---|---|---|---|
| **M0 — COMPLETED** | [#69](https://github.com/Mostafatalaat770/flat-designer/issues/69) | Delivered [source-based 13-space/77-object matrix](whole-home-m0/ROOM_MATRIX.json) at [`c063426`](https://github.com/Mostafatalaat770/flat-designer/commit/c0634268bb6b029d53ebcc5cf2eb6895d5f8c043). All 65 historical A15 intents are identified, not transferred by assumption. Exact-HEAD CI never ran steps. | Current canonical/v55 |
| **M1 — NEXT** | [#70](https://github.com/Mostafatalaat770/flat-designer/issues/70) | **Concept** electrical outlet/switch/TV/data, RCP lighting/control, selective ceiling, HVAC/service and floor/threshold overlays; every point linked to room + intended furniture and unknown real coordinates. | #69; #19 safety gate |
| **M2** | [#71](https://github.com/Mostafatalaat770/flat-designer/issues/71) | 3 distinct **whole-home** visual directions with attributed designer references/moodboards, materials/colors/sofa/bed/baths/textiles/greenery/maintenance. Choose a lead and credible alternative, not near-identical palettes. | #69 |
| **M3** | [#72](https://github.com/Mostafatalaat770/flat-designer/issues/72) | Room-group reviews; source-locked 2D fit and authentic matched-camera render when necessary; explicit pros/cons, handoff and owner direction. Child issues created **just in time**, not bulk 13 now. | #69, informed by #70/#71 |
| **M4 — conditional** | Existing [#19](https://github.com/Mostafatalaat770/flat-designer/issues/19) | Measured as-built, qualified first-fix, fixtures/products, installer drawings, engineer/site permissions, construction release. | Owner decides to execute |
| **M5 — conditional** | Create issue only if requested | Verified Egyptian supplier BOQ, procurement sequencing, contractor control and changes | M4/site truth |

**WIP limit:** ONE implementation task active in Codex, optionally one parallel, bounded design inspiration task. Do not advance just because artifacts were generated; each milestone must satisfy its own evidence-based acceptance criteria and be reviewed. Engineering and aesthetics are parallel tracks, not sequential over-optimization.

## Design candidates — sensible visual defaults, not approvals

Keep Option A Calm Contemporary/Modern Organic as a fair incumbent, but compare *different* coherent styles: **Warm Japandi** and **Contemporary Mediterranean / restrained Soft Luxury** (third chosen only after inspecting real precedents). Explore stone/limestone-look **porcelain vs actual marble** (stain/maintenance/cost/weight), wood/parquet placement, warm neutral paints, performance upholstery/curved vs linear sofas, texture-rich cushions, light fixtures, bathroom trim, plants/greenery and artwork. We may combine elements if the resulting whole-home vocabulary remains consistent; never change geometry just to copy a Pinterest composition.

Concept electrical points/lighting zones are **relative functional intents**. Exact socket coordinates, conductor size, panel/breaker specs, wet-zone electrical protection, sprinkler/fire/extraction/AC ratings, realistic site cost and building-code signoff require measured site conditions and qualified professionals. A model/RCP proposal is not an approved circuit plan.

## Handoff and acceptance template (each active issue)

1. **Starting checkpoint:** issue number, commit/head/branch, model and scene IDs, inherited evidence (no new from-scratch generation).
2. **Decision question:** which practical/design choice is to be improved? State at most two meaningful local alternatives.
3. **Source/assumptions:** geometries and original object IDs; tag each statement as `SOURCE_VERIFIED`, `MODEL_TESTED`, `DESIGN_LEAD`, `EXPLORATORY` or `SITE_HOLD`.
4. **Deliverable:** versioned plan/room view(s), photographic inspiration with linked attribution, actual renderer comparison only when useful, testable QA for source mutations.
5. **Review:** professional critique on comfort, aesthetics, cleaning, accessibility and family routines; what looks wrong and how it was addressed.
6. **Status:** mark GitHub issue stage, link PR/artifact/check results; indicate local PASS separate from GitHub Actions PASS; do not claim CI passed unless the exact-HEAD run did.
7. **Continue:** give exactly the next issue/owner decision and carry forward accepted-for-study details, leaving construction/procurement/cloud approval flags false.

## Project board — optional minimal GitHub Projects v2

The Issues already work **without** a board. If a board is created later, make **one private user-level Project**, `Type B — Apartment Design`, linked to this repo; include #41 (epic), #69–#72, #19 and relevant current draft PR only. Three views are plenty:
- **Board** grouped by Status: Backlog, Next, In Progress, In Review, Blocked, Done.
- **Table** with Status, Priority (P0/P1/P2), Area (Whole-home / Functional-MEP / Aesthetics / Room-design / Site-execution), linked issues & PRs.
- **Roadmap only when real target dates exist**; don't invent completion dates.

**Avoid duplicate source-of-truth fields:** project Status is live task state; architectural source remains JSON; owners' release decisions remain registry; this MD is strategic plan. New issues require acceptance evidence, not only a title. Do not invent GH Project IDs/URLs or pretend the board is created without verifying it.

## Current transition / why kitchen SKU research is parked

R4–R6 genuinely improved source-faithful cabinetry/finish/lighting and are preserved in Draft [PR #68](https://github.com/Mostafatalaat770/flat-designer/pull/68). Their installer/manufacturer constraints are valuable later, especially 875mm DW visual body vs 860mm countertop proxy; **not a verified incompatible appliance**. The owner explicitly prioritizes whole-apartment function, electrical point location, floors/hall and baths, interiors, moodboards and coherent decoration BEFORE device-SKU deep dives.

Start with **#69**, not `R7 manufacturer selection`. GH Actions have shown 0-step/runner startup failures; do not mistake local Codex tests for CI success. No `master` merge, site work, cloud save or purchases approved by this plan.

## M0 → M1 continuity checkpoint · 11 October 2026

M0 [Issue #69](https://github.com/Mostafatalaat770/flat-designer/issues/69) is **COMPLETED**, source inventory at [`c063426`](https://github.com/Mostafatalaat770/flat-designer/commit/c0634268bb6b029d53ebcc5cf2eb6895d5f8c043). NEXT is [#70](https://github.com/Mostafatalaat770/flat-designer/issues/70). Continue using [ROOM_MATRIX.json](whole-home-m0/ROOM_MATRIX.json) and [VALIDATION.md](whole-home-m0/VALIDATION.md); do not create new master plans. Live #41 overrides this point-in-time checkpoint.

A15/K12 historic 65 functional MEP intents: 8 `MISSING_FROM_CURRENT`, 5 `CHANGED_SAVED_FURNITURE_ENVELOPE`, 14 same-envelope but operationally unverified, 38 room-only intents. **Classify EACH into REANCHOR_WITH_EVIDENCE / KEEP_ROOM_LEVEL / PARK_ALTERNATIVE / RETIRE_DUPLICATE**, with direct current source IDs and original evidence. The missing E2 island sink and old service-terrace washer are **not** current-installed wet utilities: keep K12 wet island as unapproved alternative and indoor P0 washer as the current reference. No autoposition from historical coordinates/nearest neighbour; no false 1:1 electrical or wet-services transfer. Concept overlays use relative, visually understandable zone labels and `TBD_AS_BUILT`; qualified engineers + #19 own physical first fix.
