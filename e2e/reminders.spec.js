import { devices } from "@playwright/test";
import { previewOrigin } from "./support/preview.js";
import { expect, loginAs, openMe, phone, test } from "./support/test.js";

const endpoint = "https://push.example.test/send/walter";
const keys = {
  p256dh: "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM",
  auth: "tBHItJI5svbpez7KI4CCXg",
};

// Headless Chrome can't reach a push service, so the browser's half is made up. The API stores it all the same.
async function fakePushService(page) {
  await page.addInitScript(
    ([endpoint, keys]) => {
      let subscription = null;
      PushManager.prototype.subscribe = async (options) => {
        window.subscribeOptions = options;
        subscription = {
          endpoint,
          toJSON: () => ({ endpoint, expirationTime: null, keys }),
          unsubscribe: async () => {
            subscription = null;
            return true;
          },
        };
        return subscription;
      };
      PushManager.prototype.getSubscription = async () => subscription;
    },
    [endpoint, keys],
  );
}

function isPushRequest(request) {
  return new URL(request.url()).pathname === "/api/push-subscriptions";
}

test.describe("on a phone", () => {
  test.use(phone);

  // Push needs the service worker, so this runs on the production build.
  test("turning reminders on sends the subscription, and Sign out deletes it first", async ({ page, context }) => {
    await context.grantPermissions(["notifications"], { origin: previewOrigin });
    await fakePushService(page);
    await loginAs(page, "worker@example.com", `${previewOrigin}/`);
    await page.evaluate(() => navigator.serviceWorker.ready);
    const me = await openMe(page);
    const reminders = me.getByRole("switch", { name: "Notifications" });
    await expect(reminders).not.toBeChecked();

    const subscribed = page.waitForRequest((request) => isPushRequest(request) && request.method() === "POST");
    await reminders.click();
    const request = await subscribed;
    expect(request.postDataJSON()).toEqual({ endpoint, expirationTime: null, keys });
    expect((await request.response()).status()).toBe(204);
    await expect(reminders).toBeChecked();
    // The local test key, decoded to the 65 bytes of a P-256 public key.
    expect(await page.evaluate(() => window.subscribeOptions.applicationServerKey.byteLength)).toBe(65);

    const sent = [];
    page.on("request", (request) => {
      if (isPushRequest(request) || request.url().endsWith("/api/logout")) {
        sent.push(`${request.method()} ${new URL(request.url()).pathname}`);
      }
    });
    const deleted = page.waitForRequest((request) => isPushRequest(request) && request.method() === "DELETE");
    await me.getByRole("button", { name: "Sign out" }).click();
    expect((await deleted).postDataJSON()).toEqual({ endpoint });
    await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
    expect(sent).toEqual(["DELETE /api/push-subscriptions", "POST /api/logout"]);
  });

  test("reminders turn on with the first clock-in, and stay off once turned off", async ({ page, context }) => {
    await context.grantPermissions(["notifications"], { origin: previewOrigin });
    await fakePushService(page);
    await loginAs(page, "olga@example.com", `${previewOrigin}/`);
    await page.evaluate(() => navigator.serviceWorker.ready);
    const pushRequests = [];
    page.on("request", (request) => isPushRequest(request) && pushRequests.push(request.method()));

    const subscribed = page.waitForRequest((request) => isPushRequest(request) && request.method() === "POST");
    await page.getByRole("button", { name: "Checkin" }).click();
    expect((await subscribed).postDataJSON().endpoint).toBe(endpoint);
    await expect(page.getByRole("button", { name: "Checkout" })).toBeVisible();

    const me = await openMe(page);
    const reminders = me.getByRole("switch", { name: "Notifications" });
    await expect(reminders).toBeChecked();
    await reminders.click();
    await expect(reminders).not.toBeChecked();
    await me.getByRole("button", { name: "Done" }).click();
    await expect(me).toBeHidden();

    await page.getByRole("button", { name: "Checkout" }).click();
    await page.getByRole("button", { name: "Checkin" }).click();
    await expect(page.getByRole("button", { name: "Checkout" })).toBeVisible();
    expect(pushRequests).toEqual(["POST", "DELETE"]);
  });
});

test.describe("in Safari on an iPhone, before installing", () => {
  test.use({ ...phone, userAgent: devices["iPhone 13"].userAgent });

  test("the reminders row shows how to install the app", async ({ page }) => {
    await loginAs(page, "worker@example.com");
    const me = await openMe(page);
    await expect(me.getByRole("switch")).toHaveCount(0);

    await me.getByRole("button", { name: "Notifications" }).click();

    await expect(page.getByRole("dialog", { name: "Install Checkin" })).toBeVisible();
  });
});

test("a reminder pushed to the service worker shows as a notification", async ({ page, context }) => {
  await context.grantPermissions(["notifications"], { origin: previewOrigin });
  await page.goto(`${previewOrigin}/login`);
  await page.evaluate(() => navigator.serviceWorker.ready);

  // Chrome on macOS lists only the notifications the system reports as displayed, so getNotifications() can miss
  // one. The worker's own call to showNotification is recorded instead.
  const [worker] = context.serviceWorkers();
  await worker.evaluate(() => {
    self.shown = [];
    const show = ServiceWorkerRegistration.prototype.showNotification;
    ServiceWorkerRegistration.prototype.showNotification = function (title, options) {
      self.shown.push({ title, body: options.body, navigate: options.data.url });
      return show.call(this, title, options);
    };
  });

  // The API's Declarative Web Push payload (API ADR 0004), delivered the way a push service would.
  const cdp = await context.newCDPSession(page);
  const registrationId = new Promise((resolve) => {
    cdp.on("ServiceWorker.workerRegistrationUpdated", ({ registrations }) => {
      const registration = registrations.find((registration) => registration.scopeURL === `${previewOrigin}/`);
      if (registration) resolve(registration.registrationId);
    });
  });
  await cdp.send("ServiceWorker.enable");
  const notification = {
    title: "Still clocked in",
    body: "You clocked in at 09:05. Remember to clock out when you finish.",
    navigate: `${previewOrigin}/`,
  };
  await cdp.send("ServiceWorker.deliverPushMessage", {
    origin: previewOrigin,
    registrationId: await registrationId,
    data: JSON.stringify({ web_push: 8030, notification }),
  });

  await expect.poll(() => worker.evaluate(() => self.shown)).toEqual([notification]);
});

test("the app badge shows while a check-in is open", async ({ page }) => {
  await page.addInitScript(() => {
    window.badge = [];
    Navigator.prototype.setAppBadge = async (count) => window.badge.push(`set ${count}`);
    Navigator.prototype.clearAppBadge = async () => window.badge.push("clear");
  });
  await loginAs(page, "olga@example.com");
  const lastBadgeCall = () => page.evaluate(() => window.badge.at(-1));
  await expect(page.getByRole("button", { name: "Checkin" })).toBeVisible();
  await expect.poll(lastBadgeCall).toBe("clear");

  await page.getByRole("button", { name: "Checkin" }).click();
  await expect(page.getByRole("button", { name: "Checkout" })).toBeVisible();
  await expect.poll(lastBadgeCall).toBe("set 1");

  await page.getByRole("button", { name: "Checkout" }).click();
  await expect(page.getByRole("button", { name: "Checkin" })).toBeVisible();
  await expect.poll(lastBadgeCall).toBe("clear");
});

test("on desktop, reminders turn on with clock-in and the header's bell turns them off", async ({ page, context }) => {
  await context.grantPermissions(["notifications"], { origin: previewOrigin });
  await fakePushService(page);
  await loginAs(page, "olga@example.com", `${previewOrigin}/`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  const bell = page.getByRole("button", { name: "Notifications" });
  await expect(bell).toHaveAttribute("aria-pressed", "false");

  const subscribed = page.waitForRequest((request) => isPushRequest(request) && request.method() === "POST");
  await page.getByRole("button", { name: "Checkin" }).click();
  expect((await subscribed).postDataJSON().endpoint).toBe(endpoint);
  await expect(bell).toHaveAttribute("aria-pressed", "true");
  await page.screenshot({ path: "adrs/assets/0005/desktop-bell.png", clip: { x: 0, y: 0, width: 1280, height: 120 } });

  const deleted = page.waitForRequest((request) => isPushRequest(request) && request.method() === "DELETE");
  await bell.click();
  await deleted;
  await expect(bell).toHaveAttribute("aria-pressed", "false");
});
