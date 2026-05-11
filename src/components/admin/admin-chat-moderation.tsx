"use client";

import { Ban, LinkIcon, MessageCircleWarning, ShieldAlert } from "lucide-react";
import { collection, doc, limit, onSnapshot, orderBy, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { UserProfile } from "@/lib/auth/types";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

type ChatMessage = {
  id: string;
  uid?: string;
  displayName?: string;
  text?: string;
  createdAt?: { seconds?: number };
};

const suspiciousLinkPattern = /(https?:\/\/|www\.|t\.me\/|bit\.ly|tinyurl|discord\.gg|\.ru\/|\.com\/)/i;

function getMinuteBucket(message: ChatMessage) {
  return Math.floor((message.createdAt?.seconds ?? 0) / 60);
}

export function AdminChatModeration() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<UserProfile[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const messagesQuery = query(collection(db, collections.chatRooms, "global", "messages"), orderBy("createdAt", "desc"), limit(80));
    const blockedQuery = query(collection(db, collections.users), where("status", "==", "blocked"));

    const unsubMessages = onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<ChatMessage, "id">) })));
    });
    const unsubBlocked = onSnapshot(blockedQuery, (snapshot) => {
      setBlockedUsers(snapshot.docs.map((item) => item.data() as UserProfile));
    });

    return () => {
      unsubMessages();
      unsubBlocked();
    };
  }, []);

  const suspiciousLinks = useMemo(
    () => messages.filter((message) => suspiciousLinkPattern.test(message.text ?? "")),
    [messages]
  );
  const frequentUsers = useMemo(() => {
    const counter = new Map<string, { uid: string; displayName: string; count: number }>();

    for (const message of messages) {
      if (!message.uid || !message.createdAt?.seconds) {
        continue;
      }

      const key = `${message.uid}:${getMinuteBucket(message)}`;
      const current = counter.get(key) ?? {
        uid: message.uid,
        displayName: message.displayName ?? message.uid,
        count: 0
      };
      current.count += 1;
      counter.set(key, current);
    }

    return Array.from(counter.values())
      .filter((item) => item.count >= 4)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [messages]);

  async function blockUser(uid: string) {
    setStatus("");

    try {
      await updateDoc(doc(db, collections.users, uid), {
        status: "blocked"
      });
      setStatus("Пользователь заблокирован.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось заблокировать пользователя.");
    }
  }

  async function unblockUser(uid: string) {
    setStatus("");

    try {
      await updateDoc(doc(db, collections.users, uid), {
        status: "active"
      });
      setStatus("Пользователь разблокирован.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось разблокировать пользователя.");
    }
  }

  return (
    <GlassPanel className="p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <ShieldAlert className="shrink-0 text-ember" />
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-ember">Chat Guard</p>
          <h2 className="text-xl font-bold text-white sm:text-2xl">Контроль общего чата</h2>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <div className="mb-3 flex items-center gap-2 text-white">
            <MessageCircleWarning size={18} className="text-relic" />
            <h3 className="font-semibold">Частые сообщения</h3>
          </div>
          <div className="space-y-2">
            {frequentUsers.map((item) => (
              <div key={`${item.uid}-${item.count}`} className="flex items-center justify-between gap-3 rounded-md bg-white/[0.04] p-3">
                <span className="min-w-0 truncate text-sm text-zinc-300">{item.displayName}</span>
                <button onClick={() => void blockUser(item.uid)} className="shrink-0 rounded-md border border-ember/30 px-3 py-1 text-xs font-semibold text-ember hover:bg-ember/10">
                  Блок
                </button>
              </div>
            ))}
            {frequentUsers.length === 0 ? <p className="text-sm text-zinc-500">Спама по частоте не найдено.</p> : null}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <div className="mb-3 flex items-center gap-2 text-white">
            <LinkIcon size={18} className="text-relic" />
            <h3 className="font-semibold">Подозрительные ссылки</h3>
          </div>
          <div className="space-y-2">
            {suspiciousLinks.slice(0, 8).map((message) => (
              <div key={message.id} className="rounded-md bg-white/[0.04] p-3">
                <p className="truncate text-sm font-semibold text-white">{message.displayName ?? "Unknown"}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400">{message.text}</p>
              </div>
            ))}
            {suspiciousLinks.length === 0 ? <p className="text-sm text-zinc-500">Ссылок на проверку нет.</p> : null}
          </div>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/20 p-4">
          <div className="mb-3 flex items-center gap-2 text-white">
            <Ban size={18} className="text-ember" />
            <h3 className="font-semibold">Заблокированные</h3>
          </div>
          <div className="space-y-2">
            {blockedUsers.map((user) => (
              <div key={user.uid} className="flex items-center justify-between gap-3 rounded-md bg-white/[0.04] p-3">
                <span className="min-w-0 truncate text-sm text-zinc-300">{user.email}</span>
                <button onClick={() => void unblockUser(user.uid)} className="shrink-0 rounded-md border border-relic/30 px-3 py-1 text-xs font-semibold text-relic hover:bg-relic/10">
                  Вернуть
                </button>
              </div>
            ))}
            {blockedUsers.length === 0 ? <p className="text-sm text-zinc-500">Список пуст.</p> : null}
          </div>
        </div>
      </div>

      {status ? <p className="mt-4 rounded-lg border border-relic/20 bg-relic/[0.08] p-3 text-sm text-zinc-300">{status}</p> : null}
    </GlassPanel>
  );
}
