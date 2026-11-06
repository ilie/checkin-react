# 0004: Turn reminders on by default

**Status:** Accepted (the owner asked for it on 2026-11-06). It changes how ADR 0002 turns push reminders on. Desktop asks too since ADR 0005.

## Context

ADR 0002 made clock-out reminders opt-in: a switch in the Me sheet asks for permission and subscribes. The owner wants them on for everyone, because a forgotten clock-out is what the reminders are for. Workers wouldn't look for the switch, and "Clock-out reminders" didn't say what it was.

Browsers don't let an app subscribe silently. It needs notification permission, and iOS and Chrome only show that prompt from a tap.

## Decision

- **On a phone, the first Checkin tap asks for permission and subscribes**, in the same tap that clocks in. If permission was already granted, it subscribes without a prompt. A refusal or a failure is left alone; the switch is still there.
- **The Me sheet's row is called "Notifications"**, with the footnote "Reminds you to clock out if you forget. On unless you turn it off."
- **Turning it off is remembered** on the device, so clocking in doesn't turn it back on. Signing out forgets that choice, as it does the subscription, because phones are shared.
- **Desktop doesn't ask.** It has no Me sheet to turn reminders off, and staff clock in with their phones.
- **iPhone Safari outside the installed app doesn't ask either**, because it has no push. The row there still shows how to install.

## Alternatives

- **Keep the switch off until turned on (ADR 0002).** The simplest, but most workers would never get reminders.
- **Ask when the app first opens.** Browsers block or quieten a prompt that doesn't come from a tap, and iOS doesn't allow it at all.
- **A card on Home that asks to turn reminders on.** It's one more tap and more UI, for the same prompt.

## Consequences

- A worker's first clock-in on a phone shows the system's permission prompt over the app.
- Every clock-in on a phone with reminders on posts the subscription again. That's one small, idempotent request (the API keeps one row per endpoint), and it repairs a subscription the API lost.
- The privacy notice should say that reminders are on unless turned off (API ADR 0004).
