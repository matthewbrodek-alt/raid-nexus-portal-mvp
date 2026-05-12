"use client";

import { X } from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
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
    title: "Raid Nexus готов к хроникам",
    summary: "Новости из админ-панели появятся здесь после публикации: события, герои, акции и важные объявления.",
    markdownBody:
      "Опубликуй первую новость через Content Forge. Карточка попадет в горизонтальную ленту, а подробности будут открываться в отдельном окне."
  },
  {
    id: "fallback-2",
    title: "База героев ждет пополнения",
    summary: "Добавляй героев с портретом, галереей и описанием через Content Forge.",
    markdownBody:
      "После публикации герой будет доступен в Hero DB, а пользователи смогут открыть карточку с галереей и комментарием."
  },
  {
    id: "fallback-3",
    title: "Личный чат открыт",
    summary: "Участники и админы могут вести диалоги по заявкам прямо на сайте.",
    markdownBody:
      "Скриншоты, ответы на сообщения и быстрый переход из CRM помогают продолжать коммуникацию без потери контекста."
  }
];

function getNewsImage(item: NewsItem) {
  return item.coverImage?.secureUrl ?? item.coverImage?.url ?? "";
}

function formatNewsDate(item: NewsItem) {
  const seconds = item.publishedAt?.seconds ?? item.createdAt?.seconds;

  if (!seconds) {
    return "Raid Nexus";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(seconds * 1000));
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
      <GlassPanel className="overflow-hidden p-5 sm:p-6">
        <div className="mb-5">
          <p className="text-xs uppercase tracking-[0.22em] text-relic">Latest News</p>
          <h2 className="mt-1 text-2xl font-black text-white">Хроники портала</h2>
        </div>

        <div className="raid-news-marquee min-h-[520px] overflow-hidden rounded-lg border border-white/10 bg-black/20">
          <div className="raid-news-track flex w-max gap-4 p-4">
            {[...news, ...news].slice(0, Math.max(news.length * 2, 6)).map((item, index) => (
              <button
                key={`${item.id}-${index}`}
                type="button"
                onClick={() => setSelectedNews(item)}
                className="grid h-[480px] w-[330px] shrink-0 grid-rows-[260px_1fr] overflow-hidden rounded-lg border border-white/10 bg-[#0c111d] text-left shadow-xl transition hover:-translate-y-1 hover:border-relic/40 hover:bg-white/[0.04] sm:w-[390px]"
              >
                <div
                  className="bg-gradient-to-br from-violet-900 via-slate-900 to-amber-900 bg-cover bg-center"
                  style={
                    getNewsImage(item)
                      ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.05), rgba(0,0,0,0.45)), url(${getNewsImage(item)})` }
                      : undefined
                  }
                />
                <div className="min-w-0 p-4">
                  <p className="mb-2 text-xs uppercase tracking-[0.18em] text-relic">{formatNewsDate(item)}</p>
                  <h3 className="line-clamp-3 text-xl font-black leading-tight text-white">{item.title}</h3>
                  <p className="mt-3 line-clamp-5 text-sm leading-6 text-zinc-400">{item.summary}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </GlassPanel>

      {selectedNews ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-lg border border-white/10 bg-[#0b101b] shadow-2xl">
            <div
              className="min-h-[360px] bg-gradient-to-br from-[#180b10] via-[#101828] to-[#2d1613] bg-cover bg-center"
              style={
                getNewsImage(selectedNews)
                  ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.82)), url(${getNewsImage(selectedNews)})` }
                  : undefined
              }
            >
              <div className="flex min-h-[360px] flex-col justify-between p-5 sm:p-8">
                <button
                  type="button"
                  onClick={() => setSelectedNews(null)}
                  className="ml-auto grid h-10 w-10 place-items-center rounded-md border border-white/10 bg-black/35 text-zinc-300 transition hover:text-white"
                  aria-label="Закрыть новость"
                >
                  <X size={18} />
                </button>
                <div className="max-w-3xl">
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-relic">{formatNewsDate(selectedNews)}</p>
                  <h2 className="mt-3 text-3xl font-black leading-tight text-white sm:text-5xl">{selectedNews.title}</h2>
                  <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-200">{selectedNews.summary}</p>
                </div>
              </div>
            </div>
            <div className="grid gap-5 p-5 sm:p-8 lg:grid-cols-[1fr_280px]">
              <div className="rounded-lg border border-white/10 bg-white/[0.035] p-5">
                <h3 className="text-2xl font-black text-white">Подробности</h3>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                  {selectedNews.markdownBody || selectedNews.summary || "Описание новости пока не заполнено."}
                </p>
              </div>
              <div className="rounded-lg border border-relic/20 bg-relic/[0.06] p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-relic">Raid Nexus</p>
                <p className="mt-3 text-sm leading-6 text-zinc-300">
                  Формат карточки сделан под игровые новости: крупная обложка, дата публикации, короткая выжимка и подробный текст без перехода на другую страницу.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
