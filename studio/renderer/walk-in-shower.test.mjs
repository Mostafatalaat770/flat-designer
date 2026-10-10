import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const root = new URL("../../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("shower supports old enclosed style and opt-in walk-in variant", () => {
  const core = read("studio-core.js");
  const variants = runInNewContext(core + "\nSTUDIO_VARIANTS.shower");
  assert.deepEqual(Array.from(variants), ["style", "walk-in"]);
});

test("both render pipelines draw no prefab cage for opt-in walk-in", () => {
  const hosted = read("studio-scene.js");
  const local = read("studio/renderer/builders.js");
  assert.match(hosted, /f\.type==='shower'&&f\.variant==='walk-in'/);
  assert.match(local, /f\.type === "shower" && f\.variant === "walk-in"/);
  // A non-glass wet-floor patch: leave the one fixed screen to a separately
  // validated reversible interior object. This is not a waterproofing signoff.
  assert.match(hosted, /True open wet area: no default glass cage/);
  assert.match(local, /no default glass cage|not a second glass enclosure/i);
});

test("unchanged old shower remains an explicit fallback", () => {
  assert.match(read("studio/renderer/builders.js"), /case "shower"/);
  assert.match(read("studio-core.js"), /shower:\['style','walk-in'\]/);
});


test("opt-in minimal glass preserves legacy and walk-in modes across both pipelines", () => {
  const core = read("studio-core.js");
  const variants = runInNewContext(core + "\nSTUDIO_VARIANTS.shower");
  assert.deepEqual(Array.from(variants), ["style", "walk-in", "minimal-glass"]);
  const hosted = read("studio-scene.js"), local = read("studio/renderer/builders.js");
  assert.match(hosted, /f\.type==='shower'&&f\.variant==='minimal-glass'/);
  assert.match(local, /f\.type === "shower" && f\.variant === "minimal-glass"/);
  for (const render of [hosted,local]) {
    assert.match(render, /EXPOSED/);
    assert.match(render, /real_hinge_and_swing/);
    assert.match(render, /west_glass_door_mm/);
    assert.match(render, /door_closed:\s*true/);
    assert.match(render, /nominal_tray_mm:\s*22/);
    assert.match(render, /glass_height_mm:\s*1980/);
    assert.match(render, /CONCEPT_NOT_CERTIFIED/);
    assert.match(render, /door.*hinge/i);
  }
});
