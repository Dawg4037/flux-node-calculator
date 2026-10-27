/* Español. */
import type { Messages } from "./en.tsx";
import { Example, Formula, H, type FormatWords, type HowValues, type N } from "./parts.tsx";

const fmt: FormatWords = {
  now: "ahora",
  immediately: "de inmediato",
  days: (n) => `${n}d`,
  hours: (n) => `${n}h`,
  minutes: (n) => `${n}min`,
  seconds: (n) => `${n}s`,
  years: (n) => `${n} ${n === 1 ? "año" : "años"}`,
  months: (n) => `${n} ${n === 1 ? "mes" : "meses"}`,
  and: " y ",
  future: (d) => `en ${d}`,
  past: (d) => `hace ${d}`,
};

export const es: Messages = {
  fmt,

  header: {
    appName: "Flux Node Calculator",
    language: "Idioma",
    theme: "Tema",
    themes: { system: "Sistema", light: "Claro", dark: "Oscuro" },
    currency: "Moneda",
    title: "¿Cuánto ganarán tus FluxNodes?",
    intro:
      "Las recompensas las fija la cadena: cada bloque paga a un nodo de cada nivel, y la recompensa por bloque baja un 10% aproximadamente una vez al año. Las estimaciones usan datos de la red en tiempo real.",
    blockHeight: "Altura de bloque",
    fluxPrice: "Precio de FLUX",
    nextCut: "Próximo recorte del 10%",
    atBlock: "En el bloque",
    stale: (when: string) => `Mostrando datos de ${when}; la última actualización no respondió.`,
    caption: "FLUX total por bloque, por periodo de reducción. El marcador es hoy.",
    staircaseAria: (values: string, current: string) =>
      `Calendario de recompensas por bloque: ${values} FLUX por bloque en periodos de reducción consecutivos. Estás en el periodo que paga ${current} FLUX.`,
  },

  app: {
    tabs: { earnings: "Ganancias y ROI", projections: "Proyecciones", next: "Próximo nodo", lookup: "Buscar nodos" },
    tablist: "Secciones de la calculadora",
    loading: "Cargando",
    networkError: "No se puede conectar con la red Flux ahora mismo. Reintentando.",
    priceError: "No se puede cargar el precio de FLUX ahora mismo. Reintentando.",
    runsOnFlux: "Funciona en Flux",
    builtBy: (who: N) => <>Creado por {who}</>,
    source: "Código en GitHub",
    issue: "Informar de un problema o sugerir una función",
    translation: "Sugerir una traducción mejor",
    disclaimer:
      "Herramienta independiente de la comunidad, sin relación con Flux. Solo son estimaciones, no asesoramiento financiero. Las Progressive Node Rewards (reparto de ingresos de FluxCloud) no están incluidas porque no se ha publicado ninguna fórmula. Las recompensas suponen que tus nodos siguen confirmados.",
    credits: (coingecko: N) => (
      <>
        Datos de precio de {coingecko}. Datos de la red de la API de Flux. Código abierto con licencia MIT.
      </>
    ),
  },

  contribute: {
    title: "Ayuda a mantener esta calculadora en marcha",
    body: "Las contribuciones en FLUX se destinan al desarrollo y al alojamiento. Gracias por tu apoyo.",
    copy: "Copiar dirección",
    copied: "Copiada",
    copiedSr: "Dirección copiada al portapapeles",
  },

  network: {
    title: "Niveles hoy",
    live: "En directo desde la red Flux.",
    tier: "Nivel",
    collateral: "Colateral",
    enabled: "Nodos activos",
    perBlock: "FLUX por bloque",
    perDay: "Por nodo al día",
    withPa: "Con activos paralelos",
    paidEvery: "Cobra cada",
    rate: "Tasa anual de recompensa",
    native: (pct: string) => `${pct} nativo`,
    footnote: (paCount: number | null) =>
      "La tasa anual de recompensa es el FLUX ganado en los próximos 12 meses como porcentaje del colateral, incluida la próxima reducción" +
      (paCount === null
        ? "."
        : `, con activos paralelos hasta su fecha de fin (${paCount} × 10% de cada pago, pagados en otras cadenas, hay que reclamarlos). La cifra pequeña es solo el FLUX nativo.`),
  },

  pa: {
    note: (count: number, share: string, end: string) => (
      <>
        Incluye las recompensas de activos paralelos: FLUX pagado en {count} cadenas más, cada una con un {share} extra de
        cada pago, hasta el {end}. <strong className="font-medium text-ink">No se pagan automáticamente.</strong> Cada
        una se reclama en Zelcore (Apps → Fusion → Parallel Mining Claim), y cada reclamación tiene una comisión de red.
      </>
    ),
    warning: (
      <>
        <strong className="font-medium text-loss">Lo más probable es que la fecha de fin llegue antes.</strong> Flux
        prevé que los activos paralelos se acaben hacia 2028, pero no se ha publicado una fecha fija. Considera optimistas
        las ganancias después del próximo año o dos.
      </>
    ),
    include: "Incluir recompensas de activos paralelos",
    includeHint: "FLUX extra pagado en otras cadenas mientras duren. Hay que reclamarlo.",
    active: "Activos vigentes",
    value: "Valor frente al FLUX nativo",
    endDate: "Fecha de fin prevista",
    defaults: (date: string) => `Por defecto, ${date}, según la previsión de Flux.`,
    earlier: "Probablemente antes.",
    reset: "Restablecer",
  },

  earnings: {
    intro: "Indica cuántos nodos tienes y cuánto te cuesta cada uno al mes. Los costes rellenados son ejemplos.",
    nodes: "Nodos",
    costPerNode: "Coste por nodo / mes",
    setupCost: "Coste inicial único",
    setupHint: "Hardware o cualquier otra cosa que pagas una sola vez.",
    collateralPrice: "Precio que pagaste por FLUX del colateral",
    usingToday: "Se usa el precio de hoy.",
    useToday: "Usar el precio de hoy",
    countCollateral: "Contar la compra del colateral en el punto de equilibrio",
    countCollateralHint: "El colateral sigue siendo tuyo y se puede liberar, pero comprarlo es dinero gastado.",
    compare: "Comparar con una segunda configuración",
    setupA: "Configuración A",
    setupB: "Configuración B",
    addNode: "Añade al menos un nodo para ver las ganancias.",
    nativePerMonth: "FLUX nativo al mes",
    fluxPerDay: "FLUX al día",
    paPerMonth: "Activos paralelos al mes",
    fluxPerMonth: "FLUX al mes",
    toClaim: "Por reclamar",
    allFlux12: "Todo el FLUX, próximos 12 meses",
    flux12: "FLUX en los próximos 12 meses",
    revenue: "Ingresos al mes",
    costs: "Costes al mes",
    net: "Neto al mes",
    collateralLocked: "Colateral bloqueado",
    rate: "Tasa anual de recompensa",
    ratePa: "Tasa anual de recompensa, con activos paralelos",
    net12: "Neto en los próximos 12 meses",
    breakEvenTitle: "Punto de equilibrio con el precio y el tamaño de red de hoy",
    profitableNow: "Rentable desde el primer mes",
    notProfitable: "No es rentable con estos costes",
    after: (d: string) => `Después de ${d}`,
    notWithin20: "No en 20 años",
    recovering: (amount: string, withCollateral: boolean, pa: boolean) =>
      `Hay que recuperar ${amount}${withCollateral ? " incluido el colateral" : " de costes iniciales"}. Las recompensas bajan un 10% en cada reducción anual${pa ? " y los activos paralelos se detienen en su fecha de fin" : ""}, así que los meses posteriores rinden menos.`,
  },

  projections: {
    needNodes: "Añade al menos un nodo en la pestaña Ganancias y ROI para ver una proyección.",
    intro: "Usa los nodos y costes de la pestaña Ganancias y ROI. Cada año acumula los cambios de abajo.",
    years: "Años",
    growth: "Cambio del tamaño de la red al año",
    growthHint: "Más nodos en un nivel significa que cada uno cobra con menos frecuencia.",
    priceChange: "Cambio del precio de FLUX al año",
    low: "Bajo",
    middle: "Medio",
    high: "Alto",
    startFrom: (price: string) => `Desde ${price}. Son tus supuestos, no previsiones.`,
    chartTitle: "Beneficio acumulado",
    chartIntro: (years: number, cuts: number, pa: boolean) =>
      `Ingresos menos costes de funcionamiento en ${years} ${years === 1 ? "año" : "años"}, con ${cuts} ${cuts === 1 ? "reducción" : "reducciones"} de recompensa${pa ? ", con activos paralelos hasta su fecha de fin" : ""}.`,
    chartAria: "Beneficio acumulado por mes en tres escenarios de precio",
    series: (label: string, pct: number) => `${label} (${pct}%/año)`,
    month: (n: number) => `Mes ${n}`,
    year: (n: number) => `Año ${n}`,
    toRecover: (amount: string) => `Por recuperar: ${amount}`,
    breakEven: (label: string) => `${label}: punto de equilibrio`,
    notWithin: (years: number) => `no en ${years} ${years === 1 ? "año" : "años"}`,
    immediately: "de inmediato",
    after: (d: string) => `después de ${d}`,
    tableTitle: "Año a año, precio medio",
    colYear: "Año",
    colNative: "FLUX nativo",
    colEarned: "FLUX ganado",
    colPa: "Activos paralelos",
    colTotal: "FLUX total",
    colPrice: "Precio a fin de año",
    colNet: "Neto del año",
    colTotalNet: "Neto total",
  },

  next: {
    intro:
      "Cuánto falta para que tus recompensas paguen el colateral de otro nodo. Usa tus nodos y costes de Ganancias y ROI, y el cambio del tamaño de la red y del precio medio de Proyecciones.",
    saved: "FLUX que ya tienes ahorrado",
    savedHint: "FLUX disponible que no está bloqueado como colateral.",
    sell: "Vender recompensas para pagar los costes",
    sellHint: "Desactívalo si pagas el alojamiento con otros ingresos, así se ahorran todas las recompensas.",
    keepBuying: "Seguir comprando",
    planLength: "Duración del plan",
    yearsUnit: "años",
    needInput: "Añade tus nodos en la pestaña Ganancias y ROI, o indica el FLUX que ya tienes ahorrado.",
    saving: (flux: N, sell: boolean) => (
      <>
        Ahora mismo ahorrarías unos {flux} al mes{sell ? " después de vender lo necesario para pagar los costes" : ""}.
      </>
    ),
    nothingSaved:
      "Los costes se llevan todas tus recompensas, así que no se ahorra nada. Baja los costes o desactiva la venta de recompensas para pagarlos.",
    yourNext: "Tu próximo nodo",
    nextTier: (tier: string) => `Próximo ${tier}`,
    notWithin20: "No en 20 años",
    collateral: (amount: string) => `${amount} FLUX de colateral`,
    now: "Ahora",
    nowInline: "ahora",
    inDays: (n: number, inline: boolean) => `${inline ? "en" : "En"} ${n} ${n === 1 ? "día" : "días"}`,
    inDuration: (d: string, inline: boolean) => `${inline ? "en" : "En"} ${d}`,
    planTitle: (tier: string) => `Si sigues comprando nodos ${tier}`,
    notEnough: (tier: string, years: number) =>
      `No se ahorra lo suficiente para un ${tier} en ${years} ${years === 1 ? "año" : "años"}.`,
    summary: (years: number, count: number, countN: N, tier: string, daily: N, first: string) => (
      <>
        En {years} {years === 1 ? "año" : "años"} añadirías {countN} {count === 1 ? "nodo" : "nodos"} {tier}, ganando
        unos {daily} al día al final. El primero llega {first}.
      </>
    ),
    colYear: "Año",
    colAdded: "Nodos añadidos",
    colNodes: "Tus nodos a fin de año",
    colPerDay: "FLUX al día",
    yearEnd: (date: string) => `hasta ${date}`,
    footnote:
      "Cada nodo nuevo gana desde el mes siguiente a su compra y suma su coste de funcionamiento. Las reducciones de recompensa, el tamaño de la red y el cambio de precio se aplican mes a mes. No se incluyen el hardware ni la instalación de los nodos nuevos.",
    paCounted:
      "Los activos paralelos cuentan para el ahorro mientras duren. Eso supone que los reclamas y los conviertes en FLUX nativo para el colateral.",
  },

  lookup: {
    address: "Dirección de pago",
    lookingUp: "Buscando…",
    lookUp: "Buscar nodos",
    hint: "La dirección a la que se pagan las recompensas de tus nodos. La búsqueda solo lee datos públicos de la cadena.",
    invalid: "Introduce una dirección de pago de Flux completa: 35 caracteres que empiezan por t1 o t3.",
    tooMany: "Demasiadas búsquedas en poco tiempo. Espera un minuto y vuelve a intentarlo.",
    failed: "La API de la red Flux no respondió. Vuelve a intentarlo en un minuto.",
    noNodes:
      "Ningún nodo paga a esta dirección. Comprueba que sea la dirección de pago y no la del colateral.",
    summary: (confirmed: N, dos: N | null, starting: N | null) => (
      <>
        {confirmed} confirmados
        {dos !== null && <>, {dos} en la lista DOS</>}
        {starting !== null && <>, {starting} iniciándose</>}
      </>
    ),
    dosExplain:
      "Los nodos de la lista DOS no cobran hasta que se vuelven a iniciar. Suele deberse a datos de colateral incorrectos o a que el daemon no está sincronizado.",
    dosUnknown: "No se pudo comprobar la lista DOS ahora mismo, así que solo se muestran los nodos confirmados.",
    nativePerDay: "FLUX nativo al día",
    expectedPerDay: "Previsto al día",
    paPerDay: "Activos paralelos al día",
    claimUntil: "Reclámalos en Zelcore, hasta que terminen",
    totalPerDay: "Total al día",
    valuePerDay: "Valor al día",
    rate: "Tasa anual de recompensa",
    native: (pct: string) => `${pct} nativo`,
    useNodes: "Usar estos nodos en la calculadora",
    lastDays: (n: number) => `Últimos ${n} días, solo FLUX nativo`,
    received: (flux: N, payouts: N, expected: N) => (
      <>
        {flux} recibidos en {payouts} pagos, frente a {expected} previstos
      </>
    ),
    historyNote:
      "Los activos paralelos se pagan en otras cadenas, así que no se pueden comprobar aquí. Lo previsto usa el número de nodos de hoy y cuenta cada nodo desde que se confirmó. Si falta algo, normalmente es porque un nodo perdió confirmaciones o estuvo desconectado.",
    historyMissing: "El historial de pagos no está disponible ahora mismo. Los detalles de los nodos de abajo están al día.",
    onlyAttention: "Mostrar solo los nodos que necesitan atención",
    colTier: "Nivel",
    colStatus: "Estado",
    colCollateral: "Colateral",
    colQueue: "Posición en la cola",
    colNext: "Próximo pago",
    colLast: "Último pago",
    colPerDay: "Previsto al día",
    onDos: "En la lista DOS",
    startNow: "Se puede iniciar ya",
    startIn: (when: string) => `Se puede iniciar ${when}`,
    notPaid: "Sin cobrar",
    confirmed: "Confirmado",
    queuePos: (pos: string, of: string) => `${pos} de ${of}`,
    startingOne: (tier: string, when: string) =>
      `1 nodo ${tier} de esta dirección se está iniciando y debe confirmarse ${when}.`,
    startingMany: (n: number, parts: string, when: string) =>
      `${n} nodos de esta dirección se están iniciando (${parts}). El primero debe confirmarse ${when}.`,
    updated: (when: string) => `Actualizado ${when}. Las direcciones IP de los nodos nunca se muestran.`,
  },

  how: {
    button: "Cómo se hacen los cálculos",
    close: "Cerrar",
    body: (v: HowValues) => (
      <>
        <H>De dónde salen los números</H>
        <p>
          La altura de bloque, los nodos activos por nivel y las listas DOS y de inicio vienen de la API de la red Flux, y
          se actualizan cada 90 segundos aproximadamente. El precio de FLUX viene de CoinGecko y se actualiza cada 20
          minutos. Todo lo demás se calcula a partir de esos datos.
        </p>

        <H>Bloques y pagos</H>
        <p>
          Se genera un bloque cada 30 segundos, es decir, {v.blocksPerDay} al día. Cada bloque paga a un nodo de cada
          nivel, por turnos en una cola. Lo que cobra un nodo depende solo de cuántos nodos activos hay en su nivel.
        </p>
        <Formula>FLUX por nodo al día = recompensa del nivel por bloque × {v.blocksPerDay} ÷ nodos activos del nivel</Formula>
        {v.live && (
          <Example>
            Hoy en Stratus: {v.stratusReward} × {v.blocksPerDay} ÷ {v.stratusNodes} = {v.stratusDaily} FLUX al día,
            cobrados cada {v.stratusEvery} aproximadamente ({v.stratusNodes} nodos × 30 segundos).
          </Example>
        )}

        <H>El calendario de recompensas</H>
        <p>
          La recompensa total era de 14 FLUX por bloque desde el bloque {v.startHeight}. Baja un 10% cada {v.interval}{" "}
          bloques (365 días). Se reparte entre los niveles en proporciones fijas: Cumulus 1/14, Nimbus 3,5/14, Stratus 9/14
          y 0,5/14 para la Flux Foundation. Coinciden con las cifras de la propia cadena en todas las alturas que
          comprobamos.
        </p>
        {v.live && (
          <Example>
            Ahora: {v.totalReward} FLUX por bloque. Próximo recorte del 10% en el bloque {v.nextCut}.
          </Example>
        )}

        <H>Meses y años</H>
        <p>
          Un mes es el mes medio del calendario, 30,44 días ({v.blocksPerMonth} bloques), así que 12 meses forman
          exactamente un año de 365,25 días ({v.blocksPerYear} bloques). Cuando un periodo cruza un recorte, los bloques
          anteriores pagan la recompensa antigua y los posteriores, la nueva.
        </p>

        <H>Tasa anual de recompensa</H>
        <Formula>Tasa anual de recompensa = FLUX ganado en los próximos 12 meses ÷ colateral</Formula>
        <p>
          Incluye cualquier recorte en esos 12 meses y no es compuesta. El colateral es de {v.cumulus} FLUX en Cumulus,{" "}
          {v.nimbus} en Nimbus y {v.stratus} en Stratus.
        </p>
        {v.live && <Example>Hoy en Stratus, solo FLUX nativo: {v.stratusApr}.</Example>}

        <H>Activos paralelos</H>
        <p>
          Cada activo paralelo vigente paga un {v.paShare} extra de cada pago, en FLUX en otra cadena. Con {v.paCount}{" "}
          vigentes, es un {v.paTotal} además de las recompensas nativas. Se cuentan hasta la fecha de fin que elijas (por
          defecto el {v.paEnd}, que probablemente llegará antes) y al valor que elijas respecto al FLUX nativo. No se pagan
          automáticamente: cada uno se reclama en Zelcore, y cada reclamación tiene una comisión de red que no se incluye.
        </p>

        <H>Ganancias, costes y punto de equilibrio</H>
        <Formula>Neto al mes = (FLUX nativo + activos paralelos) × precio − costes de funcionamiento</Formula>
        <Formula>
          Punto de equilibrio = primer mes en que el beneficio neto total ≥ coste inicial (+ colateral, si se cuenta)
        </Formula>
        <p>
          El colateral se valora al precio que pagaste o al de hoy. El punto de equilibrio usa el precio y el tamaño de red
          de hoy, y las recompensas siguen bajando con cada recorte anual.
        </p>

        <H>Proyecciones</H>
        <p>
          Se calculan mes a mes. El cambio del tamaño de la red y del precio se acumula mensualmente a partir de las tasas
          anuales que elijas, medidas a mitad de cada mes. Una red más grande significa que cada nodo cobra con menos
          frecuencia. Los precios bajo, medio y alto son tus supuestos, no previsiones.
        </p>

        <H>Próximo nodo</H>
        <Formula>Ahorro al mes = recompensas (+ activos paralelos) − FLUX vendido para pagar los costes</Formula>
        <p>
          Cuando el ahorro alcanza el colateral de un nivel, se compra un nodo. Si sigues reinvirtiendo, el nodo nuevo gana
          desde el mes siguiente y suma su coste de funcionamiento. No se incluyen el hardware ni la instalación de los
          nodos nuevos.
        </p>

        <H>Búsqueda de nodos</H>
        <p>
          Los nodos se buscan por la dirección de pago exacta. El próximo pago es la posición del nodo en la cola de su
          nivel × 30 segundos. "Recibido" son los pagos de FLUX nativo de los últimos 30 días procedentes de recompensas de
          bloque, asignados a un nivel por su importe. "Previsto" es lo que los nodos actuales de la dirección deberían
          haber ganado en el mismo periodo con el tamaño de red de hoy, así que sale alto o bajo si se añadieron o quitaron
          nodos durante el mes. Los nodos en la lista DOS y los que se están iniciando salen de las listas de Flux.
        </p>

        <H>Qué no se incluye</H>
        <ul className="list-disc space-y-1 pl-5">
          <li>Progressive Node Rewards (reparto de ingresos de FluxCloud). No se ha publicado ninguna fórmula.</li>
          <li>Comisiones por reclamar activos paralelos, e impuestos.</li>
          <li>Tiempo de inactividad. Las recompensas suponen que tus nodos siguen confirmados.</li>
        </ul>
        <p className="pt-2 text-sm text-muted">
          El código completo está en GitHub, incluidas las pruebas que comparan el calendario de recompensas con la cadena
          en directo.
        </p>
      </>
    ),
  },
};
