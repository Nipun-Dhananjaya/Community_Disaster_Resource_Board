import { z } from "zod";
import type { IconName } from "./data";

export const needOptions = [
  { key: "shelter", label: "Shelter", icon: "home", bg: "bg-ok" },
  { key: "food", label: "Food and water", icon: "box", bg: "bg-warn" },
  { key: "medical", label: "Medical help", icon: "plus", bg: "bg-alert" },
  { key: "transport", label: "Transport", icon: "arrow", bg: "bg-ride" },
  { key: "rescue", label: "Rescue", icon: "alert", bg: "bg-alert" },
  { key: "clothing", label: "Clothing and blankets", icon: "heart", bg: "bg-care" },
  { key: "power", label: "Power and charging", icon: "bolt", bg: "bg-navy" },
  { key: "other", label: "Something else", icon: "dots", bg: "bg-[#5b6f85]" },
] as const satisfies readonly { key: string; label: string; icon: IconName; bg: string }[];

export type NeedKey = (typeof needOptions)[number]["key"];
const needKeys = needOptions.map((n) => n.key) as [NeedKey, ...NeedKey[]];

export const urgencyOptions = [
  { key: "critical", label: "Critical", hint: "Life or safety is at risk now" },
  { key: "urgent", label: "Urgent", hint: "Needed today" },
  { key: "soon", label: "Can wait", hint: "Needed in the next 2 to 3 days" },
] as const;
export type Urgency = (typeof urgencyOptions)[number]["key"];

export const specialOptions = [
  { key: "children", label: "Children under 5" },
  { key: "elderly", label: "Older adults" },
  { key: "mobility", label: "Wheelchair or mobility needs" },
  { key: "medical", label: "Ongoing medical needs" },
  { key: "pets", label: "Pets" },
] as const;
export type SpecialKey = (typeof specialOptions)[number]["key"];

export const contactOptions = [
  { key: "call", label: "Phone call" },
  { key: "sms", label: "Text message" },
] as const;
export type ContactKey = (typeof contactOptions)[number]["key"];

export interface FormValues {
  needs: NeedKey[];
  urgency: Urgency | "";
  people: string;
  special: SpecialKey[];
  notes: string;
  area: string;
  landmark: string;
  lat: number | null;
  lng: number | null;
  name: string;
  phone: string;
  contact: ContactKey;
  consent: boolean;
}

export const emptyValues: FormValues = {
  needs: [], urgency: "", people: "1", special: [], notes: "",
  area: "", landmark: "", lat: null, lng: null,
  name: "", phone: "", contact: "call", consent: false,
};

const step1 = z.object({
  needs: z.array(z.enum(needKeys)).min(1, "Choose at least one thing you need"),
});

const step2 = z.object({
  urgency: z.enum(["critical", "urgent", "soon"], { message: "Choose how urgent this is" }),
  people: z.coerce.number({ message: "Enter a number from 1 to 99" }).int("Enter a whole number").min(1, "Enter a number from 1 to 99").max(99, "Enter a number from 1 to 99"),
  special: z.array(z.enum(["children", "elderly", "mobility", "medical", "pets"])),
  notes: z.string().max(300, "Keep this under 300 characters"),
});

const step3 = z.object({
  area: z.string().trim().min(2, "Enter your town or area"),
  landmark: z.string().max(120, "Keep this under 120 characters"),
  lat: z.number().nullable(),
  lng: z.number().nullable(),
  name: z.string().trim().min(2, "Enter your name"),
  phone: z
    .string()
    .trim()
    .refine((v) => /^\+?[\d\s-]+$/.test(v) && v.replace(/\D/g, "").length >= 9 && v.replace(/\D/g, "").length <= 15, "Enter a phone number with 9 to 15 digits"),
  contact: z.enum(["call", "sms"]),
  consent: z.boolean().refine((v) => v === true, "Please agree so responders can contact you"),
});

export const stepSchemas = [step1, step2, step3] as const;
export const fullSchema = z.object({ ...step1.shape, ...step2.shape, ...step3.shape });

/** Returns { fieldName: message } for the first problem on each field. */
export function validate(schema: z.ZodType, values: unknown): Record<string, string> {
  const r = schema.safeParse(values);
  if (r.success) return {};
  const out: Record<string, string> = {};
  for (const issue of r.error.issues) {
    const key = String(issue.path[0] ?? "form");
    out[key] ??= issue.message;
  }
  return out;
}
