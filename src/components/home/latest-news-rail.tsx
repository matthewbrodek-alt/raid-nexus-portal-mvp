"use client";

import { Clock3, X } from "lucide-react";
import { collection, limit, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { useLanguage, type Language } from "@/lib/i18n/use-language";

type NewsItem = {
  id: string;
  title?: string;
  titleEn?: string;
  summary?: string;
  summaryEn?: string;
  markdownBody?: string;
  markdownBodyEn?: string;
  publishedAt?: { seconds?: number };
  createdAt?: { seconds?: number };
  coverImage?: {
    secureUrl?: string;
    url?: string;
  } | null;
};

const copy: Record<
  Language,
  {
    eyebrow: string;
    title: string;
    allNews: string;
    details: string;
    emptyDescription: string;
    emptyList: string;
    closeList: string;
    closeNews: string;
    openNewsLabel: string;
    fallbackDate: string;
  }
> = {
  ru: {
    eyebrow: "Будь в курсе",
    title: "Последние новости",
    allNews: "Все новости",
    details: "Подробности",
    emptyDescription: "Описание новости пока не заполнено.",
    emptyList: "Новости появятся здесь после публикации из админ-панели.",
    closeList: "Закрыть список новостей",
    closeNews: "Закрыть новость",
    openNewsLabel: "Открыть новость",
    fallbackDate: "24 часа назад"
  },
  en: {
    eyebrow: "Stay Updated",
    title: "Latest News",
    allNews: "All News",
    details: "Details",
    emptyDescription: "News description has not been filled in yet.",
    emptyList: "News will appear here after publication from the admin panel.",
    closeList: "Close news list",
    closeNews: "Close news",
    openNewsLabel: "Open news",
    fallbackDate: "24 hours ago"
  }
};

function getNewsImage(item: NewsItem) {
  return item.coverImage?.secureUrl ?? item.coverImage?.url ?? "/images/raid-castle-bg.png";
}

function getNewsTitle(item: NewsItem, language: Language) {
  return language === "en" ? item.titleEn || item.title || "" : item.title || item.titleEn || "";
}

function getNewsSummary(item: NewsItem, language: Language) {
  return language === "en" ? item.summaryEn || item.summary || "" : item.summary || item.summaryEn || "";
}

function getNewsBody(item: NewsItem, language: Language) {
  return language === "en" ? item.markdownBodyEn || item.markdownBody || "" : item.markdownBody || item.markdownBodyEn || "";
}

function formatNewsDate(item: NewsItem, language: Language) {
  const seconds = item.publishedAt?.seconds ?? item.createdAt?.seconds;

  if (!seconds) {
    return copy[language].fallbackDate;
  }

  const locale = language === "ru" ? "ru-RU" : "en-US";
  const date = new Date(seconds * 1000);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const dayDiff = Math.round((startOfDate - startOfToday) / 86_400_000);

  if (dayDiff === 0) {
    const hoursAgo = Math.floor((Date.now() - date.getTime()) / 3_600_000);

    if (hoursAgo >= 1 && hoursAgo < 12) {
      return new Intl.RelativeTimeFormat(locale, { numeric: "auto" }).format(-hoursAgo, "hour");
    }

    return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(date);
  }

  if (dayDiff === -1) {
    return language === "ru" ? "вчера" : "yesterday";
  }

  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

export function LatestNewsRail() {
  const { language } = useLanguage();
  const labels = copy[language];
  const [news, setNews] = useState<NewsItem[]>([]);
  const [allNewsOpen, setAllNewsOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const visibleNews = news.slice(0, 10);

  useEffect(() => {
    const newsQuery = query(collection(db, collections.news), where("status", "==", "published"), limit(40));

    return onSnapshot(
      newsQuery,
      (snapshot) => {
        const items = snapshot.docs
          .map((item) => ({ id: item.id, ...(item.data() as Omit<NewsItem, "id">) }))
          .sort((a, b) => (b.publishedAt?.seconds ?? b.createdAt?.seconds ?? 0) - (a.publishedAt?.seconds ?? a.createdAt?.seconds ?? 0))
          .slice(0, 12);
        setNews(items);
      },
      () => setNews([])
    );
  }, []);

  function renderNewsList(items: NewsItem[], compact = false, afterSelect?: () => void) {
    return (
      <div className={compact ? "space-y-3" : "divide-y divide-relic/12"}>
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setSelectedNews(item);
              afterSelect?.();
            }}
            className={`group grid w-full grid-cols-[86px_1fr_auto] items-center gap-4 text-left transition hover:bg-relic/[0.07] ${
              compact ? "rounded-[18px] border border-relic/18 bg-black/28 p-4" : "px-1 py-5 sm:px-3"
            }`}
            aria-label={`${labels.openNewsLabel}: ${getNewsTitle(item, language)}`}
          >
            <span className="block h-16 overflow-hidden rounded-[14px] border border-relic/22 bg-black/40">
              <img src={getNewsImage(item)} alt="" loading="lazy" decoding="async" className="h-full w-full object-contain" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-[var(--font-cinzel)] text-lg font-black uppercase tracking-[0.04em] text-white transition group-hover:text-[#ffe1a0] sm:text-xl">
                {getNewsTitle(item, language)}
              </span>
              <span className="mt-1 block truncate text-sm text-zinc-400">{getNewsSummary(item, language)}</span>
            </span>
            <span className="hidden items-center gap-2 text-xs text-zinc-500 sm:inline-flex">
              <Clock3 size={15} />
              {formatNewsDate(item, language)}
            </span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="raid-ornate-panel min-h-[650px] overflow-hidden p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-relic/18 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-relic">{labels.eyebrow}</p>
            <h2 className={`raid-title-metal mt-4 text-4xl uppercase sm:text-6xl ${language === "ru" ? "!leading-[1.24]" : "leading-none"}`}>
              {labels.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setAllNewsOpen(true)}
            className="raid-glow-button border border-relic/35 bg-black/28 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-relic"
          >
            <span>{labels.allNews}</span>
          </button>
        </div>

        <div className="mt-2">
          {visibleNews.length ? (
            renderNewsList(visibleNews)
          ) : (
            <div className="rounded-[18px] border border-relic/18 bg-black/28 p-6 text-sm leading-6 text-zinc-400">
              {labels.emptyList}
            </div>
          )}
        </div>
      </div>

      {allNewsOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 px-3 py-5 backdrop-blur-sm sm:px-4 sm:py-8" role="dialog" aria-modal="true">
          <div className="flex min-h-full items-center justify-center">
            <div className="raid-ornate-panel mx-auto w-full max-w-4xl overflow-hidden bg-[#071019]">
              <div className="flex items-start justify-between gap-4 border-b border-relic/20 p-4 sm:p-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.34em] text-relic">{labels.title}</p>
                  <h2 className="raid-title-metal mt-2 text-3xl font-black">{labels.allNews}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setAllNewsOpen(false)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border border-relic/40 bg-black/45 text-zinc-300 transition hover:text-white"
                  aria-label={labels.closeList}
                >
                  <X size={18} />
                </button>
              </div>
              <div className="max-h-[72dvh] overflow-y-auto p-3 sm:p-5">
                {news.length ? renderNewsList(news, true, () => setAllNewsOpen(false)) : <p className="p-4 text-sm text-zinc-400">{labels.emptyList}</p>}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {selectedNews ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 px-3 py-5 backdrop-blur-sm sm:px-4 sm:py-8" role="dialog" aria-modal="true">
          <div className="flex min-h-full items-center justify-center">
            <div className="raid-ornate-panel mx-auto max-h-[calc(100dvh-40px)] w-full max-w-5xl overflow-y-auto bg-[#071019]">
              <div className="relative bg-black">
                <img src={getNewsImage(selectedNews)} alt="" loading="eager" decoding="async" className="max-h-[58vh] w-full object-contain" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#071019] via-transparent to-black/35" />
                <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-4 p-4 sm:p-6">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.34em] text-relic">{formatNewsDate(selectedNews, language)}</p>
                    <h2 className="raid-title-metal mt-2 text-2xl font-black leading-tight sm:text-5xl">{getNewsTitle(selectedNews, language)}</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedNews(null)}
                    className="grid h-10 w-10 shrink-0 place-items-center border border-relic/40 bg-black/45 text-zinc-300 transition hover:text-white"
                    aria-label={labels.closeNews}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
              <div className="p-5 sm:p-8">
                <p className="max-w-3xl text-base leading-7 text-zinc-200">{getNewsSummary(selectedNews, language)}</p>
                <h3 className="raid-title-metal mt-6 text-2xl font-black">{labels.details}</h3>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                  {getNewsBody(selectedNews, language) || getNewsSummary(selectedNews, language) || labels.emptyDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
