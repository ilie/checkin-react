# Plan for 0002: Make the PWA work well on iOS and Android

**Status:** In progress (revised 2026-11-05 to match ADR 0003 as built)

## Goal

- The manifest and iOS tags match the ADR, and Chrome's installability check passes with no warnings.
- Workers are offered the update, install help, offline banner and offline queue, push reminders and badge described in the ADR, and the Playwright suite covers everything a headless browser can.
- The device checklist (task 7) has passed on a real iPhone and a real Android phone.

**Out of scope:**

- geolocation
- clock-in reminders
- admin pushes
- a native or store app

## Conventions

- Same branch as ADR 0001 (`feature-modernize-frontend`). Runs **after task 11** of the ADR 0001 plan, so Vite, TanStack Query, Sonner and Tailwind are in place, and **before its task 12**, so the final review covers both.
- **Tasks 4 and 5 need API ADR 0004 tasks 2 and 3** on the local API. Tasks 1–3 don't.
- **ADR 0003 came first** and changed the phone screens this plan touches; the tasks below name its components. Phone UI follows its look: Apple's grouped rows, sheets and the theme tokens in `src/index.css`, in light and dark.
- Skills: the same as ADR 0001. `modern-browser-apis` and `web-security` apply to every task.
- **Never call production.** Push keys for development are local test keys.
- Run `npm run lint`, `npm test` and `npm run e2e` in every task.

## Tasks

### 1. Manifest, icons and iOS tags
- Move the manifest into the `VitePWA({ manifest })` options as listed in the ADR (`display: "standalone"`, `theme_color: "#150958"`), drop `manifest: false`, and delete `public/manifest.json` and its `<link>` in `index.html`. Point `any` at `icon-192.png`/`icon-512.png` and `maskable` at `public/icons/manifest-icon-*.maskable.png`.
- Take the screenshots with Playwright (`e2e/screenshots.spec.js`, run on demand) into `public/screenshots/`.
- In `index.html`:
  - keep ADR 0003's two `theme-color` metas, which `src/theme.js` sets per theme (navy on desktop). Only the manifest's `theme_color` is navy.
  - `apple-mobile-web-app-title` "Checkin"
  - `mobile-web-app-capable`
  - the description is already there
- **Verify:**
  - an e2e test fetches `/manifest.webmanifest` from the preview build and checks `id`, `scope`, `start_url`, the theme colour, the icon purposes, the screenshots and the shortcuts
  - Chrome DevTools' Application → Manifest shows no installability warnings (manual)
- **As built:** the e2e suite also serves a production build with `vite preview` on port 4173 (`e2e/support/preview.js`). `e2e/manifest.spec.js` checks the manifest there, that every file it names is served, and asks Chrome through the DevTools protocol for manifest and installability errors, which automates the manual check (bar `in-incognito`, since Playwright's contexts are private windows). The screenshots are Ana's Home (no warning on it), Walter's Check-ins and the desktop table, taken with `npm run screenshots`; the spec is skipped by `npm run e2e`.
- **Done:** yes, 2026-11-05 (lint, 88 unit tests, 66 e2e tests)

### 2. Update prompt
- Add `src/pwa/useServiceWorker.js`, wrapping `useRegisterSW` from `virtual:pwa-register/react`.
  - When `needRefresh` is set, show a persistent Sonner toast, "A new version is available", with **Update**, which calls `updateServiceWorker(true)`.
  - Call `registration.update()` on `visibilitychange` to visible.
- **Verify:**
  - an e2e test against `npm run preview`: build, load, rebuild with a changed `sw.js`, reload, and the toast appears. Update reloads to the new version.
- **As built:** no hook. `src/pwa/serviceWorker.js` passes `onNeedRefresh` and `onRegisteredSW` to the `registerSW` call `src/index.jsx` already made; the toast needs no React state. `e2e/update.spec.js` appends to the built `sw.js` instead of rebuilding (preview reads it from disk), and fires `visibilitychange`, so it goes through the app's own check. Workbox reloads only a page that a service worker controlled when it loaded, so the test starts as a returning worker would.
- **Done:** yes, 2026-11-05 (lint, 88 unit tests, 67 e2e tests)

### 3. Offline banner
- Install help moved to ADR 0003, task 4 (`src/pwa/useInstall.js`, the "Install Checkin" sheet and the Me sheet's "Install app" row).
- `src/pwa/useOnline.js` (`online`/`offline` events), and a banner "You're offline. Clock-ins are saved and sent when you're back online."
- On phones the banner sits below the status bar (`env(safe-area-inset-top)`) and doesn't cover the large titles: it takes space in the page flow rather than floating over it. On desktop it sits below the header. Both themes.
- **Verify (e2e):**
  - `context.setOffline(true)` shows the banner, and going back online hides it.
  - On `phone`, the banner's top is at or below the safe area and the page's large title stays fully visible.
  - Light and dark phone screenshots for the owner.
- **As built:** `src/components/UI/OfflineBanner.jsx`, rendered once in `App.jsx` after the desktop header, signed in or out, inside an `<output>` (a status region) that stays mounted so the change is announced. Phones show it as a grey inset card, since being offline is a state and Home's orange is for warnings; desktop shows an amber strip. The auth layout now fills the app's column (`flex-1`) instead of a second full screen, so the banner doesn't push it into a scroll. Screenshots: `adrs/assets/0002/offline.png`.
- **Note:** the banner promises that clock-ins are saved, which is true only once task 4 ships. Both must reach production together.
- **Done:** yes, 2026-11-05 (lint, 88 unit tests, the build, 69 e2e tests)

### 4. Offline clock-in queue
- `src/pwa/clockQueue.js`, pure functions over a storage object:
  - `enqueue(action, now)` (at most one action)
  - `pending()`
  - `takeIfFresh(now, windowMinutes)` (returns the action or `expired`)
  - `clear()`
- Add the offline queue to the README's PWA table.
- `useCheckinStatus` keeps the last status for today in `localStorage`, and uses it while offline.
- **Clock in/out:**
  - Offline, it enqueues `{type, checkin_id, tapped_at}`, and the button shows "Pending" (disabled).
  - Online, it posts as before.
- Flush on `online`, on `visibilitychange` to visible, and at startup:
  - a fresh action is posted with `tapped_at`, then the queue is cleared and the status invalidated
  - an expired one is dropped with a toast telling the worker to ask an admin for a correction
  - an API error is shown, and the action is dropped
- The 15-minute window is a constant that matches the API default. The API enforces it, and a 422 on flush is handled like any other API error.
- **Verify:**
  - Vitest for `clockQueue`: enqueue/pending, the one-action limit, fresh vs expired at 14 and 16 minutes, clear.
  - e2e:
    - offline tap → "Pending" → online → the API has the check-in with `checkin_tapped_at` set
    - offline tap, then `page.clock` +16 minutes, then online → no request, and the expiry toast shows
    - offline checkout after another device already closed it → the error shows and the queue is empty
    - a reload while offline keeps "Pending"
- **As built:**
  - `clockQueue.js` takes the storage as its first argument. `src/pwa/offlineClock.js` puts it on screen and on the wire: `queueClock`, `useHasPendingClock` (a `useSyncExternalStore` over the queue) and `useFlushPendingClock`, which `App.jsx` runs for the whole signed-in session, whatever page is open. One flush at a time, so `online` and `visibilitychange` can't send the tap twice.
  - A tap whose request gets no response at all is queued too, since a phone can say it's online on a connection that carries nothing. A flush that gets no response keeps the action for the next try.
  - The status is remembered by `src/pwa/clockStatus.js`, which also sets the badge (task 5), and is used as the query's `initialData` only when the app opens offline. Query errors without a response don't toast while offline; the banner already says why.
  - Sign out and a 401 both clear the queue and the remembered status, so the next person on a shared phone inherits neither.
  - The expiry toast stays until it's closed, since it may be the first thing the worker sees.
  - The e2e tests are in `e2e/offline.spec.js`. The reload runs on the preview build, which has the service worker, and also checks that the remembered status shows offline without error toasts. Screenshots: `adrs/assets/0002/pending-and-reminders.png`.
- **Done:** yes, 2026-11-06 (lint, 92 unit tests, the build, 77 e2e tests, against the API's `main` with ADR 0004)

### 5. Push reminders and badge
- In `src/sw.js`:
  - `push`: parse the JSON, then `showNotification(title, {body, data: {url: navigate}, icon})`. Set the badge if it's supported.
  - `notificationclick`: focus an open window, or `openWindow(url)`.
- `src/pwa/usePush.js`:
  - `supported`: `PushManager` exists, and on iOS the app is standalone
  - `enabled`: a subscription exists
  - `enable()` (from a tap: `Notification.requestPermission`, `pushManager.subscribe({userVisibleOnly: true, applicationServerKey})`, then `POST /api/push-subscriptions`)
  - `disable()`
- In the Me sheet (`src/components/Me/MeSheet.jsx`), a row "Clock-out reminders" with a `Switch` from `src/components/UI/Grouped.jsx`. On an iPhone, when not installed, the row opens `InstallSheet` (`src/components/Install/InstallSheet.jsx`) instead, the way "Install app" does. Desktop has no Me sheet and gets no toggle: reminders are for the phones staff clock in with.
- Sign out (the Me sheet) and Logout (the desktop nav) both call `logout` from `src/store/auth-context.jsx`: `logoutHandler` calls `disable()` before clearing the token. A 401's `clearLogin` doesn't, since the token can no longer reach the API.
- `src/pwa/badge.js`: `setAppBadge()` while today's status is `checkin`, and `clearAppBadge()` otherwise, feature-detected. Driven by `useCheckinStatus`.
- Add the reminders, the badge and `VITE_VAPID_PUBLIC_KEY` to the README's PWA table and setup.
- Add `VITE_VAPID_PUBLIC_KEY` to `.env.development` (the local test key) and to `.env.production` (left for the owner to fill in at deploy).
- **Verify:**
  - e2e with Chromium and notification permission granted, with `pushManager.subscribe` stubbed through `page.addInitScript`, because headless Chromium can't reach a push service:
    - enabling posts the subscription to the API
    - logout deletes it
    - on an iPhone Safari user agent outside standalone, the row opens the install sheet instead
  - e2e: dispatch a synthetic `push` to the service worker via CDP (`ServiceWorker.deliverPushMessage`), and a notification is shown with the right title (read through `registration.getNotifications()`)
  - e2e: `navigator.setAppBadge` is called after clocking in and cleared after clocking out (spy through an init script)
- **As built:**
  - `src/pwa/push.js` holds the subscription calls without React, so `auth-context.jsx` can use them, and `src/pwa/usePush.js` is the hook. Its `method` is `"switch"`, `"install"` (Safari on an iPhone outside the Home Screen app) or nothing. With no `VITE_VAPID_PUBLIC_KEY` there's no row, so production shows none until the owner fills in the key.
  - If the API refuses the subscription, the browser's is undone, so the switch never looks on while nothing would arrive. A refused permission shows a toast pointing to Settings.
  - The badge lives in `src/pwa/clockStatus.js` (no separate `badge.js`): it's set whenever the status is fetched, and cleared on sign out. The push handler sets it too, since a reminder means a check-in is open.
  - The row's footnote says "A notification if you forget to clock out", not the API's hours, which are its settings.
  - The e2e tests are in `e2e/reminders.spec.js`. The push test records the worker's `showNotification` call instead of reading `getNotifications()`, which Chrome on macOS fills only with what the system reports as displayed, so it missed notifications. Playwright's preview build gets the local test key through `loadEnv`.
  - **Changed by ADR 0004:** reminders are on by default. A phone's Checkin tap asks for permission and subscribes, the row is called "Notifications", and turning it off is remembered until sign out.
- **Done:** yes, 2026-11-06 (same checks as task 4)

### 6. README
- Document the PWA features per platform, how to test them locally (`npm run build && npm run preview`), the VAPID env variable, and the device checklist.
- **Verify:** follow the README from a clean clone up to the preview build.
- **As built:** the Create React App README is replaced by a short one: setup, scripts, the e2e requirements and the PWA per platform, plus how to try a build locally. That build must set `VITE_API_URL` to the local API, because `npm run build` otherwise reads `.env.production`. It describes what exists; **tasks 4 and 5 add their rows** (offline queue, reminders, badge, the VAPID key) when they land, and the device checklist stays in task 7. ADR 0001 task 12 checks it again.
- **Verified:** a clean clone, `npm install`, the local-API build and `npm run preview` serve the manifest and the app, and the bundle holds no production API URL. 2026-11-05.
- **Done:** yes

### 7. Real-device check (the owner, with me guiding)
- Serve the preview build and the local API over HTTPS on test data. Use a tunnel for both, never production. Then on an iPhone (iOS 16.4+) and an Android phone:
  1. Android: install from the button. iPhone: follow the install sheet. The icon, name, splash screen and theme colour look right.
  2. Clock in, and the permission prompt appears (ADR 0004). Allow it: the badge appears on iPhone, and Notifications in Me is on.
  3. Run the API's reminder job once by hand, and the notification arrives. Tapping it opens the app.
  4. Airplane mode: tap Clock out, see "Pending", turn airplane mode off, reopen the app, and the record has the tap time.
  5. Deploy a changed build, reopen the app, and the update toast appears.
  6. Android: the long-press shortcuts work.
  7. Logout removes the subscription.
  8. A phone that had the old app installed opens the new one after the deploy (ADR 0001 task 12's review).
  9. iPhone: Export in the Check-ins sheet downloads the CSV.
- **Verify:** the owner confirms each step.
- **Done:** no

## Open questions

None.
