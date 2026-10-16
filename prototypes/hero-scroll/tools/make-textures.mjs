// Builds circular lithography textures (1024 px WebP) for the lid tops from the
// old-site product photos: each lid top is an ellipse in the photo; we map that
// ellipse onto a circle (simple affine unwarp, bilinear sampling), sharpen,
// and write prototypes/hero-scroll/tex/<name>.webp.
//
// UV convention (scripts/blender/build_lid.py): u = 0.5 + x / 84 mm, so the
// lid's outer edge (r 41 mm) sits at radius 0.488 of the texture. Outside that
// radius the edge colour is carried outwards (the skirt samples the outer band).
//
//   node prototypes/hero-scroll/tools/make-textures.mjs [--sheet out.png]
import { createRequire } from 'node:module';
import { readdirSync, mkdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../../..');
const pnpm = join(root, 'node_modules/.pnpm');
const sharpDir = readdirSync(pnpm).find((d) => d.startsWith('sharp@'));
const require = createRequire(join(pnpm, sharpDir, 'node_modules/sharp/package.json'));
const sharp = require('sharp');

const src = join(root, 'assets/reference/old-site');
const out = join(root, 'prototypes/hero-scroll/tex');
mkdirSync(out, { recursive: true });

// lid-ellipses.json rows: name, file, cx, cy, rx, ry (semi-axes in px), rot (deg, major axis), shrink (fraction of
// the ellipse kept: <1 trims the curled rim / shadow), turn (deg, rotates the artwork upright)
const LIDS = JSON.parse(readFileSync(join(import.meta.dirname, 'lid-ellipses.json'), 'utf8'));

const R_EDGE = 0.488; // texture radius of the lid's outer edge
const SIZE = 1024;

async function build([name, file, cx, cy, rx, ry, rotDeg, shrink, turnDeg]) {
  const { data, info } = await sharp(join(src, file)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, H = info.height, C = info.channels;
  const rot = (rotDeg * Math.PI) / 180, turn = (turnDeg * Math.PI) / 180;
  const cr = Math.cos(rot), sr = Math.sin(rot), ct = Math.cos(turn), st = Math.sin(turn);
  const outBuf = Buffer.alloc(SIZE * SIZE * 3);
  const sample = (x, y, o) => {
    x = Math.min(W - 1.001, Math.max(0, x)); y = Math.min(H - 1.001, Math.max(0, y));
    const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0;
    for (let c = 0; c < 3; c++) {
      const p = (yy, xx) => data[(yy * W + xx) * C + c];
      const v = p(y0, x0) * (1 - fx) * (1 - fy) + p(y0, x0 + 1) * fx * (1 - fy) + p(y0 + 1, x0) * (1 - fx) * fy + p(y0 + 1, x0 + 1) * fx * fy;
      outBuf[o + c] = v;
    }
  };
  for (let j = 0; j < SIZE; j++) {
    for (let i = 0; i < SIZE; i++) {
      // texture v grows upwards in glTF after flip; we write image rows top->bottom = +y up in the photo
      let u = (i + 0.5) / SIZE - 0.5, v = (j + 0.5) / SIZE - 0.5;
      let r = Math.hypot(u, v) / R_EDGE;
      if (r > 1) { u /= r; v /= r; r = 1; }               // carry the edge colour outwards
      // unit-disc coords, rotated so the artwork stands upright
      const du = (u / R_EDGE) * ct - (v / R_EDGE) * st, dv = (u / R_EDGE) * st + (v / R_EDGE) * ct;
      const ex = du * rx * shrink, ey = dv * ry * shrink;
      sample(cx + ex * cr - ey * sr, cy + ex * sr + ey * cr, (j * SIZE + i) * 3);
    }
  }
  const file_out = join(out, `${name}.webp`);
  await sharp(outBuf, { raw: { width: SIZE, height: SIZE, channels: 3 } })
    .sharpen({ sigma: 1.2, m1: 0.6, m2: 2.2 })
    .modulate({ saturation: 1.06 })
    .webp({ quality: 84, effort: 6 })
    .toFile(file_out);
  return file_out;
}

for (const l of LIDS) console.log('wrote', await build(l));

const sheetIdx = process.argv.indexOf('--sheet');
if (sheetIdx > 0) {
  const T = 256, comp = [];
  for (let k = 0; k < LIDS.length; k++) {
    comp.push({ input: await sharp(join(out, `${LIDS[k][0]}.webp`)).resize(T, T).toBuffer(), left: (k % 5) * (T + 6), top: Math.floor(k / 5) * (T + 6) });
  }
  await sharp({ create: { width: 5 * (T + 6), height: Math.ceil(LIDS.length / 5) * (T + 6), channels: 3, background: '#333' } })
    .composite(comp).png().toFile(process.argv[sheetIdx + 1]);
}

// Ibrat: every photo of this lid is partly covered by another lid, so the top is
// redrawn as a flat SVG after production-2/3 (dark plum lid, red oval + ring text).
{
  const S = SIZE, c = S / 2, R = R_EDGE * S;
  // glyphs placed one by one along an arc (sharp's SVG renderer has no textPath)
  const arcText = (str, radius, size, top) => {
    const adv = size * 0.74, total = adv * (str.length - 1), out = [];
    for (let k = 0; k < str.length; k++) {
      const off = (k * adv - total / 2) / radius;              // radians from the vertical
      const ang = top ? -Math.PI / 2 + off : Math.PI / 2 - off;
      const x = c + Math.cos(ang) * radius, y = c + Math.sin(ang) * radius;
      const rotDeg = (top ? off : -off) * 180 / Math.PI;
      out.push(`<text x="${x}" y="${y}" transform="rotate(${rotDeg} ${x} ${y})" text-anchor="middle" dominant-baseline="middle" font-family="Georgia, serif" font-weight="700" font-size="${size}" fill="#d1352c">${str[k]}</text>`);
    }
    return out.join('');
  };
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${S}" height="${S}">
    <rect width="${S}" height="${S}" fill="#231a2b"/>
    <circle cx="${c}" cy="${c}" r="${R * 0.985}" fill="none" stroke="#3a2c40" stroke-width="${R * 0.05}"/>
    ${arcText("НАТУРАЛЬНЫЙ ПРОДУКТ", R * 0.72, R * 0.14, true)}
    ${arcText("ГАРАНТИЯ КАЧЕСТВА", R * 0.72, R * 0.13, false)}
    <ellipse cx="${c}" cy="${c}" rx="${R * 0.56}" ry="${R * 0.27}" fill="none" stroke="#d1352c" stroke-width="${R * 0.025}"/>
    <text x="${c}" y="${c + R * 0.1}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-weight="900" font-size="${R * 0.3}" fill="#d1352c" font-style="italic">ibrat</text>
    <text x="${c - R * 0.66}" y="${c + R * 0.04}" text-anchor="middle" font-family="Georgia, serif" font-size="${R * 0.07}" font-weight="700" fill="#d1352c">100%</text>
    <text x="${c + R * 0.66}" y="${c + R * 0.04}" text-anchor="middle" font-family="Georgia, serif" font-size="${R * 0.07}" font-weight="700" fill="#d1352c">100%</text>
  </svg>`;
  const f = join(out, 'ibrat.webp');
  await sharp(Buffer.from(svg)).webp({ quality: 86 }).toFile(f);
  console.log('wrote', f);
}
