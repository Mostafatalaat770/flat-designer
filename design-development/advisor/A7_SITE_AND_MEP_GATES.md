# A7 — Gate checklist for island moved 150 mm toward reception

Status: **EXPLORATORY / not structurally, MEP or procurement approved**.

## What this design changes — and what it does not

Parent design: frozen K12 `scene-e2fcb932`. Island **1700 × 1000 mm** and sink stay centered in the same cabinetry relative to each other. This study places both **150 mm north**, into the living/reception side. Gas hob, two cooking drawer banks, three 600-mm tall units, coffee niche, dining 2000 × 950, six dining chairs, armchair, sofas, full-height glazing and 2500-mm finished ceiling remain unchanged. Original K4 render-only open-wall overlay and its **two unresolved canonical hard failures** remain visible.

### Audited model measurements

| Metric | Frozen K12 | +150 mm candidate |
|---|---:|---:|
| West cooking work aisle | 1219 mm | 1219 mm |
| Tall wall to island, fronts closed | 1220 mm | 1370 mm |
| A nominal 650-mm DW door open | 570 mm | 720 mm |
| Distance remaining behind assumed 600-mm loading-person reservation | **-30 mm overlap** | **+120 mm** |
| Island to original dining table (closed footprints) | 1070 mm | 1070 mm |
| East short-end prep person to nearest closed chair | 510 mm | 510 mm |
| Island to lounge armchair closed footprint | 1658 mm | 1508 mm |

Numbers rely on a image-calibrated concept model and rectangular **hypothetical** appliance/user proxies. They are not full route, mobility, or statutory-accessibility clearances. All assertions must be rechecked with exact selected appliances and site survey.

## Sign-off gates before any physical works

**Architect + developer / structural engineer**
- Confirm that the exact opening between kitchen and reception is permitted and non-structural as proposed, or redesign conservatively within the existing kitchen opening. **Do not remove or chase supporting members based on the WebGL scene**.
- Site-survey finished walls, door clear openings, columns, bulkheads and any protruding structural elements; check the new 1700 × 1000 island envelope.
- Confirm location of living glazing and sunlight routes with the actual apartment.

**Plumbing designer / contractor**
- Verify exact sink and dishwasher **waste route, gradient and connection**, including pipe size/venting/access cleanout; measure total required trap height and available build-up. Avoid unsupported in-slab cutting.
- Confirm how an additional 150 mm wet-service relocation affects floor buildup, future maintenance, waterproofed joints and unit isolation.
- Coordinate water supply, leaks/drip access, countertop sink/tap fixture, dishwasher nearby and dedicated sockets safely out of splash zones.

**Kitchen joinery + appliances**
- Get actual built-in dishwasher, oven, fridge, hob and hood drawings with fully open **hinged fronts, handles and person loading stance**. Goal is to test whether DW-loading can be performed without trapping a person against tall cabinetry.
- Full 6-place unload test: glassware, plates, pots and cutlery stored where used, including kitchen-vs-reception side access; see [storage inventory issue #15](https://github.com/Mostafatalaat770/flat-designer/issues/15).
- Verify 280-mm plates fit chosen interior hardware, not merely the estimated 359-mm rear depth. Confirm 600-mm integrated DW bay and the west drawer/cutlery/bin allocations.
- Full-size furniture overlays for lounge chair and all six dining chairs **when pulled out**. The end-prep gap does not improve simply by moving the island 150 mm.

**HVAC / electrical + life-cycle**
- Confirm ducted hood to allowed exterior service route; kitchen extraction remains separate from split/ducted comfort AC.
- Coordinate all cooking, fridge, oven, DW and counter outlet loads and isolation, service access, task lighting and safe future appliance replacement.
- Preserve 2500-mm clear ceiling target unless actual mechanical engineering shows feasible and approved localized pockets; this experiment does not justify new soffits.

## Decision process

1. Geometry CI: [A7 workflow](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37756770152), K12 vs +150/+200 images must match their exact design snapshot.
2. Human-use inspection: 600-mm person at open DW, 2-cook sink/hob, entry-to-dining while six seats used, lounge seating while kitchen active, with actual appliance drawings.
3. Compare owner utility value against cost and MEP complexity of moving the wet island.
4. **Only after qualified survey and approvals**, select a fabrication-ready design; any inability to route waste and service access makes this candidate **REJECTED despite favorable model measurements**.

The canonical apartment / saved Studio / production master branch are unchanged. This checklist is an engineering request, not a legal compliance certificate or authorization to start construction.
