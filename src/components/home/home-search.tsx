"use client";

import Link from "next/link";
import { collection, limit, onSnapshot, query, where } from "firebase/firestore";
import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

type SearchItem = {
  id: string;
  type: string;
  title: string;
  description: string;
  href: string;
};

type FirestoreNews = {
  title?: string;
  summary?: string;
  markdownBody?: string;
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

const staticItems: SearchItem[] = [
  { id: "page-news", type: "Раздел", title: "Новости", description: "Последние новости портала", href: "/#news" },
  { id: "page-heroes", type: "Раздел", title: "Герои", description: "База героев, фракции, роли и галерея", href: "/heroes" },
  { id: "page-market", type: "Раздел", title: "Маркет", description: "Лоты, аккаунты и предложения", href: "/marketplace" },
  { id: "page-clans", type: "Раздел", title: "Кланы", description: "Объявления участников и набор в кланы", href: "/clans" },
  { id: "page-topup", type: "Раздел", title: "Донат", description: "Заявка на покупку набора через менеджера", href: "/topup" },
  { id: "page-useful", type: "Раздел", title: "Полезное", description: "Гайды и калькуляторы", href: "/useful" },
  { id: "page-chat", type: "Раздел", title: "Чат", description: "Общий чат и личные сообщения", href: "/chat" }
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function matches(item: SearchItem, queryText: string) {
  return normalize(`${item.title} ${item.description} ${item.type}`).includes(queryText);
}

export function HomeSearch() {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const [items, setItems] = useState<SearchItem[]>(staticItems);

  useEffect(() => {
    const unsubscribers = [
      onSnapshot(query(collection(db, collections.news), where("status", "==", "published"), limit(20)), (snapshot) => {
        const newsItems = snapshot.docs.map((item) => {
          const data = item.data() as FirestoreNews;
          return {
            id: `news-${item.id}`,
            type: "Новость",
            title: data.title || "Новость",
            description: data.summary || data.markdownBody || "Материал из новостей",
            href: "/#news"
          };
        });

        setItems((current) => [...current.filter((item) => !item.id.startsWith("news-")), ...newsItems]);
      }),
      onSnapshot(query(collection(db, collections.heroes), where("isPublished", "==", true), limit(40)), (snapshot) => {
        const heroItems = snapshot.docs.map((item) => {
          const data = item.data() as FirestoreHero;
          return {
            id: `hero-${item.id}`,
            type: "Герой",
            title: data.name || "Герой",
            description: [data.faction, data.role, data.markdownComment].filter(Boolean).join(" · ") || "Карточка героя",
            href: "/heroes"
          };
        });

        setItems((current) => [...current.filter((item) => !item.id.startsWith("hero-")), ...heroItems]);
      }),
      onSnapshot(query(collection(db, collections.marketplaceAccounts), where("status", "in", ["available", "reserved"]), limit(30)), (snapshot) => {
        const marketItems = snapshot.docs.map((item) => {
          const data = item.data() as FirestoreMarketLot;
          return {
            id: `market-${item.id}`,
            type: "Маркет",
            title: data.title || "Лот маркета",
            description: data.description || [...(data.tags ?? []), ...(data.heroes ?? [])].join(", ") || "Лот на продаже",
            href: "/marketplace"
          };
        });

        setItems((current) => [...current.filter((item) => !item.id.startsWith("market-")), ...marketItems]);
      })
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, []);

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
          placeholder="Поиск по порталу..."
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
            <div className="p-4 text-sm text-zinc-400">Ничего не найдено.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
