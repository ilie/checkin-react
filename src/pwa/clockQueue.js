// The one clock action tapped while offline, kept in a storage object (localStorage) until it can be sent.
// The API only accepts a tap time up to 15 minutes old (API ADR 0004), so an older one is never sent.

const key = "clockQueue";

export const offlineWindowMinutes = 15;

// Queues { type, checkin_id } with the tap time. Returns false when an action is already waiting.
export function enqueue(storage, action, now) {
  if (pending(storage)) return false;
  storage.setItem(key, JSON.stringify({ ...action, tapped_at: now.toISOString() }));

  return true;
}

export function pending(storage) {
  try {
    return JSON.parse(storage.getItem(key));
  } catch {
    return null;
  }
}

// The waiting action if it's still within the window, "expired" if it's older, or null when nothing waits.
// It stays queued until clear(), so a request that never reaches the API can be sent again.
export function takeIfFresh(storage, now) {
  const action = pending(storage);
  if (!action) return null;

  const age = now.getTime() - new Date(action.tapped_at).getTime();

  return age > offlineWindowMinutes * 60_000 ? "expired" : action;
}

export function clear(storage) {
  storage.removeItem(key);
}
