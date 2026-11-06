import { z } from "zod";
import { emailField, isEmail, passwordFields, passwordsMatch } from "./auth";

// The form keeps is_admin as the select's "1" or "0"; the API accepts both.
const userFields = {
  name: z.string().trim().min(1, "Name is required"),
  nif: z
    .string()
    .trim()
    .min(1, "NIF is required")
    .length(9, "NIF must be exactly 9 characters"),
  email: emailField(),
  // The hours input is read as a number, so an empty field arrives as NaN.
  hours_on_contract: z
    .number({ error: "Hours on contract is required" })
    .int("Hours must be a whole number")
    .min(1, "Hours must be between 1 and 40")
    .max(40, "Hours must be between 1 and 40"),
  is_admin: z.enum(["0", "1"], { error: "Choose whether the user is an admin" }),
};

export const editUserSchema = z.object(userFields);

// isEmailTaken(email) resolves to true when another user has the address.
export function addUserSchema(isEmailTaken) {
  return passwordsMatch(
    z.object({
      ...userFields,
      // Only a well-formed address is worth asking the API about.
      email: emailField().refine(
        async (email) => !isEmail(email) || !(await isEmailTaken(email)),
        "This email has already been taken",
      ),
      ...passwordFields,
    }),
  );
}
