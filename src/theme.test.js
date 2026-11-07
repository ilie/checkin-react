import { describe, expect, test } from "vitest";
import { isDark, savedTheme, statusBarColors } from "./theme";

describe("isDark", () => {
  test("follows the system only while the choice is System", () => {
    expect(isDark("system", true)).toBe(true);
    expect(isDark("system", false)).toBe(false);
  });

  test("keeps an explicit choice whatever the system says", () => {
    expect(isDark("dark", false)).toBe(true);
    expect(isDark("light", true)).toBe(false);
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

  test("uses the desktop's dark grey instead of black on desktop", () => {
    expect(statusBarColors("system", false)).toEqual({ light: "#f2f2f7", dark: "#161618" });
    expect(statusBarColors("dark", false)).toEqual({ light: "#161618", dark: "#161618" });
  });
});

describe("savedTheme", () => {
  // The unit tests run without a browser, so localStorage is missing, as when storage is blocked.
  test("falls back to System when storage can't be read", () => {
    expect(savedTheme()).toBe("system");
  });
});
