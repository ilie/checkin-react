# Plan for 0001: Modernize the frontend

**Status:** Done

## Goal

- The app builds and runs with Vite on React 19 and React Router 7, and is still an installable PWA that loads offline from cache.
- Every screen works as before. The Playwright suite proves it, and it was written against the current app before the refactor started.
- The app uses:
  - TanStack Query for API calls
  - TanStack Table for the tables
  - React Hook Form + zod for forms
  - Sonner for notifications
  - Tailwind 4 for styling, with a light refresh of the same screens
- `npm run lint` (Oxlint with the anti-slop plugin) passes with zero warnings.
- No Formik, Yup, date/time picker libraries, `jsonapi-fractal`, `web-vitals`, CRA or CSS files remain. The only Workbox packages left are the ones `src/sw.js` imports.

**Out of scope:**

- TypeScript
- New screens or a redesign beyond small visual changes
- Merging into the API repo
- Reverb
- Sending the location at clock-in (API ADR 0002)
- The PWA features in frontend ADR 0002, which has its own plan

## Conventions

Load the skills in `.claude/skills/` that apply to each task. They were copied from `my-vlec`, along with `spatie-javascript`.

| Skill | Applies to |
|---|---|
| `spatie-javascript` | all JS: `const`, `===`, named `function` declarations, destructuring |
| `modern-best-practice-react-components` | every component: avoid unnecessary state and `useEffect` |
| `tanstack-query` | task 8 |
| `tanstack-table` | task 10 |
| `modern-tailwind` | task 11 |
| `modern-accessible-html-jsx` | forms, tables, dialogs and buttons: labels, roles, semantics |
| `modern-browser-apis` | native `<dialog>`, `date`/`time` inputs, `URL`/`Blob` downloads |
| `web-security` | auth token handling, exports, nothing sensitive in logs |
| `install-anti-slop` (user-level) | task 2, then `npm run lint` passes in every later task |

- **Formatting:** keep the repo's current style (2 spaces, double quotes) in files that are only edited. Files that are rewritten anyway follow the same style, for consistency.
- **Git:**
  - First, squash-merge the unreleased branch `feature-checkin-filters-export` into local `main`.
  - Do this work on `feature-modernize-frontend`, squash-merge it locally, and push later together with the API.
- **Never call the production API.** Development and tests use `VITE_API_URL=http://localhost:8000/api`.

## Tasks

### 1. Move to Vite
- Add `vite`, `@vitejs/plugin-react` and `vite-plugin-pwa`. Remove `react-scripts`, every `workbox-*` package, `web-vitals`, the unused Testing Library packages, `src/reportWebVitals.js`, `src/service-worker.js` and `src/serviceWorkerRegistration.js`.
- Move `public/index.html` to the root, with a `<script type="module" src="/src/index.jsx">`. Rename JSX files from `.js` to `.jsx`.
- Configure `vite.config.js`:
  - dev server on port 3000
  - `build.outDir: "build"`
  - PWA `strategies: "injectManifest"` with `srcDir: "src"`, `filename: "sw.js"` and `registerType: "prompt"`, using the existing `public/manifest.json` and icons
  - `src/sw.js` keeps today's behaviour:
    - `cleanupOutdatedCaches()` + `precacheAndRoute(self.__WB_MANIFEST)`
    - navigations go to `index.html`
    - the `images` cache (StaleWhileRevalidate, 50 entries)
    - the `SKIP_WAITING` message listener
  - Register it with `registerSW` from `virtual:pwa-register` in `src/index.jsx`. ADR 0002 task 2 replaces that with an update prompt.
- Rename `REACT_APP_API_URL` to `VITE_API_URL` (`import.meta.env`) in `.env.development`, `.env.production` and `src/helpers/api.js`.
- Scripts: `dev`, `build`, `preview`, `test`, `e2e`, `lint`.
- **Verify:**
  - `npm run build` succeeds.
  - `npm run preview`: the app loads, the service worker registers, and after going offline a reload still shows the app shell (checked in the browser).
- **Done:** yes
  - Vite 8.3.5, @vitejs/plugin-react 6.1.2, vite-plugin-pwa 2.0.0, Workbox 7.4.1, each pinned to its newest release at least two weeks old.
  - The Workbox modules are dev dependencies, because they're bundled into `build/sw.js`.
  - The build passes. In headless Chrome on `npm run preview`:
    - the service worker registers and the manifest is served
    - offline, `/login`, `/` and `/checkins` all render from cache
    - no page errors and no requests to production
  - `npm run dev` on port 3000 calls only `http://localhost:8000/api`.
  - **Deviations:**
    - The `test`, `e2e` and `lint` scripts are added by the tasks that install their tools (2–4), so no script points at a missing binary.
    - CRA's `browserslist` was removed, because Vite doesn't read it.
  - Remaining build warnings: one bundle over 500 kB (as with CRA, shrinks as dependencies go), and a deprecation notice from inside vite-plugin-pwa.

### 2. Oxlint with the anti-slop plugin
- Follow the user-level `install-anti-slop` skill:
  - Copy the plugin to `tools/oxlint/anti-slop/` with its install script.
  - Install the current matching `oxlint` and `@oxlint/plugins` as dev dependencies.
  - In `.oxlintrc.json`, register the plugin, ignore `.claude/**`, `.agents/**` and the plugin folder, and enable every generic rule at `error`.
- Enable Oxlint's built-in `react`, `react-hooks` and `jsx-a11y` plugins, and remove CRA's `eslintConfig` from `package.json`.
- Add a `lint` script, `oxlint --max-warnings 0`, and run it in every later task.
- In plain JS, the type-based rules never trigger. The ones that apply:
  - no module mocking in Vitest
  - no runtime `typeof`
  - no conditional empty-object spreads
  - no "shape" in names
  - no `Reflect.apply`/`Reflect.get`
- Fix the findings in today's code without suppressing rules or lowering severities.
- **Verify:** `npm run lint` passes with zero warnings, and `npm run build` still succeeds.
- **Done:** yes
  - oxlint and @oxlint/plugins 1.89.0, the newest release at least two weeks old.
  - The plugins are `oxc`, `unicorn`, `react` (including `rules-of-hooks` and `exhaustive-deps`) and `jsx-a11y`, with the correctness category at `error`.
  - Fixed 25 findings, with no suppressions:
    - Clickable `span`/`div`/`li`/`img` elements in Pagination, Burger and Nav became real buttons (with `aria-label`/`aria-expanded` on the menu), behind a small `.button-reset` class.
    - Unused parameters were removed.
    - yup's `.object().shape()` became `.object()`.
    - The `typeof` check in `formatTimeToSQL` went: its input is always a string or null.
  - **Bugs found and fixed on the way:**
    - **iPhone clock-in error:** `navigator.vibrate(200)` threw on iOS, which has no Vibration API. Every successful clock-in on an iPhone showed an error toast. It's now `navigator.vibrate?.(200)`.
    - **Unique-email check:** it read the token once, when the module loaded (before login), and never rejected. It now reads the token on each check, as an async function.
  - Checked in Chrome with an iPhone profile and a mocked API:
    - clocking in without `navigator.vibrate` shows no error, and the button turns to Checkout
    - the menu button toggles `aria-expanded`
    - Sign Out and Logout are found by role
    - no page errors

### 3. Playwright end-to-end suite against the current app
- In the API repo, add `database/seeders/E2eSeeder.php` with the test users and check-ins used so far: open, invalid, manual, edited and deleted rows, and two workers.
- In this repo, add `e2e/` with `@playwright/test`:
  - A global setup script creates a throwaway SQLite database in a temporary folder, runs `migrate:fresh --seed --seeder=E2eSeeder` in `../../Laravel/checkin api`, and starts `php -S` on port 8000.
  - Playwright's `webServer` starts `npm run dev`.
- Locate elements by role, label and visible text (`getByRole`, `getByLabel`), never by CSS class, so the tests survive tasks 10 and 11. Add missing labels where the current markup lacks them.
- Tests:
  - login and logout
  - clock in and out, and the national-holiday error
  - each filter, and combinations
  - both CSV exports, including the file name and contents
  - history
  - add, edit and delete need a reason
  - deleted rows are locked
  - the worker sees only their own data and no admin controls
  - users page: add and edit, with no social security number
  - a mobile viewport has no sideways scroll
  - no request ever goes to the production host
- **Verify:** `npm run e2e` passes on the app as it is after tasks 1 and 2.
- **Done:** yes
  - **22 tests pass in about 40 seconds**, against the API on Laravel 13.40.
  - Each new test was checked to fail when its bug is put back.
  - **Deviations:**
    - **Test data stays in this repo** (the owner's choice, 2026-11-05), so the API repo isn't touched while it's being upgraded:
      - `e2e/api/seed.php` boots the API next door and seeds it through its own models, so the change log is real.
      - `e2e/api/router.php` serves the API through `php -S` and can pin its clock.
      - Set `E2E_API_PATH` if the API lives elsewhere.
    - **The API and the browser are both pinned** to Wednesday 4 November 2026, 10:00, so results don't depend on the run date. The national-holiday test pins the API to 25 December.
    - Each test restores a database snapshot.
    - **Native date and time inputs came early, at the owner's request.** `react-datepicker` and `react-time-picker` don't load under Vite: their CommonJS/UMD builds arrive as module objects, which broke the New and Edit check-in forms since task 1. They're replaced with `<input type="date">` and `<input type="time" step="1">`, and both packages are removed. `formatDateToSQL` went with them.
  - **Bugs found and fixed:**
    - **The admin flag was read back wrongly.** The stored `"0"` became `true` on reload, so a worker who reloaded saw the Users link and the admin buttons. It now compares against `"1"`, which keeps the values already stored on phones.
    - The iPhone clock-in fix from task 2 is now covered by a test with no Vibration API.
  - **Accessibility fixes the tests needed:**
    - labels for the check-in form's user, date and time fields
    - a name for the rows-per-page select
    - `aria-label`s on the check-ins and users tables
    - "Selet a user" fixed to "Select a user"

### 4. Vitest unit tests for the helpers
- Add `vitest`.
- Test `filtersToQuery`, `apiErrorMessage` and the date and time formatters in `src/helpers/formatters.js`. Later tasks add tests for `deserialize` (task 7) and the zod schemas (task 9).
- **Verify:** `npm test` passes.
- **Done:** yes
  - **25 tests pass in under a second** with Vitest 5.1. They live next to the code as `src/**/*.test.js`, so Vitest leaves the Playwright specs in `e2e/` alone.
  - A bug put back in each helper makes its test fail.
  - **Tests run in the `Europe/Madrid` time zone** (`test.env` in `vite.config.js`). `formatDateToES` reads `"2026-11-04"` as midnight UTC, so west of UTC it shows the day before. Staff are in Spain, so the app is right today, but without the pin the tests would depend on the machine.

### 5. React 19 and React Router 7
- Upgrade `react` and `react-dom` to 19, and `react-router-dom` to 7, keeping the current `<BrowserRouter>` and `<Routes>` setup. Fix anything React 19 removed, such as `defaultProps` and string refs, if used.
- **Verify:** `npm run e2e` and `npm run build`.
- **Done:** yes, together with task 6
  - React 19.3 and React Router 7.18 (8 is out, but the plan says 7). Nothing used an API React 19 removed.
  - `react-toastify` 9 doesn't render under React 19, so 5 tests failed until task 6 replaced it. Both tasks are in one commit.
  - The e2e setup now refuses to run if the API has a cached config: Laravel would ignore the test env, and `migrate:fresh` would wipe the API's own database.

### 6. Sonner instead of react-toastify
- Add one `<Toaster />` at the app root and replace `toast.*` calls in the 6 files. Remove `react-toastify`, its CSS import and the per-page `<ToastContainer>`s.
- **Verify:** `npm run e2e`. The suite checks success and error messages.
- **Done:** yes
  - One `<Toaster>` in `App.jsx`, below the fixed header. Toasts that stayed open (`autoClose: false`) use `duration: Infinity`.
  - Sonner toasts aren't `role="alert"`, so `e2e/support/test.js` finds them with `toasts(page)`, the items of its "Notifications" region.
  - The iPhone test counts toasts once, after the clock-out. Sonner adds a toast a moment after the request settles, and a retrying `toHaveCount(0)` only waits for it to expire. Checked: it fails 3 of 3 runs with the bug put back.

### 7. Local JSON:API helper instead of jsonapi-fractal
- Add `src/helpers/jsonApi.js`, exporting `deserialize(document)`. It flattens `{ id, attributes }` for a single resource or a list. Use it in the 3 files that import `jsonapi-fractal`, then remove the package.
- **Verify:** Vitest tests for a single resource and a list, then `npm run e2e`.
- **Done:** yes
  - The API sends no relationships or `included`, so `deserialize` only flattens `{ id, attributes }`.
  - **Deviation:** `LoginForm` doesn't use it. Login returns a bare resource with no `data` wrapper, and `deserialize(res)` only worked because the axios response has a `.data`. It now reads `res.data.attributes`.

### 8. TanStack Query for server state
- Add `@tanstack/react-query` and a `QueryClientProvider` in `src/index.jsx`.
- Add hooks in `src/hooks/`:
  - `useCheckins(filters, page, pageSize, sort)`
  - `useUsers()`
  - `useCheckinStatus()`, with refetch on window focus
  - `useCheckinHistory(id)`
  - mutations for clock in/out, add, edit and delete check-ins, and add, edit and delete users
  - Each mutation invalidates the queries it affects.
- Replace the `useEffect`/`useState` fetching in `Checkins`, `Users` and `Checkin`. On 401, clear the login data in one place: the query client's error handler.
- Keep `axios` as the HTTP client behind the hooks.
- The API now caps `page[size]` at 1000 (API ADR 0005), so `useUsers()` asks for `page[size]=1000` instead of 9999.
- **Verify:**
  - `npm run e2e`.
  - Extra end-to-end test: clock in on one page, switch focus to a second page for the same user, and its button changes to "Checkout" without a reload.
- **Done:** yes
  - **24 e2e tests pass.** The new ones:
    - the second-page focus test, which fires `visibilitychange` itself because headless Chrome doesn't on `bringToFront()`
    - an expired token going back to the login page
  - Both fail when what they cover is switched off (focus refetching, and the 401 handler).
  - The hooks live in `src/hooks/checkins.js` and `src/hooks/users.js`. The client is in `src/store/QueryProvider.jsx`, inside `AuthContextProvider` in `index.jsx`, because the 401 handler needs the auth context.
  - **One cache per login:** the provider is keyed by the token, so logging out or in starts a new cache. Nobody on a shared phone sees the previous person's data.
  - **Errors:**
    - The query client toasts every query error and clears the login on any 401.
    - Mutations toast where they're called, next to the success message.
    - A 403 on the admin-only user list drops a stale admin flag quietly, as before.
  - **Behaviour kept or fixed:**
    - Queries don't retry (`retry: false`), so errors show at once, as before.
    - The clock button stays on "Loading" until the status has refetched, so a double tap can't clock in twice.
    - Paging keeps the current rows on screen until the next page arrives.
    - The users page no longer fetches `GET /users/{id}` on every row click, since the list has every field.
    - Closing the user form set the selection to `false`, which left Delete and Modify enabled with no user selected. It's now `null`.

### 9. React Hook Form + zod; native date and time inputs
- Add `react-hook-form`, `zod` and `@hookform/resolvers`. Put the schemas in `src/schemas/` (login, forgot password, reset password, user, check-in), replacing `yupValidations.js`. The unique-email check stays async, through `refine`.
- Rewrite `LoginForm`, `ForgotPasswordForm`, `ResetPasswordForm`, `UserForm` and `CheckinForm` with `useForm` + `zodResolver`.
- (The native `date` and `time` inputs were already done in task 3.)
- Remove `formik` and `yup`.
- The unique-email check must URL-encode the email (`encodeURIComponent`): today a `+` in an address breaks the filter.
- Save must be enabled as soon as the form is valid. Today Formik only enables it once a field loses focus, so the first click on a disabled Save just blurs the field, and users have to click twice (found in task 3).
- Fix the existing bug found in task 1: `LoginForm` reads `error.response.data.error`, which throws when the API can't be reached, so the worker sees nothing. Use `apiErrorMessage`, and cover it in e2e with the API down.
- **Verify:**
  - Vitest tests for each schema: valid input passes, and each rule fails with its message.
  - `npm run e2e`: each form's validation messages and the disabled Save button.
- **Done:** yes
  - **67 unit tests** (39 for the schemas) **and 31 e2e tests pass.** The new e2e tests cover:
    - the messages and disabled Save on all five forms
    - Save working on the first click
    - a `+` email counting as taken
    - login with the API down
  - The `+` email and API-down tests each fail with their bug put back.
  - **Schemas:**
    - They live in `src/schemas/auth.js`, `user.js` and `checkin.js`.
    - `addUserSchema(isEmailTaken)` takes the email lookup as an argument. The form passes one that uses the logged-in axios instance; the tests pass a fake.
    - No check uses zod's `abort`: an aborted field stops object-level checks such as "Passwords do not match". The lookup skips malformed addresses itself.
  - **Rules aligned with the API:**
    - hours must be a whole number from 1 to 40
    - passwords are 8 to 16 characters
    - the check-in form needs a user, where it used to send `"0"`
    - The password message no longer asks for a special character, which was never checked.
  - **Forms:**
    - Errors show once a field is touched (`mode: "onTouched"`).
    - Save is enabled whenever the form is valid.
    - `UserOptions` and `CheckinOptions` render the form from the current selection, keyed per row, instead of keeping a form element in state, so `UserForm`'s `useEffect` is gone.
    - `SelectUser` is folded into `CheckinForm`.
    - The reset form's password labels pointed at the email field; they're fixed.
  - **`apiErrorMessage` also reads `{ error }`,** which is what a failed login returns ("Invalid credentials").

### 10. TanStack Table for the check-ins and users tables
- Add `@tanstack/react-table`.
- Rewrite `CheckinsTable` and `UsersTable` with `useReactTable`:
  - `manualPagination` and `manualSorting`, driven by the API's `page[...]` and `sort` parameters
  - sortable columns where the API allows sorting (API ADR 0005: `checkin_date` and `user_id` on check-ins, `name` on users; other fields return 400)
  - the Open, Invalid, Manual, Edited and Deleted markers as cell renderers
  - row selection for edit, delete and history
- Fold `Pagination` and `RecordsPerPage` into one table footer.
- **Verify:**
  - `npm run e2e`.
  - Extra end-to-end test: sorting by date reverses the order, and paging moves through all seeded rows.
- **Done:** yes
  - **34 e2e tests and 68 unit tests pass.** `e2e/tables.spec.js` covers:
    - sorting check-ins by date both ways
    - paging through all 17 seeded rows, 5 at a time
    - sorting users by name
  - The date-sort test fails when the hook ignores the sort.
  - **The table:**
    - `DataTable` holds the TanStack table and the footer: rows per page, page count, "Showing … of N entries" and the pager.
    - `CheckinsTable` and `UsersTable` only define columns. Their ids are the API's sort fields: `user_id` for the check-ins' Name column, plus `checkin_date`, and `name` for users.
    - The pages own the sort and paging state, because it builds the API query. Changing the sort goes back to page 1, and there's always a sort.
    - Row selection comes from the page's `selectedRow` (`rowSelection`). Rows can also be selected with Enter or Space, and show `aria-selected`.
  - **Visual details:**
    - Sortable headers are buttons, with `aria-sort`. The arrow is CSS `content` with empty alt text, so screen readers and tests read "Date", not "Date ▼".
    - The Admin column shows Yes/No instead of 1/0.
    - As before, the pager hides Previous or Next when there's nowhere to go.
  - **`toApiSort`** is in `src/helpers/api.js`, with a test.
  - **Lint:** `useReactTable` trips Oxlint's `react/incompatible-library`, which is about React Compiler memoization. The app doesn't use the compiler, so that one line has a scoped disable.
  - **Flaky API:** one e2e run got PHP error pages from the API repo while it was being edited in another session. A rerun passed.

### 11. Tailwind 4 and a light UI refresh
- Add `tailwindcss` and `@tailwindcss/vite`. Define the brand colour and fonts (Open Sans, already in `src/assets/fonts`) in `@theme`.
- Replace the 21 CSS files and CSS modules with utility classes. Turn `Modal` and `Backdrop` into a native `<dialog>` wrapper.
- **Visual changes only:**
  - consistent spacing
  - rounded inputs and buttons
  - clear focus rings
  - table rows with hover and selected states
  - the filter bar in a tidy grid
  - mobile layout kept
- **Verify:**
  - `npm run e2e`, including the mobile no-sideways-scroll test.
  - Screenshots of every screen on desktop and mobile, before and after, for the owner to approve.
- **Done:** yes. The owner approved the desktop look on 2026-11-05 and asked for an app-like phone layout, which ADR 0003 covers.
  - **Checks:** 34 e2e tests (including the mobile no-sideways-scroll test), 68 unit tests, lint and build all pass. No CSS file is left except `src/index.css`, the Tailwind entry.
  - **Theme (`@theme` in `src/index.css`):**
    - the brand navy `#150958` (plus a dark and a light shade)
    - Open Sans from `src/assets/fonts`
    - the clock button's ring animation
    - `md` set to 700px, the breakpoint the app always used for its phone layout
  - **Shared pieces in `src/components/UI/`:**
    - `Button`, with primary, secondary, plain and ghost styles
    - `Field`: a label, a control and its error, linked with `aria-describedby`
    - `Modal`: a native `<dialog>` mounted only while open. The browser traps focus and Escape closes it.
    - `Forms/DialogForm` frames the user and check-in forms. `Pages/auth/AuthLayout` frames the three signed-out screens.
    - `Card`, `Spinner` and `Backdrop` were unused or replaced, and are deleted.
  - **Icons:** Lucide (`lucide-react`) replaces `react-icons` and the logout image, at the owner's request (2026-11-05). New, Remove and Edit now have their own icons instead of three clocks. Lucide also draws the burger, the tab bar and the filter and pager buttons.
  - **Layout fixes:**
    - The phone tab bar is sticky instead of fixed, so it no longer covers the last table rows.
    - The header and tab bar only render when logged in; before, they sat hidden under the login screen.
  - **Labels:** the colons are gone ("Password", not "Password:"). The required `*` is `aria-hidden`, so accessible names stay clean. Tests that matched "Password:" now find the field by role and name.
  - **Pager:** "« Previous" and "Next »" are now "Previous" and "Next" with chevrons. As before, a button with nowhere to go is hidden.
  - **Screenshots:** the before/after comparison was written to the session scratchpad (`shots/compare.html`), with the throwaway spec that takes them next to it. They aren't committed.

### 12. Clean up and review
- Runs after the frontend ADR 0002 and 0003 plans, so the review covers all three.
- The JS bundle is one 585 KB file (180 KB gzipped) after task 11, so Vite warns about chunk size. Consider loading the Users and Checkins pages lazily if that matters on phones.
- Remove dependencies nothing imports any more, except command-line tools used by hand: keep `pwa-asset-generator`, which generates the icons and iOS splash images. Update the README (setup, env, scripts, tests), and do a final `npm run build`.
- Get an independent review of the diff, then squash-merge into local `main`.
- **Verify:** `npm run lint`, `npm test`, `npm run e2e` and `npm run build` all pass. `package.json` lists only packages that are actually used.
- **As built:**
  - **Dependencies:** every package in `package.json` is imported, or is a tool or peer that's needed. `workbox-build` and `workbox-window` are `vite-plugin-pwa`'s required peers, and `pwa-asset-generator` stays. The unused `src/helpers/axios.js` went in the simplification pass.
  - **Lazy loading:** not done. The bundle is 623 KB (193 KB gzipped), but the service worker precaches the whole app on the first visit anyway, so splitting it would add code for little gain.
  - **Simplification:** the owner asked for a code-simplifier pass over the whole branch first (`cc8797d`), which changed no behaviour.
  - **Review:** two independent reviewers, one for the app code against the API's contract and one for the PWA, offline and push. They found:
    - Phones that installed the Create React App build would have stayed on it, because its worker at `/service-worker.js` serves the old app and never registers `/sw.js`. `public/service-worker.js` now retires it, and `e2e/update.spec.js` reproduces the handover. Keep the file for a few months.
    - Sign out did nothing offline. It now always ends the session on the phone.
    - Edit and Delete could act on a selected row after paging away from it. Paging and sorting now clear the selection, and deleting a user asks first.
    - Smaller fixes:
      - the export's blob URL outlives Safari's download;
      - a tap queued without an answer is retried every 30 seconds;
      - the remembered status also covers a connection that says it's online but carries nothing;
      - a failed subscription post keeps a subscription that already worked.
  - **Also found while testing ADR 0004:** Home went blank when the status arrived before the week's rows after a clock-out (`2f43b7a`).
  - **Left for later, both already on `main`:**
    - admin forms close before the API answers, so a rejected correction loses what was typed;
    - `helpers/formatters.js` repeats what `helpers/time.js` and `checkinResult` do.
  - Lint, 92 unit tests, the build and 83 e2e tests pass.
- **Done:** yes, 2026-11-06

## Open questions

None.
