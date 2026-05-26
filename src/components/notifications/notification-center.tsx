"use client";

import Link from "next/link";
import { CheckCheck, Flame, MessageCircle, ShoppingBag } from "lucide-react";
import { collection, limit, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useDonationOffers } from "@/components/donate/use-donation-offers";
import { GlassPanel } from "@/components/ui/glass-panel";
import { getDonationOfferImageUrl, getDonationOfferTitle } from "@/lib/donation/offers";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { useLanguage } from "@/lib/i18n/use-language";

type FirestoreTime = {
  seconds?: number;
};

type DirectThread = {
  id: string;
  participants?: string[];
  lastMessageText?: string;
  lastMessageUid?: string;
  lastMessageAt?: FirestoreTime;
};

type TopupLead = {
  id: string;
  uid?: string;
  packageName?: string;
  status?: string;
  createdAt?: FirestoreTime;
  updatedAt?: FirestoreTime;
};

type SeenState = {
  threadById?: Record<string, number>;
  topupById?: Record<string, number>;
  offerById?: Record<string, number>;
};

const stageLabels: Record<string, { ru: string; en: string }> = {
  new: { ru: "Заявка создана", en: "Request created" },
  payment: { ru: "Ожидает оплату", en: "Waiting for payment" },
  in_progress: { ru: "Выполняется", en: "In progress" },
  completed: { ru: "Заявка выполнена", en: "Completed" },
  cancelled: { ru: "Отменена", en: "Cancelled" },
  processed: { ru: "Заявка выполнена", en: "Completed" }
};

function getSeconds(value?: FirestoreTime) {
  return value?.seconds ?? 0;
}

function seenStorageKey(uid: string) {
  return `raid-notification-seen-${uid}`;
}

function readSeenState(uid: string): SeenState {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(window.localStorage.getItem(seenStorageKey(uid)) ?? "{}") as SeenState;
  } catch {
    return {};
  }
}

function writeSeenState(uid: string, next: SeenState) {
  window.localStorage.setItem(seenStorageKey(uid), JSON.stringify(next));
}

function formatDate(seconds?: number, isRu = true) {
  if (!seconds) {
    return isRu ? "только что" : "just now";
  }

  return new Intl.DateTimeFormat(isRu ? "ru-RU" : "en-US", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(seconds * 1000));
}

export function NotificationCenter() {
  const { isRu } = useLanguage();
  const { user } = useAuth();
  const offers = useDonationOffers();
  const [threads, setThreads] = useState<DirectThread[]>([]);
  const [topupLeads, setTopupLeads] = useState<TopupLead[]>([]);
  const [seenState, setSeenState] = useState<SeenState>({});
  const seenUid = user?.uid ?? "guest";

  useEffect(() => {
    if (!user?.uid) {
      setThreads([]);
      setTopupLeads([]);
      setSeenState({});
      return;
    }

    setSeenState(readSeenState(seenUid));

    const threadsQuery = query(collection(db, "directThreads"), where("participants", "array-contains", user.uid));
    const unsubscribeThreads = onSnapshot(
      threadsQuery,
      (snapshot) => {
        setThreads(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<DirectThread, "id">) })));
        setSeenState(readSeenState(seenUid));
      },
      () => setThreads([])
    );

    const topupQuery = query(collection(db, collections.topupLeads), where("uid", "==", user.uid), limit(20));
    const unsubscribeTopup = onSnapshot(
      topupQuery,
      (snapshot) => {
        setTopupLeads(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<TopupLead, "id">) })));
        setSeenState(readSeenState(seenUid));
      },
      () => setTopupLeads([])
    );

    return () => {
      unsubscribeThreads();
      unsubscribeTopup();
    };
  }, [seenUid, user?.uid]);

  const unreadThreads = useMemo(() => {
    if (!user?.uid) {
      return [];
    }

    return threads
      .filter((thread) => {
        const seconds = getSeconds(thread.lastMessageAt);
        return seconds > 0 && thread.lastMessageUid && thread.lastMessageUid !== user.uid && (seenState.threadById?.[thread.id] ?? 0) < seconds;
      })
      .sort((a, b) => getSeconds(b.lastMessageAt) - getSeconds(a.lastMessageAt));
  }, [seenState.threadById, threads, user?.uid]);

  const updatedOrders = useMemo(() => {
    if (!user?.uid) {
      return [];
    }

    return topupLeads
      .filter((lead) => {
        const status = lead.status ?? "new";
        const seconds = getSeconds(lead.updatedAt) || getSeconds(lead.createdAt);
        return status !== "new" && seconds > 0 && (seenState.topupById?.[lead.id] ?? 0) < seconds;
      })
      .sort((a, b) => (getSeconds(b.updatedAt) || getSeconds(b.createdAt)) - (getSeconds(a.updatedAt) || getSeconds(a.createdAt)));
  }, [seenState.topupById, topupLeads, user?.uid]);

  function markAllSeen() {
    const threadById = { ...(seenState.threadById ?? {}) };
    const topupById = { ...(seenState.topupById ?? {}) };
    const offerById = { ...(seenState.offerById ?? {}) };
    const next: SeenState = { threadById, topupById, offerById };

    for (const thread of threads) {
      const seconds = getSeconds(thread.lastMessageAt);
      if (seconds) {
        threadById[thread.id] = seconds;
      }
    }

    for (const lead of topupLeads) {
      const seconds = getSeconds(lead.updatedAt) || getSeconds(lead.createdAt);
      if (seconds) {
        topupById[lead.id] = seconds;
      }
    }

    for (const offer of hotOffers) {
      offerById[offer.id] = getSeconds(offer.updatedAt) || getSeconds(offer.createdAt) || 1;
    }

    writeSeenState(seenUid, next);
    setSeenState(next);
  }

  const hotOffers = offers.slice(0, 5);

  function markSeen(bucket: "threadById" | "topupById" | "offerById", id: string, value: number) {
    const next = {
      ...seenState,
      [bucket]: {
        ...(seenState[bucket] ?? {}),
        [id]: value || 1
      }
    };

    writeSeenState(seenUid, next);
    setSeenState(next);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <GlassPanel className="p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-relic">{isRu ? "Центр портала" : "Portal center"}</p>
            <h2 className="mt-2 font-[var(--font-cinzel)] text-3xl font-black text-white">{isRu ? "Уведомления" : "Notifications"}</h2>
          </div>
          <button
            type="button"
            onClick={markAllSeen}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-relic/30 bg-relic/10 px-4 py-2 text-sm font-bold text-relic transition hover:border-relic hover:bg-relic/20"
          >
            <CheckCheck size={17} />
            {isRu ? "Отметить прочитанным" : "Mark all read"}
          </button>
        </div>

        <div className="mt-5 grid gap-3">
          {unreadThreads.length === 0 && updatedOrders.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/25 p-5 text-sm leading-6 text-zinc-400">
              {isRu ? "Новых личных уведомлений пока нет. Выгодные предложения доступны справа." : "No new personal notifications yet. Best deals are available on the right."}
            </div>
          ) : null}

          {unreadThreads.map((thread) => {
            const otherUid = thread.participants?.find((uid) => uid !== user?.uid);

            return (
              <Link
                key={thread.id}
                href={otherUid ? `/chat?user=${otherUid}` : "/chat"}
                onClick={() => markSeen("threadById", thread.id, getSeconds(thread.lastMessageAt))}
                className="group flex items-start gap-3 rounded-2xl border border-relic/[0.18] bg-black/30 p-4 transition hover:-translate-y-0.5 hover:border-relic/45 hover:bg-relic/[0.07]"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-relic/30 bg-relic/[0.12] text-relic">
                  <MessageCircle size={19} />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-black text-white">
                    <span className="h-2 w-2 rounded-full bg-blood shadow-[0_0_12px_rgba(216,75,53,0.85)]" />
                    {isRu ? "Новое личное сообщение" : "New private message"}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-sm leading-6 text-zinc-300">
                    {thread.lastMessageText || (isRu ? "Откройте диалог, чтобы прочитать сообщение." : "Open the dialog to read the message.")}
                  </span>
                  <span className="mt-1 block text-xs text-zinc-500">{formatDate(getSeconds(thread.lastMessageAt), isRu)}</span>
                </span>
              </Link>
            );
          })}

          {updatedOrders.map((lead) => {
            const status = lead.status ?? "new";
            const label = stageLabels[status]?.[isRu ? "ru" : "en"] ?? status;
            const seconds = getSeconds(lead.updatedAt) || getSeconds(lead.createdAt);

            return (
              <Link
                key={lead.id}
                href={`/orders/${lead.id}`}
                onClick={() => markSeen("topupById", lead.id, seconds)}
                className="group flex items-start gap-3 rounded-2xl border border-relic/[0.18] bg-black/30 p-4 transition hover:-translate-y-0.5 hover:border-relic/45 hover:bg-relic/[0.07]"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-relic/30 bg-relic/[0.12] text-relic">
                  <ShoppingBag size={19} />
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-black text-white">
                    <span className="h-2 w-2 rounded-full bg-blood shadow-[0_0_12px_rgba(216,75,53,0.85)]" />
                    {isRu ? "Заявка обновлена" : "Request updated"}
                  </span>
                  <span className="mt-1 line-clamp-2 block text-sm leading-6 text-zinc-300">
                    {lead.packageName || (isRu ? "Игровой набор" : "Game pack")} · {label}
                  </span>
                  <span className="mt-1 block text-xs text-zinc-500">{formatDate(seconds, isRu)}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </GlassPanel>

      <GlassPanel className="p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-blood/35 bg-blood/15 text-blood">
            <Flame size={20} />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-relic">{isRu ? "Выгодное предложение" : "Best deal"}</p>
            <h2 className="font-[var(--font-cinzel)] text-2xl font-black text-white">{isRu ? "Предложения доната" : "Donation offers"}</h2>
          </div>
        </div>

        <div className="grid gap-3">
          {hotOffers.map((offer) => {
            const imageUrl = getDonationOfferImageUrl(offer);

            return (
              <Link
                key={offer.id}
                href={`/donate?package=${offer.id}`}
                onClick={() => markSeen("offerById", offer.id, getSeconds(offer.updatedAt) || getSeconds(offer.createdAt) || 1)}
                className="group relative min-h-[132px] overflow-hidden rounded-2xl border border-relic/20 bg-[#07111d] p-4 transition hover:-translate-y-0.5 hover:border-relic/55"
              >
                {imageUrl ? (
                  <span className="absolute inset-0 bg-cover bg-center opacity-65 transition group-hover:scale-[1.04] group-hover:opacity-80" style={{ backgroundImage: `url(${imageUrl})` }} />
                ) : null}
                <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,8,14,0.92),rgba(4,8,14,0.72)_48%,rgba(4,8,14,0.28))]" />
                <span className="relative z-10 flex h-full min-h-[100px] flex-col justify-between">
                  <span>
                    <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-blood">
                      <span className="h-2 w-2 rounded-full bg-blood shadow-[0_0_12px_rgba(216,75,53,0.8)]" />
                      {isRu ? "Выгодно" : "Best deal"}
                    </span>
                    <span className="mt-2 block max-w-[72%] text-xl font-black leading-tight text-white">{getDonationOfferTitle(offer, isRu)}</span>
                  </span>
                  <span className="text-sm font-black text-relic">{offer.priceRub.toLocaleString("ru-RU")} ₽</span>
                </span>
              </Link>
            );
          })}
        </div>
      </GlassPanel>
    </div>
  );
}
