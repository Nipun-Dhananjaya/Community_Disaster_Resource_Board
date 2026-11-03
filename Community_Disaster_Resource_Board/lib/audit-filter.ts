import type { AuditEntry } from "./server/data";

export const PAGE_SIZE = 8;
export const rangeOptions = [
  { value: "24h", label: "Last 24 hours", ms: 86_400_000 }, { value: "7d", label: "Last 7 days", ms: 7 * 86_400_000 },
  { value: "30d", label: "Last 30 days", ms: 30 * 86_400_000 }, { value: "all", label: "Last 12 months", ms: 365 * 86_400_000 },
];
export interface AuditQuery { q: string; role: string; action: string; range: string; page: number }

export function parseQuery(sp: Record<string, string | string[] | undefined>): AuditQuery {
  const one = (k: string) => (Array.isArray(sp[k]) ? sp[k]![0] : (sp[k] as string | undefined)) ?? "";
  const range = rangeOptions.some((r) => r.value === one("range")) ? one("range") : "24h";
  return { q: one("q").slice(0, 80), role: one("role") || "all", action: one("action") || "all", range, page: Math.max(1, parseInt(one("page")) || 1) };
}

export function filterAudit(all: AuditEntry[], q: AuditQuery) {
  const ms = rangeOptions.find((r) => r.value === q.range)!.ms;
  const needle = q.q.trim().toLowerCase();
  return all.filter((e) =>
    Date.now() - new Date(e.at).getTime() <= ms &&
    (q.role === "all" || e.role === q.role) &&
    (q.action === "all" || e.action === q.action) &&
    (!needle || `${e.actor} ${e.action} ${e.target}`.toLowerCase().includes(needle)));
}
