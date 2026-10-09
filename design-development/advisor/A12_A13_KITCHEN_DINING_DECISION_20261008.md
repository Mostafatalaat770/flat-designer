# Kitchen + dining family-first Sprint — Decision Gate

**Date:** 8 October 2026. **Study lineage:** canonical Type B v0.2.2 SHA `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`; K12 source `scene-e2fcb932`; no alterations to immutable architectural source or saved cloud Studio.

**Study PRs:** [A12 #28](https://github.com/Mostafatalaat770/flat-designer/pull/28) kitchen / six-seat dining / two island positions; [A13 #29](https://github.com/Mostafatalaat770/flat-designer/pull/29) six-seat chair spacing alternatives. Both **DRAFT** until actual site/manufacturer/structural checks. The kitchen wall/open-plan overlay still has **TWO inherited canonical architectural FAILs** that must NOT be waived by successful family-use simulation.

## Independent spatial results

| Dimensional planning metric | K12 (island unchanged) | A7/A12 wet island +150mm north |
|---|---:|---:|
| Open dishwasher door remaining to opposite pantry closed face | 570mm | 720mm |
| Illustrative 600mm unloading body nominal space beyond open DW | -30mm | +120mm |
| Open dishwasher door to open oven proxy | 32mm | ~124.2mm |
| Island nearest gap to angled lounge armchair nominal envelope | 1658mm | 1508mm |
| Island-end 600mm-wide prep operator to nearest original six-seat chair | 510mm | 510mm |
| West cooking run projected horizontal aisle | 1219mm | 1219mm |

This is a Pareto tradeoff: **+150** helps kitchen-side appliance operation but consumes **150mm** of lounge-side buffer and does NOT itself solve dining-end pinch. Door projections 650/600mm and a square 600mm occupant are illustrations, not appliance SKU/person ergonomic/codes.

### Six-seat dining without changing table, walls or appliances

Both kitchen options keep the full **2000×950mm table** and all six **510×530mm** chairs, three on each long side. A13 proposes a *symmetrical* inward adjustment of the four endpoint seats, leaving both middle chairs unchanged:

| Seat-end inset toward centre | End-of-island operator → nearest chair | Adjacent chair centre spacing | Nominal edge-to-edge gap between chairs |
|---|---:|---:|---:|
| 0mm | 510mm | 700mm | 190mm |
| 60mm | 570mm | 640mm | 130mm |
| 75mm | 585mm | 625mm | 115mm |
| 100mm | 610mm | 600mm | 90mm |

**Simulated result:** With six pulled-out dining chairs (+350mm nominal) and a conservative 50mm grid plus circular traveller radius **180mm**, the canonical reception-only study finds a sampled route for all tested options. For radius **220mm**, the same study finds **NO_MODEL_ROUTE** in unaltered K12, including seat inward adjustments up to 100mm; **MODEL_ROUTE_FOUND** in the +150mm island option when end chairs are inset at least 60mm (0mm still NO_MODEL_ROUTE).

Interpretation: there is a *meaningful sensitivity* in the combination **+150mm wet island and ~60–75mm symmetric end-chair adjustment**. This is NOT a claim that walking is legally permitted or physically impossible in any version; the circular radius/grid and fixed chairs are thought experiments. No unapproved path is traced through the architectural kitchen divider. In particular, the table plus two-seat comfort, armrests and real guest size require in-person full six-chair testing before any definitive change.

## Advisor decision — choose experiments, not constructions

1. **CONDITIONAL PREFERRED FOLLOW-UP:** wet island +150mm north **only if licensed site survey, developer/structural clearance and qualified plumber confirm actual drain slope/pipe and safe utilities**. On the dining side, try *60–75mm symmetric* inward end-chair positioning with **real chosen 510mm chairs**; preserve the 2000×950 table and all six seats. If six adults feel compressed, retreat immediately to 0mm or select physically appropriate chairs rather than sacrificing comfort to improve a proxy route.
2. **FALLBACK IF WET-MOVE NOT FEASIBLE:** original K12 island location (subject independently to structural separator approval); dining-end remains a circulation pinch for a larger circular radius even with seat movement. Reassess island end prep use and/or furniture grouping, not fake a geometry victory.
3. **KEEP STUDYING:** Rear island daily plates are accessed from reception-facing doors while dishwasher loads kitchen-side. This means **reaching daily dinnerware requires going around the island** in everyday use; investigate a kitchen-facing drawer for frequently used plates, but verify net drawer height and whether displaced pots have somewhere to go. [Cabinet audit issue #15](https://github.com/Mostafatalaat770/flat-designer/issues/15).
4. **DEFER** pre-bought appliances, fixed air fryer parking, cabinet runner/hinge selections, gas extraction and electrical positions until exact product manuals, power schedule and MEP coordination.

## Release gates to request from site and manufacturers

- Measured *finished* kitchen and dining clear widths, door openings, developer/structural signoff for kitchen separator/opening, existing pipes/screed depth and hot/cold/soil layout.
- Actual DW, oven, fridge doors and control/handle/open maintenance envelopes plus electrical/gas/ventilation manuals.
- Real six-seat dining chair dimensions, occupied chair pull-back, six adults, serving tray movements, reachable cooking worktop and clearance behind chairs.
- Cabinet-by-cabinet kitchen household inventory of plates, pots, small appliances and pantry; simulate actual opening fronts and unloading.
- Original 2 architecture hard FAILs closed only after actual engineering authority. Do not mark construction ready based on QA pipeline alone.

## CI/renders
- A12 geometry [run 37772347587](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37772347587), geometry job **PASS** with source-level comparison and K12 original blockers retained; exact three-camera WebGL visual job originally in progress when review document prepared.
- A13 six-seat rebalancing [run 37772755934](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37772755934) **PASS** (4 inward settings × 2 island positions × 2 person proxy radii).
- A13 report artifact `advisor-a13-seat-options` and source-backed three camera snapshots in action run; A12 snapshots and report in `advisor-a12-kitchen-dining-geometry-and-scenes`.

No `master`, saved Studio, actual structural geometry, 2500mm ceiling or user production design modified.
