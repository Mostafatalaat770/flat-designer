# Option A · Kitchen Soft-Ivory Refinement R4

Historical proposal-only record. The isolated implementation, true candidate revision, matched WebGL evidence and current visual verdict are tracked in [Kitchen R4 implementation](../kitchen-finish-r4/README.md). The original A/P0 and this proposal's release flags remain unchanged.

**Reversible style experiment ONLY, not applied to the source, not a true after-WebGL.**

Lead recommendation: unify previously mixed brown lower front faces with the already-ivory upper cabinets and integrated fridge. Retain the existing small `K3-end-landing` 600x410 in muted oak for warmth. Existing quartz backsplash stays warm. Source P0 brown architectural kitchen/service door stays **untouched**, and may need a separately owner-approved repaint after product samples. Existing hardcoded counter top #dcd7cf is a renderer-only proxy, not a specification.

Changes are **four existing furniture IDs plus the corresponding four `decor.saved.warm.colours` entries** (otherwise reapplying the warm theme would resurrect the brown faces). Every other theme, decor/surface, geometry and object is unchanged. Four furniture IDs: `starter-20` west cooking counter, `K3-corner`, `K3-sink-base`: `color #BCA98F → #E8E2D7`; `K3-dishwasher` integrated: same `color` plus `material_id kitchen-muted-light-oak → kitchen-soft-ivory`. Interior upper cupboard IDs, fridge, landing, wall treatments, flooring, glazing, ceiling, doors, wet points and all furniture footprints untouched.

Mechanics verified in production code: style `counter` uses `f.color` with front `cm`; `dishwasher` with `variant: integrated` resolves `f.material_id`. Merely adding an ivory materials catalog entry or changing a surface `albedo` would NOT necessarily recolor these source base units. `scripts/verify-kitchen-finish-r4.mjs` asserts these paths, the exact source SHA256, all original geometry fields, room/interior/decor bytes, and construction approval flags FALSE. Script confirms warm-preset synchronization and outputs an audit only, **not** a fake new scene with stale revision.

Actual source **A-P0.json SHA256 `017a76a5fc6d5ff0e90f1adb10140c7098e3c2cc3e86d18e7a0b0c0fd439ec2a`**, scene-9e86635b cloud scene-4821689 v55. Type B canonical SHA `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`.

Suggested finish balance: matte soft ivory fronts `kitchen-soft-ivory #E8E2D7`; restrained warm oak landing `kitchen-muted-light-oak #BCA98F`; quiet existing warm-quartz-look backsplash `#E5DED1`; original limestone-look floor `S1-stone #DCD3C5`; production renderer countertop proxy `#DCD7CF`, not an approved slab. Dark graphite handles can relate to the hob without mixing brass/chrome/black across every face, but current `fronts()` handle geometry is not vendor-selected.

Sample holds: actual selected washable laminate/PET/lacquer and edge sample; real brown kitchen door/frame refinishing permission; 1:1 hand/operating path around washer/DW/service door; installer cabinet cutouts and gas/plumbing; durability/grease and cleanability; daylight + 3000K same-room sample viewing; procurement signoff. No demolition or MEP approval.

Offline source-verifiable review ZIP from this chat: `Kitchen-Finish-Review-R4.html`, original 3 unaltered SHA-verified WebGL images marked **BEFORE**, original P0 scene and explicit color-only proposed schematic marked **NOT RENDERED**. This avoids passing stylized concept art off as a geometry-correct photo.

**CI:** Prior latest GitHub Actions Owner R1 jobs fail before assigning runner (0 steps). This code cannot be called green until same exact HEAD runs successfully. Keep PR #68 DRAFT.
