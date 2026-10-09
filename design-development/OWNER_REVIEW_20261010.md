# Owner review — Type B · source-locked v55 · 10 October 2026

**Decision status:** concept development, **not** construction approval or supplier order. This is the current design critique and first-priority decision sheet after the integration merge. **One apartment, one active review source, historical options only as comparisons.**

## What is actually current

- `master` merged integration PR #45 on 9 October 2026. Current owner-review GitHub snapshot: `render-snapshots/current.json`, visual candidate `scene-9cf45a73`, derived from **saved cloud v55** `scene-4821689` / storage revision 55. Cloud and this render candidate are **not the same scene**: GitHub's bathroom shower renderer makes the source's fixture a genuine visually open `walk-in`; the cloud still has the old shower style until its backend renderer is updated.
- Canonical geometry Type B v0.2.2 SHA `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`, **2.50 m** finished net clear height, living glazing as drawn, unchanged. No structural or wet-service field certification yet.
- Former v50: historical, not the working source. Archived K12 `scene-e2fcb932`: unapproved architectural overlay; its two model geometry failures do not by themselves prove the concept is structurally impossible.
- Registry: `design-development/decision-registry.json` is machine-checkable; the actual source remains `render-snapshots/current.json`. Always report both IDs.

## Design verdict: strongest safe direction today

**Keep the actual closed v55 kitchen only as the *working reference* while testing one improved closed and one engineer-feasible open/semi-open alternative. Do not make K12 the default to achieve a prettier room.** Opening the kitchen may be valuable for hosting, sightlines and the larger living area but remains conditional on developer/engineer confirmation and fixing real geometry and MEP constraints. This is a conditional design preference, not a rejection of open kitchens.

| Space | Current v55 fact (source model, not site tape) | My decision for now | What would materially improve it |
|---|---|---|---|
| Kitchen | Enclosed; 600 mm integrated DW adjacent to modeled sink, 600 mm indoor washer niche, 650 mm fridge envelope | **KEEP as honest baseline; REDESIGN scenarios** | Compare cabinet-by-cabinet usable storage and open doors, relocation of washer only if service terrace permits a real installation, extract hood/gas and drain details |
| Dining | One **2000 × 950 mm** table + **six** nominal **510 × 530 mm** chairs | **KEEP table and six chairs** | Six occupied chairs pulled out, entry door open, person carrying serving tray, furniture finish and comfort |
| Master bath | **1450 × 800 mm** conceptual flush walk-in with separate glass and two shelves | **KEEP visual direction; HOLD build details** | Prove 800 mm access or evaluate 900 mm safely with swing/screen; drainage slopes, floor build-up, full waterproofing and real water splash |
| Family bath | **900 × 900 mm** shower and v55 shallower wall cabinet | **KEEP cabinet location provisionally; HOLD flow** | Finished actual door clearance, toilet/basin approach, easier-clean enclosure/low threshold, comfortable towel access |
| Reception | 2880 mm sofa, TV composition, family seating; full-height glazing | **DEVELOP A/B visuals from current source only** | Human-eye matched unobstructed shots, daylight glare, TV visibility, lighting layers and actual material swatches |
| Bedrooms/dressing | Saved v55 bedrooms and opposing dressing storage | **KEEP rooms, refine joinery** | Wardrobe leaf opening with two people, bed access, charging/lighting, quiet AC and exact carpentry internals |

## The kitchen trade-off to settle first (M1)

**Option C — improved closed, source-safe.** Preserve existing walls and access. Audit daily flow between sink, DW, hob, refrigerator and washer. Verify cabinet doors open independently; quantify reachable net volumes for dinnerware, pans, food and cleaning. Propose service-terrace laundry **only conditionally**, with outdoor weather exposure, drain, electric isolation, accessible maintenance and manufacturer warranty checked. Pros: retains verified topology, less irreversible work. Cons: limited connection to dining, smaller-feeling kitchen and washer competing with functional storage.

**Option O — conditional open/semi-open.** Use archived K12 only as a *reference sketch*, NOT approved coordinates. First determine which kitchen-facing segments may legitimately be changed; K12 originally proposed changes across kitchen/bath boundaries and had two hard model failures (island touching the canonical reception boundary at ~3.8 mm and a tall pantry element intersecting a wall by ~57.4 mm). Correct walls/appliances and run the exact model validator **before** aesthetic review. Then validate proposed gas/ventilation/extraction, sink/DW drainage, fridge/oven access, safe through-traffic and real storage loss. Pros: social connection and light. Cons: structural/MEP dependency, cooking odors/noise and storage/traffic risk.

**Recommendation:** design both with the same six-seat dining layout and furniture/door operating states. Select O only after real buildability is substantiated, otherwise C is the safe default. Two serious concepts beat ten cosmetically varied K12 island shifts.

## Biggest daily-use gaps still open

1. **Kitchen/dining traffic:** a child or guest walking while another person unloads a full dishwasher; six chairs are not six comfortable seats until occupied/pulled-out test. Historic K12 `+150mm` island tests improved one DW-open aisle from **570 to 720 mm** nominal, but these numbers belong to the **unapproved K12 sketch**, **not** current v55 or actual site.
2. **Bathroom use:** current master 800 mm wet-zone depth is narrower than common design recommendations and the apparent open walk-in does **not** model physical drain slope, trap capacity or splash. Family bath corridor proxy produced a severe bottleneck (~20 mm), which is **not an actual measured clear width**. Require 1:1 taped layout, door leaves, real sanitaryware, shower screen and a person moving.
3. **Visual QA:** previous A17 K12 footage showed a foreground lamp hiding the sofa/coffee-table despite camera-centre projection passing; a follow-up corrected that obstruction but still noted partial TV occlusion by terrace wall. This is **historical evidence**, not proof of a defect in the current v55 render. For v55, review two eye-height cameras plus a dimensioned top view per key room with no subject obstruction.
4. **Lighting/materials:** Calm Contemporary / warm stone and restrained oak is a promising provisional lead, not a confirmed SKU. Preserve 2.50 m net ceiling, avoid wholesale gypsum drops, and choose soft layered task/ambient lamps only after electrical and HVAC routing.
5. **Real site vs digital certainty:** manufacturer-specific opening arcs, structural/developer permission, ventilation, waterproofing and Egyptian supplier stock/prices all still require separate evidence.

## Explicit acceptance gates

**Before selecting the kitchen plan:** as-built survey and developer/qualified-engineer structural determination, correct geometry model, actual cooktop/hood/DW/fridge/oven manuals, cabinet inventory, six-chair and dishwasher occupied use tests, validated MEP paths and same-camera review of both options.

**Before changing bathrooms or first fix:** finished door aperture/swing and drainage location, waterproofed floor assembly with approved falls and safe glass, wet-use slip and splash assessment, electrical zoning, ventilation, 1:1 full-room test.

**Before final whole-home style approval:** measured plan, one coherent sample palette, human-eye current-source images, usable joinery diagrams, transparent provisional pricing and maintenance, owner/family signoff.

**Before executing:** separate architect/engineer-signed construction drawings, accurate BOQ and approved procurement schedule. Green CI proves repeatability of *this model*, not physical 10/10 comfort or local legal compliance.

## Execution discipline

1. Never change canonical architecture or production cloud Scene just to match a concept render.
2. Merge verified code into `master`, but every new interior decision starts as reversible review with a current scene revision and immutable backup.
3. Resolve **kitchen+dining first**, then bathroom flows, then reception/bedrooms, then a coherent material and lighting package.
4. Each new option must say **KEEP / REVISE / REJECT / HOLD**, give exact source identity and state what would change the decision.
5. Sources: [current baseline](./CURRENT_BASELINE.md), [Type B roadmap issue #41](https://github.com/Mostafatalaat770/flat-designer/issues/41), [K12 evidence](./advisor/A12_A13_KITCHEN_DINING_DECISION_20261008.md), [bathrooms QA](./advisor/BATHROOMS_A2_V55_VISUAL_QA_20261009.md), and [MEP release issue #19](https://github.com/Mostafatalaat770/flat-designer/issues/19).
