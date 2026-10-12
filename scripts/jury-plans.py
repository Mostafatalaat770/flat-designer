import json,math,html
from pathlib import Path
p=Path('design-development/whole-home-m3/jury');data=json.loads((p/'PLAN_INPUT.json').read_text());m=data['model'];ops=json.loads((p/'OPERATIONS.json').read_text())
names={r['room_id']:r['name_ar']for r in json.loads((p/'STORAGE_LEDGER.json').read_text())['rooms']}
order=['RECP-01','HALL-01','MBR-01','BR-01','BR-02','WIC-01','BATH-M01','BATH-C01','WC-01','KIT-01','TER-MAIN','TER-MBR','TER-SVC']
num={r:i+1 for i,r in enumerate(order)}
def pts(poly):return ' '.join(f'{x:.2f},{y:.2f}'for x,y in poly)
def rect(o):
 w=o.get('w',o.get('width_mm',0));d=o.get('d',o.get('depth_mm',0));x=o.get('cx',0);y=o.get('cy',0);a=math.radians(o.get('rot',o.get('rotation',0)));return [[x+xx*math.cos(a)-yy*math.sin(a),y+xx*math.sin(a)+yy*math.cos(a)]for xx,yy in [(-w/2,-d/2),(w/2,-d/2),(w/2,d/2),(-w/2,d/2)]]
def draw(ids,viewbox,title,operation=None):
 font=(viewbox[2]/90);stroke=viewbox[2]/550
 s=[f'<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="{html.escape(title)}" viewBox="{viewbox[0]} {viewbox[1]} {viewbox[2]} {viewbox[3]}" width="1400" height="900"><title>{html.escape(title)}</title><style>text{{font-family:Arial,sans-serif}} .room-select{{cursor:pointer}} .room-select:focus{{stroke:#b2734e;stroke-width:30}}</style><rect x="{viewbox[0]}" y="{viewbox[1]}" width="{viewbox[2]}" height="{viewbox[3]}" fill="#faf8f1"/>']
 for r in m['rooms']:
  if r['id']not in ids:continue
  fill='#e5eadf'if r['id'].startswith('TER')else '#e0e4dc'if r['id'].startswith('BATH')or r['id']=='WC-01'else '#e9e1d4'
  s.append(f'<polygon class="room-select" data-room="{r["id"]}" tabindex="0" points="{pts(r["poly"])}" fill="{fill}" stroke="#fff" stroke-width="25"><title>{names[r["id"]]}</title></polygon>')
 for w in m['wall_segments']:
  if any(r in ids for r in w['rooms']):s.append(f'<path d="M{w["from"][0]},{w["from"][1]}L{w["to"][0]},{w["to"][1]}" stroke="#655e53" stroke-width="{w["thickness_mm"]}" fill="none"/>')
 for o in m['openings']:
  if any(r in ids for r in o['between']):s.append(f'<path d="M{o["from"][0]},{o["from"][1]}L{o["to"][0]},{o["to"][1]}" stroke="#518d8b" stroke-width="35"><title>{o["id"]} · {o["length_mm"]:.1f}mm nominal</title></path>')
 for f in data['furniture']:
  if f['room_id']not in ids:continue
  s.append(f'<polygon points="{pts(rect(f))}" fill="{f["color"]}" fill-opacity="{.25 if f["type"]=="rug"else .92}" stroke="#85745c" stroke-width="{stroke}"><title>{html.escape(f["id"])} · {f["w"]}×{f["d"]}mm</title></polygon>')
 for o in data['interior']:
  if o['room_id']not in ids or o['type']not in ['sideboard','console','divider'] :continue
  s.append(f'<polygon points="{pts(rect(o["resolved"]))}" fill="#b9aa92" fill-opacity=".75" stroke="#7a6957" stroke-width="{stroke}" stroke-dasharray="25 14"><title>{o["id"]}</title></polygon>')
 for c in data['terraces']:
  if c['room']in ids:s.append(f'<polygon points="{pts(rect(c))}" fill="#829075" fill-opacity=".7" stroke="#56664e" stroke-width="{stroke}"><title>{c["id"]}</title></polygon>')
 for d in m['doors']:
  o=next(o for o in m['openings']if o['id']==d['id'])
  if not any(r in ids for r in o['between']):continue
  h=d['h'];a=d['o'];s.append(f'<path d="M{h[0]},{h[1]}L{h[0]+a[0]*d["len"]},{h[1]+a[1]*d["len"]}" stroke="#b7784f" stroke-width="38"/>')
 if operation:
  for poly in operation.get('envelopes',[]):s.append(f'<polygon points="{pts(poly)}" fill="#b6575040" stroke="#ac5a50" stroke-width="15" stroke-dasharray="35 20"/>')
  for route in operation.get('routes',[]):
   if route:s.append(f'<polyline points="{pts(route)}" fill="none" stroke="#248483" stroke-width="32"/>')
 for r in m['rooms']:
  if r['id']not in ids:continue
  a=r['poly'];x=(min(q[0]for q in a)+max(q[0]for q in a))/2;y=min(q[1]for q in a)+250
  if r['id']=='RECP-01':x=10700;y=800
  s.append(f'<g pointer-events="none"><circle cx="{x}" cy="{y}" r="{font*.95}" fill="#33483d"/><text x="{x}" y="{y+font*.35}" text-anchor="middle" font-size="{font}" fill="white">{num[r["id"]]}</text></g>')
 s.append('</svg>');return ''.join(s)
svg=draw(order,[-160,-160,16550,10550],'المخطط الموحّد — ١٣ مساحة من المصدر؛ اختيار الأثاث مؤقت')
(p/'plans/Whole-Home.svg').write_text(svg)
for rid in order:
 r=next(x for x in m['rooms']if x['id']==rid);q=r['poly'];bounds=[min(x[0]for x in q)-180,min(x[1]for x in q)-180,max(x[0]for x in q)-min(x[0]for x in q)+360,max(x[1]for x in q)-min(x[1]for x in q)+360]
 (p/f'plans/{rid}.svg').write_text(draw([rid],bounds,names[rid]))
for id in ['public-main','kitchen-service-transfer','kitchen-service-DW-unloading','master-wic-bath','master-terrace']:
 r=next(x for x in ops['cross_room']if x['id']==id and x['grid_mm']==25 and x['diameter_assumed_mm']==500)
 q=[xy for room in m['rooms']if room['id']in r['rooms']for xy in room['poly']];bounds=[min(x[0]for x in q)-120,min(x[1]for x in q)-120,max(x[0]for x in q)-min(x[0]for x in q)+240,max(x[1]for x in q)-min(x[1]for x in q)+240]
 env=[]
 if id=='kitchen-service-DW-unloading':env=[ops['kitchen'][0]['panel'],ops['kitchen'][0]['user']]
 (p/f'plans/Operation-{id}.svg').write_text(draw(r['rooms'],bounds,id+' / assumed500 / '+r['status'],{'envelopes':env,'routes':[r['path_mm']]}))
print('14 source-scaled plans +5 combined-operation plans')
