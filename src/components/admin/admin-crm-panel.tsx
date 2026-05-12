"use client";

import Link from "next/link";
import { ExternalLink, MessageSquare, Send, Table2 } from "lucide-react";
import { addDoc, collection, limit, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { GlassPanel } from "@/components/ui/glass-panel";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

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

export function AdminCrmPanel() {
  const { profile } = useAuth();
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
    const leadsQuery = query(collection(db, collections.topupLeads), orderBy("createdAt", "desc"), limit(8));

    return onSnapshot(leadsQuery, (snapshot) => {
      setRecentLeads(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<TopupLead, "id">) })));
    });
  }, []);

  async function submitCrmLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) {
      return;
    }

    setSending(true);
    setStatus("");

    const crmComment = [
      clientName ? `Клиент: ${clientName}` : null,
      comment ? `Комментарий: ${comment}` : null,
      `Создано из админ-панели: ${profile.email}`
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
        throw new Error("n8n отклонил CRM-заявку.");
      }

      setTelegram("");
      setClientName("");
      setPackageId("");
      setPaymentMethod("manager");
      setComment("");
      setStatus("Заявка отправлена в n8n и дальше в Bitrix CRM.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось отправить CRM-заявку.");
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
            <h2 className="text-xl font-bold text-white sm:text-2xl">CRM таблицы и лиды</h2>
          </div>
        </div>
        <Link
          href={crmUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-relic/30 bg-relic/10 px-4 py-2 text-sm font-semibold text-relic transition hover:bg-relic/15"
        >
          <ExternalLink size={16} />
          Открыть CRM таблицы
        </Link>
      </div>

      <form onSubmit={submitCrmLead} className="grid gap-3 lg:grid-cols-2">
        <input value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="Имя клиента" className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
        <input value={telegram} onChange={(event) => setTelegram(event.target.value)} required placeholder="Telegram клиента" className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
        <input value={packageId} onChange={(event) => setPackageId(event.target.value)} required placeholder="Пакет / услуга" className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
        <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic">
          <option value="manager">Через менеджера</option>
          <option value="usdt">USDT TRC20</option>
          <option value="btc">BTC</option>
          <option value="card">Карта</option>
        </select>
        <textarea value={comment} onChange={(event) => setComment(event.target.value)} rows={4} placeholder="Комментарий для CRM / Bitrix" className="lg:col-span-2 rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
        <button disabled={sending} className="inline-flex items-center justify-center gap-2 rounded-md bg-relic px-4 py-3 font-bold text-black disabled:opacity-60 lg:col-span-2">
          <Send size={16} />
          Отправить в n8n / Bitrix
        </button>
      </form>

      {status ? <p className="mt-4 rounded-lg border border-relic/20 bg-relic/[0.08] p-3 text-sm text-zinc-300">{status}</p> : null}

      <div className="mt-6 border-t border-white/10 pt-5">
        <h3 className="text-lg font-bold text-white">Последние заявки с сайта</h3>
        <div className="mt-3 space-y-3">
          {recentLeads.map((lead) => (
            <div key={lead.id} className="grid gap-3 rounded-lg border border-white/10 bg-black/25 p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{lead.packageName ?? lead.packageId ?? "Заявка на донат"}</p>
                <p className="mt-1 truncate text-sm text-zinc-400">{lead.telegram ?? "telegram не указан"} · {lead.paymentMethod ?? "manager"} · {lead.status ?? "new"}</p>
              </div>
              {lead.uid ? (
                <Link
                  href={`/chat?user=${lead.uid}`}
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-relic/30 bg-relic/10 px-3 py-2 text-sm font-semibold text-relic transition hover:bg-relic/15"
                >
                  <MessageSquare size={16} />
                  Ответить на сайте
                </Link>
              ) : (
                <span className="text-sm text-zinc-500">Нет пользователя для чата</span>
              )}
            </div>
          ))}
          {recentLeads.length === 0 ? (
            <p className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-zinc-400">Заявок пока нет.</p>
          ) : null}
        </div>
      </div>
    </GlassPanel>
  );
}
