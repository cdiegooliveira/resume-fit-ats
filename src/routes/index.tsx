import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  Sparkles, ShieldCheck, BadgeCheck, Ban, Eraser, Copy, FileDown, FileText, Target, AlertTriangle, FlaskConical, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { analyzeResume, type AnalysisResult } from "@/lib/analyze.functions";
import { SAMPLE_JOB, SAMPLE_RESUME } from "@/lib/sample-data";
import { toPlainText, exportPdf, exportDocx, scoreTier } from "@/lib/resume-export";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ResumeMatch ATS — Otimizador de Currículos para ATS" },
      { name: "description", content: "Compare seu currículo com a vaga, veja o Match Score e gere uma versão otimizada para ATS." },
      { property: "og:title", content: "ResumeMatch ATS — Otimizador de Currículos" },
      { property: "og:description", content: "Aumente suas chances de passar pelos filtros automatizados do RH." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const tierClasses = {
  high: { text: "text-success", stroke: "stroke-success", label: "Excelente alinhamento" },
  mid: { text: "text-warning", stroke: "stroke-warning", label: "Bom, mas pode melhorar" },
  low: { text: "text-destructive", stroke: "stroke-destructive", label: "Atenção: faltam termos essenciais" },
};

function Gauge({ score }: { score: number }) {
  const t = tierClasses[scoreTier(score)];
  const r = 70, c = 2 * Math.PI * r;
  return (
    <div className="relative h-44 w-44">
      <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
        <circle cx="80" cy="80" r={r} className="fill-none stroke-muted" strokeWidth="12" />
        <circle cx="80" cy="80" r={r} className={`fill-none ${t.stroke} transition-all duration-1000`} strokeWidth="12"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (score / 100) * c} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-extrabold ${t.text}`}>{score}%</span>
        <span className="text-xs text-muted-foreground">Match Score</span>
      </div>
    </div>
  );
}

function InputPanel({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-semibold">{label}</h2>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {value.length.toLocaleString("pt-BR")} caracteres
          <Button variant="ghost" size="sm" onClick={() => onChange("")} disabled={!value}><Eraser className="h-4 w-4" /> Limpar</Button>
        </div>
      </div>
      <Textarea aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-72 resize-none bg-background" />
    </div>
  );
}

function Index() {
  const [job, setJob] = useState("");
  const [resume, setResume] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const analyze = useServerFn(analyzeResume);

  async function run() {
    if (job.trim().length < 30 || resume.trim().length < 30) { toast.error("Cole a vaga e o currículo (mínimo 30 caracteres cada)."); return; }
    setLoading(true); setResult(null);
    try {
      setResult(await analyze({ data: { job, resume } }));
      setTimeout(() => document.getElementById("resultados")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao analisar.");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen font-sans">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-10 text-center">
          <div className="mb-3 inline-flex items-center gap-2">
            <div className="rounded-lg border bg-secondary p-2"><Target className="h-6 w-6 text-foreground" /></div>
            <h1 className="text-3xl font-semibold">ResumeMatch <span className="text-muted-foreground">ATS</span></h1>
          </div>
          <p className="text-muted-foreground">Aumente suas chances de passar pelos filtros automatizados do RH.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
            {[[BadgeCheck, "100% Gratuito"], [ShieldCheck, "Privacidade Garantida"], [Ban, "Sem Alucinações"]].map(([I, t]) => {
              const Icon = I as typeof BadgeCheck;
              return <span key={t as string} className="inline-flex items-center gap-1 rounded-full border bg-secondary px-3 py-1"><Icon className="h-3.5 w-3.5 text-primary" />{t as string}</span>;
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => { setJob(SAMPLE_JOB); setResume(SAMPLE_RESUME); }}>
            <FlaskConical className="h-4 w-4" /> Testar com exemplo
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <InputPanel label="Descrição da Vaga" value={job} onChange={setJob} placeholder="Cole aqui a descrição da vaga..." />
          <InputPanel label="Currículo Atual" value={resume} onChange={setResume} placeholder="Cole aqui o texto do seu currículo..." />
        </div>
        <Button size="lg" onClick={run} disabled={loading} className="min-h-14 h-auto w-full whitespace-normal py-3 text-base font-semibold">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
          {loading ? "Analisando requisitos da vaga..." : "Analisar e Otimizar Currículo"}
        </Button>

        {loading && (
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-64" /><Skeleton className="h-64 md:col-span-2" /><Skeleton className="h-80 md:col-span-3" />
          </div>
        )}

        {result && <Results r={result} />}
      </main>
    </div>
  );
}

function Results({ r }: { r: AnalysisResult }) {
  const t = tierClasses[scoreTier(r.score)];
  const o = r.optimized;
  return (
    <section id="resultados" className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center">
          <Gauge score={r.score} />
          <p className={`font-semibold ${t.text}`}>{t.label}</p>
          <p className="text-sm text-muted-foreground">{r.diagnosis}</p>
        </div>
        <div className="space-y-5 rounded-xl border bg-card p-6 md:col-span-2">
          <div>
            <h3 className="mb-2 font-semibold">Encontradas <span className="text-muted-foreground">({r.found.length})</span></h3>
            <div className="flex flex-wrap gap-2">{r.found.map((k) => <span key={k} className="rounded-full border border-success/40 bg-success/15 px-3 py-1 text-xs text-success">{k}</span>)}</div>
          </div>
          <div>
            <h3 className="mb-2 font-semibold">Faltantes / Sugeridas <span className="text-muted-foreground">({r.missing.length})</span></h3>
            <div className="flex flex-wrap gap-2">{r.missing.map((k, i) => (
              <span key={k} className={`rounded-full border px-3 py-1 text-xs ${i < 4 ? "border-destructive/40 bg-destructive/15 text-destructive" : "border-warning/40 bg-warning/15 text-warning"}`}>{k}</span>
            ))}</div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm">
        <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
        <p>O ResumeMatch reorganiza sua apresentação para destacar suas competências reais. <strong>Nunca adicione experiências que você não possui.</strong></p>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
          <h3 className="font-semibold">Currículo Ajustado (ATS-Friendly)</h3>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={async () => { await navigator.clipboard.writeText(toPlainText(o)); toast.success("Texto copiado!"); }}><Copy className="h-4 w-4" /> Copiar</Button>
            <Button variant="secondary" size="sm" onClick={() => exportPdf(o)}><FileDown className="h-4 w-4" /> PDF</Button>
            <Button variant="secondary" size="sm" onClick={() => exportDocx(o)}><FileText className="h-4 w-4" /> DOCX</Button>
            <Button variant="secondary" size="sm" onClick={() => {
              const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([toPlainText(o)], { type: "text/plain" })); a.download = "curriculo-ats.txt"; a.click();
            }}><FileText className="h-4 w-4" /> TXT</Button>
          </div>
        </div>
        <div className="space-y-6 p-6 text-sm leading-relaxed">
          <Block title="Resumo Profissional"><p>{o.summary}</p></Block>
          <Block title="Habilidades Principais"><p>{o.skills.join(" • ")}</p></Block>
          <Block title="Experiência Profissional">
            <div className="space-y-4">{o.experience.map((e, i) => (
              <div key={i}>
                <p className="font-semibold">{e.title}{e.company && ` — ${e.company}`}</p>
                {e.period && <p className="text-xs text-muted-foreground">{e.period}</p>}
                <ul className="mt-1 list-disc space-y-1 pl-5">{e.bullets.map((b, j) => <li key={j}>{b}</li>)}</ul>
              </div>
            ))}</div>
          </Block>
          <Block title="Educação"><ul className="list-disc pl-5">{o.education.map((e, i) => <li key={i}>{e}</li>)}</ul></Block>
        </div>
      </div>
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (<div><h4 className="mb-2 border-b pb-1 text-xs font-bold uppercase tracking-wider text-primary">{title}</h4>{children}</div>);
}
