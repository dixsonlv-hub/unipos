import { useSyncExternalStore } from "react";

export type InventoryCategory = "Raw Ingredients" | "Packaging" | "Beverages" | "Supplies";
export type StockStatus = "in-stock" | "low" | "out-of-stock" | "expiring";
export type MovementType = "receive" | "waste" | "transfer" | "sale" | "adjustment";

export interface SupplierPrice {
  supplier: string;
  unitCost: number;
  lastQuoted: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  nameZh?: string;
  sku: string;
  category: InventoryCategory;
  unit: "kg" | "L" | "pcs" | "box" | "pack";
  currentStock: number;
  reorderPoint: number;
  costPerUnit: number;
  supplier: string;
  lastRestocked: string;
  expiryDate?: string;
  linkedMenuItemIds?: string[];
  quantityPerServing?: number;
  supplierPrices?: SupplierPrice[];
}

export interface StockMovement {
  id: string;
  inventoryItemId: string;
  type: MovementType;
  quantity: number;
  reason: string;
  performedBy: string;
  timestamp: string;
  balanceAfter: number;
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  items: { inventoryItemId: string; quantity: number; unitCost: number }[];
  status: "draft" | "submitted" | "received" | "cancelled";
  expectedDelivery: string;
  createdAt: string;
  totalCost: number;
}

// Initial mock data
let inventoryItems: InventoryItem[] = [
  { id: "inv1", name: "Chicken (whole)", nameZh: "全鸡", sku: "RAW-001", category: "Raw Ingredients", unit: "kg", currentStock: 45, reorderPoint: 20, costPerUnit: 5.50, supplier: "SG Poultry Pte Ltd", lastRestocked: "2026-03-25", expiryDate: "2026-04-01", linkedMenuItemIds: ["m1"], quantityPerServing: 0.3, supplierPrices: [{ supplier: "SG Poultry Pte Ltd", unitCost: 5.50, lastQuoted: "2026-03-20" }, { supplier: "Fresh Farms SG", unitCost: 5.80, lastQuoted: "2026-03-18" }, { supplier: "Asia Protein Co", unitCost: 5.30, lastQuoted: "2026-03-15" }] },
  { id: "inv2", name: "Rice (Jasmine)", nameZh: "茉莉香米", sku: "RAW-002", category: "Raw Ingredients", unit: "kg", currentStock: 120, reorderPoint: 50, costPerUnit: 2.20, supplier: "Golden Grain Co", lastRestocked: "2026-03-20", linkedMenuItemIds: ["m1", "m15b", "m16"], quantityPerServing: 0.2, supplierPrices: [{ supplier: "Golden Grain Co", unitCost: 2.20, lastQuoted: "2026-03-15" }, { supplier: "Thai Rice Import", unitCost: 2.00, lastQuoted: "2026-03-10" }] },
  { id: "inv3", name: "Coconut Milk", nameZh: "椰浆", sku: "RAW-003", category: "Raw Ingredients", unit: "L", currentStock: 8, reorderPoint: 15, costPerUnit: 3.80, supplier: "Tropical Supplies", lastRestocked: "2026-03-22", expiryDate: "2026-04-05", linkedMenuItemIds: ["m2", "m15b"], supplierPrices: [{ supplier: "Tropical Supplies", unitCost: 3.80, lastQuoted: "2026-03-18" }, { supplier: "Indo Foods SG", unitCost: 3.50, lastQuoted: "2026-03-12" }] },
  { id: "inv4", name: "Tiger Beer (Keg)", nameZh: "虎牌啤酒桶", sku: "BEV-001", category: "Beverages", unit: "L", currentStock: 50, reorderPoint: 20, costPerUnit: 4.00, supplier: "APB Distributors", lastRestocked: "2026-03-24", linkedMenuItemIds: ["m26"] },
  { id: "inv5", name: "Takeaway Container (M)", nameZh: "外带盒(中)", sku: "PKG-001", category: "Packaging", unit: "pcs", currentStock: 500, reorderPoint: 200, costPerUnit: 0.15, supplier: "PackRight SG", lastRestocked: "2026-03-18", supplierPrices: [{ supplier: "PackRight SG", unitCost: 0.15, lastQuoted: "2026-03-10" }, { supplier: "GreenPack Asia", unitCost: 0.12, lastQuoted: "2026-03-08" }] },
  { id: "inv6", name: "Crab (Live)", nameZh: "活螃蟹", sku: "RAW-004", category: "Raw Ingredients", unit: "kg", currentStock: 12, reorderPoint: 10, costPerUnit: 28.00, supplier: "Jurong Fishery", lastRestocked: "2026-03-28", expiryDate: "2026-03-30", linkedMenuItemIds: ["m8", "m8b", "m9"] },
  { id: "inv7", name: "Noodles (Fresh)", nameZh: "鲜面条", sku: "RAW-005", category: "Raw Ingredients", unit: "kg", currentStock: 25, reorderPoint: 15, costPerUnit: 1.80, supplier: "Toa Payoh Noodle Factory", lastRestocked: "2026-03-27", expiryDate: "2026-03-31", linkedMenuItemIds: ["m3", "m12", "m13", "m14"], supplierPrices: [{ supplier: "Toa Payoh Noodle Factory", unitCost: 1.80, lastQuoted: "2026-03-20" }, { supplier: "SG Noodle House", unitCost: 1.60, lastQuoted: "2026-03-18" }] },
  { id: "inv8", name: "Teh (Tea Dust)", nameZh: "茶粉", sku: "RAW-006", category: "Raw Ingredients", unit: "kg", currentStock: 5, reorderPoint: 3, costPerUnit: 12.00, supplier: "Boh Tea SG", lastRestocked: "2026-03-15", linkedMenuItemIds: ["m22", "m22b"] },
  { id: "inv9", name: "Napkins (Pack of 500)", nameZh: "餐巾纸", sku: "SUP-001", category: "Supplies", unit: "pack", currentStock: 3, reorderPoint: 5, costPerUnit: 8.50, supplier: "PackRight SG", lastRestocked: "2026-03-10" },
  { id: "inv10", name: "Cooking Oil", nameZh: "食用油", sku: "RAW-007", category: "Raw Ingredients", unit: "L", currentStock: 30, reorderPoint: 10, costPerUnit: 3.20, supplier: "Golden Grain Co", lastRestocked: "2026-03-23" },
  { id: "inv11", name: "Chilli Paste", nameZh: "辣椒酱", sku: "RAW-008", category: "Raw Ingredients", unit: "kg", currentStock: 2, reorderPoint: 5, costPerUnit: 6.50, supplier: "Tropical Supplies", lastRestocked: "2026-03-20", expiryDate: "2026-04-20", linkedMenuItemIds: ["m8", "m8b"] },
  { id: "inv12", name: "Disposable Chopsticks", nameZh: "一次性筷子", sku: "SUP-002", category: "Supplies", unit: "pcs", currentStock: 1000, reorderPoint: 300, costPerUnit: 0.03, supplier: "PackRight SG", lastRestocked: "2026-03-15" },
];

let movements: StockMovement[] = [
  { id: "sm1", inventoryItemId: "inv1", type: "receive", quantity: 20, reason: "Regular restock", performedBy: "David Wong", timestamp: "2026-03-25T09:00:00", balanceAfter: 45 },
  { id: "sm2", inventoryItemId: "inv3", type: "waste", quantity: -2, reason: "Expired stock", performedBy: "Chef Ahmad", timestamp: "2026-03-26T08:00:00", balanceAfter: 8 },
  { id: "sm3", inventoryItemId: "inv6", type: "receive", quantity: 15, reason: "Morning delivery", performedBy: "David Wong", timestamp: "2026-03-28T07:30:00", balanceAfter: 12 },
  { id: "sm4", inventoryItemId: "inv11", type: "sale", quantity: -3, reason: "Daily usage", performedBy: "System", timestamp: "2026-03-28T22:00:00", balanceAfter: 2 },
];

let purchaseOrders: PurchaseOrder[] = [
  {
    id: "po1", supplier: "SG Poultry Pte Ltd",
    items: [{ inventoryItemId: "inv1", quantity: 30, unitCost: 5.50 }],
    status: "submitted", expectedDelivery: "2026-03-31",
    createdAt: "2026-03-28T10:00:00", totalCost: 165.00,
  },
  {
    id: "po2", supplier: "Tropical Supplies",
    items: [
      { inventoryItemId: "inv3", quantity: 20, unitCost: 3.80 },
      { inventoryItemId: "inv11", quantity: 10, unitCost: 6.50 },
    ],
    status: "draft", expectedDelivery: "2026-04-02",
    createdAt: "2026-03-29T08:00:00", totalCost: 141.00,
  },
];

let listeners = new Set<() => void>();
function emit() { listeners.forEach(l => l()); }

export function getInventorySnapshot() { return inventoryItems; }
export function getMovementsSnapshot() { return movements; }
export function getPurchaseOrdersSnapshot() { return purchaseOrders; }

export function getStockStatus(item: InventoryItem): StockStatus {
  if (item.currentStock <= 0) return "out-of-stock";
  if (item.expiryDate) {
    const daysUntilExpiry = Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / 86400000);
    if (daysUntilExpiry <= 3) return "expiring";
  }
  if (item.currentStock <= item.reorderPoint) return "low";
  return "in-stock";
}

export function adjustStock(itemId: string, qty: number, type: MovementType, reason: string, performedBy: string) {
  const item = inventoryItems.find(i => i.id === itemId);
  if (!item) return;
  const newStock = Math.max(0, item.currentStock + qty);
  inventoryItems = inventoryItems.map(i => i.id === itemId ? { ...i, currentStock: newStock, lastRestocked: type === "receive" ? new Date().toISOString().split("T")[0] : i.lastRestocked } : i);
  const movement: StockMovement = {
    id: `sm-${Date.now()}`, inventoryItemId: itemId, type, quantity: qty,
    reason, performedBy, timestamp: new Date().toISOString(), balanceAfter: newStock,
  };
  movements = [movement, ...movements];
  emit();
}

export function addInventoryItem(item: InventoryItem) {
  inventoryItems = [...inventoryItems, item];
  emit();
}

export function updateInventoryItem(id: string, updates: Partial<InventoryItem>) {
  inventoryItems = inventoryItems.map(i => i.id === id ? { ...i, ...updates } : i);
  emit();
}

export function addPurchaseOrder(po: PurchaseOrder) {
  purchaseOrders = [...purchaseOrders, po];
  emit();
}

export function updatePurchaseOrder(id: string, updates: Partial<PurchaseOrder>) {
  purchaseOrders = purchaseOrders.map(p => p.id === id ? { ...p, ...updates } : p);
  emit();
}

export function deductIngredientsForOrder(menuItemId: string, quantity: number) {
  const linkedItems = inventoryItems.filter(i => i.linkedMenuItemIds?.includes(menuItemId));
  for (const inv of linkedItems) {
    const perServing = inv.quantityPerServing || 1;
    adjustStock(inv.id, -(perServing * quantity), "sale", `Order: ${menuItemId}`, "System");
  }
}

// Overstock detection: items with stock > 3× reorder point
export function getOverstockItems(): InventoryItem[] {
  return inventoryItems.filter(i => i.currentStock > i.reorderPoint * 3);
}

// Check if a menu item is available by checking linked ingredients
export function isItemAvailableByStock(menuItemId: string): boolean {
  const linked = inventoryItems.filter(i => i.linkedMenuItemIds?.includes(menuItemId));
  if (linked.length === 0) return true; // no inventory tracking
  return linked.every(i => i.currentStock > 0);
}

// Get menu item IDs that are out of stock
export function getOutOfStockMenuItems(): string[] {
  const allLinkedIds = new Set<string>();
  inventoryItems.forEach(i => i.linkedMenuItemIds?.forEach(id => allLinkedIds.add(id)));
  return Array.from(allLinkedIds).filter(id => !isItemAvailableByStock(id));
}

// Get daily COGS from movements
export function getDailyCOGS(): { totalCOGS: number; breakdown: { itemName: string; qty: number; cost: number }[] } {
  const today = new Date().toISOString().split("T")[0];
  const todayMovements = movements.filter(m => m.type === "sale" && m.timestamp.startsWith(today));
  const breakdown: { itemName: string; qty: number; cost: number }[] = [];
  for (const m of todayMovements) {
    const item = inventoryItems.find(i => i.id === m.inventoryItemId);
    if (item) {
      breakdown.push({
        itemName: item.name,
        qty: Math.abs(m.quantity),
        cost: Math.abs(m.quantity) * item.costPerUnit,
      });
    }
  }
  return {
    totalCOGS: breakdown.reduce((sum, b) => sum + b.cost, 0),
    breakdown,
  };
}

export function useInventory() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    getInventorySnapshot
  );
}

export function useStockMovements() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    getMovementsSnapshot
  );
}

export function usePurchaseOrders() {
  return useSyncExternalStore(
    (cb) => { listeners.add(cb); return () => listeners.delete(cb); },
    getPurchaseOrdersSnapshot
  );
}
