/* Deutsch. */
import type { Messages } from "./en.tsx";
import { Example, Formula, H, type FormatWords, type HowValues, type N } from "./parts.tsx";

const fmt: FormatWords = {
  now: "jetzt",
  immediately: "sofort",
  days: (n) => `${n} T.`,
  hours: (n) => `${n} Std.`,
  minutes: (n) => `${n} Min.`,
  seconds: (n) => `${n} Sek.`,
  // Dative, because these always follow "nach" or "in" ("nach 2 Jahren", "in 3 Monaten").
  years: (n) => `${n} ${n === 1 ? "Jahr" : "Jahren"}`,
  months: (n) => `${n} ${n === 1 ? "Monat" : "Monaten"}`,
  and: " und ",
  future: (d) => `in ${d}`,
  past: (d) => `vor ${d}`,
};

export const de: Messages = {
  fmt,

  header: {
    appName: "Flux Node Calculator",
    language: "Sprache",
    theme: "Design",
    themes: { system: "System", light: "Hell", dark: "Dunkel" },
    currency: "Währung",
    title: "Was verdienen deine FluxNodes?",
    intro:
      "Die Belohnungen legt die Blockchain fest: Jeder Block bezahlt einen Node pro Stufe, und die Blockbelohnung sinkt etwa einmal im Jahr um 10 %. Die Schätzungen nutzen Live-Daten aus dem Netzwerk.",
    blockHeight: "Blockhöhe",
    fluxPrice: "FLUX-Preis",
    nextCut: "Nächste Kürzung um 10 %",
    atBlock: "Bei Block",
    stale: (when: string) => `Daten vom ${when}; die letzte Aktualisierung hat nicht geantwortet.`,
    caption: "FLUX pro Block insgesamt, je Reduktionsperiode. Die Markierung ist heute.",
    staircaseAria: (values: string, current: string) =>
      `Plan der Blockbelohnung: ${values} FLUX pro Block in aufeinanderfolgenden Reduktionsperioden. Du bist in der Periode mit ${current} FLUX.`,
  },

  app: {
    tabs: { earnings: "Erträge und ROI", projections: "Prognosen", next: "Nächster Node", lookup: "Node-Abfrage", run: "Node betreiben" },
    tablist: "Bereiche des Rechners",
    loading: "Wird geladen",
    networkError: "Das Flux-Netzwerk ist gerade nicht erreichbar. Neuer Versuch läuft.",
    priceError: "Der FLUX-Preis ist gerade nicht verfügbar, daher werden Währungsbeträge ausgeblendet. Neuer Versuch alle paar Minuten.",
    priceNeeded: "Dafür wird der FLUX-Preis benötigt, der gerade nicht verfügbar ist. Er erscheint, sobald er geladen ist.",
    runsOnFlux: "Läuft auf Flux",
    builtBy: (who: N) => <>Entwickelt von {who}</>,
    source: "Quellcode auf GitHub",
    issue: "Problem melden oder Funktion vorschlagen",
    translation: "Bessere Übersetzung vorschlagen",
    disclaimer:
      "Unabhängiges Community-Tool, nicht mit Flux verbunden. Nur Schätzungen, keine Finanzberatung. Progressive Node Rewards (Umsatzbeteiligung aus FluxCloud) sind nicht enthalten, weil keine Formel veröffentlicht wurde. Die Belohnungen setzen voraus, dass deine Nodes bestätigt bleiben.",
    credits: (source: N) => (
      <>
        Preisdaten: {source}. Netzwerkdaten aus der Flux-API. Open Source unter der MIT-Lizenz.
      </>
    ),
  },

  contribute: {
    title: "Hilf mit, diesen Rechner am Laufen zu halten",
    body: "Beiträge in FLUX fließen in Entwicklung und Hosting. Danke für deine Unterstützung.",
    copy: "Adresse kopieren",
    copied: "Kopiert",
    copiedSr: "Adresse in die Zwischenablage kopiert",
  },

  network: {
    title: "Stufen heute",
    live: "Live aus dem Flux-Netzwerk.",
    tier: "Stufe",
    collateral: "Collateral",
    enabled: "Aktive Nodes",
    perBlock: "FLUX pro Block",
    perDay: "Pro Node und Tag",
    withPa: "Mit Parallel Assets",
    paidEvery: "Auszahlung etwa alle",
    rate: "Jährliche Ertragsrate",
    native: (pct: string) => `${pct} nativ`,
    footnote: (paCount: number | null) =>
      "Die jährliche Ertragsrate ist das in den nächsten 12 Monaten verdiente FLUX im Verhältnis zum Collateral, einschließlich der nächsten Reduktion" +
      (paCount === null
        ? "."
        : `, mit Parallel Assets bis zu ihrem Enddatum (${paCount} × 10 % jeder Auszahlung, auf anderen Chains ausgezahlt, müssen beansprucht werden). Die kleinere Zahl ist nur natives FLUX.`),
  },

  pa: {
    note: (count: number, share: string, end: string) => (
      <>
        Enthält Belohnungen aus Parallel Assets: FLUX auf {count} weiteren Chains, die jeweils {share} jeder Auszahlung
        hinzufügen, bis zum {end}. <strong className="font-medium text-ink">Sie werden nicht automatisch ausgezahlt.</strong>{" "}
        Du beanspruchst sie mit Fusion in der SSP Wallet (Nodes → Parallel Assets Reward) oder in Zelcore (Apps → Fusion →
        Parallel Mining Claim). Die Gebühr wird vom Claim selbst abgezogen, seltener zu beanspruchen spart also Gebühren.
      </>
    ),
    warning: (
      <>
        <strong className="font-medium text-loss">Die Mining-Belohnungen für Parallel Assets enden laut Flux-Roadmap um den 1. Juli
        2027</strong> (Block 3.787.502). Ab März 2027 werden die auslaufenden Chains zur Einbahnstraße, und im August 2027
        gehen nicht beanspruchte Guthaben an die Flux Foundation – beanspruche sie also vorher.
      </>
    ),
    include: "Belohnungen aus Parallel Assets einbeziehen",
    includeHint: "Zusätzliches FLUX auf anderen Chains, solange es sie gibt. Muss beansprucht werden.",
    active: "Aktive Assets",
    value: "Wert ggü. nativem FLUX",
    endDate: "Erwartetes Enddatum",
    defaults: (date: string) => `Standard ist der ${date}, Block 3.787.502 laut Flux-Roadmap.`,
    claimBy: "Vor August 2027 beanspruchen.",
    reset: "Zurücksetzen",
  },

  earnings: {
    intro:
      "Gib ein, wie viele Nodes du betreibst und was jeder dich pro Monat kostet. Die eingetragenen Kosten sind Beispiele.",
    nodes: "Nodes",
    costPerNode: "Kosten pro Node / Monat",
    setupCost: "Einmalige Einrichtungskosten",
    setupHint: "Hardware oder alles andere, was du einmal bezahlst.",
    collateralPrice: "Gezahlter Preis pro FLUX für das Collateral",
    usingToday: "Der heutige Preis wird verwendet.",
    noPriceYet: "Der heutige Preis ist noch nicht verfügbar. Gib den gezahlten Preis ein oder warte, bis er geladen ist.",
    useToday: "Heutigen Preis verwenden",
    countCollateral: "Collateral-Kauf in die Gewinnschwelle einrechnen",
    countCollateralHint: "Das Collateral bleibt deins und kann freigegeben werden, aber der Kauf ist ausgegebenes Geld.",
    compare: "Mit einem zweiten Setup vergleichen",
    setupA: "Setup A",
    setupB: "Setup B",
    addNode: "Füge mindestens einen Node hinzu, um die Erträge zu sehen.",
    nativePerMonth: "Natives FLUX pro Monat",
    fluxPerDay: "FLUX pro Tag",
    paPerMonth: "Parallel Assets pro Monat",
    fluxPerMonth: "FLUX pro Monat",
    toClaim: "Muss beansprucht werden",
    allFlux12: "Alles FLUX, nächste 12 Monate",
    flux12: "FLUX in den nächsten 12 Monaten",
    revenue: "Einnahmen pro Monat",
    costs: "Kosten pro Monat",
    net: "Netto pro Monat",
    collateralLocked: "Gebundenes Collateral",
    rate: "Jährliche Ertragsrate",
    ratePa: "Jährliche Ertragsrate, inkl. Parallel Assets",
    net12: "Netto in den nächsten 12 Monaten",
    breakEvenTitle: "Gewinnschwelle bei heutigem Preis und heutiger Netzwerkgröße",
    profitableNow: "Ab dem ersten Monat profitabel",
    notProfitable: "Bei diesen Kosten nicht profitabel",
    after: (d: string) => `Nach ${d}`,
    notWithin20: "Nicht innerhalb von 20 Jahren",
    recovering: (amount: string, withCollateral: boolean, pa: boolean) =>
      `Es gilt, ${amount}${withCollateral ? " einschließlich Collateral" : " an Einrichtungskosten"} wieder hereinzuholen. Die Belohnungen sinken bei jeder jährlichen Reduktion um 10 %${pa ? ", und die Parallel Assets enden zu ihrem Enddatum" : ""}, daher bringen spätere Monate weniger.`,
  },

  projections: {
    needNodes: "Füge im Tab Erträge und ROI mindestens einen Node hinzu, um eine Prognose zu sehen.",
    intro: "Nutzt die Nodes und Kosten aus dem Tab Erträge und ROI. Jedes Jahr baut auf den Änderungen unten auf.",
    years: "Jahre",
    growth: "Änderung der Netzwerkgröße pro Jahr",
    growthHint: "Mehr Nodes in einer Stufe bedeuten, dass jeder seltener ausgezahlt wird.",
    priceChange: "Änderung des FLUX-Preises pro Jahr",
    low: "Niedrig",
    middle: "Mittel",
    high: "Hoch",
    startFrom: (price: string) => `Ausgehend von ${price}. Das sind deine Annahmen, keine Vorhersagen.`,
    chartTitle: "Kumulierter Gewinn",
    chartIntro: (years: number, cuts: number, pa: boolean) =>
      `Einnahmen abzüglich laufender Kosten über ${years} ${years === 1 ? "Jahr" : "Jahre"}, einschließlich ${cuts} ${cuts === 1 ? "Belohnungsreduktion" : "Belohnungsreduktionen"}${pa ? ", mit Parallel Assets bis zu ihrem Enddatum" : ""}.`,
    chartAria: "Kumulierter Gewinn pro Monat in drei Preisszenarien",
    series: (label: string, pct: number) => `${label} (${pct} %/Jahr)`,
    month: (n: number) => `Monat ${n}`,
    year: (n: number) => `Jahr ${n}`,
    toRecover: (amount: string) => `Wieder hereinzuholen: ${amount}`,
    breakEven: (label: string) => `${label}: Gewinnschwelle`,
    notWithin: (years: number) => `nicht innerhalb von ${years} ${years === 1 ? "Jahr" : "Jahren"}`,
    immediately: "sofort",
    after: (d: string) => `nach ${d}`,
    tableTitle: "Jahr für Jahr, mittlerer Preis",
    colYear: "Jahr",
    colNative: "Natives FLUX",
    colEarned: "Verdientes FLUX",
    colPa: "Parallel Assets",
    colTotal: "FLUX gesamt",
    colPrice: "Preis zum Jahresende",
    colNet: "Netto im Jahr",
    colTotalNet: "Netto gesamt",
  },

  next: {
    intro:
      "Wie lange es dauert, bis deine Belohnungen das Collateral für einen weiteren Node bezahlen. Nutzt deine Nodes und Kosten aus Erträge und ROI sowie Netzwerkgröße und mittlere Preisänderung aus Prognosen.",
    saved: "Bereits gespartes FLUX",
    savedHint: "Freies FLUX, das noch nicht als Collateral gebunden ist.",
    sell: "Belohnungen verkaufen, um laufende Kosten zu zahlen",
    sellHint: "Schalte das aus, wenn du das Hosting aus anderem Einkommen zahlst, damit alle Belohnungen gespart werden.",
    keepBuying: "Weiter kaufen",
    planLength: "Planlänge",
    yearsUnit: "Jahre",
    needInput: "Trage deine Nodes im Tab Erträge und ROI ein oder gib bereits gespartes FLUX an.",
    priceNeeded: "Oder schalte „Belohnungen verkaufen, um laufende Kosten zu zahlen“ aus, um ohne ihn zu planen.",
    saving: (flux: N, sell: boolean) => (
      <>
        Du würdest derzeit etwa {flux} pro Monat sparen
        {sell ? ", nachdem genug verkauft wurde, um die laufenden Kosten zu zahlen" : ""}.
      </>
    ),
    nothingSaved:
      "Die laufenden Kosten verbrauchen alle Belohnungen, daher wird nichts gespart. Senke die Kosten oder schalte den Verkauf von Belohnungen ab.",
    yourNext: "Dein nächster Node",
    nextTier: (tier: string) => `Nächster ${tier}`,
    notWithin20: "Nicht innerhalb von 20 Jahren",
    collateral: (amount: string) => `${amount} FLUX Collateral`,
    now: "Jetzt",
    nowInline: "jetzt",
    inDays: (n: number, inline: boolean) => `${inline ? "in" : "In"} ${n} ${n === 1 ? "Tag" : "Tagen"}`,
    inDuration: (d: string, inline: boolean) => `${inline ? "in" : "In"} ${d}`,
    planTitle: (tier: string) => `Wenn du weiter ${tier}-Nodes kaufst`,
    notEnough: (tier: string, years: number) =>
      `Innerhalb von ${years} ${years === 1 ? "Jahr" : "Jahren"} wird nicht genug für einen ${tier} gespart.`,
    summary: (years: number, count: number, countN: N, tier: string, daily: N, first: string) => (
      <>
        In {years} {years === 1 ? "Jahr" : "Jahren"} kämen {countN} {tier}-{count === 1 ? "Node" : "Nodes"} hinzu, die am
        Ende etwa {daily} pro Tag verdienen. Der erste kommt {first}.
      </>
    ),
    colYear: "Jahr",
    colAdded: "Neue Nodes",
    colNodes: "Deine Nodes zum Jahresende",
    colPerDay: "FLUX pro Tag",
    yearEnd: (date: string) => `bis ${date}`,
    footnote:
      "Jeder neue Node verdient ab dem Monat nach dem Kauf und bringt seine laufenden Kosten mit. Belohnungsreduktionen, Netzwerkgröße und Preisänderung werden Monat für Monat angewendet. Hardware und Einrichtung neuer Nodes sind nicht enthalten.",
    paCounted:
      "Parallel Assets zählen zum Sparen, solange es sie gibt. Das setzt voraus, dass du sie beanspruchst und für das Collateral in natives FLUX umtauschst.",
  },

  lookup: {
    address: "Auszahlungsadresse",
    lookingUp: "Wird abgefragt…",
    lookUp: "Nodes abfragen",
    hint: "Die Adresse, an die deine Node-Belohnungen gehen. Die Abfrage liest nur öffentliche Blockchain-Daten.",
    invalid: "Gib eine vollständige Flux-Auszahlungsadresse ein: 35 Zeichen, beginnend mit t1 oder t3.",
    tooMany: "Zu viele Abfragen in kurzer Zeit. Warte eine Minute und versuch es noch einmal.",
    failed: "Die API des Flux-Netzwerks hat nicht geantwortet. Versuch es in einer Minute noch einmal.",
    noNodes:
      "An diese Adresse zahlt kein Node. Prüfe, ob es die Auszahlungsadresse ist und nicht die Collateral-Adresse.",
    summary: (confirmed: N, dos: N | null, starting: N | null) => (
      <>
        {confirmed} bestätigt
        {dos !== null && <>, {dos} auf der DOS-Liste</>}
        {starting !== null && <>, {starting} startend</>}
      </>
    ),
    dosExplain:
      "Nodes auf der DOS-Liste werden erst wieder bezahlt, wenn sie neu gestartet werden. Ursache sind meist falsche Collateral-Angaben oder ein nicht synchronisierter Daemon.",
    dosUnknown: "Die DOS-Liste konnte gerade nicht geprüft werden, daher werden nur bestätigte Nodes angezeigt.",
    nativePerDay: "Natives FLUX pro Tag",
    expectedPerDay: "Erwartet pro Tag",
    paPerDay: "Parallel Assets pro Tag",
    claimUntil: "Mit Fusion beanspruchen, bis sie enden",
    totalPerDay: "Gesamt pro Tag",
    valuePerDay: "Wert pro Tag",
    rate: "Jährliche Ertragsrate",
    native: (pct: string) => `${pct} nativ`,
    useNodes: "Diese Nodes im Rechner verwenden",
    lastDays: (n: number) => `Letzte ${n} Tage, nur natives FLUX`,
    received: (flux: N, payouts: N, expected: N) => (
      <>
        {flux} erhalten aus {payouts} Auszahlungen, gegenüber {expected} erwartet
      </>
    ),
    historyNote:
      "Parallel Assets werden auf anderen Chains ausgezahlt und lassen sich hier nicht prüfen. Der erwartete Wert nimmt die heutige Anzahl an Nodes an und zählt jeden Node ab seiner Bestätigung. Ein Fehlbetrag bedeutet meist, dass ein Node Bestätigungen verpasst hat oder offline war.",
    historyMissing: "Der Auszahlungsverlauf ist gerade nicht verfügbar. Die Node-Details unten sind aktuell.",
    onlyAttention: "Nur Nodes anzeigen, die Aufmerksamkeit brauchen",
    colTier: "Stufe",
    colStatus: "Status",
    colCollateral: "Collateral",
    colQueue: "Position in der Warteschlange",
    colNext: "Nächste Auszahlung",
    colLast: "Zuletzt bezahlt",
    colPerDay: "Erwartet pro Tag",
    onDos: "Auf der DOS-Liste",
    startNow: "Kann jetzt gestartet werden",
    startIn: (when: string) => `Kann ${when} gestartet werden`,
    notPaid: "Wird nicht bezahlt",
    confirmed: "Bestätigt",
    queuePos: (pos: string, of: string) => `${pos} von ${of}`,
    startingOne: (tier: string, when: string) =>
      `1 ${tier}-Node an dieser Adresse startet gerade und muss ${when} bestätigt werden.`,
    startingMany: (n: number, parts: string, when: string) =>
      `${n} Nodes an dieser Adresse starten gerade (${parts}). Der erste muss ${when} bestätigt werden.`,
    updated: (when: string) => `Aktualisiert ${when.replace(/\.$/, "")}. IP-Adressen der Nodes werden nie angezeigt.`,
  },

  run: {
    intro: (checked: string) => `Was du brauchst, um selbst einen FluxNode zu betreiben, mit Links zu den offiziellen Anleitungen von Flux. Die Anforderungen ändern sich mit FluxOS-Updates; diese wurden im ${checked} geprüft.`,
    needTitle: "Was du brauchst",
    collateral: "Collateral",
    cpu: "CPU",
    coresThreads: (cores: number, threads: number) => `${cores} Kerne / ${threads} Threads`,
    ram: "RAM",
    ssd: "SSD / NVMe",
    eps: "Benchmark-Wert (EPS)",
    bandwidth: "Bandbreite",
    disk: "Schreibgeschwindigkeit",
    needNote: "Jeder Node muss den Benchmark von Flux bestehen, bevor er aufgenommen wird, braucht eine öffentliche IP-Adresse und sollte online bleiben (etwa 97 % der Zeit).",
    officialSpecs: "Offizielle Anforderungen",
    homeTitle: "Zu Hause oder im Rechenzentrum",
    homeArcane: "Nodes zu Hause müssen ArcaneOS nutzen, das sichere Node-Betriebssystem von Flux. Ohne ArcaneOS bekommt ein Heim-Node keine neuen Apps mehr und landet auf der DOS-Liste.",
    homeHardware: "ArcaneOS braucht einen AMD64-Rechner (x86-64) mit TPM 2.0 und UEFI. Die meisten aktuellen PCs und Mini-PCs haben beides.",
    homeNetwork: "Dein Router muss UPnP oder DMZ unterstützen. Bis zu 8 Nodes können sich ein Heimnetz teilen; ab zwei Nodes ist UPnP nötig.",
    dataCenter: "Nodes im Rechenzentrum oder auf einem VPS können noch die Legacy-Installation nutzen, aber Enterprise-Apps laufen nur auf ArcaneOS, und nur wenige VPS-Anbieter unterstützen das Secure Boot, das ArcaneOS in einer VM braucht.",
    arcaneGuide: "ArcaneOS-Installationsanleitung",
    legacyGuide: "Anleitung zur Legacy-Installation",
    walletTitle: "Wallet",
    sspTag: "Für Sicherheit",
    sspText: "Für Nodes, Collateral und größere Beträge. Jede Transaktion muss auf zwei deiner Geräte bestätigt werden: in der Browser-Erweiterung und in der App SSP Key auf dem Handy. Open Source und von Halborn geprüft. Startet Nodes und beansprucht Parallel Assets.",
    zelcoreTag: "Für den Alltag",
    zelcoreText: "Desktop, Handy und Browser, mit über 80 Chains, Swaps und Krypto-Kauf in der App. Startet ebenfalls Nodes und beansprucht Parallel Assets.",
    stepsTitle: "Schritte",
    step1: "Besorge das Collateral: 1.000, 12.500 oder 40.000 FLUX. Achtung: „Datamine FLUX“ ist ein anderer Coin.",
    step1Link: "Börsen mit FLUX",
    step2: "Sende genau diesen Betrag in einer einzigen Transaktion an deine SSP Wallet oder Zelcore.",
    step3: "Installiere den Node: ArcaneOS für einen Heim-Node oder die Legacy-Installation im Rechenzentrum.",
    step4: "Starte den Node aus deiner Wallet. Er muss innerhalb von etwa 2 Stunden bestätigt werden.",
    startSsp: "Start über SSP",
    startZelcore: "Start über Zelcore",
    step5: "Prüfe ihn mit deiner Auszahlungsadresse in der Node-Abfrage.",
    openLookup: "Node-Abfrage öffnen",
    hwTitle: "Hardware-Ideen für einen Heim-Node",
    hwIntro: "Suchlinks für Rechner, die zu jeder Stufe passen. Prüfe vor dem Kauf, dass TPM 2.0 vorhanden ist und mindestens die oben genannten Kerne, der RAM und der Speicher.",
    hwTier: (tier: string) => `Mini-PC für ${tier}`,
    hwNvme: "NVMe-SSD mit hoher Schreibgeschwindigkeit",
    hwUps: "USV (Notstrom), damit kurze Stromausfälle den Node nicht offline nehmen",
    noHwTitle: "Keine Hardware?",
    titanText: "Titan Staking: Staken ab 50 FLUX, Flux betreibt die Nodes. Dein FLUX ist 3, 6 oder 12 Monate gesperrt, und es gibt keine Mining-Belohnungen aus Parallel Assets.",
    titanLink: "Titan-Anleitung",
    managedText: "Managed FluxNode Service: Ein Anbieter hostet und betreibt deinen Node, und das Collateral bleibt in deiner Wallet. Prüfe vorher die Gebühren: Sie können höher sein als das, was ein kleiner Node verdient. Du kannst sie im Tab Erträge und ROI als laufende Kosten eintragen.",
    managedLink: "Managed FluxNode Service",
    healthTitle: "Den Node gesund halten",
    healthText: "Ein Node wird nur bezahlt, solange er bestätigt ist. Verpasst er Bestätigungen, landet er auf der DOS-Liste und verdient nichts, bis du ihn neu startest. Häufige Ursachen sind falsche Collateral-Angaben oder ein nicht synchronisierter Daemon.",
    diagnosing: "Fehlersuche",
    unlock: "Collateral freigeben",
    disclosure: "Einige Links auf dieser Seite sind Affiliate-Links: Wenn du darüber kaufst, kann diese Seite eine Provision erhalten, ohne Mehrkosten für dich. Sie beeinflussen nie die Berechnungen.",
    amazonNote: "Als Amazon-Partner verdient diese Seite an qualifizierten Verkäufen.",
    tableLink: "Was braucht man, um einen zu betreiben?",
  },

  how: {
    button: "So wird gerechnet",
    close: "Schließen",
    body: (v: HowValues) => (
      <>
        <H>Woher die Zahlen kommen</H>
        <p>
          Blockhöhe, aktive Nodes pro Stufe sowie die DOS- und Startliste kommen aus der API des Flux-Netzwerks und werden
          etwa alle 90 Sekunden aktualisiert. Der FLUX-Preis in US-Dollar kommt vom Flux-Explorer und wird mit den täglichen Wechselkursen der Europäischen Zentralbank (über Frankfurter) in andere Währungen umgerechnet; CoinGecko dient als Ausweichquelle. Er wird alle 20 Minuten aktualisiert.
          Alles andere wird daraus berechnet.
        </p>

        <H>Blöcke und Auszahlungen</H>
        <p>
          Alle 30 Sekunden entsteht ein Block, also {v.blocksPerDay} pro Tag. Jeder Block bezahlt einen Node pro Stufe,
          der Reihe nach in einer Warteschlange. Der Anteil eines Nodes hängt nur davon ab, wie viele aktive Nodes in
          seiner Stufe sind.
        </p>
        <Formula>FLUX pro Node und Tag = Stufenbelohnung pro Block × {v.blocksPerDay} ÷ aktive Nodes der Stufe</Formula>
        {v.live && (
          <Example>
            Heute für Stratus: {v.stratusReward} × {v.blocksPerDay} ÷ {v.stratusNodes} = {v.stratusDaily} FLUX pro Tag,
            ausgezahlt etwa alle {v.stratusEvery} ({v.stratusNodes} Nodes × 30 Sekunden).
          </Example>
        )}

        <H>Der Belohnungsplan</H>
        <p>
          Die Gesamtbelohnung lag ab Block {v.startHeight} bei 14 FLUX pro Block. Sie sinkt alle {v.interval} Blöcke (365
          Tage) um 10 %. Sie wird in festen Anteilen auf die Stufen verteilt: Cumulus 1/14, Nimbus 3,5/14, Stratus 9/14 und
          0,5/14 an die Flux Foundation. Das stimmt bei jeder geprüften Blockhöhe mit den Werten der Blockchain selbst
          überein.
        </p>
        {v.live && (
          <Example>
            Aktuell: {v.totalReward} FLUX pro Block. Nächste Kürzung um 10 % bei Block {v.nextCut}.
          </Example>
        )}

        <H>Monate und Jahre</H>
        <p>
          Ein Monat ist der durchschnittliche Kalendermonat, 30,44 Tage ({v.blocksPerMonth} Blöcke), sodass 12 Monate
          genau ein Jahr mit 365,25 Tagen ergeben ({v.blocksPerYear} Blöcke). Überschreitet ein Zeitraum eine Kürzung,
          zahlen die Blöcke davor die alte Belohnung und die danach die neue.
        </p>

        <H>Jährliche Ertragsrate</H>
        <Formula>Jährliche Ertragsrate = in den nächsten 12 Monaten verdientes FLUX ÷ Collateral</Formula>
        <p>
          Sie berücksichtigt jede Kürzung in diesen 12 Monaten und enthält keinen Zinseszins. Das Collateral beträgt{" "}
          {v.cumulus} FLUX für Cumulus, {v.nimbus} für Nimbus und {v.stratus} für Stratus.
        </p>
        {v.live && <Example>Heute für Stratus, nur natives FLUX: {v.stratusApr}.</Example>}

        <H>Parallel Assets</H>
        <p>
          Jedes aktive Parallel Asset zahlt zusätzlich {v.paShare} jeder Auszahlung, in FLUX auf einer anderen Chain. Bei{" "}
          {v.paCount} aktiven sind das {v.paTotal} zusätzlich zu den nativen Belohnungen. Sie zählen bis zu dem Enddatum,
          das du festlegst (Standard: {v.paEnd}, wenn laut Flux-Roadmap die Mining-Belohnungen für Parallel Assets enden),
          und mit dem Wert, den du im Verhältnis zu nativem FLUX festlegst. Sie werden nicht automatisch ausgezahlt: Du
          beanspruchst sie mit Fusion in der SSP Wallet oder in Zelcore, und die Fusion-Gebühr, die vom Claim abgezogen
          wird, ist nicht enthalten.
        </p>

        <H>Erträge, Kosten und Gewinnschwelle</H>
        <Formula>Netto pro Monat = (natives FLUX + Parallel Assets) × Preis − laufende Kosten</Formula>
        <Formula>
          Gewinnschwelle = erster Monat, in dem der gesamte Nettogewinn ≥ Einrichtungskosten (+ Collateral, falls
          eingerechnet)
        </Formula>
        <p>
          Das Collateral wird zum gezahlten Preis oder zum heutigen Preis bewertet. Die Gewinnschwelle nutzt den heutigen
          Preis und die heutige Netzwerkgröße, und die Belohnungen sinken weiterhin mit jeder jährlichen Kürzung.
        </p>

        <H>Prognosen</H>
        <p>
          Monat für Monat berechnet. Netzwerkgröße und Preisänderung wachsen monatlich aus den gewählten Jahresraten,
          gemessen jeweils zur Monatsmitte. Ein wachsendes Netzwerk bedeutet, dass jeder Node seltener ausgezahlt wird.
          Die niedrigen, mittleren und hohen Preise sind deine Annahmen, keine Vorhersagen.
        </p>

        <H>Nächster Node</H>
        <Formula>Gespart pro Monat = Belohnungen (+ Parallel Assets) − für laufende Kosten verkauftes FLUX</Formula>
        <p>
          Sobald die Ersparnisse das Collateral einer Stufe erreichen, wird ein Node gekauft. Wenn du weiter reinvestierst,
          verdient der neue Node ab dem Folgemonat und bringt seine laufenden Kosten mit. Hardware und Einrichtung neuer
          Nodes sind nicht enthalten.
        </p>

        <H>Node-Abfrage</H>
        <p>
          Nodes werden über die exakte Auszahlungsadresse gefunden. Die nächste Auszahlung ist die Position des Nodes in
          der Warteschlange seiner Stufe × 30 Sekunden. „Erhalten“ sind die Auszahlungen in nativem FLUX aus
          Blockbelohnungen der letzten 30 Tage, über den Betrag einer Stufe zugeordnet. „Erwartet“ ist, was die aktuellen
          Nodes der Adresse im selben Zeitraum bei heutiger Netzwerkgröße hätten verdienen sollen. Der Wert fällt daher zu
          hoch oder zu niedrig aus, wenn im Lauf des Monats Nodes hinzukamen oder wegfielen. Nodes auf der DOS-Liste und
          startende Nodes stammen aus den Listen von Flux selbst.
        </p>

        <H>Nicht enthalten</H>
        <ul className="list-disc space-y-1 pl-5">
          <li>Progressive Node Rewards (Umsatzbeteiligung aus FluxCloud). Es wurde keine Formel veröffentlicht.</li>
          <li>Gebühren für das Beanspruchen von Parallel Assets sowie Steuern.</li>
          <li>Ausfallzeiten. Die Belohnungen setzen voraus, dass deine Nodes bestätigt bleiben.</li>
        </ul>
        <p className="pt-2 text-sm text-muted">
          Der vollständige Quellcode liegt auf GitHub, einschließlich Tests, die den Belohnungsplan mit der Live-Blockchain
          abgleichen.
        </p>
      </>
    ),
  },
};
