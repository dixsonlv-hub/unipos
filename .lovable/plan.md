

# Merchant Login + Finance Integration + PRD Gap Analysis

## Overview

This plan covers three major areas:
1. **Merchant Login Page** — Supabase auth-backed login with the premium animated design from the uploaded HTML reference
2. **Finance & Reconciliation overhaul** — Upgrade from simple static page to the full payment acquirer dashboard (Transactions, Settlements, Payment Methods breakdown, Geo data) matching the uploaded merchant portal HTML
3. **PRD gap remediation** — Fill all remaining functional gaps between the current codebase and the PRD

---

## 1. Merchant Login & Auth Protection

### 1a. Database Setup

Create a `profiles` table linked to `auth.users`:
- `id` (uuid, FK → auth.users)
- `full_name`, `email`, `role` (text)
- `merchant_id` (text)
- Auto-create profile on signup via trigger
- RLS: users can read/update own profile

Enable **auto-confirm email** for development (since this is a commercial prototype, not production email verification yet).

### 1b. Login Page (`src/pages/Login.tsx` — new)

Recreate the premium login experience from the uploaded HTML:
- Deep blue gradient background with animated floating blobs (CSS keyframes)
- Canvas-based particle noise effect
- Frosted-glass login card with email + password fields
- Glowing focus ring effect on input focus
- Loading state animation on "Sign In" button
- Footer with MAS license text
- Calls `supabase.auth.signInWithPassword()`

### 1c. Auth Guard

- Create `src/components/AuthGuard.tsx` — wraps protected routes
- Checks `supabase.auth.getSession()` and `onAuthStateChange`
- Redirects to `/login` if not authenticated
- Admin routes (`/admin/*`) protected by AuthGuard
- POS routes (`/tablet`, `/mobile`, `/kds`) also protected
- Public routes: `/`, `/login`, `/qr`, `/kiosk`, `/queue` remain open

### 1d. Sign Out

- Wire the existing "Sign Out" button in `AdminLayout.tsx` to `supabase.auth.signOut()`
- Redirect to `/login` after sign out

### 1e. Routing Changes (`App.tsx`)

- Add `/login` route
- Wrap admin and POS routes with `<AuthGuard>`

---

## 2. Finance & Reconciliation Overhaul

The uploaded HTML shows a sophisticated merchant portal with Dashboard, Transactions, Settlements, Outlets, Reports, Users, and Settings pages. Currently `AdminFinance.tsx` is a basic static page.

### 2a. Rewrite `AdminFinance.tsx` with tabs

Add **4 tabs** matching the merchant portal:

**Tab 1: Overview (default)**
- 4 KPI cards: Total GMV, Transactions, Total Refunds, Net Settled
- Sales Trend chart (daily GMV line chart using recharts)
- Payment Methods breakdown panel (Card/Visa/MC/UnionPay, Alipay+, WeChat Pay, PayNow with progress bars)
- Recent Transactions mini-table
- Card Issuing Countries geo breakdown

**Tab 2: Transactions**
- Full transaction table with filters (Outlet, Method, Status, Date)
- Columns: Transaction ID, Outlet, Amount, Method, Scheme, Issuer Country, Status, Date/Time, Net
- Export CSV button
- Pagination

**Tab 3: Settlements**
- 3 KPI cards: Total Settled, Fees Deducted, Settlement Bank
- Settlement batch table with Date, Batch ID, Gross, Fees, Net Payout, Report download

**Tab 4: Reports**
- Report cards: Monthly Summary, Payment Breakdown, Settlement Summary
- Report History table with download buttons

### 2b. Data Source

Initially use comprehensive mock data matching the uploaded HTML (Song Fa data). Structure the code so it can later be swapped to real Supabase queries.

---

## 3. PRD Gap Remediation

After thorough comparison of the PRD (sections 1-14) vs current codebase, these gaps need fixing:

### 3a. Already implemented ✓
- Route structure (all routes present)
- 6 homepage entry cards
- KDS Kitchen/Server modes with time-based colors
- KDS cancel notification
- Admin KDS read-only
- Service mode toggle (fast-food/restaurant)
- Inventory with supplier comparison, COGS
- Settings with QR/Kiosk/Service mode config
- Collapsible sidebar, Back to Home, Sign Out in AdminLayout
- Order cancel rules (only when status=sent and KDS tickets=new)

### 3b. Missing: Supabase Database Tables

The PRD lists these tables as required (§8.2). Currently NO tables exist. Create migration:

- `orders` (id, table_id, table_number, service_mode, serve_together, status, guest_count, created_at, subtotal, service_charge, gst, total, customer_id, payment_captured)
- `order_items` (id, order_id FK, menu_item_id, name, price, quantity, notes, seat, status, fired_at)
- `order_item_modifiers` (id, order_item_id FK, name, price)
- `customers` (id, name, phone, email, date_of_birth, address, tags, visits, points, tier, total_spend, average_ticket, stored_balance, total_top_up, preferred_items, notes, last_visit, created_at, segment)
- `membership_tiers` (id, name, min_spend, min_visits, discount_pct, top_up_bonus_pct, perks, sort_order)
- `member_wallet_transactions` (id, customer_id FK, type, amount, balance_after, description, created_at)
- `profiles` (for auth, as described in §1a)

Add RLS policies:
- Authenticated users can CRUD on all business tables
- Profiles: users read/update own only

### 3c. Missing: Dashboard Supabase Integration

PRD §7.2 requires Dashboard to pull from Supabase `orders` with realtime subscription.

- Update `AdminDashboard.tsx` to query `orders` table
- Add `supabase_realtime` publication for `orders`
- Fall back to mock data if table is empty

### 3d. Missing: Member Wallet Top-up Flow

PRD §6.5 mentions "快速充值" (quick top-up) in POS member panel. The existing `CheckPanel` shows coupons/points but no top-up. This was referenced in PRD but likely deferred — will add a simple top-up button in member sheet.

### 3e. Missing: serveTogether KDS Logic

PRD §6.6 specifies:
- Default: item-level tickets
- If `serveTogether = true` or notes match "serve together" / "一起上": group as whole-order card

Current KDS creates item-level tickets. Need to add the serve-together grouping logic in `kds-store.ts` and reflect in KDS display.

---

## Files Summary

**New files (3)**:
- `src/pages/Login.tsx` — premium login page
- `src/components/AuthGuard.tsx` — auth protection wrapper

**Modified files (~7)**:
- `src/App.tsx` — add `/login` route, wrap routes with AuthGuard
- `src/pages/admin/AdminLayout.tsx` — wire Sign Out to supabase.auth.signOut()
- `src/pages/admin/AdminFinance.tsx` — full rewrite with 4-tab finance dashboard
- `src/pages/admin/AdminDashboard.tsx` — integrate with Supabase orders (with fallback)
- `src/state/kds-store.ts` — add serveTogether grouping logic
- `src/pages/KDSDisplay.tsx` — render grouped order cards for serveTogether

**Database migration**: Create all PRD-specified tables with RLS policies

---

## Technical Notes

- Login page uses CSS `@keyframes` for blob animation and `@property` for glow rotation — same technique as uploaded HTML but implemented in React/Tailwind
- Finance page uses `recharts` (already available via `chart.tsx`) for the sales trend chart
- Auth uses `supabase.auth.signInWithPassword()` / `signOut()` with `onAuthStateChange` listener
- All tables created with `enable row level security` and policies for authenticated users
- Dashboard realtime uses `ALTER PUBLICATION supabase_realtime ADD TABLE public.orders`

