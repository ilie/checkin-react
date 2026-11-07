// Desktop's navigation: the toolbar across the top (the default) or a sidebar, chosen in Me and kept per device (ADR 0006).

import { useSyncExternalStore } from "react";

export const layouts = ["toolbar", "sidebar"];

const storageKey = "layout";
const listeners = new Set();
// Where the choice lives when storage is blocked, as in private browsing: until the page reloads.
let unsavedLayout = "toolbar";

export function savedLayout() {
  try {
    const layout = localStorage.getItem(storageKey);

    return layouts.includes(layout) ? layout : "toolbar";
  } catch {
    return unsavedLayout;
  }
}

export function saveLayout(layout) {
  try {
    localStorage.setItem(storageKey, layout);
  } catch {
    unsavedLayout = layout;
  }
  for (const listener of listeners) listener();
}

function subscribe(onChange) {
  listeners.add(onChange);

  return () => listeners.delete(onChange);
}

export function useLayout() {
  return useSyncExternalStore(subscribe, savedLayout);
}
