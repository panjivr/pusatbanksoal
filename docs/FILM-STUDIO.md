# Studio Film AI

`film-studio.html` implements a local production planner from the supplied AI Cinematic Series Director blueprint. It includes ten production modules and the full 67 numbered chapters, plus the original Markdown document including its role section. The uploaded document is product input; its claims about provider versions are displayed as source material, not verified provider capability guarantees.

## Working features

- Project intake, ten concept scaffolds, model-language instruction briefs, seven-beat episode templates, season arc scaffolds and editable narrative JSON (secrets, relationships, reveal timing, unresolved threads and color scripts).
- Immutable canonical IDs, explicit identity locks, separate variants and mutable scene state. Canon changes invalidate previously approved shots. Characters, wardrobe, locations, props, styles, voices, vehicles and organizations have editable records.
- Fourteen character reference prompts, local reference/keyframe/clip/audio files, provenance metadata and explicit human approval. Missing local files can be reattached without changing reference IDs.
- Scene state, wardrobe ownership, physical/emotional state, carried props, character knowledge, screen position, eyeline, hand, story timestamps, axis side and justified changes.
- Shot size/angle/lens/movement, single-action prompts, dialogue, performance, lighting/style inheritance, start/end state, first/last frame binding, seven-shot dialogue coverage scaffolds, and line-based screenplay splitting. These are deterministic planners, not local language-model inference.
- Provider prompt profiles for generic, Midjourney, Runway and Veo. Provider model/version is user supplied; no obsolete reference flags or generation API requests are emitted. Profile duration warnings are planning suggestions, not enforced file/scene limits or claims about all versions. Reference files must be uploaded in the chosen provider; internal IDs alone do not transfer media.
- Data continuity checks for reference approval, wardrobe ownership, prop IDs, early secret knowledge, keyframe binding, story-time changes, speaker membership and entry/end state mismatches. Human visual QC scores with identity/wardrobe/critical-prop gates and weighted thresholds. This is not computer vision; a PASS covers only inspected structured rules.
- Prompt hash/version history and approved-shot state event log, editable timeline order, clip mapping, costs/iteration estimates, subtitle SRT, project Markdown and JSON, and complete ZIP export/import including reference/clip assets, prompts, timeline, subtitles, system roles and original guide.
- Explicit IndexedDB save/recovery/clear; JSON exports metadata, ZIP includes media. Import validates schema, IDs and asset paths. Rendering escapes user text; guide HTML uses existing DOMPurify. Downloads have separate Blob URL lifetime from pane rendering to avoid revoking download URLs during tab updates.
- Eleven direct module links are generated on the landing page from `assets/film-tools.json`; public discovery adds the film feature/menu/SEO/sitemap through existing catalog synchronization. Film sprite is in `assets/app.js`.

## Scope and limitations

No model API, paid service, local image/video generative model, automatic face/video inspection, MP4 assembly, background server jobs, team messaging or viewer analytics are implemented. Generated media is imported from the user's chosen provider. Timeline/clip/audio plans and subtitles are exported for an external editor. No UI implies that a prompt or timeline is a rendered film. AI generation and autonomous multi-episode rendering remain provider-dependent stages described in the included blueprint. Permission/consent and asset licenses are recorded locally, not legally adjudicated.

Input assets are processed locally; the planner itself makes no provider requests. Browser codec, memory, storage quota and model capabilities still apply. Local copies are saved only through the save button; browser clearing can remove them, so use ZIP backups. Browser tests are Chromium-based, not proof for every physical device/provider.

## Verification

Use `PBS_SITE_BASE_URL` and installed Playwright/Chromium:

- `node scripts/check-film-studio.cjs`: canonical locks/variants, reference gates, secret timing, wardrobe checks, first/last frames, human QC, end/start states, prompt adapters/inheritance/version hash, timeline/SRT, unsafe paths, full source guide, UI, IndexedDB recovery, ZIP asset round trip.
- `node scripts/check-film-responsive.cjs`: eleven populated panes × six viewport sizes × two themes (132 combinations).
- `python scripts/check-catalog.py`, `python scripts/check-site.py`, and `node scripts/check-responsive.cjs` for site/catalog regressions.

Run the existing static server; no npm/build or extra runtime dependency is required.
