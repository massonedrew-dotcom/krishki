import { expect, test } from "@playwright/test";

for (const width of [360, 390]) {
  for (const locale of ["ru", "uz", "en"]) {
    test(`header phone never wraps at ${width} (${locale})`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(`/${locale}/styleguide`);
      const phone = page.locator("header a[href^='tel:']").first();
      const box = await phone.boundingBox();
      expect(box?.height ?? 99).toBeLessThanOrEqual(48);
      const lines = await phone.evaluate((el) => el.getClientRects().length);
      expect(lines).toBe(1);
    });
  }
}
