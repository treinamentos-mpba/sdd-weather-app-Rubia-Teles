# Weather App — Especificação de Produto

### Incremento autorizado — P9: qualidade e resiliência

- Auditar teclado, foco, semântica e contraste. Comunicar andamento com aria-busy e região de status persistente; ao concluir busca, focar o resultado somente se isso não interromper outra edição ou interação com a unidade. Essa exceção explícita complementa a regra anterior de anúncios sem mover foco durante loading.
- Garantir timeout inclusive durante leitura do corpo, mensagens amigáveis e retry da última etapa; HTTP 429 com Retry-After válido bloqueia chamadas ao serviço afetado até o prazo, sem retry automático.
- Campos inválidos/ausentes devem resultar em indisponibilidade, nunca NaN/undefined ou medição inventada. Preservar a exceção P8 da precipitação explicitamente nula com unidade mm. Reavaliar referência e janela local com a página aberta, sem polling da API.
- Acrescentar regressões para busca vazia/espaços, caracteres especiais e limites, offline, resposta parcial/incompleta, timeout, cooldown e atualização temporal. Confirmar os ACs com evidência individual, sem tratar aprovação de testes como comprovação de RNFs operacionais ou acessibilidade manual.

### Incremento autorizado — P8: testes e contratos de apresentação

- P8.1–P8.8 amplia a suíte determinística. unitLabel retorna °C/°F; formatDay aceita data com referência local ou índice da previsão (0 = Hoje, 1 = Amanhã, demais = dia da semana); getShortDate retorna dd/MM sem depender do fuso do executor.
- Para esta revisão, objeto de geocoding sem results, inclusive {}, representa resultado vazio. results presente com tipo incorreto e respostas não-objeto continuam erros. Essa regra substitui a exigência anterior de generationtime_ms para reconhecer ausência de results.
- Exceção explícita solicitada em P8.3: current.precipitation nulo, com unidade confirmada mm, é normalizado para zero. Campo omitido, unidade incompatível e probabilidade diária ausente continuam indisponíveis; a regra não se estende aos demais dados meteorológicos.
- As regiões da previsão terão nome acessível “Previsão de 5 dias”. Testes de rede usam respostas controladas; mobile inclui 375×812. O aceite de P8 exige regressões para conversão, falha de API e resposta parcial, sem alterar gates operacionais pendentes.

### Incremento autorizado — P7: integração Open-Meteo

- P7.1–P7.7 substitui a demonstração por consulta real. A busca carrega automaticamente o clima da primeira cidade retornada; demais localidades ficam disponíveis para seleção explícita. Essa regra substitui a seleção exclusivamente manual da baseline anterior.
- searchCities retorna lista vazia para entrada sem conteúdo sem acessar a rede. getWeather exige os grupos current e daily; grupo ausente é erro de resposta incompleta. Campos individuais ausentes continuam indisponíveis e a janela diária tem cinco posições, sem inventar medições.
- Aplicar timeout de dez segundos por requisição HTTP, incluindo leitura do JSON. A busca completa envolve geocoding e forecast sequenciais; esse orçamento por request substitui o limite total de uma operação descrito anteriormente para este incremento.
- O hook expõe idle/loading/success/error/empty, data, cities, error, query e search/selectCity/retry. Retry repete a última busca se geocoding falhou, ou o forecast da cidade se essa etapa falhou. Respostas substituídas e desmontagem não atualizam estado.
- App inicia idle, sem fixture, sem seletor de cenário e sem persistência. A unidade continua local e sua mudança não dispara chamadas. Loading e erro deixam explícito o estado real da consulta. P7 não declara encerrados os gates de produção ou auditoria externa.

### Incremento autorizado — P6: UI com fixture

- A solicitação P6.1–P6.8 autoriza implementar a apresentação com fixture local, sem antecipar integração de API nem aprovação operacional de produção.
- Acrescentar ao clima atual umidade relativa (%), vento a 10 m (km/h), precipitação do intervalo atual (mm) e pressão à superfície (hPa); acrescentar probabilidade máxima diária de precipitação (%) à previsão. Campos ausentes são anuláveis e aparecem como indisponíveis, nunca zero inventado. Temperaturas permanecem em Celsius no domínio.
- Nesta entrega, SearchBar envia nome após trim e validação de 2–100 pontos de código; UnitToggle usa botões °C/°F com aria-pressed. A consulta é simulada, sem geocoding real, e identificada visualmente como dados de exemplo. Seleção de homônimos e demais fluxos HTTP ficam para a fase API.
- Aceite P6: busca vazia não dispara callback; unidade altera atual e previsão sem request; cinco cards responsivos exibem data, condição, mínima/máxima e probabilidade de chuva; loading, vazio e erro são acessíveis; teclado, foco e ausência de overflow são verificados de 320 CSS px a desktop. Estados simulados não devem parecer erros reais da fonte.

## Overview

- **Fonte:** [discovery.md](discovery.md).
- **Status:** especificação detalhada para aprovação. As decisões do discovery permanecem confirmadas. Os refinamentos de comportamento e metas abaixo constituem uma proposta de baseline, não uma aprovação dos stakeholders nem evidência de prontidão operacional.
- **Problema:** pessoas precisam consultar o tempo de uma cidade para se preparar para o dia ou planejar atividades, inclusive em dispositivos móveis.
- **Objetivo:** permitir buscar uma cidade, consultar suas condições atuais e a previsão de cinco dias, com temperaturas na unidade escolhida.
- **Personas propostas:** pessoa que se desloca diariamente, pessoa viajante e pessoa acostumada a Fahrenheit. A prioridade entre elas ainda depende de validação.
- **Sucesso de produto:** concluir sem ajuda a busca e a leitura do clima; interpretar corretamente cidade, datas e temperaturas; alternar unidades sem inconsistências. Taxas e tempos-alvo dependem de aprovação.

### Decisões confirmadas

| Tema | Decisão |
| --- | --- |
| Fonte de dados | Open-Meteo, sem API key. |
| Janela de previsão | Hoje mais os quatro dias seguintes. |
| Unidade inicial | Celsius, com alternância para Fahrenheit. |
| Autenticação | Não haverá autenticação. |
| Persistência no servidor | Não haverá persistência de dados da aplicação no servidor. |
| Idioma | Interface em português do Brasil (pt-BR). |

### Jornada de referência

1. A pessoa acessa a aplicação e informa uma cidade.
2. A aplicação informa o andamento da busca e apresenta os resultados ou a ausência deles.
3. A pessoa identifica e seleciona a localidade desejada.
4. A aplicação apresenta as condições atuais e a previsão de hoje e dos quatro dias seguintes.
5. A pessoa pode alternar a unidade de temperatura ou realizar outra busca.
6. Em caso de falha recuperável, a aplicação informa o problema e oferece nova tentativa.

O fluxo prioriza a pessoa que se desloca diariamente, sem excluir as demais personas. No primeiro acesso, mostrar busca vazia e nenhuma cidade ou previsão selecionada. Os refinamentos abaixo fecham as alternativas de comportamento para permitir estimativa e testes; sua aprovação está registrada em Open Questions.

## Functional Requirements

Os identificadores preservam a rastreabilidade com o discovery. As regras desta seção complementam os requisitos e fazem parte da proposta de baseline.

| ID | Requisito | Regras aplicáveis |
| --- | --- | --- |
| RF-01 | Buscar cidades por envio explícito, apresentar até dez resultados e consultar somente uma localidade selecionada pela pessoa. | Busca e seleção. |
| RF-02 | Exibir temperatura e condição atual; permitir atualização manual da cidade selecionada. | Dados, tempo e estados. |
| RF-03 | Exibir previsão diária de hoje e dos quatro dias seguintes, com mínima, máxima e condição por dia. | Dados, tempo e estados. |
| RF-04 | Iniciar em Celsius e alternar todas as temperaturas para Celsius ou Fahrenheit sem mudar cidade, datas ou condições. | Unidades e retenção. |
| RF-05 | Comunicar visualmente e por tecnologia assistiva o início e o encerramento de cada operação. | Estados e acessibilidade. |
| RF-06 | Distinguir validação, busca vazia, falha, timeout e disponibilidade parcial; permitir recuperação sem recarregar a página. | Estados e recuperação. |
| RF-07 | Identificar cidade, unidade, datas, fuso e horários de referência; impedir mistura entre localidades e respostas antigas. | Busca, tempo e concorrência. |

### Busca e seleção

- Disparar busca por botão ou Enter, nunca apenas ao digitar. Remover espaços nas extremidades; aceitar de 2 a 100 pontos de código Unicode após essa remoção. Fora desse intervalo, indicar o limite e não chamar a fonte.
- Aceitar acentos, espaços internos, hífens e apóstrofos; não restringir nomes ao alfabeto latino nem prometer correção ortográfica. Tratar toda entrada e todo nome recebido como texto, nunca como marcação executável.
- Cobertura: localidades retornadas pelo geocoding da Open-Meteo, sem restrição de país e sem garantia de catálogo completo. Preservar a ordem da fonte e limitar a dez resultados.
- Exibir nome, região e país disponíveis. Se ainda houver rótulos idênticos ou faltarem ambos região e país, mostrar também latitude e longitude. Só tornar selecionável resultado com nome e coordenadas válidos: latitude entre -90 e 90 e longitude entre -180 e 180.
- Lista explicitamente vazia significa nenhuma correspondência. Estrutura inesperada significa falha de dados; a ausência do campo de resultados só significa lista vazia se prevista no contrato validado da fonte. Se todos os resultados recebidos forem inválidos, informar indisponibilidade, não cidade inexistente. Havendo resultados válidos e inválidos, exibir apenas os válidos com aviso de lista parcial.
- Uma nova busca remove os resultados anteriores, mas não altera o painel meteorológico. Selecionar uma localidade substitui a cidade anterior; não há comparação nem seleção automática do primeiro resultado.

### Dados meteorológicos

| Grupo | Campos e validação |
| --- | --- |
| Identificação | Localidade selecionada, coordenadas e fuso IANA válido retornado para a consulta. Sem fuso válido, a consulta meteorológica falha; não usar silenciosamente o fuso do dispositivo. |
| Atual | Temperatura numérica finita, código de condição e instante de referência da fonte. Zero e temperaturas negativas são válidos. Sem instante válido, todo o grupo atual fica indisponível. |
| Diário | Cinco datas locais distintas em ordem crescente; cada data possui temperatura mínima, máxima e código de condição. Mínima maior que máxima invalida o par, não o restante do dia. |

- Valores nulos, ausentes ou não finitos são indisponíveis, nunca zero. Exibir “Indisponível” no campo correspondente. Não fabricar datas recebidas nem valores a partir de outros dias.
- Construir cinco posições com as datas esperadas; exibir os campos válidos e sinalizar ausências. Se houver datas duplicadas, invalidar os registros dessa data; ignorar datas fora da janela. Resposta sem nenhum campo meteorológico utilizável é erro de dados. Qualquer ausência em uma resposta utilizável gera aviso de dados parciais e opção de atualizar.
- Código desconhecido ou ausente: “Condição indisponível”; não presumir céu limpo. Usar o mapeamento abaixo tanto no atual quanto no diário; não depender apenas de ícones.

| Códigos meteorológicos WMO | Texto em pt-BR |
| --- | --- |
| 0 / 1 / 2 / 3 | Céu limpo / Predominantemente limpo / Parcialmente nublado / Encoberto |
| 45, 48 | Nevoeiro |
| 51, 53, 55 | Garoa |
| 56, 57 | Garoa congelante |
| 61, 63, 65 | Chuva |
| 66, 67 | Chuva congelante |
| 71, 73, 75, 77 | Neve |
| 80, 81, 82 | Pancadas de chuva |
| 85, 86 | Pancadas de neve |
| 95 | Trovoadas |
| 96, 99 | Trovoadas com granizo |

### Tempo e atualização

- “Hoje” é a data no fuso IANA da cidade consultada no momento de apresentar os dados, não a data do dispositivo. Usar aritmética de calendário para obter os quatro dias seguintes, inclusive em mudanças de mês, ano e horário de verão.
- Mostrar datas como dd/MM e identificar hoje; apresentar horários de referência e de obtenção como dd/MM/aaaa HH:mm, identificados separadamente e acompanhados do fuso da cidade. Obtenção não significa horário de observação.
- “Atual” é uma estimativa da fonte. Referência com idade maior que duas horas recebe aviso de desatualização; referência mais de cinco minutos no futuro invalida o grupo atual. Os limites são inclusivos para validade e devem ser reavaliados enquanto os dados estiverem visíveis.
- Consultar ao selecionar uma cidade, acionar atualização manual ou tentar novamente. Não fazer polling automático. Ao mudar a data local com a página aberta, ou retornar à página após a virada, reconstituir a janela e sinalizar a necessidade de atualização; não rotular ontem como hoje. Novos dias ficam indisponíveis até atualizar.

### Unidades e retenção

- Uma abertura ou recarga inicia em Celsius, sem cidade selecionada. Manter a unidade escolhida entre consultas apenas enquanto a página estiver aberta; não gravar histórico, cidade ou preferências para sessões futuras.
- Converter a partir dos valores originais, sem arredondamentos intermediários: Fahrenheit = Celsius × 9/5 + 32. Exibir uma casa decimal, vírgula decimal e unidade; arredondar ao valor mais próximo e, em empate, afastar de zero. Não exibir zero negativo.
- A troca é local, não inicia consulta e aplica a unidade ativa também às respostas ainda pendentes.

### Estados, recuperação e concorrência

- Busca e painel meteorológico têm estados independentes. Ao iniciar consulta meteorológica, remover os dados meteorológicos anteriores e mostrar a cidade selecionada com loading; atualizar a mesma cidade segue a mesma regra. Uma falha de busca não apaga uma consulta meteorológica já concluída.
- Cada operação lógica de busca ou consulta meteorológica tem limite total de 10 segundos desde o disparo, incluindo eventual espera entre chamadas. Ao atingir o limite sem conclusão, encerrar loading, informar timeout e oferecer nova tentativa. Não reiniciar o prazo por chamada interna.
- Não fazer tentativas automáticas. Nova tentativa repete os parâmetros da operação que falhou; não modifica o texto que a pessoa editou depois. Durante uma tentativa em andamento, impedir envios duplicados idênticos, mas permitir nova busca diferente ou seleção de outra cidade.
- Falhas de rede, HTTP 5xx e respostas ilegíveis geram erro recuperável. HTTP 429 informa limite temporário; se houver Retry-After válido, bloquear novas consultas ao serviço afetado até o prazo indicado. Sem esse cabeçalho, permitir tentativa manual. Não tratar erro como lista vazia.
- Só a operação mais recente de cada fluxo pode alterar resultados, mensagens ou loading. Respostas antigas, inclusive falhas e respostas pós-timeout, não modificam estado. Selecionar outra cidade invalida também uma atualização pendente da anterior.
- Loading deve ser visível e anunciado sem mover foco. Ao concluir, anunciar resultado, vazio, parcial ou erro; mensagens e controles precisam de nomes acessíveis em pt-BR.

## User Stories

| ID | História | Requisito | Critérios |
| --- | --- | --- | --- |
| US-01 | Como pessoa viajante que planeja uma viagem, quero buscar e selecionar a cidade de destino para consultar a previsão da localidade correta, sem confundi-la com cidades homônimas. | RF-01 | AC-01, AC-02, AC-17, AC-18, AC-19, AC-31 |
| US-02 | Como pessoa que se desloca diariamente, quero consultar e atualizar a temperatura e a condição atual para me preparar antes de sair. | RF-02 | AC-03, AC-04, AC-22, AC-28 |
| US-03 | Como pessoa viajante que planeja uma viagem, quero consultar a previsão de hoje e dos quatro dias seguintes para organizar minhas atividades no destino. | RF-03 | AC-05, AC-06, AC-21, AC-23 |
| US-04 | Como pessoa acostumada a Fahrenheit, quero alternar de Celsius para Fahrenheit para compreender as temperaturas atuais e previstas na unidade que uso no dia a dia. | RF-04 | AC-07, AC-08, AC-09, AC-24, AC-25 |
| US-05 | Como pessoa que se desloca diariamente, quero identificar quando uma busca ou consulta meteorológica está em andamento para saber se devo aguardar o resultado antes de sair. | RF-05 | AC-10, AC-11 |
| US-06 | Como pessoa que se desloca diariamente, quero distinguir uma busca sem resultados de uma falha e poder realizar outra busca ou tentar novamente para obter o clima necessário ao meu deslocamento. | RF-06 | AC-12, AC-13, AC-14, AC-20, AC-29, AC-30 |
| US-07 | Como pessoa viajante que planeja uma viagem, quero identificar a cidade consultada e a unidade das temperaturas exibidas para interpretar corretamente os dados ao planejar minhas atividades. | RF-07 | AC-15, AC-16, AC-26, AC-27, AC-32 |

## Acceptance Criteria

Cada linha define um cenário no formato **Given/When/Then**: contexto inicial, ação ou evento e resultado observável. Os identificadores e vínculos são estáveis para orientar os testes automatizados.

### Condições de teste

- Usar respostas controladas da fonte, sem depender de alterações meteorológicas ou da disponibilidade da API real.
- Controlar relógio e fuso nos cenários com datas. D representa hoje no fuso da cidade no instante de exibição.
- Executar separadamente cada variante indicada na mesma linha, como busca e consulta meteorológica, sucesso e falha, ou seleção de cada cidade homônima.
- Números nas fixtures representam valores físicos; na interface exigir uma casa decimal, vírgula e unidade conforme as regras de apresentação.
- Verificar o significado dos textos em pt-BR, sem exigir uma redação literal ainda não aprovada.

| ID | Vínculo | Given | When | Then |
| --- | --- | --- | --- | --- |
| AC-01 | US-01 / RF-01 | O acesso é inicial e uma busca válida retornará duas localidades válidas A e B. | A pessoa digita sem enviar e depois envia por botão; repetir usando Enter. | Digitar não chama a fonte; enviar produz uma busca, apresenta A e B na ordem recebida e não inicia previsão antes da seleção. |
| AC-02 | US-01 / RF-01 | Os resultados contêm duas cidades homônimas A e B, com regiões e países distintos fornecidos pela fonte. | A pessoa seleciona A; repetir o cenário selecionando B. | Cada resultado exibe nome, região e país recebidos; a consulta meteorológica corresponde à localidade selecionada, não à outra cidade homônima. |
| AC-03 | US-02 / RF-02 | Celsius está ativo e a resposta válida contém 20 °C, código 0 e referência de 30 minutos atrás. | A consulta termina. | Mostrar 20,0 °C, “Céu limpo” e nenhum aviso de desatualização. Repetir para os códigos da tabela de condições e verificar seus textos. |
| AC-04 | US-02 / RF-02 | A cidade está selecionada e a resposta controlada não contém temperatura atual válida; testar campo ausente e valor nulo separadamente. | A aplicação recebe essa resposta. | A interface indica indisponibilidade da temperatura atual e não apresenta zero ou outro número como substituto da medição ausente. |
| AC-05 | US-03 / RF-03 | O relógio de referência está fixo em D e a resposta controlada contém previsão completa para D, D+1, D+2, D+3 e D+4. | A consulta meteorológica termina com sucesso. | A previsão cobre exatamente essas cinco datas, identificadas na interface, sem omissões, duplicações ou inclusão de D+5. |
| AC-06 | US-03 / RF-03 | D até D+4 têm mínimas de 10 a 14 °C, máximas de 20 a 24 °C e códigos 0, 3, 61, 71 e 95, respectivamente. | A consulta termina em Celsius. | Cada data mostra sua mínima e máxima distintas, com uma casa decimal, e respectivamente “Céu limpo”, “Encoberto”, “Chuva”, “Neve” e “Trovoadas”, sem troca entre dias. |
| AC-07 | US-04 / RF-04 | Trata-se do primeiro acesso, sem preferência anterior, e a fonte fornece temperatura atual e temperaturas previstas válidas em Celsius. | A pessoa abre a aplicação e conclui a primeira consulta sem alterar a unidade. | Celsius é a unidade selecionada e todas as temperaturas disponíveis são exibidas nessa unidade, identificadas como °C. |
| AC-08 | US-04 / RF-04 | O clima atual e a previsão estão visíveis e incluem temperaturas de 0 e 20 °C. Para a variante inversa, os mesmos valores físicos estão exibidos como 32 e 68 °F. | A pessoa seleciona Fahrenheit; na variante inversa, seleciona Celsius. | Todos os campos de temperatura passam a usar a unidade escolhida: 0 e 20 °C correspondem a 32 e 68 °F, respectivamente, e vice-versa. Cidade, datas e condições meteorológicas permanecem inalteradas. |
| AC-09 | US-04 / RF-04 | Nenhuma temperatura está disponível e Celsius está ativo. A próxima resposta meteorológica válida contém temperatura de 0 °C. | A pessoa seleciona Fahrenheit e conclui uma consulta com essa resposta, sem alterar novamente a unidade. | Fahrenheit permanece selecionado e a temperatura recebida é apresentada como 32 °F. |
| AC-10 | US-05 / RF-05 | A resposta ficará pendente por menos de 10 segundos; testar busca e consulta meteorológica. | A pessoa inicia a operação. | Loading fica visível, o início é anunciado por região de status acessível e o foco não é deslocado; a busca continua editável e a unidade pode ser alterada. |
| AC-11 | US-05 / RF-05 | Uma busca ou consulta meteorológica está em loading. | A operação termina; testar sucesso, vazio de busca, parcial meteorológico e falha separadamente. | Loading termina e o resultado fica visível e é anunciado sem mover foco. Validar o anúncio também com leitor de tela, não só pela presença de atributos. |
| AC-12 | US-06 / RF-06 | A pessoa informou uma cidade e a resposta controlada da busca é uma lista vazia. | A busca termina com sucesso. | A interface informa que nenhuma cidade foi encontrada, não apresenta falha de rede para essa operação e mantém a busca disponível para uma nova entrada. |
| AC-13 | US-06 / RF-06 | Uma busca ou consulta meteorológica está em andamento. | A operação termina com falha de rede ou resposta de erro da fonte; executar cada combinação separadamente. | A interface informa a impossibilidade de concluir a operação, oferece nova tentativa e encerra o carregamento dessa operação. |
| AC-14 | US-06 / RF-06 | Uma busca ou consulta meteorológica falhou e a próxima resposta está controlada para retornar dados válidos. | A pessoa aciona nova tentativa e a resposta chega com sucesso. | A mesma busca ou cidade é consultada novamente, os resultados correspondentes são apresentados, o feedback de erro é removido e não ocorre recarregamento da página. |
| AC-15 | US-07 / RF-07 | A cidade selecionada e a unidade ativa são conhecidas e a resposta contém temperaturas atuais e previstas válidas. | A consulta termina e os dados são exibidos; repetir em Celsius e Fahrenheit. | O nome da cidade está visível e cada temperatura tem sua unidade identificável junto ao valor ou no grupo que a contém, sem rótulos contraditórios entre clima atual e previsão. |
| AC-16 | US-07 / RF-07 | A consulta de A está pendente e B é selecionada em seguida. | B termina com sucesso e depois chega sucesso ou erro de A, em variantes separadas. | Dados, mensagens, cidade e loading permanecem correspondentes a B; a resposta antiga não altera a tela. |
| AC-17 | US-01 / RF-01 | A entrada tem 0, 1 ou 101 pontos de código após trim; testar também somente espaços. | A pessoa tenta enviar. | Mostrar o intervalo permitido e não chamar geocoding nem previsão. Entradas de 2 e 100 pontos de código são aceitas. |
| AC-18 | US-01 / RF-01 | As entradas são “ São Paulo ”, “D'Oeste” e um nome não latino; testar separadamente. | A pessoa envia a busca. | A fonte recebe o nome sem espaços externos, preservando os demais caracteres. Marcação digitada ou retornada é exibida como texto, sem executar conteúdo. |
| AC-19 | US-01 / RF-01 | Há 12 localidades válidas na resposta, incluindo homônimos sem região e país. | A busca termina e uma localidade é selecionada. | Só as dez primeiras aparecem na ordem recebida; rótulos ambíguos mostram coordenadas; a previsão usa as coordenadas da seleção. |
| AC-20 | US-06 / RF-06 | Uma busca ou consulta permanece pendente; testar ambas. | O relógio avança a 9.999 ms e depois a 10.000 ms desde o disparo. | Antes do limite há loading; no limite há timeout e nova tentativa, sem loading. Resposta posterior não altera a tela e não ocorre tentativa automática. |
| AC-21 | US-03 / RF-03 | Há dados válidos em D e D+2, omissão de D+1 e D+4 e duplicação de D+3; a mínima supera a máxima em D+2. | A consulta termina. | Mostrar cinco datas: dados válidos em D, condição válida e par térmico indisponível em D+2, ausências nas demais; mostrar aviso parcial e atualizar, sem inventar valores. |
| AC-22 | US-02 / RF-02 | Há código desconhecido, temperatura negativa válida e referência válida. | A consulta termina. | Exibir a temperatura negativa, “Condição indisponível” e aviso parcial; não usar céu limpo como fallback. |
| AC-23 | US-03 / RF-03 | Agora é 01/01/2027 01:00 UTC e a cidade usa America/Sao_Paulo; o dispositivo usa UTC. | A consulta termina com dados completos. | Hoje é 31/12/2026 e a janela vai até 04/01/2027. Repetir em America/New_York com hoje em 07/03/2026, atravessando o início do horário de verão, e verificar datas de 07/03 a 11/03. |
| AC-24 | US-04 / RF-04 | A consulta em Celsius está pendente e retornará 0 °C. | A pessoa seleciona Fahrenheit antes da resposta chegar. | Mostrar 32,0 °F sem nova chamada por causa da troca de unidade. |
| AC-25 | US-04 / RF-04 | As temperaturas originais são -40, 0,25 e -0,25 °C. | A pessoa alterna unidades repetidamente e retorna a Celsius. | Fahrenheit mostra -40,0, 32,5 e 31,6 °F; Celsius mostra -40,0, 0,3 e -0,3 °C. Não há deriva por conversões sucessivas nem zero negativo. Recarregar restaura Celsius e remove a cidade. |
| AC-26 | US-07 / RF-07 | B foi selecionada após consulta de A, ainda pendente. | A responde enquanto B aguarda; repetir com B já em falha. | Nenhum dado de A aparece, B continua identificada e seu loading ou erro permanece inalterado. |
| AC-27 | US-07 / RF-07 | A busca de texto A está pendente e uma busca de texto B é enviada. | B responde e depois chega sucesso ou erro de A. | Resultados e mensagens continuam correspondentes a B. Uma falha de busca não remove o painel meteorológico existente. |
| AC-28 | US-02 / RF-02 | Dados da cidade estão visíveis e o relógio está controlado. | A pessoa aciona atualização manual. | Remover os dados anteriores, consultar a mesma cidade e mostrar loading. No sucesso, apresentar dados novos; na falha, manter erro sem dados antigos. |
| AC-29 | US-06 / RF-06 | Uma operação recebe HTTP 429 com Retry-After de 60 segundos. | A resposta chega e o relógio avança até o prazo. | Informar limite temporário, impedir novas consultas ao serviço afetado antes de 60 segundos e habilitá-las no prazo, sem retry automático. Testar também data HTTP válida e cabeçalho ausente ou inválido, que não bloqueiam tentativa manual. |
| AC-30 | US-06 / RF-06 | A busca retorna estrutura ilegível ou somente localidades inválidas; para previsão, testar ausência de todos os dados e fuso inválido. | A operação termina. | Mostrar erro recuperável, não lista vazia nem previsões fabricadas; manter nova tentativa disponível. |
| AC-31 | US-01 / RF-01 | Uma busca válida está pendente. | A pessoa envia novamente o mesmo texto e depois envia outro texto válido. | O envio idêntico não duplica a operação; o diferente inicia nova busca, remove resultados anteriores e invalida a resposta pendente anterior. |
| AC-32 | US-07 / RF-07 | Relógio e referência estão controlados; testar cada limite independentemente com previsão válida. | A idade passa de duas horas para duas horas e um segundo; em variantes, a fonte informa referência cinco minutos e cinco minutos e um segundo no futuro; em outra variante, ocorre a virada local. | Duas horas ainda não gera aviso, acima disso gera; até cinco minutos futuros é válido, acima disso o atual fica indisponível. Na virada, a janela avança, ontem é removido, o novo dia fica indisponível e há pedido de atualização sem chamada automática. Referência e obtenção aparecem separadamente, no formato definido e com fuso. |

## Non-Functional Requirements

Os RNFs abaixo mantêm os temas do discovery. Metas numéricas, matriz de compatibilidade e nível de conformidade continuam propostas, não compromissos aprovados. Os métodos de verificação orientam seu fechamento.

| ID | Requisito | Verificação e status |
| --- | --- | --- |
| RNF-01 | Busca, seleção, leitura e troca de unidade devem funcionar desde 320 CSS px até desktop, sem rolagem horizontal da página ou perda de controles e conteúdo. | Verificar em 320, 375, 768 e 1440 CSS px, em retrato e paisagem quando aplicável. Larguras de teste propostas; matriz final em OQ-09. |
| RNF-02 | Os fluxos principais devem funcionar por teclado, com nomes acessíveis, foco visível e comunicação acessível de loading, vazio e erro. Propõe-se WCAG 2.2 AA. | Executar os fluxos sem mouse e verificar nomes, ordem de foco, anúncios e contraste. Aprovar nível e tecnologias assistivas em OQ-09; uma auditoria automática isolada não demonstra conformidade. |
| RNF-03 | Propõe-se que 95% das consultas apresentem os dados em até 3 segundos nas condições de referência acordadas. | O discovery exclui latência externa: separar tempo de processamento da aplicação do tempo total percebido. Definir início/fim da medição, amostra, dispositivo, rede e latência controlada antes do aceite, em OQ-10. |
| RNF-04 | Propõe-se disponibilidade mensal de 99,5% da aplicação hospedada, medindo falhas da API separadamente. | Definir período, ponto de verificação e cálculo em OQ-10. Verificar também que uma falha da fonte não impede acessar a interface e tentar novamente. Não implica garantia de disponibilidade do provedor. |
| RNF-05 | Falhas da fonte não devem bloquear permanentemente a interface nem impedir a recuperação. | Simular falha seguida de sucesso e verificar AC-11, AC-13 e AC-14. Timeout e política de dados anteriores em OQ-06. |
| RNF-06 | Textos da aplicação devem ser em pt-BR, com formatos consistentes de números, datas e horários e unidade explícita. Nomes próprios de localidades podem preservar a grafia da fonte. | Inspecionar fluxos normal, vazio e erro; validar datas com relógio controlado após a decisão de fuso em OQ-05 e regras de arredondamento em OQ-07. |
| RNF-07 | Não exigir conta, credenciais da API nem persistir consultas ou preferências no servidor da aplicação. | Verificar que os fluxos funcionam sem login e que não há retenção desses dados pelo produto no servidor. Logs de hospedagem, tratamento pelo provedor e eventual retenção local precisam de avaliação em OQ-11; não se presume ausência de tratamento por terceiros. |

### Matriz de rastreabilidade

Esta matriz orienta a decomposição em tarefas e a seleção de testes. Os vínculos indicam aplicabilidade, não evidência de conformidade: os ACs verificam comportamento funcional e os RNFs exigem também as verificações próprias descritas acima. As metas e aprovações pendentes permanecem pendentes.

| User Story | Requisito funcional | Acceptance Criteria | RNFs de fluxo relevantes | Foco de verificação |
| --- | --- | --- | --- | --- |
| US-01 — Buscar e selecionar cidade | RF-01 | AC-01, AC-02, AC-17, AC-18, AC-19, AC-31 | RNF-01, RNF-02, RNF-03, RNF-06 | Validar limites e caracteres da entrada; testar busca, homônimos e seleção em telas de referência e por teclado; medir desempenho da busca no ambiente aprovado. |
| US-02 — Consultar e atualizar clima atual | RF-02 | AC-03, AC-04, AC-22, AC-28 | RNF-01, RNF-02, RNF-03, RNF-05, RNF-06 | Conferir valores e condições com respostas controladas; testar ausência de dados e recuperação da atualização; medir consulta e validar leitura acessível em pt-BR. |
| US-03 — Consultar previsão de cinco dias | RF-03 | AC-05, AC-06, AC-21, AC-23 | RNF-01, RNF-02, RNF-03, RNF-05, RNF-06 | Usar relógio e fuso controlados; verificar cinco datas, mínimas, máximas e dados parciais; testar legibilidade e consulta no ambiente de desempenho aprovado. |
| US-04 — Alternar unidades | RF-04 | AC-07, AC-08, AC-09, AC-24, AC-25 | RNF-01, RNF-02, RNF-06 | Testar conversão e arredondamento, troca durante loading e recarga; operar o seletor por teclado e conferir unidade e formatação em todos os campos. |
| US-05 — Acompanhar carregamento | RF-05 | AC-10, AC-11 | RNF-01, RNF-02, RNF-05, RNF-06 | Controlar início e término das operações; verificar loading, anúncios com leitor de tela, foco e encerramento em sucesso, vazio, parcial e falha. |
| US-06 — Entender falhas e recuperar consulta | RF-06 | AC-12, AC-13, AC-14, AC-20, AC-29, AC-30 | RNF-01, RNF-02, RNF-03, RNF-05, RNF-06 | Simular vazio, rede, erro, timeout, limite de uso e resposta inválida; avançar relógio para testar prazos e confirmar recuperação, mensagens e controles acessíveis. Medir a consulta recuperada nas condições aprovadas. |
| US-07 — Identificar e interpretar dados | RF-07 | AC-15, AC-16, AC-26, AC-27, AC-32 | RNF-01, RNF-02, RNF-05, RNF-06 | Simular respostas fora de ordem e falhas independentes; testar frescor, fuso e virada do dia; conferir associação entre cidade, datas, unidade e dados em leitura visual e assistiva. |

- **RNF-07 é transversal às sete histórias:** executar os fluxos sem conta nem credenciais da API e verificar ausência de persistência no servidor. AC-25 também verifica o comportamento de recarga proposto, mas não comprova sozinho as regras de retenção nem o tratamento por terceiros.
- **RNF-04 é operacional e sustenta todas as histórias:** criar tarefa própria de hospedagem e monitoramento após fechar OQ-10. Validar o indicador mensal separadamente; testes funcionais de recuperação não comprovam disponibilidade de 99,5%.
- **RNF-03 não é o timeout:** o limite funcional de 10 segundos em AC-20 não demonstra a meta de desempenho de três segundos. A medição de desempenho depende do fechamento de OQ-10.
- Cada tarefa e teste derivado deve informar os IDs de US, RF, AC e RNF que verifica. Não duplicar testes transversais por história quando o mesmo cenário integrado fornecer a evidência necessária.

## Edge Cases

| Caso | Comportamento esperado ou decisão pendente |
| --- | --- |
| Entrada vazia ou somente espaços | Não consultar uma cidade arbitrária; regra de validação e mensagem a definir em OQ-03. |
| Acentos, nomes compostos e grafias diferentes | Permitir informar o nome; não prometer correção de digitação ou normalização além da capacidade validada da busca. OQ-02 e OQ-03. |
| Cidades homônimas | Diferenciar por região e país disponíveis; consultar a seleção correta. AC-02. |
| Nenhuma cidade encontrada | Estado vazio distinto de falha, com possibilidade de nova busca. AC-12. |
| Sem rede, erro da fonte ou limite de requisições | Feedback de falha e nova tentativa; não prometer retomada automática nem retry ilimitado. AC-13 e AC-14. |
| Requisição que não termina | Deve haver um limite de espera e saída recuperável; duração pendente em OQ-06. |
| Temperatura zero ou negativa | Tratar como dado válido e aplicar a unidade ativa; não confundir zero com ausência. |
| Campo nulo, condição desconhecida ou resposta inválida | Não inventar valores ou condições; indicar indisponibilidade. Definir renderização parcial em OQ-06. |
| Menos de cinco datas válidas | Não inventar dias ou duplicar previsões; apresentação parcial ou erro depende de OQ-06. |
| Mudança de cidade com requisição anterior em andamento | Não misturar cidade e dados nem permitir que resposta antiga seja identificada como a nova consulta. AC-16. |
| Troca de unidade durante carregamento | Ao exibir o resultado, usar a unidade ativa e manter consistência entre clima atual e previsão. |
| Virada do dia, mudança de mês/ano ou horário de verão | As cinco datas devem continuar consecutivas no fuso aprovado; atualização da janela depende de OQ-05 e OQ-08. |
| Fuso do dispositivo diferente do destino | Não presumir que o dia local do dispositivo é o dia da cidade. Decisão normativa em OQ-05. |
| Falha após uma consulta bem-sucedida | Nunca apresentar dados antigos como novos; retenção, rótulo e remoção dependem de OQ-06. |
| Tela estreita, zoom ou uso por teclado | Manter controles utilizáveis e conteúdo legível, conforme RNF-01 e RNF-02. |

## Assumptions

- A aplicação será acessada por navegador, em mobile e desktop; não há demanda confirmada por aplicativo nativo.
- A cidade será escolhida explicitamente pela pessoa; geolocalização não é pressuposto para o fluxo principal.
- As três personas são hipóteses, não resultados de pesquisa validada.
- A fonte fornecerá dados suficientes para clima atual e cinco dias nas localidades atendidas; essa capacidade e suas condições de uso precisam ser verificadas.
- “Atual” designa o dado meteorológico de referência da fonte, não uma garantia de observação em tempo real no local da pessoa. A definição operacional depende de OQ-05.
- A unidade ativa deve ser consistente em toda a consulta. Sua manutenção entre consultas e sessões não é presumida.
- As questões abaixo não autorizam funcionalidades adicionais nem substituem aprovação. Alterações nas premissas devem atualizar requisitos e critérios afetados antes do plano técnico.

## Risks

| ID | Risco | Impacto | Mitigação |
| --- | --- | --- | --- |
| R-01 | Fonte indisponível, lenta ou com limite de uso atingido. | Alto: consulta não concluída. | Definir espera máxima e recuperação; validar limites e cenários de falha. |
| R-02 | Termos, cobertura ou condições de uso incompatíveis com o produto. | Alto: necessidade de rever a integração ou o escopo. | Verificar geocoding e previsão, licença, atribuição e condições do uso pretendido antes de aprovar o plano. |
| R-03 | Seleção de cidade homônima incorreta. | Alto: decisão baseada em localidade errada. | Diferenciar localidades e testar seleção com homônimos. |
| R-04 | Data, unidade ou frescor interpretados incorretamente. | Alto: informação enganosa para o planejamento. | Fechar fuso, referência temporal e arredondamento; testar viradas de data e troca de unidade. |
| R-05 | Campos exibidos não atendem às necessidades das personas. | Alto: retrabalho de conteúdo e fluxos. | Validar persona prioritária e conjunto de dados antes de aprovar a especificação. |
| R-06 | Barreiras em telas pequenas ou tecnologias assistivas. | Alto: exclusão de usuários. | Validar fluxo mobile e acessibilidade com tarefas completas. |
| R-07 | Ampliação implícita de escopo por cache, favoritos ou alertas. | Médio: aumento de prazo e complexidade. | Aprovar limites do MVP e tratar acréscimos como mudança de escopo. |
| R-08 | Retenção ou compartilhamento de dados além da expectativa da pessoa. | Médio: risco de privacidade. | Não presumir geolocalização ou persistência local; esclarecer tratamento pelo produto, hospedagem e provedor. |

## Out of Scope

### Exclusões confirmadas

- Autenticação, contas de usuário e funcionalidades dependentes de login.
- Persistência de consultas ou preferências no servidor da aplicação.
- Interfaces em outros idiomas nesta versão, cuja UI definida é pt-BR.

### Fora do escopo proposto, sujeito à confirmação em OQ-12

- Alertas meteorológicos, notificações e recomendações personalizadas.
- Favoritos, histórico de consultas e comparação simultânea entre cidades.
- Geolocalização automática ou solicitação de permissão de localização.
- Modo offline com previsões armazenadas, sincronização de preferências e persistência local entre sessões.
- Aplicativos nativos e previsões além da janela de cinco dias.

Essas exclusões propostas não são decisões já tomadas no discovery. Previsão horária, atualização manual e campos meteorológicos adicionais permanecem questões em aberto, sem compromisso de entrega.

## Open Questions

As perguntas abaixo agrupam as lacunas remanescentes do discovery. Os responsáveis são papéis sugeridos, não atribuições já aprovadas.

| ID | Decisão necessária | Responsável sugerido | Momento e impacto |
| --- | --- | --- | --- |
| OQ-01 | Qual persona é prioritária e quais taxas e tempos representam sucesso nas tarefas? | Produto / UX | Antes de aprovar a spec; orienta prioridade e validação de valor. |
| OQ-02 | Qual cobertura geográfica é necessária e quais informações distinguem as localidades quando a fonte não fornece região ou país? | Produto / responsável pela integração | Antes de aprovar a spec; afeta busca e cobertura prometida. |
| OQ-03 | A busca exige envio ou usa sugestões? Quais validações, mínimo de caracteres, limite de resultados e regras para erros de digitação? Qual estado inicial e uma nova consulta substitui a anterior? | Produto / UX | Antes de aprovar a spec; afeta RF-01, jornada e testes. |
| OQ-04 | Quais campos são obrigatórios no clima atual e na previsão? Há mínimas/máximas, previsão diária, horária ou ambas? | Produto | Antes de aprovar a spec; completa o contrato de RF-02 e RF-03. |
| OQ-05 | Qual fuso define hoje e as datas exibidas? Qual horário de referência será mostrado, qual tolerância de desatualização e como sinalizá-la? | Produto / responsável pela integração | Antes de aprovar a spec; fecha RF-02, RF-03 e RF-07. |
| OQ-06 | Qual o tempo máximo de espera? Como tratar dados parciais, respostas inválidas, dados anteriores, falta de rede e falhas independentes do clima atual e da previsão? | Produto / responsável técnico | Antes de aprovar a spec; fecha RF-05, RF-06 e os estados da jornada. |
| OQ-07 | Quantas casas decimais usar e como arredondar? A unidade permanece entre buscas ou sessões? Há armazenamento local e por quanto tempo? | Produto / UX | Antes de aprovar a spec; fecha RF-04 e regras de retenção. |
| OQ-08 | Quando atualizar os dados e a janela de cinco dias? Haverá atualização manual ou automática? | Produto / responsável técnico | Antes de aprovar a spec; define frescor, fluxo e consumo da fonte. |
| OQ-09 | Quais navegadores, sistemas, viewports e tecnologias assistivas serão suportados? WCAG 2.2 AA será compromisso de entrega? | Produto / QA / UX | Antes de aprovar a spec; fecha RNF-01 e RNF-02. |
| OQ-10 | As metas de 3 segundos em 95% das consultas e 99,5% de disponibilidade são adequadas? Quais condições, fronteiras de medição e responsáveis? | Produto / QA / operação | Antes de aprovar a spec; fecha RNF-03 e RNF-04 sem confundir tempo interno com experiência completa. |
| OQ-11 | Os serviços de busca e previsão da Open-Meteo atendem à cobertura e ao uso pretendidos? Quais limites, termos, atribuição e tratamento de dados se aplicam? | Responsável pela integração / produto | Validar antes do plano técnico; incompatibilidade exige revisar a spec. O plano também deve verificar viabilidade do acesso pelo ambiente escolhido. |
| OQ-12 | As exclusões propostas do MVP estão aprovadas, incluindo geolocalização, favoritos, comparação, alertas, offline e persistência local? | Produto | Antes de aprovar a spec; impede expansão implícita do escopo. |

### Condição de aprovação

- Resolver as questões que alteram o comportamento de produto, incorporando as respostas aos requisitos e critérios correspondentes.
- Validar a viabilidade da fonte para os campos e a cobertura escolhidos, sem presumir garantias de serviço ou termos não verificados.
- Aprovar os RNFs e seus métodos de medição ou registrar explicitamente o que fica fora do compromisso desta versão.
- Revisar a rastreabilidade: cada requisito funcional deve continuar com pelo menos um critério de aceite verificável e cada história deve ter cobertura.
- Não iniciar implementação antes de produzir e aprovar os artefatos correspondentes de plano e tarefas no fluxo SDD.