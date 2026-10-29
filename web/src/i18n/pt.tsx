/* Português (Brasil). */
import type { Messages } from "./en.tsx";
import { Example, Formula, H, type FormatWords, type HowValues, type N } from "./parts.tsx";

const fmt: FormatWords = {
  now: "agora",
  immediately: "imediatamente",
  days: (n) => `${n}d`,
  hours: (n) => `${n}h`,
  minutes: (n) => `${n}min`,
  seconds: (n) => `${n}s`,
  years: (n) => `${n} ${n === 1 ? "ano" : "anos"}`,
  months: (n) => `${n} ${n === 1 ? "mês" : "meses"}`,
  and: " e ",
  future: (d) => `em ${d}`,
  past: (d) => `há ${d}`,
};

export const pt: Messages = {
  fmt,

  header: {
    appName: "Flux Node Calculator",
    language: "Idioma",
    theme: "Tema",
    themes: { system: "Sistema", light: "Claro", dark: "Escuro" },
    currency: "Moeda",
    title: "Quanto seus FluxNodes vão render?",
    intro:
      "As recompensas são definidas pela blockchain: cada bloco paga um node de cada nível, e a recompensa por bloco cai 10% mais ou menos uma vez por ano. As estimativas usam dados da rede em tempo real.",
    blockHeight: "Altura do bloco",
    fluxPrice: "Preço do FLUX",
    nextCut: "Próximo corte de 10%",
    atBlock: "No bloco",
    stale: (when: string) => `Mostrando dados de ${when}; a última atualização não respondeu.`,
    caption: "Total de FLUX por bloco, por período de redução. O marcador é hoje.",
    staircaseAria: (values: string, current: string) =>
      `Cronograma de recompensa por bloco: ${values} FLUX por bloco em períodos de redução consecutivos. Você está no período que paga ${current} FLUX.`,
  },

  app: {
    tabs: { earnings: "Ganhos e ROI", projections: "Projeções", next: "Próximo node", lookup: "Consultar nodes" },
    tablist: "Seções da calculadora",
    loading: "Carregando",
    networkError: "Não foi possível acessar a rede Flux agora. Tentando novamente.",
    priceError: "O preço do FLUX não está disponível agora, então os valores em moeda estão ocultos. Tentando de novo a cada poucos minutos.",
    priceNeeded: "Isto precisa do preço do FLUX, que não está disponível agora. Aparece assim que o preço carregar.",
    runsOnFlux: "Roda na Flux",
    builtBy: (who: N) => <>Feito por {who}</>,
    source: "Código no GitHub",
    issue: "Relatar um problema ou sugerir um recurso",
    translation: "Sugerir uma tradução melhor",
    disclaimer:
      "Ferramenta independente da comunidade, sem vínculo com a Flux. Apenas estimativas, não é aconselhamento financeiro. As Progressive Node Rewards (participação na receita do FluxCloud) não estão incluídas porque nenhuma fórmula foi publicada. As recompensas supõem que seus nodes continuem confirmados.",
    credits: (source: N) => (
      <>
        Dados de preço: {source}. Dados da rede pela API da Flux. Código aberto sob a licença MIT.
      </>
    ),
  },

  contribute: {
    title: "Ajude a manter esta calculadora no ar",
    body: "Contribuições em FLUX ajudam a cobrir o desenvolvimento e a hospedagem. Obrigado pelo apoio.",
    copy: "Copiar endereço",
    copied: "Copiado",
    copiedSr: "Endereço copiado para a área de transferência",
  },

  network: {
    title: "Níveis hoje",
    live: "Ao vivo da rede Flux.",
    tier: "Nível",
    collateral: "Colateral",
    enabled: "Nodes ativos",
    perBlock: "FLUX por bloco",
    perDay: "Por node por dia",
    withPa: "Com ativos paralelos",
    paidEvery: "Pago a cada",
    rate: "Taxa anual de recompensa",
    native: (pct: string) => `${pct} nativo`,
    footnote: (paCount: number | null) =>
      "A taxa anual de recompensa é o FLUX ganho nos próximos 12 meses como fração do colateral, incluindo a próxima redução" +
      (paCount === null
        ? "."
        : `, com ativos paralelos até a data de término (${paCount} × 10% de cada pagamento, pagos em outras blockchains, precisam ser resgatados). O número menor é só o FLUX nativo.`),
  },

  pa: {
    note: (count: number, share: string, end: string) => (
      <>
        Inclui recompensas de ativos paralelos: FLUX pago em {count} outras blockchains, cada uma somando {share} de cada
        pagamento, até {end}. <strong className="font-medium text-ink">Elas não são pagas automaticamente.</strong> Você
        resgata cada uma no Zelcore (Apps → Fusion → Parallel Mining Claim), e cada resgate tem uma taxa de rede.
      </>
    ),
    warning: (
      <>
        <strong className="font-medium text-loss">A data de término provavelmente será antes.</strong> A Flux projeta
        que os ativos paralelos acabem por volta de 2028, mas nenhuma data fixa foi publicada. Considere otimistas os
        ganhos depois dos próximos um ou dois anos.
      </>
    ),
    include: "Incluir recompensas de ativos paralelos",
    includeHint: "FLUX extra pago em outras blockchains enquanto durarem. Precisa ser resgatado.",
    active: "Ativos em vigor",
    value: "Valor vs. FLUX nativo",
    endDate: "Data de término prevista",
    defaults: (date: string) => `Padrão: ${date}, pela projeção da Flux.`,
    earlier: "Provavelmente será antes.",
    reset: "Redefinir",
  },

  earnings: {
    intro:
      "Informe quantos nodes você tem e quanto cada um custa por mês. Os custos preenchidos são exemplos.",
    nodes: "Nodes",
    costPerNode: "Custo por node / mês",
    setupCost: "Custo inicial único",
    setupHint: "Hardware ou qualquer outra coisa que você paga uma vez.",
    collateralPrice: "Preço pago por FLUX do colateral",
    usingToday: "Usando o preço de hoje.",
    noPriceYet: "O preço de hoje ainda não está disponível. Informe o preço que você pagou ou aguarde o carregamento.",
    useToday: "Usar o preço de hoje",
    countCollateral: "Contar a compra do colateral no ponto de equilíbrio",
    countCollateralHint: "O colateral continua sendo seu e pode ser liberado, mas comprá-lo é dinheiro gasto.",
    compare: "Comparar com uma segunda configuração",
    setupA: "Configuração A",
    setupB: "Configuração B",
    addNode: "Adicione pelo menos um node para ver os ganhos.",
    nativePerMonth: "FLUX nativo por mês",
    fluxPerDay: "FLUX por dia",
    paPerMonth: "Ativos paralelos por mês",
    fluxPerMonth: "FLUX por mês",
    toClaim: "A resgatar",
    allFlux12: "Todo o FLUX, próximos 12 meses",
    flux12: "FLUX nos próximos 12 meses",
    revenue: "Receita por mês",
    costs: "Custos por mês",
    net: "Líquido por mês",
    collateralLocked: "Colateral bloqueado",
    rate: "Taxa anual de recompensa",
    ratePa: "Taxa anual de recompensa, com ativos paralelos",
    net12: "Líquido nos próximos 12 meses",
    breakEvenTitle: "Ponto de equilíbrio com o preço e o tamanho da rede de hoje",
    profitableNow: "Lucrativo desde o primeiro mês",
    notProfitable: "Não é lucrativo com esses custos",
    after: (d: string) => `Após ${d}`,
    notWithin20: "Não em 20 anos",
    recovering: (amount: string, withCollateral: boolean, pa: boolean) =>
      `Recuperando ${amount}${withCollateral ? " incluindo o colateral" : " em custos iniciais"}. As recompensas caem 10% a cada redução anual${pa ? " e os ativos paralelos param na data de término" : ""}, então os meses seguintes rendem menos.`,
  },

  projections: {
    needNodes: "Adicione pelo menos um node na aba Ganhos e ROI para ver uma projeção.",
    intro: "Usa os nodes e custos da aba Ganhos e ROI. Cada ano acumula as mudanças abaixo.",
    years: "Anos",
    growth: "Variação do tamanho da rede por ano",
    growthHint: "Mais nodes em um nível significa que cada um é pago com menos frequência.",
    priceChange: "Variação do preço do FLUX por ano",
    low: "Baixa",
    middle: "Média",
    high: "Alta",
    startFrom: (price: string) => `A partir de ${price}. Estas são suas premissas, não previsões.`,
    chartTitle: "Lucro acumulado",
    chartIntro: (years: number, cuts: number, pa: boolean) =>
      `Receita menos custos operacionais em ${years} ${years === 1 ? "ano" : "anos"}, incluindo ${cuts} ${cuts === 1 ? "redução" : "reduções"} de recompensa${pa ? ", com ativos paralelos até a data de término" : ""}.`,
    chartAria: "Lucro acumulado por mês em três cenários de preço",
    series: (label: string, pct: number) => `${label} (${pct}%/ano)`,
    month: (n: number) => `Mês ${n}`,
    year: (n: number) => `Ano ${n}`,
    toRecover: (amount: string) => `A recuperar: ${amount}`,
    breakEven: (label: string) => `${label}: ponto de equilíbrio`,
    notWithin: (years: number) => `não em ${years} ${years === 1 ? "ano" : "anos"}`,
    immediately: "imediatamente",
    after: (d: string) => `após ${d}`,
    tableTitle: "Ano a ano, preço médio",
    colYear: "Ano",
    colNative: "FLUX nativo",
    colEarned: "FLUX ganho",
    colPa: "Ativos paralelos",
    colTotal: "FLUX total",
    colPrice: "Preço no fim do ano",
    colNet: "Líquido no ano",
    colTotalNet: "Líquido total",
  },

  next: {
    intro:
      "Quanto tempo até suas recompensas pagarem o colateral de mais um node. Usa seus nodes e custos de Ganhos e ROI, e a variação do tamanho da rede e do preço médio de Projeções.",
    saved: "FLUX que você já guardou",
    savedHint: "FLUX disponível que ainda não está bloqueado como colateral.",
    sell: "Vender recompensas para pagar os custos",
    sellHint: "Desative se você paga a hospedagem com outra renda, assim todas as recompensas são guardadas.",
    keepBuying: "Continuar comprando",
    planLength: "Duração do plano",
    yearsUnit: "anos",
    needInput: "Adicione seus nodes na aba Ganhos e ROI, ou informe o FLUX que você já guardou.",
    priceNeeded: "Ou desative “Vender recompensas para pagar os custos” para planejar sem ele.",
    saving: (flux: N, sell: boolean) => (
      <>
        Hoje você guardaria cerca de {flux} por mês{sell ? " depois de vender o suficiente para pagar os custos" : ""}.
      </>
    ),
    nothingSaved:
      "Os custos consomem todas as suas recompensas, então nada é guardado. Reduza os custos ou desative a venda de recompensas para pagá-los.",
    yourNext: "Seu próximo node",
    nextTier: (tier: string) => `Próximo ${tier}`,
    notWithin20: "Não em 20 anos",
    collateral: (amount: string) => `${amount} FLUX de colateral`,
    now: "Agora",
    nowInline: "agora",
    inDays: (n: number, inline: boolean) => `${inline ? "em" : "Em"} ${n} ${n === 1 ? "dia" : "dias"}`,
    inDuration: (d: string, inline: boolean) => `${inline ? "em" : "Em"} ${d}`,
    planTitle: (tier: string) => `Se você continuar comprando nodes ${tier}`,
    notEnough: (tier: string, years: number) =>
      `Não dá para guardar o suficiente para um ${tier} em ${years} ${years === 1 ? "ano" : "anos"}.`,
    summary: (years: number, count: number, countN: N, tier: string, daily: N, first: string) => (
      <>
        Em {years} {years === 1 ? "ano" : "anos"} você adicionaria {countN} {count === 1 ? "node" : "nodes"} {tier},
        ganhando cerca de {daily} por dia no final. O primeiro vem {first}.
      </>
    ),
    colYear: "Ano",
    colAdded: "Nodes adicionados",
    colNodes: "Seus nodes no fim do ano",
    colPerDay: "FLUX por dia",
    yearEnd: (date: string) => `até ${date}`,
    footnote:
      "Cada novo node rende a partir do mês seguinte à compra e soma seu custo operacional. Reduções de recompensa, tamanho da rede e variação de preço são aplicados mês a mês. Hardware e configuração dos novos nodes não estão incluídos.",
    paCounted:
      "Os ativos paralelos contam para a economia enquanto durarem. Isso supõe que você os resgate e converta em FLUX nativo para o colateral.",
  },

  lookup: {
    address: "Endereço de pagamento",
    lookingUp: "Consultando…",
    lookUp: "Consultar nodes",
    hint: "O endereço que recebe as recompensas dos seus nodes. A consulta só lê dados públicos da blockchain.",
    invalid: "Informe um endereço de pagamento Flux completo: 35 caracteres começando com t1 ou t3.",
    tooMany: "Muitas consultas em pouco tempo. Aguarde um minuto e tente de novo.",
    failed: "A API da rede Flux não respondeu. Tente de novo em um minuto.",
    noNodes:
      "Nenhum node paga para este endereço. Confira se é o endereço de pagamento, e não o endereço do colateral.",
    summary: (confirmed: N, dos: N | null, starting: N | null) => (
      <>
        {confirmed} confirmados
        {dos !== null && <>, {dos} na lista DOS</>}
        {starting !== null && <>, {starting} iniciando</>}
      </>
    ),
    dosExplain:
      "Nodes na lista DOS não recebem até serem iniciados de novo. Isso costuma ser causado por informações de colateral incorretas ou pelo daemon fora de sincronia.",
    dosUnknown: "Não foi possível verificar a lista DOS agora, então só os nodes confirmados aparecem.",
    nativePerDay: "FLUX nativo por dia",
    expectedPerDay: "Esperado por dia",
    paPerDay: "Ativos paralelos por dia",
    claimUntil: "Resgate no Zelcore, até acabarem",
    totalPerDay: "Total por dia",
    valuePerDay: "Valor por dia",
    rate: "Taxa anual de recompensa",
    native: (pct: string) => `${pct} nativo`,
    useNodes: "Usar estes nodes na calculadora",
    lastDays: (n: number) => `Últimos ${n} dias, só FLUX nativo`,
    received: (flux: N, payouts: N, expected: N) => (
      <>
        {flux} recebidos em {payouts} pagamentos, contra {expected} esperados
      </>
    ),
    historyNote:
      "Os ativos paralelos são pagos em outras blockchains, então não dá para conferi-los aqui. O esperado usa a quantidade de nodes de hoje e conta cada node desde que foi confirmado. Um valor abaixo do esperado geralmente significa que um node perdeu confirmações ou ficou offline.",
    historyMissing: "O histórico de pagamentos não está disponível agora. Os detalhes dos nodes abaixo estão atualizados.",
    onlyAttention: "Mostrar só os nodes que precisam de atenção",
    colTier: "Nível",
    colStatus: "Status",
    colCollateral: "Colateral",
    colQueue: "Posição na fila",
    colNext: "Próximo pagamento",
    colLast: "Último pagamento",
    colPerDay: "Esperado por dia",
    onDos: "Na lista DOS",
    startNow: "Pode ser iniciado agora",
    startIn: (when: string) => `Pode ser iniciado ${when}`,
    notPaid: "Sem pagamento",
    confirmed: "Confirmado",
    queuePos: (pos: string, of: string) => `${pos} de ${of}`,
    startingOne: (tier: string, when: string) =>
      `1 node ${tier} neste endereço está iniciando e precisa ser confirmado ${when}.`,
    startingMany: (n: number, parts: string, when: string) =>
      `${n} nodes neste endereço estão iniciando (${parts}). O primeiro precisa ser confirmado ${when}.`,
    updated: (when: string) => `Atualizado ${when}. Os endereços IP dos nodes nunca são mostrados.`,
  },

  how: {
    button: "Como os cálculos funcionam",
    close: "Fechar",
    body: (v: HowValues) => (
      <>
        <H>De onde vêm os números</H>
        <p>
          A altura do bloco, os nodes ativos por nível e as listas DOS e de início vêm da API da rede Flux, atualizada a
          cada 90 segundos mais ou menos. O preço do FLUX em dólares vem do explorer da Flux e é convertido para outras moedas com as taxas de câmbio diárias do Banco Central Europeu (via Frankfurter), com a CoinGecko como reserva. É atualizado a cada 20 minutos. Todo o resto é
          calculado a partir disso.
        </p>

        <H>Blocos e pagamentos</H>
        <p>
          Um bloco é gerado a cada 30 segundos, ou seja, {v.blocksPerDay} por dia. Cada bloco paga um node de cada nível,
          em revezamento numa fila. A parte de um node depende só de quantos nodes ativos existem no nível dele.
        </p>
        <Formula>FLUX por node por dia = recompensa do nível por bloco × {v.blocksPerDay} ÷ nodes ativos no nível</Formula>
        {v.live && (
          <Example>
            Hoje no Stratus: {v.stratusReward} × {v.blocksPerDay} ÷ {v.stratusNodes} = {v.stratusDaily} FLUX por dia,
            pago a cada {v.stratusEvery} mais ou menos ({v.stratusNodes} nodes × 30 segundos).
          </Example>
        )}

        <H>O cronograma de recompensas</H>
        <p>
          A recompensa total era de 14 FLUX por bloco a partir do bloco {v.startHeight}. Ela cai 10% a cada {v.interval}{" "}
          blocos (365 dias). É dividida entre os níveis em partes fixas: Cumulus 1/14, Nimbus 3,5/14, Stratus 9/14 e 0,5/14
          para a Flux Foundation. Esses valores batem com os números da própria blockchain em todas as alturas que
          verificamos.
        </p>
        {v.live && (
          <Example>
            Agora: {v.totalReward} FLUX por bloco. Próximo corte de 10% no bloco {v.nextCut}.
          </Example>
        )}

        <H>Meses e anos</H>
        <p>
          Um mês é o mês médio do calendário, 30,44 dias ({v.blocksPerMonth} blocos), então 12 meses formam exatamente um
          ano de 365,25 dias ({v.blocksPerYear} blocos). Quando um período cruza um corte de recompensa, os blocos antes do
          corte pagam a recompensa antiga e os blocos depois pagam a nova.
        </p>

        <H>Taxa anual de recompensa</H>
        <Formula>Taxa anual de recompensa = FLUX ganho nos próximos 12 meses ÷ colateral</Formula>
        <p>
          Inclui qualquer corte de recompensa nesses 12 meses e não tem juros compostos. O colateral é de {v.cumulus} FLUX
          no Cumulus, {v.nimbus} no Nimbus e {v.stratus} no Stratus.
        </p>
        {v.live && <Example>Hoje no Stratus, só FLUX nativo: {v.stratusApr}.</Example>}

        <H>Ativos paralelos</H>
        <p>
          Cada ativo paralelo em vigor paga {v.paShare} a mais de cada pagamento, em FLUX em outra blockchain. Com{" "}
          {v.paCount} em vigor, são {v.paTotal} além das recompensas nativas. Eles contam até a data de término que você
          definir (padrão {v.paEnd}, que provavelmente será antes) e pelo valor que você definir em relação ao FLUX nativo.
          Não são pagos automaticamente: cada um é resgatado no Zelcore, e cada resgate tem uma taxa de rede, que não está
          incluída.
        </p>

        <H>Ganhos, custos e ponto de equilíbrio</H>
        <Formula>Líquido por mês = (FLUX nativo + ativos paralelos) × preço − custos operacionais</Formula>
        <Formula>
          Ponto de equilíbrio = primeiro mês em que o lucro líquido total ≥ custo inicial (+ colateral, se contado)
        </Formula>
        <p>
          O colateral é avaliado pelo preço que você pagou ou pelo preço de hoje. O ponto de equilíbrio usa o preço e o
          tamanho da rede de hoje, e as recompensas continuam caindo a cada corte anual.
        </p>

        <H>Projeções</H>
        <p>
          Calculadas mês a mês. A variação do tamanho da rede e do preço se acumula mensalmente a partir das taxas anuais
          que você escolher, medidas no meio de cada mês. Uma rede maior significa que cada node é pago com menos
          frequência. Os preços baixo, médio e alto são suas premissas, não previsões.
        </p>

        <H>Próximo node</H>
        <Formula>Guardado por mês = recompensas (+ ativos paralelos) − FLUX vendido para pagar os custos</Formula>
        <p>
          Quando a economia atinge o colateral de um nível, um node é comprado. Se você continuar reinvestindo, o novo node
          rende a partir do mês seguinte e soma seu custo operacional. Hardware e configuração dos novos nodes não estão
          incluídos.
        </p>

        <H>Consulta de nodes</H>
        <p>
          Os nodes são encontrados pelo endereço de pagamento exato. O próximo pagamento é a posição do node na fila do
          nível × 30 segundos. "Recebido" são os pagamentos de FLUX nativo dos últimos 30 dias vindos de recompensas de
          bloco, associados a um nível pelo valor. "Esperado" é quanto os nodes atuais do endereço deveriam ter ganhado no
          mesmo período com o tamanho da rede de hoje, então fica alto ou baixo se nodes foram adicionados ou removidos no
          mês. Os nodes na lista DOS e iniciando vêm das listas da própria Flux.
        </p>

        <H>O que não está incluído</H>
        <ul className="list-disc space-y-1 pl-5">
          <li>Progressive Node Rewards (participação na receita do FluxCloud). Nenhuma fórmula foi publicada.</li>
          <li>Taxas de resgate dos ativos paralelos e impostos.</li>
          <li>Tempo fora do ar. As recompensas supõem que seus nodes continuem confirmados.</li>
        </ul>
        <p className="pt-2 text-sm text-muted">
          O código completo está no GitHub, incluindo testes que conferem o cronograma de recompensas com a blockchain ao
          vivo.
        </p>
      </>
    ),
  },
};
