"use client";

import Link from "next/link";
import { collection, limit, onSnapshot, query, where } from "firebase/firestore";
import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { getChampionRussianNameByEnglish } from "@/lib/data/champion-localization";
import { gestalChampions } from "@/lib/data/gestal-champions";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { useLanguage, type Language } from "@/lib/i18n/use-language";

type SearchItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  href: string;
  keywords?: string[];
};

type FirestoreNews = {
  title?: string;
  titleEn?: string;
  markdownBody?: string;
  markdownBodyEn?: string;
};

type FirestoreHero = {
  name?: string;
  nameRu?: string;
  nameEn?: string;
  faction?: string;
  rarity?: string;
  role?: string;
  affinity?: string;
  aliases?: string[];
  markdownComment?: string;
};

type FirestoreMarketLot = {
  title?: string;
  description?: string;
  tags?: string[];
  heroes?: string[];
};

const copy: Record<
  Language,
  {
    placeholder: string;
    section: string;
    news: string;
    heroes: string;
    market: string;
    clans: string;
    donate: string;
    useful: string;
    chat: string;
    stream: string;
    newsDescription: string;
    heroesDescription: string;
    marketDescription: string;
    clansDescription: string;
    donateDescription: string;
    usefulDescription: string;
    chatDescription: string;
    streamDescription: string;
    newsType: string;
    heroType: string;
    marketType: string;
    defaultNews: string;
    defaultHero: string;
    defaultMarket: string;
    noResults: string;
  }
> = {
  ru: {
    placeholder: "Поиск по порталу...",
    section: "Раздел",
    news: "Новости",
    heroes: "Герои",
    market: "Покупка аккаунта",
    clans: "Кланы",
    donate: "Донат",
    useful: "Полезное",
    chat: "Чат",
    stream: "Эфир",
    newsDescription: "Свежие новости портала",
    heroesDescription: "База героев, фракции, роли и сборки",
    marketDescription: "Лоты, аккаунты и предложения",
    clansDescription: "Объявления участников и набор в кланы",
    donateDescription: "Заявка на покупку набора через менеджера",
    usefulDescription: "Гайды и калькуляторы",
    chatDescription: "Общий чат и личные сообщения",
    streamDescription: "Актуальная трансляция портала",
    newsType: "Новость",
    heroType: "Герой",
    marketType: "Аккаунт",
    defaultNews: "Новость",
    defaultHero: "Герой",
    defaultMarket: "Лот аккаунта",
    noResults: "Ничего не найдено."
  },
  en: {
    placeholder: "Search the portal...",
    section: "Section",
    news: "News",
    heroes: "Heroes",
    market: "Account Purchase",
    clans: "Clans",
    donate: "Donate",
    useful: "Useful",
    chat: "Chat",
    stream: "Live",
    newsDescription: "Latest portal news",
    heroesDescription: "Hero database, factions, roles and builds",
    marketDescription: "Lots, accounts and offers",
    clansDescription: "Member announcements and clan recruiting",
    donateDescription: "Request a pack purchase through a manager",
    usefulDescription: "Guides and calculators",
    chatDescription: "Global chat and direct messages",
    streamDescription: "Current portal stream",
    newsType: "News",
    heroType: "Hero",
    marketType: "Account",
    defaultNews: "News item",
    defaultHero: "Hero",
    defaultMarket: "Account lot",
    noResults: "Nothing found."
  }
};

function getStaticItems(language: Language): SearchItem[] {
  const labels = copy[language];

  return [
    { id: "page-news", type: labels.section, title: labels.news, description: labels.newsDescription, href: "/#news", keywords: ["свежие новости", "новости", "articles", "latest news", "news"] },
    { id: "page-heroes", type: labels.section, title: labels.heroes, description: labels.heroesDescription, href: "/heroes", keywords: ["герои", "герой", "чемпионы", "персонажи", "база героев", "heroes", "champions", "arbiter", "siphi", "taras"] },
    { id: "page-market", type: labels.section, title: labels.market, description: labels.marketDescription, href: "/marketplace", keywords: ["покупка аккаунта", "аккаунты", "стартовый аккаунт", "осколки", "market", "account", "shards"] },
    { id: "page-clans", type: labels.section, title: labels.clans, description: labels.clansDescription, href: "/clans", keywords: ["кланы", "клан", "гильдии", "объявления", "clans", "guilds"] },
    { id: "page-topup", type: labels.section, title: labels.donate, description: labels.donateDescription, href: "/topup", keywords: ["донат", "купить игровой набор", "набор", "рубины", "bumpy coins", "donate", "topup", "pack"] },
    { id: "page-useful", type: labels.section, title: labels.useful, description: labels.usefulDescription, href: "/useful", keywords: ["полезное", "гайды", "калькулятор", "арена", "урон", "hellhades", "gestal", "guides", "calculator"] },
    { id: "page-chat", type: labels.section, title: labels.chat, description: labels.chatDescription, href: "/chat", keywords: ["чат", "сообщения", "личные сообщения", "общий чат", "chat", "messages"] },
    { id: "page-stream", type: labels.section, title: labels.stream, description: labels.streamDescription, href: "/stream", keywords: ["эфир", "трансляция", "стрим", "live", "stream"] },
    { id: "page-raffle", type: labels.section, title: language === "en" ? "Ruby giveaway" : "Розыгрыш рубинов", description: language === "en" ? "Raffle page with the Macheha click event" : "Страница розыгрыша с кликами по мачехе", href: "/raffle", keywords: ["розыгрыш", "розыгрыш рубинов", "мачеха", "пузико", "потыкай", "giveaway", "raffle", "rubies"] }
  ];
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function matches(item: SearchItem, queryText: string) {
  const haystack = normalize(`${item.title} ${item.description} ${item.type} ${(item.keywords ?? []).join(" ")}`);
  const queryParts = queryText.split(/\s+/).filter(Boolean);

  return haystack.includes(queryText) || queryParts.every((part) => haystack.includes(part));
}

export function HomeSearch() {
  const { language } = useLanguage();
  const labels = copy[language];
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [dynamicItems, setDynamicItems] = useState<SearchItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [dropdownBounds, setDropdownBounds] = useState<{ left: number; top: number; width: number } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!focused) {
      return;
    }

    function updateDropdownBounds() {
      const node = containerRef.current;

      if (!node) {
        return;
      }

      const rect = node.getBoundingClientRect();
      setDropdownBounds({
        left: rect.left,
        top: rect.bottom + 10,
        width: rect.width
      });
    }

    updateDropdownBounds();
    window.addEventListener("resize", updateDropdownBounds);
    window.addEventListener("scroll", updateDropdownBounds, true);

    return () => {
      window.removeEventListener("resize", updateDropdownBounds);
      window.removeEventListener("scroll", updateDropdownBounds, true);
    };
  }, [focused, value]);

  useEffect(() => {
    const removeDynamicItems = (prefix: string) => {
      setDynamicItems((current) => current.filter((item) => !item.id.startsWith(prefix)));
    };

    const unsubscribers = [
      onSnapshot(query(collection(db, collections.news), where("status", "==", "published"), limit(20)), (snapshot) => {
        const newsItems = snapshot.docs.map((item) => {
          const data = item.data() as FirestoreNews;
          return {
            id: `news-${item.id}`,
            type: labels.newsType,
            title: language === "en" ? data.titleEn || data.title || labels.defaultNews : data.title || data.titleEn || labels.defaultNews,
            description: (language === "en" ? data.markdownBodyEn || data.markdownBody : data.markdownBody || data.markdownBodyEn) || labels.newsDescription,
            href: `/?news=${item.id}`,
            keywords: ["news", "новости", data.title, data.titleEn, data.markdownBody, data.markdownBodyEn].filter(Boolean) as string[]
          };
        });

        setDynamicItems((current) => [...current.filter((item) => !item.id.startsWith("news-")), ...newsItems]);
      }, () => removeDynamicItems("news-")),
      onSnapshot(query(collection(db, collections.heroes), where("isPublished", "==", true), limit(40)), (snapshot) => {
        const heroItems = snapshot.docs.map((item) => {
          const data = item.data() as FirestoreHero;
          return {
            id: `hero-${item.id}`,
            type: labels.heroType,
            title: language === "en" ? data.nameEn || data.name || data.nameRu || labels.defaultHero : data.nameRu || data.name || data.nameEn || labels.defaultHero,
            description: [data.faction, data.rarity, data.role, data.affinity, data.markdownComment].filter(Boolean).join(" · ") || labels.heroesDescription,
            href: "/heroes",
            keywords: [data.name, data.nameRu, data.nameEn, data.faction, data.rarity, data.role, data.affinity, ...(data.aliases ?? [])].filter(Boolean) as string[]
          };
        });

        setDynamicItems((current) => [...current.filter((item) => !item.id.startsWith("hero-")), ...heroItems]);
      }, () => removeDynamicItems("hero-")),
      onSnapshot(query(collection(db, collections.marketplaceAccounts), where("status", "in", ["available", "reserved"]), limit(30)), (snapshot) => {
        const marketItems = snapshot.docs.map((item) => {
          const data = item.data() as FirestoreMarketLot;
          return {
            id: `market-${item.id}`,
            type: labels.marketType,
            title: data.title || labels.defaultMarket,
            description: data.description || [...(data.tags ?? []), ...(data.heroes ?? [])].join(", ") || labels.marketDescription,
            href: "/marketplace",
            keywords: [data.title, data.description, ...(data.tags ?? []), ...(data.heroes ?? [])].filter(Boolean) as string[]
          };
        });

        setDynamicItems((current) => [...current.filter((item) => !item.id.startsWith("market-")), ...marketItems]);
      }, () => removeDynamicItems("market-"))
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [labels, language]);

  const localHeroItems = useMemo<SearchItem[]>(
    () =>
      gestalChampions.map((champion) => {
        const russianName = getChampionRussianNameByEnglish(champion.name);
        const title = language === "en" ? champion.name : russianName;
        const description = [champion.faction, champion.rarity, champion.affinity, ...champion.roles].filter(Boolean).join(" · ");

        return {
          id: `local-hero-${champion.slug}`,
          type: labels.heroType,
          title,
          description: description || labels.heroesDescription,
          href: `/heroes?search=${encodeURIComponent(title)}`,
          keywords: [champion.name, champion.shortName, russianName, champion.slug, champion.faction, champion.rarity, champion.affinity, champion.aura, ...champion.roles].filter(Boolean)
        };
      }),
    [labels.heroType, labels.heroesDescription, language]
  );
  const items = useMemo(() => [...getStaticItems(language), ...localHeroItems, ...dynamicItems], [dynamicItems, language, localHeroItems]);
  const queryText = normalize(value);
  const results = useMemo(() => {
    if (!queryText) {
      return items.slice(0, 6);
    }

    return items.filter((item) => matches(item, queryText)).slice(0, 8);
  }, [items, queryText]);

  const dropdown =
    focused && dropdownBounds ? (
      <div
        className="fixed z-[240] overflow-hidden rounded-[18px] border border-relic/24 bg-[#03090f]/96 shadow-[0_18px_48px_rgba(0,0,0,0.48)] backdrop-blur-xl"
        style={{ left: dropdownBounds.left, top: dropdownBounds.top, width: dropdownBounds.width }}
        onMouseDown={(event) => event.preventDefault()}
      >
        {results.length > 0 ? (
          <div className="max-h-[min(360px,calc(100dvh-120px))] overflow-y-auto p-2">
            {results.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setFocused(false)}
                className="block rounded-[14px] border border-transparent px-4 py-3 transition hover:border-relic/30 hover:bg-relic/10"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-relic">{item.type}</span>
                <span className="mt-1 block font-semibold text-white">{item.title}</span>
                <span className="mt-1 block max-h-10 overflow-hidden text-xs leading-5 text-zinc-400">{item.description}</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-4 text-sm text-zinc-400">{labels.noResults}</div>
        )}
      </div>
    ) : null;

  return (
    <div ref={containerRef} className="relative w-full max-w-[540px]">
      <label className="flex h-14 items-center gap-3 rounded-[16px] border border-relic/24 bg-black/34 px-5 text-zinc-500 shadow-[inset_0_0_20px_rgba(47,124,255,0.03)]">
        <input
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => window.setTimeout(() => setFocused(false), 120)}
          className="min-w-0 flex-1 border-0 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-500 focus:ring-0"
          placeholder={labels.placeholder}
        />
        <Search size={20} />
      </label>
      {mounted && dropdown ? createPortal(dropdown, document.body) : null}
    </div>
  );
}
