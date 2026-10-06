# Current integration — 6 October 2026

Use the real GitHub integration branch `agent/local-studio-integration-20261006`, pinned to `scene-29d4aa6d` / source storage revision 39. The working Studio and review run on **4176**. A.7 and the earlier 4174 work remain historical evidence. See [INTEGRATION_20261006.md](INTEGRATION_20261006.md) for branch overlap decisions, current commands, checks and design observations. The following notes describe earlier milestones and are retained as history.

---

# Apartment Type B — a coordinated family home

Current local direction: **Family A.7 + kitchen v4**, `scene-9e210720`. This is a developed concept, not a finished construction package. The recovered production design remains revision 9 / `scene-c286be16`; reread confirmed it unchanged. Start at `http://127.0.0.1:4174/_qa/project-dossier.html`.

## Source of truth and evidence

Architecture VERIFIED against canonical SHA-256 `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`. No wall, opening, glazing, structure, room boundary or height changed. Finished clear height is 2500 mm; 130 mm service void does not establish ducted HVAC feasibility. Reception remains one continuous space. Local drafts, immutable snapshots and private baseline export are isolated from production.

Natural camera: 42° vertical FOV, standing eye 1700 mm. Wide 60° is for comparison/overview only. Scale check was verified with the 1700 mm human and 1000 mm ruler. Manufacturer-specific sofa/chair height corrections now have measured Three.js geometry checks.

Three reception strategies have 42° entry, family and dining views. Eighteen v2 model screenshots and three generated interpretations are preserved. The AI images are EXPLORATORY: textures, tailoring, lighting and exterior view are illustrative. They do not prove dimensions, SKU fidelity or construction. V3 and V4 preserve another ten model views each, including coordinated candidate and appliance access. V3's west-run washer was rejected after the open balcony door obstructed the screenshot/access.

Shared validation: coordinated v4 **106 PASS / 67 WARNING / 0 FAIL**. Warnings include inherited bedroom/bathroom circulation estimates, adjacent cabinet joints, close furniture edges and fixed narrow openings. Zero failures is neither a circulation sign-off nor appliance installation approval. Five repository verification suites passed after the source changes. V2 actual-browser screenshot replay passed 72 steps; V4 baseline creation and replay each passed 40 steps; all ten screenshot comparisons reported 0.00% difference.

## Reception options and my recommendation

**A — layered warm family, recommended direction.** Keep a strong straight sofa and one olive accent chair. Increase useful density with a 2400 × 400 mm closed sideboard, 1200 mm entry shoe storage, 1000 × 340 mm entry bench, side table and reading lamp. Six visually light mushroom chairs stay 3+3 along the 2000 × 950 mm dining table. This adds about 15% to the summed furniture envelope area over R1, without creating another seating group. The clear centre is intentional; the sideboard gives daily belongings a home.

**B — compact chaise.** More relaxed lounging, but the enlarged sofa closes the approach and compresses the coffee/TV relationship. The 2880 × 1545 mm sofa is GENERIC; it is not a verified Muuto configuration. Its rectangular envelope includes an empty inner corner, so the reported density increase is not exact occupied floor area. Keep as an alternative, not the default.

**C — reversed TV / sculptural sofa.** Television west, sofa east; a different spatial strategy and visual hierarchy. The earlier TV/art overlap was corrected by relocating art to the east bay wall. The sculptural sofa silhouette is expressive but makes the living area feel more enclosed from the family approach. Arflex Marenco is an aesthetic reference, not an exact 2800 × 1000 mm SKU.

For my own family apartment I would develop A. Trend references are useful for proportion, craft and character; daily seating, storage and movement decide the layout. A.7 now composes the sideboard wall with the existing large artwork and one lamp. Still imperfect: generic fluted tables, flowers and spherical plant read more repetitive/decorative than intended; the accent chair is still an approximate mesh; the lighting and appliance meshes remain schematic. Do not add chairs simply to fill floor area.

## Family A.7 — useful density and proportion correction

Local candidate `scene-9e210720`: **126 PASS /76 WARNING /0 FAIL**. Thirteen local screenshots captured and visually inspected;52-step replay passed, all13 comparisons0.00% difference. Interactive Studio also verified Natural42°, eye1.70m, visible1.70m human and1.00m ruler. Architecture and production state remain untouched.

Reception: existing one large artwork moved over the2400mm sideboard; one surface-supported lamp; existing single plant increased to1650mm. Sofa,TV, one accent chair and six dining seats unchanged. The middle remains clear. No additional hall furniture: modeled face clearance1027mm; a250mm cabinet would leave777mm. Mirror/light instead; family linen allocated within bedroom2 storage.

Bedroom design was revised after inspection. The old dresser model actually renders an open vanity and stool, so both added storage pieces now use closed sideboard geometry. This is custom joinery intent, not a confirmed drawer SKU. Master chest1000 ×400mm; bedroom1 cabinet1000 ×350mm with815mm front access. The master bench moved from the foot route to the south wall;665mm dressing approach and approximately1288mm east main path. Nightstands shifted to accommodate the larger frame.

[IKEA IDANÄS180 ×200cm](https://www.ikea.com.cy/en/products/idanas-upholstered-bed-180x200-cm/90458947/) has overall1870 ×2220mm dimensions. This is a REFERENCE footprint; the generic channel-headboard mesh and warm fabric are not manufacturer CAD or verified article upholstery. Local Egyptian availability / actual finish TBD. Single beds now reserve1280 ×2100mm around1200 ×2000mm mattresses, an INFERRED allowance pending selection. The enlarged bedroom2 bed initially collided with the1200mm desk; narrowing that desk to1000 ×600mm corrected the conflict. Keep the solid-wall headboard and unobstructed north window.

Kitchen island within locked enclosed geometry rejected: after610mm north cabinets and600mm island, only982mm remains for both aisles combined. An open kitchen requires a separately approved architectural investigation; no wall/opening was altered. Kitchen and bathrooms retain v4 and their unresolved installation/route checks.

Visual critique: storage and sideboard hierarchy now read as purposeful furniture rather than detached objects. Natural entry/family/dining, both bedrooms and the master storage view establish that improvement. The first dressing close-up conveyed no room organization and was replaced with a cross-route view. Still imperfect: repeated generic bed art/fluted models, simplistic plants, black mirror surface, brownish rendered light in some private-room views, fitted kitchen/appliance detail, bathroom use envelopes and real hardware. More rendering realism is required before presenting the home as fully resolved.

## Studio software upgrade

First stage implemented: shared local domain adapter and renderer adapter; one declarative study JSON instead of a copied study/HTML generator per iteration. Canonical/hash/brief-revision checks, full shared validation, scope guards, all-camera preflight and history protection are centralized. Seven targeted tests pass; all five existing repository suites pass. The new pipeline reproduces A.7's layout/revision and screenshot evidence. Use `npm run study -- local-qa/studies/family-a7.json`.

Recommended next stages: modular Three.js browser renderer with detailed GLB furniture/PBR assets; React +TypeScript +Vite UI around the preserved contracts; canonical scene export to Blender/Cycles for finished renders. These integrations are **not yet implemented**. See `studio/UPGRADE.md`; local review at `/_qa/software-upgrade.html`. AI interpretation stays separate from measured geometry.

## Kitchen and laundry — current measured study

User-confirmed: **gas hob and dishwasher**. Fridge SKU/width remains a reserved 650 mm envelope. Current v4 arrangement:

- West: 1500 mm cooking run with 600 mm gas hob. Approximate worktop landings 307 mm north and 593 mm south. Oven position is reserved conceptually; actual oven/hob installation is TBD.
- North: 600 mm corner base; 600 mm indoor washer niche; 600 mm dishwasher niche; 600 mm sink/waste cabinet with 550 mm sink; 600 × 410 mm shallow landing. A continuous **1200 × 610 mm preparation surface** is intended over the washer and dishwasher. Current generic meshes do not yet show the finished continuous countertop and fitted fronts.
- Southeast: fridge. Its measured gap to the opposite shallow landing is **1097 mm**, exceeding NKBA's 1067 mm one-cook planning guidance, below its 1219 mm multiple-cook guidance. The fridge is only about **18 mm beyond the entrance opening in plan**: site tolerance, actual hinge, door and ventilation must be checked before procurement. This proximity prevents declaring the kitchen final.
- Dishwasher next to sink; 600 mm away from the perpendicular west counter. Assumed open appliance rectangles do not overlap each other. This is not a simultaneous occupancy/swing simulation: actual user standing space, fridge doors and washer hinge arc remain TBD.
- Washer moved off the west run after actual screenshots revealed the balcony door obstructed access. Its north-run door is beside the west return; full manufacturer 130° opening is not assumed. Verify the useful opening angle and loading access with the selected installation.

Daily sequence: unload fridge → wash at sink → prepare on the continuous surface → cook on west return. Store cutlery/plates above or beside dishwasher; provide a waste/recycling pullout at the sink; place cooking tools/spices near the hob; pots and pans in accessible drawers away from appliance service panels. Blum AMBIA-LINE is an organization reference, with actual drawer sizes/hardware TBD. Do not place cleaning chemicals with pantry food.

Indoor laundry is preferred. The manufacturer's indoor-use condition is not satisfied merely by a roof over the service balcony. Bosch WIW28302GB is a REFERENCE: body 596 × 544 × 818 mm, 574 mm depth including specified furniture front; 600 × 610 mm is the planned niche, not the product body. Local availability, adjustable feet, countertop support, enclosure, plumbing, drainage, socket and service access all remain TBD. Leave the service terrace for drying and utility use; add no enclosure without architectural approval.

Rejected: full opposing 600 mm runs (~992 mm aisle), an island, the earlier central fridge (~907 mm local gap), northwest corner fridge with either door conflicting with the adjacent L-run, and the west-run washer behind the balcony door. Pale oak and muted olive remain finish alternatives on the same geometry.

Planning source: [NKBA Kitchen Planning Guidelines](https://media.nkba.org/uploads/2022/05/Kitchen-Planning-Guidelines.pdf). These are planning guidance, not Egyptian regulations. [Bosch washer installation manual](https://media3.bosch-home.com/Documents/9001928209_B.pdf), [built-in washer spec sheet](https://media3.bosch-home.com/Documents/specsheet/en-GB/WIW28302GB.pdf), [Bosch gas-hob installation guidance](https://www.bosch-home.com.sg/experience-bosch/kitchen-installation-guide/hobs/gas-hobs-installation). Gas ventilation, exhaust route and model-specific distances require an installer/engineer; no universal hood clearance is being claimed.

## Whole-apartment room register

| Area | Current direction / completed study | Work required before calling it resolved |
|---|---|---|
| Living / dining / entry | A/B/C compared; A coordinated locally; six seats; useful closed storage; one chair and one plant | Confirm actual sofa/chair/table products, sideboard elevation, art, practical lighting, seat-level views and glare |
| Kitchen | Working L revised twice; gas, dishwasher, indoor laundry; oak/olive comparisons | Selected appliances, open-door/standing checks, exact fitted countertop, oven, corner access, ventilation, plumbing, elevations |
| Master bathroom | 1500 × 750 tub retained in recommended candidate; alternate 1500 × 800 shower study preserved | Tub versus shower remains a family-use choice; drain/valve locations, waterproofing, falls, shower glass, mirror lights, towel reach and vanity elevation |
| Family bathroom | 900 × 900 shower; compact vanity; closed 300 mm towel/cleaning storage | Door/shower swing, toilet use envelopes, basin fidelity, drainage and wet-area engineering; sampled route warnings unresolved |
| Guest WC | Existing fixtures retained | Toilet/handwash comfort and door interaction, lighting/mirror and ventilation; sampled warning needs direct spatial review |
| Master bedroom | Actual1870 × 2220mm king-frame reference; closed chest and south-wall dressing bench | Chosen product/fabric, generic-mesh fidelity, sockets, headboard elevation and bedside lighting |
| Dressing |600mm-deep north/south wardrobes,1335mm between fronts | Hanging/shelf/drawer fit, hardware and actual opening access; fixed narrow bath doorway remains |
| Bedroom 1 | Bed/chair overlap corrected;1200mm desk; closed1000 × 350mm storage;1800mm wardrobe | Wardrobe operating depth800mm exactly at study assumption; real frame/hinges and tolerances TBD |
| Bedroom 2 | Headboard moved from glazing to east solid wall;1000mm desk;1600mm wardrobe with linen bay |849mm wardrobe approach; selected1280 × 2100mm generic frame reserve and site tolerance TBD |
| Main terrace | Existing seating retained | Comfortable chair layout, outdoor-rated real products, drainage access and restrained planting |
| Service terrace | Washer removed in v4 concept | Drying, cleaning storage and utility access; weather exposure and actual service conditions |
| Whole home | Warm ivory, pale oak, light stone, mushroom upholstery, muted olive, restrained bronze | Samples, maintenance, slip resistance, installation tolerances, lighting circuits, acoustics and HVAC engineering |

## Product and material register

| Reference | Evidence / dimensions | Design/model status |
|---|---|---|
| [Muuto Connect Soft three-seater](https://www.muuto.com/product/Connect-Soft-Modular-Sofa-3-Seater-Configurations) | 2880 × 990 × 690 mm; seat 400 mm | REFERENCE linked to main A sofa; approximate mesh now has measured correct seat/back height; fabric/availability TBD |
| [Muuto Fiber Side Chair, Tube Base](https://www.muuto.com/product/fiber-side-chair-tube-base-p3089/23216-whit_dkye/) | 510 × 530 × 770 mm; seat 460 mm | REFERENCE on six chairs; slim metal legs; mushroom is design colour, not verified fabric SKU |
| [Muuto Cover Lounge](https://www.muuto.com/product/Cover-Lounge-Chair) | 663 × 612 × 707 mm; seat 381 mm | REFERENCE candidate for a lighter accent chair; not substituted into the layout yet |
| [Arflex Marenco](https://www.arflex.it/intl/en/marenco) | Product family verified; selected configuration dimensions TBD | REFERENCE for C's character; C's generic sofa is not exact product geometry |
| [Flos IC Lights F1](https://professional.flos.com/en/global/product/ic-lights-f1-f3173030/) | Real opal-glass floor-lamp family; exact selected finish/height TBD | REFERENCE candidate; current shade-lamp mesh is GENERIC, not IC Lights |
| Bosch WIW28302GB | See exact dimensions above | REFERENCE candidate; current washer is a generic niche/envelope |
| [Cosentino Dekton Aeris](https://www.cosentino.com/usa/colors/dekton/aeris/) | Real material reference | REFERENCE for light worktop; actual finish, thickness, slab layout, availability TBD; viewer stone remains GENERIC |
| [Blum AMBIA-LINE](https://www.blum.com/us/en/products/innerdividingsystems/ambia-line/overview/) | Real drawer organization family | REFERENCE; specific drawers/hardware not yet selected |
| Duravit D-Neo 2366600000 | Prior basin reference 600 × 440 × 165 mm | REFERENCE; model's round bowl is an acknowledged approximation, not exact D-Neo geometry |
| Limestone/travertine-look floor; linen; plaster; custom oak joinery | Current dimensions/palette define intent | GENERIC; no claim of a purchased stone, textile or cabinet SKU |

Next work packages are measurable: resolve appliance/open-door geometry and fitted joinery; refine bathroom use envelopes and elevations; address bedroom warnings and furnish bedrooms; select dimensionally suitable products and real material samples; coordinate lighting/services; prepare room plans/elevations, a procurement schedule, quantities and an installation decision list. No claim of a finished whole apartment or construction-ready specification is made now.
