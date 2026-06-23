"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { collection, limit, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useDonationOffers } from "@/components/donate/use-donation-offers";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import {
  hydrateNotificationSeenState,
  isNotificationSeen,
  notificationSeenStateEvent,
  notificationSeenStorageKey,
  readNotificationSeenState,
  type NotificationSeenState
} from "@/lib/notifications/seen-state";

type FirestoreTime = {
  seconds?: number;
};

type DirectThread = {
  id: string;
  participants?: string[];
  lastMessageUid?: string;
  lastMessageAt?: FirestoreTime;
};

type TopupLead = {
  id: string;
  uid?: string;
  status?: string;
  createdAt?: FirestoreTime;
  updatedAt?: FirestoreTime;
};

type HotOffer = {
  id: string;
  tag?: string;
  comment?: string;
  description?: string;
  status?: string;
  createdAt?: FirestoreTime;
  updatedAt?: FirestoreTime;
};

function getSeconds(value?: FirestoreTime) {
  return value?.seconds ?? 0;
}

function formatNotificationCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

const finishedOrderStatuses = new Set(["completed", "processed", "cancelled", "canceled", "done", "closed"]);

function isActiveOrderNotification(status?: string) {
  const normalized = (status ?? "new").toLowerCase();
  return normalized !== "new" && !finishedOrderStatuses.has(normalized);
}

function isProfitableOffer(offer: HotOffer) {
  const marker = `${offer.tag ?? ""} ${offer.comment ?? ""} ${offer.description ?? ""}`.toLowerCase();
  return (offer.status ?? "published") === "published" && (marker.includes("выгод") || marker.includes("hot") || marker.includes("deal") || marker.includes("best"));
}

export function HomeUnreadBell({ label }: { label: string }) {
  const { user } = useAuth();
  const donationOffers = useDonationOffers();
  const [mounted, setMounted] = useState(false);
  const [threads, setThreads] = useState<DirectThread[]>([]);
  const [topupLeads, setTopupLeads] = useState<TopupLead[]>([]);
  const [seenState, setSeenState] = useState<NotificationSeenState>({});
  const seenUid = user?.uid ?? "";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !seenUid) {
      setSeenState({});
      return;
    }

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
  }, [mounted, seenUid]);

  useEffect(() => {
    if (!mounted || !user?.uid) {
      setThreads([]);
      setTopupLeads([]);
      return;
    }

    setSeenState(readNotificationSeenState(user.uid));
    void hydrateNotificationSeenState(user.uid).then(setSeenState);

    const threadsQuery = query(collection(db, "directThreads"), where("participants", "array-contains", user.uid), limit(50));
    return onSnapshot(
      threadsQuery,
      (snapshot) => {
        setThreads(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<DirectThread, "id">) })));
        setSeenState(readNotificationSeenState(user.uid));
      },
      () => setThreads([])
    );
  }, [mounted, seenUid, user?.uid]);

  useEffect(() => {
    if (!mounted || !user?.uid) {
      return;
    }

    const topupQuery = query(collection(db, collections.topupLeads), where("uid", "==", user.uid), limit(30));

    return onSnapshot(
      topupQuery,
      (snapshot) => {
        setTopupLeads(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<TopupLead, "id">) })));
        setSeenState(readNotificationSeenState(user.uid));
      },
      () => setTopupLeads([])
    );
  }, [mounted, user?.uid]);

  const hotOffers = useMemo<HotOffer[]>(() => {
    if (!user?.uid) {
      return [];
    }

    return donationOffers.filter(isProfitableOffer).slice(0, 5);
  }, [donationOffers, user?.uid]);

  const unreadCount = useMemo(() => {
    if (!user?.uid) {
      return 0;
    }

    return threads.filter((thread) => {
      const seconds = getSeconds(thread.lastMessageAt);
      return seconds > 0 && thread.lastMessageUid && thread.lastMessageUid !== user.uid && !isNotificationSeen(seenState, "threadById", thread.id, seconds);
    }).length;
  }, [seenState, threads, user?.uid]);

  const topupNotificationCount = useMemo(() => {
    if (!user?.uid) {
      return 0;
    }

    return topupLeads.filter((lead) => {
      const status = lead.status ?? "new";
      const seconds = getSeconds(lead.updatedAt) || getSeconds(lead.createdAt);
      return isActiveOrderNotification(status) && seconds > 0 && !isNotificationSeen(seenState, "topupById", lead.id, seconds);
    }).length;
  }, [seenState, topupLeads, user?.uid]);

  const hotOfferCount = useMemo(() => {
    if (!user?.uid) {
      return 0;
    }

    return (
      hotOffers.filter((offer) => {
        const seconds = getSeconds(offer.updatedAt) || getSeconds(offer.createdAt) || 1;
        return !isNotificationSeen(seenState, "offerById", offer.id, seconds);
      }).length
    );
  }, [hotOffers, seenState, user?.uid]);

  const notificationCount = mounted ? unreadCount + topupNotificationCount + hotOfferCount : 0;
  const hasActiveSignal = notificationCount > 0;

  return (
    <Link
      href="/notifications"
      className="group relative grid h-12 w-12 place-items-center overflow-visible rounded-2xl border border-relic/35 bg-[linear-gradient(145deg,rgba(9,14,22,0.96),rgba(24,17,9,0.88))] text-relic shadow-[inset_0_0_18px_rgba(99,166,255,0.08),0_0_24px_rgba(47,124,255,0.13)] transition duration-200 hover:-translate-y-0.5 hover:border-[#63a6ff] hover:text-[#b8d7ff] hover:shadow-[inset_0_0_22px_rgba(99,166,255,0.14),0_0_34px_rgba(47,124,255,0.28)]"
      aria-label={label}
    >
      <span className="pointer-events-none absolute inset-[3px] rounded-[14px] border border-white/[0.04]" />
      <Bell size={21} className="relative z-10 drop-shadow-[0_0_8px_rgba(99,166,255,0.35)] transition group-hover:scale-105" />
      {mounted && hotOfferCount > 0 ? (
        <span className="absolute right-2 top-2 z-20 h-2.5 w-2.5 rounded-full border border-black bg-blood shadow-[0_0_14px_rgba(216,75,53,0.9)]" />
      ) : null}
      {mounted && hasActiveSignal ? (
        <span className="absolute -right-2 -top-2 z-30 grid min-h-6 min-w-6 place-items-center rounded-full border border-[#f7d98a] bg-[linear-gradient(180deg,#b8d7ff,#c89a3d)] px-1.5 text-[10px] font-black leading-none text-black shadow-[0_0_18px_rgba(99,166,255,0.62)]">
          {formatNotificationCount(notificationCount)}
        </span>
      ) : null}
    </Link>
  );
}
