# HORUS OS — Generation Prompts

Reusable prompts to produce on-brand visuals and code. Keep the constants:
**dark navy/black background, Horus gold `#c9a227`, electric blue, cyan accents,
sand, white; Eye-of-Horus line-art; Cinzel display; glassmorphism; premium,
futuristic, Egyptian-inspired, not childish.**

---

## A. 10 prompts to generate improved UI images

1. **Hero desktop.** "A premium Linux desktop, dark cyber-Egyptian theme, GNOME
   Shell, floating glass dock, centered Eye-of-Horus logo, pyramids-at-dusk
   wallpaper (navy sky → gold horizon), gold accents, 4K, photorealistic UI mockup."

2. **App grid.** "Full-screen app launcher overlay, blurred dark background,
   search bar on top, grid of gold-on-dark squircle app icons (Center, Robotics,
   AI, Security, Store, Docs), selected icon with gold glow ring, glassmorphism."

3. **Horus Robotics app.** "Dark dashboard UI, glass cards, 'Connected Boards'
   showing an Arduino UNO and ESP32 with green 'detected' pills, a wiring helper
   card with pin diagram, gold headings, cyan data accents, Ubuntu font."

4. **Horus AI chat.** "Local AI assistant chat UI, dark glass panels, gold user
   bubbles, mode switcher (Student/Engineer/Debug/Demo), Arabic + English text,
   Eye-of-Horus avatar, subtle circuit motif."

5. **Boot splash.** "Plymouth boot screen, pure black, centered Eye-of-Horus
   line-art glowing gold, thin gold progress arc, 'HORUS OS' wordmark in Cinzel,
   minimal and premium."

6. **Login screen.** "GDM dark login, blurred pyramids wallpaper, large gold
   clock with weekday, Eye-of-Horus logo, single user with gold focus ring,
   cinematic, high-end."

7. **Terminal.** "Themed terminal window, near-black background, gold
   `[HORUS] user@host` prompt, cyan cursor, JetBrains Mono, fastfetch output with
   Eye-of-Horus ASCII art on the left, gold/cyan info on the right."

8. **Logo system.** "Logo sheet for 'HORUS OS': Eye-of-Horus mark in gold
   gradient on navy, horizontal lockup with Cinzel wordmark, monochrome and
   icon-only variants, clear-space guides, on dark and light backgrounds."

9. **Wallpaper variants.** "Three 4K wallpapers in one set: (a) Giza pyramids at
   dusk with Eye of Horus, (b) clean dark gold gradient with faint blueprint
   grid, (c) robotics line-art circuit + gear motif — all in HORUS palette."

10. **Landing hero.** "Website hero for an AI & Robotics Linux distro: dark
    premium layout, big headline 'Build robots and AI instantly', a floating
    laptop showing the HORUS desktop, gold CTA 'Download Alpha', Arabic toggle,
    pyramids silhouette footer."

---

## B. 10 prompts to build HORUS components in React + Tailwind

Use the tokens in `branding/palette/colors.json` (`tailwindExtension.colors.horus`).
Each prompt assumes: React + TypeScript + Tailwind, dark theme, accessible,
responsive, glassmorphism utility `bg-horus-surface/60 backdrop-blur border-horus-gold/20`.

1. "Build a `<GlassCard>` component: rounded-2xl, `bg-horus-surface/60`,
   `backdrop-blur-md`, `border border-horus-gold/20`, soft shadow; props for
   title (gold), icon, and children."

2. "Build a `<MetricGauge>` for CPU/RAM: circular progress ring (SVG), color
   shifts green→amber→red by value, gold label, animated on update; props
   `label`, `value`, `unit`."

3. "Build a `<Dock>`: floating bottom-centered glass bar, squircle icon buttons
   with hover lift + glow, running-indicator gold dot, tooltip on hover; props
   `apps: {name, icon, running}[]`."

4. "Build an `<AppGrid>` launcher: full-screen blurred overlay, search input
   that filters, paged grid of squircle app tiles with gold focus ring, ESC to
   close."

5. "Build a `<BoardCard>` for Horus Robotics: shows board name, port, protocol,
   a green 'detected' pill; skeleton state while scanning; reconnect button."

6. "Build a `<WiringHelper>`: a dropdown of components, then a two-column pin
   table (Arduino UNO / ESP32) rendered from JSON, with a gold 'tip' callout."

7. "Build a `<ChatWindow>` for Horus AI: message list with gold user bubbles and
   dark assistant bubbles, a mode pill selector, an input with send button,
   streaming-text indicator; RTL-aware for Arabic."

8. "Build a `<TerminalCard>`: monospaced, near-black, renders an array of lines
   with ANSI-like gold/cyan spans, blinking cyan cursor, copy button."

9. "Build a `<TemplateTile>` for Horus Store: thumbnail, name, tag chips
   (cyan outline), short description, gold 'Create project' button; grid layout."

10. "Build a `<Notification>` toast: glass card top-right, gold left-accent bar
    (or red/amber by severity), app icon, title, body, auto-dismiss with a
    progress underline; `useToast()` hook to trigger."
