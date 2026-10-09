# Kitchen-only open concept, 10 Oct 2026

This is the first new source-isolated open kitchen option **derived from actual current v55**. It is NOT an approval for demolition or first-fix.
The generator copies just historic K12 kitchen furniture and its wet island into v55, preserving every existing bedroom, bathroom, main terrace, service terrace, living furniture, and the six-chair dining table exactly at the v55 positions.
The only architectural render overlay concerns four kitchen-facing wall segments plus the existing kitchen opening. It removes zero bathroom walls, hides zero bathroom openings, adds no speculative bathroom pocket doors and changes no canonical geometry.
This is a real improvement over importing the whole archived K12 render overlay, which also removed four bathroom-related wall segments and hid bathroom openings.

The generator recomputes a new independent scene revision, keeps v55 source provenance and captures the actual app renderer from three unchanged v55 camera positions. It also writes a machine-readable validation audit. Even a visually convincing WebGL image does NOT validate the site structure or construction legality.

The remaining open questions are whether the kitchen-only partition change is legally and structurally possible, whether the island/cabinet bodies lie inside a professionally approved redrawn combined room envelope, gas/hood/water/drain and service terrace washer, purchased fridge and dishwasher open-leaf paths, net storage and six fully occupied chairs.

Do NOT import this isolated review candidate into saved Studio or replace render-snapshots/current.json. Use the candidate and its test results to work with an architect/developer to determine whether the physical geometry and MEP can be approved.

Implementation: scripts/build-kitchen-only-open.mjs, studio/analysis/kitchen-only-open.mjs and its regression suite; CI renders are under workflow owner-kitchen-only-open.yml.
