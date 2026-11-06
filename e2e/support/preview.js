import { tmpdir } from "node:os";
import { join } from "node:path";

// A production build of the app, served by `vite preview`, for what only a build has: the manifest and the
// service worker. Preview reads files from disk on each request, so a test can change the built sw.js.
export const previewOrigin = "http://localhost:4173";
export const previewDir = join(tmpdir(), "checkin-e2e-preview");
