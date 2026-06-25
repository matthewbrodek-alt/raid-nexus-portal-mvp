"use client";

import { collection, doc, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { Ban, LinkIcon, MessageCircleWarning, ShieldAlert, ShieldCheck, UserPlus, X } from "lucide-react";
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

type StreamModerator = {
  uid: string;
  displayName: string;
  email?: string;
  addedAt?: number;
};

type StreamModeratorDocument = {
  moderatorUids?: string[];
  moderators?: StreamModerator[];
};

const suspiciousLinkPattern = /(https?:\/\/|www\.|t\.me\/|bit\.ly|tinyurl|discord\.gg|\.ru\/|\.com\/)/i;

function getMinuteBucket(message: ChatMessage) {
  return Math.floor((message.createdAt?.seconds ?? 0) / 60);
}

function getUserLabel(user: UserProfile) {
  return user.displayName || user.email || user.uid;
}

function getModeratorLabel(moderator: StreamModerator) {
  return moderator.displayName || moderator.email || moderator.uid;
}

export function AdminChatModeration() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<UserProfile[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [streamModerators, setStreamModerators] = useState<StreamModerator[]>([]);
  const [moderatorSearch, setModeratorSearch] = useState("");
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
    const unsubUsers = onSnapshot(collection(db, collections.users), (snapshot) => {
      setUsers(snapshot.docs.map((item) => item.data() as UserProfile));
    });
    const unsubStreamModerators = onSnapshot(doc(db, collections.siteSettings, "streamChatModerators"), (snapshot) => {
      const data = snapshot.data() as StreamModeratorDocument | undefined;
      setStreamModerators(Array.isArray(data?.moderators) ? data.moderators.filter((item) => item.uid) : []);
    });

    return () => {
      unsubMessages();
      unsubBlocked();
      unsubUsers();
      unsubStreamModerators();
    };
  }, []);

  const suspiciousLinks = useMemo(() => messages.filter((message) => suspiciousLinkPattern.test(message.text ?? "")), [messages]);

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

  const streamModeratorUidSet = useMemo(() => new Set(streamModerators.map((moderator) => moderator.uid)), [streamModerators]);

  const moderatorCandidates = useMemo(() => {
    const queryText = moderatorSearch.trim().toLowerCase();

    if (!queryText) {
      return [];
    }

    return users
      .filter((user) => !streamModeratorUidSet.has(user.uid))
      .filter((user) => `${user.displayName} ${user.email} ${user.uid}`.toLowerCase().includes(queryText))
      .slice(0, 8);
  }, [moderatorSearch, streamModeratorUidSet, users]);

  async function saveStreamModerators(nextModerators: StreamModerator[]) {
    const normalized = nextModerators
      .filter((item) => item.uid)
      .map((item) => ({
        uid: item.uid,
        displayName: item.displayName || item.email || item.uid,
        email: item.email ?? "",
        addedAt: item.addedAt ?? Date.now()
      }));

    await setDoc(
      doc(db, collections.siteSettings, "streamChatModerators"),
      {
        moderatorUids: normalized.map((item) => item.uid),
        moderators: normalized,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  }

  async function addStreamModerator(user: UserProfile) {
    setStatus("");
    await saveStreamModerators([
      ...streamModerators,
      {
        uid: user.uid,
        displayName: getUserLabel(user),
        email: user.email,
        addedAt: Date.now()
      }
    ]);
    setModeratorSearch("");
    setStatus("Модератор эфира добавлен.");
  }

  async function removeStreamModerator(uid: string) {
    setStatus("");
    await saveStreamModerators(streamModerators.filter((moderator) => moderator.uid !== uid));
    setStatus("Модератор эфира снят.");
  }

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
          <p className="text-xs font-bold tracking-[0.22em] text-ember">Chat Guard</p>
          <h2 className="text-xl font-bold text-white sm:text-2xl">Контроль чатов</h2>
        </div>
      </div>

      <div className="mb-5 rounded-2xl border border-sky-400/20 bg-sky-400/8 p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <div className="mb-2 flex items-center gap-2 text-white">
              <ShieldCheck size={18} className="text-sky-300" />
              <h3 className="font-semibold">Модераторы эфира</h3>
            </div>
            <p className="text-sm leading-6 text-zinc-400">
              Эти пользователи модерируют только чат трансляции: удаляют сообщения, выдают муты и видят журнал действий. Админы и owner сайта имеют эти права автоматически.
            </p>
          </div>

          <div className="w-full max-w-md">
            <div className="relative">
              <input
                value={moderatorSearch}
                onChange={(event) => setModeratorSearch(event.target.value)}
                placeholder="Найти пользователя по нику или email"
                className="w-full rounded-xl border border-sky-400/20 bg-black/30 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-600 focus:border-sky-300/50"
              />
              {moderatorCandidates.length ? (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl border border-sky-400/20 bg-[#07111f] shadow-2xl">
                  {moderatorCandidates.map((candidate) => (
                    <button
                      key={candidate.uid}
                      type="button"
                      onClick={() => void addStreamModerator(candidate)}
                      className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-sky-400/10"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-black text-white">{getUserLabel(candidate)}</span>
                        <span className="block truncate text-xs text-zinc-500">{candidate.email}</span>
                      </span>
                      <UserPlus size={16} className="shrink-0 text-sky-300" />
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {streamModerators.length ? (
            streamModerators.map((moderator) => (
              <span key={moderator.uid} className="inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-400/10 px-3 py-2 text-xs font-black text-sky-100">
                {getModeratorLabel(moderator)}
                <button
                  type="button"
                  onClick={() => void removeStreamModerator(moderator.uid)}
                  className="grid size-5 place-items-center rounded-full bg-black/30 text-sky-100 transition hover:bg-red-400/20 hover:text-red-100"
                  aria-label="Снять модератора эфира"
                >
                  <X size={13} />
                </button>
              </span>
            ))
          ) : (
            <p className="text-sm text-zinc-500">Дополнительных модераторов эфира пока нет.</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-3 flex items-center gap-2 text-white">
            <MessageCircleWarning size={18} className="text-relic" />
            <h3 className="font-semibold">Частые сообщения</h3>
          </div>
          <div className="space-y-2">
            {frequentUsers.map((item) => (
              <div key={`${item.uid}-${item.count}`} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.04] p-3">
                <span className="min-w-0 truncate text-sm text-zinc-300">{item.displayName}</span>
                <button onClick={() => void blockUser(item.uid)} className="shrink-0 rounded-lg border border-ember/30 px-3 py-1 text-xs font-semibold text-ember hover:bg-ember/10">
                  Блок
                </button>
              </div>
            ))}
            {frequentUsers.length === 0 ? <p className="text-sm text-zinc-500">Спама по частоте не найдено.</p> : null}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-3 flex items-center gap-2 text-white">
            <LinkIcon size={18} className="text-relic" />
            <h3 className="font-semibold">Подозрительные ссылки</h3>
          </div>
          <div className="space-y-2">
            {suspiciousLinks.slice(0, 8).map((message) => (
              <div key={message.id} className="rounded-xl bg-white/[0.04] p-3">
                <p className="truncate text-sm font-semibold text-white">{message.displayName ?? "Unknown"}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-400">{message.text}</p>
              </div>
            ))}
            {suspiciousLinks.length === 0 ? <p className="text-sm text-zinc-500">Ссылок на проверку нет.</p> : null}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="mb-3 flex items-center gap-2 text-white">
            <Ban size={18} className="text-ember" />
            <h3 className="font-semibold">Заблокированные</h3>
          </div>
          <div className="space-y-2">
            {blockedUsers.map((user) => (
              <div key={user.uid} className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.04] p-3">
                <span className="min-w-0 truncate text-sm text-zinc-300">{user.email}</span>
                <button onClick={() => void unblockUser(user.uid)} className="shrink-0 rounded-lg border border-relic/30 px-3 py-1 text-xs font-semibold text-relic hover:bg-relic/10">
                  Вернуть
                </button>
              </div>
            ))}
            {blockedUsers.length === 0 ? <p className="text-sm text-zinc-500">Список пуст.</p> : null}
          </div>
        </div>
      </div>

      {status ? <p className="mt-4 rounded-xl border border-relic/20 bg-relic/[0.08] p-3 text-sm text-zinc-300">{status}</p> : null}
    </GlassPanel>
  );
}
