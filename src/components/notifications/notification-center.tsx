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
import {
  hydrateNotificationSeenState,
  isNotificationSeen,
  markManyNotificationsSeen,
  markNotificationSeen,
  notificationSeenStateEvent,
  notificationSeenStorageKey,
  readNotificationSeenState,
  type NotificationSeenBucket,
  type NotificationSeenState
} from "@/lib/notifications/seen-state";

type NotificationView = "new" | "history";
type NotificationKind = "message" | "order" | "offer";

type FirestoreTime = {
  seconds?: number;
};

type DirectThread = {
  id: string;
  participants?: string[];
  topupLeadIds?: string[];
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

type NotificationItem = {
  id: string;
  bucket: NotificationSeenBucket;
  body: string;
  href: string;
  kind: NotificationKind;
  meta: string;
  read: boolean;
  title: string;
  value: number;
};

const stageLabels: Record<string, { ru: string; en: string }> = {
  new: { ru: "Заявка создана", en: "Request created" },
  payment: { ru: "Ожидает оплату", en: "Waiting for payment" },
  in_progress: { ru: "Выполняется", en: "In progress" },
  completed: { ru: "Заявка выполнена", en: "Completed" },
  cancelled: { ru: "Отменена", en: "Cancelled" },
  processed: { ru: "Заявка выполнена", en: "Completed" }
};

const finishedOrderStatuses = new Set(["completed", "processed", "cancelled", "canceled", "done", "closed"]);

function getSeconds(value?: FirestoreTime) {
  return value?.seconds ?? 0;
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

function isActiveOrderNotification(status?: string) {
  const normalized = (status ?? "new").toLowerCase();
  return normalized !== "new" && !finishedOrderStatuses.has(normalized);
}

function isProfitableOffer(offer: { tag?: string; comment?: string; description?: string; status?: string }) {
  const marker = `${offer.tag ?? ""} ${offer.comment ?? ""} ${offer.description ?? ""}`.toLowerCase();
  return (offer.status ?? "published") === "published" && (marker.includes("выгод") || marker.includes("hot") || marker.includes("deal") || marker.includes("best"));
}

function getLinkedTopupLeadId(thread: DirectThread) {
  const ids = thread.topupLeadIds?.filter(Boolean) ?? [];
  return ids[ids.length - 1] ?? "";
}

function getMessageHref(thread: DirectThread, currentUid: string) {
  const linkedTopupLeadId = getLinkedTopupLeadId(thread);

  if (linkedTopupLeadId) {
    return `/orders/${linkedTopupLeadId}`;
  }

  const otherUid = thread.participants?.find((uid) => uid !== currentUid);
  return otherUid ? `/chat?thread=${thread.id}&user=${otherUid}` : `/chat?thread=${thread.id}`;
}

function notificationIcon(kind: NotificationKind) {
  if (kind === "message") {
    return MessageCircle;
  }

  if (kind === "offer") {
    return Flame;
  }

  return ShoppingBag;
}

export function NotificationCenter() {
  const { isRu } = useLanguage();
  const { user } = useAuth();
  const offers = useDonationOffers();
  const [threads, setThreads] = useState<DirectThread[]>([]);
  const [topupLeads, setTopupLeads] = useState<TopupLead[]>([]);
  const [seenState, setSeenState] = useState<NotificationSeenState>({});
  const [activeView, setActiveView] = useState<NotificationView>("new");
  const seenUid = user?.uid ?? "guest";

  useEffect(() => {
    setSeenState(readNotificationSeenState(seenUid));
    void hydrateNotificationSeenState(seenUid).then(setSeenState);

    function syncSeenState(event?: Event) {
      if (event instanceof StorageEvent && event.key !== notificationSeenStorageKey(seenUid)) {
        return;
      }

      setSeenState(readNotificationSeenState(seenUid));
    }

    window.addEventListener(notificationSeenStateEvent, syncSeenState);
    window.addEventListener("storage", syncSeenState);
    window.addEventListener("focus", syncSeenState);

    return () => {
      window.removeEventListener(notificationSeenStateEvent, syncSeenState);
      window.removeEventListener("storage", syncSeenState);
      window.removeEventListener("focus", syncSeenState);
    };
  }, [seenUid]);

  useEffect(() => {
    if (!user?.uid) {
      setThreads([]);
      setTopupLeads([]);
      setSeenState({});
      return;
    }

    setSeenState(readNotificationSeenState(seenUid));
    void hydrateNotificationSeenState(seenUid).then(setSeenState);

    const threadsQuery = query(collection(db, "directThreads"), where("participants", "array-contains", user.uid), limit(80));
    const unsubscribeThreads = onSnapshot(
      threadsQuery,
      (snapshot) => {
        setThreads(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<DirectThread, "id">) })));
        setSeenState(readNotificationSeenState(seenUid));
      },
      () => setThreads([])
    );

    const topupQuery = query(collection(db, collections.topupLeads), where("uid", "==", user.uid), limit(30));
    const unsubscribeTopup = onSnapshot(
      topupQuery,
      (snapshot) => {
        setTopupLeads(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<TopupLead, "id">) })));
        setSeenState(readNotificationSeenState(seenUid));
      },
      () => setTopupLeads([])
    );

    return () => {
      unsubscribeThreads();
      unsubscribeTopup();
    };
  }, [seenUid, user?.uid]);

  const notifications = useMemo<NotificationItem[]>(() => {
    if (!user?.uid) {
      return [];
    }

    const messageItems = threads
      .map<NotificationItem | null>((thread) => {
        const seconds = getSeconds(thread.lastMessageAt);

        if (!seconds || !thread.lastMessageUid || thread.lastMessageUid === user.uid) {
          return null;
        }

        const body = thread.lastMessageText?.trim() || (isRu ? "Откройте диалог, чтобы прочитать сообщение." : "Open the dialog to read the message.");
        const linkedTopupLeadId = getLinkedTopupLeadId(thread);

        return {
          id: thread.id,
          bucket: "threadById",
          body,
          href: getMessageHref(thread, user.uid),
          kind: "message",
          meta: formatDate(seconds, isRu),
          read: isNotificationSeen(seenState, "threadById", thread.id, seconds),
          title: linkedTopupLeadId ? (isRu ? "Сообщение по заявке" : "Order message") : isRu ? "Личное сообщение" : "Private message",
          value: seconds
        };
      })
      .filter((item): item is NotificationItem => Boolean(item));

    const orderItems = topupLeads
      .map<NotificationItem | null>((lead) => {
        const status = lead.status ?? "new";
        const seconds = getSeconds(lead.updatedAt) || getSeconds(lead.createdAt);

        if (!seconds || !isActiveOrderNotification(status)) {
          return null;
        }

        const label = stageLabels[status]?.[isRu ? "ru" : "en"] ?? status;

        return {
          id: lead.id,
          bucket: "topupById",
          body: `${lead.packageName || (isRu ? "Игровой набор" : "Game pack")} · ${label}`,
          href: `/orders/${lead.id}`,
          kind: "order",
          meta: formatDate(seconds, isRu),
          read: isNotificationSeen(seenState, "topupById", lead.id, seconds),
          title: isRu ? "Заявка обновлена" : "Request updated",
          value: seconds
        };
      })
      .filter((item): item is NotificationItem => Boolean(item));

    const offerItems = offers
      .filter(isProfitableOffer)
      .slice(0, 5)
      .map<NotificationItem>((offer) => {
        const seconds = getSeconds(offer.updatedAt) || getSeconds(offer.createdAt) || 1;

        return {
          id: offer.id,
          bucket: "offerById",
          body: offer.comment || offer.description || (isRu ? "Откройте предложение, чтобы посмотреть детали." : "Open the offer to see details."),
          href: `/donate?package=${offer.id}`,
          kind: "offer",
          meta: `${getDonationOfferTitle(offer, isRu)} · ${offer.priceRub.toLocaleString("ru-RU")} ₽`,
          read: isNotificationSeen(seenState, "offerById", offer.id, seconds),
          title: isRu ? "Выгодное предложение" : "Best deal",
          value: seconds
        };
      });

    return [...messageItems, ...orderItems, ...offerItems].sort((a, b) => b.value - a.value);
  }, [isRu, offers, seenState, threads, topupLeads, user?.uid]);

  const unreadNotifications = useMemo(() => notifications.filter((item) => !item.read), [notifications]);
  const visibleNotifications = activeView === "new" ? unreadNotifications : notifications;
  const hotOffers = useMemo(() => offers.filter(isProfitableOffer).slice(0, 5), [offers]);
  const unreadHotOfferCount = notifications.filter((item) => item.kind === "offer" && !item.read).length;

  function markAllSeen() {
    const next = markManyNotificationsSeen(
      seenUid,
      notifications.map((item) => ({ bucket: item.bucket, id: item.id, value: item.value }))
    );
    setSeenState(next);
  }

  function markSeen(item: NotificationItem) {
    setSeenState(markNotificationSeen(seenUid, item.bucket, item.id, item.value));
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.86fr]">
      <GlassPanel className="p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-relic">{isRu ? "Центр портала" : "Portal center"}</p>
            <h2 className="mt-2 text-3xl font-black text-white">{isRu ? "Уведомления" : "Notifications"}</h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
              {isRu
                ? "Новые события не теряются: закрытие всплывающей плашки больше не отмечает уведомление прочитанным."
                : "New events are not lost: closing a toast no longer marks the notification as read."}
            </p>
          </div>
          <button
            type="button"
            onClick={markAllSeen}
            disabled={unreadNotifications.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-relic/30 bg-relic/10 px-4 py-2 text-sm font-bold text-relic transition hover:border-relic hover:bg-relic/20 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <CheckCheck size={17} />
            {isRu ? "Все прочитано" : "Mark all read"}
          </button>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {[
            { id: "new" as const, label: isRu ? "Новые" : "New", count: unreadNotifications.length },
            { id: "history" as const, label: isRu ? "История" : "History", count: notifications.length }
          ].map((view) => (
            <button
              key={view.id}
              type="button"
              onClick={() => setActiveView(view.id)}
              className={`rounded-2xl border px-4 py-3 text-left transition ${
                activeView === view.id
                  ? "border-relic bg-relic/15 text-white shadow-[0_0_20px_rgba(47,124,255,0.16)]"
                  : "border-white/10 bg-black/25 text-zinc-400 hover:border-relic/35 hover:text-white"
              }`}
            >
              <span className="block text-sm font-black text-white">{view.label}</span>
              <span className="mt-1 block text-xs text-zinc-500">{isRu ? "Всего" : "Total"}: {view.count}</span>
            </button>
          ))}
        </div>

        <div className="mt-5 max-h-[560px] space-y-3 overflow-y-auto pr-1">
          {visibleNotifications.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/25 p-5 text-sm leading-6 text-zinc-400">
              {activeView === "new"
                ? isRu
                  ? "Новых уведомлений пока нет."
                  : "No unread notifications yet."
                : isRu
                  ? "История уведомлений пока пустая."
                  : "Notification history is empty."}
            </div>
          ) : null}

          {visibleNotifications.map((item) => {
            const Icon = notificationIcon(item.kind);

            return (
              <Link
                key={`${item.bucket}:${item.id}`}
                href={item.href}
                onClick={() => markSeen(item)}
                className={`group flex items-start gap-3 rounded-2xl border p-4 transition hover:-translate-y-0.5 ${
                  item.read
                    ? "border-white/10 bg-black/20 hover:border-relic/25"
                    : "border-relic/[0.28] bg-relic/[0.08] hover:border-relic/55"
                }`}
              >
                <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-relic/30 bg-relic/[0.12] text-relic">
                  {!item.read ? <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border border-black bg-blood shadow-[0_0_12px_rgba(216,75,53,0.9)]" /> : null}
                  <Icon size={19} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-black text-white">
                    {item.title}
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${item.read ? "bg-white/8 text-zinc-500" : "bg-blood/15 text-blood"}`}>
                      {item.read ? (isRu ? "прочитано" : "read") : (isRu ? "новое" : "new")}
                    </span>
                  </span>
                  <span className="mt-1 block whitespace-normal break-words text-sm leading-6 text-zinc-300">{item.body}</span>
                  <span className="mt-1 block text-xs text-zinc-500">{item.meta}</span>
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
            <p className="text-xs font-bold tracking-[0.18em] text-relic">{isRu ? "Выгодное предложение" : "Best deal"}</p>
            <h2 className="text-2xl font-black text-white">{isRu ? "Предложения доната" : "Donation offers"}</h2>
          </div>
        </div>

        <div className="max-h-[560px] space-y-3 overflow-y-auto pr-1">
          {hotOffers.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-black/25 p-5 text-sm leading-6 text-zinc-400">
              {isRu ? "Сейчас нет опубликованных предложений с тегом «выгодно»." : "No published offers tagged as best deal yet."}
            </div>
          ) : null}

          {hotOffers.map((offer) => {
            const imageUrl = getDonationOfferImageUrl(offer);
            const seconds = getSeconds(offer.updatedAt) || getSeconds(offer.createdAt) || 1;
            const isRead = isNotificationSeen(seenState, "offerById", offer.id, seconds);

            return (
              <Link
                key={offer.id}
                href={`/donate?package=${offer.id}`}
                onClick={() => setSeenState(markNotificationSeen(seenUid, "offerById", offer.id, seconds))}
                className="group relative min-h-[132px] overflow-hidden rounded-2xl border border-relic/20 bg-[#07111d] p-4 transition hover:-translate-y-0.5 hover:border-relic/55"
              >
                {imageUrl ? (
                  <span className="absolute inset-0 bg-cover bg-center opacity-65 transition group-hover:scale-[1.04] group-hover:opacity-80" style={{ backgroundImage: `url(${imageUrl})` }} />
                ) : null}
                <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(4,8,14,0.92),rgba(4,8,14,0.72)_48%,rgba(4,8,14,0.28))]" />
                <span className="relative z-10 flex h-full min-h-[100px] flex-col justify-between">
                  <span>
                    <span className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] text-blood">
                      {!isRead ? <span className="h-2 w-2 rounded-full bg-blood shadow-[0_0_12px_rgba(216,75,53,0.8)]" /> : null}
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
        {unreadHotOfferCount > 0 ? (
          <p className="mt-4 text-xs leading-5 text-zinc-500">
            {isRu ? "Предложение становится прочитанным только после открытия." : "An offer becomes read only after opening it."}
          </p>
        ) : null}
      </GlassPanel>
    </div>
  );
}
