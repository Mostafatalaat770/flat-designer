# Sprint 2 entry and dining review (2026-10-10)

Status: exploratory source-model audit only. No site, structural, procurement or construction approval.

Source is PR #62 Option A/P0 (scene-9e86635b), separate from cloud v55. Type B v0.2.2 geometry and 2.50m ceiling are unchanged.

## Verified results

The six dining chairs were pulled out 450mm in the study. The tested 600x600mm person using the entry shoe cabinet has only a 15mm model gap to the nearest chair.

Shifting the entire dining set north does not establish a safe walking passage:

| Shift north | Shoe user to chair | Open buffet to chair |
|---:|---:|---:|
| 0mm | 15mm | 685mm |
| 100mm | 115mm | 585mm |
| 150mm | 165mm | 535mm |
| 200mm | 215mm | 485mm |
| 250mm | 265mm | 435mm |
| 300mm | 315mm | 385mm |

These are polygon distances, not measured clear walking widths. The 300mm shift still leaves only 315mm beside the operating shoe user.

All 12 trials that also moved the buffet north 100 or 200mm triggered a model object-overlap hard failure. The six fixed-buffet trials had zero domain hard failures, but none establishes adequate occupied shoe-user bypass.

A limited 28-position east-wall shoe-cabinet scan produced zero candidates meeting BOTH sampled door-sweep clearance and 500mm user-to-chair clearance. This does not rule out different hardware, dimensions, or professionally checked placement.

The existing 700x240mm shoe cabinet may still be useful, but its estimated clear storage box is 93L versus 145.2L previously. A real six-pair inventory and manufacturer mechanism are required.

## Review decision

KEEP Option A Calm Contemporary as the visual direction. KEEP the original 2000x950mm six-seat table provisionally. Do not move the dining set or buffet merely to improve a single clearance dimension.

REVISE the entry-storage solution with real shoe sizes, hinges, clearances, anchorage and full-size six-guest occupancy testing. Consider split everyday versus seasonal shoe storage only if existing wardrobes have verified capacity.

HOLD kitchen product and user conflicts: DW unloading person leaves 372.3mm to the assumed wall, plus fridge, oven, washer and service door conflicts. P1/F1 remains a conditional engineered portal, not an approved cut.

Next: supplier-constrained shoe joinery and kitchen operating mockups, then A1/A2 source-faithful entry/dining/lighting refinements and same-camera WebGL before accepting a final interior.

The reproducible audit source is scripts/sprint2-entry-feasibility.mjs. CI evidence: https://github.com/Mostafatalaat770/flat-designer/actions/runs/38051705232 .
