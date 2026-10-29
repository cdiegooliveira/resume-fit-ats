import type { AnalysisResult } from "./analyze.functions";

type Optimized = AnalysisResult["optimized"];

export function scoreTier(score: number): "high" | "mid" | "low" {
  if (score >= 75) return "high";
  if (score >= 50) return "mid";
  return "low";
}

export function toPlainText(o: Optimized): string {
  const exp = o.experience
    .map((e) => [`${e.title}${e.company ? ` — ${e.company}` : ""}`, e.period, ...e.bullets.map((b) => `- ${b}`)].filter(Boolean).join("\n"))
    .join("\n\n");
  return `RESUMO PROFISSIONAL\n${o.summary}\n\nHABILIDADES PRINCIPAIS\n${o.skills.join(", ")}\n\nEXPERIÊNCIA PROFISSIONAL\n${exp}\n\nEDUCAÇÃO\n${o.education.map((e) => `- ${e}`).join("\n")}\n`;
}

export async function exportPdf(o: Optimized) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 50, width = doc.internal.pageSize.getWidth() - margin * 2, pageH = doc.internal.pageSize.getHeight();
  let y = margin;
  const write = (text: string, size = 10, bold = false, gap = 4) => {
    doc.setFont("helvetica", bold ? "bold" : "normal").setFontSize(size);
    for (const line of doc.splitTextToSize(text, width) as string[]) {
      if (y > pageH - margin) { doc.addPage(); y = margin; }
      doc.text(line, margin, y); y += size + 3;
    }
    y += gap;
  };
  for (const block of toPlainText(o).split("\n\n")) {
    const lines = block.split("\n");
    lines.forEach((l, i) => write(l, i === 0 && l === l.toUpperCase() && l.length > 3 ? 12 : 10, i === 0, i === lines.length - 1 ? 8 : 0));
  }
  doc.save("curriculo-ats.pdf");
}

export async function exportDocx(o: Optimized) {
  const { Document, Packer, Paragraph, HeadingLevel, TextRun } = await import("docx");
  const h = (t: string) => new Paragraph({ text: t, heading: HeadingLevel.HEADING_2 });
  const p = (t: string, bold = false) => new Paragraph({ children: [new TextRun({ text: t, bold })] });
  const b = (t: string) => new Paragraph({ text: t, bullet: { level: 0 } });
  const children = [
    h("Resumo Profissional"), p(o.summary),
    h("Habilidades Principais"), p(o.skills.join(", ")),
    h("Experiência Profissional"),
    ...o.experience.flatMap((e) => [p(`${e.title}${e.company ? ` — ${e.company}` : ""}`, true), ...(e.period ? [p(e.period)] : []), ...e.bullets.map(b)]),
    h("Educação"), ...o.education.map(b),
  ];
  const blob = await Packer.toBlob(new Document({ sections: [{ children }] }));
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = "curriculo-ats.docx"; a.click();
}
