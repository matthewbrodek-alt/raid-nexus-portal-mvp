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
    title: "Новый портал открыт",
    summary: "Свежие новости, герои, заявки и чат теперь собраны в одной темной панели.",
    markdownBody:
      "Опубликуй первую новость через Content Forge. Она появится в этой ленте и откроется в игровом модальном окне без перехода на другую страницу."
  },
  {
    id: "fallback-2",
    title: "База героев готова к пополнению",
    summary: "Добавляй героев с портретом, галереей и комментарием администратора.",
    markdownBody:
      "После публикации герой будет доступен в Hero DB. Пользователи смогут открыть карточку, посмотреть описание и галерею."
  }
];

function getNewsImage(item: NewsItem) {
  return item.coverImage?.secureUrl ?? item.coverImage?.url ?? "";
}

function formatNewsDate(item: NewsItem) {
  const seconds = item.publishedAt?.seconds ?? item.createdAt?.seconds;

  if (!seconds) {
    return "1 ч. назад";
  }

  return new Intl.RelativeTimeFormat("ru-RU", { numeric: "auto" }).format(
    Math.max(-24, Math.round((seconds * 1000 - Date.now()) / 3600000)),
    "hour"
  );
}

export function LatestNewsRail() {
  const [news, setNews] = useState<NewsItem[]>(fallbackNews);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

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
      <div className="raid-ornate-panel p-4 sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.42em] text-relic">Latest News</p>
            <h2 className="mt-2 font-[var(--font-cinzel)] text-2xl font-black text-white sm:text-3xl">Последние новости</h2>
          </div>
          <button
            type="button"
            onClick={() => setSelectedNews(news[0] ?? null)}
            className="shrink-0 border border-relic/50 bg-black/25 px-3 py-2 text-xs font-black uppercase tracking-[0.14em] text-relic transition hover:bg-relic hover:text-black sm:px-5"
          >
            Все новости
          </button>
        </div>

        <div className="grid max-h-[700px] gap-3 overflow-y-auto pr-1">
          {news.slice(0, 5).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedNews(item)}
              className="group grid min-h-[150px] grid-cols-[118px_1fr] overflow-hidden border border-relic/25 bg-black/35 text-left transition hover:border-relic hover:bg-relic/[0.06] sm:grid-cols-[200px_1fr]"
            >
              <div
                className="h-full min-h-[150px] bg-gradient-to-br from-[#12070a] via-[#111827] to-[#51301a] bg-cover bg-center"
                style={
                  getNewsImage(item)
                    ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.52)), url(${getNewsImage(item)})` }
                    : undefined
                }
              />
              <div className="flex min-w-0 flex-col justify-center p-4 sm:p-5">
                <h3 className="line-clamp-2 text-xl font-black leading-tight text-white transition group-hover:text-relic">
                  {item.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-400">{item.summary}</p>
                <span className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-500">
                  <Clock3 size={16} />
                  {formatNewsDate(item)}
                </span>
              </div>
            </button>
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
                    <h2 className="mt-2 font-[var(--font-cinzel)] text-2xl font-black leading-tight text-white sm:text-4xl">{selectedNews.title}</h2>
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
                  {getNewsImage(selectedNews) ? (
                    <img
                      src={getNewsImage(selectedNews)}
                      alt={selectedNews.title ?? "News image"}
                      className="mx-auto max-h-[48dvh] w-full object-contain"
                    />
                  ) : (
                    <div className="grid min-h-[220px] place-items-center bg-gradient-to-br from-[#16090c] via-[#111827] to-[#352012] text-relic">
                      Raid Nexus
                    </div>
                  )}
                </div>
              </div>
              <div className="p-5 sm:p-8">
                <p className="max-w-3xl text-base leading-7 text-zinc-200">{selectedNews.summary}</p>
                <h3 className="mt-6 font-[var(--font-cinzel)] text-2xl font-black text-white">Подробности</h3>
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
