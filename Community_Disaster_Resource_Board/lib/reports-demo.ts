// Demo numbers that match the design. Replace with real totals from your database.
export type Period = "today" | "week" | "incident";
export const periods: Period[] = ["today", "week", "incident"];
export const periodLabel: Record<Period, string> = { today: "Today", week: "This week", incident: "This incident" };

export interface ReportData {
  subtitle: string;
  people: { value: number; note: string }; meals: { value: number; note: string };
  fulfilled: { value: number; of: number }; response: { min: number; note: string };
  chartTitle: string; chart: { label: string; value: number }[];
  supplies: { item: string; given: string; left: string }[];
}

export const reports: Record<Period, ReportData> = {
  week: {
    subtitle: "this week",
    people: { value: 505, note: "Since Monday" }, meals: { value: 1420, note: "3 per person per day" },
    fulfilled: { value: 63, of: 88 }, response: { min: 16, note: "↓ 4 min" },
    chartTitle: "People sheltered per day",
    chart: [["Mon", 52], ["Tue", 64], ["Wed", 78], ["Thu", 91], ["Fri", 84], ["Sat", 70], ["Sun", 66]].map(([label, value]) => ({ label: String(label), value: Number(value) })),
    supplies: [
      { item: "Drinking water", given: "820 bottles", left: "180" }, { item: "Blankets", given: "210", left: "40" },
      { item: "Hot meals", given: "1,420", left: "—" }, { item: "Medicine kits", given: "35", left: "12" },
    ],
  },
  today: {
    subtitle: "today",
    people: { value: 66, note: "Since midnight" }, meals: { value: 198, note: "3 per person per day" },
    fulfilled: { value: 9, of: 14 }, response: { min: 15, note: "↓ 2 min" },
    chartTitle: "People sheltered today",
    chart: [["6 am", 58], ["9 am", 62], ["12 pm", 64], ["3 pm", 66], ["6 pm", 66], ["9 pm", 66]].map(([label, value]) => ({ label: String(label), value: Number(value) })),
    supplies: [
      { item: "Drinking water", given: "120 bottles", left: "180" }, { item: "Blankets", given: "18", left: "40" },
      { item: "Hot meals", given: "198", left: "—" }, { item: "Medicine kits", given: "4", left: "12" },
    ],
  },
  incident: {
    subtitle: "since the flooding began",
    people: { value: 1240, note: "Since the incident began" }, meals: { value: 3720, note: "3 per person per day" },
    fulfilled: { value: 141, of: 190 }, response: { min: 17, note: "↓ 1 min" },
    chartTitle: "People sheltered per day",
    chart: [40, 55, 70, 88, 104, 120, 118, 110, 100, 95, 70, 66].map((value, i) => ({ label: `D${i + 1}`, value })),
    supplies: [
      { item: "Drinking water", given: "2,310 bottles", left: "180" }, { item: "Blankets", given: "560", left: "40" },
      { item: "Hot meals", given: "3,720", left: "—" }, { item: "Medicine kits", given: "96", left: "12" },
    ],
  },
};

export const isPeriod = (x: string | null): x is Period => !!x && (periods as string[]).includes(x);

export const csvCell = (v: string | number) => {
  let s = String(v);
  if (/^[=+\-@]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
