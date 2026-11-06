import { apiUrl, now } from "./support/api.js";
import { previewOrigin } from "./support/preview.js";
import { expect, loginAs, phone, test, toasts } from "./support/test.js";

const banner = (page) => page.getByRole("status").getByText("You're offline");

function isClockRequest(request) {
  return request.method() === "POST" && new URL(request.url()).pathname === "/api/checkins";
}

test("the offline banner sits below the header while the device is offline", async ({ page, context }) => {
  await loginAs(page, "worker@example.com", "/checkins");

  await context.setOffline(true);
  await expect(banner(page)).toBeVisible();
  const header = await page.getByRole("banner").boundingBox();
  expect((await banner(page).boundingBox()).y).toBeGreaterThanOrEqual(header.y + header.height);

  await context.setOffline(false);
  await expect(banner(page)).toBeHidden();
});

test.describe("on a phone", () => {
  test.use(phone);

  test("the banner pushes the large title down instead of covering it", async ({ page, context }) => {
    await loginAs(page, "worker@example.com");
    const title = page.getByRole("heading", { name: "Good morning, Walter" });
    await expect(title).toBeVisible();

    await context.setOffline(true);
    await expect(banner(page)).toBeVisible();
    const box = await banner(page).boundingBox();
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect((await title.boundingBox()).y).toBeGreaterThanOrEqual(box.y + box.height);
  });
});

test.describe("a tap made offline", () => {
  test("is sent with its tap time once the device is back online", async ({ page, context }) => {
    await loginAs(page, "olga@example.com");
    await expect(page.getByRole("button", { name: "Checkin" })).toBeVisible();

    await context.setOffline(true);
    await page.getByRole("button", { name: "Checkin" }).click();
    await expect(page.getByRole("button", { name: "Pending" })).toBeDisabled();

    const sent = page.waitForResponse((response) => isClockRequest(response.request()));
    await context.setOffline(false);
    const response = await sent;

    expect(response.status()).toBe(201);
    // The browser's 10:00, which the API keeps next to its own time of arrival.
    expect((await response.json()).data.attributes.checkin_tapped_at).toBe("2026-11-04 10:00:00");
    await expect(page.getByRole("button", { name: "Checkout" })).toBeVisible();
  });

  test("is dropped after 15 minutes, and the worker is told to ask an admin", async ({ page, context }) => {
    await loginAs(page, "olga@example.com");
    await expect(page.getByRole("button", { name: "Checkin" })).toBeVisible();
    await context.setOffline(true);
    await page.getByRole("button", { name: "Checkin" }).click();
    await expect(page.getByRole("button", { name: "Pending" })).toBeVisible();

    await page.clock.setFixedTime(new Date(new Date(now).getTime() + 16 * 60_000));
    const clockRequests = [];
    page.on("request", (request) => isClockRequest(request) && clockRequests.push(request));
    await context.setOffline(false);

    await expect(toasts(page).filter({ hasText: "wasn't sent within 15 minutes" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Checkin" })).toBeVisible();
    expect(clockRequests).toEqual([]);
  });

  test("that the API refuses shows why, and leaves nothing queued", async ({ page, context, request }) => {
    await loginAs(page, "worker@example.com");
    await expect(page.getByRole("button", { name: "Checkout" })).toBeVisible();
    await context.setOffline(true);
    await page.getByRole("button", { name: "Checkout" }).click();
    await expect(page.getByRole("button", { name: "Pending" })).toBeVisible();

    // Meanwhile Walter clocks out on another phone.
    const token = await page.evaluate(() => localStorage.getItem("token"));
    const elsewhere = await request.post(`${apiUrl}/checkins`, {
      data: { type: "checkout", checkin_id: null },
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    });
    expect(elsewhere.ok()).toBe(true);
    await context.setOffline(false);

    await expect(toasts(page).filter({ hasText: "There is no open check-in for today" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Checkin" })).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem("clockQueue"))).toBeNull();
  });

  test("can be made when the phone says it's online but nothing gets through", async ({ page }) => {
    await loginAs(page, "olga@example.com");
    await expect(page.getByRole("button", { name: "Checkin" })).toBeVisible();

    await page.route(/\/api\//, (route) => route.abort("internetdisconnected"));
    await page.reload();
    // Today's remembered status, though the status request failed.
    await page.getByRole("button", { name: "Checkin" }).click();
    await expect(page.getByRole("button", { name: "Pending" })).toBeVisible();

    await page.unrouteAll();
    const sent = page.waitForResponse((response) => isClockRequest(response.request()));
    await page.evaluate(() => document.dispatchEvent(new Event("visibilitychange")));
    expect((await sent).status()).toBe(201);
    await expect(page.getByRole("button", { name: "Checkout" })).toBeVisible();
  });

  // Reopening offline needs the service worker, so this runs on the production build.
  test("is still pending when the app is reopened offline", async ({ page, context }) => {
    await loginAs(page, "olga@example.com", `${previewOrigin}/`);
    await page.evaluate(() => navigator.serviceWorker.ready);
    await expect(page.getByRole("button", { name: "Checkin" })).toBeVisible();

    await context.setOffline(true);
    await page.reload();
    // Today's last status, remembered, and no error toasts while the banner explains.
    await expect(page.getByRole("button", { name: "Checkin" })).toBeVisible();
    await expect(banner(page)).toBeVisible();
    expect(await toasts(page).count()).toBe(0);

    await page.getByRole("button", { name: "Checkin" }).click();
    await page.reload();
    await expect(page.getByRole("button", { name: "Pending" })).toBeVisible();

    await context.setOffline(false);
    await expect(page.getByRole("button", { name: "Checkout" })).toBeVisible();
  });
});
