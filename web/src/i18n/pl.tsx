/* Polski. */
import type { Messages } from "./en.tsx";
import { Example, Formula, H, type FormatWords, type HowValues, type N } from "./parts.tsx";

/** Polish plural: 1 rok, 2–4 lata (not 12–14), otherwise 5 lat. */
const plural = (n: number, one: string, few: string, many: string) => {
  if (n === 1) return one;
  const d = n % 10;
  const t = n % 100;
  return d >= 2 && d <= 4 && (t < 12 || t > 14) ? few : many;
};
const lat = (n: number) => `${n} ${plural(n, "rok", "lata", "lat")}`;

const fmt: FormatWords = {
  now: "teraz",
  immediately: "od razu",
  days: (n) => `${n} d`,
  hours: (n) => `${n} h`,
  minutes: (n) => `${n} min`,
  seconds: (n) => `${n} s`,
  // Nominative/accusative, used after "za" ("za 2 lata", "za 3 miesiące").
  years: lat,
  months: (n) => `${n} ${plural(n, "miesiąc", "miesiące", "miesięcy")}`,
  and: " i ",
  future: (d) => `za ${d}`,
  past: (d) => `${d} temu`,
};

export const pl: Messages = {
  fmt,

  header: {
    appName: "Flux Node Calculator",
    language: "Język",
    theme: "Motyw",
    themes: { system: "Systemowy", light: "Jasny", dark: "Ciemny" },
    currency: "Waluta",
    title: "Ile zarobią Twoje FluxNode'y?",
    intro:
      "Nagrody ustala blockchain: każdy blok wypłaca nagrodę jednemu węzłowi z każdego poziomu, a nagroda za blok spada o 10% mniej więcej raz w roku. Szacunki opierają się na danych z sieci na żywo.",
    blockHeight: "Wysokość bloku",
    fluxPrice: "Cena FLUX",
    nextCut: "Następna obniżka o 10%",
    atBlock: "Przy bloku",
    stale: (when: string) => `Dane z ${when}; ostatnie odświeżenie nie odpowiedziało.`,
    caption: "Łączna liczba FLUX na blok w kolejnych okresach redukcji. Znacznik to dziś.",
    staircaseAria: (values: string, current: string) =>
      `Harmonogram nagród za blok: ${values} FLUX na blok w kolejnych okresach redukcji. Jesteś w okresie, w którym nagroda wynosi ${current} FLUX.`,
  },

  app: {
    tabs: { earnings: "Zarobki i ROI", projections: "Prognozy", next: "Kolejny węzeł", lookup: "Wyszukaj węzły", run: "Uruchom węzeł" },
    tablist: "Sekcje kalkulatora",
    loading: "Ładowanie",
    networkError: "Nie można teraz połączyć się z siecią Flux. Ponawiam próbę.",
    priceError: "Cena FLUX jest teraz niedostępna, więc kwoty w walucie są ukryte. Ponawiam co kilka minut.",
    priceNeeded: "To wymaga ceny FLUX, która jest teraz niedostępna. Pojawi się, gdy tylko cena się wczyta.",
    runsOnFlux: "Działa na Flux",
    builtBy: (who: N) => <>Autor: {who}</>,
    source: "Kod źródłowy na GitHubie",
    issue: "Zgłoś problem lub zaproponuj funkcję",
    translation: "Zaproponuj lepsze tłumaczenie",
    disclaimer:
      "Niezależne narzędzie społeczności, niepowiązane z Flux. To tylko szacunki, nie porada finansowa. Progressive Node Rewards (udział w przychodach FluxCloud) nie są uwzględnione, bo nie opublikowano żadnego wzoru. Nagrody zakładają, że Twoje węzły pozostają potwierdzone.",
    credits: (source: N) => (
      <>
        Dane o cenach: {source}. Dane o sieci z API Flux. Otwarty kod na licencji MIT.
      </>
    ),
  },

  contribute: {
    title: "Pomóż utrzymać ten kalkulator",
    body: "Wpłaty w FLUX idą na rozwój i hosting. Dziękuję za wsparcie.",
    copy: "Kopiuj adres",
    copied: "Skopiowano",
    copiedSr: "Adres skopiowany do schowka",
  },

  network: {
    title: "Poziomy dziś",
    live: "Na żywo z sieci Flux.",
    tier: "Poziom",
    collateral: "Zabezpieczenie",
    enabled: "Aktywne węzły",
    perBlock: "FLUX na blok",
    perDay: "Na węzeł dziennie",
    withPa: "Z aktywami równoległymi",
    paidEvery: "Wypłata mniej więcej co",
    rate: "Roczna stopa nagród",
    native: (pct: string) => `${pct} natywnie`,
    footnote: (paCount: number | null) =>
      "Roczna stopa nagród to FLUX zarobiony w ciągu najbliższych 12 miesięcy w stosunku do zabezpieczenia, z uwzględnieniem najbliższej redukcji" +
      (paCount === null
        ? "."
        : `, z aktywami równoległymi do daty ich końca (${paCount} × 10% każdej wypłaty, wypłacane na innych blockchainach, trzeba je odebrać). Mniejsza liczba to sam natywny FLUX.`),
  },

  pa: {
    note: (count: number, share: string, end: string) => (
      <>
        Obejmuje nagrody z aktywów równoległych: FLUX wypłacany na {count} innych blockchainach, z których każdy dodaje{" "}
        {share} każdej wypłaty, do {end}.{" "}
        <strong className="font-medium text-ink">Nie są wypłacane automatycznie.</strong> Odbierasz je przez Fusion w SSP Wallet (Nodes → Parallel
        Assets Reward) lub w Zelcore (Apps → Fusion → Parallel Mining Claim). Opłata jest potrącana z samego odbioru, więc
        rzadsze odbieranie oszczędza opłaty.
      </>
    ),
    warning: (
      <>
        <strong className="font-medium text-loss">Nagrody za kopanie aktywów równoległych kończą się około 1 lipca 2027</strong> (blok
        3 787 502), zgodnie z planem Flux. Od marca 2027 wycofywane blockchainy działają tylko w jedną stronę, a w sierpniu
        2027 nieodebrane salda trafiają do Flux Foundation, więc odbierz je wcześniej.
      </>
    ),
    include: "Uwzględnij nagrody z aktywów równoległych",
    includeHint: "Dodatkowy FLUX na innych blockchainach, dopóki trwają. Trzeba go odebrać.",
    active: "Aktywne aktywa",
    value: "Wartość względem natywnego FLUX",
    endDate: "Przewidywana data końca",
    defaults: (date: string) => `Domyślnie ${date}, blok 3 787 502 według planu Flux.`,
    claimBy: "Odbierz przed sierpniem 2027.",
    reset: "Przywróć",
  },

  earnings: {
    intro: "Wpisz, ile masz węzłów i ile każdy kosztuje Cię miesięcznie. Wpisane koszty to przykłady.",
    nodes: "Węzły",
    costPerNode: "Koszt na węzeł / miesiąc",
    setupCost: "Jednorazowy koszt uruchomienia",
    setupHint: "Sprzęt lub cokolwiek innego, za co płacisz raz.",
    collateralPrice: "Cena zapłacona za FLUX na zabezpieczenie",
    usingToday: "Używana jest dzisiejsza cena.",
    noPriceYet: "Dzisiejsza cena nie jest jeszcze dostępna. Wpisz cenę zakupu albo poczekaj, aż się wczyta.",
    useToday: "Użyj dzisiejszej ceny",
    countCollateral: "Wlicz zakup zabezpieczenia do progu rentowności",
    countCollateralHint: "Zabezpieczenie zostaje Twoje i można je odblokować, ale jego zakup to wydane pieniądze.",
    compare: "Porównaj z drugą konfiguracją",
    setupA: "Konfiguracja A",
    setupB: "Konfiguracja B",
    addNode: "Dodaj co najmniej jeden węzeł, aby zobaczyć zarobki.",
    nativePerMonth: "Natywny FLUX miesięcznie",
    fluxPerDay: "FLUX dziennie",
    paPerMonth: "Aktywa równoległe miesięcznie",
    fluxPerMonth: "FLUX miesięcznie",
    toClaim: "Do odebrania",
    allFlux12: "Cały FLUX, najbliższe 12 miesięcy",
    flux12: "FLUX w najbliższych 12 miesiącach",
    revenue: "Przychód miesięcznie",
    costs: "Koszty miesięcznie",
    net: "Netto miesięcznie",
    collateralLocked: "Zablokowane zabezpieczenie",
    rate: "Roczna stopa nagród",
    ratePa: "Roczna stopa nagród, z aktywami równoległymi",
    net12: "Netto w najbliższych 12 miesiącach",
    breakEvenTitle: "Próg rentowności przy dzisiejszej cenie i wielkości sieci",
    profitableNow: "Opłacalne od pierwszego miesiąca",
    notProfitable: "Nieopłacalne przy tych kosztach",
    after: (d: string) => `Za ${d}`,
    notWithin20: "Nie w ciągu 20 lat",
    recovering: (amount: string, withCollateral: boolean, pa: boolean) =>
      `Do odzyskania: ${amount}${withCollateral ? " wraz z zabezpieczeniem" : " kosztów uruchomienia"}. Nagrody spadają o 10% przy każdej rocznej redukcji${pa ? ", a aktywa równoległe kończą się w dniu ich końca" : ""}, więc późniejsze miesiące przynoszą mniej.`,
  },

  projections: {
    needNodes: "Dodaj co najmniej jeden węzeł w zakładce Zarobki i ROI, aby zobaczyć prognozę.",
    intro: "Korzysta z węzłów i kosztów z zakładki Zarobki i ROI. Każdy rok kumuluje poniższe zmiany.",
    years: "Lata",
    growth: "Roczna zmiana wielkości sieci",
    growthHint: "Więcej węzłów w poziomie oznacza rzadsze wypłaty dla każdego z nich.",
    priceChange: "Roczna zmiana ceny FLUX",
    low: "Niska",
    middle: "Średnia",
    high: "Wysoka",
    startFrom: (price: string) => `Punkt wyjścia: ${price}. To Twoje założenia, a nie prognozy.`,
    chartTitle: "Skumulowany zysk",
    chartIntro: (years: number, cuts: number, pa: boolean) =>
      `Przychód minus koszty utrzymania w ciągu ${years === 1 ? "1 roku" : `${years} lat`}, z uwzględnieniem redukcji nagród: ${cuts}${pa ? ", z aktywami równoległymi do daty ich końca" : ""}.`,
    chartAria: "Skumulowany zysk w kolejnych miesiącach dla trzech scenariuszy cenowych",
    series: (label: string, pct: number) => `${label} (${pct}%/rok)`,
    month: (n: number) => `Miesiąc ${n}`,
    year: (n: number) => `Rok ${n}`,
    toRecover: (amount: string) => `Do odzyskania: ${amount}`,
    breakEven: (label: string) => `${label}: próg rentowności`,
    notWithin: (years: number) => `nie w ciągu ${years === 1 ? "1 roku" : `${years} lat`}`,
    immediately: "od razu",
    after: (d: string) => `za ${d}`,
    tableTitle: "Rok po roku, średnia cena",
    colYear: "Rok",
    colNative: "Natywny FLUX",
    colEarned: "Zarobiony FLUX",
    colPa: "Aktywa równoległe",
    colTotal: "FLUX łącznie",
    colPrice: "Cena na koniec roku",
    colNet: "Netto w danym roku",
    colTotalNet: "Netto łącznie",
  },

  next: {
    intro:
      "Ile czasu minie, zanim nagrody opłacą zabezpieczenie kolejnego węzła. Korzysta z Twoich węzłów i kosztów z Zarobków i ROI oraz ze zmiany wielkości sieci i średniej zmiany ceny z Prognoz.",
    saved: "Zaoszczędzony już FLUX",
    savedHint: "Wolny FLUX, który nie jest zablokowany jako zabezpieczenie.",
    sell: "Sprzedawaj nagrody na koszty utrzymania",
    sellHint: "Wyłącz, jeśli płacisz za hosting z innych dochodów — wtedy oszczędzasz wszystkie nagrody.",
    keepBuying: "Kupuj dalej",
    planLength: "Długość planu",
    yearsUnit: "lat",
    needInput: "Dodaj swoje węzły w zakładce Zarobki i ROI albo wpisz zaoszczędzony już FLUX.",
    priceNeeded: "Możesz też wyłączyć „Sprzedawaj nagrody na koszty utrzymania”, aby planować bez niej.",
    saving: (flux: N, sell: boolean) => (
      <>
        Obecnie odkładasz około {flux} miesięcznie{sell ? " po sprzedaży części nagród na koszty utrzymania" : ""}.
      </>
    ),
    nothingSaved:
      "Koszty utrzymania pochłaniają wszystkie nagrody, więc nic nie zostaje. Obniż koszty albo wyłącz sprzedaż nagród na ich pokrycie.",
    yourNext: "Twój kolejny węzeł",
    nextTier: (tier: string) => `Kolejny ${tier}`,
    notWithin20: "Nie w ciągu 20 lat",
    collateral: (amount: string) => `${amount} FLUX zabezpieczenia`,
    now: "Teraz",
    nowInline: "teraz",
    inDays: (n: number, inline: boolean) => `${inline ? "za" : "Za"} ${n} ${n === 1 ? "dzień" : "dni"}`,
    inDuration: (d: string, inline: boolean) => `${inline ? "za" : "Za"} ${d}`,
    planTitle: (tier: string) => `Jeśli dalej kupujesz węzły ${tier}`,
    notEnough: (tier: string, years: number) =>
      `W ciągu ${years === 1 ? "1 roku" : `${years} lat`} nie uzbiera się dość na ${tier}.`,
    summary: (years: number, _count: number, countN: N, tier: string, daily: N, first: string) => (
      <>
        Nowe węzły {tier} w ciągu {years === 1 ? "1 roku" : `${years} lat`}: {countN}. Na koniec zarabiają około {daily}{" "}
        dziennie. Pierwszy pojawi się {first}.
      </>
    ),
    colYear: "Rok",
    colAdded: "Dodane węzły",
    colNodes: "Twoje węzły na koniec roku",
    colPerDay: "FLUX dziennie",
    yearEnd: (date: string) => `do ${date}`,
    footnote:
      "Każdy nowy węzeł zarabia od miesiąca po zakupie i dodaje swój koszt utrzymania. Redukcje nagród, wielkość sieci i zmiana ceny są naliczane miesiąc po miesiącu. Sprzęt i uruchomienie nowych węzłów nie są uwzględnione.",
    paCounted:
      "Aktywa równoległe wliczają się do oszczędności, dopóki trwają. Zakłada to, że je odbierasz i zamieniasz na natywny FLUX na zabezpieczenie.",
  },

  lookup: {
    address: "Adres wypłat",
    lookingUp: "Wyszukiwanie…",
    lookUp: "Wyszukaj węzły",
    hint: "Adres, na który trafiają nagrody Twoich węzłów. Wyszukiwanie odczytuje tylko publiczne dane z blockchaina.",
    invalid: "Wpisz pełny adres wypłat Flux: 35 znaków zaczynających się od t1 lub t3.",
    tooMany: "Zbyt wiele wyszukiwań w krótkim czasie. Odczekaj minutę i spróbuj ponownie.",
    failed: "API sieci Flux nie odpowiedziało. Spróbuj ponownie za minutę.",
    noNodes:
      "Żaden węzeł nie wypłaca na ten adres. Sprawdź, czy to adres wypłat, a nie adres zabezpieczenia.",
    summary: (confirmed: N, dos: N | null, starting: N | null) => (
      <>
        Potwierdzone: {confirmed}
        {dos !== null && <>, na liście DOS: {dos}</>}
        {starting !== null && <>, uruchamiane: {starting}</>}
      </>
    ),
    dosExplain:
      "Węzły z listy DOS nie dostają wypłat, dopóki nie zostaną ponownie uruchomione. Zwykle przyczyną są błędne dane zabezpieczenia albo niezsynchronizowany daemon.",
    dosUnknown: "Nie udało się teraz sprawdzić listy DOS, więc widać tylko potwierdzone węzły.",
    nativePerDay: "Natywny FLUX dziennie",
    expectedPerDay: "Oczekiwane dziennie",
    paPerDay: "Aktywa równoległe dziennie",
    claimUntil: "Odbieraj przez Fusion, dopóki trwają",
    totalPerDay: "Łącznie dziennie",
    valuePerDay: "Wartość dziennie",
    rate: "Roczna stopa nagród",
    native: (pct: string) => `${pct} natywnie`,
    useNodes: "Użyj tych węzłów w kalkulatorze",
    lastDays: (n: number) => `Ostatnie ${n} dni, tylko natywny FLUX`,
    received: (flux: N, payouts: N, expected: N) => (
      <>
        Otrzymano {flux} w {payouts} wypłatach, wobec {expected} oczekiwanych
      </>
    ),
    historyNote:
      "Aktywa równoległe są wypłacane na innych blockchainach, więc nie da się ich tu sprawdzić. Wartość oczekiwana zakłada dzisiejszą liczbę węzłów i liczy każdy węzeł od jego potwierdzenia. Niedobór zwykle oznacza, że węzeł opuścił potwierdzenia albo był offline.",
    historyMissing: "Historia wypłat jest teraz niedostępna. Poniższe dane węzłów są aktualne.",
    onlyAttention: "Pokaż tylko węzły wymagające uwagi",
    colTier: "Poziom",
    colStatus: "Stan",
    colCollateral: "Zabezpieczenie",
    colQueue: "Miejsce w kolejce",
    colNext: "Następna wypłata",
    colLast: "Ostatnia wypłata",
    colPerDay: "Oczekiwane dziennie",
    onDos: "Na liście DOS",
    startNow: "Można uruchomić teraz",
    startIn: (when: string) => `Można uruchomić ${when}`,
    notPaid: "Bez wypłat",
    confirmed: "Potwierdzony",
    queuePos: (pos: string, of: string) => `${pos} z ${of}`,
    startingOne: (tier: string, when: string) =>
      `1 węzeł ${tier} pod tym adresem jest uruchamiany i musi zostać potwierdzony ${when}.`,
    startingMany: (n: number, parts: string, when: string) =>
      `Węzły uruchamiane pod tym adresem: ${n} (${parts}). Pierwszy musi zostać potwierdzony ${when}.`,
    updated: (when: string) => `Zaktualizowano ${when}. Adresy IP węzłów nigdy nie są pokazywane.`,
  },

  run: {
    intro: (checked: string) => `Czego potrzeba, aby samodzielnie uruchomić FluxNode, z linkami do oficjalnych poradników Flux. Wymagania zmieniają się wraz z aktualizacjami FluxOS; te sprawdzono: ${checked}.`,
    needTitle: "Czego potrzebujesz",
    collateral: "Zabezpieczenie",
    cpu: "Procesor",
    coresThreads: (cores: number, threads: number) =>
      `${cores} ${plural(cores, "rdzeń", "rdzenie", "rdzeni")} / ${threads} ${plural(threads, "wątek", "wątki", "wątków")}`,
    ram: "RAM",
    ssd: "SSD / NVMe",
    eps: "Wynik benchmarku (EPS)",
    bandwidth: "Przepustowość",
    disk: "Prędkość zapisu dysku",
    needNote: "Każdy węzeł musi przejść benchmark Flux, zanim dołączy do sieci, potrzebuje publicznego adresu IP i powinien pozostawać online (około 97% czasu).",
    officialSpecs: "Oficjalne wymagania",
    homeTitle: "W domu czy w centrum danych",
    homeArcane: "Węzły domowe muszą działać na ArcaneOS, bezpiecznym systemie Flux dla węzłów. Bez niego węzeł domowy przestaje dostawać nowe aplikacje i trafia na listę DOS.",
    homeHardware: "ArcaneOS wymaga komputera AMD64 (x86-64) z TPM 2.0 i UEFI. Większość nowych komputerów i mini PC ma jedno i drugie.",
    homeNetwork: "Router musi obsługiwać UPnP lub DMZ. W jednej sieci domowej może działać do 8 węzłów; przy więcej niż jednym potrzebne jest UPnP.",
    dataCenter: "Węzły w centrach danych i na VPS mogą nadal korzystać z klasycznej instalacji, ale aplikacje enterprise działają tylko na ArcaneOS, a niewielu dostawców VPS obsługuje Secure Boot, którego ArcaneOS wymaga w maszynie wirtualnej.",
    arcaneGuide: "Instalacja ArcaneOS",
    legacyGuide: "Instalacja klasyczna",
    walletTitle: "Portfel",
    sspTag: "Dla bezpieczeństwa",
    sspText: "Na węzły, zabezpieczenie i większe kwoty. Każdą transakcję trzeba zatwierdzić na dwóch Twoich urządzeniach: w rozszerzeniu przeglądarki i w aplikacji SSP Key na telefonie. Otwarty kod, audyt Halborn. Uruchamia węzły i odbiera aktywa równoległe.",
    zelcoreTag: "Na co dzień",
    zelcoreText: "Komputer, telefon i przeglądarka, ponad 80 blockchainów, wymiany i zakup kryptowalut w aplikacji. Również uruchamia węzły i odbiera aktywa równoległe.",
    guide2026: "Poradnik Flux: How to run a FluxNode in 2026",
    stepsTitle: "Kroki",
    step1: "Zdobądź zabezpieczenie: 1000, 12 500 lub 40 000 FLUX. Uwaga: „Datamine FLUX” to inna moneta.",
    step1Link: "Giełdy z FLUX",
    step2: "Wyślij dokładnie tę kwotę do SSP Wallet lub Zelcore jedną transakcją.",
    step3: "Zainstaluj węzeł: ArcaneOS w domu albo klasyczną instalację w centrum danych.",
    step4: "Uruchom węzeł z portfela. Musi zostać potwierdzony w ciągu około 2 godzin.",
    startSsp: "Uruchom przez SSP",
    startZelcore: "Uruchom przez Zelcore",
    step5: "Sprawdź go swoim adresem wypłat w zakładce Wyszukaj węzły.",
    openLookup: "Otwórz Wyszukaj węzły",
    hwTitle: "Pomysły na sprzęt do węzła domowego",
    budgetIntro: "To, ile zarabia węzeł, decyduje, ile wart jest jego sprzęt. Jeden węzeł na poziom, przez najbliższe 2 lata, przy dzisiejszej cenie i wielkości sieci:",
    budgetMonth: (m: string) => `${m} w tym miesiącu`,
    budgetNote: "Tyle najwyżej mogą kosztować sprzęt, prąd i hosting, aby węzeł zwrócił się w 2 lata. Roczna obniżka nagród i koniec aktywów równoległych (według Twoich ustawień) są już uwzględnione.",
    budgetNoPrice: "Pojawi się, gdy wczyta się cena FLUX.",
    hwIntro: "Zacznij od tego, co już masz: stary komputer lub laptop z TPM 2.0 nic nie kosztuje. Większość operatorów używa używanych lub odnowionych mini PC albo jednej maszyny z kilkoma węzłami w Proxmox, a pieniądze wydaje na RAM, dyski i UPS.",
    picks: {
      cumulus: { label: "Cumulus: używany lub odnowiony mini PC", note: "4+ wątki, 8 GB+ RAM, SSD 256 GB+. Popularne są Beelink, GMKtec i Lenovo ThinkCentre Tiny." },
      nimbus: { label: "Nimbus: mini PC z 8 wątkami i 32 GB", note: "Mini PC z Ryzen 7 serii 5000 to popularny wybór." },
      stratus: { label: "Stratus: 16 wątków i 64 GB", note: "Mini PC z Ryzen 9 lub używana stacja robocza, zwykle w Proxmox." },
      multi: { label: "Kilka węzłów: używana stacja robocza lub serwer", note: "Dużo RAM i rdzeni, każdy węzeł jako VM w Proxmox. Do 8 węzłów na jeden domowy adres IP." },
      ram: { label: "Rozbudowa RAM (DDR4 SO-DIMM)", note: "Najpierw sprawdź, jakiego typu RAM wymaga Twój komputer." },
      nvme: { label: "Dysk NVMe", note: "1 TB wystarczy na Stratus. Sprawdź prędkość zapisu: 180 MB/s, a dla Stratus 400 MB/s." },
      ups: { label: "Zasilacz awaryjny (UPS)", note: "Krótka przerwa w zasilaniu może wyłączyć węzeł na tyle długo, że opuści potwierdzenia." },
      nic: { label: "Karta sieciowa Intel 2,5 GbE", note: "Do pfSense lub OPNsense przed kilkoma węzłami." },
    },
    pricesNote: "Ceny RAM i dysków SSD mocno wzrosły. Przed zakupem porównaj je z budżetem powyżej.",
    noHwTitle: "Nie masz sprzętu?",
    titanText: "Titan staking: stakuj od 50 FLUX, a węzły prowadzi Flux. FLUX jest zablokowany na 3, 6 lub 12 miesięcy i nie ma nagród za kopanie aktywów równoległych.",
    titanLink: "Poradnik Titan",
    managedText: "Zarządzany FluxNode: dostawca hostuje i prowadzi Twój węzeł, a zabezpieczenie zostaje w Twoim portfelu. Najpierw sprawdź opłaty: mogą przekraczać zarobki małego węzła. Możesz je wpisać jako koszty w zakładce Zarobki i ROI.",
    managedLink: "Zarządzany FluxNode",
    fluxHubText: "FluxHub, prowadzony przez członków społeczności: osoby z zabezpieczeniem, ale bez sprzętu, dostają węzeł hostowany przez operatorów z wolnymi maszynami. Na początku można go wypróbować za darmo.",
    healthTitle: "Utrzymanie węzła",
    healthText: "Węzeł zarabia tylko wtedy, gdy jest potwierdzony. Jeśli opuści potwierdzenia, trafia na listę DOS i nic nie zarabia, dopóki go ponownie nie uruchomisz. Zwykle przyczyną są błędne dane zabezpieczenia lub niezsynchronizowany daemon.",
    diagnosing: "Diagnozowanie problemów",
    unlock: "Odblokowanie zabezpieczenia",
    disclosure: "Niektóre linki na tej stronie są linkami partnerskimi: jeśli kupisz przez nie, ta strona może otrzymać prowizję bez dodatkowych kosztów dla Ciebie. Nigdy nie wpływają na obliczenia.",
    tableLink: "Czego potrzeba, aby go uruchomić?",
  },

  privacy: {
    button: "Prywatność",
    title: "Prywatność",
    close: "Zamknij",
    intro: "Ten kalkulator nie ma kont i nie używa plików cookie.",
    storage: "Twoje ustawienia są zapisane w adresie strony, a wybrany motyw i język w Twojej przeglądarce. Nic nie jest do nas wysyłane.",
    analytics: "Odwiedziny są liczone przez Cloudflare Web Analytics, które nie używa plików cookie i nie śledzi Cię na innych stronach.",
    lookup: "Wyszukiwanie węzłów wysyła wpisany adres do API sieci Flux, aby znaleźć jego węzły. Ta strona go nie przechowuje ani nie zapisuje w logach.",
    logs: "Logi serwera zapisują, które strony są otwierane, ale nie adresy IP ani wyszukiwane adresy.",
    affiliate: "Niektóre linki do Amazon zawierają identyfikator partnerski. Jeśli w niego klikniesz, Amazon może ustawić własne pliki cookie zgodnie ze swoją polityką prywatności. Ta strona nie udostępnia cen ani danych osobowych.",
    contact: "Pytania: zgłoś issue na GitHubie (link poniżej).",
  },

  how: {
    button: "Jak to jest liczone",
    close: "Zamknij",
    body: (v: HowValues) => (
      <>
        <H>Skąd biorą się liczby</H>
        <p>
          Wysokość bloku, aktywne węzły na każdym poziomie oraz listy DOS i uruchamianych węzłów pochodzą z API sieci Flux,
          odświeżanego mniej więcej co 90 sekund. Cena FLUX w dolarach pochodzi z eksploratora Flux i jest przeliczana na inne waluty po dziennych kursach Europejskiego Banku Centralnego (przez Frankfurter), a zapasowym źródłem jest CoinGecko. Jest odświeżana co 20 minut. Cała reszta
          jest z nich wyliczana.
        </p>

        <H>Bloki i wypłaty</H>
        <p>
          Blok powstaje co 30 sekund, czyli {v.blocksPerDay} dziennie. Każdy blok wypłaca nagrodę jednemu węzłowi z każdego
          poziomu, po kolei w kolejce. Udział węzła zależy tylko od liczby aktywnych węzłów na jego poziomie.
        </p>
        <Formula>FLUX na węzeł dziennie = nagroda poziomu za blok × {v.blocksPerDay} ÷ aktywne węzły na poziomie</Formula>
        {v.live && (
          <Example>
            Dziś dla Stratus: {v.stratusReward} × {v.blocksPerDay} ÷ {v.stratusNodes} = {v.stratusDaily} FLUX dziennie,
            wypłacane mniej więcej co {v.stratusEvery} ({v.stratusNodes} węzłów × 30 sekund).
          </Example>
        )}

        <H>Harmonogram nagród</H>
        <p>
          Od bloku {v.startHeight} łączna nagroda wynosiła 14 FLUX za blok. Spada o 10% co {v.interval} bloków (365 dni).
          Jest dzielona między poziomy w stałych proporcjach: Cumulus 1/14, Nimbus 3,5/14, Stratus 9/14 i 0,5/14 dla Flux
          Foundation. Zgadza się to z danymi samego blockchaina na każdej sprawdzonej wysokości.
        </p>
        {v.live && (
          <Example>
            Obecnie: {v.totalReward} FLUX za blok. Następna obniżka o 10% przy bloku {v.nextCut}.
          </Example>
        )}

        <H>Miesiące i lata</H>
        <p>
          Miesiąc to średni miesiąc kalendarzowy, 30,44 dnia ({v.blocksPerMonth} bloków), więc 12 miesięcy daje dokładnie
          rok o długości 365,25 dnia ({v.blocksPerYear} bloków). Gdy okres obejmuje obniżkę, bloki przed nią płacą starą
          nagrodę, a bloki po niej nową.
        </p>

        <H>Roczna stopa nagród</H>
        <Formula>Roczna stopa nagród = FLUX zarobiony w najbliższych 12 miesiącach ÷ zabezpieczenie</Formula>
        <p>
          Uwzględnia każdą obniżkę w tych 12 miesiącach i nie zakłada procentu składanego. Zabezpieczenie wynosi{" "}
          {v.cumulus} FLUX dla Cumulus, {v.nimbus} dla Nimbus i {v.stratus} dla Stratus.
        </p>
        {v.live && <Example>Dziś dla Stratus, tylko natywny FLUX: {v.stratusApr}.</Example>}

        <H>Aktywa równoległe</H>
        <p>
          Każde aktywne aktywo równoległe wypłaca dodatkowo {v.paShare} każdej wypłaty, w FLUX na innym blockchainie. Przy{" "}
          {v.paCount} aktywnych daje to {v.paTotal} ponad nagrody natywne. Są liczone do ustawionej przez Ciebie daty
          końca (domyślnie {v.paEnd}, kiedy według planu Flux kończą się nagrody za kopanie aktywów równoległych) i według
          ustawionej wartości względem natywnego FLUX. Nie są wypłacane automatycznie: odbiera się je przez Fusion w SSP
          Wallet lub Zelcore, a opłata Fusion, potrącana z odbioru, nie jest uwzględniona.
        </p>

        <H>Zarobki, koszty i próg rentowności</H>
        <Formula>Netto miesięcznie = (natywny FLUX + aktywa równoległe) × cena − koszty utrzymania</Formula>
        <Formula>
          Próg rentowności = pierwszy miesiąc, w którym łączny zysk netto ≥ koszt uruchomienia (+ zabezpieczenie, jeśli
          wliczone)
        </Formula>
        <p>
          Zabezpieczenie jest wyceniane po cenie zakupu albo po dzisiejszej. Próg rentowności używa
          dzisiejszej ceny i wielkości sieci, a nagrody nadal spadają przy każdej rocznej obniżce.
        </p>

        <H>Prognozy</H>
        <p>
          Liczone miesiąc po miesiącu. Zmiana wielkości sieci i ceny kumuluje się co miesiąc na podstawie wybranych stóp
          rocznych, mierzona w połowie każdego miesiąca. Rosnąca sieć oznacza rzadsze wypłaty dla każdego węzła. Ceny
          niska, średnia i wysoka to Twoje założenia, a nie prognozy.
        </p>

        <H>Kolejny węzeł</H>
        <Formula>Oszczędności miesięcznie = nagrody (+ aktywa równoległe) − FLUX sprzedany na koszty utrzymania</Formula>
        <p>
          Gdy oszczędności osiągną zabezpieczenie danego poziomu, kupowany jest węzeł. Jeśli dalej reinwestujesz, nowy węzeł
          zarabia od następnego miesiąca i dodaje swój koszt utrzymania. Sprzęt i uruchomienie nowych węzłów nie są
          uwzględnione.
        </p>

        <H>Wyszukiwanie węzłów</H>
        <p>
          Węzły są wyszukiwane po dokładnym adresie wypłat. Następna wypłata to miejsce węzła w kolejce jego poziomu × 30
          sekund. „Otrzymano” to wypłaty natywnego FLUX z nagród za bloki z ostatnich 30 dni, przypisane do poziomu według
          kwoty. „Oczekiwane” to kwota, jaką obecne węzły adresu powinny były zarobić w tym samym okresie przy dzisiejszej
          wielkości sieci, więc wychodzi za wysoko lub za nisko, jeśli w ciągu miesiąca dodano lub usunięto węzły. Węzły z
          listy DOS i uruchamiane pochodzą z list samego Flux.
        </p>

        <H>Czego nie uwzględniono</H>
        <ul className="list-disc space-y-1 pl-5">
          <li>Progressive Node Rewards (udział w przychodach FluxCloud). Nie opublikowano żadnego wzoru.</li>
          <li>Opłat za odbiór aktywów równoległych ani podatków.</li>
          <li>Przestojów. Nagrody zakładają, że Twoje węzły pozostają potwierdzone.</li>
        </ul>
        <p className="pt-2 text-sm text-muted">
          Pełny kod źródłowy jest na GitHubie, razem z testami, które porównują harmonogram nagród z blockchainem na żywo.
        </p>
      </>
    ),
  },
};
