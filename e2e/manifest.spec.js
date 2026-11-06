import { previewOrigin } from "./support/preview.js";
import { expect, test } from "./support/test.js";

test("the built manifest has what installing on Android and iOS needs", async ({ page }) => {
  const response = await page.request.get(`${previewOrigin}/manifest.webmanifest`);
  expect(response.ok()).toBe(true);
  const manifest = await response.json();

  expect(manifest).toMatchObject({ id: "/", scope: "/", start_url: "/", display: "standalone", theme_color: "#150958" });
  expect(manifest.icons.filter((icon) => icon.purpose === "any").map((icon) => icon.src)).toEqual(["/icon-192.png", "/icon-512.png"]);
  expect(manifest.icons.filter((icon) => icon.purpose === "maskable")).toHaveLength(2);
  expect(manifest.screenshots.map((shot) => shot.form_factor)).toEqual(["narrow", "narrow", "wide"]);
  expect(manifest.shortcuts.map((shortcut) => shortcut.url)).toEqual(["/", "/checkins"]);

  // Every file the manifest names is served.
  const files = [...manifest.icons, ...manifest.screenshots, ...manifest.shortcuts.flatMap((shortcut) => shortcut.icons)];
  for (const { src } of files) {
    expect((await page.request.get(`${previewOrigin}${src}`)).ok(), src).toBe(true);
  }

  await page.goto(previewOrigin);
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/manifest.webmanifest");
  await expect(page.locator('meta[name="apple-mobile-web-app-title"]')).toHaveAttribute("content", "Checkin");

  // What DevTools' Application → Manifest panel reports.
  const devTools = await page.context().newCDPSession(page);
  const { errors } = await devTools.send("Page.getAppManifest");
  expect(errors).toEqual([]);
  const { installabilityErrors } = await devTools.send("Page.getInstallabilityErrors");
  // Playwright's contexts are private windows, which Chrome never installs from.
  expect(installabilityErrors.filter(({ errorId }) => errorId !== "in-incognito")).toEqual([]);
});
