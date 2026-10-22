/** Tiny text-only PDF writer (Helvetica, A4), so people can save a guide and read it offline. */
const ascii = (s: string) =>
  s.replace(/[’‘]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/[^\x20-\x7e]/g, "?")
    .replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

function wrap(text: string, max: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    if ((cur + " " + w).trim().length > max) { lines.push(cur); cur = w; } else cur = (cur + " " + w).trim();
  }
  if (cur) lines.push(cur);
  return lines;
}

export function simplePdf(title: string, sections: { heading: string; items: string[] }[], footer: string): Buffer {
  type Line = { text: string; font: 1 | 2; size: number; x: number; gap: number };
  const lines: Line[] = [{ text: title, font: 2, size: 20, x: 56, gap: 30 }];
  for (const s of sections) {
    lines.push({ text: s.heading, font: 2, size: 14, x: 56, gap: 26 });
    for (const item of s.items) {
      wrap(item, 78).forEach((t, i) => lines.push({ text: (i === 0 ? "[  ]  " : "        ") + t, font: 1, size: 11, x: 62, gap: 17 }));
    }
    lines.push({ text: "", font: 1, size: 11, x: 56, gap: 8 });
  }
  wrap(footer, 90).forEach((t) => lines.push({ text: t, font: 1, size: 9, x: 56, gap: 13 }));

  const pages: string[] = [];
  let y = 790, buf = "";
  for (const l of lines) {
    if (y - l.gap < 56) { pages.push(buf); buf = ""; y = 790; }
    y -= l.gap;
    if (l.text) buf += `BT /F${l.font} ${l.size} Tf ${l.x} ${y} Td (${ascii(l.text)}) Tj ET\n`;
  }
  pages.push(buf);

  const objs: string[] = [];
  const pageIds = pages.map((_, i) => 5 + i * 2);
  objs[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  objs[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;
  objs[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
  objs[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";
  pages.forEach((content, i) => {
    const id = 5 + i * 2;
    objs[id] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${id + 1} 0 R >>`;
    objs[id + 1] = `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}endstream`;
  });

  let out = "%PDF-1.4\n";
  const offsets: number[] = [];
  for (let i = 1; i < objs.length; i++) {
    offsets[i] = Buffer.byteLength(out);
    out += `${i} 0 obj\n${objs[i]}\nendobj\n`;
  }
  const xref = Buffer.byteLength(out);
  out += `xref\n0 ${objs.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < objs.length; i++) out += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  out += `trailer\n<< /Size ${objs.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(out, "latin1");
}
