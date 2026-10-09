# Appliance selection brief — v55

The owner confirmed on 9 October 2026 that refrigerator, dishwasher and washing-machine models remain unselected. `SELECTION_AR.md` is the Arabic selection card; `selection.json` preserves five appliance/cooking groups, explicit null product/site fields, nominal source reservations and operation evidence. No brands, prices, market, appliance heights or real installation niche dimensions have been invented.

The refrigerator's source body-to-end-panel gap is 2 mm; it is a model measurement, not approved product clearance. Plan-east hinge preference comes from the frozen operation study and must be translated through the actual product's front-view manual. Dishwasher and washer reservations are 600 × 610 mm placeholders. Oven location is an under-hob assumption with no separate measured niche. The hob's 600 × 400 drawing is not a worktop cutout.

`build.mjs` derives `selection.json` from the existing review source, kitchen operation results and combined candidate snapshot; their SHA-256 values are preserved. Regenerate with:

```sh
node design-development/appliance-selection-v55/build.mjs
```

This brief leaves the frozen studies, candidate geometry, active design, cloud storage and canonical architecture unchanged. Continue with buying location/budget, real product installation manuals and site measurements, then a new local measured-fit review before procurement or adoption.
