import { z } from "zod";

// Dates and times come from native inputs as "YYYY-MM-DD" and "HH:mm" or "HH:mm:ss".
export const checkinSchema = z.object({
  user: z.string().min(1, "Please select a user"),
  date: z.string().min(1, "Checkin date is required"),
  checkin_time: z.string().min(1, "Checkin time is required"),
  checkout_time: z.string().min(1, "Checkout time is required"),
  reason: z.string().trim().min(1, "Please explain why this check-in is added or changed"),
});
