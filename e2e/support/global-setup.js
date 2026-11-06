import { execFileSync, spawn } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { apiEnv, apiOrigin, apiPath, databaseFile, removeWorkDir, resetApi, snapshotFile, workDir } from "./api.js";

// Builds a throwaway SQLite database from the API's migrations and the e2e seed, snapshots it,
// and serves the API on its own port. The production API is never involved.
export default async function globalSetup() {
  if (!existsSync(join(apiPath, "artisan"))) {
    throw new Error(`The API repo wasn't found at ${apiPath}. Set E2E_API_PATH.`);
  }
  // A cached config ignores the env below, so migrate:fresh would wipe the API's own database.
  if (existsSync(join(apiPath, "bootstrap/cache/config.php"))) {
    throw new Error("The API has a cached config. Run `php artisan config:clear` in the API repo first.");
  }

  // Otherwise the tests would quietly run against whatever already answers there.
  if (await answers(`${apiOrigin}/up`)) {
    throw new Error(`Something already listens on ${apiOrigin}. Stop it before running the e2e tests.`);
  }

  removeWorkDir();
  mkdirSync(workDir, { recursive: true });
  writeFileSync(databaseFile, "");

  const env = { ...process.env, ...apiEnv };
  execFileSync("php", ["artisan", "migrate:fresh", "--force"], { cwd: apiPath, env, stdio: "pipe" });
  execFileSync("php", [join(import.meta.dirname, "../api/seed.php"), apiPath], { cwd: apiPath, env, stdio: "pipe" });
  copyFileSync(databaseFile, snapshotFile);
  resetApi();

  const server = spawn("php", ["-S", new URL(apiOrigin).host, join(import.meta.dirname, "../api/router.php")], {
    cwd: join(apiPath, "public"),
    env,
    stdio: "ignore",
  });
  await waitForApi();

  return async function globalTeardown() {
    server.kill();
    removeWorkDir();
  };
}

async function waitForApi() {
  for (let attempt = 0; attempt < 50; attempt++) {
    if (await answers(`${apiOrigin}/up`)) return;
    await new Promise((done) => setTimeout(done, 200));
  }
  throw new Error(`The local API didn't start on ${apiOrigin}.`);
}

async function answers(url) {
  try {
    await fetch(url);
    return true;
  } catch {
    return false;
  }
}
