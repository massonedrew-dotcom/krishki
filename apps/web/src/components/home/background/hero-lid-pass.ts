import {
  BackSide,
  CanvasTexture,
  Color,
  DirectionalLight,
  Group,
  type Material,
  Mesh,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  type MeshStandardMaterial,
  type Object3D,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  SRGBColorSpace,
  type Texture,
  Vector2,
  type WebGLRenderer,
} from "three";
import { heroLidDrag } from "../hero-lid/store";
import { damp } from "./choreography";
import { isMesh, type Look, normalise, TWIST_GREEN, TWIST_RED, tune } from "./lid-kit";

/*
 * Hero lid, drawn by the living background's renderer (one WebGL context for the page):
 * 1. the dark warm stage of the hero section (style A «Лаковая печь»: #110F0C ground, oven glow,
 *    a slow light sweep) is painted into the hero section's rect;
 * 2. the lid is drawn into the hero slot's rect (viewport + scissor).
 * The sequence follows scroll progress through the hero: SKO top → tilt and flip to the inside with
 * the grey ring → cross-fade to the Twist-off in red → colour morph to green. Idle = slow turntable.
 */

export type HeroView = "34" | "top" | "profile" | "inside" | "edge";
export type HeroRect = { x: number; y: number; w: number; h: number };

const FOV = 20;
/** The lid fills this share of the slot width; the fallback cutout uses the same share. */
const FILL = 0.84;
const EL = 0.56; // ~32°, the angle of the sko-34 photo
/** Stage ground, display sRGB #110F0C (docs/design/style-directions.md, A). */
const GROUND: [number, number, number] = [0x11 / 255, 0x0f / 255, 0x0c / 255];

const smooth = (v: number) => {
  const c = Math.min(1, Math.max(0, v));
  return c * c * (3 - 2 * c);
};

const VIEWS: Record<HeroView, { el: number; flip: number; yaw: number }> = {
  "34": { el: EL, flip: 0, yaw: 0 },
  top: { el: 1.5603, flip: 0, yaw: 0 },
  profile: { el: 0.07, flip: 0, yaw: 0 },
  inside: { el: 0.66, flip: Math.PI, yaw: 0 },
  edge: { el: 0.1, flip: Math.PI / 2, yaw: 0.5 },
};

type HeroRig = { root: Group; flip: Group; spin: Group; mats: MeshStandardMaterial[]; op: number };

export type HeroFrame = {
  slot: HeroRect;
  /** Hero section rect to paint the dark stage into; null = no stage (lid over the page background). */
  stage: HeroRect | null;
  canvasH: number;
  dt: number;
  /** Scroll progress through the hero, 0 … 1 (already smoothed). */
  progress: number;
  time: number;
};

export type HeroLidPass = {
  render: (gl: WebGLRenderer, f: HeroFrame) => void;
  /** QA: one lid frozen in a reference photo view, white studio (matches apps/web/public/images/lids). */
  compare: (look: Look, view: HeroView) => void;
  release: () => void;
  comparing: () => boolean;
  dispose: () => void;
};

/** A dark studio: near-black room, one big warm softbox (key), a thin warm strip (rim), a dim floor bounce. */
function darkStudio(gl: WebGLRenderer): { env: Texture; dispose: () => void } {
  const room = new Scene();
  const sphere = new SphereGeometry(10, 32, 16);
  const plane = new PlaneGeometry(1, 1);
  const mats: MeshBasicMaterial[] = [];
  const add = (
    geo: SphereGeometry | PlaneGeometry,
    rgb: [number, number, number],
    at: [number, number, number],
    scale: [number, number, number],
    inside = false,
  ) => {
    const m = new MeshBasicMaterial(inside ? { side: BackSide } : {});
    m.color.setRGB(...rgb);
    mats.push(m);
    const mesh = new Mesh(geo, m);
    mesh.position.set(...at);
    mesh.scale.set(...scale);
    if (!inside) mesh.lookAt(0, 0, 0);
    room.add(mesh);
  };
  add(sphere, [0.012, 0.01, 0.008], [0, 0, 0], [1, 1, 1], true);
  // the top face seen from ~32° above reflects the room up and behind the lid: a big warm softbox there
  // is what makes the gold read as gold on a dark stage
  add(plane, [3.6, 2.9, 1.9], [0, 3.4, -5.4], [9, 5, 1]);
  add(plane, [7, 5.2, 3.2], [3.5, 5, 3.5], [4, 3, 1]); // warm key softbox, upper right front
  add(plane, [1.8, 1.25, 0.7], [-5, 1.5, -2.5], [0.7, 6, 1]); // warm rim strip, left back
  add(plane, [0.25, 0.18, 0.11], [0, -6, 0], [12, 12, 1]); // floor bounce
  const pmrem = new PMREMGenerator(gl);
  const rt = pmrem.fromScene(room, 0.03);
  pmrem.dispose();
  sphere.dispose();
  plane.dispose();
  mats.forEach((m) => m.dispose());
  return { env: rt.texture, dispose: () => rt.dispose() };
}

const stageVS = /* glsl */ `void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const stageFS = /* glsl */ `
  precision highp float;
  uniform vec2 uOrigin, uSize, uGlow;   // stage rect in drawing-buffer px; glow centre in stage uv
  uniform float uTime;
  uniform vec3 uGround;
  void main() {
    vec2 uv = (gl_FragCoord.xy - uOrigin) / uSize;
    vec2 d = (uv - uGlow) * vec2(uSize.x / uSize.y, 1.0);
    float glow = exp(-dot(d, d) * 3.2);
    vec3 col = uGround + vec3(0.13, 0.085, 0.04) * glow;                    // oven glow behind the lid
    float pos = fract(uTime / 14.0) * 2.6 - 0.8;                           // light sweep, 14 s
    float band = exp(-pow((uv.x * 0.85 + uv.y * 0.35 - pos) / 0.14, 2.0));
    col += vec3(0.05, 0.035, 0.018) * band;
    float n = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    col += (n - 0.5) / 255.0;
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function createHeroLidPass(gl: WebGLRenderer, sources: { sko: Object3D; twist: Object3D }, studioEnv: Texture): HeroLidPass {
  const dark = darkStudio(gl);
  const scene = new Scene();
  scene.environment = dark.env;
  const key = new DirectionalLight(0xffd9a0, 2.0);
  key.position.set(2, 5, 3);
  const rim = new DirectionalLight(0xffc27a, 1.1);
  rim.position.set(-3, 2, -3);
  scene.add(key, rim);
  const camera = new PerspectiveCamera(FOV, 1, 0.1, 50);

  // stage painter: one full-viewport quad in its own scene
  const stageScene = new Scene();
  const stageMat = new ShaderMaterial({
    vertexShader: stageVS,
    fragmentShader: stageFS,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uOrigin: { value: new Vector2() },
      uSize: { value: new Vector2(1, 1) },
      uGlow: { value: new Vector2(0.5, 0.5) },
      uTime: { value: 0 },
      uGround: { value: new Color().setRGB(...GROUND) },
    },
  });
  const stageGeo = new PlaneGeometry(2, 2);
  const stageQuad = new Mesh(stageGeo, stageMat);
  stageQuad.frustumCulled = false;
  stageScene.add(stageQuad);
  const ortho = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

  // contact shadow, only for the white-studio comparisons (a drop shadow on dark reads as nothing)
  const shCv = document.createElement("canvas");
  shCv.width = shCv.height = 128;
  const sx = shCv.getContext("2d");
  if (sx) {
    const g = sx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(15,27,42,.42)");
    g.addColorStop(0.5, "rgba(15,27,42,.14)");
    g.addColorStop(1, "rgba(15,27,42,0)");
    sx.fillStyle = g;
    sx.fillRect(0, 0, 128, 128);
  }
  const shTex = new CanvasTexture(shCv);
  shTex.colorSpace = SRGBColorSpace;
  const shGeo = new PlaneGeometry(1, 1);
  const shMat = new MeshBasicMaterial({ map: shTex, transparent: true, depthWrite: false, toneMapped: false });
  const shadow = new Mesh(shGeo, shMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.renderOrder = -1;
  scene.add(shadow);

  const owned = new Set<Material>([shMat, stageMat]);
  const outers: MeshStandardMaterial[] = [];
  /** Coloured lacquer: on the dark stage the big overhead softbox would mirror across the whole top. */
  const lacquers: MeshStandardMaterial[] = [];
  const lacquerLook = (stage: boolean) =>
    lacquers.forEach((m) => {
      m.envMapIntensity = stage ? 0.22 : 0.7;
      if (m instanceof MeshPhysicalMaterial) m.clearcoat = stage ? 0.35 : 0.8;
    });
  const rig = (src: Object3D, look: Look): HeroRig => {
    const model = src.clone(true);
    const mats: MeshStandardMaterial[] = [];
    model.traverse((o) => {
      if (!isMesh(o)) return;
      const m = (o.material as MeshStandardMaterial).clone();
      tune(m, look, null);
      m.transparent = true; // cross-fade; at opacity 1 depth-tested blending equals opaque
      if (/Twist_Outer/i.test(m.name)) {
        outers.push(m);
        lacquers.push(m);
      }
      owned.add(m);
      mats.push(m);
      o.material = m;
    });
    const root = new Group();
    const flip = new Group();
    const spin = new Group();
    root.add(flip);
    flip.add(spin);
    spin.add(normalise(model));
    scene.add(root);
    return { root, flip, spin, mats, op: -1 };
  };
  const sko = rig(sources.sko, "sko");
  const twist = rig(sources.twist, "twistRedPlain");
  const red = new Color(TWIST_RED);
  const green = new Color(TWIST_GREEN);
  const setTwistColour = (k: number) => outers.forEach((m) => m.color.copy(red).lerp(green, k));

  let spinT = 0;
  let yaw = 0;
  let cmp: { look: Look; view: HeroView } | null = null;
  const white = new Color("#ffffff");
  const prevClear = new Color();
  const full = new Vector2();

  const setOpacity = (r: HeroRig, op: number) => {
    if (Math.abs(op - r.op) < 0.002) return;
    r.op = op;
    r.root.visible = op > 0.002;
    for (const m of r.mats) m.opacity = op;
  };

  /** Poses the lids for this frame; returns the camera elevation. */
  function pose(dt: number, p: number): number {
    if (!heroLidDrag.active) heroLidDrag.pitch = damp(heroLidDrag.pitch, 0, 3, dt);
    yaw = damp(yaw, heroLidDrag.yaw, 8, dt);

    if (cmp) {
      const v = VIEWS[cmp.view];
      const r = cmp.look === "sko" ? sko : twist;
      setOpacity(sko, r === sko ? 1 : 0);
      setOpacity(twist, r === twist ? 1 : 0);
      setTwistColour(cmp.look === "twistGreen" ? 1 : 0);
      r.root.rotation.set(0, v.yaw, 0);
      r.root.scale.setScalar(1);
      r.flip.rotation.set(v.flip, 0, 0);
      r.spin.rotation.set(0, 0.4, 0);
      scene.environment = studioEnv;
      lacquerLook(false);
      key.intensity = 1.3;
      rim.intensity = 0.9;
      shadow.visible = v.flip === 0 && v.el < 1.4;
      shadow.position.set(0, -0.06, 0);
      shadow.scale.setScalar(1.15);
      return v.el;
    }
    scene.environment = dark.env;
    lacquerLook(true);
    key.intensity = 2.0;
    rim.intensity = 1.1;
    shadow.visible = false;

    // idle: a slow turntable; scroll drives the sequence
    spinT += dt * 0.32;
    const tilt = 0.18 * smooth(p / 0.12); // SKO top → tilts toward the viewer
    const flip = Math.PI * smooth((p - 0.14) / 0.24); // … flips to the inside (grey ring) and holds
    const toTwist = smooth((p - 0.46) / 0.12); // cross-fade SKO → Twist-off red
    const toGreen = smooth((p - 0.74) / 0.14); // colour morph red → green

    setOpacity(sko, 1 - toTwist);
    setOpacity(twist, toTwist);
    sko.root.rotation.set(0, yaw, 0);
    sko.root.scale.setScalar(1 - 0.08 * toTwist);
    sko.flip.rotation.set(flip + tilt + heroLidDrag.pitch, 0, 0);
    sko.spin.rotation.y = spinT;

    twist.root.rotation.set(0, yaw, 0);
    twist.root.scale.setScalar(0.92 + 0.08 * toTwist);
    twist.flip.rotation.set(tilt * (1 - toTwist) + heroLidDrag.pitch, 0, 0.05 * Math.sin(spinT * 0.7));
    twist.spin.rotation.y = spinT + 1.2 * (1 - toTwist); // a little turn as it arrives
    setTwistColour(toGreen);
    return EL;
  }

  return {
    render(gl, f) {
      const el = pose(f.dt, f.progress);
      const pr = gl.getPixelRatio();
      gl.setScissorTest(true);
      const autoClear = gl.autoClear;
      gl.autoClear = false;

      // 1. the dark stage over the hero section's rect
      if (f.stage && !cmp) {
        const sy = f.canvasH - f.stage.y - f.stage.h;
        gl.setViewport(f.stage.x, sy, f.stage.w, f.stage.h);
        gl.setScissor(f.stage.x, sy, f.stage.w, f.stage.h);
        const u = stageMat.uniforms;
        (u.uOrigin!.value as Vector2).set(f.stage.x * pr, sy * pr);
        (u.uSize!.value as Vector2).set(f.stage.w * pr, f.stage.h * pr);
        (u.uGlow!.value as Vector2).set(
          (f.slot.x + f.slot.w / 2 - f.stage.x) / Math.max(1, f.stage.w),
          1 - (f.slot.y + f.slot.h / 2 - f.stage.y) / Math.max(1, f.stage.h),
        );
        u.uTime!.value = f.time;
        gl.render(stageScene, ortho);
      }

      // 2. the lid into the slot
      const aspect = f.slot.w / Math.max(1, f.slot.h);
      const dist = 1 / (FILL * 2 * Math.tan((FOV * Math.PI) / 360) * Math.min(aspect, 1));
      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      camera.position.set(0, Math.sin(el) * dist, Math.cos(el) * dist);
      camera.lookAt(0, 0, 0);
      const y = f.canvasH - f.slot.y - f.slot.h; // three's viewport origin is bottom-left
      gl.setViewport(f.slot.x, y, f.slot.w, f.slot.h);
      gl.setScissor(f.slot.x, y, f.slot.w, f.slot.h);
      if (cmp) {
        gl.getClearColor(prevClear);
        const a = gl.getClearAlpha();
        gl.setClearColor(white, 1);
        gl.clear(true, true, false);
        gl.setClearColor(prevClear, a);
      } else gl.clearDepth();
      gl.render(scene, camera);

      gl.autoClear = autoClear;
      gl.setScissorTest(false);
      gl.getSize(full); // the viewport is renderer state: give the next full-screen render its own back
      gl.setViewport(0, 0, full.x, full.y);
    },
    compare(look, view) {
      cmp = { look, view };
    },
    release() {
      cmp = null;
    },
    comparing: () => cmp !== null,
    dispose() {
      for (const r of [sko, twist]) r.root.removeFromParent();
      owned.forEach((m) => m.dispose());
      shGeo.dispose();
      shTex.dispose();
      stageGeo.dispose();
      scene.environment = null;
      dark.dispose();
    },
  };
}
