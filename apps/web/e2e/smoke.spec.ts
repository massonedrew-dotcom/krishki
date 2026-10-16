import { expect, test } from "@playwright/test";
import { join } from "node:path";

const SHOTS = join(__dirname, "..", "..", "..", "qa", "screens", "1b-scaffold");
const viewports = [
  { name: "1440", width: 1440, height: 900 },
  { name: "390", width: 390, height: 844 },
];

for (const locale of ["ru", "uz", "en"]) {
  for (const vp of viewports) {
    test(`/${locale} renders at ${vp.name}`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error" || m.type() === "warning") errors.push(m.text());
      });
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(`/${locale}`);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("h1")).toBeVisible();
      await page.screenshot({ path: join(SHOTS, `${locale}-${vp.name}.png`), fullPage: true });
      expect(errors).toEqual([]);
    });
  }
}

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
