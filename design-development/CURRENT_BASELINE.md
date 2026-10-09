# CURRENT BASELINE — Type B, 2026-10-09

This document is the authority for the **next GitHub owner-review build**. No automatic Sites production migration or construction permission is implied.

| Layer | Single source / identity | Status |
|---|---|---|
| Architecture | Type B v0.2.2 · canonical SHA `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658` | LOCKED / VERIFIED MODEL; as-built survey TBD |
| Last saved cloud interior design | Studio v55 `scene-4821689` | SAVED, unchanged by this branch |
| Review build input | `render-snapshots/current.json` · 55 · visual candidate `scene-9cf45a73` | WORKING SOURCE in this branch, only an opt-in walk-in rendering difference |
| Old merged interior | `studio/local/sources/verified-master-v50.json` | HISTORICAL / do not load as current |
| K12 unapproved design | `render-snapshots/study-k12-unapproved-20261008.json` | ARCHIVED / failed structural/geometry release gates |

## What must appear in the review UI

- Master ensuite: the 1450×800 mm conceptual open walk-in area, with **no fake prefabricated glass cage or raised tray**, one separately modeled fixed panel, two shower shelves, saved WC and vanity. All EXPLORATORY pending screed, waterproofing, drain, glass and site measurements.
- Family bathroom: retained fixtures and **v55 slim wall-hung dry-side cabinet**. Narrow route validation proxy remains a HOLD, not clearance certification.
- Kitchen: **current source deliberately remains enclosed**, not because we have approved an enclosed design forever, but because unapproved wall removal/opening alternatives had hard geometry errors. Open/semi-open kitchen is a priority architecture decision, not permissible to silently alter verified walls.
- Living/dining, dressing, bedrooms: source-accurate v55 furniture/materials. Alternative decor experiments can be compared, not silently applied.

## Engineering/UX review policy

1. Exactly ONE active source pointer: `render-snapshots/current.json`; all authenticated Vercel Explore builds must derive from it.
2. Legacy references and unapproved kitchens stay recoverable but cannot be used as the default.
3. Every review build must report canonical hash, source cloud scene, candidate revision, storage revision, and GitHub SHA. A deployed build is not architectural approval.
4. Before moving this PR to `master`, require `npm run build`, `npm run check`, `npm run check:studio`, workspace/source tests, and actual captured WebGL views for the ensuite, family bathroom, kitchen and reception. Review full room paths and door swing against physical site sizes.
5. No Site cloud sync or Vercel production public access. Keep all deployment authentication enabled; private plans are embedded in the client bundle.
6. New development branches must target this integration branch, not the stale `master` or historical experiments; consolidate verified feature PRs explicitly and close/supersede old drafts after review.
7. Physical construction signoff requires separate measurements, local engineering/code approvals, waterproofing and MEP documentation.
