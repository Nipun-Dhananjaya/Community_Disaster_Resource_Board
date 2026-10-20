import { accountNav, adminNav, orgNav, type Role } from "../../lib/roles";
import { DashboardShell } from "./DashboardShell";
import { PageHeader } from "./ui";

type Header = { title: string; subtitle: string; action?: { href: string; label: string } };

export function AccountFrame({ children, ...h }: Header & { children: React.ReactNode }) {
  return (
    <DashboardShell brand={["My account", "Dashboard"]} nav={accountNav}>
      <PageHeader {...h} />
      {children}
    </DashboardShell>
  );
}
export function OrgFrame({ children, ...h }: Header & { children: React.ReactNode }) {
  return (
    <DashboardShell brand={["Relief Centre", "Console"]} nav={orgNav}>
      <PageHeader {...h} />
      {children}
    </DashboardShell>
  );
}
export function AdminFrame({ role, children, ...h }: Header & { role: Role; children: React.ReactNode }) {
  const nav = role === "admin" ? adminNav : adminNav.filter((n) => !n.adminOnly);
  return (
    <DashboardShell brand={["Admin", "Console"]} nav={nav}>
      <PageHeader {...h} />
      {children}
    </DashboardShell>
  );
}
