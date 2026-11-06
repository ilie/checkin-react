import { defineConfig, devices } from "@playwright/test";
import { loadEnv } from "vite";
import { apiUrl } from "./e2e/support/api.js";
import { previewDir, previewOrigin } from "./e2e/support/preview.js";

// Both servers call the local test API, and the production build gets the local test push key,
// since `npm run build` would otherwise read .env.production's.
const { VITE_VAPID_PUBLIC_KEY } = loadEnv("development", import.meta.dirname, "VITE_");
const env = { VITE_API_URL: apiUrl, VITE_VAPID_PUBLIC_KEY };

// One local API and one database are shared, so tests run one at a time.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: "list",
  // The store screenshots are taken on demand, with `npm run screenshots`.
  testIgnore: process.env.SCREENSHOTS ? [] : ["**/screenshots.spec.js"],
  globalSetup: "./e2e/support/global-setup.js",
  use: {
    baseURL: "http://localhost:3000",
    channel: "chrome",
    trace: "retain-on-failure",
  },
  projects: [{ name: "desktop", use: devices["Desktop Chrome"] }],
  webServer: [
    {
      command: "npm run dev -- --strictPort",
      url: "http://localhost:3000",
      reuseExistingServer: !process.env.CI,
      env,
    },
    {
      command: `npm run build -- --outDir "${previewDir}" --emptyOutDir && npm run preview -- --outDir "${previewDir}" --strictPort`,
      url: previewOrigin,
      reuseExistingServer: !process.env.CI,
      env,
    },
  ],
});
