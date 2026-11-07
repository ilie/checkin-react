import { loginAs, phone, test } from "./support/test.js";

// The manifest's screenshots for Android's install sheet, and ADR 0006's desktop screens in both themes.
// Run with `npm run screenshots`, not with the suite.
// The manifest's sizes are in vite.config.js: 780×1688 for a phone at 2×, 1280×800 for desktop.
const out = (name) => `public/screenshots/${name}.png`;

async function settle(page) {
  await page.evaluate(() => Promise.all(document.getAnimations().map((animation) => animation.finished)));
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

// Home clocked in, Home with a missing check-out, and the admin's Check-ins and Users, then Home and Check-ins
// with the sidebar.
test.describe("desktop screens for ADR 0006", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  const weekCard = (page) => page.getByRole("region", { name: "This week" });
  const firstCell = (table) => (page) => page.getByRole("table", { name: table }).getByRole("cell").first();
  const screens = [
    ["home", "worker@example.com", "/", weekCard],
    ["home-olga", "olga@example.com", "/", weekCard],
    ["checkins", "admin@example.com", "/checkins", firstCell("Check-ins")],
    ["users", "admin@example.com", "/users", firstCell("Users")],
  ];

  for (const colorScheme of ["light", "dark"]) {
    test(`in ${colorScheme}`, async ({ page }) => {
      await page.emulateMedia({ colorScheme });
      for (const [name, email, path, ready] of screens) {
        await loginAs(page, email, path);
        await ready(page).waitFor();
        await settle(page);
        await page.screenshot({ path: `adrs/assets/0006/app-${colorScheme}-${name}.png` });
      }

      // The sidebar, the other layout that Me offers.
      await page.evaluate(() => localStorage.setItem("layout", "sidebar"));
      for (const [name, email, path, ready] of [screens[0], screens[2]]) {
        await loginAs(page, email, path);
        await ready(page).waitFor();
        await settle(page);
        await page.screenshot({ path: `adrs/assets/0006/app-${colorScheme}-sidebar-${name}.png` });
      }
    });
  }
});
