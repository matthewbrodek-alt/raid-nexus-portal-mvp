"use client";

import { MessageSquarePlus, Save, Star, Trash2 } from "lucide-react";
import { addDoc, collection, deleteDoc, doc, limit, onSnapshot, query, serverTimestamp } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { GlassPanel } from "@/components/ui/glass-panel";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

type ReviewItem = {
  id: string;
  authorName?: string;
  rating?: number;
  source?: string;
  status?: string;
  text?: string;
  createdAt?: { seconds?: number };
};

function formatDate(seconds?: number) {
  if (!seconds) {
    return "";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(seconds * 1000));
}

export function AdminReviewManager() {
  const { profile } = useAuth();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [authorName, setAuthorName] = useState("Bumpy клиент");
  const [text, setText] = useState("");
  const [rating, setRating] = useState(5);
  const [statusText, setStatusText] = useState("");

  useEffect(() => {
    const reviewsQuery = query(collection(db, collections.reviews), limit(50));

    return onSnapshot(reviewsQuery, (snapshot) => {
      const nextReviews = snapshot.docs
        .map((item) => ({ id: item.id, ...(item.data() as Omit<ReviewItem, "id">) }))
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setReviews(nextReviews);
    });
  }, []);

  const publishedCount = useMemo(() => reviews.filter((review) => review.status === "published").length, [reviews]);

  async function createReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!text.trim()) {
      return;
    }

    await addDoc(collection(db, collections.reviews), {
      authorName: authorName.trim() || "Bumpy клиент",
      createdAt: serverTimestamp(),
      createdBy: profile?.uid ?? "",
      rating,
      source: "admin",
      status: "published",
      text: text.trim()
    });

    setText("");
    setRating(5);
    setStatusText("Отзыв опубликован.");
  }

  async function removeReview(reviewId: string) {
    await deleteDoc(doc(db, collections.reviews, reviewId));
    setStatusText("Отзыв удален.");
  }

  return (
    <GlassPanel className="p-4 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-xl border border-relic/30 bg-relic/10 text-relic">
            <MessageSquarePlus />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-relic">Reviews desk</p>
            <h2 className="text-2xl font-bold text-white">Отзывы на главной</h2>
            <p className="mt-1 text-sm text-zinc-400">Опубликовано: {publishedCount}. Отзывы выводятся бегущей строкой под свежими новостями.</p>
          </div>
        </div>
      </div>

      <form onSubmit={createReview} className="mb-5 grid gap-3 rounded-2xl border border-white/10 bg-black/22 p-4 lg:grid-cols-[220px_150px_minmax(0,1fr)_150px]">
        <input
          value={authorName}
          onChange={(event) => setAuthorName(event.target.value)}
          placeholder="Имя автора"
          className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
        />
        <select value={rating} onChange={(event) => setRating(Number(event.target.value))} className="rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic">
          {[5, 4, 3, 2, 1].map((value) => (
            <option key={value} value={value}>
              {value} звезд
            </option>
          ))}
        </select>
        <textarea
          required
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={2}
          maxLength={420}
          placeholder="Текст отзыва"
          className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
        />
        <button className="inline-flex items-center justify-center gap-2 rounded-md bg-relic px-4 py-3 font-bold text-black">
          <Save size={16} />
          Добавить
        </button>
      </form>

      {statusText ? <p className="mb-4 rounded-lg border border-relic/18 bg-relic/[0.08] p-3 text-sm text-zinc-300">{statusText}</p> : null}

      <div className="grid gap-3">
        {reviews.map((review) => (
          <article key={review.id} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-bold text-white">{review.authorName || "Bumpy клиент"}</p>
                <span className="inline-flex items-center gap-1 text-xs text-relic">
                  <Star size={12} fill="currentColor" />
                  {review.rating ?? 5}
                </span>
                <span className="text-xs text-zinc-500">{formatDate(review.createdAt?.seconds)}</span>
                <span className="rounded-full border border-relic/18 bg-relic/10 px-2 py-0.5 text-[11px] text-relic">{review.source || "user"}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-zinc-300">{review.text}</p>
            </div>
            <button
              type="button"
              onClick={() => void removeReview(review.id)}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-blood/30 bg-blood/10 px-3 py-2 text-sm font-semibold text-ember"
            >
              <Trash2 size={15} />
              Удалить
            </button>
          </article>
        ))}
        {reviews.length === 0 ? <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-zinc-500">Отзывов пока нет.</p> : null}
      </div>
    </GlassPanel>
  );
}
