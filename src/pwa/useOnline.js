import { useSyncExternalStore } from "react";

function subscribe(onChange) {
  addEventListener("online", onChange);
  addEventListener("offline", onChange);

  return () => {
    removeEventListener("online", onChange);
    removeEventListener("offline", onChange);
  };
}

function isOnline() {
  return navigator.onLine;
}

export function useOnline() {
  return useSyncExternalStore(subscribe, isOnline);
}
