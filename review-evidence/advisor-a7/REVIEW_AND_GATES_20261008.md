# A7 — reviewed recommendation: RETAIN 150mm NORTH as conditional design development (8 Oct 2026)

**Status: KEEP 150-mm option as the next engineering feasibility candidate, NOT a construction-ready or cloud-activated design.** Preserve frozen K12 as fallback until drainage, structural/developer permission and manufacturer appliances prove it workable. No changes to canonical architecture or saved Studio.

## Evidence

- [A7 GitHub Actions workflow 37756770152](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37756770152) — functional geometry and true-model WebGL render jobs both **SUCCESS**.
- Rendered exactly nine PNGs (three original K12 camera presets × three comparable models: shift 0/150/200). Artifact **11541211151**, original ZIP `advisor-a7-island-renders.zip`.
- **Independent artifact reinspection:** all nine PNGs contain matching committed scene revision/canonical SHA; zero pending local assets or fallback textures. Scene revisions: control `scene-e2fcb932`, +150 `scene-60ec75b9`, +200 `scene-d48b0779`. Geometry differs only in position of `E2-island` and `E2-island-sink` (both north by one uniform offset); all joinery, source polygons, 2500mm ceiling, six-seat dining and 42° K10 detail camera preserved.
- Two existing canonical FAIL types due to the unapproved render-only K4 opening remain; no additional ones created. Passing CI is **not** opening/demolition approval.

## Comparative function + visual review

| Measurement (model-level) | Original K12 | 150mm north | 200mm north |
|---|---:|---:|---:|
| Island size | 1700×1000 | same | same |
| West cooking aisle | 1219mm | 1219mm | 1219mm |
| Tall-side service aisle, cabinets closed | 1220mm | 1370mm | 1420mm |
| Tall side with nominal 650mm DW open | **570mm** | **720mm** | **770mm** |
| Extra space behind assumed 600mm DW loading person | **-30mm overlap** | **+120mm** | **+170mm** |
| Island to dining-table closed edge | 1070mm | 1070mm | 1070mm |
| End-prep person to nearest dining chair | **510mm** | **510mm** | **510mm** |
| Island to living lounge chair closed footprint | 1658mm | 1508mm | 1458mm |

Same-angle images show +150mm has no obvious disproportionate intrusion into the reception and keeps the warm open-plan composition; +200mm pushes the island visibly further toward the lounge for only an additional 50mm improvement to service aisle. The benefit is functional at the DW; **no visual image proves comfort with occupants**.

## Advisor disposition

- **KEEP (+150mm)**: a better model-level balance of DW loading access vs family lounge clearance. Candidate only until engineering clearance.
- **DEFER (+100mm)**: gives open-DW 670mm, leaving a nominal 70mm behind the assumed 600mm body; not enough to prefer given 150mm alternative, subject to costs.
- **REJECT (+200mm as default)**: marginal extra 50mm DW passage for 50mm less family seating buffer. Only reconsider if exact DW manuals or site tolerance prove +150mm insufficient.
- **PRESERVE (0mm original K12)**: no wet-service relocation or extra cost; preferred fallback if moving the sink/waste is risky, unauthorized or expensive.
- **STILL OPEN**: person preparing at the east short end blocks dining-side passage to within 510mm of first closed chair, inherited under every shift. Also the DW + oven opening adjacency, fridge/bins, and unloading plates from reception-facing island storage remain unresolved.

## Standards must not be misunderstood

Published [NKBA dishwasher guideline 13](https://kb.nkba.org/uploads/2022/05/Kitchen-Planning-Guidelines.pdf) suggests 533mm standing space where countertop/cabinets are **at right angles** to a DW, and cites ICC A117.1-2009 accessible floor rectangle of **762 × 1219mm adjacent** to DW. Our **opposite-tall-front** clearance is a different condition. Neither original 570mm nor shifted 720mm is automatically a certified passing working condition; actual hinge/door/body models and local Egyptian regulations govern. The [new NKBA fifth edition](https://nkba.org/planning-guidelines/) is North American planning guidance, not Egyptian construction code.

## Next hard gates

1. Confirm removal/widening of kitchen separator by qualified engineer/developer; if impossible, no open-plan K12/A7 construction.
2. As-built survey of original waste riser, supply, screed and proposed +150mm service route, fall, access, waterproofing and underfloor restrictions; qualified plumber signs feasibility and cost.
3. Real selected DW/oven/fridge/hood/hob models with door-front drawings and ventilation/access clearances, then rerun body+open-door scenario scripts.
4. A lounge chair / six occupied dining seats movement check and kitchen-to-living bypass while DW open and second cook active.
5. Reconcile cabinet inventory, family routine and build-cost delta. A7 wins only if its extra daily access is valuable *and* extra MEP complexity justified.

**No merge into `master`, no production cloud Studio write, no authorization to demolish, cut slabs, chase plumbing or order bespoke joinery.** All visual proof and source manifests are linked above.
