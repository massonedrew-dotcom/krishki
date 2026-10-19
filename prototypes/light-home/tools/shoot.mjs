// Playwright QA for the light-home prototype. Needs the server: node prototypes/light-home/tools/serve.mjs 4180
//   node prototypes/light-home/tools/shoot.mjs shots   [--only 1440|390] [--pick s01,s02]  → qa/screens/20-light-home/
//   node prototypes/light-home/tools/shoot.mjs errors                                     → console errors at 1440/1366/1280/768/390
//   node prototypes/light-home/tools/shoot.mjs fallbacks                                  → reduced-motion + no-WebGL shots
//   node prototypes/light-home/tools/shoot.mjs perf     [--gpu]                            → frame time per tier
// Uses Playwright from apps/web. Default GL is SwiftShader (software); --gpu tries the hardware ANGLE backend.
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const { chromium } = createRequire(join(root, 'apps/web/package.json'))('@playwright/test');
const out = join(root, 'qa/screens/20-light-home');
mkdirSync(out, { recursive: true });
const URL0 = 'http://localhost:4180/';
const args = process.argv.slice(2);
const mode = args[0] || 'shots';
const opt = (k) => (args.includes(k) ? args[args.indexOf(k) + 1] : null);
const GPU = args.includes('--gpu');
const launchArgs = GPU
  ? ['--enable-gpu', '--use-angle=d3d11', '--ignore-gpu-blocklist', '--enable-unsafe-webgpu']
  : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const browser = await chromium.launch({ headless: true, args: launchArgs });

const SIZES = {
  1440: { width: 1440, height: 900, mobile: false }, 1366: { width: 1366, height: 768, mobile: false },
  1280: { width: 1280, height: 800, mobile: false }, 768: { width: 768, height: 1024, mobile: true }, 390: { width: 390, height: 844, mobile: true },
};
async function open(size, { rm = false, query = '' } = {}) {
  const s = SIZES[size];
  const ctx = await browser.newContext({ viewport: { width: s.width, height: s.height }, deviceScaleFactor: 1, isMobile: s.mobile, hasTouch: s.mobile, reducedMotion: rm ? 'reduce' : 'no-preference' });
  const page = await ctx.newPage();
  const log = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') log.push(`${m.type()}: ${m.text()}`); if (m.type() === 'info' && m.text().startsWith('[light-home]')) log.push(m.text()); });
  page.on('pageerror', (e) => log.push(`pageerror: ${e.message}`));
  page.on('requestfailed', (r) => log.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));
  await page.goto(URL0 + query, { waitUntil: 'networkidle', timeout: 120000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => window.__lh && window.__lh.ready(), null, { timeout: 120000 });
  await page.waitForTimeout(1600);
  return { ctx, page, log };
}
// targets: slide index, sheet id (+ offset in viewports), or 'bottom'
async function go(page, t, off = 0) {
  await page.evaluate(([t, off]) => {
    const L = window.__lh; let y;
    if (typeof t === 'number') y = L.slideY(t);
    else if (t === 'bottom') y = document.documentElement.scrollHeight;
    else y = L.sheetTop(t);
    L.goto(y + off * innerHeight);
  }, [t, off]);
  await page.waitForTimeout(500);
  await page.evaluate(() => window.__lh.settle());
  await page.waitForTimeout(2200);
}
const SHOTS = [
  ['s01-intro', 0], ['s02-sko', 1], ['s02b-turn', 1, 0.55], ['s03-twist', 2], ['s04-ring', 3],
  ['s05-seam', 'numbers', -0.55], ['s06-numbers', 'numbers', 0.02], ['s07-line-mid', 'line', 0.7], ['s08-line-end', 'line', 1.55],
  ['s09-history', 'history', 0.3], ['s10-history-recede', 'brands', -0.45], ['s11-brands', 'brands', 0.02], ['s12-geo', 'contacts', 0.02], ['s13-cta-footer', 'bottom'],
];

if (mode === 'shots') {
  const pick = opt('--pick')?.split(',');
  for (const size of (opt('--only') ? [opt('--only')] : ['1440', '390'])) {
    let cur = null, n = 0;
    for (const [name, t, off] of SHOTS.filter(([n]) => !pick || pick.some((p) => n.startsWith(p)))) {
      if (n++ % 5 === 0) { await cur?.ctx.close(); cur = await open(size); }   // fresh page: SwiftShader memory
      await go(cur.page, t, off);
      await cur.page.evaluate(() => window.__lh.freeze());
      await cur.page.screenshot({ path: join(out, `${size}-${name}.png`), timeout: 180000 });
      await cur.page.evaluate(() => window.__lh.resume());
      console.log(`${size}-${name}`);
    }
    console.log(size, cur.log.filter((l) => !l.startsWith('[light-home]')).join('\n') || 'no console errors');
    await cur.ctx.close();
  }
}

if (mode === 'errors') {
  for (const size of ['1440', '1366', '1280', '768', '390']) {
    const { ctx, page, log } = await open(size);
    for (const t of [1, 2, 3, 'numbers', 'line', 'history', 'brands', 'contacts', 'bottom']) await go(page, t, t === 'line' ? 0.8 : 0.1);
    if (size === '390' || size === '768') { await page.click('.burger'); await page.waitForTimeout(500); await page.screenshot({ path: join(out, `${size}-menu.png`) }); await page.keyboard.press('Escape'); }
    const bad = log.filter((l) => !l.startsWith('[light-home]'));
    console.log(`${size}: ${bad.length ? bad.join(' | ') : 'no console errors / warnings'}`);
    await ctx.close();
  }
}

if (mode === 'fallbacks') {
  for (const size of ['1440', '390']) {
    for (const [tag, o] of [['rm', { rm: true }], ['nogl', { query: '?nogl' }]]) {
      const { ctx, page, log } = await open(size, o);
      const H = await page.evaluate(() => document.documentElement.scrollHeight);
      for (const [i, f] of [0, 0.12, 0.3].entries()) {
        await page.evaluate((y) => window.scrollTo(0, y), H * f);
        await page.waitForTimeout(900);
        await page.screenshot({ path: join(out, `${size}-${tag}-${i + 1}.png`) });
      }
      const st = await page.evaluate(() => ({ static: window.__lh.static, nogl: window.__lh.nogl, veil: !!document.getElementById('veil'), cls: document.documentElement.className }));
      console.log(size, tag, JSON.stringify(st), log.filter((l) => !l.startsWith('[light-home]')).join(' | ') || 'no errors');
      await ctx.close();
    }
  }
}

if (mode === 'perf') {
  for (const [size, tier, cpu] of [['1440', 'desktop', 1], ['768', 'tablet', 2], ['390', 'mobile', 4]]) {
    const { ctx, page, log } = await open(size, { query: `?tier=${tier}` });
    const cdp = await ctx.newCDPSession(page);
    if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
    // scroll the stage slowly for ~12 s so the carousel, springs and particles all work
    const t0 = Date.now();
    while (Date.now() - t0 < 12000) {
      await page.evaluate((f) => window.__lh.goto(window.__lh.slideY(0) + (window.__lh.slideY(3) - window.__lh.slideY(0)) * f), ((Date.now() - t0) / 12000));
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(3000);
    const r = await page.evaluate(() => ({ samples: window.__lh.perf.samples, gl: window.__lh.perf.gl }));
    console.log(JSON.stringify({ size, tier, cpuThrottle: cpu, gpu: GPU, ...r }));
    console.log(log.filter((l) => l.startsWith('[light-home]')).slice(-3).join('\n'));
    await ctx.close();
  }
}
await browser.close();
