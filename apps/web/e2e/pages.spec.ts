import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const SHOTS = join(__dirname, "..", "..", "..", "qa", "screens", "4-pages");
mkdirSync(SHOTS, { recursive: true });

const ROUTES = [
  "",
  "/products",
  "/products/sko-i82",
  "/products/twist-off",
  "/products/wikel-ring",
  "/brands",
  "/services",
  "/private-label",
  "/about",
  "/useful",
  "/contacts",
  "/privacy",
  "/styleguide",
];
const viewports = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
];

function slug(route: string): string {
  return route === "" ? "home" : route.slice(1).replace(/\//g, "-");
}

function watch(page: Page): string[] {
  const problems: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") problems.push(`${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  return problems;
}

/** Scroll to the bottom in steps so lazy motion triggers fire, then return to the top. */
async function reveal(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 300));
  });
}

function cases(locale: string, list: string[]) {
  for (const route of list) {
    for (const vp of viewports) {
      test(`/${locale}${route} at ${vp.name}`, async ({ page }) => {
        const problems = watch(page);
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(`/${locale}${route}`);
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await expect(page.locator("h1")).toHaveCount(1);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(1600); // hero keyframes + lazy motion engine
        await page.screenshot({ path: join(SHOTS, `${locale}-${slug(route)}-${vp.name}.png`) });
        await reveal(page);
        await page.screenshot({ path: join(SHOTS, `${locale}-${slug(route)}-${vp.name}-full.png`), fullPage: true });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, "horizontal overflow").toBeLessThanOrEqual(0);
        expect(problems).toEqual([]);
      });
    }
  }
}

cases("ru", ROUTES);
cases("uz", ["", "/products/sko-i82", "/contacts"]);
cases("en", ["", "/services"]);

test("phone header lists every section as a button", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ru");
  await expect(page.locator(".head-row a[href='/ru/contacts']")).toBeVisible();
  await page.screenshot({ path: join(SHOTS, "ru-mobile-header-390.png") });
});

test("catalogue filter hides other types", async ({ page }) => {
  await page.goto("/ru/products");
  await page.getByRole("button", { name: "Кольцо" }).click();
  await expect(page.locator("main ul li:visible h3")).toHaveCount(1);
});

test("language switch keeps the page", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ru/brands");
  await page.locator(".site-header nav.lang a", { hasText: "UZ" }).click();
  await expect(page).toHaveURL(/\/uz\/brands$/);
});

test("reduced motion: nothing is hidden by the motion layer", async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: "reduce" });
  const page = await ctx.newPage();
  await page.goto("/ru/about");
  await expect(page.locator("html")).not.toHaveClass(/\bm\b/);
  await expect(page.locator("[data-reveal]").first()).toBeVisible();
  await ctx.close();
});

for (const route of ["", "/products", "/products/twist-off", "/contacts"]) {
  test(`axe: no serious or critical violations on /ru${route}`, async ({ page }) => {
    await page.goto(`/ru${route}`);
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500);
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(
      bad.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ")) })),
    ).toEqual([]);
  });
}
