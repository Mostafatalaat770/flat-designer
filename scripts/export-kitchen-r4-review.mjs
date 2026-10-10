import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { SOURCE, CANDIDATE, sha256, verifyR4Candidate } from './kitchen-r4-candidate.mjs';

const out = process.env.RENDER_OUT_DIR || 'renders/kitchen-r4';
const read = file => JSON.parse(fs.readFileSync(file));
const manifest = read(path.join(out, 'VERIFIED_MANIFEST.json'));
assert.equal(manifest.status, 'ALL_16_FRAMES_VERIFIED');
verifyR4Candidate(process.cwd(), read(CANDIDATE));
const qaFile = 'design-development/kitchen-finish-r4/DESIGN_QA.json';
const qa = read(qaFile);
assert.equal(qa.status, 'VISUALLY_INSPECTED');
assert.deepEqual([...qa.inspected_views].sort(), manifest.pairs.map(x => x.view_id).sort());
const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const esc = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const data = (file, mime) => `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
const download = (file, label, mime = 'application/json') => `<a class="download" download="${esc(path.basename(file))}" href="${data(file, mime)}">${esc(label)}</a>`;
const frames = new Map(manifest.frames.map(f => [f.image, f]));
const labels = {
  'kitchen-work':'المطبخ · واجهات التشغيل', 'kitchen-relationship':'المطبخ من الريسبشن · الفاصل الأصلي',
  'entry-overview':'الدخول', 'living-to-dining':'من المعيشة للسفرة',
  'dining-to-living':'من السفرة للمعيشة', 'wide-reception':'الريسبشن · نهار',
  'wide-reception-evening':'الريسبشن · مساء', 'seated-tv':'المعيشة · عين الجالس',
};
function comparison(id, expanded = true) {
  const pair = manifest.pairs.find(p => p.view_id === id);
  assert.ok(pair);
  const cards = [['قبل · A/P0', pair.before], ['بعد · R4 عاجي', pair.after]].map(([label, file]) => {
    const frame = frames.get(file);
    const abs = path.join(out, file);
    assert.equal(sha256(fs.readFileSync(abs)), frame.image_sha256);
    return `<figure><div class="image-label">${label}</div><a href="${data(abs, 'image/png')}" download="${esc(file.replace('/', '-'))}"><img width="1280" height="720" src="${data(abs, 'image/png')}" alt="${esc(labels[id] + ' — ' + label)}" data-image-path="${esc(file)}" data-sha256="${frame.image_sha256}"></a><figcaption><span dir="ltr">${esc(frame.scene_revision)} · 1280 × 720</span><small dir="ltr">PNG SHA256 ${frame.image_sha256}</small></figcaption></figure>`;
  }).join('');
  const content = `<div class="pair">${cards}</div><p class="caption">${esc(qa.view_notes[id])} <span class="subtle">اختلاف بكسلات أكبر من درجتين: ${pair.changed_percent}% · نفس الكاميرا والإضاءة وحالة الأبواب.</span></p>`;
  return expanded ? `<article class="comparison"><h3>${esc(labels[id])}</h3>${content}</article>` : `<details class="comparison"><summary>${esc(labels[id])}<span>افتح المقارنة</span></summary>${content}</details>`;
}
const palette = [
  ['#E8E2D7','Soft ivory','واجهات R4 + خامة الوحدات العلوية والثلاجة الأصلية','kitchen-soft-ivory · GENERIC'],
  ['#BCA98F','Muted light oak','الـlanding الصغير محفوظ كلمسة دفء','kitchen-muted-light-oak · GENERIC'],
  ['#E5DED1','Warm quartz look','الـbacksplash الأصلي محفوظ','kitchen-warm-quartz · GENERIC'],
  ['#DCD3C5','Quiet warm stone','الأرضية الأصلية محفوظة','S1-stone · GENERIC'],
  ['#DCD7CF','Countertop proxy','لون hardcoded في الـrenderer','RENDERER PROXY · مش خامة مختارة'],
];
const itemList = values => `<ul>${values.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
const logDir = 'work/kitchen-r4';
// Do not label an exported review locally green unless each required execution
// log contains its success result. Failed first attempts are preserved separately.
const logChecks = [
  [fs.existsSync(path.join(logDir,'npm-ci-retry.log')) ? 'npm-ci-retry.log' : 'npm-ci.log', /added \d+ packages/],
  ['build.log', /Isolated headless template built/],
  ['check.log', /"result":"PASS"/], ['check-studio.log', /fail 0/],
  ['baseline-tests.log', /fail 0/], ['candidate-tests.log', /fail 0/],
  ['verify-r4.log', /Kitchen finish R4 source-safe/], ['verify-r3.log', /"owner_approvals":0/],
  ['full-render.log', /BATCH VERIFIED 16 images/],
  ['render-verification.log', /ALL_16_FRAMES_VERIFIED/], ['render-tests.log', /fail 0/],
];
for (const [file, success] of logChecks) assert.match(fs.readFileSync(path.join(logDir,file),'utf8'),success,`Required local check did not pass: ${file}`);
const additional = [];
for (const [file, success, command] of [
  ['browser-review.log', /Offline browser PASS/, 'node scripts/verify-kitchen-r4-review-browser.mjs'],
  ['owner-integrity-gate.log', /Owner workflow complete local integrity gate PASS/, 'Full existing owner workflow builders and inline integrity gate'],
]) if (fs.existsSync(path.join(logDir,file))) {
  assert.match(fs.readFileSync(path.join(logDir,file),'utf8'), success);
  additional.push(command);
}
const logs = fs.existsSync(logDir) ? fs.readdirSync(logDir).filter(x => /\.log$/.test(x)).sort() : [];
const validation = {
  schema:'TypeBKitchenR4Delivery/1', source_commit:commit,
  render_status:manifest.status, scene_revision:manifest.candidate_audit.candidate_scene_revision,
  local_checks: ['npm ci','npm run build','npm run check','npm run check:studio',
    'node --test studio/local/current-baseline.test.mjs studio/local/owner-decisions.test.mjs studio/analysis/reception-sprint.test.mjs',
    'node scripts/verify-kitchen-finish-r4.mjs','node scripts/verify-p0-joinery-r3.mjs',
    'node --test scripts/kitchen-r4-candidate.test.mjs scripts/render-batch-plan.test.mjs',
    'node scripts/verify-kitchen-r4-renders.mjs','node --test scripts/kitchen-r4-render-verification.test.mjs'],
  local_status:'PASS', additional_local_checks:additional, ci:qa.ci,
  logs: logs.map(file => ({ file, sha256:sha256(fs.readFileSync(path.join(logDir,file))) })),
  construction_approved:false, owner_approved:false, cloud_saved:false, manufacturer_selected:false,
};
fs.mkdirSync(path.join(out,'sources'),{recursive:true});
fs.mkdirSync(path.join(out,'evidence'),{recursive:true});
for (const file of [SOURCE,CANDIDATE,qaFile,'design-development/kitchen-finish-r4/CANDIDATE_AUDIT.json',
  'design-development/release-r1/KITCHEN_FINISH_R4_PATCH.json','design-development/decision-registry.json'])
  fs.copyFileSync(file,path.join(out,'sources',path.basename(file)));
const canonical='dist/sources/Apartment_Master_Spec_Type_B_v0.2.2_Geometry_Heights_Glazing(1).json';
fs.copyFileSync(canonical,path.join(out,'sources','Canonical-TypeB-v0.2.2.json'));
for (const file of logs) fs.copyFileSync(path.join(logDir,file),path.join(out,'evidence',file));
for (const file of ['ci-annotations.json','ci-jobs.json','latest-ci.json','browser-review-results.json']) {
  if(fs.existsSync(path.join(logDir,file))) fs.copyFileSync(path.join(logDir,file),path.join(out,'evidence',file));
}
fs.writeFileSync(path.join(out,'DELIVERY.json'),JSON.stringify(validation,null,2)+'\n');
const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Type B · Kitchen R4 · مراجعة قبل وبعد</title><style>
:root{--paper:#f4f0e8;--ink:#2d332d;--muted:#676e64;--line:#d8d2c6;--card:#fffcf6;--accent:#52634f}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:17px/1.75 Tahoma,Arial,sans-serif}main{max-width:1440px;margin:auto;padding:48px 5vw 70px}header{padding:20px 0 42px;border-bottom:1px solid var(--line)}.eyebrow{font:13px/1.5 Arial,sans-serif;letter-spacing:2px;color:var(--muted)}h1{font-size:clamp(32px,4vw,58px);font-weight:500;line-height:1.3;margin:20px 0}h2{font-weight:500;font-size:30px;margin:0 0 20px}h3{font-weight:500;margin:20px 0 12px}.lead{max-width:920px;font-size:21px}.badge{display:inline-block;padding:5px 13px;border:1px solid #89977e;border-radius:20px;font-size:13px}.summary{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin:30px 0}.summary strong{display:block;font:32px Arial,sans-serif}.summary p{margin:0;color:var(--muted);font-size:14px}section{padding:42px 0;border-bottom:1px solid var(--line)}.section-index{font:13px Arial,sans-serif;letter-spacing:2px;color:var(--muted);margin-bottom:12px}.pair{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;direction:ltr}figure{margin:0;background:var(--card);border:1px solid var(--line);min-width:0}.image-label{padding:10px 16px;font-size:14px;font-weight:bold;text-align:right}img{display:block;width:100%;height:auto}figcaption{padding:9px 13px;font:12px/1.7 Arial,sans-serif;text-align:left}figcaption small{display:block;color:var(--muted);font-size:9px;overflow-wrap:anywhere}.caption{font-size:15px;color:var(--muted);margin-top:12px}.subtle{display:block;font-size:12px;margin-top:6px}.comparison{margin:20px 0 28px}summary{cursor:pointer;font-size:19px;padding:16px 0;border-bottom:1px solid var(--line)}summary span{float:left;font-size:12px;color:var(--muted)}details[open] summary{margin-bottom:16px}.columns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:38px}.palette{display:grid;grid-template-columns:repeat(5,1fr);gap:14px}.swatch{height:70px;border:1px solid var(--line)}.palette article{font-size:13px}.palette b{display:block;margin:10px 0 4px;font:16px Arial,sans-serif}.palette small{display:block;color:var(--muted);overflow-wrap:anywhere}li{margin-bottom:9px}ul{padding-inline-start:22px}.note{background:#e9e5d8;padding:22px;border-inline-start:3px solid #859178}.proof{font-size:14px}.proof code{display:block;direction:ltr;text-align:left;overflow-wrap:anywhere;font:12px/1.8 monospace;padding:9px 0}a{color:var(--accent)}.download{display:inline-block;padding:8px 12px;margin:5px;border:1px solid var(--line);text-decoration:none;font-size:13px;border-radius:4px}footer{padding-top:24px;font-size:13px;color:var(--muted)}@media(max-width:720px){main{padding:28px 18px}.pair,.columns{grid-template-columns:1fr}.palette{grid-template-columns:repeat(2,1fr)}.summary{gap:12px}.summary strong{font-size:25px}h2{font-size:25px}.lead{font-size:18px}section{padding:30px 0}}@media print{body{background:white}main{padding:0}details{break-inside:avoid}details::details-content{content-visibility:visible}.download{display:none}figure{break-inside:avoid}h2,h3{break-after:avoid}}
</style></head><body><main><header><div class="eyebrow" dir="ltr">TYPE B APARTMENT / OPTION A · P0 / KITCHEN R4</div><h1>نفس المطبخ.<br>واجهات أهدى وأقرب لبعض.</h1><p class="lead">${esc(qa.verdict)}</p><span class="badge">RENDER ONLY · DESIGN EXPLORATORY · غير معتمد للتنفيذ</span><div class="summary"><div><strong>16</strong><p>صورة WebGL جديدة ومتطابقة الكاميرات</p></div><div><strong>4</strong><p>قطع موجودة اتغير تشطيبها فقط</p></div><div><strong>0</strong><p>تغيير في الـgeometry أو موافقات التنفيذ</p></div></div></header>
<section><div class="section-index">01 / BEFORE & AFTER</div><h2>الفرق في المطبخ الحقيقي</h2><p>BEFORE من A/P0 الأصلي، وAFTER من R4 المنفصل. الاتنين اتولدوا من الـproduction WebGL renderer في الجلسة دي، بنفس الكاميرا وحالة الإضاءة والأبواب. اضغط على أي صورة لتنزيل الـPNG الأصلي.</p>${comparison('kitchen-work')}${comparison('kitchen-relationship')}</section>
<section><div class="section-index">02 / WHOLE APARTMENT</div><h2>التغيير جوّه سياق الشقة</h2><p>اللّقطات الواسعة بتختبر الترابط، حتى لما الفاصل الأصلي يخفي الواجهات. نسبة اختلاف صغيرة أو صفر في لقطة بعيدة نتيجة متوقعة لتعديل محدود.</p>${['entry-overview','living-to-dining','dining-to-living','wide-reception','wide-reception-evening','seated-tv'].map(id=>comparison(id,false)).join('')}</section>
<section><div class="section-index">03 / FINISHES</div><h2>عاجي دافي · خشب محدود · أرضية هادية</h2><div class="palette">${palette.map(([color,name,note,status])=>`<article><div class="swatch" style="background:${color}"></div><b>${name} ${color}</b><p>${esc(note)}</p><small>${esc(status)}</small></article>`).join('')}</div><p class="caption">ألوان وخامات generic/proxy للمراجعة البصرية. مفيش manufacturer product مختار، ولا عينة ملموسة معتمدة. اختلاف الإضاءة والـroughness يخلي نفس كود اللون يبان بدرجات مختلفة.</p><div class="columns"><article><h3>إيه اتغير؟</h3><p><span dir="ltr">starter-20 · K3-corner · K3-sink-base</span>: لون الواجهات بقى <span dir="ltr">#E8E2D7</span>. الـ<span dir="ltr">K3-dishwasher</span> اتغير له اللون و<span dir="ltr">material_id</span> معًا. ألوان الأربع قطع في <span dir="ltr">saved warm theme</span> اتزامنت، واختبار الرجوع للـtheme نجح.</p></article><article><h3>إيه اتثبت؟</h3><p>الـlayout، المقاسات والمناسيب والدوران، 2500mm ceiling، full-height living glazing، wall 44، الباب الأصلي والفتحات والخدمات، الأجهزة والحوض والأسطح والأرضية، الإضاءة، الكاميرات، ومراجع خامات الوحدات العلوية والثلاجة. الـoak landing الصغير فضل زي الأصل.</p></article></div></section>
<section><div class="section-index">04 / DESIGN CRITIQUE</div><h2>حكم التصميم من الصور</h2><div class="columns"><article><h3>اللي اتحسن</h3>${itemList(qa.improvements)}</article><article><h3>اللي لسه محتاج شغل</h3>${itemList(qa.remaining_weaknesses)}</article></div><div class="note"><b>حدود الرندر</b>${itemList(qa.renderer_limitations)}</div></section>
<section><div class="section-index">05 / FAMILY USE & HOLDS</div><h2>شكله أهدى؛ الاستخدام لسه محتاج إثبات</h2><p>الصور تعرض الأجهزة مقفولة ومساحة concept. المقاس الاسمي <span dir="ltr">600 × 610mm</span> للـdishwasher مش ضمان clear installation cavity. تقسيم سطح رنّ الطبخ <span dir="ltr">307 / 600 / 593mm</span> مش فتحات أدراج جاهزة، ومفيش درج جديد اتضاف.</p>${itemList(qa.holds)}<div class="note"><b>الخطوة الجاية الأعلى قيمة</b><p>${esc(qa.next_decision)}</p></div></section>
<section class="proof"><div class="section-index">06 / VERIFIED EVIDENCE</div><h2>الأصل محفوظ، والنتيجة قابلة للتتبع</h2><p>المقارنة recursive شملت كل حقول الـlayout وكل الكاميرات: 9 حقول تشطيب فقط اتغيرت. الـdomain validation صالح ومعاه نفس 77 تحذير من الأصل، و0 failures. دي تحذيرات model/site قائمة؛ مش موافقة هندسية.</p><p>Local PASS: install، build، check، check:studio، baseline، R3/R4 verifiers، exact-diff + theme regression، ثم matched PNG/metadata checks. الـWebGL context اتفحص؛ مفيش page/console/shader errors أو asset fallbacks في الالتقاط النهائي.</p><p><b>GitHub Actions:</b> ${esc(qa.ci.explanation_ar)}. Local PASS منفصل عن Cloud CI؛ مفيش CI PASS مُدّعى.</p><code>Source commit: ${commit}<br>Canonical Type B v0.2.2 SHA256: ${manifest.canonical_sha256}<br>A/P0 original SHA256: ${manifest.original_source_sha256}<br>BEFORE: scene-9e86635b · cloud origin scene-4821689 · v55<br>AFTER: ${manifest.candidate_audit.candidate_scene_revision}<br>Candidate SHA256: ${sha256(fs.readFileSync(CANDIDATE))}</code><div>${download(SOURCE,'الأصل A/P0')}${download(CANDIDATE,'R4 candidate')}${download(path.join(out,'VERIFIED_MANIFEST.json'),'SHA + camera manifest')}${download(path.join(out,'DELIVERY.json'),'الاختبارات وبيانات التسليم')}</div><details><summary>سجل أوامر الاختبارات والالتقاط</summary><p>السجل بيحتفظ بمحاولة npm الأولى الفاشلة بسبب cache، ومحاولة capture التي كشفت SVG NaN، والنتائج النهائية بعد الإصلاح.</p>${logs.map(f=>download(path.join(logDir,f),f,'text/plain')).join('')}</details></section>
<footer>Owner approval: FALSE · Construction: FALSE · Cloud saved: FALSE · Manufacturer selected: FALSE<br>مراجعة تصميم قابلة للرجوع؛ مفيش شراء أو تصنيع أو تعديلات gas/plumbing/electrical أو نشر production site.</footer></main></body></html>`;
fs.writeFileSync(path.join(out,'Review.html'),html);
// Original image and source bytes are copied unchanged. No transformed image is
// substituted for a render. The HTML embeds the same verified PNG byte streams.
const files = [];
function walk(dir) { for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
  const file=path.join(dir,entry.name); if(entry.isDirectory())walk(file);
  else if(!entry.name.endsWith('.zip') && entry.name !== 'MANIFEST.sha256') files.push(file);
}}
walk(out);
fs.writeFileSync(path.join(out,'MANIFEST.sha256'),files.sort().map(f=>`${sha256(fs.readFileSync(f))}  ${path.relative(out,f)}`).join('\n')+'\n');
const zipScript = 'import pathlib,sys,zipfile\np=pathlib.Path(sys.argv[1])\nwith zipfile.ZipFile(p/"Kitchen-R4-Review.zip","w",zipfile.ZIP_DEFLATED) as z:\n for f in sorted(p.rglob("*")):\n  if f.is_file() and f.suffix!=".zip": z.write(f,f.relative_to(p))\n';
execFileSync('python3',['-c',zipScript,out]);
console.log(`Offline review and ZIP exported from ${commit}: ${out}/Review.html`);
