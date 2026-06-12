# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Unit2 Revision
**Generated:** 2026-06-07 22:38:10
**Category:** Pet Tech App

---

## Global Rules

### Color Palette

| Role | Hex | CSS Variable |
|------|-----|--------------|
| Primary | `#4338CA` | `--accent` |
| Primary (text on light) | `#3730A3` | `--accent2` |
| On Primary | `#FFFFFF` | — |
| Secondary / Reward | `#A8326E` | `--pink` / `--reward` |
| Secondary (text on light) | `#93265D` | `--reward-text` |
| Background | `#F7F6F3` | `--bg` |
| Surface/Card | `#FFFFFF` | `--bg2` |
| Foreground | `#1C1B19` | `--text` |
| Muted Foreground | `#6E6A61` | `--text2` |
| Muted | `#EFEDE7` | `--bg3` |
| Border | `#E5E2DA` | `--border` |
| Success | `#0E9F6E` | `--green` |
| Destructive | `#C81E1E` | `--red` |
| Status — RAG amber | `#D97706` | `--amber` |

**Color Notes:** Refined editorial — warm paper `#F7F6F3` base, ink text `#1C1B19`, ONE deep-indigo accent `#4338CA` with rose `#A8326E` as restrained secondary. Saturation is rationed: accents appear on CTAs, links, focus rings and small chips only. Status colours (green/amber/red) are reserved for RAG state, never decoration.

### Shape & Depth Tokens

| Token | Value | CSS Variable |
|-------|-------|--------------|
| Radius — outer/hero | `24px` | `--radius-lg` |
| Radius — card | `16px` | `--radius` |
| Radius — button | `10px` | `--radius-sm` |
| Border width | `1px` (hairline) | `--clay-border` |
| Shadow — card | `0 1px 2px rgba(28,27,25,0.05), 0 8px 24px rgba(28,27,25,0.06)` | `--shadow` |
| Shadow — small | `0 1px 2px rgba(28,27,25,0.05), 0 2px 8px rgba(28,27,25,0.05)` | `--shadow-sm` |
| Press feedback | `scale(0.98)`, 150ms ease-out | `--press` |

> ⚠️ **Anti-patterns (reviewed):** (1) No light text on saturated/pastel fills — illegible. Body text stays `#332F3A` on white cards. (2) No muddy/stacked dark shadows — use exactly ONE soft outer + ONE inner highlight, low opacity, no hard edges.

### Typography

- **Heading Font:** Fraunces (serif display, weight 600, letter-spacing −0.01em)
- **Body Font:** Inter
- **Mood:** sophisticated, calm, editorial, precise, premium
- **Accent device:** italic serif in the accent colour for emphasised words in headlines

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700;800&display=swap');
```

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #0369A1;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #0F172A;
  border: 2px solid #0F172A;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #F8FAFC;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #0F172A;
  outline: none;
  box-shadow: 0 0 0 3px #0F172A20;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Refined Editorial

**Keywords:** Warm paper, ink text, hairline borders (1px), layered soft shadows, serif display headings, single restrained accent, generous whitespace

**Best For:** Premium learning tools, content-dense apps, long study sessions (low visual fatigue)

**Key Effects:** Quiet depth (two-layer drop shadows, no insets), subtle hover lifts (−2px), gentle press (scale 0.98), blurred sticky nav

### Page Pattern

**Pattern Name:** App Store Style Landing

- **Conversion Strategy:** Show real screenshots. Include ratings (4.5+ stars). QR code for mobile. Platform-specific CTAs.
- **CTA Placement:** Download buttons prominent (App Store + Play Store) throughout
- **Section Order:** 1. Hero with device mockup, 2. Screenshots carousel, 3. Features with icons, 4. Reviews/ratings, 5. Download CTAs

---

## Anti-Patterns (Do NOT Use)

- ❌ Generic design
- ❌ No personality

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
