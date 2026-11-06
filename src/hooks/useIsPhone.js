import { useSyncExternalStore } from "react";

// Tailwind's md breakpoint, where the phone layout ends.
export const phoneQuery = "(width < 43.75rem)";

export function isPhone() {
  return matchMedia(phoneQuery).matches;
}

function subscribe(onChange) {
  const query = matchMedia(phoneQuery);
  query.addEventListener("change", onChange);

  return () => query.removeEventListener("change", onChange);
}

// For the few places where phones render different elements, not just different styles.
export function useIsPhone() {
  return useSyncExternalStore(subscribe, isPhone);
}
