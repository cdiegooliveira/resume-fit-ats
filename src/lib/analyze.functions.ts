import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  job: z.string().min(30).max(20000),
  resume: z.string().min(30).max(20000),
});

const ResultSchema = z.object({
  score: z.number(),
  diagnosis: z.string(),
  found: z.array(z.string()),
  missing: z.array(z.string()),
  optimized: z.object({
    summary: z.string(),
    skills: z.array(z.string()),
    experience: z.array(
      z.object({ title: z.string(), company: z.string(), period: z.string(), bullets: z.array(z.string()) }),
    ),
    education: z.array(z.string()),
  }),
});
export type AnalysisResult = z.infer<typeof ResultSchema>;

const INSTRUCTIONS = `Você é um especialista em ATS (Applicant Tracking Systems) e recrutamento.
Compare a descrição da vaga com o currículo.
1. Extraia hard skills, soft skills, ferramentas, metodologias e requisitos da vaga.
2. "found": termos da vaga presentes (ou com equivalente claro) no currículo. "missing": termos importantes da vaga ausentes no currículo.
3. "score": 0-100, compatibilidade ponderada pela importância dos requisitos. "diagnosis": uma frase curta em português.
4. Reescreva o currículo ATS-friendly em português: resumo alinhado ao título da vaga, habilidades principais, experiências reorganizadas destacando termos que o candidato JÁ possui, educação.
REGRA ANTIFRAUDE: JAMAIS invente cargos, empresas, datas, certificações ou habilidades que não constem no currículo original. Termos faltantes ficam só em "missing". Use apenas dados reais do currículo; se um campo (ex: período) não existir, deixe string vazia.`;

export const analyzeResume = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => InputSchema.parse(d))
  .handler(async ({ data }): Promise<AnalysisResult> => {
    const { createOpenAI } = await import("@ai-sdk/openai");
    const { streamText, Output } = await import("ai");
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) throw new Error("Serviço de IA não configurado.");
    const provider = createOpenAI({
      baseURL: "https://ai.gateway.lovable.dev/v1",
      apiKey,
      headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    });
    let failure: unknown;
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      instructions: INSTRUCTIONS,
      prompt: `DESCRIÇÃO DA VAGA:\n${data.job}\n\nCURRÍCULO ORIGINAL:\n${data.resume}`,
      output: Output.object({ schema: ResultSchema }),
      onError: ({ error }) => {
        failure = error;
      },
      providerOptions: {
        openai: {
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          store: false,
          include: ["reasoning.encrypted_content"],
        },
      },
    } as Parameters<typeof streamText>[0]);
    try {
      const out = (await result.output) as AnalysisResult;
      out.score = Math.max(0, Math.min(100, Math.round(out.score)));
      return out;
    } catch (e) {
      const err = (failure ?? e) as { statusCode?: number; message?: string };
      console.error("analyze failed", err);
      if (err?.statusCode === 429) throw new Error("Muitas solicitações. Tente novamente em instantes.");
      if (err?.statusCode === 402) throw new Error("Créditos de IA esgotados. Adicione créditos ao workspace.");
      throw new Error("Não foi possível analisar agora. Tente novamente.");
    }
  });
