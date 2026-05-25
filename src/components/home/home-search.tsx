"use client";

import Link from "next/link";
import { collection, limit, onSnapshot, query, where } from "firebase/firestore";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { useLanguage, type Language } from "@/lib/i18n/use-language";

type SearchItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  href: string;
};

type FirestoreNews = {
  title?: string;
  titleEn?: string;
  summary?: string;
  summaryEn?: string;
  markdownBody?: string;
  markdownBodyEn?: string;
};

type FirestoreHero = {
  name?: string;
  faction?: string;
  role?: string;
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
    newsDescription: string;
    heroesDescription: string;
    marketDescription: string;
    clansDescription: string;
    donateDescription: string;
    usefulDescription: string;
    chatDescription: string;
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
    newsDescription: "Последние новости портала",
    heroesDescription: "База героев, фракции, роли и сборки",
    marketDescription: "Лоты, аккаунты и предложения",
    clansDescription: "Объявления участников и набор в кланы",
    donateDescription: "Заявка на покупку набора через менеджера",
    usefulDescription: "Гайды и калькуляторы",
    chatDescription: "Общий чат и личные сообщения",
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
    newsDescription: "Latest portal news",
    heroesDescription: "Hero database, factions, roles and builds",
    marketDescription: "Lots, accounts and offers",
    clansDescription: "Member announcements and clan recruiting",
    donateDescription: "Request a pack purchase through a manager",
    usefulDescription: "Guides and calculators",
    chatDescription: "Global chat and direct messages",
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
    { id: "page-news", type: labels.section, title: labels.news, description: labels.newsDescription, href: "/#news" },
    { id: "page-heroes", type: labels.section, title: labels.heroes, description: labels.heroesDescription, href: "/heroes" },
    { id: "page-market", type: labels.section, title: labels.market, description: labels.marketDescription, href: "/marketplace" },
    { id: "page-clans", type: labels.section, title: labels.clans, description: labels.clansDescription, href: "/clans" },
    { id: "page-topup", type: labels.section, title: labels.donate, description: labels.donateDescription, href: "/topup" },
    { id: "page-useful", type: labels.section, title: labels.useful, description: labels.usefulDescription, href: "/useful" },
    { id: "page-chat", type: labels.section, title: labels.chat, description: labels.chatDescription, href: "/chat" }
  ];
}

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function matches(item: SearchItem, queryText: string) {
  return normalize(`${item.title} ${item.description} ${item.type}`).includes(queryText);
}

export function HomeSearch() {
  const { language } = useLanguage();
  const labels = copy[language];
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [dynamicItems, setDynamicItems] = useState<SearchItem[]>([]);

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
            description:
              (language === "en" ? data.summaryEn || data.markdownBodyEn || data.summary || data.markdownBody : data.summary || data.markdownBody || data.summaryEn || data.markdownBodyEn) ||
              labels.newsDescription,
            href: "/#news"
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
            title: data.name || labels.defaultHero,
            description: [data.faction, data.role, data.markdownComment].filter(Boolean).join(" · ") || labels.heroesDescription,
            href: "/heroes"
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
            href: "/marketplace"
          };
        });

        setDynamicItems((current) => [...current.filter((item) => !item.id.startsWith("market-")), ...marketItems]);
      }, () => removeDynamicItems("market-"))
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [labels, language]);

  const items = useMemo(() => [...getStaticItems(language), ...dynamicItems], [dynamicItems, language]);
  const queryText = normalize(value);
  const results = useMemo(() => {
    if (!queryText) {
      return items.slice(0, 6);
    }

    return items.filter((item) => matches(item, queryText)).slice(0, 8);
  }, [items, queryText]);

  return (
    <div className="relative w-full max-w-[540px]">
      <label className="flex h-14 items-center gap-3 rounded-[16px] border border-relic/24 bg-black/34 px-5 text-zinc-500 shadow-[inset_0_0_20px_rgba(216,168,71,0.03)]">
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

      {focused ? (
        <div
          className="absolute left-0 right-0 top-[calc(100%+10px)] z-50 overflow-hidden rounded-[18px] border border-relic/24 bg-[#03090f]/96 shadow-[0_18px_48px_rgba(0,0,0,0.48)] backdrop-blur-xl"
          onMouseDown={(event) => event.preventDefault()}
        >
          {results.length > 0 ? (
            <div className="max-h-[360px] overflow-y-auto p-2">
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
      ) : null}
    </div>
  );
}
