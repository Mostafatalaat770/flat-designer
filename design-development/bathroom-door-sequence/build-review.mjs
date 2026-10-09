import fs from 'node:fs';
const dir=import.meta.dirname,result=JSON.parse(fs.readFileSync(dir+'/results.json'));
const esc=x=>String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const names={'starter-4':'دولاب','starter-5':'دولاب','starter-15':'WC','starter-25':'WC',
 'starter-26':'حوض','R1-ensuite-vanity':'حوض','BATHM-glass-600-A1':'زجاج'};
function card(c){
 const s=result.sequences.find(s=>s.room===c.id&&s.parameters.grid_mm===25&&s.parameters.radius_mm===250);
 const states=s.status==='SAMPLED_SEQUENCE_FOUND'?s.states:s.phase_evidence.opening.states;
 const cycle=s.status==='SAMPLED_SEQUENCE_FOUND'?[...states,...states.slice(0,-1).reverse()]:states;
 const xs=c.boundary.map(p=>p[0]),ys=c.boundary.map(p=>p[1]);
 const bounds=[Math.min(...xs),Math.min(...ys),Math.max(...xs),Math.max(...ys)],width=bounds[2]-bounds[0],height=bounds[3]-bounds[1];
 const polygon=o=>`<polygon points="${o.polygon.map(p=>p.join(',')).join(' ')}" fill="${o.kind==='wall'?'#65716c':o.kind==='other-door'?'#b58545':o.id.includes('glass')?'#82bdc7':'#cabb9d'}" ${o.id.includes('mirror')||o.id.includes('shelf')?'opacity=".5"':''}/>`;
 const labels=c.obstacles.filter(o=>names[o.id]).map(o=>{
  const x=o.polygon.reduce((a,p)=>a+p[0],0)/4,y=o.polygon.reduce((a,p)=>a+p[1],0)/4;
  return `<text x="${x}" y="${y+15}" font-size="65" text-anchor="middle" fill="#253c33">${names[o.id]}</text>`;
 }).join('');
 const serialized=JSON.stringify({door:c.door,states:cycle,opening_count:s.opening_phase_states||states.length,
  inward_count:states.length,complete:s.status==='SAMPLED_SEQUENCE_FOUND'}).replaceAll('<','\\u003c');
 return `<article id="${c.id}" class="card"><div class="card-head"><h2>${c.id==='master'?'حمام الماستر':'حمام الضيوف'}</h2><span class="badge ${s.status==='SAMPLED_SEQUENCE_FOUND'?'ok':'hold'}">${s.status==='SAMPLED_SEQUENCE_FOUND'?'تسلسل 50 سم موجود':'غلق الباب يحتاج مراجعة'}</span></div>
 <p>${c.id==='master'?'إقفال الباب بعد الدخول يفتح الوصول للدش. مسار الدخول والاستخدام والخروج موضح تحت.':'الدخول والباب مفتوح ممكن، لكن تسلسل الغلق ثم الاستخدام لم يثبت في النموذج. العرض تحت يتوقف عند الدخول.'}</p>
 <svg role="img" aria-label="مخطط حركة ${c.id==='master'?'حمام الماستر':'حمام الضيوف'}" viewBox="0 0 ${width} ${height}" direction="ltr"><g transform="translate(${-bounds[0]},${-bounds[1]})">
 <polygon points="${c.boundary.map(p=>p.join(',')).join(' ')}" fill="#f5f1e6"/>
 ${c.id==='master'?'<rect x="5598" y="6350" width="1450" height="800" fill="#dbe9e6"/><text x="6000" y="6650" font-size="70" text-anchor="middle" fill="#425d51">دش</text>':''}
 ${c.obstacles.map(polygon).join('')}${labels}<polyline class="trail" points="${states.map(s=>s.position_mm.join(',')).join(' ')}" fill="none" stroke="#367b64" stroke-width="15" opacity=".4"/>
 <polygon class="leaf" fill="#ad783b"/><line class="reach" stroke="#355d9b" stroke-width="10" stroke-dasharray="20 12"/>
 <circle class="body" r="250" fill="#5283b2" fill-opacity=".18" stroke="#355d9b" stroke-width="12"/>
 <circle class="handle" r="20" fill="#355d9b"/><circle cx="${c.door.hinge[0]}" cy="${c.door.hinge[1]}" r="22" fill="#ad783b"/>
 </g></svg><div class="controls"><button class="play" type="button">تشغيل الحركة</button><label for="${c.id}-step">مرحلة الحركة</label><input id="${c.id}-step" class="step" type="range" min="0" max="${cycle.length-1}" value="0"/><output class="stage"></output></div>
 <p class="caption">الدائرة الزرقاء قطرها 50 سم. الخط المنقط للمقبض أثناء تحريك الباب. الحركة توضيحية؛ الزمن وسرعة الجسم غير محسوبين.</p><script type="application/json" class="sequence-data">${serialized}</script></article>`;
}
const rows=result.sequences.map(s=>`<tr><td>${s.room==='master'?'الماستر':'الضيوف'}</td><td>${s.parameters.radius_mm*2/10} سم</td><td>${s.parameters.grid_mm} مم</td><td class="${s.status==='SAMPLED_SEQUENCE_FOUND'?'pass':'warn'}">${s.status==='SAMPLED_SEQUENCE_FOUND'?'تسلسل موجود':'لم يثبت'}</td></tr>`).join('');
const html=`<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><title>مراجعة حركة أبواب الحمامات · v55</title><style>
*{box-sizing:border-box}body{margin:0;background:#f2f4ef;color:#233a30;font:16px/1.8 system-ui,sans-serif}main{max-width:1120px;margin:auto;padding:32px 20px}h1{font-size:clamp(25px,4vw,38px);line-height:1.3;margin:12px 0}h2{font-size:23px;margin:0}p{margin:10px 0}.eyebrow{color:#61776a;font-size:14px}.intro{max-width:850px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:22px;margin:28px 0}.card,.notes{padding:22px;background:white;border:1px solid #dbe3d9;border-radius:18px;min-width:0}.card-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}.badge{font-size:13px;padding:3px 12px;border-radius:20px}.ok{background:#e1f0e7;color:#23573d}.hold{background:#faebca;color:#795b17}svg{display:block;width:100%;margin:18px 0;border-radius:8px;border:1px solid #ddd}.controls{display:flex;flex-wrap:wrap;gap:10px;align-items:center}.controls input{flex:1;min-width:120px;accent-color:#355d9b}.controls output{width:100%;font-size:14px}button{border:0;border-radius:8px;padding:9px 14px;background:#233a30;color:white;font:inherit;cursor:pointer}.caption{font-size:13px;color:#64756b}table{width:100%;border-collapse:collapse;margin:15px 0}th,td{text-align:right;border-bottom:1px solid #e3e8e1;padding:9px}.pass{color:#286f43}.warn{color:#8b6419}code{direction:ltr;unicode-bidi:isolate;font-size:12px;overflow-wrap:anywhere}.notes{margin-top:22px}.notes li{margin:9px 0}a{color:#286f59}@media(max-width:740px){main{padding:20px 12px}.grid{grid-template-columns:1fr}.card,.notes{padding:17px}th,td{padding:7px;font-size:14px}}
</style></head><body><main><div class="eyebrow">مراجعة التصميم والحركة · مصدر v55 · 9 أكتوبر 2026</div><h1>الدخول، غلق الباب، الاستخدام، ثم الخروج</h1><p class="intro">الماستر يجتاز تسلسل الحركة مع جسم افتراضي قطره 50 سم. حمام الضيوف يحتاج مقارنة لبدائل الباب؛ الوقفة أمام الحوض وحدها لا تحسم إمكانية غلقه بعد الدخول.</p><div class="grid">${result.data.map(card).join('')}</div>
<section class="notes"><h2>نتائج النموذج</h2><table><thead><tr><th>الحمام</th><th>قطر الجسم</th><th>دقة الشبكة</th><th>الدخول ← غلق ← استخدام</th></tr></thead><tbody>${rows}</tbody></table>
<p>في الماستر، الوصول للحوض وموضع أمام المرحاض نجح أيضًا بعد غلق الباب في الحالات الناجحة. نتيجة 55 سم تختلف مع دقة الشبكة ونقطة الوقوف الوسيطة؛ لا نستنتج منها استحالة الحركة الفعلية.</p>
<p>في الضيوف، موضع يبعد 30 سم عن مقدمة الحوض يتعارض مع الباب المفتوح، بينما موضع يبعد 40 سم يمر على الدقتين. وضع الوقوف ومدى الوصول للحوض يحتاجان تجربة واقعية.</p></section>
<section class="notes"><h2>افتراضات وحدود المراجعة</h2><ul><li>المفصلات مستنتجة من النموذج، وضلفة الباب افتراضية بسمك 18 مم. لم يتغير أي حائط أو فتحة أو توزيع محفوظ.</li><li>مدى الوصول للمقبض افتراضي: 60 سم من مركز الجسم، وموقع المقبض 6 سم قبل طرف الضلفة. ليس اعتمادًا لمقاس إنساني أو منتج.</li><li>الدخول يبدأ بباب مقفول من خارج الحمام، ثم فتحه والدخول وغلقه. عكس المسار يعيد الفتح والخروج والغلق من الخارج. حركة الجسم وتحريك الباب متعاقبان.</li><li>الشبكة 25 / 50 مم مع هامش نصف قطر قطري للخلية. دوران الباب كل 5°، وفحص وسيط لا يزيد عن 1° مع هامش حركة. فحص المسار المستقل: ≤5 مم / ≤0.25°.</li><li>الجسم دائرة وليس وضع كتفين وحركة بشرية فعلية. لا نمذجة لليد، مدى الذراع، الوقوف والاستعمال، فتح المقعد، الإكسسوارات أو الإنقاذ. وجود مسار ليس إثباتًا للراحة أو مطابقة الموقع.</li><li>مخطط الضيوف يعرض نطاقًا محليًا من الريسبشن حتى متر شرق حد الحمام، وليس مراجعة حركة الريسبشن كاملة.</li></ul></section>
<section class="notes"><h2>الخطوات التالية</h2><ol><li>مقارنة عكس مفصلة باب الضيوف والفتح للخارج عند نفس الفتحة؛ أي تعديل تنفيذي يحتاج مقاسات ومراجعة فعلية.</li><li>فتح غسالة الأطباق وأجهزة المطبخ مع شخص واقف، ثم سحب كراسي السفرة مع مرور شخص.</li><li>مطابقة مقاسات الأثاث والنجارة وفتحات الشبابيك بالموقع، وتجميع التوزيع المقترح للمراجعة قبل اعتماده.</li></ol><p>المصدر: <code>${esc(result.source_scene)}</code>، الحفظ السحابي <code>scene-4821689 / 55</code>. التفاصيل والمسارات محفوظة في <a href="results.json">results.json</a>، وطريقة إعادة التحقق في <a href="README.md">README.md</a>.</p></section></main>
<script>
for(const card of document.querySelectorAll('.card')){
 const data=JSON.parse(card.querySelector('.sequence-data').textContent),slider=card.querySelector('.step'),button=card.querySelector('.play');let timer=null;
 function draw(){const i=Number(slider.value),s=data.states[i],d=data.door,a=s.door_angle_deg*Math.PI/180,c=Math.cos(a),n=Math.sin(a),h=d.hinge;
 const points=[[0,-9],[d.length_mm,-9],[d.length_mm,9],[0,9]].map(([x,y])=>[h[0]+x*c-y*n,h[1]+x*n+y*c]);
 card.querySelector('.leaf').setAttribute('points',points.map(p=>p.join(',')).join(' '));const body=card.querySelector('.body');body.setAttribute('cx',s.position_mm[0]);body.setAttribute('cy',s.position_mm[1]);
 const handle=[h[0]+(d.length_mm-60)*c,h[1]+(d.length_mm-60)*n],dot=card.querySelector('.handle');dot.setAttribute('cx',handle[0]);dot.setAttribute('cy',handle[1]);
 const line=card.querySelector('.reach');line.setAttribute('x1',s.position_mm[0]);line.setAttribute('y1',s.position_mm[1]);line.setAttribute('x2',handle[0]);line.setAttribute('y2',handle[1]);line.style.display=i>0&&data.states[i-1].door_angle_deg!==s.door_angle_deg?'':'none';
 const phase=i>=data.inward_count?'إعادة الفتح والخروج والغلق من الخارج':i<data.opening_count?'فتح الباب والدخول':'غلق الباب ثم الوصول للاستخدام';
 card.querySelector('.stage').textContent=phase+' · خطوة '+(i+1)+' / '+data.states.length;}
 slider.addEventListener('input',draw);button.addEventListener('click',()=>{if(timer){clearInterval(timer);timer=null;button.textContent='تشغيل الحركة';return;}if(Number(slider.value)>=data.states.length-1)slider.value=0;button.textContent='إيقاف';timer=setInterval(()=>{slider.value=Math.min(data.states.length-1,Number(slider.value)+1);draw();if(Number(slider.value)>=data.states.length-1){clearInterval(timer);timer=null;button.textContent='تشغيل الحركة';}},60);});draw();
}
</script></body></html>`;
fs.writeFileSync(dir+'/review.html',html);
console.log('Wrote portable Arabic bathroom-door review.');
