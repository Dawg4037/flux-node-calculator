/* Français. */
import type { Messages } from "./en.tsx";
import { Example, Formula, H, type FormatWords, type HowValues, type N } from "./parts.tsx";

const fmt: FormatWords = {
  now: "maintenant",
  immediately: "immédiatement",
  days: (n) => `${n} j`,
  hours: (n) => `${n} h`,
  minutes: (n) => `${n} min`,
  seconds: (n) => `${n} s`,
  years: (n) => `${n} ${n === 1 ? "an" : "ans"}`,
  months: (n) => `${n} mois`,
  and: " et ",
  future: (d) => `dans ${d}`,
  past: (d) => `il y a ${d}`,
};

export const fr: Messages = {
  fmt,

  header: {
    appName: "Flux Node Calculator",
    language: "Langue",
    theme: "Thème",
    themes: { system: "Système", light: "Clair", dark: "Sombre" },
    currency: "Devise",
    title: "Combien vont rapporter vos FluxNodes ?",
    intro:
      "Les récompenses sont fixées par la blockchain : chaque bloc paie un nœud par niveau, et la récompense par bloc baisse de 10 % environ une fois par an. Les estimations utilisent les données du réseau en temps réel.",
    blockHeight: "Hauteur de bloc",
    fluxPrice: "Prix du FLUX",
    nextCut: "Prochaine baisse de 10 %",
    atBlock: "Au bloc",
    stale: (when: string) => `Données du ${when} ; la dernière mise à jour n'a pas répondu.`,
    caption: "FLUX total par bloc, par période de réduction. Le repère indique aujourd'hui.",
    staircaseAria: (values: string, current: string) =>
      `Calendrier des récompenses par bloc : ${values} FLUX par bloc sur des périodes de réduction successives. Vous êtes dans la période qui paie ${current} FLUX.`,
  },

  app: {
    tabs: { earnings: "Gains et ROI", projections: "Projections", next: "Prochain nœud", lookup: "Recherche de nœuds", run: "Lancer un nœud" },
    tablist: "Sections du calculateur",
    loading: "Chargement",
    networkError: "Impossible de joindre le réseau Flux pour le moment. Nouvelle tentative en cours.",
    priceError: "Le prix du FLUX n'est pas disponible pour le moment, les montants en devise sont donc masqués. Nouvelle tentative toutes les quelques minutes.",
    priceNeeded: "Ce calcul a besoin du prix du FLUX, qui n'est pas disponible pour le moment. Il s'affichera dès que le prix sera chargé.",
    runsOnFlux: "Hébergé sur Flux",
    builtBy: (who: N) => <>Créé par {who}</>,
    source: "Code source sur GitHub",
    issue: "Signaler un problème ou proposer une fonctionnalité",
    translation: "Proposer une meilleure traduction",
    disclaimer:
      "Outil communautaire indépendant, sans lien avec Flux. Simples estimations, pas un conseil financier. Les Progressive Node Rewards (partage des revenus de FluxCloud) ne sont pas incluses, car aucune formule n'a été publiée. Les récompenses supposent que vos nœuds restent confirmés.",
    credits: (source: N) => (
      <>
        Données de prix : {source}. Données du réseau issues de l'API Flux. Open source sous licence MIT.
      </>
    ),
  },

  contribute: {
    title: "Aidez à faire vivre ce calculateur",
    body: "Les contributions en FLUX servent au développement et à l'hébergement. Merci pour votre soutien.",
    copy: "Copier l'adresse",
    copied: "Copiée",
    copiedSr: "Adresse copiée dans le presse-papiers",
  },

  network: {
    title: "Les niveaux aujourd'hui",
    live: "En direct du réseau Flux.",
    tier: "Niveau",
    collateral: "Collatéral",
    enabled: "Nœuds actifs",
    perBlock: "FLUX par bloc",
    perDay: "Par nœud et par jour",
    withPa: "Avec actifs parallèles",
    paidEvery: "Payé environ toutes les",
    rate: "Taux de récompense annuel",
    native: (pct: string) => `${pct} natif`,
    footnote: (paCount: number | null) =>
      "Le taux de récompense annuel correspond aux FLUX gagnés sur les 12 prochains mois rapportés au collatéral, y compris la prochaine réduction" +
      (paCount === null
        ? "."
        : `, avec les actifs parallèles jusqu'à leur date de fin (${paCount} × 10 % de chaque paiement, versés sur d'autres blockchains, à réclamer). Le petit chiffre correspond au FLUX natif seul.`),
  },

  pa: {
    note: (count: number, share: string, end: string) => (
      <>
        Inclut les récompenses des actifs parallèles : du FLUX versé sur {count} autres blockchains, chacune ajoutant{" "}
        {share} de chaque paiement, jusqu'au {end}.{" "}
        <strong className="font-medium text-ink">Elles ne sont pas versées automatiquement.</strong> Vous les réclamez avec Fusion dans SSP Wallet
        (Nodes → Parallel Assets Reward) ou dans Zelcore (Apps → Fusion → Parallel Mining Claim). Les frais sont prélevés
        sur la réclamation elle-même, donc réclamer moins souvent réduit les frais.
      </>
    ),
    warning: (
      <>
        <strong className="font-medium text-loss">Les récompenses de minage des actifs parallèles prennent fin vers le 1er juillet
        2027</strong> (bloc 3 787 502), selon la feuille de route de Flux. À partir de mars 2027, les blockchains retirées
        passent en sens unique, et en août 2027 les soldes non réclamés reviennent à la Flux Foundation : réclamez avant.
      </>
    ),
    include: "Inclure les récompenses des actifs parallèles",
    includeHint: "Du FLUX en plus, versé sur d'autres blockchains tant qu'ils durent. À réclamer.",
    active: "Actifs en cours",
    value: "Valeur par rapport au FLUX natif",
    endDate: "Date de fin prévue",
    defaults: (date: string) => `Par défaut le ${date}, bloc 3 787 502 de la feuille de route de Flux.`,
    claimBy: "Réclamez avant août 2027.",
    reset: "Réinitialiser",
  },

  earnings: {
    intro:
      "Indiquez combien de nœuds vous faites tourner et combien chacun vous coûte par mois. Les coûts déjà remplis sont des exemples.",
    nodes: "Nœuds",
    costPerNode: "Coût par nœud / mois",
    setupCost: "Coût d'installation unique",
    setupHint: "Le matériel ou toute autre dépense payée une seule fois.",
    collateralPrice: "Prix payé par FLUX pour le collatéral",
    usingToday: "Le prix du jour est utilisé.",
    noPriceYet: "Le prix du jour n'est pas encore disponible. Saisissez le prix payé ou attendez son chargement.",
    useToday: "Utiliser le prix du jour",
    countCollateral: "Compter l'achat du collatéral dans le seuil de rentabilité",
    countCollateralHint: "Le collatéral reste à vous et peut être débloqué, mais l'acheter reste une dépense.",
    compare: "Comparer avec une deuxième configuration",
    setupA: "Configuration A",
    setupB: "Configuration B",
    addNode: "Ajoutez au moins un nœud pour voir les gains.",
    nativePerMonth: "FLUX natif par mois",
    fluxPerDay: "FLUX par jour",
    paPerMonth: "Actifs parallèles par mois",
    fluxPerMonth: "FLUX par mois",
    toClaim: "À réclamer",
    allFlux12: "Tout le FLUX, 12 prochains mois",
    flux12: "FLUX sur les 12 prochains mois",
    revenue: "Revenus par mois",
    costs: "Coûts par mois",
    net: "Net par mois",
    collateralLocked: "Collatéral bloqué",
    rate: "Taux de récompense annuel",
    ratePa: "Taux de récompense annuel, actifs parallèles inclus",
    net12: "Net sur les 12 prochains mois",
    breakEvenTitle: "Seuil de rentabilité au prix et à la taille du réseau actuels",
    profitableNow: "Rentable dès le premier mois",
    notProfitable: "Pas rentable avec ces coûts",
    after: (d: string) => `Après ${d}`,
    notWithin20: "Pas en moins de 20 ans",
    recovering: (amount: string, withCollateral: boolean, pa: boolean) =>
      `${amount} à récupérer${withCollateral ? ", collatéral compris" : " en coûts d'installation"}. Les récompenses baissent de 10 % à chaque réduction annuelle${pa ? " et les actifs parallèles s'arrêtent à leur date de fin" : ""}, donc les mois suivants rapportent moins.`,
  },

  projections: {
    needNodes: "Ajoutez au moins un nœud dans l'onglet Gains et ROI pour voir une projection.",
    intro: "Utilise les nœuds et les coûts de l'onglet Gains et ROI. Chaque année cumule les variations ci-dessous.",
    years: "Années",
    growth: "Variation annuelle de la taille du réseau",
    growthHint: "Plus il y a de nœuds dans un niveau, moins chacun est payé souvent.",
    priceChange: "Variation annuelle du prix du FLUX",
    low: "Bas",
    middle: "Moyen",
    high: "Haut",
    startFrom: (price: string) => `À partir de ${price}. Ce sont vos hypothèses, pas des prévisions.`,
    chartTitle: "Bénéfice cumulé",
    chartIntro: (years: number, cuts: number, pa: boolean) =>
      `Revenus moins coûts d'exploitation sur ${years} ${years === 1 ? "an" : "ans"}, avec ${cuts} ${cuts === 1 ? "réduction" : "réductions"} de récompense${pa ? ", et les actifs parallèles jusqu'à leur date de fin" : ""}.`,
    chartAria: "Bénéfice cumulé par mois selon trois scénarios de prix",
    series: (label: string, pct: number) => `${label} (${pct} %/an)`,
    month: (n: number) => `Mois ${n}`,
    year: (n: number) => `Année ${n}`,
    toRecover: (amount: string) => `À récupérer : ${amount}`,
    breakEven: (label: string) => `${label} : seuil de rentabilité`,
    notWithin: (years: number) => `pas en moins de ${years} ${years === 1 ? "an" : "ans"}`,
    immediately: "immédiatement",
    after: (d: string) => `après ${d}`,
    tableTitle: "Année par année, prix moyen",
    colYear: "Année",
    colNative: "FLUX natif",
    colEarned: "FLUX gagné",
    colPa: "Actifs parallèles",
    colTotal: "FLUX total",
    colPrice: "Prix en fin d'année",
    colNet: "Net de l'année",
    colTotalNet: "Net cumulé",
  },

  next: {
    intro:
      "Le temps qu'il faut pour que vos récompenses paient le collatéral d'un nouveau nœud. Utilise vos nœuds et vos coûts de Gains et ROI, ainsi que la variation de taille du réseau et le prix moyen de Projections.",
    saved: "FLUX déjà mis de côté",
    savedHint: "FLUX disponible, pas encore bloqué en collatéral.",
    sell: "Vendre des récompenses pour payer les coûts",
    sellHint: "Désactivez si vous payez l'hébergement avec d'autres revenus : toutes les récompenses sont alors épargnées.",
    keepBuying: "Continuer à acheter",
    planLength: "Durée du plan",
    yearsUnit: "ans",
    needInput: "Ajoutez vos nœuds dans l'onglet Gains et ROI, ou indiquez le FLUX déjà mis de côté.",
    priceNeeded: "Vous pouvez aussi désactiver « Vendre des récompenses pour payer les coûts » pour planifier sans lui.",
    saving: (flux: N, sell: boolean) => (
      <>
        Vous mettriez de côté environ {flux} par mois en ce moment
        {sell ? ", après avoir vendu de quoi payer les coûts" : ""}.
      </>
    ),
    nothingSaved:
      "Les coûts absorbent toutes vos récompenses, donc rien n'est épargné. Réduisez les coûts ou arrêtez de vendre des récompenses pour les payer.",
    yourNext: "Votre prochain nœud",
    nextTier: (tier: string) => `Prochain ${tier}`,
    notWithin20: "Pas en moins de 20 ans",
    collateral: (amount: string) => `${amount} FLUX de collatéral`,
    now: "Maintenant",
    nowInline: "maintenant",
    inDays: (n: number, inline: boolean) => `${inline ? "dans" : "Dans"} ${n} ${n === 1 ? "jour" : "jours"}`,
    inDuration: (d: string, inline: boolean) => `${inline ? "dans" : "Dans"} ${d}`,
    planTitle: (tier: string) => `Si vous continuez à acheter des nœuds ${tier}`,
    notEnough: (tier: string, years: number) =>
      `Pas assez d'épargne pour un ${tier} en ${years} ${years === 1 ? "an" : "ans"}.`,
    summary: (years: number, count: number, countN: N, tier: string, daily: N, first: string) => (
      <>
        En {years} {years === 1 ? "an" : "ans"}, vous ajouteriez {countN} {count === 1 ? "nœud" : "nœuds"} {tier}, pour
        environ {daily} par jour à la fin. Le premier arrive {first}.
      </>
    ),
    colYear: "Année",
    colAdded: "Nœuds ajoutés",
    colNodes: "Vos nœuds en fin d'année",
    colPerDay: "FLUX par jour",
    yearEnd: (date: string) => `jusqu'à ${date}`,
    footnote:
      "Chaque nouveau nœud rapporte à partir du mois qui suit son achat et ajoute son coût d'exploitation. Les réductions de récompense, la taille du réseau et la variation de prix sont appliquées mois par mois. Le matériel et l'installation des nouveaux nœuds ne sont pas inclus.",
    paCounted:
      "Les actifs parallèles comptent dans l'épargne tant qu'ils durent. Cela suppose que vous les réclamiez et les convertissiez en FLUX natif pour le collatéral.",
  },

  lookup: {
    address: "Adresse de paiement",
    lookingUp: "Recherche…",
    lookUp: "Rechercher les nœuds",
    hint: "L'adresse qui reçoit les récompenses de vos nœuds. La recherche ne lit que des données publiques de la blockchain.",
    invalid: "Saisissez une adresse de paiement Flux complète : 35 caractères commençant par t1 ou t3.",
    tooMany: "Trop de recherches en peu de temps. Attendez une minute et réessayez.",
    failed: "L'API du réseau Flux n'a pas répondu. Réessayez dans une minute.",
    noNodes:
      "Aucun nœud ne paie cette adresse. Vérifiez qu'il s'agit bien de l'adresse de paiement et non de celle du collatéral.",
    summary: (confirmed: N, dos: N | null, starting: N | null) => (
      <>
        {confirmed} confirmés
        {dos !== null && <>, {dos} sur la liste DOS</>}
        {starting !== null && <>, {starting} en démarrage</>}
      </>
    ),
    dosExplain:
      "Les nœuds sur la liste DOS ne sont plus payés tant qu'ils ne sont pas redémarrés. C'est généralement dû à des informations de collatéral incorrectes ou à un daemon non synchronisé.",
    dosUnknown: "La liste DOS n'a pas pu être vérifiée pour le moment, seuls les nœuds confirmés sont affichés.",
    nativePerDay: "FLUX natif par jour",
    expectedPerDay: "Attendu par jour",
    paPerDay: "Actifs parallèles par jour",
    claimUntil: "À réclamer avec Fusion, jusqu'à leur fin",
    totalPerDay: "Total par jour",
    valuePerDay: "Valeur par jour",
    rate: "Taux de récompense annuel",
    native: (pct: string) => `${pct} natif`,
    useNodes: "Utiliser ces nœuds dans le calculateur",
    lastDays: (n: number) => `${n} derniers jours, FLUX natif uniquement`,
    received: (flux: N, payouts: N, expected: N) => (
      <>
        {flux} reçus en {payouts} paiements, pour {expected} attendus
      </>
    ),
    historyNote:
      "Les actifs parallèles sont versés sur d'autres blockchains et ne peuvent donc pas être vérifiés ici. L'attendu se base sur le nombre de nœuds actuel et compte chaque nœud depuis sa confirmation. Un manque signifie généralement qu'un nœud a raté des confirmations ou était hors ligne.",
    historyMissing: "L'historique des paiements n'est pas disponible pour le moment. Les détails des nœuds ci-dessous sont à jour.",
    onlyAttention: "N'afficher que les nœuds qui demandent votre attention",
    colTier: "Niveau",
    colStatus: "État",
    colCollateral: "Collatéral",
    colQueue: "Position dans la file",
    colNext: "Prochain paiement",
    colLast: "Dernier paiement",
    colPerDay: "Attendu par jour",
    onDos: "Sur la liste DOS",
    startNow: "Peut être démarré maintenant",
    startIn: (when: string) => `Peut être démarré ${when}`,
    notPaid: "Non payé",
    confirmed: "Confirmé",
    queuePos: (pos: string, of: string) => `${pos} sur ${of}`,
    startingOne: (tier: string, when: string) =>
      `1 nœud ${tier} de cette adresse est en démarrage et doit être confirmé ${when}.`,
    startingMany: (n: number, parts: string, when: string) =>
      `${n} nœuds de cette adresse sont en démarrage (${parts}). Le premier doit être confirmé ${when}.`,
    updated: (when: string) => `Mis à jour ${when}. Les adresses IP des nœuds ne sont jamais affichées.`,
  },

  run: {
    intro: (checked: string) => `Ce qu'il faut pour faire tourner votre propre FluxNode, avec des liens vers les guides officiels de Flux. Les exigences évoluent avec les mises à jour de FluxOS ; celles-ci ont été vérifiées en ${checked}.`,
    needTitle: "Ce qu'il vous faut",
    collateral: "Collatéral",
    cpu: "Processeur",
    coresThreads: (cores: number, threads: number) => `${cores} cœurs / ${threads} threads`,
    ram: "RAM",
    ssd: "SSD / NVMe",
    eps: "Score au benchmark (EPS)",
    bandwidth: "Bande passante",
    disk: "Vitesse d'écriture disque",
    needNote: "Chaque nœud doit réussir le benchmark de Flux avant de rejoindre le réseau, a besoin d'une adresse IP publique et doit rester en ligne (environ 97 % du temps).",
    officialSpecs: "Exigences officielles",
    homeTitle: "À la maison ou en data center",
    homeArcane: "Les nœuds à domicile doivent utiliser ArcaneOS, le système d'exploitation sécurisé de Flux pour les nœuds. Sans lui, un nœud à domicile ne reçoit plus de nouvelles applications et finit sur la liste DOS.",
    homeHardware: "ArcaneOS nécessite une machine AMD64 (x86-64) avec TPM 2.0 et UEFI. La plupart des PC et mini-PC récents ont les deux.",
    homeNetwork: "Votre routeur doit prendre en charge l'UPnP ou la DMZ. Jusqu'à 8 nœuds peuvent partager un même réseau domestique ; au-delà d'un nœud, l'UPnP est requis.",
    dataCenter: "Les nœuds en data center ou sur VPS peuvent encore utiliser l'installation classique, mais les applications enterprise ne tournent que sur ArcaneOS, et peu d'hébergeurs VPS prennent en charge le Secure Boot qu'ArcaneOS exige dans une machine virtuelle.",
    arcaneGuide: "Guide d'installation d'ArcaneOS",
    legacyGuide: "Guide de l'installation classique",
    walletTitle: "Portefeuille",
    sspTag: "Pour la sécurité",
    sspText: "Pour les nœuds, le collatéral et les montants importants. Chaque transaction doit être approuvée sur deux de vos appareils : l'extension du navigateur et l'application SSP Key sur le téléphone. Open source et audité par Halborn. Démarre les nœuds et réclame les actifs parallèles.",
    zelcoreTag: "Pour le quotidien",
    zelcoreText: "Ordinateur, téléphone et navigateur, avec plus de 80 blockchains, des échanges et l'achat de crypto dans l'application. Démarre aussi les nœuds et réclame les actifs parallèles.",
    guide2026: "Guide de Flux : How to run a FluxNode in 2026",
    stepsTitle: "Étapes",
    step1: "Procurez-vous le collatéral : 1 000, 12 500 ou 40 000 FLUX. Attention : « Datamine FLUX » est une autre monnaie.",
    step1Link: "Plateformes qui proposent FLUX",
    step2: "Envoyez exactement ce montant sur votre SSP Wallet ou Zelcore, en une seule transaction.",
    step3: "Installez le nœud : ArcaneOS pour un nœud à domicile, ou l'installation classique en data center.",
    step4: "Démarrez le nœud depuis votre portefeuille. Il doit être confirmé dans les 2 heures environ.",
    startSsp: "Démarrer avec SSP",
    startZelcore: "Démarrer avec Zelcore",
    step5: "Vérifiez-le avec votre adresse de paiement dans Recherche de nœuds.",
    openLookup: "Ouvrir la recherche de nœuds",
    hwTitle: "Idées de matériel pour un nœud à domicile",
    budgetIntro: "Ce que rapporte un nœud détermine ce que vaut son matériel. Un nœud par niveau, sur les 2 prochaines années, au prix et à la taille du réseau actuels :",
    budgetMonth: (m: string) => `${m} ce mois-ci`,
    budgetNote: "C'est le maximum que peuvent coûter le matériel, l'électricité et l'hébergement pour que le nœud se rembourse en 2 ans. La baisse annuelle des récompenses et la fin des actifs parallèles (selon vos réglages) sont déjà comptées.",
    budgetNoPrice: "Affiché dès que le prix du FLUX est chargé.",
    hwIntro: "Commencez par ce que vous avez déjà : un vieux PC ou portable avec TPM 2.0 ne coûte rien. La plupart des opérateurs utilisent des mini-PC d'occasion ou reconditionnés, ou une seule machine avec plusieurs nœuds sous Proxmox, et dépensent plutôt en RAM, stockage et onduleur.",
    picks: {
      cumulus: { label: "Cumulus : mini-PC d'occasion ou reconditionné", note: "4+ threads, 8 Go+ de RAM, SSD de 256 Go+. Beelink, GMKtec et Lenovo ThinkCentre Tiny sont des choix courants." },
      nimbus: { label: "Nimbus : mini-PC 8 threads et 32 Go", note: "Les mini-PC à Ryzen 7 série 5000 sont un choix populaire." },
      stratus: { label: "Stratus : 16 threads et 64 Go", note: "Un mini-PC à Ryzen 9 ou une station de travail d'occasion, généralement sous Proxmox." },
      multi: { label: "Plusieurs nœuds : station de travail ou serveur d'occasion", note: "Beaucoup de RAM et de cœurs, chaque nœud dans une VM Proxmox. Jusqu'à 8 nœuds par IP domestique." },
      ram: { label: "Extension de RAM (DDR4 SO-DIMM)", note: "Vérifiez d'abord le type de RAM de votre machine." },
      nvme: { label: "SSD NVMe", note: "1 To suffit pour un Stratus. Vérifiez la vitesse d'écriture : 180 Mo/s, ou 400 Mo/s pour Stratus." },
      ups: { label: "Onduleur", note: "Une courte coupure de courant peut garder un nœud hors ligne assez longtemps pour manquer des confirmations." },
      nic: { label: "Carte réseau Intel 2,5 GbE", note: "Pour pfSense ou OPNsense devant plusieurs nœuds." },
    },
    pricesNote: "Les prix de la RAM et des SSD ont fortement augmenté. Comparez avec le budget ci-dessus avant d'acheter.",
    noHwTitle: "Pas de matériel ?",
    titanText: "Titan staking : stakez à partir de 50 FLUX et Flux fait tourner les nœuds. Vos FLUX sont bloqués 3, 6 ou 12 mois, sans récompenses de minage des actifs parallèles.",
    titanLink: "Guide Titan",
    managedText: "Service de FluxNode géré : un prestataire héberge et fait tourner votre nœud, et le collatéral reste dans votre portefeuille. Vérifiez d'abord les frais : ils peuvent dépasser ce que rapporte un petit nœud. Vous pouvez les saisir comme coûts dans l'onglet Gains et ROI.",
    managedLink: "Service de FluxNode géré",
    fluxHubText: "FluxHub, géré par des membres de la communauté : ceux qui ont le collatéral mais pas le matériel font héberger un nœud par des opérateurs aux machines disponibles. On peut l'essayer gratuitement au début.",
    healthTitle: "Garder le nœud en bonne santé",
    healthText: "Un nœud n'est payé que tant qu'il est confirmé. S'il manque des confirmations, il passe sur la liste DOS et ne gagne rien tant que vous ne le redémarrez pas. Les causes habituelles sont des informations de collatéral incorrectes ou un daemon non synchronisé.",
    diagnosing: "Diagnostiquer les problèmes",
    unlock: "Débloquer le collatéral",
    disclosure: "Certains liens de cette page sont des liens d'affiliation : si vous achetez par leur biais, ce site peut toucher une commission, sans surcoût pour vous. Ils n'influencent jamais les calculs.",
    amazonNote: "En tant que Partenaire Amazon, ce site réalise un bénéfice sur les achats remplissant les conditions requises.",
    tableLink: "Que faut-il pour en faire tourner un ?",
  },

  how: {
    button: "Comment les calculs sont faits",
    close: "Fermer",
    body: (v: HowValues) => (
      <>
        <H>D'où viennent les chiffres</H>
        <p>
          La hauteur de bloc, les nœuds actifs par niveau et les listes DOS et de démarrage viennent de l'API du réseau
          Flux, actualisée environ toutes les 90 secondes. Le prix du FLUX en dollars vient de l'explorateur Flux et est converti dans les autres devises avec les taux de change quotidiens de la Banque centrale européenne (via Frankfurter), avec CoinGecko en secours. Il est actualisé toutes les 20 minutes. Tout le reste est calculé à partir de ces données.
        </p>

        <H>Blocs et paiements</H>
        <p>
          Un bloc est produit toutes les 30 secondes, soit {v.blocksPerDay} par jour. Chaque bloc paie un nœud par niveau,
          à tour de rôle dans une file. La part d'un nœud dépend uniquement du nombre de nœuds actifs dans son niveau.
        </p>
        <Formula>FLUX par nœud et par jour = récompense du niveau par bloc × {v.blocksPerDay} ÷ nœuds actifs du niveau</Formula>
        {v.live && (
          <Example>
            Aujourd'hui pour Stratus : {v.stratusReward} × {v.blocksPerDay} ÷ {v.stratusNodes} = {v.stratusDaily} FLUX
            par jour, payés environ toutes les {v.stratusEvery} ({v.stratusNodes} nœuds × 30 secondes).
          </Example>
        )}

        <H>Le calendrier des récompenses</H>
        <p>
          La récompense totale était de 14 FLUX par bloc à partir du bloc {v.startHeight}. Elle baisse de 10 % tous les{" "}
          {v.interval} blocs (365 jours). Elle est répartie entre les niveaux selon des parts fixes : Cumulus 1/14, Nimbus
          3,5/14, Stratus 9/14 et 0,5/14 pour la Flux Foundation. Ces valeurs correspondent aux chiffres de la blockchain
          elle-même à chaque hauteur vérifiée.
        </p>
        {v.live && (
          <Example>
            Actuellement : {v.totalReward} FLUX par bloc. Prochaine baisse de 10 % au bloc {v.nextCut}.
          </Example>
        )}

        <H>Mois et années</H>
        <p>
          Un mois est le mois calendaire moyen, soit 30,44 jours ({v.blocksPerMonth} blocs), donc 12 mois font exactement
          une année de 365,25 jours ({v.blocksPerYear} blocs). Quand une période chevauche une baisse, les blocs avant la
          baisse paient l'ancienne récompense et ceux d'après la nouvelle.
        </p>

        <H>Taux de récompense annuel</H>
        <Formula>Taux de récompense annuel = FLUX gagnés sur les 12 prochains mois ÷ collatéral</Formula>
        <p>
          Il tient compte de toute baisse pendant ces 12 mois et n'est pas composé. Le collatéral est de {v.cumulus} FLUX
          pour Cumulus, {v.nimbus} pour Nimbus et {v.stratus} pour Stratus.
        </p>
        {v.live && <Example>Aujourd'hui pour Stratus, FLUX natif seul : {v.stratusApr}.</Example>}

        <H>Actifs parallèles</H>
        <p>
          Chaque actif parallèle en cours verse {v.paShare} de plus de chaque paiement, en FLUX sur une autre blockchain.
          Avec {v.paCount} en cours, cela fait {v.paTotal} en plus des récompenses natives. Ils sont comptés jusqu'à la
          date de fin que vous choisissez (par défaut le {v.paEnd}, fin des récompenses de minage des actifs parallèles
          selon la feuille de route de Flux) et à la valeur que vous fixez par rapport au FLUX natif. Ils ne sont pas
          versés automatiquement : vous les réclamez avec Fusion dans SSP Wallet ou Zelcore, et les frais de Fusion,
          prélevés sur la réclamation, ne sont pas inclus.
        </p>

        <H>Gains, coûts et seuil de rentabilité</H>
        <Formula>Net par mois = (FLUX natif + actifs parallèles) × prix − coûts d'exploitation</Formula>
        <Formula>
          Seuil de rentabilité = premier mois où le bénéfice net cumulé ≥ coût d'installation (+ collatéral, s'il est
          compté)
        </Formula>
        <p>
          Le collatéral est évalué au prix que vous avez payé, ou au prix du jour. Le seuil de rentabilité utilise le prix
          et la taille du réseau actuels, et les récompenses continuent de baisser à chaque réduction annuelle.
        </p>

        <H>Projections</H>
        <p>
          Calculées mois par mois. La variation de la taille du réseau et du prix se cumule chaque mois à partir des taux
          annuels choisis, mesurés au milieu de chaque mois. Un réseau qui grandit signifie que chaque nœud est payé moins
          souvent. Les prix bas, moyen et haut sont vos hypothèses, pas des prévisions.
        </p>

        <H>Prochain nœud</H>
        <Formula>Épargne par mois = récompenses (+ actifs parallèles) − FLUX vendu pour payer les coûts</Formula>
        <p>
          Quand l'épargne atteint le collatéral d'un niveau, un nœud est acheté. Si vous continuez à réinvestir, le nouveau
          nœud rapporte dès le mois suivant et ajoute son coût d'exploitation. Le matériel et l'installation des nouveaux
          nœuds ne sont pas inclus.
        </p>

        <H>Recherche de nœuds</H>
        <p>
          Les nœuds sont trouvés par adresse de paiement exacte. Le prochain paiement correspond à la place du nœud dans la
          file de son niveau × 30 secondes. « Reçu » correspond aux paiements en FLUX natif des 30 derniers jours issus des
          récompenses de bloc, rattachés à un niveau selon leur montant. « Attendu » est ce que les nœuds actuels de
          l'adresse auraient dû gagner sur la même période avec la taille du réseau actuelle ; il paraît donc trop haut ou
          trop bas si des nœuds ont été ajoutés ou retirés pendant le mois. Les nœuds sur la liste DOS et en démarrage
          proviennent des listes de Flux.
        </p>

        <H>Non inclus</H>
        <ul className="list-disc space-y-1 pl-5">
          <li>Les Progressive Node Rewards (partage des revenus de FluxCloud). Aucune formule n'a été publiée.</li>
          <li>Les frais de réclamation des actifs parallèles, et les impôts.</li>
          <li>Les interruptions. Les récompenses supposent que vos nœuds restent confirmés.</li>
        </ul>
        <p className="pt-2 text-sm text-muted">
          Le code source complet est sur GitHub, y compris les tests qui vérifient le calendrier des récompenses par
          rapport à la blockchain en direct.
        </p>
      </>
    ),
  },
};
