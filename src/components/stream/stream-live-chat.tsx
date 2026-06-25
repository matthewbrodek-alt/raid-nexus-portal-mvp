"use client";

import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { Ban, MessageCircle, Send, ShieldCheck, Smile, Trash2, VolumeX } from "lucide-react";
import { type FormEvent, type KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { normalizeCustomChatEmojis, splitCustomEmojiText, type CustomChatEmoji } from "@/lib/chat/custom-emojis";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { useLanguage } from "@/lib/i18n/use-language";

const streamChatLimit = 70;
const maxMessageLength = 280;
const basicEmojis = ["😀", "😂", "😍", "👍", "🔥", "❤️", "🙏", "🎉", "😎", "🤔"];

type StreamMessage = {
  id: string;
  uid: string;
  displayName: string;
  text: string;
  createdAt: number;
  deleted?: boolean;
  deletedAt?: number;
  deletedBy?: string;
  deletedByName?: string;
  isStreamModerator?: boolean;
  roleLabel?: string;
};

type StreamChatDocument = {
  messages?: StreamMessage[];
};

type StreamModerator = {
  uid: string;
  displayName?: string;
  email?: string;
};

type StreamModeratorDocument = {
  moderatorUids?: string[];
  moderators?: StreamModerator[];
};

type StreamMuteDocument = {
  uid?: string;
  displayName?: string;
  mutedUntil?: number | null;
  mutedBy?: string;
  mutedByName?: string;
};

type StreamModerationLog = {
  id: string;
  action?: "delete" | "mute" | "unmute";
  targetName?: string;
  moderatorName?: string;
  details?: string;
  createdAt?: number | { seconds?: number };
};

function normalizeMessages(messages?: StreamMessage[]) {
  return (messages ?? [])
    .filter((item) => item.id && item.uid && item.displayName && typeof item.text === "string")
    .sort((a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0))
    .slice(-streamChatLimit);
}

function getTimestampMs(value?: number | { seconds?: number }) {
  if (!value) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  return typeof value.seconds === "number" ? value.seconds * 1000 : 0;
}

function formatMessageTime(timestamp: number, locale: string) {
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit" }).format(new Date(timestamp));
}

function formatMuteUntil(mutedUntil: number | null | undefined, locale: string) {
  if (mutedUntil === null) {
    return locale === "ru" ? "навсегда" : "forever";
  }

  if (!mutedUntil) {
    return "";
  }

  return new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(mutedUntil));
}

function renderStreamText(text: string, customEmojis: CustomChatEmoji[]) {
  if (!customEmojis.length) {
    return text;
  }

  return splitCustomEmojiText(text, customEmojis).map((part, index) => {
    if (part.type === "emoji") {
      return (
        <img
          key={`${part.emoji.code}-${index}`}
          src={part.emoji.url}
          alt={part.emoji.label}
          loading="lazy"
          className="mx-0.5 inline-block size-7 rounded-md object-contain align-[-0.35em]"
        />
      );
    }

    return <span key={`${part.value}-${index}`}>{part.value}</span>;
  });
}

export function StreamLiveChat() {
  const { language } = useLanguage();
  const { profile, user } = useAuth();
  const [messages, setMessages] = useState<StreamMessage[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [customEmojis, setCustomEmojis] = useState<CustomChatEmoji[]>([]);
  const [moderatorUids, setModeratorUids] = useState<string[]>([]);
  const [mute, setMute] = useState<StreamMuteDocument | null>(null);
  const [moderationLogs, setModerationLogs] = useState<StreamModerationLog[]>([]);
  const [status, setStatus] = useState("");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const sendingRef = useRef(false);
  const chatRef = useMemo(() => doc(db, collections.streamChats, "active"), []);
  const locale = language === "ru" ? "ru-RU" : "en-US";
  const isSiteAdmin = profile?.role === "admin" || profile?.role === "owner";
  const isStreamModerator = Boolean(user?.uid && (isSiteAdmin || moderatorUids.includes(user.uid)));
  const roleLabel = isSiteAdmin ? (language === "ru" ? "Админ сайта" : "Site admin") : language === "ru" ? "Модератор эфира" : "Stream moderator";
  const muteActive = Boolean(mute && (mute.mutedUntil === null || (mute.mutedUntil ?? 0) > Date.now()));
  const muteText = muteActive
    ? language === "ru"
      ? `Вы не можете писать в эфир ${formatMuteUntil(mute?.mutedUntil, locale)}.`
      : `You are muted ${formatMuteUntil(mute?.mutedUntil, locale)}.`
    : "";

  useEffect(() => {
    const unsubscribe = onSnapshot(chatRef, (snapshot) => {
      const data = snapshot.data() as StreamChatDocument | undefined;
      setMessages(normalizeMessages(data?.messages));
    });

    return () => unsubscribe();
  }, [chatRef]);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, collections.siteSettings, "customChatEmojis"), (snapshot) => {
      const data = snapshot.data() as { emojis?: CustomChatEmoji[] } | undefined;
      setCustomEmojis(normalizeCustomChatEmojis(data?.emojis));
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, collections.siteSettings, "streamChatModerators"), (snapshot) => {
      const data = snapshot.data() as StreamModeratorDocument | undefined;
      setModeratorUids(Array.isArray(data?.moderatorUids) ? data.moderatorUids.filter(Boolean) : []);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      setMute(null);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, collections.streamChatMutes, user.uid), (snapshot) => {
      setMute(snapshot.exists() ? (snapshot.data() as StreamMuteDocument) : null);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    if (!isStreamModerator) {
      setModerationLogs([]);
      return;
    }

    const logsQuery = query(collection(db, collections.streamChatModerationLogs), orderBy("createdAt", "desc"), limit(6));
    const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
      setModerationLogs(
        snapshot.docs.map((entry) => ({
          id: entry.id,
          ...(entry.data() as Omit<StreamModerationLog, "id">)
        }))
      );
    });

    return () => unsubscribe();
  }, [isStreamModerator]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  function insertEmoji(value: string) {
    setMessage((current) => `${current}${value}`.slice(0, maxMessageLength));
    setEmojiOpen(false);
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  async function submitCurrentMessage() {
    if (sendingRef.current) {
      return;
    }

    const text = message.trim().slice(0, maxMessageLength);

    if (!text || !user || !profile || muteActive) {
      return;
    }

    sendingRef.current = true;
    setSending(true);
    setStatus("");

    const nextMessage: StreamMessage = {
      id: `${user.uid}_${Date.now()}`,
      uid: user.uid,
      displayName: profile.displayName || profile.email || "Raid Player",
      text,
      createdAt: Date.now(),
      isStreamModerator,
      roleLabel: isStreamModerator ? roleLabel : undefined
    };

    try {
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(chatRef);
        const current = snapshot.exists() ? (snapshot.data() as StreamChatDocument) : {};
        const nextMessages = [...normalizeMessages(current.messages), nextMessage].slice(-streamChatLimit);

        transaction.set(
          chatRef,
          {
            messages: nextMessages,
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
      });

      setMessage("");
    } finally {
      sendingRef.current = false;
      setSending(false);
      window.requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitCurrentMessage();
  }

  async function handleInputKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      await submitCurrentMessage();
    }
  }

  async function writeModerationLog(log: Omit<StreamModerationLog, "id" | "createdAt">) {
    await addDoc(collection(db, collections.streamChatModerationLogs), {
      ...log,
      createdAt: Date.now(),
      createdAtServer: serverTimestamp()
    });
  }

  async function deleteMessage(target: StreamMessage) {
    if (!isStreamModerator || !user || !profile || target.deleted) {
      return;
    }

    const deletedText = language === "ru" ? "Сообщение удалено модератором" : "Message removed by moderator";

    await runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(chatRef);
      const current = snapshot.exists() ? (snapshot.data() as StreamChatDocument) : {};
      const nextMessages = normalizeMessages(current.messages).map((item) =>
        item.id === target.id
          ? {
              ...item,
              text: deletedText,
              deleted: true,
              deletedAt: Date.now(),
              deletedBy: user.uid,
              deletedByName: profile.displayName || profile.email || "Moderator"
            }
          : item
      );

      transaction.set(
        chatRef,
        {
          messages: nextMessages,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
    });

    await writeModerationLog({
      action: "delete",
      targetName: target.displayName,
      moderatorName: profile.displayName || profile.email || "Moderator",
      details: language === "ru" ? "удалил сообщение" : "deleted a message"
    });

    setStatus(language === "ru" ? "Сообщение удалено." : "Message deleted.");
  }

  async function muteUser(target: StreamMessage, durationMs: number | null) {
    if (!isStreamModerator || !user || !profile || target.uid === user.uid) {
      return;
    }

    const mutedUntil = durationMs === null ? null : Date.now() + durationMs;

    await setDoc(
      doc(db, collections.streamChatMutes, target.uid),
      {
        uid: target.uid,
        displayName: target.displayName,
        mutedUntil,
        mutedBy: user.uid,
        mutedByName: profile.displayName || profile.email || "Moderator",
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    await writeModerationLog({
      action: "mute",
      targetName: target.displayName,
      moderatorName: profile.displayName || profile.email || "Moderator",
      details: durationMs === null ? (language === "ru" ? "выдал мут навсегда" : "muted forever") : language === "ru" ? `выдал мут на ${Math.round(durationMs / 60000)} мин.` : `muted for ${Math.round(durationMs / 60000)} min.`
    });

    setStatus(language === "ru" ? "Мут выдан." : "Mute applied.");
  }

  return (
    <section className="raid-ornate-panel overflow-hidden p-0">
      <div className="flex items-center gap-3 border-b border-relic/12 px-4 py-3">
        <span className="grid size-10 place-items-center rounded-2xl border border-relic/20 bg-relic/10 text-relic">
          <MessageCircle size={19} />
        </span>
        <div>
          <h2 className="text-base font-black text-white">{language === "ru" ? "Обсуждение трансляции" : "Stream discussion"}</h2>
          <p className="text-xs font-semibold text-zinc-500">
            {language === "ru" ? "Последние сообщения без лишней истории" : "Recent messages without long-term history"}
          </p>
        </div>
        {isStreamModerator ? (
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-sky-400/30 bg-sky-400/10 px-3 py-1 text-xs font-black text-sky-200">
            <ShieldCheck size={14} />
            {language === "ru" ? "Модератор" : "Moderator"}
          </span>
        ) : null}
      </div>

      <div ref={scrollRef} className="h-[260px] space-y-3 overflow-y-auto px-4 py-4 sm:h-[320px]">
        {messages.length ? (
          messages.map((item) => {
            const isOwn = item.uid === user?.uid;
            const isAuthorModerator = Boolean((item.uid && moderatorUids.includes(item.uid)) || (item.uid === user?.uid && isStreamModerator));

            return (
              <article key={item.id} className={`group flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[82%] rounded-2xl border px-3 py-2 ${isOwn ? "border-sky-400/25 bg-sky-500/18" : "border-white/10 bg-white/7"} ${item.deleted ? "opacity-65" : ""}`}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-black ${isAuthorModerator ? "text-sky-200" : "text-relic"}`}>{item.displayName}</span>
                    {isAuthorModerator ? (
                      <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-2 py-0.5 text-[10px] font-black text-sky-100">
                        {item.roleLabel || (language === "ru" ? "Модератор эфира" : "Stream mod")}
                      </span>
                    ) : null}
                  </div>
                  <p className={`mt-1 whitespace-pre-wrap break-words text-sm leading-5 ${item.deleted ? "italic text-zinc-500" : "text-zinc-100"}`}>{renderStreamText(item.text, customEmojis)}</p>
                  <div className="mt-1 flex items-center justify-between gap-3">
                    <span className="text-[10px] font-semibold text-zinc-500">{formatMessageTime(item.createdAt, locale)}</span>
                    {isStreamModerator && !item.deleted ? (
                      <span className="flex flex-wrap justify-end gap-1 opacity-100 sm:opacity-0 sm:transition group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => void deleteMessage(item)}
                          className="rounded-lg border border-red-400/20 bg-red-400/10 px-2 py-1 text-[10px] font-black text-red-200"
                        >
                          <Trash2 size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void muteUser(item, 5 * 60 * 1000)}
                          disabled={item.uid === user?.uid}
                          className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-[10px] font-black text-amber-100 disabled:opacity-40"
                        >
                          5м
                        </button>
                        <button
                          type="button"
                          onClick={() => void muteUser(item, 30 * 60 * 1000)}
                          disabled={item.uid === user?.uid}
                          className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-2 py-1 text-[10px] font-black text-amber-100 disabled:opacity-40"
                        >
                          30м
                        </button>
                        <button
                          type="button"
                          onClick={() => void muteUser(item, null)}
                          disabled={item.uid === user?.uid}
                          className="rounded-lg border border-zinc-400/20 bg-zinc-500/10 px-2 py-1 text-[10px] font-black text-zinc-200 disabled:opacity-40"
                        >
                          <VolumeX size={12} />
                        </button>
                      </span>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="grid h-full place-items-center text-sm font-semibold text-zinc-500">
            {language === "ru" ? "Пока тихо. Будь первым в обсуждении." : "No messages yet. Start the discussion."}
          </div>
        )}
      </div>

      {isStreamModerator && moderationLogs.length ? (
        <div className="mx-4 mb-3 rounded-2xl border border-sky-400/15 bg-sky-400/8 p-3">
          <p className="mb-2 flex items-center gap-2 text-xs font-black text-sky-200">
            <Ban size={14} />
            {language === "ru" ? "Журнал модерации эфира" : "Stream moderation log"}
          </p>
          <div className="space-y-1.5">
            {moderationLogs.slice(0, 3).map((log) => (
              <p key={log.id} className="text-xs font-semibold text-zinc-400">
                <span className="text-zinc-200">{log.moderatorName || "Moderator"}</span> {log.details || ""}{" "}
                {log.targetName ? <span className="text-relic">{log.targetName}</span> : null}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <form onSubmit={sendMessage} className="relative flex items-center gap-2 border-t border-relic/12 bg-[#07111f]/78 p-3">
        {emojiOpen ? (
          <div className="absolute bottom-16 left-3 z-20 w-[min(360px,calc(100vw-48px))] rounded-2xl border border-relic/18 bg-[#07111f]/95 p-3 shadow-2xl backdrop-blur-xl">
            <div className="grid grid-cols-10 gap-1">
              {basicEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => insertEmoji(emoji)}
                  className="grid size-8 place-items-center rounded-lg text-lg transition hover:bg-white/10"
                >
                  {emoji}
                </button>
              ))}
            </div>
            {customEmojis.length ? (
              <div className="mt-3 grid grid-cols-8 gap-2 border-t border-white/10 pt-3">
                {customEmojis.map((emoji) => (
                  <button
                    key={emoji.code}
                    type="button"
                    title={emoji.label}
                    onClick={() => insertEmoji(` ${emoji.code} `)}
                    className="grid size-9 place-items-center rounded-lg border border-white/10 bg-white/5 transition hover:border-relic/35"
                  >
                    <img src={emoji.url} alt={emoji.label} className="size-7 rounded-md object-contain" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setEmojiOpen((current) => !current)}
          className="grid size-10 shrink-0 place-items-center rounded-xl border border-relic/15 bg-white/5 text-relic transition hover:border-relic/35"
          aria-label={language === "ru" ? "Смайлики" : "Emoji"}
        >
          <Smile size={18} />
        </button>

        <input
          ref={inputRef}
          value={message}
          onChange={(event) => setMessage(event.target.value.slice(0, maxMessageLength))}
          onKeyDown={handleInputKeyDown}
          disabled={!user || sending || muteActive}
          placeholder={
            muteActive
              ? muteText
              : user
                ? language === "ru"
                  ? "Написать сообщение"
                  : "Write a message"
                : language === "ru"
                  ? "Войдите, чтобы писать"
                  : "Sign in to chat"
          }
          className="min-w-0 flex-1 rounded-xl border border-relic/12 bg-black/25 px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-600 focus:border-relic/35 disabled:cursor-not-allowed disabled:opacity-60"
        />

        <button
          type="submit"
          disabled={!message.trim() || !user || sending || muteActive}
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-relic text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
          aria-label={language === "ru" ? "Отправить" : "Send"}
        >
          <Send size={17} />
        </button>
      </form>

      {status ? <p className="border-t border-relic/12 px-4 py-2 text-xs font-bold text-sky-200">{status}</p> : null}
      {muteActive ? <p className="border-t border-red-400/15 px-4 py-2 text-xs font-bold text-red-200">{muteText}</p> : null}
    </section>
  );
}
