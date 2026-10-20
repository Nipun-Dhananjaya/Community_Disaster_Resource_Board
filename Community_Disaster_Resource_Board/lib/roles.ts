export type Role = "individual" | "volunteer" | "organization" | "moderator" | "admin";
export type OrgStatus = "none" | "pending" | "approved" | "rejected";

export const registrableRoles = ["individual", "volunteer", "organization"] as const;
export const privilegedRoles: Role[] = ["moderator", "admin"];

export const roleLabel: Record<Role, string> = {
  individual: "Individual", volunteer: "Volunteer", organization: "Organization", moderator: "Moderator", admin: "Admin",
};

/** Where each role lands after logging in (when they didn't come from another page). */
export function homeFor(role: Role): string {
  if (role === "admin" || role === "moderator") return "/admin";
  if (role === "organization") return "/org";
  return "/account";
}

export interface NavEntry { href: string; label: string; exact?: boolean; adminOnly?: boolean }

export const accountNav: NavEntry[] = [
  { href: "/account", label: "Overview", exact: true },
  { href: "/account/requests", label: "My requests" },
  { href: "/account/posts", label: "My posts" },
  { href: "/account/saved", label: "Saved" },
  { href: "/account/messages", label: "Messages" },
  { href: "/account/settings", label: "Settings" },
];
export const orgNav: NavEntry[] = [
  { href: "/org", label: "Overview", exact: true },
  { href: "/org/my-listings", label: "My listings" },
  { href: "/org/incoming-requests", label: "Incoming requests" },
  { href: "/org/volunteers", label: "Volunteers" },
  { href: "/org/reports", label: "Reports" },
  { href: "/org/settings", label: "Settings" },
];
export const adminNav: NavEntry[] = [
  { href: "/admin", label: "Overview", exact: true },
  { href: "/admin/moderation", label: "Moderation" },
  { href: "/admin/incidents", label: "Incidents" },
  { href: "/admin/users", label: "Users", adminOnly: true },
  { href: "/admin/map-overview", label: "Map overview" },
  { href: "/admin/analytics", label: "Analytics", adminOnly: true },
  { href: "/admin/audit-log", label: "Audit log", adminOnly: true },
];

export interface MenuItem { href: string; label: string }

/** Items in the header's avatar menu. The role decides what is shown. */
export function menuFor(role: Role, orgStatus: OrgStatus): MenuItem[] {
  if (role === "organization") {
    return orgStatus === "approved"
      ? [
          { href: "/org", label: "Organization dashboard" },
          { href: "/org/my-listings", label: "My listings" },
          { href: "/org/incoming-requests", label: "Incoming requests" },
          { href: "/org/settings", label: "Settings" },
        ]
      : [{ href: "/org", label: "Registration status" }];
  }
  const items: MenuItem[] = [
    { href: "/account", label: "My account" },
    { href: "/account/requests", label: "My requests" },
    { href: "/account/posts", label: "My posts" },
    { href: "/account/saved", label: "Saved" },
    { href: "/account/messages", label: "Messages" },
    { href: "/account/settings", label: "Settings" },
  ];
  if (role === "admin" || role === "moderator") items.push({ href: "/admin", label: "Admin console" });
  return items;
}
