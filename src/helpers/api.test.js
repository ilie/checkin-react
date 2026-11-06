import { describe, expect, test } from "vitest";
import { apiErrorMessage, toApiSort } from "./api";

describe("apiErrorMessage", () => {
  test("uses the first JSON:API validation error", () => {
    const error = {
      message: "Request failed with status code 422",
      response: {
        data: {
          errors: [{ detail: "A reason is required." }, { detail: "The date is invalid." }],
          message: "The given data was invalid.",
        },
      },
    };

    expect(apiErrorMessage(error)).toBe("A reason is required.");
  });

  test("uses the API's message when there are no validation errors", () => {
    const error = {
      message: "Request failed with status code 403",
      response: { data: { message: "Today is a national holiday." } },
    };

    expect(apiErrorMessage(error)).toBe("Today is a national holiday.");
  });

  test("uses the login endpoint's error", () => {
    const error = {
      message: "Request failed with status code 401",
      response: { data: { error: "Invalid credentials" } },
    };

    expect(apiErrorMessage(error)).toBe("Invalid credentials");
  });

  test("falls back to the request error when the API didn't answer", () => {
    expect(apiErrorMessage({ message: "Network Error" })).toBe("Network Error");
  });
});

describe("toApiSort", () => {
  test("prefixes descending sorts with a minus", () => {
    expect(toApiSort([{ id: "checkin_date", desc: true }])).toBe("-checkin_date");
    expect(toApiSort([{ id: "name", desc: false }])).toBe("name");
  });
});
