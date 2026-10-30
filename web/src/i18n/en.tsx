/* English. The other catalogs must match this shape (type Messages). */
import { Example, Formula, H, type FormatWords, type HowValues, type N } from "./parts.tsx";

const fmt: FormatWords = {
  now: "now",
  immediately: "immediately",
  days: (n) => `${n}d`,
  hours: (n) => `${n}h`,
  minutes: (n) => `${n}m`,
  seconds: (n) => `${n}s`,
  years: (n) => `${n} ${n === 1 ? "year" : "years"}`,
  months: (n) => `${n} ${n === 1 ? "month" : "months"}`,
  and: " ",
  future: (d) => `in ${d}`,
  past: (d) => `${d} ago`,
};

export const en = {
  fmt,

  header: {
    appName: "Flux Node Calculator",
    language: "Language",
    theme: "Theme",
    themes: { system: "System", light: "Light", dark: "Dark" },
    currency: "Currency",
    title: "What will your FluxNodes earn?",
    intro:
      "Rewards are set by the chain: every block pays one node in each tier, and the block reward drops 10% about once a year. Estimates use live network data.",
    blockHeight: "Block height",
    fluxPrice: "FLUX price",
    nextCut: "Next 10% cut",
    atBlock: "At block",
    stale: (when: string) => `Showing data from ${when}; the latest refresh didn't respond.`,
    caption: "Total FLUX per block, by reduction period. The marker is today.",
    staircaseAria: (values: string, current: string) =>
      `Block reward schedule: ${values} FLUX per block in consecutive reduction periods. You are in the period paying ${current} FLUX.`,
  },

  app: {
    tabs: { earnings: "Earnings and ROI", projections: "Projections", next: "Next node", lookup: "Node lookup", run: "Run a node" },
    tablist: "Calculator sections",
    loading: "Loading",
    networkError: "Can't reach the Flux network right now. Retrying.",
    priceError: "The FLUX price isn't available right now, so currency amounts are hidden. Retrying every few minutes.",
    priceNeeded: "This needs the FLUX price, which isn't available right now. It will show as soon as the price loads.",
    runsOnFlux: "Runs on Flux",
    builtBy: (who: N) => <>Built by {who}</>,
    source: "Source on GitHub",
    issue: "Report an issue or suggest a feature",
    translation: "Suggest a better translation",
    disclaimer:
      "Independent community tool, not affiliated with Flux. Estimates only, not financial advice. Progressive Node Rewards (FluxCloud revenue share) aren't included because no formula has been published. Rewards assume your nodes stay confirmed.",
    credits: (source: N) => (
      <>
        Price data: {source}. Network data from the Flux API. Open source under the MIT license.
      </>
    ),
  },

  contribute: {
    title: "Help keep this calculator running",
    body: "Contributions in FLUX go toward development and hosting costs. Thank you for supporting it.",
    copy: "Copy address",
    copied: "Copied",
    copiedSr: "Address copied to clipboard",
  },

  network: {
    title: "Tiers today",
    live: "Live from the Flux network.",
    tier: "Tier",
    collateral: "Collateral",
    enabled: "Enabled nodes",
    perBlock: "FLUX per block",
    perDay: "Per node per day",
    withPa: "With parallel assets",
    paidEvery: "Paid about every",
    rate: "Yearly reward rate",
    native: (pct: string) => `${pct} native`,
    footnote: (paCount: number | null) =>
      "Yearly reward rate is FLUX earned over the next 12 months as a share of collateral, including the next reduction" +
      (paCount === null
        ? "."
        : `, with parallel assets until their end date (${paCount} × 10% of each payout, paid on other chains, must be claimed). The smaller figure is native FLUX alone.`),
  },

  pa: {
    note: (count: number, share: string, end: string) => (
      <>
        Includes parallel asset rewards: FLUX paid on {count} other chains, each adding {share} of every payout, until{" "}
        {end}. <strong className="font-medium text-ink">They aren't paid automatically.</strong> You claim them with Fusion in SSP Wallet (Nodes →
        Parallel Assets Reward) or Zelcore (Apps → Fusion → Parallel Mining Claim). The fee comes out of the claim, so
        claiming less often saves fees.
      </>
    ),
    warning: (
      <>
        <strong className="font-medium text-loss">PA mining rewards end around 1 July 2027</strong> (block 3,787,502), per Flux's roadmap. From
        March 2027 the retiring chains become one-way, and in August 2027 unclaimed balances go to the Flux Foundation, so
        claim before then.
      </>
    ),
    include: "Include parallel asset rewards",
    includeHint: "Extra FLUX paid on other chains while they last. Must be claimed.",
    active: "Active assets",
    value: "Value vs. native FLUX",
    endDate: "Projected end date",
    defaults: (date: string) => `Defaults to ${date}, block 3,787,502 on Flux's roadmap.`,
    claimBy: "Claim before August 2027.",
    reset: "Reset",
  },

  earnings: {
    intro: "Enter how many nodes you run and what each one costs you per month. The costs filled in are examples.",
    nodes: "Nodes",
    costPerNode: "Cost per node / month",
    setupCost: "One-time setup cost",
    setupHint: "Hardware or anything else you pay once.",
    collateralPrice: "Price you paid per FLUX for collateral",
    usingToday: "Using today's price.",
    noPriceYet: "Today's price isn't available yet. Enter the price you paid, or wait for it to load.",
    useToday: "Use today's price",
    countCollateral: "Count the collateral purchase in break-even",
    countCollateralHint: "Collateral stays yours and can be unlocked, but buying it is money spent.",
    compare: "Compare with a second setup",
    setupA: "Setup A",
    setupB: "Setup B",
    addNode: "Add at least one node to see earnings.",
    nativePerMonth: "Native FLUX per month",
    fluxPerDay: "FLUX per day",
    paPerMonth: "Parallel assets per month",
    fluxPerMonth: "FLUX per month",
    toClaim: "To be claimed",
    allFlux12: "All FLUX, next 12 months",
    flux12: "FLUX next 12 months",
    revenue: "Revenue per month",
    costs: "Costs per month",
    net: "Net per month",
    collateralLocked: "Collateral locked",
    rate: "Yearly reward rate",
    ratePa: "Yearly reward rate, incl. parallel assets",
    net12: "Net next 12 months",
    breakEvenTitle: "Break-even at today's price and network size",
    profitableNow: "Profitable from the first month",
    notProfitable: "Not profitable at these costs",
    after: (d: string) => `After ${d}`,
    notWithin20: "Not within 20 years",
    recovering: (amount: string, withCollateral: boolean, pa: boolean) =>
      `Recovering ${amount}${withCollateral ? " including collateral" : " in setup costs"}. Rewards fall 10% at each yearly reduction${pa ? " and parallel assets stop at their end date" : ""}, so later months earn less.`,
  },

  projections: {
    needNodes: "Add at least one node on the Earnings and ROI tab to see a projection.",
    intro: "Uses the nodes and costs from the Earnings and ROI tab. Each year compounds the changes below.",
    years: "Years",
    growth: "Network size change per year",
    growthHint: "More nodes in a tier means each one is paid less often.",
    priceChange: "FLUX price change per year",
    low: "Low",
    middle: "Middle",
    high: "High",
    startFrom: (price: string) => `Starting from ${price}. These are your assumptions, not forecasts.`,
    chartTitle: "Cumulative profit",
    chartIntro: (years: number, cuts: number, pa: boolean) =>
      `Revenue minus running costs over ${years} ${years === 1 ? "year" : "years"}, including ${cuts} reward ${cuts === 1 ? "reduction" : "reductions"}${pa ? ", with parallel assets until their end date" : ""}.`,
    chartAria: "Cumulative profit by month for three price scenarios",
    series: (label: string, pct: number) => `${label} (${pct}%/yr)`,
    month: (n: number) => `Month ${n}`,
    year: (n: number) => `Year ${n}`,
    toRecover: (amount: string) => `To recover: ${amount}`,
    breakEven: (label: string) => `${label}: break-even`,
    notWithin: (years: number) => `not within ${years} years`,
    immediately: "immediately",
    after: (d: string) => `after ${d}`,
    tableTitle: "Year by year, middle price",
    colYear: "Year",
    colNative: "Native FLUX",
    colEarned: "FLUX earned",
    colPa: "Parallel assets",
    colTotal: "Total FLUX",
    colPrice: "Price at year end",
    colNet: "Net that year",
    colTotalNet: "Total net",
  },

  next: {
    intro:
      "How long until your rewards pay for another node's collateral. Uses your nodes and costs from Earnings and ROI, and the network size and middle price change from Projections.",
    saved: "FLUX you've already saved",
    savedHint: "Spare FLUX not already locked as collateral.",
    sell: "Sell rewards to pay running costs",
    sellHint: "Turn off if you pay hosting from other income, so all rewards are saved.",
    keepBuying: "Keep buying",
    planLength: "Plan length",
    yearsUnit: "years",
    needInput: "Add your nodes on the Earnings and ROI tab, or enter FLUX you've already saved.",
    priceNeeded: "Or turn off “Sell rewards to pay running costs” to plan without it.",
    saving: (flux: N, sell: boolean) => (
      <>
        You'd save about {flux} a month right now{sell ? " after selling enough to pay running costs" : ""}.
      </>
    ),
    nothingSaved:
      "Running costs use up all of your rewards, so nothing is saved. Lower the costs or turn off selling rewards to pay them.",
    yourNext: "Your next node",
    nextTier: (tier: string) => `Next ${tier}`,
    notWithin20: "Not within 20 years",
    collateral: (amount: string) => `${amount} FLUX collateral`,
    now: "Now",
    nowInline: "now",
    inDays: (n: number, inline: boolean) => `${inline ? "in" : "In"} ${n} ${n === 1 ? "day" : "days"}`,
    inDuration: (d: string, inline: boolean) => `${inline ? "in" : "In"} ${d}`,
    planTitle: (tier: string) => `If you keep buying ${tier} nodes`,
    notEnough: (tier: string, years: number) =>
      `Not enough is saved for a ${tier} within ${years} ${years === 1 ? "year" : "years"}.`,
    summary: (years: number, count: number, countN: N, tier: string, daily: N, first: string) => (
      <>
        In {years} {years === 1 ? "year" : "years"} you'd add {countN} {tier} {count === 1 ? "node" : "nodes"}, earning
        about {daily} a day at the end. The first one comes {first}.
      </>
    ),
    colYear: "Year",
    colAdded: "Nodes added",
    colNodes: "Your nodes at year end",
    colPerDay: "FLUX per day",
    yearEnd: (date: string) => `to ${date}`,
    footnote:
      "Each new node earns from the month after it's bought and adds its running cost. Reward reductions, network size and price change are applied month by month. Hardware and setup for new nodes aren't included.",
    paCounted:
      "Parallel assets are counted toward savings while they last. That assumes you claim them and convert them to native FLUX for collateral.",
  },

  lookup: {
    address: "Payment address",
    lookingUp: "Looking up…",
    lookUp: "Look up nodes",
    hint: "The address your node rewards are paid to. Lookups only read public chain data.",
    invalid: "Enter a full Flux payment address: 35 characters starting with t1 or t3.",
    tooMany: "Too many lookups in a short time. Wait a minute and try again.",
    failed: "The Flux network API didn't respond. Try again in a minute.",
    noNodes: "No nodes pay to this address. Check that it's the payment address, not the collateral address.",
    summary: (confirmed: N, dos: N | null, starting: N | null) => (
      <>
        {confirmed} confirmed
        {dos !== null && <>, {dos} on the DOS list</>}
        {starting !== null && <>, {starting} starting</>}
      </>
    ),
    dosExplain:
      "Nodes on the DOS list aren't paid until they're started again. This is usually caused by incorrect collateral information or the daemon not being synced.",
    dosUnknown: "The DOS list couldn't be checked right now, so only confirmed nodes are shown.",
    nativePerDay: "Native FLUX per day",
    expectedPerDay: "Expected per day",
    paPerDay: "Parallel assets per day",
    claimUntil: "Claim with Fusion, until they end",
    totalPerDay: "Total per day",
    valuePerDay: "Value per day",
    rate: "Yearly reward rate",
    native: (pct: string) => `${pct} native`,
    useNodes: "Use these nodes in the calculator",
    lastDays: (n: number) => `Last ${n} days, native FLUX only`,
    received: (flux: N, payouts: N, expected: N) => (
      <>
        {flux} received across {payouts} payouts, against {expected} expected
      </>
    ),
    historyNote:
      "Parallel assets are paid on other chains, so they can't be checked here. Expected assumes today's node counts and counts each node from when it was confirmed. A shortfall usually means a node missed confirmations or was offline.",
    historyMissing: "Payout history isn't available right now. Node details below are current.",
    onlyAttention: "Show only nodes that need attention",
    colTier: "Tier",
    colStatus: "Status",
    colCollateral: "Collateral",
    colQueue: "Queue position",
    colNext: "Next payout",
    colLast: "Last paid",
    colPerDay: "Expected per day",
    onDos: "On DOS list",
    startNow: "Can be started now",
    startIn: (when: string) => `Can be started ${when}`,
    notPaid: "Not being paid",
    confirmed: "Confirmed",
    queuePos: (pos: string, of: string) => `${pos} of ${of}`,
    startingOne: (tier: string, when: string) => `1 ${tier} node at this address is starting and must confirm ${when}.`,
    startingMany: (n: number, parts: string, when: string) =>
      `${n} nodes at this address are starting (${parts}). The first must confirm ${when}.`,
    updated: (when: string) => `Updated ${when}. Node IP addresses are never shown.`,
  },

  run: {
    intro: (checked: string) =>
      `What it takes to run a FluxNode yourself, with links to Flux's official guides. Requirements change with FluxOS updates; these were checked in ${checked}.`,
    needTitle: "What you need",
    collateral: "Collateral",
    cpu: "CPU",
    coresThreads: (cores: number, threads: number) => `${cores} cores / ${threads} threads`,
    ram: "RAM",
    ssd: "SSD / NVMe",
    eps: "Benchmark score (EPS)",
    bandwidth: "Bandwidth",
    disk: "Disk write speed",
    needNote:
      "Every node has to pass Flux's benchmark before it joins, needs a public IP address, and should stay online (about 97% uptime).",
    officialSpecs: "Official requirements",
    homeTitle: "Home or data center",
    homeArcane:
      "Home nodes must run ArcaneOS, Flux's secure node operating system. Without it, a home node stops getting new apps and ends up on the DOS list.",
    homeHardware: "ArcaneOS needs an AMD64 (x86-64) machine with TPM 2.0 and UEFI. Most modern PCs and mini PCs have both.",
    homeNetwork:
      "Your router must support UPnP or DMZ. Up to 8 nodes can share one home network; more than one needs UPnP.",
    dataCenter:
      "Data center and VPS nodes can still use the legacy setup, but enterprise apps only run on ArcaneOS, and few VPS providers support the Secure Boot ArcaneOS needs in a virtual machine.",
    arcaneGuide: "ArcaneOS install guide",
    legacyGuide: "Legacy setup guide",
    walletTitle: "Wallet",
    sspTag: "For security",
    sspText:
      "For nodes, collateral and larger amounts. Every transaction needs approval on two of your devices: the browser extension and the SSP Key phone app. Open source and audited by Halborn. Starts nodes and claims parallel assets.",
    zelcoreTag: "For everyday use",
    zelcoreText:
      "Desktop, phone and browser, with 80+ chains, swaps and buying crypto in the app. Also starts nodes and claims parallel assets.",
    guide2026: "Flux's guide: How to run a FluxNode in 2026",
    stepsTitle: "Steps",
    step1: "Get the collateral: 1,000, 12,500 or 40,000 FLUX. Careful: “Datamine FLUX” is a different coin.",
    step1Link: "Exchanges that list FLUX",
    step2: "Send exactly that amount to your SSP Wallet or Zelcore in one transaction.",
    step3: "Install the node: ArcaneOS for a home node, or the legacy setup in a data center.",
    step4: "Start the node from your wallet. It has to confirm within about 2 hours.",
    startSsp: "Start via SSP",
    startZelcore: "Start via Zelcore",
    step5: "Check it with your payment address in Node lookup.",
    openLookup: "Open Node lookup",
    hwTitle: "Hardware ideas for a home node",
    budgetIntro: "What a node earns decides what its hardware is worth. One node per tier, over the next 2 years at today's price and network size:",
    budgetMonth: (m: string) => `${m} this month`,
    budgetNote: "That's the most hardware, power and hosting can cost for the node to pay for itself in 2 years. It already counts the yearly reward cut and parallel assets ending (per your settings).",
    budgetNoPrice: "Shown once the FLUX price loads.",
    hwIntro: "Start with what you already own: an old desktop or laptop with TPM 2.0 costs nothing. Most operators run used or renewed mini PCs, or one machine with several nodes in Proxmox, and spend their money on RAM, storage and a UPS.",
    picks: {
      cumulus: { label: "Cumulus: used or renewed mini PC", note: "4+ threads, 8 GB+ RAM, 256 GB+ SSD. Beelink, GMKtec and Lenovo ThinkCentre Tiny are common picks." },
      nimbus: { label: "Nimbus: mini PC with 8 threads and 32 GB", note: "Ryzen 7 5000-series mini PCs are a popular fit." },
      stratus: { label: "Stratus: 16 threads and 64 GB", note: "A Ryzen 9 mini PC or a used workstation, usually run in Proxmox." },
      multi: { label: "Several nodes: used workstation or server", note: "Lots of RAM and cores, with each node as a Proxmox VM. Up to 8 nodes per home IP." },
      ram: { label: "RAM upgrade (DDR4 SO-DIMM)", note: "Check which RAM type your machine takes first." },
      nvme: { label: "NVMe SSD", note: "1 TB covers a Stratus. Check the write speed: 180 MB/s, or 400 MB/s for Stratus." },
      ups: { label: "UPS battery backup", note: "A short power cut can keep a node offline long enough to miss confirmations." },
      nic: { label: "Intel 2.5 GbE network card", note: "For pfSense or OPNsense in front of several nodes." },
    },
    pricesNote: "RAM and SSD prices have risen sharply. Compare with the budget above before you buy.",
    noHwTitle: "No hardware?",
    titanText:
      "Titan staking: stake from 50 FLUX and Flux runs the nodes. Your FLUX is locked for 3, 6 or 12 months, and there are no parallel-asset mining rewards.",
    titanLink: "Titan guide",
    managedText:
      "Managed FluxNode service: a provider hosts and runs your node, and the collateral stays in your wallet. Check the fees first: they can be more than a small node earns. You can enter them as running costs on the Earnings tab.",
    managedLink: "Managed FluxNode service",
    fluxHubText: "FluxHub, run by community members: people with collateral but no hardware get a node hosted by operators with spare machines. You can try it free at first.",
    healthTitle: "Keeping it healthy",
    healthText:
      "A node is only paid while it's confirmed. If it misses confirmations it lands on the DOS list and earns nothing until you start it again. The usual causes are wrong collateral details or a daemon that isn't synced.",
    diagnosing: "Diagnosing issues",
    unlock: "Unlocking your collateral",
    disclosure:
      "Some links on this page are affiliate links: if you buy through them, this site may earn a commission at no extra cost to you. They never affect the calculations.",
    amazonNote: "As an Amazon Associate, this site earns from qualifying purchases.",
    tableLink: "What does it take to run one?",
  },

  how: {
    button: "How the math works",
    close: "Close",
    body: (v: HowValues) => (
      <>
        <H>Where the numbers come from</H>
        <p>
          Block height, enabled nodes per tier, and the DOS and start lists come from the Flux network API, refreshed about
          every 90 seconds. The FLUX price in US dollars comes from the Flux explorer and is converted to other currencies with the European Central Bank's daily exchange rates (via Frankfurter), with CoinGecko as a backup. It's refreshed every 20 minutes. Everything else is calculated
          from those.
        </p>

        <H>Blocks and payouts</H>
        <p>
          A block is made every 30 seconds, so {v.blocksPerDay} a day. Every block pays one node in each tier, taking turns
          in a queue. A node's share depends only on how many enabled nodes are in its tier.
        </p>
        <Formula>FLUX per node per day = tier reward per block × {v.blocksPerDay} ÷ enabled nodes in the tier</Formula>
        {v.live && (
          <Example>
            Today for Stratus: {v.stratusReward} × {v.blocksPerDay} ÷ {v.stratusNodes} = {v.stratusDaily} FLUX a day,
            paid about every {v.stratusEvery} ({v.stratusNodes} nodes × 30 seconds).
          </Example>
        )}

        <H>The reward schedule</H>
        <p>
          The total reward was 14 FLUX per block from block {v.startHeight}. It drops 10% every {v.interval} blocks (365
          days). It's split between tiers in fixed shares: Cumulus 1/14, Nimbus 3.5/14, Stratus 9/14, and 0.5/14 to the
          Flux Foundation. These match the chain's own figures at every height we checked.
        </p>
        {v.live && (
          <Example>
            Right now: {v.totalReward} FLUX a block. Next 10% cut at block {v.nextCut}.
          </Example>
        )}

        <H>Months and years</H>
        <p>
          A month is the average calendar month, 30.44 days ({v.blocksPerMonth} blocks), so 12 months make exactly one
          year of 365.25 days ({v.blocksPerYear} blocks). Whenever a period crosses a reward cut, blocks before the cut pay
          the old reward and blocks after pay the new one.
        </p>

        <H>Yearly reward rate</H>
        <Formula>Yearly reward rate = FLUX earned over the next 12 months ÷ collateral</Formula>
        <p>
          It includes any reward cut in those 12 months and doesn't compound. Collateral is {v.cumulus} FLUX for Cumulus,{" "}
          {v.nimbus} for Nimbus and {v.stratus} for Stratus.
        </p>
        {v.live && <Example>Today for Stratus, native FLUX only: {v.stratusApr}.</Example>}

        <H>Parallel assets</H>
        <p>
          Each active parallel asset pays an extra {v.paShare} of every payout, in FLUX on another chain. With{" "}
          {v.paCount} active, that's {v.paTotal} on top of native rewards. They're counted until the end date you set
          (default {v.paEnd}, when PA mining rewards end on Flux's roadmap) and at the value you set relative to native
          FLUX. They aren't paid automatically: you claim them with Fusion in SSP Wallet or Zelcore, and the Fusion fee,
          taken from the claim, isn't included.
        </p>

        <H>Earnings, costs and break-even</H>
        <Formula>Net per month = (native FLUX + parallel assets) × price − running costs</Formula>
        <Formula>Break-even = first month where total net profit ≥ setup cost (+ collateral, if counted)</Formula>
        <p>
          Collateral is valued at the price you paid for it, or today's price. Break-even uses today's price and network
          size, and the rewards still fall with each yearly cut.
        </p>

        <H>Projections</H>
        <p>
          Worked out month by month. Network size and price change compound monthly from the yearly rates you choose,
          measured at the middle of each month. A growing network means each node is paid less often. The low, middle and
          high price figures are your assumptions, not forecasts.
        </p>

        <H>Next node</H>
        <Formula>Saved per month = rewards (+ parallel assets) − FLUX sold to pay running costs</Formula>
        <p>
          When savings reach a tier's collateral, a node is bought. If you keep reinvesting, the new node earns from the
          following month and adds its running cost. Hardware and setup for new nodes aren't included.
        </p>

        <H>Node lookup</H>
        <p>
          Nodes are found by exact payment address. Next payout is the node's place in its tier's queue × 30 seconds.
          "Received" is the last 30 days of native FLUX payouts from block rewards, matched by amount to a tier.
          "Expected" is what the address's current nodes should have earned over the same period at today's network size,
          so it reads high or low if nodes were added or removed during the month. DOS and starting nodes come from Flux's
          own lists.
        </p>

        <H>Not included</H>
        <ul className="list-disc space-y-1 pl-5">
          <li>Progressive Node Rewards (FluxCloud revenue share). No formula has been published.</li>
          <li>Parallel-asset claim fees, and taxes.</li>
          <li>Downtime. Rewards assume your nodes stay confirmed.</li>
        </ul>
        <p className="pt-2 text-sm text-muted">
          The full source is on GitHub, including tests that check the reward schedule against the live chain.
        </p>
      </>
    ),
  },
};

export type Messages = typeof en;
