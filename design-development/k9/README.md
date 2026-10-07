# K9 rotated and translated island comparison

The rotation-only illustration left 1620 mm between the island and the tall kitchen-unit fronts. The owner asked for a better-balanced position. This candidate rotates the existing 1700 × 900 mm island 90 degrees and moves its centre 400 mm toward the south tall units and 400 mm toward dining. All canonical architecture, other furniture and the three original J1 comparison cameras remain fixed.

| Static concept-model clearance | K9 |
| --- | ---: |
| Cooking-run edge | 1219 mm |
| Oven, fridge and pantry front strips | 1220 mm |
| Dining table edge | 1070 mm |
| Nearest stored dining-chair edge | 1115 mm |
| Living lounge-chair footprint | 1758 mm |

These image-calibrated model distances do not certify appliance installation, chair pull-out, seated circulation or construction dimensions. The canonical validator still has one E2-island room-placement failure because this candidate crosses the original closed kitchen boundary. The existing render-only open-kitchen overlay is retained without modification; structural/developer and MEP approval remain outstanding. K9 adds no new canonical warnings or hard failures relative to K8.

Only the island and its sink reserve change. The sink rotates with the island, stays on the working side and is inset a further 70 mm from the rigidly transformed centre. Its modeled east-end margin is 75 mm. Actual sink cutout, cabinet modules, services, dishwasher/open-door operation and fabrication remain TBD.

This isolated branch is for comparison renders. It does not merge, deploy, activate or overwrite a saved live design.

To regenerate from the exact baseline in a repository checkout:

```bash
git show 37d28c69e00844b5bbdccada77468fec95c50ea6:render-snapshots/current.json > /tmp/k9-baseline.json
node scripts/prepare-k9-island.mjs /tmp/k9-baseline.json
```

The canonical SHA-256 is `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`.
