"""Run through the official Blender MCP in an existing Blender session.
Creates only an isolated Embervault scene; leaves the user's original scene active.
"""
import bpy, math, os
from mathutils import Vector
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'public', 'art')
os.makedirs(OUT, exist_ok=True)
old_scene = bpy.context.window.scene
scene = bpy.data.scenes.new('Embervault_Sprites_2D')
bpy.context.window.scene = scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x = scene.render.resolution_y = 128
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.film_transparent = True
scene.render.image_settings.color_depth = '8'
scene.world = bpy.data.worlds.new('EmbervaultWorld')
scene.world.color = (.22,.22,.22)
scene.view_settings.view_transform = 'Standard'
palette = {'skin':(.79,.48,.25),'gold':(.77,.48,.12),'steel':(.35,.49,.55),'dark':(.035,.045,.065),'wood':(.23,.10,.045),'red':(.54,.065,.045),'blue':(.055,.19,.43),'green':(.14,.32,.11),'cyan':(.28,.83,.78),'purple':(.35,.085,.53),'bone':(.91,.83,.58),'stone':(.23,.25,.24),'food':(.61,.18,.055)}
mats={}
for name,color in palette.items():
    m=bpy.data.materials.new('EV_'+name); m.diffuse_color=(*color,1);m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=(*color,1);bs.inputs['Roughness'].default_value=.72
    if name in ['gold','steel']:bs.inputs['Metallic'].default_value=.35
    mats[name]=m
current=[]
def finish(o,name,mat):
    o.name='EV_'+name;o.data.materials.append(mats[mat]);current.append(o);return o
def orb(name,loc,scale,mat):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1,radius=1,location=loc)
    o=bpy.context.object;o.scale=scale;return finish(o,name,mat)
def cone(name,loc,r1,r2,depth,mat,vertices=8):
    bpy.ops.mesh.primitive_cone_add(vertices=vertices,radius1=r1,radius2=r2,depth=depth,location=loc)
    return finish(bpy.context.object,name,mat)
def box(name,loc,scale,mat):
    bpy.ops.mesh.primitive_cube_add(size=1,location=loc);o=bpy.context.object;o.scale=scale;return finish(o,name,mat)
def rod(name,a,b,r,mat):
    a,b=Vector(a),Vector(b);o=cone(name,(a+b)/2,r,r,(b-a).length,mat);o.rotation_euler=(b-a).to_track_quat('Z','Y').to_euler();return o
def humanoid(kind,color):
    cone(kind+'Tunic',(0,0,.76),.43,.3,.78,color)
    box('belt',(0,-.03,.62),(.75,.48,.12),'gold')
    for side in [-1,1]:
        orb('boot',(side*.22,-.04,.15),(.2,.32,.19),'wood')
        orb('shoulder',(side*.43,0,1.0),(.24,.27,.23),color)
        orb('hand',(side*.51,-.09,.68),(.16,.17,.19),'skin' if kind not in ['demon','grunt'] else color)
    orb('head',(0,-.015,1.4),(.33,.3,.37),'skin' if kind not in ['demon','grunt'] else color)
    for side in [-1,1]:box('eye',(side*.105,-.29,1.45),(.085,.03,.075),'dark' if kind not in ['demon','sorcerer'] else 'gold')
def actor(kind):
    if kind=='ghost':
        cone('spectralBody',(0,0,.7),.12,.46,1.15,'cyan');orb('head',(0,0,1.35),(.43,.34,.42),'cyan')
        for side in [-1,1]:
            box('eye',(side*.14,-.3,1.44),(.13,.045,.15),'dark');orb('arm',(side*.47,0,.92),(.25,.16,.15),'cyan')
        box('mouth',(0,-.31,1.16),(.12,.03,.11),'dark');return
    col={'warrior':'red','valkyrie':'steel','wizard':'blue','elf':'green','grunt':'gold','demon':'red','sorcerer':'purple'}[kind]
    humanoid(kind,col)
    if kind in ['warrior','valkyrie']:
        orb('helmet',(0,.02,1.58),(.36,.32,.27),'gold');box('noseguard',(0,-.34,1.42),(.065,.065,.32),'gold')
    if kind=='warrior':
        rod('axeShaft',(.57,0,.25),(.68,0,1.88),.06,'wood')
        box('axeBlade',(.7,0,1.65),(.67,.12,.42),'steel');box('bladeTrim',(1.0,0,1.65),(.12,.15,.48),'bone')
        box('crest',(0,0,1.86),(.10,.4,.32),'red')
    elif kind=='valkyrie':
        rod('spear',(-.65,0,.1),(-.65,0,1.9),.045,'wood');cone('spearTip',(-.65,0,2.04),.14,0,.4,'bone')
        shield=cone('shield',(.54,-.22,.88),.38,.38,.13,'gold',12);shield.rotation_euler[0]=math.pi/2
        shield=cone('shieldInset',(.54,-.30,.88),.29,.29,.04,'blue',12);shield.rotation_euler[0]=math.pi/2
    elif kind in ['wizard','sorcerer']:
        cone('robe',(0,.07,.6),.54,.29,.95,col)
        if kind=='wizard':
            cone('hatBrim',(0,0,1.64),.6,.6,.08,'blue');cone('hatPeak',(0,.04,1.98),.37,.02,.65,'blue')
            cone('beard',(0,-.3,1.07),.02,.23,.5,'bone')
        else:
            cone('hood',(0,.045,1.63),.4,0,.7,'purple');orb('faceShadow',(0,-.26,1.4),(.25,.08,.24),'dark')
            for side in [-1,1]:orb('glowingEye',(side*.1,-.34,1.48),(.05,.035,.04),'cyan')
        rod('staff',(.65,0,.1),(.65,0,1.7),.055,'wood');orb('staffCrystal',(.65,0,1.87),(.19,.19,.25),'cyan' if kind=='wizard' else 'purple')
    elif kind=='elf':
        cone('hood',(0,.07,1.68),.37,.015,.44,'green')
        for side in [-1,1]:orb('ear',(side*.38,-.015,1.48),(.2,.09,.10),'skin')
        points=[(.68+.2*math.sin(t),-.08,.9+.62*math.cos(t)) for t in [i*math.pi/8 for i in range(9)]]
        for a,b in zip(points,points[1:]):rod('bow',a,b,.045,'wood')
        rod('bowString',points[0],points[-1],.014,'bone')
    elif kind=='grunt':
        orb('jaw',(0,-.18,1.24),(.32,.28,.19),'gold');rod('club',(.54,0,.5),(.72,0,1.64),.1,'wood');orb('clubHead',(.72,0,1.66),(.22,.22,.36),'wood')
        for side in [-1,1]:cone('tusk',(side*.18,-.37,1.28),.07,0,.22,'bone')
    elif kind=='demon':
        for side in [-1,1]:
            horn=cone('horn',(side*.32,.025,1.89),.15,0,.6,'bone');horn.rotation_euler[1]=side*.45
            orb('wing',(side*.62,.23,1.05),(.5,.08,.53),'red')
        cone('tail',(0,.43,.3),.15,0,.6,'red')
def prop(kind):
    if kind=='generator':
        cone('base',(0,0,.12),.7,.7,.24,'stone');cone('altar',(0,0,.42),.52,.46,.55,'dark')
        for i in range(4):
            t=i*math.pi/2;cone('tooth',(.46*math.cos(t),.46*math.sin(t),.9),.13,0,.8,'bone')
        orb('core',(0,0,.93),(.27,.27,.38),'purple')
    elif kind=='food':
        cone('plate',(0,0,.08),.62,.62,.10,'steel',16);orb('roast',(0,0,.31),(.45,.4,.29),'food');rod('bone',(-.6,0,.3),(.6,0,.3),.06,'bone')
    elif kind=='treasure':
        box('chest',(0,0,.33),(.85,.6,.5),'wood');orb('lid',(0,0,.6),(.56,.39,.23),'gold');box('lock',(0,-.34,.4),(.17,.1,.22),'gold')
    elif kind=='key':
        bpy.ops.mesh.primitive_torus_add(major_segments=12,minor_segments=4,location=(0,0,.7),major_radius=.28,minor_radius=.09)
        finish(bpy.context.object,'keyRing','gold');rod('keyShaft',(0,-.25,.7),(0,-.9,.7),.065,'gold');box('keyTeeth',(.13,-.78,.7),(.32,.2,.13),'gold')
    elif kind=='torch':
        cone('brazier',(0,0,.4),.27,.4,.7,'dark');orb('flame',(0,0,1.0),(.24,.24,.53),'gold');orb('flameCore',(0,-.06,.88),(.15,.15,.3),'bone')
    elif kind=='wall':
        for z in range(3):
            for x in [-.25,.25]:box('masonry',(x,0,.15+z*.3),(.48,.65,.28),'stone')
    elif kind=='floor':box('slab',(0,0,.05),(1,1,.1),'stone')
camera_data=bpy.data.cameras.new('EV_Camera');camera=bpy.data.objects.new('EV_Camera',camera_data);scene.collection.objects.link(camera);scene.camera=camera
camera.location=(0,-5,7);camera.rotation_euler=(Vector((0,0,1))-camera.location).to_track_quat('-Z','Y').to_euler();camera_data.type='ORTHO';camera_data.ortho_scale=2.9
for name,loc,power,size,color in [('Key',(-3,-4,7),550,4,(1,.84,.63)),('Fill',(3,1,5),400,3,(.55,.72,1))]:
    data=bpy.data.lights.new('EV_'+name,'AREA');data.energy=power;data.shape='DISK';data.size=size;data.color=color;o=bpy.data.objects.new('EV_'+name,data);scene.collection.objects.link(o);o.location=loc;o.rotation_euler=(Vector((0,0,1))-o.location).to_track_quat('-Z','Y').to_euler()
assets={}
try:
    for kind in ['warrior','valkyrie','wizard','elf','ghost','grunt','demon','sorcerer','generator','food','treasure','key','torch','wall','floor']:
        current=[]
        if kind in ['warrior','valkyrie','wizard','elf','ghost','grunt','demon','sorcerer']:actor(kind)
        else:prop(kind)
        assets[kind]=list(current)
        for o in current:o.hide_render=True
    for kind,objects in assets.items():
        for o in objects:o.hide_render=False
        scene.render.filepath=os.path.join(OUT,kind+'.png')
        bpy.ops.render.render(write_still=True,scene=scene.name)
        for o in objects:o.hide_render=True
    # Editable source: separate collections reveal one model at a time.
    for kind,objects in assets.items():
        coll=bpy.data.collections.new('EV_'+kind);scene.collection.children.link(coll)
        for o in objects:
            for c in list(o.users_collection):c.objects.unlink(o)
            coll.objects.link(o)
        coll['sprite_file']=kind+'.png'
    bpy.data.libraries.write(os.path.join(ROOT,'art-source','embervault-sprites.blend'),{scene},fake_user=True)
finally:
    bpy.context.window.scene=old_scene
result={'scene':scene.name,'sprites':list(assets),'output':OUT,'source':os.path.join(ROOT,'art-source','embervault-sprites.blend')}
