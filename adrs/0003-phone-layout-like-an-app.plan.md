# Plan for 0003: Make the phone layout feel like a native app

**Status:** Done (task 9's screenshots wait for the owner's look)

## Goal

- Below 700px, the app matches the version 9 mockups, in light and dark, on screens from 375×667 to 440×956.
- The desktop layout from ADR 0001 task 11 doesn't change.
- `npm run lint`, `npm test`, `npm run e2e` and `npm run build` pass.
- The owner approves viewport screenshots.

**Out of scope:**

- API changes
- gestures other than swipe-down on a sheet
- admin editing on phones
- dark mode on desktop
- the rest of ADR 0002: offline, updates, push

## Conventions

The same as ADR 0001's plan: the skills in `.claude/skills/`, Tailwind utilities, Lucide icons, roles and labels in tests, and never the production API.

The mockups (`adrs/assets/0003/mockups.html` and `mockups.png`, version 9; Apple's measurements in `apple-measurements.md`) are the visual reference.

## Tasks

### 1. Tokens, themes and the page frame
- In `src/index.css`:
  - `@custom-variant dark (&:where(.dark, .dark *))`
  - the light and dark palette as CSS variables, exposed through `@theme inline`
  - the type scale (34/41, 28/34, 17/22, 15/20, 13/18, 11/13)
- In `index.html`:
  - `viewport-fit=cover`
  - `theme-color` metas with `media` for light and dark
  - `apple-mobile-web-app-status-bar-style: default`
  - `format-detection: telephone=no`
  - a tiny inline script that sets the `dark` class before paint: from the saved choice or `prefers-color-scheme`, and only below 700px
- The manifest's `theme_color` becomes `#150958`.
- `src/theme.js`:
  - read and save the choice (`light`, `dark` or `system`), with `localStorage` wrapped in try/catch
  - apply the class and the `theme-color`
  - follow system changes while on `system`
- Native touches: `overscroll-behavior-y: none`, no tap highlight, `touch-action: manipulation`, and `user-select: none` on the tab bar and buttons.
- On phones the header bar goes. Pages set `document.title`.
- **Verify:**
  - Unit tests for the theme choice and class logic.
  - e2e at 390×844 with `colorScheme: "dark"`: `<html>` gets `dark`, and the `theme-color` meta matches.
- **Done:** yes
  - `src/theme.js` sets the two `theme-color` metas: Apple's grouped grey or black on phones (both alike for an explicit choice), and the navy of the header on desktop.
  - Page titles use React 19's `<title>`, as "Home · Checkin".
  - Phone e2e tests use `phone` from `e2e/support/test.js`: 390×844 with touch, in the configured Chrome and without an iPhone user agent, which would bring up the install help.
  - Before this task, the e2e API moved from port 8000 to 8017. Another project's `artisan serve` held 8000 and answered the health check. The setup now refuses a port that's already taken.

### 2. Bottom sheets
- `Modal` gets a `sheet` option for phones:
  - pinned to the bottom, with a grabber and a bar holding Cancel, the title and Done
  - it slides up with `@starting-style`, and not at all with reduced motion
  - it closes past a drag threshold, with a pointer handler on the grabber and bar
- It stays centred on desktop.
- **Verify:** e2e: a sheet opens, Done and the backdrop close it, and a simulated drag down closes it.
- **Done:** yes
  - `Modal` takes `sheet`, `cancelLabel` (a left button that calls `onClose`) and `onDone` (Done on the right). Its `label` is the bar's title.
  - Past a quarter of the sheet's height, a drag closes it; a shorter one springs back. Drags start only on phones and never on the bar's buttons.
  - The page behind an open dialog doesn't scroll (`html:has(dialog[open])`).
  - `src/hooks/useIsPhone.js` holds the phone media query, for `theme.js`, the drag and task 6's rows.
  - The e2e tests (`e2e/sheets.spec.js`) use task 3's Me sheet, the first sheet, so they came with task 3.

### 3. Tab bar, Me sheet and saved profile
- Remove `Burger.jsx`. On phones, `Footer.jsx` becomes the tab bar (Home, Check-ins, Users for admins, Me) with the sizes from the ADR.
- Save `id`, `name`, `email` and `hours_on_contract` at login in `auth-context.jsx`. Clear them on logout and on a 401.
- The Me sheet: initials, name and email, an Appearance segmented control (Light, Dark, System), Install app (task 4), and Sign out.
- **Verify:** e2e at 390×844:
  - the tabs a worker and an admin see
  - Me shows the name and email
  - switching to Dark sets the class and survives a reload
  - Sign out goes to the login page
- **Done:** yes
  - The profile is kept as `user` (`{ id, name, email, hoursOnContract }`) in `localStorage`, next to the token. `loginAs` in the e2e support saves it the same way.
  - The Appearance control is a radio group styled as segments. Me is a button in the tab bar, not a route.
  - The Install app row arrives with task 4.

### 4. Install help
- `src/pwa/useInstall.js`:
  - `isStandalone`, from `(display-mode: standalone)` or `navigator.standalone`
  - `isIosSafari`
  - the saved `beforeinstallprompt` event and an `install()` function
- **iPhone Safari, not installed:** the "Install Checkin" sheet over the sign-in screen, with "Not now" remembered.
- **Android:** the "Install app" row in the Me sheet calls `install()`.
- Nothing shows when the app runs standalone.
- Remove the install-help items from ADR 0002's plan, task 3.
- **Verify:** e2e:
  - an iPhone Safari user agent shows the sheet, and "Not now" survives a reload
  - a synthetic `beforeinstallprompt` shows the row, which calls `prompt()`
  - emulated standalone shows neither
- **Done:** yes
  - `useInstall()` returns the install `method`: `"prompt"` (Chrome's dialog), `"steps"` (iPhone Safari) or `null` (installed, or no way to install).
  - **A deviation:** on iPhone Safari, the Me sheet's "Install app" row also shows, and opens the steps on top of Me. A worker who is already signed in never sees the sign-in screen again, so without the row they'd never see the help.
  - Every way of closing the sign-in sheet (Not now, the backdrop, a drag, Escape) counts as Not now.
  - Sheets now open with the sheet itself focused, as on iOS. Before, `showModal()` put a focus ring on the first button, such as Not now.
  - The e2e tests fake an installed app with `navigator.standalone`, since Playwright can't emulate `display-mode`.

### 5. Home
- **The greeting** ("Good morning", "Good afternoon" or "Good evening", plus the first name) and the date.
- **The missing check-out card:**
  - Use `useCheckins` with `filter[status]=open` and a `to` of yesterday, plus `filter[user]=<own id>` for admins only, because workers can't send it.
  - Show the oldest one's date and time.
- **The live clock,** updated each minute and hidden under 720px of height.
- **The button,** sized `min(220px, 27dvh)`, with the colours from the ADR.
- **The status and week card:**
  - today's check-in from `useCheckin(id)`
  - this week's check-ins from Monday to today, summed against `hours_on_contract`
  - Put the duration and week maths in `src/helpers/`, with unit tests.
- **Verify:**
  - Unit tests for the durations, the week start (Monday) and the sums.
  - e2e with the pinned clock (Wednesday 4 November, 10:00):
    - Walter sees "Clocked in since 09:05", the week total, and the missing check-out from Fri 23 Oct
    - Olga sees "Not clocked in today" and no warning
  - Screenshots at 375×667 and 440×956 show nothing overlapping.
- **Done:** yes
  - **A deviation:** no `useCheckin(id)`. This week's check-ins, Monday to today, already include today's, so the card finds it by the status's `checkinId`. That's one request fewer: Home makes the status, open check-ins and week requests.
  - When today's check-in is complete, the card says "Clocked out at 13:00" with today's total. "Last check-out" comes from this week's rows and is left out on a Monday morning.
  - The phone-only queries are off on desktop, which shows none of it. They're also off for an admin signed in before the profile was saved, who has no id to filter by.
  - The e2e seed now fixes the contract hours (Walter 25h, Olga 30h, Ana 40h), which the factory made random.
  - The overlap check is an e2e test at both sizes, comparing the boxes of the warning, button, card and tab bar.
  - Helpers: `src/helpers/time.js`. The minute tick: `src/hooks/useNow.js`.

### 6. Lists, week groups and the detail sheet
- **Rows on phones.** Below 700px, `CheckinsTable` and `UsersTable` render rows instead of the table: each row a button, with the tags (Manual, Edited, Deleted).
- **"Show more".** On phones the check-ins list uses `useInfiniteQuery`: 50 rows a page, and "Show more" at the end.
- **Week groups.** Group rows by ISO week, Monday to Sunday. The header shows the date range and, for workers or an admin filtered to one employee, the total against the contract hours. A week cut off at the end of the loaded rows shows no total yet.
- **The detail sheet:**
  - check-ins: times, worked, source, and the change history from the existing query
  - users: read-only details
- **Verify:**
  - Unit tests for the week grouping and totals.
  - e2e at 390×844:
    - rows group into this week and last week, with the right totals
    - "Show more" loads the rest
    - a row's sheet shows its history
  - The existing no-sideways-scroll tests pass.
- **Done:** yes
  - The pages choose: below 700px `Checkins` renders `CheckinList` and `Users` renders `UserList` (`src/components/Lists/`), and the tables stay desktop-only. Each side's query is off on the other.
  - The users list loads every user at once through `useAllUsers` (the pickers' query, capped at 1000), so it needs no "Show more".
  - An earlier day's open check-in reads "09:00 – no check-out". Deleted check-ins are struck through and left out of week totals.
  - The history shows newest first, as "Changed by Ana Admin · 27 Oct 2026, 18:12 · Out 17:00 → 14:30", then the reason. Creations and deletions don't list every value.
  - The admin's per-employee totals use that employee's contract hours from the users list. Their filter arrives with task 7.
  - The "Show more" e2e test rewrites the request's page size from 50 to 4, so the nine seeded rows make three pages.

### 7. Filters and Export sheets
- On phones, `CheckinFilters` shows Filters (with a count) and Export under the title. Each opens a sheet laid out as in the mockups.
- The desktop bar doesn't change.
- **Verify:** e2e at 390×844:
  - a date range set in the sheet updates the count and the rows
  - Reset filters clears it
  - both exports download from the Export sheet
- **Done:** yes
  - The phone gets `CheckinToolbar` (two pill buttons and both sheets). `CheckinFilters` stays the desktop bar.
  - The Filters sheet edits a draft: Done applies it, while Cancel, the backdrop and a drag discard it. Reset filters clears the draft, and Done applies that.
  - The count treats a date range as one filter, as in the mockups ("Filters 2" for a range plus Edited only). Screen readers hear "Filters 2 on".
  - Admins also get Employee and Show deleted in the sheet.
  - **A refinement:** week totals hide while a status, source, edited or deleted filter is on. Otherwise "5h 30m of 25h" for the edited rows alone reads like missing hours.
  - The switch is a checkbox with `role="switch"`, in `src/components/UI/Grouped.jsx`.

### 8. Screenshots for approval
- Viewport screenshots of every phone screen and sheet:
  - in light and dark at 390×844
  - Home at 375×667 and 440×956
  - the desktop screens, to show they didn't change
- **Verify:** the owner approves.
- The status bar needs a real-iPhone check: the owner, as in ADR 0002 task 7.
- **Done:** yes. The owner approved the screenshots on 2026-11-05 and will check the status bar on a real iPhone after a deploy:
  - `adrs/assets/0003/app-light.png` and `app-dark.png`: Home clocked in and out, Check-ins, Filters, Export, the detail sheet, Me, the admin's list, Users and the install sheet, at 390×844
  - `app-sizes.png`: Home at 375×667 and 440×956
  - `app-desktop.png`: Home, Check-ins and Users at 1280×720, unchanged
  - The sign-in screen behind the install sheet was still task 11's design, light even in dark mode. The owner asked for the mockups' Apple-style "Sign in": task 9.

### 9. An Apple-style sign-in on phones
- Added at the owner's request on 2026-11-05, after task 8's screenshots.
- Below 700px, the signed-out screens (sign in, forgot password, reset password) follow the mockups' "install" frame:
  - a large title ("Sign in")
  - the fields as a grouped list of rows (label left, input right, inputs at least 16px)
  - the primary button and the link below
  - the themes, with no logo bar or background image
- Desktop keeps task 11's card on the background image.
- **Verify:**
  - The existing auth e2e tests pass (they run on desktop), plus a phone test that signs in and checks the reset and forgot-password forms still show their errors.
  - Screenshots in light and dark at 390×844, with the install sheet over the sign-in screen, for the owner.
- **As built:** `Field` takes `grouped`, which turns it into a row below 700px, with the error under the label and input; the label turns accent while its input has focus, since the input has no outline there. `AuthTitle`, `AuthFields` and `authButtonClasses` in `src/components/Forms/AuthForm.jsx` are shared by the three forms. Phones get short titles ("Sign in", "Forgot password", "Reset password"); desktop keeps the long ones. The background image is a CSS variable used only from `md`. The reset form's "Password Confirm" label became "Confirm" so it fits the row, and the email placeholders became `name@virginialyons.com`.
- **Screenshots:** `adrs/assets/0003/signin.png` (install sheet, sign-in, its errors, forgot and reset, light and dark; desktop below).
- **Done:** yes, 2026-11-05 (lint, 88 unit tests, the build and 65 e2e tests pass)

## Review

An independent agent reviewed `2760ebc..005390f` on 2026-11-05. Fixed:
- **A date filter that cuts a week** (From 29 Oct) showed "16h 00m of 25h" for a 37h 30m week. A week's total now shows only when the week lies inside the From and To dates.
- **Escape on the install sheet opened from Me closed both sheets.** React passes a nested dialog's `cancel` up through the outer `onCancel`, so `Modal` now ignores a cancel meant for another dialog.
- **A tap in a sheet's bottom safe-area padding closed it** like a backdrop tap, losing the filter draft. The padding moved onto the sheet's content.
- **The busy-port check had been pasted into the e2e teardown too.** Removed.
- **`tables.spec.js` paging could read the previous page's rows** (the pager label updates first). It now waits for the rows to change.
- **`useCheckinPages` lost its unused `enabled` argument.**

Kept: `aria-checked` on the switch, which the jsx-a11y lint rule requires.

## Open questions

None.
