# Spatial Decision Foundation · v1

**Stage:** TESTED EXPERIMENTAL LIBRARY. Source revision: canonical Type B v0.2.2 SHA `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`. The user’s saved Studio / master / approved architecture are **not modified**.

## What exists

| Code | Purpose | Verification |
|---|---|---|
| `studio/analysis/geometry.mjs` | Polygon and rotated furniture footprints, actual geometric gap, edge touching vs positive-area overlap, sampled 2D hinged-leaf sweeps | `foundation.test.mjs` |
| `studio/analysis/route.mjs` | Conservative sample of an assumed **circular body** moving through a room with a fixed occupied/door state | Unit tests + real WIC case |
| `studio/analysis/evidence.mjs` | Measurement origin, declared sensitivity intervals, threshold purpose, multi-objective nonweighted Pareto analysis + unknown signoff gates | Unit tests + K12/A7 comparison |
| `scripts/analyze-spatial-case.mjs` | Run repeatable, declarative JSON-driven room scenarios with object IDs | WIC real-scene CI |
| `scripts/foundation-reference-audit.mjs` | Cross-check real K12 0/150/200mm island options and dressing leaf openings | GitHub Actions CI |

## Agent workflow

1. Read the **original canonical spec** and its checksum; obtain the source snapshot and check its scene revision. Do **not** substitute historical K4, experimental K12 and saved cloud Studio.
2. Create a named JSON case from an exact room ID / furniture object IDs. Start from `design-development/advisor/cases/wic-access.json`. If an obstacle is an occupant rather than a physical model object, label it explicitly as a **hypothetical user envelope**, including assumptions.
3. Run:

```sh
npm ci
npm run build
node --test studio/analysis/foundation.test.mjs
node scripts/foundation-reference-audit.mjs
node scripts/analyze-spatial-case.mjs design-development/advisor/cases/wic-access.json
```

4. Report polygon distances **separately** from horizontal or vertical projected gaps, including chosen units and uncertainty source. Prove the desired object/room combination really appears in the case.
5. Show each **stage**: actor present/absent, door closed/open, chair pushed in/out, then report model-route existence and blockers. Route existence is only under the explicit conservative grid/circle assumptions.
6. Prefer **Pareto tradeoffs** over invented numeric quality scores. Unknown structural, wet-service, purchased-appliance or site dimensions must block a `CONSTRUCTION_READY` claim.
7. Rerun snapshot validation and render comparison (same cameras, checked manifest) on any candidate selected for further work.

## Real example confirmed in CI

[Foundation real-scene run 37767327913](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37767327913): both jobs successful.

- In canonical dressing WIC-01, baseline closed-wardrobe front gap: **1335mm** from calibrated original model.
- With two opposite 625mm hinged leaf projections fully deployed, abstract leaf-tip gap: **85mm**. Using 312.5mm hypothetical leaves, **710mm**. **Not** a selected manufacturer hinge mechanism.
- Same real WIC room supports an assumed circular agent with **200mm radius** on a 50mm grid when furniture is closed (`MODEL_ROUTE_FOUND`). A **hypothetical** extra 700×250mm centrally located occupied zone blocks that sampled start-to-goal route (`NO_MODEL_ROUTE`). This demonstrates **the engine distinguishes usage states**, not that the installed room is unusable.
- In K12 original island scenario, nominal DW-open remaining aisle is **570mm**; +150mm island move yields **720mm**. Both are nominal; assumed ±50mm calibrated geometry sensitivity plus ±50mm generic door-projection sensitivity gives **470–670mm** vs **620–820mm**, respectively. This is **what-if sensitivity**, **not validated physical tolerance or statistical confidence**.
- A precision fix discovered during integration: lateral projected cook-side gap remains **1219mm**, while direct nearest polygon distance in +200mm variant is **1219.2mm**. Two quantities must not share a field name.
- Existing **two architectural canonical failures** of K12’s unapproved open-plan overlay remain disclosed; never accept green spatial-engine CI as construction approval.

## What v1 deliberately cannot assert

- Full 3D collision, curved furniture, physically accurate running doors/wardrobe tracks or kitchen-appliance mechanisms.
- Real human postures/body-shapes, wheelchairs, two-body dynamics over time or carry-a-tray ergonomics.
- Installed appliance dimensions/door sweeps, site tolerances, hot surfaces, structural safety or local Egyptian building regulation compliance.
- Exact storage capacity until actual cabinet interiors, runners, hinges, height and inventory are provided.
- A numeric "best design" across budget, aesthetics and everyday comfort without owner tradeoff preferences and site MEP verification.

## Priority v2 additions

**P0**: define reusable occupancy case models for multiple family members and *room-to-room* movement with open/pulled furniture and actual selected products; include a subject-visible camera check before expensive renders.

**P1**: cabinet and drawer net-volume inventory + doors/drawers interlock validation; replace hypothetical actor footprint with a documented range and ergonomic staged movement.

**P1**: machine-readable version/decision registry tying each option to canonical, parent scene revision, image hashes and signoff evidence, with hard release gates.

**P2**: measured as-built dimensional data, signed structural & MEP review, local SKU/cost input and procurement package. Architectural site approval stays external to simulations.

**Governance:** this is an advisor design branch and draft PR. No cloud Studio update, no merge to master, no procurement or demolition authorization.
