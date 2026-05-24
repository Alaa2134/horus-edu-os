# HORUS OS — Design System

A premium, futuristic, Egyptian-inspired identity. Disciplined, not decorative.
Dark surfaces, gold light, geometric precision, glass depth.

---

## 1. Brand essence

- **Personality:** intelligent, calm, premium, ancient-meets-future.
- **Metaphor:** the Eye of Horus = perception + protection + intelligence.
- **Voice:** confident and clear; bilingual (EN/AR); never childish, never hypey.

## 2. Logo usage

- **Primary mark:** Eye of Horus in gold on deep navy/black.
- **Lockup:** mark + `HORUS` wordmark (Cinzel, wide letter-spacing).
- **Clear space:** keep ≥ the eye's height clear on all sides.
- **Minimum size:** 24 px (icon), 96 px (lockup with wordmark).
- **Don't:** recolour outside palette, add drop shadows beyond the defined glow,
  stretch, rotate, or place on busy photos without a scrim.
- Source: `branding/logo/horus-logo.svg`.

## 3. Eye of Horus symbol style

- **Line-art**, stroke-based, rounded caps/joins — not a filled glyph.
- Single continuous gold gradient (`#ffe9b8 → #f3d28a → #d8a94e`).
- Subtle outer glow only (`drop-shadow(0 0 18px rgba(201,162,39,.5))`).
- Used as: app logos (line variant), favicon, boot/login mark, watermark.

## 4. Color palette

| Token | Hex | Use |
|---|---|---|
| Horus Gold | `#c9a227` | primary brand, CTAs, selection, logo |
| Gold Light | `#f5d060` | highlights, hover, gradient top |
| Gold Dark | `#a07820` | gradient base, pressed |
| Deep Navy | `#070b1c` | sky/hero backgrounds |
| Background | `#0a0a0f` | app/page background |
| Surface | `#12121a` | cards, panels |
| Surface 2 | `#1a1a27` | elevated, hover |
| Electric Blue | `#1a73e8` | secondary, links |
| Cyber Cyan | `#00d4ff` | accents, data viz, glows |
| Sand | `#d8c8a0` | warm neutral text/detail |
| Text | `#e8e8f0` | primary text |
| Muted | `#aaaacc` | secondary text |
| Success | `#00e676` · Warning `#ff9800` · Error `#f44336` |

Full tokens (rgb/hsl, gradients, effects): `branding/palette/colors.json`.

## 5. Typography

| Role | Font | Notes |
|---|---|---|
| Display / brand | **Cinzel** | logo, hero titles, section headers |
| UI / body | **Ubuntu** (fallback Inter) | all interface text |
| Mono / code | **JetBrains Mono** | terminal, code, system values |
| Arabic | **Noto Naskh Arabic** | all Arabic, RTL |

Scale: 12 / 14 / 16 / 20 / 24 / 32 / 48 / 64. Line-height 1.4–1.6 body.

## 6. Iconography

- **Style:** rounded-rect tiles, 2px line icons, gold-on-dark, subtle inner glow.
- Base icon theme: **Yaru-dark**, with HORUS app icons layered on top.
- Corner radius: 22% of tile (squircle feel). Consistent optical weight.

## 7. Glassmorphism / Liquid Glass

```css
background: rgba(18,18,26,.65);
border: 1px solid rgba(201,162,39,.22);
backdrop-filter: blur(14px);
box-shadow: 0 10px 30px rgba(0,0,0,.35);
border-radius: 18px;
```
- Use glass for cards, panels, the dock, notifications, quick settings.
- One blur level per layer; avoid stacking many translucent layers.

## 8. Desktop background

- Direction: **Giza at dusk** — deep navy sky → gold horizon, pyramid
  silhouettes, centered Eye of Horus + wordmark.
- Vector master at `branding/wallpapers/horus-pyramids.svg` (scales to 4K).
- Variants (roadmap): clean dark gradient, blueprint grid, robotics line-art.

## 9. Boot screen (Plymouth)

- Black background, centered Eye of Horus that draws/pulses, gold progress arc.
- Wordmark `HORUS OS` + slogan below. Quiet, premium, no Ubuntu branding.

## 10. Lock / login (GDM)

- Dark greeter, blurred wallpaper, gold clock + weekday, Eye-of-Horus logo.
- Single accent (gold) for the focused field and the unlock button.

## 11. App launcher (app grid)

- Full-screen blurred overlay, search at top, paged grid of squircle icons.
- Selected icon: gold ring + soft glow. Folders supported.

## 12. Dock / taskbar

- **Floating, bottom-centered**, glass, auto-width to content.
- 48px squircle icons, running = gold dot indicator, hover = lift + glow.
- Favourites: Browser, Files, Terminal, Center, Robotics, AI, Security, Editor, Settings.

## 13. Terminal theme

- Background `#0a0a0f`, text `#e8e8f0`, prompt gold `[HORUS] user@host`.
- Cursor cyan. JetBrains Mono. Welcome banner + fastfetch on first open.
- ANSI: balanced, readable; gold/cyan as the brand pair.

## 14. Settings UI

- Reuse GNOME Settings (Yaru-dark) — don't reinvent. HORUS-specific panels
  (Student/Competition Mode, toolchains) live in **Horus Center**, not Settings.

## 15. Notifications

- Glass card, top-right, gold left-accent bar, app icon, title + body.
- Severity tints: success green / warning amber / error red left-bar.
- Quiet by default; Competition Mode silences non-critical notifications.

---

### Implementation pointers
- Tokens: `branding/palette/colors.json` (incl. a `tailwindExtension`).
- Wallpaper/logo: `branding/`. GNOME defaults: `configs/gnome/00-horus-defaults`.
- Web apps share these tokens — keep gold `#c9a227` as the single brand constant.
