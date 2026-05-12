"use client";

import { Eye, Filter, MessageSquare, ShieldCheck, SlidersHorizontal } from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { marketplaceHighlights } from "@/lib/data/mock";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { useLanguage } from "@/lib/i18n/use-language";
import type { MarketplaceAccount } from "@/lib/types";

type FirestoreMarketplaceAccount = MarketplaceAccount & {
  screenshot?: { secureUrl?: string; url?: string } | null;
  createdAt?: { seconds?: number };
};

const copy = {
  ru: {
    eyebrow: "Аккаунты Raid",
    title: "Прокаченные аккаунты",
    description: "Готовые армии с легендарными героями, ресурсами, скриншотами и честным описанием состава.",
    search: "Поиск по героям, тегам, описанию",
    minLegendary: "Легендарки от",
    minVoid: "Void от",
    minLevel: "Уровень от",
    maxPrice: "Цена до",
    filters: "Фильтры",
    reset: "Сбросить",
    level: "Уровень",
    legendary: "Легендарные",
    void: "Void",
    power: "Сила",
    reserve: "Связаться с менеджером",
    details: "Смотреть описание",
    available: "В наличии",
    reserved: "Резерв",
    sold: "Продан",
    noItems: "Лотов по этим фильтрам пока нет.",
    source: "По логике витрины ориентировано на каталог raid-store.ru: фильтры, скриншот, характеристики, описание и быстрый контакт."
  },
  en: {
    eyebrow: "Raid accounts",
    title: "Upgraded accounts",
    description: "Ready armies with legendary champions, resources, screenshots and clear account descriptions.",
    search: "Search heroes, tags, description",
    minLegendary: "Legendary from",
    minVoid: "Void from",
    minLevel: "Level from",
    maxPrice: "Max price",
    filters: "Filters",
    reset: "Reset",
    level: "Level",
    legendary: "Legendary",
    void: "Void",
    power: "Power",
    reserve: "Contact manager",
    details: "View details",
    available: "Available",
    reserved: "Reserved",
    sold: "Sold",
    noItems: "No lots match these filters yet.",
    source: "Storefront logic follows the raid-store.ru catalog pattern: filters, screenshot, stats, description and quick contact."
  }
};

function normalizeAccount(item: FirestoreMarketplaceAccount): MarketplaceAccount {
  return {
    ...item,
    screenshotUrl: item.screenshotUrl ?? item.screenshot?.secureUrl ?? item.screenshot?.url,
    status: item.status ?? "available",
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

export function MarketplaceBoard() {
  const { language } = useLanguage();
  const t = copy[language];
  const [accounts, setAccounts] = useState<MarketplaceAccount[]>(marketplaceHighlights.map((item) => ({ ...item, status: "available" as const })));
  const [search, setSearch] = useState("");
  const [minLegendary, setMinLegendary] = useState("");
  const [minVoid, setMinVoid] = useState("");
  const [minLevel, setMinLevel] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<MarketplaceAccount | null>(null);

  useEffect(() => {
    const accountsQuery = query(collection(db, collections.marketplaceAccounts), where("status", "in", ["available", "reserved"]));

    return onSnapshot(accountsQuery, (snapshot) => {
      const items = snapshot.docs
        .map((item) => normalizeAccount({ id: item.id, ...(item.data() as Omit<FirestoreMarketplaceAccount, "id">) }))
        .sort((a, b) => ((b as FirestoreMarketplaceAccount).createdAt?.seconds ?? 0) - ((a as FirestoreMarketplaceAccount).createdAt?.seconds ?? 0))
        .filter((item) => item.status !== "sold");
      setAccounts(items.length ? items : marketplaceHighlights.map((item) => ({ ...item, status: "available" as const })));
    });
  }, []);

  const filteredAccounts = useMemo(() => {
    const queryText = search.trim().toLowerCase();
    const legendary = Number(minLegendary) || 0;
    const voidCount = Number(minVoid) || 0;
    const level = Number(minLevel) || 0;
    const price = Number(maxPrice) || Number.POSITIVE_INFINITY;

    return accounts.filter((item) => {
      const haystack = `${item.title} ${item.description ?? ""} ${item.tags.join(" ")} ${(item.heroes ?? []).join(" ")}`.toLowerCase();

      return (
        (!queryText || haystack.includes(queryText)) &&
        item.legendaryCount >= legendary &&
        item.voidCount >= voidCount &&
        item.level >= level &&
        item.price <= price
      );
    });
  }, [accounts, maxPrice, minLegendary, minLevel, minVoid, search]);

  function resetFilters() {
    setSearch("");
    setMinLegendary("");
    setMinVoid("");
    setMinLevel("");
    setMaxPrice("");
  }

  return (
    <>
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_360px]">
        <GlassPanel className="p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-relic">{t.eyebrow}</p>
          <h2 className="mt-2 text-3xl font-black text-white">{t.title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300">{t.description}</p>
          <p className="mt-4 rounded-md border border-relic/20 bg-relic/[0.06] p-3 text-xs leading-5 text-zinc-400">{t.source}</p>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <SlidersHorizontal className="text-relic" />
            <h3 className="text-xl font-black text-white">{t.filters}</h3>
          </div>
          <div className="grid gap-3">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.search} className="rounded-md border-white/10 bg-black/40 text-sm text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
            <div className="grid gap-3 sm:grid-cols-2">
              <input type="number" value={minLegendary} onChange={(event) => setMinLegendary(event.target.value)} placeholder={t.minLegendary} className="rounded-md border-white/10 bg-black/40 text-sm text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
              <input type="number" value={minVoid} onChange={(event) => setMinVoid(event.target.value)} placeholder={t.minVoid} className="rounded-md border-white/10 bg-black/40 text-sm text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
              <input type="number" value={minLevel} onChange={(event) => setMinLevel(event.target.value)} placeholder={t.minLevel} className="rounded-md border-white/10 bg-black/40 text-sm text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
              <input type="number" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder={t.maxPrice} className="rounded-md border-white/10 bg-black/40 text-sm text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
            </div>
            <button type="button" onClick={resetFilters} className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:text-white">
              <Filter size={16} />
              {t.reset}
            </button>
          </div>
        </GlassPanel>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredAccounts.map((account) => (
          <GlassPanel key={account.id} className="overflow-hidden">
            <div
              className="aspect-[16/10] bg-gradient-to-br from-[#111827] via-[#24111b] to-[#3b1c0f] bg-cover bg-center"
              style={
                account.screenshotUrl
                  ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.54)), url(${account.screenshotUrl})` }
                  : undefined
              }
            />
            <div className="p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="line-clamp-2 text-xl font-black leading-tight text-white">{account.title}</h2>
                  <p className="mt-1 text-sm text-zinc-500">{statusLabel(account.status, t)}</p>
                </div>
                <p className="shrink-0 text-2xl font-black text-relic">{formatPrice(account.price)} RUB</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div className="rounded-md border border-white/10 bg-black/25 p-3">
                  <p className="text-zinc-500">{t.level}</p>
                  <p className="font-bold text-white">{account.level}</p>
                </div>
                <div className="rounded-md border border-white/10 bg-black/25 p-3">
                  <p className="text-zinc-500">{t.legendary}</p>
                  <p className="font-bold text-white">{account.legendaryCount}</p>
                </div>
                <div className="rounded-md border border-white/10 bg-black/25 p-3">
                  <p className="text-zinc-500">{t.void}</p>
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
                <button type="button" onClick={() => setSelectedAccount(account)} className="inline-flex items-center justify-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-zinc-300 transition hover:text-white">
                  <Eye size={16} />
                  {t.details}
                </button>
                <a href="/chat" className="inline-flex items-center justify-center gap-2 rounded-md bg-relic px-4 py-2 text-sm font-bold text-black transition hover:bg-[#f0c766]">
                  <MessageSquare size={16} />
                  {t.reserve}
                </a>
              </div>
            </div>
          </GlassPanel>
        ))}
      </div>

      {filteredAccounts.length === 0 ? (
        <GlassPanel className="mt-6 p-6 text-center text-zinc-400">{t.noItems}</GlassPanel>
      ) : null}

      {selectedAccount ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-[#0b101b] shadow-2xl">
            <div
              className="min-h-[360px] bg-gradient-to-br from-[#111827] via-[#24111b] to-[#3b1c0f] bg-cover bg-center"
              style={
                selectedAccount.screenshotUrl
                  ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.82)), url(${selectedAccount.screenshotUrl})` }
                  : undefined
              }
            />
            <div className="grid gap-5 p-5 lg:grid-cols-[1fr_320px]">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-relic">{t.eyebrow}</p>
                <h2 className="mt-2 text-3xl font-black text-white">{selectedAccount.title}</h2>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-300">{selectedAccount.description || t.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {[...(selectedAccount.heroes ?? []), ...selectedAccount.tags].map((tag) => (
                    <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-relic/20 bg-relic/[0.06] p-5">
                <p className="text-4xl font-black text-relic">{formatPrice(selectedAccount.price)} RUB</p>
                <div className="mt-5 grid gap-2 text-sm">
                  <p className="flex items-center justify-between border-b border-white/10 pb-2 text-zinc-400"><span>{t.level}</span><b className="text-white">{selectedAccount.level}</b></p>
                  <p className="flex items-center justify-between border-b border-white/10 pb-2 text-zinc-400"><span>{t.legendary}</span><b className="text-white">{selectedAccount.legendaryCount}</b></p>
                  <p className="flex items-center justify-between border-b border-white/10 pb-2 text-zinc-400"><span>{t.void}</span><b className="text-white">{selectedAccount.voidCount}</b></p>
                  {selectedAccount.power ? <p className="flex items-center justify-between border-b border-white/10 pb-2 text-zinc-400"><span>{t.power}</span><b className="text-white">{formatPrice(selectedAccount.power)}</b></p> : null}
                </div>
                <a href="/chat" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-relic px-4 py-3 font-bold text-black">
                  <ShieldCheck size={16} />
                  {t.reserve}
                </a>
                <button type="button" onClick={() => setSelectedAccount(null)} className="mt-2 w-full rounded-md border border-white/10 px-4 py-3 text-sm font-semibold text-zinc-300 hover:text-white">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
