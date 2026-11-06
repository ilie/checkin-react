# 0005: Reminders on desktop too

**Status:** Accepted (the owner asked for it on 2026-11-06). It replaces ADR 0004's "Desktop doesn't ask".

## Context

ADR 0004 turned reminders on with a phone's first clock-in and left desktop out, because desktop had no Me sheet to turn them off. The owner wants them on desktop too. Desktop browsers have push without installing the app.

## Decision

- **The first Checkin click on desktop asks for permission and subscribes**, as on a phone.
- **A bell in the desktop header, next to Logout, turns them off and on.** It's a toggle button (`aria-pressed`), crossed out when off, with a tooltip saying what it does. Off is remembered as on a phone.
- Both switches follow the device's subscription, so the bell turns on as soon as a clock-in subscribes.

![The desktop header with the bell on](assets/0005/desktop-bell.png)

## Alternatives

- **Keep desktop out (ADR 0004).** The owner wants the reminders there.
- **A settings page on desktop.** More UI for one switch.

## Consequences

- Desktop reminders arrive only while the browser is running.
- A shared office computer is covered like a shared phone: signing out deletes the subscription.
