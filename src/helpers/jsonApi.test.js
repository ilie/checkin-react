import { describe, expect, test } from "vitest";
import { deserialize } from "./jsonApi";

function checkin(id, checkinDate) {
  return {
    type: "checkin",
    id,
    attributes: { checkin_date: checkinDate, checkout_time: null, deleted_at: null },
    links: { self: `http://localhost/api/checkins/${id}` },
  };
}

describe("deserialize", () => {
  test("flattens a single resource", () => {
    expect(deserialize({ data: checkin("7", "2026-11-04") })).toEqual({
      id: "7",
      checkin_date: "2026-11-04",
      checkout_time: null,
      deleted_at: null,
    });
  });

  test("flattens a list in order and ignores the links and meta", () => {
    const document = {
      data: [checkin("2", "2026-11-04"), checkin("1", "2026-11-03")],
      links: { self: "http://localhost/api/checkins" },
      meta: { total: 2 },
    };

    expect(deserialize(document).map((row) => [row.id, row.checkin_date])).toEqual([
      ["2", "2026-11-04"],
      ["1", "2026-11-03"],
    ]);
  });

  test("turns an empty list into an empty array", () => {
    expect(deserialize({ data: [] })).toEqual([]);
  });
});
