import { isoDate } from "../helpers/time";

// The last clock status the API gave today, so the right button shows when the app opens offline,
// and the app badge, which shows while a check-in is open. Both go when the session ends.

const key = "checkinStatus";

export function rememberStatus(status) {
  try {
    localStorage.setItem(key, JSON.stringify({ date: isoDate(new Date()), status }));
  } catch {
    // Not remembered: offline, the button waits for the connection.
  }
  showBadge(status.status === "checkin");
}

// Only today's: yesterday's open check-in says nothing about today's button.
export function rememberedStatus() {
  try {
    const saved = JSON.parse(localStorage.getItem(key));

    return saved?.date === isoDate(new Date()) ? saved.status : undefined;
  } catch {
    return undefined;
  }
}

export function forgetStatus() {
  localStorage.removeItem(key);
  showBadge(false);
}

// Set again once notification permission is granted: the clock-in that asks for it sets the badge before the answer.
export function refreshBadge() {
  showBadge(rememberedStatus()?.status === "checkin");
}

// Installed apps only, and it can still refuse (no notification permission), which changes nothing here.
// A 1 rather than no number: iOS only draws numbers, so a dot badge shows nothing there.
function showBadge(isClockedIn) {
  if (isClockedIn) navigator.setAppBadge?.(1).catch(() => {});
  else navigator.clearAppBadge?.().catch(() => {});
}
