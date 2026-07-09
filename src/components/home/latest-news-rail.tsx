"use client";

import { Clock3, Edit3, EyeOff, Trash2, X } from "lucide-react";
import { deleteDoc, doc, collection, limit, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { useLanguage, type Language } from "@/lib/i18n/use-language";

type NewsItem = {
  id: string;
  title?: string;
  titleEn?: string;
  markdownBody?: string;
  markdownBodyEn?: string;
  publishedAt?: { seconds?: number };
  createdAt?: { seconds?: number };
  coverImage?: {
    optimizedUrl?: string;
    secureUrl?: string;
    url?: string;
  } | null;
};

const copy: Record<
  Language,
  {
    title: string;
    allNews: string;
    emptyDescription: string;
    emptyList: string;
    closeList: string;
    closeNews: string;
    openNewsLabel: string;
    fallbackDate: string;
  }
> = {
  ru: {
    title: "Свежие новости",
    allNews: "Все новости",
    emptyDescription: "Текст новости пока не заполнен.",
    emptyList: "Новости появятся здесь после публикации из админ-панели.",
    closeList: "Закрыть список новостей",
    closeNews: "Закрыть новость",
    openNewsLabel: "Открыть новость",
    fallbackDate: "24 часа назад"
  },
  en: {
    title: "Fresh News",
    allNews: "All News",
    emptyDescription: "News text has not been filled in yet.",
    emptyList: "News will appear here after publication from the admin panel.",
    closeList: "Close news list",
    closeNews: "Close news",
    openNewsLabel: "Open news",
    fallbackDate: "24 hours ago"
  }
};

const fallbackNewsImage = "/images/raid-castle-bg-optimized.jpg";

function getNewsImage(item: NewsItem) {
  return item.coverImage?.optimizedUrl ?? item.coverImage?.secureUrl ?? item.coverImage?.url ?? fallbackNewsImage;
}

function getNewsTitle(item: NewsItem, language: Language) {
  return language === "en" ? item.titleEn || item.title || "" : item.title || item.titleEn || "";
}

function getNewsBody(item: NewsItem, language: Language) {
  return language === "en" ? item.markdownBodyEn || item.markdownBody || "" : item.markdownBody || item.markdownBodyEn || "";
}

function getNewsPreviewText(item: NewsItem, language: Language) {
  return getNewsBody(item, language);
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
  const { profile } = useAuth();
  const router = useRouter();
  const labels = copy[language];
  const [news, setNews] = useState<NewsItem[]>([]);
  const [allNewsOpen, setAllNewsOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
  const [failedImages, setFailedImages] = useState<Record<string, true>>({});
  const visibleNews = news.slice(0, 5);
  const isAdmin = profile?.role === "admin" || profile?.role === "owner";

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

  useEffect(() => {
    if (news.length === 0 || typeof window === "undefined") {
      return;
    }

    const newsId = new URLSearchParams(window.location.search).get("news");

    if (!newsId) {
      return;
    }

    const foundNews = news.find((item) => item.id === newsId || `news-${item.id}` === newsId);

    if (foundNews) {
      setSelectedNews(foundNews);
      window.history.replaceState(null, "", `${window.location.pathname}${window.location.hash || ""}`);
    }
  }, [news]);

  function renderNewsList(items: NewsItem[], compact = false, afterSelect?: () => void) {
    return (
      <div className={compact ? "space-y-3" : "raid-stable-news-grid"}>
        {items.map((item, index) => {
          const isPriorityImage = !compact && index === 0;
          const imageSrc = failedImages[item.id] ? fallbackNewsImage : getNewsImage(item);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSelectedNews(item);
                afterSelect?.();
              }}
              className={`group w-full text-left transition hover:bg-relic/[0.07] ${
                compact
                  ? "grid grid-cols-[86px_1fr_auto] items-center gap-4 rounded-[12px] border border-relic/10 bg-black/28 p-4"
                  : "flex h-[390px] min-h-[390px] flex-col overflow-hidden rounded-[12px] border border-relic/10 bg-black/32 p-3 sm:h-[416px] sm:min-h-[416px]"
              }`}
              aria-label={`${labels.openNewsLabel}: ${getNewsTitle(item, language)}`}
            >
              <span className={`relative block overflow-hidden rounded-[8px] border border-relic/12 bg-black/40 ${compact ? "h-[76px] w-[76px]" : "aspect-square w-full"}`}>
                <Image
                  src={imageSrc}
                  alt=""
                  fill
                  sizes={compact ? "76px" : "(max-width: 640px) 52vw, (max-width: 1280px) 24vw, 260px"}
                  className="object-cover"
                  onError={() => setFailedImages((current) => ({ ...current, [item.id]: true }))}
                  {...(isPriorityImage ? { priority: true, fetchPriority: "high" as const } : { loading: "lazy" as const })}
                />
              </span>
              <span className={`raid-word-wrap min-w-0 ${compact ? "" : "mt-3 block flex-1"}`}>
                <span className={`raid-word-wrap block font-[var(--font-display)] font-light tracking-[0.01em] text-white transition group-hover:text-[#b8d7ff] ${compact ? "truncate text-lg sm:text-xl" : "line-clamp-3 text-base leading-snug sm:text-lg"}`}>
                  {getNewsTitle(item, language)}
                </span>
                <span
                  data-compact={compact ? "true" : "false"}
                  className={`raid-word-wrap raid-news-preview mt-1 block text-sm text-zinc-400 ${compact ? "text-sm" : "text-xs sm:text-sm"}`}
                >
                  {getNewsPreviewText(item, language) || labels.emptyDescription}
                </span>
              </span>
              <span className={`items-center gap-2 text-xs text-zinc-500 ${compact ? "hidden sm:inline-flex" : "mt-3 inline-flex"}`}>
                <Clock3 size={15} />
                {formatNewsDate(item, language)}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  async function hideSelectedNews() {
    if (!isAdmin || !selectedNews) {
      return;
    }

    await updateDoc(doc(db, collections.news, selectedNews.id), {
      status: "draft"
    });
    setSelectedNews(null);
  }

  async function deleteSelectedNews() {
    if (!isAdmin || !selectedNews || !window.confirm("Удалить эту новость?")) {
      return;
    }

    await deleteDoc(doc(db, collections.news, selectedNews.id));
    setSelectedNews(null);
  }

  return (
    <>
      <div className="raid-ornate-panel min-h-0 overflow-hidden p-4 sm:p-6 lg:min-h-[520px]">
        <div className="flex flex-wrap items-start justify-between gap-3 pb-2 sm:pb-3">
          <div>
            <h2 className={`raid-title-metal text-[1.45rem] leading-tight sm:text-3xl lg:text-4xl ${language === "ru" ? "!leading-[1.16]" : "leading-tight"}`}>
              {labels.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setAllNewsOpen(true)}
            className="raid-glow-button border border-relic/35 bg-black/28 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-relic"
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
                <img
                  src={failedImages[selectedNews.id] ? fallbackNewsImage : getNewsImage(selectedNews)}
                  alt=""
                  loading="eager"
                  decoding="async"
                  className="max-h-[58vh] w-full object-contain"
                  onError={() => setFailedImages((current) => ({ ...current, [selectedNews.id]: true }))}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#071019]/45 via-transparent to-black/20" />
                <div className="absolute inset-x-0 top-0 flex items-start justify-end gap-4 p-4 sm:p-6">
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
                <p className="text-xs font-bold uppercase tracking-[0.34em] text-relic">{formatNewsDate(selectedNews, language)}</p>
                <h2 className="raid-title-metal mt-2 max-w-4xl text-2xl font-black leading-tight sm:text-5xl">{getNewsTitle(selectedNews, language)}</h2>
                {isAdmin ? (
                  <div className="mb-5 mt-5 flex flex-wrap gap-2 rounded-[14px] border border-relic/15 bg-black/25 p-2">
                    <button
                      type="button"
                      onClick={() => router.push("/admin")}
                      className="inline-flex items-center gap-2 rounded-[10px] border border-relic/20 px-3 py-2 text-xs font-bold text-relic transition hover:bg-relic/10"
                    >
                      <Edit3 size={14} />
                      Редактировать в админке
                    </button>
                    <button
                      type="button"
                      onClick={() => void hideSelectedNews()}
                      className="inline-flex items-center gap-2 rounded-[10px] border border-relic/20 px-3 py-2 text-xs font-bold text-relic transition hover:bg-relic/10"
                    >
                      <EyeOff size={14} />
                      Скрыть
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteSelectedNews()}
                      className="inline-flex items-center gap-2 rounded-[10px] border border-blood/30 px-3 py-2 text-xs font-bold text-ember transition hover:bg-blood/15"
                    >
                      <Trash2 size={14} />
                      Удалить
                    </button>
                  </div>
                ) : null}
                <p className="max-w-3xl whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                  {getNewsBody(selectedNews, language) || labels.emptyDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
