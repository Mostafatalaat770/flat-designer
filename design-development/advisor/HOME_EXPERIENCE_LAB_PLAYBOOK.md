# Type B — Family Home Experience Lab (idea board + engineering release discipline)

**Source:** Original Type B v0.2.2 canonical `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`, K12 exploratory scene `scene-e2fcb932` (unapproved kitchen opening). 2500mm FINISHED ceiling target. This is a *read-only, agent-driven study*, **not a shopping list or permit**.

## Our design principle

**A device only earns space if its everyday benefit exceeds its footprint, noise, operating heat/steam, sockets, cleaning and maintenance burden.** Appliances are owned by people, not renders. We should design reserved outlets and adaptable landing/storage zones early but delay specific purchases until exact user behavior and manufactured parts are known.

### Priority A — design the invisible infrastructure before finishing

| Opportunity | Practical upside | Pre-finish requirement | Main risk / decision gate |
|---|---|---|---|
| **Independent ambient/task/night lighting** | Family chooses scenes for reading, cleaning, dinner and sleep | Switch legs, controllable drivers, recessed fixture sections or plug points, measured RCP | Avoid AC/curtain service clashes, glare, inaccessible drivers, loss of finished 2500mm ceiling |
| **Kitchen undercabinet worktop light** | Actual hand/task illumination rather than showy ceiling spots | Low-voltage route, serviceable driver, water/splash-safe details by qualified electrician | Upper cabinets and hood ducts can cast shadows; no invented lux/CRI certification |
| **Bedside controls + blackout** | Lights, AC and charging reachable from both sides; quiet sleeping | Two-side sockets, two-way switching, measured curtain tracks and edge coverage | Poor light leakage, direct AC draft, furniture backblocking sockets |
| **A flexible countertop-power strategy** | Coffee + kettle + blender + future air fryer without extension chaos | Actual load schedule, protected outlets in safe positions, isolators and local electrical signoff | No presumption two high-heat appliances can share one circuit / no automatic new supply |
| **Water-leak observation and service access** | Easier early notice under sink / washing-machine area | Accessible shutoff, compatible water sensor location and safe electric isolation (engineer) | False alarms, loss of sensor connectivity, drain/wet wall not verified |
| **Connectivity/data/wifi home work** | Future desk flexibility, reliable home-office and controls | Pathways to likely bedrooms, reception AV + wireless coverage planning | Hidden joints, serviceable cable routes, no vendor lock-in |

### Priority B — reserve options, purchase only if family benefit is clear

| Idea | Prototype study | Verdict now |
|---|---|---|
| **Portable HEPA/particle air purifier** | Source-model bedroom 14.68m² × 2.50m = 36.71m³, theoretical 4.8 equivalent ACH at ~176m³/h CADR; reception 47.46m² → ~570m³/h. Both room geometries are image-calibrated; open-room mixing not proven. | **SHORTLIST USE CASE**, not a model. Prefer quiet-night CADR/noise verified for bedroom; check filter cost and inlet/outlet clearance. Purifiers supplement proper ventilation/source controls — cannot replace hood/bath ventilation. |
| **Air fryer** | Real K12 west cooking run can accommodate a sample device 340×350mm on worktop on plan; mere ~189mm nominal **body** gap from modeled hob, ventilation/drawer workflow, fan/exhaust, electricity, 600mm remaining prep segments unknown. | **NOT APPROVED FOR PERMANENT POSITION**. Check with exact chosen manual; do not operate enclosed in the coffee niche. Prefer retrievable appliance with accessible safe counter operating place. |
| **Robot vacuum + docking station** | Reserve potential accessible dock along a stable room route, clear approach/cord and lint handling; measure thresholds, furniture legs and spare socket. | **DEFER SPECIFIC DOCK** pending selected robot footprint + actual furnishings; no robot bay built based on generic drawing. |
| **Drinking-water filter / separate tap** | Check Egypt site incoming water, local filter use and family preference, sink cabinetry plumbing/trap space. | **FEASIBILITY ONLY**; don't compress existing 600mm island sink/DW/waste modules without water/maintenance evidence. |
| **Indoor humidity/PM2.5 monitoring** | Add serviceable indicator to understand if windows, cooking or bedroom activity justify other devices. | **OPTIONAL, portable**, not a substitute for ventilation or a reason to over-automate the house. |
| **Family drop zone + organized charging** | Keys, bags, shoes, charging, cleaning supplies near natural entrance path | Validate entry door and reception walking route, no clutter/displaced sideboard | **HIGH UTILITY TO TEST** before adding more decorative consoles. |
| **Bathroom shower niches, fans, anti-slip** | Quiet/low maintenance day-to-day family cleanliness | Wet slope, membranes, clean-out access, tile thickness, fan flow/duct path | **DO NOT CUT WET WALL** for decorative niches without qualified waterproofing and site survey. |

### Lighting behavior briefs — these are *functions*, not a fixture layout

- **Master:** dimmable low-glare ~3000K ambient; two separately switched warm ~2700K reading lamps; shielded ~2200K low-level night route with manual override. Color temperatures are **design explorations**, not quality/reliability standards; actual CRI, photometry and glare must be checked.
- **Reception:** ambient/wallwashing general light, separate dining task scene, side reading lamp and accent light only if it improves warmth without clutter.
- **Kitchen:** independent general ambient plus wipeable under-cabinet worktop light; consistent food-prep visibility; extraction and task lighting independent from lounge dimming.
- **Entry/dressing/bathrooms:** later run night-path and mirror/task lighting studies, with moisture ratings and accessible drivers based on installed fixtures.

## Evidence pipeline — orchestrator's division of responsibilities

For every promising concept, **run these roles in series or parallel on controlled experimental branches** (not a claim that autonomous subagents have independently run):

1. **Family-use explorer:** write daily routines; identify who benefits and how often, and whether a reversible alternative does the same thing.
2. **Spatial analyst:** exact canonical room and furniture, nominal occupied footprint and *operating* clearance, routes with two adults / pulled-out chairs / doors open.
3. **MEP/safety analyst:** utilities, electric protection, heat, wet work, extraction, noise, ceiling depth and service access. Mark `TBD` until qualified site evidence.
4. **Product/material researcher:** fetch real manufacturer drawings and verified performance/maintenance; never fake price, runtime, CADR or drawer clearance.
5. **Lighting/material designer:** illumination purpose and controls, finishes and visual harmony; only then realistic matched-camera images from exact layout.
6. **Independent critic:** measurable benefit vs lost area/storage, lifecycle and awkward maintenance. Mark `KEEP / REVISE / REJECT / STAGE-LATER` with falsifiable reasons.

The reports include candidate source hash, object IDs, assumptions, hard blockers and scene comparison references. **Green CI is not approval to touch construction or purchase.**

## First actual run — auditable, not theoretical

[PR #26](https://github.com/Mostafatalaat770/flat-designer/pull/26), [CI run 37770444614](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37770444614): pure unit and exact Type B integration PASSED.

- Master air-cleaner nominal location (3500,7200) and reception (14900,5700): device bodies clear of currently modeled static furniture, but electric outlets, movement, drafts, actual product dimensions, service and nighttime sound are **not** confirmed.
- Air fryer nominal 340×350 on west cooking counter at (9381,7115): body fits real 1800×600 concept; **189.1mm** to hob body, and operating clearances warn of vent/steam/near-hob hazards. **DEFER permanent cabinet/fixture.**
- Nine lighting intents across master, reception and kitchen; none is a complete electrical/circuit/light-level drawing.
- K12 still has **two unapproved architectural hard validation failures** associated with exploratory kitchen opening. Do not promote.

## Research references and limits
- [AHAM CADR / ~4.8 equivalent ACH basis](https://ahamverifide.org/ach-faq/): a unit's smoke/dust/pollen CADR and clean-room volume, not guaranteed quiet-speed performance or fresh outdoor air.
- [EPA Guide to Air Cleaners](https://www.epa.gov/indoor-air-quality-iaq/guide-air-cleaners-home): portable particle cleaning only supports source reduction/ventilation; filters need servicing, no device removes all pollutants.
- [Example Philips Airfryer manual](https://www.documents.philips.com/assets/20210425/ce9933a3c5b24c25b382ad1500a34072.pdf): model-specific 10cm rear/sides/above and hot steam precautions; **not universal** for every future SKU.

**No cloud write, `master` merge, shopping approval, direct-life health claim or demolition instruction.**
