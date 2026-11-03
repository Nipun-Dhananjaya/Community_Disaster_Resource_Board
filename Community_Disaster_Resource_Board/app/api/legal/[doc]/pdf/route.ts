import { legalDocs } from "../../../../../lib/legal";
import { simplePdf } from "../../../../../lib/server/pdf";

const plain = (t: string) => t.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

export async function GET(_req: Request, { params }: { params: Promise<{ doc: string }> }) {
  const { doc: slug } = await params;
  const doc = slug === "privacy" || slug === "terms" ? legalDocs[slug] : undefined;
  if (!doc) return new Response("Not found", { status: 404 });
  const pdf = simplePdf(
    `${doc.title} - Community Disaster Resource Board`,
    [
      { heading: doc.summaryTitle, items: doc.summary },
      ...doc.sections.map((s, i) => ({ heading: `${i + 1}. ${s.title}`, items: s.body.map(plain) })),
    ],
    `Last updated ${doc.updated}.`,
    "",
  );
  return new Response(new Uint8Array(pdf), {
    headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${doc.slug}.pdf"`, "Cache-Control": "public, max-age=3600" },
  });
}
