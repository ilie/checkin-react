import { appendFileSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { previewDir, previewOrigin } from "./support/preview.js";
import { expect, test } from "./support/test.js";

const serviceWorkerFile = join(previewDir, "sw.js");

test("a new version waits for Update, then reloads into it", async ({ page }) => {
  // A returning worker: the installed version already controls the page.
  await page.goto(`${previewOrigin}/login`);
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);

  // A deploy: preview serves the changed sw.js on the next check, so the browser installs it and it waits.
  const deployed = readFileSync(serviceWorkerFile, "utf8");
  appendFileSync(serviceWorkerFile, "\n// the next version\n");
  try {
    // The app checks when it comes back to the front.
    await page.evaluate(() => {
      window.beforeUpdate = true;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    const update = page.getByRole("button", { name: "Update" });
    await expect(page.getByText("A new version is available")).toBeVisible();

    await Promise.all([page.waitForEvent("load"), update.click()]);
    expect(await page.evaluate(() => window.beforeUpdate)).toBeUndefined();
    await expect(page.getByText("A new version is available")).toBeHidden();
    expect(await page.evaluate(async () => (await navigator.serviceWorker.getRegistration()).waiting)).toBeNull();
  } finally {
    writeFileSync(serviceWorkerFile, deployed);
  }
});

// A phone that installed the Create React App build still has its worker at /service-worker.js, serving the old
// app from its cache for every page. Our file at that path must retire it, so the phone reloads into the new app.
test("the old app's service worker hands over to the new one", async ({ page }) => {
  const oldApp = `<!doctype html><title>Old app</title><h1>Old app</h1>
    <script>navigator.serviceWorker.register("/service-worker.js")</script>`;
  // Like the old worker: it takes over at once and answers every page with the cached old app.
  const oldWorker = `
    self.addEventListener("install", () => self.skipWaiting());
    self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
    self.addEventListener("fetch", (event) => {
      if (event.request.mode === "navigate") {
        event.respondWith(new Response(${JSON.stringify(oldApp)}, { headers: { "content-type": "text/html" } }));
      }
    });`;
  const killSwitchFile = join(previewDir, "service-worker.js");
  const killSwitch = readFileSync(killSwitchFile, "utf8");
  writeFileSync(killSwitchFile, oldWorker);
  try {
    await page.route(`${previewOrigin}/old-app`, (route) => route.fulfill({ contentType: "text/html", body: oldApp }));
    await page.goto(`${previewOrigin}/old-app`);
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    await page.unrouteAll();
    await page.goto(`${previewOrigin}/`);
    await expect(page.getByRole("heading", { name: "Old app" })).toBeVisible();
  } finally {
    writeFileSync(killSwitchFile, killSwitch);
  }

  // The deploy: the next check for /service-worker.js gets our file.
  await page.evaluate(() => navigator.serviceWorker.getRegistration().then((registration) => registration.update()));

  await expect(page.getByRole("img", { name: "Checkin App" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Old app" })).toHaveCount(0);
  await expect
    .poll(() => page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.active?.scriptURL))
    .toBe(`${previewOrigin}/sw.js`);
});
