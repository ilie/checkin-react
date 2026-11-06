import { describe, expect, test } from "vitest";
import { formatDateToES, formatTimeToSQL, getFormattedTimeDiff } from "./formatters";

describe("getFormattedTimeDiff", () => {
  test("formats the time worked as HH:mm:ss", () => {
    const start = new Date("2026-11-04T08:00:00");
    const end = new Date("2026-11-04T16:30:05");

    expect(getFormattedTimeDiff(start, end)).toBe("08:30:05");
  });

  test("says the check-in is incomplete when a time is missing", () => {
    const start = new Date("2026-11-04T08:00:00");
    const end = new Date("2026-11-04Tnull");

    expect(getFormattedTimeDiff(start, end)).toBe("Checkin Incomplete");
  });
});

describe("formatDateToES", () => {
  test("formats an API date as day/month/year", () => {
    expect(formatDateToES("2026-11-04")).toBe("04/11/2026");
  });

  test("keeps the first and last day of the month", () => {
    expect(formatDateToES("2026-03-01")).toBe("01/03/2026");
    expect(formatDateToES("2026-12-31")).toBe("31/12/2026");
  });
});

describe("formatTimeToSQL", () => {
  test.each([
    ["09:05", "09:05:00"],
    ["09:05:07", "09:05:07"],
    ["9:5", "09:05:00"],
    [" 23:59:59 ", "23:59:59"],
    ["00:00", "00:00:00"],
  ])("turns %j into %j", (input, expected) => {
    expect(formatTimeToSQL(input)).toBe(expected);
  });

  test.each([null, undefined, "", "   ", "09", "ab:cd", "24:00", "12:60", "12:00:60"])(
    "rejects %j",
    (input) => {
      expect(formatTimeToSQL(input)).toBeNull();
    },
  );
});
