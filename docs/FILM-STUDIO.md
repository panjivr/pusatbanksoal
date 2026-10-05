# Studio Film AI: Cinematic Series Director

The application at `film-studio.html` replaces the previous planner with the user's React application from https://github.com/panjivr/studio-film-ai, imported from commit `6dc835e1a4fc3796ea9eaad89e38633b27aeaec9`. Editable source is in `studio-film-ai/`; compiled runtime assets are in `assets/studio-film-ai/`.

## Features and storage

The original six workspaces are retained: AI Canvas, Series Bible, Asset Bible, Episode, Shot List and Produksi. Production has keyframes, WebM animatic clips, ordered episode assembly, music/narration mixing and final WebM downloads. Canvas supports asset synchronization, connections, Auto Coverage and structured QC. Prompt/story generation uses deterministic templates; image rendering is a procedural storyboard renderer, not an image-generation model. Video is an animated storyboard in portrait 540 × 960 format. External model names in prompts are user settings, not connected or verified generation services.

By default, the existing database API runs against IndexedDB `bekal-cinematic-studio`. Projects, assets, episodes, scenes, shots, keyframe parameters and Canvas are saved automatically on this device. The last selected project persists through reload. Data is scoped to the selected project; foreign keys, cascading deletes, unique episode numbers and keyframe upserts are enforced by local transactions. The previous planner's separate `bekal-film-studio` database is untouched.

Rendered video/audio Blobs currently live in the production workspace's memory. Download them before leaving that workspace or refreshing; those media files are not persistent project backups. Browser data clearing removes local projects. Browser storage quota, codec support, device memory and processing speed still apply. Recording runs in real time; keep the tab visible. Browser-based tests are Chromium checks, not physical-device certification.

The upstream Supabase migrations remain in the source folder as optional reference. No migrations are executed and no external database is required. Only a separately configured build with real `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` selects cloud mode. Never commit credentials. The upstream database policies require independent review before configuring a public shared instance.

## Build and develop

Requires Node 22+ and Python 3. From the repository root:

```sh
npm ci --prefix studio-film-ai --no-audit --no-fund
npm run --prefix studio-film-ai typecheck
npm run --prefix studio-film-ai lint
npm run --prefix studio-film-ai build
python3 scripts/publish-film-studio.py
python3 scripts/sync-catalog.py
python3 scripts/check-site.py
```

Static deployment uses the committed runtime assets. For source development, run `npm run --prefix studio-film-ai dev -- --host 127.0.0.1 --port 8007`. Its entry URL is `/assets/studio-film-ai/`. For the integrated website, run `python3 -m http.server 8006 --bind 127.0.0.1` from the repository root.

`assets/features.json` and `assets/film-tools.json` supply landing links, icons and metadata. The Pages workflow rebuilds the imported app, synchronizes catalogs and stages only runtime files using `scripts/stage-pages.py`; source, node_modules and tooling are excluded from the Pages artifact.

## Validation

With Playwright installed, Chromium available at `/usr/bin/chromium`, static server running and Vite running:

```sh
PBS_SITE_BASE_URL=http://127.0.0.1:8006 FILM_DEV_BASE_URL=http://127.0.0.1:8007/assets/studio-film-ai/ node scripts/check-film-studio.cjs
python3 scripts/check-catalog.py
python3 scripts/check-site.py
PBS_SITE_BASE_URL=http://127.0.0.1:8006/ node scripts/check-responsive.cjs
```

The film check exercises local CRUD, rollback, relationships, cascades, keyframe upserts, Canvas edge deletion, real MediaRecorder clip/film output and playback, project creation/reload, repeated asset sync, the production/download workflow, and populated layouts across phones, tablets, landscape and wide desktops. Set `NODE_PATH` to the installed Playwright module directory if it is not a local dependency.

`node scripts/check-film-long.cjs` additionally records a real 32-second clip, assembles it and checks video packet timestamps with `ffprobe` to catch truncation of long episodes. It requires FFmpeg/ffprobe and takes about one minute.
