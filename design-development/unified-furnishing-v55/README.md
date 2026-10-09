# Unified local furnishing review — v55

This candidate combines the preserved bedroom `R4` proposal with dining `table-north-150` against review source `scene-9cf45a73`, saved cloud `scene-4821689`, storage 55. Its normalized proposal contains 12 updates to distinct objects. Applying either component first produces exactly the same final layout. `compose.mjs` checks this, full brief import, zero static validation failures, unchanged architecture and unchanged unrelated contents.

The bedroom retains the bed, uses the 1100 × 600 mm west desk, moves the wardrobe 120 mm north and uses south storage 800 × 350 × 1000 mm. The table, six chairs and pendant move 150 mm north without reducing seat spacing. The current enclosed L kitchen is retained. The guest outward door remains conditional analysis; it is absent from the furnishing proposal and snapshot.

`proposal.json`, `snapshot.json`, `brief.json` and `composition.json` preserve the complete local candidate and hashes of its two source proposals. The candidate is production-disconnected and has no cloud storage revision. Static composition does not establish connected walking paths, actual operation, comfort or measured fit.

```sh
node design-development/unified-furnishing-v55/compose.mjs
```

Add `--write` to regenerate candidate files. Continue with whole-apartment fixed-state circulation from inside the entrance, then measured appliances, chair/table underframe, joinery, door hardware, glazing and shower operation. Do not replace the active design, widen openings or inherit old island studies as part of this review.
