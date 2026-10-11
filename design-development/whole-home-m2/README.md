# Type B / M2 — three ways to live in one apartment

**Issue #71 concept delivery from Draft PR #68 HEAD `2826d5d`.** Open **[Owner-Review.html](Owner-Review.html)** after downloading, or unzip **[Owner-Review-Package.zip](Owner-Review-Package.zip)** and open that file. The Arabic review contains every visual and all 39 room schedules. No server, account, CDN, online font or image host is needed. External inspiration links are optional online reading.

Three original designs: **A calm contemporary/modern organic**, **B warm Japandi/refined minimal**, **C restrained contemporary Mediterranean**. Three editorial SVG moodboards combine original furniture/material/accessory drawings with an explicitly labeled source WebGL inset. Nine identified designer projects (one seed plus two additional per style) and a separate mnmt caution are attributed; third-party photography is linked, never copied into the package.

**Provisional home lead B; credible alternate A.** B's exposed frames, quiet storage and negative space suit the fixed 2500 mm ceiling. A offers softer arms and a more enveloping seat. C brings richer walnut/cane/earth contrasts but requires tighter control of visual weight and warm lighting. Room-specific preferences are also explained; do not assemble every room favorite without choosing a coherent home language. No direction is owner-approved.

## What's here

- `Owner-Review.html`: self-contained Arabic edition, three moodboards, interactive same-camera comparisons, controlled floor comparison, 13-space source floor maps, room selection, all 68 M1 constraints, practical material/maintenance/cost-class matrix and owner prompts.
- `Moodboard-A/B/C.svg`: exactly three original boards; drawings represent design intent, not a photograph or another apartment geometry.
- `A/B/C.json`: isolated render-only candidates retaining all 50 furnishings + 27 source interior objects, positions, dimensions, openings and architectural source. `B-stone.json` changes only the public-spine floor in reception/hall/kitchen for an independent M1 A/B decision.
- `DESIGN.json`: three complete 13-space schedules, source IDs, M1 zone IDs/uses/HOLDs, palette systems, conditional room lead/alternate, material matrix and mixing rule.
- `frames/`: **14 actual WebGL canvas PNGs**, with exact camera/source/layout/image hashes. Three designs × living/dining/master bedroom/family bathroom, plus two controlled B stone-floor frames. No cutaway, enlarged room, moved door, AI apartment image, wall variant or cloud write.
- `REFERENCE_LINKS.json`, `RENDER_EVIDENCE.json`, `BROWSER_VERIFICATION.json`, `PRESERVATION.json`, `VERIFICATION.md`: reproducible evidence and the visual critique.
- `MANIFEST.json`: package entry hashes. `PACKAGE.json`: ZIP size/hash and CRC verification, outside the ZIP to avoid a circular self-hash.

## Source and review limits

Canonical `v0.2.2`, SHA256 `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`; current snapshot SHA256 `ec05e4fe7c0e15b3555107da4ac5628894df7fcddb3cee996d3af2fddaa7df63`, scene `scene-9cf45a73`, origin `scene-4821689` / cloud v55. All **784 inherited tracked files are byte-identical**, including canonical, saved snapshots/cloud state, prior bathroom/reception/kitchen studies, M0, M1, registry and approval flags. New candidates do not replace any source scene.

The renderer is a stylized procedural abstraction. Material samples/artwork are original, not supplier scans. Board intentions for B's rectangular tabletop, A's curved dining backs and C's pale tabletop are more specific than the native oval/wood/block proxies. Mattress/seat heights without source measurements remain proxies. M1 functional zones constrain the concepts; existing source lighting/AC equipment is held constant, not presented as approved first-fix design. No lux, circuit/cable sizing, AC capacity, product SKU or construction coordinates are supplied.

Preserve master shower 1450×800, family source 900×900 and source WC basin 350×180. Alternate master 900 / family F1 frameless / WC B 450×250 remain separate unselected conditional studies. P0 kitchen remains; R4–R6 are kitchen precedents, not an approved whole-home palette. No K12 wet island, terrace washer, new niches, arches, terrace covers or service moves.

## Reproduce in the repository

```sh
npm ci --cache work/m2-session/npm-cache
npm run build
npm run check
npm run check:studio
node scripts/render-whole-home-m2.mjs
node scripts/build-whole-home-m2-review.mjs
node scripts/whole-home-m2.test.mjs
node scripts/verify-whole-home-m2-browser.mjs
python3 scripts/package-whole-home-m2.py
```

Playwright is supplied by the active Codex runtime; Chromium is `/usr/bin/chromium` (`CHROMIUM_PATH` can override). Actual capture uses the production generated viewer plus an isolated theme hook and embeds local assets. On this run the freshly built viewer was copied to `work/m2-session/built-viewer.html`, then the inherited tracked `dist/index.html` was restored byte-for-byte. Capture used `M2_VIEWER_PATH=work/m2-session/built-viewer.html`. Build before capture if reproducing; review generated changes rather than overwriting anyone's work. The renderer defaults to fresh capture. `M2_REUSE_VERIFIED=1` opts into reuse after matching scene/camera/palette/PNG hashes; keep it unset after changing render assets or helper code. This session reused unchanged verified frames during floor/camera refinement; the full capture/refinement logs are included.

**LOCAL PASS** is separate from **GITHUB ACTIONS NOT EXECUTED (ACCOUNT MINUTES/BILLING)**, per the latest owner execution comment. No workflow waiting/rerun, billing change, check bypass or alternate CI provider. PR #68 stays **Draft**.

## Next handoff: existing Issue #72

#72 is the M3 tracking parent, not a request to redesign all 13 spaces in one pass. Start its first small room group: entry/hall/six-seat reception. Use this package and original M0/M1, develop at most 2–3 meaningful alternatives, resolve source entry/shoe/door/pulled-chair conflicts, trial sofa comfort and curtain/AC relationships. BR-02's desk/chair warning, bath accessory reach/cleaning and threshold surveys follow their existing groups. Owner preferences are accepted for study only when explicit; construction release remains #19. No new roadmap or appliance-brand investigation.
