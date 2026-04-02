import { useSyncExternalStore } from "react";

export type CustomerSegment = "new" | "regular" | "vip" | "at-risk" | "churned";
export type LoyaltyTier = "bronze" | "silver" | "gold" | "platinum";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  address?: string;
  tags: string[];
  visits: number;
  points: number;
  totalSpend: number;
  averageTicket: number;
  tier: LoyaltyTier;
  segment: CustomerSegment;
  preferredItems: string[];
  notes: string;
  lastVisit: string;
  createdAt: string;
  pointsHistory: { date: string; change: number; reason: string }[];
}

function classifySegment(visits: number, lastVisit: string): CustomerSegment {
  const daysSinceLast = Math.ceil((Date.now() - new Date(lastVisit).getTime()) / 86400000);
  if (visits <= 2) return "new";
  if (daysSinceLast > 90) return "churned";
  if (daysSinceLast > 45) return "at-risk";
  if (visits >= 20) return "vip";
  return "regular";
}

let customers: Customer[] = [
  {
    id: "c1", name: "Tan Wei Ming", phone: "+65 9123 4567", email: "weiming@email.com",
    dateOfBirth: "1988-05-12", address: "Blk 123 Ang Mo Kio Ave 6", tags: ["regular", "beer-lover"],
    visits: 24, points: 1250, totalSpend: 1860.50, averageTicket: 77.52, tier: "gold",
    segment: "vip", preferredItems: ["m1", "m26", "m8"], notes: "Prefers corner table. Allergic to peanuts.",
    lastVisit: "2026-03-27", createdAt: "2024-06-15",
    pointsHistory: [
      { date: "2026-03-27", change: 78, reason: "Purchase #ORD-2847" },
      { date: "2026-03-20", change: 45, reason: "Purchase #ORD-2791" },
      { date: "2026-03-14", change: -500, reason: "Redeemed: Free Chilli Crab" },
    ],
  },
  {
    id: "c2", name: "Sarah Lim", phone: "+65 8234 5678", email: "sarah.lim@gmail.com",
    dateOfBirth: "1995-11-30", tags: ["vegetarian-friendly"],
    visits: 8, points: 420, totalSpend: 385.20, averageTicket: 48.15, tier: "silver",
    segment: "regular", preferredItems: ["m15b", "m22b"], notes: "",
    lastVisit: "2026-03-12", createdAt: "2025-08-20",
    pointsHistory: [{ date: "2026-03-12", change: 52, reason: "Purchase #ORD-2650" }],
  },
  {
    id: "c3", name: "Ahmad bin Hassan", phone: "+65 9345 6789",
    tags: ["halal"], visits: 3, points: 150, totalSpend: 128.00, averageTicket: 42.67, tier: "bronze",
    segment: "new", preferredItems: ["m39", "m51"], notes: "Halal requirements",
    lastVisit: "2026-03-10", createdAt: "2026-01-05",
    pointsHistory: [{ date: "2026-03-10", change: 43, reason: "Purchase #ORD-2612" }],
  },
  {
    id: "c4", name: "Priya Sharma", phone: "+65 8456 7890", email: "priya@email.com",
    dateOfBirth: "1982-08-22", address: "12 Bukit Timah Road", tags: ["corporate", "high-spender"],
    visits: 45, points: 3200, totalSpend: 5480.00, averageTicket: 121.78, tier: "platinum",
    segment: "vip", preferredItems: ["m8", "m9", "m28", "m41"], notes: "Corporate account. Invoice to Sharma & Associates.",
    lastVisit: "2026-03-28", createdAt: "2023-11-10",
    pointsHistory: [
      { date: "2026-03-28", change: 156, reason: "Purchase #ORD-2860" },
      { date: "2026-03-25", change: 98, reason: "Purchase #ORD-2835" },
    ],
  },
  {
    id: "c5", name: "James Koh", phone: "+65 9567 8901", email: "jkoh@work.sg",
    tags: ["lunch-regular"], visits: 15, points: 680, totalSpend: 920.00, averageTicket: 61.33, tier: "silver",
    segment: "regular", preferredItems: ["m1", "m3", "m22b"], notes: "Usually comes for lunch",
    lastVisit: "2026-03-26", createdAt: "2025-02-14",
    pointsHistory: [{ date: "2026-03-26", change: 35, reason: "Purchase #ORD-2840" }],
  },
  {
    id: "c6", name: "Chen Mei Ling", phone: "+65 8678 9012",
    dateOfBirth: "1990-03-08", tags: ["birthday-march"],
    visits: 6, points: 280, totalSpend: 310.00, averageTicket: 51.67, tier: "bronze",
    segment: "regular", preferredItems: ["m20", "m21", "m24"], notes: "Birthday this month!",
    lastVisit: "2026-02-05", createdAt: "2025-09-01",
    pointsHistory: [{ date: "2026-02-05", change: 48, reason: "Purchase #ORD-2420" }],
  },
  {
    id: "c7", name: "Lim Ah Kow", phone: "+65 9789 0123",
    tags: [], visits: 12, points: 0, totalSpend: 580.00, averageTicket: 48.33, tier: "silver",
    segment: "at-risk", preferredItems: ["m60", "m23"], notes: "Hasn't visited in 50 days",
    lastVisit: "2026-02-07", createdAt: "2024-12-01",
    pointsHistory: [],
  },
  {
    id: "c8", name: "Ravi Menon", phone: "+65 8890 1234", email: "ravi.m@email.com",
    tags: ["churned"], visits: 4, points: 80, totalSpend: 195.00, averageTicket: 48.75, tier: "bronze",
    segment: "churned", preferredItems: ["m4", "m26"], notes: "",
    lastVisit: "2025-11-20", createdAt: "2025-06-10",
    pointsHistory: [],
  },
];

let listeners = new Set<() => void>();
function emit() { listeners.forEach(l => l()); }

export function getCustomersSnapshot() { return customers; }

export function addCustomer(c: Customer) {
  customers = [...customers, c];
  emit();
}

export function updateCustomer(id: string, updates: Partial<Customer>) {
  customers = customers.map(c => c.id === id ? { ...c, ...updates } : c);
  emit();
}

export function deleteCustomer(id: string) {
  customers = customers.filter(c => c.id !== id);
  emit();
}

export function addPoints(id: string, points: number, reason: string) {
  customers = customers.map(c => {
    if (c.id !== id) return c;
    const newPoints = c.points + points;
    const newTier: LoyaltyTier =
      newPoints >= 3000 ? "platinum" : newPoints >= 1000 ? "gold" : newPoints >= 400 ? "silver" : "bronze";
    return {
      ...c, points: newPoints, tier: newTier,
      pointsHistory: [{ date: new Date().toISOString().split("T")[0], change: points, reason }, ...c.pointsHistory],
    };
  });
  emit();
}

export function recordVisit(id: string, amount: number) {
  customers = customers.map(c => {
    if (c.id !== id) return c;
    const newVisits = c.visits + 1;
    const newSpend = c.totalSpend + amount;
    return {
      ...c, visits: newVisits, totalSpend: newSpend,
      averageTicket: Math.round((newSpend / newVisits) * 100) / 100,
      lastVisit: new Date().toISOString().split("T")[0],
      segment: classifySegment(newVisits, new Date().toISOString()),
    };
  });
  emit();
}

export function findCustomerByPhone(phone: string): Customer | undefined {
  const clean = phone.replace(/\s/g, "");
  return customers.find(c => c.phone.replace(/\s/g, "").endsWith(clean) || c.phone.replace(/\s/g, "") === clean);
}

export function registerCustomer(phone: string, email: string, nickname: string): Customer {
  const id = `c${Date.now()}`;
  const now = new Date().toISOString().split("T")[0];
  const newCustomer: Customer = {
    id, name: nickname, phone: `+65 ${phone}`, email,
    tags: ["qr-signup"], visits: 0, points: 0, totalSpend: 0,
    averageTicket: 0, tier: "bronze", segment: "new",
    preferredItems: [], notes: "", lastVisit: now, createdAt: now,
    pointsHistory: [],
  };
  addCustomer(newCustomer);
  return newCustomer;
}

export interface Coupon {
  id: string;
  code: string;
  label: string;
  type: "percent" | "fixed";
  value: number; // percent (0-100) or fixed dollar amount
  minSpend: number;
  expiresAt: string;
  tier?: LoyaltyTier; // only available for this tier and above
}

const tierOrder: LoyaltyTier[] = ["bronze", "silver", "gold", "platinum"];

function isTierEligible(customerTier: LoyaltyTier, requiredTier?: LoyaltyTier): boolean {
  if (!requiredTier) return true;
  return tierOrder.indexOf(customerTier) >= tierOrder.indexOf(requiredTier);
}

let coupons: Coupon[] = [
  { id: "cp1", code: "WELCOME10", label: "10% Off First Order", type: "percent", value: 10, minSpend: 0, expiresAt: "2026-12-31" },
  { id: "cp2", code: "VIP20", label: "$20 Off (VIP+)", type: "fixed", value: 20, minSpend: 80, expiresAt: "2026-12-31", tier: "gold" },
  { id: "cp3", code: "SILVER5", label: "$5 Off (Silver+)", type: "fixed", value: 5, minSpend: 30, expiresAt: "2026-12-31", tier: "silver" },
  { id: "cp4", code: "PLAT15", label: "15% Off (Platinum)", type: "percent", value: 15, minSpend: 50, expiresAt: "2026-12-31", tier: "platinum" },
];

export function getCouponsSnapshot() { return coupons; }

export function getAvailableCoupons(customer: Customer): Coupon[] {
  const now = new Date().toISOString();
  return coupons.filter(c => c.expiresAt >= now && isTierEligible(customer.tier, c.tier));
}

export function applyCoupon(coupon: Coupon, subtotal: number): number {
  if (subtotal < coupon.minSpend) return 0;
  if (coupon.type === "percent") return Math.round(subtotal * coupon.value) / 100;
  return Math.min(coupon.value, subtotal);
}

export function redeemPoints(customerId: string, points: number, reason: string): boolean {
  const c = customers.find(c => c.id === customerId);
  if (!c || c.points < points) return false;
  addPoints(customerId, -points, reason);
  return true;
}

export function useCustomers() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    getCustomersSnapshot
  );
}
