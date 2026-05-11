export const userDashboard = {
  commander: {
    name: "Shadow Commander",
    tier: "Gold IV",
    focus: "Arena speed race + Hydra progression",
    resonance: 84
  },
  stats: [
    { label: "Активность", value: "27", detail: "сообщений за неделю" },
    { label: "Заявки", value: "4", detail: "2 закрыты, 1 в оплате" },
    { label: "Герои", value: "18", detail: "просмотров Hero DB" },
    { label: "Форум", value: "6", detail: "тредов с тактиками" }
  ],
  topupHistory: [
    { id: "lead-1042", title: "Weekend Pack String", status: "waitingPayment", amount: "$49" },
    { id: "lead-1028", title: "Energy Rush", status: "done", amount: "$19" },
    { id: "lead-1011", title: "Ancient Shards", status: "done", amount: "$39" }
  ],
  recommendedDonation: {
    packageName: "Arena Forge Pack",
    price: "$59",
    reason: "Подходит под интерес к Arena speed race: книги, энергия, silver и ancient shards.",
    match: 92
  },
  wallet: {
    btc: process.env.NEXT_PUBLIC_BTC_WALLET ?? "bc1q-example-wallet-address",
    usdt: process.env.NEXT_PUBLIC_USDT_TRC20_WALLET ?? "TExampleUsdtTrc20Wallet",
    pendingInvoice: "INV-RAID-2049"
  }
};

export const adminDashboard = {
  pulse: [
    { label: "Новые лиды", value: "12", trend: "+18%" },
    { label: "Модерация", value: "7", trend: "3 urgent" },
    { label: "Герои без галереи", value: "9", trend: "-2 today" },
    { label: "CRM sync", value: "98%", trend: "stable" }
  ],
  contentOps: [
    { title: "2x Ancient Shards", type: "calendar", status: "published" },
    { title: "Hydra rotation guide", type: "news", status: "draft" },
    { title: "Taras gallery refresh", type: "heroDb", status: "review" }
  ],
  moderationQueue: [
    { target: "Global Chat", reason: "spam risk", priority: "high" },
    { target: "Forum: Hydra bragging", reason: "image review", priority: "medium" },
    { target: "Marketplace comment", reason: "payment claim", priority: "high" }
  ],
  crmTables: [
    { name: "Donate Leads", source: "n8n -> CRM", freshness: "2 min" },
    { name: "Marketplace Reservations", source: "Firestore -> Sheets", freshness: "8 min" },
    { name: "Manager SLA", source: "CRM API", freshness: "live" }
  ]
};
