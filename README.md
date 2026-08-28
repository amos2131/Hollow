# Hollow Habits

A premium, mobile-first habit tracker built with React, Recharts, and Framer Motion.

## Run locally
```bash
npm install
npm run dev
```
Open the URL it prints (usually http://localhost:5173).

## Build for production
```bash
npm run build
npm run preview
```

## Deploy
Push this folder to a GitHub repo, then:
- **Vercel**: import the repo at vercel.com/new — it auto-detects Vite, no config needed.
- **Netlify**: import the repo, set build command `npm run build` and publish directory `dist`.

## Notes
- All data lives in React state for the current browser session only (no backend).
  Use the in-app Backup (JSON) feature under Settings to save/restore your data between sessions.
- Notification toggles are saved but do not send real push notifications — that requires a backend.
