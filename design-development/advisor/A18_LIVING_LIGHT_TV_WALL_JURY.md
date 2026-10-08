# A18 — Family living lighting + removable TV backdrop jury

**Source:** immutable Type B v0.2.2, canonical SHA `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`, K12 render-only concept still carries **two unresolved architectural hard FAILs**. Uses approved-for-study A16 Calm Contemporary finishes and A17 verified sofa-centred camera angles. This document is *not* construction, electrical, wall-mounting, lighting photometry or equipment procurement approval.

## What changed and why

| Trial | Lighting preview | TV wall | Hypothesis |
|---|---|---|---|
| A18-0 current Calm | Renderer `track-lamps`, nominal 3000K, brightness 80 | Existing wall as-is | A sober baseline: will the new scene actually look better? |
| A18-1 warmer & softer | Renderer `lamps`, 2700K, brightness 70 | Existing wall as-is | Family evening softness, less hard overhead emphasis; note **NOT REAL measured night mode** |
| A18-2 warm + TV wall | Exactly same A18-1 lighting | Single **removable 1540mm W × 22mm depth × 1450mm H** pale-oak reference panel hosted to original unchanged `WALL-RECP-01-09` | A richer but subtle visual anchor behind the TV without rebuilding architecture |

### Important reality checks

- **Source link:** the panel's real host wall was matched by its original wall-segment geometry. Panel and TV nominal plan silhouettes do not overlap. In the tested preliminary scene, panel-to-TV plan edge gap is ~**94.2mm**, but **panel-to-TV console nominal plan gap only ~7.9mm**. This is NOT an acceptable site tolerance/specification: dimensional corrections, panel lifting above console, mounting/bracket, TV ventilation and real furniture model are mandatory before selecting hardware. Do **not** order a panel from these draft dimensions.
- Lighting names/2700K/brightness only control our rendering model, not artificial night exposure, actual lux, beam glare, CRI, dimmer circuits, wiring, LED-strip safety or a reflected ceiling plan. **Do not call this an actual evening lighting simulation.**
- Never cut a recess or add built-in gypsum without checked structural/wall MEP and licensed electrician. Existing finished ceiling **2500mm locked**.
- No change to living seating, 2000×950 six-seat dining, K12 wet island, utility modules, structural wall/door/window, roof/ceiling or cloud Studio.
- Generic woods/fabrics and procedural oak floor remain color/ambience references, **not physically verified Egyptian products**, wet cleanability or photoreal material guarantees.

## Visual acceptance rubric

1. All four original family seating subjects (sofa/coffee/TV/armchair) remain visible and the giant floor lamp doesn't block the eye.
2. Across variants, use *the same two exact A17 cameras*. Decide whether warm light actually improves cozy family feel, or merely darkens/stiffens the scene.
3. Panel must read as calm and intentional, **not an extra bulky wall**. If it covers TV/stand, call out visual and physical failure.
4. Per actual finished room, confirm field measurements and **real source fixture/product** before declaring spatial/lighting success.
5. Remember A15 room-by-room first-fix intent includes manual-switch fallback, bedside/task circuits, wet/outdoor zone protection and no made-up amperage/AC capacity.

## Next creative tasks if this helps visually

- Layer light function rather than install more gadgets: TV-zone indirect wall-wash or separately dimmable reading lamp and gentle dining scene, modeled only after photos prove value and professional electrical RCP.
- TV wall: compare **plain mineral paint** vs soft oak/backing without blocking full-height glazing, console service, ventilation or cable routing. Preserve easy maintenance and furniture calm.
- Better floor realism requires manufacturer texture reference and physically scaled sample, not simply changing a shade hex or trusting the renderer's procedural parquet.
- Continue room-to-room coherence only after establishing a useful living material/lighting direction that owner can inspect in direct inline images.

**Code/CI:** [Draft PR #36](https://github.com/Mostafatalaat770/flat-designer/pull/36) • [GitHub Actions run 37787970933](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37787970933) • exact report `review-evidence/advisor-a18/lighting-tv-panel-audit.json`. No `master` merge or saved Studio changes.
