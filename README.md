# Bush Food — museum plant hunt

A **mobile-first React** experience for a museum-style “foraging” visit: visitors learn about **Victorian edible native plants**, open **found** sheets from the home grid, and use the **camera** in the browser (marker recognition is not wired yet). The UI is framed in a phone shell for demos; the layout targets small viewports and touch.

This project is meant to ship as a **Progressive Web App (PWA)**, not as a native app in the App Store or Google Play. For a single-visit museum flow, that is a good fit:

- **No install gate** — People open a URL or scan a **QR code** at the entrance; nothing to download from a store.
- **No accounts** — Everything can stay in the **browser session** (simple, privacy-friendly, low friction).
- **Camera in the web** — `getUserMedia` works on modern **iOS and Android** browsers for scanning markers or previews.
- **Same codebase everywhere** — One deployable site avoids store review, versioning split, and “which app?” confusion at the door.

A native app would add cost and barriers (accounts, installs, updates) without much upside for a short, on-site experience.

**Stack:** React 18, TypeScript, Vite 6, Tailwind CSS v4 (`@tailwindcss/vite`).

---

## Run locally

From the project root:

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Edit files under `src/` and the page hot-reloads.

Other scripts:

| Command | Purpose |
|--------|---------|
| `npm run build` | Production bundle → **`dist/`** at the repo root (not inside `src/`) |
| `npm run typecheck` | `tsc --noEmit` |

---

## Design tokens (for designers)

Almost all colour, type, spacing, motion, and radii flow from **`src/index.css`** via Tailwind v4’s `@theme` block. Tokens use a **`hunt-*`** prefix (for example `--color-hunt-bg`, `--spacing-hunt-gap`). Utilities follow the same names (`bg-hunt-bg`, `text-hunt-text-heading`, `p-hunt-screen`, and so on).

Change a value in `@theme`, save, and every component that uses the matching utility updates together—no per-component CSS files.

---

## Project structure

Vite’s **`root`** is **`src/`**; the HTML entry is **`src/index.html`**.

```
src/
├── index.html              # Document shell, fonts, #root
├── index.tsx               # React entry — mounts <App />
├── index.css               # Tailwind import + @theme tokens
├── App.tsx                 # Device chrome + <MuseumFlow />
├── components/
│   ├── device/
│   │   └── IPhone14Frame.tsx   # Optional presentation frame
│   └── museum/
│       ├── MuseumFlow.tsx      # Welcome ↔ home orchestration
│       ├── MuseumShell.tsx     # Outer chrome / context copy
│       ├── WelcomeScreen.tsx   # Bush Food intro + name + start
│       ├── HomeScreen.tsx      # Plant grid, scan UI, camera overlay
│       ├── PlantFoundSheet.tsx # Bottom sheet + plant detail
│       └── HuntPrimaryButton.tsx
├── tokens/
│   ├── museum.ts             # Motion / shared constants
│   ├── huntPlantTiles.ts     # Grid plants (ids, labels, art)
│   ├── huntPlantFoundMedia.ts # Photos + stickers per plant
│   └── foundPlantCopy.tsx    # Long-form copy in the found sheet
└── assets/native-plants/   # SVGs, found photos, sticker art
```

---

## For developers

| Topic | Where |
|-------|--------|
| Screen flow | `MuseumFlow.tsx` — welcome phase, then home with `foragerName` |
| Plant list & assets | `tokens/huntPlantTiles.ts`, `tokens/huntPlantFoundMedia.ts` |
| Found-sheet content | `tokens/foundPlantCopy.tsx` |
| Build config | `vite.config.js` — `root: 'src'`, `build.outDir: '../dist'` |

`dist/` is listed in **`.gitignore`**; do not commit build output.

---

## Progressive web app

**Today:** the app is a Vite SPA you can host on any static origin. There is **no** `manifest.webmanifest` or service worker yet—add a **Web App Manifest** (name, icons, `display`, theme colour) and optionally a **service worker** (for example via `vite-plugin-pwa`) when you want “Add to Home Screen”, splash behaviour, or offline shell caching.

**Collected plants:** progress (for example stickers after closing a found sheet) is held in **React state only**—there is no `localStorage` or `sessionStorage` yet. A full page reload clears it. That matches a strict “only for this tab session” model. If you want stickers to survive accidental refresh or the same phone coming back later the same day, **`localStorage`** (or `sessionStorage` for tab-scoped persistence) is a small follow-up.

**Not in scope:** App Store / Play Store distribution; this product narrative assumes URL + QR + PWA, not store listings.
