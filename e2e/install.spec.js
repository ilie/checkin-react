import { devices } from "@playwright/test";
import { expect, loginAs, openMe, phone, test } from "./support/test.js";

const iPhoneSafari = devices["iPhone 13"].userAgent;

function installHelp(page) {
  return page.getByRole("dialog", { name: "Install Checkin" });
}

// Chrome's event, with a prompt() that records the call.
async function offerInstall(page) {
  await page.evaluate(() => {
    const event = new Event("beforeinstallprompt", { cancelable: true });
    event.prompt = async () => {
      window.promptCalls = (window.promptCalls ?? 0) + 1;
    };
    window.dispatchEvent(event);
  });
}

test.describe("in Safari on an iPhone", () => {
  test.use({ ...phone, userAgent: iPhoneSafari });

  test("the sign-in screen shows the install steps until Not now", async ({ page }) => {
    await page.goto("/login");
    await expect(installHelp(page).getByText("Choose Add to Home Screen")).toBeVisible();

    await installHelp(page).getByRole("button", { name: "Not now" }).click();
    await expect(installHelp(page)).toBeHidden();

    await page.reload();
    await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
    await expect(installHelp(page)).toHaveCount(0);
  });

  test("Install app in Me shows the steps again", async ({ page }) => {
    await loginAs(page, "worker@example.com");
    const me = await openMe(page);
    await me.getByRole("button", { name: "Install app" }).click();
    await expect(installHelp(page)).toBeVisible();

    // Escape closes the top sheet only.
    await page.keyboard.press("Escape");
    await expect(installHelp(page)).toBeHidden();
    await expect(me).toBeVisible();
  });
});

test.describe("in Chrome on Android", () => {
  test.use(phone);

  test("Install app in Me opens Chrome's install prompt", async ({ page }) => {
    await loginAs(page, "worker@example.com");
    const me = await openMe(page);
    await expect(me.getByRole("button", { name: "Install app" })).toHaveCount(0);

    await offerInstall(page);
    await me.getByRole("button", { name: "Install app" }).click();

    expect(await page.evaluate(() => window.promptCalls)).toBe(1);
    // A prompt can only be shown once.
    await expect(me.getByRole("button", { name: "Install app" })).toHaveCount(0);
  });
});

test.describe("once installed", () => {
  test.use({ ...phone, userAgent: iPhoneSafari });

  test("no install help shows anywhere", async ({ page }) => {
    await page.addInitScript(() => Object.defineProperty(Navigator.prototype, "standalone", { get: () => true }));
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
    await expect(installHelp(page)).toHaveCount(0);

    await loginAs(page, "worker@example.com");
    await offerInstall(page);
    const me = await openMe(page);
    await expect(me.getByRole("button", { name: "Sign out" })).toBeVisible();
    await expect(me.getByRole("button", { name: "Install app" })).toHaveCount(0);
  });
});
