

# Add Kiosk Self-Ordering & QR Table Ordering

## Overview

Add two new customer-facing ordering surfaces alongside existing Tablet/Mobile/Admin:
1. **Kiosk** (`/kiosk`) — Vertical 1080p/4K touch screen for self-service ordering + payment, McDonald's-style collection number
2. **QR Ordering** (`/qr`) — Mobile browser for scan-to-order at table, with optional pre-pay or pay-later (merchant-configurable)

Plus: QR Ordering as a member registration channel (phone OTP / email OTP / nickname), with points earned per order.

---

## 1. Kiosk Self-Ordering (`/kiosk`)

**New file**: `src/pages/KioskOrdering.tsx`

- **Layout**: Full-height vertical screen, optimized for touch (large buttons, 48px+ tap targets)
- **Flow**: Welcome → Choose Dine-in/Takeaway → Browse Menu (categories + items grid) → Item detail with modifiers/combos → Cart sidebar → Payment (card/QR) → Collection Number screen
- **Collection Number**: Auto-incrementing daily counter stored in a kiosk-store. After payment, show large collection number (e.g. "#A023") with estimated prep time
- **UI scale**: All text/buttons sized for 1080p vertical (1080×1920). Use `text-2xl`+ for headings, large item cards with prominent images
- **No table assignment** — orders tagged as `serviceMode: "kiosk"` with a collection number

**New file**: `src/state/kiosk-store.ts`
- Track daily collection counter, reset logic
- Active kiosk cart state

**Sub-components** (in `src/components/kiosk/`):
- `KioskWelcome.tsx` — Splash with logo + "Start Order" button + language toggle
- `KioskMenu.tsx` — Category sidebar (vertical) + item grid, reuses menu data
- `KioskItemDetail.tsx` — Full-screen item view with modifier/combo selection
- `KioskCart.tsx` — Slide-out cart panel with quantity controls
- `KioskPayment.tsx` — Card/QR payment simulation
- `KioskComplete.tsx` — Collection number display with "Done / New Order" button

---

## 2. QR Table Ordering (`/qr`)

**New file**: `src/pages/QROrdering.tsx`

- **Entry**: URL includes table param (e.g. `/qr?table=T5`). If no table param, show table number input
- **Flow**: Table confirmation → Optional member login/register → Browse menu → Cart + review → Pay now OR "Pay Later at Counter" (based on merchant config)
- **Mobile-optimized**: Reuses similar menu browsing patterns as MobileMenuScreen but standalone (no staff POS chrome)
- **Order submission**: Creates order in the system tied to the table, visible in Tablet POS and KDS

**Sub-components** (in `src/components/qr/`):
- `QRTableSelect.tsx` — Confirm/enter table number
- `QRMemberAuth.tsx` — Login (phone/email OTP) or register (phone OTP → email → nickname) or "Continue as Guest"
- `QRMenuBrowser.tsx` — Category tabs + item grid + item detail with modifiers
- `QRCart.tsx` — Review order with totals
- `QRPayment.tsx` — Pay now (card/QR) or "Pay at Counter" button
- `QRComplete.tsx` — Order confirmed screen with order number

---

## 3. Member Registration via QR (OTP Auth)

**New file**: `src/components/qr/QRMemberAuth.tsx`

- **Register flow**: Enter phone → receive OTP (simulated) → verify → enter email → email OTP → verify → set nickname → account created in customer-store
- **Login flow**: Enter phone → OTP → verify → load existing profile
- **Guest mode**: Skip auth, no points earned
- **Points integration**: When authenticated member places order, auto-call `addPoints()` from customer-store (1 point per $1 spent)

**Update**: `src/state/customer-store.ts`
- Add `findByPhone(phone: string)` lookup
- Add `registerCustomer(phone, email, nickname)` helper

---

## 4. Admin Settings — QR Payment Config

**Update**: `src/pages/admin/AdminSettings.tsx`

Add a new "Ordering Channels" settings card with toggleable options:
- **QR Ordering**: Enable/Disable
- **QR Payment Mode**: "Pay First" / "Pay Later" / "Customer Choice" (radio)
- **Kiosk Mode**: Enable/Disable
- **Kiosk Payment Methods**: Checkboxes for Card / QR

**New file**: `src/state/settings-store.ts`
- Store merchant config: `qrEnabled`, `qrPaymentMode` ("pre-pay" | "post-pay" | "choice"), `kioskEnabled`, `kioskPaymentMethods`
- Used by QR and Kiosk pages to determine flow behavior

---

## 5. ServiceMode & Data Updates

**Update**: `src/data/mock-data.ts`
- Add `"kiosk"` and `"qr"` to `ServiceMode` type

**Update**: `src/hooks/useLanguage.tsx`
- Add i18n entries for kiosk and QR ordering screens (EN + ZH)

---

## 6. Routing & Navigation

**Update**: `src/App.tsx`
- Add `/kiosk` → `KioskOrdering`
- Add `/qr` → `QROrdering`

**Update**: `src/pages/Index.tsx`
- Add Kiosk and QR cards to the surface selector (5 options: Tablet, Mobile, Kiosk, QR, Admin)

---

## Files Summary

**New (~12 files)**:
- `src/pages/KioskOrdering.tsx`
- `src/pages/QROrdering.tsx`
- `src/state/kiosk-store.ts`
- `src/state/settings-store.ts`
- `src/components/kiosk/KioskWelcome.tsx`
- `src/components/kiosk/KioskMenu.tsx`
- `src/components/kiosk/KioskItemDetail.tsx`
- `src/components/kiosk/KioskCart.tsx`
- `src/components/kiosk/KioskPayment.tsx`
- `src/components/kiosk/KioskComplete.tsx`
- `src/components/qr/QRMemberAuth.tsx`
- `src/components/qr/QRMenuBrowser.tsx`

**Modified (~6 files)**:
- `src/App.tsx` — routes
- `src/pages/Index.tsx` — surface cards
- `src/data/mock-data.ts` — ServiceMode type
- `src/state/customer-store.ts` — findByPhone, registerCustomer
- `src/pages/admin/AdminSettings.tsx` — ordering channel config
- `src/hooks/useLanguage.tsx` — i18n strings

