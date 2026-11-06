# 0002: Make the PWA work well on iOS and Android

**Status:** Accepted (the owner, 2026-11-05). Install help moved to ADR 0003. Reminders are on by default since ADR 0004.

## Context

Most workers clock in and out from their phones, and many aren't technical. The owner wants the PWA to help them as much as it can on both iOS and Android.

Today's PWA is CRA's default:

- It caches the app shell, and has iOS icons and splash screens.
- Nothing tells a worker a new version is out, so phones can keep running stale code. That will break admin corrections once the API needs a `reason`.
- Nothing helps a worker install the app.
- When offline, it fails without saying why.
- The manifest's `any` icons are the padded maskable images, and the theme colour is black instead of the brand's `#150958`.
- The manifest has no `id`, `scope`, screenshots or shortcuts.

What each platform supports, checked against WebKit, Chrome and MDN docs in November 2026:

| Feature | iPhone (installed to Home Screen) | Android Chrome |
|---|---|---|
| Install | Share → Add to Home Screen only, with no API to trigger it. From iOS 26, Home Screen sites open as apps by default. | `beforeinstallprompt`, our own button |
| Push | iOS 16.4+, installed only, permission requested from a tap. Declarative push from 18.4. | Yes |
| App badge | `setAppBadge`, installed only, needs notification permission | No API. The OS badges the icon for unread notifications. |
| Background Sync | No | Yes |
| Shortcuts (long-press) | No | Yes |
| Vibration | No | Yes |

The API side (tap time, push subscriptions, reminders, weekly emails) is decided in API ADR 0004.

## Decision

**Manifest and iOS tags:**

- Generate the manifest from `vite.config.js`:
  - `id: "/"`, `start_url: "/"`, `scope: "/"`, `display: "standalone"`, `lang: "en"`
  - `theme_color: "#150958"`, `background_color: "#ffffff"`
  - `any` icons from the existing plain `icon-192/512.png`, and the maskable ones kept apart
  - `launch_handler: { client_mode: ["focus-existing", "auto"] }`
  - Two `narrow` and one `wide` screenshot, for Android's richer install sheet
  - Shortcuts "Clock in" (`/`) and "My check-ins" (`/checkins`), which only work on Android
- Keep the existing apple-touch-icon and splash images. Add `apple-mobile-web-app-title` and `mobile-web-app-capable` next to the Apple one, and use the brand `theme-color`.

**Updates:**

- When a new version is waiting, a Sonner toast says "A new version is available" with an **Update** button. The service worker also checks for an update when the app comes back to the foreground.
- No silent reload, so a form being filled in isn't lost.

**Install help**, hidden when the app is already running standalone:

- **Android:** an "Install app" button that keeps the `beforeinstallprompt` event and calls `prompt()`.
- **iPhone Safari:** a dismissible card explaining Share → Add to Home Screen, and that reminders need it.

**Offline:**

- A banner shows while the device is offline.
- The last known clock status is kept in `localStorage`, so the right button shows offline.
- **Tapping Clock in/out offline queues one action** in `localStorage`, with its `tapped_at`, and the button shows "Pending".
  - The queue is flushed on `online`, when the app becomes visible, and at startup. That one path works on both platforms, because iOS has no Background Sync.
  - A queued action older than 15 minutes is dropped. The worker is told to ask an admin for a correction.
  - API errors on flush (already clocked in elsewhere, no open check-in after midnight) are shown and the action is dropped.

**Push reminders:**

- "Turn on reminders" in the menu asks for permission from that tap, subscribes with the VAPID public key (`VITE_VAPID_PUBLIC_KEY`) and posts the subscription to the API.
- On iPhone outside the installed app, it shows the install card instead.
- On logout the app unsubscribes and deletes the subscription, because phones are shared.
- `src/sw.js` handles `push`: it reads the declarative JSON, shows the notification and sets the badge. On `notificationclick` it focuses or opens the app at `navigate`.

**Badge:** `setAppBadge()` while today's check-in is open, and `clearAppBadge()` otherwise, feature-detected.

**Not used:**

- Vibration (not on iOS) and Wake Lock (nothing to keep awake).
- Geolocation: API ADR 0002 has legal prerequisites first.
- Periodic Background Sync and Notification Triggers: not on iOS, and reminders come from the server.

## Alternatives

- **Keep today's PWA as is.** The least work, but stale versions would break corrections after the deploy, and workers get no help offline or with installing.
- **Workbox Background Sync for the queue.** It does nothing on iOS, where most of the risk is, and it would be a second path to test. One page-level flush covers both platforms.
- **IndexedDB for the queue.** It only ever holds one action, so `localStorage` is enough.
- **An installed-only app (TWA on Google Play, or a native wrapper).** It needs store accounts, and doesn't help iOS. Not needed.
- **A third-party PWA skill.** The most-installed ones on skills.sh are generic and miss the iOS limits above. The sourced table here is more reliable.

## Consequences

- Push and the badge on iPhone only work once the app is installed, on iOS 16.4 or later. The install card says so.
- Queued taps are recorded up to 15 minutes late, and the stored tap time shows the gap (API ADR 0004).
- Push, install and update flows need a manual check on a real iPhone and a real Android phone over HTTPS. Headless browsers can't receive push.
- `VITE_VAPID_PUBLIC_KEY` joins the env files. It's public, so it's safe in the bundle.
- The workers' privacy notice should mention push subscriptions (API ADR 0004).
