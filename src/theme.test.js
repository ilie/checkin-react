import { describe, expect, test } from "vitest";
import { isDark, savedTheme, statusBarColors } from "./theme";

describe("isDark", () => {
  test("follows the system only while the choice is System", () => {
    expect(isDark("system", { onPhone: true, prefersDark: true })).toBe(true);
    expect(isDark("system", { onPhone: true, prefersDark: false })).toBe(false);
  });

  test("keeps an explicit choice whatever the system says", () => {
    expect(isDark("dark", { onPhone: true, prefersDark: false })).toBe(true);
    expect(isDark("light", { onPhone: true, prefersDark: true })).toBe(false);
  });

  test("keeps desktop light", () => {
    expect(isDark("dark", { onPhone: false, prefersDark: true })).toBe(false);
  });
});

describe("statusBarColors", () => {
  test("gives each system setting its own colour on System", () => {
    expect(statusBarColors("system", true)).toEqual({ light: "#f2f2f7", dark: "#000000" });
  });

  test("uses the chosen theme's colour for both settings", () => {
    expect(statusBarColors("dark", true)).toEqual({ light: "#000000", dark: "#000000" });
    expect(statusBarColors("light", true)).toEqual({ light: "#f2f2f7", dark: "#f2f2f7" });
  });

  test("matches the navy header on desktop", () => {
    expect(statusBarColors("dark", false)).toEqual({ light: "#150958", dark: "#150958" });
  });
});

describe("savedTheme", () => {
  // The unit tests run without a browser, so localStorage is missing, as when storage is blocked.
  test("falls back to System when storage can't be read", () => {
    expect(savedTheme()).toBe("system");
  });
});
