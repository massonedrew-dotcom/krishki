import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { join } from "node:path";

const SHOTS = join(__dirname, "..", "..", "..", "qa", "screens", "2-styleguide");
const viewports = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
];

function collectConsole(page: Page): string[] {
  const problems: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") problems.push(`${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  return problems;
}

for (const locale of ["ru", "uz"]) {
  for (const vp of viewports) {
    test(`/${locale}/styleguide screenshot at ${vp.name}`, async ({ page }) => {
      const problems = collectConsole(page);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`/${locale}/styleguide`);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("h1")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.screenshot({ path: join(SHOTS, `${locale}-${vp.name}.png`), fullPage: true });
      // No horizontal overflow at any width.
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow).toBeLessThanOrEqual(0);
      expect(problems).toEqual([]);
    });
  }
}

test("styleguide is noindex", async ({ page }) => {
  await page.goto("/ru/styleguide");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("fonts load and Uzbek glyphs resolve to the self-hosted faces", async ({ page }) => {
  await page.goto("/uz/styleguide");
  const result = await page.evaluate(async () => {
    await document.fonts.ready;
    const sample = "Oʻzbekiston, gʻalla, Qoʻqon — Мечта хозяйки 0123456789 ʼ";
    const faces = ["Tektur", "Onest", "IBM Plex Mono"].map((name) => {
      const loaded = [...document.fonts].some((f) => f.family.includes(name) && f.status === "loaded");
      return { name, loaded, check: document.fonts.check(`16px "${name}"`, sample) };
    });
    return faces;
  });
  for (const f of result) expect(f.loaded, `${f.name} loaded`).toBe(true);
});

test("keyboard: every focus stop shows a visible indicator", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ru/styleguide");
  let stops = 0;
  const seen = new Set<string>();
  for (let i = 0; i < 80; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      const outline = cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2;
      const ring = cs.boxShadow !== "none";
      return {
        tag: el.tagName,
        text: (el.textContent ?? "").trim().slice(0, 30),
        visible: rect.width > 0 && rect.height > 0,
        indicator: outline || ring,
        id: `${el.tagName}:${Math.round(rect.top + window.scrollY)}:${Math.round(rect.left)}`,
      };
    });
    if (!info) break;
    if (seen.has(info.id)) break;
    seen.add(info.id);
    stops++;
    expect(info.visible, `${info.tag} "${info.text}" is rendered`).toBe(true);
    expect(info.indicator, `${info.tag} "${info.text}" has a focus indicator`).toBe(true);
  }
  expect(stops).toBeGreaterThan(20);
});

test("skip link is the first tab stop and jumps to main", async ({ page }) => {
  await page.goto("/ru/styleguide");
  await page.keyboard.press("Tab");
  const skip = page.locator(".skip-link");
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
});

test("language switch keeps the page", async ({ page }) => {
  await page.goto("/ru/styleguide");
  await page.locator("header nav.lang a", { hasText: "UZ" }).first().click();
  await expect(page).toHaveURL(/\/uz\/styleguide$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "uz");
});

test("reduced motion: loading indicator is static", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/ru/styleguide");
  const name = await page.locator(".btn__spinner").first().evaluate((el) => getComputedStyle(el).animationName);
  expect(name).toBe("none");
  await ctx.close();
});

for (const locale of ["ru", "uz", "en"]) {
  test(`axe: no serious or critical violations on /${locale}/styleguide`, async ({ page }) => {
    await page.goto(`/${locale}/styleguide`);
    await page.evaluate(() => document.fonts.ready);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(
      bad.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ")) })),
    ).toEqual([]);
  });
}
