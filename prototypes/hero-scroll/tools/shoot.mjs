// Playwright screenshots of the parade prototype, 1440x900 and 390x844.
// Needs the prototype served on http://localhost:4173 (npx -y serve prototypes/hero-scroll -l 4173).
//   node prototypes/hero-scroll/tools/shoot.mjs [--only 1440|390] [--rm]   (--rm = reduced-motion set)
// Uses Playwright from apps/web and the chromium headless shell with SwiftShader WebGL.
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '../../..');
const require = createRequire(join(root, 'apps/web/package.json'));
const { chromium } = require('@playwright/test');

const args = process.argv.slice(2);
const only = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const pick = args.includes('--pick') ? args[args.indexOf('--pick') + 1].split(',') : null;
const rm = args.includes('--rm');
const outDir = join(root, 'qa/screens/prototype');
mkdirSync(outDir, { recursive: true });
const URL = 'http://localhost:4173/';

// [file suffix, slide index | 'top' | section selector, offset in viewports from the slide centre]
const SHOTS = [
  ['p01-hero', 'top'],
  ['p02-gold', 0, -0.12],
  ['p03-mechta', 1, -0.15],
  ['p04-handover', 1, 0.52],
  ['p05-private-label', 4, -0.2],
  ['p06-twist-inside', 6, 0.02],
  ['p07-why', '#why'],
  ['p08-partners', '#partners'],
  ['p09-geo', '#geo'],
  ['p10-cta', '#contact'],
].filter(([n]) => !pick || pick.some((p) => n.startsWith(p)));

const sizes = [
  { name: '1440', width: 1440, height: 900, mobile: false },
  { name: '390', width: 390, height: 844, mobile: true },
].filter((s) => !only || s.name === only);

const browser = await chromium.launch({
  headless: true,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const report = {};
for (const s of sizes) {
  const ctx = await browser.newContext({
    viewport: { width: s.width, height: s.height }, deviceScaleFactor: 1,
    isMobile: s.mobile, hasTouch: s.mobile, reducedMotion: rm ? 'reduce' : 'no-preference',
  });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log(`[${s.name}] ${m.type()}: ${m.text()}`); });
  page.on('pageerror', (e) => console.log(`[${s.name}] pageerror: ${e.message}`));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  if (rm) {
    for (const [i, y] of [0, 0.25, 0.5, 0.75, 1].entries()) {
      await page.evaluate((f) => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * f), y);
      await page.waitForTimeout(400);
      await page.screenshot({ path: join(outDir, `${s.name}-rm-${i + 1}.png`) });
    }
    await ctx.close();
    continue;
  }
  let page2 = page, n = 0;
  const fresh = async () => {
    await page2.close().catch(() => {});
    page2 = await ctx.newPage();
    page2.on('pageerror', (e) => console.log(`[${s.name}] pageerror: ${e.message}`));
    await page2.goto(URL, { waitUntil: 'networkidle' });
    await page2.evaluate(() => document.fonts.ready);
    await page2.waitForFunction(() => window.__parade && window.__parade.ready(), null, { timeout: 90000 });
    await page2.waitForTimeout(1200);
  };
  for (const [name, target, off] of SHOTS) {
    if (n++ % 4 === 0) await fresh(); // SwiftShader runs out of memory on long sessions
    const page = page2;
    await page.evaluate(([t, o]) => {
      const P = window.__parade;
      let y;
      if (t === 'top') y = 0;
      else if (typeof t === 'number') y = P.slideY(t) + o * innerHeight;
      else y = document.querySelector(t).getBoundingClientRect().top + scrollY;
      P.goto(y);
    }, [target, off ?? 0]);
    await page.waitForTimeout(400);
    await page.evaluate(() => window.__parade.snap());
    await page.waitForTimeout(900);
    await page.evaluate(() => window.__parade.freeze());
    await page.screenshot({ path: join(outDir, `${s.name}-${name}.png`), timeout: 240000, animations: 'disabled' });
    await page.evaluate(() => window.__parade.resume());
  }
  report[s.name] = await page2.evaluate(() => ({ fps: window.__parade.fps.samples, gl: window.__parade.glInfo, lowTier: window.__parade.lowTier }));
  await ctx.close();
}
await browser.close();
console.log(JSON.stringify(report));
