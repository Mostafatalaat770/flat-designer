# Apartment Type B — Source Hierarchy and Active Design Decisions

**Updated:** 8 October 2026, advisor passes A1–A10.

## Read THIS before editing layouts or interpreting historical K4 notes

| Authority / version | Meaning | Allowed actions |
|---|---|---|
| **Canonical Type B v0.2.2** `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658` | Sole reference for verified original walls, room geometries, doors/openings, 2500mm finished clear ceiling, full-height living glazing as annotated | **Immutable until explicit user approval + qualified measured site proof** |
| **Saved cloud Studio** last read `scene-85fd2cac`, storage rev `50` | Current user-persisted interiors, not interchangeable with experimental GitHub branches | Do not mutate without a proposal, checks and user-visible comparison |
| **GitHub default `master`** last confirmed commit `a4c14d3` | Studio rendering and snapshot code, historically A11.1 related | Do not assume exploratory K12 is already there |
| **Historical K4 specification and ROOM_PUNCHLIST** | A *historical design-development direction* with useful room technical notes | **NOT current design authority for island/dining details**: K4 records 1700×900 island and shifted dining while K12 research later uses 1700×1000, original dining position |
| **K12 study branch** `design/k12-permanent-end-prep`, scene `scene-e2fcb932` | Exploratory kitchen benchmark with wet island, fixed full 2000×950 six-seat dining, 2 open-plan canonical FAILs | Candidate/reference only; never call construction approved |
| **A7 +150mm north shift** `scene-60ec75b9` | Conditional study: increases nominal open-DW aisle 570→720mm while losing 150mm from lounge buffer | Keep as MEP-feasibility candidate, NOT activated |
| **A3 bedroom 1** | Full 1200mm desk + remove optional extra drawer chest preferable IF cupboard inventory allows | Conditional furnishing recommendation, not saved cloud update |
| **A4 buffet** | Keep nominal 2400mm buffet, use quieter natural oak rather than dark walnut, pending true storage count | Conditional finish recommendation, not installed procurement |
| **A8 bathrooms & dressing** | Keep master 1500×800 shower, family 1500×750 tub, guest compact basin, **review dressing opposing door hardware** | No opening/waterproofing approval |
| **A9 dressing hardware** | Shortlist compact folding vs quality sliding over 2×625mm ordinary opposite swing doors | No cabinet or hardware SKUs purchased |
| **A10 bedroom 2** | Scenario study: retained full desk vs deferred workstation for flex-room use | No irreversible furnishing decision until family program resolved |

## Rules for design or coding agents
1. Every proposed scene declares canonical SHA, parent scene revision, branch/commit, exactly changed objects and `VERIFIED / INFERRED / EXPLORATORY / TBD`.
2. Always preserve historical K4 notes as history. **Don't reinterpret an old `LOCKED-DIRECTION` as user approval over later documented experiments**, and don't silently rewrite old files to make them agree.
3. Geometry validation, source correspondence, exact matched-camera visual check, occupied-family tasks and MEP feasibility are **separate gates**.
4. Minimum work quality: list advantages AND measurable costs, explicitly reject weak variations, never overwrite saved Studio or `master` merely because CI passed.
5. Before issuing any builder's drawing, resolve site survey and hard infrastructure approvals: [MEP/As-built issue #19](https://github.com/Mostafatalaat770/flat-designer/issues/19).

## Live coordination
- [Orchestration issue #11](https://github.com/Mostafatalaat770/flat-designer/issues/11)
- [Daily-use kitchen and storage issue #15](https://github.com/Mostafatalaat770/flat-designer/issues/15)
- [A8 private wet rooms PR #16](https://github.com/Mostafatalaat770/flat-designer/pull/16)
- [A9 wardrobe mechanism PR #17](https://github.com/Mostafatalaat770/flat-designer/pull/17)
- [A10 bedroom flex PR #18](https://github.com/Mostafatalaat770/flat-designer/pull/18)

This file itself is an **advisor-branch operational reference**, not a replacement for canonical source or an automatic merge decision. Check each PR and live saved revision before acting in a later session.
