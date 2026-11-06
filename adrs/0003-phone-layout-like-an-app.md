# 0003: Make the phone layout feel like a native app

**Status:** Accepted (the owner approved the design on 2026-11-05)

## Context

ADR 0001 task 11 restyled the app with Tailwind, keeping the same screens and their layout. Reviewing the screenshots on 2026-11-05, the owner found that on phones it still looks like a shrunken website:

- The burger menu repeats the pages that the bottom tab bar already has, and slides in from the side.
- Filters and four export or history buttons fill the first screen of the check-ins page before any check-in shows.
- The home screen is only the round button on navy, and tells the worker nothing about their day.

Most workers clock in from their phones, so this is the app they actually use. ADR 0001 left "a redesign beyond small visual changes" out of scope. This ADR widens that for phones only (below 700px). The desktop layout stays as task 11 built it.

The API stays as it is:

- `GET /checkins/status` returns the status and today's latest check-in id, and `GET /checkins/{id}` returns that check-in's times.
- `GET /checkins` filters by date, status and (for admins only) user.
- Login returns the user's id, name, email and weekly contract hours.

## Decision

On phones, follow Apple's Human Interface Guidelines (the owner's choice, 2026-11-05). The owner reviewed rendered mockups through version 9 and called it "by far the best design". The layout also fits Material 3 on Android.

### Look
- **Light, Dark and System themes on phones,** chosen in the Me sheet. System is the default, and the choice is kept per device.
  - Tailwind's `dark:` variant follows a `dark` class on `<html>`. A tiny inline script in `index.html` sets it before first paint, from the saved choice and `prefers-color-scheme`.
  - Desktop stays light, so its screens need no dark styles.
- **The palette is inspired by Apple's system colours** rather than copied: Apple says not to hard-code them, since they change between releases.
  - Grouped grey backgrounds, white or dark-grey cards, hairline separators, green for "Open" and red for "Invalid".
  - The brand navy `#150958` is the accent in light mode, and a lighter violet `#8e83ff` in dark mode, so it stays readable on black.
  - Green text in light mode uses a darker green, because Apple's `#34C759` is too light to read on white.
- **Apple's type scale** from the HIG:
  - Large Title 34/41
  - Title 1 28/34
  - Headline and Body 17/22
  - Subhead 15/20
  - Footnote 13/18
  - Caption 11/13
  - Body text is 17px, and inputs are at least 16px so iOS doesn't zoom into them.
- **Sizes:**
  - from the HIG: tap targets of at least 44px
  - from UIKit's defaults (community-measured, not in the HIG text): 16px side margins, 44px list rows, 10px corners on grouped sections, a 36×5 grabber and 51×31 switches

### Installed app and status bar
- **The manifest already uses `display: "standalone"`.** That removes the browser bars and keeps the system status bar, as in native apps. Its `theme_color` becomes navy.
- **`viewport-fit=cover` and `env(safe-area-inset-*)`** let the tab bar reach the bottom edge, with room for the home indicator.
- **The status bar follows the theme,** light with dark icons or black with white icons, as in Apple's apps.
  - `theme-color` meta tags with `media` for light and dark, updated when the user picks a theme.
  - `apple-mobile-web-app-status-bar-style: default`.
  - Android documents this. On iPhone it isn't documented, so the owner's real-device check confirms it. If iOS ignores it, we fall back to the documented `black-translucent` mode, with a dark strip under the status bar on every screen.
- **Native touches** from Apple's and web.dev's guidance:
  - `overscroll-behavior-y: none` on the page
  - no tap highlight
  - `user-select: none` on the tab bar and buttons only
  - `touch-action: manipulation`
  - `format-detection: telephone=no`
  - a page title per screen

### Screens
- **Navigation:**
  - The bottom tab bar is the only navigation: Home, Check-ins, Users (admins only) and Me. The burger menu goes.
  - No screen shows the logo or app name at the top: native apps don't.
  - List pages start with a large title.
- **Home:**
  - **A greeting** ("Good morning, Walter") with the date, from the name saved at login.
  - **A warning card** when an earlier day has a check-in with no check-out ("Missing check-out on Fri 23 Oct (in at 09:00). Ask an admin to fix it."), found with `filter[status]=open`.
  - **A large live clock,** hidden on short screens (under 720px tall, such as the iPhone SE), where the status bar already shows the time.
  - **The round clock button,** text only. It scales with the screen height, up to 220px.
    - **Checkin:** white with a navy ring and navy text.
    - **Checkout:** navy with white text.
  - **One card** with today's status ("Clocked in since 09:05 · 55m so far today", or "Not clocked in today") and this week's hours against the contract ("16h 55m of 25h", with a bar).
- **Lists:**
  - **Rows, not a table.** Phones show check-ins as edge-to-edge rows: the date (or the employee for admins), the times, and the total, Open or Invalid on the right, with a chevron.
  - **Grouped by week.** Rows sit under week headers ("This week · 2–8 Nov"), each with the week's total against the contract hours. Admins see a total only when filtered to one employee.
  - **Loading more.** The phone list loads 50 rows at a time, with "Show more" at the end instead of a pager. A week's total shows once all its rows are loaded.
  - **The detail sheet.** Tapping a row slides up its times, source and change history. That replaces the History button on phones.
  - The users list uses the same rows, with a read-only detail sheet. Admin editing stays desktop-only.
- **Filters and Export:**
  - Two buttons under the title. Filters shows how many filters are on.
  - Filters slides up a sheet laid out like iOS Settings: grouped rows, switches and "Reset filters".
  - Export slides up the two CSV exports as rows.
- **Me sheet:**
  - initials, name and email
  - Appearance (Light, Dark, System)
  - Install app (when not installed)
  - Sign out
- **Install help** (moved here from ADR 0002 at the owner's request), hidden once the app runs installed:
  - **iPhone Safari:** an "Install Checkin" sheet over the sign-in screen with Apple's steps (··· → Share → Add to Home Screen → open it from the Home Screen). "Not now" is remembered on the device.
  - **Android:** an "Install app" row that opens Chrome's own install prompt.
- **Sheets:**
  - The existing native `<dialog>` becomes a bottom sheet on phones, with a grabber, Cancel on the left, the title, and Done on the right.
  - It closes on a swipe down, a tap on the backdrop, Escape or Done.
  - Swipe-down is a small pointer handler, not a package.
- **Saved at login:** the user's id, name, email and contract hours, next to the token. Phones logged in before this change get the greeting without a name and no weekly card until their next login.

## Alternatives

- **Keep task 11's layout and tighten spacing (the simplest option).** Rejected: the owner wants an app feel, and the repeated menu and crowded first screen are layout problems, not spacing.
- **A mobile UI package:**
  - **Konsta UI:** Tailwind-based, and works with Tailwind 4 since v5. Rejected: it's a second design system to keep consistent with the desktop.
  - **Ionic React and Framework7:** rejected, because they take over the app shell and routing.
  - **vaul (a bottom-sheet library):** its README says it's unmaintained.
  - **react-modal-sheet:** maintained, but it pulls in `motion`. Our `<dialog>` already gives focus trapping, Escape and the backdrop, so swipe-down is the only missing piece.
- **A navy Home with per-screen status-bar colours** (mockups versions 3 to 5). Replaced by the themes: iOS doesn't document per-screen colours.
- **A compact table on phones.** The owner first chose it, then chose Apple's guidance, which favours rows on a phone.
- **Dark mode on desktop too.** Not asked for, and it would double the styling of every desktop screen.
- **Ideas from other clock-in apps that need API changes:** workers requesting corrections (Woffu's model), undo after clocking, and location at clock-in. Left for their own ADRs.
- **A pager on phones.** Replaced by "Show more", which suits a scrolling list and keeps week groups whole.

## Consequences

- The phone and desktop layouts differ more: phones show rows, sheets and themes, desktop the table. Phone e2e tests run at a phone viewport, in both themes.
- Home makes up to three small requests: today's check-in, open check-ins, and this week's check-ins.
- The status-bar behaviour on iPhone needs a real-device check before release.
- ADR 0002 loses its install-help part. Its offline banner, update prompt, offline queue and push reminders stay.
- ADR 0001's task 12 review now covers this work too.
