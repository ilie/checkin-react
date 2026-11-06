import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.js",
      registerType: "prompt",
      injectRegister: false,
      // ADR 0002. The status bar's colour comes from the theme-color metas in index.html instead.
      manifest: {
        id: "/",
        name: "Checkin App",
        short_name: "Checkin",
        description: "Web app for check in and out of work",
        lang: "en",
        start_url: "/",
        scope: "/",
        display: "standalone",
        theme_color: "#150958",
        background_color: "#ffffff",
        launch_handler: { client_mode: ["focus-existing", "auto"] },
        icons: [
          { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "/icons/manifest-icon-192.maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "/icons/manifest-icon-512.maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        // Taken by e2e/screenshots.spec.js (npm run screenshots).
        screenshots: [
          { src: "/screenshots/home.png", sizes: "780x1688", type: "image/png", form_factor: "narrow", label: "Clock in and out with one tap" },
          { src: "/screenshots/checkins.png", sizes: "780x1688", type: "image/png", form_factor: "narrow", label: "Your check-ins, week by week" },
          { src: "/screenshots/desktop.png", sizes: "1280x800", type: "image/png", form_factor: "wide", label: "Every check-in for the admins" },
        ],
        // Long-press shortcuts, which only Android shows.
        shortcuts: [
          { name: "Clock in", url: "/", icons: [{ src: "/icon-96.png", sizes: "96x96", type: "image/png" }] },
          { name: "My check-ins", url: "/checkins", icons: [{ src: "/icon-96.png", sizes: "96x96", type: "image/png" }] },
        ],
      },
      injectManifest: {
        globPatterns: ["**/*.{js,css,html,svg,ttf,woff2}"],
      },
    }),
  ],
  server: { port: 3000 },
  build: { outDir: "build" },
  test: {
    // e2e/ holds the Playwright specs.
    include: ["src/**/*.test.{js,jsx}"],
    // Dates are formatted in the staff's time zone.
    env: { TZ: "Europe/Madrid" },
  },
});
