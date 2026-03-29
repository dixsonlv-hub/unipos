import { useSyncExternalStore } from "react";

export interface PricingRule {
  id: string;
  name: string;
  type: "time-based" | "category" | "item" | "happy-hour";
  discountType: "percentage" | "fixed";
  discountValue: number;
  targetCategory?: string;
  targetItemIds?: string[];
  startTime?: string; // HH:mm
  endTime?: string;
  daysOfWeek?: number[]; // 0=Sun, 6=Sat
  active: boolean;
  priority: number;
  createdAt: string;
}

let rules: PricingRule[] = [
  {
    id: "pr1", name: "Happy Hour (3-6 PM)", type: "happy-hour",
    discountType: "percentage", discountValue: 20,
    targetCategory: "Alcohol", startTime: "15:00", endTime: "18:00",
    daysOfWeek: [1, 2, 3, 4, 5], active: true, priority: 1,
    createdAt: new Date().toISOString(),
  },
  {
    id: "pr2", name: "Weekend Brunch 10% Off", type: "time-based",
    discountType: "percentage", discountValue: 10,
    startTime: "10:00", endTime: "14:00",
    daysOfWeek: [0, 6], active: true, priority: 2,
    createdAt: new Date().toISOString(),
  },
];

let listeners = new Set<() => void>();
function emit() { listeners.forEach(l => l()); }

export function getPricingRulesSnapshot() { return rules; }

export function addPricingRule(rule: PricingRule) {
  rules = [...rules, rule];
  emit();
}

export function updatePricingRule(id: string, updates: Partial<PricingRule>) {
  rules = rules.map(r => r.id === id ? { ...r, ...updates } : r);
  emit();
}

export function deletePricingRule(id: string) {
  rules = rules.filter(r => r.id !== id);
  emit();
}

export function detectConflicts(rule: PricingRule): PricingRule[] {
  return rules.filter(r => {
    if (r.id === rule.id || !r.active) return false;
    if (rule.targetCategory && r.targetCategory && rule.targetCategory === r.targetCategory) {
      if (rule.startTime && r.startTime && rule.endTime && r.endTime) {
        return rule.startTime < r.endTime && rule.endTime > r.startTime;
      }
      return true;
    }
    return false;
  });
}

export function getApplicableDiscount(itemId: string, category: string): number {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const currentDay = now.getDay();

  let bestDiscount = 0;
  for (const rule of rules) {
    if (!rule.active) continue;
    if (rule.daysOfWeek && !rule.daysOfWeek.includes(currentDay)) continue;
    if (rule.startTime && rule.endTime && (currentTime < rule.startTime || currentTime > rule.endTime)) continue;

    let applies = false;
    if (rule.targetCategory && rule.targetCategory === category) applies = true;
    if (rule.targetItemIds && rule.targetItemIds.includes(itemId)) applies = true;
    if (!rule.targetCategory && !rule.targetItemIds) applies = true;

    if (applies) {
      bestDiscount = Math.max(bestDiscount, rule.discountValue);
    }
  }
  return bestDiscount;
}

export function usePricingRules() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    getPricingRulesSnapshot
  );
}
