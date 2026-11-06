import { describe, expect, test } from "vitest";
import { emptyFilters, filtersToQuery } from "./CheckinFilters";

const allFilters = {
  user: "7",
  from: "2026-10-01",
  to: "2026-10-31",
  status: "open",
  source: "manual",
  edited: true,
  showDeleted: true,
};

function decoded(query) {
  return decodeURIComponent(query).split("&");
}

describe("filtersToQuery", () => {
  test("sends nothing when no filter is set", () => {
    expect(filtersToQuery(emptyFilters, true)).toBe("");
    expect(filtersToQuery(emptyFilters, false)).toBe("");
  });

  test("sends every filter for an admin", () => {
    expect(decoded(filtersToQuery(allFilters, true))).toEqual([
      "filter[user]=7",
      "filter[trashed]=with",
      "filter[from]=2026-10-01",
      "filter[to]=2026-10-31",
      "filter[status]=open",
      "filter[source]=manual",
      "filter[edited]=1",
    ]);
  });

  test("leaves out the employee and deleted-rows filters for a worker", () => {
    expect(decoded(filtersToQuery(allFilters, false))).toEqual([
      "filter[from]=2026-10-01",
      "filter[to]=2026-10-31",
      "filter[status]=open",
      "filter[source]=manual",
      "filter[edited]=1",
    ]);
  });

  test("sends only the filters that are set", () => {
    const filters = { ...emptyFilters, from: "2026-10-01", showDeleted: true };

    expect(decoded(filtersToQuery(filters, true))).toEqual([
      "filter[trashed]=with",
      "filter[from]=2026-10-01",
    ]);
  });
});
