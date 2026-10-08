# Advisor A2 — Dining comparative verdict (8 October 2026)

**Review outcome:** KEEP the original K12 six-seat **2000 × 950 mm dining arrangement as the working control**; reject both proposed dining moves **for now**. This is a **furniture design verdict only**, not approval of kitchen wall demolition, drainage, cabinetry or a final construction package.

## Evidence reviewed

- Exact K12 source `scene-e2fcb932`, canonical Type B v0.2.2 SHA-256 `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`
- A2 geometry and strict no-new-hard-failure pipeline: [A2 workflow](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37751711750) — successful.
- Original eight images: validated but **REJECTED AS DINING VISUAL EVIDENCE** because the existing K12 views largely face away from the table. Their byte-level exactness does not answer the user question.
- Reviewer-fixed 42° / 1.70 m eye-height cameras **showing the dining table AND island in frame**, identical across control/compact/shifted: [dining-camera workflow](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37753131394) — successful; image/metadata artifact **11539780330**, 6 distinct PNGs. The camera preflight checks both island and table within horizontal field-of-view.

## Numeric comparisons — from generated `measurements.json`

| Geometry | K12 control | A2.1 compact six | A2.2 original size shifted |
|---|---:|---:|---:|
| Table (mm) | 2000 × 950 | 1800 × 900 | 2000 × 950 |
| Six-seat north-row pitch (mm) | 700 | 600 | 700 |
| Table moved south (mm) | 0 | 350 | 350 |
| Island end → table edge, closed furniture (mm) | 1070 | 1170 | 1070 |
| 600 mm end-prep operator → table, horizontal (mm) | **465** | **565** | **465** |
| Operator → nearest closed chair (mm) | 510 | 611 | 511 |
| Nearest south chair → entry-door y-plane-only (mm) | 1676 | 1326 | 1326 |
| Unresolved canonical hard failure count | 2 | 2 | 2 |

*Model-plan projection only: not an accessible clear width; a person, pushed-out chair, bag or open door can change it further. Door opening conventions are inferred. The shifted group brings chair mass 350 mm closer to entry even though some remaining space still exists.*

## Image inspection and architectural judgment

The corrected images finally reveal what the first eight missed: the table and six seats are prominent from the entrance and from the family-side perspective. Moving the whole dining group south pushes seats further toward the entry and does not visually establish a new comfortable route past a person at the island end. The compact table is visually serviceable, but its 600 mm pitch and lost 200 mm tabletop width purchase only 100 mm additional horizontal passage. That passage remains **too restricted to certify concurrent movement**. The moved original-size table improves no lateral gap at all. These are poor trades for daily family use.

The current 2400 mm dark dining sideboard reads as a visually heavy cabinet in the entry-side render. Reducing or lightening it is a **more promising separate visual experiment** than shrinking a functional six-seat dining table. Its true household storage role is not yet inventoried, so we will not delete it on aesthetics alone.

## Design decisions

- **KEEP:** K12 dining location/table size as a provisional six-seat working reference; do not promote K12's kitchen architecture to master.
- **REJECT A2.1:** no compelling 100 mm benefit vs narrower table + tighter chair spacing and reduced approach from entry.
- **REJECT A2.2:** brings furniture toward entry, no island-end horizontal clearance gain.
- **OPEN:** island short-end prep blocking passage, dishwasher-open 570 mm proxy aisle, actual six pulled-out dining chairs, real furniture dimensions and household inventory.
- **NEXT HIGH-VALUE TEST:** Preserve six-seat table; reconsider sideboard size/finish and obtain occupancy/path proof. Kitchen wet/dry alternative remains subject to engineering and storage feasibility, not styling.

**Do not merge this PR into approved construction geometry or activate in cloud Studio.** All findings are exploratory and reviewable against the saved K12 source and artifacts.
