import { describe, expect, test } from "vitest";
import { forgotPasswordSchema, loginSchema, resetPasswordSchema } from "./auth";
import { messages } from "./messages";

const reset = { email: "ana@example.com", password: "Password1", password_confirmation: "Password1" };

describe("loginSchema", () => {
  test("accepts an email and a password", async () => {
    expect(await messages(loginSchema, { email: "ana@example.com", password: "x" })).toEqual({});
  });

  test.each([
    [{ email: "", password: "x" }, { email: "Email is required" }],
    [{ email: "ana@", password: "x" }, { email: "Please enter a valid email" }],
    [{ email: "ana@example.com", password: "" }, { password: "Password is required" }],
  ])("rejects %j", async (values, expected) => {
    expect(await messages(loginSchema, values)).toEqual(expected);
  });
});

describe("forgotPasswordSchema", () => {
  test("accepts an email, ignoring spaces around it", async () => {
    expect(await forgotPasswordSchema.parseAsync({ email: " ana@example.com " })).toEqual({ email: "ana@example.com" });
  });

  test("rejects a malformed email", async () => {
    expect(await messages(forgotPasswordSchema, { email: "ana" })).toEqual({ email: "Please enter a valid email" });
  });
});

describe("resetPasswordSchema", () => {
  test("accepts a valid reset", async () => {
    expect(await messages(resetPasswordSchema, reset)).toEqual({});
  });

  test("accepts a long password", async () => {
    const password = "Correct horse battery staple 42";

    expect(await messages(resetPasswordSchema, { ...reset, password, password_confirmation: password })).toEqual({});
  });

  test.each([
    ["", "Password is required"],
    ["Pass1", "Password must be at least 8 characters long"],
    ["password1", "Password needs a capital letter, a lowercase letter and a number"],
    ["PASSWORD1", "Password needs a capital letter, a lowercase letter and a number"],
    ["Passwords", "Password needs a capital letter, a lowercase letter and a number"],
  ])("rejects the password %j", async (password, message) => {
    expect((await messages(resetPasswordSchema, { ...reset, password, password_confirmation: password })).password).toBe(
      message,
    );
  });

  test("requires the confirmation", async () => {
    expect(await messages(resetPasswordSchema, { ...reset, password_confirmation: "" })).toEqual({
      password_confirmation: "Password confirmation is required",
    });
  });

  test("says when the passwords don't match, even while the email is still wrong", async () => {
    expect(await messages(resetPasswordSchema, { ...reset, email: "", password_confirmation: "Password2" })).toEqual({
      email: "Email is required",
      password_confirmation: "Passwords do not match",
    });
  });
});
