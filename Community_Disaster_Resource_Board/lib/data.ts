export type Tone = "ok" | "warn" | "alert" | "care" | "ride";

export const emergencyLines = { life: "119", hotline: "117" };

export const incident = {
  name: "Kelani River flooding",
  areas: "Gampaha and Colombo districts",
  severity: "high",
  updatedMinAgo: 14,
};

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/board", label: "Resource Board" },
  { href: "/request-help", label: "Request Help" },
  { href: "/offer-help", label: "Offer Help" },
  { href: "/alerts", label: "Alerts" },
  { href: "/safety-guides", label: "Safety Guides" },
];

export const stats: { value: number; label: string; tone: Tone; icon: IconName }[] = [
  { value: 42, label: "Shelters open", tone: "ok", icon: "home" },
  { value: 118, label: "Supply points", tone: "warn", icon: "box" },
  { value: 76, label: "Volunteers ready", tone: "care", icon: "heart" },
  { value: 19, label: "Rides offered", tone: "ride", icon: "arrow" },
  { value: 31, label: "Open requests", tone: "alert", icon: "alert" },
];

export type IconName = "home" | "box" | "heart" | "arrow" | "alert" | "check" | "plus" | "bolt" | "dots";

export const updates: {
  id: string;
  tone: Tone;
  icon: IconName;
  title: string;
  verified?: boolean;
  badge: { label: string; tone: Tone; alert?: boolean; dot?: boolean };
  headline: string;
  meta: string;
}[] = [
  {
    id: "st-marys",
    tone: "ok",
    icon: "home",
    title: "St. Mary’s Church Hall",
    verified: true,
    badge: { label: "Available", tone: "ok", dot: true },
    headline: "24 beds free",
    meta: "Negombo · 2.4 km · Updated 6 min ago",
  },
  {
    id: "water",
    tone: "warn",
    icon: "box",
    title: "Drinking water, 500 bottles",
    badge: { label: "Limited", tone: "warn", alert: true },
    headline: "Pickup only",
    meta: "Katunayake · 4.1 km · Updated 20 min ago",
  },
  {
    id: "family",
    tone: "alert",
    icon: "alert",
    title: "Family of 5 needs evacuation",
    badge: { label: "Critical", tone: "alert", alert: true },
    headline: "Boat or truck",
    meta: "Kelaniya · Critical · Posted 9 min ago",
  },
];

export const steps = [
  { title: "Search", body: "Filter by what you need and how far you can go." },
  { title: "Contact or request", body: "Call a listing, or post a request in four short steps." },
  { title: "Stay updated", body: "Get alerts by SMS, email or app for your area." },
];

export const mapPins: {
  id: string;
  x: number; // % of map width
  y: number; // % of map height
  tone: Tone;
  icon?: IconName;
  count?: number;
  label: string;
}[] = [
  { id: "p1", x: 42, y: 20, tone: "warn", icon: "box", label: "Supply point" },
  { id: "p2", x: 85, y: 25, tone: "ok", icon: "home", label: "Shelter" },
  { id: "p3", x: 20, y: 30, tone: "ok", icon: "home", label: "Shelter" },
  { id: "p4", x: 62, y: 42, tone: "alert", icon: "alert", label: "Assistance request" },
  { id: "p5", x: 72, y: 45, tone: "care", count: 8, label: "8 listings, zoom to expand" },
  { id: "p6", x: 30, y: 61, tone: "ok", icon: "home", label: "Shelter" },
  { id: "p7", x: 14, y: 70, tone: "care", count: 5, label: "5 listings, zoom to expand" },
  { id: "p8", x: 50, y: 70, tone: "care", icon: "heart", label: "Volunteers" },
  { id: "p9", x: 80, y: 66, tone: "ride", icon: "arrow", label: "Ride offered" },
];

export const featured = {
  title: "Central College Relief Centre",
  status: "Available",
  headline: "38 beds free",
  meta: "1.2 km · Updated 12 min ago",
};
