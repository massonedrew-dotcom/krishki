import {
  Box3,
  type BufferGeometry,
  Group,
  type Material,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  type Object3D,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
  LatheGeometry,
  Vector2,
  Vector3,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { BG_ASSETS } from "./assets";
import type { LidKind } from "./types";

/** SKO I-82 outer diameter, metres. Models are in metres; the scene uses lid diameter = 1. */
const LID_D = 0.082;
/** Wikel ring: grey food rubber, matte (client, 2026-10-26 and 2026-10-27). */
export const RUBBER_GREY = "#7D8288";
/*
 * Wikel ring, built in code (replaces the GLB's thin ring, which read as a faint line on the dark stage).
 * A flat rubber band like the factory's rings (apps/web/public/images/photos/rings.webp), seated in the
 * channel under the SKO shoulder along the inner rim, so from the inside it shows as a bead all round.
 * Section in mm, in the SKO model's frame (assets/blender/README.md: shoulder z 8.5, skirt r 40.6–40.9):
 * r 35.6–40.1, z 5.6–8.2, rounded; the outer top corner follows the shoulder-to-skirt fillet so the
 * rubber never shows through the gold. TODO(client): real ring section and rubber colour.
 */
const WIKEL_R_IN = 35.6;
const WIKEL_R_OUT = 40.1;
const WIKEL_Z_LO = 5.8;
const WIKEL_Z_HI = 8.2;
/** Mid height of the ring, metres (to centre the ring on its own). */
export const WIKEL_MID_Y = ((WIKEL_Z_LO + WIKEL_Z_HI) / 2) / 1000;

function arcPts(out: Vector2[], cx: number, cz: number, r: number, a0: number, a1: number, n: number) {
  for (let i = 0; i <= n; i++) {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    out.push(new Vector2((cx + r * Math.cos(a)) / 1000, (cz + r * Math.sin(a)) / 1000));
  }
}

/** Lathe of the ring section around Y, metres, SKO model frame (y = Blender z). */
export function wikelRingGeometry(segments: number): LatheGeometry {
  const pts: Vector2[] = [];
  const ri = WIKEL_R_IN, ro = WIKEL_R_OUT, lo = WIKEL_Z_LO, hi = WIKEL_Z_HI;
  // counter-clockwise in (r, z): bottom (slightly crowned bead) → outer wall → fillet → top → inner wall
  arcPts(pts, ri + 0.6, lo + 0.6, 0.6, 180, 270, 4);
  for (let i = 1; i < 6; i++) {
    const t = i / 6;
    pts.push(new Vector2((ri + 0.6 + (ro - ri - 1.2) * t) / 1000, (lo - 0.2 * Math.sin(Math.PI * t)) / 1000));
  }
  arcPts(pts, ro - 0.6, lo + 0.6, 0.6, 270, 360, 4);
  arcPts(pts, ro - 1.1, hi - 1.1, 1.1, 0, 90, 6);
  arcPts(pts, ri + 0.5, hi - 0.5, 0.5, 90, 180, 4);
  pts.push(pts[0]!.clone()); // close the section
  const geo = new LatheGeometry(pts, segments);
  geo.computeVertexNormals();
  return geo;
}

/** Single-colour Twist-off lacquers, sampled by eye from apps/web/public/images/lids/twist-*-1600.webp. */
export const TWIST_GREEN = "#1C4A22";
export const TWIST_RED = "#B3121B";

/** A material look: the lid kinds, plus the plain red Twist-off of the reference photos (hero lid). */
export type Look = LidKind | "twistRedPlain";

export type LidRig = { kind: LidKind; root: Group; tilt: Group; spin: Group };
export type LidKit = {
  lids: LidRig[];
  /** The loaded GLB scenes, for other passes (hero lid) to clone with their own materials. */
  sources: { sko: Object3D; twist: Object3D };
  dispose: () => void;
};

export const isMesh = (o: Object3D): o is Mesh => (o as Mesh).isMesh === true;

/** Materials matched to the reference photos (satin gold lacquer, light tin inside, grey rubber). */
export function tune(m: MeshStandardMaterial, kind: Look, red: Texture | null) {
  const phys = m instanceof MeshPhysicalMaterial ? m : null;
  if (/Gold/i.test(m.name)) {
    m.color.set("#B88E3A"); // satin lacquer over tin: mid gold, not mirror
    m.metalness = 1;
    m.roughness = 0.42;
    if (phys) { phys.clearcoat = 0.25; phys.clearcoatRoughness = 0.2; }
  } else if (/Twist_Outer/i.test(m.name)) {
    if (kind === "twistRedPlain" || kind === "twistGreen") {
      m.map = null;
      m.color.set(kind === "twistGreen" ? TWIST_GREEN : TWIST_RED);
      m.metalness = 0.1;
      m.roughness = 0.32;
      m.envMapIntensity = 0.7;
      if (phys) { phys.clearcoat = 0.8; phys.clearcoatRoughness = 0.08; }
    } else if (red) {
      // litho print under lacquer: keep the red saturated in a white room
      m.map = red;
      m.color.set("#ffffff");
      m.metalness = 0;
      m.roughness = 0.3;
      m.envMapIntensity = 0.55;
      if (phys) { phys.specularIntensity = 0.3; phys.clearcoat = 0.25; phys.clearcoatRoughness = 0.08; }
    }
  } else if (/Silver/i.test(m.name)) {
    m.color.set("#AEB3B8"); // tin with clear enamel: grey-silver
    m.metalness = 0.9;
    m.roughness = 0.4;
  } else if (/Rubber/i.test(m.name)) {
    m.color.set(RUBBER_GREY);
    m.metalness = 0;
    m.roughness = 0.8;
    m.envMapIntensity = 0.45; // rubber barely reflects the white room; keeps it reading grey
    if (phys) phys.clearcoat = 0;
  } else if (/Inner/i.test(m.name)) {
    m.color.set("#F4F2EC");
    m.metalness = 0;
    m.roughness = 0.35;
  }
  m.needsUpdate = true;
}

/**
 * Swaps the GLB's thin ring of an SKO model (material «Wikel_Rubber») for the code-built ring, in the
 * model's own frame (call before normalise). Returns the new mesh; no-op (null) for models without one.
 */
export function seatWikelRing(model: Object3D, geo: BufferGeometry, mat: Material): Mesh | null {
  const old: Mesh[] = [];
  model.traverse((o) => {
    if (isMesh(o) && /Rubber/i.test((o.material as Material).name)) old.push(o);
  });
  if (old.length === 0) return null;
  for (const o of old) o.removeFromParent();
  const mesh = new Mesh(geo, mat);
  mesh.name = "WikelRing_Code";
  model.add(mesh);
  return mesh;
}

/** Centres a model and scales it to diameter 1. */
export function normalise(model: Object3D): Group {
  const box = new Box3().setFromObject(model);
  model.position.sub(box.getCenter(new Vector3()));
  const holder = new Group();
  holder.add(model);
  holder.scale.setScalar(1 / LID_D);
  return holder;
}

export async function loadLidKit(kinds: readonly LidKind[], opts: { maxAnisotropy: number; lowPoly: boolean }): Promise<LidKit> {
  const gltf = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const [sko, twist, red] = await Promise.all([
    gltf.loadAsync(BG_ASSETS.sko),
    gltf.loadAsync(BG_ASSETS.twist),
    new TextureLoader().loadAsync(BG_ASSETS.twistRed),
  ]);
  red.flipY = false; // glTF UV convention
  red.colorSpace = SRGBColorSpace;
  red.anisotropy = Math.min(8, opts.maxAnisotropy);

  const geometries = new Set<BufferGeometry>();
  const materials = new Set<Material>();

  /** One template per kind: shared geometry, materials tuned once and shared by every clone. */
  const ringGeo = wikelRingGeometry(opts.lowPoly ? 64 : 96);
  const ringMat = new MeshStandardMaterial({ color: RUBBER_GREY, roughness: 0.88, metalness: 0, envMapIntensity: 0.45 });
  geometries.add(ringGeo);
  materials.add(ringMat);

  const fromGltf = (src: Object3D, kind: LidKind) => {
    const model = src.clone(true);
    seatWikelRing(model, ringGeo, ringMat);
    model.traverse((o) => {
      if (!isMesh(o)) return;
      geometries.add(o.geometry);
      const m = (o.material as MeshStandardMaterial).clone();
      tune(m, kind, red);
      materials.add(m);
      o.material = m;
    });
    return normalise(model);
  };

  const ringMesh = new Mesh(ringGeo, ringMat);
  ringMesh.position.y = -WIKEL_MID_Y; // centred like the GLB lids
  const ring = new Group();
  ring.add(ringMesh);
  ring.scale.setScalar(1 / LID_D);

  const templates: Record<LidKind, Group> = {
    sko: fromGltf(sko.scene, "sko"),
    twistRed: fromGltf(twist.scene, "twistRed"),
    twistGreen: fromGltf(twist.scene, "twistGreen"),
    ring,
  };

  const lids = kinds.map((kind): LidRig => {
    const root = new Group();
    const tilt = new Group();
    const spin = new Group();
    root.add(tilt);
    tilt.add(spin);
    spin.add(templates[kind].clone(true));
    return { kind, root, tilt, spin };
  });

  return {
    lids,
    sources: { sko: sko.scene, twist: twist.scene },
    dispose() {
      for (const l of lids) l.root.removeFromParent();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      // the GLB scenes' own material instances were never rendered, but free them too
      for (const s of [sko.scene, twist.scene]) {
        s.traverse((o) => {
          if (isMesh(o)) {
            o.geometry.dispose();
            (o.material as Material).dispose();
          }
        });
      }
      red.dispose();
    },
  };
}
