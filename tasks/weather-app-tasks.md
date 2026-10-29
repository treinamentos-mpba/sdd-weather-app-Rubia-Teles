# Weather App — Backlog de Implementação

## Incremento Autorizado P9

| Passo | Recorte | Aceite |
| --- | --- | --- |
| P9.1 | Auditoria e correções de acessibilidade. | Achados por severidade; teclado, foco, status, alert e contraste verificados. |
| P9.2 | Transporte, cooldown e retry. | Timeout independente da cooperação do corpo; offline e recuperação da etapa correta. |
| P9.3 | Normalização e fallbacks. | Campos ausentes/invalidos seguros, condição desconhecida indisponível e nenhum NaN/undefined. |
| P9.4 | Regressões por edge case. | Vazio/espaços, Unicode/marcação, sem resultados, incompleto e temporal. |
| P9.5 | Ajustes de UX. | aria-busy, status persistente, foco contextual e bloqueios coerentes; sem memoização especulativa. |
| P9.6 | Gates e matriz de evidências. | Lint/build/unit/E2E executados; ACs e limitações registrados explicitamente. |

## Incremento Autorizado P8

| Passo | Recorte | Aceite |
| --- | --- | --- |
| P8.1 | Testes de temperatura e unitLabel. | 0/100/-40 °C, unidades, arredondamento e símbolos. |
| P8.2 | Testes de weatherCodes e format. | Códigos e fallback; Hoje/Amanhã/dia da semana, dd/MM e fuso independente. |
| P8.3 | Regressões de services com fetch stub. | Vazio sem rede, results ausente, HTTP, cinco dias, precipitação nula e grupos incompletos. |
| P8.4 | Controles com Testing Library. | Busca válida/inválida e 0 °C→32 °F por interação real. |
| P8.5 | weather.spec.ts. | Busca, cidade, região acessível e unidade derivada. |
| P8.6 | Vazio e mobile E2E. | {} sem forecast e fluxo em 375×812. |
| P8.7 | Cobertura e lacunas. | Gerar relatório e regressões de maior risco; registrar gaps restantes. |
| P8.8 | Estabilidade. | Rede e relógio controlados, queries acessíveis, sem esperas fixas e execução repetida. |

## Incremento Autorizado P7

| Passo | Implementação | Aceite verificável |
| --- | --- | --- |
| P7.1 | searchCities e WeatherServiceError. | Vazio sem fetch; nome codificado; resultados tipados; HTTP não-ok lança erro. |
| P7.2 | getWeather combinado com métricas atuais e diárias. | Cinco datas/campos associados; grupo current/daily ausente rejeitado; unidade/fuso validados. |
| P7.3 | fetchWithTimeout em services/http.ts. | AbortController, timeout de 10 s, mensagens uniformes e cleanup em finally. |
| P7.4 | useWeather. | Estados explícitos, primeira cidade automática, seleção, retry da etapa correta e descarte de resposta antiga. |
| P7.5 | Conectar App sem fixture. | Idle inicial, estados reais, ErrorState→retry e conversão sem request. |
| P7.6 | Diagnóstico de URLs, payloads e falhas. | Casos automatizados determinísticos e resultado real de smoke, ou limitação de rede registrada. |
| P7.7 | Revisão da fronteira de dados e estado. | Fetch somente em services; estado de consulta só no hook; UI recebe props. |

## Incremento Autorizado P6

Solicitação P6.1–P6.8 autoriza a implementação local da UI com fixture, incluindo os campos adicionais registrados em spec/plano. Não executa automaticamente as 50 tarefas nem autoriza serviços, publicação ou fechamento dos gates de produção.

| Passo | Recorte autorizado | Verificação |
| --- | --- | --- |
| P6.1 | Tipos principais e fixture, em src/types/weather.ts e src/fixtures/weather.ts. | Typecheck strict e cinco datas/valores válidos. |
| P6.2 | SearchBar por props, com validação e label. | Callback com trim, entrada inválida e disabled. |
| P6.3 | UnitToggle por props. | aria-pressed, teclado e callback. |
| P6.4 | CurrentWeather com métricas; helpers e ícones em recortes separados. | Valores/unidades, fallback de campos ausentes e temperaturas negativas. |
| P6.5 | ForecastCard e ForecastList. | Cinco datas estáveis, probabilidade e grid responsivo. |
| P6.6 | LoadingState, ErrorState e EmptyState, um componente por arquivo. | Roles, mensagens e recuperação. |
| P6.7 | App/entrada/estilos e hook mock separados por responsabilidade. | Cenários, consulta simulada e conversão sem rede. |
| P6.8 | Testes e revisão separados da implementação. | Gates do projeto, teclado, foco e viewports mobile/desktop. |

## Escopo e Regras

- Entradas: [plano técnico](../plans/weather-app-plan.md) e [spec](../specs/weather-app-spec.md), fonte da verdade de produto.
- **Status:** tarefas propostas, nenhuma executada. Gerar o backlog não aprova a baseline nem autoriza implantação.
- **Gate de entrada:** antes de iniciar código, produto deve aprovar os refinamentos e consolidar as contradições registradas no plano. OQ-09 e OQ-10 precisam definir os compromissos de qualidade antes do respectivo aceite; OQ-11 precisa validar o contrato externo antes de implementar os serviços. Não inventar decisões em uma tarefa.
- Uma tarefa modifica no máximo dois arquivos relevantes e pertence a um tipo: UI, Data, Test ou Infra. Testes automatizados têm tarefas próprias; validação focada de uma implementação não exige criar outro arquivo de teste nela.
- Prioridades: **P0** = caminho funcional essencial; **P1** = robustez e gates obrigatórios antes do release; **P2** = melhoria opcional. Nenhuma tarefa abaixo é P2: não acrescentar funcionalidades opcionais ao MVP. P1 não significa dispensável para produção.
- Tamanhos: **P** = uma responsabilidade pequena; **M** = uma responsabilidade com ramificações ou integração externa; **G** = precisa ser dividida antes de iniciar. A revisão P5.2 eliminou tarefas G.
- Dependências são IDs de tarefas, todas anteriores na ordem abaixo. Os gates de aprovação são pré-condições externas, não dependências ficticiamente concluídas.
- Quando uma validação revelar defeito, corrigir o mesmo recorte; se exigir mais de dois arquivos ou outro tipo de trabalho, registrar nova tarefa T-NN e sua dependência, sem ampliar silenciosamente o escopo.
- Para cada tarefa de código ou teste, cumprir os gates do projeto: `pnpm lint`, `pnpm build`, `pnpm test`. Acrescentar testes focados e `pnpm test:e2e` quando aplicável. Falhas preexistentes ou infraestrutura incompleta devem ser registradas com causa; não marcar um gate como aprovado se não rodou. A aplicação só fica liberada após T-50.

## Entrega 1 — Tipos e Funções Puras

### T-01 — Definir os contratos principais
- **Tipo:** Data; **prioridade:** P0; **tamanho:** P; **dependências:** nenhuma.
- **Descrição:** declarar e exportar o modelo principal do plano, sem lógica executável.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Rastreabilidade:** RF-01, RF-02, RF-03, RF-04, RF-07; AC-02, AC-03, AC-05, AC-08, AC-15.
- **Critérios de aceite:** exportar Unit, LocalDate, InstantMs, City, CurrentWeather, ForecastDay e WeatherData com os campos e nulabilidade do plano; tipos passam em verificação TypeScript strict sem any, fetch, React, estado ou persistência; comentários curtos por campo em pt-BR.

### T-02 — Definir contratos de operação e estados
- **Tipo:** Data; **prioridade:** P0; **tamanho:** P; **dependências:** T-01.
- **Descrição:** completar os contratos auxiliares e os estados discriminados.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Rastreabilidade:** RF-05, RF-06, RF-07; AC-10, AC-11, AC-13, AC-20.
- **Critérios de aceite:** exportar CitySearchResult, FiveDays, WeatherView, AppErrorKind, AppError, Result, ServiceName, OperationContext, WeatherServices, Clock, SearchState, WeatherState e ServiceCooldowns conforme o plano; busca distingue idle/loading/success/empty/error; painel não usa empty para mascarar erro; contratos compilam em strict.

### T-03 — Converter e formatar temperaturas
- **Tipo:** Data; **prioridade:** P0; **tamanho:** P; **dependências:** T-01.
- **Descrição:** funções puras com Celsius original como referência.
- **Arquivos prováveis:** `src/lib/temperature.ts`.
- **Rastreabilidade:** RF-04; AC-08, AC-25; RNF-06.
- **Critérios de aceite:** 0 °C resulta em 32,0 °F e -40 °C em -40,0 °F; uma casa decimal, vírgula e halfExpand; 0,25 e -0,25 °C aparecem como 0,3 e -0,3 °C; ausência permanece indisponível e zero negativo não aparece; chamadas não mutam os valores de entrada.

### T-04 — Mapear condições meteorológicas
- **Tipo:** Data; **prioridade:** P0; **tamanho:** P; **dependências:** T-01.
- **Descrição:** centralizar os códigos WMO e seus textos.
- **Arquivos prováveis:** `src/lib/conditions.ts`.
- **Rastreabilidade:** RF-02, RF-03; AC-03, AC-06, AC-22; RNF-06.
- **Critérios de aceite:** todos os códigos da tabela da spec retornam seu texto pt-BR; código desconhecido ou ausente retorna “Condição indisponível”, nunca céu limpo; não depender de ícone para comunicar a condição.

### T-05 — Validar busca e identificar cidades
- **Tipo:** Data; **prioridade:** P0; **tamanho:** P; **dependências:** T-01.
- **Descrição:** funções de entrada, chave e rótulo, sem HTTP.
- **Arquivos prováveis:** `src/lib/search.ts`.
- **Rastreabilidade:** RF-01, RF-07; AC-02, AC-17, AC-18, AC-19.
- **Critérios de aceite:** aplicar trim e intervalo 2–100 pontos de código Unicode; preservar acentos e nomes não latinos; validar coordenadas finitas e seus limites; produzir chave estável e diferenciação de homônimos com região/país e coordenadas quando exigidas.

### T-06 — Projetar calendário e horários locais
- **Tipo:** Data; **prioridade:** P0; **tamanho:** M; **dependências:** T-01.
- **Descrição:** validar fuso e derivar datas e horários sem dependência do fuso do dispositivo.
- **Arquivos prováveis:** `src/lib/datetime.ts`.
- **Rastreabilidade:** RF-02, RF-03, RF-07; AC-05, AC-23, AC-32; RNF-06.
- **Critérios de aceite:** produzir cinco datas de calendário consecutivas no fuso IANA; invalidar fuso desconhecido sem fallback; formatar dd/MM e dd/MM/aaaa HH:mm; conferir ano novo e DST com relógio fornecido, sem somar 24 horas a instantes locais.

### T-07 — Normalizar dados meteorológicos
- **Tipo:** Data; **prioridade:** P0; **tamanho:** M; **dependências:** T-02, T-04, T-06.
- **Descrição:** transformar payload desconhecido em dados de domínio validados.
- **Arquivos prováveis:** `src/lib/weather.ts`.
- **Rastreabilidade:** RF-02, RF-03, RF-06; AC-03, AC-04, AC-06, AC-21, AC-22, AC-30.
- **Critérios de aceite:** converter segundos Unix para ms uma única vez; validar unidades sem coerção de strings; preservar zero e negativos; campos ausentes, códigos desconhecidos e pares térmicos invertidos ficam indisponíveis; duplicações invalidam o dia; payload sem dados úteis ou fuso válido não produz sucesso.

### T-08 — Derivar janela, parcial e frescor
- **Tipo:** Data; **prioridade:** P0; **tamanho:** M; **dependências:** T-07.
- **Descrição:** projetar WeatherView a partir de WeatherData e agora explícito.
- **Arquivos prováveis:** `src/lib/weather.ts`.
- **Rastreabilidade:** RF-02, RF-03, RF-07; AC-05, AC-21, AC-23, AC-32.
- **Critérios de aceite:** retornar FiveDays com posições indisponíveis para ausências; referência acima de duas horas gera stale e mais de cinco minutos futuros invalida o atual; virada local remove ontem e sinaliza needsRefresh; não mutar snapshot nem acessar relógio ocultamente.

## Entrega 2 — Services HTTP e Dados

### T-09 — Criar transporte HTTP mínimo
- **Tipo:** Data; **prioridade:** P0; **tamanho:** P; **dependências:** T-02.
- **Descrição:** leitura JSON desconhecida e classificação de falhas comuns.
- **Arquivos prováveis:** `src/services/http.ts`.
- **Rastreabilidade:** RF-06; AC-13, AC-30; RNF-07.
- **Critérios de aceite:** usar fetch HTTPS sem credenciais e sem cache próprio de consultas; diferenciar falha de rede, status HTTP e JSON ilegível; não transformar erro em lista vazia nem expor payload técnico na UI; aplicar política de 4xx aprovada no gate de entrada.

### T-10 — Aplicar deadline e cancelamento
- **Tipo:** Data; **prioridade:** P0; **tamanho:** M; **dependências:** T-09.
- **Descrição:** impor prazo total por operação, sem framework genérico de requests.
- **Arquivos prováveis:** `src/services/http.ts`.
- **Rastreabilidade:** RF-05, RF-06; AC-11, AC-13, AC-20; RNF-05.
- **Critérios de aceite:** prazo de 10.000 ms inclui leitura do corpo e respeita deadline recebido; limpar timers; distinguir timeout de cancelamento por substituição; não publicar resultado concluído após o prazo; não reiniciar orçamento por chamada interna.

### T-11 — Respeitar limite temporário da fonte
- **Tipo:** Data; **prioridade:** P1; **tamanho:** P; **dependências:** T-10.
- **Descrição:** interpretar Retry-After e cooldown por serviço.
- **Arquivos prováveis:** `src/services/http.ts`.
- **Rastreabilidade:** RF-06; AC-29; RNF-05.
- **Critérios de aceite:** interpretar segundos e data HTTP; bloquear novas consultas ao serviço afetado até retryAt; cabeçalho ausente, inválido ou passado não impede tentativa manual; nenhuma tentativa automática; cooldown vive apenas em memória.

### T-12 — Integrar geocoding
- **Tipo:** Data; **prioridade:** P0; **tamanho:** M; **dependências:** T-05, T-11.
- **Descrição:** implementar searchCities conforme contrato validado da fonte.
- **Arquivos prováveis:** `src/services/geocodingService.ts`.
- **Rastreabilidade:** RF-01, RF-06; AC-01, AC-02, AC-12, AC-18, AC-19, AC-30.
- **Critérios de aceite:** URLSearchParams envia name, count=10, language=pt e format=json; filtrar localidades inválidas e preservar ordem; distinguir vazio contratual, lista parcial e erro; não interpretar campo omitido como vazio sem confirmação do contrato real.

### T-13 — Integrar forecast atual e diário
- **Tipo:** Data; **prioridade:** P0; **tamanho:** M; **dependências:** T-08, T-11.
- **Descrição:** implementar getWeather em uma requisição.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Rastreabilidade:** RF-02, RF-03, RF-06, RF-07; AC-03, AC-05, AC-06, AC-21, AC-30.
- **Critérios de aceite:** solicitar current e daily do plano, forecast_days=5, timezone=auto, Celsius e Unix time; usar coordenadas selecionadas; retornar WeatherData normalizado com obtainedAt distinto de referenceAt; não somar offset novamente; não dividir atual/diário em requests independentes.

## Entrega 3 — Hooks e Orquestração

### T-14 — Orquestrar a busca
- **Tipo:** Data; **prioridade:** P0; **tamanho:** M; **dependências:** T-12.
- **Descrição:** implementar useCitySearch com estado explícito e ação de envio.
- **Arquivos prováveis:** `src/hooks/useCitySearch.ts`.
- **Rastreabilidade:** RF-01, RF-05, RF-06, RF-07; AC-01, AC-10, AC-12, AC-14, AC-27, AC-31.
- **Critérios de aceite:** idle/loading/success/empty/error distintos; digitar não chama a API; duplicata pendente não inicia operação; nova busca invalida a anterior; somente o ID atual altera resultado, erro ou loading; repetir usa o query que falhou sem sobrescrever o texto editável.

### T-15 — Orquestrar consulta meteorológica
- **Tipo:** Data; **prioridade:** P0; **tamanho:** M; **dependências:** T-13.
- **Descrição:** implementar useWeather com seleção, consulta e atualização manual.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Rastreabilidade:** RF-02, RF-03, RF-05, RF-06, RF-07; AC-11, AC-14, AC-16, AC-26, AC-28.
- **Critérios de aceite:** selecionar e atualizar removem dados antigos; retry conserva City; abort e identidade de operação impedem resposta antiga inclusive no finally; parcial utilizável é success e nenhum dado útil é error; desmontar limpa requisição e timers.

### T-16 — Reavaliar tempo sem refetch
- **Tipo:** Data; **prioridade:** P1; **tamanho:** P; **dependências:** T-15.
- **Descrição:** incorporar projeção temporal e visibilitychange no hook.
- **Arquivos prováveis:** `src/hooks/useWeather.ts`.
- **Rastreabilidade:** RF-02, RF-03, RF-07; AC-23, AC-32.
- **Critérios de aceite:** timer local e retorno à página reavaliam frescor/data; suspender timer oculto e limpar listener; só publicar alterações da projeção; nenhuma chamada de rede na virada, no tick ou por foco da janela.

## Entrega 4 — Componentes de Apresentação

### T-17 — Apresentar status acessível
- **Tipo:** UI; **prioridade:** P0; **tamanho:** P; **dependências:** T-02.
- **Descrição:** componente por props para mensagens e ações de recuperação.
- **Arquivos prováveis:** `src/components/StatusMessage.tsx`.
- **Rastreabilidade:** RF-05, RF-06; AC-10, AC-11, AC-12, AC-13; RNF-02, RNF-06.
- **Critérios de aceite:** comunicar loading, vazio, parcial e erro em pt-BR; anunciar transições sem deslocar foco; tentativa manual chama callback e respeita bloqueio recebido; não executar fetch.

### T-18 — Apresentar busca e seleção
- **Tipo:** UI; **prioridade:** P0; **tamanho:** P; **dependências:** T-05, T-17.
- **Descrição:** formulário controlado e lista de cidades por props.
- **Arquivos prováveis:** `src/components/CitySearch.tsx`.
- **Rastreabilidade:** RF-01, RF-05, RF-06; AC-01, AC-02, AC-17, AC-18, AC-19; RNF-01, RNF-02.
- **Critérios de aceite:** Enter e botão acionam o mesmo callback; cidades e ações são operáveis por teclado; rótulos distinguem homônimos; entrada/mensagens não executam marcação; componente não conhece os endpoints.

### T-19 — Apresentar clima atual
- **Tipo:** UI; **prioridade:** P0; **tamanho:** P; **dependências:** T-03, T-04, T-06.
- **Descrição:** temperatura, condição e referência do grupo atual.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`.
- **Rastreabilidade:** RF-02, RF-04, RF-07; AC-03, AC-04, AC-22; RNF-02, RNF-06.
- **Critérios de aceite:** usar unidade recebida e formatadores; distinguir indisponível de zero; mostrar texto WMO e referência, sem confundir obtenção com estimativa; não armazenar temperatura convertida.

### T-20 — Apresentar cinco dias
- **Tipo:** UI; **prioridade:** P0; **tamanho:** P; **dependências:** T-03, T-04, T-06, T-08.
- **Descrição:** lista diária da projeção, sem lógica de rede.
- **Arquivos prováveis:** `src/components/ForecastList.tsx`.
- **Rastreabilidade:** RF-03, RF-04, RF-07; AC-05, AC-06, AC-21, AC-23; RNF-01, RNF-02, RNF-06.
- **Critérios de aceite:** renderizar cinco datas com mínima/máxima e condição; identificar hoje; valores ausentes ficam indisponíveis; não truncar conteúdo no limite mobile; chaves estáveis por data.

### T-21 — Apresentar seletor de unidade
- **Tipo:** UI; **prioridade:** P0; **tamanho:** P; **dependências:** T-01.
- **Descrição:** seletor controlado, sem estado duplicado de unidade.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`.
- **Rastreabilidade:** RF-04; AC-07, AC-08, AC-09, AC-24; RNF-02.
- **Critérios de aceite:** duas opções com nomes acessíveis e seleção identificável; teclado aciona onChange com Unit; permanece utilizável sem dados e durante loading; não chama serviço.

### T-22 — Compor painel meteorológico
- **Tipo:** UI; **prioridade:** P0; **tamanho:** P; **dependências:** T-17, T-19, T-20.
- **Descrição:** compor identificação, estados e ações do painel.
- **Arquivos prováveis:** `src/components/WeatherPanel.tsx`.
- **Rastreabilidade:** RF-02, RF-03, RF-05, RF-06, RF-07; AC-11, AC-15, AC-28, AC-32.
- **Critérios de aceite:** diferenciar idle/loading/error/success completo ou parcial; exibir cidade, fuso, referência e obtenção; atualizar e repetir são callbacks; loading/erro não exibem snapshot anterior como atual.

## Entrega 5 — Integração e Aplicação Visível

### T-23 — Criar entrada React mínima
- **Tipo:** UI; **prioridade:** P0; **tamanho:** P; **dependências:** T-01.
- **Descrição:** entrada da SPA e App inicialmente estático.
- **Arquivos prováveis:** `src/main.tsx`, `src/App.tsx`.
- **Rastreabilidade:** RF-01, RF-07; RNF-01, RNF-07.
- **Critérios de aceite:** Vite abre uma aplicação com região principal e identificação do Weather App, sem login; main monta App sem serviços nem chamadas por efeito; não alterar index.html sem verificar o contrato existente de entrada.

### T-24 — Aplicar estilo base responsivo
- **Tipo:** UI; **prioridade:** P0; **tamanho:** P; **dependências:** T-23.
- **Descrição:** habilitar Tailwind e estilo global conforme tema do projeto.
- **Arquivos prováveis:** `src/index.css`, `src/main.tsx`.
- **Rastreabilidade:** RF-01, RF-07; RNF-01, RNF-02.
- **Critérios de aceite:** importar estilos uma única vez, preservar dark glassmorphism e foco visível; página inicial funciona em 320 e 1440 CSS px sem overflow; não instalar biblioteca de UI nem gerar landing page.

### T-25 — Integrar busca real
- **Tipo:** UI; **prioridade:** P0; **tamanho:** P; **dependências:** T-14, T-18, T-24.
- **Descrição:** conectar busca ao App como primeira jornada visível.
- **Arquivos prováveis:** `src/App.tsx`.
- **Rastreabilidade:** RF-01, RF-05, RF-06; AC-01, AC-02, AC-10, AC-12.
- **Critérios de aceite:** enviar busca apresenta cidades reais ou estados controlados de falha/vazio; seleção explícita fica identificável na composição; nenhuma previsão é presumida antes de integrar T-26; não duplicar lógica HTTP em App.

### T-26 — Integrar atual e previsão
- **Tipo:** UI; **prioridade:** P0; **tamanho:** P; **dependências:** T-16, T-22, T-25.
- **Descrição:** conectar seleção ao hook e o resultado ao painel.
- **Arquivos prováveis:** `src/App.tsx`.
- **Rastreabilidade:** RF-02, RF-03, RF-05, RF-06, RF-07; AC-03, AC-05, AC-15, AC-16, AC-26.
- **Critérios de aceite:** selecionar cidade consulta e apresenta atual e cinco dias; nova busca não remove painel anterior até nova seleção; dados e cidade não se misturam em respostas fora de ordem.

### T-27 — Integrar unidade e recuperação
- **Tipo:** UI; **prioridade:** P0; **tamanho:** P; **dependências:** T-21, T-26.
- **Descrição:** manter Unit em App e conectar refresh e retry já oferecidos pelos hooks.
- **Arquivos prováveis:** `src/App.tsx`.
- **Rastreabilidade:** RF-02, RF-04, RF-06; AC-07, AC-08, AC-09, AC-14, AC-24, AC-25, AC-28.
- **Critérios de aceite:** alternar afeta todos os campos sem novo request; unidade ativa vale para resposta pendente; refresh/retry usam cidade correta e obedecem cooldown; recarga inicia Celsius sem cidade ou preferência persistida.

## Entrega 6 — Testes Explícitos e Regressão

### T-28 — Preparar descoberta e setup de testes
- **Tipo:** Infra; **prioridade:** P0; **tamanho:** P; **dependências:** T-23.
- **Descrição:** completar a configuração existente sem segundo runner.
- **Arquivos prováveis:** `vite.config.ts`, `tests/setup.ts`.
- **Rastreabilidade:** RF-01, RF-05, RF-06; RNF-02, RNF-05.
- **Critérios de aceite:** manter descoberta em tests/unit e incluir tests/integration; excluir E2E do Vitest; setup carrega matchers e cleanup; manter jsdom e scripts pnpm existentes. Configuração atual só inclui tests/unit, portanto integração não pode ficar silenciosamente sem execução.

### T-29 — Preparar fixtures controladas
- **Tipo:** Test; **prioridade:** P0; **tamanho:** P; **dependências:** T-28.
- **Descrição:** dados reutilizáveis de geocoding e forecast, sem serviços simulados globais.
- **Arquivos prováveis:** `tests/fixtures/geocoding.ts`, `tests/fixtures/weather.ts`.
- **Rastreabilidade:** RF-01, RF-02, RF-03, RF-06; AC-02, AC-03, AC-21, AC-30.
- **Critérios de aceite:** exportar payloads completos, vazios, homônimos e parciais, com datas e relógio de referência documentados; fixtures não se confundem com resposta real recente e não mutam entre testes.

### T-30 — Testar conversão de unidade
- **Tipo:** Test; **prioridade:** P0; **tamanho:** P; **dependências:** T-03, T-28.
- **Descrição:** testes unitários dedicados de conversão e apresentação.
- **Arquivos prováveis:** `tests/unit/temperature.test.ts`.
- **Rastreabilidade:** RF-04; AC-08, AC-25; RNF-06.
- **Critérios de aceite:** cobrir 0, 20, -40, 0,25 e -0,25 °C, null, arredondamento, zero negativo e repetições sem deriva; suíte falha se conversão sobrescrever valores canônicos.

### T-31 — Testar calendário e projeção
- **Tipo:** Test; **prioridade:** P0; **tamanho:** M; **dependências:** T-08, T-28, T-29.
- **Descrição:** regressões temporais determinísticas e validação meteorológica.
- **Arquivos prováveis:** `tests/unit/datetime.test.ts`, `tests/unit/weather.test.ts`.
- **Rastreabilidade:** RF-02, RF-03, RF-07; AC-04, AC-05, AC-06, AC-21, AC-23, AC-32.
- **Critérios de aceite:** cobrir ano novo, DST, fuso distinto, cinco posições, dia duplicado, par térmico inválido, arrays desalinhados e limites exatos de referência; nenhuma dependência do relógio ou fuso do executor.

### T-32 — Testar entrada e condições
- **Tipo:** Test; **prioridade:** P0; **tamanho:** P; **dependências:** T-04, T-05, T-28.
- **Descrição:** testar funções puras de busca e WMO.
- **Arquivos prováveis:** `tests/unit/search.test.ts`, `tests/unit/conditions.test.ts`.
- **Rastreabilidade:** RF-01, RF-02, RF-03; AC-02, AC-03, AC-17, AC-18, AC-19, AC-22.
- **Critérios de aceite:** testar limites Unicode, coordenadas, rótulos ambíguos, todos os códigos conhecidos e fallback desconhecido; não requerer rede ou DOM.

### T-33 — Testar transporte, deadline e cooldown
- **Tipo:** Test; **prioridade:** P1; **tamanho:** M; **dependências:** T-11, T-28.
- **Descrição:** mock de fetch e relógios controlados para o transporte compartilhado.
- **Arquivos prováveis:** `tests/integration/http.test.ts`.
- **Rastreabilidade:** RF-05, RF-06; AC-11, AC-13, AC-20, AC-29, AC-30.
- **Critérios de aceite:** cobrir rede, HTTP, JSON ilegível, abort silencioso, 9.999/10.000 ms, leitura de corpo pendente e Retry-After em segundos/data/ausente/inválido; nenhuma tentativa automática; restaurar mocks e timers.

### T-34 — Testar geocoding com mock de fetch
- **Tipo:** Test; **prioridade:** P0; **tamanho:** P; **dependências:** T-12, T-29, T-33.
- **Descrição:** validar URL, parsing e semântica de resultado da busca.
- **Arquivos prováveis:** `tests/integration/geocodingService.test.ts`.
- **Rastreabilidade:** RF-01, RF-06; AC-01, AC-02, AC-12, AC-18, AC-19, AC-30.
- **Critérios de aceite:** conferir parâmetros e codificação, limite dez, filtragem, lista parcial e representação vazia contratual; HTTP e estrutura inválida não viram empty; não chamar a rede pública.

### T-35 — Testar forecast com mock de fetch
- **Tipo:** Test; **prioridade:** P0; **tamanho:** M; **dependências:** T-13, T-29, T-33.
- **Descrição:** validar chamada combinada e contrato de WeatherData.
- **Arquivos prováveis:** `tests/integration/weatherService.test.ts`.
- **Rastreabilidade:** RF-02, RF-03, RF-06, RF-07; AC-03, AC-05, AC-06, AC-21, AC-22, AC-30.
- **Critérios de aceite:** conferir current/daily, timezone, Celsius, Unix time e uma chamada; validar ms, unidades, fuso, parcial e nenhum dado útil; manter City selecionada mesmo com coordenadas de grid diferentes.

### T-36 — Testar estados e concorrência da busca
- **Tipo:** Test; **prioridade:** P0; **tamanho:** M; **dependências:** T-14, T-29, T-34.
- **Descrição:** testar hook com respostas adiadas e parâmetros preservados.
- **Arquivos prováveis:** `tests/integration/useCitySearch.test.tsx`.
- **Rastreabilidade:** RF-01, RF-05, RF-06, RF-07; AC-01, AC-10, AC-12, AC-14, AC-27, AC-31.
- **Critérios de aceite:** cobrir os cinco estados, duplicata, substituição, retry, resposta antiga e finally antigo; desmontar não publica estado nem deixa operação ativa.

### T-37 — Testar hook meteorológico e tempo
- **Tipo:** Test; **prioridade:** P1; **tamanho:** M; **dependências:** T-16, T-29, T-35.
- **Descrição:** testar seleção, refresh, projeção e visibilidade.
- **Arquivos prováveis:** `tests/integration/useWeather.test.tsx`.
- **Rastreabilidade:** RF-02, RF-03, RF-05, RF-06, RF-07; AC-11, AC-16, AC-23, AC-26, AC-28, AC-32.
- **Critérios de aceite:** testar remoção de snapshot, resposta antiga em sucesso/espera/falha, tick e retorno da página; nenhuma consulta por timer/foco; listeners e timers limpos ao desmontar.

### T-38 — Testar busca e mensagens nos estados explícitos
- **Tipo:** Test; **prioridade:** P0; **tamanho:** P; **dependências:** T-17, T-18, T-28, T-29.
- **Descrição:** testes de componentes sem HTTP.
- **Arquivos prováveis:** `tests/integration/CitySearch.test.tsx`, `tests/integration/StatusMessage.test.tsx`.
- **Rastreabilidade:** RF-01, RF-05, RF-06; AC-01, AC-02, AC-10, AC-11, AC-12, AC-13, AC-17, AC-18.
- **Critérios de aceite:** renderizar idle/loading/success/empty/error e parcial; verificar roles, nomes, mensagens, foco, Enter e tentativa manual; texto com marcação não executa conteúdo.

### T-39 — Testar apresentação atual e diária
- **Tipo:** Test; **prioridade:** P0; **tamanho:** P; **dependências:** T-19, T-20, T-28, T-29.
- **Descrição:** testar valores e identificação em componentes puros.
- **Arquivos prováveis:** `tests/integration/CurrentWeather.test.tsx`, `tests/integration/ForecastList.test.tsx`.
- **Rastreabilidade:** RF-02, RF-03, RF-04, RF-07; AC-03, AC-04, AC-05, AC-06, AC-21, AC-22.
- **Critérios de aceite:** conferir cinco datas, mínimas/máximas, unidades, referência e condições; mostrar null como indisponível, nunca zero; executar em Celsius e Fahrenheit.

### T-40 — Testar painel e seletor de unidade
- **Tipo:** Test; **prioridade:** P0; **tamanho:** P; **dependências:** T-21, T-22, T-28, T-29.
- **Descrição:** testar callbacks e estados por props.
- **Arquivos prováveis:** `tests/integration/WeatherPanel.test.tsx`, `tests/integration/UnitToggle.test.tsx`.
- **Rastreabilidade:** RF-04, RF-05, RF-06, RF-07; AC-07, AC-09, AC-11, AC-15, AC-24, AC-28.
- **Critérios de aceite:** verificar idle/loading/erro/sucesso completo e parcial; controles funcionam por teclado, respeitam cooldown e mantêm seletor ativo em loading; não iniciar rede diretamente.

### T-41 — Testar fluxo E2E principal
- **Tipo:** Test; **prioridade:** P0; **tamanho:** P; **dependências:** T-27, T-29, T-36, T-39, T-40.
- **Descrição:** jornada integrada com os hosts interceptados.
- **Arquivos prováveis:** `tests/e2e/weather-flow.spec.ts`.
- **Rastreabilidade:** RF-01, RF-02, RF-03, RF-04, RF-07; AC-01, AC-02, AC-03, AC-05, AC-07, AC-08, AC-15, AC-24, AC-25.
- **Critérios de aceite:** buscar, selecionar homônimo, ler atual/cinco dias e alternar unidade; contagem de requests não cresce pela troca; testar resposta pendente e recarga; fluxo funciona sem API pública.

### T-42 — Testar recuperação E2E
- **Tipo:** Test; **prioridade:** P1; **tamanho:** M; **dependências:** T-27, T-29, T-33, T-37, T-38.
- **Descrição:** validar erros e estados degradados na aplicação integrada.
- **Arquivos prováveis:** `tests/e2e/weather-recovery.spec.ts`.
- **Rastreabilidade:** RF-01, RF-02, RF-03, RF-05, RF-06, RF-07; AC-10, AC-11, AC-12, AC-13, AC-14, AC-16, AC-20, AC-21, AC-26, AC-27, AC-28, AC-29, AC-30.
- **Critérios de aceite:** cobrir vazio→nova busca, erro→retry, timeout→recuperação, parcial→refresh e respostas fora de ordem; verificar ausência de dados antigos e retry automático; relógio/cabeçalhos controlados.

### T-43 — Testar jornada e viewport mobile
- **Tipo:** Test; **prioridade:** P0; **tamanho:** P; **dependências:** T-24, T-41.
- **Descrição:** reutilizar a jornada sob constraints mobile e desktop.
- **Arquivos prováveis:** `tests/e2e/weather-mobile.spec.ts`.
- **Rastreabilidade:** RF-01, RF-02, RF-03, RF-04, RF-07; AC-01, AC-03, AC-05, AC-08, AC-15; RNF-01, RNF-02.
- **Critérios de aceite:** fluxo completo em 375 CSS px, conferência de 320 e 1440 CSS px, sem overflow ou controles cortados; capturar evidência visual; usar projetos existentes de Playwright e não confundir emulação com verificação em dispositivo real.

## Entrega 7 — Hardening e Liberação

### T-44 — Verificar acessibilidade das jornadas
- **Tipo:** Test; **prioridade:** P1; **tamanho:** M; **dependências:** T-38, T-40, T-42, T-43.
- **Descrição:** regressão de teclado e auditoria manual na matriz aprovada.
- **Arquivos prováveis:** `tests/e2e/weather-accessibility.spec.ts`, `tasks/weather-app-tasks.md`.
- **Rastreabilidade:** RF-01, RF-04, RF-05, RF-06, RF-07; AC-10, AC-11, AC-15; RNF-02.
- **Critérios de aceite:** testar fluxo sem mouse, foco visível, nomes e contraste conforme nível aprovado; registrar leitor/navegador e anúncios realmente observados; falhas geram tarefas de correção pequenas, não declaração automática de conformidade.

### T-45 — Medir desempenho das consultas
- **Tipo:** Test; **prioridade:** P1; **tamanho:** M; **dependências:** T-41, T-42.
- **Descrição:** medir os indicadores definidos em OQ-10.
- **Arquivos prováveis:** `tests/e2e/weather-performance.spec.ts`, `tasks/weather-app-tasks.md`.
- **Rastreabilidade:** RF-01, RF-02, RF-03, RF-06; RNF-03.
- **Critérios de aceite:** registrar ambiente, rede, amostra, limites e percentil aprovados; separar tempo total e processamento interno; não usar timeout de dez segundos como evidência de três segundos; anexar resultado e bloquear aceite se OQ-10 não estiver fechado.

### T-46 — Validar integração real e atribuição
- **Tipo:** Infra; **prioridade:** P1; **tamanho:** M; **dependências:** T-34, T-35, T-41.
- **Descrição:** smoke test externo e consolidação das evidências da validação inicial de OQ-11.
- **Arquivos prováveis:** `plans/weather-app-plan.md`.
- **Rastreabilidade:** RF-01, RF-02, RF-03, RF-06, RF-07; RNF-07.
- **Critérios de aceite:** registrar data, endpoints, formato de vazio, unidades, timestamps, CORS e acesso a Retry-After; documentar termos, quotas, atribuição exigida e privacidade para o uso aprovado; se houver obrigação visual ainda não implementada, criar tarefa própria antes do release; não armazenar credenciais.

### T-47 — Verificar retenção e superfície de dados
- **Tipo:** Test; **prioridade:** P1; **tamanho:** P; **dependências:** T-27, T-41, T-46.
- **Descrição:** validar ausência de persistência e identificação segura de dados.
- **Arquivos prováveis:** `tests/e2e/weather-privacy.spec.ts`, `tasks/weather-app-tasks.md`.
- **Rastreabilidade:** RF-01, RF-04, RF-07; AC-18, AC-25; RNF-07.
- **Critérios de aceite:** aplicação não grava cidade/unidade em storage/cookies nem chama backend de retenção; recarga reinicia a sessão; testar texto externo como texto; registrar separadamente tratamento pelo provedor e hospedagem, sem prometer ausência de logs de terceiros.

### T-48 — Configurar publicação estática
- **Tipo:** Infra; **prioridade:** P1; **tamanho:** M; **dependências:** T-43, T-44, T-45, T-46, T-47.
- **Descrição:** publicar o build na hospedagem aprovada, reutilizando o workflow existente.
- **Arquivos prováveis:** `.github/workflows/deploy.yml`, `plans/weather-app-plan.md`.
- **Rastreabilidade:** RF-01, RF-02, RF-03; RNF-01, RNF-04, RNF-07.
- **Critérios de aceite:** identificar e reutilizar o arquivo real de deploy antes de editar, sem workflow duplicado; usar pnpm e base Vite correta, preservar site do workshop, HTTPS e artifacts v4 ou superior se usados; registrar URL e smoke test. Plataforma/permissões precisam de aprovação; não publicar automaticamente durante outra tarefa.

### T-49 — Definir monitoramento e disponibilidade
- **Tipo:** Infra; **prioridade:** P1; **tamanho:** M; **dependências:** T-48.
- **Descrição:** configurar o monitor aprovado e a responsabilidade operacional.
- **Arquivos prováveis:** `plans/weather-app-plan.md`, `tasks/weather-app-tasks.md`.
- **Rastreabilidade:** RF-05, RF-06; RNF-04, RNF-05.
- **Critérios de aceite:** registrar ferramenta, responsável, ponto observado, frequência, cálculo mensal e reação a falhas de hospedagem separadas da API; validar uma falha controlada e sua notificação em ambiente autorizado; 99,5% só pode ser demonstrado no período de medição, não por smoke test. Configuração externa é necessária e deve ter evidência, não apenas intenção documental.

### T-50 — Executar gates e fechar a entrega
- **Tipo:** Infra; **prioridade:** P1; **tamanho:** P; **dependências:** T-30, T-31, T-32, T-33, T-34, T-35, T-36, T-37, T-38, T-39, T-40, T-41, T-42, T-43, T-44, T-45, T-46, T-47, T-48, T-49.
- **Descrição:** consolidar evidência, cobertura e condição de liberação.
- **Arquivos prováveis:** `tasks/weather-app-tasks.md`.
- **Rastreabilidade:** RF-01, RF-02, RF-03, RF-04, RF-05, RF-06, RF-07; RNF-01, RNF-02, RNF-03, RNF-04, RNF-05, RNF-06, RNF-07.
- **Critérios de aceite:** registrar versões e resultados de pnpm lint/build/test/test:e2e, auditorias e smoke publicado; nenhum requisito ou defeito bloqueante sem responsável/solução; não marcar aprovação, disponibilidade mensal ou teste manual não executado como comprovado; se o monitor ainda não completou o mês, registrar expressamente esse limite de evidência.

## Revisão de Granularidade — P5.2

| Recorte inicialmente grande | Divisão adotada | Resultado |
| --- | --- | --- |
| Modelo completo e estados | T-01, T-02 | Contratos principais separados dos auxiliares. |
| Regras de dados e apresentação | T-03 a T-08 | Uma função de domínio por responsabilidade, sem UI ou fetch. |
| HTTP, deadline, quota e serviços | T-09 a T-13 | Transporte, resiliência e dois endpoints separados. |
| Estado e reavaliação temporal | T-14, T-15, T-16 | Busca, consulta e tempo não viram um hook monolítico. |
| Tela completa | T-17 a T-27 | Componentes individuais e integração incremental em App. |
| Testes gerais | T-28 a T-43 | Setup, fixtures e suítes por responsabilidade; nenhum teste é escondido em uma tarefa UI/Data. |
| Preparar produção | T-44 a T-50 | Acessibilidade, desempenho, integração, privacidade, publicação e monitoramento separados. |

Não há tarefas G nem tarefas com mais de dois arquivos prováveis. Arquivos compartilhados aparecem em tarefas sequenciais; suas dependências evitam alterações concorrentes nesse mesmo recorte. Dois arquivos não garantem esforço pequeno: se a descoberta técnica exceder uma responsabilidade, subdividir e atualizar as tabelas antes de iniciar.

## Rastreabilidade — P5.6

As tarefas de implementação abaixo entregam comportamento; tarefas Test/Infra geram evidência. A tabela não significa que alguma tarefa esteja concluída.

| Requisito | Tarefas que implementam | Tarefas de verificação |
| --- | --- | --- |
| RF-01 — Busca e seleção | T-01, T-05, T-12, T-14, T-18, T-25 | T-32, T-34, T-36, T-38, T-41, T-42, T-43 |
| RF-02 — Atual e atualização | T-01, T-04, T-06, T-07, T-08, T-13, T-15, T-16, T-19, T-22, T-26, T-27 | T-31, T-32, T-35, T-37, T-39, T-41, T-42 |
| RF-03 — Cinco dias | T-01, T-04, T-06, T-07, T-08, T-13, T-15, T-16, T-20, T-22, T-26 | T-31, T-32, T-35, T-37, T-39, T-41, T-42, T-43 |
| RF-04 — Unidades | T-01, T-03, T-19, T-20, T-21, T-27 | T-30, T-39, T-40, T-41, T-43, T-47 |
| RF-05 — Loading | T-02, T-10, T-14, T-15, T-17, T-18, T-22, T-25, T-26 | T-33, T-36, T-37, T-38, T-40, T-42, T-44 |
| RF-06 — Falha, vazio e recuperação | T-02, T-07, T-09, T-10, T-11, T-12, T-13, T-14, T-15, T-17, T-18, T-22, T-27 | T-33, T-34, T-35, T-36, T-37, T-38, T-40, T-42 |
| RF-07 — Identificação e consistência | T-01, T-05, T-06, T-08, T-13, T-14, T-15, T-16, T-19, T-20, T-22, T-26 | T-31, T-35, T-36, T-37, T-39, T-40, T-41, T-42, T-43 |

**Requisitos funcionais sem tarefa correspondente: nenhum.** RNF-01: T-24/T-43; RNF-02: T-17 a T-22/T-38/T-40/T-44; RNF-03: T-45; RNF-04: T-48/T-49; RNF-05: T-10/T-11/T-33/T-37/T-42; RNF-06: T-03/T-04/T-06/T-30/T-31/T-39; RNF-07: T-09/T-46/T-47. OQ pendente não equivale a requisito aceito.

## Prioridade e Fatias Verticais — P5.7

A ordem principal respeita tipos → funções puras → services → hooks → componentes → integração → testes → hardening. Para demonstrar algo antes de terminar toda a infraestrutura de forecast, pode-se antecipar somente tarefas cujas dependências já estejam concluídas; a numeração é uma ordem topológica válida, não uma exigência de fazer funcionalidades independentes antes da primeira tela.

| Fatia | Sequência sugerida, com dependências acumuladas | Resultado visível e validação |
| --- | --- | --- |
| 1 — Buscar cidades | T-01, T-02, T-05, T-09, T-10, T-11, T-12, T-14, T-17, T-18, T-23, T-24, T-25; depois T-28, T-29, T-33, T-34, T-36, T-38 | Busca real, homônimos, loading, vazio e falha; primeira demonstração, ainda não aplicação completa. Não instalar forecast simulado como comportamento de produção. |
| 2 — Ler clima e previsão | T-03, T-04, T-06, T-07, T-08, T-13, T-15, T-16, T-19, T-20, T-22, T-26; depois T-30, T-31, T-32, T-35, T-37, T-39 | Cidade selecionada com atual e cinco dias, dados parciais e horários corretos. |
| 3 — Concluir jornada | T-21, T-27, T-40, T-41, T-42, T-43 | Unidades, refresh/retry e fluxo E2E em desktop/mobile; nenhum request pela conversão. |
| 4 — Liberar com evidência | T-44, T-45, T-46, T-47, T-48, T-49, T-50 | Qualidade, privacidade, publicação e operação conforme gates aprovados. |

As quatro fatias são incrementais: não pular testes de uma fatia para declarar release. Prioridade não substitui dependência: por exemplo, T-11 é P1, mas precede T-12 para que o serviço já respeite a política de quota.

## Prompt de Implementação de T-01 — P5.8

O texto abaixo está pronto para entregar ao Coding Agent, mas não o executa. Não delegar o backlog inteiro nem iniciar T-02 junto com T-01.

```text
Implemente somente T-01 — Definir os contratos principais — no Weather App.

Contexto:
- Repositorio SDD Weather App; narrativa e comentarios em pt-BR,
  identificadores em en-US. Stack: TypeScript strict, React/Vite,
  Tailwind, Open-Meteo sem API key, pnpm e Biome.
- Fontes: specs/weather-app-spec.md, plans/weather-app-plan.md e
  tasks/weather-app-tasks.md. Leia tambem .github/copilot-instructions.md
  e as instrucoes react/tailwind que se aplicam a src/**/*.ts.
- Antes de editar, confirme que spec, plano e tarefa existem e que o gate
  de aprovacao da baseline foi fechado. Se nao houver registro de aprovacao,
  reporte o bloqueio; este prompt nao concede aprovacao em nome do produto.
- Preserve mudancas existentes do usuario. Nao implemente outra tarefa.

Arquivo permitido: src/types/weather.ts.
Crie-o se ausente; se existir, preserve contratos nao relacionados.

Declare e exporte exatamente estes contratos principais:
- Unit = 'celsius' | 'fahrenheit'.
- LocalDate = string, com invariante documental YYYY-MM-DD no fuso da cidade.
- InstantMs = number, com invariante documental epoch em milissegundos.
- City: key string; name string; region string|null; country string|null;
  latitude number; longitude number.
- CurrentWeather: referenceAt InstantMs; temperatureC number|null;
  conditionCode number|null.
- ForecastDay: date LocalDate; minimumC number|null;
  maximumC number|null; conditionCode number|null.
- WeatherData: city City; timeZone string; obtainedAt InstantMs;
  current CurrentWeather|null; daily readonly ForecastDay[].

Semantica obrigatoria:
- Temperaturas do dominio permanecem em Celsius original; Unit e escolha
  de apresentacao. Zero e negativos sao validos; null significa indisponivel.
- referenceAt e o instante da estimativa da fonte; obtainedAt e quando
  a consulta foi obtida. Nao trocar nem equiparar esses horarios.
- City e a selecao do usuario, nao as coordenadas do grid do forecast.
- Aliases nao validam JSON em runtime; nao afirmar que o fazem.

Criterios de aceite:
1. Todos os sete contratos estao exportados e correspondem aos campos,
   nomes e nulabilidade acima, sem any e sem casts para esconder erros.
2. Campos possuem comentarios curtos em pt-BR, conforme o plano; sem
   comentarios extensos que repitam a especificacao inteira.
3. Arquivo contem apenas tipos/interfaces: sem fetch, componentes, hooks,
   conversao, persistencia, dependencias novas ou contratos auxiliares de T-02.
4. Verificacao TypeScript strict passa para o arquivo. Nao gerar JS ou
   arquivos de build para comprovar o contrato isolado.

Rastreabilidade: RF-01, RF-02, RF-03, RF-04, RF-07;
AC-02, AC-03, AC-05, AC-08, AC-15. Esta tarefa cria contratos,
nao comprova sozinha esses comportamentos funcionais.

Validacao:
- Execute primeiro o typecheck focado, sem emissao, e o lint do arquivo.
- Rode pnpm lint, pnpm build e pnpm test conforme as instrucoes do projeto.
  Nesta fase inicial, entrypoints/setup/suites podem ainda nao existir:
  registre causa e resultado de cada comando; nao modifique arquivos fora
  do escopo para consertar infraestrutura nem declare gates como aprovados.
- Nao crie teste executavel sem comportamento a testar: T-01 e declarativa;
  os testes de runtime pertencem as tarefas Test dedicadas do backlog.

Ao concluir, informe arquivo alterado, contratos exportados e comandos com
seus resultados. Nao faca commit, nao abra PR e nao avance para T-02.
```