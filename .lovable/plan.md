

# Comprehensive POS Upgrade Plan

## Summary

Sync updates from the `poslick` GitHub repo into the current project, upgrade all business logic to commercial standards, and add 4 new major modules: Inventory Management, Professional CRM, Floor Plan Editor, and Queue Management.

---

## Part A: Sync from GitHub Repo

The GitHub repo has several improvements not yet in this project:

### A1. State Management Layer
- Create `src/state/menu-store.ts` — reactive menu item store using `useSyncExternalStore` with CRUD operations (`useMenuItems`, `addMenuItemToStore`, `updateMenuItemInStore`, `deleteMenuItemFromStore`, `getMenuItemsSnapshot`)
- Create `src/state/pricing-store.ts` — pricing strategy engine with time-based/category-based discount rules, conflict detection, and CRUD

### A2. Promotions Module
- Create `src/pages/admin/AdminPromotions.tsx` (~644 lines) — full promotion management with types (discount, BOGO, gift, coupon, loyalty, happy hour), pricing strategy editor with time windows/weekday targeting, conflict detection UI
- Add route `/admin/promotions` in `App.tsx`
- Add "Promotions" nav item (Tag icon) in `AdminLayout.tsx`

### A3. Order History Refactor
- Create `src/components/tablet/history/types.ts` — `PaidOrder` type with `cashReceived`/`changeDue` fields
- Create `src/components/tablet/history/OrderHistoryList.tsx` — searchable, filterable list with payment method filter pills
- Create `src/components/tablet/history/OrderHistoryDetail.tsx` — full receipt view with breakdown
- Refactor `OrderHistory.tsx` to use these sub-components

### A4. TabletPOS Upgrades
- Add resizable panel widths with drag handles (left/right panels)
- Add `generateMockHistory()` for 30 pre-seeded demo orders
- Add reserved table seating flow (`handleSeatReserved`)
- Add table reservation (`handleReserveTable`)
- Pass `onSeatReserved` and `onReserveTable` to FloorPanel

### A5. CheckPanel Upgrades
- Add promo code input and validation
- Add manual discount presets (10%, 20%, $5, $10)
- Add member detection toggle
- Add bill split functionality
- Discounts properly reduce total with correct service charge/GST recalc

### A6. PaymentSheet Upgrades
- Add QR payment sub-methods (Alipay, WeChat Pay, PayNow)
- Cash numpad with quick-amount buttons
- Pass `cashReceived`/`changeDue` to payment completion
- Proper `onComplete(method, cashReceived)` signature

### A7. FloorPanel Upgrades
- Add reserve table dialog with guest count and customer name
- Add "Seat Guests" button for reserved tables
- Pass through `onSeatReserved` and `onReserveTable` callbacks

### A8. AdminMenu Upgrade
- Use `useMenuItems()` from menu-store instead of static imports
- Full inline editor for items: name (EN/ZH), price, category, availability, popularity, description
- Combo group editor: add/remove groups, set required count, manage allowed items
- Create new items and delete existing ones

### A9. AdminCRM
- Add functional search filter (currently search input is non-functional)

### A10. AdminKDS
- Fix `getElapsedMin` to use `Date.now()` instead of hardcoded date

---

## Part B: Business Logic Standardization

### B1. Financial Calculations
- Ensure all monetary values use 2-decimal rounding consistently
- Service charge: 10% on subtotal (after discounts)
- GST: 9% on (subtotal + service charge) — Singapore standard
- Discount applied before service charge/GST calculation
- Split bill divides total equally with rounding correction on last share

### B2. Order Lifecycle
- Clear state machine: `open` → `sent` → `preparing` → `ready` → `served` → `paid`
- Void requires manager PIN
- Paid orders release table to "dirty" status
- Table cleaning flow: dirty → cleaning → available

### B3. Inventory Deduction (new)
- When order status changes to "sent", deduct ingredient quantities
- Low stock alerts when below reorder point

---

## Part C: New Modules

### C1. Inventory Management (`/admin/inventory`)
- **Data model**: `InventoryItem` with fields: id, name, nameZh, sku, category (Raw Ingredients / Packaging / Beverages / Supplies), unit (kg/L/pcs/box), currentStock, reorderPoint, costPerUnit, supplier, lastRestocked, expiryDate
- **State store**: `src/state/inventory-store.ts` with reactive store pattern matching menu-store
- **Admin page**: `src/pages/admin/AdminInventory.tsx`
  - KPI cards: Total SKUs, Low Stock Alerts, Total Value, Items Expiring Soon
  - Tabbed view: Stock List / Purchase Orders / Stock Movement Log
  - Stock list: searchable table with stock level progress bars, color-coded status (In Stock / Low / Out of Stock / Expiring)
  - Inline stock adjustment (receive/waste/transfer) with reason codes
  - Purchase order creation with supplier, items, quantities, expected delivery
  - Stock movement history with timestamps and audit trail
- **Menu-Inventory linking**: Each MenuItem can reference ingredient IDs and quantities needed per serving

### C2. Professional CRM (`/admin/crm` upgrade)
- **Data model expansion**: Add to Customer type: `dateOfBirth`, `address`, `tags[]`, `totalSpend`, `averageTicket`, `preferredItems[]`, `notes`, `createdAt`, `segment` (new/regular/VIP/at-risk/churned)
- **State store**: `src/state/customer-store.ts`
- **Complete CRM page rewrite**:
  - KPI dashboard: Total Customers, New This Month, Average Spend, Retention Rate
  - Customer segments with auto-classification based on visit frequency and spend
  - Customer detail panel (click to expand): full profile, visit history timeline, spend analytics, preference tags, notes
  - Customer search by name/phone/email/membership ID
  - Bulk actions: send promotion, update tier, export
  - Loyalty program: points balance, tier progression (Bronze → Silver → Gold → Platinum), point history
  - Birthday/anniversary tracking with upcoming list

### C3. Floor Plan Editor (`/admin/floorplan`)
- **Admin page**: `src/pages/admin/AdminFloorPlan.tsx`
  - Drag-and-drop table placement on a grid canvas
  - Table shapes: round (2-4 pax), square (4 pax), rectangular (6-8 pax), booth (4-6 pax)
  - Add/remove/resize tables
  - Zone management: create/rename/reorder zones
  - Snap-to-grid with alignment guides
  - Save layout per zone
  - Preview mode showing real-time table status overlay
- **State store**: `src/state/floorplan-store.ts` storing table positions (`x`, `y`) and dimensions
- **Integration**: FloorPanel reads positions from floorplan-store for spatial rendering (optional grid view vs list view toggle)

### C4. Queue Management (`/admin/queue` + customer-facing)
- **Data model**: `QueueEntry` with fields: id, partySize, customerName, customerPhone, estimatedWait, status (waiting/seated/no-show/cancelled), joinedAt, calledAt, seatedAt, notes, preferredZone
- **State store**: `src/state/queue-store.ts`
- **Admin page**: `src/pages/admin/AdminQueue.tsx`
  - Real-time queue board with current wait count and average wait time
  - Add walk-in to queue with party size and contact
  - Call next: sends notification (visual + optional SMS placeholder)
  - Queue entry states: Waiting → Called → Seated / No-Show
  - Historical stats: average wait time, no-show rate, peak hours
  - Configurable estimated wait time per party size
- **Customer-facing kiosk view**: `/queue` route
  - Clean display showing queue position and estimated wait
  - Self-service join queue with name and party size
  - Real-time updates when position changes

---

## Part D: Routes and Navigation

Update `App.tsx` routes:
```
/admin/promotions  → AdminPromotions
/admin/inventory   → AdminInventory
/admin/floorplan   → AdminFloorPlan
/admin/queue       → AdminQueue
/queue             → QueueKiosk (public)
```

Update `AdminLayout.tsx` sidebar:
- Add Promotions (Tag icon)
- Add Inventory (Package icon)  
- Add Floor Plan (Map icon)
- Add Queue (ListOrdered icon)

---

## Files to Create/Modify

**New files (~15):**
- `src/state/menu-store.ts`
- `src/state/pricing-store.ts`
- `src/state/inventory-store.ts`
- `src/state/customer-store.ts`
- `src/state/floorplan-store.ts`
- `src/state/queue-store.ts`
- `src/components/tablet/history/types.ts`
- `src/components/tablet/history/OrderHistoryList.tsx`
- `src/components/tablet/history/OrderHistoryDetail.tsx`
- `src/pages/admin/AdminPromotions.tsx`
- `src/pages/admin/AdminInventory.tsx`
- `src/pages/admin/AdminFloorPlan.tsx`
- `src/pages/admin/AdminQueue.tsx`
- `src/pages/QueueKiosk.tsx`

**Modified files (~10):**
- `src/App.tsx` — new routes
- `src/pages/admin/AdminLayout.tsx` — new nav items
- `src/pages/TabletPOS.tsx` — resizable panels, reservation flow, mock history, menu-store integration
- `src/components/tablet/CheckPanel.tsx` — discounts, promos, split bill
- `src/components/tablet/PaymentSheet.tsx` — QR methods, cash handling
- `src/components/tablet/FloorPanel.tsx` — reservation dialog, seat guests
- `src/components/tablet/OrderHistory.tsx` — delegate to sub-components
- `src/pages/admin/AdminMenu.tsx` — use menu-store, inline editor
- `src/pages/admin/AdminCRM.tsx` — complete rewrite with professional CRM
- `src/pages/admin/AdminKDS.tsx` — fix elapsed time calculation
- `src/data/mock-data.ts` — expanded Customer type, inventory items

---

## Implementation Priority

Due to the scope, this will be implemented in batches:
1. State stores + GitHub sync (A1-A10) — foundation
2. Inventory Management (C1) — new module
3. Professional CRM (C2) — rewrite existing
4. Floor Plan Editor (C3) — new module
5. Queue Management (C4) — new module

