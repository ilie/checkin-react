# Plan for 0006: Make the desktop layout feel like a Mac app

**Status:** In progress

## Goal

- From 700px up, the app matches the mockups in `adrs/assets/0006/`:
  - B1 for the frame and Home
  - A2 for the warning and the clocked-out state
  - A3 for the dark colours
- It works in Light and Dark, at 1024×768 and 1280×800.
- Phones look exactly as they do now.
- `npm run lint`, `npm test`, `npm run e2e` and `npm run build` pass.
- The owner approves the desktop screenshots in both themes.

**Out of scope:**
- API changes
- a sidebar
- the system font
- restructuring the Check-ins or Users tables, filters or dialogs
- keyboard shortcuts

## Conventions

The same as ADR 0003's plan:
- the skills in `.claude/skills/`
- Tailwind utilities and the theme tokens in `src/index.css`, not fixed colours
- Lucide icons
- roles and labels in tests
- never the production API

The macOS sizes and their sources are in `adrs/assets/0006/apple-macos-notes.md`. Phone styles keep their `max-md:` classes, or no prefix where phones and desktop now share them. Each task re-runs the phone e2e tests to prove phones didn't change.

## Tasks

### 1. Themes and tokens on desktop
- In `src/theme.js` and the inline script in `index.html`:
  - drop the phone-only condition, so the `dark` class follows the saved choice on desktop too
  - the desktop `theme-color` follows the theme instead of navy
- In `src/index.css`:
  - Desktop dark greys go in a `md` media block that redefines `.dark`'s `--bg`, `--cell`, `--sep` and `--fill`: `#161618`, `#242426`, `#3a3a3c`, `#333336`.
  - Add the macOS type tokens: `--text-mac-large` 26/32, `--text-mac-title3` 15/20, `--text-mac-body` 13/16, `--text-mac-sub` 11/14.
  - `body` uses `bg-bg text-label` at every width, and `md:text-mac-body` instead of 15px.
- **Verify:**
  - `src/theme.test.js` is updated: dark applies on desktop, and both status-bar colours follow the theme.
  - In `e2e/theme.spec.js`, "on a desktop" now expects `<html>` to get `dark` with `colorScheme: "dark"`, and the matching `theme-color`.
- **Done:** yes. Desktop screens other than the toolbar and Home only look right in dark after task 4.

### 2. The toolbar
- `src/components/Header/Header.jsx` and `Nav.jsx` become the B1 toolbar:
  - sticky, 52px, `bg-cell/70 backdrop-blur-xl` with a hairline bottom border
  - the logo on the left; the blue logo in light, the white one in dark
  - centred tabs (House, Clock, Users icons) as `NavLink`s, marked by `aria-current`
  - on the right, the existing bell button and an initials button
- The initials button opens `MeSheet`, which is already centred on desktop by `Modal`. Footer and Header share the open state or each render their own; pick the smaller change.
- Remove the Power button. Sign out is in Me.
- The Toaster's desktop top offset matches the 52px bar.
- **Verify:**
  - `e2e/auth.spec.js` signs out through Me → Sign out.
  - `e2e/reminders.spec.js` still turns reminders off with the bell.
  - Its `adrs/assets/0005/desktop-bell.png` screenshot is retaken.
  - Tabs: admins see Users and workers don't. `e2e/tabs.spec.js` gets a desktop case if it has none.
  - The toolbar is reachable by keyboard, with visible focus.
- **Done:** no

### 3. Desktop Home
- **Data:** in `Home.jsx`, `useOwnCheckins` no longer waits for phones, so desktop loads the status, the missing check-outs and the week too.
- **Status logic:** move `todayStatus` and `lastCheckout` out of `TodayCard.jsx` into `src/components/Pages/Home/today.js`.
  - Add `todayTimes`: In, Out and Worked from today's latest check-in and today's total.
  - Add `dailySeconds(week, weekStartDate, now)` in `src/helpers/time.js`, giving seven totals from Monday to Sunday.
- **Shared on both sizes:** the greeting and the warning lose their `md:hidden`, with `md:text-mac-large` on the greeting.
- **Desktop layout** (`useIsPhone()` is false): a content column up to 1040px wide, holding two cards side by side.
  - **`ClockCard.jsx`:** the clock (64px light, tabular), `<Checkin />`, the status line with its dot, and the In, Out and Worked row.
  - **`WeekCard.jsx`:**
    - the "This week · 2–8 Nov" title (using `weekLabel`), the total against the contract with the time left, and the bar
    - the chart: seven bars on a zero baseline with ticks at 0, 4 and 8h. The scale grows in 4h steps above 8h. Today's open check-in is striped, and the bars are `aria-hidden`.
    - the week's check-ins as rows (date, times, total or Open), which give screen readers the values
  - Without contract hours, the card shows the total without "of" and without the bar, as on the phone.
- **The button** in `Checkin.jsx` loses its navy-page `md:` overrides and the pulsing ring. Desktop uses the phone's look at 200px.
- **Verify:**
  - Unit tests for `dailySeconds`, which counts an open check-in only today and drops invalid ones, and for `todayTimes`.
  - The existing `todayStatus` cases move with it.
  - `e2e/home.spec.js` gets a desktop case: the greeting, the warning for a worker with an old open day, the status line, "16h 55m of 25h", and a check-in that updates the card.
  - The clock e2e still passes on desktop.
- **Done:** no

### 4. Check-ins, Users and sign-in in both themes
- Swap the fixed colours (`gray-*`, `white`, `brand`) for the tokens in the files that use them:
  - `Button`, `Field`, `DataTable`, `CheckinsTable`, `CheckinFilters`, `CheckinHistory`, `DialogForm`
  - `AdminOptions`, `OfflineBanner`, `Modal`, `Checkins`, `Users`, `AuthLayout`, `AuthForm`, `ForgotPasswordForm`
- Page titles use `text-mac-large`.
- The table header is a quiet row: `text-label2`, with a separator instead of the navy fill.
- The action bar, filters, table and pager sit in `bg-cell` cards with 18px corners on the `bg-bg` page.
- The sign-in card uses `bg-cell`. The background image stays.
- **Verify:**
  - `grep` finds no `gray-`, `bg-white` or `brand` classes left in desktop styles. `brand` may stay in the logo files only.
  - The existing desktop e2e tests pass: tables, filters, corrections, exports, users, sheets.
  - The status pills (Open and Invalid) keep enough contrast in both themes.
- **Done:** no

### 5. Screenshots and the owner's review
- In `e2e/screenshots.spec.js`:
  - the desktop store screenshot is retaken, since the manifest's `desktop.png` shows the old navy look
  - add 1280×800 shots in light and dark of Home (Walter clocked in, and Olga with a missing check-out), Check-ins and Users
  - save them to `adrs/assets/0006/app-desktop-light.png` and `app-desktop-dark.png`, as contact sheets like ADR 0003's
- Update the `settle` comment, since nothing pulses any more.
- Set this ADR to Accepted once the owner approves.
- **Verify:**
  - The owner looks at the screenshots against the mockups.
  - A last full `npm run lint && npm test && npm run e2e && npm run build`.
- **Done:** no

## Open questions

None. The owner settled the frame, the themes and the scope on 2026-11-07.
