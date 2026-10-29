#  Resume Fit ATS - Otimizador Inteligente de Currículos

> Aplicação web desenvolvida para o desafio de projeto da DIO utilizando **Lovable.dev**, **React**, **Tailwind CSS** e **Shadcn/ui**.

🔗 **Aplicação no Ar:** [https://resume-fit-ats.lovable.app](https://resume-fit-ats.lovable.app)

---

##  O Problema
Muitos currículos bem qualificados são descartados por sistemas de triagem automática (ATS - Applicant Tracking System) antes de chegar às mãos do RH. Isso ocorre por falta de correspondência exata nas palavras-chave exigidas pela vaga ou por formatação inadequada para leitura automatizada.

##  A Solução
O **Resume Fit ATS** analisa o currículo do candidato em simultâneo com a descrição da vaga desejada, fornecendo:
- **Match Score:** Porcentagem de compatibilidade em tempo real.
- **Diagnóstico de Palavras-Chave:** Termos identificados e lacunas críticas.
- **Reescrita Ajustada:** Versão formatada do currículo que destaca competências reais **sem nunca inventar experiências falsas**.

---

##  Demonstração da Aplicação

<img width="1919" height="917" alt="image" src="https://github.com/user-attachments/assets/7ac5b4c2-16c3-4c56-ad81-da607417f7ce" />

<img width="1919" height="917" alt="image" src="https://github.com/user-attachments/assets/c51bc0fb-b706-4910-ba80-a356c4e1e2da" />



---

##  Tecnologias Utilizadas
- **IA & Prototipagem:** Lovable.dev
- **Frontend:** React, TypeScript, Vite
- **Estilização:** Tailwind CSS, Shadcn/ui
- **Ícones:** Lucide React

---

##  Mega Prompt Utilizado

<details>
<summary>Clique para expandir o Mega Prompt em Markdown</summary>

```markdown
# Mega Prompt: ResumeMatch ATS

Crie uma aplicação web responsiva, moderna e minimalista chamada ResumeMatch ATS.
O objetivo da aplicação é comparar o texto do currículo do candidato com a descrição de uma vaga de emprego, calcular a porcentagem de compatibilidade (Match Score), destacar palavras-chave encontradas e faltantes, e gerar uma versão otimizada do currículo formatada para sistemas ATS.

- UI Layout: Fundo Slate 950 (Dark mode), duas colunas para colar vaga e currículo, botão principal "Analisar e Otimizar Currículo".
- Painel de Resultados: Gráfico circular de pontuação, badges verdes (encontradas), badges vermelhas/amarelas (faltantes) e aviso ético contra alucinações.
- Regra Ética: Reorganizar dados reais sem inventar cargos, datas ou competências ausentes.
