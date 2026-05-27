"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { collection, getDocs, limit, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import {
  markNotificationSeen,
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
  createdAt?: FirestoreTime;
  updatedAt?: FirestoreTime;
};

function getSeconds(value?: FirestoreTime) {
  return value?.seconds ?? 0;
}

function formatNotificationCount(count: number) {
  return count > 99 ? "99+" : String(count);
}

export function HomeUnreadBell({ label }: { label: string }) {
  const { user } = useAuth();
  const [threads, setThreads] = useState<DirectThread[]>([]);
  const [topupLeads, setTopupLeads] = useState<TopupLead[]>([]);
  const [hotOffers, setHotOffers] = useState<HotOffer[]>([]);
  const [seenState, setSeenState] = useState<NotificationSeenState>({});
  const seenUid = user?.uid ?? "guest";

  useEffect(() => {
    setSeenState(readNotificationSeenState(seenUid));

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
      setSeenState(readNotificationSeenState(seenUid));
      return;
    }

    setSeenState(readNotificationSeenState(user.uid));

    const threadsQuery = query(collection(db, "directThreads"), where("participants", "array-contains", user.uid));
    return onSnapshot(
      threadsQuery,
      (snapshot) => {
        setThreads(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<DirectThread, "id">) })));
        setSeenState(readNotificationSeenState(user.uid));
      },
      () => setThreads([])
    );
  }, [seenUid, user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const topupQuery = query(collection(db, collections.topupLeads), where("uid", "==", user.uid));

    return onSnapshot(
      topupQuery,
      (snapshot) => {
        setTopupLeads(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<TopupLead, "id">) })));
        setSeenState(readNotificationSeenState(user.uid));
      },
      () => setTopupLeads([])
    );
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setHotOffers([]);
      return;
    }

    let cancelled = false;

    async function loadHotOffers() {
      try {
        const offersQuery = query(collection(db, collections.donationOffers), where("status", "==", "published"), limit(5));
        const snapshot = await getDocs(offersQuery);

        if (!cancelled) {
          setHotOffers(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<HotOffer, "id">) })));
          setSeenState(readNotificationSeenState(seenUid));
        }
      } catch {
        if (!cancelled) {
          setHotOffers([]);
        }
      }
    }

    void loadHotOffers();

    return () => {
      cancelled = true;
    };
  }, [seenUid, user?.uid]);

  const unreadCount = useMemo(() => {
    if (!user?.uid) {
      return 0;
    }

    return threads.filter((thread) => {
      const seconds = getSeconds(thread.lastMessageAt);
      return seconds > 0 && thread.lastMessageUid && thread.lastMessageUid !== user.uid && (seenState.threadById?.[thread.id] ?? 0) < seconds;
    }).length;
  }, [seenState.threadById, threads, user?.uid]);

  const topupNotificationCount = useMemo(() => {
    if (!user?.uid) {
      return 0;
    }

    return topupLeads.filter((lead) => {
      const status = lead.status ?? "new";
      const seconds = getSeconds(lead.updatedAt) || getSeconds(lead.createdAt);
      return status !== "new" && seconds > 0 && (seenState.topupById?.[lead.id] ?? 0) < seconds;
    }).length;
  }, [seenState.topupById, topupLeads, user?.uid]);

  const hotOfferCount = useMemo(() => {
    if (!user?.uid) {
      return 0;
    }

    return (
      hotOffers.filter((offer) => {
        const seconds = getSeconds(offer.updatedAt) || getSeconds(offer.createdAt) || 1;
        return (seenState.offerById?.[offer.id] ?? 0) < seconds;
      }).length
    );
  }, [hotOffers, seenState.offerById, user?.uid]);

  const notificationCount = unreadCount + topupNotificationCount + hotOfferCount;
  const hasActiveSignal = notificationCount > 0;

  function markVisibleOffersSeen() {
    if (!user?.uid) {
      return;
    }

    for (const offer of hotOffers) {
      markNotificationSeen(user.uid, "offerById", offer.id, getSeconds(offer.updatedAt) || getSeconds(offer.createdAt) || 1);
    }

    setSeenState(readNotificationSeenState(user.uid));
  }

  return (
    <Link
      href="/notifications"
      onClick={markVisibleOffersSeen}
      className="group relative grid h-12 w-12 place-items-center overflow-visible rounded-2xl border border-relic/35 bg-[linear-gradient(145deg,rgba(9,14,22,0.96),rgba(24,17,9,0.88))] text-relic shadow-[inset_0_0_18px_rgba(231,193,106,0.08),0_0_24px_rgba(200,154,61,0.13)] transition duration-200 hover:-translate-y-0.5 hover:border-[#e7c16a] hover:text-[#f4d784] hover:shadow-[inset_0_0_22px_rgba(231,193,106,0.14),0_0_34px_rgba(200,154,61,0.28)]"
      aria-label={label}
    >
      <span className="pointer-events-none absolute inset-[3px] rounded-[14px] border border-white/[0.04]" />
      <Bell size={21} className="relative z-10 drop-shadow-[0_0_8px_rgba(231,193,106,0.35)] transition group-hover:scale-105" />
      {hotOfferCount > 0 ? (
        <span className="absolute right-2 top-2 z-20 h-2.5 w-2.5 rounded-full border border-black bg-blood shadow-[0_0_14px_rgba(216,75,53,0.9)]" />
      ) : null}
      {hasActiveSignal ? (
        <span className="absolute -right-2 -top-2 z-30 grid min-h-6 min-w-6 place-items-center rounded-full border border-[#f7d98a] bg-[linear-gradient(180deg,#f4d784,#c89a3d)] px-1.5 text-[10px] font-black leading-none text-black shadow-[0_0_18px_rgba(231,193,106,0.62)]">
          {formatNotificationCount(notificationCount)}
        </span>
      ) : null}
    </Link>
  );
}
