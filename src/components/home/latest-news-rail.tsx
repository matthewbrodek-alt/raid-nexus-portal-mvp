"use client";

import { Clock3, X } from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

type NewsItem = {
  id: string;
  title?: string;
  summary?: string;
  markdownBody?: string;
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
    title: "Выпил колу",
    summary: "Банка колы",
    markdownBody: "Первая новость портала. Добавьте реальные новости через админ-панель Content Forge."
  },
  {
    id: "fallback-2",
    title: "Новый портал открыт",
    summary: "Новости, герои, заявки и чат собраны в одном игровом центре.",
    markdownBody: "Опубликуйте новость через админ-панель, и она появится в этом блоке."
  }
];

function getNewsImage(item: NewsItem) {
  return item.coverImage?.secureUrl ?? item.coverImage?.url ?? "";
}

function formatNewsDate(item: NewsItem) {
  const seconds = item.publishedAt?.seconds ?? item.createdAt?.seconds;

  if (!seconds) {
    return "24 часа назад";
  }

  return new Intl.RelativeTimeFormat("ru-RU", { numeric: "auto" }).format(
    Math.max(-24, Math.round((seconds * 1000 - Date.now()) / 3600000)),
    "hour"
  );
}

export function LatestNewsRail() {
  const [news, setNews] = useState<NewsItem[]>(fallbackNews);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const featured = news[0] ?? fallbackNews[0];
  const featuredImage = getNewsImage(featured);

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
    <>
      <div className="raid-ornate-panel raid-news-hero min-h-[430px] overflow-hidden p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-relic">Stay Updated</p>
            <h2 className="raid-title-metal mt-4 max-w-lg text-4xl uppercase leading-none sm:text-5xl">
              Последние новости
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setSelectedNews(featured)}
            className="raid-glow-button hidden shrink-0 border border-relic/35 bg-black/28 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-relic sm:block"
          >
            <span>Все новости</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setSelectedNews(featured)}
          className="raid-glow-button mt-7 grid min-h-[170px] w-full overflow-hidden border border-relic/35 bg-black/42 text-left sm:grid-cols-[250px_1fr]"
        >
          <span
            className="min-h-[170px] bg-gradient-to-br from-[#16090c] via-[#111827] to-[#51301a] bg-cover bg-center"
            style={
              featuredImage
                ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.42)), url(${featuredImage})` }
                : { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.46)), url("/images/raid-castle-bg.png")` }
            }
          />
          <span className="flex min-w-0 flex-col justify-center p-5 sm:p-7">
            <span className="font-[var(--font-cinzel)] text-2xl font-black uppercase leading-tight text-white sm:text-3xl">
              {featured.title}
            </span>
            <span className="mt-3 line-clamp-2 text-base leading-7 text-zinc-300">{featured.summary}</span>
            <span className="mt-4 inline-flex items-center gap-2 text-sm text-zinc-500">
              <Clock3 size={16} />
              {formatNewsDate(featured)}
            </span>
          </span>
        </button>

        <div className="mt-7 flex justify-center gap-3">
          {news.slice(0, 5).map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedNews(item)}
              className={`h-2.5 w-2.5 rounded-full transition ${index === 0 ? "bg-[#ffe1a0]" : "bg-zinc-500/45 hover:bg-relic"}`}
              aria-label={`Открыть новость ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {selectedNews ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 px-3 py-5 backdrop-blur-sm sm:px-4 sm:py-8" role="dialog" aria-modal="true">
          <div className="flex min-h-full items-center justify-center">
            <div className="raid-ornate-panel mx-auto grid max-h-[calc(100dvh-40px)] w-full max-w-5xl overflow-y-auto bg-[#071019]">
              <div className="bg-gradient-to-br from-[#16090c] via-[#111827] to-[#352012]">
                <div className="flex items-start justify-between gap-4 p-4 sm:p-6">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.34em] text-relic">{formatNewsDate(selectedNews)}</p>
                    <h2 className="raid-title-metal mt-2 text-2xl font-black leading-tight sm:text-4xl">{selectedNews.title}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedNews(null)}
                    className="grid h-10 w-10 shrink-0 place-items-center border border-relic/40 bg-black/45 text-zinc-300 transition hover:text-white"
                    aria-label="Закрыть новость"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="border-y border-relic/20 bg-black/35">
                  <img
                    src={getNewsImage(selectedNews) || "/images/raid-castle-bg.png"}
                    alt={selectedNews.title ?? "News image"}
                    className="mx-auto max-h-[56dvh] w-full object-contain"
                  />
                </div>
              </div>
              <div className="p-5 sm:p-8">
                <p className="max-w-3xl text-base leading-7 text-zinc-200">{selectedNews.summary}</p>
                <h3 className="raid-title-metal mt-6 text-2xl font-black">Подробности</h3>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                  {selectedNews.markdownBody || selectedNews.summary || "Описание новости пока не заполнено."}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
