# 0006: Make the desktop layout feel like a Mac app

**Status:** Accepted (the owner approved it by merging on 2026-11-07)

## Context

ADR 0003 gave phones an app-like layout and left desktop as ADR 0001 task 11 built it:

- a navy header with text links, a bell and a power button
- Home as only the round button on navy
- light theme only

On 2026-11-07 the owner asked for the phone's Home features on desktop, adapted to a desktop app:

- the greeting
- the clock
- the last check-out
- this week's hours

Like the phone work, this follows Apple's guidelines, here for macOS. The research is in `adrs/assets/0006/apple-macos-notes.md`. The owner chose from the mockups in `adrs/assets/0006/` (also at https://claude.ai/artifact/5EcciZQc7DooCnAh4nLfVy).

The API stays as it is. Home on phones already loads everything the desktop needs:

- the status
- open check-ins from earlier days
- this week's check-ins

## Decision

From 700px up (the existing `md` breakpoint):

### Frame (mockup B1, the owner's choice)
- **A light toolbar replaces the navy header** on every signed-in page.
  - It is 52px tall and translucent with a blur. Glass is used only here, as Apple advises.
  - The logo is on the left.
  - Home, Check-ins and Users (admins only) are centred tabs with icons. They are tabs, not a segmented control.
  - The bell (ADR 0005) and the user's initials are on the right.
- **The initials open the Me sheet as a centred dialog,** the same one phones use:
  - Appearance
  - Reminders
  - Install app (when offered)
  - Sign out
- The power button goes. Sign out lives in Me, as on phones.

### Layout choice (the owner's idea, 2026-11-07)
- **Me offers a Layout choice on desktop:** Toolbar (the default) or Sidebar.
  - It is kept per device, like Appearance.
  - Phones don't show it: they always have the tab bar.
- **The Sidebar is mockup A1:**
  - a floating glass panel down the left, with the logo and the same pages as rows, with accent icons
  - the signed-in user at the bottom, which opens Me, beside the bell
- There's no separate hide button, as Apple suggests for sidebars. Switching to the toolbar does that.

### Themes (the owner's choice)
- **Light, Dark and System on desktop too,** with System as the default, chosen in Me. ADR 0003's light-only rule for desktop goes.
- **Dark on desktop uses macOS-style greys** (bg `#161618`, cards `#242426`) instead of the phone's black. Light uses the phone's palette.
- The `theme-color` metas follow the theme instead of the fixed navy.

### Home (mockups B1, A2 and A3)
- **The greeting** ("Good morning, Walter") as a 26px Large Title, with the date under it.
- **The missing check-out warning** under the greeting, worded as on the phone.
- **Two cards side by side:**
  - **Today:**
    - the live clock
    - the round button in the phone's style: white with a navy ring for Checkin, navy for Checkout, with a still halo instead of the navy page's pulse
    - the status line ("Clocked in since 09:05 · 55m so far today", or "Not clocked in today · Last check-out Tue 3 Nov at 15:30")
    - In, Out and Worked for today, when there's a check-in today
  - **This week:**
    - the total against the contract hours, with the time left and a bar ("16h 55m of 25h · 8h 05m left")
    - a Monday-to-Sunday bar chart from zero, with ticks at 0, 4 and 8h and today's open check-in striped
    - the week's check-ins as rows with their times and totals, which are also the chart's text equivalent

### Check-ins, Users and sign-in (light polish, the owner's choice)
- They keep their structure: the toolbar of actions, the filters, the table and the pager.
- They take the macOS type scale (Large Title 26, body 13), the shared colour tokens, and white or dark-grey cards on the grouped background.
- They work in both themes.
- The table header loses its navy fill and becomes a quiet header row.

## Alternatives

- **Keep the navy header and change only Home's content (the simplest option).** The owner chose the toolbar instead.
- **A floating glass sidebar like macOS 26 Mail (mockups A1 to A3) as the only layout.** It was recommended, as the most Mac-like option. The owner chose the toolbar as the default, then asked for the sidebar as an option in Me.
- **A segmented control for the main navigation.** Apple advises against it for switching between main views.
- **Dark mode later, in its own ADR.** The owner chose to do it now. Doing it now also avoids restyling every desktop screen twice.
- **The system font (SF Pro) on desktop.** Rejected: the app keeps Open Sans on phones and desktop, which is the brand face.
- **A full redesign of the tables, filters and dialogs.** Not asked for; the light polish is enough.

## Consequences

- Every desktop screen gets dark styles, so about 20 components swap fixed colours for the theme tokens. This is the bulk of the work.
- Desktop Home makes the same three requests as the phone instead of one.
- There are two desktop frames to keep working. They share the tabs, the bell and one Me sheet, which App owns so it stays open while the layout switches.
- Desktop body text goes from 15px to Apple's 13px. Open Sans reads larger than SF at the same size, and the mockups were checked at that size.
- Phones don't change. The phone e2e tests and screenshots guard that.
- The desktop e2e tests that rely on the Logout button, the navy header or a light-only desktop change.
