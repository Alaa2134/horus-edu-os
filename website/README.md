# Horus Edu OS — Official Website

The branding/marketing website for **Horus Edu OS**, the educational Linux OS for Horus University students.

## Preview

Open `index.html` directly in any browser — no build step required.

```
double-click index.html
```

## Local Dev Server

```bash
cd horus-edu-website
npx serve . -l 3000
# Open http://localhost:3000
```

## Deploy

### Netlify (Recommended — Free)
1. Go to [netlify.com](https://netlify.com) → New site from Git
2. Or drag & drop this folder onto the Netlify dashboard
3. Or via CLI:
   ```bash
   npx netlify deploy --dir=. --prod
   ```

### Vercel
```bash
npx vercel --prod
```

### GitHub Pages
1. Push this folder to a GitHub repo
2. Settings → Pages → Deploy from branch → `main` / `/ (root)`
3. Your site: `https://yourusername.github.io/horus-edu-website`

### Shared Hosting (Apache/Nginx)
Upload all files to the `public_html` or `www` directory via FTP/cPanel.

---

## File Structure

```
horus-edu-website/
├── index.html          ← Main page (all sections)
├── styles/
│   └── main.css        ← All styles (dark theme, RTL, responsive)
├── scripts/
│   └── main.js         ← Particle canvas, language toggle, animations
├── assets/             ← Add images/screenshots here
├── netlify.toml        ← Netlify config
├── vercel.json         ← Vercel config
├── _headers            ← Static hosting headers
└── package.json        ← npm scripts
```

## Features

- **Bilingual** — Arabic (RTL) ⟷ English toggle
- **Particle canvas** — Animated network background in hero
- **Glassmorphism** — Dark theme with blur effects
- **Fully responsive** — Mobile, tablet, desktop
- **No build step** — Pure HTML/CSS/JS, deploy anywhere
- **SEO ready** — Meta tags, OG tags, semantic HTML
- **Security headers** — CSP, X-Frame-Options, etc.
- **Scroll animations** — IntersectionObserver reveal
- **AI Chat Demo** — Live typing animation in AI section

## Brand Colors

| Token | Hex | Use |
|-------|-----|-----|
| Primary | `#6366f1` | Main accent (indigo) |
| Gold | `#c9a227` | Horus brand accent |
| Emerald | `#10b981` | Success / online |
| Background | `#0a0f1e` | Page background |
| Surface | `#0f172a` | Cards, panels |
