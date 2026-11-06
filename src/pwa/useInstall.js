import { useSyncExternalStore } from "react";

// Chrome fires beforeinstallprompt once, often before React renders, so it's kept from the moment this module loads.
let installPrompt = null;
const listeners = new Set();

function setInstallPrompt(event) {
  installPrompt = event;
  for (const listener of listeners) listener();
}

window.addEventListener("beforeinstallprompt", (event) => {
  // Keeps Chrome's own mini-infobar away; the Me sheet offers the install instead.
  event.preventDefault();
  setInstallPrompt(event);
});
window.addEventListener("appinstalled", () => setInstallPrompt(null));

function subscribe(listener) {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

// Running from the Home Screen: Chrome's display mode, or Safari's own flag.
export function isStandalone() {
  return matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
}

// Safari on an iPhone, which can only install through Share → Add to Home Screen. Other iOS browsers say who they are.
export function isIosSafari() {
  return /iPhone/.test(navigator.userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(navigator.userAgent);
}

// What the device can do to install the app: "prompt" (Chrome's install dialog), "steps" (iPhone Safari's) or nothing.
function installMethod(prompt) {
  if (isStandalone()) return null;
  if (prompt) return "prompt";
  if (isIosSafari()) return "steps";

  return null;
}

export function useInstall() {
  const prompt = useSyncExternalStore(subscribe, () => installPrompt);

  async function install() {
    await prompt.prompt();
    setInstallPrompt(null);
  }

  return { method: installMethod(prompt), install };
}

const dismissedKey = "installHelpDismissed";

export function isInstallHelpDismissed() {
  try {
    return localStorage.getItem(dismissedKey) === "1";
  } catch {
    return false;
  }
}

export function dismissInstallHelp() {
  try {
    localStorage.setItem(dismissedKey, "1");
  } catch {
    // Not remembered: the help shows again on the next visit.
  }
}
