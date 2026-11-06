import { describe, expect, test } from "vitest";
import { checkinSchema } from "./checkin";
import { messages } from "./messages";

const checkin = {
  user: "3",
  date: "2026-10-21",
  checkin_time: "09:00:00",
  checkout_time: "13:00",
  reason: "Paper sign-in sheet",
};

describe("checkinSchema", () => {
  test("accepts a complete check-in and trims the reason", async () => {
    expect(await checkinSchema.parseAsync({ ...checkin, reason: "  Paper sign-in sheet " })).toEqual(checkin);
  });

  test.each([
    ["user", "Please select a user"],
    ["date", "Checkin date is required"],
    ["checkin_time", "Checkin time is required"],
    ["checkout_time", "Checkout time is required"],
    ["reason", "Please explain why this check-in is added or changed"],
  ])("requires %s", async (field, message) => {
    expect(await messages(checkinSchema, { ...checkin, [field]: "" })).toEqual({ [field]: message });
  });

  test("doesn't accept a reason of only spaces", async () => {
    expect(await messages(checkinSchema, { ...checkin, reason: "   " })).toEqual({
      reason: "Please explain why this check-in is added or changed",
    });
  });
});
