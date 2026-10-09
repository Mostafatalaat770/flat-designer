# Semi-open kitchen P0/P1 · v55 source-controlled study

**Status: REVIEW ONLY.** Original apartment, saved Studio, bedrooms, bathrooms, reception, kitchen appliances and kitchen/services are identical to `render-snapshots/current.json`.

## Candidate configurations

**P0** is precisely current v55 with the original 720.2mm **nominal opening** and its viewer door shown open. No wall change.

**P1** retains every room fixture and all six dining chairs; the only `render_only` architecture overlay conceals **source wall segment 44**, vertical x=12582.613mm from y=6969.158 to y=7456.363, and hides the existing kitchen hinged door. It visualizes a **1207.4mm nominal continuous opening** from y=6969.158 to y=8176.580, between unchanged adjacent kitchen-facing wall returns. This is not a **finished clear** opening, a construction detail, or architect/structural consent. The long north cooking wall and remainder of east kitchen wall stay present.

No wet island, no drainage move, no unproven service-terrace laundry, and no tall-pantry wall clash. Existing sink, DW, indoor washer, cooking hob, fridge and all joinery retain their model coordinates. The design may still need cabinetry/finish improvements to look attractive. The 2.50m ceiling and full-height glazing remain unchanged.

## What we can and cannot learn

GitHub workflow renders **both options using the same two human-eye cameras**, looking from dining into kitchen and from kitchen toward dining, with the original app Three.js engine. Layout validation ensures both have zero hard furnishing failures; the P1 removed wall is strictly a **conditional renderer overlay**.

The real owner question is whether a modest enlarged portal brings enough social visibility and light while keeping cooking smells/privacy under control. Distinguish it from K12 fully-open wet-island, which had two domain hard fails and substantial living-area compromise.

## Hard release gates

Qualified engineer + developer verify which wall segment can safely be opened, lintel/lateral load, structural and MEP services; site tape after finishing measures real opening and refrigerator clearance; validate actual dishwasher and fridge door sweeps, gas hood/extraction and an occupant with all six chairs pulled out. If any fails, P0 remains unchanged and fully reversible door/glazing treatments can be reviewed. NO demolition or shop drawings from a successful render.

Source scenes, audit and image PNGs are CI artifacts; no mutation to canonical architecture, production cloud Studio or `render-snapshots/current.json`.
