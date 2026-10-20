// Demo content for the dashboards. Replace with queries to your database.
export const demoRequest = {
  ref: "HR-2041", title: "shelter and food for 4 people", assigned: "Central College Relief Centre",
  message: "Beds ready, bring ID if you can.", stage: 2,
};
export const demoPosts = [
  { id: "p1", title: "Drinking water", status: "limited" as const, qty: "120 bottles", href: "/offer-help/supplies" },
  { id: "p2", title: "Spare room", status: "available" as const, qty: "2 beds", href: "/offer-help/shelter" },
];
export const demoSavedIds = ["s4"];
export const demoOrgRequests = [
  { id: "r1", name: "Family of 5, Kelaniya", needs: "Needs shelter and transport", urgency: "critical" as const, minAgo: 9 },
  { id: "r2", name: "Elderly couple, Negombo", needs: "Needs shelter, mobility aid", urgency: "urgent" as const, minAgo: 31 },
  { id: "r3", name: "Group of 3, Katana", needs: "Needs food and water", urgency: "wait" as const, minAgo: 60 },
];
export const demoOrgListings = [
  { id: "l1", name: "Main hall shelter", type: "Shelter", status: "available" as const, qty: "38 beds", minAgo: 12 },
  { id: "l2", name: "Drinking water", type: "Supplies", status: "limited" as const, qty: "120 bottles", minAgo: 60 },
  { id: "l3", name: "School bus to Katana", type: "Transport", status: "available" as const, qty: "4 seats", minAgo: 120 },
];
export const demoVolunteers = ["Kasun Silva", "Anushka Perera", "Ravi Kumar"];
export const demoClusters = [
  { lat: 6.965, lng: 79.925, count: 14 },
  { lat: 7.17, lng: 79.885, count: 3 },
  { lat: 7.02, lng: 79.875, count: 5 },
];
export const demoUtilization = [
  { label: "Shelter", pct: 84, bar: "bg-ok" },
  { label: "Food and water", pct: 61, bar: "bg-warn" },
  { label: "Transport", pct: 38, bar: "bg-ride" },
  { label: "Medical", pct: 27, bar: "bg-alert" },
];
