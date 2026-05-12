"use client";

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

type NewsItem = {
  id: string;
  title?: string;
  summary?: string;
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
    title: "Raid Nexus готов к хроникам",
    summary: "Новости из админ-панели появятся здесь после публикации: события, герои, акции и важные объявления."
  },
  {
    id: "fallback-2",
    title: "База героев ждет пополнения",
    summary: "Добавляй героев с портретом, галереей и описанием через Content Forge."
  },
  {
    id: "fallback-3",
    title: "Личный чат открыт",
    summary: "Участники и админы могут вести диалоги по заявкам прямо на сайте."
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
    <GlassPanel className="overflow-hidden p-5 sm:p-6">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.22em] text-relic">Latest News</p>
        <h2 className="mt-1 text-2xl font-black text-white">Хроники портала</h2>
      </div>

      <div className="raid-news-marquee min-h-[520px] overflow-hidden rounded-lg border border-white/10 bg-black/20">
        <div className="raid-news-track flex w-max gap-4 p-4">
          {[...news, ...news].slice(0, Math.max(news.length * 2, 6)).map((item, index) => (
            <article
              key={`${item.id}-${index}`}
              className="grid h-[480px] w-[330px] shrink-0 grid-rows-[260px_1fr] overflow-hidden rounded-lg border border-white/10 bg-[#0c111d] shadow-xl transition hover:border-relic/40 hover:bg-white/[0.04] sm:w-[390px]"
            >
              <div
                className="bg-gradient-to-br from-violet-900 via-slate-900 to-amber-900 bg-cover bg-center"
                style={
                  item.coverImage?.secureUrl || item.coverImage?.url
                    ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.45)), url(${item.coverImage.secureUrl ?? item.coverImage.url})` }
                    : undefined
                }
              />
              <div className="min-w-0 p-4">
                <h3 className="line-clamp-3 text-xl font-black leading-tight text-white">{item.title}</h3>
                <p className="mt-3 line-clamp-5 text-sm leading-6 text-zinc-400">{item.summary}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}
