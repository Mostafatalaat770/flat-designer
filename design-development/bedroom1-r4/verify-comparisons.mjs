import fs from 'node:fs';
import assert from 'node:assert/strict';
import {source,domain,route} from '../circulation-v55/route-library.mjs';
const comparisons=JSON.parse(fs.readFileSync(new URL('./comparisons.json',import.meta.url),'utf8'));
assert.equal(comparisons.source_scene,source.scene_revision);
assert.equal(comparisons.canonical_sha256,source.canonical_sha256);
let checks=0;
for(const trial of comparisons.trials){
 const layout=domain.applyProposal(source.layout,trial.proposal);
 assert.equal(domain.revision(layout),trial.scene_revision,trial.id+' scene');
 assert.deepEqual(domain.validate(layout).summary,trial.validation_summary,trial.id+' validation');
 for(const saved of trial.cases){
  const actual=route(saved,layout,saved.grid_mm);
  assert.equal(actual.route_found_500mm,saved.route_found_500mm,trial.id+' / '+saved.id+' / '+saved.grid_mm);
  assert.equal(actual.conservative_sampled_diameter_mm,saved.conservative_sampled_diameter_mm,trial.id+' sampled width');
  checks++;
 }
}
console.log(JSON.stringify({trial_proposals:comparisons.trials.length,reproduced_route_checks:checks,preferred_scene:'scene-a5c839c1'}));
