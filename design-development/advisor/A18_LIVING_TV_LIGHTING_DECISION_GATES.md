# A18 — Family-first living/TV wall and controllable-light design jury

**October 8, 2026 · source-anchored exploratory study · NOT CONSTRUCTION-READY**

## Source truth
- Frozen apartment Type B v0.2.2 canonical SHA `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`.
- K12 snapshot `scene-e2fcb932`, design-only architecture with original **two unapproved hard FAILs**.
- The verified A16 `a16-pale-stone` / Calm Contemporary palette is the initial styling base, not an actual material selection.
- No change to partitions, doors, windows, structural openings, room polygons, 2000×950 six-chair dining table, kitchen island/sink, furniture dimensions/placement, or locked **2500mm finished clear ceiling**.

## Why the TV wall matters
A17 validated that the sofa, coffee table and chair can be photographed from honest living-focused cameras. The actual TV-wall detail still had partial visual occlusion in the corrected seating views. A18 introduces a TV-specific second camera to see the screen wall, while retaining an actual family seating camera. **Camera centre projection is a fast preflight, never an assurance of real pixels visible: inspect the resulting WebGL images.**

The nearest true source wall to `starter-31` TV is `WALL-RECP-01-09`, modeled from [12497.882, 550.754] to [12497.882, 2732.588]mm, segment 2181.8mm long. Source television centre is [12243.688, 1779.359]mm; projected offset along wall +137.7mm. This is source geometry, not an on-site measured substrate or a guarantee of TV mounting capacity.

## Three alternatives — what would genuinely change

| Candidate | TV backing | Rendered concept | Owner/maintenance benefit | Open real-world questions |
|---|---|---|---|---|
| A18 base | Original Calm Contemporary wall | Track + practical local lamps, 3000K renderer intent | Zero added millwork, low cost and dusting burden, easiest to revise later | TV backlighting glare and screen reflection, exact switching/LED drivers |
| A18 soft mineral | Plain warm mineral-texture backdrop, **1520×1550×30mm** proposed sample | Local lamps and quieter general scene | Very restrained, cozy with less visual texture; paint/sample board may suffice rather than a built panel | Decide whether physical 30mm buildout is justified; room acoustics, fixings, cleanability, actual supplier |
| A18 localized oak slats | Same nominal 1520mm wide panel, `fluted` pale oak | Track + lamps, separate concepts | Can add crafted warmth and visually anchor TV while maintaining off-white living | Recess depth, dust in grooves, wood maintenance and quality, TV ventilation/clearance, budget |

### Notes about technical scope
- **Plain and fluted panels are only reversible `InteriorDesign/1` wall-mounted geometry proposals.** Elevation 650mm, height 1550mm, modeled top 2200mm, remaining 300mm to the locked 2500mm ceiling. There are no new recessed bulkheads or false lower ceilings. Real panel construction, anchors into developer-supplied wall, TV mounting load, ventilation and user eye height are **TBD**.
- Light labels `lamps` and `track-lamps`, 3000K and conceptual brightness are **software visualization parameters**, not lumen output, glare rating, actual fixture/circuit/switching, a nighttime photometric analysis or energy cost. Original [A15 first-fix needs](https://github.com/Mostafatalaat770/flat-designer/pull/31) remain the handoff for real electrician/RCP.
- The A16 oak floor shader displayed unrealistic texture: avoid extrapolating real wood grain from this rendering. A18 holds the floor constant between all three choices to isolate wall-and-light effects.
- In human-use assessment, **doing nothing to the TV wall is a serious comparator**: evaluate whether added panels truly improve comfort enough to justify cost, dust traps and installation. Owner/family-first, not a showroom for guests.

## Release gates before actual finish
1. **Visual evidence:** matched-camera true WebGL output, pixel-level critique for TV/backing visibility and at least one genuine family seating image. An A18 source-camera PASS is insufficient by itself.
2. **Physical specification:** actual painted or wood finish samples at daylight and artificial light, carpenter sectional details, dusting/repair access, clear height and distance to glass/curtain tracks.
3. **TV / AV:** exact purchased TV dimensions and stand / bracket, cable concealment without unapproved chasing, heat dissipation and service access; avoid behind-panel inaccessible sockets.
4. **Electrical/lighting:** actual outlet/driver and dimming circuits / IP standards, flicker/glare and manual fallback according to qualified Egypt electrician, no guessed power rating.
5. **Architect/developer:** resolve historical two K12 wall/open-kitchen conceptual conflicts before contiguous floor or demolition or any kitchen fitout.

**Status:** A18 alternatives pending visual verdict; independent [Draft PR #37](https://github.com/Mostafatalaat770/flat-designer/pull/37), [render Action](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37787979398). The original `master` and saved live Studio remain unchanged. No quote, contract, purchase or construction release.
