"use client";

import { BellRing, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCopy, Download, FileSpreadsheet, MessageSquare, Save, Table2 } from "lucide-react";
import { addDoc, collection, doc, getDoc, increment, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { GlassPanel } from "@/components/ui/glass-panel";
import { bpStatuses, getBpStatus, getOrderStage, isCompletedOrder, orderStages, type OrderStageId } from "@/lib/bp-status";
import { copyTextToClipboard } from "@/lib/browser/clipboard";
import type { UserProfile } from "@/lib/auth/types";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { calculateReferralReward } from "@/lib/referrals";

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
  lastManualBumpyCoinsAwarded?: number;
  manualBumpyCoinsAwardedTotal?: number;
  status?: string;
  createdAt?: { seconds?: number };
  updatedAt?: { seconds?: number };
};

type Draft = {
  amountRub: string;
  status: OrderStageId;
  paymentDetails: string;
  managerNote: string;
  manualBumpyCoins: string;
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

function addMonths(monthValue: string, offset: number) {
  const [year, month] = monthValue.split("-").map(Number);
  const date = new Date(year, (month || 1) - 1 + offset, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(monthValue: string) {
  const [year, month] = monthValue.split("-").map(Number);

  if (!year || !month) {
    return monthValue;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric"
  }).format(new Date(year, month - 1, 1));
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
    managerNote: lead.managerNote ?? "",
    manualBumpyCoins: ""
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
        `${lead.manualBumpyCoinsAwardedTotal ?? 0} Bumpy Coins`,
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

function escapeExcelCell(value: unknown) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function updateCustomerBpTotal(lead: TopupLead, amountRub: number, nextStatus: OrderStageId) {
  if (!lead.uid) {
    return;
  }

  const wasCompleted = isCompletedOrder(lead.status);
  const willBeCompleted = isCompletedOrder(nextStatus);
  const previousAmount = wasCompleted ? lead.amountRub ?? 0 : 0;
  const nextAmount = willBeCompleted ? amountRub : 0;
  const diff = nextAmount - previousAmount;

  if (diff === 0) {
    return;
  }

  const userRef = doc(db, collections.users, lead.uid);
  const userSnapshot = await getDoc(userRef);
  const userProfile = userSnapshot.exists() ? (userSnapshot.data() as UserProfile) : null;
  const manualStatusMinRub = bpStatuses.find((status) => status.id === userProfile?.bpStatus)?.minTotalRub ?? 0;
  const nextTotalRub = Math.max(0, (userProfile?.totalSpentRub ?? 0) + diff, manualStatusMinRub);

  await updateDoc(userRef, {
    bpStatus: getBpStatus(nextTotalRub).id,
    totalSpentRub: nextTotalRub,
    updatedAt: serverTimestamp()
  });
}

async function creditReferralReward(lead: TopupLead, amountRub: number) {
  if (!lead.uid || amountRub <= 0) {
    return 0;
  }

  const rewardRef = doc(db, collections.referralRewards, lead.id);
  const existingReward = await getDoc(rewardRef);

  if (existingReward.exists()) {
    return 0;
  }

  const referralUserSnapshot = await getDoc(doc(db, collections.users, lead.uid));
  const referralUser = referralUserSnapshot.exists() ? (referralUserSnapshot.data() as UserProfile) : null;

  if (!referralUser?.referredByUid) {
    return 0;
  }

  const rewardCoins = calculateReferralReward(amountRub);

  if (rewardCoins <= 0) {
    return 0;
  }

  await setDoc(rewardRef, {
    amountRub,
    createdAt: serverTimestamp(),
    leadId: lead.id,
    ownerUid: referralUser.referredByUid,
    packageName: lead.packageName ?? lead.packageId ?? "",
    referralUid: lead.uid,
    rewardCoins,
    serviceType: lead.serviceType ?? "donation"
  });

  await setDoc(doc(db, collections.bonusTransactions, `ref-${lead.id}`), {
    amountCoins: rewardCoins,
    createdAt: serverTimestamp(),
    description: `Referral reward: ${lead.packageName ?? lead.packageId ?? lead.id}`,
    leadId: lead.id,
    source: "referral",
    uid: referralUser.referredByUid
  });

  await updateDoc(doc(db, collections.users, referralUser.referredByUid), {
    bumpyCoinsBalance: increment(rewardCoins),
    bumpyCoinsEarnedTotal: increment(rewardCoins),
    updatedAt: serverTimestamp()
  });

  return rewardCoins;
}

async function creditManualBumpyCoins(lead: TopupLead, amountCoins: number, managerUid?: string) {
  if (!lead.uid || amountCoins <= 0) {
    return 0;
  }

  const safeCoins = Math.floor(amountCoins);

  if (safeCoins <= 0) {
    return 0;
  }

  await setDoc(doc(db, collections.bonusTransactions, `manual-${lead.id}-${Date.now()}`), {
    amountCoins: safeCoins,
    createdAt: serverTimestamp(),
    description: `Manual manager bonus: ${lead.packageName ?? lead.packageId ?? lead.id}`,
    leadId: lead.id,
    managerUid: managerUid ?? "",
    source: "manual_manager_bonus",
    uid: lead.uid
  });

  await updateDoc(doc(db, collections.users, lead.uid), {
    bumpyCoinsBalance: increment(safeCoins),
    bumpyCoinsEarnedTotal: increment(safeCoins),
    updatedAt: serverTimestamp()
  });

  await updateDoc(doc(db, collections.topupLeads, lead.id), {
    lastManualBumpyCoinsAwarded: safeCoins,
    manualBumpyCoinsAwardedTotal: increment(safeCoins),
    updatedAt: serverTimestamp()
  });

  return safeCoins;
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

  const availableMonths = useMemo(() => {
    const months = new Set([currentMonthValue(), selectedMonth]);

    for (const lead of leads) {
      const month = leadMonth(lead);

      if (month) {
        months.add(month);
      }
    }

    return Array.from(months).sort((a, b) => b.localeCompare(a));
  }, [leads, selectedMonth]);
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
        ...(current[leadId] ?? { amountRub: "", status: "new", paymentDetails: "", managerNote: "", manualBumpyCoins: "" }),
        ...patch
      }
    }));
  }

  function updateStage(leadId: string, status: OrderStageId) {
    const currentDraft = drafts[leadId] ?? { amountRub: "", status: "new", paymentDetails: "", managerNote: "", manualBumpyCoins: "" };
    let nextAmount = currentDraft.amountRub;

    if (status === "completed" && currentDraft.status !== "completed") {
      const enteredAmount = window.prompt("Введите сумму бонуса, которая пойдет в BP-статус клиента", currentDraft.amountRub);

      if (enteredAmount === null) {
        return;
      }

      nextAmount = enteredAmount;
    }

    updateDraft(leadId, { status, amountRub: nextAmount });
  }

  async function saveLead(lead: TopupLead) {
    const draft = drafts[lead.id] ?? draftFromLead(lead);
    const amountRub = Number(draft.amountRub.replace(/[^\d.]/g, ""));
    const safeAmountRub = Number.isFinite(amountRub) ? amountRub : 0;
    const manualCoins = Number((draft.manualBumpyCoins ?? "").replace(/[^\d.]/g, ""));
    const safeManualCoins = Number.isFinite(manualCoins) ? manualCoins : 0;

    await updateDoc(doc(db, collections.topupLeads, lead.id), {
      amountRub: safeAmountRub,
      status: draft.status,
      paymentDetails: draft.paymentDetails.trim(),
      managerNote: draft.managerNote.trim(),
      processedBy: profile?.uid ?? "",
      updatedAt: serverTimestamp()
    });

    await updateCustomerBpTotal(lead, safeAmountRub, draft.status);
    const rewardCoins = isCompletedOrder(draft.status) ? await creditReferralReward(lead, safeAmountRub) : 0;
    const manualAwardedCoins = await creditManualBumpyCoins(lead, safeManualCoins, profile?.uid);

    updateDraft(lead.id, { manualBumpyCoins: "" });

    if (manualAwardedCoins > 0 && rewardCoins > 0) {
      setStatusText(`Заявка обновлена. Начислено клиенту: ${manualAwardedCoins} Bumpy Coins. Реферальный бонус: ${rewardCoins} Bumpy Coins.`);
      return;
    }

    if (manualAwardedCoins > 0) {
      setStatusText(`Заявка обновлена. Начислено клиенту: ${manualAwardedCoins} Bumpy Coins.`);
      return;
    }

    setStatusText(rewardCoins > 0 ? `Заявка обновлена. Реферальный бонус: ${rewardCoins} Bumpy Coins.` : "Заявка обновлена.");
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
    await copyTextToClipboard(exportRows(monthLeads));
    setStatusText("Текстовая выгрузка скопирована.");
  }

  function downloadCsv() {
    const header = "number;date;service;telegram;client;request;amountRub;manualBumpyCoins;stage;paymentDetails;managerNote;comment";
    const rows = monthLeads.map((lead, index) =>
      [
        String(index + 1),
        formatDate(lead.createdAt?.seconds),
        serviceLabel(lead.serviceType),
        lead.telegram ?? "",
        lead.clientName ?? lead.email ?? lead.uid ?? "",
        lead.packageName ?? lead.packageId ?? "",
        String(lead.amountRub ?? 0),
        String(lead.manualBumpyCoinsAwardedTotal ?? 0),
        getOrderStage(lead.status).clientLabel,
        lead.paymentDetails ?? "",
        lead.managerNote ?? "",
        lead.comment ?? ""
      ]
        .map((value) => `"${String(value).replaceAll('"', '""')}"`)
        .join(";")
    );

    downloadFile(`raid-orders-${selectedMonth}.csv`, `\uFEFF${[header, ...rows].join("\n")}`, "text/csv;charset=utf-8");
  }

  function downloadExcel() {
    const headers = ["№", "Дата", "Услуга", "Telegram", "Клиент", "Заявка", "Сумма", "Bumpy Coins", "Этап", "Оплата", "Заметка", "Комментарий"];
    const rows = monthLeads.map((lead, index) => [
      index + 1,
      formatDate(lead.createdAt?.seconds),
      serviceLabel(lead.serviceType),
      lead.telegram ?? "",
      lead.clientName ?? lead.email ?? lead.uid ?? "",
      lead.packageName ?? lead.packageId ?? "",
      lead.amountRub ?? 0,
      lead.manualBumpyCoinsAwardedTotal ?? 0,
      getOrderStage(lead.status).clientLabel,
      lead.paymentDetails ?? "",
      lead.managerNote ?? "",
      lead.comment ?? ""
    ]);
    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; }
      table { border-collapse: collapse; width: 100%; }
      th { background: #111827; color: #f3c35f; font-weight: 700; }
      th, td { border: 1px solid #94a3b8; padding: 8px; vertical-align: top; }
      td { mso-number-format:"\\@"; }
    </style>
  </head>
  <body>
    <h2>Raid Portal - заявки за ${escapeExcelCell(formatMonthLabel(selectedMonth))}</h2>
    <table>
      <thead><tr>${headers.map((header) => `<th>${escapeExcelCell(header)}</th>`).join("")}</tr></thead>
      <tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeExcelCell(cell)}</td>`).join("")}</tr>`).join("")}</tbody>
    </table>
  </body>
</html>`;

    downloadFile(`raid-orders-${selectedMonth}.xls`, html, "application/vnd.ms-excel;charset=utf-8");
  }

  return (
    <GlassPanel className="p-4 sm:p-6">
      <div className="mb-5 rounded-2xl border border-relic/25 bg-[linear-gradient(135deg,rgba(200,154,61,0.13),rgba(4,8,14,0.72))] p-4 shadow-[0_0_34px_rgba(200,154,61,0.1)]">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-relic/35 bg-black/35 text-relic">
            <Table2 />
          </span>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-relic">Internal Order Desk</p>
            <h2 className="text-xl font-bold text-white sm:text-2xl">Панель заявок и монетизации</h2>
            <p className="mt-1 text-sm leading-6 text-zinc-300">
              Realtime-таблица на Firestore: новые заявки появляются без перезагрузки, история хранится по месяцам, операции можно скачать в Excel или CSV.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 xl:justify-end">
          <div className="inline-flex items-center overflow-hidden rounded-md border border-white/10 bg-black/30">
            <button
              type="button"
              onClick={() => setSelectedMonth((current) => addMonths(current, -1))}
              className="grid h-10 w-10 place-items-center border-r border-white/10 text-zinc-300 transition hover:bg-relic/10 hover:text-relic"
              aria-label="Previous month"
            >
              <ChevronLeft size={17} />
            </button>
            <label className="flex h-10 items-center gap-2 px-3 text-sm text-zinc-300">
              <CalendarDays size={16} className="text-relic" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="w-[140px] border-0 bg-transparent p-0 text-sm font-semibold text-white focus:ring-0"
              />
            </label>
            <button
              type="button"
              onClick={() => setSelectedMonth((current) => addMonths(current, 1))}
              className="grid h-10 w-10 place-items-center border-l border-white/10 text-zinc-300 transition hover:bg-relic/10 hover:text-relic"
              aria-label="Next month"
            >
              <ChevronRight size={17} />
            </button>
          </div>
          <button type="button" onClick={() => void copyMonthText()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/15 bg-black/35 px-4 py-2 text-sm font-bold text-white transition hover:border-relic/45 hover:text-relic">
            <ClipboardCopy size={16} />
            Копировать текст
          </button>
          <button type="button" onClick={downloadExcel} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-400/15 px-4 py-2 text-sm font-black text-emerald-100 shadow-[0_0_20px_rgba(52,211,153,0.12)] transition hover:border-emerald-300 hover:bg-emerald-400/22">
            <Download size={17} />
            Скачать Excel
          </button>
          <button type="button" onClick={downloadCsv} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-relic/45 bg-relic px-4 py-2 text-sm font-black text-black shadow-[0_0_22px_rgba(200,154,61,0.24)] transition hover:bg-[#e7c16a]">
            <FileSpreadsheet size={16} />
            Скачать CSV
          </button>
        </div>
        </div>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {availableMonths.map((month) => (
          <button
            key={month}
            type="button"
            onClick={() => setSelectedMonth(month)}
            data-active={month === selectedMonth ? "true" : "false"}
            className="shrink-0 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm font-semibold capitalize text-zinc-400 transition hover:border-relic/40 hover:text-relic data-[active=true]:border-relic/60 data-[active=true]:bg-relic/15 data-[active=true]:text-relic"
          >
            {formatMonthLabel(month)}
          </button>
        ))}
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

      <div className="overflow-hidden rounded-xl border border-slate-500/25 bg-[#071019]/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_18px_55px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-2 border-b border-slate-500/20 bg-[#0d1624]/92 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-relic">Spreadsheet view</p>
            <p className="mt-1 text-sm text-zinc-400">Месячная таблица заявок: редактируй ячейки, сохраняй строку, скачивай Excel или CSV.</p>
          </div>
          <span className="rounded-full border border-white/10 bg-black/28 px-3 py-1 text-xs font-semibold text-zinc-300">
            {formatMonthLabel(selectedMonth)} · {monthLeads.length} строк
          </span>
        </div>
        <div className="max-h-[620px] overflow-auto">
        <table className="w-[1565px] min-w-[1565px] border-separate border-spacing-0 text-left text-[13px]">
          <colgroup>
            <col className="w-[60px]" />
            <col className="w-[120px]" />
            <col className="w-[135px]" />
            <col className="w-[190px]" />
            <col className="w-[220px]" />
            <col className="w-[125px]" />
            <col className="w-[145px]" />
            <col className="w-[180px]" />
            <col className="w-[230px]" />
            <col className="w-[230px]" />
            <col className="w-[150px]" />
          </colgroup>
          <thead className="sticky top-0 z-10 bg-[#0b1320]/98 text-[11px] uppercase tracking-[0.1em] text-relic backdrop-blur">
            <tr>
              <th className="sticky left-0 z-20 whitespace-nowrap border-b border-r border-white/10 bg-[#0b1320] p-3 text-center">№</th>
              <th className="whitespace-nowrap border-b border-r border-white/10 p-3">Дата</th>
              <th className="whitespace-nowrap border-b border-r border-white/10 p-3">Услуга</th>
              <th className="whitespace-nowrap border-b border-r border-white/10 p-3">Клиент</th>
              <th className="whitespace-nowrap border-b border-r border-white/10 p-3">Заявка</th>
              <th className="whitespace-nowrap border-b border-r border-white/10 p-3">Сумма</th>
              <th className="whitespace-nowrap border-b border-r border-white/10 p-3">Bumpy Coins</th>
              <th className="whitespace-nowrap border-b border-r border-white/10 p-3">Этап</th>
              <th className="whitespace-nowrap border-b border-r border-white/10 p-3">Оплата</th>
              <th className="whitespace-nowrap border-b border-r border-white/10 p-3">Заметка</th>
              <th className="whitespace-nowrap border-b border-white/10 p-3">Действия</th>
            </tr>
          </thead>
          <tbody>
            {monthLeads.map((lead, index) => {
              const draft = drafts[lead.id] ?? draftFromLead(lead);
              const completed = isCompletedOrder(draft.status);

              return (
                <tr key={lead.id} className={`${completed ? "bg-emerald-400/[0.04]" : "bg-black/18"} transition hover:bg-relic/[0.06]`}>
                  <td className="sticky left-0 z-[1] border-b border-r border-white/10 bg-[#071019] p-3 text-center align-top font-semibold text-zinc-500">{index + 1}</td>
                  <td className="whitespace-nowrap border-b border-r border-white/10 p-3 align-top text-zinc-400">{formatDate(lead.createdAt?.seconds)}</td>
                  <td className="whitespace-nowrap border-b border-r border-white/10 p-3 align-top font-semibold text-white">{serviceLabel(lead.serviceType)}</td>
                  <td className="border-b border-r border-white/10 p-3 align-top">
                    <p className="font-semibold text-white">{lead.clientName || lead.email || lead.uid || "Клиент"}</p>
                    <p className="text-xs text-zinc-500">{lead.telegram || "telegram не указан"}</p>
                  </td>
                  <td className="border-b border-r border-white/10 p-3 align-top">
                    <p className="line-clamp-2 font-semibold text-white">{lead.packageName || lead.packageId || "Заявка"}</p>
                    {lead.comment ? <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{lead.comment}</p> : null}
                  </td>
                  <td className="border-b border-r border-white/10 p-3 align-top">
                    <input
                      value={draft.amountRub}
                      onChange={(event) => updateDraft(lead.id, { amountRub: event.target.value })}
                      className="w-28 rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
                      placeholder="0"
                    />
                  </td>
                  <td className="border-b border-r border-white/10 p-3 align-top">
                    <input
                      value={draft.manualBumpyCoins}
                      onChange={(event) => updateDraft(lead.id, { manualBumpyCoins: event.target.value })}
                      className="w-32 rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
                      placeholder="+ coins"
                      inputMode="numeric"
                    />
                    <p className="mt-1 text-[11px] leading-4 text-zinc-500">разово клиенту</p>
                    {lead.manualBumpyCoinsAwardedTotal ? (
                      <p className="mt-1 text-[11px] font-semibold leading-4 text-relic">
                        уже +{lead.manualBumpyCoinsAwardedTotal.toLocaleString("ru-RU")}
                      </p>
                    ) : null}
                  </td>
                  <td className="border-b border-r border-white/10 p-3 align-top">
                    <select
                      value={draft.status}
                      onChange={(event) => updateStage(lead.id, event.target.value as OrderStageId)}
                      className="w-44 rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
                    >
                      {orderStages.map((stage) => (
                        <option key={stage.id} value={stage.id}>
                          {stage.id === "completed" ? "Заявка выполнена" : stage.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="border-b border-r border-white/10 p-3 align-top">
                    <textarea
                      value={draft.paymentDetails}
                      onChange={(event) => updateDraft(lead.id, { paymentDetails: event.target.value })}
                      rows={2}
                      className="w-56 rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
                      placeholder="Ссылка на оплату или реквизиты"
                    />
                  </td>
                  <td className="border-b border-r border-white/10 p-3 align-top">
                    <textarea
                      value={draft.managerNote}
                      onChange={(event) => updateDraft(lead.id, { managerNote: event.target.value })}
                      rows={2}
                      className="w-56 rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
                      placeholder="Внутренняя заметка"
                    />
                  </td>
                  <td className="border-b border-white/10 p-3 align-top">
                    <div className="flex flex-col gap-2">
                      <button type="button" onClick={() => void saveLead(lead)} className="inline-flex items-center justify-center gap-2 rounded-md bg-relic px-3 py-2 font-bold text-black">
                        <CheckCircle2 size={15} />
                        Сохранить
                      </button>
                      {lead.uid ? (
                        <button
                          type="button"
                          onClick={() => router.push(`/orders/${lead.id}`)}
                          className="inline-flex items-center justify-center gap-2 rounded-md border border-relic/30 bg-relic/10 px-3 py-2 font-semibold text-relic"
                        >
                          <MessageSquare size={15} />
                          Статус и чат
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
      </div>

      <div className="mt-4 rounded-lg border border-relic/16 bg-black/22 p-4 text-sm leading-6 text-zinc-400">
        Этапы видит клиент в личном кабинете. Сумма выполненных заявок автоматически участвует в BP-статусе: 100 000 ₽ - Silver, 300 000 ₽ - Gold, 777 777 ₽ - Platinum.
      </div>
    </GlassPanel>
  );
}
