# Quick Replies

A personal quick-reply manager for CRM work. Premium dark Mac desktop web app — no backend, no login, everything stored locally.

## Launch

**Option A — Python (recommended, works everywhere):**
```bash
cd ~/Desktop/QuickRepliesApp
python3 -m http.server 8080
```
Then open: http://localhost:8080

**Option B — Node.js:**
```bash
cd ~/Desktop/QuickRepliesApp
npx serve .
```

**Option C — Open directly (limited clipboard):**
Double-click `index.html` — everything works except clipboard copy may be blocked by the browser on `file://`. Use Option A to avoid this.

## Files

| File | Purpose |
|---|---|
| `index.html` | App structure |
| `styles.css` | All visual design (dark theme, glassmorphism) |
| `app.js` | All logic — state, rendering, localStorage |

## Data

All data is saved automatically in `localStorage` under the key `quickReplies_v1`. To reset the app to demo data, open DevTools → Application → Local Storage → delete the key and refresh.
