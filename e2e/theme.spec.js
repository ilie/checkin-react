import { expect, loginAs, phone, test } from "./support/test.js";

const html = (page) => page.locator("html");
const statusBarColor = (page, scheme) => page.locator(`meta[name="theme-color"][media*="${scheme}"]`);

test.describe("on a phone", () => {
  test.use({ ...phone, colorScheme: "dark" });

  test("follows a dark system setting, with a black status bar", async ({ page }) => {
    await loginAs(page, "worker@example.com");

    await expect(html(page)).toHaveClass(/\bdark\b/);
    await expect(statusBarColor(page, "dark")).toHaveAttribute("content", "#000000");
    await expect(page).toHaveTitle("Home · Checkin");
  });

  test("keeps a saved Light choice over the system setting", async ({ page }) => {
    await page.goto("/login");
    await page.evaluate(() => localStorage.setItem("theme", "light"));
    await page.reload();

    await expect(html(page)).not.toHaveClass(/\bdark\b/);
    await expect(statusBarColor(page, "dark")).toHaveAttribute("content", "#f2f2f7");
  });
});

test.describe("on a desktop", () => {
  test.use({ colorScheme: "dark" });

  test("follows a dark system setting too, with its dark grey title bar", async ({ page }) => {
    await loginAs(page, "worker@example.com", "/checkins");

    await expect(html(page)).toHaveClass(/\bdark\b/);
    await expect(statusBarColor(page, "dark")).toHaveAttribute("content", "#161618");
    await expect(statusBarColor(page, "light")).toHaveAttribute("content", "#f2f2f7");
    await expect(page).toHaveTitle("Check-ins · Checkin");
  });
});
