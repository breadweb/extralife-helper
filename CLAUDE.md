# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

The Extra Life Helper is a web app that Extra Life participants and teams add to a LIVE stream (via OBS browser source), embed in a website (`iframe`), or display fullscreen at an in-person event. It polls the Extra Life API to show a countdown/count-up timer, total raised, real-time donation alerts, milestone alerts, and other fundraising content. The app renders a fixed-aspect 16:9/16:10 "content" box that scales to the window. End users customize it with a link generator at https://breadweb.net/extralife-helper/; this repo is the app itself, meant to be forkable.

The React app lives in `helper/`. Python testing tools live in `tools/` and mock API fixtures in `mock-api/`. Run all `npm` commands from inside `helper/`.

## Commands

```shell
cd helper
cp .env.local.example .env.local   # first-time setup
npm install
npm run dev                        # Vite dev server at http://localhost:5173
npm run lint                       # eslint; must pass with zero warnings before any PR
npm run build:LOCAL                # build for LOCAL mode
npm run build:REMOTE               # build for REMOTE mode
```

Mock API (run from repo root, strongly preferred over hitting the real API during dev):

```shell
python tools/webserver.py mock-api -p 5174   # serve mock-api/ at http://localhost:5174
python tools/mock.py -h                       # reset | set-totals | add-donos
```

Point the app at the mock by setting `VITE_API_BASE_URL=http://localhost:5174/` in `.env.local`. `tools/mock.py` mutates the JSON fixtures under `mock-api/` to simulate donations/totals the way the real API behaves — use it to exercise donation and milestone flows.

There is no automated test suite; verification is manual against the running dev server + mock API.

## Runtime modes (central architectural concept)

`VITE_RUNTIME_MODE` selects one of three modes, and this choice drives **where user settings come from**. `useHelperSettings.jsx` reads settings differently per mode, validates them with a Joi schema, then hands a single normalized settings object to the rest of the app:

- **DEV** — Vite dev server. Settings come from env vars in `.env.local` (`getSettingsFromEnvVars`).
- **LOCAL** — `build:LOCAL` produces a single self-contained `helper/dist/index.html` (via `vite-plugin-singlefile`). Settings are read from `window.*` globals (`getSettingsFromGlobal`). A custom Vite plugin in `vite.config.js` (`helperSettings`) injects a human-editable `<script>` settings block at the top of that HTML so end users can edit values by hand. For distribution when the user has no hosting.
- **REMOTE** — `build:REMOTE` produces a normal multi-file bundle for hosting (e.g. S3). Settings come from short querystring params (`getSettingsFromParams`, e.g. `pid`, `tid`, `t`, `c1`). This is what powers the official hosted version.

When adding a user-facing setting you must wire it through **all three** sources: the querystring parser, the `window` global reader, and the env-var reader in `useHelperSettings.jsx`; the Joi `schema` in the same file; the `.env.*` files; and the `getSettingsContent()` items array in `vite.config.js` (so it appears in the LOCAL build's editable block). Config lives in three env files: `.env.local` (DEV), `.env.deploy.LOCAL`, `.env.deploy.REMOTE`.

Settings split into **user settings** (participant/team ID, colors, toggles — end-user editable) and **application settings** (`VITE_POLLING_INTERVAL`, TTLs, intervals — tuned, not user-facing). Do not set `VITE_POLLING_INTERVAL` below `15000` when targeting the real Extra Life API or you will be rate limited.

## Data flow

`App.jsx` → `LiveContent.jsx` orchestrates everything. Data is fetched by a small hook stack: `useExtraLifeData` (single axios GET) → `usePolledExtraLifeData` (polls on `VITE_POLLING_INTERVAL`) → `LiveContent` reacts to each poll. The endpoint is `participants/{id}` or `teams/{id}` depending on which ID is set (exactly one of participant/team ID is allowed).

`LiveContent` diffs the donation count between polls to decide when to fetch `/donations` and `/milestones`, then coordinates the display state machine across `DonationView`, `MilestoneView`, `InfoView`, and "filler" content (`useFillerContent` — the occasional logo / latest-donations views). `useDonations` and `useMilestones` track which alerts are unseen/completed. The money total animates up via `react-countup`, and milestone checks intentionally run only *after* the count-up finishes (`onAmountIncremented`) so alerts and totals stay in sync. Request errors are tolerated up to `MAX_REQUEST_ERRORS` consecutive failures before showing an error (except fatal 404s), to ride out intermittent API blips.

`PreviewContent` (driven by `previewMode`) renders individual views in isolation for the link generator's live preview instead of the live polling flow.

## Stack & conventions

React 18 + Vite. Tailwind for styling; the color **theme** system uses `tw-colors` with CSS custom properties (`--twc-helper1`..`5`) — presets are classes toggled on `documentElement`, and `custom` theme overrides those properties from hex settings converted to HSL (`App.jsx`). i18next provides full localization; **all user-facing strings must go through `t()` and be added to `src/assets/locales/{en,es,fr}.json`** (never hardcode display text). Joi validates settings. Luxon handles dates/times.

Before any PR: `npm run lint` must pass clean, and revert personal-testing changes to tracked `.env.deploy.*` and `mock-api/` files (they are shared defaults, not your scratch state).
