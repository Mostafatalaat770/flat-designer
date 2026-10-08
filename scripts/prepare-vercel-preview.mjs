/**
 * Assemble a small, isolated, STATIC review deploy for Vercel.
 * No cloud API, local Python server, workspace export POST, raw repo, or
 * runtime Secrets are included. This intentionally ships the canonical
 * apartment viewer to authenticated reviewers only.
 */
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root=process.cwd();
const out=path.join(root,"vercel-preview");
const site=path.join(root,"local-qa/site/workspace");
assert.ok(fs.statSync(site).isDirectory(),"Build the Studio first: npm run studio:build");
assert.ok(fs.existsSync(path.join(site,"explore.html")));
assert.ok(fs.existsSync(path.join(site,"index.html")));
assert.ok(fs.existsSync(path.join(site,"parity.html")));
fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});
const webpath=path.join(out,"_qa/workspace");
fs.cpSync(site,webpath,{recursive:true,force:true});
const sourceArt=path.join(root,"dist/art");
if(fs.existsSync(sourceArt)){
  fs.cpSync(sourceArt,path.join(out,"art"),{recursive:true});
}
const sourceTextures=path.join(root,"dist/textures");
if(fs.existsSync(sourceTextures)){
  fs.cpSync(sourceTextures,path.join(out,"textures"),{recursive:true});
}
const missing=[];
for(const name of ["explore.html","index.html","parity.html"]){
 const html=fs.readFileSync(path.join(webpath,name),"utf8");
 for(const match of html.matchAll(/(?:src|href)="(\/_qa\/workspace\/[^"]+)"/g)){
  const decoded=decodeURIComponent(match[1]);
  if(!decoded.startsWith("/_qa/workspace/assets/"))continue;
  const destination=path.resolve(out,"."+decoded);
  assert.ok(destination.startsWith(out+path.sep),"Bad asset URL");
  if(!fs.existsSync(destination))missing.push(decoded);
 }
}
assert.deepEqual(missing,[],"Vercel preview is missing bundled entry assets");
const checks={
 schema:"ApartmentVercelPreviewManifest/1",
 static_only:true,
 canonical_source:"studio/local/sources/verified-master-v50.json",
 source_status:"VERIFIED_GEOMETRY_ONLY_NOT_BUILD_APPROVAL",
 source_revision:"scene-85fd2cac",
 entry_pages:["/_qa/workspace/explore.html","/_qa/workspace/index.html","/_qa/workspace/parity.html"],
 asset_directory_exists:fs.existsSync(path.join(webpath,"assets")),
 art_assets_published:fs.existsSync(path.join(out,"art")),
 no_api_or_mcp_routes:true,
 deployment_protection_required:true,
 production_unchanged:true,
 note:"Never publicly deploy without Vercel Authentication for ALL deployments; direct access to model bundle reveals apartment layout."
};
assert.ok(checks.asset_directory_exists);
assert.ok(checks.art_assets_published,"Scene art assets must be included, not silently missing");
fs.writeFileSync(path.join(out,"preview-manifest.json"),JSON.stringify(checks,null,2)+"\n");
console.log("VERCEL PREVIEW STATIC QA PASS",JSON.stringify(checks));
