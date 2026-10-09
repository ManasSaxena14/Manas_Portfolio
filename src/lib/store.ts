"use client";

import { useSyncExternalStore } from "react";

// Tiny global store for the few pieces of state several components share.
type State = {
  menuOpen: boolean;
  heroIn: boolean;
  loaderDone: boolean;
};

const initial: State = { menuOpen: false, heroIn: false, loaderDone: false };
let state: State = initial;
const listeners = new Set<() => void>();

export const store = {
  get: () => state,
  set(patch: Partial<State>) {
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

export function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(
    store.subscribe,
    () => select(state),
    () => select(initial),
  );
}
