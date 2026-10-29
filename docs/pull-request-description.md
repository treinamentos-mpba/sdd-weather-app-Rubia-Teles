## Pull Request — SDD Weather App

### Qual módulo / entrega este PR cobre?

Módulos 02 a 09: discovery, especificação, plano, backlog, UI, integração Open-Meteo, testes e hardening do Weather App Horizonte.

Rascunho para revisão, não declaração de prontidão para produção. Na preparação deste texto, as mudanças ainda estavam no working tree de main, sem commits de implementação; os artefatos SDD precisam ser incluídos no commit antes de abrir o PR.

### Fluxo SDD

- [x] Existe especificação correspondente em `specs/`
- [x] Existe plano técnico em `plans/`
- [x] Existe(m) tarefa(s) em `tasks/` cobrindo esta mudança

Artefatos verificados localmente:

- [Discovery](../specs/discovery.md)
- [Especificação](../specs/weather-app-spec.md)
- [Plano e evidências de validação](../plans/weather-app-plan.md)
- [Backlog e incrementos autorizados](../tasks/weather-app-tasks.md)

Os incrementos P6–P9 documentam o recorte implementado; isso não significa que todas as tarefas T-01 a T-50 estejam concluídas ou que a baseline tenha aprovação operacional.

### Checklist de qualidade

- [x] `pnpm lint` passa
- [x] `pnpm build` passa
- [x] `pnpm test` passa
- [ ] Testes E2E relevantes passam (`pnpm test:e2e`)
- [x] Estados de loading, erro e vazio tratados
- [ ] Acessibilidade básica (roles/labels, foco, teclado)

Lint, build e 134 testes Vitest foram reexecutados na revisão P10. A última execução P9 aprovou 20 E2E Chromium, com Axe nos cenários auditados; o projeto mobile/WebKit não está homologado. A revisão P10 reproduziu perda de foco para BODY após atualizar a previsão pelo teclado. Leitor de tela manual permanece pendente.

### O que mudou?

- UI responsiva React + Tailwind, com busca acessível, escolha entre cidades homônimas, clima atual, métricas e previsão de hoje mais quatro dias.
- Temperaturas canônicas em Celsius, com conversão e formatação derivadas na apresentação, sem requests adicionais ou persistência da preferência.
- Services isolados para geocoding e forecast Open-Meteo, validação do JSON e erros tipados, timeout de dez segundos por request e cooldown por Retry-After.
- Hook com estados explícitos, cancelamento e descarte de respostas antigas, retry da etapa correta e preservação identificada da última consulta quando uma nova busca falha.
- Dados parciais com fallback seguro, janela por fuso local, aviso de estimativa antiga e reavaliação temporal sem polling da API.
- Testes Vitest/Testing Library e Playwright com rede interceptada, relógio controlado, cenários offline, erro, vazio e parcial, teclado e viewports mobile/desktop.

Objetivo: permitir consultar e interpretar o clima de cidades com recuperação previsível de falhas, mantendo decisões e critérios rastreáveis no fluxo SDD.

#### Como testar

```bash
pnpm install --frozen-lockfile
pnpm lint
pnpm build
pnpm test
pnpm exec playwright install chromium webkit
pnpm test:e2e
```

O ambiente também precisa das dependências Linux oficiais dos dois navegadores. No runner autorizado de CI, instalar com `pnpm exec playwright install --with-deps chromium webkit`. O workflow atual instala somente Chromium, embora a configuração execute também WebKit no projeto mobile; corrigir essa incompatibilidade antes do merge.

Para isolar o projeto já validado: `pnpm exec playwright test --project=chromium --retries=0`. Para inspeção manual: `pnpm dev`, buscar uma cidade, consultar os cinco dias, trocar a unidade, selecionar outra localidade e verificar atualização/retry por teclado. Não confundir ausência de falhas no Axe com validação completa por leitor de tela.

#### Pendências antes do merge

- Alinhar a instalação dos navegadores de CI aos projetos Playwright e concluir o gate E2E completo.
- Corrigir e testar restauração de foco após refresh/retry quando o controle acionado é desmontado.
- Consolidar a redação da spec: seleção automática P7, timeout por request e foco contextual P9 não devem coexistir com critérios antigos incompatíveis sem status explícito.
- Incluir os artefatos hoje não rastreados e revisar exclusões de arquivos e alterações geradas, como tsconfig.app.tsbuildinfo, antes do commit.
- Manter como pendentes homologação assistiva, metas de desempenho, disponibilidade, termos/privacidade da fonte e aprovações de produto/operação aplicáveis.

### Critérios de aceite atendidos

A matriz individual de AC-01 a AC-32 e suas evidências está no plano. Há cobertura automatizada de busca, mapeamento, cinco dias, conversão, estados, recuperação, concorrência, dados parciais, fuso e calendário. Não se declara aceite integral: AC-01 e AC-11 possuem redação histórica a consolidar com os incrementos; a parte manual de AC-11 e os compromissos operacionais seguem pendentes.

Os validadores SDD locais encontraram os termos obrigatórios da spec/plano e 127 linhas com referências T-NN, acima do mínimo de seis. Esses checks não verificam aprovação, semântica, cobertura efetiva ou qualidade da implementação. A execução no PR depende de os arquivos estarem commitados e dos filtros/guards dos workflows.