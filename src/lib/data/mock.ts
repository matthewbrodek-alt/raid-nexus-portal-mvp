import type { HeroProfile, MarketplaceAccount, RaidEvent } from "@/lib/types";

export const raidEvents: RaidEvent[] = [
  {
    title: "2x Ancient Shards",
    date: "10-12 мая",
    description: "Повышенный шанс легендарных героев из древних осколков.",
    type: "summon"
  },
  {
    title: "CvC Personal Rewards",
    date: "14 мая",
    description: "Клановый турнир с личными наградами и усиленными milestones.",
    type: "tournament"
  },
  {
    title: "Pack String Weekend",
    date: "17 мая",
    description: "Топовые наборы энергии, гемов и осколков для залива.",
    type: "topup"
  },
  {
    title: "Fragment Fusion",
    date: "20 мая",
    description: "Новый фьюжн с календарем событий и расчетом ресурсов.",
    type: "fusion"
  }
];

export const newsFeed = [
  {
    tag: "Patch",
    title: "Баланс арены и новые Blessings",
    summary: "Новости патча выводятся из Firestore collection news с модерацией в админке."
  },
  {
    tag: "Guide",
    title: "Speed tune для Demon Lord",
    summary: "Useful-раздел хранит калькуляторы и markdown-гайды, готовые к расширению."
  }
];

export const marketplaceHighlights: MarketplaceAccount[] = [
  {
    id: "acc-arbiter-001",
    title: "Arbiter starter",
    level: 62,
    mythicCount: 0,
    legendaryCount: 8,
    voidCount: 2,
    category: "starter",
    price: 149,
    tags: ["Arbiter", "Void x2", "Arena"]
  },
  {
    id: "acc-endgame-002",
    title: "Hydra ready",
    level: 92,
    mythicCount: 2,
    legendaryCount: 42,
    voidCount: 9,
    category: "progressed",
    price: 690,
    tags: ["Hydra", "Mythical", "Gear"]
  },
  {
    id: "acc-shards-004",
    title: "Shard stock",
    level: 48,
    mythicCount: 0,
    legendaryCount: 3,
    voidCount: 4,
    category: "shards",
    price: 240,
    tags: ["Ancient Shards", "Void Shards", "Summon"]
  },
  {
    id: "acc-budget-003",
    title: "CB budget",
    level: 55,
    mythicCount: 0,
    legendaryCount: 5,
    voidCount: 1,
    category: "starter",
    price: 89,
    tags: ["Clan Boss", "Budget", "Books"]
  }
];

export const featuredHeroes: HeroProfile[] = [
  {
    id: "arbiter",
    slug: "arbiter",
    name: "Arbiter",
    faction: "High Elves",
    rarity: "Legendary",
    role: "Speed Lead",
    rating: 5,
    galleryUrls: [],
    comment: "Ключевой герой арены: ускорение, revive и контроль темпа боя.",
    youtubeVideoId: "dQw4w9WgXcQ",
    youtubeTitle: "Arbiter guide and arena speed lead overview"
  },
  {
    id: "siphi",
    slug: "siphi",
    name: "Siphi",
    faction: "Undead Hordes",
    rarity: "Legendary",
    role: "Support",
    rating: 5,
    galleryUrls: [],
    comment: "Премиальный саппорт для PvP, Hydra и endgame контента.",
    youtubeVideoId: "dQw4w9WgXcQ",
    youtubeTitle: "Siphi support guide and builds"
  },
  {
    id: "taras",
    slug: "taras",
    name: "Taras",
    faction: "Banner Lords",
    rarity: "Legendary",
    role: "Nuker",
    rating: 5,
    galleryUrls: [],
    comment: "Сильный damage dealer для арены и быстрых зачисток.",
    youtubeVideoId: "dQw4w9WgXcQ",
    youtubeTitle: "Taras arena damage guide"
  }
];

export const chatPreview = [
  {
    user: "Manager",
    time: "12:04",
    message: "Пакеты на weekend string уже доступны. Для резерва пишите в Донат."
  },
  {
    user: "ArenaLead",
    time: "12:09",
    message: "Для speed race против Arbiter держите lead 360+ с учетом aura и glyphs."
  },
  {
    user: "HydraMain",
    time: "12:16",
    message: "В треде закрепил скрины новой ротации Hydra и варианты провокации."
  }
];
