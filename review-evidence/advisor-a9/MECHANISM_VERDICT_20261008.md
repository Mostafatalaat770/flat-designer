# A9 — Master Dressing: Door System Decision Gate

**Date:** 8 October 2026. **Status:** Manufacturer-aware concept screen; no order, installation or hardware SKU selected.

**Canonical source:** Type B v0.2.2 SHA `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`; frozen K12 `scene-e2fcb932`. No wall or closet footprint changes.

**Reproducible CI:** [A9 SUCCESS](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37759611819). Reruns A8 private-room geometry before hardware selection, and produces `review-evidence/advisor-a9/wardrobe-door-options.json`.

## Actual built-in envelope from conceptual plan
- Wardrobes: two opposite **1250mm-wide × 600mm-deep** units.
- Closed-front corridor ~**1335mm**.
- Opening both opposite 625mm hinged leaves -> **85mm** door-tip-to-door-tip (not a usable standing corridor).
- Manufacturing hardware requires final cabinetry height, weight, wall fillers, door offset, drawer motion and actual material finish.

| Hardware | Two sides active: conceptual remaining passage | Access and tradeoff | A9 disposition |
|---|---:|---|---|
| Ordinary two hinged leaves, 625mm/leaf | 85mm | Full opening when usable, collision risk when both open | **REJECT as default** |
| Four narrow individually hinged leaves, 312.5mm/leaf | 710mm | Many hinge lines/face seams; need carcass support | RESERVE |
| Two-track sliding doors | 1335mm outside door bodies | Simple; each track conceals a large part of wardrobe, internal drawers must fit exact clear opening | **SHORTLIST** |
| Two bi-fold pairs, each two 312.5mm panels | 710mm **conservative planning projection**, not catalog value | Wider exposure to storage; more sophisticated folding/track hardware and exact handedness/center clearance to prove | **SHORTLIST** |
| Double-panel pocket system | ~1335mm | Opens fronts completely but dedicated pocket can consume **150mm** of width if contained inside each 1250mm cabinet, complexity and expense | FEASIBILITY ONLY, not default |

## Product-family feasibility sources — from manufacturer technical specifications

**Hettich WingLine L:** Official Egypt product family [Hettich WingLine L](https://www.hettich.com/en-eg/products/folding-door-systems). [Product technical leaflet](https://www.hettich.com/fileadmin/Media_Center/Catalogue/Hettich_Product_Leaflet_WingLine_L_2023.pdf) permits individual wooden door wings **250–600mm wide**, up to **2400mm high** and **25kg per wing**. Four 312.5mm panels in **two pairs** fit the *individual wing-width range*. That **does not** establish that two sets can mount and park correctly within our one 1250mm cabinet; full configurator/assembly drawing, panel mass and drawer swing are mandatory.

**Blum REVEGO duo:** [Official product range](https://www.blum.com/in/en/products/pocketsystems/revego/programme/). The documented double-door installation family accepts approx. **900–1500mm** installation width, **150mm pocket** and minimum depth **573mm**. This makes it a technically interesting high-end comparison, not automatically the best in a tight small dressing — pockets may consume meaningful cabinet volume and can be hard to service or source locally. Confirm via exact product configurator and Egyptian supplier.

## Mandatory real-world trial before fabrication

Provide dimensioned exploded shop elevations/sections for **both opposite wardrobes**, with an actual 450mm drawer, 600mm hanging bay and full-width garment access illustrated. Measure simultaneous operation of the two wardrobes by two people at realistic door angles, plus one person bending to a bottom drawer. Measure inside leaf/rail clearances and specify hinge/track part numbers, wood/laminate finish, per-leaf height/weight, sliders, fasteners, replacement stock in Egypt, warranty and delivered installed cost.

### Provisional lead choice
**Compare 2-pair bi-fold versus high-quality sliding**, then choose the option with more comfortable daily drawer access, reliability and cost. No preference should be locked on visuals or brand reputation alone. Standard hinge fronts are unattractive for opposing daily use in this footprint.
