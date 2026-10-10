# Master ensuite wet zone: M0 1450×800 vs conditional M1 1450×900

**10 Oct 2026.** We keep apartment Type B v0.2.2, the 2.50m clear ceiling, all rooms, ceiling, openings, WC, vanity, wall-mounted shelves, materials and saved cloud Studio v55 intact. Canonical model geometry is **not** altered in either render. A review-only candidate shifts the existing north-wall wet footprint 100mm south, and moves its *separate* 600×2050mm fixed glass 100mm south to follow. No fixtures/plumbing points are moved. Base design M0 stays the active enclosed owner-review snapshot.

## Why this is not an easy enlargement

| Source item | M0 current | M1 CONDITIONAL |
|---|---:|---:|
| Concept wet area | 1450×800mm | 1450×900mm |
| South edge of floor/wet footprint | plan y=7150mm | y=7250mm |
| Dressing doorway northern jamb | plan y=7265.7mm | unchanged |
| **Projected Y gap to doorway band**, not clear access | **115.7mm** | **15.7mm** |
| Source 600mm screen, nominal open band to west | **832mm** | **832mm** |
| Actual glass product / wet floor buildup | TBD | TBD |
| Wet/dressing containment | unverified | **more demanding** |

The 600mm screen across the right side of the 1450mm width leaves a nominal **832mm** model interval on the west for walk-in entry. It is **not** a finished clear opening, and does not model droplets escaping to the wardrobe/dressing doorway nearby. Increasing the screen to 650mm could reduce this entry interval to **782mm**, increasing to 700mm leaves **732mm**, while shortening to 500mm makes an easier **932mm** gap but weaker splash screen. These are sensitivity comparisons, **not selected hardware**.

A prior door/room study flagged an approximately 46mm entry pinch under a 900mm option, but the computational proxy may have treated the flat wet-floor shape as hard solid. A shower wet patch is *not* a wall. Evaluate the **actual 2050mm glass** versus actual door hinge swing independently; do not claim a wet patch intersects physical hinges. More importantly, a wet zone reaching nominally 15.7mm before the dressing-door Y-band needs rigorous water containment and threshold engineering. The canonical left wardrobe door nominal is 677.9mm, but its real leaf/swing may be smaller.

## Best responsible direction right now

Retain **M0 (800mm)** for development while the actual survey resolves splash, 1:1 standing/turning and drainage. The longer 1450mm span and clean wall-head already make a calmer master than another cage. Do NOT promise it is comfortably wide enough for everybody; trial 800mm, inspect body movement and wall controls. M1 gains 100mm standing depth but without a physical drainage solution can be a worse risk for dressing wood and door.

### Functional detailing if/when site measurements pass

- Keep **one** 600mm clear fixed screen on its intended wet/dry line with wipe-clean accessible surface and corrosion-resistant removable fittings. Glass must have a supplier-backed safety and anchor system; drilling through membranes must be specified by wet-area engineer.
- Retain the **two slim 380×115mm shampoo shelves** only if measured hand/control reach and waterproof mechanical fixings are viable. Avoid a wall recess cut into an unknown structural/shared wall; an approved recessed niche is a future alternative only if supplier and waterproofing plans approve it.
- Choose a serviceable shower drain and trap based on floor screed and gravity path, not on the visual line in a mesh. If curbless cannot be constructed correctly, use a verified small threshold and controlled containment.
- Provide separate glare-controlled 3000K mirror/tasks and IP/location-suitable shower light; no imaginary hidden ceiling cavity, no new points until electrician signs wet zoning.
- Use minimal large-format warm porcelain and one muted stone shower wall, grout and wet-rated floor independently sampled in on-site lighting. Less clutter, proper towel/robe dry reach and good extract matter more than adding decorative accessories.

**HOLD:** developer/qualified wet designer approval, actual floor buildup, trap/slope and waterproofing, actual dressing hinge/full door sweep, splash trial, safe shower glass, wet slip evidence, ventilation to outdoors and 1:1 family use test. CI green only confirms source and visuals, NEVER physical permission.

Machine evidence: `node scripts/build-master-walkin-depth.mjs` creates source-checked M0/M1 scenes, JSON and plan SVG; workflow produces 4 source-verified WebGL frames from two identical v55 cameras. No edits to cloud Studio, `render-snapshots/current.json`, or canonical JSON.
