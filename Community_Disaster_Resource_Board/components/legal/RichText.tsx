import Link from "next/link";

/** Renders plain text, turning [label](/path) into a link. */
export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);
  return (
    <>
      {parts.map((p, i) => {
        const m = p.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
        return m ? <Link key={i} href={m[2]} className="font-semibold text-navy underline underline-offset-2">{m[1]}</Link> : <span key={i}>{p}</span>;
      })}
    </>
  );
}
