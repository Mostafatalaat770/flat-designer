import fs from 'node:fs';
import path from 'node:path';
import { createWorkspaceSeed } from './workspace-seed.mjs';
const root = path.resolve(import.meta.dirname, '../..');
const prepared = createWorkspaceSeed(root);
const output = path.join(root, 'studio/app/data');
fs.mkdirSync(output, { recursive: true });
for (const [file, value] of [
  ['workspace-seed.json', prepared.brief],
  ['workspace-cameras.json', prepared.cameras],
  ['workspace-config.json', prepared.config],
]) fs.writeFileSync(path.join(output, file), JSON.stringify(value, null, 2) + '\n');
console.log(`Workspace: ${prepared.config.name} · ${prepared.brief.scene_revision} · source revision ${prepared.config.storage_revision}; ${prepared.cameras.length} Natural42 / 1.70 m views across ${new Set(prepared.cameras.map(c => c.room_id)).size} areas. A.7 retained.`);
