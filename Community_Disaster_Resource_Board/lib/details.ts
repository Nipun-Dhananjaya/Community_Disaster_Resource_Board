import { PLACEHOLDER_PHONE, Listing } from "./listings";

export interface Detail {
  description: string;
  address: string;
  landmark?: string;
  capacity?: { total: number; taken: number; checkIn: string };
  amenities: string[];
  contact: { label: string; name: string; phone: string; display: string };
  rules: string[];
  log: { minAgo: number; text: string; tone: "ok" | "navy" }[];
}

const placeholderContact = { label: "Contact", name: "Listing contact", phone: PLACEHOLDER_PHONE, display: "+94 11 000 0000" };
const coordinator = { label: "Shelter coordinator", name: "Shelter coordinator", phone: PLACEHOLDER_PHONE, display: "+94 11 000 0000" };

// Demo content. Replace with data from your backend.
const details: Record<string, Detail> = {
  s1: {
    description: "School hall, 14 College Road, Negombo · serves everyone, families first",
    address: "14 College Road, Negombo",
    landmark: "Near the clock tower, 300 m from the lagoon road",
    capacity: { total: 120, taken: 82, checkIn: "check-in open 24 hours" },
    amenities: ["Food and water", "Power", "Wi-Fi", "First aid", "Pets welcome", "Wheelchair access", "Showers"],
    contact: { label: "Shelter manager", name: "Ms. Perera, school principal", phone: "0310000000", display: "031 000 0000" },
    rules: [
      "Bring ID if you have it; no one is turned away without it",
      "Quiet hours 10 pm to 6 am",
      "Bring medication, blankets and a phone charger",
    ],
    log: [
      { minAgo: 12, text: "Beds free changed from 44 to 38", tone: "ok" },
      { minAgo: 120, text: "Hot meals now served until 9 pm", tone: "ok" },
      { minAgo: 300, text: "Status changed to Open", tone: "navy" },
    ],
  },
  s2: {
    description: "Church hall, Negombo · elderly and families first",
    address: "Church Road, Negombo",
    capacity: { total: 60, taken: 54, checkIn: "check-in open until 10 pm" },
    amenities: ["Food and water", "Power", "Wheelchair access"],
    contact: coordinator,
    rules: ["Bring ID if you have it", "Bring blankets and medication"],
    log: [
      { minAgo: 40, text: "Beds free changed from 12 to 6", tone: "ok" },
      { minAgo: 260, text: "Status changed to Open", tone: "navy" },
    ],
  },
  s3: {
    description: "Community hall, Kochchikade · currently full",
    address: "Kochchikade, Negombo",
    capacity: { total: 80, taken: 80, checkIn: "check-in closed while full" },
    amenities: ["Pets welcome", "Wheelchair access"],
    contact: coordinator,
    rules: ["Please check the board for nearby shelters before travelling"],
    log: [{ minAgo: 60, text: "Status changed to Full", tone: "navy" }],
  },
  s4: {
    description: "Divisional Secretariat building, Katana · serves everyone",
    address: "Divisional Secretariat, Katana",
    capacity: { total: 200, taken: 128, checkIn: "check-in open 24 hours" },
    amenities: ["Food and water", "Power", "First aid", "Pets welcome", "Wheelchair access", "Medical support", "Families area"],
    contact: coordinator,
    rules: ["Bring ID if you have it", "Quiet hours 10 pm to 6 am", "Pets must stay in the outdoor area"],
    log: [
      { minAgo: 25, text: "Beds free changed from 80 to 72", tone: "ok" },
      { minAgo: 180, text: "Medical team on site", tone: "ok" },
    ],
  },
  s5: {
    description: "Temple hall, Ja-Ela",
    address: "Ja-Ela",
    capacity: { total: 60, taken: 40, checkIn: "check-in open until 9 pm" },
    amenities: ["Food and water", "Pets welcome"],
    contact: coordinator,
    rules: ["Bring blankets"],
    log: [{ minAgo: 180, text: "Beds free changed from 25 to 20", tone: "ok" }],
  },
  s6: {
    description: "School shelter, Wattala · families welcome",
    address: "Ward Place, Wattala",
    capacity: { total: 150, taken: 95, checkIn: "check-in open 24 hours" },
    amenities: ["Food and water", "Wheelchair access", "Families area"],
    contact: coordinator,
    rules: ["Bring ID if you have it", "Quiet hours 10 pm to 6 am"],
    log: [{ minAgo: 300, text: "Status changed to Open", tone: "navy" }],
  },
  s7: {
    description: "Annex building beside the hospital, Ragama",
    address: "Hospital Road, Ragama",
    capacity: { total: 40, taken: 30, checkIn: "check-in open 24 hours" },
    amenities: ["First aid", "Medical support", "Wheelchair access"],
    contact: coordinator,
    rules: ["Priority for people who need medical care"],
    log: [{ minAgo: 90, text: "Beds free changed from 14 to 10", tone: "ok" }],
  },
};

export function getDetail(l: Listing): Detail {
  return (
      details[l.id] ?? {
        description: `${l.title} · ${l.area}`,
        address: l.area,
        amenities: [],
        contact: placeholderContact,
        rules: [],
        log: [{ minAgo: l.updatedMin, text: `Listing updated: ${l.headline}`, tone: "ok" }],
      }
  );
}

/* ---------- supplies (water, food, medicine...) ---------- */
export interface SupplyInfo {
  categoryLabel: string;
  provider: string;
  providerVerified: boolean;
  description: string;
  left: number;
  total: number;
  limit: number;
  unit: string;
  condition: string;
  howToGet: string;
  hours: string;
  address: string;
  landmark: string;
  collect: string;
  delivery: boolean;
  holdHours: number;
  phone: string;
  display: string;
}

const supplies: Record<string, SupplyInfo> = {
  p1: {
    categoryLabel: "Supplies · Water", provider: "Katunayake Youth Society", providerVerified: true,
    description: "Provided by Katunayake Youth Society · new, sealed 1.5 L bottles",
    left: 180, total: 500, limit: 12, unit: "bottles", condition: "New, expires 2027", howToGet: "Pickup only", hours: "8 am to 8 pm daily",
    address: "Youth Society Hall, Katunayake", landmark: "opposite the bus halt",
    collect: "Anyone affected by the flooding. Bring a container if you can. Bottles are handed out in the order people arrive, and the count above updates as stock goes.",
    delivery: false, holdHours: 2, phone: "0110000000", display: "011 000 0000",
  },
  p2: {
    categoryLabel: "Supplies · Food", provider: "Seeduwa Relief Volunteers", providerVerified: true,
    description: "Provided by Seeduwa Relief Volunteers · dry rations for a family of four",
    left: 320, total: 600, limit: 2, unit: "food packs", condition: "Packed today", howToGet: "Pickup or delivery", hours: "9 am to 5 pm daily",
    address: "Seeduwa Community Centre", landmark: "next to the post office",
    collect: "Families affected by the flooding, with priority for children and older people. One pack feeds a family of four for about three days.",
    delivery: true, holdHours: 2, phone: "0110000000", display: "011 000 0000",
  },
  p3: {
    categoryLabel: "Supplies · Medicine", provider: "Negombo Health Volunteers", providerVerified: true,
    description: "Provided by Negombo Health Volunteers · basic first-aid kits",
    left: 60, total: 100, limit: 1, unit: "first-aid kits", condition: "New and sealed", howToGet: "Pickup only", hours: "8 am to 6 pm daily",
    address: "Health Volunteers Post, Negombo", landmark: "near the fish market",
    collect: "Anyone who needs basic first aid. Ask for a volunteer if you need help with a wound. For anything serious, call 1990.",
    delivery: false, holdHours: 2, phone: "0110000000", display: "011 000 0000",
  },
  p4: {
    categoryLabel: "Supplies · Clothing", provider: "Wennappuwa Women’s Circle", providerVerified: false,
    description: "Provided by Wennappuwa Women’s Circle · clean blankets and sleeping mats",
    left: 150, total: 300, limit: 4, unit: "sets", condition: "Clean, used once", howToGet: "Pickup or delivery", hours: "10 am to 4 pm, Monday to Saturday",
    address: "Women’s Circle Hall, Wennappuwa", landmark: "behind the market",
    collect: "Anyone staying in a shelter or whose home is flooded. Bring a bag if you can.",
    delivery: true, holdHours: 2, phone: "0110000000", display: "011 000 0000",
  },
};

export const getSupply = (l: Listing): SupplyInfo | null => (l.category === "supply" ? supplies[l.id] ?? null : null);
