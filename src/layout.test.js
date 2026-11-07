import { describe, expect, test } from "vitest";
import { savedLayout } from "./layout";

describe("savedLayout", () => {
  // The unit tests run without a browser, so localStorage is missing, as when storage is blocked.
  test("falls back to the toolbar when storage can't be read", () => {
    expect(savedLayout()).toBe("toolbar");
  });
});
