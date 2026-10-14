import { z } from "zod";
import type { Category, Status } from "./listings";

export type OfferType = "shelter" | "supplies" | "transport" | "volunteer";
export type Values = Record<string, string | string[]>;
type Option = { value: string; label: string };

export type FieldDef =
  | { kind: "text" | "number" | "textarea"; name: string; label: string; placeholder?: string; hint?: string; half?: boolean; optional?: boolean }
  | { kind: "select"; name: string; label: string; options: readonly Option[]; half?: boolean }
  | { kind: "checks"; name: string; label: string; options: readonly Option[] }
  | { kind: "map"; label: string };

export interface OfferConfig {
  slug: OfferType;
  title: string;
  intro: string;
  category: Category;
  fields: FieldDef[];
  defaults: Values;
  schema: z.ZodType;
  preview: (v: Values) => { title: string; status: Status; headline: string; place: string };
}

/* ---------- shared option lists ---------- */
const expiresOptions = [
  { value: "6h", label: "6 hours" }, { value: "12h", label: "12 hours" },
  { value: "24h", label: "24 hours" }, { value: "72h", label: "3 days" },
] as const;
const venueOptions = [
  { value: "school", label: "School hall" }, { value: "community", label: "Community hall" },
  { value: "worship", label: "Place of worship" }, { value: "home", label: "Private home" }, { value: "other", label: "Other" },
] as const;
const amenityOptions = [
  { value: "food", label: "Food and water" }, { value: "power", label: "Power" }, { value: "wifi", label: "Wi-Fi" },
  { value: "firstaid", label: "First aid" }, { value: "pets", label: "Pets welcome" },
  { value: "wheelchair", label: "Wheelchair access" }, { value: "showers", label: "Showers" },
] as const;
const supplyOptions = [
  { value: "water", label: "Water" }, { value: "food", label: "Food" }, { value: "medicine", label: "Medicine" },
  { value: "fuel", label: "Fuel" }, { value: "clothing", label: "Clothing and blankets" }, { value: "other", label: "Other" },
] as const;
const handoverOptions = [
  { value: "pickup", label: "Pickup only" }, { value: "delivery", label: "Delivery only" }, { value: "both", label: "Pickup or delivery" },
] as const;
const vehicleOptions = [
  { value: "car", label: "Car" }, { value: "van", label: "Van" }, { value: "truck", label: "Truck" },
  { value: "bus", label: "Bus" }, { value: "boat", label: "Boat" }, { value: "other", label: "Other" },
] as const;
const transportFeatures = [
  { value: "wheelchair", label: "Wheelchair accessible" }, { value: "free", label: "Free of charge" }, { value: "pets", label: "Pets allowed" },
] as const;
const skillOptions = [
  { value: "firstaid", label: "First aid" }, { value: "boat", label: "Boat handling" }, { value: "driving", label: "Driving" },
  { value: "cooking", label: "Cooking" }, { value: "cleanup", label: "Clean-up" }, { value: "counselling", label: "Counselling" },
  { value: "translation", label: "Translation" }, { value: "lifting", label: "Heavy lifting" },
] as const;
const resourceOptions = [
  { value: "vehicle", label: "A vehicle" }, { value: "boat", label: "A boat" }, { value: "tools", label: "Tools" },
] as const;

const label = (opts: readonly Option[], v: string | string[] | undefined) =>
  opts.find((o) => o.value === v)?.label ?? "";
const s = (v: Values, k: string) => (typeof v[k] === "string" ? (v[k] as string).trim() : "");

/* ---------- validation helpers ---------- */
const num = (msg: string) =>
  z.union([z.string(), z.number()])
    .refine((v) => String(v).trim() !== "" && Number.isFinite(Number(v)), msg)
    .transform(Number);
const int = (msg: string, min: number, max: number) => num(msg).refine((n) => Number.isInteger(n) && n >= min && n <= max, msg);
const pin = { lat: num("Tap the map to place your pin"), lng: num("Tap the map to place your pin") };
const expires = z.enum(["6h", "12h", "24h", "72h"], { message: "Choose how long the listing stays up" });
const contact = z.string().trim().refine(
  (v) => v.replace(/\D/g, "").length >= 9 && v.replace(/\D/g, "").length <= 15,
  "Add a contact name and phone, for example Ms. Perera, 031 000 0000",
);
const phoneOnly = z.string().trim().refine(
  (v) => /^\+?[\d\s-]+$/.test(v) && v.replace(/\D/g, "").length >= 9 && v.replace(/\D/g, "").length <= 15,
  "Enter a phone number with 9 to 15 digits",
);
const text = (msg: string, min = 2, max = 120) => z.string().trim().min(min, msg).max(max, `Keep this under ${max} characters`);
const oneOf = <T extends readonly Option[]>(opts: T, msg: string) =>
  z.enum(opts.map((o) => o.value) as [string, ...string[]], { message: msg });

/* ---------- schemas (also used by the API route) ---------- */
export const shelterSchema = z
  .object({
    offer: z.literal("shelter"),
    name: text("Enter the shelter name", 3),
    venue: oneOf(venueOptions, "Choose a type"),
    checkIn: text("Enter check-in hours, for example Open 24 hours", 3, 60),
    address: text("Enter the address", 5),
    capacity: int("Enter the total number of beds (1 to 5000)", 1, 5000),
    bedsFree: int("Enter how many beds are free now (0 or more)", 0, 5000),
    ...pin,
    amenities: z.array(z.string()),
    contact,
    expires,
  })
  .superRefine((d, ctx) => {
    if (d.bedsFree > d.capacity) ctx.addIssue({ code: "custom", path: ["bedsFree"], message: "Beds free can’t be more than total capacity" });
  });

export const suppliesSchema = z.object({
  offer: z.literal("supplies"),
  item: text("Say what you are offering", 3),
  category: oneOf(supplyOptions, "Choose a type of supply"),
  quantity: text("Enter a quantity, for example 500 bottles", 1, 40),
  handover: oneOf(handoverOptions, "Choose pickup or delivery"),
  hours: z.string().trim().max(60, "Keep this under 60 characters"),
  address: text("Enter the pickup address", 5),
  ...pin,
  contact,
  expires,
});

export const transportSchema = z.object({
  offer: z.literal("transport"),
  vehicle: oneOf(vehicleOptions, "Choose a vehicle"),
  seats: int("Enter the number of seats (1 to 100)", 1, 100),
  from: text("Enter where the trip starts"),
  to: text("Enter where it goes"),
  departure: text("Say when it leaves, for example Hourly from 8 am", 3, 80),
  cargo: z.string().trim().max(60, "Keep this under 60 characters"),
  features: z.array(z.string()),
  contact,
  expires,
});

export const volunteerSchema = z.object({
  offer: z.literal("volunteer"),
  name: text("Enter your name"),
  skills: z.array(z.string()).min(1, "Choose at least one skill"),
  area: text("Enter the area you can travel to"),
  availability: text("Say when you can help, for example Weekdays after 4 pm", 3, 80),
  resources: z.array(z.string()),
  contact: phoneOnly,
  expires,
});

export const offerSchema = z.discriminatedUnion("offer", [shelterSchema, suppliesSchema, transportSchema, volunteerSchema]);

/* ---------- form configs ---------- */
const expiresField = (name = "expires", l = "Expire this listing after"): FieldDef =>
  ({ kind: "select", name, label: l, options: expiresOptions, half: true });

export const offerConfigs: Record<OfferType, OfferConfig> = {
  shelter: {
    slug: "shelter", title: "Post a shelter", intro: "Your answers save automatically as a draft.", category: "shelter",
    schema: shelterSchema,
    defaults: { name: "", venue: "school", checkIn: "", address: "", capacity: "", bedsFree: "", lat: "", lng: "", amenities: [], contact: "", expires: "6h" },
    fields: [
      { kind: "text", name: "name", label: "Shelter name", placeholder: "Central College Relief Centre" },
      { kind: "select", name: "venue", label: "Type", options: venueOptions, half: true },
      { kind: "text", name: "checkIn", label: "Check-in hours", placeholder: "Open 24 hours", half: true },
      { kind: "text", name: "address", label: "Address", placeholder: "14 College Road, Negombo" },
      { kind: "number", name: "capacity", label: "Total capacity", placeholder: "120 beds", half: true },
      { kind: "number", name: "bedsFree", label: "Beds free now", placeholder: "38 beds", half: true },
      { kind: "map", label: "Tap the map to place your pin" },
      { kind: "checks", name: "amenities", label: "Amenities", options: amenityOptions },
      { kind: "text", name: "contact", label: "Contact name and phone", placeholder: "Ms. Perera, 031 000 0000", half: true },
      expiresField(),
    ],
    preview: (v) => {
      const free = s(v, "bedsFree");
      const none = free !== "" && Number(free) === 0;
      return {
        title: s(v, "name") || "Your shelter name",
        status: none ? "full" : "available",
        headline: free === "" ? "Beds free" : none ? "No beds" : `${Number(free)} beds free`,
        place: s(v, "address") || "Your address",
      };
    },
  },
  supplies: {
    slug: "supplies", title: "Post supplies", intro: "Your answers save automatically as a draft.", category: "supply",
    schema: suppliesSchema,
    defaults: { item: "", category: "water", quantity: "", handover: "pickup", hours: "", address: "", lat: "", lng: "", contact: "", expires: "6h" },
    fields: [
      { kind: "text", name: "item", label: "What are you offering?", placeholder: "Drinking water, 500 bottles" },
      { kind: "select", name: "category", label: "Type of supply", options: supplyOptions, half: true },
      { kind: "text", name: "quantity", label: "Quantity", placeholder: "500 bottles", half: true },
      { kind: "select", name: "handover", label: "Pickup or delivery", options: handoverOptions, half: true },
      { kind: "text", name: "hours", label: "Available hours", placeholder: "8 am to 6 pm", half: true, optional: true },
      { kind: "text", name: "address", label: "Pickup address", placeholder: "Station Road, Katunayake" },
      { kind: "map", label: "Tap the map to place your pin" },
      { kind: "text", name: "contact", label: "Contact name and phone", placeholder: "Mr. Silva, 077 000 0000", half: true },
      expiresField(),
    ],
    preview: (v) => ({
      title: s(v, "item") || "Your supplies",
      status: "available",
      headline: [s(v, "quantity"), label(handoverOptions, v.handover)].filter(Boolean).join(" · ") || "Quantity",
      place: s(v, "address") || "Your address",
    }),
  },
  transport: {
    slug: "transport", title: "Post a ride", intro: "Your answers save automatically as a draft.", category: "transport",
    schema: transportSchema,
    defaults: { vehicle: "van", seats: "", from: "", to: "", departure: "", cargo: "", features: [], contact: "", expires: "6h" },
    fields: [
      { kind: "select", name: "vehicle", label: "Vehicle", options: vehicleOptions, half: true },
      { kind: "number", name: "seats", label: "Seats available", placeholder: "20", half: true },
      { kind: "text", name: "from", label: "Starting area", placeholder: "Katunayake", half: true },
      { kind: "text", name: "to", label: "Destination", placeholder: "Katana shelter", half: true },
      { kind: "text", name: "departure", label: "When does it leave?", placeholder: "Hourly from 8 am" },
      { kind: "text", name: "cargo", label: "Cargo space", placeholder: "Up to 200 kg", optional: true },
      { kind: "checks", name: "features", label: "Good to know", options: transportFeatures },
      { kind: "text", name: "contact", label: "Contact name and phone", placeholder: "Mr. Fernando, 071 000 0000", half: true },
      expiresField(),
    ],
    preview: (v) => ({
      title: [label(vehicleOptions, v.vehicle), s(v, "seats") && `seats ${s(v, "seats")}`].filter(Boolean).join(", ") || "Your ride",
      status: "available",
      headline: s(v, "departure") || "When it leaves",
      place: [s(v, "from"), s(v, "to")].filter(Boolean).join(" to ") || "Your route",
    }),
  },
  volunteer: {
    slug: "volunteer", title: "Register as a volunteer", intro: "Your answers save automatically as a draft.", category: "volunteer",
    schema: volunteerSchema,
    defaults: { name: "", skills: [], area: "", availability: "", resources: [], contact: "", expires: "72h" },
    fields: [
      { kind: "text", name: "name", label: "Your name", placeholder: "Nimal Perera" },
      { kind: "checks", name: "skills", label: "Your skills", options: skillOptions },
      { kind: "text", name: "area", label: "Area you can travel to", placeholder: "Negombo and Ja-Ela", half: true },
      { kind: "text", name: "availability", label: "When can you help?", placeholder: "Weekdays after 4 pm", half: true },
      { kind: "checks", name: "resources", label: "I can also bring", options: resourceOptions },
      { kind: "text", name: "contact", label: "Phone number", placeholder: "071 000 0000", half: true },
      expiresField("expires", "Keep this registration for"),
    ],
    preview: (v) => {
      const skills = (Array.isArray(v.skills) ? v.skills : []).map((k) => label(skillOptions, k)).filter(Boolean);
      return {
        title: s(v, "name") || "Your name",
        status: "available",
        headline: skills.slice(0, 3).join(", ") || "Your skills",
        place: [s(v, "area"), s(v, "availability")].filter(Boolean).join(" · ") || "Your area",
      };
    },
  },
};

export const offerTypes = Object.keys(offerConfigs) as OfferType[];
export function isOfferType(x: string): x is OfferType {
  return (offerTypes as string[]).includes(x);
}

/** Readable value for the review step. */
export function displayValue(def: FieldDef, v: Values): string {
  if (def.kind === "map") return s(v, "lat") ? `Pin placed (${Number(s(v, "lat")).toFixed(4)}, ${Number(s(v, "lng")).toFixed(4)})` : "Not set";
  const raw = v[def.name];
  if (def.kind === "checks") {
    const arr = Array.isArray(raw) ? raw : [];
    return arr.map((k) => label(def.options, k)).join(", ") || "None";
  }
  if (def.kind === "select") return label(def.options, raw);
  return (typeof raw === "string" && raw.trim()) || "Not given";
}
