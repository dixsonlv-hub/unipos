import { useSyncExternalStore } from "react";

export interface KioskState {
  dailyCounter: number;
  lastResetDate: string;
}

let state: KioskState = {
  dailyCounter: 22, // simulate some orders already placed today
  lastResetDate: new Date().toISOString().split("T")[0],
};

let listeners = new Set<() => void>();
function emit() { listeners.forEach(l => l()); }

function ensureDailyReset() {
  const today = new Date().toISOString().split("T")[0];
  if (state.lastResetDate !== today) {
    state = { dailyCounter: 0, lastResetDate: today };
    emit();
  }
}

export function getNextCollectionNumber(): string {
  ensureDailyReset();
  state = { ...state, dailyCounter: state.dailyCounter + 1 };
  emit();
  const prefix = "A";
  return `${prefix}${String(state.dailyCounter).padStart(3, "0")}`;
}

export function getKioskSnapshot() { return state; }

export function useKioskStore() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    getKioskSnapshot
  );
}
