"use client";

import { Bell, MessageCircle, ShoppingBag, X } from "lucide-react";
import { collection, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { usePathname, useRouter } from "next/navigation";
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
  lastMessageText?: string;
  lastMessageUid?: string;
  lastMessageAt?: FirestoreTime;
};

type TopupLead = {
  id: string;
  uid?: string;
  telegram?: string;
  packageName?: string;
  status?: string;
  createdAt?: FirestoreTime;
  updatedAt?: FirestoreTime;
};

type SeenState = {
  topupById?: Record<string, number>;
  threadById?: Record<string, number>;
};

type Toast = {
  id: string;
  icon: "message" | "topup";
  title: string;
  body: string;
  href: string;
  seenKey: "threadById" | "topupById";
  seenValue: number;
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

  const raw = window.localStorage.getItem(seenStorageKey(uid));
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as SeenState;
  } catch {
    return {};
  }
}

function writeSeenState(uid: string, next: SeenState) {
  window.localStorage.setItem(seenStorageKey(uid), JSON.stringify(next));
}

function markSeen(uid: string, bucket: "threadById" | "topupById", id: string, value: number) {
  const current = readSeenState(uid);
  writeSeenState(uid, {
    ...current,
    [bucket]: {
      ...(current[bucket] ?? {}),
      [id]: value
    }
  });
}

export function SiteNotificationToast() {
  const { profile, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [threads, setThreads] = useState<DirectThread[]>([]);
  const [topupLeads, setTopupLeads] = useState<TopupLead[]>([]);
  const [seenState, setSeenState] = useState<SeenState>({});
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const isAdmin = profile?.role === "admin" || profile?.role === "owner";

  useEffect(() => {
    if (!user?.uid) {
      setThreads([]);
      setTopupLeads([]);
      setSeenState({});
      return;
    }

    setSeenState(readSeenState(user.uid));
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const threadsQuery = query(collection(db, "directThreads"), where("participants", "array-contains", user.uid));
    return onSnapshot(
      threadsQuery,
      (snapshot) => {
        setThreads(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<DirectThread, "id">) })));
      },
      () => setThreads([])
    );
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const topupQuery = isAdmin
      ? query(collection(db, collections.topupLeads), orderBy("createdAt", "desc"), limit(20))
      : query(collection(db, collections.topupLeads), where("uid", "==", user.uid));

    return onSnapshot(
      topupQuery,
      (snapshot) => {
        setTopupLeads(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<TopupLead, "id">) })));
      },
      () => setTopupLeads([])
    );
  }, [isAdmin, user?.uid]);

  useEffect(() => {
    if (!user?.uid || !pathname?.startsWith("/chat")) {
      return;
    }

    const nextThreadById = { ...(seenState.threadById ?? {}) };
    let changed = false;

    for (const thread of threads) {
      const seconds = getSeconds(thread.lastMessageAt);

      if (seconds && (nextThreadById[thread.id] ?? 0) < seconds) {
        nextThreadById[thread.id] = seconds;
        changed = true;
      }
    }

    if (changed) {
      const next = { ...seenState, threadById: nextThreadById };
      setSeenState(next);
      writeSeenState(user.uid, next);
    }
  }, [pathname, seenState, threads, user?.uid]);

  const toast = useMemo<Toast | null>(() => {
    if (!user?.uid) {
      return null;
    }

    const unreadThread = threads
      .filter((thread) => {
        const seconds = getSeconds(thread.lastMessageAt);
        return (
          seconds > 0 &&
          thread.lastMessageUid &&
          thread.lastMessageUid !== user.uid &&
          (seenState.threadById?.[thread.id] ?? 0) < seconds
        );
      })
      .sort((a, b) => getSeconds(b.lastMessageAt) - getSeconds(a.lastMessageAt))[0];

    if (unreadThread && !dismissedIds.includes(`thread:${unreadThread.id}`)) {
      return {
        id: unreadThread.id,
        icon: "message",
        title: "Новое личное сообщение",
        body: unreadThread.lastMessageText || "Откройте диалог, чтобы прочитать сообщение.",
        href: "/chat",
        seenKey: "threadById",
        seenValue: getSeconds(unreadThread.lastMessageAt)
      };
    }

    const relevantTopup = topupLeads
      .filter((lead) => {
        const seconds = getSeconds(lead.updatedAt) || getSeconds(lead.createdAt);
        const status = lead.status ?? "new";

        if (!seconds || (seenState.topupById?.[lead.id] ?? 0) >= seconds) {
          return false;
        }

        if (isAdmin) {
          return status === "new" || status === "pending";
        }

        return lead.uid === user.uid && status !== "new";
      })
      .sort((a, b) => (getSeconds(b.updatedAt) || getSeconds(b.createdAt)) - (getSeconds(a.updatedAt) || getSeconds(a.createdAt)))[0];

    if (relevantTopup && !dismissedIds.includes(`topup:${relevantTopup.id}`)) {
      const seconds = getSeconds(relevantTopup.updatedAt) || getSeconds(relevantTopup.createdAt);

      return {
        id: relevantTopup.id,
        icon: "topup",
        title: isAdmin ? "Новая заявка на донат" : "Заявка на донат обновлена",
        body: isAdmin
          ? `${relevantTopup.telegram || "Клиент"}: ${relevantTopup.packageName || "выбранный набор"}`
          : `${relevantTopup.packageName || "Ваш набор"}: ${relevantTopup.status || "обновлено"}`,
        href: isAdmin ? "/admin" : `/orders/${relevantTopup.id}`,
        seenKey: "topupById",
        seenValue: seconds
      };
    }

    return null;
  }, [dismissedIds, isAdmin, seenState, threads, topupLeads, user?.uid]);

  if (!toast || !user?.uid) {
    return null;
  }

  const activeToast = toast;
  const Icon = activeToast.icon === "message" ? MessageCircle : ShoppingBag;

  function closeToast() {
    if (!user?.uid) {
      return;
    }

    markSeen(user.uid, activeToast.seenKey, activeToast.id, activeToast.seenValue);
    setSeenState(readSeenState(user.uid));
    setDismissedIds((current) => [...current, `${activeToast.seenKey === "threadById" ? "thread" : "topup"}:${activeToast.id}`]);
  }

  function openToast() {
    closeToast();
    router.push(activeToast.href);
  }

  return (
    <div className="fixed bottom-4 left-3 right-3 z-[70] sm:bottom-6 sm:left-auto sm:right-6 sm:w-[360px]">
      <div className="relative overflow-hidden rounded-[16px] border border-relic/35 bg-[#070d16]/95 p-4 text-white shadow-[0_18px_70px_rgba(0,0,0,0.62),0_0_34px_rgba(200,154,61,0.16)] backdrop-blur-md">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-relic/80 to-transparent" />
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={openToast}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-relic/35 bg-relic/15 text-relic transition hover:bg-relic hover:text-black"
            aria-label="Открыть уведомление"
          >
            <Icon size={19} />
          </button>
          <button type="button" onClick={openToast} className="min-w-0 flex-1 text-left">
            <p className="flex items-center gap-2 text-sm font-bold text-white">
              <Bell size={14} className="text-relic" />
              {activeToast.title}
            </p>
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-zinc-300">{activeToast.body}</p>
          </button>
          <button
            type="button"
            onClick={closeToast}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-white/10 text-zinc-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Закрыть уведомление"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
