import type { LidKind, Mood } from "./types";

/*
 * Pure choreography of the living background. No three.js here: poses are plain numbers in the
 * camera's frame (camera at the origin looking down -Z), so the layout follows the viewport aspect.
 * A lid's diameter is 1 world unit before `s`.
 */

/**
 * Lid list per tier: SKO and Twist-Off only (the floating wikel ring was dropped, client 2026-10-27; the
 * ring has its own step in the hero). Lids live in the side bands of the frame, and the scene shrinks any
 * lid that comes near text (keep-out.ts).
 */
export const LIDS_DESKTOP: readonly LidKind[] = [
  "sko", "twistRed", "sko", "twistGreen", "sko", "twistRed",
  "sko", "twistGreen", "sko", "twistRed", "sko", "twistGreen",
];
export const LIDS_MOBILE: readonly LidKind[] = ["sko", "twistRed", "sko", "twistGreen", "sko", "twistRed"];

export type Pose = { x: number; y: number; z: number; rx: number; rz: number; spin: number; s: number };
/** tanH = tan(fov / 2), aspect = width / height. */
export type Frame = { tanH: number; aspect: number };
export type LidSeed = {
  i: number;
  n: number;
  nx: number;
  ny: number;
  z: number;
  s: number;
  dir: number;
  ph: [number, number, number, number];
};

export const newPose = (): Pose => ({ x: 0, y: 0, z: -8, rx: 1, rz: 0, spin: 0, s: 1 });

const fract = (v: number) => v - Math.floor(v);
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const smooth = (v: number) => v * v * (3 - 2 * v);
/** Deterministic hash in [0, 1). */
export const hash = (i: number, k: number) => fract(Math.sin(i * 127.1 + k * 311.7) * 43758.5453);
/** Shortest equivalent of angle `a` next to `ref` (spin blends must not unwind many turns). */
const near = (a: number, ref: number) => ref + (fract((a - ref) / (Math.PI * 2) + 0.5) - 0.5) * Math.PI * 2;

const halfW = (z: number, f: Frame) => -z * f.tanH * f.aspect;
const halfH = (z: number, f: Frame) => -z * f.tanH;
const portrait = (f: Frame) => f.aspect < 0.9;
/** Lids are sized against the frame height; on a portrait phone that is too wide, so they shrink. */
const sizeK = (f: Frame) => (portrait(f) ? 0.72 : 1);

/**
 * Seeds: a low-discrepancy spread (R2 sequence) so lids never clump. Every lid sits in a side band
 * (|nx| 0.7 … 1.04 of the half frame, alternating sides): the middle of the frame is where the copy is.
 */
export function makeSeeds(n: number): LidSeed[] {
  const a1 = 0.7548776662, a2 = 0.569840291;
  return Array.from({ length: n }, (_, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const nx = side * (0.7 + 0.34 * fract(0.5 + a1 * (i + 1)));
    const ny = (fract(0.5 + a2 * (i + 1)) * 2 - 1) * 0.86;
    const z = -(5.6 + 7.2 * hash(i, 3));
    return {
      i, n, nx, ny, z,
      s: 0.6 + 0.24 * hash(i, 4),
      dir: hash(i, 5) < 0.5 ? -1 : 1,
      ph: [hash(i, 6) * 6.283, hash(i, 7) * 6.283, hash(i, 8) * 6.283, hash(i, 9) * 6.283],
    };
  });
}

/** hero / fallback: lids drift slowly at different depths. */
function hero(d: LidSeed, t: number, f: Frame, o: Pose, deeper = 0) {
  const z = d.z - deeper;
  o.x = d.nx * halfW(z, f) + Math.sin(t * 0.11 + d.ph[0]) * 0.06 * -z;
  o.y = d.ny * halfH(z, f) + Math.sin(t * 0.09 + d.ph[1]) * 0.05 * -z;
  o.z = z + Math.sin(t * 0.07 + d.ph[2]) * 0.4;
  o.rx = 1.0 + 0.45 * Math.sin(t * 0.17 + d.ph[1]);
  o.rz = 0.35 * Math.sin(t * 0.13 + d.ph[2]);
  o.spin = d.ph[3] + t * 0.14 * d.dir;
  o.s = d.s * sizeK(f);
}

/** products: the lids recede a little and stay in the side bands, clear of the datasheet. */
function products(d: LidSeed, t: number, f: Frame, o: Pose) {
  hero(d, t * 0.8, f, o, 1.6);
  o.s *= 0.85;
}

/** factory: two production lines; lids advance one slot at a time, like a press feeding a conveyor. */
function factory(d: LidSeed, t: number, f: Frame, o: Pose) {
  const line = d.i % 2;
  const count = line === 0 ? Math.ceil(d.n / 2) : Math.floor(d.n / 2);
  const k = Math.floor(d.i / 2);
  const tau = t * 0.2;
  const step = Math.floor(tau) + smooth(clamp01(fract(tau) / 0.45));
  const u = fract((k + step + line * 0.5) / count);
  const z = line === 0 ? -7.2 : -10.2;
  const span = 1.3;
  if (portrait(f)) {
    o.x = (line === 0 ? -0.52 : 0.52) * halfW(z, f);
    o.y = (1 - u * 2) * span * halfH(z, f);
  } else {
    o.x = (u * 2 - 1) * span * halfW(z, f);
    o.y = (line === 0 ? -0.34 : 0.3) * halfH(z, f);
  }
  o.z = z;
  o.rx = 1.0;
  o.rz = 0;
  o.spin = 0.6;
  o.s = 0.8 * sizeK(f);
}

/** order: lids settle into low stacks in the bottom corners of the frame (clear of the form) and rest. */
function order(d: LidSeed, _t: number, f: Frame, o: Pose) {
  const p = portrait(f);
  const piles = p ? 2 : 4;
  const k = d.i % piles;
  const level = Math.floor(d.i / piles);
  const z = -(7.4 + (k % 2) * 2.0);
  const nx = p ? (k === 0 ? -0.9 : 0.9) : [-0.96, -0.76, 0.76, 0.96][k] ?? 0.9;
  const rx = 0.42;
  const s = 0.7 * sizeK(f);
  const lift = level * 0.13 * s; // a lid is ~0.105 of its diameter tall
  o.x = nx * halfW(z, f);
  o.y = (p ? -0.62 : -0.56) * halfH(z, f) + lift * Math.cos(rx);
  o.z = z + lift * Math.sin(rx);
  o.rx = rx;
  o.rz = (hash(d.i, 11) - 0.5) * 0.08;
  o.spin = d.ph[3];
  o.s = s;
}

const POSERS: Record<Mood, (d: LidSeed, t: number, f: Frame, o: Pose) => void> = { hero, products, factory, order };

const scratch: Record<Mood, Pose> = { hero: newPose(), products: newPose(), factory: newPose(), order: newPose() };

/**
 * Blends the poses of all moods with weight > 0 into `out`. `enter` (0 → 1) is the drift-in on mount:
 * lids come in from the sides they will rest on.
 */
export function blendPose(d: LidSeed, t: number, f: Frame, weights: Record<Mood, number>, enter: number, out: Pose): Pose {
  let total = 0;
  let ref: Mood = "hero";
  for (const m of Object.keys(weights) as Mood[]) {
    if (weights[m] > weights[ref]) ref = m;
  }
  out.x = out.y = out.z = out.rx = out.rz = out.spin = out.s = 0;
  POSERS[ref](d, t, f, scratch[ref]);
  const refSpin = scratch[ref].spin;
  for (const m of Object.keys(weights) as Mood[]) {
    const w = weights[m];
    if (w < 0.001) continue;
    const p = scratch[m];
    if (m !== ref) POSERS[m](d, t, f, p);
    out.x += p.x * w;
    out.y += p.y * w;
    out.z += p.z * w;
    out.rx += p.rx * w;
    out.rz += p.rz * w;
    out.spin += near(p.spin, refSpin) * w;
    out.s += p.s * w;
    total += w;
  }
  if (total > 0) {
    out.x /= total; out.y /= total; out.z /= total;
    out.rx /= total; out.rz /= total; out.spin /= total; out.s /= total;
  }
  const away = 1 - enter;
  if (away > 0) {
    out.x += away * (d.nx < 0 ? -1 : 1) * halfW(out.z, f) * 1.1;
    out.y += away * (d.ny < 0 ? -0.25 : 0.25) * halfH(out.z, f);
    out.spin += away * 1.6 * d.dir;
  }
  return out;
}

/** Frame-rate independent damping toward a target (rate in 1/s). */
export const damp = (from: number, to: number, rate: number, dt: number) => lerp(from, to, 1 - Math.exp(-rate * dt));
