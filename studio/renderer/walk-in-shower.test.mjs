import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const root = new URL("../../", import.meta.url);
const read = (path) => readFileSync(new URL(path, root), "utf8");

test("shower supports old enclosed style and opt-in walk-in variant", () => {
  const core = read("studio-core.js");
  const variants = runInNewContext(core + "\nSTUDIO_VARIANTS.shower");
  assert.deepEqual(Array.from(variants), ["style", "walk-in", "frameless-low-profile"]);
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
  assert.match(read("studio-core.js"), /shower:\['style','walk-in','frameless-low-profile'\]/);
});

test("both renderer paths support the optional frameless low-profile family study",()=>{
 const hosted=read("studio-scene.js"), local=read("studio/renderer/builders.js");
 assert.match(hosted, /f\.variant==='frameless-low-profile'/);
 assert.match(local, /f\.variant === "frameless-low-profile"/);
 assert.match(hosted,/nominal 580mm pivot leaf/);
 assert.match(local,/Pivot leaf and any shower threshold require vendor-specific/);
 assert.match(hosted,/opacity:\.18/);
 assert.match(local,/opacity: 0\.18/);
 // Retain true open wet-area behavior of the separate master walk-in.
 assert.match(hosted,/True open wet area: no default glass cage/);
 assert.match(local,/flush wet area, not a second glass enclosure/);
});
