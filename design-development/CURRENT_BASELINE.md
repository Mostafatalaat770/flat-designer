# CURRENT BASELINE — Type B, updated 2026-10-10

**Authoritative GitHub owner-review source**, not a construction approval. Read [the current owner decision sheet](./OWNER_REVIEW_20261010.md) and [machine-checkable decision registry](./decision-registry.json) before starting another design branch.

| Layer | Source / identity | Status |
|---|---|---|
| Architecture | Type B v0.2.2, SHA `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`; net clear ceiling **2.50m**, living glazing as modeled | MODEL-LOCKED; actual as-built survey still TBD |
| Last saved cloud Studio | v55, `scene-4821689`, storage revision **55** | SAVED; cloud renderer not changed by GitHub |
| GitHub owner-review input | `render-snapshots/current.json`, visual `scene-9cf45a73`, derived from cloud v55 | **SOLE WORKING REVIEW SOURCE**, merged to `master` by PR #45 |
| Historic v50 reference | `studio/local/sources/verified-master-v50.json` | ARCHIVED, not current |
| Archived K12 open kitchen | `render-snapshots/study-k12-unapproved-20261008.json`, `scene-e2fcb932` | UNAPPROVED CONCEPT; model geometry gates failed |

## Verified in the current GitHub review snapshot

- Canonical room geometry is preserved, with no demolition. Kitchen **is enclosed**, awaiting the two-option owner/engineer decision, not because an open layout has been permanently rejected.
- Master ensuite has **1450×800 mm** conceptual true open walk-in rendering (no default enclosure/tray), one separately modeled fixed glass panel and two shelves. The **cloud's live shower mesh may still differ** until the server renderer and contracts receive the same opt-in variant. All wet build details are exploratory.
- Family bathroom retains the **900×900 mm** shower and a shallow dry-side wall-hung cabinet. Its actual occupied clearance remains a hold. Do not treat sampled route metrics as physical clear width.
- Reception includes one **2000×950 mm** dining table with **six** chair objects. An actual occupied-six-person mockup and safe pulled-out-chair circulation are still required.
- The study registry records **no** physical/structural/MEP/procurement approval. A green WebGL capture is *not* an installed-space inspection.

## Workflow after PR #45 merge

1. **Branch from current `master`** (not the historical integration branch). Base every review on `render-snapshots/current.json` and assert its provenance, canonical hash, active revision and registered construction hold points.
2. Produce at most two useful design options per high-impact room decision, using source-faithful geometry and real furniture operating states; do not silently import the failed K12 overlay.
3. Run builds, validation, studio tests and `node --test studio/local/owner-decisions.test.mjs`; visually inspect matched room images with visible camera and screenshot provenance.
4. For a source change, intentionally revise the decision registry/owner document along with the snapshot after validation; otherwise the new gate will fail, as desired.
5. Keep Vercel authenticated. Browser local `localStorage` saves do not sync to the original cloud Studio; verify source IDs. Cloud design mutations and structural alterations should not be conflated with GitHub merges.
6. No fabrication, slab change, wet first-fix, MEP works, procurement or construction claim without measured survey and relevant Egyptian qualified professional and developer approvals.

**Next design milestone:** source-safe **closed versus structurally feasible open/semi-open kitchen**, including 6-seat dining + appliance-storage/workflow. Then bathing circulation and reception/bedroom comfort; only then finalize the house-wide palette and coordinated installation package.
