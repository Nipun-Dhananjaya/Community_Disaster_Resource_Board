import { guideNote, guides } from "../../../../../lib/guides";
import { simplePdf } from "../../../../../lib/server/pdf";

export async function GET(_req: Request, { params }: { params: Promise<{ hazard: string }> }) {
  const { hazard } = await params;
  const g = guides.find((x) => x.key === hazard);
  if (!g) return new Response("Not found", { status: 404 });

  const pdf = simplePdf(
    `${g.heading} - safety guide`,
    [{ heading: "Before", items: g.before }, { heading: "During", items: g.during }, { heading: "After", items: g.after },
     { heading: "Emergency contacts", items: ["Police 119", "Ambulance 1990", "Fire and rescue 110", "Disaster hotline 117"] }],
    guideNote,
  );
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${g.key}-safety-guide.pdf"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
