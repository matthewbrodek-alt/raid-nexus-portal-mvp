"use client";

import Link from "next/link";
import { ChevronDown, CornerDownRight, ImagePlus, MessageSquare, Search, Send, Users, X } from "lucide-react";
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
import { useRef } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import type { CloudinaryAsset } from "@/lib/cloudinary/types";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import type { UserProfile } from "@/lib/auth/types";

type ChatMessage = {
  id: string;
  uid: string;
  displayName: string;
  avatarUrl?: string;
  text: string;
  attachment?: {
    secureUrl?: string;
    url?: string;
    alt?: string;
  } | null;
  replyTo?: {
    id: string;
    displayName: string;
    text: string;
  } | null;
  createdAt?: { seconds?: number };
};

async function uploadChatImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "chat");
  formData.append("publicId", `screenshots/${Date.now()}-${file.name.replace(/[^a-z0-9.]+/gi, "-")}`);

  const response = await fetch("/api/cloudinary/upload", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Could not upload screenshot.");
  }

  return (await response.json()) as CloudinaryAsset;
}

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
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const canSend = (message.trim().length > 0 || attachmentFile) && Boolean(user) && !sending;

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
    const targetUid = new URLSearchParams(window.location.search).get("user");

    if (!targetUid || selectedUser?.uid === targetUid) {
      return;
    }

    const targetUser = users.find((item) => item.uid === targetUid);

    if (targetUser) {
      setSelectedUser(targetUser);
    }
  }, [selectedUser?.uid, users]);

  useEffect(() => {
    const messagesRef = selectedUser && user
      ? collection(db, "directThreads", directThreadId(user.uid, selectedUser.uid), "messages")
      : collection(db, collections.chatRooms, "global", "messages");
    const messagesQuery = query(messagesRef, orderBy("createdAt", "asc"), limit(80));

    return onSnapshot(messagesQuery, (snapshot) => {
      setMessages(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<ChatMessage, "id">) })));
    });
  }, [selectedUser, user]);

  useEffect(() => {
    scrollToBottom();
  }, [activeThread, messages.length]);

  function scrollToBottom() {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }

  async function sendMessage() {
    const text = message.trim();

    if ((!text && !attachmentFile) || !user || !profile) {
      return;
    }

    setSending(true);

    try {
      const uploadedAttachment = attachmentFile ? await uploadChatImage(attachmentFile) : null;
      const baseMessage = {
        uid: user.uid,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl ?? "",
        text,
        attachment: uploadedAttachment
          ? {
              secureUrl: uploadedAttachment.secureUrl,
              url: uploadedAttachment.url,
              alt: attachmentFile?.name ?? "Screenshot"
            }
          : null,
        replyTo: replyTo
          ? {
              id: replyTo.id,
              displayName: replyTo.displayName,
              text: replyTo.text.slice(0, 180)
            }
          : null,
        createdAt: serverTimestamp()
      };

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
      await addDoc(collection(db, "directThreads", threadId, "messages"), baseMessage);
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
        ...baseMessage,
        moderationStatus: "visible",
      });
    }

    setMessage("");
    setReplyTo(null);
    setAttachmentFile(null);
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage();
  }

  return (
    <div className="mx-auto grid h-[78vh] min-h-[620px] w-full max-w-7xl overflow-hidden rounded-lg border border-white/10 bg-[#0b1120] shadow-2xl lg:grid-cols-[330px_1fr]">
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
                {item.avatarUrl ? (
                  <img src={item.avatarUrl} alt={item.displayName || item.email} className="h-full w-full rounded-full object-cover" />
                ) : (
                  (item.displayName || item.email || "U").slice(0, 2).toUpperCase()
                )}
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

      <section className="relative flex min-h-0 min-w-0 flex-col bg-[#101827]">
        <header className="flex items-center gap-3 border-b border-white/10 bg-[#0d1422]/95 p-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-relic">
            <MessageSquare size={20} />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold text-white">{selectedUser ? selectedUser.displayName || selectedUser.email : "Общий чат"}</h2>
            <p className="truncate text-sm text-zinc-500">{selectedUser ? selectedUser.email : "Открытая комната портала"}</p>
          </div>
        </header>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-3 py-4 sm:px-6">
          {messages.map((item) => {
            const own = item.uid === user?.uid;
            const attachmentUrl = item.attachment?.secureUrl ?? item.attachment?.url;

            return (
              <div key={item.id} className={`mb-3 flex ${own ? "justify-end" : "justify-start"}`}>
                <article className={`max-w-[88%] rounded-2xl px-4 py-3 shadow-lg sm:max-w-[70%] ${
                  own
                    ? "rounded-br-md bg-gradient-to-br from-violet-700 to-relic text-white"
                    : "rounded-bl-md border border-white/10 bg-black/30 text-white"
                }`}>
                  {!own ? <p className="mb-1 text-xs font-bold text-relic">{item.displayName}</p> : null}
                  {!own && item.avatarUrl ? (
                    <img src={item.avatarUrl} alt={item.displayName} className="mb-2 h-8 w-8 rounded-full object-cover" />
                  ) : null}
                  {item.replyTo ? (
                    <div className="mb-2 rounded-md border border-white/10 bg-black/20 p-2 text-xs text-zinc-300">
                      <p className="font-bold text-relic">{item.replyTo.displayName}</p>
                      <p className="line-clamp-2">{item.replyTo.text}</p>
                    </div>
                  ) : null}
                  {attachmentUrl ? (
                    <a href={attachmentUrl} target="_blank" rel="noreferrer">
                      <img src={attachmentUrl} alt={item.attachment?.alt ?? "Screenshot"} className="mb-2 max-h-64 rounded-lg border border-white/10 object-cover" />
                    </a>
                  ) : null}
                  {item.text ? <p className="break-words text-sm leading-6">{item.text}</p> : null}
                  {!selectedUser ? (
                    <button type="button" onClick={() => setReplyTo(item)} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-relic hover:text-white">
                      <CornerDownRight size={13} />
                      Ответить
                    </button>
                  ) : null}
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

        <button
          type="button"
          onClick={scrollToBottom}
          className="absolute bottom-24 right-5 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-[#111827]/90 text-relic shadow-lg transition hover:bg-relic hover:text-black"
          aria-label="Прокрутить вниз"
        >
          <ChevronDown size={20} />
        </button>

        {user ? (
          <form onSubmit={handleSubmit} className="border-t border-white/10 bg-[#0d1422] p-3 sm:p-4">
            {replyTo ? (
              <div className="mb-2 flex items-start justify-between gap-3 rounded-md border border-relic/20 bg-relic/[0.08] p-2 text-xs text-zinc-300">
                <div className="min-w-0">
                  <p className="font-bold text-relic">Ответ: {replyTo.displayName}</p>
                  <p className="truncate">{replyTo.text}</p>
                </div>
                <button type="button" onClick={() => setReplyTo(null)} className="text-zinc-500 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            ) : null}
            {attachmentFile ? (
              <div className="mb-2 flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/25 p-2 text-xs text-zinc-300">
                <span className="truncate">{attachmentFile.name}</span>
                <button type="button" onClick={() => setAttachmentFile(null)} className="text-zinc-500 hover:text-white">
                  <X size={14} />
                </button>
              </div>
            ) : null}
            <div className="flex items-end gap-2">
              <label className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-md border border-white/10 bg-black/30 text-relic transition hover:bg-white/[0.06]">
                <ImagePlus size={18} />
                <input type="file" accept="image/*" className="hidden" onChange={(event) => setAttachmentFile(event.target.files?.[0] ?? null)} />
              </label>
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
