"use client";

import { Eye, Filter, MessageSquare, Search, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import { collection, limit, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { useLanguage } from "@/lib/i18n/use-language";
import type { MarketplaceAccount } from "@/lib/types";

type FirestoreMarketplaceAccount = MarketplaceAccount & {
  screenshot?: { secureUrl?: string; url?: string } | null;
  gallery?: Array<{ secureUrl?: string; url?: string }> | null;
  createdAt?: { seconds?: number };
};

type AccountCategory = NonNullable<MarketplaceAccount["category"]>;

const accountPageSize = 9;
const initialSectionPages: Record<AccountCategory, number> = {
  starter: 1,
  progressed: 1,
  shards: 1
};

const copy = {
  ru: {
    eyebrow: "Raid account store",
    title: "Покупка аккаунта",
    description:
      "Витрина аккаунтов Raid: Shadow Legends с понятными категориями, скриншотами, героями, ресурсами и быстрым контактом с менеджером.",
    search: "Поиск по героям, тегам, описанию",
    minMythical: "Мифические от",
    minLegendary: "Легендарные от",
    minVoid: "Войдовые от",
    minLevel: "Уровень от",
    maxPrice: "Цена до",
    onlyAvailable: "Только доступные",
    filters: "Фильтры",
    reset: "Сбросить",
    level: "Уровень",
    mythical: "Мифические",
    legendary: "Легендарные",
    void: "Войдовые",
    power: "Сила",
    reserve: "Связаться с менеджером",
    details: "Описание",
    available: "В наличии",
    reserved: "В резерве",
    sold: "Продан",
    noItems: "Под эти фильтры пока нет лотов.",
    screenshots: "Скриншоты аккаунта",
    close: "Закрыть",
    navTitle: "Подразделы",
    starter: "Стартовый аккаунт",
    starterText: "Для быстрого входа в игру: базовые герои, ресурсы и хороший старт прогресса.",
    progressed: "Прокаченный аккаунт",
    progressedText: "Аккаунты с сильным ростером, высоким уровнем, подготовкой под арену, гидру и клан-босса.",
    shards: "Аккаунт с осколками",
    shardsText: "Лоты с запасом осколков и ресурсов для открытия героев и ивентов призыва.",
    storeNote: "Все детали уточняются через менеджера. Карточки можно дополнять скриншотами, героями и описанием из админ-панели.",
    featured: "Аккаунты",
    lots: "лотов",
    page: "Страница",
    previous: "Назад",
    next: "Вперед",
    allSections: "Все разделы",
    enterSection: "Открыть раздел",
    backToSections: "Назад ко всем разделам"
  },
  en: {
    eyebrow: "Raid account store",
    title: "Account Purchase",
    description:
      "Raid: Shadow Legends account storefront with clear categories, screenshots, heroes, resources and quick manager contact.",
    search: "Search heroes, tags, description",
    minMythical: "Mythical from",
    minLegendary: "Legendary from",
    minVoid: "Void from",
    minLevel: "Level from",
    maxPrice: "Max price",
    onlyAvailable: "Available only",
    filters: "Filters",
    reset: "Reset",
    level: "Level",
    mythical: "Mythical",
    legendary: "Legendary",
    void: "Void",
    power: "Power",
    reserve: "Contact manager",
    details: "Details",
    available: "Available",
    reserved: "Reserved",
    sold: "Sold",
    noItems: "No lots match these filters yet.",
    screenshots: "Account screenshots",
    close: "Close",
    navTitle: "Sections",
    starter: "Starter Account",
    starterText: "Fast game entry: base heroes, resources and a good progression start.",
    progressed: "Progressed Account",
    progressedText: "Accounts with stronger rosters, higher level and prep for arena, Hydra and Clan Boss.",
    shards: "Shard Account",
    shardsText: "Lots with shard and resource stock for champion pulls and summon events.",
    storeNote: "All details are clarified through a manager. Cards can be enriched with screenshots, heroes and descriptions in the admin panel.",
    featured: "Accounts",
    lots: "lots",
    page: "Page",
    previous: "Previous",
    next: "Next",
    allSections: "All sections",
    enterSection: "Open section",
    backToSections: "Back to all sections"
  }
};

function normalizeAccount(item: FirestoreMarketplaceAccount): MarketplaceAccount {
  return {
    ...item,
    screenshotUrl: item.screenshotUrl ?? item.screenshot?.secureUrl ?? item.screenshot?.url,
    mythicCount: item.mythicCount ?? 0,
    galleryUrls: item.galleryUrls ?? item.gallery?.map((asset) => asset.secureUrl ?? asset.url ?? "").filter(Boolean) ?? [],
    status: item.status ?? "available",
    category: item.category ?? "starter",
    heroes: item.heroes ?? [],
    tags: item.tags ?? []
  };
}

function formatPrice(price: number) {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0
  }).format(price);
}

function statusLabel(status: MarketplaceAccount["status"], t: typeof copy.ru) {
  if (status === "reserved") {
    return t.reserved;
  }

  if (status === "sold") {
    return t.sold;
  }

  return t.available;
}

function accountScore(account: MarketplaceAccount) {
  return account.level + (account.mythicCount ?? 0) * 24 + account.legendaryCount * 6 + account.voidCount * 4;
}

export function MarketplaceBoard() {
  const { language } = useLanguage();
  const t = copy[language];
  const [accounts, setAccounts] = useState<MarketplaceAccount[]>([]);
  const [search, setSearch] = useState("");
  const [minMythical, setMinMythical] = useState("");
  const [minLegendary, setMinLegendary] = useState("");
  const [minVoid, setMinVoid] = useState("");
  const [minLevel, setMinLevel] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sectionFilter, setSectionFilter] = useState<AccountCategory | "all">("all");
  const [activeCategory, setActiveCategory] = useState<AccountCategory | "all">("all");
  const [sectionPages, setSectionPages] = useState<Record<AccountCategory, number>>({ ...initialSectionPages });
  const [selectedAccount, setSelectedAccount] = useState<MarketplaceAccount | null>(null);
  const [previewImage, setPreviewImage] = useState("");

  useEffect(() => {
    const accountsQuery = query(collection(db, collections.marketplaceAccounts), where("status", "in", ["available", "reserved"]), limit(160));

    return onSnapshot(accountsQuery, (snapshot) => {
      const items = snapshot.docs
        .map((item) => normalizeAccount({ id: item.id, ...(item.data() as Omit<FirestoreMarketplaceAccount, "id">) }))
        .sort((a, b) => ((b as FirestoreMarketplaceAccount).createdAt?.seconds ?? 0) - ((a as FirestoreMarketplaceAccount).createdAt?.seconds ?? 0))
        .filter((item) => item.status !== "sold");
      setAccounts(items);
    });
  }, []);

  useEffect(() => {
    setSectionPages({ ...initialSectionPages });
  }, [maxPrice, minLegendary, minLevel, minMythical, minVoid, onlyAvailable, search, sectionFilter]);

  const categoryTabs: Array<{ id: AccountCategory; title: string; text: string }> = [
    { id: "starter", title: t.starter, text: t.starterText },
    { id: "progressed", title: t.progressed, text: t.progressedText },
    { id: "shards", title: t.shards, text: t.shardsText }
  ];

  const filterBaseAccounts = useMemo(() => {
    const queryText = search.trim().toLowerCase();
    const mythical = Number(minMythical) || 0;
    const legendary = Number(minLegendary) || 0;
    const voidCount = Number(minVoid) || 0;
    const level = Number(minLevel) || 0;
    const price = Number(maxPrice) || Number.POSITIVE_INFINITY;

    return accounts.filter((item) => {
      const haystack = `${item.title} ${item.description ?? ""} ${item.tags.join(" ")} ${(item.heroes ?? []).join(" ")}`.toLowerCase();

      return (
        (!queryText || haystack.includes(queryText)) &&
        (item.mythicCount ?? 0) >= mythical &&
        item.legendaryCount >= legendary &&
        item.voidCount >= voidCount &&
        item.level >= level &&
        item.price <= price &&
        (!onlyAvailable || item.status === "available")
      );
    });
  }, [accounts, maxPrice, minLegendary, minLevel, minMythical, minVoid, onlyAvailable, search]);

  const filteredAccounts = useMemo(() => {
    if (sectionFilter === "all") {
      return filterBaseAccounts;
    }

    return filterBaseAccounts.filter((item) => (item.category ?? "starter") === sectionFilter);
  }, [filterBaseAccounts, sectionFilter]);

  const groupedAccounts = categoryTabs.map((group) => ({
    ...group,
    items: filteredAccounts.filter((account) => (account.category ?? "starter") === group.id)
  }));

  const pagedGroups = groupedAccounts.map((group) => {
    const pageCount = Math.max(1, Math.ceil(group.items.length / accountPageSize));
    const page = Math.min(sectionPages[group.id] ?? 1, pageCount);
    const start = (page - 1) * accountPageSize;

    return {
      ...group,
      page,
      pageCount,
      pageItems: group.items.slice(start, start + accountPageSize)
    };
  });

  const visibleGroups = activeCategory === "all" ? pagedGroups.filter((group) => group.items.length > 0) : pagedGroups.filter((group) => group.id === activeCategory);

  const heroStats = {
    total: filteredAccounts.length,
    minPrice: filteredAccounts.length ? Math.min(...filteredAccounts.map((item) => item.price)) : 0,
    maxLevel: filteredAccounts.length ? Math.max(...filteredAccounts.map((item) => item.level)) : 0
  };

  function resetFilters() {
    setSearch("");
    setMinMythical("");
    setMinLegendary("");
    setMinVoid("");
    setMinLevel("");
    setMaxPrice("");
    setOnlyAvailable(false);
    setSectionFilter("all");
    setActiveCategory("all");
    setSectionPages({ ...initialSectionPages });
  }

  function setCategoryPage(category: AccountCategory, nextPage: number) {
    setSectionPages((current) => ({
      ...current,
      [category]: Math.max(1, nextPage)
    }));
  }

  function openCategory(category: AccountCategory) {
    setSectionFilter(category);
    setActiveCategory(category);
    setSectionPages((current) => ({ ...current, [category]: 1 }));
    window.setTimeout(() => document.getElementById(`market-${category}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  }

  function selectSectionFilter(nextSection: AccountCategory | "all") {
    setSectionFilter(nextSection);
    setActiveCategory(nextSection);
    if (nextSection !== "all") {
      setSectionPages((current) => ({ ...current, [nextSection]: 1 }));
    }
  }

  return (
    <>
      <div className="mb-6 overflow-hidden rounded-[28px] border border-relic/25 bg-[#050a12]/90 shadow-[0_0_70px_rgba(0,0,0,0.58)]">
        <div
          className="relative min-h-[330px] bg-cover bg-center p-5 sm:p-7 lg:p-8"
          style={{ backgroundImage: "linear-gradient(90deg, rgba(5,7,11,0.94), rgba(7,13,23,0.78) 48%, rgba(47,124,255,0.08)), url('/images/raid-castle-bg.png')" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(99,166,255,0.16),transparent_34%),linear-gradient(180deg,transparent,rgba(0,0,0,0.4))]" />
          <div className="relative z-10 grid gap-6 xl:grid-cols-[1fr_420px]">
            <div className="flex min-h-[280px] flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.32em] text-relic">{t.eyebrow}</p>
                <h2 className="raid-title-metal mt-4 max-w-3xl text-4xl font-black leading-[1.02] sm:text-5xl lg:text-6xl">{t.title}</h2>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">{t.description}</p>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-relic/20 bg-black/35 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">{t.featured}</p>
                  <p className="mt-2 text-2xl font-black text-white">{heroStats.total}</p>
                </div>
                <div className="rounded-2xl border border-relic/20 bg-black/35 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">{t.maxPrice}</p>
                  <p className="mt-2 text-2xl font-black text-relic">{heroStats.minPrice ? `${formatPrice(heroStats.minPrice)} ₽` : "-"}</p>
                </div>
                <div className="rounded-2xl border border-relic/20 bg-black/35 p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-zinc-500">{t.level}</p>
                  <p className="mt-2 text-2xl font-black text-white">{heroStats.maxLevel || "-"}</p>
                </div>
              </div>
            </div>

            <GlassPanel className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <SlidersHorizontal className="text-relic" />
                <h3 className="text-xl font-black text-white">{t.filters}</h3>
              </div>
              <div className="grid gap-3">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={17} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t.search}
                    className="w-full rounded-xl border-white/10 bg-black/45 pl-10 text-sm text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
                  />
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <select
                    value={sectionFilter}
                    onChange={(event) => selectSectionFilter(event.target.value as AccountCategory | "all")}
                    className="rounded-xl border-white/10 bg-black/45 text-sm text-white focus:border-relic focus:ring-relic sm:col-span-2"
                  >
                    <option value="all">{t.allSections}</option>
                    {categoryTabs.map((tab) => (
                      <option key={tab.id} value={tab.id}>
                        {tab.title}
                      </option>
                    ))}
                  </select>
                  <input type="number" value={minMythical} onChange={(event) => setMinMythical(event.target.value)} placeholder={t.minMythical} className="rounded-xl border-white/10 bg-black/45 text-sm text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
                  <input type="number" value={minLegendary} onChange={(event) => setMinLegendary(event.target.value)} placeholder={t.minLegendary} className="rounded-xl border-white/10 bg-black/45 text-sm text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
                  <input type="number" value={minVoid} onChange={(event) => setMinVoid(event.target.value)} placeholder={t.minVoid} className="rounded-xl border-white/10 bg-black/45 text-sm text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
                  <input type="number" value={minLevel} onChange={(event) => setMinLevel(event.target.value)} placeholder={t.minLevel} className="rounded-xl border-white/10 bg-black/45 text-sm text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
                  <input type="number" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder={t.maxPrice} className="rounded-xl border-white/10 bg-black/45 text-sm text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic sm:col-span-2" />
                </div>
                <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-black/35 px-4 py-3 text-sm font-semibold text-zinc-300">
                  {t.onlyAvailable}
                  <input type="checkbox" checked={onlyAvailable} onChange={(event) => setOnlyAvailable(event.target.checked)} className="rounded border-relic/40 bg-black text-relic focus:ring-relic" />
                </label>
                <button type="button" onClick={resetFilters} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-relic/45 hover:text-white">
                  <Filter size={16} />
                  {t.reset}
                </button>
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>

      <GlassPanel className="mb-6 p-3 lg:sticky lg:top-3 lg:z-20">
        <div className="grid gap-2 md:grid-cols-3">
            {categoryTabs.map((tab) => {
              const count = filterBaseAccounts.filter((account) => (account.category ?? "starter") === tab.id).length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => openCategory(tab.id)}
                  className={`group rounded-2xl border p-3 text-left transition hover:border-relic/55 hover:bg-relic/[0.08] ${
                    activeCategory === tab.id ? "border-relic/55 bg-relic/[0.1]" : "border-relic/20 bg-black/30"
                  }`}
                >
                  <span className="flex items-center justify-between gap-3 text-sm font-black text-white">
                    {tab.title}
                    <span className="rounded-full border border-relic/30 px-2 py-0.5 text-[11px] text-relic">{count}</span>
                  </span>
                  <span className="mt-1 line-clamp-2 block text-xs leading-5 text-zinc-500 group-hover:text-zinc-300">{tab.text}</span>
                  <span className="mt-2 inline-flex text-[11px] font-bold uppercase tracking-[0.18em] text-relic">{t.enterSection}</span>
                </button>
              );
            })}
        </div>
      </GlassPanel>

      {activeCategory !== "all" ? (
        <button
          type="button"
          onClick={() => selectSectionFilter("all")}
          className="mb-5 inline-flex items-center justify-center rounded-xl border border-relic/30 bg-black/35 px-4 py-2 text-sm font-bold text-relic transition hover:border-relic hover:bg-relic/10"
        >
          {t.backToSections}
        </button>
      ) : null}

      <div className="space-y-9">
        {visibleGroups.map((group) => (
          <section id={`market-${group.id}`} key={group.id} className="scroll-mt-28">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2 className="raid-title-metal text-3xl font-black">{group.title}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">{group.text}</p>
              </div>
              <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                {group.items.length} {t.lots}
              </span>
            </div>

            {group.items.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.pageItems.map((account) => (
                  <GlassPanel key={account.id} className="group overflow-hidden rounded-[24px] transition duration-200 hover:border-relic/45">
                    <div
                      className="relative aspect-[16/10] bg-gradient-to-br from-[#111827] via-[#24111b] to-[#3b1c0f] bg-cover bg-center"
                      style={
                        account.screenshotUrl
                          ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.55)), url(${account.screenshotUrl})` }
                          : undefined
                      }
                    >
                      <div className="absolute left-3 top-3 rounded-full border border-relic/35 bg-black/70 px-3 py-1 text-xs font-bold text-relic backdrop-blur">{statusLabel(account.status, t)}</div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-[11px] uppercase tracking-[0.22em] text-relic">{group.title}</p>
                          <h3 className="mt-1 line-clamp-2 text-xl font-black leading-tight text-white drop-shadow">{account.title}</h3>
                        </div>
                        <p className="rounded-2xl border border-relic/30 bg-black/75 px-3 py-2 text-lg font-black text-relic backdrop-blur">{formatPrice(account.price)} ₽</p>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="min-w-0 rounded-xl border border-white/10 bg-black/25 p-2.5">
                          <p className="whitespace-normal text-[11px] leading-4 text-zinc-500">{t.level}</p>
                          <p className="font-bold text-white">{account.level}</p>
                        </div>
                        <div className="min-w-0 rounded-xl border border-white/10 bg-black/25 p-2.5">
                          <p className="whitespace-normal text-[11px] leading-4 text-zinc-500">{t.mythical}</p>
                          <p className="font-bold text-white">{account.mythicCount ?? 0}</p>
                        </div>
                        <div className="min-w-0 rounded-xl border border-white/10 bg-black/25 p-2.5">
                          <p className="whitespace-normal text-[11px] leading-4 text-zinc-500">{t.legendary}</p>
                          <p className="font-bold text-white">{account.legendaryCount}</p>
                        </div>
                        <div className="min-w-0 rounded-xl border border-white/10 bg-black/25 p-2.5">
                          <p className="whitespace-normal text-[11px] leading-4 text-zinc-500">{t.void}</p>
                          <p className="font-bold text-white">{account.voidCount}</p>
                        </div>
                      </div>

                      {account.description ? <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-400">{account.description}</p> : null}

                      <div className="mt-4 flex flex-wrap gap-2">
                        {[...(account.heroes ?? []), ...account.tags].slice(0, 8).map((tag) => (
                          <span key={tag} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-300">
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="mt-5 grid gap-2 sm:grid-cols-2">
                        <button type="button" onClick={() => setSelectedAccount(account)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:border-relic/45 hover:text-white">
                          <Eye size={16} />
                          {t.details}
                        </button>
                        <a href="/chat" className="inline-flex items-center justify-center gap-2 rounded-xl bg-relic px-4 py-2 text-sm font-bold text-black transition hover:bg-[#8bbcff]">
                          <MessageSquare size={16} />
                          {t.reserve}
                        </a>
                      </div>
                    </div>
                  </GlassPanel>
                ))}
              </div>
            ) : (
              <GlassPanel className="p-6 text-sm text-zinc-400">{t.noItems}</GlassPanel>
            )}

            {group.pageCount > 1 ? (
              <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-relic/20 bg-black/25 p-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-semibold text-zinc-400">
                  {t.page} {group.page} / {group.pageCount}
                </p>
                <div className="grid grid-cols-2 gap-2 sm:flex">
                  <button
                    type="button"
                    disabled={group.page <= 1}
                    onClick={() => setCategoryPage(group.id, group.page - 1)}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-zinc-300 transition hover:border-relic/45 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    {t.previous}
                  </button>
                  <button
                    type="button"
                    disabled={group.page >= group.pageCount}
                    onClick={() => setCategoryPage(group.id, group.page + 1)}
                    className="rounded-xl border border-relic/30 bg-relic/10 px-4 py-2 text-sm font-bold text-relic transition hover:border-relic hover:bg-relic/20 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    {t.next}
                  </button>
                </div>
              </div>
            ) : null}
          </section>
        ))}
        {visibleGroups.length === 0 ? <GlassPanel className="p-6 text-sm text-zinc-400">{t.noItems}</GlassPanel> : null}
      </div>

      <p className="mt-6 rounded-2xl border border-relic/20 bg-relic/[0.06] p-4 text-xs leading-5 text-zinc-400">{t.storeNote}</p>

      {selectedAccount ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[24px] border border-relic/25 bg-[#070d16] shadow-2xl">
            <div
              className="relative min-h-[360px] bg-gradient-to-br from-[#111827] via-[#24111b] to-[#3b1c0f] bg-cover bg-center"
              style={
                selectedAccount.screenshotUrl
                  ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.02), rgba(0,0,0,0.8)), url(${selectedAccount.screenshotUrl})` }
                  : undefined
              }
            >
              <button
                type="button"
                onClick={() => setSelectedAccount(null)}
                className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-xl border border-relic/35 bg-black/70 text-zinc-300 hover:text-white"
                aria-label={t.close}
              >
                <X size={18} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7">
                <p className="text-xs uppercase tracking-[0.24em] text-relic">{t.eyebrow}</p>
                <h2 className="mt-2 max-w-3xl text-4xl font-black text-white">{selectedAccount.title}</h2>
              </div>
            </div>
            <div className="grid gap-5 p-5 lg:grid-cols-[1fr_320px]">
              <div>
                <p className="whitespace-pre-wrap text-sm leading-7 text-zinc-300">{selectedAccount.description || t.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {[...(selectedAccount.heroes ?? []), ...selectedAccount.tags].map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">
                      {tag}
                    </span>
                  ))}
                </div>
                {(selectedAccount.galleryUrls ?? []).length > 0 ? (
                  <div className="mt-6">
                    <h3 className="text-lg font-black text-white">{t.screenshots}</h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      {(selectedAccount.galleryUrls ?? []).slice(0, 5).map((url, index) => (
                        <button
                          key={url}
                          type="button"
                          onClick={() => setPreviewImage(url)}
                          className="aspect-video overflow-hidden rounded-[14px] border border-white/10 bg-cover bg-center transition hover:border-relic/50"
                          style={{ backgroundImage: `url(${url})` }}
                          aria-label={`Account screenshot ${index + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="rounded-[20px] border border-relic/20 bg-relic/[0.06] p-5">
                <p className="text-4xl font-black text-relic">{formatPrice(selectedAccount.price)} ₽</p>
                <div className="mt-5 grid gap-2 text-sm">
                  <p className="flex items-center justify-between border-b border-white/10 pb-2 text-zinc-400">
                    <span>{t.level}</span>
                    <b className="text-white">{selectedAccount.level}</b>
                  </p>
                  <p className="flex items-center justify-between border-b border-white/10 pb-2 text-zinc-400">
                    <span>{t.mythical}</span>
                    <b className="text-white">{selectedAccount.mythicCount ?? 0}</b>
                  </p>
                  <p className="flex items-center justify-between border-b border-white/10 pb-2 text-zinc-400">
                    <span>{t.legendary}</span>
                    <b className="text-white">{selectedAccount.legendaryCount}</b>
                  </p>
                  <p className="flex items-center justify-between border-b border-white/10 pb-2 text-zinc-400">
                    <span>{t.void}</span>
                    <b className="text-white">{selectedAccount.voidCount}</b>
                  </p>
                  {selectedAccount.power ? (
                    <p className="flex items-center justify-between border-b border-white/10 pb-2 text-zinc-400">
                      <span>{t.power}</span>
                      <b className="text-white">{formatPrice(selectedAccount.power)}</b>
                    </p>
                  ) : null}
                  <p className="flex items-center justify-between border-b border-white/10 pb-2 text-zinc-400">
                    <span>Score</span>
                    <b className="text-white">{accountScore(selectedAccount)}</b>
                  </p>
                </div>
                <a href="/chat" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-relic px-4 py-3 font-bold text-black">
                  <ShieldCheck size={16} />
                  {t.reserve}
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {previewImage ? (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/[0.86] px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="relative h-[92dvh] w-full max-w-5xl overflow-hidden rounded-[18px] border border-relic/25 bg-black bg-contain bg-center bg-no-repeat shadow-2xl" style={{ backgroundImage: `url(${previewImage})` }}>
            <button
              type="button"
              onClick={() => setPreviewImage("")}
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-[14px] border border-relic/35 bg-black/70 text-zinc-300 hover:text-white"
              aria-label={t.close}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
