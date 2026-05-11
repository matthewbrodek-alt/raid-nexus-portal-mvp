"use client";

import Link from "next/link";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

type NewsItem = {
  id: string;
  title?: string;
  summary?: string;
  slug?: string;
  publishedAt?: { seconds?: number };
  createdAt?: { seconds?: number };
  coverImage?: {
    secureUrl?: string;
    url?: string;
  } | null;
};

const fallbackNews: NewsItem[] = [
  {
    id: "fallback-1",
    title: "Добро пожаловать в Raid Nexus",
    summary: "Новости из Hero-секции появятся здесь после публикации из админ-панели."
  },
  {
    id: "fallback-2",
    title: "Hero DB готова к пополнению",
    summary: "Добавляй героев с фото, галереей и описанием через Content Forge."
  },
  {
    id: "fallback-3",
    title: "Чат портала открыт",
    summary: "Общий чат и личные сообщения доступны участникам после входа."
  }
];

export function LatestNewsRail() {
  const [news, setNews] = useState<NewsItem[]>(fallbackNews);

  useEffect(() => {
    const newsQuery = query(collection(db, collections.news), where("status", "==", "published"));

    return onSnapshot(newsQuery, (snapshot) => {
      const items = snapshot.docs
        .map((item) => ({ id: item.id, ...(item.data() as Omit<NewsItem, "id">) }))
        .sort((a, b) => (b.publishedAt?.seconds ?? b.createdAt?.seconds ?? 0) - (a.publishedAt?.seconds ?? a.createdAt?.seconds ?? 0))
        .slice(0, 10);
      setNews(items.length ? items : fallbackNews);
    });
  }, []);

  return (
    <GlassPanel className="overflow-hidden p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-relic">Latest News</p>
          <h2 className="text-xl font-bold text-white">Последние новости</h2>
        </div>
        <Link href="/useful" className="shrink-0 rounded-md border border-relic/30 px-3 py-2 text-xs font-bold text-relic hover:bg-relic/10">
          Все
        </Link>
      </div>

      <div className="raid-news-marquee max-h-[430px] overflow-hidden">
        <div className="raid-news-track space-y-3">
          {[...news, ...news].slice(0, Math.max(news.length * 2, 6)).map((item, index) => (
            <Link
              key={`${item.id}-${index}`}
              href={item.slug ? `/useful#${item.slug}` : "/useful"}
              className="grid grid-cols-[88px_1fr] gap-3 rounded-lg border border-white/10 bg-black/25 p-3 transition hover:border-relic/40 hover:bg-white/[0.05]"
            >
              <div
                className="h-20 rounded-md bg-gradient-to-br from-violet-900 via-slate-900 to-amber-900 bg-cover bg-center"
                style={
                  item.coverImage?.secureUrl || item.coverImage?.url
                    ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.45)), url(${item.coverImage.secureUrl ?? item.coverImage.url})` }
                    : undefined
                }
              />
              <div className="min-w-0">
                <h3 className="line-clamp-2 text-sm font-bold text-white">{item.title}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400">{item.summary}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}
