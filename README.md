# Receipt Room

Receipt Room is a frontend-only data story for the “Your Life, In Receipts” hackathon challenge. It turns the supplied transaction, Spotify, and household CSV exports into a searchable archive with connected insights and narrative chapters.

## Run locally

This is a static frontend. The command below is only a local static file server for development, so the browser can fetch the CSV assets; it is not an application backend.

```powershell
python -m http.server 4173
```

Open `http://localhost:4173/` in a browser.

The repository also includes a GitHub Pages workflow. After the first successful workflow run, the static site is available at `https://melvinth14.github.io/-Your-Life-In-Receipts-/`.

## Experience

- Search across merchants, songs, places, and categories.
- Filter between all receipts, music, money, and places.
- Sort the archive newest-first or oldest-first.
- Select a receipt to reveal a connected story thread.
- Use “Show me a pattern” to surface after-hours behavior.
- Explore generated chapters built from recurring categories, locations, and time of day.

The app has no backend and performs CSV parsing and insight generation in the browser.