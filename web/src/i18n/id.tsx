/* Bahasa Indonesia. */
import type { Messages } from "./en.tsx";
import { Example, Formula, H, type FormatWords, type HowValues, type N } from "./parts.tsx";

const fmt: FormatWords = {
  now: "sekarang",
  immediately: "segera",
  days: (n) => `${n} hr`,
  hours: (n) => `${n} jam`,
  minutes: (n) => `${n} mnt`,
  seconds: (n) => `${n} dtk`,
  years: (n) => `${n} tahun`,
  months: (n) => `${n} bulan`,
  and: " dan ",
  future: (d) => `dalam ${d}`,
  past: (d) => `${d} yang lalu`,
};

export const id: Messages = {
  fmt,

  header: {
    appName: "Flux Node Calculator",
    language: "Bahasa",
    theme: "Tema",
    themes: { system: "Sistem", light: "Terang", dark: "Gelap" },
    currency: "Mata Uang",
    title: "Berapa penghasilan FluxNodes Anda?",
    intro:
      "Hadiah ditentukan oleh chain: setiap blok membayar satu node di setiap tier, dan hadiah blok turun 10% sekitar setahun sekali. Estimasi menggunakan data jaringan live.",
    blockHeight: "Tinggi blok",
    fluxPrice: "Harga FLUX",
    nextCut: "Pemotongan 10% berikutnya",
    atBlock: "Di blok",
    stale: (when: string) => `Menampilkan data dari ${when}; pembaruan terbaru tidak merespons.`,
    caption: "Total FLUX per blok, berdasarkan periode pengurangan. Penanda adalah hari ini.",
    staircaseAria: (values: string, current: string) =>
      `Jadwal hadiah blok: ${values} FLUX per blok dalam periode pengurangan berurutan. Anda berada di periode yang membayar ${current} FLUX.`,
  },

  app: {
    tabs: { earnings: "Penghasilan dan ROI", projections: "Proyeksi", next: "Node berikutnya", lookup: "Pencarian node", run: "Jalankan node" },
    tablist: "Bagian kalkulator",
    loading: "Memuat",
    networkError: "Tidak dapat terhubung ke jaringan Flux saat ini. Mencoba lagi.",
    priceError: "Harga FLUX tidak tersedia saat ini, jadi jumlah mata uang disembunyikan. Mencoba lagi setiap beberapa menit.",
    priceNeeded: "Ini membutuhkan harga FLUX, yang tidak tersedia saat ini. Akan muncul segera setelah harga dimuat.",
    runsOnFlux: "Berjalan di Flux",
    builtBy: (who: N) => <>Dibuat oleh {who}</>,
    source: "Kode sumber di GitHub",
    issue: "Laporkan masalah atau sarankan fitur",
    translation: "Sarankan terjemahan yang lebih baik",
    disclaimer:
      "Alat komunitas independen, tidak terafiliasi dengan Flux. Hanya estimasi, bukan nasihat keuangan. Progressive Node Rewards (bagi hasil pendapatan FluxCloud) tidak disertakan karena belum ada rumus yang dipublikasikan. Hadiah mengasumsikan node Anda tetap terkonfirmasi.",
    credits: (source: N) => (
      <>
        Data harga: {source}. Data jaringan dari Flux API. Open source di bawah lisensi MIT.
      </>
    ),
  },

  contribute: {
    title: "Bantu agar kalkulator ini tetap berjalan",
    body: "Kontribusi dalam FLUX digunakan untuk biaya pengembangan dan hosting. Terima kasih telah mendukungnya.",
    copy: "Salin alamat",
    copied: "Disalin",
    copiedSr: "Alamat disalin ke clipboard",
  },

  network: {
    title: "Tier hari ini",
    live: "Live dari jaringan Flux.",
    tier: "Tier",
    collateral: "Jaminan",
    enabled: "Node aktif",
    perBlock: "FLUX per blok",
    perDay: "Per node per hari",
    withPa: "Dengan aset paralel",
    paidEvery: "Dibayar sekitar setiap",
    rate: "Tingkat hadiah tahunan",
    native: (pct: string) => `${pct} native`,
    footnote: (paCount: number | null) =>
      "Tingkat hadiah tahunan adalah FLUX yang diperoleh selama 12 bulan ke depan sebagai bagian dari jaminan, termasuk pengurangan berikutnya" +
      (paCount === null
        ? "."
        : `, dengan aset paralel hingga tanggal berakhirnya (${paCount} × 10% dari setiap pembayaran, dibayar di chain lain, harus diklaim). Angka yang lebih kecil adalah FLUX native saja.`),
  },

  pa: {
    note: (count: number, share: string, end: string) => (
      <>
        Termasuk hadiah aset paralel: FLUX yang dibayar di {count} chain lain, masing-masing menambahkan {share} dari setiap
        pembayaran, hingga {end}. <strong className="font-medium text-ink">Tidak dibayar secara otomatis.</strong> Anda mengklaimnya dengan Fusion
        di SSP Wallet (Nodes → Parallel Assets Reward) atau Zelcore (Apps → Fusion → Parallel Mining Claim). Biaya diambil
        dari klaim itu sendiri, jadi lebih jarang mengklaim berarti lebih hemat biaya.
      </>
    ),
    warning: (
      <>
        <strong className="font-medium text-loss">Hadiah mining aset paralel berakhir sekitar 1 Juli 2027</strong> (blok 3.787.502), menurut
        roadmap Flux. Mulai Maret 2027 chain yang dihentikan menjadi satu arah, dan pada Agustus 2027 saldo yang belum
        diklaim diserahkan ke Flux Foundation, jadi klaimlah sebelum itu.
      </>
    ),
    include: "Sertakan hadiah aset paralel",
    includeHint: "FLUX ekstra yang dibayar di chain lain selama masih ada. Harus diklaim.",
    active: "Aset aktif",
    value: "Nilai vs. FLUX native",
    endDate: "Perkiraan tanggal berakhir",
    defaults: (date: string) => `Default ${date}, blok 3.787.502 menurut roadmap Flux.`,
    claimBy: "Klaim sebelum Agustus 2027.",
    reset: "Atur ulang",
  },

  earnings: {
    intro: "Masukkan berapa banyak node yang Anda jalankan dan berapa biaya masing-masing per bulan. Biaya yang terisi adalah contoh.",
    nodes: "Node",
    costPerNode: "Biaya per node / bulan",
    setupCost: "Biaya setup satu kali",
    setupHint: "Perangkat keras atau hal lain yang Anda bayar sekali.",
    collateralPrice: "Harga yang Anda bayar per FLUX untuk jaminan",
    usingToday: "Menggunakan harga hari ini.",
    noPriceYet: "Harga hari ini belum tersedia. Masukkan harga yang Anda bayar, atau tunggu hingga dimuat.",
    useToday: "Gunakan harga hari ini",
    countCollateral: "Hitung pembelian jaminan dalam break-even",
    countCollateralHint: "Jaminan tetap milik Anda dan bisa dibuka, tetapi membelinya adalah uang yang dikeluarkan.",
    compare: "Bandingkan dengan setup kedua",
    setupA: "Setup A",
    setupB: "Setup B",
    addNode: "Tambahkan setidaknya satu node untuk melihat penghasilan.",
    nativePerMonth: "FLUX native per bulan",
    fluxPerDay: "FLUX per hari",
    paPerMonth: "Aset paralel per bulan",
    fluxPerMonth: "FLUX per bulan",
    toClaim: "Untuk diklaim",
    allFlux12: "Semua FLUX, 12 bulan ke depan",
    flux12: "FLUX 12 bulan ke depan",
    revenue: "Pendapatan per bulan",
    costs: "Biaya per bulan",
    net: "Bersih per bulan",
    collateralLocked: "Jaminan terkunci",
    rate: "Tingkat hadiah tahunan",
    ratePa: "Tingkat hadiah tahunan, termasuk aset paralel",
    net12: "Bersih 12 bulan ke depan",
    breakEvenTitle: "Break-even pada harga dan ukuran jaringan hari ini",
    profitableNow: "Menguntungkan sejak bulan pertama",
    notProfitable: "Tidak menguntungkan dengan biaya ini",
    after: (d: string) => `Setelah ${d}`,
    notWithin20: "Tidak dalam 20 tahun",
    recovering: (amount: string, withCollateral: boolean, pa: boolean) =>
      `Memulihkan ${amount}${withCollateral ? " termasuk jaminan" : " dalam biaya setup"}. Hadiah turun 10% pada setiap pengurangan tahunan${pa ? " dan aset paralel berhenti pada tanggal berakhirnya" : ""}, jadi bulan-bulan berikutnya menghasilkan lebih sedikit.`,
  },

  projections: {
    needNodes: "Tambahkan setidaknya satu node di tab Penghasilan dan ROI untuk melihat proyeksi.",
    intro: "Menggunakan node dan biaya dari tab Penghasilan dan ROI. Setiap tahun mengakumulasi perubahan di bawah ini.",
    years: "Tahun",
    growth: "Perubahan ukuran jaringan per tahun",
    growthHint: "Lebih banyak node dalam sebuah tier berarti masing-masing dibayar lebih jarang.",
    priceChange: "Perubahan harga FLUX per tahun",
    low: "Rendah",
    middle: "Menengah",
    high: "Tinggi",
    startFrom: (price: string) => `Dimulai dari ${price}. Ini adalah asumsi Anda, bukan perkiraan.`,
    chartTitle: "Keuntungan kumulatif",
    chartIntro: (years: number, cuts: number, pa: boolean) =>
      `Pendapatan dikurangi biaya operasional selama ${years} tahun, termasuk ${cuts} pengurangan hadiah${pa ? ", dengan aset paralel hingga tanggal berakhirnya" : ""}.`,
    chartAria: "Keuntungan kumulatif per bulan untuk tiga skenario harga",
    series: (label: string, pct: number) => `${label} (${pct}%/thn)`,
    month: (n: number) => `Bulan ${n}`,
    year: (n: number) => `Tahun ${n}`,
    toRecover: (amount: string) => `Untuk dipulihkan: ${amount}`,
    breakEven: (label: string) => `${label}: break-even`,
    notWithin: (years: number) => `tidak dalam ${years} tahun`,
    immediately: "segera",
    after: (d: string) => `setelah ${d}`,
    tableTitle: "Tahun demi tahun, harga menengah",
    colYear: "Tahun",
    colNative: "FLUX Native",
    colEarned: "FLUX diperoleh",
    colPa: "Aset paralel",
    colTotal: "Total FLUX",
    colPrice: "Harga di akhir tahun",
    colNet: "Bersih tahun itu",
    colTotalNet: "Total bersih",
  },

  next: {
    intro:
      "Berapa lama hingga hadiah Anda membayar jaminan node lain. Menggunakan node dan biaya Anda dari Penghasilan dan ROI, serta ukuran jaringan dan perubahan harga menengah dari Proyeksi.",
    saved: "FLUX yang sudah Anda simpan",
    savedHint: "FLUX cadangan yang belum terkunci sebagai jaminan.",
    sell: "Jual hadiah untuk membayar biaya operasional",
    sellHint: "Matikan jika Anda membayar hosting dari pendapatan lain, sehingga semua hadiah disimpan.",
    keepBuying: "Terus membeli",
    planLength: "Durasi rencana",
    yearsUnit: "tahun",
    needInput: "Tambahkan node Anda di tab Penghasilan dan ROI, atau masukkan FLUX yang sudah Anda simpan.",
    priceNeeded: "Atau matikan “Jual hadiah untuk membayar biaya operasional” untuk merencanakan tanpanya.",
    saving: (flux: N, sell: boolean) => (
      <>
        Anda akan menyimpan sekitar {flux} per bulan saat ini{sell ? " setelah menjual cukup untuk membayar biaya operasional" : ""}.
      </>
    ),
    nothingSaved:
      "Biaya operasional menghabiskan semua hadiah Anda, sehingga tidak ada yang disimpan. Turunkan biaya atau matikan penjualan hadiah untuk membayarnya.",
    yourNext: "Node Anda berikutnya",
    nextTier: (tier: string) => `${tier} berikutnya`,
    notWithin20: "Tidak dalam 20 tahun",
    collateral: (amount: string) => `Jaminan ${amount} FLUX`,
    now: "Sekarang",
    nowInline: "sekarang",
    inDays: (n: number, inline: boolean) => `${inline ? "dalam" : "Dalam"} ${n} hari`,
    inDuration: (d: string, inline: boolean) => `${inline ? "dalam" : "Dalam"} ${d}`,
    planTitle: (tier: string) => `Jika Anda terus membeli node ${tier}`,
    notEnough: (tier: string, years: number) =>
      `Tidak cukup disimpan untuk sebuah ${tier} dalam ${years} tahun.`,
    summary: (years: number, _count: number, countN: N, tier: string, daily: N, first: string) => (
      <>
        Dalam {years} tahun Anda akan menambahkan {countN} node {tier}, menghasilkan sekitar {daily} per hari di akhir.
        Yang pertama datang {first}.
      </>
    ),
    colYear: "Tahun",
    colAdded: "Node ditambahkan",
    colNodes: "Node Anda di akhir tahun",
    colPerDay: "FLUX per hari",
    yearEnd: (date: string) => `hingga ${date}`,
    footnote:
      "Setiap node baru menghasilkan mulai bulan setelah dibeli dan menambah biaya operasionalnya. Pengurangan hadiah, ukuran jaringan, dan perubahan harga diterapkan bulan demi bulan. Perangkat keras dan setup untuk node baru tidak termasuk.",
    paCounted:
      "Aset paralel dihitung sebagai tabungan selama masih ada. Itu mengasumsikan Anda mengklaimnya dan mengubahnya menjadi FLUX native untuk jaminan.",
  },

  lookup: {
    address: "Alamat pembayaran",
    lookingUp: "Mencari…",
    lookUp: "Cari node",
    hint: "Alamat tempat hadiah node Anda dibayarkan. Pencarian hanya membaca data chain publik.",
    invalid: "Masukkan alamat pembayaran Flux lengkap: 35 karakter yang diawali dengan t1 atau t3.",
    tooMany: "Terlalu banyak pencarian dalam waktu singkat. Tunggu sebentar dan coba lagi.",
    failed: "API jaringan Flux tidak merespons. Coba lagi dalam satu menit.",
    noNodes: "Tidak ada node yang membayar ke alamat ini. Periksa apakah ini alamat pembayaran, bukan alamat jaminan.",
    summary: (confirmed: N, dos: N | null, starting: N | null) => (
      <>
        {confirmed} terkonfirmasi
        {dos !== null && <>, {dos} dalam daftar DOS</>}
        {starting !== null && <>, {starting} memulai</>}
      </>
    ),
    dosExplain:
      "Node dalam daftar DOS tidak dibayar sampai dimulai lagi. Ini biasanya disebabkan oleh informasi jaminan yang salah atau daemon yang tidak sinkron.",
    dosUnknown: "Daftar DOS tidak dapat diperiksa saat ini, jadi hanya node terkonfirmasi yang ditampilkan.",
    nativePerDay: "FLUX native per hari",
    expectedPerDay: "Perkiraan per hari",
    paPerDay: "Aset paralel per hari",
    claimUntil: "Klaim dengan Fusion, hingga berakhir",
    totalPerDay: "Total per hari",
    valuePerDay: "Nilai per hari",
    rate: "Tingkat hadiah tahunan",
    native: (pct: string) => `${pct} native`,
    useNodes: "Gunakan node ini di kalkulator",
    lastDays: (n: number) => `${n} hari terakhir, hanya FLUX native`,
    received: (flux: N, payouts: N, expected: N) => (
      <>
        {flux} diterima dari {payouts} pembayaran, berbanding {expected} yang diperkirakan
      </>
    ),
    historyNote:
      "Aset paralel dibayar di chain lain, jadi tidak dapat diperiksa di sini. Perkiraan mengasumsikan jumlah node hari ini dan menghitung setiap node sejak dikonfirmasi. Kekurangan biasanya berarti node melewatkan konfirmasi atau sedang offline.",
    historyMissing: "Riwayat pembayaran tidak tersedia saat ini. Detail node di bawah ini adalah yang terbaru.",
    onlyAttention: "Tampilkan hanya node yang perlu perhatian",
    colTier: "Tier",
    colStatus: "Status",
    colCollateral: "Jaminan",
    colQueue: "Posisi antrean",
    colNext: "Pembayaran berikutnya",
    colLast: "Terakhir dibayar",
    colPerDay: "Perkiraan per hari",
    onDos: "Dalam daftar DOS",
    startNow: "Dapat dimulai sekarang",
    startIn: (when: string) => `Dapat dimulai ${when}`,
    notPaid: "Tidak dibayar",
    confirmed: "Terkonfirmasi",
    queuePos: (pos: string, of: string) => `${pos} dari ${of}`,
    startingOne: (tier: string, when: string) => `1 node ${tier} di alamat ini sedang memulai dan harus konfirmasi ${when}.`,
    startingMany: (n: number, parts: string, when: string) =>
      `${n} node di alamat ini sedang memulai (${parts}). Yang pertama harus konfirmasi ${when}.`,
    updated: (when: string) => `Diperbarui ${when}. Alamat IP node tidak pernah ditampilkan.`,
  },

  run: {
    intro: (checked: string) => `Apa yang dibutuhkan untuk menjalankan FluxNode sendiri, dengan tautan ke panduan resmi Flux. Persyaratan berubah seiring pembaruan FluxOS; ini diperiksa pada ${checked}.`,
    needTitle: "Yang Anda butuhkan",
    collateral: "Jaminan",
    cpu: "CPU",
    coresThreads: (cores: number, threads: number) => `${cores} core / ${threads} thread`,
    ram: "RAM",
    ssd: "SSD / NVMe",
    eps: "Skor benchmark (EPS)",
    bandwidth: "Bandwidth",
    disk: "Kecepatan tulis disk",
    needNote: "Setiap node harus lulus benchmark Flux sebelum bergabung, membutuhkan IP publik, dan harus tetap online (sekitar 97% waktu).",
    officialSpecs: "Persyaratan resmi",
    homeTitle: "Di rumah atau di data center",
    homeArcane: "Node di rumah harus menjalankan ArcaneOS, sistem operasi node yang aman dari Flux. Tanpanya, node rumahan berhenti menerima aplikasi baru dan masuk ke daftar DOS.",
    homeHardware: "ArcaneOS membutuhkan mesin AMD64 (x86-64) dengan TPM 2.0 dan UEFI. Sebagian besar PC dan mini PC modern memiliki keduanya.",
    homeNetwork: "Router Anda harus mendukung UPnP atau DMZ. Hingga 8 node bisa berbagi satu jaringan rumah; lebih dari satu node memerlukan UPnP.",
    dataCenter: "Node di data center dan VPS masih bisa memakai instalasi legacy, tetapi aplikasi enterprise hanya berjalan di ArcaneOS, dan hanya sedikit penyedia VPS yang mendukung Secure Boot yang dibutuhkan ArcaneOS di mesin virtual.",
    arcaneGuide: "Panduan instalasi ArcaneOS",
    legacyGuide: "Panduan instalasi legacy",
    walletTitle: "Dompet",
    sspTag: "Untuk keamanan",
    sspText: "Untuk node, jaminan, dan jumlah besar. Setiap transaksi harus disetujui di dua perangkat Anda: ekstensi browser dan aplikasi SSP Key di ponsel. Open source dan diaudit oleh Halborn. Menjalankan node dan mengklaim aset paralel.",
    zelcoreTag: "Untuk sehari-hari",
    zelcoreText: "Desktop, ponsel, dan browser, dengan 80+ chain, swap, dan beli kripto di aplikasi. Juga menjalankan node dan mengklaim aset paralel.",
    guide2026: "Panduan Flux: How to run a FluxNode in 2026",
    stepsTitle: "Langkah-langkah",
    step1: "Siapkan jaminan: 1.000, 12.500, atau 40.000 FLUX. Hati-hati: “Datamine FLUX” adalah koin yang berbeda.",
    step1Link: "Bursa yang mendaftarkan FLUX",
    step2: "Kirim tepat sejumlah itu ke SSP Wallet atau Zelcore Anda dalam satu transaksi.",
    step3: "Instal node: ArcaneOS untuk node di rumah, atau instalasi legacy di data center.",
    step4: "Jalankan node dari dompet Anda. Node harus terkonfirmasi dalam sekitar 2 jam.",
    startSsp: "Mulai lewat SSP",
    startZelcore: "Mulai lewat Zelcore",
    step5: "Periksa dengan alamat pembayaran Anda di Pencarian node.",
    openLookup: "Buka Pencarian node",
    hwTitle: "Ide perangkat keras untuk node di rumah",
    budgetIntro: "Penghasilan node menentukan berapa nilai perangkat kerasnya. Satu node per tier, selama 2 tahun ke depan, dengan harga dan ukuran jaringan hari ini:",
    budgetMonth: (m: string) => `${m} bulan ini`,
    budgetNote: "Itu batas maksimal biaya perangkat keras, listrik, dan hosting agar node balik modal dalam 2 tahun. Pemotongan hadiah tahunan dan berakhirnya aset paralel (sesuai pengaturan Anda) sudah dihitung.",
    budgetNoPrice: "Ditampilkan setelah harga FLUX dimuat.",
    hwIntro: "Mulai dari yang sudah Anda punya: desktop atau laptop lama dengan TPM 2.0 tidak memerlukan biaya. Sebagian besar operator memakai mini PC bekas atau rekondisi, atau satu mesin dengan beberapa node di Proxmox, dan membelanjakan uangnya untuk RAM, penyimpanan, dan UPS.",
    picks: {
      cumulus: { label: "Cumulus: mini PC bekas atau rekondisi", note: "4+ thread, RAM 8 GB+, SSD 256 GB+. Beelink, GMKtec, dan Lenovo ThinkCentre Tiny adalah pilihan umum." },
      nimbus: { label: "Nimbus: mini PC 8 thread dan 32 GB", note: "Mini PC dengan Ryzen 7 seri 5000 adalah pilihan populer." },
      stratus: { label: "Stratus: 16 thread dan 64 GB", note: "Mini PC Ryzen 9 atau workstation bekas, biasanya di Proxmox." },
      multi: { label: "Beberapa node: workstation atau server bekas", note: "Banyak RAM dan core, setiap node sebagai VM Proxmox. Hingga 8 node per IP rumah." },
      ram: { label: "Upgrade RAM (DDR4 SO-DIMM)", note: "Periksa dulu jenis RAM yang dipakai mesin Anda." },
      nvme: { label: "SSD NVMe", note: "1 TB cukup untuk Stratus. Periksa kecepatan tulis: 180 MB/s, atau 400 MB/s untuk Stratus." },
      ups: { label: "UPS", note: "Listrik padam sebentar bisa membuat node offline cukup lama hingga melewatkan konfirmasi." },
      nic: { label: "Kartu jaringan Intel 2.5 GbE", note: "Untuk pfSense atau OPNsense di depan beberapa node." },
    },
    pricesNote: "Harga RAM dan SSD naik tajam. Bandingkan dengan anggaran di atas sebelum membeli.",
    noHwTitle: "Tidak punya perangkat keras?",
    titanText: "Titan staking: stake mulai 50 FLUX dan Flux yang menjalankan node. FLUX Anda terkunci 3, 6, atau 12 bulan, dan tidak ada hadiah mining aset paralel.",
    titanLink: "Panduan Titan",
    managedText: "Layanan FluxNode terkelola: penyedia meng-host dan menjalankan node Anda, sementara jaminan tetap di dompet Anda. Periksa biayanya dulu: bisa lebih besar dari penghasilan node kecil. Anda bisa memasukkannya sebagai biaya di tab Penghasilan dan ROI.",
    managedLink: "Layanan FluxNode terkelola",
    fluxHubText: "FluxHub, dikelola anggota komunitas: yang punya jaminan tetapi tidak punya perangkat keras bisa mendapatkan node yang di-host oleh operator dengan mesin yang menganggur. Awalnya bisa dicoba gratis.",
    healthTitle: "Menjaga node tetap sehat",
    healthText: "Node hanya dibayar selama terkonfirmasi. Jika melewatkan konfirmasi, node masuk ke daftar DOS dan tidak menghasilkan apa pun sampai Anda menjalankannya lagi. Penyebab umumnya adalah informasi jaminan yang salah atau daemon yang tidak sinkron.",
    diagnosing: "Mendiagnosis masalah",
    unlock: "Membuka kunci jaminan",
    disclosure: "Beberapa tautan di halaman ini adalah tautan afiliasi: jika Anda membeli melaluinya, situs ini bisa mendapat komisi tanpa biaya tambahan bagi Anda. Tautan ini tidak pernah memengaruhi perhitungan.",
    amazonNote: "Sebagai Amazon Associate, situs ini memperoleh penghasilan dari pembelian yang memenuhi syarat.",
    tableLink: "Apa yang dibutuhkan untuk menjalankannya?",
  },

  how: {
    button: "Bagaimana perhitungan bekerja",
    close: "Tutup",
    body: (v: HowValues) => (
      <>
        <H>Dari mana angka berasal</H>
        <p>
          Tinggi blok, node aktif per tier, dan daftar DOS dan start berasal dari API jaringan Flux, diperbarui sekitar
          setiap 90 detik. Harga FLUX dalam dolar AS berasal dari explorer Flux dan dikonversi ke mata uang lain dengan kurs harian Bank Sentral Eropa (melalui Frankfurter), dengan CoinGecko sebagai cadangan. Diperbarui setiap 20 menit. Semua yang lain dihitung dari
          itu.
        </p>

        <H>Blok dan pembayaran</H>
        <p>
          Sebuah blok dibuat setiap 30 detik, jadi {v.blocksPerDay} sehari. Setiap blok membayar satu node di setiap tier,
          bergiliran dalam antrean. Bagian node hanya bergantung pada berapa banyak node aktif di tier-nya.
        </p>
        <Formula>FLUX per node per hari = hadiah tier per blok × {v.blocksPerDay} ÷ node aktif di tier tersebut</Formula>
        {v.live && (
          <Example>
            Hari ini untuk Stratus: {v.stratusReward} × {v.blocksPerDay} ÷ {v.stratusNodes} = {v.stratusDaily} FLUX sehari,
            dibayar sekitar setiap {v.stratusEvery} ({v.stratusNodes} node × 30 detik).
          </Example>
        )}

        <H>Jadwal hadiah</H>
        <p>
          Total hadiah adalah 14 FLUX per blok mulai dari blok {v.startHeight}. Turun 10% setiap {v.interval} blok (365
          hari). Dibagi antar tier dengan porsi tetap: Cumulus 1/14, Nimbus 3,5/14, Stratus 9/14, dan 0,5/14 untuk Flux
          Foundation. Ini cocok dengan angka chain sendiri di setiap tinggi yang kami periksa.
        </p>
        {v.live && (
          <Example>
            Saat ini: {v.totalReward} FLUX per blok. Pemotongan 10% berikutnya di blok {v.nextCut}.
          </Example>
        )}

        <H>Bulan dan tahun</H>
        <p>
          Satu bulan adalah rata-rata bulan kalender, 30,44 hari ({v.blocksPerMonth} blok), jadi 12 bulan tepat menjadi
          satu tahun 365,25 hari ({v.blocksPerYear} blok). Setiap kali periode melewati pemotongan hadiah, blok sebelum
          pemotongan membayar hadiah lama dan blok setelahnya membayar yang baru.
        </p>

        <H>Tingkat hadiah tahunan</H>
        <Formula>Tingkat hadiah tahunan = FLUX yang diperoleh selama 12 bulan ke depan ÷ jaminan</Formula>
        <p>
          Ini termasuk pemotongan hadiah apa pun dalam 12 bulan tersebut dan tidak berbunga majemuk. Jaminan adalah{" "}
          {v.cumulus} FLUX untuk Cumulus, {v.nimbus} untuk Nimbus dan {v.stratus} untuk Stratus.
        </p>
        {v.live && <Example>Hari ini untuk Stratus, hanya FLUX native: {v.stratusApr}.</Example>}

        <H>Aset paralel</H>
        <p>
          Setiap aset paralel aktif membayar tambahan {v.paShare} dari setiap pembayaran, dalam FLUX di chain lain. Dengan{" "}
          {v.paCount} aktif, itu {v.paTotal} di atas hadiah native. Mereka dihitung hingga tanggal akhir yang Anda atur
          (default {v.paEnd}, saat hadiah mining aset paralel berakhir menurut roadmap Flux) dan pada nilai yang Anda atur
          relatif terhadap FLUX native. Mereka tidak dibayar otomatis: Anda mengklaimnya dengan Fusion di SSP Wallet atau
          Zelcore, dan biaya Fusion, yang diambil dari klaim, tidak termasuk.
        </p>

        <H>Penghasilan, biaya dan break-even</H>
        <Formula>Bersih per bulan = (FLUX native + aset paralel) × harga − biaya operasional</Formula>
        <Formula>Break-even = bulan pertama di mana total laba bersih ≥ biaya setup (+ jaminan, jika dihitung)</Formula>
        <p>
          Jaminan dinilai pada harga yang Anda bayar untuknya, atau harga hari ini. Break-even menggunakan harga dan ukuran
          jaringan hari ini, dan hadiah masih turun dengan setiap pemotongan tahunan.
        </p>

        <H>Proyeksi</H>
        <p>
          Dihitung bulan demi bulan. Ukuran jaringan dan perubahan harga diperparah bulanan dari tingkat tahunan yang Anda
          pilih, diukur di tengah setiap bulan. Jaringan yang berkembang berarti setiap node dibayar lebih jarang. Angka
          harga rendah, menengah, dan tinggi adalah asumsi Anda, bukan perkiraan.
        </p>

        <H>Node berikutnya</H>
        <Formula>Disimpan per bulan = hadiah (+ aset paralel) − FLUX yang dijual untuk membayar biaya operasional</Formula>
        <p>
          Ketika tabungan mencapai jaminan tier, sebuah node dibeli. Jika Anda terus menginvestasikan kembali, node baru
          menghasilkan mulai bulan berikutnya dan menambah biaya operasionalnya. Perangkat keras dan setup untuk node baru
          tidak termasuk.
        </p>

        <H>Pencarian node</H>
        <p>
          Node ditemukan berdasarkan alamat pembayaran yang tepat. Pembayaran berikutnya adalah posisi node dalam antrean
          tier-nya × 30 detik. "Diterima" adalah 30 hari terakhir pembayaran FLUX native dari hadiah blok, dicocokkan
          berdasarkan jumlah ke tier. "Perkiraan" adalah apa yang seharusnya diperoleh alamat saat ini selama periode yang
          sama dengan ukuran jaringan hari ini, jadi terlihat tinggi atau rendah jika node ditambahkan atau dihapus selama
          sebulan. Node DOS dan yang memulai berasal dari daftar Flux sendiri.
        </p>

        <H>Tidak termasuk</H>
        <ul className="list-disc space-y-1 pl-5">
          <li>Progressive Node Rewards (bagi hasil FluxCloud). Belum ada rumus yang dipublikasikan.</li>
          <li>Biaya klaim aset paralel, dan pajak.</li>
          <li>Downtime. Hadiah mengasumsikan node Anda tetap terkonfirmasi.</li>
        </ul>
        <p className="pt-2 text-sm text-muted">
          Kode sumber lengkap ada di GitHub, termasuk tes yang memeriksa jadwal hadiah terhadap chain live.
        </p>
      </>
    ),
  },
};

