"use client";

import { MessageSquarePlus, Star, Trash2, X } from "lucide-react";
import { addDoc, collection, deleteDoc, doc, limit, onSnapshot, query, serverTimestamp, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/components/auth/auth-provider";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { useLanguage } from "@/lib/i18n/use-language";

type ReviewItem = {
  id: string;
  authorName?: string;
  rating?: number;
  status?: string;
  text?: string;
  createdAt?: { seconds?: number };
};

export const HOME_REVIEWS_EVENT = "bp-open-home-reviews";

const fallbackReviews = {
  ru: [
    { id: "fallback-1", authorName: "Bumpy клиент", text: "Заявка ушла быстро, менеджер сразу уточнил набор и статус появился в кабинете.", rating: 5 },
    { id: "fallback-2", authorName: "Raid игрок", text: "Удобно видеть этапы заказа и не искать переписку по разным каналам.", rating: 5 },
    { id: "fallback-3", authorName: "Партнер BP", text: "Реферальная ссылка и Bumpy Coins делают повторные покупки понятнее.", rating: 5 }
  ],
  en: [
    { id: "fallback-1", authorName: "Bumpy client", text: "The request was sent fast, the manager confirmed the pack and status appeared in the dashboard.", rating: 5 },
    { id: "fallback-2", authorName: "Raid player", text: "Order stages are useful and keep all communication in one place.", rating: 5 },
    { id: "fallback-3", authorName: "BP partner", text: "Referral links and Bumpy Coins make repeat purchases clearer.", rating: 5 }
  ]
};

function firstWords(value = "", count = 8) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  return words.length > count ? `${words.slice(0, count).join(" ")}...` : value;
}

export function HomeTestimonials() {
  const { language, isRu } = useLanguage();
  const { profile, user } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [open, setOpen] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [saving, setSaving] = useState(false);
  const [allReviewsOpen, setAllReviewsOpen] = useState(false);
  const [hiddenFallbackIds, setHiddenFallbackIds] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const isAdmin = profile?.role === "admin" || profile?.role === "owner";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function openReviewsFromHeader() {
      setAllReviewsOpen(true);
    }

    window.addEventListener(HOME_REVIEWS_EVENT, openReviewsFromHeader);
    return () => window.removeEventListener(HOME_REVIEWS_EVENT, openReviewsFromHeader);
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("bp-hidden-fallback-reviews");
      if (stored) {
        const parsed = JSON.parse(stored);
        setHiddenFallbackIds(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []);
      }
    } catch {
      setHiddenFallbackIds([]);
    }
  }, []);

  useEffect(() => {
    const reviewsQuery = query(collection(db, collections.reviews), where("status", "==", "published"), limit(18));

    return onSnapshot(
      reviewsQuery,
      (snapshot) => {
        const nextReviews = snapshot.docs
          .map((item) => ({ id: item.id, ...(item.data() as Omit<ReviewItem, "id">) }))
          .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        setReviews(nextReviews);
      },
      () => setReviews([])
    );
  }, []);

  const fallbackItems = useMemo(() => fallbackReviews[language].filter((item) => !hiddenFallbackIds.includes(item.id)), [hiddenFallbackIds, language]);
  const items = useMemo(() => (reviews.length > 0 ? reviews : fallbackItems), [fallbackItems, reviews]);
  const marqueeItems = [...items, ...items];

  function updateHiddenFallbackIds(nextIds: string[]) {
    setHiddenFallbackIds(nextIds);

    try {
      window.localStorage.setItem("bp-hidden-fallback-reviews", JSON.stringify(nextIds));
    } catch {
      // Local demo review visibility is non-critical.
    }
  }

  async function removeReview(item: ReviewItem) {
    if (!isAdmin) {
      return;
    }

    if (item.id.startsWith("fallback-")) {
      updateHiddenFallbackIds([...new Set([...hiddenFallbackIds, item.id])]);
      return;
    }

    await deleteDoc(doc(db, collections.reviews, item.id));
  }

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user?.uid || !text.trim() || saving) {
      return;
    }

    setSaving(true);

    try {
      await addDoc(collection(db, collections.reviews), {
        authorName: (isAdmin ? authorName.trim() : profile?.displayName) || (isRu ? "Игрок Bumpy Pay" : "Bumpy Pay player"),
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        rating,
        source: isAdmin ? "admin" : "user",
        status: "published",
        text: text.trim()
      });
      setAuthorName("");
      setText("");
      setRating(5);
      setOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="raid-ornate-panel mt-4 hidden overflow-visible p-3.5 sm:p-4 lg:block">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold tracking-[0.12em] text-relic">{isRu ? "Отзывы игроков" : "Player reviews"}</p>
        </div>
        <button
          type="button"
          onClick={() => setAllReviewsOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-black/16 px-3 py-1.5 text-xs font-semibold text-zinc-100 transition hover:border-relic/50 hover:text-relic"
        >
          {isRu ? "Все отзывы" : "All reviews"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-relic/35 bg-black/24 px-3 py-1.5 text-xs font-semibold text-relic transition hover:border-relic hover:bg-relic/10"
        >
          <MessageSquarePlus size={14} />
          {isRu ? "Оставить отзыв" : "Leave review"}
        </button>
      </div>

      <div className="raid-review-marquee overflow-hidden py-1.5">
        <div className="raid-review-track flex w-max gap-2.5">
          {marqueeItems.map((item, index) => (
            <article key={`${item.id}-${index}`} className="flex min-w-[220px] max-w-[280px] items-center gap-2.5 rounded-2xl border border-relic/10 bg-black/18 px-3 py-2.5">
              <div className="flex shrink-0 gap-0.5 text-relic">
                {Array.from({ length: Math.max(1, Math.min(5, item.rating ?? 5)) }).map((_, starIndex) => (
                  <Star key={starIndex} size={11} fill="currentColor" />
                ))}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs text-zinc-200">{firstWords(item.text, 8)}</p>
                <p className="mt-1 truncate text-xs font-semibold text-relic">{item.authorName || (isRu ? "Игрок" : "Player")}</p>
              </div>
              {isAdmin ? (
                <button
                  type="button"
                  onClick={() => void removeReview(item)}
                  className="ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-red-400/20 text-red-200/80 transition hover:border-red-300/60 hover:bg-red-500/10 hover:text-red-100"
                  aria-label={isRu ? "Удалить отзыв" : "Delete review"}
                >
                  <Trash2 size={13} />
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </div>

      {mounted && open ? createPortal(
        <div className="fixed inset-0 z-[120] overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-sm sm:py-8" role="dialog" aria-modal="true">
          <form onSubmit={submitReview} className="raid-review-modal mx-auto w-full max-w-lg rounded-[22px] border border-relic/25 bg-[#071019]/98 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-[var(--font-display)] text-2xl font-light text-white">{isRu ? "Отзыв о сервисе" : "Service review"}</h2>
              <button type="button" onClick={() => setOpen(false)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-zinc-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {isAdmin ? (
              <label className="mb-3 block">
                <span className="text-sm text-zinc-300">{isRu ? "Имя автора" : "Author name"}</span>
                <input
                  value={authorName}
                  onChange={(event) => setAuthorName(event.target.value)}
                  placeholder={isRu ? "Например: Raid игрок" : "Example: Raid player"}
                  className="mt-2 w-full rounded-xl border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
                />
              </label>
            ) : null}

            <label className="mb-3 block">
              <span className="text-sm text-zinc-300">{isRu ? "Оценка" : "Rating"}</span>
              <select
                value={rating}
                onChange={(event) => setRating(Number(event.target.value))}
                className="mt-2 w-full rounded-xl border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm text-zinc-300">{isRu ? "Текст отзыва" : "Review text"}</span>
              <textarea
                required
                value={text}
                onChange={(event) => setText(event.target.value)}
                rows={5}
                maxLength={420}
                placeholder={isRu ? "Коротко опишите опыт использования сервиса" : "Briefly describe your service experience"}
                className="mt-2 w-full rounded-xl border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
              />
            </label>

            <button disabled={saving || !user} className="mt-4 w-full rounded-xl bg-relic px-4 py-3 font-bold text-black disabled:opacity-60">
              {saving ? (isRu ? "Сохранение..." : "Saving...") : isRu ? "Опубликовать" : "Publish"}
            </button>
            {!user ? (
              <p className="mt-3 text-center text-xs leading-5 text-zinc-500">
                {isRu ? "Чтобы оставить отзыв, нужно войти в личный кабинет." : "Sign in to leave a review."}
              </p>
            ) : null}
          </form>
        </div>,
        document.body
      ) : null}

      {mounted && allReviewsOpen ? createPortal(
        <div className="fixed inset-0 z-[120] overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-sm sm:py-8" role="dialog" aria-modal="true">
          <div className="raid-review-modal mx-auto flex max-h-[calc(100dvh-3rem)] w-full max-w-3xl flex-col overflow-hidden rounded-[22px] border border-relic/25 bg-[#071019]/98 shadow-2xl sm:max-h-[calc(100dvh-4rem)]">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 p-5">
              <div>
                <p className="text-xs font-bold tracking-[0.18em] text-relic">{isRu ? "Отзывы" : "Reviews"}</p>
                <h2 className="mt-1 font-[var(--font-display)] text-2xl font-light text-white">{isRu ? "Все отзывы" : "All reviews"}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAllReviewsOpen(false);
                    setOpen(true);
                  }}
                  className="inline-flex h-10 items-center gap-2 rounded-xl border border-relic/30 px-3 text-xs font-bold text-relic transition hover:border-relic hover:bg-relic/10"
                >
                  <MessageSquarePlus size={14} />
                  {isRu ? "Оставить" : "Leave"}
                </button>
                <button
                  type="button"
                  onClick={() => setAllReviewsOpen(false)}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-zinc-400 transition hover:text-white"
                  aria-label={isRu ? "Закрыть" : "Close"}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="space-y-3 overflow-y-auto p-4">
              {items.map((item) => (
                <article key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex gap-0.5 text-relic">
                        {Array.from({ length: Math.max(1, Math.min(5, item.rating ?? 5)) }).map((_, starIndex) => (
                          <Star key={starIndex} size={13} fill="currentColor" />
                        ))}
                      </div>
                      <p className="mt-2 text-sm font-bold text-relic">{item.authorName || (isRu ? "Игрок" : "Player")}</p>
                    </div>
                    {isAdmin ? (
                      <button
                        type="button"
                        onClick={() => void removeReview(item)}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-red-400/20 text-red-200/80 transition hover:border-red-300/60 hover:bg-red-500/10 hover:text-red-100"
                        aria-label={isRu ? "Удалить отзыв" : "Delete review"}
                      >
                        <Trash2 size={14} />
                      </button>
                    ) : null}
                  </div>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-100">{item.text || ""}</p>
                </article>
              ))}

              {items.length === 0 ? (
                <p className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-400">
                  {isRu ? "Отзывов пока нет." : "No reviews yet."}
                </p>
              ) : null}
            </div>
          </div>
        </div>,
        document.body
      ) : null}
    </section>
  );
}
