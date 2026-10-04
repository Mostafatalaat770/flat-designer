"""Package the viewer, durable saved designs and stateless MCP transport."""
from pathlib import Path
import json,shutil,re
ROOT=Path(__file__).resolve().parent
DIST=ROOT/'dist'
CLIENT=DIST/'client'
SERVER=DIST/'server'
shutil.rmtree(CLIENT,ignore_errors=True)
shutil.rmtree(SERVER,ignore_errors=True)
CLIENT.mkdir();SERVER.mkdir()
for p in DIST.iterdir():
    if p.name in {'client','server','.openai','_appgen_meta'}:continue
    if p.is_dir():shutil.copytree(p,CLIENT/p.name)
    else:shutil.copyfile(p,CLIENT/p.name)
model=json.loads((DIST/'apartment-model.json').read_text())
catalog=json.loads((ROOT/'studio-catalog.json').read_text())
library=re.search(r'const LIB = \[(.*?)\n\];',(ROOT/'upstream-index.html').read_text(),re.S).group(1)
types=list(dict.fromkeys(re.findall(r"\['([^']+)'",library)))
materials=json.loads((ROOT/'interior-materials.json').read_text())
bundle='const INTERIOR_MATERIALS='+json.dumps(materials,separators=(',',':'))+';\nconst HOST_MODEL='+json.dumps(model,separators=(',',':'))+';\nconst HOST_CATALOG='+json.dumps(catalog,separators=(',',':'))+';\nconst HOST_FURNITURE_TYPES='+json.dumps(types)+';\nconst HOST_HTML='+json.dumps((DIST/'index.html').read_text())+';\n'
for source in ['studio-core.js','interior-core.js','studio-cloud-core.js','studio-storage.js','scene-view-storage.js','studio-variants.js','capture-camera.js','scene-capture.js','studio-worker.js']:
    bundle+=(ROOT/source).read_text()+'\n'
(SERVER/'index.js').write_text(bundle)
print('Worker and client assets built; MCP /mcp and authenticated saved designs /api/design.')
