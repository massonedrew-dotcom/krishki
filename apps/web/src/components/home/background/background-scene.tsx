"use client";

import { Canvas, type RootState, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Fog,
  getConsoleFunction,
  Group,
  MathUtils,
  type Mesh,
  type MeshStandardMaterial,
  type PerspectiveCamera,
  PMREMGenerator,
  setConsoleFunction,
  Vector2,
  Vector3,
} from "three";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { blendPose, damp, LIDS_DESKTOP, LIDS_MOBILE, makeSeeds, newPose, type Frame } from "./choreography";
import { heroLidLive, heroStepsScroll } from "../hero-lid/store";
import { createHeroLidPass, type HeroLidPass, type HeroView } from "./hero-lid-pass";
import { isMesh, loadLidKit, type Look, type LidKit } from "./lid-kit";
import { bindHeroScroll, bindScrollMoods, type HeroScroll, type ScrollState } from "./scroll-moods";
import { createKeepOut, type KeepOut } from "./keep-out";
import { createTinField } from "./tin-field";
import { type FrameStats, type LiveTier, type Mood, MOODS, type SectionIds } from "./types";

/*
 * The live tier of the living background: one R3F canvas, the tin field as a full-screen quad,
 * lids from two GLBs plus a code-built ring, choreographed by section moods. Loaded lazily by
 * <LivingBackground/>; never rendered on the server.
 */

const FOV = 32;
/** World units the camera travels down over the whole page. */
const TRAVEL = 2.4;
/** three mixes fog after tone mapping and sRGB encoding, so this is a display value: the field's average pearl-sky. */
const FOG_RGB: [number, number, number] = [0.93, 0.958, 0.982];

/** Fog runs 6 → 21; lids fade out by size between these depths, so none reads as a fogged silhouette. */
const HAZE_FROM = 13;
const HAZE_TO = 18;

export type BackgroundSceneProps = {
  tier: LiveTier;
  sections: SectionIds;
  /** Id of the hero slot to draw the hero lid into; null = no hero lid. */
  heroLid: string | null;
  heroScroll: HeroScroll;
  debug: boolean;
  onReady: () => void;
  onFail: (reason: string) => void;
};

type DebugApi = {
  tier: LiveTier;
  ready: () => boolean;
  mood: () => Mood;
  bound: () => Mood[];
  weights: () => Record<Mood, number>;
  stats: () => FrameStats;
  resetStats: () => void;
};

type HeroDebugApi = { compare: (look: Look, view: HeroView) => void; release: () => void; live: () => boolean };

declare global {
  interface Window {
    __livingBg?: DebugApi;
    __heroLid?: HeroDebugApi;
  }
}

const noEvents = () => ({ enabled: false, priority: 0 });

/*
 * @react-three/fiber 9.8 creates a THREE.Clock per canvas; three r183+ deprecates Clock and warns.
 * Drop exactly that one message (a version-pairing notice, not a fault of this scene); every other
 * three log goes through unchanged. Remove once R3F switches to THREE.Timer.
 */
const CLOCK_NOTICE = "THREE.Clock: This module has been deprecated";
let consoleFiltered = false;
function filterClockNotice() {
  if (consoleFiltered) return;
  consoleFiltered = true;
  const prev = getConsoleFunction();
  setConsoleFunction((type, message, ...params) => {
    if (type === "warn" && typeof message === "string" && message.startsWith(CLOCK_NOTICE)) return;
    if (prev) prev(type, message, ...params);
    else console[type](message, ...params);
  });
}

export default function BackgroundScene(props: BackgroundSceneProps) {
  const { tier, onFail } = props;
  filterClockNotice(); // before <Canvas> creates its store (its layout effect runs before ours)
  const [frameloop, setFrameloop] = useState<"always" | "never">("always");

  // pause when the tab is hidden (rAF already throttles; this also stops the GSAP-independent loop cleanly)
  useEffect(() => {
    const sync = () => setFrameloop(document.hidden ? "never" : "always");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const onCreated = (state: RootState) => {
    state.gl.toneMappingExposure = 1;
    // no synchronous shader status queries in production (a stall per program, and ANGLE/D3D info-log noise)
    state.gl.debug.checkShaderErrors = process.env.NODE_ENV !== "production";
    state.gl.domElement.addEventListener("webglcontextlost", (e) => {
      e.preventDefault();
      onFail("webgl context lost");
    });
  };

  return (
    <Canvas
      dpr={[1, 1.5]} // both tiers: 1.75 measured 47 fps on an Intel UHD iGPU at 1440 (docs/perf.md)
      gl={{ antialias: tier === "desktop", alpha: false, stencil: false, powerPreference: "high-performance" }}
      camera={{ fov: FOV, near: 0.1, far: 60, position: [0, 0, 0] }}
      frameloop={frameloop}
      events={noEvents}
      onCreated={onCreated}
    >
      <World {...props} />
    </Canvas>
  );
}

function World({ tier, sections, heroLid, heroScroll, debug, onReady, onFail }: BackgroundSceneProps) {
  // callbacks live in a ref: a new function from the parent must not reload the lids
  const cb = useRef({ onReady, onFail });
  useEffect(() => {
    cb.current = { onReady, onFail };
  }, [onReady, onFail]);
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera) as PerspectiveCamera;
  const field = useMemo(() => createTinField(), []);
  const group = useMemo(() => new Group(), []);
  const kinds = tier === "mobile" ? LIDS_MOBILE : LIDS_DESKTOP;
  const seeds = useMemo(() => makeSeeds(kinds.length), [kinds.length]);
  const kit = useRef<LidKit | null>(null);
  const hero = useRef<HeroLidPass | null>(null);
  const heroEl = useRef<HTMLElement | null>(null);
  const stageEl = useRef<HTMLElement | null>(null);
  const heroP = useRef({ hero: 0, smooth: 0 }).current;
  const fieldMesh = useRef<Mesh>(null);
  const pose = useMemo(() => newPose(), []);
  const keepOut = useRef<KeepOut | null>(null);
  /** Per lid: 1 = free, 0 = shrunk away (over text); damped. */
  const clear = useMemo(() => new Float32Array(kinds.length).fill(1), [kinds.length]);
  const proj = useMemo(() => new Vector3(), []);
  const buf = useMemo(() => new Vector2(), []);
  const S = useRef({
    scroll: { mood: "hero", progress: 0, bound: [] } as ScrollState,
    weights: { hero: 1, products: 0, factory: 0, order: 0 } as Record<Mood, number>,
    t: 0,
    enter: 0,
    readyFrames: -1,
    p: 0,
    px: 0,
    py: 0,
    pointer: { x: 0, y: 0 },
    times: [] as number[],
  }).current;

  // environment, fog, lids; everything created here is disposed here
  useEffect(() => {
    let disposed = false;
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.04);
    room.dispose();
    pmrem.dispose();
    scene.environment = env.texture;
    scene.fog = new Fog(0xffffff, 6, 21); // see HAZE_FROM / HAZE_TO
    scene.fog.color.setRGB(...FOG_RGB);
    scene.add(group);

    loadLidKit(kinds, { maxAnisotropy: gl.capabilities.getMaxAnisotropy(), lowPoly: tier === "mobile" })
      .then((k) => {
        if (disposed) return k.dispose();
        kit.current = k;
        for (const l of k.lids) {
          // material.envMapIntensity (tuned in lid-kit) only applies to a material's own envMap
          l.root.traverse((o) => {
            if (isMesh(o)) (o.material as MeshStandardMaterial).envMap = env.texture;
          });
          group.add(l.root);
        }
        hero.current = createHeroLidPass(gl, k.sources, env.texture);
        gl.compile(scene, camera);
        S.readyFrames = 0;
      })
      .catch((err: unknown) => {
        if (!disposed) cb.current.onFail(`lids: ${err instanceof Error ? err.message : String(err)}`);
      });

    return () => {
      disposed = true;
      if (heroLidLive.get()) {
        heroLidLive.set(false);
        ScrollTrigger.refresh();
      }
      hero.current?.dispose();
      hero.current = null;
      kit.current?.dispose();
      kit.current = null;
      scene.remove(group);
      scene.environment = null;
      scene.fog = null;
      env.dispose();
      field.dispose();
    };
  }, [gl, scene, camera, group, field, kinds, tier, S]);

  // section moods, and the hero sequence's scroll range
  useEffect(() => bindScrollMoods(sections, S.scroll), [sections, S]);
  const heroScrollKey = JSON.stringify(heroScroll);
  useEffect(
    () => bindHeroScroll(sections.hero, JSON.parse(heroScrollKey) as HeroScroll, heroP),
    [sections.hero, heroScrollKey, heroP],
  );

  // lids keep out of the page's text (measured from the DOM)
  useEffect(() => {
    const ko = createKeepOut();
    keepOut.current = ko;
    return () => {
      keepOut.current = null;
      ko.dispose();
    };
  }, []);

  // a little pointer parallax on fine pointers only
  useEffect(() => {
    if (tier !== "desktop" || !window.matchMedia("(pointer: fine)").matches) return;
    const move = (e: PointerEvent) => {
      S.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      S.pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [tier, S]);

  // QA hooks: frame times and mood state
  useEffect(() => {
    if (!debug) return;
    window.__livingBg = {
      tier,
      ready: () => S.enter >= 1,
      mood: () => S.scroll.mood,
      bound: () => [...S.scroll.bound],
      weights: () => ({ ...S.weights }),
      resetStats: () => {
        S.times.length = 0;
      },
      stats: () => {
        const ts = S.times;
        if (ts.length < 2) return { frames: 0, seconds: 0, fps: 0, avgMs: 0, p95Ms: 0 };
        const d = ts.slice(1).map((t, i) => t - (ts[i] ?? t)).sort((a, b) => a - b);
        const seconds = ((ts[ts.length - 1] ?? 0) - (ts[0] ?? 0)) / 1000;
        const avgMs = d.reduce((a, b) => a + b, 0) / d.length;
        return { frames: d.length, seconds, fps: d.length / seconds, avgMs, p95Ms: d[Math.floor(d.length * 0.95)] ?? 0 };
      },
    };
    window.__heroLid = {
      compare: (look, view) => hero.current?.compare(look, view),
      release: () => hero.current?.release(),
      live: () => heroLidLive.get(),
    };
    return () => {
      delete window.__livingBg;
      delete window.__heroLid;
    };
  }, [debug, tier, S]);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05); // after a pause, continue instead of jumping
    S.t += dt;
    if (debug) {
      S.times.push(performance.now());
      if (S.times.length > 1200) S.times.shift();
    }

    // ready → fade the canvas in once two frames with lids are on screen, then drift in
    if (S.readyFrames >= 0) {
      if (S.readyFrames === 2) cb.current.onReady();
      if (S.readyFrames > 2) S.enter = Math.min(1, S.enter + dt / 2.6);
      S.readyFrames++;
    }
    const enter = 1 - Math.pow(1 - S.enter, 3);

    for (const m of MOODS) S.weights[m] = damp(S.weights[m], m === S.scroll.mood ? 1 : 0, 1.3, dt);

    // camera: travels down with the page, sways a little, follows a fine pointer
    S.p = damp(S.p, S.scroll.progress, 4, dt);
    S.px = damp(S.px, S.pointer.x, 2, dt);
    S.py = damp(S.py, S.pointer.y, 2, dt);
    const camY = -S.p * TRAVEL - S.py * 0.1;
    const camX = Math.sin(S.p * Math.PI * 1.5) * 0.3 + S.px * 0.18;
    camera.position.set(camX, camY, 0);
    camera.lookAt(camX, camY - 0.08, -12);
    // the lids follow the camera with a lag: near lids slide more than far ones (parallax)
    group.position.x = damp(group.position.x, camX, 1.6, dt);
    group.position.y = damp(group.position.y, camY, 1.6, dt);

    const k = kit.current;
    if (k) {
      const frame: Frame = { tanH: Math.tan(MathUtils.degToRad(FOV / 2)), aspect: state.size.width / Math.max(1, state.size.height) };
      const ko = keepOut.current;
      const { width: vw, height: vh } = state.size;
      ko?.frame(vh);
      camera.updateMatrixWorld();
      // lids near text shrink ("smaller near copy"); over text they shrink away
      const pxPerUnit = vh / 2 / frame.tanH; // px per world unit at depth 1
      const margin = vw < 768 ? 6 : 16;
      for (let i = 0; i < k.lids.length; i++) {
        const lid = k.lids[i];
        const seed = seeds[i];
        if (!lid || !seed) continue;
        blendPose(seed, S.t, frame, S.weights, enter, pose);
        lid.root.position.set(pose.x, pose.y, pose.z);
        // a lid deep in the haze turns into a flat pale disc on the field: shrink it away before that
        const haze = MathUtils.smoothstep(-pose.z, HAZE_FROM, HAZE_TO);
        let want = 1;
        if (ko) {
          proj.set(group.position.x + pose.x, group.position.y + pose.y, pose.z).project(camera);
          const depth = Math.max(0.1, camera.position.z - pose.z);
          const r = ((0.5 * pose.s * (1 - haze)) / depth) * pxPerUnit;
          const gap = ko.gap((proj.x + 1) * 0.5 * vw, (1 - proj.y) * 0.5 * vh, r);
          want = gap < margin ? 0 : gap < r * 0.6 + margin ? 0.55 : 1;
        }
        const was = clear[i] ?? 1;
        const c = damp(was, want, want < was ? 5 : 2.2, dt); // shrink fast, grow back slowly
        clear[i] = c;
        lid.root.visible = haze < 0.999 && c > 0.01;
        lid.root.scale.setScalar(pose.s * (1 - haze) * c);
        lid.tilt.rotation.set(pose.rx, 0, pose.rz);
        lid.spin.rotation.y = pose.spin;
      }
    }

    state.gl.getDrawingBufferSize(buf);
    field.uniforms.uRes.value.copy(buf);
    field.uniforms.uTime.value = S.t;
    field.uniforms.uScroll.value = S.p;
  });

  // rendering (priority 1 takes over R3F's own render): the page background, then the hero lid
  // into the hero slot's rect with viewport + scissor on the same canvas
  useFrame((state, rawDt) => {
    const { gl: r, size } = state;
    const h = hero.current;
    const comparing = h?.comparing() ?? false;
    if (fieldMesh.current) fieldMesh.current.visible = !comparing;
    group.visible = !comparing;
    r.render(scene, camera);
    if (!h || !heroLid) return;
    if (!heroEl.current?.isConnected) heroEl.current = document.getElementById(heroLid);
    const el = heroEl.current;
    if (!el) return;
    const b = el.getBoundingClientRect();
    if (sections.hero && !stageEl.current?.isConnected) stageEl.current = document.getElementById(sections.hero);
    const sb = stageEl.current?.getBoundingClientRect() ?? null;
    const dt = Math.min(rawDt, 0.05);
    // the hero steps (hero-steps/) report their own sticky range; else the hero section's ScrollTrigger range
    const heroTarget = heroStepsScroll.driven ? heroStepsScroll.progress : heroP.hero;
    heroP.smooth = damp(heroP.smooth, heroTarget, 6, dt); // scrub with a little inertia; the turntable adds a spring
    const onScreen = (q: DOMRect) => q.width >= 8 && q.bottom > 0 && q.top < size.height && q.right > 0 && q.left < size.width;
    if (!onScreen(b) && !(sb && onScreen(sb))) return;
    h.render(r, {
      slot: { x: b.left, y: b.top, w: b.width, h: b.height },
      stage: sb ? { x: sb.left, y: sb.top, w: sb.width, h: sb.height } : null,
      canvasH: size.height,
      dt,
      progress: heroP.smooth,
      time: S.t,
    });
    // hand over from the photo (and the hero's CSS ground) only once the canvas is fully faded in
    if (S.enter > 0.55 && !heroLidLive.get()) {
      heroLidLive.set(true);
      // the hero grows to its scroll-sequence height when live (home.css): re-measure every trigger
      ScrollTrigger.refresh();
    }
  }, 1);

  return (
    <>
      <mesh ref={fieldMesh} frustumCulled={false} renderOrder={-1000} material={field}>
        <planeGeometry args={[2, 2]} />
      </mesh>
      <directionalLight position={[4, 5, 4]} intensity={1.6} color="#fff0d8" />
      <directionalLight position={[-2, 3, -5]} intensity={2.0} color="#d2e8ff" />
    </>
  );
}
