import { describe, expect, test } from "vitest";
import {
  dailySeconds,
  formatDuration,
  greeting,
  groupByWeek,
  totalSeconds,
  weekLabel,
  weekStart,
  workedSeconds,
} from "./time";

// The pinned e2e "today": Wednesday 4 November 2026, 10:00.
const now = new Date(2026, 10, 4, 10, 0);

function checkin(checkin_date, checkin_time, checkout_time = null) {
  return { checkin_date, checkin_time, checkout_time };
}

describe("weekStart", () => {
  test("is the Monday of the week", () => {
    expect(weekStart("2026-11-04")).toBe("2026-11-02");
    expect(weekStart("2026-11-02")).toBe("2026-11-02");
  });

  test("puts Sunday at the end of its week, not the start of the next", () => {
    expect(weekStart("2026-11-08")).toBe("2026-11-02");
  });

  test("crosses a month", () => {
    expect(weekStart("2026-11-01")).toBe("2026-10-26");
  });
});

describe("workedSeconds", () => {
  test("counts a complete check-in from in to out", () => {
    expect(workedSeconds(checkin("2026-11-03", "09:00:00", "17:00:00"), now)).toBe(8 * 3600);
  });

  test("counts today's open check-in until now", () => {
    expect(workedSeconds(checkin("2026-11-04", "09:05:00"), now)).toBe(55 * 60);
  });

  test("counts nothing for an earlier day's missing check-out", () => {
    expect(workedSeconds(checkin("2026-10-23", "09:00:00"), now)).toBe(0);
  });

  test("counts nothing for a check-out before the check-in", () => {
    expect(workedSeconds(checkin("2026-11-03", "18:00:00", "17:00:00"), now)).toBe(0);
  });
});

describe("totalSeconds", () => {
  test("sums Walter's week so far", () => {
    const week = [
      checkin("2026-11-04", "09:05:00"),
      checkin("2026-11-03", "09:00:00", "17:00:00"),
      checkin("2026-11-02", "09:00:00", "17:00:00"),
    ];

    expect(formatDuration(totalSeconds(week, now))).toBe("16h 55m");
  });
});

describe("dailySeconds", () => {
  test("gives Monday to Sunday, counting today's open check-in and not an invalid one", () => {
    const week = [
      checkin("2026-11-04", "09:05:00"),
      checkin("2026-11-03", "18:00:00", "17:00:00"),
      checkin("2026-11-03", "08:30:00", "15:30:00"),
      checkin("2026-11-02", "08:30:00", "15:30:00"),
    ];

    expect(dailySeconds(week, "2026-11-02", now)).toEqual([7 * 3600, 7 * 3600, 55 * 60, 0, 0, 0, 0]);
  });
});

describe("formatDuration", () => {
  test("shows minutes alone under an hour, and pads them after hours", () => {
    expect(formatDuration(55 * 60 + 59)).toBe("55m");
    expect(formatDuration(8 * 3600)).toBe("8h 00m");
    expect(formatDuration(37.5 * 3600)).toBe("37h 30m");
  });
});

describe("greeting", () => {
  test("changes at noon and at six", () => {
    expect(greeting(new Date(2026, 10, 4, 11, 59))).toBe("Good morning");
    expect(greeting(new Date(2026, 10, 4, 12, 0))).toBe("Good afternoon");
    expect(greeting(new Date(2026, 10, 4, 18, 0))).toBe("Good evening");
  });
});

describe("groupByWeek", () => {
  test("splits newest-first rows into weeks from Monday to Sunday", () => {
    const rows = [
      checkin("2026-11-04", "09:05:00"),
      checkin("2026-11-02", "09:00:00", "17:00:00"),
      checkin("2026-11-01", "10:00:00", "12:00:00"),
      checkin("2026-10-26", "09:00:00", "17:00:00"),
      checkin("2026-10-23", "09:00:00"),
    ];

    const weeks = groupByWeek(rows);

    expect(weeks.map((week) => week.start)).toEqual(["2026-11-02", "2026-10-26", "2026-10-19"]);
    expect(weeks.map((week) => week.checkins.length)).toEqual([2, 2, 1]);
    expect(formatDuration(totalSeconds(weeks[1].checkins, now))).toBe("10h 00m");
  });
});

describe("weekLabel", () => {
  test("names this week and last week, with their dates", () => {
    expect(weekLabel("2026-11-02", "2026-11-04")).toBe("This week · 2–8 Nov");
    expect(weekLabel("2026-10-26", "2026-11-04")).toBe("Last week · 26 Oct–1 Nov");
    expect(weekLabel("2026-10-19", "2026-11-04")).toBe("19–25 Oct");
  });

  test("adds the year outside the current one", () => {
    expect(weekLabel("2025-12-22", "2026-11-04")).toBe("22–28 Dec 2025");
    expect(weekLabel("2025-12-29", "2026-11-04")).toBe("29 Dec 2025–4 Jan");
  });
});
