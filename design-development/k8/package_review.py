#!/usr/bin/env python3
"""Package inspected K8 frames unchanged into an offline Arabic review gallery."""
import argparse
import hashlib
import html
import json
import shutil
import zipfile
from pathlib import Path

VIEWS = [
    ('J1-dining-kitchen', 'المطبخ والمعيشة', 'السقف المتصل، الجزيرة، وواجهات وحدات المطبخ.'),
    ('J1-living-kitchen', 'من المعيشة للمطبخ', 'اتجاه واجهات الفرن والثلاجة والبانتري ناحية مساحة العمل.'),
    ('J1-kitchen-work', 'منطقة العمل في المطبخ', 'الحوض على الجزيرة ووحدة الطهي على الحائط الغربي.'),
    ('J1-entry-dining', 'الدخول والسفرة', 'علاقة السفرة بالمعيشة والجزيرة.'),
    ('J1-guest-wc', 'حمام الضيوف', 'لقطة من فتحة الباب؛ الحوض ظاهر جزئياً.'),
    ('J1-family-bath', 'حمام الأسرة', 'البانيو في دراسة توزيع الحمامات؛ هذه الزاوية لا تعرض كل التجهيزات.'),
    ('J1-master-ensuite', 'حمام الماستر', 'الدش في دراسة التوزيع؛ الحوض ظاهر جزئياً من فتحة الدخول.'),
    ('J1-service-laundry', 'دراسة ركن الغسيل', 'واجهة الغسالة ناحية مساحة الاستخدام. مكان التراس مشروط بالحماية والصرف والكهرباء.'),
]

STYLE = '''
:root{color-scheme:light;--ink:#272f29;--olive:#566451;--paper:#f5f2ec;--muted:#637065;--line:#dcded5}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:var(--paper);color:var(--ink);font:17px/1.8 Tahoma,Arial,sans-serif}
main{max-width:1220px;margin:auto;padding:36px 24px 64px}header{margin-bottom:25px}h1{font-size:clamp(27px,4vw,45px);line-height:1.4;margin:12px 0}h2{font-size:25px;margin:32px 0 14px}h3{font-size:19px;margin:0 0 7px}p{margin:7px 0}.eyebrow{color:var(--olive);font-weight:bold;font-size:14px}.muted{color:var(--muted)}.tags,.nav{display:flex;gap:10px;flex-wrap:wrap}.tag{font-size:13px;border:1px solid var(--line);border-radius:24px;padding:3px 13px;background:white}.hero{background:white;border:1px solid var(--line);border-radius:18px;overflow:hidden}.hero img{width:100%;display:block}.caption{padding:15px 20px}.compare{position:relative;direction:ltr;aspect-ratio:16/9;overflow:hidden;background:#eee}.compare img{position:absolute;inset:0;width:100%;height:100%;object-fit:contain}.compare .before{clip-path:inset(0 50% 0 0)}.compare .label{position:absolute;top:14px;background:#263127dd;color:white;padding:3px 13px;border-radius:20px;font-size:13px}.label.before-label{left:14px}.label.after-label{right:14px}.compare .divider{position:absolute;top:0;bottom:0;left:50%;width:2px;background:white;box-shadow:0 0 7px #2228}.range{display:flex;align-items:center;gap:15px;padding:12px 20px}input[type=range]{width:100%;accent-color:var(--olive);direction:ltr}.facts{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin:26px 0}.fact{background:#e9eee5;border-radius:14px;padding:20px}.fact p{font-size:15px}.nav{margin:22px 0}.nav a{color:var(--olive);padding:4px 12px;background:white;border:1px solid var(--line);border-radius:8px;text-decoration:none;font-size:14px}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:22px}.card{background:white;border:1px solid var(--line);border-radius:15px;overflow:hidden;scroll-margin-top:18px}.card img{width:100%;display:block;aspect-ratio:16/9;object-fit:contain}.card .caption{font-size:15px}.card a{color:inherit}.note{padding:18px 22px;border-right:4px solid var(--olive);background:#ece8df;border-radius:8px;margin-top:26px;font-size:15px}.footer{font-size:13px;margin-top:24px;color:var(--muted)}a:focus-visible,input:focus-visible{outline:3px solid #768963;outline-offset:4px}
@media(max-width:700px){main{padding:22px 14px}.facts,.grid{grid-template-columns:1fr}h2{font-size:22px}.label{font-size:12px!important}.range{gap:8px}}
@media print{body{background:white}main{padding:0}.nav,.range{display:none}.grid{grid-template-columns:1fr}.card,.fact{break-inside:avoid}.compare .before,.compare .divider,.compare .before-label{display:none}}
'''

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--renders', required=True, type=Path)
    parser.add_argument('--snapshot', required=True, type=Path)
    parser.add_argument('--before', required=True, type=Path)
    parser.add_argument('--review', required=True, type=Path)
    parser.add_argument('--audit', required=True, type=Path)
    parser.add_argument('--output-dir', required=True, type=Path)
    parser.add_argument('--code-sha', required=True)
    parser.add_argument('--render-run', required=True)
    parser.add_argument('--verify-run', required=True)
    args = parser.parse_args()
    snap = json.loads(args.snapshot.read_text())
    manifest = json.loads((args.renders / 'manifest.json').read_text())
    assert manifest['scene_revision'] == snap['scene_revision']
    assert manifest['canonical_sha256'] == snap['canonical_sha256']
    expected_views = {v['id']: v for v in snap['views']}
    assert set(expected_views) == {v[0] for v in VIEWS}
    args.output_dir.mkdir(parents=True, exist_ok=True)
    package = args.output_dir / 'apartment-k8-reviewed'
    assert not package.exists(), 'Use a fresh output directory for an inspected pack'
    image_dir = package / 'images'
    meta_dir = package / 'metadata'
    image_dir.mkdir(parents=True)
    meta_dir.mkdir()
    checksums = {}
    for view_id, title, _ in VIEWS:
        image = args.renders / (view_id + '.png')
        meta_path = args.renders / (view_id + '.json')
        meta = json.loads(meta_path.read_text())
        assert meta['scene_revision'] == snap['scene_revision'], view_id
        assert json.loads(meta['rendered_layout_json']) == snap['layout'], view_id
        assert meta['canonical_sha256'] == snap['canonical_sha256'], view_id
        assert meta['architecture_variant'] == snap['architecture_variant'], view_id
        assert meta['assets'] == {'pending': 0, 'fallbacks': []}, view_id
        for key, value in expected_views[view_id]['camera'].items():
            if key == 'viewer':
                continue
            assert meta['camera'][key] == value, (view_id, key)
        viewer = expected_views[view_id]['camera']['viewer']
        for key, value in viewer.items():
            if key != 'doors':
                assert meta['camera']['viewer'][key] == value, (view_id, key)
        captured_doors = {d['id']: d for d in meta['camera']['viewer']['doors']}
        overridden = {d['id']: d for d in snap['architecture_variant']['door_overrides']}
        for door in viewer['doors']:
            if door['id'] in overridden:
                assert captured_doors[door['id']]['open'] == overridden[door['id']]['force_open']
                assert meta['architecture_result']['door_overrides'] == len(overridden)
            else:
                assert captured_doors[door['id']] == door, (view_id, door['id'])
        assert meta['camera']['viewport'] == {'width': 1280, 'height': 720}
        assert image.read_bytes().startswith(b'\x89PNG\r\n\x1a\n')
        shutil.copy2(image, image_dir / image.name)
        shutil.copy2(meta_path, meta_dir / meta_path.name)
        checksums[view_id] = hashlib.sha256(image.read_bytes()).hexdigest()
    before_meta = json.loads(args.before.with_suffix('.json').read_text())
    after_meta = json.loads((args.renders / 'J1-dining-kitchen.json').read_text())
    assert before_meta['camera'] == after_meta['camera'], 'Before/after must use the identical recorded camera'
    shutil.copy2(args.before, image_dir / 'K7-before.png')
    shutil.copy2(args.renders / 'manifest.json', meta_dir / 'manifest.json')
    shutil.copy2(args.snapshot, meta_dir / 'snapshot.json')
    shutil.copy2(args.audit, meta_dir / 'layout-audit.json')
    shutil.copy2(args.review, package / 'REVIEW.md')
    provenance = {'code_sha': args.code_sha, 'render_run': args.render_run, 'verify_run': args.verify_run,
                  'scene_revision': snap['scene_revision'], 'canonical_sha256': snap['canonical_sha256'],
                  'render_only': True, 'image_sha256': checksums}
    (meta_dir / 'provenance.json').write_text(json.dumps(provenance, indent=2)+'\n')
    cards = ''.join(f'<article class="card" id="{v}"><a href="images/{v}.png"><img src="images/{v}.png" alt="{html.escape(t)}" width="1280" height="720"></a><div class="caption"><h3>{html.escape(t)}</h3><p class="muted">{html.escape(c)}</p></div></article>' for v,t,c in VIEWS)
    nav = ''.join(f'<a href="#{v}">{html.escape(t)}</a>' for v,t,_ in VIEWS)
    gallery = f'''<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>الشقة · مراجعة K8</title><style>{STYLE}</style></head><body><main>
<header><div class="eyebrow">الشقة · ٧ أكتوبر ٢٠٢٦</div><h1>السقف متصل، وواجهات الأجهزة ناحية الاستخدام</h1><p class="muted">مراجعة K8 لدراسة المطبخ المفتوح والمساحات المرتبطة به.</p><div class="tags"><span class="tag">٨ لقطات مراجعة</span><span class="tag">ارتفاع السقف ٢٫٥٠ م</span><span class="tag">زوايا المقارنة محفوظة</span></div></header>
<section class="hero" aria-label="مقارنة قبل وبعد"><div class="compare"><img src="images/J1-dining-kitchen.png" alt="K8 بعد الإصلاح"><img class="before" id="before" src="images/K7-before.png" alt="K7 قبل الإصلاح"><div class="divider" id="divider"></div><span class="label before-label">قبل · K7</span><span class="label after-label">بعد · K8</span></div><div class="range"><label for="comparison">قبل / بعد</label><input id="comparison" type="range" min="0" max="100" value="50" aria-label="اسحب لمقارنة الصورة قبل وبعد"></div><div class="caption"><p>اسحب المؤشر لمقارنة شق السقف والقطعة الخشبية اللي كانت باقية تحت الجزيرة، من نفس زاوية التصوير.</p></div></section>
<div class="facts"><section class="fact"><h3>اللي اتظبط</h3><p>السقف فوق المطبخ والمعيشة بقى متصل، واتشالت بقايا تشطيب الحائط المحذوف في الدراسة. واجهات الفرن والثلاجة والبانتري والغسالة اتوجهت ناحية الاستخدام.</p></section><section class="fact"><h3>الخلوص على النموذج</h3><p>حوالي ١٫٢٢ م قدام الفرن والبانتري لحد الجزيرة، وحوالي ١٫١٥ م قدام الغسالة. المقاسات تقريبية؛ تفاصيل الأجهزة والتركيب لسه محتاجة حسم.</p></section><section class="fact"><h3>اللي لسه محتاج قرار</h3><p>جدوى فتح المطبخ، صرف حوض الجزيرة، التهوية، وتجهيز وحماية ركن الغسيل في التراس. الحمامات لسه ضمن دراسة التوزيع.</p></section></div>
<h2>الصور الثمانية</h2><p class="muted">اضغط على أي صورة لفتحها بالحجم الكامل.</p><nav class="nav" aria-label="اختيار اللقطة">{nav}</nav><div class="grid">{cards}</div>
<aside class="note">دي نسخة للمراجعة. المخطط المرجعي الأصلي محفوظ، والنسخة الأساسية A11.1 مستقلة عن الدراسة دي. إزالة الحوائط وتعديل الفتحات ومكان الغسالة محتاجين حسم إنشائي وخدمات قبل التنفيذ.</aside>
<p class="footer">الصور مباشرة من نموذج الشقة. ملف REVIEW.md فيه سجل المراجعة والملاحظات المتبقية.</p></main>
<script>const range=document.getElementById('comparison'),before=document.getElementById('before'),divider=document.getElementById('divider');function update(){{before.style.clipPath='inset(0 '+(100-range.value)+'% 0 0)';divider.style.left=range.value+'%';}}range.addEventListener('input',update);update();</script></body></html>'''
    (package / 'index.html').write_text(gallery)
    (package / 'README.txt').write_text('مراجعة الشقة K8\n\nفك ضغط الملف وافتح index.html لعرض الصور ومقارنة قبل وبعد.\nالصور الأصلية موجودة في مجلد images.\nاللقطات للمراجعة؛ دراسة المطبخ المفتوح وركن الغسيل لم تعتمد للتنفيذ.\n\nUnzip and open index.html. Original PNGs are in images/.\nREVIEW.md and metadata/ record the verified code, capture and remaining issues.\n')
    output = args.output_dir / 'apartment-k8-reviewed.zip'
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
        for file in sorted(package.rglob('*')):
            if file.is_file():
                archive.write(file, file.relative_to(args.output_dir))
    preview = args.output_dir / 'apartment-k8-preview.png'
    shutil.copy2(args.renders / 'J1-living-kitchen.png', preview)
    print(json.dumps({'zip': str(output), 'preview': str(preview), 'gallery': str(package/'index.html'), 'image_count': len(VIEWS), 'bytes': output.stat().st_size}))

if __name__ == '__main__':
    main()
