"use client";

import { Clock3, X } from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
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

const fallbackNews: NewsItem[] = [
  {
    id: "fallback-1",
    title: "Выпил колу",
    titleEn: "Drank Cola",
    summary: "Банка колы",
    summaryEn: "A can of cola",
    markdownBody: "Первая новость портала. Добавьте реальные новости через админ-панель Content Forge.",
    markdownBodyEn: "The first portal news item. Add real news through the admin Content Forge."
  },
  {
    id: "fallback-2",
    title: "Новый портал открыт",
    titleEn: "New Portal Is Live",
    summary: "Новости, герои, заявки и чат собраны в одном игровом центре.",
    summaryEn: "News, heroes, requests and chat are gathered in one game hub.",
    markdownBody: "Опубликуйте новость через админ-панель, и она появится в этом блоке.",
    markdownBodyEn: "Publish a news item through the admin panel and it will appear in this block."
  }
];

const copy: Record<
  Language,
  {
    eyebrow: string;
    title: string;
    allNews: string;
    latestNews: string;
    details: string;
    emptyDescription: string;
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
    latestNews: "Последние новости",
    details: "Подробности",
    emptyDescription: "Описание новости пока не заполнено.",
    closeList: "Закрыть список новостей",
    closeNews: "Закрыть новость",
    openNewsLabel: "Открыть новость",
    fallbackDate: "24 часа назад"
  },
  en: {
    eyebrow: "Stay Updated",
    title: "Latest News",
    allNews: "All News",
    latestNews: "Latest News",
    details: "Details",
    emptyDescription: "News description has not been filled in yet.",
    closeList: "Close news list",
    closeNews: "Close news",
    openNewsLabel: "Open news",
    fallbackDate: "24 hours ago"
  }
};

function getNewsImage(item: NewsItem) {
  return item.coverImage?.secureUrl ?? item.coverImage?.url ?? "";
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

  return new Intl.RelativeTimeFormat(language === "ru" ? "ru-RU" : "en-US", { numeric: "auto" }).format(
    Math.max(-24, Math.round((seconds * 1000 - Date.now()) / 3600000)),
    "hour"
  );
}

export function LatestNewsRail() {
  const { language } = useLanguage();
  const labels = copy[language];
  const [news, setNews] = useState<NewsItem[]>(fallbackNews);
  const [activeIndex, setActiveIndex] = useState(0);
  const [allNewsOpen, setAllNewsOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const cycleNews = news.slice(0, 5);
  const featured = cycleNews[activeIndex % Math.max(cycleNews.length, 1)] ?? fallbackNews[0];
  const featuredImage = getNewsImage(featured);

  useEffect(() => {
    const newsQuery = query(collection(db, collections.news), where("status", "==", "published"));

    return onSnapshot(
      newsQuery,
      (snapshot) => {
        const items = snapshot.docs
          .map((item) => ({ id: item.id, ...(item.data() as Omit<NewsItem, "id">) }))
          .sort((a, b) => (b.publishedAt?.seconds ?? b.createdAt?.seconds ?? 0) - (a.publishedAt?.seconds ?? a.createdAt?.seconds ?? 0))
          .slice(0, 10);
        setNews(items.length ? items : fallbackNews);
      },
      () => setNews(fallbackNews)
    );
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [news.length]);

  useEffect(() => {
    if (cycleNews.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % cycleNews.length);
    }, 5200);

    return () => window.clearInterval(timer);
  }, [cycleNews.length]);

  return (
    <>
      <div className="raid-ornate-panel raid-news-hero min-h-[430px] overflow-hidden p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-relic">{labels.eyebrow}</p>
            <h2
              className={`raid-title-metal mt-4 max-w-lg text-4xl uppercase max-sm:[word-spacing:0.18em] sm:text-5xl ${
                language === "ru" ? "!leading-[1.32] sm:!leading-[1.26]" : "leading-none"
              }`}
            >
              {labels.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setAllNewsOpen(true)}
            className="raid-glow-button hidden shrink-0 border border-relic/35 bg-black/28 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-relic sm:block"
          >
            <span>{labels.allNews}</span>
          </button>
        </div>

        <button
          key={featured.id}
          type="button"
          onClick={() => setSelectedNews(featured)}
          className="raid-glow-button raid-news-cycle mt-7 grid min-h-[170px] w-full overflow-hidden border border-relic/35 bg-black/42 text-left sm:grid-cols-[250px_1fr]"
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
              {getNewsTitle(featured, language)}
            </span>
            <span className="mt-3 line-clamp-2 text-base leading-7 text-zinc-300">{getNewsSummary(featured, language)}</span>
            <span className="mt-4 inline-flex items-center gap-2 text-sm text-zinc-500">
              <Clock3 size={16} />
              {formatNewsDate(featured, language)}
            </span>
          </span>
        </button>

        <div className="mt-7 flex justify-center gap-3">
          {cycleNews.map((item, index) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-2.5 rounded-full transition ${index === activeIndex ? "bg-[#ffe1a0]" : "bg-zinc-500/45 hover:bg-relic"}`}
              aria-label={`${labels.openNewsLabel} ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {allNewsOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 px-3 py-5 backdrop-blur-sm sm:px-4 sm:py-8" role="dialog" aria-modal="true">
          <div className="flex min-h-full items-center justify-center">
            <div className="raid-ornate-panel mx-auto w-full max-w-4xl overflow-hidden bg-[#071019]">
              <div className="flex items-start justify-between gap-4 border-b border-relic/20 p-4 sm:p-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.34em] text-relic">{labels.latestNews}</p>
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
                <div className="space-y-3">
                  {news.map((item) => {
                    const image = getNewsImage(item) || "/images/raid-castle-bg.png";

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedNews(item);
                          setAllNewsOpen(false);
                        }}
                        className="grid w-full gap-3 rounded-[18px] border border-relic/18 bg-black/28 p-3 text-left transition hover:border-relic/50 hover:bg-relic/[0.08] sm:grid-cols-[150px_1fr]"
                      >
                        <span className="min-h-[96px] rounded-[14px] bg-cover bg-center" style={{ backgroundImage: `url("${image}")` }} />
                        <span className="min-w-0 py-1">
                          <span className="block text-xs font-bold uppercase tracking-[0.2em] text-relic">{formatNewsDate(item, language)}</span>
                          <span className="mt-2 block text-xl font-black text-white">{getNewsTitle(item, language)}</span>
                          <span className="mt-1 block max-h-12 overflow-hidden text-sm leading-6 text-zinc-400">{getNewsSummary(item, language)}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {selectedNews ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 px-3 py-5 backdrop-blur-sm sm:px-4 sm:py-8" role="dialog" aria-modal="true">
          <div className="flex min-h-full items-center justify-center">
            <div className="raid-ornate-panel mx-auto grid max-h-[calc(100dvh-40px)] w-full max-w-5xl overflow-y-auto bg-[#071019]">
              <div className="bg-gradient-to-br from-[#16090c] via-[#111827] to-[#352012]">
                <div className="flex items-start justify-between gap-4 p-4 sm:p-6">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-[0.34em] text-relic">{formatNewsDate(selectedNews, language)}</p>
                    <h2 className="raid-title-metal mt-2 text-2xl font-black leading-tight sm:text-4xl">{getNewsTitle(selectedNews, language)}</h2>
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
                <div className="border-y border-relic/20 bg-black/35">
                  <img
                    src={getNewsImage(selectedNews) || "/images/raid-castle-bg.png"}
                    alt={getNewsTitle(selectedNews, language) || "News image"}
                    className="mx-auto max-h-[56dvh] w-full object-contain"
                  />
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
