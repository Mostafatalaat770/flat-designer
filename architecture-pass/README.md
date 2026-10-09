# Architecture Pass 01 — protected exploratory studies

Date: 2026-10-06
Baseline: scene-29d4aa6d / storage revision 39
Canonical SHA-256: 734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658

## Working rule

The canonical apartment geometry remains immutable. Architectural alternatives are rendered through a **render-only overlay** and are never written back to the saved Studio layout, canonical JSON, room polygons, wall model, openings, or production state.

Every architectural change is EXPLORATORY until the following are verified:
1. structural drawings / as-built conditions identify the wall as non-structural or an engineer designs the required opening;
2. developer/compound and authority approvals are confirmed where applicable;
3. plumbing, drainage, gas, ventilation, electrical and waterproofing conflicts are resolved;
4. chosen appliances and joinery pass manufacturer installation and service clearances;
5. circulation and daily-use checks are run on the revised plan.

## Standards hierarchy

1. Egyptian law, authority requirements, project/developer rules and current Egyptian codes.
2. Structural engineer / MEP engineer / manufacturer installation instructions.
3. Professional planning guidance such as NKBA 5th Edition (2026), current IRC/accessible references where useful, and product-specific standards.
4. Ergonomic and interior-design best practice.
5. Styling only after the above pass.

Planning targets are not automatically code minima. Current model assumptions continue to use 900 mm as a comfort circulation target and 750 mm as a review threshold; kitchen work aisles use NKBA planning guidance of 1067 mm for one cook and 1219 mm for multiple cooks when applicable.

## Existing geometry relevant to the kitchen

- Kitchen KIT-01 area estimate: ~8.455 m²; printed dimensions 2.40 × 3.75 m.
- Reception RECP-01 area estimate: ~47.463 m².
- Main shared north kitchen/reception wall: (8981.529,6587.866) → (12116.59,6587.866), length ~3135 mm.
- Diagonal kitchen/reception segment: (12116.59,6587.866) → (12582.613,6969.158), length ~602 mm.
- Existing kitchen door OP-RECP-KIT: ~720 mm leaf/opening model.
- Existing modeled wall thickness: 180 mm. This does **not** establish structure type.

## First controlled comparison

A — Doorless existing opening
- Hide only the existing kitchen door leaf.
- Lowest intervention; geometry/opening width remains unchanged.
- Useful as a control for smell/noise/privacy trade-offs.

B — Main 3.14 m opening
- Remove only the long shared kitchen/reception wall segment and hide the existing door leaf.
- Keep diagonal and south vertical separator pieces.
- Tests whether a strong dining-kitchen connection gives most of the spatial benefit without fully dissolving the kitchen boundary.

C — Broad open kitchen
- Remove the long shared wall, diagonal segment, and both solid vertical kitchen/reception separator segments around the existing door; hide the door leaf.
- Maximum openness within the existing room footprint.
- Highest MEP/ventilation/visual-clutter and structural-review burden.

## Decision criteria

Each option is scored on: structural/approval uncertainty, kitchen work geometry, appliance opening/service envelopes, prep/landing area, gas extraction, odor/noise control, dining circulation, visual hierarchy, storage, privacy, future-family use, construction complexity, and reversibility.

No option is approved for construction from renders alone.
