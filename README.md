# Quanto — Finanzas familiares

A bilingual (ES/EN) household finance dashboard: income, expenses, assets,
liabilities, a Necesidad/Gusto/Ahorro tagging system, budget recommendations
(50/30/20 + emergency fund), a USD/Bs dual-currency mode for Venezuela, light
and dark themes, and emoji profile avatars.

Built with React + Vite + Tailwind + Recharts + lucide-react.

## Run it locally

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

The static site is output to `dist/`.

## Deploying

This is a static site — no server required. Any of these work well:

- **Vercel / Netlify**: connect the GitHub repo, build command `npm run build`,
  output directory `dist`. Done.
- **GitHub Pages**: run `npm run build`, then publish the contents of `dist/`
  to a `gh-pages` branch (e.g. with the `gh-pages` npm package), or use a
  GitHub Actions workflow that builds and deploys `dist/`.

## ⚠️ Two things to know before you rely on this as-is

This started as a prototype, so two pieces were simplified on purpose. Both
are easy to upgrade later, but you should know about them going in:

### 1. "Sign in with Google, invite-only" → an invite-code gate instead

Real Google Sign-In needs a backend (a server that verifies Google's tokens)
and a registered OAuth client — it can't be done in a static, backend-less
site. Instead, the app uses a simple invite-code + profile picker: whoever
knows the code can create a profile and get in. That's enough to keep the
app private between you and your partner.

If you want real Google Sign-In later, look at
[Google Identity Services](https://developers.google.com/identity/gsi/web)
for the client-side piece, plus a small backend (even a single serverless
function) to verify the token — happy to help you build that when you're
ready.

### 2. "Shared data" → your browser's local storage, not a real sync backend

Data is saved with `localStorage` (see `src/storageShim.js`), which lives
**only on the device/browser you're using**. That means:

- Everything works great for one person on one device, or for two people
  sharing the same browser/computer.
- If you and your partner each open this on your *own* phone or computer,
  you will each see your own separate local copy — not a synced, shared one.

To get real multi-device syncing between you and your partner, swap
`src/storageShim.js` for a real backend. The rest of the app doesn't need to
change — it only ever calls four methods (`get`, `set`, `delete`, `list`) on
`window.storage`. Good low-effort options:

- **Firebase (Firestore)** — free tier, realtime sync, straightforward to
  wire up to the same four methods.
- **Supabase** — same idea, Postgres-backed, also has a generous free tier.

Either one is a small, self-contained swap once you're ready — the UI,
budget logic, and everything else stays exactly the same.

## Project structure

```
├── index.html
├── src/
│   ├── main.jsx          # entry point, mounts the storage shim + App
│   ├── App.jsx           # the whole app (UI, logic, translations)
│   ├── storageShim.js    # localStorage-backed polyfill — swap for a real backend later
│   ├── index.css         # Tailwind entry
│   └── assets/
│       └── quanto.png    # your logo
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

## Customizing

- **Invite code / household name**: set on first run, from the app itself
  (no config file to edit).
- **Currency**: Settings → Household currency (defaults to `$`/USD). Turn on
  "Venezuela mode" in Settings for the USD + Bs dual view with a historical
  exchange-rate table.
- **Logo**: replace `src/assets/quanto.png` with your own file (same name),
  or update the import in `src/App.jsx` if you rename it.
- **Colors**: the `DARK` and `LIGHT` token objects near the top of
  `src/App.jsx` control the whole palette.
