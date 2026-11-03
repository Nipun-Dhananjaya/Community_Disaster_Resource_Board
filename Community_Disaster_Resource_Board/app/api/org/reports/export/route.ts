import { csvCell, isPeriod, periodLabel, reports } from "../../../../../lib/reports-demo";
import { fail, getApi } from "../../../../../lib/server/http";
import { simplePdf } from "../../../../../lib/server/pdf";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const g = await getApi(["organization"]);
  if ("response" in g) return g.response;
  if (g.session.orgStatus !== "approved") return fail(403, "Your organization hasn’t been approved yet");

  const url = new URL(req.url);
  const p = url.searchParams.get("period");
  const period = isPeriod(p) ? p : "week";
  const format = url.searchParams.get("format") === "pdf" ? "pdf" : "csv";
  const summary = url.searchParams.get("type") === "summary";
  const r = reports[period];
  const org = g.session.name;

  if (format === "csv") {
    const rows: (string | number)[][] = [
      ["Report", `${org} - ${periodLabel[period]}`], [],
      ["Metric", "Value", "Note"],
      ["People sheltered", r.people.value, r.people.note], ["Meals served", r.meals.value, r.meals.note],
      ["Requests fulfilled", r.fulfilled.value, `of ${r.fulfilled.of} received`], ["Average response time (min)", r.response.min, r.response.note], [],
      [r.chartTitle, "People"], ...r.chart.map((c) => [c.label, c.value]), [],
      ["Item", "Given out", "Left"], ...r.supplies.map((s) => [s.item, s.given, s.left]),
    ];
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="report-${period}.csv"`, "Cache-Control": "no-store" } });
  }

  const sections = [
    { heading: "Totals", items: [
      `People sheltered: ${r.people.value} (${r.people.note})`, `Meals served: ${r.meals.value} (${r.meals.note})`,
      `Requests fulfilled: ${r.fulfilled.value} of ${r.fulfilled.of} received`, `Average response time: ${r.response.min} min (${r.response.note.replace("↓", "down")})`,
    ] },
    { heading: r.chartTitle, items: [r.chart.map((c) => `${c.label} ${c.value}`).join(", ")] },
    { heading: "Supplies distributed", items: r.supplies.map((s) => `${s.item}: ${s.given} given out, ${s.left} left`) },
    ...(summary ? [{ heading: "Gaps and volunteer hours", items: ["Night and weekend shifts are the least covered. See the Volunteers page for the schedule.", "Volunteer hours this week: 318."] }] : []),
  ];
  const pdf = simplePdf(`${org} - ${summary ? "Incident summary for partners" : "Report"} (${periodLabel[period]})`, sections, "Reports show only totals. No personal details are included.", "-");
  return new Response(new Uint8Array(pdf), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${summary ? "incident-summary" : "report"}-${period}.pdf"`, "Cache-Control": "no-store" },
  });
}
