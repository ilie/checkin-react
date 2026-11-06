import { devices } from "@playwright/test";
import { expect, loginAs, test } from "./support/test.js";

test.use({ ...devices["iPhone 13"], defaultBrowserType: undefined, channel: "chrome" });

for (const path of ["/", "/checkins", "/users"]) {
  test(`${path} has no sideways scroll on a phone`, async ({ page }) => {
    await loginAs(page, "admin@example.com", path);
    await page.waitForLoadState("networkidle");

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
