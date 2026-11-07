import { now, pinApiClock } from "./support/api.js";
import { checkinRows, expect, loginAs, test, toasts } from "./support/test.js";

test("a worker clocks in and out on an iPhone, which has no Vibration API", async ({ page }) => {
  await page.addInitScript(() => delete Navigator.prototype.vibrate);
  await loginAs(page, "olga@example.com");

  await page.getByRole("button", { name: "Checkin" }).click();
  await expect(page.getByRole("button", { name: "Checkout" })).toBeVisible();

  await page.getByRole("button", { name: "Checkout" }).click();
  await expect(page.getByRole("button", { name: "Checkin" })).toBeVisible();
  // Sonner shows a toast a moment after the request settles, so count once the second round trip is done.
  // A retrying toHaveCount(0) would just wait for the toast to expire.
  expect(await toasts(page).count()).toBe(0);

  await page.getByRole("link", { name: "Check-ins" }).first().click();
  await expect(checkinRows(page).filter({ hasText: "04/11/2026" })).toHaveCount(1);
});

test("a worker who is clocked in sees Checkout", async ({ page }) => {
  await loginAs(page, "worker@example.com");

  await expect(page.getByRole("button", { name: "Checkout" })).toBeVisible();
});

test("clocking in on a national holiday is refused with a message", async ({ page }) => {
  pinApiClock("2026-12-25T10:00:00+01:00");
  await loginAs(page, "olga@example.com");

  await page.getByRole("button", { name: "Checkin" }).click();

  await expect(toasts(page).filter({ hasText: /holiday/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "Checkin" })).toBeVisible();
});

test("a second open page shows the new status when it gets focus", async ({ page }) => {
  await loginAs(page, "olga@example.com");
  const otherPage = await page.context().newPage();
  await otherPage.clock.setFixedTime(new Date(now));
  await otherPage.goto("/");
  await expect(otherPage.getByRole("button", { name: "Checkin" })).toBeVisible();

  await page.bringToFront();
  await page.getByRole("button", { name: "Checkin" }).click();
  await expect(page.getByRole("button", { name: "Checkout" })).toBeVisible();

  // Switching back to a tab or app fires visibilitychange, which headless Chrome doesn't do on its own.
  await otherPage.bringToFront();
  await otherPage.evaluate(() => document.dispatchEvent(new Event("visibilitychange", { bubbles: true })));
  await expect(otherPage.getByRole("button", { name: "Checkout" })).toBeVisible();
});
