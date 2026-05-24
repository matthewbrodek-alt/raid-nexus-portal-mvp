"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { db } from "@/lib/firebase/client";

type FirestoreTime = {
  seconds?: number;
};

type DirectThread = {
  id: string;
  participants?: string[];
  lastMessageUid?: string;
  lastMessageAt?: FirestoreTime;
};

type SeenState = {
  threadById?: Record<string, number>;
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
  const [seenState, setSeenState] = useState<SeenState>({});

  useEffect(() => {
    if (!user?.uid) {
      setThreads([]);
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

  const unreadCount = useMemo(() => {
    if (!user?.uid) {
      return 0;
    }

    return threads.filter((thread) => {
      const seconds = getSeconds(thread.lastMessageAt);
      return seconds > 0 && thread.lastMessageUid && thread.lastMessageUid !== user.uid && (seenState.threadById?.[thread.id] ?? 0) < seconds;
    }).length;
  }, [seenState.threadById, threads, user?.uid]);

  return (
    <Link href="/chat" className="raid-glow-button relative grid h-11 w-11 place-items-center border border-transparent text-zinc-300" aria-label={label}>
      <Bell size={20} />
      {unreadCount > 0 ? (
        <span className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full border border-black bg-relic px-1 text-[10px] font-black text-black">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      ) : null}
    </Link>
  );
}
