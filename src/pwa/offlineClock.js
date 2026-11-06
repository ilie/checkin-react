import { useEffect, useEffectEvent, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { apiErrorMessage } from "../helpers/api";
import { shortTime } from "../helpers/time";
import { useClock } from "../hooks/checkins";
import { clear, enqueue, offlineWindowMinutes, pending, takeIfFresh } from "./clockQueue";

// The clock tap made offline (ADR 0002): queued in localStorage with its time, shown as "Pending",
// and sent when the app is back online, comes back to the front, or starts. iOS has no Background Sync,
// so this one path covers both platforms.

const listeners = new Set();

function changed() {
  for (const listener of listeners) listener();
}

function subscribe(listener) {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

export function queueClock(action) {
  enqueue(localStorage, action, new Date());
  changed();
}

export function useHasPendingClock() {
  return useSyncExternalStore(subscribe, () => pending(localStorage) !== null);
}

// A flush already on its way, so the online event and visibilitychange can't send the tap twice.
let isFlushing = false;

async function flush(clock) {
  if (isFlushing || !navigator.onLine) return;
  const action = takeIfFresh(localStorage, new Date());
  if (!action) return;

  if (action === "expired") {
    const { type, tapped_at: tappedAt } = pending(localStorage);
    clear(localStorage);
    changed();
    toast.error(
      `Your ${type === "checkin" ? "clock-in" : "clock-out"} at ${shortTime(new Date(tappedAt).toTimeString())} wasn't sent within ${offlineWindowMinutes} minutes, so it wasn't saved. Ask an admin to correct your record.`,
      // It may be the first thing they see on opening the app, so it stays until they close it.
      { duration: Infinity, closeButton: true },
    );
    return;
  }

  isFlushing = true;
  try {
    await clock.mutateAsync(action);
    clear(localStorage);
  } catch (error) {
    // Without a response it never reached the API, so it's kept for the next try. The API refused anything else.
    if (!error.response) return;
    clear(localStorage);
    toast.error(apiErrorMessage(error));
  } finally {
    isFlushing = false;
    changed();
  }
}

// Runs for the whole signed-in session, whatever page is open.
export function useFlushPendingClock(isLoggedIn) {
  const clock = useClock();
  const flushNow = useEffectEvent(() => flush(clock));

  useEffect(() => {
    if (!isLoggedIn) return;

    function flushWhenOnline() {
      flushNow();
    }

    function flushWhenVisible() {
      if (document.visibilityState === "visible") flushNow();
    }

    flushNow();
    window.addEventListener("online", flushWhenOnline);
    document.addEventListener("visibilitychange", flushWhenVisible);
    // A tap queued because its request got no answer has no online event to wait for, as the phone never said
    // it was offline. Trying again every 30 seconds sends it well within the 15 minutes.
    const retry = setInterval(flushWhenOnline, 30_000);

    return () => {
      clearInterval(retry);
      window.removeEventListener("online", flushWhenOnline);
      document.removeEventListener("visibilitychange", flushWhenVisible);
    };
  }, [isLoggedIn]);
}
