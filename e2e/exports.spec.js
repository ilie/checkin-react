import { download, expect, expectTotal, loginAs, test } from "./support/test.js";

test("exports the filtered check-ins as a semicolon CSV with a BOM", async ({ page }) => {
  await loginAs(page, "admin@example.com", "/checkins");

  const all = await download(page.getByRole("button", { name: "Export check-ins" }));
  expect(all.name).toBe("fichajes_inicio_2026-11-04.csv");
  expect(all.content.startsWith("﻿")).toBe(true);
  expect(all.lines[0]).toContain(";");
  expect(all.lines).toHaveLength(1 + 17);

  await page.getByLabel("Employee").selectOption({ label: "Olga Other" });
  await page.getByLabel("From").fill("2026-11-02");
  await page.getByLabel("To").fill("2026-11-03");
  await expectTotal(page, 3);

  const filtered = await download(page.getByRole("button", { name: "Export check-ins" }));
  expect(filtered.name).toBe("fichajes_2026-11-02_2026-11-03.csv");
  expect(filtered.lines).toHaveLength(1 + 3);
  expect(filtered.lines.slice(1).every((line) => line.includes("Olga Other"))).toBe(true);
});

test("exports the change log with every reason", async ({ page }) => {
  await loginAs(page, "admin@example.com", "/checkins");
  // The change log follows the table's filters, so a deleted check-in's reason needs Show deleted.
  await page.getByLabel("Show deleted").check();
  await expectTotal(page, 18);

  const changes = await download(page.getByRole("button", { name: "Export change log" }));
  expect(changes.name).toBe("cambios-fichajes_inicio_2026-11-04.csv");
  expect(changes.content).toContain("Forgot to clock in");
  expect(changes.content).toContain("Left early for a school visit");
  expect(changes.content).toContain("Duplicate entry");
});

test("a worker's export only has their own check-ins", async ({ page }) => {
  await loginAs(page, "worker@example.com", "/checkins");

  const own = await download(page.getByRole("button", { name: "Export check-ins" }));
  expect(own.lines).toHaveLength(1 + 9);
  expect(own.content).not.toContain("Olga Other");
});
