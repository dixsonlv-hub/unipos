

# Login Simplification + Design Overhaul

## Two Changes

### 1. Single Login Gate (not per-module)

**Problem**: Currently every protected route (`/tablet`, `/mobile`, `/kds`, `/admin/*`) is individually wrapped with `<AuthGuard>`. User has to re-authenticate conceptually for each module.

**Fix**: Wrap ALL routes (except `/login`, `/qr`, `/kiosk`, `/queue`) with a single top-level `<AuthGuard>`. The homepage (`/`) itself becomes protected — once logged in, user can navigate freely to any module without re-checking.

**File**: `src/App.tsx`
- Move `<AuthGuard>` to wrap a parent layout route containing `/`, `/tablet`, `/mobile`, `/kds`, and `/admin/*`
- Keep `/login`, `/qr`, `/kiosk`, `/queue` as public routes

### 2. Login Page — Match Uploaded HTML Exactly

The uploaded HTML has a very different design from the current login page. Key differences:

| Current | HTML Reference |
|---------|---------------|
| Dark frosted glass card | **White card** (`rgba(255,255,255,0.92)`) with `backdrop-filter:blur(18px)` |
| Simple gradient bg | Deep blue gradient with `::before`/`::after` pseudo layers |
| 3 blobs, simple animation | **5 blobs** with CSS custom properties (`--blob-color`, `--blob-blur`, `--blob-opacity`) |
| Basic circle particles | **Perlin noise flow-field particles** (thousands of grid-aligned square particles with flow animation + "fierce" burst on submit) |
| No focus glow | **Rotating conic-gradient glow ring** around focused inputs (3-layer effect) |
| "Merchant Portal" title above card | **"UniwebPay OS"** as main name, "Merchant Portal" as subtitle tag, both above card |
| Form inside dark card | **Playfair Display serif** "Welcome back" title, light input fields with `#f9f8f7` bg |
| Purple gradient button | **Solid brand blue** (`#1e3a8a`) button with `→` arrow |
| MAS text below form inside card | Footer **inside card** with copyright + MAS license, plus **below card** "All connections are encrypted" text |

**File**: `src/pages/Login.tsx` — full rewrite to match HTML:
- Rebuild background: gradient + pseudo-layer overlays + grain texture (inline SVG data URI)
- 5 blobs with CSS custom properties matching exact colors/sizes/animations from HTML
- Port the full Perlin noise particle system (buildNoise → flowAngle → drawParticles with idle/fierce modes)
- Port the `LoginFocusGlow` class (conic-gradient rotating ring on input focus)
- White card with Playfair Display "Welcome back" title
- Light-colored form inputs (`#f9f8f7` bg, `#e8e6e1` border)
- Solid blue submit button with "Sign In →" text, fierce particle burst on submit
- "UniwebPay OS" as main name, "Merchant Portal" as tag line
- Login transition animation (card scales down, particles burst outward before redirect)

**File**: `src/index.css` — replace current login CSS block (lines 231-304) with full CSS from HTML reference:
- `@property --login-glow-angle` for glow rotation
- `.login-focus-glow` layers and blur rings
- `.login-card` white background style
- `.form-input` light field styling
- Blob keyframes (loginBlobA through loginBlobE)
- Login page entering transition states
- Import Playfair Display font

**Files changed**: `src/App.tsx`, `src/pages/Login.tsx`, `src/index.css`

