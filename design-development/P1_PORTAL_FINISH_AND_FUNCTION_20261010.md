# P1 follow-up: functional specification and finish direction (10 Oct 2026)

**Approved direction for additional DESIGN development only:** prefer **P1 semi-open dry kitchen + F1 simple reveal**, subject to developer/qualified structural engineer. **DO NOT** change canonical Type B, `render-snapshots/current.json`, cloud saved scene v55, physical partition or wet services. F2 glazed closures stay a conditional optional finish, not approved hardware.

## Kitchen opening detail and exact geometric limitations

The original opening `OP-RECP-KIT` is **720.2mm nominal**. P1 visually deletes only canonical wall segment #44, **487.2mm**, so the nominal unframed opening is **1207.4mm**. That's not a real finished clear width. Concept **20mm on each side** of the frame would leave **1167.4mm** *only in the ideal model and before site tolerance and any additional profile*. The true head/beam and finished opening height are **unknown**; preserving the overall **2500mm clear ceiling** does not grant a full-height door.

The remaining adjacent wall on the lower kitchen side is **783.8mm** long. A *full-width single hidden pocket panel* would need about **1207.4mm** parking length before hardware and cannot be assumed to fit in that return (nominal shortfall **423.7mm**). Do not draw an imaginary hidden pocket. A folding/stacked glazed screen or approved wall-mounted track needs specialist hardware drawings; it is not currently modeled.

## Selected design direction: P1/F1

- **Frame:** simple warm ivory painted/plaster return, gently eased corners, no bulky oak bulkhead at 2.50m clear ceiling. 20mm concept finish allowance on each side only; subject to proper plaster/edge profiling and approved structure.
- **Floor joint:** existing reception wood-look floor to kitchen porcelain/tile remains *unchanged in source*; suggest a flush clean low-profile colour-coordinated transition at the structural wall plane, *not* a raised trip strip. Confirm construction joints/substrate movement and wet-slip use with tile installer.
- **Cooking/odor management:** keep gas cooktop and hood on the kitchen wall; no speculative concealed duct runs or lowered ceiling until ventilation engineer confirms extract route, safe gas and makeup air. The space will transmit smells and sound more than closed P0.
- **Lighting:** 3000K low-glare task lighting at worktop and under upper cabinets with separately controlled reception lamps; no unverified lighting cavities in head/beam.
- **Working kitchen:** keep sink, K3 600mm integrated dishwasher, 600mm indoor laundry niche, 650mm fridge model envelope and the six dining chairs. Separate everyday dish storage and drawer access audit needed, especially washer taking a full 600mm base niche.
- **Future privacy (F2, only conditional):** folding/stacking glazed safety screen to reduce odor transmission when required, only after verified parking zone, clear door passage, specialist head load, product system and cleaning access. Do not order yet.

## Practical approval sequence

1. Ask developer/qualified local architect/structural engineer to identify exact east return segment #44 and check structural load, beams/lintel, fire/gas/water/electrical paths, and permission. If not permitted, keep P0.
2. Measure actual kitchen-facing wall, full head and finished door, dining edge, and verify furniture + door-open standing zones with an on-site 1:1 template.
3. Select exact dishwasher/fridge/hob/hood manuals and test in a family-used kitchen: washer running, one person cooking, another unloading dishwasher, guest going to six-seat dining while chairs are pulled out.
4. Assess ventilation, smells and acoustics. Only if needed, seek a vendor drawing of suitable fold/stack glass, actual stacked opening and fixing details; reconsider if passage becomes narrow.
5. Freeze real measured materials, lighting circuits, appliance clearances, cabinet inventory, plumbing and electrical first-fix before procurement and final elevations.

**Trust boundary:** P1/F1 is visually preferred and does not move water services; an ordinary source-faithful 3D render or green CI is not legal or physical buildability signoff. Machine check: `node scripts/portal-detail-qa.mjs`, CI artifact `review-evidence/semi-open-portal/portal-detail.svg` and JSON.
