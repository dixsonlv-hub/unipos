

# KDS Overhaul + Inventory Intelligence + Service Mode Config

## Overview

Three interconnected feature sets across ~15 file changes:

1. **KDS Kitchen** — Interactive ticket workflow with time-based color coding, cancel notifications, and a dedicated front-of-house "Collection/Serve" screen accessible from the homepage
2. **Inventory Intelligence** — Supplier price comparison, daily COGS tracking, stock-driven promotions/sold-out, and deeper menu-ingredient linkage
3. **Service Mode** — Fast-food vs Restaurant mode toggle in admin settings, controlling order flow (pay-first vs fire-first)

---

## 1. KDS Overhaul

### 1a. Interactive KDS with time-based colors (`src/pages/admin/AdminKDS.tsx` rewrite)

- Add **mode toggle** at top: "Kitchen" vs "Server/Collection" (tabs or segmented control)
- **Kitchen mode**:
  - Tickets are interactive — chef clicks "Start" (new→preparing), "Done" (preparing→ready)
  - Time-based color: green border (0–5min), amber (5–10min), red+pulse (>10min) — computed from `firedAt`
  - Cancelled tickets show with a red "CANCELLED" overlay banner + strikethrough, auto-dismiss after 10s
- **Server/Collection mode**:
  - Shows only `ready` tickets in a large grid (optimized for wall-mounted screen)
  - Staff clicks "Collected" / "Served" → ticket disappears (status→served)
  - For kiosk orders: shows collection number prominently (e.g. "#A023")
  - For dine-in: shows table number

### 1b. KDS store (`src/state/kds-store.ts` — new)

- Centralized ticket state derived from orders, with mutation functions:
  - `startPreparing(ticketId)` — new→preparing, records `startedAt`
  - `markReady(ticketId)` — preparing→ready
  - `markServed(ticketId)` — ready→served
  - `cancelTicket(ticketId)` — any→cancelled, adds `cancelledAt`
- Emits to all listeners (KDS screen + collection screen react in real-time)
- `getTicketUrgency(ticket)` → "green" | "amber" | "red" based on elapsed time

### 1c. Homepage KDS entry (`src/pages/Index.tsx`)

- Add "KDS" card to the surface selector grid (6th card alongside Tablet, Mobile, Kiosk, QR, Admin)

### 1d. Standalone KDS page (`src/pages/KDSDisplay.tsx` — new)

- Full-screen KDS page at `/kds` route (no admin chrome)
- Same Kitchen/Server mode toggle as admin version
- Designed for wall-mounted screens — large text, high contrast

### 1e. Cancel order flow

- When an order is cancelled (via Tablet POS or Admin), `cancelTicket()` is called
- KDS kitchen view shows cancelled ticket briefly with red "CANCELLED" banner
- Prevents kitchen from cooking already-cancelled items

---

## 2. Inventory Intelligence

### 2a. Menu-Ingredient Recipe Linkage (`src/state/inventory-store.ts`)

- Expand `InventoryItem` with `supplierPrices?: { supplier: string; unitCost: number; lastQuoted: string }[]` for multi-supplier comparison
- Existing `linkedMenuItemIds` + `quantityPerServing` already handles per-dish ingredient mapping — this is the recipe linkage

### 2b. Supplier Price Comparison (new tab in `AdminInventory.tsx`)

- Add "Suppliers" tab showing per-item price comparison across suppliers
- Highlight cheapest supplier per item

### 2c. Daily COGS Summary (new tab in `AdminInventory.tsx`)

- "Daily Summary" tab with:
  - Total items sold today (from movement log, type="sale")
  - COGS = sum of (qty sold × costPerUnit) for each ingredient
  - COGS % = COGS / Revenue (revenue from sales data)
  - Bar chart or simple table breakdown by category

### 2d. Stock-driven promotions & sold-out (`src/state/inventory-store.ts`)

- `getOverstockItems()` — items where currentStock > reorderPoint × 3 → suggest promotion
- `getOutOfStockMenuItems()` — cross-reference with `linkedMenuItemIds` to find menu items that should show "Sold Out"
- QR menu browser + Kiosk menu check `isItemAvailableByStock(menuItemId)` before allowing order

### 2e. Inventory tab in AdminMenu

- In `AdminMenu.tsx`, each menu item card shows linked ingredients + per-serving quantity
- "Recipe" section showing which raw materials and how many grams each dish uses

---

## 3. Service Mode — Fast Food vs Restaurant

### 3a. Settings store (`src/state/settings-store.ts`)

- Add `serviceType: "fast-food" | "restaurant"` to `MerchantSettings`
- Fast-food: pay first → fire to kitchen (Kiosk-style flow)
- Restaurant: fire to kitchen first → pay after eating

### 3b. Admin Settings UI (`src/pages/admin/AdminSettings.tsx`)

- Add "Service Mode" card with radio toggle: Fast Food / Restaurant
- Description explaining the order flow difference

### 3c. Flow impact

- TabletPOS + MobilePOS read `settings.serviceType` to determine:
  - Fast-food: "Pay" button appears before "Send to Kitchen"
  - Restaurant: "Send to Kitchen" first, "Pay" only after items served
- This is a UI logic change in existing POS pages (conditional button order)

---

## Files Summary

**New files (3)**:
- `src/state/kds-store.ts` — centralized KDS ticket state
- `src/pages/KDSDisplay.tsx` — standalone full-screen KDS page

**Modified files (~8)**:
- `src/pages/admin/AdminKDS.tsx` — interactive tickets, time colors, kitchen/server mode, cancel display
- `src/pages/admin/AdminInventory.tsx` — supplier comparison tab, daily COGS tab
- `src/state/inventory-store.ts` — supplier prices, overstock detection, stock availability check
- `src/state/settings-store.ts` — add `serviceType` field
- `src/pages/admin/AdminSettings.tsx` — service mode toggle card
- `src/pages/admin/AdminMenu.tsx` — recipe/ingredient display per menu item
- `src/pages/Index.tsx` — add KDS card
- `src/App.tsx` — add `/kds` route

