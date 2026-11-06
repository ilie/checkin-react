import { registerSW } from "virtual:pwa-register";
import { toast } from "sonner";

// A new version waits for the worker's tap on Update instead of reloading by itself, so a form being filled in
// isn't lost (ADR 0002). Update tells the waiting service worker to take over, and the page reloads.
export function registerServiceWorker() {
  const updateServiceWorker = registerSW({
    onNeedRefresh() {
      toast("A new version is available", {
        id: "update",
        duration: Infinity,
        action: { label: "Update", onClick: () => updateServiceWorker() },
      });
    },
    // Phones keep the app open for days, so it looks for a new version each time it comes back to the front.
    onRegisteredSW(_url, registration) {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState !== "visible") return;
        // Offline, the check fails; the next one will do.
        registration?.update().catch(() => {});
      });
    },
  });
}
