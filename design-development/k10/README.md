# K10 island function refinement

K10 keeps the accepted K9 island centre (11750, 6600), 1700 × 900 mm footprint and rotation 0°. The sink shifts 450 mm west to (11800, 6750) and turns to face the south working aisle, with the tap at its north rear edge. All other furniture, materials, canonical geometry and the existing render-only architectural overlay remain unchanged.

| Concept dimension | K10 |
| --- | ---: |
| West landing from 550 mm outer sink reserve | 625 mm |
| East landing from outer sink reserve | 525 mm |
| Closed tall-unit front aisle | 1220 mm |
| Cooking-run edge gap | 1219 mm |
| Dining table edge gap | 1070 mm |
| Working side nominal depth | 600 mm |
| Reception storage nominal depth | 300 mm |

The exact 1700 mm gross allocation is **18 mm end panel + 600 mm clear dishwasher reservation + 600 mm sink cabinet + 464 mm drawer cabinet + 18 mm end panel**. The convenient 600 / 600 / 500 shorthand includes both end panels in the remaining 500 mm. A full 600 mm dishwasher bay is reserved rather than silently deducting cabinet panels from that appliance width. Clear height, end fillers, actual sink cutout, rear services, installation tolerances and internal useful storage remain dependent on selected products and joinery development.

The renderer now shows an integrated dishwasher front, two sink-cabinet doors and three drawer fronts on the working side, plus shallow closed doors on the reception side. These are dimensioned concept reservations. They are not a fabricated interior or a branded appliance replica. The 18 mm end panels and allocated modules fit the unchanged overall footprint; the pre-existing 5 mm counter lip and 860 mm rendered counter height are retained.

## Preparation compromise

Both sink landings meet the 610 / 457 mm widths in NKBA's published [Kitchen Planning Guidelines](https://media.nkba.org/uploads/2022/05/Kitchen-Planning-Guidelines.pdf), guideline 11. The west surface is clear across 625 × 900 mm; a 610 × 610 mm rectangle is available at the working edge. It does **not** supply the 914 × 610 mm continuous main preparation rectangle next to an uncovered sink described by guideline 12. With a 550 mm sink and a 457 mm shorter landing, that arrangement would require at least 1921 mm overall length. K10 retains the owner's accepted 1700 mm footprint and discloses the limitation. A fitted sink cover could temporarily enlarge prep space, but is not selected, modeled or counted as permanently available preparation space.

This PDF is a published planning reference, not an assertion of latest-edition or local-code compliance.

## Open appliances

Hypothetical 650 mm dishwasher, 600 mm oven, 600 mm fridge and 500 mm drawer opening envelopes were reviewed against closed furniture. They cause no positive-area collision when opened individually in the conceptual model. The dishwasher leaves 570 mm to opposing closed tall fronts. This is remaining local space behind a door, not a clear through-walkway.

With the conservative dishwasher and oven envelopes **both** open, they overlap by 168 × 30 mm. Exact appliance doors/hinges, standing bodies, hand reach and simultaneous use remain unverified; this is not a simultaneous-use certificate. The frontal rectangular fridge envelope is a reserve, not a swept hinge/door simulation.

## Validation and cameras

The canonical-domain report remains exactly equal to K9: **151 PASS / 50 WARNING / 1 FAIL**, with the retained E2-island room-placement exception across the original closed-kitchen room boundary. Only the unchanged render-only open-kitchen overlay makes this study geometrically relevant. No new canonical collision, circulation, doorway or warning result is introduced.

The original three J1 comparison cameras are preserved exactly. An additional Natural42 view at 1.70 m standing eye height, from the southeast passage, shows the working fronts, full island and tap. It is a supplemental view, not a matched before/after camera. Image inspection and CI results are recorded separately after rendering.

Regenerate from the frozen baseline in a complete checkout:

```bash
node scripts/prepare-k10-island.mjs design-development/k9/snapshot.json
```

The isolated branch is for review. It does not deploy, activate, merge, modify canonical walls/openings/ceilings, or authorize the existing kitchen wall-removal study. Structural/developer approval, MEP routes and site measurements remain outstanding.

