import { z } from "zod";

// No check aborts: an aborted field would stop the object's own checks, like passwordsMatch, from running.
// Forms show the first message of each field.
export function emailField() {
  return z.string().trim().min(1, "Email is required").check(z.email("Please enter a valid email"));
}

export function isEmail(value) {
  return z.email().safeParse(value).success;
}

// The API asks for at least 8 characters.
export const passwordFields = {
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long")
    .regex(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/, "Password needs a capital letter, a lowercase letter and a number"),
  password_confirmation: z.string().min(1, "Password confirmation is required"),
};

// Runs even while other fields are invalid, so the mismatch shows straight away.
export function passwordsMatch(schema) {
  return schema.refine((values) => values.password === values.password_confirmation, {
    error: "Passwords do not match",
    path: ["password_confirmation"],
    when: (payload) => payload.value.password_confirmation !== "",
  });
}

export const loginSchema = z.object({
  email: emailField(),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: emailField(),
});

export const resetPasswordSchema = passwordsMatch(
  z.object({
    email: emailField(),
    ...passwordFields,
  }),
);
