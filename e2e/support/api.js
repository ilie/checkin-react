import { copyFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

// The API repo sits next to this one. Override with E2E_API_PATH if it lives elsewhere.
export const apiPath = resolve(process.env.E2E_API_PATH ?? join(import.meta.dirname, "../../../../Laravel/checkin api"));

// Not 8000, which `php artisan serve` in any other project takes first.
export const apiOrigin = "http://127.0.0.1:8017";
export const apiUrl = `${apiOrigin}/api`;

// A working Wednesday. The API and the browser both treat it as "today".
export const today = "2026-11-04";
export const now = `${today}T10:00:00+01:00`;

// Every path lives in one throwaway folder, shared by the setup and the tests through env.
export const workDir = process.env.E2E_WORK_DIR ?? join(tmpdir(), "checkin-e2e");
export const databaseFile = join(workDir, "checkin.sqlite");
export const snapshotFile = join(workDir, "snapshot.sqlite");
export const nowFile = join(workDir, "now.txt");

export const apiEnv = {
  APP_ENV: "local",
  APP_DEBUG: "true",
  // A throwaway key for the local test API only.
  APP_KEY: "base64:5mUDMh8n0d7YJb3cKQ0tH0bYV7bS2m7m6F0QX9y1u3E=",
  APP_URL: apiOrigin,
  APP_TIMEZONE: "Europe/Madrid",
  DB_CONNECTION: "sqlite",
  DB_DATABASE: databaseFile,
  CACHE_DRIVER: "array",
  CACHE_STORE: "array",
  SESSION_DRIVER: "array",
  QUEUE_CONNECTION: "sync",
  MAIL_MAILER: "log",
  LOG_CHANNEL: "stderr",
  E2E_TODAY: today,
  E2E_NOW_FILE: nowFile,
};

// Puts the seeded data back and the API clock on "today", so each test starts from the same state.
export function resetApi() {
  copyFileSync(snapshotFile, databaseFile);
  pinApiClock(now);
}

export function pinApiClock(dateTime) {
  writeFileSync(nowFile, dateTime);
}

export function removeWorkDir() {
  rmSync(workDir, { recursive: true, force: true });
}
