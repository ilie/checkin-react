# Checkin

The web app staff use to clock in and out of work, and admins use to review and correct check-ins. It's a React PWA in front of the Laravel API in the `checkin api` repo. Phones get an app-like layout below 700px; desktop keeps a classic one.

The decisions behind it are in [`adrs/`](adrs): the Vite and React rewrite (0001), the PWA on iOS and Android (0002), the phone layout (0003) reminders on by default (0004) and on desktop too (0005).

## Setup

You need Node 22.12 or newer, and the API running locally for anything beyond the sign-in screen.

```sh
npm install
npm run dev
```

The app runs on http://localhost:3000 and calls the API at `VITE_API_URL`, which `.env.development` sets to `http://localhost:8000/api`. `.env.production` holds the production API, which only the deployed build uses.

`VITE_VAPID_PUBLIC_KEY` is the public key push reminders are sent with. `.env.development` has the local API's test key. `.env.production`'s is filled in at deploy, and must match the production API's `VAPID_PUBLIC_KEY`. Without one, there are no reminders and no Notifications switch.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | The development server, on port 3000 |
| `npm run build` | The production build, in `build/` |
| `npm run preview` | Serves `build/` on port 4173, with the service worker |
| `npm run lint` | Oxlint, with no warnings allowed |
| `npm test` | The Vitest unit tests |
| `npm run e2e` | The Playwright tests (see below) |
| `npm run screenshots` | Retakes the install screenshots in `public/screenshots/` |

## End-to-end tests

`npm run e2e` runs Playwright in Chrome against a throwaway copy of the API, never the production one:

- The API repo must sit at `../../Laravel/checkin api` from here, or at `E2E_API_PATH`, with PHP available.
- The setup builds an SQLite database from the API's migrations and `e2e/api/seed.php`, and serves the API on port 8017. It stops if something already answers there.
- It starts the dev server on port 3000 and a production build with `vite preview` on port 4173, for the manifest and service worker tests.
- Every test runs on a pinned "today", Wednesday 4 November 2026 at 10:00, and fails if anything calls the production API.

## The PWA

| | iPhone (Safari) | Android (Chrome) | Desktop |
|---|---|---|---|
| Install | Share → Add to Home Screen. The sign-in screen and the Me sheet show the steps. | Chrome's install prompt, from the Me sheet's "Install app" | The browser's install button |
| Long-press shortcuts | No | Clock in, My check-ins | No |
| New version | An "Update" toast; nothing reloads by itself | The same | The same |
| Offline | A banner says so. A clock tap shows "Pending" and is sent once back online, if that's within 15 minutes | The same | The same |
| Clock-out reminders | On from the first clock-in in the installed app (iOS 16.4+), off with the Me sheet's Notifications switch. In Safari, the row shows how to install | On from the first clock-in, off with the same switch | On from the first clock-in, off with the header's bell, while the browser runs |
| App badge | On the installed app's icon while a check-in is open, once reminders are on (it needs notification permission) | No API; Android badges the icon for unread notifications | On the installed app's icon, while a check-in is open |

The manifest is generated from `vite.config.js`, and `src/sw.js` is the service worker. It's only built by `npm run build`; the dev server has none. `public/service-worker.js` only retires the Create React App build's worker on phones that installed it; keep it until a few months after the 2026-11 deploy.

### Trying it locally

Build against the local API, not production, and serve the build:

```sh
VITE_API_URL=http://localhost:8000/api npm run build
npm run preview
```

Add `VITE_VAPID_PUBLIC_KEY=` with the key from `.env.development` to the build command to try reminders. Open http://localhost:4173. In Chrome's DevTools, Application → Manifest shows the manifest and any installability problems, and Application → Service workers shows the worker. To see the update toast, change anything in `src/`, build again, and bring the tab back to the front.

Phones need HTTPS for the service worker, so testing on a real device needs a tunnel to the preview build and to the local API, never the production API.
