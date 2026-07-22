# Relatório de Pesquisa — Claude Skills para Vídeo, Turismo, Instagram e Automação de Conteúdo

**Diretor de Pesquisa de Marketing · Bomgo / Terramaris**
Data: 22/07/2026 · Método: busca em marketplaces + clone e leitura do código-fonte real de 11 repositórios + teste funcional

---

## Metodologia (o que foi realmente verificado)

Não confiei em descrições de marketplace. Clonei 11 repositórios candidatos em ambiente isolado
(`scratchpad/skills-lab/`) e li os `SKILL.md` reais para conferir: existência, licença, dependências,
custo e qualidade da instrução.

**Isso derrubou 3 candidatos bem ranqueados nas buscas:**

| Repositório | O que prometia | O que é de fato |
|---|---|---|
| `wilwaldon/Claude-Code-Video-Toolkit` | "Skills, MCP servers e tools para vídeo" | **Só um README** com links. Zero `SKILL.md`. Não é instalável. |
| `prateekjain98/social-media-manager-skills` | "29 Claude AI skills" | 38 arquivos `.md` soltos, **nenhum é `SKILL.md`** com frontmatter. É biblioteca de prompts, não Agent Skills. Não auto-ativa. |
| `TravelSkills.io` (única lib de turismo que existe) | 6 skills de turismo | **Vaporware.** Página de pré-lançamento: "first skills releasing in the second half of 2026". Repo vazio. |

**Conclusão estrutural nº 1:** não existe hoje nenhuma Claude Skill madura específica de
turismo/hotelaria/short-term rental. O nicho está vago. Isso é risco (nada pronto) e oportunidade
(a Bomgo pode publicar a primeira — ver Recomendação Final).

**Conclusão estrutural nº 2:** nenhuma skill "gera vídeo" sozinha. Elas se dividem em três camadas
que precisam ser combinadas:

1. **Prompting** (grátis) — escreve o prompt certo para Veo/Kling/Sora.
2. **Execução** (paga, API) — chama o modelo e baixa o MP4.
3. **Composição** (grátis, código) — Remotion/FFmpeg monta legenda, marca, corte, trilha.

---

## As 10 melhores opções

### 1. `Square-Zero-Labs/video-prompting` — **melhor custo-benefício absoluto**

- **Repo:** https://github.com/Square-Zero-Labs/video-prompting · MIT · 1 skill + `references/models/`
- **O que faz:** roteia para o guia de prompting do modelo certo (Veo 3/3.1, Sora 2, Kling, Seedance 2.0, LTX-2, Wan 2.2, Ovi) e escreve o prompt no formato que aquele modelo espera. Inclui workflow de *character sheet* para consistência entre clipes.
- **Vantagens:** custo zero, sem API key, sem dependência. As referências são derivadas do guia oficial do Google Cloud para Veo 3.1 — fórmula de 5 partes `[Cinematografia] + [Sujeito] + [Ação] + [Contexto] + [Estilo e Ambiência]`, direção de áudio (SFX/ambiência/diálogo) e a regra correta de prompt negativo (descrever a ausência, não dizer "sem X").
- **Limitações:** só escreve o prompt. Você cola manualmente no Veo/Kling. Não renderiza, não versiona, não sabe nada da sua marca sem você contar.
- **Uso na Bomgo/Terramaris:** é a peça nº 1. Todo reel de drone, piscina, pôr do sol e quarto vira prompt reprodutível. Ver teste funcional abaixo.

### 2. `smixs/visual-skills` — **maior profundidade criativa**

- **Repo:** https://github.com/smixs/visual-skills · 2 skills (`video`, `image`)
- **O que faz:** assume o papel de diretor + roteirista + editor. O `SKILL.md` é deliberadamente magro e obriga a carregar `references/dramaturgy.md` (fórmula de cena, Lei dos Detalhes, Regra dos Seis de Murch, storyboard de 3 camadas, ficha de plano com 14 campos) e `universal-rules.md` (U1–U12) **antes** de escrever qualquer prompt. Cobre Nano Banana (Gemini 3), GPT Image 2, Seedance 2.0, Kling 3.0, Veo.
- **Vantagens:** é a única que ataca o problema real — "prompt bonito sem dramaturgia é papel de parede". Gera storyboard, shot list e continuidade entre clipes, não frases soltas. Cobre imagem *e* vídeo.
- **Limitações:** pesada em contexto (força leitura de vários arquivos por request, gasta tokens). Descrição do skill está parcialmente em russo — os gatilhos podem não disparar bem em português; exige ajuste no frontmatter.
- **Uso na Bomgo/Terramaris:** para a peça-âncora da campanha (o reel de drone chegando no condomínio), onde vale gastar contexto. Use a nº 1 para volume, a nº 2 para o hero.

### 3. `haidrrrry/claude-remotion-skill` — **a melhor skill técnica do lote**

- **Repo:** https://github.com/haidrrrry/claude-remotion-skill · 1 skill + `motion-patterns.md`
- **O que faz:** gera vídeo programático de verdade (React → MP4) via Remotion, com 10 regras não-negociáveis de motion design: proibido easing linear, entrada anima 2–3 propriedades juntas, stagger de 3–6 frames, saída mais rápida que entrada, stack de 5 camadas por cena, Ken Burns obrigatório em toda imagem parada, micro-movimento em elementos ociosos, timing derivado de `fps`, um único objeto de tema, e "renderize, extraia frames, **olhe**, corrija".
- **Vantagens:** saída determinística, editável e reproduzível — mesmo texto, mesma cor, mesmo timing, re-renderizável para sempre. Custo zero de API. Perfeito para overlays de marca, preço e CTA.
- **Limitações:** **não gera imagem nem filmagem** — só motion graphics sobre assets que você já tem. Exige Node + projeto Remotion. Renderização é pesada em CPU local.
- **Uso na Bomgo/Terramaris:** camada de marca. Pega o clipe de drone (Veo ou filmagem real), aplica lower-third "Terramaris · Praia do Forte", card de diária, animação do CTA "Comente TERRAMARIS" e o logo Bomgo — idêntico em todas as 12 campanhas.

### 4. `fal-ai-community/skills` — **o único pipeline ponta-a-ponta**

- **Repo:** https://github.com/fal-ai-community/skills · 17 skills
- **O que faz:** bundle oficial da comunidade fal.ai. Destaques: `marketing` (matriz de campanha, variantes de paid social, kit de lançamento), `commercial`, `cinematography`, `storytelling`, `ugc`, `character-design`, `model-routing` (escolhe o endpoint certo automaticamente), `fal-models-catalog`.
- **Vantagens:** é a única opção que **executa** — descobre o endpoint, inspeciona o schema, roda e baixa o arquivo, via CLI `genmedia`. Pensa em campanha (matriz de assets), não em asset isolado. O skill `marketing` proíbe explicitamente inventar prova social, selos e claims legais — alinhado com o histórico de vocês de remover disclaimer falso.
- **Limitações:** exige `FAL_KEY` e é **pago por geração** (custo variável por modelo). Sem licença declarada no repo — verificar antes de uso comercial. Depende de instalar o CLI `genmedia` separado.
- **Uso na Bomgo/Terramaris:** quando a campanha virar volume (12 campanhas × 3 formatos), é aqui que se automatiza. O `ugc` gera depoimento estilo hóspede; o `commercial` gera o filme de 15s do resort.

### 5. `charlie947/social-media-skills` — **melhor engenharia de conteúdo**

- **Repo:** https://github.com/charlie947/social-media-skills · MIT · 17 skills
- **O que faz:** o sistema real por trás de 350k+ seguidores. Relevantes: `voice-builder` (extrai arquivo de voz da marca a partir de entrevista), `hook-generator`, `reels-scripting` (raspa um Reel de referência via Apify → analisa com Gemini 2.5 Flash → escreve roteiro novo aplicando o mesmo padrão), `post-scorer`, `content-matrix`, `gemini-carousel`, `analytics-dashboard`.
- **Vantagens:** `voice-builder` é a peça que falta em todas as outras — sem ele, toda skill de copy escreve genérico. `reels-scripting` é engenharia reversa de conteúdo que já provou performar, não achismo.
- **Limitações:** forte viés LinkedIn (12 das 17 skills). **Zero skill de Stories** — e o briefing da CAMPANHA 001 tem Story. `reels-scripting` e `post-scorer` exigem `APIFY_API_TOKEN` (pago) + `GOOGLE_AI_API_KEY`.
- **Uso na Bomgo/Terramaris:** rode `voice-builder` **uma vez** com você para fixar a voz da Bomgo, e reuse esse arquivo em todas as outras skills da lista. Depois `hook-generator` em cada campanha.

### 6. `bradautomates/head-of-content` — **melhor inteligência competitiva**

- **Repo:** https://github.com/bradautomates/head-of-content · 6 skills
- **O que faz:** `instagram-research` (raspa contas monitoradas via Apify Instagram Scraper, identifica outliers de performance, analisa os top 5 vídeos com IA e devolve fórmulas de hook acionáveis), `video-content-analyzer`, `content-planner`, `tiktok-research`, `youtube-research`, `x-research`.
- **Vantagens:** é a única que responde "o que está funcionando **agora** no meu nicho" com dado real, não com opinião do modelo. Feito para Claude Code e Cowork.
- **Limitações:** exige `APIFY_TOKEN` + `GEMINI_API_KEY` e pacotes Python. Custo de scraping cresce com o número de contas. Depende de configurar `.claude/context/instagram-accounts.md`.
- **Uso na Bomgo/Terramaris:** monitorar 15–20 perfis (resorts e temporada em Porto das Dunas, Aquiraz, Beach Park, Beira-Mar/Fortaleza + contas de viagem CE). Antes de cada campanha, extrair o padrão de hook que está performando na região.

### 7. `OpenClaudia/openclaudia-skills` — **maior cobertura, o "canivete suíço"**

- **Repo:** https://github.com/OpenClaudia/openclaudia-skills · licenciado · **73 skills**
- **O que faz:** departamento de marketing inteiro. Relevantes aqui: `social-content` (formatos nativos por plataforma, limites, hashtags, repurposing), `copywriting`, `copy-editing`, `content-strategy`, `video-ad-analysis`, `stock-images` (Unsplash + overlay de texto), `launch-strategy`, `seo-content-brief`, `programmatic-seo`, `write-landing`, `brand-monitor`, `icp-builder`, `google-analytics`.
- **Vantagens:** a maior biblioteca real e coerente que encontrei. Skills declaram `allowed-tools` corretamente. `programmatic-seo` + `write-landing` transferem direto para as páginas de imóvel do app.
- **Limitações:** amplitude, não profundidade — `social-content` é competente mas genérico, perde para a nº 5 em Reels. Várias skills exigem contas pagas (Ahrefs, Semrush, Similarweb). 73 skills instaladas de uma vez poluem o disparo automático; instale seletivamente.
- **Uso na Bomgo/Terramaris:** `copywriting` para a PDP dos imóveis, `programmatic-seo` para gerar páginas de destino em escala ("casas de temporada em Praia do Forte"), `video-ad-analysis` para dissecar anúncio de concorrente.

### 8. `kdowswell/veo-tools` — **execução Veo com loop perfeito**

- **Repo:** https://github.com/kdowswell/veo-tools · licenciado · 4 skills (`veo`, `veo-setup`, `veo-multi-shot`, `video-loop`)
- **O que faz:** gera vídeo com Veo 3.1 via Vertex AI. `veo-setup` automatiza GCP (cria projeto, habilita APIs, service account, env vars). `video-loop` produz loop sem emenda. Workflow em fases com aprovação obrigatória do usuário antes de gastar geração.
- **Vantagens:** o `veo-setup` remove a pior parte (configurar Vertex AI). O gate de aprovação antes de gerar protege o orçamento. `video-loop` resolve o caso de vídeo de fundo em hero de site.
- **Limitações:** amarrado ao Google Cloud/Vertex — exige projeto GCP com faturamento, `gcloud` CLI e cota de Veo aprovada. Custo por segundo gerado. Só Veo, sem alternativa se o modelo recusar o prompt.
- **Uso na Bomgo/Terramaris:** `video-loop` para o vídeo de fundo da home do bomgo.com; `veo-multi-shot` para o reel de chegada no condomínio em 3 planos encadeados.

### 9. `ychoi-kr/claude-ffmpeg-skill` + Remotion oficial — **infraestrutura de mídia**

- **Repos:** https://github.com/ychoi-kr/claude-ffmpeg-skill · https://www.remotion.dev/docs/ai/skills (`npx skills add remotion`)
- **O que faz:** FFmpeg cobre encode, compressão, conversão de formato e processamento em lote. O skill oficial do Remotion é a referência canônica mantida pelo próprio time.
- **Vantagens:** grátis, local, sem API. Resolve o trabalho chato invisível: exportar 9:16 para Reels, 4:5 para feed e 1:1 para anúncio a partir de um master; comprimir para o limite do Instagram; extrair thumbnail. O skill oficial do Remotion garante API correta enquanto a nº 3 garante o gosto — use os dois juntos.
- **Limitações:** não tem opinião criativa nenhuma. Exige `ffmpeg` instalado localmente.
- **Uso na Bomgo/Terramaris:** o pipeline de saída. Um master → 4 formatos automaticamente, para todo imóvel do catálogo.

### 10. `vanities/social-skills` — **a única que publica de fato · ATENÇÃO A RISCO**

- **Repo:** https://github.com/vanities/social-skills · licenciado · 17 skills
- **O que faz:** publica de verdade em IG/LinkedIn/X/Pinterest/TikTok dirigindo um Chrome real via `agent-browser`. Sem API de plataforma. Tem skills de `*-login`, `*-post` e `*-warm` (aquecimento de conta).
- **Vantagens:** fecha o ciclo — é a única do lote que leva o post até publicado. Contorna a burocracia da Graph API da Meta. Skills bem construídas (verificação pós-publicação, limpeza de abas, mapeamento label↔handle).
- **Limitações — leia antes de usar:**
  - Exige **guardar usuário e senha do Instagram em `.env` em texto puro**. Eu não vou configurar isso por você, e recomendo não fazer.
  - Automação de navegador logado **viola os Termos de Uso do Instagram**; as skills `*-warm` são padrão de automação de engajamento, exatamente o que dispara banimento.
  - Risco concreto de perder a conta do Terramaris/Bomgo.
- **Uso na Bomgo/Terramaris:** **não recomendo.** Para publicar de forma sustentada, use a Instagram Graph API oficial (Content Publishing API) dentro do n8n que vocês já operam — a mesma casa dos workflows da Sofia. Listei esta skill porque ela é tecnicamente a melhor do seu tipo e você precisa saber que existe e por que estamos recusando.

---

## Teste funcional executado

Apliquei a skill nº 1 (`video-prompting`, referência Veo 3.1) ao briefing da **CAMPANHA 001 —
"Bem-vindo ao Terramaris"**, item *Reel: drone chegando no condomínio*.

**Entrada:** "Drone chegando no condomínio."

**Saída da skill** (fórmula de 5 partes + direção de áudio, sem nome de modelo/duração/aspect ratio
no corpo do prompt, conforme a regra da referência):

> *(Nota — este prompt foi escrito antes de eu ler `lib/data/properties.ts`. O Terramaris fica em
> **Porto das Dunas, Aquiraz · CE**, vizinho ao Beach Park — não na Bahia, como presumi aqui. A
> versão corrigida e ancorada nos dados reais está em `~/bomgo-marketing-lab/campaigns/001-terramaris-bem-vindo/saida.md`.)*

> Aerial tracking shot, wide, descending slowly from above the tree line, wide-angle lens, deep
> focus. A low-rise beachfront resort of white walls and dark wood pergolas sits between dense
> coconut palms and an empty stretch of pale sand. The camera glides forward over the palms, dips
> toward a long turquoise pool that mirrors the sky, then eases into a slow push toward the open
> lobby where warm interior light spills onto the deck. Late golden hour, low sun raking across the
> water, long soft shadows, gentle heat haze, saturated tropical greens against warm white
> architecture, cinematic color grade. Ambient noise: soft ocean swell, wind through palm fronds,
> distant birds. SFX: a quiet splash of water. No dialogue. An unhurried, uncrowded resort with
> clear open deck space and calm empty water.

Note as decisões que a skill forçou e que um prompt improvisado erraria: prompt negativo escrito
como **ausência descrita** ("uncrowded... empty water") em vez de "sem pessoas"; camada de áudio
explícita; batidas de ação temporizadas (planar → mergulhar → aproximar); parâmetros técnicos
mantidos **fora** do texto do prompt. A skill entrega o que promete.

---

## Ambiente de teste

Tudo clonado e isolado em:

```
scratchpad/skills-lab/                 # 11 repositórios clonados, para auditoria
scratchpad/skills-lab/TEST-INSTALL/skills/   # bundle curado, 10 skills, 404 KB
```

O bundle de teste contém: `video-prompting`, `video-director`, `remotion-motion-graphics`,
`reels-scripting`, `hook-generator`, `voice-builder`, `social-content`, `copywriting`,
`instagram-research`, `content-planner`.

**Não instalei nada em `~/.claude/skills/`** — hoje você só tem `graphify` lá, e mexer na config
global (ou no `.claude/` do projeto da Sofia) é decisão sua. Para promover o bundle:

```bash
cp -R <scratchpad>/skills-lab/TEST-INSTALL/skills/* ~/.claude/skills/
```

Sugiro promover em duas ondas, não tudo de uma vez — skill demais degrada o disparo automático.

---

## Recomendação

**Stack mínima para rodar a CAMPANHA 001 esta semana (custo zero de API):**

`voice-builder` (uma vez, define a voz Bomgo) → `hook-generator` (o gancho do Story) →
`video-prompting` (prompt do reel de drone) → `remotion-motion-graphics` (marca, preço, CTA) →
`ffmpeg` (9:16, 4:5, 1:1).

Só depois que essa esteira estiver rodando vale abrir a carteira para `fal-ai-community/skills`
ou `veo-tools` (execução paga) e `head-of-content` (Apify, inteligência competitiva).

**A oportunidade estratégica:** o nicho de turismo está literalmente vazio — o único projeto
existente (TravelSkills.io) não lançou. Vocês já têm o ativo que ninguém tem: catálogo real de
imóveis, integração Stays, preço confirmado e a Sofia. Uma skill `bomgo-property-reel` que lê
`lib/data/properties.ts` e cospe o pacote de campanha completo por imóvel é trabalho de um dia
sobre as peças acima — e não existe equivalente publicado.

---

## Fontes

Marketplaces: [Awesome Claude Skills](https://awesomeclaude.ai/awesome-claude-skills) ·
[SkillsMP](https://skillsmp.com/) · [Claude Marketplaces](https://claudemarketplaces.com/) ·
[Claude Skills Hub](https://claudeskills.info/) · [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills)

Repositórios avaliados: [Square-Zero-Labs/video-prompting](https://github.com/Square-Zero-Labs/video-prompting) ·
[smixs/visual-skills](https://github.com/smixs/visual-skills) ·
[haidrrrry/claude-remotion-skill](https://github.com/haidrrrry/claude-remotion-skill) ·
[fal-ai-community/skills](https://github.com/fal-ai-community/skills) ·
[charlie947/social-media-skills](https://github.com/charlie947/social-media-skills) ·
[bradautomates/head-of-content](https://github.com/bradautomates/head-of-content) ·
[OpenClaudia/openclaudia-skills](https://github.com/OpenClaudia/openclaudia-skills) ·
[kdowswell/veo-tools](https://github.com/kdowswell/veo-tools) ·
[ychoi-kr/claude-ffmpeg-skill](https://github.com/ychoi-kr/claude-ffmpeg-skill) ·
[Remotion Agent Skills](https://www.remotion.dev/docs/ai/skills) ·
[vanities/social-skills](https://github.com/vanities/social-skills)

Descartados após auditoria: [wilwaldon/Claude-Code-Video-Toolkit](https://github.com/wilwaldon/Claude-Code-Video-Toolkit) ·
[prateekjain98/social-media-manager-skills](https://github.com/prateekjain98/social-media-manager-skills) ·
[TravelSkills.io](https://travelskills.io/)
