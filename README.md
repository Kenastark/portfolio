# ikenna-portfolio

Personal site for Ikenna Udeani. Plain HTML, CSS and JavaScript: no framework, no build step, no dependencies, no cookies, no analytics.

```
portfolio/
├── netlify.toml          Netlify settings (publishes the site/ folder)
├── CLAUDE.md             working rules for Claude Code
├── README.md             this file
└── site/                 everything that gets published
    ├── index.html        the page (all content lives here)
    ├── 404.html          "not found" page
    ├── _headers          security + caching headers (Netlify and Cloudflare Pages)
    ├── favicon.svg
    ├── og.png            1200×630 preview image for LinkedIn, Slack, X, etc.
    ├── robots.txt
    ├── sitemap.xml
    ├── cv/               public CV (see below)
    └── assets/
        ├── site.css
        ├── site.js       hero simulation, command menu, charts, theme toggle
        ├── theme.js      applies a saved light/dark choice before first paint
        └── fonts/        self-hosted Archivo, Newsreader, IBM Plex Mono (OFL)
```

## Preview on your Mac

```bash
cd site
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy to Netlify (free)

**Option A: from GitHub (recommended, auto-deploys on merge).**

1. Create a new GitHub repo (e.g. `Kenastark/portfolio`) and push this whole folder.
2. In Netlify: *Add new project → Import an existing project → GitHub*, pick the repo.
3. Netlify reads `netlify.toml`, so leave the build settings as detected (publish directory `site`).
4. Rename the project: *Project overview → Customize → Manage project name*. The name becomes the URL (`name.netlify.app`).

**Option B: drag and drop (2 minutes, no auto-deploys).** Go to <https://app.netlify.com/drop>, sign in, and drag the `site` folder onto the page.

### Everyday workflow (keeps credits low)

Every merge to `main` is a production deploy (15 credits). Pull requests get a free Deploy Preview.

```bash
git switch -c edit/whatever          # new branch
# ...make changes, or ask Claude Code to...
git commit -am "Describe the change"
git push -u origin edit/whatever
gh pr create --fill                  # Netlify comments a free preview link on the PR
gh pr merge --squash --delete-branch # when happy: this one deploys to the live site
git switch main && git pull
```

`CLAUDE.md` tells Claude Code to follow this flow and never push to `main` directly.

**Turn on the waitlist form.** In Netlify, open *Forms* and click *Enable form detection*, then redeploy once. Sign-ups from the Venture section then appear under *Forms → venture-waitlist*, and you can add an email notification there. On any other host the form falls back to opening an email to you.

**Know the free-plan limits.** New Netlify accounts are on credit-based pricing: 300 credits a month, a production deploy costs 15 credits and each GB of traffic costs 20. If the credits run out, every site on the account pauses until the next month. For a portfolio this is plenty, as long as you batch edits instead of deploying ten small fixes in a row. Deploy previews are free.

### Alternative: Cloudflare Pages

Unlimited static bandwidth on the free plan, and the site runs unchanged (it reads the same `_headers` file). *Workers & Pages → Create → Pages → Connect to Git*, framework preset **None**, build command empty, output directory `site`. The only difference: Netlify Forms won't exist, so the waitlist uses its email fallback.

### Custom domain

Free options: rename the project to get a short `name.netlify.app`, or request a free `name.is-a.dev` subdomain at <https://is-a.dev> and point it at Netlify with a CNAME. A domain you buy (e.g. `.com`, `.dev`) also works on the free plan, with free HTTPS.

After deploying, replace `https://ikennaudeani.netlify.app` with your real address in:

- `site/index.html` (the `<head>`: canonical, `og:url`, `og:image`, `twitter:image`)
- `site/sitemap.xml`
- `site/robots.txt`

## Editing content

Every placeholder is marked with an `EDIT:` comment in `site/index.html`. Search for it.

| What | Where | How |
|---|---|---|
| **CV download** | `site/cv/` | The public CV is in place as `Ikenna_Udeani_CV.pdf` and opens in a new tab. To update it, replace the file and keep the same name. It must never contain a phone number. |
| **Writing** | `#writing` section | Each `<li class="post post--placeholder">` is a placeholder. Change the title, turn the `<span class="post__title">` into `<a class="post__title" href="…">`, set the venue/date, remove `post--placeholder`. |
| **Tech company** | `#venture` section | Replace the three redacted bars with the name, one-liner and launch date; add a link; update the form text. |
| **Projects** | `#work` section | Each project is one `<article class="case">`. Copy one to add another. |
| **Experience** | `#log` section | Each role is one `<li class="commit" data-lane="…">`. Lanes: `0` research, `1` health data, `2` energy. The graph redraws itself. |

### Where each number comes from

The site promises "every figure carries its source", so keep these honest when you update them.

| Figure | Source |
|---|---|
| 5+ years | Your CV (site/cv/Ikenna_Udeani_CV.pdf) and LinkedIn profile |
| 4 national programmes (TB, HIV, HPV, EID) | CHAI Nigeria, National LIMS, 2023 to 2024 |
| −90% manual reconciliation | CHAI CBHMIS anomaly-detection QA, 2025 |
| 29% flagged / 100.00% completeness / 149,683 readings / 16 stations | Provenance phase-1 audit report (`docs/phase-reports/phase-1-audit.md`), Aug 2026 |
| 117 tests, 96% coverage, 3,299 parameters | Provenance phase-1 report and HST-GAT model card |
| 23 papers, 5 themes | Thesis month-1 annotated bibliography |

The Provenance chart, the U.S. risk map and the ledger rows are labelled as illustrative on the page.

## Under the hood

- **Hero:** a canvas simulation of Provenance's wind-conditioned adjudicator. Reason codes R17 (spatially inconsistent) and R22 (plume corroborated) are the real codes from Provenance's registry. It pauses when off-screen or in a background tab.
- **Command menu:** press ⌘K / Ctrl+K or `/`.
- **Themes:** follows the system setting; the toggle remembers the visitor's choice.
- **Accessibility:** keyboard reachable throughout, visible focus rings, reduced-motion support (the simulation stops auto-playing and all animation is removed), screen-reader announcements only for spikes the visitor triggers.
- **Privacy and speed:** fonts are self-hosted, so no visitor data goes to Google. A strict Content-Security-Policy in `_headers` only allows files from the site itself. Total page weight is roughly 380 KB including fonts.
