# Cheers! — Prague Restaurant & Café Finder

A mobile-first PWA that gives you one tailored Prague restaurant or café recommendation based on three quick questions.

---

## Quick start (local)

No build step needed — just open `index.html` in a browser **via a local server** (required for the service worker):

```bash
# Python 3
python3 -m http.server 3000 --directory cheers

# Node (npx serve)
npx serve cheers
```

Then open `http://localhost:3000`.

---

## How to add or update places in `places.json`

Each entry in `places.json` has these fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | ✅ | Display name of the place |
| `description` | string | ✅ | 1–2 sentence description shown on the result card |
| `googleMapsUrl` | string | ✅ | Full Google Maps URL for the "Take me there" button |
| `tags` | string[] | ✅ | Free-form tags (e.g. `"cowork"`, `"brunch"`, `"terrace"`) |
| `priceRange` | string | ✅ | `"budget"` / `"mid"` / `"fancy"` |
| `mealTypes` | string[] | ✅ | Any of: `"breakfast"`, `"lunch"`, `"dinner"` |
| `laptopFriendly` | boolean | ✅ | `true` if the place works well for remote work |
| `neighbourhood` | string | ✅ | One of: `"old-town"`, `"karlin"`, `"holesovice-letna"`, `"vinohrady-zizkov"` |

**Example entry:**

```json
{
  "name": "Kavárna Jedna",
  "description": "Minimalist specialty coffee café in Vinohrady with fast wifi and communal tables.",
  "googleMapsUrl": "https://www.google.com/maps/search/?api=1&query=Kavarna+Jedna+Prague",
  "tags": ["coffee", "cowork", "wifi", "specialty"],
  "priceRange": "mid",
  "mealTypes": ["breakfast", "lunch"],
  "laptopFriendly": true,
  "neighbourhood": "vinohrady-zizkov"
}
```

**To add a place:** copy any existing entry in `places.json`, paste it inside the `"places"` array, and fill in the fields. Make sure commas between entries are correct (valid JSON).

**To remove a place:** delete the entire `{...}` block for that place (and the trailing comma of the entry before it, if any).

---

## How to refresh data from the Google Maps custom map

The source map is: **https://maps.app.goo.gl/A6U1fUAVHt3YEKeP9**

### Step 1 — Get the Map ID

1. Open the map link above in a browser.
2. Look at the URL bar — it will redirect to something like:
   `https://www.google.com/maps/d/viewer?mid=XXXXXXXXXXXXXXXXXX`
3. Copy the value after `mid=`. That is your **Map ID**.

### Step 2 — Download the KML export

Replace `YOUR_MAP_ID` in the URL below and open it in your browser:

```
https://www.google.com/maps/d/kml?mid=YOUR_MAP_ID&forcekml=1
```

This downloads a `.kml` file.

### Step 3 — Parse the KML

KML is XML. Each place appears as a `<Placemark>` tag:

```xml
<Placemark>
  <name>Café Name</name>
  <description>Some description text</description>
  <Point>
    <coordinates>14.4378,50.0755,0</coordinates>
  </Point>
</Placemark>
```

You can parse it manually, or run this quick Node.js snippet:

```js
// parse-kml.js — run with: node parse-kml.js exported.kml
const fs = require('fs');
const xml = fs.readFileSync(process.argv[2], 'utf8');
const names = [...xml.matchAll(/<name><!\[CDATA\[(.*?)\]\]><\/name>/g)].map(m => m[1]);
const descs = [...xml.matchAll(/<description><!\[CDATA\[(.*?)\]\]><\/description>/g)].map(m => m[1]);
names.forEach((name, i) => console.log(`${name}: ${descs[i] || ''}`));
```

### Step 4 — Update `places.json`

Fill in the fields for each place based on what you extracted from the KML. Pay special attention to:
- `laptopFriendly`: set to `true` if the KML description mentions "cowork" or similar
- `priceRange`: use context clues or your own knowledge
- `neighbourhood`: based on the coordinates or known Prague neighbourhoods

---

## Deploy to Vercel

1. Push this repo to GitHub (the `/cheers` folder should be the project root, or set the root directory in Vercel settings).
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo.
3. Set the **Root Directory** to `cheers` (if the repo contains other files outside).
4. Leave Framework Preset as **Other** — no build step needed.
5. Click **Deploy**. Done.

Vercel will serve `index.html` at the root URL. The PWA manifest and service worker will be picked up automatically.

### Deploy to GitHub Pages

1. Go to your repo → **Settings** → **Pages**.
2. Set Source to **Deploy from a branch**, branch `main`, folder `/cheers`.
3. Click **Save**. The app will be live at `https://yourusername.github.io/yourrepo/cheers/`.

> **Note:** If deploying to GitHub Pages in a subfolder, update `"start_url"` in `manifest.json` to match the path (e.g. `"/yourrepo/cheers/"`).

---

## PWA icons

Place two icon files in `cheers/icons/`:
- `icon-192.png` — 192×192 px
- `icon-512.png` — 512×512 px

You can generate them from any square image at [maskable.app](https://maskable.app) or [pwa-image-generator.falseidolfactory.com](https://pwa-image-generator.falseidolfactory.com).

---

## File structure

```
cheers/
  index.html      ← app shell & screens
  styles.css      ← all styles (mobile-first)
  app.js          ← quiz logic, matching, rendering
  places.json     ← data file (edit this to add/update places)
  manifest.json   ← PWA manifest
  sw.js           ← service worker (offline support)
  icons/
    icon-192.png  ← PWA icon (add manually)
    icon-512.png  ← PWA icon (add manually)
  README.md
```
