# A11 — Master bedroom real-render verdict (2026-10-08)

**Decision: CONDITIONAL KEEP remove only the optional 1000×350 mm bench.** Retain the 1000×400 mm drawer chest until the master dressing's clothes, linen and bed-storage inventory is verified. Do **not** promote the visually airiest version (remove both) automatically.

## Exact evidence
- [A11 GitHub Actions run 37763744152](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37763744152): **SUCCESS** after the original out-of-room camera was rejected and fixed. Seven? The actual output is **6 WebGL PNGs**: 3 variants × 2 fixed 42° cameras.
- Render artifact **11544400441** (`advisor-a11-master-sleep-first-images`).
- `ApartmentBatchRender/1` manifest status **ALL_FRAMES_VERIFIED**, **one Chromium**, 2 concurrent views, **457,799 ms / 7m38s total**, zero missing frames or unapproved fallback material. Actual scenes: baseline `scene-e2fcb932`, bench removed `scene-c1a87532`, bench and chest removed `scene-99100e0c`.
- Same camera `A11-master-from-entry` position (-4.52, 1.7, 1.08) and `A11-master-foot-zone` position (-7.37, 1.7, 3.2) across variants; same canonical v0.2.2 SHA `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`.
- Only furniture removed differs. Bed/nightstands, WIC cabinetry, original canonical rooms, kitchen and MEP remain unchanged.

## Geometry and what it really means

| Study | Foot-side nearest closed furniture or wall | Release of nominal furniture floor footprint |
|---|---:|---:|
| K12 baseline: bench + drawers | **665 mm** | 0 |
| Remove bench, retain drawers | **680 mm** | **0.35 m²** |
| Remove BOTH bench and drawer chest | **1190 mm** | **0.75 m²** |

Removing the bench alone **does not create a 350mm wider continuous walking corridor**: the nearby chest continues to be the controlling footprint; measured minimum improves only 15mm. However the matched snapshots show less small-object clutter beside the bed and remove one awkward foot-end piece. Removing both gives a far cleaner room and much larger conservative gap but sacrifices substantial drawers **with no demonstrated capacity replacement**. These distances are concept-model closed furniture edge proxies, not bed-making routes with real adults, opened drawers or as-built clear widths.

### Owner-first disposition
- **KEEP for further design:** bench-free / chest-kept as reversible simplest furnishing direction. The bench is not essential unless owner has a specific daily dressing purpose; buy nothing now.
- **RESERVE:** open-foot-wall (remove both) only if WIC interior drawer-by-drawer inventory proves all daily clothing, bedding and towels fit; even then check charging/light outlets, cleaning and dressing convenience.
- **KEEP as fallback:** the original bench if a real daily use (seat while dressing) emerges and circulation is rechecked.
- **NOT APPROVED:** changing AC/ceiling, shifting bathroom doors, deleting confirmed storage, procurement, canonical geometry or saved Studio.

Next cross-discipline work: actual wardrobe inventory/door system (A9), 2500-mm master clear ceiling, calm dimmable lighting, blackout curtain/light leakage, no AC draft over pillow, accessible night-path to ensuite, actual bed dimensions and settled bathroom wet-wall/splash layout.

**No writes to saved Studio. No merge to master.**
