# A6 — controlled oven/fridge tall-bay swap: REJECT (8 Oct 2026)

**Decision: REJECT the swap as a family-workflow improvement. KEEP original K12 tall-wall ordering as the provisional control.** This is a comparative furniture choice, not endorsement of K12 construction geometry.

## Verified evidence

- Geometry + concurrent person/appliance workflow CI: [GitHub Actions run 37756267990](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37756267990) succeeded.
- Six real headless WebGL screenshots (three unchanged K12 cameras × two alternatives) reviewed from artifact `11540232796` (K12 3 + swapped 3). Scene and camera metadata matched rendered layouts.
- All apartment geometry, sink island, six-seat dining, finishes, canopy/gas hob, pantry/coffee station and 2.50 m ceiling unchanged; **only refrigerator and oven bay positions exchanged**.
- Canonical original two hard FAILs are retained, not resolved/approved.

| Competing action proxies | K12 (current fridge west / oven center) | A6 (oven west / fridge center) |
|---|---:|---:|
| DW door to oven-open proxy | 32 mm | 632 mm |
| DW door to fridge-open proxy | 632 mm | 32 mm |
| Oven-open proxy to person at wall hob | 1069 mm | 469 mm |
| Fridge-access person with island waste pullout | positive-overlap 207,360 mm² | positive-overlap 15,360 mm² |
| Fridge-access person with sink user | nominal 32 mm gap | positive-overlap 329,440 mm² |
| DW open: remaining aisle to closed tall fronts | **570 mm** | **570 mm** |

**Interpretation:** Repositioning oven fixes one appliance-door near-contact at the price of introducing another at the more frequently accessed refrigerator; it also compresses the hot-oven / hob-person corridor. Nothing increases the DW loading aisle, so the underlying daily-use issue remains. The savings in overlap with waste cabinet do not outweigh the new sink/fridge proximity.

## Image review

The visual change is modest: tall-wall front colors and overall kitchen composition remain coherent, but the shift does not remove clutter, enlarge the active floor or substantiate an everyday family benefit. The images use generic appliance placeholders; real doors/ventilation and electrical loads are not established.

**Disposition:** Mark this experimental branch as a negative control. Do not merge its appliance swap into `master` or activate it in saved Studio. Focus subsequent concepts on [A7 modest island north shift](https://github.com/Mostafatalaat770/flat-designer/pull/14) as a separate, MEP-conditional geometry candidate. Demand actual installed sink/DW/oven/fridge manuals and real drain route before any fabrication.
