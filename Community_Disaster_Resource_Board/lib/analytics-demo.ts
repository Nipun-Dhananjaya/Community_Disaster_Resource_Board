// Demo numbers that match the design. Replace with real queries when a database is connected.
export type Days = 7 | 14 | 30;
const req = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 18, 19, 19, 20, 26, 34, 40, 55, 64, 60, 50, 44, 48, 38, 32, 27, 24];
const ful = req.map((r, i) => Math.max(1, Math.round(r * 0.66) - (i % 3)));

export interface AnalyticsData {
  subtitle: string;
  kpis: { median: { value: string; note: string }; rate: { value: string; note: string }; received: { value: string; note: string }; used: { value: string; note: string } };
  requests: number[]; fulfilled: number[];
  outcome: { fulfilled: number; progress: number; unmatched: number };
  districts: { name: string; requests: number; response: string; fulfilled: number; gap: "covered" | "watch" | "transport" }[];
}

const districts14 = [
  { name: "Gampaha", requests: 184, response: "14 min", fulfilled: 81, gap: "covered" as const },
  { name: "Colombo", requests: 142, response: "21 min", fulfilled: 70, gap: "watch" as const },
  { name: "Kalutara", requests: 96, response: "33 min", fulfilled: 58, gap: "transport" as const },
];
const scale = (f: number) => districts14.map((d) => ({ ...d, requests: Math.round(d.requests * f) }));

export const analytics: Record<Days, AnalyticsData> = {
  7: {
    subtitle: "Last 7 days · All districts",
    kpis: { median: { value: "17 min", note: "↓ 3 min vs last week" }, rate: { value: "70%", note: "↑ 2 points" }, received: { value: "291", note: "31 still open" }, used: { value: "63%", note: "Shelters 86% full" } },
    requests: req.slice(-7), fulfilled: ful.slice(-7), outcome: { fulfilled: 70, progress: 20, unmatched: 10 }, districts: scale(0.55),
  },
  14: {
    subtitle: "Last 14 days · All districts",
    kpis: { median: { value: "18 min", note: "↓ 6 min vs last week" }, rate: { value: "72%", note: "↑ 4 points" }, received: { value: "486", note: "31 still open" }, used: { value: "61%", note: "Shelters 84% full" } },
    requests: req.slice(-14), fulfilled: ful.slice(-14), outcome: { fulfilled: 72, progress: 19, unmatched: 9 }, districts: districts14,
  },
  30: {
    subtitle: "Last 30 days · All districts",
    kpis: { median: { value: "21 min", note: "↓ 2 min vs last month" }, rate: { value: "69%", note: "↑ 6 points" }, received: { value: "1,012", note: "31 still open" }, used: { value: "58%", note: "Shelters 79% full" } },
    requests: req, fulfilled: ful, outcome: { fulfilled: 69, progress: 21, unmatched: 10 }, districts: scale(1.9),
  },
};
