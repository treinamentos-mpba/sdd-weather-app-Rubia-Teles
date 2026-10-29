# Discovery — Weather App

## Contexto

A empresa solicitou uma aplicação de previsão do tempo. O briefing define que usuários devem buscar cidades, consultar o clima atual e uma previsão de cinco dias, alternar entre Celsius e Fahrenheit e usar a aplicação em dispositivos móveis.

O objetivo desta etapa é organizar o que já se sabe, apontar riscos e tornar visíveis as decisões ainda necessárias antes de escrever a especificação e planejar a implementação.

## Requisitos Funcionais

- **RF-01 — Buscar cidades:** permitir que o usuário pesquise uma cidade.
- **RF-02 — Consultar clima atual:** exibir as condições meteorológicas atuais da cidade selecionada.
- **RF-03 — Consultar previsão:** exibir a previsão para cinco dias da cidade selecionada.
- **RF-04 — Alternar unidades:** permitir alternar entre Celsius e Fahrenheit e apresentar as temperaturas na unidade escolhida.
- **RF-05 — Feedback de carregamento:** indicar quando uma busca ou consulta meteorológica está em andamento.
- **RF-06 — Feedback de falha e ausência de resultados:** informar quando a busca não encontra cidades ou quando não é possível obter os dados; permitir nova tentativa após falhas recuperáveis.
- **RF-07 — Identificar dados exibidos:** mostrar a cidade consultada e a unidade junto aos valores de temperatura.

## Requisitos Não-Funcionais

Os requisitos abaixo são propostas iniciais para tornar as qualidades verificáveis. As metas numéricas e os critérios de conformidade precisam ser validados com stakeholders antes de virarem critérios finais de aceite.

- **RNF-01 — Responsividade:** as principais tarefas devem funcionar em larguras de viewport a partir de 320 CSS px até desktop, sem rolagem horizontal da página nem perda de conteúdo ou controles.
- **RNF-02 — Acessibilidade:** buscar cidade, selecionar unidade e consultar resultados devem ser operáveis por teclado; a interface deve buscar conformidade WCAG 2.2 nível AA, incluindo nomes acessíveis, foco visível e contraste adequado. O nível de conformidade proposto requer validação.
- **RNF-03 — Desempenho:** em condições de teste acordadas, 95% das consultas devem apresentar os dados em até 3 segundos, excluindo indisponibilidade ou latência externa da API. Definir ambiente e conexão de referência antes de usar como critério de aceite.
- **RNF-04 — Disponibilidade:** propor disponibilidade mensal mínima de 99,5% para a aplicação hospedada. Indisponibilidade da API externa deve ser medida separadamente; nesses casos, a aplicação deve continuar utilizável e apresentar o feedback definido em RF-06.
- **RNF-05 — Resiliência:** falhas de rede ou da fonte de dados não devem deixar a interface bloqueada; a aplicação deve preservar a possibilidade de nova tentativa quando a conexão se recuperar.
- **RNF-06 — Idioma e formatos:** interface em pt-BR deve usar convenções consistentes de idioma, datas e números, respeitando o fuso horário definido para os dados meteorológicos.

## Riscos

| Tipo | Risco | Probabilidade | Impacto | Estratégia de mitigação |
| --- | --- | --- | --- | --- |
| Técnico | A API meteorológica pode ficar indisponível, lenta ou retornar erros. | Média | Alto | Tratar estados de carregamento e erro, permitir nova tentativa, monitorar falhas e definir comportamento para dados temporariamente indisponíveis. |
| Técnico | Limites de uso, mudanças de contrato ou termos da API podem interromper consultas ou exigir alterações. | Média | Alto | Confirmar quotas, licença e atribuição antes da escolha final; limitar chamadas redundantes e isolar a integração para facilitar substituição. |
| Produto e técnico | A busca pode selecionar uma cidade homônima ou uma localização diferente da pretendida. | Média | Alto | Mostrar país e região nos resultados, permitir confirmação da localidade e testar casos de nomes duplicados. |
| Produto e técnico | Os dados podem parecer atuais embora estejam desatualizados, ou datas e previsões podem usar fuso horário incorreto. | Média | Alto | Exibir horário de atualização, definir regras de fuso e frescor dos dados e validar datas, unidades e conversões com testes. |
| Produto | A previsão ou os dados exibidos podem não corresponder ao que os usuários consideram útil. | Alta | Alto | Validar personas, período, granularidade e campos meteorológicos com usuários/stakeholders antes de fechar a especificação. |
| Produto e técnico | A interface pode ser difícil de usar em telas pequenas ou com tecnologias assistivas. | Média | Alto | Projetar para mobile, definir critérios de acessibilidade e testar busca, unidade e leitura da previsão em diferentes viewports e por teclado/leitor de tela. |
| Técnico | Falhas de rede podem deixar o usuário sem dados ou sem saber se a previsão ainda é válida. | Média | Médio | Definir retry, feedback claro e, se aprovado, cache com timestamp para distinguir dados armazenados de dados atuais. |
| Produto e privacidade | Uma futura geolocalização ou retenção de consultas pode surpreender usuários ou coletar dados além do necessário. | Baixa | Alto | Não solicitar localização sem decisão explícita; se necessária, pedir consentimento, explicar o uso e minimizar retenção. |
| Produto | Funcionalidades não definidas, como alertas, favoritos ou notificações, podem expandir o escopo durante o desenvolvimento. | Média | Médio | Registrar explicitamente o que fica fora do MVP e direcionar novas solicitações para priorização posterior. |

## Perguntas em Aberto

O briefing é curto; as perguntas abaixo cobrem as lacunas identificáveis sem presumir respostas. A seção Decisões, ao final deste documento, registra quais pontos foram resolvidos para avançar à especificação e quais continuam em aberto.

| Pergunta em aberto | Impacto se ficar sem resposta |
| --- | --- |
| Quem são os usuários prioritários e em quais situações precisam consultar o clima? | Não será possível priorizar os fluxos, o conteúdo e os dispositivos mais importantes. |
| Quais países, regiões e localidades precisam estar disponíveis na busca? | A cobertura da fonte de dados e a experiência de localização podem não atender ao público esperado. |
| Como diferenciar cidades homônimas: quais informações de região, estado ou país mostrar? | Usuários podem escolher a localidade errada e tomar decisões com base em uma previsão incorreta. |
| Como a busca funciona: envio explícito, sugestões enquanto digita, número mínimo de caracteres e tratamento de erros de digitação? | UX, acessibilidade, volume de chamadas e critérios de teste permanecem indefinidos. |
| Após selecionar uma cidade, o usuário pode comparar ou manter várias cidades, ou a busca substitui a consulta atual? | Navegação, estado da aplicação e eventual necessidade de persistir cidades favoritas mudam de escopo. |
| Quais dados, além da temperatura, devem aparecer (por exemplo, sensação térmica, chuva, vento ou umidade)? | Não se pode definir o modelo de dados, o layout nem o que torna a previsão útil. |
| O que “clima atual” significa: qual horário de referência, origem da observação e tolerância de desatualização? | A informação pode ser apresentada como atual mesmo quando está velha ou baseada em uma estimativa diferente. |
| A previsão de cinco dias inclui hoje? Será apresentada por dia, por hora ou em ambos os formatos, e com quais valores? | O número de períodos, os rótulos, a interpretação e o volume de dados ficam indefinidos. |
| Qual fonte de dados será usada e quais são seus limites, termos de uso e exigências de atribuição? | Custos, limites de chamadas, cobertura e obrigações legais podem inviabilizar a solução ou exigir retrabalho. |
| Celsius é a unidade inicial? A escolha do usuário deve persistir entre consultas ou sessões? | A experiência pode contrariar expectativas e o estado da unidade pode mudar inesperadamente. |
| A aplicação solicita geolocalização? Se sim, quando, com qual alternativa e como explicar o uso da localização? | Permissões, privacidade, fluxo inicial e comportamento sem consentimento não podem ser especificados. |
| Como a aplicação se comporta sem rede ou com a API indisponível: há cache, dados antigos identificados ou somente nova tentativa? | O usuário pode ficar sem orientação ou confundir dados desatualizados com dados atuais. |
| Com que frequência os dados são atualizados e o usuário pode solicitar atualização manual? | Não é possível equilibrar frescor, desempenho, consumo de dados e limites do provedor. |
| Quais navegadores, sistemas operacionais e larguras de tela devem ser suportados? | A equipe não terá uma matriz objetiva de compatibilidade e validação responsiva. |
| Qual nível de acessibilidade é exigido e quais tecnologias assistivas precisam ser verificadas? | Acessibilidade fica subjetiva e barreiras importantes podem passar despercebidas até a entrega. |
| Quais são as metas de desempenho e disponibilidade e como serão medidas, considerando a dependência de uma API externa? | As metas de qualidade não serão verificáveis e responsabilidades por indisponibilidade ficarão ambíguas. |
| Quais idiomas, formatos de data e hora, unidades locais e regras de fuso horário devem ser suportados? | Datas e valores podem ser interpretados incorretamente por usuários de diferentes localidades. |
| Consultas de cidade ou preferências serão armazenadas? Por quanto tempo e onde, considerando que não há autenticação prevista? | A solução pode coletar ou reter dados sem necessidade e as expectativas de privacidade ficam obscuras. |
| Alertas meteorológicos, notificações ou recomendações fazem parte do produto ou estão fora do escopo? | Funcionalidades adjacentes podem ser assumidas por stakeholders e causar expansão não planejada do escopo. |

## Suposições

- A aplicação será uma interface web acessível por navegador.
- O usuário escolhe explicitamente uma cidade para consultar seus dados; geolocalização automática não foi solicitada no briefing.
- A alternância entre Celsius e Fahrenheit deve afetar tanto o clima atual quanto a previsão.
- A previsão de cinco dias inclui hoje e os quatro dias seguintes, conforme a seção Decisões; o nível de detalhe temporal ainda precisa ser definido.
- As metas numéricas de desempenho e disponibilidade e o nível WCAG propostos são sugestões para discussão, não compromissos já aprovados.

## Personas

As personas abaixo são hipóteses iniciais derivadas do briefing, não resultados de pesquisa com usuários. As métricas sugeridas devem ser validadas em entrevistas ou testes de usabilidade.

| Persona | Objetivo principal | Contexto de uso | Métrica de sucesso do ponto de vista da persona |
| --- | --- | --- | --- |
| Pessoa que se desloca diariamente | Consultar rapidamente o clima atual para se preparar para o dia. | Principalmente mobile, em uma consulta breve antes de sair de casa ou durante o deslocamento. | Consegue encontrar a cidade e identificar a condição atual e a temperatura sem ajuda; medir taxa de conclusão e tempo da tarefa em teste de usabilidade. |
| Pessoa viajante que planeja uma viagem | Consultar a previsão dos próximos cinco dias para escolher quando realizar atividades. | Principalmente desktop, ao planejar com antecedência; pode repetir a consulta no mobile durante a viagem. | Consegue localizar o destino e interpretar a previsão para cada dia sem confundir datas ou cidades; medir conclusão correta da tarefa em teste. |
| Pessoa acostumada a Fahrenheit | Consultar o clima e compreender os valores na unidade que usa no dia a dia. | Mobile ou desktop; pode alternar unidades durante uma consulta. | Consegue alternar para Fahrenheit e interpretar corretamente os valores do clima atual e da previsão; medir conclusão correta após a troca de unidade. |

## Decisões

As decisões abaixo foram fechadas para destravar a especificação. As justificativas registram sua contribuição para o escopo; os pontos não cobertos continuam em aberto.

| Decisão | Breve justificativa | O que resolve das perguntas em aberto |
| --- | --- | --- |
| **Fonte de dados: Open-Meteo, sem API key.** | Simplifica a integração inicial e dispensa o gerenciamento de credenciais da API. | Define o provedor de dados. Ainda é necessário verificar cobertura, limites de uso, termos e exigências de atribuição. |
| **Previsão de cinco dias: hoje mais os quatro dias seguintes.** | Estabelece uma janela única para evitar interpretações diferentes na interface e nos testes. | Resolve se hoje faz parte dos cinco dias. Permanecem em aberto a granularidade diária ou horária, os valores exibidos e o fuso que determina o dia atual. |
| **Unidade padrão: Celsius.** | Oferece uma apresentação inicial consistente com o público da interface em pt-BR, mantendo a alternância para Fahrenheit prevista no briefing. | Define a unidade inicial. Não decide se a preferência será mantida entre consultas ou sessões. |
| **Sem autenticação e sem persistência de servidor.** | Reduz o escopo de infraestrutura e evita a necessidade de contas e armazenamento de consultas ou preferências no servidor. | Exclui autenticação e retenção de dados da aplicação no servidor. Eventual persistência local no navegador, seus dados e prazo de retenção ainda precisam ser definidos. |
| **Idioma da UI: português do Brasil (pt-BR).** | Mantém textos e rótulos consistentes para o público definido. | Define o idioma da interface e orienta as convenções de apresentação previstas em RNF-06. Regras específicas de data, hora e fuso horário continuam em aberto. |
