# A18 — Family-living lighting + TV wall decision notes

**State:** exploratory design only, not electrical plan, not a site survey, not a TV installation drawing.

**Source:** immutable canonical Type B v0.2.2 `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`; K12 source scene `scene-e2fcb932`; A16 light pale-stone palette and A17 corrected real lounge cameras. Reception is the original L-shaped polygon. The two inherited K12 speculative open-kitchen architecture **FAIL** statuses stay unresolved. Finished clear height stays **2500mm**.

## Why the wall should not become overdesigned

From the actual model, the **nearest straight boundary** to the modeled TV is the short vertical wall-edge running between `[12497.882,550.754]` and `[12497.882,2732.588]` in plan millimetres, **2181.834mm** long. The TV centre (`starter-31`) is near `[12243.688,1779.359]`, 254.194mm plan-X from this boundary. The original TV stand (`starter-30`) is **1800×380mm**, rotated 90°, centred at `[12180,1800]`; its 1800mm length projects along the short wall from Y=900 to 2700, leaving just **32.588mm nominal** at the boundary's Y=2732.588 end and 349.246mm at the other. These are original *image-calibrated plan proxies*, not installed plaster dimensions, wall-fix clearance or a licence to set furniture flush to a wall. Verify wall segment construction and adjacent openings before any carpenter/shop drawing.

**Design consequence:** do **not** propose a default oversized 2400–2800mm floor-to-ceiling media unit, deep cabinet or new gypsum bulkhead based on social-media pictures; it may extend past the actual straight wall and pinch the lounge corner. Simpler finished surfaces and a retained low TV stand should be tested first.

## Three reversible TV wall alternatives, none yet built

1. **A · Mineral paint only (default design direction):** warm soft neutral accent wall in compatible shade with A16 pale-stone floor. Keep existing TV and 1800mm low unit. Add one movable side lamp only if family viewing glare and sockets allow. Low cost to reverse; avoids new joinery and maintainability risk.
2. **B · Shallow backing only (conditional):** a thin, serviceable cabinet-board or finish sample across *part of* the short straight wall, retaining service access, hidden-but-reachable power/data. Selected board thickness, fastening, acoustic behaviour and actual wall/door/window geometry **TBD**. No claim a panel spanning 2.4m fits.
3. **C · Warm concealed bias light behind TV (optional):** serviceable plug-in low-voltage lighting concept with proper safe adapter, matched TV bias-light colour and route, no embedded gypsum/routed wall cutting and no claim about lux/glare/TV safety. Need actual TV size, socket and electrical safety checks. Compare viewing experience with/without bias lighting.

The evening scene competition [A18 PR #35](https://github.com/Mostafatalaat770/flat-designer/pull/35) does not change physical TV wall geometry. It compares renderer scene intentions for **night** at 2700/3000K and soft/more layered room lighting, **not** real photometric lux or independently wired switching circuits.

## Lighting design gates

- Family watching TV: avoid direct reflected luminaires on screen, excess downlight directly in front of it and stark dark-to-bright contrast. Test position of real TV and seating eye-line.
- Family reading and cleaning: keep independently accessible practical task and brighter general lighting, not one very dim permanent scene.
- Future controls: separate user intents for general, lounge task, dining and night circulation with reliable physical/manual switches. Actual circuits, breaker ratings, drivers, dimming compatibility, electrical box wall measurements and 2.50m ceiling section must be engineered, not invented here.
- Floor wood procedural grain in A16 B is untrusted; do not equate renderer visual repetition to real Egyptian flooring product quality.
- Before build: confirm site walls, screen height/size, VESA support wall type, fixing details, outlet alignment, ventilation, cable management, child safety and moisture/terrace risk.

## Practical next choice

Prefer **A: calm flat wall + preserved slim low TV unit** as the next *visual* candidate. Keep C an inexpensive optional prototype. Only investigate B when a real carpenter and as-built confirm available projection and service distances. Await verified genuine same-camera A18 evening renders before selecting the lighting mood.

**No master merge, no live saved Studio write, no irreversible construction, no procurement.**
