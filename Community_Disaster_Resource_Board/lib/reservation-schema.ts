import { z } from "zod";

const phoneOk = (v: string) => /^\+?[\d\s-]+$/.test(v) && v.replace(/\D/g, "").length >= 9 && v.replace(/\D/g, "").length <= 15;

/** `max` is the most one person can take right now (the household limit, or what is left). */
export const reservationSchema = (max: number) =>
  z.object({
    quantity: z
      .union([z.string(), z.number()])
      .refine((v) => /^\d+$/.test(String(v).trim()), "Enter a whole number")
      .transform(Number)
      .refine((n) => n >= 1 && n <= max, max < 1 ? "Nothing is left to reserve" : `Choose between 1 and ${max}`),
    name: z.string().trim().min(2, "Enter your name").max(80, "Keep this under 80 characters"),
    phone: z.string().trim().refine(phoneOk, "Enter a phone number with 9 to 15 digits"),
    method: z.enum(["pickup", "delivery"]),
  });
