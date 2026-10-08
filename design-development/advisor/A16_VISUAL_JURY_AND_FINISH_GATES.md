# A16 — Reception + kitchen finishes · visual jury brief

**8 October 2026 | Not approved for construction or procurement.**

Source of truth: original Type B geometry v0.2.2 `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`; design source `design-development/k12/snapshot.json`, `scene-e2fcb932`. **Two original open-kitchen wall/structural canonical FAILs remain.** Owner/family comfort and daily usability are first priority, not a showroom look.

## Three exact-same-furniture controlled images

| Trial | Reception floor (generic visual) | Kitchen floor | Wall/wood/furniture direction | Daily use hypothesis |
|---|---|---|---|---|
| Current | Existing K12 warm oak look, source placement | Warm honed limestone-look | Strong golden island and walnut buffet | Known reference; composition and existing geometry not artistically 'fixed' |
| **A — Calm Contemporary** | Matte cream honed-porcelain *look* | Same porcelain look continuous in K12 **only if open-plan separator approved** | Softer ivory, pale oak, lighter buffet, sand/cream chairs | Reads airy and bright; can mop continuously, but hard reflective floor may feel cold/noisy; verify slip rating, grout, underfoot/echo and wet-room thresholds |
| **B — Warm Japandi** | Warm oak *look* | Separate porcelain kitchen | Tinted ivory/clay, slightly muted oak, subdued olive chair, earthy upholstery | Home-like warmth and zoning; real wood/wood-look product cleanability and water at terrace/kitchen transitions unresolved |

### What the renderer is permitted to change
* Decorative `layout.decor.saved.warm.rooms/colours`, furniture **colours/material IDs** only (not size/position/room), `layout.studio.rooms.RECP-01/KIT-01` wall/brightness/renderer lighting intent, existing interior object **colour/material references**, reception floor & existing kitchen floor assignment, existing warm wall material IDs and **existing** curtain colour (same openness).
* Variant material IDs are `source_status=GENERIC`, not endorsed Egyptian supplier/stock. Both run from the exact unchanged `architecture_variant`, same windows, structural wall segments, 2500mm clear ceiling, six chairs, table, kitchen island, sinks, all appliances.
* Render purpose: relative comparison of *look and feel* only, not achieved lux, construction acoustic certification, water resistance or natural daylight colorimetry.

### How to judge fairly
1. **Warmth and visual calm:** which has less visual clutter and gives family a welcoming non-showroom mood?
2. **Spatial perception:** does the floor transition/stone continuity help the real geometry or create a disconnected kitchen?
3. **Practical family use:** spills, entry cleaning, sunlight/heat, children, terrace moisture, chair scratches and keeping the island safe.
4. **Long-run maintenance:** grout/porcelain cleaning and acoustic felt/rugs vs wood/wood-look water/scratch/refinishing.
5. **Design coherence:** softened buffet & kitchen joinery, ceiling/curtain palette and actual table seating. Do not introduce decor that blocks circulation or door opening.

### Next gates
- After exact camera-verified true WebGL render, **KEEP or REVISE** the best *visual direction*, not a construction finish.
- Confirm whether reception+K12 kitchen open concept is approved structurally *before* allowing a one-floor continuous material specification.
- Supply real floor/material samples and 3 Egyptian manufacturers or local stock options, real porcelain slip data and installation specs; budget based on surveyed net area and wastage.
- Test 3000K dimmable layers with real fixture catalogue and ceiling RCP; no false recessed-air-conditioning slot in 2.50m net height.
- After choosing direction, create a coordinated **room-by-room finish palette** for the entire apartment, then trusted quote/tender package.

## Exact renderer evidence contract
[PR #32](https://github.com/Mostafatalaat770/flat-designer/pull/32) and [A16 GitHub CI](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37780736970) will produce **3 variants × 2 identical model cameras** (living area and 6-seat dining view), six PNGs, one browser, manifest SHA/scene/camera checks, no missing/fallback assets. No photography or AI image hallucinations substituted.

**Site engineering status: TBD** · **master / cloud saved Studio: unchanged** · **purchase status: NOT APPROVED**
