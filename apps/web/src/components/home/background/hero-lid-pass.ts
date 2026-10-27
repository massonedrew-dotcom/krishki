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
  MeshStandardMaterial,
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
import { stepLocal, stepPos } from "../hero-lid/steps";
import { damp } from "./choreography";
import { isMesh, type Look, normalise, RUBBER_GREY, seatWikelRing, TWIST_GREEN, TWIST_RED, tune, WIKEL_MID_Y, wikelRingGeometry } from "./lid-kit";

/*
 * Hero lid, drawn by the living background's renderer (one WebGL context for the page):
 * 1. the dark warm stage of the hero section (style A «Лаковая печь»: #110F0C ground, oven glow,
 *    a slow light sweep) is painted into the hero section's rect;
 * 2. the products are drawn around the hero slot's rect (viewport + scissor).
 * Three scroll steps, as in the light-home prototype: SKO I-82, Twist-Off 82 and the wikel ring stand
 * on a turntable 120° apart; scroll turns it (a spring) so the next product swings round to the front
 * while the HTML card beside it changes (hero-steps/). Within its step the SKO flips to show the inside
 * with the grey rubber ring, the Twist-Off goes from red to green. Idle = a slow spin on their own axis.
 */

export type HeroView = "34" | "top" | "profile" | "inside" | "edge";
export type HeroRect = { x: number; y: number; w: number; h: number };

const FOV = 20;
/** The lid fills this share of the slot width; the fallback cutout uses the same share. */
const FILL = 0.84;
/** Slots wider than this aspect frame the lid by their height (a lid seen from above is ~0.6 as tall as wide). */
const FRAME_ASPECT = 1.25;
const EL = 0.56; // ~32°, the angle of the sko-34 photo
/** The products swing out beyond the slot while the turntable turns: draw into a rect this much larger. */
const EXPAND_X = 1.5;
const EXPAND_Y = 1.2;
/** Turntable: radius (lid diameters), step angle, x squash at rest / while turning (keeps the side ones tucked in). */
const R = 1.1;
const STEP = (Math.PI * 2) / 3;
const SQUASH_REST = 0.32;
const SQUASH_TURN = 0.5;
/** Stage ground, display sRGB #110F0C (docs/design/style-directions.md, A). */
const GROUND: [number, number, number] = [0x11 / 255, 0x0f / 255, 0x0c / 255];

/** Emissive (linear) that keeps the matte grey rubber readable on the #110F0C stage. */
const RUBBER_GLOW: [number, number, number] = [0.032, 0.035, 0.04];
const NO_GLOW: [number, number, number] = [0, 0, 0];
/** The stage's warm key light tints rubber beige: a cooler base keeps it reading neutral grey there. */
const RUBBER_STAGE = new Color("#6E7A88");
const RUBBER_STUDIO = new Color(RUBBER_GREY);

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (v: number) => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
/** Angle wrapped to −π … π. */
const wrap = (a: number) => a - Math.PI * 2 * Math.round(a / (Math.PI * 2));

const VIEWS: Record<HeroView, { el: number; flip: number; yaw: number }> = {
  "34": { el: EL, flip: 0, yaw: 0 },
  top: { el: 1.5603, flip: 0, yaw: 0 },
  profile: { el: 0.07, flip: 0, yaw: 0 },
  inside: { el: 0.66, flip: Math.PI, yaw: 0 },
  edge: { el: 0.1, flip: Math.PI / 2, yaw: 0.5 },
};

/** root: turntable position · face: yaw toward the camera · flip: tilt / flip about X · spin: own axis. */
type HeroRig = { root: Group; face: Group; flip: Group; spin: Group; mats: MeshStandardMaterial[]; op: number };

export type HeroFrame = {
  slot: HeroRect;
  /** Hero section rect to paint the dark stage into; null = no stage (lid over the page background). */
  stage: HeroRect | null;
  canvasH: number;
  dt: number;
  /** Scroll progress through the hero steps, 0 … 1 (already smoothed). */
  progress: number;
  time: number;
};

export type HeroLidPass = {
  render: (gl: WebGLRenderer, f: HeroFrame) => void;
  /** QA: one product frozen in a reference photo view, white studio (matches apps/web/public/images/lids). */
  compare: (look: Look, view: HeroView) => void;
  release: () => void;
  comparing: () => boolean;
  dispose: () => void;
};

/** Damped spring, mass 1, fixed 1/120 s substeps (the turntable's feel, as in the prototype). */
function spring(x: number, tension = 60, friction = 14.5) {
  const s = { x, v: 0, target: x };
  return {
    s,
    step(dt: number) {
      let n = Math.max(1, Math.ceil(dt * 120));
      const h = dt / n;
      while (n--) {
        const a = -tension * (s.x - s.target) - friction * s.v;
        s.v += a * h;
        s.x += s.v * h;
      }
      return s.x;
    },
  };
}

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
  uniform vec2 uOrigin, uSize, uGlow;   // visible stage rect and glow centre, drawing-buffer px
  uniform float uRadius;                // glow radius, px (the slot width): the stage may be 3 screens tall
  uniform float uTime;
  uniform vec3 uGround;
  void main() {
    vec2 uv = (gl_FragCoord.xy - uOrigin) / uSize;
    vec2 d = (gl_FragCoord.xy - uGlow) / uRadius;
    float glow = exp(-dot(d, d) * 2.2);
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
      uGlow: { value: new Vector2() },
      uRadius: { value: 1 },
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

  // the wikel ring, built in code: seated in the SKO, and on its own as the third product
  const ringGeo = wikelRingGeometry(128);

  const owned = new Set<Material>([shMat, stageMat]);
  const outers: MeshStandardMaterial[] = [];
  /** Coloured lacquer: on the dark stage the big overhead softbox would mirror across the whole top. */
  const lacquers: MeshStandardMaterial[] = [];
  const lacquerLook = (stage: boolean) =>
    lacquers.forEach((m) => {
      m.envMapIntensity = stage ? 0.3 : 0.7;
      if (m instanceof MeshPhysicalMaterial) m.clearcoat = stage ? 0.35 : 0.8;
    });
  /** Grey rubber: the dark studio has almost nothing for it to reflect, so on the stage it gets a faint grey glow. */
  const rubbers: MeshStandardMaterial[] = [];
  const rubberLook = (stage: boolean) =>
    rubbers.forEach((m) => {
      m.emissive.setRGB(...(stage ? RUBBER_GLOW : NO_GLOW));
      m.color.copy(stage ? RUBBER_STAGE : RUBBER_STUDIO);
    });
  const rubber = () => {
    const m = new MeshStandardMaterial({ name: "Wikel_Rubber_Code", color: RUBBER_GREY, roughness: 0.88, metalness: 0, envMapIntensity: 0.45 });
    owned.add(m); // cloned per rig below; the template is freed with the rest
    return m;
  };

  const rig = (model: Object3D, look: Look): HeroRig => {
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
      if (/Rubber/i.test(m.name)) rubbers.push(m);
      owned.add(m);
      mats.push(m);
      o.material = m;
    });
    const root = new Group();
    const face = new Group();
    const flip = new Group();
    const spin = new Group();
    root.add(face);
    face.add(flip);
    flip.add(spin);
    spin.add(normalise(model));
    scene.add(root);
    return { root, face, flip, spin, mats, op: -1 };
  };

  const skoModel = sources.sko.clone(true);
  seatWikelRing(skoModel, ringGeo, rubber());
  const ringModel = new Group();
  const ringMesh = new Mesh(ringGeo, rubber());
  ringMesh.position.y = -WIKEL_MID_Y;
  ringModel.add(ringMesh);

  const sko = rig(skoModel, "sko");
  const twist = rig(sources.twist.clone(true), "twistRedPlain");
  const ring = rig(ringModel, "ring");
  const rigs = [sko, twist, ring];
  // a touch lighter than the studio red: under the warm key light on the dark stage it read as brown
  const red = new Color(TWIST_RED).offsetHSL(0, 0.12, 0.14);
  const green = new Color(TWIST_GREEN);
  const setTwistColour = (k: number) => outers.forEach((m) => m.color.copy(red).lerp(green, k));

  const turn = spring(0);
  let spinT = 0;
  let yaw = 0;
  let cmp: { look: Look; view: HeroView } | null = null;
  const white = new Color("#ffffff");
  const prevClear = new Color();
  const full = new Vector2();

  /**
   * three applies material.envMapIntensity only to a material's own envMap (scene.environment uses
   * scene.environmentIntensity), so the per-material tuning above needs the map set on each material.
   */
  let envNow: Texture | null = null;
  const setEnv = (tex: Texture) => {
    if (tex === envNow) return;
    envNow = tex;
    scene.environment = tex;
    for (const r of rigs) for (const m of r.mats) m.envMap = tex;
  };

  const setOpacity = (r: HeroRig, op: number) => {
    if (Math.abs(op - r.op) < 0.002) return;
    r.op = op;
    r.root.visible = op > 0.004;
    for (const m of r.mats) m.opacity = op;
  };

  /** Poses the products for this frame; returns the camera elevation. */
  function pose(dt: number, p: number): number {
    if (!heroLidDrag.active) heroLidDrag.pitch = damp(heroLidDrag.pitch, 0, 3, dt);
    yaw = damp(yaw, heroLidDrag.yaw, 8, dt);

    if (cmp) {
      const v = VIEWS[cmp.view];
      const r = cmp.look === "sko" ? sko : cmp.look === "ring" ? ring : twist;
      for (const x of rigs) setOpacity(x, x === r ? 1 : 0);
      setTwistColour(cmp.look === "twistGreen" ? 1 : 0);
      r.root.position.set(0, 0, 0);
      r.root.scale.setScalar(1);
      r.face.rotation.set(0, v.yaw, 0);
      r.flip.rotation.set(v.flip, 0, 0);
      r.spin.rotation.set(0, 0.4, 0);
      setEnv(studioEnv);
      lacquerLook(false);
      rubberLook(false);
      key.intensity = 1.3;
      rim.intensity = 0.9;
      shadow.visible = v.flip === 0 && v.el < 1.4;
      shadow.position.set(0, -0.06, 0);
      shadow.scale.setScalar(1.15);
      return v.el;
    }
    setEnv(dark.env);
    lacquerLook(true);
    rubberLook(true);
    key.intensity = 2.0;
    rim.intensity = 1.1;
    shadow.visible = false;

    spinT += dt * 0.32;
    turn.s.target = stepPos(p);
    const pos = turn.step(dt);
    // the turntable opens up while it turns and closes at rest, so the ones behind tuck in beside the front one
    const off = Math.abs(pos - Math.round(pos));
    const squash = SQUASH_REST + (SQUASH_TURN - SQUASH_REST) * smooth(off / 0.18);

    // within the steps: the SKO flips to its inside (the grey ring), the Twist-Off goes from red to green
    const skoFlip = Math.PI * smooth((stepLocal(p, 0) - 0.08) / 0.3);
    const toGreen = smooth((stepLocal(p, 1) - 0.3) / 0.4);
    setTwistColour(toGreen);

    for (let i = 0; i < rigs.length; i++) {
      const r = rigs[i]!;
      const th = wrap((i - pos) * STEP); // 0 = front
      const front = smooth((Math.cos(th) - 0.05) / 0.9); // 1 at the front, ½ at ±60°, 0 from ±87° away
      setOpacity(r, front);
      if (front <= 0.004) continue;
      const bob = Math.sin(spinT * 2.5 + i * 2.1) * 0.012;
      // the ones behind are lowered a little, so seen from above they pass beside the front one, not over it
      r.root.position.set(Math.sin(th) * R * squash, bob - (1 - Math.cos(th)) * R * 0.4, (Math.cos(th) - 1) * R);
      // the lone ring is shown a little smaller: tilted toward the viewer it reads taller than a lid
      r.root.scale.setScalar((0.7 + 0.3 * front) * (r === ring ? 0.9 : 1));
      // mostly faces the camera; a little of the turn shows, plus the mouse drag
      r.face.rotation.set(0, -th * 0.82 + yaw, 0);
      r.spin.rotation.y = spinT + i * 2.0;
      const pitch = heroLidDrag.pitch;
      // SKO: from the photo's angle it tilts toward the viewer, then flips over and leans in a little more to show the ring
      if (r === sko) r.flip.rotation.set(0.16 * smooth(stepLocal(p, 0) / 0.08) + skoFlip * (1 + 0.12 / Math.PI) + pitch, 0, 0);
      else if (r === twist) r.flip.rotation.set(0.16 + pitch, 0, 0.05 * Math.sin(spinT * 0.7));
      else r.flip.rotation.set(0.24 + pitch, 0, 0.06 * Math.sin(spinT * 0.9));
    }
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
        // the light sweep runs across the visible part of the stage, not its full (tall) height
        const top = Math.max(0, f.stage.y);
        const bottom = Math.min(f.canvasH, f.stage.y + f.stage.h);
        (u.uOrigin!.value as Vector2).set(f.stage.x * pr, (f.canvasH - bottom) * pr);
        (u.uSize!.value as Vector2).set(f.stage.w * pr, Math.max(1, bottom - top) * pr);
        (u.uGlow!.value as Vector2).set((f.slot.x + f.slot.w / 2) * pr, (f.canvasH - f.slot.y - f.slot.h / 2) * pr);
        u.uRadius!.value = Math.max(1, f.slot.w) * pr;
        u.uTime!.value = f.time;
        gl.render(stageScene, ortho);
      }

      // 2. the products into a rect around the slot (larger than the slot, so the turn is not cut off),
      //    scissored to the hero stage
      const ex = cmp ? 1 : EXPAND_X;
      const ey = cmp ? 1 : EXPAND_Y;
      const vw = f.slot.w * ex;
      const vh = f.slot.h * ey;
      const vx = f.slot.x - (vw - f.slot.w) / 2;
      const vyTop = f.slot.y - (vh - f.slot.h) / 2;
      const ref = Math.max(1, Math.min(f.slot.w, f.slot.h * FRAME_ASPECT)); // px across the lid ÷ FILL
      const dist = (vh / (FILL * ref)) / (2 * Math.tan((FOV * Math.PI) / 360));
      camera.aspect = vw / Math.max(1, vh);
      camera.updateProjectionMatrix();
      camera.position.set(0, Math.sin(el) * dist, Math.cos(el) * dist);
      camera.lookAt(0, 0, 0);
      const y = f.canvasH - vyTop - vh; // three's viewport origin is bottom-left
      gl.setViewport(vx, y, vw, vh);
      let sx0 = vx, sy0 = vyTop, sx1 = vx + vw, sy1 = vyTop + vh;
      if (f.stage && !cmp) {
        sx0 = Math.max(sx0, f.stage.x);
        sy0 = Math.max(sy0, f.stage.y);
        sx1 = Math.min(sx1, f.stage.x + f.stage.w);
        sy1 = Math.min(sy1, f.stage.y + f.stage.h);
      }
      gl.setScissor(sx0, f.canvasH - sy1, Math.max(0, sx1 - sx0), Math.max(0, sy1 - sy0));
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
      for (const r of rigs) r.root.removeFromParent();
      owned.forEach((m) => m.dispose());
      ringGeo.dispose();
      shGeo.dispose();
      shTex.dispose();
      stageGeo.dispose();
      scene.environment = null;
      dark.dispose();
    },
  };
}
