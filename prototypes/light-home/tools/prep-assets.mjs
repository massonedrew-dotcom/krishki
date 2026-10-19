// Copies our own assets into prototypes/light-home (nothing from outside the repo).
//   node prototypes/light-home/tools/prep-assets.mjs
// Sources: prototypes/hero-scroll (GLBs, lithography texture), apps/web/public/images (logo, tubes, lid photos),
// assets/reference/old-site (production photos, client material).
import { createRequire } from 'node:module';
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const proto = resolve(here, '..');
const root = resolve(proto, '../..');
const pnpm = join(root, 'node_modules/.pnpm');
const require = createRequire(join(pnpm, readdirSync(pnpm).find((d) => d.startsWith('sharp@')), 'node_modules/sharp/package.json'));
const sharp = require('sharp');

mkdirSync(join(proto, 'img'), { recursive: true });
mkdirSync(join(proto, 'tex'), { recursive: true });

for (const f of ['lid-sko.glb', 'lid-twist.glb']) copyFileSync(join(root, 'prototypes/hero-scroll', f), join(proto, f));
copyFileSync(join(root, 'prototypes/hero-scroll/tex/twist-tomato.webp'), join(proto, 'tex/twist-tomato.webp'));

const pub = join(root, 'apps/web/public/images');
copyFileSync(join(pub, 'brand/mechta-khozyayki.webp'), join(proto, 'img/logo-mechta.webp'));
copyFileSync(join(pub, 'lid-sko-i82-cutout.webp'), join(proto, 'img/lid-sko.webp'));
copyFileSync(join(pub, 'lid-twist-off-red-cutout.webp'), join(proto, 'img/lid-twist.webp'));
for (const f of ['sko-mechta', 'twist-green-red', 'moya-mechta', 'rosa', 'gurman']) copyFileSync(join(pub, `tubes/${f}.webp`), join(proto, `img/tube-${f}.webp`));

// timeline plates: 1996 gold SKO, 2014 rings, 2016 twist-off, 2022 «Елисейские крышки» tubes
const old = join(root, 'assets/reference/old-site');
const plates = { 'production-1.jpg': 'plate-1996', 'production-9.jpg': 'plate-2014', 'production-5.jpg': 'plate-2016', 'production-11.jpg': 'plate-2022' };
for (const [src, out] of Object.entries(plates)) {
  await sharp(join(old, src)).resize({ width: 820, height: 560, fit: 'cover' }).webp({ quality: 78 }).toFile(join(proto, `img/${out}.webp`));
}
console.log('assets ready');
