import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {prepareStudy} from './study.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
try {
  if(process.argv.length!==3)throw new Error('Usage: npm run study -- local-qa/studies/family-a7.json');
  const spec=JSON.parse(fs.readFileSync(path.resolve(process.cwd(),process.argv[2]),'utf8'));
  console.log(JSON.stringify(prepareStudy(root,spec),null,2));
} catch(error) {
  console.error(error.message);
  if(error.validation)console.error(JSON.stringify(error.validation.summary));
  process.exitCode=1;
}
