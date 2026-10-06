import fs from 'node:fs';
import path from 'node:path';
import { createWorkspaceSeed } from './workspace-seed.mjs';
import { createApartmentDomain } from '../domain/apartment.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const {brief, cameras, config} = createWorkspaceSeed(root);
const validation = createApartmentDomain(root).validate(brief.layout);
const site = path.join(root, 'local-qa/site');
fs.mkdirSync(path.join(site, 'integration-views'), {recursive: true});
const manifestPath = path.join(root, 'local-qa/reports/integration-captures.json');
const captures = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath)) : [];
const observations = {
  'synced-reception-entry': 'The centre remains breathable. Dining is prominent from entry; the dark sideboard has more visual weight than the intended quiet family palette. Keep the layout baseline; investigate its finish next.',
  'synced-reception-living': 'The sofa/TV relationship is legible, but this camera faces the glazing and crops the seat. Additional reverse living views are needed before judging sofa capacity. Detailed upholstery and curtain transmission remain exploratory.',
  'synced-reception-dining': 'The same dining grouping reads consistently from a second angle. Light chairs are preferable to adding another lounge group. The pendant, artwork and sideboard compete; simplify their hierarchy before adding accessories.',
  'synced-kitchen-work-run': 'Gas hob and indoor washer are visible. A clear preparation surface and realistic cabinet/appliance fronts remain unresolved. Countertop canisters are close to the hob; review appliance-specific landings and door-use envelopes before procurement.',
  'synced-guest-wc-use-closed': 'The retained closed-door camera reveals the compact vanity and WC. Generic bowl, mirror and accessory meshes obscure usable surface. Do not infer handwashing comfort or door clearance from this image alone.',
  'synced-master-ensuite': 'Fixture proportions and finishes remain generic; the mirror does not reflect. Shower, storage and standing-use views are still required for complete bathroom planning.',
};
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cards = captures.map(({id, path: source}) => {
  const camera = cameras.find(c => c.id === id);
  if (!camera || !fs.existsSync(source)) throw Error('Capture or camera missing: ' + id);
  const filename = id + '.png';
  fs.copyFileSync(source, path.join(site, 'integration-views', filename));
  return `<article><a href="integration-views/${filename}"><img src="integration-views/${filename}" alt="${escape(camera.label)}"></a><h2>${escape(camera.label)}</h2><p>${escape(observations[id] || 'Calibrated local view; further spatial review required.')}</p><a href="workspace/parity.html?source=synced&amp;view=${id}">Open live view</a></article>`;
}).join('');
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Apartment Type B — integration review</title><style>body{margin:0;background:#f5f3ed;color:#303729;font:16px/1.55 system-ui}main{max-width:1400px;margin:auto;padding:40px 24px}h1{font:42px Georgia}h2{font:24px Georgia}a{color:#46563d}nav{display:flex;gap:24px;flex-wrap:wrap;margin:24px 0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(430px,1fr));gap:24px}article{background:#fff;padding:20px;border:1px solid #dfded5;border-radius:8px}img{width:100%;height:auto}code{overflow-wrap:anywhere}.note{padding:20px;background:#e9edde}@media(max-width:500px){.grid{grid-template-columns:1fr}h1{font-size:32px}}</style><main><p>Apartment Type B · isolated local review · 6 October 2026</p><h1>${escape(config.name)}</h1><p>Local seed <code>${config.scene_revision}</code>, source storage revision ${config.storage_revision}. ${cameras.length} calibrated views cover all 13 canonical areas. Architecture remains locked. Source branch camera presentations, including open/closed guest-WC doors, are retained.</p><nav><a href="workspace/">Open local Studio</a><a href="chatgpt-image-pack/index.html">Historical A.7 image prompt pack</a></nav><p class="note"><strong>VERIFIED:</strong> exact pinned layout, canonical hash, Natural 42° lens and 1.70 m eye. Validation: ${validation.checks.filter(c=>c.status==='PASS').length} PASS / ${validation.checks.filter(c=>c.status==='WARNING').length} WARNING / ${validation.checks.filter(c=>c.status==='FAIL').length} FAIL. Production routes are disconnected. <strong>EXPLORATORY:</strong> generic furniture, finish appearance and lighting. These are geometry-based browser views, not finished photorealistic images.</p><p>A.7 <code>scene-9e210720</code> and earlier studies are preserved separately. Its historical image pack does not depict this revision 39 layout. Concealed HVAC in the 130 mm void remains TBD.</p><div class="grid">${cards || '<p>Run the recorded synced-view flow and supply local-qa/reports/integration-captures.json with {id,path} entries to publish inspected PNGs here. Live room views remain available in the Studio.</p>'}</div><p>Next controlled design pass: improve reception storage/lighting hierarchy, verify comfortable family seating, establish usable kitchen preparation and appliance access, and replace key bathroom and furniture placeholders with licensed, dimension-matching models. This integration makes no furniture or architectural changes.</p><p>Canonical SHA-256: <code>${brief.canonical_sha256}</code></p></main></html>`;
fs.writeFileSync(path.join(site, 'integration-review.html'), html);
fs.writeFileSync(path.join(site, 'index.html'), '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=/_qa/integration-review.html"><a href="/_qa/integration-review.html">Open Apartment Type B review</a>');
console.log(`Integration review: ${config.scene_revision}, ${captures.length} local screenshots.`);
