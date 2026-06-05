"use client";

import { MessageCircle, Send, Smile } from "lucide-react";
import { doc, onSnapshot, runTransaction, serverTimestamp } from "firebase/firestore";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { normalizeCustomChatEmojis, splitCustomEmojiText, type CustomChatEmoji } from "@/lib/chat/custom-emojis";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { useLanguage } from "@/lib/i18n/use-language";

const streamChatLimit = 70;
const maxMessageLength = 280;
const basicEmojis = ["\u{1F600}", "\u{1F602}", "\u{1F60D}", "\u{1F44D}", "\u{1F525}", "\u2764\uFE0F", "\u{1F64F}", "\u{1F389}", "\u{1F60E}", "\u{1F914}"];

type StreamMessage = {
  id: string;
  uid: string;
  displayName: string;
  text: string;
  createdAt: number;
};

type StreamChatDocument = {
  messages?: StreamMessage[];
};

function normalizeMessages(messages?: StreamMessage[]) {
  return (Array.isArray(messages) ? messages : [])
    .filter((message): message is StreamMessage => Boolean(message?.id && message?.uid && message?.text && message?.createdAt))
    .sort((first, second) => first.createdAt - second.createdAt)
    .slice(-streamChatLimit);
}

function formatMessageTime(timestamp: number, language: string) {
  return new Intl.DateTimeFormat(language === "ru" ? "ru-RU" : "en-US", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(timestamp));
}

function renderStreamText(text: string, customEmojis: CustomChatEmoji[]) {
  return splitCustomEmojiText(text, customEmojis).map((part, index) => {
    if (part.type === "emoji") {
      return (
        <img
          key={`${part.emoji.code}-${index}`}
          src={part.emoji.url}
          alt={part.emoji.label}
          loading="lazy"
          decoding="async"
          className="mx-0.5 inline-block h-7 w-7 align-[-0.42em] object-contain"
        />
      );
    }

    return <span key={`text-${index}`}>{part.value}</span>;
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
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const sendingRef = useRef(false);
  const chatRef = useMemo(() => doc(db, collections.streamChats, "active"), []);

  useEffect(() => {
    return onSnapshot(
      chatRef,
      (snapshot) => {
        const data = snapshot.data() as StreamChatDocument | undefined;
        setMessages(normalizeMessages(data?.messages));
      },
      () => setMessages([])
    );
  }, [chatRef]);

  useEffect(() => {
    return onSnapshot(
      doc(db, collections.siteSettings, "customChatEmojis"),
      (snapshot) => {
        const data = snapshot.data() as { items?: CustomChatEmoji[] } | undefined;
        setCustomEmojis(normalizeCustomChatEmojis(data?.items));
      },
      () => setCustomEmojis([])
    );
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  async function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (sendingRef.current) {
      return;
    }

    const text = message.trim().slice(0, maxMessageLength);

    if (!text || !user || !profile) {
      return;
    }

    const nextMessage: StreamMessage = {
      id: `${Date.now()}-${user.uid.slice(0, 8)}`,
      uid: user.uid,
      displayName: profile.displayName || "Raid Player",
      text,
      createdAt: Date.now()
    };

    sendingRef.current = true;
    setSending(true);
    setMessage("");

    try {
      await runTransaction(db, async (transaction) => {
        const snapshot = await transaction.get(chatRef);
        const data = snapshot.data() as StreamChatDocument | undefined;
        const nextMessages = [...normalizeMessages(data?.messages), nextMessage].slice(-streamChatLimit);

        transaction.set(
          chatRef,
          {
            messages: nextMessages,
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
      });
    } catch {
      setMessage(text);
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  }

  return (
    <div className="mt-5 overflow-hidden rounded-[22px] border border-relic/20 bg-black/45 shadow-[0_18px_54px_rgba(0,0,0,0.36)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-[14px] border border-relic/25 bg-relic/10 text-relic">
            <MessageCircle size={18} />
          </span>
          <div>
            <h3 className="font-black text-white">{language === "ru" ? "Обсуждение трансляции" : "Stream discussion"}</h3>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="h-[320px] space-y-3 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-relic/30">
        {messages.length === 0 ? (
          <div className="grid h-full place-items-center text-center">
            <p className="max-w-[260px] text-sm leading-6 text-zinc-500">
              {language === "ru" ? "Пока нет сообщений. Напишите первым, когда эфир начнется." : "No messages yet. Be the first to write when the stream starts."}
            </p>
          </div>
        ) : (
          messages.map((item) => {
            const own = item.uid === user?.uid;

            return (
              <div key={item.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[82%] rounded-2xl border px-3 py-2 ${
                    own ? "border-relic/30 bg-relic/15 text-white" : "border-white/10 bg-[#07101d]/90 text-zinc-100"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="truncate text-xs font-black text-relic">{own ? (language === "ru" ? "Вы" : "You") : item.displayName}</span>
                    <span className="shrink-0 text-[11px] text-zinc-500">{formatMessageTime(item.createdAt, language)}</span>
                  </div>
                  <p className="break-words text-sm leading-5">{renderStreamText(item.text, customEmojis)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={sendMessage} className="flex items-center gap-2 border-t border-white/10 bg-[#050a12]/90 p-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setEmojiOpen((current) => !current)}
            disabled={!user || !profile || sending}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border border-relic/15 bg-black/40 text-relic transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-45"
            aria-label={language === "ru" ? "Открыть смайлики" : "Open emojis"}
          >
            <Smile size={18} />
          </button>
          {emojiOpen ? (
            <div className="absolute bottom-[calc(100%+8px)] left-0 z-20 grid max-h-[260px] w-[214px] grid-cols-5 gap-1 overflow-y-auto rounded-[16px] border border-relic/20 bg-[#060b13]/98 p-2 shadow-[0_18px_44px_rgba(0,0,0,0.48)] backdrop-blur-xl">
              {basicEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    setMessage((current) => `${current}${emoji}`);
                    setEmojiOpen(false);
                  }}
                  className="grid h-9 w-9 place-items-center rounded-lg text-xl transition hover:bg-relic/15"
                >
                  {emoji}
                </button>
              ))}
              {customEmojis.map((emoji) => (
                <button
                  key={emoji.id}
                  type="button"
                  onClick={() => {
                    setMessage((current) => `${current}${emoji.code}`);
                    setEmojiOpen(false);
                  }}
                  className="grid h-9 w-9 place-items-center rounded-lg transition hover:bg-relic/15"
                  title={emoji.label}
                >
                  <img src={emoji.url} alt={emoji.label} className="max-h-8 max-w-8 object-contain" loading="lazy" decoding="async" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <input
          value={message}
          onChange={(event) => setMessage(event.target.value.slice(0, maxMessageLength))}
          disabled={!user || !profile || sending}
          placeholder={user && profile ? (language === "ru" ? "Написать сообщение" : "Write a message") : language === "ru" ? "Войдите, чтобы писать" : "Sign in to write"}
          className="min-w-0 flex-1 rounded-[14px] border border-relic/15 bg-black/40 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-relic/60 focus:ring-2 focus:ring-relic/15 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={!message.trim() || !user || !profile || sending}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] border border-relic/35 bg-relic text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
          aria-label={language === "ru" ? "Отправить" : "Send"}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
