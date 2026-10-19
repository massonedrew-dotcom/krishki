import { expect, test } from "@playwright/test";

test.describe("root redirect by Accept-Language", () => {
  test.describe("ru browser", () => {
    test.use({ locale: "ru-RU" });
    test("/ redirects to /ru", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveURL(/\/ru$/);
    });
  });

  test.describe("unmatched browser language", () => {
    test.use({ locale: "de-DE" });
    test("/ falls back to default /ru", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveURL(/\/ru$/);
    });
  });

  test.describe("en browser", () => {
    test.use({ locale: "en-US" });
    test("/ redirects to /en", async ({ page }) => {
      await page.goto("/");
      await expect(page).toHaveURL(/\/en$/);
    });
  });
});

test("old URLs answer with a 301 to the new routes", async ({ request }) => {
  const map: Record<string, string> = {
    "/produkciya/": "/ru/products",
    "/uslugi/": "/ru/services",
    "/o-nas/": "/ru/about",
    "/polezno-znat/": "/ru/useful",
  };
  for (const [from, to] of Object.entries(map)) {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status(), from).toBe(301);
    expect(res.headers()["location"], from).toContain(to);
  }
});
