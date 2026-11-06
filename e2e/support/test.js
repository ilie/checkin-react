import { readFile } from "node:fs/promises";
import { test as base, expect } from "@playwright/test";
import { apiUrl, now, resetApi } from "./api.js";

export { expect };

// An iPhone 13's screen in the configured Chrome. No user agent: an iPhone Safari one would bring up the install help.
export const phone = { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };

// Every test starts from the seeded data, with the browser and the API on the same pinned "today",
// and fails if anything tries to reach the production API.
export const test = base.extend({
  page: async ({ page }, provide) => {
    resetApi();
    await page.clock.setFixedTime(new Date(now));

    const productionRequests = [];
    await page.route(/virginialyons\.com/, (route) => {
      productionRequests.push(route.request().url());
      return route.abort();
    });

    await provide(page);

    expect(productionRequests, "requests to the production API").toEqual([]);
  },
});

// Logs in through the API and stores the session the way the app does, then opens `path`,
// which may be a full URL on the preview build.
export async function loginAs(page, email, path = "/") {
  const response = await page.request.post(`${apiUrl}/login`, {
    data: { email, password: "Password1" },
    headers: { Accept: "application/json" },
  });
  expect(response.ok(), `login as ${email}`).toBe(true);
  const { id, attributes } = await response.json();
  const user = { id, name: attributes.name, email: attributes.email, hoursOnContract: attributes.hours_on_contract };

  const origin = URL.canParse(path) ? new URL(path).origin : "";
  await page.goto(`${origin}/login`);
  await page.evaluate(([token, isAdmin, user]) => {
    localStorage.setItem("token", token);
    localStorage.setItem("isAdmin", isAdmin);
    localStorage.setItem("user", user);
  }, [attributes.token, attributes.is_admin ? "1" : "0", JSON.stringify(user)]);
  await page.goto(path);
}

export function checkinsTable(page) {
  return page.getByRole("table", { name: "Check-ins" });
}

// Body rows only; the header row has column headers, not cells.
export function checkinRows(page) {
  return checkinsTable(page).getByRole("row").filter({ has: page.getByRole("cell") });
}

export async function expectTotal(page, total) {
  await expect(page.getByText(new RegExp(`of ${total} entries`))).toBeVisible();
}

export async function openMe(page) {
  await page.getByRole("button", { name: "Me", exact: true }).click();

  return page.getByRole("dialog", { name: "Me" });
}

// Clicks a button that downloads a file and reads the file back.
export async function download(button) {
  const [file] = await Promise.all([button.page().waitForEvent("download"), button.click()]);
  const content = await readFile(await file.path(), "utf8");

  return { name: file.suggestedFilename(), content, lines: content.trim().split(/\r?\n/) };
}

// Sonner lists its toasts in a "Notifications" region.
export function toasts(page) {
  return page.getByRole("region", { name: /Notifications/ }).getByRole("listitem");
}
