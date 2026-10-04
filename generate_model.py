"""Rebuild the viewer adapter from the unmodified canonical apartment JSON.

Source pixels preserve topology. The canonical 47.208 px/m visual calibration
is used only for visualization; printed room dimensions remain separate.
"""
import hashlib
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DIST = ROOT / "dist"
SOURCE = next((DIST / "sources").glob("Apartment_Master_Spec*json"))
SPEC = json.loads(SOURCE.read_text())
SCALE = 1000 / SPEC["geometry_semantics"]["visual_scale_estimate_px_per_m_median"]
ORIGIN = SPEC["source"]["plan_outer_visual_bbox_source_px"][:2]
THICKNESS_MM = 180  # TBD: a display convention, never a structural classification.

def metric(p):
    return [round((p[0] - ORIGIN[0]) * SCALE, 3), round((p[1] - ORIGIN[1]) * SCALE, 3)]

def area(poly):
    return abs(sum(a[0]*b[1] - b[0]*a[1] for a,b in zip(poly,poly[1:]+poly[:1]))) / 2

def inside(p, poly):
    x,y=p
    odd=False
    for a,b in zip(poly,poly[1:]+poly[:1]):
        if (a[1]>y) != (b[1]>y) and x < (b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:
            odd=not odd
    return odd

SHORT_NAMES = {
    "TER-MBR":"Master terrace", "BR-01":"Bedroom 1", "BR-02":"Bedroom 2",
    "MBR-01":"Master bedroom", "HALL-01":"Private hall", "WIC-01":"Dressing",
    "BATH-M01":"Ensuite", "BATH-C01":"Family bathroom", "KIT-01":"Kitchen",
    "TER-SVC":"Service terrace", "WC-01":"Guest WC", "TER-MAIN":"Main terrace",
    "RECP-01":"Living & dining",
}

rooms=[]
for rid,r in SPEC["spaces"].items():
    poly=[metric(p) for p in r["geometry"]["polygon_source_px"]]
    at=r["geometry"]["representative_point_source_px"]
    # Label-only centering inside the long left arm of the continuous reception.
    if rid=="RECP-01": at=[769,383]
    rooms.append({"id":rid,"name":SHORT_NAMES[rid],"full_name":r["name"],"poly":poly,
        "at":metric(at),"kind":r["kind"],"isTerrace":r["kind"]=="terrace",
        "mat":"wood" if r["kind"] in ("bedroom","dressing") else "antislip" if r["kind"] in ("terrace","bathroom","toilet") else "tile800",
        "printed":r.get("printed_label"),"printed_dimensions_m":r.get("printed_dimensions_m"),
        "callouts":r.get("dimension_callouts",[]),"area_estimate_m2":area(poly)/1e6})

# Group near-collinear traced edges. The 851/852px kitchen partition and its
# two chamfer traces are the same raster wall, within 1 source pixel. The
# original room polygons are preserved; only duplicate display walls merge.
edges=[]
for rid,r in SPEC["spaces"].items():
    poly=r["geometry"]["polygon_source_px"]
    for a,b in zip(poly,poly[1:]+poly[:1]):
        edges.append({"a":a,"b":b,"room":rid,"terrace":r["kind"]=="terrace"})
groups=[]
diags=[]
for e in edges:
    a,b=e["a"],e["b"]
    axis="v" if a[0]==b[0] else "h" if a[1]==b[1] else None
    if axis is None:
        if not any(max(math.dist(a,d["a"]),math.dist(b,d["b"]))<=1.5 or max(math.dist(a,d["b"]),math.dist(b,d["a"]))<=1.5 for d in diags):
            diags.append(e)
        continue
    fixed=a[0] if axis=="v" else a[1]
    lo,hi=sorted([a[1],b[1]] if axis=="v" else [a[0],b[0]])
    group=next((g for g in groups if g["axis"]==axis and abs(g["fixed"]-fixed)<=1),None)
    if group is None:
        group={"axis":axis,"fixed":fixed,"edges":[]}
        groups.append(group)
    group["edges"].append({**e,"lo":lo,"hi":hi})

segments=[]
for g in groups:
    cuts=set(v for e in g["edges"] for v in [e["lo"],e["hi"]])
    openings=[]
    for oid,o in SPEC["openings"].items():
        a,b=o["segment_source_px"]
        axis="v" if a[0]==b[0] else "h" if a[1]==b[1] else None
        fixed=a[0] if axis=="v" else a[1]
        if axis==g["axis"] and abs(fixed-g["fixed"])<=1:
            lo,hi=sorted([a[1],b[1]] if axis=="v" else [a[0],b[0]])
            openings.append([lo,hi,oid]); cuts.update([lo,hi])
    cuts=sorted(cuts)
    for lo,hi in zip(cuts,cuts[1:]):
        mid=(lo+hi)/2
        hosts=[e for e in g["edges"] if e["lo"] <= mid <= e["hi"]]
        if not hosts or any(a<mid<b for a,b,_ in openings): continue
        a=[g["fixed"],lo] if g["axis"]=="v" else [lo,g["fixed"]]
        b=[g["fixed"],hi] if g["axis"]=="v" else [hi,g["fixed"]]
        low=all(e["terrace"] for e in hosts)
        segments.append({"from":metric(a),"to":metric(b),"source_px":[a,b],
            "kind":"low" if low else "unclassified", "thickness_mm":THICKNESS_MM,
            "height_m":1.0 if low else 2.5,"rooms":sorted(set(e["room"] for e in hosts))})
for e in diags:
    segments.append({"from":metric(e["a"]),"to":metric(e["b"]),"source_px":[e["a"],e["b"]],
        "kind":"unclassified","thickness_mm":THICKNESS_MM,"height_m":2.5,"rooms":["KIT-01","RECP-01"]})

doors=[]; wins=[]; slides=[]; passages=[]; opening_records=[]
for oid,o in SPEC["openings"].items():
    a,b=[metric(p) for p in o["segment_source_px"]]
    horizontal=a[1]==b[1]
    if horizontal:
        rect=[min(a[0],b[0]),a[1]-THICKNESS_MM/2,max(a[0],b[0]),a[1]+THICKNESS_MM/2]
    else:
        rect=[a[0]-THICKNESS_MM/2,min(a[1],b[1]),a[0]+THICKNESS_MM/2,max(a[1],b[1])]
    length=math.dist(a,b)
    record={"id":oid,"type":o["type"],"between":o["between"],"from":a,"to":b,
            "rect":rect,"length_mm":length,"source_px":o["segment_source_px"]}
    opening_records.append(record)
    if o["type"]=="exterior_window":
        wins.append(rect)
    elif o["type"]=="glazed_terrace_opening":
        slides.append({"id":oid,"rect":rect,"v":not horizontal,"head_m":2.1})
    elif o["type"] in ("open_or_doorway","open_passage"):
        passages.append({"id":oid,"rect":rect,"head_m":2.5})
    else:
        hinge=b if oid in ("OP-BR01-HALL","OP-ENT-01") else a
        other=a if hinge==b else b
        closed=[(other[0]-hinge[0])/length,(other[1]-hinge[1])/length]
        target=o.get("swing","").replace("into ","")
        if target not in SPEC["spaces"]: target=next(v for v in o["between"] if v!="EXTERIOR")
        center=metric(SPEC["spaces"][target]["geometry"]["representative_point_source_px"])
        opened=[0,1 if center[1]>hinge[1] else -1] if horizontal else [1 if center[0]>hinge[0] else -1,0]
        doors.append({"id":oid,"name":oid,"rect":rect,"h":hinge,"c":closed,"o":opened,"len":length,"entry":oid=="OP-ENT-01"})

window_meta=[]
for o in opening_records:
    if o["type"]!="exterior_window": continue
    full=o["id"]=="GLZ-RECP-N"
    window_meta.append({"id":o["id"],"sill_m":0 if full else .9,"head_m":2.5 if full else 2.1,
        "status":"VERIFIED" if full else "TBD"})

# A reversible furnishing example, never an approved interior design. Units
# and item sizes are actual mm; positions inherit the source frame.
furniture=[]
def f(room,kind,name,px,py,w,d,rot=0,color=None):
    cx,cy=metric([px,py])
    item={"id":f"starter-{len(furniture)+1}","type":kind,"name":name,"room_id":room,
        "cx":cx,"cy":cy,"w":w,"d":d,"rot":rot,"color":color or "#c7b299","status":"EXPLORATORY"}
    # Every item's entire footprint must stay inside its declared room.
    theta=math.radians(rot)
    poly=SPEC["spaces"][room]["geometry"]["polygon_source_px"]
    for dx,dy in [(-w/2,-d/2),(w/2,-d/2),(w/2,d/2),(-w/2,d/2)]:
        x=px+(dx*math.cos(theta)-dy*math.sin(theta))/SCALE
        y=py+(dx*math.sin(theta)+dy*math.cos(theta))/SCALE
        assert inside([x,y],poly), (name,room,x,y)
    furniture.append(item)

f("MBR-01","bed","King bed",325,485,1800,2000,270,"#c6d3df")
f("MBR-01","nightstand","Nightstand",288,426,450,400,270)
f("MBR-01","nightstand","Nightstand",288,545,450,400,270)
f("WIC-01","wardrobe","Dressing wardrobe",480,481,1250,550,0,"#d8dfe5")
f("WIC-01","wardrobe","Dressing wardrobe",480,575,1250,550,180,"#d8dfe5")
f("BR-01","bed","Single bed",388,300,1200,2000,0,"#adc2d2")
f("BR-01","wardrobe","Wardrobe",496,302,1600,550,90,"#d8dfe5")
f("BR-01","desk","Desk",414,385,1500,500,180)
f("BR-01","chair","Chair",414,357,450,450,180,"#747f91")
f("BR-02","bed","Single bed",637,300,1200,2000,0,"#c4b9a9")
f("BR-02","desk","Work desk",551,269,1200,700)
f("BR-02","officechair","Office chair",551,306,620,620,0,"#3a465c")
f("BR-02","wardrobe","Wardrobe",649,385,1050,550,180,"#d8dfe5")
f("BATH-M01","bathtub","Bathtub",555,490,1500,750,0,"#f6f8fa")
f("BATH-M01","toilet","WC",574,562,400,700,0,"#f6f8fa")
f("BATH-C01","shower","Shower",654,568,900,900,0,"#c0d6df")
f("BATH-C01","toilet","WC",654,521,400,700,0,"#f6f8fa")
f("BATH-C01","vanity","Vanity",657,482,650,400,0,"#d8dfe5")
f("KIT-01","counter","Kitchen counter",755,501,2700,600,0,"#d8dfe5")
f("KIT-01","counter","Kitchen counter",699,548,1300,600,270,"#d8dfe5")
f("KIT-01","ksink","Kitchen sink",765,501,750,400,0,"#eef2f5")
f("KIT-01","stove","Hob",699,548,600,400,270,"#424f61")
f("KIT-01","fridge","Fridge",826,575,650,650,180,"#bec7d0")
f("TER-SVC","washer","Washing machine",695,613,600,600,270,"#d8dfe5")
f("WC-01","toilet","Guest WC",789,629,400,650,270,"#f6f8fa")
f("WC-01","vanity","Guest basin",822,606,400,300,0,"#d8dfe5")
f("RECP-01","rug","Living rug",773,266,2200,1700,90,"#c0c6d0")
f("RECP-01","sofa","Family sofa",710,264,2400,900,270,"#536f8b")
f("RECP-01","coffeetable","Coffee table",777,260,900,550,90)
f("RECP-01","tvstand","TV console",832,255,1600,350,90)
f("RECP-01","tv","TV",835,255,1230,80,90,"#152034")
f("RECP-01","armchair","Reading chair",889,368,750,750,270,"#a89780")
f("RECP-01","armchair","Reading chair",975,368,750,750,90,"#a89780")
f("RECP-01","roundtable","Side table",932,368,550,550,0)
f("RECP-01","table","Dining table",933,548,1600,800)
for x,y,rot in [(910,512,0),(951,512,0),(910,584,180),(951,584,180)]:
    f("RECP-01","chair","Dining chair",x,y,450,480,rot,"#6a7888")
f("RECP-01","shoecab","Entry storage",889,642,1150,300,180,"#d8dfe5")
f("TER-MAIN","roundtable","Terrace table",930,232,600,600)
f("TER-MAIN","armchair","Terrace chair",888,232,650,650,270,"#8a9c9f")
f("TER-MAIN","armchair","Terrace chair",972,232,650,650,90,"#8a9c9f")
f("TER-MBR","plant","Plant",275,352,500,500,0,"#799378")

# Topology validation before the adapter or sample furnishing is published.
assert len(rooms)==13 and len(opening_records)==16
assert sum(r["isTerrace"] for r in rooms)==3
assert len([r for r in rooms if r["kind"]=="reception"])==1
assert len(doors)+len(wins)+len(slides)+len(passages)==16
assert hashlib.sha256((DIST/"source-plan.jpeg").read_bytes()).hexdigest()==SPEC["source"]["sha256"]
graph={rid:set() for rid in SPEC["spaces"]}; graph["EXTERIOR"]=set()
for a,b in SPEC["direct_access_graph"]: graph[a].add(b);graph[b].add(a)
seen={"EXTERIOR"}; todo=["EXTERIOR"]
while todo:
    for rid in graph[todo.pop()]-seen: seen.add(rid);todo.append(rid)
assert set(graph)==seen
for o in opening_records:
    assert all(v in graph for v in o["between"])
    # A wall must never span the midpoint of a door/window/passage.
    mid=[sum(v)/2 for v in zip(*o["source_px"])]
    for s in segments:
        a,b=s["source_px"]
        if a[0]==b[0]==mid[0]: assert not min(a[1],b[1])<mid[1]<max(a[1],b[1])
        if a[1]==b[1]==mid[1]: assert not min(a[0],b[0])<mid[0]<max(a[0],b[0])

allpoints=[p for r in rooms for p in r["poly"]]
width=max(p[0] for p in allpoints); depth=max(p[1] for p in allpoints)
model={"schema":"apartment-viewer-adapter-v1","canonical_version":SPEC["schema_version"],
    "canonical_sha256":hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
    "source_image_sha256":SPEC["source"]["sha256"],"px_per_m":1000/SCALE,"origin_source_px":ORIGIN,
    "height_m":2.5,"pre_gypsum_height_m":2.63,"stated_gross_area_m2":186,
    "width_mm":width,"depth_mm":depth,"rooms":rooms,"wall_segments":segments,
    "wins":wins,"window_meta":window_meta,"doors":doors,"slides":slides,"passages":passages,
    "openings":opening_records,"starter_furniture":furniture,
    "status":{"room_topology":"VERIFIED_FROM_CANONICAL","metric_geometry":"INFERRED_FROM_IMAGE",
        "ceiling":"VERIFIED","living_glazing_height":"VERIFIED","furniture":"EXPLORATORY",
        "wall_thickness":"TBD","bedroom_window_heights":"TBD","door_hinge_and_head":"TBD",
        "terrace_parapets":"TBD","true_orientation":"TBD"}}
(DIST/"apartment-model.json").write_text(json.dumps(model,indent=2))
(DIST/"apartment-model.js").write_text("// Derived by generate_model.py. Never edit architectural facts here.\nconst APARTMENT_MODEL = "+json.dumps(model,separators=(",",":"))+";\n")
report={"result":"PASS","rooms":13,"openings":16,"hinged_doors":len(doors),"windows":len(wins),
    "glazed_terrace_openings":len(slides),"doorless_passages":len(passages),"wall_segments":len(segments),
    "all_spaces_reachable_from_entry":True,"source_image_hash_matches":True,"all_furniture_footprints_inside_rooms":True,
    "source_room_polygons_preserved":True,"ceiling_height_m":2.5,"living_glazing_sill_m":0,"living_glazing_head_m":2.5,
    "furniture_items":len(furniture),"limitations":["Image-calibrated concept model, not a measured survey.",
    "Printed room dimensions are source annotations; pixel-calibrated geometry is approximate.",
    "Wall thickness, door/window details and terrace parapets are visual placeholders.",
    "Furniture footprint checks do not certify circulation, accessibility or MEP feasibility."]}
(ROOT/"model-validation.json").write_text(json.dumps(report,indent=2))
print(json.dumps(report))
