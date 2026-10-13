import type { IconName, Tone } from "./data";

export type Category = "shelter" | "supply" | "volunteer" | "transport" | "request";
export type Status = "available" | "limited" | "full" | "critical" | "open";

export interface Listing {
  id: string;
  category: Category;
  title: string;
  area: string;
  distanceKm: number;
  updatedMin: number;
  verified: boolean;
  status: Status;
  headline: string;
  tags: string[];
  /** Map position (demo coordinates; replace with surveyed locations) */
  lat: number;
  lng: number;
}

export const categoryMeta: Record<Category, { tone: Tone; icon: IconName; one: string; many: string; chip: string }> = {
  shelter: { tone: "ok", icon: "home", one: "shelter", many: "shelters", chip: "Shelters" },
  supply: { tone: "warn", icon: "box", one: "supply point", many: "supply points", chip: "Supplies" },
  volunteer: { tone: "care", icon: "heart", one: "volunteer group", many: "volunteer groups", chip: "Volunteers" },
  transport: { tone: "ride", icon: "arrow", one: "ride", many: "rides", chip: "Transport" },
  request: { tone: "alert", icon: "alert", one: "request", many: "requests", chip: "Requests" },
};

export const categoryOrder: Category[] = ["shelter", "supply", "volunteer", "transport", "request"];

export const needsByCategory: Record<Category, { key: string; label: string }[]> = {
  shelter: [
    { key: "beds", label: "Beds available now" },
    { key: "pets", label: "Pets welcome" },
    { key: "wheelchair", label: "Wheelchair access" },
    { key: "medical", label: "Medical support" },
    { key: "food", label: "Food provided" },
    { key: "families", label: "Families only" },
  ],
  supply: [
    { key: "stock", label: "In stock now" },
    { key: "pickup", label: "Pickup" },
    { key: "delivery", label: "Delivery available" },
  ],
  volunteer: [
    { key: "vehicle", label: "Has a vehicle" },
    { key: "boat", label: "Has a boat" },
    { key: "medical", label: "Medical training" },
  ],
  transport: [
    { key: "wheelchair", label: "Wheelchair accessible" },
    { key: "truck", label: "Truck" },
    { key: "boat", label: "Boat" },
  ],
  request: [
    { key: "critical", label: "Critical only" },
    { key: "boat", label: "Needs a boat" },
  ],
};

export const needsLabel: Record<Category, string> = {
  shelter: "Shelter needs",
  supply: "Supply needs",
  volunteer: "Volunteer skills",
  transport: "Ride type",
  request: "Request type",
};

export const statusLabel: Record<Status, string> = {
  available: "Available", limited: "Limited", full: "Full", critical: "Critical", open: "Open",
};
export const statusClass: Record<Status, string> = {
  available: "bg-ok-soft text-ok",
  limited: "bg-warn-soft text-[#8a4a0a]",
  full: "bg-[#e3e8ee] text-[#3f5163]",
  critical: "bg-alert-soft text-alert",
  open: "bg-warn-soft text-[#8a4a0a]",
};
export const statusMark: Record<Status, string> = {
  available: "●", limited: "▲", full: "■", critical: "▲", open: "▲",
};

/** Placeholder number. Replace with each listing's real contact when you add a backend. */
export const PLACEHOLDER_PHONE = "+94110000000";

export const listings: Listing[] = [
  // Shelters
  { id: "s1", category: "shelter", title: "Central College Relief Centre", area: "Negombo", distanceKm: 1.2, updatedMin: 12, verified: true, status: "available", headline: "38 beds free", tags: ["beds", "wheelchair", "food", "medical"], lat: 7.2083, lng: 79.8358 },
  { id: "s2", category: "shelter", title: "St. Mary’s Church Hall", area: "Negombo", distanceKm: 2.4, updatedMin: 40, verified: true, status: "limited", headline: "6 beds free", tags: ["beds", "wheelchair", "food"], lat: 7.215, lng: 79.84 },
  { id: "s3", category: "shelter", title: "Community Hall, Kochchikade", area: "Negombo", distanceKm: 3.0, updatedMin: 60, verified: true, status: "full", headline: "No beds", tags: ["wheelchair", "pets"], lat: 7.199, lng: 79.839 },
  { id: "s4", category: "shelter", title: "Divisional Secretariat Shelter", area: "Katana", distanceKm: 4.8, updatedMin: 25, verified: true, status: "available", headline: "72 beds free", tags: ["beds", "wheelchair", "medical", "food", "families", "pets"], lat: 7.165, lng: 79.857 },
  { id: "s5", category: "shelter", title: "Temple Hall, Ja-Ela", area: "Ja-Ela", distanceKm: 6.5, updatedMin: 180, verified: false, status: "available", headline: "20 beds free", tags: ["beds", "pets", "food"], lat: 7.074, lng: 79.892 },
  { id: "s6", category: "shelter", title: "Ward Place School", area: "Wattala", distanceKm: 8.9, updatedMin: 300, verified: true, status: "available", headline: "55 beds free", tags: ["beds", "families", "wheelchair"], lat: 6.989, lng: 79.891 },
  { id: "s7", category: "shelter", title: "Hospital Annex Shelter", area: "Ragama", distanceKm: 12.4, updatedMin: 90, verified: true, status: "limited", headline: "10 beds free", tags: ["beds", "medical", "wheelchair"], lat: 7.029, lng: 79.922 },
  // Supplies
  { id: "p1", category: "supply", title: "Drinking water, 500 bottles", area: "Katunayake", distanceKm: 4.1, updatedMin: 20, verified: false, status: "limited", headline: "Pickup only", tags: ["stock", "pickup"], lat: 7.169, lng: 79.885 },
  { id: "p2", category: "supply", title: "Dry rations hub", area: "Seeduwa", distanceKm: 7.2, updatedMin: 35, verified: true, status: "available", headline: "320 food packs", tags: ["stock", "pickup", "delivery"], lat: 7.124, lng: 79.883 },
  { id: "p3", category: "supply", title: "Medical supplies point", area: "Negombo", distanceKm: 2.8, updatedMin: 15, verified: true, status: "available", headline: "First-aid kits in stock", tags: ["stock", "pickup"], lat: 7.205, lng: 79.835 },
  { id: "p4", category: "supply", title: "Blankets and mats", area: "Wennappuwa", distanceKm: 11.0, updatedMin: 240, verified: true, status: "available", headline: "150 sets", tags: ["stock", "pickup", "delivery"], lat: 7.35, lng: 79.858 },
  // Volunteers
  { id: "v1", category: "volunteer", title: "Boat crew, 4 volunteers", area: "Kelaniya", distanceKm: 5.6, updatedMin: 8, verified: true, status: "available", headline: "Ready now", tags: ["boat", "vehicle"], lat: 6.9553, lng: 79.9217 },
  { id: "v2", category: "volunteer", title: "Nurses and first-aiders", area: "Negombo", distanceKm: 3.3, updatedMin: 22, verified: true, status: "available", headline: "6 people", tags: ["medical"], lat: 7.2, lng: 79.833 },
  { id: "v3", category: "volunteer", title: "Clean-up team of 12", area: "Ja-Ela", distanceKm: 6.1, updatedMin: 50, verified: false, status: "limited", headline: "From 2 pm", tags: ["vehicle"], lat: 7.074, lng: 79.892 },
  // Transport
  { id: "t1", category: "transport", title: "Truck, seats 20", area: "Katunayake", distanceKm: 4.4, updatedMin: 18, verified: true, status: "available", headline: "Leaves hourly", tags: ["truck"], lat: 7.169, lng: 79.885 },
  { id: "t2", category: "transport", title: "Accessible van", area: "Negombo", distanceKm: 2.2, updatedMin: 30, verified: true, status: "available", headline: "2 wheelchair spaces", tags: ["wheelchair"], lat: 7.21, lng: 79.838 },
  { id: "t3", category: "transport", title: "Boat transfers", area: "Kelaniya", distanceKm: 5.0, updatedMin: 11, verified: false, status: "limited", headline: "One boat running", tags: ["boat"], lat: 6.96, lng: 79.915 },
  // Requests
  { id: "r1", category: "request", title: "Family of 5 needs evacuation", area: "Kelaniya", distanceKm: 5.4, updatedMin: 9, verified: false, status: "critical", headline: "Boat or truck", tags: ["critical", "boat"], lat: 6.9553, lng: 79.9217 },
  { id: "r2", category: "request", title: "Medicine delivery needed", area: "Seeduwa", distanceKm: 4.9, updatedMin: 45, verified: false, status: "open", headline: "Within 24 hours", tags: [], lat: 7.124, lng: 79.883 },
  { id: "r3", category: "request", title: "Elderly couple, no power", area: "Wattala", distanceKm: 7.7, updatedMin: 33, verified: false, status: "critical", headline: "Needs transfer to shelter", tags: ["critical"], lat: 6.989, lng: 79.891 },
];