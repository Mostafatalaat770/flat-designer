# A10 — Bedroom 2 Visual Verdict (8 October 2026)

**Outcome:** **CONDITIONAL KEEP flexible / deferred-workstation mode** when Bedroom 2 has no named daily work/study occupant yet. **Retain K12 1000mm desk as fallback** if someone regularly studies/works there. **Reject 900mm desk compromise** and decline to promote blind 90mm west shift without sit/door test. This is a purchasing/furnishing recommendation, not an architectural change.

## Evidence

- GitHub Actions [run 37759802298](https://github.com/Mostafatalaat770/flat-designer/actions/runs/37759802298): both geometry and matched-camera visual jobs succeeded.
- Eight original PNG files, four variants × two cameras, plus eight frame-metadata records and four manifests; artifact **11542895915** (6,154,229 compressed bytes). Source scene `scene-e2fcb932` for control, same canonical `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`; all architecture and furnishing outside workstation unchanged.
- The actual 42° 1.7m human-scale views show a largely identical compact desk corner in the three desk options; shifting 90mm is hard to appreciate visually, and they all put a chair right against the bed-side zone. No-desk option genuinely clears the visual floor and eases furniture density; **not** proof of door/bed clearances under occupancy.

| Variant | Desk | Nominal gap from CLOSED chair to bed (not person route) | Cost and judgement |
|---|---|---:|---|
| K12 control | 1000×600mm | 350mm | Retain if daily use requires workstation, but human movement needs test |
| Desk shift west 90mm | 1000×600mm | 440mm | 90mm closed-footprint gain leaves only ~85mm conceptual distance from desk to west wall; no demonstrated all-day ergonomic benefit |
| Desk reduced and shifted | 900×600mm | 470mm | Sacrifices 10% desk width for only 30mm over shifted full-size version; reject absent actual need |
| No initial desk/chair | Bed 1280×2100 + 1600 wardrobe | Desk and chair removed from initial furnishing; ~0.914m² total furniture footprint not occupied | Better guest/child future flexibility if daily workstation not needed |

## What this means in household decisions

1. **If the room is to be a daily home office or study room, buy a real appropriately sized chair/desk; don't shrink by 100mm just to obtain a cosmetic integer clearance.** Verify chair pullout with person seated and the real original entry-door swing.
2. **If future bedroom / occasional guests, postpone the desk and task chair purchase** but rough-in sockets/data/task-light wiring at both plausible future locations now; maintain adaptable wardrobe internal shelves and bed access.
3. Existing 1600mm wardrobe and 1280mm bed are untouched in every option. Exact front hardware/hinge and door use remain to be proven.
4. Do not force a final occupant-use decision or delete the workstation from saved Studio; choose once the family knows how the bedroom will be used.

## Visual QA process lesson

A10 previously rendered four variants via four separate headless-Chromium launches. This is a **candidate for shared multi-variant render orchestration** with one browser process, strict same-camera/canonical validation and consolidated manifest. Future work should implement and measure performance honestly rather than assuming browser startup dominates WebGL.

**Do not merge a selected bedroom furniture variant into production cloud or `master` without explicit review of actual room use and exact furniture sizes.**
