"use client";

import { BellRing, CheckCircle2, ClipboardCopy, Download, MessageSquare, Save, Table2 } from "lucide-react";
import { addDoc, collection, doc, limit, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { GlassPanel } from "@/components/ui/glass-panel";
import { getOrderStage, isCompletedOrder, orderStages, type OrderStageId } from "@/lib/bp-status";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

type ServiceType = "donation" | "account_purchase" | "game_help";

type TopupLead = {
  id: string;
  uid?: string;
  email?: string;
  telegram?: string;
  clientName?: string;
  packageName?: string;
  packageId?: string;
  serviceType?: ServiceType;
  paymentMethod?: string;
  paymentDetails?: string;
  managerNote?: string;
  comment?: string;
  amountRub?: number;
  status?: string;
  createdAt?: { seconds?: number };
  updatedAt?: { seconds?: number };
};

type Draft = {
  amountRub: string;
  status: OrderStageId;
  paymentDetails: string;
  managerNote: string;
};

const serviceLabels: Record<ServiceType, string> = {
  donation: "Донат",
  account_purchase: "Покупка аккаунта",
  game_help: "Помощь по игре"
};

function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function formatDate(seconds?: number) {
  if (!seconds) {
    return "";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(seconds * 1000));
}

function leadMonth(lead: TopupLead) {
  if (!lead.createdAt?.seconds) {
    return "";
  }

  const date = new Date(lead.createdAt.seconds * 1000);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function draftFromLead(lead: TopupLead): Draft {
  return {
    amountRub: typeof lead.amountRub === "number" ? String(lead.amountRub) : "",
    status: getOrderStage(lead.status).id,
    paymentDetails: lead.paymentDetails ?? "",
    managerNote: lead.managerNote ?? ""
  };
}

function serviceLabel(type?: string) {
  return serviceLabels[(type as ServiceType) || "donation"] ?? "Донат";
}

function exportRows(leads: TopupLead[]) {
  return leads
    .map((lead) =>
      [
        formatDate(lead.createdAt?.seconds),
        serviceLabel(lead.serviceType),
        lead.telegram ?? "",
        lead.clientName ?? lead.email ?? lead.uid ?? "",
        lead.packageName ?? lead.packageId ?? "",
        `${lead.amountRub ?? 0} RUB`,
        getOrderStage(lead.status).clientLabel,
        lead.paymentDetails ?? "",
        lead.managerNote ?? "",
        lead.comment ?? ""
      ].join(" | ")
    )
    .join("\n");
}

function downloadFile(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export function AdminCrmPanel() {
  const { profile } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState<TopupLead[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [manualService, setManualService] = useState<ServiceType>("donation");
  const [manualTelegram, setManualTelegram] = useState("");
  const [manualTitle, setManualTitle] = useState("");
  const [manualClient, setManualClient] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [statusText, setStatusText] = useState("");

  useEffect(() => {
    const leadsQuery = query(collection(db, collections.topupLeads), orderBy("createdAt", "desc"), limit(240));

    return onSnapshot(leadsQuery, (snapshot) => {
      const nextLeads = snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<TopupLead, "id">) }));
      setLeads(nextLeads);
      setDrafts((current) => {
        const next = { ...current };

        for (const lead of nextLeads) {
          if (!next[lead.id]) {
            next[lead.id] = draftFromLead(lead);
          }
        }

        return next;
      });
    });
  }, []);

  const monthLeads = useMemo(() => leads.filter((lead) => leadMonth(lead) === selectedMonth), [leads, selectedMonth]);
  const unprocessedCount = useMemo(() => monthLeads.filter((lead) => !isCompletedOrder(lead.status)).length, [monthLeads]);
  const completedAmount = useMemo(
    () => monthLeads.filter((lead) => isCompletedOrder(lead.status)).reduce((sum, lead) => sum + (lead.amountRub ?? 0), 0),
    [monthLeads]
  );

  function updateDraft(leadId: string, patch: Partial<Draft>) {
    setDrafts((current) => ({
      ...current,
      [leadId]: {
        ...(current[leadId] ?? { amountRub: "", status: "new", paymentDetails: "", managerNote: "" }),
        ...patch
      }
    }));
  }

  async function saveLead(lead: TopupLead) {
    const draft = drafts[lead.id] ?? draftFromLead(lead);
    const amountRub = Number(draft.amountRub.replace(/[^\d.]/g, ""));

    await updateDoc(doc(db, collections.topupLeads, lead.id), {
      amountRub: Number.isFinite(amountRub) ? amountRub : 0,
      status: draft.status,
      paymentDetails: draft.paymentDetails.trim(),
      managerNote: draft.managerNote.trim(),
      processedBy: profile?.uid ?? "",
      updatedAt: serverTimestamp()
    });

    setStatusText("Заявка обновлена.");
  }

  async function createManualLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await addDoc(collection(db, collections.topupLeads), {
      clientName: manualClient.trim(),
      telegram: manualTelegram.trim(),
      packageId: manualTitle.trim(),
      packageName: manualTitle.trim(),
      serviceType: manualService,
      paymentMethod: "manager",
      managerNote: manualNote.trim(),
      status: "new",
      source: "admin-panel",
      createdBy: profile?.uid ?? "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    setManualClient("");
    setManualTelegram("");
    setManualTitle("");
    setManualNote("");
    setManualService("donation");
    setStatusText("Внутренняя заявка создана.");
  }

  async function copyMonthText() {
    await navigator.clipboard.writeText(exportRows(monthLeads));
    setStatusText("Текстовая выгрузка скопирована.");
  }

  function downloadCsv() {
    const header = "date;service;telegram;client;request;amountRub;stage;paymentDetails;managerNote;comment";
    const rows = monthLeads.map((lead) =>
      [
        formatDate(lead.createdAt?.seconds),
        serviceLabel(lead.serviceType),
        lead.telegram ?? "",
        lead.clientName ?? lead.email ?? lead.uid ?? "",
        lead.packageName ?? lead.packageId ?? "",
        String(lead.amountRub ?? 0),
        getOrderStage(lead.status).clientLabel,
        lead.paymentDetails ?? "",
        lead.managerNote ?? "",
        lead.comment ?? ""
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(";")
    );

    downloadFile(`raid-orders-${selectedMonth}.csv`, [header, ...rows].join("\n"), "text/csv;charset=utf-8");
  }

  return (
    <GlassPanel className="p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <Table2 className="shrink-0 text-relic" />
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-relic">Internal Order Desk</p>
            <h2 className="text-xl font-bold text-white sm:text-2xl">Панель заявок и монетизации</h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="rounded-md border-white/10 bg-black/30 text-sm text-white focus:border-relic focus:ring-relic"
          />
          <button type="button" onClick={() => void copyMonthText()} className="inline-flex items-center gap-2 rounded-md border border-relic/30 bg-relic/10 px-3 py-2 text-sm font-semibold text-relic">
            <ClipboardCopy size={16} />
            Текст
          </button>
          <button type="button" onClick={downloadCsv} className="inline-flex items-center gap-2 rounded-md border border-relic/30 bg-relic/10 px-3 py-2 text-sm font-semibold text-relic">
            <Download size={16} />
            CSV
          </button>
        </div>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-relic/20 bg-black/25 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Заявок за месяц</p>
          <p className="mt-2 text-3xl font-black text-white">{monthLeads.length}</p>
        </div>
        <div className="rounded-lg border border-ember/30 bg-ember/[0.08] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">В работе</p>
          <p className="mt-2 inline-flex items-center gap-2 text-3xl font-black text-ember">
            <BellRing size={24} />
            {unprocessedCount}
          </p>
        </div>
        <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.08] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Выполнено на сумму</p>
          <p className="mt-2 text-3xl font-black text-emerald-300">{completedAmount.toLocaleString("ru-RU")} ₽</p>
        </div>
      </div>

      <form onSubmit={createManualLead} className="mb-5 grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4 lg:grid-cols-[0.8fr_1fr_1fr_1fr]">
        <select value={manualService} onChange={(event) => setManualService(event.target.value as ServiceType)} className="rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic">
          <option value="donation">Донат</option>
          <option value="account_purchase">Покупка аккаунта</option>
          <option value="game_help">Помощь по игре</option>
        </select>
        <input value={manualClient} onChange={(event) => setManualClient(event.target.value)} placeholder="Клиент" className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
        <input value={manualTelegram} onChange={(event) => setManualTelegram(event.target.value)} placeholder="Telegram" className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
        <input value={manualTitle} onChange={(event) => setManualTitle(event.target.value)} required placeholder="Услуга / набор / помощь" className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
        <textarea value={manualNote} onChange={(event) => setManualNote(event.target.value)} rows={2} placeholder="Заметка менеджера" className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic lg:col-span-3" />
        <button className="inline-flex items-center justify-center gap-2 rounded-md bg-relic px-4 py-3 font-bold text-black">
          <Save size={16} />
          Создать
        </button>
      </form>

      {statusText ? <p className="mb-4 rounded-lg border border-relic/20 bg-relic/[0.08] p-3 text-sm text-zinc-300">{statusText}</p> : null}

      <div className="max-h-[620px] overflow-auto rounded-xl border border-white/10">
        <table className="min-w-[1160px] w-full border-collapse text-left text-sm">
          <thead className="sticky top-0 z-10 bg-[#071019]/95 text-xs uppercase tracking-[0.16em] text-relic backdrop-blur">
            <tr>
              <th className="p-3">Дата</th>
              <th className="p-3">Услуга</th>
              <th className="p-3">Клиент</th>
              <th className="p-3">Заявка</th>
              <th className="p-3">Сумма</th>
              <th className="p-3">Этап</th>
              <th className="p-3">Оплата / реквизиты</th>
              <th className="p-3">Заметка</th>
              <th className="p-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {monthLeads.map((lead) => {
              const draft = drafts[lead.id] ?? draftFromLead(lead);
              const completed = isCompletedOrder(draft.status);

              return (
                <tr key={lead.id} className={`border-t border-white/10 ${completed ? "bg-emerald-400/[0.04]" : "bg-black/18"}`}>
                  <td className="p-3 text-zinc-400">{formatDate(lead.createdAt?.seconds)}</td>
                  <td className="p-3 font-semibold text-white">{serviceLabel(lead.serviceType)}</td>
                  <td className="p-3">
                    <p className="font-semibold text-white">{lead.clientName || lead.email || lead.uid || "Клиент"}</p>
                    <p className="text-xs text-zinc-500">{lead.telegram || "telegram не указан"}</p>
                  </td>
                  <td className="p-3">
                    <p className="line-clamp-2 font-semibold text-white">{lead.packageName || lead.packageId || "Заявка"}</p>
                    {lead.comment ? <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{lead.comment}</p> : null}
                  </td>
                  <td className="p-3">
                    <input
                      value={draft.amountRub}
                      onChange={(event) => updateDraft(lead.id, { amountRub: event.target.value })}
                      className="w-28 rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
                      placeholder="0"
                    />
                  </td>
                  <td className="p-3">
                    <select
                      value={draft.status}
                      onChange={(event) => updateDraft(lead.id, { status: event.target.value as OrderStageId })}
                      className="w-44 rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
                    >
                      {orderStages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3">
                    <textarea
                      value={draft.paymentDetails}
                      onChange={(event) => updateDraft(lead.id, { paymentDetails: event.target.value })}
                      rows={2}
                      className="w-56 rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
                      placeholder="Ссылка на оплату или реквизиты"
                    />
                  </td>
                  <td className="p-3">
                    <textarea
                      value={draft.managerNote}
                      onChange={(event) => updateDraft(lead.id, { managerNote: event.target.value })}
                      rows={2}
                      className="w-56 rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
                      placeholder="Внутренняя заметка"
                    />
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-2">
                      <button type="button" onClick={() => void saveLead(lead)} className="inline-flex items-center justify-center gap-2 rounded-md bg-relic px-3 py-2 font-bold text-black">
                        <CheckCircle2 size={15} />
                        Сохранить
                      </button>
                      {lead.uid ? (
                        <button
                          type="button"
                          onClick={() => router.push(`/chat?user=${lead.uid}`)}
                          className="inline-flex items-center justify-center gap-2 rounded-md border border-relic/30 bg-relic/10 px-3 py-2 font-semibold text-relic"
                        >
                          <MessageSquare size={15} />
                          Ответить
                        </button>
                      ) : (
                        <span className="text-xs text-zinc-500">Без аккаунта на сайте</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {monthLeads.length === 0 ? <p className="p-5 text-sm text-zinc-500">За выбранный месяц заявок нет.</p> : null}
      </div>

      <div className="mt-4 rounded-lg border border-relic/16 bg-black/22 p-4 text-sm leading-6 text-zinc-400">
        Этапы видит клиент в личном кабинете. Сумма выполненных заявок автоматически участвует в BP-статусе: 100 000 ₽ - Silver, 300 000 ₽ - Gold, 777 777 ₽ - Platinum.
      </div>
    </GlassPanel>
  );
}
