# Type B M1 — مراجعة أول fixing

المدخل هو HEAD `37e88444761919cb8323e51039ed9201328b8e48` / M0 issue69. [Owner-Review.html](Owner-Review.html) يعمل أوفلاين: أربع طبقات مستقلة، تكبير لكل واحدة من 13 مساحة، خيارا أرضية، وقرارات A15 كاملة. حمّل [Owner-Review-Package.zip](Owner-Review-Package.zip) وافتح HTML؛ لا اعتماد على الإنترنت.

- [A15_DISPOSITION.csv](A15_DISPOSITION.csv) / JSON: 65/65، 24 reanchor +38 room-level +3 parked. old K12 island/oven-column/terrace-washer لا يوجدوا في الرسم النشط. نيش غسالة indoor احتياج جديد، ليس جهازًا مركبًا.
- [01-Power-Controls.svg](01-Power-Controls.svg)؛ [02-Lighting-RCP.svg](02-Lighting-RCP.svg)؛ [03-HVAC-Services.svg](03-HVAC-Services.svg)؛ [04-Floors-Thresholds.svg](04-Floors-Thresholds.svg). الرموز مناطق وظيفية وأثاث source، مش إحداثيات fixing. SVG الأرضية يقارن A/B معًا؛ HTML يكبر البديل/الغرفة.
- [FIRST_FIX_ISSUES.csv](FIRST_FIX_ISSUES.csv) / JSON: 68 منطقة استعمال، سبب ربطها بالأثاث، tradeoff، دليل confidence وخطوة مسح وتوقيع trade. جدول الغرف داخل HTML. [COORDINATION.json](COORDINATION.json) يشمل exact source object records وأدلة المصدر.
- [SOURCE_LOCK.json](SOURCE_LOCK.json): حفظ كل ملفات HEAD الموروثة، بما فيها كل نتائج M0. تعديل automation واحد يسمح فقط ببصمتي تحديث docs المالك37e8844 داخل verifier M0؛ لا إعادة توليد M0.

Source scene `scene-9cf45a73` SHA `ec05e4fe7c0e15b3555107da4ac5628894df7fcddb3cee996d3af2fddaa7df63`، cloud origin `scene-4821689`/storage55؛ canonical `734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658`. Architecture P0، demolished=[]، الزجاج كامل الارتفاع وسقف مصدر2500 محفوظين. NORTH unknown؛ arcs source inferred؛ nominal openings ليست finished clear. 75 warnings موروثة ومشكلة entry/chair وBR02 grid ليست إثباتًا للموقع. كل approvals false/HOLD.

التصميم الجديد يفصل bedside/work/TV/دخول، ambient/task/accent/night/manual fallback، مناطق no-draught والخدمة، وخياري floor public/private/wet/outdoor. R4 ivory/R5 D1/R6 L2 أدلة kitchen visual lead فقط؛ لا رأي مصنّعين جديد أو دوائر أو أحمال أو cable/breaker/lux/AC tonnage. الأدلة السابقة مرتبطة من HTML ببصماتها. كل equipment/shaft/threshold/wet protection `TBD_AS_BUILT` و#19 لتوقيع مهني.

NEXT #71: ثلاث لغات تصميم ومودبوردات من نفس M0 وقيود M1؛ #72 مراجعات الغرف؛ #19 رفع موقع وإصدار مهني لاحق. اتجاه المشروع لم يتغير، لذا Master Plan وAGENTS محفوظين؛ issue board #41 مصدر handoff التشغيلي.

إعادة التوليد: `node scripts/build-whole-home-m1.mjs`؛ اختبارات `node --test --test-isolation=none scripts/whole-home-m1.test.mjs`. تحقق محلي/بصري وتغليف في [VALIDATION.md](VALIDATION.md).

بعد إعادة التوليد والفحص البصري: `python3 scripts/package-whole-home-m1.py` لإعادة التغليف والتحقق من SHA/CRC. `A15_DISPOSITION` يربط أيضًا نتائج فحص M0 للنقطة/الغرفة بأسئلة الوصول؛ هو model screen وليس تأكيد وصول بشري أو قياس موقع.
