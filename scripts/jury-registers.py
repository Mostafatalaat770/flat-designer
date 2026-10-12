"""Single-allocation ledger and dependency register. Never edits an inherited HOLD."""
import csv,json,hashlib
from pathlib import Path
base=Path('design-development/whole-home-m3');out=base/'jury'
read=lambda p:json.loads(Path(p).read_text())
write=lambda name,data:(out/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
src=read('render-snapshots/current.json');scene=read(out/'SCENARIO.json')
source_items={x['id']:x for x in src['layout']['furniture']+src['layout']['interior']['objects']}
designed={x['id']:x for x in scene['layout']['furniture']+scene['layout']['interior']['objects']}
room_names={'RECP-01':'الريسبشن والدخول والسفرة','HALL-01':'الطرقة الخاصة','MBR-01':'غرفة النوم الرئيسية','BR-01':'غرفة النوم الأولى','BR-02':'المكتب وغرفة الضيف','WIC-01':'الدريسنج','BATH-M01':'حمام الرئيسية','BATH-C01':'حمام الأسرة','WC-01':'حمام الضيوف','KIT-01':'المطبخ','TER-MAIN':'التراس الرئيسي','TER-MBR':'تراس الرئيسية','TER-SVC':'تراس الخدمة'}
def dims(x):
 if not x:return None
 return [x.get('w',x.get('width_mm')),x.get('d',x.get('depth_mm')),x.get('height_mm')]
ids_by_room={
 'RECP-01':['A-dining-sideboard','starter-40','starter-30'],
 'HALL-01':[], 'MBR-01':['V7-master-drawers','starter-2','starter-3'],
 'BR-01':['starter-7','V7-bedroom1-drawers','M3G2-BR01-nightstand'],
 'BR-02':['starter-13','M3G2-BR02-nightstand'], 'WIC-01':['starter-4','starter-5'],
 'BATH-M01':['R1-ensuite-vanity','BATHM-shampoo-shelf-A1','BATHM-shampoo-shelf-A2','BATHM-A1-mirror'],
 'BATH-C01':['starter-18','BATHC-wall-towel-cabinet-A2','BATHC-shampoo-shelf-A1','BATHC-A1-mirror'],
 'WC-01':['starter-26','WC-A1-mirror'],
 'KIT-01':['starter-20','K3-corner','K3-sink-base','K3-end-landing','KIT-A1-upper-north','KIT-A1-upper-west-low','KIT-A1-upper-west-high'],
 'TER-MAIN':[], 'TER-MBR':[], 'TER-SVC':['G5-service-caddy']}
requirements={
 'RECP-01':['أطقم السفرة والتقديم','الأحذية اليومية والضيوف','كتب وأجهزة التلفزيون'],
 'HALL-01':['لا وحدة تخزين مصدر؛ لا تنقل إليه عجزًا مفترضًا'],
 'MBR-01':['ملابس مطوية ومتعلقات شخصية','شواحن وكتب','مفروشات السرير'],
 'BR-01':['ملابس','كتب وأدوات دراسة','مفروشات'],
 'BR-02':['ملابس/مفروشات في ضلع الدولاب الذي تقلص','ملفات وشغل','عدة نوم الضيف'],
 'WIC-01':['عدد وطول الملابس المعلقة','قطع سميكة600مم','أحذية احتياطية4 أزواج كفرضية فقط','فوَط ومفروشات لم يخصص لها مكان'],
 'BATH-M01':['شامبو ومستلزمات استعمال يومي','مناشف إضافية ومستهلكات خارج الحيز المبلول'],
 'BATH-C01':['مناشف يد فقط داخل الدولاب الضحل','مناشف حمام كاملة تحتاج مخزنًا محددًا'],
 'WC-01':['مستهلكات صغيرة مع ترك خدمة السيفون'],
 'KIT-01':['أطباق280مم وحلل300مم مع المقابض','مؤن وأجهزة صغيرة','سلة قمامة ومنظفات','تجربة وصول الركن والعلوي'],
 'TER-MAIN':['لا تخزين مغلق معتمد ولا بديل للبوفيه'],
 'TER-MBR':['لا احتياطي ملابس أو منسوجات بالخارج'],
 'TER-SVC':['سلة الغسيل','النشارة بعد طيها120مم: مكان داخلي غير مخصص','أدوات نظافة لا تُعتمد بالخارج']}
rows=[]
for rid,ids in ids_by_room.items():
 items=[]
 for id in ids:
  a=source_items.get(id);b=designed.get(id);c=next((x for x in scene['group5_concepts'] if x['id']==id),None)
  if c:b={'id':id,'w':c['w'],'d':c['d'],'height_mm':c['h']}
  da,db=dims(a),dims(b);loss=da[0]-db[0] if da and db else None
  item={'allocation_id':rid+'/'+id,'id':id,'source_external_mm':da,'provisional_external_mm':db,'source_net_usable_L':None,'provisional_net_usable_L':None,'verified_usable_interior_mm':None,'unknown_net_dimensions':True,'confirmed_external_width_loss_mm':max(0,loss) if loss is not None else None,'source_capacity_status':'SOURCE_MODEL_OUTER_ENVELOPE_ONLY' if a else 'NO_SOURCE_CAPACITY','provisional_capacity_status':'DESIGN_PROXY; hardware/interior/inventory UNKNOWN','reserved_or_unallocated':[]}
  if id=='A-dining-sideboard':item.update(assumed_clear_width_mm={'source':1960,'provisional':1210,'loss_percent':38.2653,'assumption':'20mm ends; not surveyed net capacity'},confirmed_external_width_loss_percent=37.5)
  if id in ['V7-master-drawers','V7-bedroom1-drawers']:item.update(assumed_clear_width_mm={'source':960,'provisional':560,'loss_percent':41.6667,'assumption':'20mm ends; depth/hardware remain UNKNOWN'},confirmed_external_width_loss_percent=40)
  if id=='starter-13':item.update(assumed_clear_bay_width_mm={'source':773,'provisional':573,'loss_percent':25.8732,'assumption':'Two bays/three18mm panels'},confirmed_external_width_loss_percent=25,source_linen_bay_preserved_in_inventory=True)
  if id in ['starter-4','starter-5']:item.update(assumed_inner_depth_mm=575,garment_depth_assumed_mm=550,bulky600mm_result='FAILS_ASSUMED_DEPTH',reserved_or_unallocated=['Four-pair shoe reserve NOT allocated','Shelf clear372 vs400 reserve box; needs28 adjustment','Opposing drawers/users cannot be simultaneous'])
  if id=='starter-40':item.update(design_hypothesis_clear_mm=[560,310,680],daily_pairs_example=4,shoe_example_mm=[300,115,150],capacity_confirmed=False,reserved_or_unallocated=['Extra shoes remain unallocated; WIC not credited'])
  if id=='BATHC-wall-towel-cabinet-A2':item.update(design_hypothesis_depth_mm=134,bath_towel_assumed_depth_mm=180,shortfall_mm=46,allocation='HAND_TOWELS_ONLY; bath towel stock unallocated')
  if id=='K3-corner':item.update(credited_daily_capacity=0,reason='Blind corner access unresolved; avoid double-credit with west cabinet')
  if id.startswith('KIT-A1-upper'):item['capacity_hypothesis']='Closed upper; case18/shelf deductions hypothetical, cannot be summed into confirmed net storage'
  if id=='KIT-A1-upper-north':item['retained_hypothetical_gross_box_L']=344.355936;item['rejected_open_cubby_hypothetical_loss_L']=58.566816
  if id=='G5-service-caddy':item.update(approved_weatherproof_capacity=0,reason='Portable open caddy; not pantry/linen/chemical compensation')
  if id in ['BATHM-A1-mirror','BATHC-A1-mirror']:item['capacity_hypothesis']='100mm outer cabinet-depth concept; usable compartments/hardware UNKNOWN'
  items.append(item)
 rows.append({'room_id':rid,'name_ar':room_names[rid],'items':items,'source_actual_net_L':None,'provisional_designed_net_L':None,'verified_usable_total_L':None,'household_inventory_required':requirements[rid],'residual_storage_shortage':'UNKNOWN_UNTIL_ITEM_INVENTORY_AND_NET_MEASUREMENTS','reserved_or_unallocated':requirements[rid] if rid in ['HALL-01','WIC-01','TER-SVC'] else [],'no_cross_room_compensation_assumed':True})
ledger={'schema':'WholeHomeSingleAllocationStorage/1','source':'SOURCE_MODEL; no measured cabinet internals supplied','rooms':rows,'whole_home_source_net_L':None,'whole_home_provisional_net_L':None,'whole_home_residual_shortage':'UNKNOWN','known_tradeoffs':{'buffet_external_width_loss_mm':750,'br02_wardrobe_external_width_loss_mm':400,'master_chest_external_width_loss_mm':400,'br01_chest_external_width_loss_mm':400,'wic_shoe_reserve_cost_hypothesis_accessible_clothing_L':137.5,'wic_shoe_reserve_allocated':False,'retained_closed_upper_not_new_net_credit':True},'rules':['Each item allocated once using unique allocation_id; WIC lower bay and shoe reserve cannot both be credited','Outer dimensions and gross-box hypotheses are not usable storage','Kitchen/terraces do not compensate reception/bedroom reductions','All wardrobe capacities need hardware and clothing inventory','No arithmetic total over UNKNOWN values']}
assert len(rows)==13;write('STORAGE_LEDGER.json',ledger)
inv=[]
for rid in ['RECP-01','MBR-01','BR-01','BR-02','WIC-01','BATH-M01','BATH-C01','WC-01','KIT-01','TER-SVC']:
 for i,label in enumerate(requirements[rid]):inv.append({'inventory_id':f'{rid}-I{i+1:02}','room_id':rid,'category_ar':label,'count':'','item_width_mm':'','item_depth_mm':'','item_height_or_hang_mm':'','frequency':'','allocated_storage_id':'','must_keep':'','notes':''})
write('OWNER_INVENTORY.json',{'schema':'OwnerInventoryWorksheet/1','instructions_ar':'اكتب العدد ومقاس أكبر قطعة وتكرار الاستخدام. كل بند له مكان واحد فقط. لو مش لاقي مكان، سيبه غير مخصص؛ متكتبش WIC أو مطبخ كتعويض تلقائي. بعد القياس نطابق البنود بالصافي ونظهر العجز.','rows':inv})
with (out/'Owner-Inventory.csv').open('w',newline='',encoding='utf-8-sig')as f:w=csv.DictWriter(f,fieldnames=inv[0].keys());w.writeheader();w.writerows(inv)
p0={'G1B-H01','G1B-H03','G1B-H04','G2-H01','G2-H06','G2-H07','G2-H08','G3-H01','G3-H02','G3-H03','G3-H04','G3-H05','G3-H06','G3-H08','G3-H09','G3-H10','G4-H01','G4-H02','G4-H03','G4-H04','G4-H08','G4-H12','G5-H01','G5-H02','G5-H03','G5-H04','G5-H05','G5-H06','G5-H09','G5-H10'}
p2={'G2-H09','G3-H12','G4-H09'}
survey=['G1B-H01','G2-H01','G3-H01','G4-H01','G5-H01']
groups=[('المقاسات والضلف والزجاج',survey+['G1B-H03','G5-H06']),('المياه والعزل والتهوية والكهرباء',['G2-H06','G2-H07','G2-H08']+[f'G3-H{i:02}'for i in [2,3,4,5,6,8,9,10]]+['G4-H02','G4-H03','G4-H04','G4-H08','G4-H10','G4-H12','G5-H04','G5-H09','G5-H10']),('الحواجز والثبات والنشر والخدمة',['G1B-H04','G1B-H05','G1B-H06']+[f'G5-H{i:02}'for i in [2,3,5,7,8,11]]),('النجارة والمخزون وتجربة الأسرة',['G1B-H02','G1B-H07']+[f'G2-H{i:02}'for i in [2,3,4,5]]+['G3-H07','G3-H11','G4-H05','G4-H06','G4-H07','G4-H11','G5-H12']),('العينات وتكوين الخامات',['G2-H09','G3-H12','G4-H09'])]
holds=[]
for g in ['group1b','group2','group3','group4','group5']:
 p=base/g/'SITE_HOLDS.json';raw=read(p)
 for h in raw['holds']:
  id=h['id'];own=next(name for name,ids in groups if id in ids)
  deps=[] if id in survey else [next(x for x in survey if x.startswith(id.split('-H')[0]+'-'))]
  if id=='G3-H03':deps+=['G3-H04']
  if id=='G2-H08':deps+=['G3-H10','G2-H03']
  if id=='G4-H05':deps+=['G4-H04','G4-H07']
  if id=='G5-H10':deps+=['G5-H02','G5-H03','G4-H04']
  holds.append({'id':id,'original_status':h['status'],'integration_priority':'P0'if id in p0 else 'P2'if id in p2 else 'P1','priority_reason':'Source/safety/professional release blocks construction'if id in p0 else 'Owner sample/finish choice'if id in p2 else 'Functional capacity/product/user decision','depends_on':deps,'site_visit_group':own,'original_source':str(p),'original_file_sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'original':h,'integration_status':'UNRESOLVED; original status retained'})
assert len(holds)==52 and len({h['id']for h in holds})==52
assert all(d in {h['id']for h in holds} for h in holds for d in h['depends_on'])
register={'schema':'WholeHome52HoldDependencyRegister/1','holds':holds,'counts':{p:sum(h['integration_priority']==p for h in holds)for p in ['P0','P1','P2']},'original_statuses_unchanged':True,'construction_release_issue':19,'visits':[{'title_ar':name,'hold_ids':ids,'outcome':'Measurements/mockups/professional records, not verbal approval'}for name,ids in groups]}
write('DECISION_REGISTER.json',register)
board={'schema':'WholeHomeDecisionBoard/1','recommended_for_continued_study':['B2 six seats with capacity loss disclosed','A upholstered master / measured shared layout','B daily BR02 office and B WIC single-user sequencing','B warm bathrooms; master800 source depth','Kitchen closed ivory uppers/limited oak/olive, conditional drawers','Main two seats, master one seat, compact B drying'],'owner_choice_needed':['Accept four storage reductions or reject the affected joinery','Confirm daily-office/guest inventory and users','Accept sequential kitchen service use','Warm oak/ivory/olive samples with terracotta master variation; source brown doors versus later coordinated finish'],'site_measurement_needed':survey,'vendor_product_verification_needed':['G3-H03','G3-H06','G3-H07','G4-H02','G4-H04','G4-H05','G4-H06','G5-H10'],'professional_engineering_approval_needed':[h['id']for h in holds if h['integration_priority']=='P0'],'rejected_design_alternatives':['Family outward/pivot shower operation as occupied default','Automatic900mm master shower expansion','Permanent third main terrace seat at tested position','South kitchen half-slider as full cookware access','Extra kitchen counters in tested source room','A BR02 as a complete daily office','Double allocation of WIC shoes/clothes or kitchen/terrace storage compensation'],'all_approvals_false':True}
write('DECISION_BOARD.json',board)
print(json.dumps({'storage_rooms':len(rows),'storage_items':sum(len(x['items'])for x in rows),'inventory_rows':len(inv),'holds':len(holds),'priorities':register['counts']},ensure_ascii=False))
