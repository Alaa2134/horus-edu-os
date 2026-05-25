// ===================================================================
// Horus Rescue AI — React binding to the in-memory store
// ===================================================================

import { useSyncExternalStore } from "react";
import { store } from "@/lib/mockApi";
import type { AppState } from "@/types";

/** Subscribe to the whole app state. */
export function useAppState(): AppState {
  return useSyncExternalStore(store.subscribe, store.getState, store.getState);
}

/** Select a slice of state with a custom selector. */
export function useSelector<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => selector(store.getState()),
    () => selector(store.getState()),
  );
}

/** All action/service methods live on the singleton. */
export function useActions() {
  return store;
}
