# Sprint 6 — Bosch Egypt true integrated dishwasher study

**Design review only. DO NOT BUY OR BUILD yet.** Reference Type B A/P0 scene-9e86635b from PR #62, saved-cloud-source scene-4821689 v55, canonical architecture and clear 2500mm ceiling unchanged.

## Verified manufacturer dimensions

Two genuine fully integrated models currently listed on Bosch Egypt:
- Bosch [Series 2 SMV26DX00T](https://www.bosch-home.com/eg/en/product/SMV26DX00T): external body 598 W × 550 D × 815 H mm, required clear installation aperture **600 W × 550 D × 815–875 H mm**, total manufacturer depth with door open 90° **1150mm**. Price listed **EGP 35,999** on 2026-10-10. [Manufacturer service dimensions](https://www.bosch-home.co.uk/supportdetail/product/SMV26DX00T/49) / [original model drawing](https://media3.bsh-group.com/Documents/specsheet/ru-XB/SMV26DX00T.pdf).
- Bosch [Series 6 SMV4IMX62T](https://www.bosch-home.com/eg/en/product/SMV4IMX62T): **exact same 598×550×815mm body, same minimum 600mm clear width, same 815–875mm niche height, same 1150mm full-open depth**. Price **EGP 39,999** listed 2026-10-10. [Manufacturer service dimensions](https://www.bosch-home.co.uk/supportdetail/product/SMV4IMX62T/01) / [manufacturer tech sheet](https://media3.bsh-group.com/Documents/specsheet/fr-MA/SMV4IMX62T.pdf).

Prices and stock can change, not a quote or recommendation to purchase. A product manual from another regional service system is not a verified Egypt-specific ENR installation template.

**The important correction:** the body is **598mm**, but **requires 600mm CLEAR niche width**. The source's dishwasher has a nominal 600mm model furniture box, NOT a verified free finished opening. If a carpenter builds a 600mm-exterior-width module with panels both sides, the inside can be narrower than 600mm. If 600mm denotes empty space between adjacent cabinets, that MAY work, pending measured plumb/square alignment and manufacturer installation requirements. Never call this 2mm "spare room."

## 48 operating envelopes

The 90° total depth 1150mm is real manufacturer data but *not* a 2D door-pivot simulation; physical opening projection beyond the Bosch body is treated as a simple 600mm forward bound. Compare front-aligned, centre-aligned and rear-aligned convention, two assumed adult widths × four depths and both Bosch models. No accepted furniture is moved.

| Model origin convention | Dishwasher full-open rear-to-front assumption | 600×600mm standing adult to model nominal south inner wall |
|---|---|---:|
| Front face aligned with PR62 model at y=7298mm | 1150mm, opening ends at y=7898mm | **372.3mm** |
| Original object centre maintained | opening ends at y=7868mm | **402.3mm** |
| Rear face aligned with modeled source rear y=6688mm | opening ends at y=7838mm | **432.3mm** |

All three standing-body gaps are uncomfortably constrained if someone needs to pass BEHIND the dishwasher user. They are **not legally certified passing widths**. Lower-rack extension, door weight, cabinet façade, toe kick and exact selected hinge are not in the current geometry.

**Model result:** upgrading from Series 2 to Series 6 does **not** improve the available space or remove dishwasher-unloading bottleneck. Series 6 may offer other functional benefits, but they're a separate cost-value question.

## Implementation HOLD

1. Site survey after/allowing for final wall/floor finishes: min **600mm clear niche width**, **815–875mm height**, and **550mm depth**, plus real opening to appliance front and toe kick.
2. Correct manufacturer Egypt **ENR/FD** suffix and *exact* cabinet-front / hinge / bottom rack installation guide; service accessibility, safe water inlet/drain/electrical.
3. 1:1 operational trial: loaded lower rack, open door, 600mm adult plus second person moving to kitchen/terrace and service-door hinge. Verify actual daily plate storage reach.
4. Approval for qualified MEP and eventual shop drawings, not from a screenshot.
5. Current P0 architecture and all saved apartment scenes remain unchanged; any P1 wall44 kitchen opening remains conditional on developer/structural/MEP written release.

**Deliverables:** JSON manufacturer references and 48 auditable assumptions; source-plan sensitivity SVG; GitHub Actions smoke/scene gate. Still exploratory, not a purchase shortlist release.
