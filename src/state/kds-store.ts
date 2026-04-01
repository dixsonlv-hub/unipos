import { useSyncExternalStore } from "react";
import { sampleOrders, type OrderItem, type ServiceMode } from "@/data/mock-data";

export type KDSTicketStatus = "new" | "preparing" | "ready" | "served" | "cancelled";
export type TicketUrgency = "green" | "amber" | "red";

export interface KDSTicket {
  id: string;
  orderId: string;
  tableNumber?: string;
  serviceMode: ServiceMode;
  guestCount: number;
  name: string;
  quantity: number;
  price: number;
  modifiers: { name: string; price: number }[];
  notes?: string;
  comboItems?: { name: string; groupName: string }[];
  status: KDSTicketStatus;
  firedAt?: string;
  startedAt?: string;
  readyAt?: string;
  servedAt?: string;
  cancelledAt?: string;
  collectionNumber?: string;
}

// Initialize tickets from sample orders
function initTickets(): KDSTicket[] {
  return sampleOrders.flatMap(order =>
    order.items
      .filter(i => i.status !== "served")
      .map(item => ({
        id: item.id,
        orderId: order.id,
        tableNumber: order.tableNumber,
        serviceMode: order.serviceMode,
        guestCount: order.guestCount,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        modifiers: item.modifiers,
        notes: item.notes,
        comboItems: item.comboItems,
        status: item.status as KDSTicketStatus,
        firedAt: item.firedAt,
        startedAt: item.status === "preparing" || item.status === "ready" ? item.firedAt : undefined,
        readyAt: item.status === "ready" ? new Date().toISOString() : undefined,
      }))
  );
}

let tickets: KDSTicket[] = initTickets();
let listeners = new Set<() => void>();
function emit() { listeners.forEach(l => l()); }

export function getTicketsSnapshot() { return tickets; }

export function getTicketUrgency(ticket: KDSTicket): TicketUrgency {
  if (ticket.status === "cancelled" || ticket.status === "served") return "green";
  const ref = ticket.startedAt || ticket.firedAt;
  if (!ref) return "green";
  const elapsed = (Date.now() - new Date(ref).getTime()) / 60000;
  if (elapsed > 10) return "red";
  if (elapsed > 5) return "amber";
  return "green";
}

export function getElapsedMin(timestamp?: string): number {
  if (!timestamp) return 0;
  return Math.max(0, Math.round((Date.now() - new Date(timestamp).getTime()) / 60000));
}

export function startPreparing(ticketId: string) {
  tickets = tickets.map(t =>
    t.id === ticketId && t.status === "new"
      ? { ...t, status: "preparing" as KDSTicketStatus, startedAt: new Date().toISOString() }
      : t
  );
  emit();
}

export function markReady(ticketId: string) {
  tickets = tickets.map(t =>
    t.id === ticketId && t.status === "preparing"
      ? { ...t, status: "ready" as KDSTicketStatus, readyAt: new Date().toISOString() }
      : t
  );
  emit();
}

export function markServed(ticketId: string) {
  tickets = tickets.map(t =>
    t.id === ticketId && t.status === "ready"
      ? { ...t, status: "served" as KDSTicketStatus, servedAt: new Date().toISOString() }
      : t
  );
  emit();
}

export function cancelTicket(ticketId: string) {
  tickets = tickets.map(t =>
    t.id === ticketId && t.status !== "served" && t.status !== "cancelled"
      ? { ...t, status: "cancelled" as KDSTicketStatus, cancelledAt: new Date().toISOString() }
      : t
  );
  emit();
  // Auto-dismiss cancelled tickets after 10 seconds
  setTimeout(() => {
    tickets = tickets.filter(t => !(t.id === ticketId && t.status === "cancelled"));
    emit();
  }, 10000);
}

export function addTicket(ticket: KDSTicket) {
  tickets = [...tickets, ticket];
  emit();
}

export function useKDSTickets() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    getTicketsSnapshot
  );
}
