# Studio Film AI Bekal

The editor replaces the previous film studio with a web adaptation of [AI Video Production Editor](https://github.com/LudwigKienle/ai-video-production-editor) by Ludwig Maximillian Kienle, imported at commit `752cd43d3af6421d2bd6d4ce27f2d9815f7acba3`. Original notices, source and GPL-3.0-or-later license are retained in `studio-film-ai/`. The adapted editor is named Studio Film AI Bekal; it is not an official upstream release. The About dialog links to the original project, the complete adapted source in this repository, and the license included with the public runtime.

## Integration

The original production workspaces remain: project/script, microdrama, media library/import, moodboard, design, image/video generation, node workflows, scene/set/world tools, timeline editing, sound, compositing, color, review and export. The simple/standard/pro modes remain available; core navigation labels use Indonesian. Optional provider, cloud/team and desktop integrations remain in the source, with their original prerequisites.

`src/services/bekalBrowserProject.ts` adapts the project storage contract to IndexedDB `bekal-video-editor`. Projects, imported media and project metadata are saved atomically on this device. The last saved project is reopened after reload. JSON backups include project metadata and binary assets; backup restore validates asset paths. The previous `bekal-film-studio` and `bekal-cinematic-studio` databases are untouched. Back up projects before clearing browser data. Device memory/storage quota and browser codecs still apply.

Local editing does not require a server or account. AI generation needs the user's own provider key and may incur provider charges; provider support and browser CORS rules apply. Requests with API credentials are sent directly to their provider, rather than upstream's public CORS relay. No paid provider or external cloud service is configured by this deployment. Browser WebM export and editor handoff formats remain; MP4/FFmpeg, native plugin installation and desktop filesystem operations require the desktop application. Those capabilities are not represented as automatically available on GitHub Pages. Media/provider generation is not a local animatic template substitute.

The website's live green/teal and navy/light color tokens are read from `assets/style.css` by `scripts/sync-film-theme.py`. The adapted Tailwind and editor CSS use those tokens. Theme choice follows `pbs_theme`. Workspaces are loaded on demand with React Suspense rather than a single large editor bundle. Tailwind is compiled locally; no Tailwind runtime CDN or import-map React CDN is needed.

`assets/features.json` and `assets/film-tools.json` provide landing/menu links. `scripts/publish-film-studio.py` installs the web build at the existing `film-studio.html` URL; `scripts/stage-pages.py` includes only runtime HTML/assets/partials in the Pages artifact.

## Development and deployment

Requires Node 24 (supported upstream engine also includes recent Node 22), npm 10+ and Python 3. Web development does not need Electron/FFmpeg installation hooks; `--ignore-scripts` skips those desktop hooks while npm still checks package integrity. Required Vite native binaries are installed as platform dependencies.

```sh
npm ci --prefix studio-film-ai --ignore-scripts --no-audit --no-fund
npm run --prefix studio-film-ai typecheck
npm run --prefix studio-film-ai test
npm run --prefix studio-film-ai build:web
python3 scripts/publish-film-studio.py
python3 scripts/sync-catalog.py
python3 scripts/check-site.py
```

Source development: `npm run --prefix studio-film-ai dev -- --host 127.0.0.1 --port 8010`, entry `/assets/studio-film-ai/studio.html`. Integrated website: run `python3 -m http.server 8006 --bind 127.0.0.1` from the repository root. Source theme regeneration uses `python3 scripts/sync-film-theme.py`. The Pages workflow repeats pinned installation, typecheck, upstream tests, web build, catalog synchronization and runtime staging before deployment.

## Verification

The upstream Node test suite covers the existing timeline, export/interchange, color, task, media and desktop helper logic. Browser tests exercise the adapted static production build, project save/reload, actual image import/decode, backup download/restore, local storage operations and populated responsive workspaces across dark/light themes.

```sh
PBS_SITE_BASE_URL=http://127.0.0.1:8006 FILM_DEV_BASE_URL=http://127.0.0.1:8010/assets/studio-film-ai/studio.html node scripts/check-film-studio.cjs
python3 scripts/check-catalog.py
python3 scripts/check-site.py
PBS_SITE_BASE_URL=http://127.0.0.1:8006/ node scripts/check-responsive.cjs
```

Use installed Playwright and Chromium; set `NODE_PATH` if Playwright is outside the checkout. Tests do not invoke paid AI providers or claim verification on every physical device.
