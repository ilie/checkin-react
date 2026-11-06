// The phone layout's Light, Dark or System appearance, kept per device. Desktop stays light.
// index.html sets the class before first paint with the same rules; this keeps it right afterwards.

import { isPhone, phoneQuery } from "./hooks/useIsPhone";

export const themes = ["light", "dark", "system"];

const storageKey = "theme";
const darkQuery = "(prefers-color-scheme: dark)";

// The status bar matches the page: Apple's grouped background in each theme, and the navy header on desktop.
const themeColors = { light: "#f2f2f7", dark: "#000000", desktop: "#150958" };

// Private browsing or blocked storage throws; the app then simply follows the system.
export function savedTheme() {
  try {
    const theme = localStorage.getItem(storageKey);

    return themes.includes(theme) ? theme : "system";
  } catch {
    return "system";
  }
}

export function saveTheme(theme) {
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // Not saved: the choice lasts until the page reloads.
  }
  applyTheme(theme);
}

export function isDark(theme, { onPhone, prefersDark }) {
  return onPhone && (theme === "dark" || (theme === "system" && prefersDark));
}

// The two theme-color metas, for a light and a dark system setting. An explicit choice sets both alike.
export function statusBarColors(theme, onPhone) {
  if (!onPhone) return { light: themeColors.desktop, dark: themeColors.desktop };
  if (theme === "system") return { light: themeColors.light, dark: themeColors.dark };

  return { light: themeColors[theme], dark: themeColors[theme] };
}

export function applyTheme(theme = savedTheme()) {
  const onPhone = isPhone();
  const prefersDark = matchMedia(darkQuery).matches;
  const colors = statusBarColors(theme, onPhone);

  document.documentElement.classList.toggle("dark", isDark(theme, { onPhone, prefersDark }));
  document.querySelector('meta[name="theme-color"][media*="light"]').content = colors.light;
  document.querySelector('meta[name="theme-color"][media*="dark"]').content = colors.dark;
}

// Follows the system setting and a resize across the phone breakpoint.
export function watchTheme() {
  applyTheme();
  for (const query of [phoneQuery, darkQuery]) {
    matchMedia(query).addEventListener("change", () => applyTheme());
  }
}
