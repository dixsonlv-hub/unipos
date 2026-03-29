import { useSyncExternalStore } from "react";

export type QueueStatus = "waiting" | "called" | "seated" | "no-show" | "cancelled";

export interface QueueEntry {
  id: string;
  partySize: number;
  customerName: string;
  customerPhone: string;
  estimatedWait: number; // minutes
  status: QueueStatus;
  joinedAt: string;
  calledAt?: string;
  seatedAt?: string;
  notes: string;
  preferredZone?: string;
  queueNumber: number;
}

let nextQueueNumber = 1;

let entries: QueueEntry[] = [
  { id: "q1", partySize: 2, customerName: "David Tan", customerPhone: "+65 9111 2222", estimatedWait: 5, status: "called", joinedAt: new Date(Date.now() - 25 * 60000).toISOString(), calledAt: new Date(Date.now() - 2 * 60000).toISOString(), notes: "", queueNumber: 1 },
  { id: "q2", partySize: 4, customerName: "Alice Wong", customerPhone: "+65 8222 3333", estimatedWait: 10, status: "waiting", joinedAt: new Date(Date.now() - 15 * 60000).toISOString(), notes: "Birthday celebration", preferredZone: "Private", queueNumber: 2 },
  { id: "q3", partySize: 6, customerName: "Mohammad Ali", customerPhone: "+65 9333 4444", estimatedWait: 20, status: "waiting", joinedAt: new Date(Date.now() - 10 * 60000).toISOString(), notes: "Need high chair", queueNumber: 3 },
  { id: "q4", partySize: 2, customerName: "Jenny Lee", customerPhone: "+65 8444 5555", estimatedWait: 25, status: "waiting", joinedAt: new Date(Date.now() - 5 * 60000).toISOString(), notes: "", queueNumber: 4 },
];

nextQueueNumber = 5;

// Historical stats
let historicalEntries: QueueEntry[] = [
  { id: "qh1", partySize: 2, customerName: "Past Guest 1", customerPhone: "", estimatedWait: 8, status: "seated", joinedAt: new Date(Date.now() - 120 * 60000).toISOString(), calledAt: new Date(Date.now() - 112 * 60000).toISOString(), seatedAt: new Date(Date.now() - 110 * 60000).toISOString(), notes: "", queueNumber: 0 },
  { id: "qh2", partySize: 4, customerName: "Past Guest 2", customerPhone: "", estimatedWait: 15, status: "no-show", joinedAt: new Date(Date.now() - 90 * 60000).toISOString(), calledAt: new Date(Date.now() - 75 * 60000).toISOString(), notes: "", queueNumber: 0 },
  { id: "qh3", partySize: 3, customerName: "Past Guest 3", customerPhone: "", estimatedWait: 12, status: "seated", joinedAt: new Date(Date.now() - 80 * 60000).toISOString(), seatedAt: new Date(Date.now() - 68 * 60000).toISOString(), notes: "", queueNumber: 0 },
];

let listeners = new Set<() => void>();
function emit() { listeners.forEach(l => l()); }

export function getQueueSnapshot() { return entries; }
export function getHistoricalQueueSnapshot() { return historicalEntries; }

export function getEstimatedWait(partySize: number): number {
  // ~5 min per party of 2, +3 per additional 2 pax
  const waitingCount = entries.filter(e => e.status === "waiting").length;
  return Math.max(5, waitingCount * 8 + Math.ceil(partySize / 2) * 3);
}

export function addToQueue(name: string, phone: string, partySize: number, notes: string, zone?: string): QueueEntry {
  const entry: QueueEntry = {
    id: `q-${Date.now()}`,
    partySize,
    customerName: name,
    customerPhone: phone,
    estimatedWait: getEstimatedWait(partySize),
    status: "waiting",
    joinedAt: new Date().toISOString(),
    notes,
    preferredZone: zone,
    queueNumber: nextQueueNumber++,
  };
  entries = [...entries, entry];
  emit();
  return entry;
}

export function callNext() {
  const next = entries.find(e => e.status === "waiting");
  if (!next) return null;
  entries = entries.map(e => e.id === next.id ? { ...e, status: "called" as const, calledAt: new Date().toISOString() } : e);
  emit();
  return next;
}

export function seatEntry(id: string) {
  const entry = entries.find(e => e.id === id);
  if (!entry) return;
  entries = entries.filter(e => e.id !== id);
  historicalEntries = [{ ...entry, status: "seated", seatedAt: new Date().toISOString() }, ...historicalEntries];
  emit();
}

export function markNoShow(id: string) {
  const entry = entries.find(e => e.id === id);
  if (!entry) return;
  entries = entries.filter(e => e.id !== id);
  historicalEntries = [{ ...entry, status: "no-show" }, ...historicalEntries];
  emit();
}

export function cancelEntry(id: string) {
  entries = entries.filter(e => e.id !== id);
  emit();
}

export function getQueueStats() {
  const waiting = entries.filter(e => e.status === "waiting").length;
  const called = entries.filter(e => e.status === "called").length;
  const allHistory = historicalEntries;
  const seated = allHistory.filter(e => e.status === "seated");
  const noShows = allHistory.filter(e => e.status === "no-show");
  const avgWait = seated.length > 0
    ? Math.round(seated.reduce((sum, e) => sum + (new Date(e.seatedAt!).getTime() - new Date(e.joinedAt).getTime()) / 60000, 0) / seated.length)
    : 0;
  return { waiting, called, totalServed: seated.length, noShowRate: allHistory.length > 0 ? Math.round((noShows.length / allHistory.length) * 100) : 0, avgWait };
}

export function useQueue() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    getQueueSnapshot
  );
}

export function useQueueHistory() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    getHistoricalQueueSnapshot
  );
}
