import { loginAs, phone, test } from "./support/test.js";

// The manifest's screenshots for Android's install sheet. Run with `npm run screenshots`, not with the suite.
// Their sizes are in vite.config.js: 780×1688 for a phone at 2×, 1280×800 for desktop.
const out = (name) => `public/screenshots/${name}.png`;

async function settle(page) {
  // The desktop clock button pulses forever, so only finite animations are awaited.
  await page.evaluate(() =>
    Promise.all(
      document
        .getAnimations()
        .filter((animation) => animation.effect.getTiming().iterations !== Infinity)
        .map((animation) => animation.finished),
    ),
  );
}

test.describe("on a phone", () => {
  test.use({ ...phone, deviceScaleFactor: 2, colorScheme: "light" });

  test("Home and Check-ins", async ({ page }) => {
    // Ana has nothing to fix, so Home shows no warning.
    await loginAs(page, "admin@example.com");
    await page.getByRole("button", { name: "Me", exact: true }).waitFor();
    await settle(page);
    await page.screenshot({ path: out("home") });

    // Walter's own weeks, with their totals.
    await loginAs(page, "worker@example.com", "/checkins");
    await page.getByRole("heading", { name: "Check-ins" }).waitFor();
    await settle(page);
    await page.screenshot({ path: out("checkins") });
  });
});

test("desktop check-ins", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await loginAs(page, "admin@example.com", "/checkins");
  await page.getByRole("table", { name: "Check-ins" }).getByRole("cell").first().waitFor();
  await settle(page);
  await page.screenshot({ path: out("desktop") });
});
