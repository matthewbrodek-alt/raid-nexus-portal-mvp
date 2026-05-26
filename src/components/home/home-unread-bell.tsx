"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { collection, getDocs, limit, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

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

type SeenState = {
  threadById?: Record<string, number>;
  topupById?: Record<string, number>;
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

export function HomeUnreadBell({ label }: { label: string }) {
  const { user } = useAuth();
  const [threads, setThreads] = useState<DirectThread[]>([]);
  const [topupLeads, setTopupLeads] = useState<TopupLead[]>([]);
  const [hotOfferCount, setHotOfferCount] = useState(0);
  const [seenState, setSeenState] = useState<SeenState>({});

  useEffect(() => {
    if (!user?.uid) {
      setThreads([]);
      setTopupLeads([]);
      setSeenState({});
      return;
    }

    setSeenState(readSeenState(user.uid));

    const threadsQuery = query(collection(db, "directThreads"), where("participants", "array-contains", user.uid));
    return onSnapshot(
      threadsQuery,
      (snapshot) => {
        setThreads(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<DirectThread, "id">) })));
        setSeenState(readSeenState(user.uid));
      },
      () => setThreads([])
    );
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const topupQuery = query(collection(db, collections.topupLeads), where("uid", "==", user.uid));

    return onSnapshot(
      topupQuery,
      (snapshot) => {
        setTopupLeads(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<TopupLead, "id">) })));
        setSeenState(readSeenState(user.uid));
      },
      () => setTopupLeads([])
    );
  }, [user?.uid]);

  useEffect(() => {
    let cancelled = false;

    async function loadHotOffers() {
      try {
        const offersQuery = query(collection(db, collections.donationOffers), where("status", "==", "published"), limit(5));
        const snapshot = await getDocs(offersQuery);

        if (!cancelled) {
          setHotOfferCount(snapshot.size);
        }
      } catch {
        if (!cancelled) {
          setHotOfferCount(0);
        }
      }
    }

    void loadHotOffers();

    return () => {
      cancelled = true;
    };
  }, []);

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

  const notificationCount = unreadCount + topupNotificationCount + hotOfferCount;

  return (
    <Link href="/notifications" className="raid-glow-button relative grid h-11 w-11 place-items-center border border-transparent text-zinc-300" aria-label={label}>
      <Bell size={20} />
      {hotOfferCount > 0 ? (
        <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border border-black bg-blood shadow-[0_0_14px_rgba(216,75,53,0.9)]" />
      ) : null}
      {notificationCount > 0 ? (
        <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full border border-black bg-relic px-1 text-[10px] font-black text-black">
          {notificationCount > 9 ? "9+" : notificationCount}
        </span>
      ) : null}
    </Link>
  );
}
