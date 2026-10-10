# Reception + Entry + Dining + Kitchen Connection — Sprint 01
**Date:** 2026-10-10 · **Status:** DESIGN REVIEW / NOT CONSTRUCTION APPROVED

## Single source-of-truth contract
- **Canonical architecture:** Type B v0.2.2, SHA `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`; 2.50m finished clear ceiling, full-height reception terrace glazing, wall/opening IDs and room polygons locked.
- **Live owner-saved cloud:** `scene-4821689`, storage revision `55` (observed 2026-10-10; may advance separately).
- **GitHub current owner-review:** `render-snapshots/current.json`, `scene-9cf45a73`, derived from cloud v55; it includes a different bathroom-shower *display*, so **do not call these identical scenes**.
- **Sprint GitHub start:** master `e8fc6e64c4d815f138c359024a98338b9d82a93b`, after merged PR #60. That PR fixes the *optional task-lit bathroom mirror* as a **non-reflective proxy**, not a photoreal mirror. The seven listed head-SHA PR workflow runs were successful; neither CI nor preview is as-built certification.
- **Only working review source:** GitHub `render-snapshots/current.json`; independent cloud captures below are **visual evidence** of saved cloud v55, not permission to replace it.
- **Do not import:** archived K12 full-open wet island or historic K4/J1 geometry into the working source. K12 had two hard model failures; K4's earlier full-open kitchen/1500×750 bathtub directions are superseded by the 2026-10-10 decision registry. Branch count is not decision authority.
- **Approval flags remain false:** structural/developer, MEP, physical clearances, wet construction, procurement and final owner aesthetics. No mutation to cloud scene or production master snapshot in this sprint setup.

## Four freshly captured, source-identical cloud WebGL views
All were rendered 2026-10-10 from saved cloud v55, original geometry, 1280×720, human-eye ~1.68m; `matches_current_scene=true` at capture. They are *conceptual Three.js images*, not AI photos, physical finishes or calibrated lighting. The originals are retrievable as Studio saved views.

| Preset | Saved view ID | PNG SHA-256 prefix | What the actual image supports |
| --- | --- | --- | --- |
| Entry overview | `capture-39b011c7e255f44f0756be96-0` | `fdaa4cf5d766` | The dining table dominates the approach, with the open dark-brown kitchen door a pronounced vertical element. Need a clearer arrival hierarchy without moving the entry. |
| Living → dining | `capture-04518e6fa3d6efe8742b2451-0` | `9c8a11635c46` | Six-seat dining reads clearly, darker sideboard becomes a strong focal mass; the foreground living chair/lamp and wall partly limit judgment of the whole room. |
| Dining → living | `capture-3efe4e9b167a2f5c26f5edbf-0` | `5898094dbd74` | Connection between living, terrace glazing and dining is perceptible; original closed kitchen door is still dominant and must not be mistaken for P1. |
| Wide corner | `capture-c2a123c33d593762c22608a6-0` | `6e99c7dc8feb` | A pleasant restrained palette exists, but entry/dining identity, sideboard visual weight, and six occupied chair operating space still need work. |

**Visual jury (provisional):** KEEP the underlying v55 reception zoning and 2880mm sofa; DEVELOP the welcoming arrival sequence, daylight/TV/glare checks, sideboard massing/finish, softly layered lighting and coherent floor/wood/stone family. HOLD physical circulation verdict until scaled chair/door operating-state verification. These four cameras do **not** prove six diners' clearances or prove P1 fits.

## Exact baseline dimensions and limits (model only)
- **Dining:** 2000×950mm table + six nominal 510×530mm chair objects. Preserve all six in both alternatives; model occupancy footprints are not human anthropometric signoff.
- **Entry:** `OP-ENT-01` 804.948mm nominal opening. Actual finished clear access, leaf sweep, shoe cabinet access and guests arriving with bags are **TBD site**. Shoe storage model 900×280mm.
- **Current kitchen doorway:** `OP-RECP-KIT` 720.217mm nominal; source model has a hinged door. **P1 conditional review only** expands to 1207.4mm nominal by render-only omission of source wall #44 (487.2mm) while preserving kitchen services and furniture; actual finished width/head/load **unknown**. P1/F1 is preferred for design development but **NOT** demolition approval.
- **Service and furniture:** Existing sink/DW/fridge/hob/indoor washer positions remain intact. Preserve terrace full-height glazing and the 2.50m clear ceiling. Do not infer island, hidden pocket glass, HVAC soffits or rewired gas/extraction.
- **Existing decorative objects:** dining sideboard, pendant, entry mirror, living chair, floor lamp and plant; these can be reviewed as reversible finish/decoration candidates.

## One coordinated direction — Calm Contemporary, not an unrelated-room collection
**Base palette to TEST:** soft ivory/greige matte walls, warm limestone-look porcelain **versus the source's currently displayed wood-look public floor**, a restrained natural oak accent, warm neutral upholstery, muted olive as a small accent, thin brushed nickel/bronze hardware, tactile linen curtains and carefully restrained artwork. Physical finish samples, grout, slip/cleaning/acoustics and Egyptian inventory are not selected. **Do not silently replace the current floor in the source.** Bedrooms can remain warm wood-look with designed transitions.

**Lighting to TEST:** low-glare, dimmable ~3000K *design intention* with task/ambient/accent layers; dining pendant only if it genuinely helps scale and six-chair use, otherwise aimed tracks; TV glare from terrace windows and sofa angles measured separately. No claimed lux, fixture wattage, electric zoning or cavity that the present 130mm void cannot support.

**Entry:** visually calm arrival with functional shoe/drop zone, existing mirror placement and a lighter tactile element; test a slim visual divider **only if** it does not block the actual main-door leaf, six-seat dining route, wheelchair/stroller/service access, terrace sightline or cleaning. No fixed joinery before survey.

**Living:** sofa + TV unchanged in the first comparison; evaluate the sightline from *seated* eyes, armchair use, side tables and lighting with curtains in sun and at night. Avoid a decorative wall that becomes another bulky visual mass.

**Dining:** soften the dark buffet/sideboard while keeping useful closed storage; test pendant-on/off with same furniture; preserve the 2000×950 table and six chairs, not a fake 4-seat prettified render.

**Kitchen relationship:** compare **P0 (refined closed, safe fallback)** against **P1/F1 (preferred semi-open visual concept, engineer HOLD)** using the *same* real entrance, dining, kitchen and living cameras, unchanged fixtures. No K12 wet island, no unsupported new wall cut or hardware.

## Sprint experiments — at most two useful, evidence-based candidates
| Axis | A: Calm, light arrival (preferred to TEST) | B: Rich, grounded arrival (controlled alternative) |
| --- | --- | --- |
| Geometry | Same canonical Type B, current v55 furniture | Identical geometry/furniture/camera |
| Entry | Light low-profile closed storage + existing mirror concept; optional *non-blocking* visual rhythm | Original storage + simpler one-piece art/feature texture; no screen unless clearance proven |
| Buffet | Lighter oak/stone-softened facade, dark accents reduced | Existing darker tone, visually broken by art and warm side light |
| Lighting | Track/task + living lamps, dining pendant OFF first | Same main layers, one quiet dining pendant if no glare/head clash |
| Kitchen connection | P1/F1 render-only engineer HOLD, shown *alongside* P0 control | P0 improved closed with door treatment only; no structural cut |
| Approval | Preference requires human-eye QA + practical mockup | Same; both remain conceptual |

## Functional QA — do before choosing the prettier render
1. Main door at full actual leaf sweep; one adult with bags, another approaching dining, 900×280 shoe unit open. Measured finished aperture and thresholds, not just nominal linework.
2. Table with **all six adults seated and chairs pulled out**, server carrying trays from P0/P1 kitchen, unobstructed escape/path to terrace and WC.
3. Kitchen with real DW door fully down, a person unloading, fridge/oven/cabinet doors operating, cooker in use, someone using the portal; quantify storage cubic/drawer access (washer still taking 600mm).
4. From each actual sofa seat, check TV position + daylight glare through both reception glazing openings at daytime and evening.
5. No floor/wall finishes purchased until full-size sample board under daylight and 3000K lighting; test stain, slip, acoustics and washable surfaces.
6. For P1: qualified developer/structural engineer checks wall #44, beam/head/lintel and concealed services; coordinated ventilation/gas/MEP review. If not cleared, prefer P0. Preserve 2.50m net height.

## Output/verification contract
- **Gate 0 — source:** assert canonical SHA, current GitHub review scene and original furniture count; historical studies cannot change source by file copy. Show both saved cloud & GitHub render scene IDs in every capture/report.
- **Gate 1 — layout:** dimensioned plan with door leaves, chair pull-out, actual walked path and storage inventory; PASS/WARNING/FAIL and explicit site HOLD. No engineering clearance claim from the viewer.
- **Gate 2 — controlled comparison:** one camera manifest shared by A and B, exact same objects/geometry; 4–6 authenticated WebGL PNGs **each** + image checksums/contact sheet (only when production-ready verified workflow), and failures for missing/swapped view or scene. Test day/night without cheating light levels.
- **Gate 3 — interior:** practical family review of arrival, social use, cleaning, warmth and visual calm; choose KEEP / REVISE / REJECT, no more than two options.
- **Gate 4 — design development:** coordinated finish schedules, furniture heights, door/hardware operating diagrams, lighting/HVAC strategy (not signed plans), as-built RFIs.
- **Gate 5 — construction release:** qualified site survey and approvals + vendor data + professional drawings/BOQ. Not achieved by this sprint.

## Next actual tasks in order
- [x] Read latest master, confirm PR #60 merged and successful PR-head workflow status.
- [x] Confirm current canonical cloud v55 vs distinct GitHub review snapshot; capture and **inspect** four saved true WebGL angles.
- [ ] Produce full dimensioned RECP-01 top view, entry/kitchen doors and six dining chairs in occupied/pulled-out states. Register real clearance warnings and necessary site measurements.
- [ ] Produce P0 vs P1/F1 same-camera portal comparison with no new geometry; include a kitchen-view showing cabinet/door operation.
- [ ] Produce exactly two reception/entry material+lighting comparison variants on *current* source, not on K12.
- [ ] Review kitchen/dining traffic, storage and whole-home finish continuity as one decision; record decision-registry updates only after acceptance.
- [ ] Obtain site survey, structural/developer written checks, actual appliance/sanitary/lighting SKU drawings, Egypt samples before execution package.

**Release recommendation:** develop this public-zone sprint first; bathrooms remain documented engineering HOLDs instead of consuming all design bandwidth. No changes to canonical JSON, saved Studio design or site production layout from this written audit.

References: [CURRENT_BASELINE](./CURRENT_BASELINE.md), [OWNER_REVIEW](./OWNER_REVIEW_20261010.md), [decision registry](./decision-registry.json), [P1 geometry review](./SEMI_OPEN_PORTAL_REVIEW.md), [P1 finishing gates](./P1_PORTAL_FINISH_AND_FUNCTION_20261010.md).
