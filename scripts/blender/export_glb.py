"""Export a lid scene (lid-sko.blend or lid-twist.blend) to a web GLB.

Headless, from the project root:

    "D:/Blender/blender.exe" -b assets/blender/lid-sko.blend -P scripts/blender/export_glb.py -- --out prototypes/hero-scroll/lid-sko.glb

Twist-Off with the white inside seen on the factory photos:

    "D:/Blender/blender.exe" -b assets/blender/lid-twist.blend -P scripts/blender/export_glb.py -- --out prototypes/hero-scroll/lid-twist.glb --inner-color F4F2EC --inner-metallic 0 --inner-roughness 0.35

What it does (on an in-memory copy, the .blend file is never saved):
- exports every mesh object of the scene (SKO: lid + wikel ring; Twist-Off:
  lid + plastisol), keeping the planar top UV (`UVMap`) so a lithography
  texture can be applied at runtime;
- removes the white `Lithography` placeholder texture from the outside
  material so no 1024 px blank image is embedded (base colour is kept);
- optional override of the lid's inside coating (material slot 1);
- glTF binary, Draco mesh compression, Y-up, modifiers applied, PBR materials
  (Principled -> metallicRoughness, coat -> KHR_materials_clearcoat).

Options: --out PATH (required), --draco-level N (default 7), --keep-litho,
--inner-color HEX, --inner-metallic F, --inner-roughness F.
"""

import argparse
import os
import sys

import bpy


def parse_args():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    p = argparse.ArgumentParser(description="Export lid GLB")
    p.add_argument("--out", required=True)
    p.add_argument("--draco-level", type=int, default=7)
    p.add_argument("--keep-litho", action="store_true")
    p.add_argument("--inner-color", default=None)
    p.add_argument("--inner-metallic", type=float, default=None)
    p.add_argument("--inner-roughness", type=float, default=None)
    return p.parse_args(argv)


def project_path(path):
    if os.path.isabs(path):
        return path
    return os.path.abspath(os.path.join(os.getcwd(), path))


def hex_rgba(h):
    h = h.lstrip("#")

    def lin(c):
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4

    return tuple(lin(int(h[i:i + 2], 16) / 255.0) for i in (0, 2, 4)) + (1.0,)


def principled(mat):
    if not mat or not mat.use_nodes:
        return None
    return next((n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)


def strip_litho(mat):
    """Reconnect the material's base colour to a constant and drop the image node."""
    bsdf = principled(mat)
    if bsdf is None:
        return
    nt = mat.node_tree
    if not any(n.type == "TEX_IMAGE" for n in nt.nodes):
        return
    base = bsdf.inputs["Base Color"]
    colour = None
    for link in list(base.links):
        mix = link.from_node
        if mix.type == "MIX":
            a = next((s for s in mix.inputs if s.identifier == "A_Color"), None)
            if a is not None:
                colour = tuple(a.default_value)
        nt.links.remove(link)
    for n in list(nt.nodes):
        if n.type in ("TEX_IMAGE", "UVMAP", "MIX"):
            nt.nodes.remove(n)
    if colour is not None:
        base.default_value = colour


def main():
    args = parse_args()
    out = project_path(args.out)
    os.makedirs(os.path.dirname(out), exist_ok=True)

    keep = [o for o in bpy.context.scene.objects if o.type == "MESH"]
    if not keep:
        raise SystemExit("no mesh objects in the .blend")
    print("[export_glb] meshes:", [o.name for o in keep])

    if not args.keep_litho:
        for obj in keep:
            for slot in obj.material_slots:
                strip_litho(slot.material)

    lid = next((o for o in keep if o.name.endswith("_Lid")), None)
    if lid is not None and len(lid.material_slots) > 1:
        bsdf = principled(lid.material_slots[1].material)
        if bsdf is not None:
            if args.inner_color:
                bsdf.inputs["Base Color"].default_value = hex_rgba(args.inner_color)
            if args.inner_metallic is not None:
                bsdf.inputs["Metallic"].default_value = args.inner_metallic
            if args.inner_roughness is not None:
                bsdf.inputs["Roughness"].default_value = args.inner_roughness

    bpy.ops.object.select_all(action="DESELECT")
    for obj in keep:
        obj.hide_set(False)
        obj.select_set(True)
    bpy.context.view_layer.objects.active = keep[0]

    bpy.ops.export_scene.gltf(
        filepath=out,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_yup=True,
        export_normals=True,
        export_texcoords=True,
        export_materials="EXPORT",
        export_cameras=False,
        export_lights=False,
        export_animations=False,
        export_draco_mesh_compression_enable=True,
        export_draco_mesh_compression_level=args.draco_level,
        export_draco_position_quantization=14,
        export_draco_normal_quantization=10,
        export_draco_texcoord_quantization=12,
    )
    size = os.path.getsize(out)
    print(f"[export_glb] wrote {out} ({size / 1024:.1f} KB)")


if __name__ == "__main__":
    main()
