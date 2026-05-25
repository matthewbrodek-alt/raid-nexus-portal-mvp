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
    title: "Новый портал открыт",
    titleEn: "New Portal Is Live",
    summary: "Новости, герои, заявки и чат собраны в одном игровом центре.",
    summaryEn: "News, heroes, requests and chat are gathered in one game hub.",
    markdownBody: "Опубликуйте новость через админ-панель Content Forge, и она появится в этой колонке.",
    markdownBodyEn: "Publish a news item through the admin Content Forge and it will appear in this column."
  },
  {
    id: "fallback-2",
    title: "Готовится следующий розыгрыш",
    titleEn: "Next Giveaway Is Preparing",
    summary: "Четыре розыгрыша в месяц по 5 рубиновых подписок.",
    summaryEn: "Four monthly giveaways with 5 ruby subscriptions each.",
    markdownBody: "Зарегистрированные игроки смогут участвовать в розыгрыше через отдельную страницу события.",
    markdownBodyEn: "Registered players can join the giveaway through the event page."
  }
];

const copy: Record<
  Language,
  {
    eyebrow: string;
    title: string;
    allNews: string;
    editorLabel: string;
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
    editorLabel: "Колонка SMM-редактора",
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
    editorLabel: "SMM editor column",
    details: "Details",
    emptyDescription: "News description has not been filled in yet.",
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

  return new Intl.RelativeTimeFormat(language === "ru" ? "ru-RU" : "en-US", { numeric: "auto" }).format(
    Math.max(-24 * 30, Math.round((seconds * 1000 - Date.now()) / 3_600_000)),
    "hour"
  );
}

export function LatestNewsRail() {
  const { language } = useLanguage();
  const labels = copy[language];
  const [news, setNews] = useState<NewsItem[]>(fallbackNews);
  const [allNewsOpen, setAllNewsOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const visibleNews = news.slice(0, 10);

  useEffect(() => {
    const newsQuery = query(collection(db, collections.news), where("status", "==", "published"));

    return onSnapshot(
      newsQuery,
      (snapshot) => {
        const items = snapshot.docs
          .map((item) => ({ id: item.id, ...(item.data() as Omit<NewsItem, "id">) }))
          .sort((a, b) => (b.publishedAt?.seconds ?? b.createdAt?.seconds ?? 0) - (a.publishedAt?.seconds ?? a.createdAt?.seconds ?? 0))
          .slice(0, 12);
        setNews(items.length ? items : fallbackNews);
      },
      () => setNews(fallbackNews)
    );
  }, []);

  function renderNewsList(items: NewsItem[], compact = false, afterSelect?: () => void) {
    return (
      <div className={compact ? "space-y-3" : "divide-y divide-relic/12"}>
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              setSelectedNews(item);
              afterSelect?.();
            }}
            className={`group grid w-full grid-cols-[46px_1fr_auto] items-center gap-4 text-left transition hover:bg-relic/[0.07] ${
              compact ? "rounded-[18px] border border-relic/18 bg-black/28 p-4" : "px-1 py-5 sm:px-3"
            }`}
            aria-label={`${labels.openNewsLabel}: ${getNewsTitle(item, language)}`}
          >
            <span className="grid h-11 w-11 place-items-center rounded-[14px] border border-relic/30 bg-black/40 font-[var(--font-cinzel)] text-sm font-black text-relic">
              {String(index + 1).padStart(2, "0")}
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
            <p className="mt-3 text-sm uppercase tracking-[0.18em] text-zinc-500">{labels.editorLabel}</p>
          </div>
          <button
            type="button"
            onClick={() => setAllNewsOpen(true)}
            className="raid-glow-button border border-relic/35 bg-black/28 px-5 py-3 text-xs font-black uppercase tracking-[0.16em] text-relic"
          >
            <span>{labels.allNews}</span>
          </button>
        </div>

        <div className="mt-2">{renderNewsList(visibleNews)}</div>
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
              <div className="max-h-[72dvh] overflow-y-auto p-3 sm:p-5">{renderNewsList(news, true, () => setAllNewsOpen(false))}</div>
            </div>
          </div>
        </div>
      ) : null}

      {selectedNews ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 px-3 py-5 backdrop-blur-sm sm:px-4 sm:py-8" role="dialog" aria-modal="true">
          <div className="flex min-h-full items-center justify-center">
            <div className="raid-ornate-panel mx-auto max-h-[calc(100dvh-40px)] w-full max-w-5xl overflow-y-auto bg-[#071019]">
              <div
                className="min-h-[320px] bg-cover bg-center"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(5,7,11,0.2), rgba(5,7,11,0.96)), url("${getNewsImage(selectedNews)}")`
                }}
              >
                <div className="flex items-start justify-between gap-4 p-4 sm:p-6">
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
