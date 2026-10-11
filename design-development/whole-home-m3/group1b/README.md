# Type B · M3 Group 1B — functional optimization

**B2 is the independent design recommendation for continued study. B Warm Japandi remains NOT approved.** Source architecture, all inherited snapshot archives, and all owner/construction/procurement/cloud gates are preserved. This review continues `673708e` on existing Draft PR #68 and parent Issue #72.

افتح [المراجعة العربية](Owner-Review.html) مباشرة، أو فك [حزمة المراجعة](Owner-Review-Package.zip) وافتح `TypeB-M3/group1b/Owner-Review.html`. الملف مستقل ويحتوي الصور والمساقط داخله؛ لا يحتاج سيرفر أو اتصال. الحزمة تضم أيضًا تجهيز غرف النوم/WIC المستقل. ملفات PNG الأصلية تحت [frames/](frames/)، والمساقط SVG بجوار المراجعة.

## Actual decision

Two complete reversible proposals are compared with exact existing B and A controls. Both move the six-seat 2000×950 table/chair group another450mm north, shorten/reposition the buffet to1250×400×800, adjust seating supports/plant and yaw the unchanged1230mm TV12°. B1 retains the shallow entry shoe unit; B2 replaces it with a600×350×800 eastern sliding-shelf prototype. No source door, glazing, wall, ceiling, wet/private furniture or HVAC/light setting is changed.

| Operation | Existing B | B1 | B2 |
|---|---|---|---|
| Legacy chairs450 / shoe opening200 | 500 found,700 fails | 500/700 found | 500/700 found |
| Legacy shoe opening300/400 | both fail | both found | both found |
| Independent chair-standing states,700 to four shared destinations | 0/24 |16/24 |24/24 |
| All six rear-standing bodies plus shoe/buffet users,700 to four destinations | fails | fails |4/4 found at slider0 and counterfactual400 |
| Buffet/curtain overlap profiles |4/18 |0/18 |0/18 |
| Actual proxy knee zones600 wide / eating position |4/6 hit supports |0/6 |0/6 |
| AC floor-service route700 AFTER coffee parking | fails | fails |found, conditional |

Routes are conservative 2D circular-envelope model tests, not physical circulation or six moving articulated people. They start **inside** the apartment; they do not certify a700mm route through actual entry/WC/kitchen thresholds. The larger operating test also includes six occupied bodies, full source open leaves, buffet500 opening,600×600 user/standing zones and450×350 assumed curtain stacks. Opening sensitivity100/200/300/400 is retained; B2's nominal slider is0. A remains an upholstery-language control but does not resolve these operations.

B2 offers **about4 daily low-shoe pairs**, conditional on300×115×150mm shoes,560×310mm shelf clearances and270mm slider half-opening. The proposed4-pair WIC reserve550×350×400 sacrifices clothing storage and is **not allocated or approved**. Buffet internal-width capacity reduces by38.3% under the same20mm end-wall assumption; no liters or manufacturer SKU are invented. The glazing-face gap improves177.4→477.4mm; after350mm curtain projection127.4mm remains, subject to actual rails/fabric/sliding-glass details.

The independent critique is candid: clearer arrival and curtain separation, better arm support and TV alignment, but heavier table blades/lounge chair, generic fabric/wood repetition and less buffet capacity. The two60×600 table blades avoid the modeled knees but their620mm tabletop cantilever/load stability is HOLD. Coffee parking requires dining chairs at eating position, not450 withdrawal. Its499-pose **table-only** transport path has a15mm minimum modeled furniture gap; workers, gripping and ladder/filter handling remain HOLD. B2 does not certify physical AC service.

## Evidence

- [Operating design and rejected studies](DESIGN.json), [B audit](AUDIT-B.json), [A audit](AUDIT-A.json), [B1 audit](AUDIT-B1.json), [B2 audit](AUDIT-B2.json).
- [Actual mesh/ray comfort, TV and service tests](COMFORT_AND_SERVICES.json), including54 knee-triangle queries per layout.
- [24 genuine WebGL captures](RENDER_EVIDENCE.json): four layouts × six matched cameras, including the extra entry-storage view and identical night view. Each PNG has source/layout/camera/driver/mesh-diagnostic hashes and zero architecture changes/fallbacks/network requests.
- Seven dimensioned plans: four layout operation plans, [curtains](Curtain-Relationship.svg), [AC service](AC-Service-Operation.svg), [shoe capacity](Shoe-Storage.svg). All dimensions are source-model values, not site measurements.
- [Seven precise open SITE HOLDs](SITE_HOLDS.json), [preservation](PRESERVATION.json), [local verification](VERIFICATION.md), [offline browser verification](BROWSER_VERIFICATION.json), [package hash/CRC](PACKAGE.json).
- [Independent next group already prepared](../group2-preparation/README.md): exact source baseline for master/BR01/BR02/WIC,20 original items and22 M1 intents. No bedroom furniture edits or Group1 approval.

The production curtain mesh remains the inherited thin visual proxy. Tested compressed-fabric envelopes are drawn in the plans; screenshots alone do not represent measured curtain bulk. AC position is the unchanged production mounting heuristic, not a survey. Night frames demonstrate visible composition only, without lux, glare or electrical-code certification.

## Reproduce locally

From the repository root, install the existing locked dependencies and use local Chromium. Do not trigger Actions. The builder prepares the isolated viewer cache and copies the four byte-identical inherited texture assets automatically.

```sh
npm run build
npm run check
node scripts/build-whole-home-m3-group1b.mjs
node scripts/render-whole-home-m3-group1b.mjs
node scripts/build-whole-home-m3-group1b-details.mjs
node scripts/prepare-whole-home-m3-group2.mjs
node scripts/build-whole-home-m3-group1b-review.mjs
node --test scripts/whole-home-m3-group1b.test.mjs
node scripts/verify-whole-home-m3-group1b-browser.mjs
python3 scripts/package-whole-home-m3-group1b.py
```

The default capture command renders all24 frames. Environment subsets are for iteration and replace the render manifest with that subset; final delivery must use all24. No persistence/cloud adapter is enabled. The application source is unchanged. `dist/index.html` is explicitly rebuilt from that same source because the baseline's generated cache was stale; see verification. Draft PR stays open, kitchen visual studies/appliance pause and all inherited approvals remain intact.
