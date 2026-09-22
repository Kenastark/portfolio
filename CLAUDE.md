# Portfolio site: notes for Claude Code

Static personal site for Ikenna Udeani. Plain HTML, CSS and JavaScript in `site/`. No framework, no build step, no npm dependencies. Netlify publishes the `site/` folder (see `netlify.toml`). Live URL: https://ikennaudeani.netlify.app (update this line if the name changes).

## Deploy rules (credits matter)

- Netlify free plan: 300 credits a month. Every production deploy (anything that lands on `main`) costs 15 credits. Deploy Previews on pull requests cost nothing.
- Never commit or push directly to `main`. Create a branch, commit there, push it, and open a pull request with `gh pr create --fill`. Netlify comments a free preview link on the PR.
- Merge to `main` only when Ikenna says so. Batch related changes into one PR so one merge covers them.

## Files

- `site/index.html`: all page content. Placeholders are marked `EDIT:`.
- `site/assets/site.css`: design tokens and all styles.
- `site/assets/site.js`: hero simulation, command menu (Cmd/Ctrl+K), Provenance chart, thesis graph, git-log graph, theme toggle, waitlist form.
- `site/assets/theme.js`: applies the saved theme before first paint.
- `site/assets/fonts/`: self-hosted Archivo, Newsreader, IBM Plex Mono (OFL).
- `site/_headers`: security headers and a strict Content-Security-Policy.
- `site/404.html`, `og.png`, `favicon.svg`, `robots.txt`, `sitemap.xml`.

## Design system (do not drift)

- Colour tokens live in `site.css`. The light theme is on bare `:root`; the dark theme is repeated in `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` and in `:root[data-theme="dark"]`. Change a colour in all three places.
- Cobalt `--accent` is the only interactive colour. Green (`--ok`) means verified and orange (`--bad`) means anomaly. They are state, never decoration.
- Type: Archivo for display (`font-stretch` 110% to 125%), Newsreader for prose, IBM Plex Mono for labels, data and provenance tags. Do not add Google Fonts or any other external resource: the CSP only allows files from the site itself. If something external is truly needed, update `_headers` in the same PR.
- No inline `<script>` blocks (CSP `script-src 'self'`). Put JavaScript in `site.js`.
- Respect `prefers-reduced-motion` for any new animation.

## Content rules

- No em dashes anywhere. Use commas, colons, full stops, or "→" for date ranges.
- Every figure on the page carries its source. Do not add a number without a provenance tag or a clear source, and add it to the sources table in `README.md`.
- Illustrative visuals (Provenance chart, U.S. risk graph, ledger rows) must stay labelled as illustrative.
- Keep the phone number off the public site.
- If the domain changes, update it in the `<head>` of `index.html`, `sitemap.xml`, `robots.txt` and the line at the top of this file.

## Before opening a PR

1. `cd site && python3 -m http.server 8000`, then check desktop and a 390px-wide mobile view, in light and dark.
2. `grep -rn "$(printf '\xe2\x80\x94')" site` (searches for em dashes) must return nothing.
3. No console errors. The 404 for `cv/Ikenna_Udeani_CV.pdf` is expected until that file exists.
