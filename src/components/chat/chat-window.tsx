"use client";

import Link from "next/link";
import { MessageSquare, Search, Send, Users } from "lucide-react";
import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import type { UserProfile } from "@/lib/auth/types";

type ChatMessage = {
  id: string;
  uid: string;
  displayName: string;
  text: string;
  createdAt?: { seconds?: number };
};

function directThreadId(firstUid: string, secondUid: string) {
  return [firstUid, secondUid].sort().join("__");
}

function formatTime(message: ChatMessage) {
  if (!message.createdAt?.seconds) {
    return "сейчас";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(message.createdAt.seconds * 1000));
}

export function ChatWindow() {
  const { profile, user } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const canSend = message.trim().length > 0 && Boolean(user);

  const activeThread = selectedUser && user ? directThreadId(user.uid, selectedUser.uid) : "global";
  const filteredUsers = useMemo(
    () =>
      users.filter((item) => {
        const haystack = `${item.displayName} ${item.email}`.toLowerCase();
        return item.uid !== user?.uid && haystack.includes(search.trim().toLowerCase());
      }),
    [search, user?.uid, users]
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    const usersQuery = query(collection(db, collections.users), orderBy("displayName"));
    return onSnapshot(usersQuery, (snapshot) => {
      setUsers(snapshot.docs.map((item) => item.data() as UserProfile));
    });
  }, [user]);

  useEffect(() => {
    const messagesRef = selectedUser && user
      ? collection(db, "directThreads", directThreadId(user.uid, selectedUser.uid), "messages")
      : collection(db, collections.chatRooms, "global", "messages");
    const messagesQuery = query(messagesRef, orderBy("createdAt", "asc"), limit(80));

    return onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<ChatMessage, "id">) })));
    });
  }, [selectedUser, user]);

  async function sendMessage() {
    const text = message.trim();

    if (!text || !user || !profile) {
      return;
    }

    if (selectedUser) {
      const threadId = directThreadId(user.uid, selectedUser.uid);
      await setDoc(
        doc(db, "directThreads", threadId),
        {
          participants: [user.uid, selectedUser.uid],
          participantEmails: [profile.email, selectedUser.email],
          lastMessageText: text,
          lastMessageAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
      await addDoc(collection(db, "directThreads", threadId, "messages"), {
        uid: user.uid,
        displayName: profile.displayName,
        text,
        createdAt: serverTimestamp()
      });
    } else {
      await setDoc(
        doc(db, collections.chatRooms, "global"),
        {
          title: "Global",
          type: "global",
          isPublic: true,
          lastMessageText: text,
          lastMessageAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
      await addDoc(collection(db, collections.chatRooms, "global", "messages"), {
        uid: user.uid,
        displayName: profile.displayName,
        text,
        moderationStatus: "visible",
        createdAt: serverTimestamp()
      });
    }

    setMessage("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  return (
    <div className="mx-auto grid min-h-[680px] w-full max-w-7xl overflow-hidden rounded-lg border border-white/10 bg-[#0b1120] shadow-2xl lg:grid-cols-[330px_1fr]">
      <aside className="border-b border-white/10 bg-[#080e1a] lg:border-b-0 lg:border-r">
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-relic/35 bg-relic/15 text-relic">
              <Users size={20} />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-white">Сообщения</h2>
              <p className="text-sm text-zinc-500">Общий чат и личные диалоги</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-2">
            <Search size={16} className="shrink-0 text-zinc-500" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-white placeholder:text-zinc-500 focus:ring-0"
              placeholder="Найти пользователя"
            />
          </div>
        </div>

        <div className="max-h-[320px] overflow-y-auto p-3 lg:max-h-[590px]">
          <button
            type="button"
            onClick={() => setSelectedUser(null)}
            className={`mb-2 flex w-full items-center gap-3 rounded-lg p-3 text-left transition ${
              !selectedUser ? "border border-relic/35 bg-relic/15 text-white" : "border border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]"
            }`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-relic to-amber-700 text-sm font-black text-black">
              G
            </span>
            <span className="min-w-0">
              <span className="block truncate font-semibold">Общий чат</span>
              <span className="block truncate text-xs text-zinc-500">Видят все участники</span>
            </span>
          </button>

          {filteredUsers.map((item) => (
            <button
              key={item.uid}
              type="button"
              onClick={() => setSelectedUser(item)}
              className={`mb-2 flex w-full items-center gap-3 rounded-lg p-3 text-left transition ${
                selectedUser?.uid === item.uid ? "border border-violet-400/45 bg-violet-500/15 text-white" : "border border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]"
              }`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-600 text-xs font-black text-white">
                {(item.displayName || item.email || "U").slice(0, 2).toUpperCase()}
              </span>
              <span className="min-w-0">
                <span className="block truncate font-semibold">{item.displayName || item.email}</span>
                <span className="block truncate text-xs text-zinc-500">{item.role} · {item.email}</span>
              </span>
            </button>
          ))}

          {user && filteredUsers.length === 0 ? (
            <p className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-zinc-500">Пользователи не найдены.</p>
          ) : null}
        </div>
      </aside>

      <section className="flex min-h-[680px] min-w-0 flex-col bg-[#101827]">
        <header className="flex items-center gap-3 border-b border-white/10 bg-[#0d1422]/95 p-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-relic">
            <MessageSquare size={20} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-white">{selectedUser ? selectedUser.displayName || selectedUser.email : "Общий чат"}</h2>
            <p className="truncate text-sm text-zinc-500">{selectedUser ? selectedUser.email : "Открытая комната портала"}</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-3 py-4 sm:px-6">
          {messages.map((item) => {
            const own = item.uid === user?.uid;

            return (
              <div key={item.id} className={`mb-3 flex ${own ? "justify-end" : "justify-start"}`}>
                <article className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-lg sm:max-w-[70%] ${
                  own
                    ? "rounded-br-md bg-gradient-to-br from-violet-700 to-relic text-white"
                    : "rounded-bl-md border border-white/10 bg-black/30 text-white"
                }`}>
                  {!own ? <p className="mb-1 text-xs font-bold text-relic">{item.displayName}</p> : null}
                  <p className="break-words text-sm leading-6">{item.text}</p>
                  <p className={`mt-1 text-right text-[11px] ${own ? "text-white/65" : "text-zinc-500"}`}>{formatTime(item)}</p>
                </article>
              </div>
            );
          })}

          {messages.length === 0 ? (
            <div className="grid min-h-[360px] place-items-center text-center">
              <div>
                <p className="text-xl font-bold text-white">Начни диалог</p>
                <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                  Выбери пользователя слева для личного сообщения или напиши в общий чат.
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {user ? (
          <form onSubmit={handleSubmit} className="border-t border-white/10 bg-[#0d1422] p-3 sm:p-4">
            <div className="flex items-end gap-2">
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                rows={1}
                placeholder={selectedUser ? "Личное сообщение..." : "Сообщение в общий чат..."}
                className="max-h-28 min-h-11 min-w-0 flex-1 resize-none rounded-md border-white/10 bg-black/30 text-sm text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
              />
              <button disabled={!canSend} className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-relic text-black transition hover:bg-[#f0c766] disabled:cursor-not-allowed disabled:opacity-50">
                <Send size={18} />
              </button>
            </div>
          </form>
        ) : (
          <div className="border-t border-white/10 bg-[#0d1422] p-4 text-center text-sm text-zinc-400">
            Для отправки сообщений нужно <Link href="/login" className="font-semibold text-relic">войти</Link>.
          </div>
        )}
      </section>
    </div>
  );
}
