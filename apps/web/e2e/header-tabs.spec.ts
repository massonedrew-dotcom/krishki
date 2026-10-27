import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

/** Ticket 24: two-row header and the /distributors, /order, /suppliers pages. */
const SHOTS = join(__dirname, "..", "..", "..", "qa", "screens", "24-header-tabs");
mkdirSync(SHOTS, { recursive: true });

const LOCALES = ["ru", "uz", "en"] as const;
const PAGES = [
  { slug: "home", path: "" },
  { slug: "distributors", path: "/distributors" },
  { slug: "order", path: "/order" },
  { slug: "suppliers", path: "/suppliers" },
];
const VIEWPORTS = [
  { name: "1440", width: 1440, height: 900 },
  { name: "1280", width: 1280, height: 800 },
  { name: "390", width: 390, height: 844 },
];

function watch(page: Page): string[] {
  const problems: string[] = [];
  page.on("console", (m) => {
    if (m.type() === "error" || m.type() === "warning") problems.push(`${m.type()}: ${m.text()}`);
  });
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  return problems;
}

async function settle(page: Page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1400);
}

async function revealAll(page: Page) {
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.7;
    for (let y = 0, n = 0; y < document.documentElement.scrollHeight && n < 40; y += step, n++) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 300));
  });
}

for (const locale of LOCALES) {
  for (const p of PAGES) {
    for (const vp of VIEWPORTS) {
      test(`shot /${locale}${p.path} at ${vp.name}`, async ({ page }) => {
        const problems = watch(page);
        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(`/${locale}${p.path}`);
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await expect(page.locator("h1")).toHaveCount(1);
        await settle(page);
        await page.screenshot({ path: join(SHOTS, `${locale}-${p.slug}-${vp.name}.png`) });
        await revealAll(page);
        await page.screenshot({ path: join(SHOTS, `${locale}-${p.slug}-${vp.name}-full.png`), fullPage: true });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, "horizontal overflow").toBeLessThanOrEqual(0);
        expect(problems).toEqual([]);
      });
    }
  }
}

for (const locale of LOCALES) {
  test(`section buttons row at 390 (${locale})`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${locale}`);
    await settle(page);
    const row = page.locator(".head-row");
    await expect(row).toBeVisible();
    await page.screenshot({ path: join(SHOTS, `${locale}-header-390.png`) });
    // No burger: every section and audience page is a button in the second header row.
    await expect(page.locator(".burger")).toHaveCount(0);
    for (const href of ["/products", "/about", "/services", "/brands", "/contacts", "/distributors", "/suppliers"]) {
      await expect(row.locator(`a[href='/${locale}${href}']`)).toHaveCount(1);
    }
    await expect(page.locator(".header-order")).toBeVisible();
  });
}

test("1440: one sticky row with sections, audience buttons, language and order", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ru");
  await settle(page);
  await expect(page.locator(".topbar")).toHaveCount(0);
  await expect(page.locator(".head-row")).toBeHidden();
  await expect(page.locator(".header-order")).toBeVisible();
  await expect(page.locator(".site-header .head-btn:visible", { hasText: "Дистрибьюторам" })).toBeVisible();
  await expect(page.locator(".site-header .head-btn:visible", { hasText: "Поставщикам" })).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 1400));
  await page.waitForTimeout(700);
  const header = await page.locator(".site-header").boundingBox();
  expect(header?.y ?? 99).toBeLessThanOrEqual(1);
  await expect(page.locator(".header-order")).toBeVisible();
  await page.screenshot({ path: join(SHOTS, "ru-sticky-scrolled-1440.png") });
});

test("the second row shows below 1280 only", async ({ page }) => {
  await page.setViewportSize({ width: 1279, height: 800 });
  await page.goto("/ru");
  await settle(page);
  await expect(page.locator(".head-row")).toBeVisible();
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.waitForTimeout(300);
  await expect(page.locator(".head-row")).toBeHidden();
});

test("mobile targets are at least 44 px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/ru");
  await settle(page);
  for (const sel of [".header-order", ".site-header a[aria-label]:visible", ".head-row .head-btn", ".head-row .lang__item"]) {
    const boxes = await page.locator(sel).evaluateAll((els) =>
      els.map((e) => {
        const r = e.getBoundingClientRect();
        return { w: r.width, h: r.height };
      }),
    );
    expect(boxes.length, sel).toBeGreaterThan(0);
    for (const b of boxes) expect(b.h, sel).toBeGreaterThanOrEqual(43.5);
  }
});

test("keyboard: tab order runs logo, sections, audience, language, order; focus is visible", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ru");
  await settle(page);
  const seen: string[] = [];
  for (let i = 0; i < 13; i++) {
    await page.keyboard.press("Tab");
    const info = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return null;
      const cs = getComputedStyle(el);
      return {
        label: (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/s+/g, " ").slice(0, 40),
        outline: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) >= 2,
      };
    });
    expect(info, `focus after Tab ${i + 1}`).not.toBeNull();
    expect(info?.outline, `visible focus on "${info?.label}"`).toBe(true);
    seen.push(info?.label ?? "");
  }
  const at = (s: string) => seen.findIndex((x) => x.includes(s));
  expect(seen[0]).toContain("Перейти");
  expect(at("Продукция")).toBeGreaterThan(0);
  expect(at("Контакты")).toBeGreaterThan(at("Бренды"));
  expect(at("Поставщикам")).toBeGreaterThan(at("Контакты"));
  expect(at("Дистрибьюторам")).toBeGreaterThan(at("Поставщикам"));
  expect(at("Заказать")).toBeGreaterThan(at("Дистрибьюторам"));
});

test("language switch keeps the page on the new routes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/ru/distributors");
  await page.locator(".site-header nav.lang a", { hasText: "UZ" }).click();
  await expect(page).toHaveURL(/\/uz\/distributors$/);
  await expect(page.locator("h1")).toHaveText("Ulgurji va eksport yetkazib berish");
});

test("/order keeps the direction preset from the link", async ({ page }) => {
  await page.goto("/ru");
  await settle(page);
  await page.locator("section a[href='/ru/order?direction=wholesale']").first().click();
  await expect(page).toHaveURL(/\/ru\/order\?direction=wholesale$/);
  await expect(page.locator("select[name='direction']")).toHaveValue("wholesale");
});

test("distributors page shows no commercial terms", async ({ page }) => {
  await page.goto("/ru/distributors");
  const text = (await page.locator("main").innerText()).toLowerCase();
  for (const word of ["скидк", "доставк", "руб", "$", "usd", "сум", "минимальн"]) {
    expect(text, word).not.toContain(word);
  }
  expect(text).toContain("цены и условия сообщим после заявки");
});

for (const route of ["/distributors", "/order", "/suppliers"]) {
  for (const vp of [VIEWPORTS[0]!, VIEWPORTS[2]!]) {
    test(`axe: no serious or critical violations on /ru${route} at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`/ru${route}`);
      await settle(page);
      await revealAll(page);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
      const bad = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
      expect(
        bad.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.slice(0, 3).map((n) => n.target.join(" ")) })),
      ).toEqual([]);
    });
  }
}
