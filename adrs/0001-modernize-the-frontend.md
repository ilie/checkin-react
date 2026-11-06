# 0001: Modernize the frontend

**Status:** Accepted

## Context

The check-in PWA was built with Create React App 5, which is deprecated and no longer maintained. The stack around it has aged too:

- `react-toastify` for notifications
- hand-written `useEffect` + `useState` data fetching on every page
- Formik + Yup for 5 forms
- `react-datepicker` and `react-time-picker` for fields browsers now support natively
- `jsonapi-fractal` just to flatten API responses
- eleven `workbox-*` packages for the service worker, wired up by CRA
- 21 hand-written CSS files
- `web-vitals` and Testing Library installed but unused

The app has no tests.

The owner's other React app, `my-vlec`, already runs a modern stack: React 19, React Router 7, Vite, TanStack Query and Table, React Hook Form with zod, Sonner, and Tailwind 4. Using the same stack here means one way of working across both apps.

The app must stay an installable PWA. The API lives in a separate repo (`Laravel/checkin api`, see its ADRs 0001 and 0002) and doesn't change, apart from a seeder for the end-to-end tests.

## Decision

- **Build:** move from CRA to **Vite** with **vite-plugin-pwa**, using `injectManifest` with our own `src/sw.js`, because ADR 0002 adds push and an offline queue to it. Keep the existing manifest and icons until ADR 0002 replaces them. Keep the build output in `build/`, so deployment doesn't change.
- **Runtime:** upgrade to **React 19** and **React Router 7**, keeping the existing routes.
- **Server state:** **TanStack Query** for every API read and write. Refetching when the window regains focus keeps the clock-in button right when a worker switches devices. That covers the "other device" case without Reverb.
- **Tables:** **TanStack Table** for the check-ins and users tables. Pagination and sorting stay on the server.
- **Forms:** **React Hook Form** with **zod** schemas (`@hookform/resolvers`), instead of Formik + Yup. Native `date` and `time` inputs replace the two picker libraries.
- **Notifications:** **Sonner** instead of `react-toastify`.
- **Styling:**
  - **Tailwind 4** replaces the CSS files, with a light UI refresh: the same screens, layout and brand colour (`#150958`), just tidier spacing, buttons, inputs and tables.
  - Modals use the native `<dialog>` element.
  - No new screens.
- **JSON:API responses:** a small local `deserialize` helper replaces `jsonapi-fractal`.
- **Linting:** **Oxlint** with the **anti-slop** plugin (from the `install-anti-slop` skill) and Oxlint's built-in React, React Hooks and accessibility rules replace CRA's ESLint config. No TypeScript: the plugin's type-based rules stay inert, and its JavaScript rules apply.
- **Removed:** `web-vitals`, the unused Testing Library packages and the CRA service-worker files.
- **PWA features** (install help, update prompt, offline queue, push reminders, badge) are decided in ADR 0002.
- **Tests:**
  - **Playwright** end-to-end tests run against a local API seeded with test data. They're written first, against today's behaviour, and locate elements by role, label and text, so they survive the restyle and give every later step a safety net.
  - **Vitest** unit tests cover the pure helpers and the zod schemas.

## Alternatives

- **Only swap libraries and stay on CRA.** Less work now, but CRA gets no updates, and the eleven workbox packages stay. Rejected.
- **Keep plain tables and CSS modules.** Fewer dependencies, but this app would then work differently from `my-vlec`. The owner prefers the same stack.
- **Inertia, merging into the Laravel repo.** Deferred earlier: it's a rewrite and makes the PWA harder.
- **Reverb for live updates across devices.** Deferred. Refetching on focus is enough for now.

## Consequences

- Almost every frontend file changes. JSX files get the `.jsx` extension that Vite expects.
- `REACT_APP_API_URL` becomes `VITE_API_URL`.
- The UI looks a little different, but works the same.
- The end-to-end tests need the API repo next to this one, with PHP. They create a throwaway SQLite database and never touch production.
- Runtime dependencies go from 26 to 11: react, react-dom, react-router-dom, react-icons, axios, @tanstack/react-query, @tanstack/react-table, react-hook-form, zod, @hookform/resolvers and sonner.
- The service worker still imports a few Workbox modules (precaching, routing, strategies, expiration), which vite-plugin-pwa bundles into it, plus `workbox-window` for registration.
