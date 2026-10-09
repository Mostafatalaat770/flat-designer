# A17 actual image inspection — camera subject projection is necessary but insufficient

**Date:** 8 October 2026. **Review state:** CI source and PNG verification **PASS**, visual *unobstructed lounge review* **FAIL/REVISE**. This is an honest difference, not a failed render or a construction approval.

## Validated evidence
- [A17 GitHub Action 37783257507](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37783257507) **both jobs SUCCESS**. Download [WebGL source artifact 11552399908](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37783257507/artifacts/11552399908).
- Batch manifest: **6** genuine source-verified PNG frames, three palette variants × two identical lounge camera positions; **437,995ms / one browser**; camera/source checksum and image assets checks PASS.
- Preflight projected **four nominal centres** (sofa `starter-28`, coffee `starter-29`, TV `starter-31`, lounge armchair `starter-32`) within both proposed camera inner 15% frustums, under Type B canonical v0.2.2/ K12 scene `scene-e2fcb932`.
- **No physical furniture position, wall, doors, openings, ceiling or wet services changed**. Historical K12 **two hard architectural FAILs** remain.

## Independently inspected actual PNGs

**A17-lounge-sofa-tv** and **A17-lounge-second-eye** both reveal a prominent **large dark floor lamp shade directly in the foreground**. It blocks/coarsely occludes much of the coffee-table/sofa use zone, compromising furniture balance review even though all their projected *centres* technically lie within frame. The second camera shows the coffee table better but still has intrusive lamp and cropped/near-frame seating.

This uncovers a new systematic weakness: subject-frustum test of nominal centre ≠ actual visible percentage, absence of occlusion, useful relative visual scale or comfortable camera composition. **Image authenticity and frame checks pass; actual designer usefulness not fully accepted.** Camera review should mark these two views `STYLE_REFERENCE_ONLY`, not `LOUNGE_LAYOUT_APPROVED`.

### Material decisions
- **A — Calm Contemporary**: softer/paler material hierarchy and relaxed visual language, provisional preference for family-first harmony. Existing floor/wall/sofa contrasts are subtle in living-camera views; don't claim fully photoreal finish selection.
- **B — Warm Japandi**: legitimate alternative concept; artificially wavy, repeated procedural oak floor pattern persists. **Do not reject real wood products** based on that shader artifact.
- **Current baseline**: control reference for true differences; other room finishes, kitchen safety and household usability still independent pending decisions.
- **Lighting** shown is flat conceptual WebGL illumination, not electric fixture selection, natural daylight, reflected ceiling, true lux or actual nighttime scene.
- No real supplier samples, slip/acoustic/humidity certifications, professional HVAC/MEP approvals or pricing have been provided.

## Required A18 improvement (not yet implemented)

1. Add physical foreground obstruction QA, ideally rendered instance-ID/depth-buffer occupancy or deterministic camera ray-occlusion test. A lamp/object between eye and expected sofa/coffee-table focal surfaces must fail the photo's intended-use audit, even if all four centres project on screen.
2. Target specific **furniture visibility fractions**, not only `centre_in_frustum`. Do not overclaim mathematically cheap proxies as a visibility oracle; keep independent visual review.
3. Choose revised room-valid 1.65–1.75m eye views that avoid intrusive floor lamp, retain sofa + coffee + TV + armchair composition, and compare original/A/B same cameras.
4. Then consider realistic manufacturer-backed floor textures and physically appropriate lamp/curtain/fixture light, while preserving source geometry, 2.50m clear height and zero build authorization.

**Decision:** `A16_CONTEMPORARY = PROVISIONAL_VISUAL_LEAD`; `A16_JAPANDI = STAY_IN_COMPETITION`; `A17_VISUAL_APPROVAL = REVISE_CAMERA_OCCLUSION`. Nothing merged to production or written to saved Studio.
