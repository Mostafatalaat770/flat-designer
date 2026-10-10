# Family bathroom · frameless shower alternative · 10 October 2026

**DESIGN-ONLY CONDITIONAL STUDY. NO WET FIRST FIX, GLASS OR TRAY PROCUREMENT.**

The prior actual three-room A/B photo jury showed a central problem: 900×900mm family shower `starter-16` used the renderer's generic high white tray and bulky full-length dark upper rails, even though the wall/floor palette was calm. That is **not** our accepted finished shower product.

This study implements a **new opt-in `frameless-low-profile` rendering variant** in both hosted and local Three.js renderers and in the shared, deterministically validated `studio-core.js` variant contract. Existing shower `style` and master `walk-in` remain untouched. Only source v55 family shower's `variant` changes in an isolated comparison. No canonical geometry, openings, room sizes, towel cabinet, WC, vanity, shower coordinate, finished ceiling or cloud state changes.

### Visual A/B

- **A:** same current 900×900mm shower with generic dark-frame high-base style.
- **B:** 900×900mm **visual-only** slimmer pale low-profile tray (35mm proxy), clear glass on one side + a narrower fixed clear sidelight + a 580mm nominal CLOSED pivot door; slim matte/brushed nickel fittings, no overhead rail. Two current family bathroom cameras `bath55-family-entry` and `bath55-family-dry-cabinet`, identical for A and B.
- Master 1450×800mm independent `walk-in`, 600mm pane, WC, all wet services and six dining chairs never change.

**Critical ambiguity:** even if B looks substantially nicer, a 35mm tray in a procedurally drawn scene is NOT proof of slab/screed space, waterproofing, low-threshold usability or usable door leaf sweep. The 580mm glass door is drawn **closed**. Its open position and hinges/handle may clash with the 657mm nominal bathroom hall entry, WC/vanity, towel cabinet or maintenance access. Do not promise access or buy a product without a licensed local engineer and glass specialist checking actual on-site dimensions with a selected supplier system.

### Required contractor/specialist evidence

1. Actual model-independent wall-to-wall and door finished-clear size, tap/soil/drain routes and structural screed elevations.
2. Manufacturer model(s) for 900x900 external size and fully installed tray; drain position/capacity, outlet/service hatch, waterproof membrane system, slope and substrate build-up all compatible.
3. True door swing / stack with usable entrance and real person after the new exact glass thickness and gaskets, sealed against spray and with child-safe hardware; **do not substitute the nominal 580mm for clear passage**.
4. Confirm safe glass type / standard and trusted glass installer, corrosion-resistant nickel hinge/support, seals and spare parts, accessible cleaning.
5. Match anti-slip certified wet floor, right exhaust route, mirror/task safe electrical zoning, waterproof cabinet mounting, tankless mixer service access.
6. Reject candidate if any conflict unresolved; retain original shower model while qualified feasibility happens.

### Release

Render API/GitHub tests guarantee only that both candidates render using the same locked source and cameras, and that other fixtures, walls and cloud scene are not touched. This change is a renderer **capability**, not a physical design or procurement signoff.

## 10 October concurrent branch reconciliation and geometry correction

Another design review exposed a **significant physical error**: the earlier opt-in frameless renderer portrayed its pivot door on the **south, WC-facing edge**, despite the WC's nominal northern footprint lying only **~319.6mm** south of the shower. A conceptual 580mm south-facing door opening outward would intersect the WC's modeled envelope by approximately **260.4mm**. It is unacceptable to infer a working south-entry pivot from that pleasing screenshot.

The revised renderer places fixed clear splash glass on the south face, a 320mm fixed panel and 580mm **CLOSED** door on the **WEST-facing circulation edge**. This is a better location to *study*, not a final hinge selection: west shower edge to nominal west wall is **~778.6mm**, so a 580mm door swung outward would leave only **~198.6mm** at the pinch. Glass specialist must evaluate inward folding, inward pivot or other certified entry configurations and occupant/cleaning/spray envelopes from as-built measurements. We expressly do not select outward swing.

This preserves the previously merged `frameless-low-profile` variant name, its 35mm low-tray and 1960mm glass visualization, all saved cameras, and the exact source layout; no duplicate rendering system is added. A tested audit reports both rejected naive swing directions and exact source geometry. The old separate alternative PR #53 is superseded by this focused correction rather than force-merged over the concurrently merged PR #52.
