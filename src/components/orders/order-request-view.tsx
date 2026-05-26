"use client";

import Link from "next/link";
import { Check, Clock, MessageCircle, Send, ShieldCheck } from "lucide-react";
import { addDoc, collection, doc, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { GlassPanel } from "@/components/ui/glass-panel";
import { normalizeOrderStage, type OrderStageId } from "@/lib/bp-status";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { useLanguage } from "@/lib/i18n/use-language";

type FirestoreTime = {
  seconds?: number;
};

type TopupLead = {
  id: string;
  uid?: string;
  managerUid?: string;
  threadId?: string;
  telegram?: string;
  packageName?: string;
  paymentMethod?: string;
  paymentDetails?: string;
  managerNote?: string;
  comment?: string;
  amountRub?: number;
  status?: string;
  screenshotUrl?: string;
  createdAt?: FirestoreTime;
  updatedAt?: FirestoreTime;
};

type OrderMessage = {
  id: string;
  uid?: string;
  displayName?: string;
  text?: string;
  createdAt?: FirestoreTime;
};

type OrderRequestViewProps = {
  leadId: string;
};

const stageCopy: Record<OrderStageId, { ru: string; en: string }> = {
  new: { ru: "Заявка создана", en: "Request created" },
  payment: { ru: "Оплата заказа", en: "Payment" },
  in_progress: { ru: "Выполнение работы", en: "In progress" },
  completed: { ru: "Заявка выполнена", en: "Completed" },
  cancelled: { ru: "Отменена", en: "Cancelled" }
};

const visibleStages: OrderStageId[] = ["new", "payment", "in_progress", "completed"];

function getSeconds(value?: FirestoreTime) {
  return value?.seconds ?? 0;
}

function formatDate(seconds?: number, isRu = true) {
  if (!seconds) {
    return isRu ? "только что" : "just now";
  }

  return new Intl.DateTimeFormat(isRu ? "ru-RU" : "en-US", {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(seconds * 1000));
}

function seenStorageKey(uid: string) {
  return `raid-notification-seen-${uid}`;
}

function markNotificationSeen(uid: string, bucket: "topupById" | "threadById", id: string, seconds: number) {
  if (typeof window === "undefined" || !seconds) {
    return;
  }

  try {
    const current = JSON.parse(window.localStorage.getItem(seenStorageKey(uid)) ?? "{}") as {
      topupById?: Record<string, number>;
      threadById?: Record<string, number>;
    };

    window.localStorage.setItem(
      seenStorageKey(uid),
      JSON.stringify({
        ...current,
        [bucket]: {
          ...(current[bucket] ?? {}),
          [id]: seconds
        }
      })
    );
  } catch {
    // Local notification state is best-effort only.
  }
}

export function OrderRequestView({ leadId }: OrderRequestViewProps) {
  const { isRu } = useLanguage();
  const { profile, user } = useAuth();
  const [lead, setLead] = useState<TopupLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const leadRef = doc(db, collections.topupLeads, leadId);

    return onSnapshot(
      leadRef,
      (snapshot) => {
        setLead(snapshot.exists() ? { id: snapshot.id, ...(snapshot.data() as Omit<TopupLead, "id">) } : null);
        setLoading(false);
      },
      () => {
        setLead(null);
        setLoading(false);
      }
    );
  }, [leadId]);

  useEffect(() => {
    if (!lead?.threadId) {
      setMessages([]);
      return;
    }

    const messagesQuery = query(collection(db, "directThreads", lead.threadId, "messages"), orderBy("createdAt", "asc"), limit(80));

    return onSnapshot(
      messagesQuery,
      (snapshot) => setMessages(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<OrderMessage, "id">) }))),
      () => setMessages([])
    );
  }, [lead?.threadId]);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  useEffect(() => {
    if (!user?.uid || !lead?.id) {
      return;
    }

    markNotificationSeen(user.uid, "topupById", lead.id, getSeconds(lead.updatedAt) || getSeconds(lead.createdAt));
  }, [lead?.createdAt, lead?.id, lead?.updatedAt, user?.uid]);

  useEffect(() => {
    if (!user?.uid || !lead?.threadId || messages.length === 0) {
      return;
    }

    const lastMessageSeconds = Math.max(...messages.map((item) => getSeconds(item.createdAt)));
    markNotificationSeen(user.uid, "threadById", lead.threadId, lastMessageSeconds);
  }, [lead?.threadId, messages, user?.uid]);

  const activeStage = normalizeOrderStage(lead?.status);
  const activeIndex = activeStage === "cancelled" ? -1 : visibleStages.indexOf(activeStage);
  const progressPercent = useMemo(() => {
    if (activeStage === "cancelled") {
      return 0;
    }

    return Math.max(0, Math.min(100, ((activeIndex + 1) / visibleStages.length) * 100));
  }, [activeIndex, activeStage]);

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = message.trim();
    if (!text || !user?.uid || !profile || !lead?.threadId) {
      return;
    }

    setSending(true);

    try {
      await setDoc(
        doc(db, "directThreads", lead.threadId),
        {
          participants: [lead.uid, lead.managerUid].filter(Boolean),
          lastMessageText: text,
          lastMessageUid: user.uid,
          lastMessageAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );

      await addDoc(collection(db, "directThreads", lead.threadId, "messages"), {
        uid: user.uid,
        displayName: profile.displayName || profile.email || "Raid Player",
        text,
        topupLeadId: lead.id,
        createdAt: serverTimestamp()
      });

      setMessage("");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <GlassPanel className="p-6">
        <p className="text-sm uppercase tracking-[0.24em] text-relic">{isRu ? "Загрузка заявки" : "Loading request"}</p>
      </GlassPanel>
    );
  }

  if (!lead) {
    return (
      <GlassPanel className="p-6">
        <h2 className="text-2xl font-black text-white">{isRu ? "Заявка не найдена" : "Request not found"}</h2>
        <p className="mt-2 text-sm text-zinc-400">
          {isRu ? "Проверьте ссылку или откройте историю заявок в личном кабинете." : "Check the link or open request history in your dashboard."}
        </p>
        <Link href="/dashboard" className="mt-5 inline-flex rounded-xl border border-relic/35 bg-relic/10 px-4 py-2 font-bold text-relic">
          {isRu ? "В личный кабинет" : "Open dashboard"}
        </Link>
      </GlassPanel>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <GlassPanel className="p-5 sm:p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-relic">{isRu ? "Игровой набор RAID" : "RAID game pack"}</p>
        <h2 className="mt-2 font-[var(--font-cinzel)] text-3xl font-black text-white">{lead.packageName || (isRu ? "Заявка на донат" : "Donation request")}</h2>
        <p className="mt-3 text-sm leading-6 text-zinc-400">
          {isRu ? "На этой странице менеджер обновляет этапы заказа, а вы можете продолжить общение по конкретной заявке." : "Here the manager updates order stages, and you can continue communication for this request."}
        </p>

        <div className="mt-6 rounded-2xl border border-relic/20 bg-black/25 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-white">{isRu ? "Прогресс заказа" : "Order progress"}</span>
            <span className="rounded-full border border-relic/30 bg-relic/10 px-3 py-1 text-xs font-bold text-relic">
              {stageCopy[activeStage][isRu ? "ru" : "en"]}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-gradient-to-r from-relic to-[#f5d681]" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            {visibleStages.map((stage, index) => {
              const done = activeStage !== "cancelled" && index <= activeIndex;

              return (
                <div key={stage} className={`rounded-xl border p-3 ${done ? "border-relic/45 bg-relic/10" : "border-white/10 bg-black/20"}`}>
                  <span className={`mb-2 grid h-8 w-8 place-items-center rounded-full ${done ? "bg-relic text-black" : "bg-white/10 text-zinc-500"}`}>
                    {done ? <Check size={15} /> : <Clock size={15} />}
                  </span>
                  <p className="text-sm font-bold text-white">{stageCopy[stage][isRu ? "ru" : "en"]}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Telegram</p>
            <p className="mt-2 font-bold text-white">{lead.telegram || "-"}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{isRu ? "Сумма" : "Amount"}</p>
            <p className="mt-2 font-bold text-white">{(lead.amountRub ?? 0).toLocaleString("ru-RU")} ₽</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-4 sm:col-span-2">
            <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{isRu ? "Информация от менеджера" : "Manager information"}</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{lead.paymentDetails || lead.managerNote || (isRu ? "Менеджер скоро добавит детали заказа." : "Manager will add order details soon.")}</p>
          </div>
          {lead.comment ? (
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{isRu ? "Ваш комментарий" : "Your comment"}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{lead.comment}</p>
            </div>
          ) : null}
          {lead.screenshotUrl ? (
            <Link href={lead.screenshotUrl} target="_blank" className="rounded-xl border border-relic/20 bg-relic/10 p-4 text-sm font-bold text-relic sm:col-span-2">
              {isRu ? "Открыть прикрепленный скриншот" : "Open attached screenshot"}
            </Link>
          ) : null}
        </div>
      </GlassPanel>

      <GlassPanel className="flex min-h-[560px] flex-col p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl border border-relic/35 bg-relic/10 text-relic">
            <MessageCircle size={19} />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-relic">{isRu ? "Диалог по заявке" : "Request dialog"}</p>
            <h3 className="text-xl font-black text-white">{isRu ? "Связь с менеджером" : "Manager chat"}</h3>
          </div>
        </div>

        {!lead.threadId ? (
          <div className="grid flex-1 place-items-center rounded-2xl border border-white/10 bg-black/25 p-5 text-center text-sm leading-6 text-zinc-400">
            <div>
              <ShieldCheck className="mx-auto mb-3 text-relic" />
              {isRu ? "Менеджер будет назначен после проверки заявки." : "Manager will be assigned after request review."}
            </div>
          </div>
        ) : (
          <>
            <div ref={messagesRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-black/25 p-4">
              {messages.map((item) => {
                const own = item.uid === user?.uid;

                return (
                  <div key={item.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[82%] rounded-2xl border px-4 py-3 ${own ? "border-relic/30 bg-relic/20" : "border-white/10 bg-white/[0.05]"}`}>
                      <p className="text-xs font-bold text-relic">{own ? (isRu ? "Вы" : "You") : item.displayName || (isRu ? "Менеджер" : "Manager")}</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-white">{item.text}</p>
                      <p className="mt-2 text-right text-[11px] text-zinc-500">{formatDate(item.createdAt?.seconds, isRu)}</p>
                    </div>
                  </div>
                );
              })}
              {messages.length === 0 ? <p className="text-sm text-zinc-500">{isRu ? "Сообщений пока нет." : "No messages yet."}</p> : null}
            </div>

            <form onSubmit={sendMessage} className="mt-4 flex gap-2">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder={isRu ? "Сообщение менеджеру..." : "Message manager..."}
                className="min-w-0 flex-1 rounded-xl border-white/10 bg-black/35 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
              />
              <button
                disabled={sending || !message.trim()}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-relic text-black transition hover:bg-[#f2cf78] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={isRu ? "Отправить" : "Send"}
              >
                <Send size={18} />
              </button>
            </form>
          </>
        )}
      </GlassPanel>
    </div>
  );
}
