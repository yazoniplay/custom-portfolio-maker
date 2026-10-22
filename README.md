# FolioForge — Developer Portfolio Generator

A client-side portfolio builder made with plain HTML, CSS and JavaScript. No framework, build step, account, or backend is required.

## Features
- Live preview while editing personal details
- Add/remove skills and project cards
- Responsive dark editor and generated portfolio
- Download a standalone HTML portfolio or copy its source
- HTML escaping and URL protocol validation for user-provided content
- Works on GitHub Pages

## Run locally
Open `index.html` in a modern browser. No installation is needed.

## Publish the builder on GitHub Pages
1. Push these files to the repository's `main` branch.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
4. Wait for GitHub Pages to publish the site.

## Publish a generated portfolio
1. Click **Download HTML** in the builder.
2. Rename the downloaded file to `index.html`.
3. Create a separate GitHub repository for the portfolio and upload that file to the root.
4. Enable GitHub Pages for that repository using the steps above.

The exported portfolio embeds its CSS and has no runtime dependency on this builder. Google Fonts are optional external font imports; system fallbacks are included. A profile photo URL, if provided, must be publicly accessible.

## Files
- `index.html` — editor layout
- `styles.css` — editor styling and responsive layout
- `script.js` — form logic, live rendering, and export
