"""Render the exported canonical scene; verify round-trip before making a PNG.
blender --background --python studio/render/blender_render.py -- --job JOB --glb GLB --output OUTPUT
"""
import argparse, hashlib, json, math, sys
from pathlib import Path
import bpy
from mathutils import Vector,Matrix,Quaternion
ROOT=Path(__file__).resolve().parents[2]
CANONICAL='734b1c36570f27baa930eec481eb109906a1f81684e6fb8f8b6a679fec2b9658'
args=argparse.ArgumentParser();args.add_argument('--job',required=True);args.add_argument('--glb',required=True);args.add_argument('--output',required=True);args.add_argument('--samples',type=int);args.add_argument('--verify-only',action='store_true');args.add_argument('--view')
a=args.parse_args(sys.argv[sys.argv.index('--')+1:]);job=json.loads(Path(a.job).read_text());model=json.loads((ROOT/'dist/apartment-model.json').read_text())
source=ROOT/'dist'/model['source_file'] if 'source_file' in model else ROOT/'dist/sources/Apartment_Master_Spec_Type_B_v0.2.2_Geometry_Heights_Glazing(1).json'
assert hashlib.sha256(source.read_bytes()).hexdigest()==CANONICAL,'Canonical source changed'
assert job['schema']=='ApartmentRenderJob/1' and job['canonical_sha256']==CANONICAL
for k in ['rooms','wall_segments','openings']:assert job['canonical_geometry'][k]==model[k],'Architecture differs: '+k
if job.get('glb_sha256'):assert hashlib.sha256(Path(a.glb).read_bytes()).hexdigest()==job['glb_sha256'],'GLB bytes differ'
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(Path(a.glb).resolve()))
def point(v):return Vector((v[0],-v[2],v[1]))
def close(v,w,tol=.0005):assert (v-w).length<tol,f'Round-trip differs: {tuple(v)} vs {tuple(w)}'
report={'schema':'ApartmentRenderRoundTrip/1','canonical_sha256':CANONICAL,'scene_revision':job['scene_revision'],'walls':0,'furniture':0,'opening_parts':0,'floors':0,'ceilings':0,'camera':{},'failures':[]}
for i,s in enumerate(model['wall_segments']):
 o=bpy.data.objects.get('canonical-wall-'+str(i));assert o and o.type=='MESH','Missing canonical wall '+str(i)
 x=(s['from'][0]+s['to'][0])/2-model['width_mm']/2;y=(s['from'][1]+s['to'][1])/2-model['depth_mm']/2
 close(o.matrix_world.translation,point([x/1000,s['height_m']/2,y/1000]))
 report['walls']+=1
for m in job['mesh_manifest']:
 o=bpy.data.objects.get(m['name']);assert o,'Missing exported object '+m['name']
 close(o.matrix_world.translation,point(m['position']))
 q=m['quaternion'];basis=Matrix(((1,0,0),(0,0,-1),(0,1,0)));expected_rotation=basis@Quaternion((q[3],q[0],q[1],q[2])).to_matrix()@basis.inverted()
 for i in range(3):close(o.matrix_world.to_quaternion().to_matrix().col[i],expected_rotation.col[i])
 if o.type=='MESH' or m.get('furniture_id'):
  descendants=[o]+list(o.children_recursive);corners=[n.matrix_world@Vector(p) for n in descendants if n.type=='MESH' for p in n.bound_box]
  if corners:
   minimum=Vector(tuple(min(v[i] for v in corners) for i in range(3)));maximum=Vector(tuple(max(v[i] for v in corners) for i in range(3)))
   expected=[point(m['bbox']['min']),point(m['bbox']['max'])];low=Vector(tuple(min(v[i] for v in expected) for i in range(3)));high=Vector(tuple(max(v[i] for v in expected) for i in range(3)))
   close(minimum,low,.003);close(maximum,high,.003)
 if m.get('opening_id'):report['opening_parts']+=1
 if m.get('floor_room_id'):
  r=next(r for r in model['rooms'] if r['id']==m['floor_room_id'])
  corners=[point([(p[0]-model['width_mm']/2)/1000,0,(p[1]-model['depth_mm']/2)/1000]) for p in r['poly']]
  for v in o.data.vertices:assert min((o.matrix_world@v.co-p).length for p in corners)<.0005,'Canonical floor polygon differs'
  report['floors']+=1
 if m.get('ceiling_room_id'):
  close(o.matrix_world.translation,point([0,model['height_m'],0]));report['ceilings']+=1
 if m.get('furniture_id'):
  f=next(f for f in job['layout']['furniture'] if f['id']==m['furniture_id'])
  close(o.matrix_world.translation,point([(f['cx']-model['width_mm']/2)/1000,0,(f['cy']-model['depth_mm']/2)/1000]))
  report['furniture']+=1
camera=bpy.data.objects.get('QA camera');assert camera and camera.type=='CAMERA';bpy.context.scene.camera=camera
close(camera.matrix_world.translation,point(job['camera']['position']))
target=point(job['camera']['target']);expected=(target-camera.matrix_world.translation).normalized();actual=camera.matrix_world.to_quaternion()@Vector((0,0,-1));assert expected.angle(actual)<.0001,'Camera direction changed'
camera.data.sensor_fit='VERTICAL';camera.data.angle=math.radians(job['camera']['fov'])
report['camera']={'eye_m':camera.matrix_world.translation.z,'vertical_fov_deg':math.degrees(camera.data.angle),'position':list(camera.matrix_world.translation),'direction':list(actual)}
assert abs(camera.matrix_world.translation.z-1.7)<.00001 and job['camera']['fov'] in [42,60]
if a.view:
 views=json.loads((ROOT/'studio/app/data/cameras.json').read_text())
 synced=ROOT/'studio/app/data/workspace-cameras.json'
 if synced.exists():views+=json.loads(synced.read_text())
 view=next(v for v in views if v['id']==a.view)
 # glTF imports cameras in quaternion mode. Euler assignment can be ignored.
 # Detach any imported parent before assigning a canonical world-space view.
 camera.parent=None;camera.rotation_mode='QUATERNION';camera.location=point(view['position'])
 direction=(point(view['target'])-camera.location).normalized()
 camera.rotation_quaternion=direction.to_track_quat('-Z','Y');camera.data.angle=math.radians(view['fov'])
 bpy.context.view_layer.update()
 close(camera.matrix_world.translation,point(view['position']))
 actual=camera.matrix_world.to_quaternion()@Vector((0,0,-1))
 assert direction.angle(actual)<.0001,'Saved render view direction differs'
 assert abs(camera.matrix_world.translation.z-1.7)<.00001 and view['fov'] in [42,60]
 assert abs(math.degrees(camera.data.angle)-view['fov'])<.0001,'Saved render view lens differs'
 report['render_camera']={'view':view['id'],'label':view['label'],'vertical_fov_deg':math.degrees(camera.data.angle),'eye_m':camera.matrix_world.translation.z,'position':list(camera.matrix_world.translation),'direction':list(actual),'verified':True}
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=a.samples or job['render']['samples'];scene.cycles.seed=job['render']['seed'];scene.cycles.use_denoising=True
scene.render.resolution_x=job['render']['width'];scene.render.resolution_y=job['render']['height'];scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX';scene.world.use_nodes=True;scene.world.node_tree.nodes.get('Background').inputs[0].default_value=(.8,.82,.85,1);scene.world.node_tree.nodes.get('Background').inputs[1].default_value=.35
# Reproducible exploratory daylight; not a fixture/sunlight engineering simulation.
sun=next((o for o in scene.objects if o.type=='LIGHT' and o.data.type=='SUN'),None)
if sun:sun.data.energy=2;sun.rotation_mode='XYZ';sun.rotation_euler=(math.radians(28),math.radians(-22),math.radians(-35));sun.data.angle=math.radians(6)
report['status']='VERIFIED geometry/camera; EXPLORATORY lighting and generic furniture';out=Path(a.output).resolve();out.mkdir(parents=True,exist_ok=True)
(out/'roundtrip.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
if not a.verify_only:
 scene.render.image_settings.file_format='PNG';scene.render.filepath=str(out/'render.png');bpy.ops.wm.save_as_mainfile(filepath=str(out/'apartment.blend'));bpy.ops.render.render(write_still=True)
