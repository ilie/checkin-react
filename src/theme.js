// The Light, Dark or System appearance, kept per device, on phones and desktop alike (ADR 0006).
// index.html sets the class before first paint with the same rules; this keeps it right afterwards.

import { useSyncExternalStore } from "react";
import { isPhone, phoneQuery } from "./hooks/useIsPhone";

export const themes = ["light", "dark", "system"];

const storageKey = "theme";
const darkQuery = "(prefers-color-scheme: dark)";

// The status bar matches the page's background: Apple's grouped grey in the light, and in the dark
// black on phones or the desktop's dark grey.
const themeColors = { light: "#f2f2f7", dark: "#000000", desktopDark: "#161618" };

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

export function isDark(theme, prefersDark) {
  return theme === "dark" || (theme === "system" && prefersDark);
}

// The two theme-color metas, for a light and a dark system setting. An explicit choice sets both alike.
export function statusBarColors(theme, onPhone) {
  const colors = { light: themeColors.light, dark: onPhone ? themeColors.dark : themeColors.desktopDark };
  if (theme === "system") return colors;

  return { light: colors[theme], dark: colors[theme] };
}

export function applyTheme(theme = savedTheme()) {
  const colors = statusBarColors(theme, isPhone());

  document.documentElement.classList.toggle("dark", isDark(theme, matchMedia(darkQuery).matches));
  document.querySelector('meta[name="theme-color"][media*="light"]').content = colors.light;
  document.querySelector('meta[name="theme-color"][media*="dark"]').content = colors.dark;
}

// Whether the page is dark right now, for components such as the toasts that pick their own colours.
function subscribeToDark(onChange) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["class"] });

  return () => observer.disconnect();
}

export function useIsDark() {
  return useSyncExternalStore(subscribeToDark, () => document.documentElement.classList.contains("dark"));
}

// Follows the system setting, and a resize across the phone breakpoint, where the dark status bar changes.
export function watchTheme() {
  applyTheme();
  for (const query of [phoneQuery, darkQuery]) {
    matchMedia(query).addEventListener("change", () => applyTheme());
  }
}
