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
| Primary | `#7C3AED` | `--accent` |
| Primary (text on light) | `#6D28D9` | `--accent2` |
| On Primary | `#FFFFFF` | — |
| Secondary / Reward | `#DB2777` | `--pink` / `--reward` |
| Secondary (text on light) | `#BE185D` | `--reward-text` |
| Accent/CTA gradient | `#8B5CF6 → #7C3AED` | `--accent-grad` |
| Background | `#F4F1FA` | `--bg` |
| Surface/Card | `#FFFFFF` | `--bg2` |
| Foreground | `#312A3D` | `--text` |
| Muted Foreground | `#635C72` | `--text2` |
| Muted | `#ECE7F6` | `--bg3` |
| Border | `#DDD3F0` | `--border` |
| Success | `#10B981` | `--green` |
| Destructive | `#DC2626` | `--red` |
| Status — RAG amber | `#F59E0B` | `--amber` |

**Color Notes:** Vibrant EdTech — violet `#7C3AED` primary + pink `#DB2777` reward/secondary, on a soft lavender-white `#F4F1FA` base (never pure white). Dark near-black text `#312A3D` on white cards keeps body contrast ≥ 4.5:1. Saturated colours are for accents, CTAs, borders and icons only — never as a text background. Amber `#F59E0B` is reserved for RAG status ("Getting there"), not branding.

### Claymorphism Effect Tokens

| Token | Value | CSS Variable |
|-------|-------|--------------|
| Radius — outer/hero | `40px` | `--radius-lg` |
| Radius — card | `32px` | `--radius` |
| Radius — button | `18px` | `--radius-sm` |
| Border width | `3px` | `--clay-border` |
| Shadow — card (outer drop + inner highlight) | `inset -4px -4px 8px rgba(255,255,255,0.6), 4px 4px 12px rgba(0,0,0,0.08)` | `--shadow` |
| Shadow — small | `inset -2px -2px 5px rgba(255,255,255,0.55), 2px 3px 8px rgba(0,0,0,0.06)` | `--shadow-sm` |
| Press feedback | `scale(0.96)`, 150ms ease-out | `--press` |

> ⚠️ **Anti-patterns (reviewed):** (1) No light text on saturated/pastel fills — illegible. Body text stays `#332F3A` on white cards. (2) No muddy/stacked dark shadows — use exactly ONE soft outer + ONE inner highlight, low opacity, no hard edges.

### Typography

- **Heading Font:** Fredoka
- **Body Font:** Nunito
- **Mood:** playful, friendly, fun, creative, warm, approachable
- **Google Fonts:** [Fredoka + Nunito](https://fonts.google.com/share?selection.family=Fredoka:wght@400;500;600;700|Nunito:wght@300;400;500;600;700)

**CSS Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:wght@300;400;500;600;700&display=swap');
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

**Style:** Claymorphism

**Keywords:** Soft 3D, chunky, playful, toy-like, bubbly, thick borders (3-4px), double shadows, rounded (16-24px)

**Best For:** Educational apps, children's apps, SaaS platforms, creative tools, fun-focused, onboarding, casual games

**Key Effects:** Inner+outer shadows (subtle, no hard lines), soft press (200ms ease-out), fluffy elements, smooth transitions

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
