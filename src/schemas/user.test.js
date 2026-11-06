import { describe, expect, test } from "vitest";
import { messages } from "./messages";
import { addUserSchema, editUserSchema } from "./user";

const user = { name: "Nadia New", nif: "12345678Z", email: "nadia@example.com", hours_on_contract: 30, is_admin: "0" };
const newUser = { ...user, password: "Password1", password_confirmation: "Password1" };

function emailCheck(takenEmails) {
  const checked = [];
  async function isEmailTaken(email) {
    checked.push(email);
    return takenEmails.includes(email);
  }

  return { checked, isEmailTaken };
}

describe("editUserSchema", () => {
  test("accepts a valid user", async () => {
    expect(await messages(editUserSchema, user)).toEqual({});
  });

  test.each([
    ["name", " ", "Name is required"],
    ["nif", "", "NIF is required"],
    ["nif", "12345678", "NIF must be exactly 9 characters"],
    ["nif", "12345678ZZ", "NIF must be exactly 9 characters"],
    ["email", "", "Email is required"],
    ["email", "nadia", "Please enter a valid email"],
    ["hours_on_contract", Number.NaN, "Hours on contract is required"],
    ["hours_on_contract", 37.5, "Hours must be a whole number"],
    ["hours_on_contract", 0, "Hours must be between 1 and 40"],
    ["hours_on_contract", 41, "Hours must be between 1 and 40"],
    ["is_admin", "", "Choose whether the user is an admin"],
  ])("rejects %s = %j", async (field, value, message) => {
    expect(await messages(editUserSchema, { ...user, [field]: value })).toEqual({ [field]: message });
  });
});

describe("addUserSchema", () => {
  test("accepts a new user whose email is free", async () => {
    const { checked, isEmailTaken } = emailCheck([]);

    expect(await messages(addUserSchema(isEmailTaken), newUser)).toEqual({});
    expect(checked).toEqual(["nadia@example.com"]);
  });

  test("rejects an email another user has", async () => {
    const { isEmailTaken } = emailCheck(["nadia@example.com"]);

    expect(await messages(addUserSchema(isEmailTaken), newUser)).toEqual({ email: "This email has already been taken" });
  });

  test("doesn't ask the API about a malformed email", async () => {
    const { checked, isEmailTaken } = emailCheck([]);

    expect(await messages(addUserSchema(isEmailTaken), { ...newUser, email: "nadia@" })).toEqual({
      email: "Please enter a valid email",
    });
    expect(checked).toEqual([]);
  });

  test("needs matching passwords", async () => {
    const { isEmailTaken } = emailCheck([]);

    expect(await messages(addUserSchema(isEmailTaken), { ...newUser, password_confirmation: "Password2" })).toEqual({
      password_confirmation: "Passwords do not match",
    });
  });
});
