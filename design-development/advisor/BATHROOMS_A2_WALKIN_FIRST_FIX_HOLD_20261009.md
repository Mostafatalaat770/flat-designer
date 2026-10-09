# Type B · Bathrooms A2 — design-development and construction hold points

Date: **2026-10-09**. Owner/family-first. Status: **DESIGN STUDY ONLY — NOT FOR CONSTRUCTION**.

## Immutable source / separation of concerns
- Canonical: Type B v0.2.2, SHA `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`.
- Original cloud design A11.1/v50 `scene-85fd2cac`; still saved as its prior design variant.
- Active cloud Studio A2/v54 `scene-74ac7e58`. Git branch does not change cloud site automatically.
- Architecture, partitions, doors, apertures, glaze, 2.50 m clear ceiling **MUST NOT change** without explicit architectural/as-built approval.
- **Proposed application patch:** a distinct `shower.variant = "walk-in"` preserves legacy `style` showers while drawing an open floor with a wall shower, no two full-height prefabricated glass walls and no 50 mm raised step. **Only** the separate interior divider forms the fixed clear splash screen. Do not claim this is deployed to live Studio yet.

## Master ensuite · BATH-M01
| Parameter | Model | Evidence class |
|---|---|---|
| Canonical room | approx 1716 × 2754 mm | VERIFIED in canonical; built site TBD |
| Door / dressing link | opening approx 678 mm, unchanged | VERIFIED in canonical; true finished clear opening TBD |
| Main wet area | 1450 × 800 mm, north end; replacing original tub | EXPLORATORY |
| Fixed glass panel | 600 mm wide × 2050 mm tall; conceptual clear glass | EXPLORATORY |
| Wet area entry | nominal opening ~800 mm left of the panel, not certified as clear | EXPLORATORY |
| Storage | two small wall-mounted shower shelves at ~1230/1540 mm nominal | EXPLORATORY |
| Existing WC / 600mm closed vanity | held in current positions | EXPLORATORY; plumbing TBD |
| Walls/floor | large-format warm ivory porcelain, single soft-greige shower accent, sand-grip floor palette | GENERIC / SKU TBD |
| Lighting | downlight illustration, nickel accents | EXPLORATORY / Electrical first fix TBD |

**Current warning:** wall/door swing and close parallel modeled screen/wet-area envelope need physical review. An optional 900 mm deep wet zone increased the model's door-swing pinch to ~46 mm; keep 800 mm concept until the entrance swing and clear measured space are verified. Avoid a full-width prefabricated glass enclosure: it would block the intended open entry.

**Design intent:** a low-maintenance, curbless wet area **only if** an approved drained/slope waterproof system and floor build-up permit it. Glass to be specified by qualified fabricator. Preserve headroom and dressing access.

## Family full bathroom · BATH-C01
| Parameter | Model | Evidence class |
|---|---|---|
| Canonical room | approx 1801 × 2754 mm | VERIFIED canonical |
| Door from private hall | nominal 657 mm opening, unchanged | VERIFIED canonical; actual finished clear TBD |
| Shower | existing 900 × 900 mm prefab visualization at far end | EXPLORATORY, actual enclosure/open entry TBD |
| Toilet and 600mm vanity | retained: moving them gave bad proximity and/or modeled wall intersections | EXPLORATORY |
| Storage | remove 300×300 floor cabinet; add wall-hung shallow 540×170×540 mm closed concept on west wall at 1420mm elevation | EXPLORATORY / anchor & child safety TBD |
| New finish | same family warm ivory + shower greige + non-slip sand floor | GENERIC / SKU TBD |

**DO NOT CERTIFY THE FLOW:** The conservative sampled centre-route analyzer reports approx 20.3 mm even after storage changes. This is a proxy/algorithm bottleneck, **not a physical clear-width measurement**, and alternative shifted WC studies improved the proxy but introduced fixture collisions or poor sink clearances. Resolve with exact finished wall measurements, hinge swing, full fixture SKUs/seat projections, door-open body study, and on-site 1:1 tape-out **before buying**.

## Guest WC · WC-01
Current slim 350 × 180 mm handwash basin, WC and mirror retained. **v54 applies** the same sand-grip floor to guest WC and a soft-greige porcelain accent on the vanity/mirror wall (both generic, supplier sample TBD). Consider easy-to-clean full porcelain/paint scheme, mirror task lighting, no sharp projecting corners. Review inward door swing and basin mounting with actual SKU.

## Quality gates before any first-fix or purchasing
1. **As-built survey**: finished dimensions (all three wet spaces), actual wall thickness, waste stacks/soil routing, slab/screed levels, door hinge / width, extractor duct exit, floor levels and falls. Record dated photos.
2. **Flow and access**: bathroom entry and safe use with all doors and cabinet fronts opened; front WC/basin clearances, wet exit, cleaning access, seat positions and handle/controls reach. Update actual equipment envelopes; test a person on-site or full-size mockup.
3. **Waterproof/curbless**: approved complete membrane system for wet floor, upstands and penetrations; detailed threshold and glass fixing, trap/serviceability, full waterproof flood test per designer/supplier/local requirements. Verify falls to chosen drain and adjacent floor protection (do not choose a slope by eye).
4. **Supply/ventilation**: hot/cold mixer location and maintenance access, anti-scald control, extraction ducted to outdoors, quiet humidity/timer control where practical, prevent stagnant moisture after showers.
5. **Electrical**: electrician-approved bathroom equipment zoning, suitable IP-rated luminaires near wet area, protection/bonding/RCD selection per Egyptian applicable codes and actual distribution board design. No invented socket coordinates or breaker sizes.
6. **Purchasing**: approved tile samples in actual light; wet grip and cleaning performance, adhesive/substrate/expansion joint details, glass safety marking, hardware and anti-corrosion specs; supplier warranty and spare parts; cabinet moisture rating and secure wall substrate.
7. **Verification**: original geometry hash identical; no critical overlaps; capture real 3D with approved shower variant and 2 eye-height cameras per bathroom; visually confirm shelf, mirror, toilet, entry and door unobstructed; require client/engineer signoff.

## References (design guidelines, not an Egyptian code determination)
- NKBA Bath Planning Guidelines (older PDF): https://media.nkba.org/uploads/2022/05/Bath-Planning-Guidelines.pdf — recommends 813mm clear doorway when feasible, 762mm in front of fixtures, 914×914mm showers; includes US-specific code references which **must not be mistaken for Egyptian law**.
- Schluter curbless floor/waterproof systems: https://www.schluter.com/schluter-us/en_US/using-a-prefabricated-shower-tray-and-ramp — design and waterproofing system reference, not an approved product selection.
- US EPA bathroom exhaust guidance: https://www.epa.gov/indoor-air-quality-iaq/remodeling-your-home-and-indoor-air-quality — extraction should exhaust moisture outside, not into ceiling void.
- Existing repo: `design-development/advisor/A15` engineering study for all 13 spaces, if approved later.

## Release status
- Cloud saved v54 including guest WC finish and bathroom A2 storage changes validated **166 PASS / 25 WARNING / 0 FAIL**.
- Renderer PR code is a **candidate**, requires npm checks, real same-camera browser captures, no regression, separate authenticated Vercel preview, and explicit app/site deployment. Current cloud Studio still renders old shower mesh until rollout.
- No structural, slab, plumbing/wet build, electric, installation or procurement signoff has been issued.
