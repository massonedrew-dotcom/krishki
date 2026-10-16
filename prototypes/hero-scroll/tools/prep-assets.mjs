// Copies old-site assets used by the page into prototypes/hero-scroll/img as WebP:
// partner logos, the «Мечта хозяйки» logo, a pre-blurred cucumber background.
//   node prototypes/hero-scroll/tools/prep-assets.mjs
import { createRequire } from 'node:module';
import { readdirSync, mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../../..');
const pnpm = join(root, 'node_modules/.pnpm');
const require = createRequire(join(pnpm, readdirSync(pnpm).find((d) => d.startsWith('sharp@')), 'node_modules/sharp/package.json'));
const sharp = require('sharp');
const src = join(root, 'assets/reference/old-site');
const out = join(root, 'prototypes/hero-scroll/img');
mkdirSync(out, { recursive: true });

for (let i = 1; i <= 7; i++) {
  await sharp(join(src, `partner-${i}.jpg`)).trim({ background: '#ffffff', threshold: 18 })
    .resize({ height: 120, withoutEnlargement: true }).webp({ quality: 88 }).toFile(join(out, `partner-${i}.webp`));
}
await sharp(join(src, 'logo.png')).webp({ quality: 90, alphaQuality: 100 }).toFile(join(out, 'logo-mechta.webp'));
// cucumbers slide: media card in the final CTA
await sharp(join(src, 'slide-02.jpg')).resize({ width: 1200 }).webp({ quality: 78 }).toFile(join(out, 'cucumbers.webp'));
console.log(readdirSync(out).join('\n'));
