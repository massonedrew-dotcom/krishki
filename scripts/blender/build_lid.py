"""Procedural lid builder for krishki.uz (ELIT KONSERVA).

Builds an SKO I-82 or Twist-Off 82 lid at real scale (1 unit = 1 m), a studio
scene and optional preview renders. Pure bpy/bmesh, no add-ons, reproducible.

Usage (headless, from the project root):
    "D:/Blender/blender.exe" -b -P scripts/blender/build_lid.py -- \
        --type sko --out assets/blender/lid-sko.blend [--render qa/screens/3d]
    "D:/Blender/blender.exe" -b -P scripts/blender/build_lid.py -- \
        --type twist --color red --out assets/blender/lid-twist.blend --render qa/screens/3d

Options:
    --type sko|twist        lid type (required)
    --out PATH              .blend output path (required)
    --color red|green       Twist-Off outside colour (default red; both materials are stored)
    --litho PATH            optional lithography image for the top face (planar UV)
    --render DIR            render preview PNGs (top 3/4, side, underside) into DIR
    --samples N             Cycles samples for previews (default 64)
    --res WxH               preview resolution (default 1200x800)
    --transparent           transparent film instead of the #0B0D10 ink background

Geometry approach: each lid is a 2D sheet-metal midline profile (r, z) with
filleted corners, revolved around Z, then thickened with Solidify (tinplate
0.22 mm). The solidify inner shell gets material slot 1 (inside coating).
All dimensions marked TODO(client) are typical values, not factory drawings.
"""

from __future__ import annotations

import argparse
import math
import os
import sys
import time

import bmesh
import bpy
from mathutils import Vector

MM = 0.001  # metres per millimetre
SHEET = 0.22 * MM  # tinplate thickness used for the model (catalog: 0.17-0.20 mm + coatings)
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
# Planar top UV projection covers a 84 mm disc: the 82 mm lid stays inside
# [0.012, 0.988], the skirt samples the outer band of the artwork (EXTEND).
UV_DIAMETER = 84.0 * MM


# ---------------------------------------------------------------------------
# Arguments
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    p = argparse.ArgumentParser(prog="build_lid.py")
    p.add_argument("--type", choices=["sko", "twist"], required=True)
    p.add_argument("--out", required=True)
    p.add_argument("--color", choices=["red", "green"], default="red")
    p.add_argument("--litho", default="")
    p.add_argument("--render", default="")
    p.add_argument("--samples", type=int, default=64)
    p.add_argument("--res", default="1200x800")
    p.add_argument("--transparent", action="store_true")
    return p.parse_args(argv)


def project_path(path: str) -> str:
    return path if os.path.isabs(path) else os.path.join(PROJECT_ROOT, path)


# ---------------------------------------------------------------------------
# 2D profile helpers (values in millimetres)
# ---------------------------------------------------------------------------

def fillet_polyline(points, max_step_deg=12.0, max_len=4.0):
    """points: [(r, z, fillet_radius)]. Returns a list of (r, z) with rounded
    corners and long straight segments split to at most max_len."""
    pts = [Vector((p[0], p[1])) for p in points]
    radii = [p[2] for p in points]
    out = [pts[0]]
    for i in range(1, len(pts) - 1):
        prev, cur, nxt = pts[i - 1], pts[i], pts[i + 1]
        d1 = (cur - prev).normalized()
        d2 = (nxt - cur).normalized()
        R = radii[i]
        turn = math.acos(max(-1.0, min(1.0, d1.dot(d2))))
        if R <= 0 or turn < 1e-4:
            out.append(cur.copy())
            continue
        t = R * math.tan(turn / 2.0)
        t = min(t, 0.49 * (cur - prev).length, 0.49 * (nxt - cur).length)
        R_eff = t / math.tan(turn / 2.0)
        t1 = cur - d1 * t
        t2 = cur + d2 * t
        cross = d1.x * d2.y - d1.y * d2.x  # >0 turning left
        n = Vector((-d1.y, d1.x)) if cross > 0 else Vector((d1.y, -d1.x))
        centre = t1 + n * R_eff
        a0 = math.atan2(t1.y - centre.y, t1.x - centre.x)
        a1 = math.atan2(t2.y - centre.y, t2.x - centre.x)
        da = a1 - a0
        while da > math.pi:
            da -= 2 * math.pi
        while da < -math.pi:
            da += 2 * math.pi
        steps = max(2, math.ceil(abs(math.degrees(da)) / max_step_deg))
        for s in range(steps + 1):
            a = a0 + da * s / steps
            out.append(Vector((centre.x + R_eff * math.cos(a), centre.y + R_eff * math.sin(a))))
    out.append(pts[-1].copy())
    # split long segments, drop near-duplicates
    res = [out[0]]
    for p in out[1:]:
        seg = p - res[-1]
        if seg.length < 1e-4:
            continue
        n = max(1, math.ceil(seg.length / max_len))
        start = res[-1].copy()
        for k in range(1, n + 1):
            res.append(start + seg * (k / n))
    return [(v.x, v.y) for v in res]


def arc(cx, cz, radius, a0_deg, a1_deg, step_deg=15.0):
    n = max(2, math.ceil(abs(a1_deg - a0_deg) / step_deg))
    return [
        (cx + radius * math.cos(math.radians(a0_deg + (a1_deg - a0_deg) * i / n)),
         cz + radius * math.sin(math.radians(a0_deg + (a1_deg - a0_deg) * i / n)))
        for i in range(n + 1)
    ]


def rounded_rect(r0, r1, z0, z1, rad, step_deg=22.5):
    """Closed counter-clockwise rounded rectangle in the (r, z) plane."""
    pts = []
    corners = [
        (r1 - rad, z0 + rad, -90, 0),
        (r1 - rad, z1 - rad, 0, 90),
        (r0 + rad, z1 - rad, 90, 180),
        (r0 + rad, z0 + rad, 180, 270),
    ]
    for cx, cz, a0, a1 in corners:
        pts += arc(cx, cz, rad, a0, a1, step_deg)
    return pts


# ---------------------------------------------------------------------------
# Revolve
# ---------------------------------------------------------------------------

def revolve(name, profile_mm, segments, closed=False, deform=None):
    """Revolve a (r, z) profile in mm around Z. If the first point has r == 0 a
    centre vertex with a triangle fan is used. deform(x, y, z, theta, r) -> (x, y, z)
    in metres may displace vertices (used for Twist-Off lugs)."""
    bm = bmesh.new()
    rings = []
    centre = None
    prof = list(profile_mm)
    if not closed and prof[0][0] < 1e-6:
        centre = bm.verts.new((0.0, 0.0, prof[0][1] * MM))
        prof = prof[1:]
    for (r, z) in prof:
        ring = []
        for j in range(segments):
            th = 2 * math.pi * j / segments
            x, y, zz = r * MM * math.cos(th), r * MM * math.sin(th), z * MM
            if deform:
                x, y, zz = deform(x, y, zz, th, r)
            ring.append(bm.verts.new((x, y, zz)))
        rings.append(ring)
    if centre is not None:
        for j in range(segments):
            bm.faces.new((centre, rings[0][j], rings[0][(j + 1) % segments]))
    count = len(rings) if closed else len(rings) - 1
    for i in range(count):
        a, b = rings[i], rings[(i + 1) % len(rings)]
        for j in range(segments):
            k = (j + 1) % segments
            bm.faces.new((a[j], b[j], b[k], a[k]))
    bm.normal_update()
    # orient normals: the highest face must point up (outside of the lid/ring)
    top = max(bm.faces, key=lambda f: f.calc_center_median().z)
    if top.normal.z < 0:
        bmesh.ops.reverse_faces(bm, faces=list(bm.faces))
    mesh = bpy.data.meshes.new(name)
    bm.to_mesh(mesh)
    bm.free()
    obj = bpy.data.objects.new(name, mesh)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def solidify_apply(obj, thickness, mat_offset=1):
    mod = obj.modifiers.new("Solidify", "SOLIDIFY")
    mod.thickness = thickness
    mod.offset = 0.0
    mod.use_even_offset = True
    mod.use_quality_normals = True
    mod.material_offset = mat_offset
    mod.material_offset_rim = mat_offset
    apply_modifiers(obj)


def apply_modifiers(obj):
    dg = bpy.context.evaluated_depsgraph_get()
    new_mesh = bpy.data.meshes.new_from_object(obj.evaluated_get(dg))
    old = obj.data
    obj.modifiers.clear()
    obj.data = new_mesh
    new_mesh.name = old.name
    bpy.data.meshes.remove(old)


def finish_mesh(obj, smooth_angle_deg=35.0):
    """Planar top UV, smooth shading with sharp edges by angle, weighted normals."""
    mesh = obj.data
    uv = mesh.uv_layers.get("UVMap") or mesh.uv_layers.new(name="UVMap")
    for loop in mesh.loops:
        co = mesh.vertices[loop.vertex_index].co
        uv.data[loop.index].uv = (0.5 + co.x / UV_DIAMETER, 0.5 + co.y / UV_DIAMETER)
    mesh.shade_smooth()
    mesh.set_sharp_from_angle(angle=math.radians(smooth_angle_deg))
    wn = obj.modifiers.new("WeightedNormal", "WEIGHTED_NORMAL")
    wn.mode = "FACE_AREA"
    wn.weight = 50
    wn.keep_sharp = True


def tri_count(obj) -> int:
    dg = bpy.context.evaluated_depsgraph_get()
    me = obj.evaluated_get(dg).to_mesh()
    me.calc_loop_triangles()
    n = len(me.loop_triangles)
    obj.evaluated_get(dg).to_mesh_clear()
    return n


# ---------------------------------------------------------------------------
# Materials
# ---------------------------------------------------------------------------

def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_rgba(h):
    h = h.lstrip("#")
    return tuple(srgb_to_linear(int(h[i:i + 2], 16) / 255.0) for i in (0, 2, 4)) + (1.0,)


def principled(name, color_hex, metallic, roughness, coat=0.0, coat_rough=0.05, litho=None):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = hex_rgba(color_hex)
    bsdf.inputs["Metallic"].default_value = metallic
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Coat Weight"].default_value = coat
    bsdf.inputs["Coat Roughness"].default_value = coat_rough
    if litho is not None:
        # Lithography slot: image (planar top UV) multiplied over the base colour.
        # Placeholder is a plain white generated image -> no visible change.
        uvn = nt.nodes.new("ShaderNodeUVMap")
        uvn.uv_map = "UVMap"
        uvn.location = (-900, 200)
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.name = tex.label = "Lithography"
        tex.image = litho
        tex.extension = "EXTEND"
        tex.location = (-650, 200)
        mix = nt.nodes.new("ShaderNodeMix")
        mix.data_type = "RGBA"
        mix.blend_type = "MULTIPLY"
        mix.label = "Litho x Base"
        mix.location = (-300, 250)
        sock_in = {s.identifier: s for s in mix.inputs}
        sock_out = {s.identifier: s for s in mix.outputs}
        sock_in["Factor_Float"].default_value = 1.0
        sock_in["A_Color"].default_value = hex_rgba(color_hex)
        nt.links.new(uvn.outputs["UV"], tex.inputs["Vector"])
        nt.links.new(tex.outputs["Color"], sock_in["B_Color"])
        nt.links.new(sock_out["Result_Color"], bsdf.inputs["Base Color"])
    return mat


def litho_image(path: str):
    if path:
        img = bpy.data.images.load(project_path(path), check_existing=True)
    else:
        img = bpy.data.images.new("litho_placeholder", 1024, 1024, alpha=False)
        img.generated_type = "BLANK"
        img.generated_color = (1.0, 1.0, 1.0, 1.0)
    img.colorspace_settings.name = "sRGB"
    return img


# Catalog-matched colours (sRGB hex). TODO(client): confirm against RAL/Pantone or a physical sample.
COLORS = {
    "sko_gold": "#D2B872",       # pale olive gold lacquer, catalog tube photo
    "sko_inside": "#A4A9AD",     # silver-grey food enamel
    "wikel": "#3A1712",          # dark red-brown rubber
    "twist_red": "#D8352B",
    "twist_green": "#1D7A3A",
    "twist_inside": "#D9D2BC",   # clear lacquer over tin (slightly warm)
    "plastisol": "#C9C2B0",      # light grey-beige compound
}


# ---------------------------------------------------------------------------
# Lid models
# ---------------------------------------------------------------------------

def build_sko(litho):
    """SKO I-82. TODO(client): exact drawing. Typical proportions used:
    outer Ø 82.0 mm over the curl, height ~8.6 mm, one raised bead rib at
    r 21-26 mm, one recessed stiffening groove at r 31-34 mm, raised shoulder
    over the wikel ring, slightly flared skirt, curl rolled inward (gold
    outside visible to the very edge), curl Ø ~1.5 mm."""
    seg = 96
    prof = fillet_polyline([
        (0.0, 7.6, 0),
        (20.5, 7.6, 1.2),
        (22.0, 8.15, 0.8),   # raised bead rib (stiffening rib 1)
        (24.5, 8.15, 0.8),
        (26.0, 7.6, 1.2),
        (31.0, 7.6, 0.9),
        (32.0, 7.05, 0.6),   # recessed groove (stiffening rib 2)
        (33.6, 7.05, 0.6),
        (35.2, 8.5, 1.0),    # rise to the shoulder above the ring
        (40.55, 8.5, 1.3),   # shoulder -> skirt corner
        (40.89, 0.75, 0),    # skirt bottom (curl start), outer surface at r 41.0
    ], max_len=4.0)
    # inward rolled curl: centre inside the skirt, midline radius 0.64 mm,
    # so the outside (gold) face stays outermost
    rc = 0.64
    curl = arc(40.89 - rc, 0.75, rc, 0, -330, step_deg=22.5)
    prof += curl[1:]
    lid = revolve("SKO_I82_Lid", prof, seg)
    lid.data.materials.append(principled("SKO_Outer_GoldLacquer", COLORS["sko_gold"], 1.0, 0.25,
                                         coat=0.6, coat_rough=0.08, litho=litho))
    lid.data.materials.append(principled("SKO_Inner_SilverEnamel", COLORS["sko_inside"], 0.75, 0.3,
                                         coat=0.4, coat_rough=0.15))
    solidify_apply(lid, SHEET)
    finish_mesh(lid)

    # Wikel ring: rubber, sits under the shoulder inside the skirt. TODO(client): ring section.
    ring_prof = rounded_rect(35.9, 39.6, 6.35, 8.33, 0.55)
    ring = revolve("SKO_WikelRing", ring_prof, seg, closed=True)
    ring.data.materials.append(principled("Wikel_Rubber", COLORS["wikel"], 0.0, 0.8))
    finish_mesh(ring, smooth_angle_deg=60.0)
    return [lid, ring]


def lug_deform(skirt_r=40.89, curl_r=0.72, curl_top=2.4, n_lugs=4, depth_mm=1.5,
               plateau_deg=5.0, falloff_deg=6.0):
    """Lugs = tabs pressed inward from the bottom curl. Only curl vertices move,
    weighted by how far inside the skirt line they are: the outer skirt and
    the outer face of the curl stay perfectly round."""
    centres = [2 * math.pi * k / n_lugs + math.pi / n_lugs for k in range(n_lugs)]

    def smooth(t):
        t = max(0.0, min(1.0, t))
        return t * t * (3 - 2 * t)

    def fn(x, y, z, th, r):
        if z / MM > curl_top or r > skirt_r - 1e-3:
            return x, y, z
        d = math.degrees(min(abs((th - c + math.pi) % (2 * math.pi) - math.pi) for c in centres))
        if d >= plateau_deg + falloff_deg:
            return x, y, z
        w = 1.0 if d <= plateau_deg else 0.5 * (1 + math.cos(math.pi * (d - plateau_deg) / falloff_deg))
        inward = smooth((skirt_r - r) / (2 * curl_r))  # 0 on the skirt line, 1 at the inner side of the curl
        k = depth_mm * w * inward
        if k <= 0:
            return x, y, z
        rr = math.hypot(x, y)
        s = (rr - k * MM) / rr
        return x * s, y * s, z

    return fn


def build_twist(litho, color):
    """Twist-Off 82. TODO(client): exact drawing. Typical proportions used:
    outer Ø 82.0 mm, height ~11 mm, skirt ~10 mm, inward rolled bottom curl,
    4 lugs pressed 1.5 mm inward, central vacuum (safety) button Ø ~17 mm
    raised ~0.7 mm, recessed centre panel, plastisol ring in the top channel."""
    seg = 128
    prof = fillet_polyline([
        (0.0, 10.1, 0),
        (6.0, 9.95, 3.0),    # safety button dome
        (8.3, 9.35, 0.7),
        (9.2, 9.2, 0.4),     # groove around the button
        (10.2, 9.4, 0.7),
        (30.0, 9.4, 1.2),    # recessed centre panel
        (32.2, 10.85, 1.0),  # rise to the shoulder (plastisol channel underneath)
        (40.89, 10.85, 1.8), # shoulder -> skirt corner
        (40.89, 1.6, 0),     # skirt bottom (curl start)
    ], max_len=4.0)
    rc = 0.72
    curl = arc(40.89 - rc, 1.6, rc, 0, -320, step_deg=22.5)  # inward roll
    prof += curl[1:]
    lid = revolve("TwistOff82_Lid", prof, seg, deform=lug_deform(skirt_r=40.89, curl_r=rc))
    red = principled("Twist_Outer_Red", COLORS["twist_red"], 0.4, 0.25, coat=0.6, coat_rough=0.04, litho=litho)
    green = principled("Twist_Outer_Green", COLORS["twist_green"], 0.4, 0.25, coat=0.6, coat_rough=0.04, litho=litho)
    red.use_fake_user = green.use_fake_user = True  # keep both variants in the .blend
    lid.data.materials.append(red if color == "red" else green)
    lid.data.materials.append(principled("Twist_Inner_ClearLacquerTin", COLORS["twist_inside"], 1.0, 0.18,
                                         coat=0.8, coat_rough=0.05))
    solidify_apply(lid, SHEET)
    finish_mesh(lid)

    # Plastisol compound: flowed ring in the channel under the shoulder,
    # thicker towards the skirt where the glass finish seats. TODO(client): compound profile.
    # Inner surface of the shoulder corner: fillet centre (39.09, 9.05), R 1.8 - half sheet.
    gap = 0.02
    top = 10.85 - SHEET / MM / 2 - gap
    r_in = 1.8 - SHEET / MM / 2 - gap
    upper = [(33.6, top)] + arc(39.09, 9.05, r_in, 90, 15, step_deg=25.0)
    end_pt = upper[-1]
    lower = fillet_polyline([
        (end_pt[0], end_pt[1], 0),
        (end_pt[0] - 0.08, 9.15, 0.3),
        (37.5, 9.5, 1.5),
        (34.6, top - 0.55, 0.6),
        (33.6, top, 0),
    ], max_step_deg=25, max_len=3.0)
    pl_prof = upper + lower[1:-1]
    pl = revolve("TwistOff82_Plastisol", pl_prof, 96, closed=True)
    pl.data.materials.append(principled("Plastisol_Compound", COLORS["plastisol"], 0.0, 0.55))
    finish_mesh(pl, smooth_angle_deg=50.0)
    return [lid, pl]


# ---------------------------------------------------------------------------
# Studio scene
# ---------------------------------------------------------------------------

INK = "#0B0D10"


def setup_world(transparent: bool):
    scene = bpy.context.scene
    world = bpy.data.worlds.new("Studio_Ink")
    scene.world = world
    world.use_nodes = True
    nt = world.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    lp = nt.nodes.new("ShaderNodeLightPath")
    mix = nt.nodes.new("ShaderNodeMixShader")
    bg_cam = nt.nodes.new("ShaderNodeBackground")
    bg_cam.inputs["Color"].default_value = hex_rgba(INK)
    bg_cam.inputs["Strength"].default_value = 1.0
    # Reflection environment: soft vertical grey gradient (darker floor, brighter sky)
    tc = nt.nodes.new("ShaderNodeTexCoord")
    sep = nt.nodes.new("ShaderNodeSeparateXYZ")
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.35
    ramp.color_ramp.elements[0].color = (0.004, 0.005, 0.006, 1)
    ramp.color_ramp.elements[1].position = 0.8
    ramp.color_ramp.elements[1].color = (0.30, 0.30, 0.31, 1)
    maprange = nt.nodes.new("ShaderNodeMapRange")
    maprange.inputs["From Min"].default_value = -1.0
    maprange.inputs["From Max"].default_value = 1.0
    bg_env = nt.nodes.new("ShaderNodeBackground")
    bg_env.inputs["Strength"].default_value = 0.9
    nt.links.new(tc.outputs["Generated"], sep.inputs["Vector"])
    nt.links.new(sep.outputs["Z"], maprange.inputs["Value"])
    nt.links.new(maprange.outputs["Result"], ramp.inputs["Fac"])
    nt.links.new(ramp.outputs["Color"], bg_env.inputs["Color"])
    nt.links.new(lp.outputs["Is Camera Ray"], mix.inputs["Fac"])
    nt.links.new(bg_env.outputs["Background"], mix.inputs[1])
    nt.links.new(bg_cam.outputs["Background"], mix.inputs[2])
    nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
    scene.render.film_transparent = transparent


def area_light(name, loc, size, energy, target=(0, 0, 0.004), size_y=None, color=(1, 1, 1)):
    data = bpy.data.lights.new(name, "AREA")
    data.energy = energy
    data.color = color
    if size_y:
        data.shape = "RECTANGLE"
        data.size, data.size_y = size, size_y
    else:
        data.shape = "DISK"
        data.size = size
    obj = bpy.data.objects.new(name, data)
    obj.location = loc
    bpy.context.scene.collection.objects.link(obj)
    direction = Vector(target) - Vector(loc)
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()
    obj.visible_camera = False
    return obj


def setup_lights():
    area_light("Key_Softbox", (-0.22, -0.18, 0.30), 0.30, 1.6, size_y=0.18)
    area_light("Top_Softbox", (0.0, 0.05, 0.40), 0.40, 1.3, size_y=0.40)
    area_light("Rim_Strip", (0.20, 0.26, 0.10), 0.40, 1.4, size_y=0.05, color=(0.95, 0.97, 1.0))
    area_light("Fill_Low", (0.25, -0.25, -0.05), 0.30, 0.4)


def make_camera(name, loc, target, lens=70.0, ortho_scale=None):
    data = bpy.data.cameras.new(name)
    data.clip_start = 0.005
    data.clip_end = 5.0
    data.sensor_width = 36.0
    if ortho_scale:
        data.type = "ORTHO"
        data.ortho_scale = ortho_scale
    else:
        data.lens = lens
    cam = bpy.data.objects.new(name, data)
    bpy.context.scene.collection.objects.link(cam)
    cam.location = loc
    con = cam.constraints.new("TRACK_TO")
    con.target = target
    con.track_axis = "TRACK_NEGATIVE_Z"
    con.up_axis = "UP_Y"
    return cam


def orbit(dist, elev_deg, azim_deg, centre_z):
    e, a = math.radians(elev_deg), math.radians(azim_deg)
    return (dist * math.cos(e) * math.sin(a), -dist * math.cos(e) * math.cos(a), centre_z + dist * math.sin(e))


def setup_scene(args):
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    scene.unit_settings.scale_length = 1.0
    scene.unit_settings.length_unit = "MILLIMETERS"
    scene.render.engine = "CYCLES"
    scene.cycles.device = "CPU"
    scene.cycles.samples = args.samples
    scene.cycles.use_adaptive_sampling = True
    scene.cycles.use_denoising = True
    scene.cycles.max_bounces = 8
    scene.cycles.glossy_bounces = 6
    w, h = (int(v) for v in args.res.lower().split("x"))
    scene.render.resolution_x, scene.render.resolution_y = w, h
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA" if args.transparent else "RGB"
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Medium High Contrast"
    setup_world(args.transparent)
    setup_lights()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    args = parse_args()
    bpy.ops.wm.read_factory_settings(use_empty=True)
    setup_scene(args)

    litho = litho_image(args.litho)
    root = bpy.data.objects.new("LidRoot", None)
    root.empty_display_size = 0.05
    bpy.context.scene.collection.objects.link(root)
    parts = build_sko(litho) if args.type == "sko" else build_twist(litho, args.color)
    for o in parts:
        o.parent = root

    height = max((o.matrix_world @ Vector(c)).z for o in parts for c in o.bound_box)
    target = bpy.data.objects.new("CamTarget", None)
    target.location = (0, 0, height * 0.45)
    bpy.context.scene.collection.objects.link(target)
    cams = {
        "top34": make_camera("CAM_Top34", orbit(0.25, 35, 20, height * 0.45), target, lens=70),
        "side": make_camera("CAM_Side_Ortho", orbit(0.25, 0, 0, height * 0.5), target, ortho_scale=0.096),
        "under": make_camera("CAM_Under34", orbit(0.25, 35, 20, height * 0.45), target, lens=70),
    }
    bpy.context.scene.camera = cams["top34"]

    tris = {o.name: tri_count(o) for o in parts}
    for name, n in tris.items():
        print(f"[build_lid] {name}: {n} tris")
    print(f"[build_lid] total: {sum(tris.values())} tris, height {height / MM:.2f} mm")

    out = project_path(args.out)
    os.makedirs(os.path.dirname(out), exist_ok=True)

    if args.render:
        rdir = project_path(args.render)
        os.makedirs(rdir, exist_ok=True)
        prefix = "sko" if args.type == "sko" else f"twist-{args.color}"
        scene = bpy.context.scene
        for view, cam in cams.items():
            scene.camera = cam
            # underside: flip the lid on X (lights stay above), restore afterwards
            root.rotation_euler = (math.pi, 0, 0) if view == "under" else (0, 0, 0)
            root.location = (0, 0, height) if view == "under" else (0, 0, 0)
            scene.render.filepath = os.path.join(rdir, f"{prefix}-{view}.png")
            t0 = time.time()
            bpy.ops.render.render(write_still=True)
            print(f"[build_lid] render {prefix}-{view}: {time.time() - t0:.1f} s -> {scene.render.filepath}")
        root.rotation_euler = (0, 0, 0)
        root.location = (0, 0, 0)
        scene.camera = cams["top34"]

    bpy.context.preferences.filepaths.save_version = 0  # no .blend1 backups
    bpy.ops.wm.save_as_mainfile(filepath=out, compress=True)
    print(f"[build_lid] saved {out}")


if __name__ == "__main__":
    main()
