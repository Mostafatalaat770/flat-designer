# Advisor A3 — Bedroom 1 functional/visual verdict (8 October 2026)

**Preferred design direction:** Retain a **1200 × 600 mm desk** and remove the **optional 1000 × 350 mm secondary drawer chest** in Bedroom 1, **conditional** on reallocating essential drawers/linen to the existing 1800 mm wardrobe and completing an actual household storage inventory. Do **not** reduce the desk simply to make a crowded layout pass a validator.

**Not for fabrication / not cloud activated.** All structural geometry and K12 render-only opening assumptions remain unchanged.

## Proof

- Frozen parent: K12 `scene-e2fcb932`, canonical hash `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`.
- Functional test: [A3 geometry workflow](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37753498344) and subsequent [extended furniture test](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37753803282) succeeded. Candidate overlap FAILs were identified and explicitly rejected rather than suppressed.
- Visual evidence: [A3 matched-view render workflow](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37753803277) SUCCESS, artifact **11538933089**, exact scene and identical 42° Natural standing cameras / 1.70 m height, two angles per option, eight PNGs total.
- Immutable source comparison: `design-development/advisor/a3/functional-review.json` is generated from the explicit script. The existing two K12 canonical architecture FAILs are preserved. None of the retained furniture options adds one.

## Compared directions

| Option | Desk | Secondary drawers | Modeled desk vs inferred door-sweep measurement | Use/visual judgment |
|---|---|---|---|---|
| K12 control | 1200 × 600 | 1000 × 350 | 98.1 mm WARNING | Crowded work corner; chest sits immediately beside desk |
| Desk reduced | 1000 × 600 | unchanged | 346.4 mm WARNING | Helps clearance but sacrifices useful tabletop; still has bulky chest |
| **Preferred** | **1200 × 600** | **removed** | No desk-specific swing warning emitted | Cleaner and more adaptable room, full desk preserved; storage allocation required |
| Compromise | 1200 × 600 | shrunk to 850 × 350 | 296.6 mm WARNING | Retains some drawers and desk, but adds visual mass, a narrow inter-unit joint and potential cleaning nuisance |

These distances come from an inferred door-hinge model and conservative conceptual furniture footprints, **not a certified route or physical survey**. An absent warning is **not an exact measured clearance claim**. Actual door swing, bed-making, desk chair pullout, room access and any future occupants must be manually tested.

The attempted straightforward 1200/1100 mm westward desk shifts **failed**: they physically overlapped the secondary drawer chest by **125/75 mm**. They were rejected despite improving the door-warning metric. Moving desk/chair north preserves width but only weakly improves this particular door issue and leaves a narrow 65 mm bed/chair footprint interface in the model.

## Why the preferred choice makes sense

The 1800 mm wardrobe is the principal storage element. A second 1000 mm chest is **optional** until an inventory proves it necessary. The room must support daily desk work, a real task chair and future child/guest modes without squeezing every spare wall. The no-chest design improves the *feel* of the workspace in both calibrated renders, while retaining a full-width desk. If storage inventory later demands a chest, the smaller 850 mm version can be reconsidered rather than forcing it in now.

## Still unresolved

- Assign underwear, everyday clothing, toys, bedding and linen to actual 1800 mm wardrobe internals and shelves, not estimated gross volumes.
- Specify actual desk, task chair, monitor and bed products; check chair pullout and movement from the door with an occupant.
- Measure finished wall widths and real door hinge/swing after plaster.
- Fix ergonomic lighting, sockets, curtain tracks and cable management.
- Review the visually dominant full-height wardrobe fronts and finish, but do not shrink genuine storage blindly.

**KEEP A3 no-extra-chest as the conditional functional direction; REJECT unsafe shifts; DEFER procurement until inventory and site dimensions.**
