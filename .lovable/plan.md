

# Add Animated Grainy Gradient Background to Index Page

## What Changes

Replace the flat `bg-background` on the Index page with a Meta AI–style frosted silver gradient + SVG grain overlay + slow blob animation.

### 1. Create `src/components/GrainyGradientBg.tsx`

A reusable component rendering:
- **Base layer**: A full-screen `div` with multiple overlapping `radial-gradient` blobs using muted blue-grey tones (`#b0bec5`, `#90a4ae`, `#cfd8dc`, `#78909c`), positioned at corners/center. Animated via a CSS class that shifts `background-position` over a 25s infinite alternate cycle.
- **Grain layer**: An `::after` pseudo-element (via Tailwind's `after:` utilities or inline style) applying an inline SVG filter (`feTurbulence` fractalNoise, baseFrequency ~0.65, numOctaves 3) with `opacity: 0.4` and `mix-blend-mode: overlay`.

### 2. Add keyframes to `src/index.css`

```css
@keyframes blob-drift {
  0%   { background-position: 0% 0%, 100% 100%, 50% 50%, 80% 20%; }
  100% { background-position: 100% 100%, 0% 0%, 20% 80%, 50% 60%; }
}
```

### 3. Update `src/pages/Index.tsx`

- Wrap content in `<GrainyGradientBg>` (or replace the outer div's `bg-background` with the new component as the background layer).
- Cards get `backdrop-blur-sm bg-white/70 dark:bg-white/10` for a frosted glass look on top of the gradient.

### Files
- **New**: `src/components/GrainyGradientBg.tsx`
- **Edit**: `src/index.css` (add keyframes)
- **Edit**: `src/pages/Index.tsx` (use new background, update card classes)

