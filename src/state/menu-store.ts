import { useSyncExternalStore } from "react";
import { menuItems as initialMenuItems, type MenuItem } from "@/data/mock-data";

let items = [...initialMenuItems];
let listeners = new Set<() => void>();

function emit() { listeners.forEach(l => l()); }

export function getMenuItemsSnapshot() { return items; }

export function addMenuItemToStore(item: MenuItem) {
  items = [...items, item];
  emit();
}

export function updateMenuItemInStore(id: string, updates: Partial<MenuItem>) {
  items = items.map(i => i.id === id ? { ...i, ...updates } : i);
  emit();
}

export function deleteMenuItemFromStore(id: string) {
  items = items.filter(i => i.id !== id);
  emit();
}

export function useMenuItems() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    getMenuItemsSnapshot
  );
}
