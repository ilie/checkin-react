import { describe, expect, test } from "vitest";
import { todayStatus, todayTimes } from "./today";

// The pinned e2e "today": Wednesday 4 November 2026, 10:00.
const now = new Date(2026, 10, 4, 10, 0);

function checkin(id, checkin_date, checkin_time, checkout_time = null) {
  return { id, checkin_date, checkin_time, checkout_time };
}

const walter = [
  checkin("3", "2026-11-04", "09:05:00"),
  checkin("2", "2026-11-03", "09:00:00", "17:00:00"),
  checkin("1", "2026-11-02", "09:00:00", "17:00:00"),
];

describe("todayStatus", () => {
  test("says since when, while clocked in", () => {
    expect(todayStatus({ status: "checkin", checkinId: 3 }, walter, now)).toEqual({
      isOpen: true,
      title: "Clocked in since 09:05",
      detail: "55m so far today",
    });
  });

  test("gives the last valid check-out before the first check-in of the day", () => {
    const olga = [
      checkin("5", "2026-11-03", "18:00:00", "17:00:00"),
      checkin("4", "2026-11-03", "08:30:00", "15:30:00"),
    ];

    expect(todayStatus({ status: "checkout", checkinId: null }, olga, now)).toEqual({
      isOpen: false,
      title: "Not clocked in today",
      detail: "Last check-out Tue 3 Nov at 15:30",
    });
  });
});

describe("todayTimes", () => {
  test("shows the open check-in with no check-out yet", () => {
    expect(todayTimes(walter, now)).toEqual({ in: "09:05", out: "—", worked: "55m" });
  });

  test("is empty before the first check-in of the day", () => {
    expect(todayTimes(walter.slice(1), now)).toBeNull();
  });
});
