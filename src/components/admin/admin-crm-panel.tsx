"use client";

import Link from "next/link";
import { BellRing, ExternalLink, MessageSquare, Send, Table2 } from "lucide-react";
import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { GlassPanel } from "@/components/ui/glass-panel";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { useLanguage } from "@/lib/i18n/use-language";

type TopupLead = {
  id: string;
  uid?: string;
  telegram?: string;
  packageName?: string;
  packageId?: string;
  paymentMethod?: string;
  status?: string;
  createdAt?: { seconds?: number };
};

const copy = {
  ru: {
    title: "CRM таблицы и лиды",
    openCrm: "Открыть CRM таблицы",
    clientName: "Имя клиента",
    telegram: "Telegram клиента",
    package: "Пакет / услуга",
    manager: "Через менеджера",
    card: "Карта",
    comment: "Комментарий для CRM / Bitrix",
    send: "Отправить в n8n / Bitrix",
    createdBy: "Создано из админ-панели",
    sent: "Заявка отправлена в n8n и дальше в Bitrix CRM.",
    failed: "Не удалось отправить CRM-заявку.",
    n8nRejected: "n8n отклонил CRM-заявку.",
    latest: "Последние заявки с сайта",
    unprocessed: "Необработанные",
    newBadge: "Новая",
    defaultLead: "Заявка на донат",
    noTelegram: "telegram не указан",
    reply: "Ответить на сайте",
    noChatUser: "Нет пользователя для чата",
    empty: "Заявок пока нет."
  },
  en: {
    title: "CRM tables and leads",
    openCrm: "Open CRM tables",
    clientName: "Client name",
    telegram: "Client Telegram",
    package: "Package / service",
    manager: "Via manager",
    card: "Card",
    comment: "Comment for CRM / Bitrix",
    send: "Send to n8n / Bitrix",
    createdBy: "Created from admin panel",
    sent: "Lead was sent to n8n and then to Bitrix CRM.",
    failed: "Could not send CRM lead.",
    n8nRejected: "n8n rejected CRM lead.",
    latest: "Latest website requests",
    unprocessed: "Unprocessed",
    newBadge: "New",
    defaultLead: "Top-up request",
    noTelegram: "telegram is missing",
    reply: "Reply on site",
    noChatUser: "No chat user",
    empty: "No requests yet."
  }
};

const processedStatuses = new Set(["done", "paid", "completed", "closed", "cancelled", "canceled", "processed"]);

function isUnprocessedLead(lead: TopupLead) {
  return !processedStatuses.has((lead.status ?? "new").toLowerCase());
}

function formatDate(lead: TopupLead) {
  if (!lead.createdAt?.seconds) {
    return "";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(lead.createdAt.seconds * 1000));
}

export function AdminCrmPanel() {
  const { profile } = useAuth();
  const { language } = useLanguage();
  const t = copy[language];
  const [telegram, setTelegram] = useState("");
  const [clientName, setClientName] = useState("");
  const [packageId, setPackageId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("manager");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [recentLeads, setRecentLeads] = useState<TopupLead[]>([]);
  const crmUrl = process.env.NEXT_PUBLIC_CRM_URL ?? "#";

  useEffect(() => {
    const leadsQuery = query(collection(db, collections.topupLeads), orderBy("createdAt", "desc"), limit(20));

    return onSnapshot(leadsQuery, (snapshot) => {
      setRecentLeads(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<TopupLead, "id">) })));
    });
  }, []);

  const unprocessedCount = useMemo(() => recentLeads.filter(isUnprocessedLead).length, [recentLeads]);

  async function submitCrmLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) {
      return;
    }

    setSending(true);
    setStatus("");

    const crmComment = [
      clientName ? `Client: ${clientName}` : null,
      comment ? `Comment: ${comment}` : null,
      `${t.createdBy}: ${profile.email}`
    ]
      .filter(Boolean)
      .join("\n");

    const payload = {
      uid: profile.uid,
      telegram,
      packageId,
      packageName: packageId,
      paymentMethod,
      comment: crmComment,
      source: "admin-crm"
    };

    try {
      await addDoc(collection(db, collections.topupLeads), {
        ...payload,
        status: "new",
        createdBy: profile.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const response = await fetch("/api/n8n/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(t.n8nRejected);
      }

      setTelegram("");
      setClientName("");
      setPackageId("");
      setPaymentMethod("manager");
      setComment("");
      setStatus(t.sent);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t.failed);
    } finally {
      setSending(false);
    }
  }

  return (
    <GlassPanel className="p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Table2 className="shrink-0 text-relic" />
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-relic">CRM Pipeline</p>
            <h2 className="text-xl font-bold text-white sm:text-2xl">{t.title}</h2>
          </div>
        </div>
        <Link
          href={crmUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-relic/30 bg-relic/10 px-4 py-2 text-sm font-semibold text-relic transition hover:bg-relic/15"
        >
          <ExternalLink size={16} />
          {t.openCrm}
        </Link>
      </div>

      <form onSubmit={submitCrmLead} className="grid gap-3 lg:grid-cols-2">
        <input value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder={t.clientName} className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
        <input value={telegram} onChange={(event) => setTelegram(event.target.value)} required placeholder={t.telegram} className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
        <input value={packageId} onChange={(event) => setPackageId(event.target.value)} required placeholder={t.package} className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
        <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic">
          <option value="manager">{t.manager}</option>
          <option value="usdt">USDT TRC20</option>
          <option value="btc">BTC</option>
          <option value="card">{t.card}</option>
        </select>
        <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={4} placeholder={t.comment} className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic lg:col-span-2" />
        <button disabled={sending} className="inline-flex items-center justify-center gap-2 rounded-md bg-relic px-4 py-3 font-bold text-black disabled:opacity-60 lg:col-span-2">
          <Send size={16} />
          {t.send}
        </button>
      </form>

      {status ? <p className="mt-4 rounded-lg border border-relic/20 bg-relic/[0.08] p-3 text-sm text-zinc-300">{status}</p> : null}

      <div className="mt-6 border-t border-white/10 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-white">{t.latest}</h3>
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] ${
            unprocessedCount > 0
              ? "border-ember/35 bg-ember/15 text-ember"
              : "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
          }`}>
            <BellRing size={14} />
            {t.unprocessed}: {unprocessedCount}
          </div>
        </div>

        <div className="mt-3 max-h-[430px] space-y-3 overflow-y-auto pr-1">
          {recentLeads.map((lead) => {
            const unprocessed = isUnprocessedLead(lead);

            return (
              <div
                key={lead.id}
                className={`grid gap-3 rounded-lg p-4 md:grid-cols-[1fr_auto] md:items-center ${
                  unprocessed
                    ? "border border-ember/35 bg-ember/[0.11] shadow-[0_0_24px_rgba(216,168,71,0.10)]"
                    : "border border-white/10 bg-black/25"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    {unprocessed ? (
                      <span className="rounded-full bg-ember px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.14em] text-black">
                        {t.newBadge}
                      </span>
                    ) : null}
                    <p className="min-w-0 truncate font-semibold text-white">{lead.packageName ?? lead.packageId ?? t.defaultLead}</p>
                  </div>
                  <p className="mt-1 truncate text-sm text-zinc-400">
                    {lead.telegram ?? t.noTelegram} / {lead.paymentMethod ?? "manager"} / {lead.status ?? "new"} {formatDate(lead)}
                  </p>
                </div>
                {lead.uid ? (
                  <Link
                    href={`/chat?user=${lead.uid}`}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-relic/30 bg-relic/10 px-3 py-2 text-sm font-semibold text-relic transition hover:bg-relic/15"
                  >
                    <MessageSquare size={16} />
                    {t.reply}
                  </Link>
                ) : (
                  <span className="text-sm text-zinc-500">{t.noChatUser}</span>
                )}
              </div>
            );
          })}
          {recentLeads.length === 0 ? (
            <p className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-zinc-400">{t.empty}</p>
          ) : null}
        </div>
      </div>
    </GlassPanel>
  );
}
