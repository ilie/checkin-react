import { refreshBadge } from "./clockStatus";
import { isIosSafari, isStandalone } from "./useInstall";

// The browser's push subscription for clock-out reminders, and the API's copy of it (API ADR 0004).
// Reminders are on by default (ADR 0004): a phone subscribes on its first clock-in, unless the worker turned
// them off in the Me sheet.

const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
const turnedOffKey = "remindersOff";

// "switch", "install" (Safari on an iPhone only has push in the Home Screen app) or null (no push here,
// or no key to subscribe with).
export function pushMethod() {
  if (!vapidPublicKey) return null;
  if (isIosSafari() && !isStandalone()) return "install";

  return "PushManager" in window ? "switch" : null;
}

function isTurnedOff() {
  try {
    return localStorage.getItem(turnedOffKey) === "1";
  } catch {
    return false;
  }
}

// The Me sheet's switch: off is remembered, so clocking in doesn't turn reminders back on.
export function rememberTurnedOff(isOff) {
  try {
    if (isOff) localStorage.setItem(turnedOffKey, "1");
    else localStorage.removeItem(turnedOffKey);
  } catch {
    // Not remembered: the next clock-in turns reminders on again.
  }
}

// From the clock-in tap, so the permission prompt counts as asked from one. A refusal is the worker's answer,
// and failures stay quiet: the switch in the Me sheet is where they'd see and retry.
export function turnOnRemindersByDefault(api) {
  if (pushMethod() !== "switch" || isTurnedOff() || Notification.permission === "denied") return;

  subscribePush(api).catch(() => {});
}

// The key arrives base64url-encoded; subscribe() wants the bytes.
function keyBytes(base64Url) {
  const base64 = base64Url.replaceAll("-", "+").replaceAll("_", "/");

  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

// Undefined without a service worker, as on the dev server.
async function pushManager() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return undefined;

  return (await navigator.serviceWorker.getRegistration())?.pushManager;
}

// Tells the switches when this device subscribes or unsubscribes, as a clock-in can do it while the header's is showing.
export const subscriptionChanges = new EventTarget();

export async function currentSubscription() {
  const manager = await pushManager();

  return (await manager?.getSubscription()) ?? null;
}

// Called from the tap, since iOS only asks for permission from one. Returns false when permission is refused.
export async function subscribePush(api) {
  if ((await Notification.requestPermission()) !== "granted") return false;
  refreshBadge();

  const manager = await pushManager();
  if (!manager) throw new Error("Reminders need the installed app.");
  const existing = await manager.getSubscription();
  const subscription =
    existing ?? (await manager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(vapidPublicKey) }));
  try {
    await api.post("/push-subscriptions", subscription.toJSON());
  } catch (error) {
    // Without the API's copy nothing would arrive, so a new subscription doesn't leave the switch looking on.
    // One that already worked stays: the API most likely still has it.
    if (!existing) await subscription.unsubscribe();
    throw error;
  }
  subscriptionChanges.dispatchEvent(new Event("change"));

  return true;
}

// The API's copy goes first, while the token still works.
export async function unsubscribePush(api) {
  const subscription = await currentSubscription();
  if (!subscription) return;

  await api.delete("/push-subscriptions", { data: { endpoint: subscription.endpoint } });
  await subscription.unsubscribe();
  subscriptionChanges.dispatchEvent(new Event("change"));
}
