# K4 Bathrooms — reconciled current Type B review, 10 October 2026

**CURRENT SOURCE OF TRUTH:** [CURRENT_BASELINE.md](./CURRENT_BASELINE.md) + [decision-registry.json](./decision-registry.json) + `render-snapshots/current.json`. This file's **original K4 concepts are historical and superseded** (preserved verbatim below so no design decision is silently lost).

**STATUS: DESIGN DEVELOPMENT ONLY — NO PLUMBING FIRST FIX, WATERPROOFING, GLASS PURCHASE, ELECTRICAL/WET INSTALL APPROVAL.** Architecture Type B v0.2.2 canonical SHA `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`; finished clear ceiling 2.50m; cloud saved v55 `scene-4821689`, GitHub current review `scene-9cf45a73`. Neither has been changed by these studies. Vendor field measurements and competent local design approvals always govern installation.

## Current and preferred bathroom programs

| Space | SOURCE v55 as modeled (not installed) | Preferred design-development direction | Pending release gate |
|---|---|---|---|
| Master `BATH-M01` | Independent **1450×800mm** walk-in; fixed glass **600×2050mm**, two 380×115mm shower shelves and original vanity/WC | **M0 current footprint retained.** Slim clear fixed glass and removable cleanable nickel wet trays plus properly designed 3000K facial task light are optional **M2 detail experiments**, **NOT homeowner-approved products** | Real 800mm occupied comfort and dressing-door splash/hinge; screed/drain/waterproofing; certified glass panel support (**~151mm model east end gap**); shelf anchor and electrician signoff |
| Family `BATH-C01` | **900×900mm shower**, current source style still heavy-looking framed and raised; original vanity/WC plus retained dry cabinet | **F1 visually preferred**: clear glass on exposed **south/west** sides, lighter clipwork, muted stone; no assumption a 35mm rendered tray is buildable | 580mm leaf **not** approved to swing south (WC) or west (narrow room strip); manufacturer-tested inward/pivot/folding opening; actual waterproofing, wet tile grip, 657mm nominal hall door clearance |
| Guest `WC-01` | **350×180mm** compact walnut handrinse, WC, existing reception hinged door nominal **656.7mm** | **B proposal as of PR #58 under review**: **450×250mm** floating compact walnut handrinse, same pipe center in the 3D candidate; nickel/task-lit 500×800mm mirror, one taupe mineral wall. *Until #58 is merged/approved, regard B as PROPOSED, not final.* | Real external basin+internal bowl+taps handwashing/splash; wall-load brackets/drain service; door actual leaf/swing and seated-WC usage; nominal **~251mm** basin-to-WC footprint gap is not a usable aisle |

No kitchen, reception, bedrooms, outer glazing, walls, floor slabs, plumbing points, 2.50m clear ceiling or saved Studio source may be modified merely because a proposed visual looks better. All source sizes are **nominal model geometry**, not measured finished internal clearances.

## Coordinated interior-design language for the three spaces

- **Unified calm warm stone**: soft warm ivory field wall porcelain, subdued greige/taupe accent only at one controlled wall/wet area, and harmonized matte sand floor. Select actual **wet-appropriate grip/class tested samples**; a matte render/material label is never proof of grip.
- **One metal family**: nickel/satin-chrome look for glass clamps, towel hardware, shower controls and mirror frames; avoid random brushed-gold vs black industrial vs chrome clashes. Choose one actual manufacturer finish before order, and verify spare-part availability/corrosion resistance.
- **Master**: visual emphasis on one fixed clear screen, composed wall, thoughtfully placed shallow trays and practical face illumination. **Reject deeper 900mm shower M1** unless site survey resolves dressing-door wet proximity (image-only Y projection **115.7mm→15.7mm**).
- **Family**: durability, easy cleaning and water containment rank above a faux-curbless photograph. The original K4 **1500×750 bathtub** remains an **ARCHIVED alternative, not the selected 900×900 shower**. Don't insert a tub, raise/lower floor or change door because an old checklist mentions it.
- **Guest**: a quiet focal mirror/stone panel and basin that actually lets visitors wash their hands with a correctly sized faucet; keep the floor open, storage concealed and towel/tissue within reach without creating new obstructing furniture.
- **Lighting**: 3000K design direction and **high-CRI (target 90+)** genuine fixture families, separate face-task from general/late-night ambient where feasible. Task mirror glow in 3D is non-photometric; wet electrical zoning, protection, safe conduit/circuit and ventilation must be designed by the competent local engineer, not read from an image.
- **Tile setting**: make true room elevations and tile grid from measured finished walls; align major joints with vanity/mirror and the shower edge, minimize narrow end cuts and water-trapping niches; wet floor gradients govern final tile format. No decorative dropped ceiling assumed (clear 2.50m kept).

## Before any contractor can release plumbing, glass or tile orders

1. Survey **finished** internal room rectangles/polygons and every doorway/hinge swing, threshold, riser/supply/drain/invert and vent route. Document site photos and red-line discrepancies to canonical JSON; request explicit owner/engineer authorization for any geometry changes.
2. Select exact manufacturer **WC, basin, tap, mixer/head, shower glass, tray/curb if needed, drain and cabinets**. Obtain dimensional and operating drawings including spare seals, hidden brackets, replacement parts and maintenance access, plus a 1:1 placement/tap-splash test. No substitute just because outer width matches a renderer box.
3. Create integrated **waterproofing + trap + screed falls + upstands + penetration/anchor sealing** detail for each wet zone from a compatible system and local specialist. Verify flood test, access to cleanout and safe floor grip by the selected manufacturer test evidence.
4. Produce source-grounded **glass shop drawings** for master and family: openings, wall substrate, glass grade/height, braces and wet seals. Show fully open door/standing and WC seating, not just a closed door in a 3D screenshot.
5. Lighting/electrical/ventilation: validate power points, wet-zone location/IP, earthing/RCD protection, full mirror/face task illuminance (not an emissive 3D strip), ventilation capacity and duct exhaust, humidity and fan switching to locally applicable standards.
6. Verify all fixture and cabinetry access: reach while washing, towel/roll holder, cleaning corners, drain/valve service, stable shelving loads, sharp-edge avoidance and a 1:1 mockup with household members.
7. Photograph and sign off a cohesive **real material board** in planned lighting: ivory porcelain, one accent per space, sand-grip wet flooring, consistent nickel hardware, walnut/wood sample, grout and sealants. The supplier needs an exact SKU, budget, replacement stock and suitability certificates. Do not approve floor grip by appearance.

## Change log

- Earlier K4 paper proposal: master 1500×800, family 1500×750 bathtub, speculative dressing door widening/pocket door. **Archived below; never implemented in current source.**
- [PR #51](https://github.com/Mostafatalaat770/flat-designer/pull/51) finish comparison passed but selected no final tile scheme.
- [PRs #52, #54, #55](https://github.com/Mostafatalaat770/flat-designer/pull/54) family F1 visual study and explicit safe-glass hold.
- [PR #56](https://github.com/Mostafatalaat770/flat-designer/pull/56) master 800 vs 900 study, M0 retained.
- [PR #57](https://github.com/Mostafatalaat770/flat-designer/pull/57) optional M2 refinement, no actual glass/wiring product selection.
- [PR #58](https://github.com/Mostafatalaat770/flat-designer/pull/58) guest basin/vanity A/B study; merge and design preference status to be confirmed separately in machine registry.

---

## ARCHIVED — original K4 design-development text (superseded, not current source)

**CAUTION:** all "preferred" claims below are historical brainstorming, not instructions to replace verified v55 shower and fixtures. This preserves the exact former design rationale for auditability.

### Original K4 Bathroom Design Development

Status: **DEVELOPED LAYOUT / WATERPROOFING + PLUMBING DESIGN REQUIRED**

## Master ensuite
Preferred direction:
- 1500 × 800 mm walk-in shower.
- 600 mm closed vanity.
- WC retained.
- Widened dressing-to-ensuite opening / pocket-door direction remains preferred.

Shower development:
- Fixed glass panel preferred over a swinging shower door if splash containment allows.
- Recessed niche only on a wall confirmed free of structural/services conflicts.
- Linear vs point drain remains plumbing/waterproofing decision; falls must be drawn, not inferred.
- Use anti-slip wet-area flooring.
- Provide accessible mixer/hand shower; overhead shower optional.
- Avoid unnecessary ledges that collect water.

## Family bathroom
Preferred direction:
- 1500 × 750 mm bathtub to preserve family/child/soaking capability.
- 600 mm closed vanity.
- WC retained.
- Wider/sliding-door concept remains conditional on pocket/surface-slide detailing.

Tub development:
- Practical bath screen preferred to a full curtain if maintenance and swing allow.
- Storage niche / shelf only after waterproofing build-up is coordinated.
- Anti-slip floor outside tub.
- Easy-clean access panel if concealed valves/trap require service.

## Guest WC
- Existing opening retained in current low-demolition strategy.
- Door opens outward in the study.
- Compact 350 × 180 mm wall-hung handrinse.
- Mirror approximately 450 mm direction.
- Prioritize clean floor clearance and easy cleaning over decorative cabinetry.

## Common technical requirements
- Full wet-area waterproofing system by one compatible manufacturer/system.
- Waterproofing upstands, penetrations, corners and transitions detailed before tile order.
- Floor falls and drain elevations set before screed.
- Concealed cisterns/valves only with reliable service access.
- Coordinate wall build-up with the clear width of pocket/sliding door systems.
- Final sanitaryware dimensions must be inserted before rough-in.
- Provide mechanical exhaust where natural ventilation is insufficient.
- Lighting: 3000 K, high CRI, general + mirror/task layers.
- Tile module/layout should minimize narrow cuts at niches, vanities and tub/shower edges.

## Finish direction
- Quiet warm stone / porcelain family, not high-contrast hotel styling.
- Master can be slightly warmer / more tactile.
- Family bath should be the most durable and forgiving.
- Guest WC can take one stronger material/detail because the room is small, but keep maintenance simple.

## Before waterproofing / plumbing rough-in
1. Select exact WC, basin, taps, shower set and tub.
2. Confirm concealed vs exposed valves/cisterns.
3. Confirm drain positions and finished floor levels.
4. Confirm door system build-up and clear opening.
5. Produce tile-setting elevations.
6. Approve waterproofing system and inspection/testing sequence.
