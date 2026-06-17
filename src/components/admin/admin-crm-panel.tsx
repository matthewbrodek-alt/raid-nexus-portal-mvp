"use client";

import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight, ClipboardCopy, Download, FileSpreadsheet, MessageSquare, Save, Table2 } from "lucide-react";
import { addDoc, collection, doc, getDoc, increment, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";
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
  requestedBumpyCoinsUse?: boolean;
  requestedBumpyCoinsAvailable?: number;
  lastBumpyCoinsWrittenOff?: number;
  bumpyCoinsWrittenOffTotal?: number;
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
  writeOffBumpyCoins: string;
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
    manualBumpyCoins: "",
    writeOffBumpyCoins: ""
  };
}

function serviceLabel(type?: string) {
  return serviceLabels[(type as ServiceType) || "donation"] ?? "Донат";
}

function clientDisplayName(lead: TopupLead) {
  if (lead.clientName?.trim()) {
    return lead.clientName.trim();
  }

  if (lead.telegram?.trim()) {
    return lead.telegram.trim();
  }

  if (lead.email?.trim()) {
    return lead.email.trim();
  }

  return lead.uid ? `Игрок ${lead.uid.slice(-6)}` : "Клиент";
}

function profileDisplayName(user: UserProfile) {
  return user.displayName?.trim() || user.email?.trim() || `Игрок ${user.uid.slice(-6)}`;
}

function normalizeUserSearch(value: string) {
  return value.trim().toLocaleLowerCase("ru-RU");
}

function matchesUserSearch(user: UserProfile, queryText: string) {
  const needle = normalizeUserSearch(queryText);

  if (!needle) {
    return true;
  }

  return [user.displayName, user.email, user.uid, user.referralCode]
    .filter(Boolean)
    .some((value) => normalizeUserSearch(String(value)).includes(needle));
}

function formatRub(value?: number) {
  return `${Math.max(0, Math.floor(value ?? 0)).toLocaleString("ru-RU")} ₽`;
}

function exportRows(leads: TopupLead[]) {
  return leads
    .map((lead) =>
      [
        formatDate(lead.createdAt?.seconds),
        serviceLabel(lead.serviceType),
        lead.telegram ?? "",
        clientDisplayName(lead),
        lead.packageName ?? lead.packageId ?? "",
        `${lead.amountRub ?? 0} RUB`,
        `+${lead.manualBumpyCoinsAwardedTotal ?? 0} / -${lead.bumpyCoinsWrittenOffTotal ?? 0} Bumpy Coins`,
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
  const existingRewardData = existingReward.exists() ? (existingReward.data() as { amountRub?: number }) : null;
  const alreadyRewardedRub = Math.max(0, existingRewardData?.amountRub ?? 0);
  const rewardableRub = Math.max(0, amountRub - alreadyRewardedRub);

  if (rewardableRub <= 0) {
    return 0;
  }

  const referralUserSnapshot = await getDoc(doc(db, collections.users, lead.uid));
  const referralUser = referralUserSnapshot.exists() ? (referralUserSnapshot.data() as UserProfile) : null;

  if (!referralUser?.referredByUid) {
    return 0;
  }

  const rewardCoins = calculateReferralReward(rewardableRub);

  if (rewardCoins <= 0) {
    return 0;
  }

  await setDoc(
    rewardRef,
    {
    amountRub,
    ...(existingReward.exists() ? {} : { createdAt: serverTimestamp() }),
    leadId: lead.id,
    ownerUid: referralUser.referredByUid,
    packageName: lead.packageName ?? lead.packageId ?? "",
    referralUid: lead.uid,
    rewardCoins: increment(rewardCoins),
    serviceType: lead.serviceType ?? "donation",
    updatedAt: serverTimestamp()
    },
    { merge: true }
  );

  await setDoc(doc(db, collections.bonusTransactions, `ref-${lead.id}-${Date.now()}`), {
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

async function writeOffBumpyCoins(lead: TopupLead, amountCoins: number, managerUid?: string) {
  if (!lead.uid || amountCoins <= 0) {
    return 0;
  }

  const requestedCoins = Math.floor(amountCoins);

  if (requestedCoins <= 0) {
    return 0;
  }

  const userRef = doc(db, collections.users, lead.uid);
  const userSnapshot = await getDoc(userRef);
  const userData = userSnapshot.exists() ? (userSnapshot.data() as Partial<UserProfile>) : {};
  const availableCoins = Math.max(0, Math.floor(userData.bumpyCoinsBalance ?? 0));
  const safeCoins = Math.min(requestedCoins, availableCoins);

  if (safeCoins <= 0) {
    return 0;
  }

  await setDoc(doc(db, collections.bonusTransactions, `writeoff-${lead.id}-${Date.now()}`), {
    amountCoins: -safeCoins,
    createdAt: serverTimestamp(),
    description: `Manager Bumpy Coins write-off: ${lead.packageName ?? lead.packageId ?? lead.id}`,
    leadId: lead.id,
    managerUid: managerUid ?? "",
    source: "manager_writeoff",
    uid: lead.uid
  });

  await updateDoc(userRef, {
    bumpyCoinsBalance: increment(-safeCoins),
    bumpyCoinsSpentTotal: increment(safeCoins),
    updatedAt: serverTimestamp()
  });

  await updateDoc(doc(db, collections.topupLeads, lead.id), {
    lastBumpyCoinsWrittenOff: safeCoins,
    bumpyCoinsWrittenOffTotal: increment(safeCoins),
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
  const [siteUsers, setSiteUsers] = useState<UserProfile[]>([]);
  const [manualService, setManualService] = useState<ServiceType>("donation");
  const [manualUserSearch, setManualUserSearch] = useState("");
  const [manualSelectedUserUid, setManualSelectedUserUid] = useState("");
  const [manualNote, setManualNote] = useState("");
  const [statusText, setStatusText] = useState("");
  const [editingLeadId, setEditingLeadId] = useState("");
  const [savingLeadId, setSavingLeadId] = useState("");

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

  useEffect(() => {
    const usersQuery = query(collection(db, collections.users), limit(500));

    return onSnapshot(
      usersQuery,
      (snapshot) => {
        const nextUsers = snapshot.docs
          .map((item) => ({ uid: item.id, ...(item.data() as Omit<UserProfile, "uid">) }))
          .sort((first, second) => profileDisplayName(first).localeCompare(profileDisplayName(second), "ru"));

        setSiteUsers(nextUsers);
      },
      () => {
        setSiteUsers([]);
      }
    );
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
  const completedAmount = useMemo(
    () => monthLeads.filter((lead) => isCompletedOrder(lead.status)).reduce((sum, lead) => sum + (lead.amountRub ?? 0), 0),
    [monthLeads]
  );
  const selectedManualUser = useMemo(() => siteUsers.find((user) => user.uid === manualSelectedUserUid) ?? null, [manualSelectedUserUid, siteUsers]);
  const filteredManualUsers = useMemo(() => {
    const source = manualUserSearch.trim() ? siteUsers.filter((user) => matchesUserSearch(user, manualUserSearch)) : siteUsers;

    return source.slice(0, 8);
  }, [manualUserSearch, siteUsers]);

  function updateDraft(leadId: string, patch: Partial<Draft>) {
    setDrafts((current) => ({
      ...current,
      [leadId]: {
        ...(current[leadId] ?? { amountRub: "", status: "new", paymentDetails: "", managerNote: "", manualBumpyCoins: "", writeOffBumpyCoins: "" }),
        ...patch
      }
    }));
  }

  function updateStage(leadId: string, status: OrderStageId) {
    const currentDraft = drafts[leadId] ?? { amountRub: "", status: "new", paymentDetails: "", managerNote: "", manualBumpyCoins: "", writeOffBumpyCoins: "" };
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
    if (savingLeadId === lead.id) {
      return;
    }

    const draft = drafts[lead.id] ?? draftFromLead(lead);
    const amountRub = Number(draft.amountRub.replace(/[^\d.]/g, ""));
    const safeAmountRub = Number.isFinite(amountRub) ? amountRub : 0;
    const manualCoins = Number((draft.manualBumpyCoins ?? "").replace(/[^\d.]/g, ""));
    const safeManualCoins = Number.isFinite(manualCoins) ? manualCoins : 0;
    const writeOffCoins = Number((draft.writeOffBumpyCoins ?? "").replace(/[^\d.]/g, ""));
    const safeWriteOffCoins = Number.isFinite(writeOffCoins) ? writeOffCoins : 0;
    const hasLinkedClient = Boolean(lead.uid);

    if (!hasLinkedClient && (safeManualCoins > 0 || safeWriteOffCoins > 0)) {
      setStatusText("Bumpy Coins нельзя начислить или списать: ручная заявка не связана с аккаунтом на сайте.");
      return;
    }

    setSavingLeadId(lead.id);

    try {
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
      const writtenOffCoins = await writeOffBumpyCoins(lead, safeWriteOffCoins, profile?.uid);

      updateDraft(lead.id, { manualBumpyCoins: "", writeOffBumpyCoins: "" });
      setEditingLeadId("");

      const statusParts = ["Заявка обновлена."];

      if (manualAwardedCoins > 0) {
        statusParts.push(`Начислено клиенту: ${manualAwardedCoins} Bumpy Coins.`);
      }

      if (writtenOffCoins > 0) {
        statusParts.push(`Списано с клиента: ${writtenOffCoins} Bumpy Coins.`);
      }

      if (rewardCoins > 0) {
        statusParts.push(`Реферальный бонус: ${rewardCoins} Bumpy Coins.`);
      }

      setStatusText(statusParts.join(" "));
    } finally {
      setSavingLeadId("");
    }
  }

  async function createManualLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedManualUser) {
      setStatusText("Выберите клиента из базы сайта. Тогда заявка получит чат, Bumpy Coins и историю в личном кабинете.");
      return;
    }

    const manualRequestTitle = serviceLabel(manualService);
    const clientName = profileDisplayName(selectedManualUser);

    await addDoc(collection(db, collections.topupLeads), {
      uid: selectedManualUser.uid,
      email: selectedManualUser.email ?? "",
      clientName,
      telegram: "",
      packageId: `manual-${manualService}`,
      packageName: manualRequestTitle,
      serviceType: manualService,
      paymentMethod: "manager",
      managerNote: manualNote.trim(),
      requestedBumpyCoinsAvailable: selectedManualUser.bumpyCoinsBalance ?? 0,
      status: "new",
      source: "admin-panel",
      createdBy: profile?.uid ?? "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    setManualUserSearch("");
    setManualSelectedUserUid("");
    setManualNote("");
    setManualService("donation");
    setStatusText(`Внутренняя заявка создана для ${clientName}.`);
  }

  async function copyMonthText() {
    await copyTextToClipboard(exportRows(monthLeads));
    setStatusText("Текстовая выгрузка скопирована.");
  }

  function downloadCsv() {
    const header = "number;date;service;telegram;client;request;amountRub;manualBumpyCoins;bumpyCoinsWrittenOff;stage;paymentDetails;managerNote;comment";
    const rows = monthLeads.map((lead, index) =>
      [
        String(index + 1),
        formatDate(lead.createdAt?.seconds),
        serviceLabel(lead.serviceType),
        lead.telegram ?? "",
        clientDisplayName(lead),
        lead.packageName ?? lead.packageId ?? "",
        String(lead.amountRub ?? 0),
        String(lead.manualBumpyCoinsAwardedTotal ?? 0),
        String(lead.bumpyCoinsWrittenOffTotal ?? 0),
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
    const headers = ["№", "Дата", "Услуга", "Telegram", "Клиент", "Заявка", "Сумма", "Bumpy Coins +", "Bumpy Coins -", "Этап", "Оплата", "Заметка", "Комментарий"];
    const rows = monthLeads.map((lead, index) => [
      index + 1,
      formatDate(lead.createdAt?.seconds),
      serviceLabel(lead.serviceType),
      lead.telegram ?? "",
      clientDisplayName(lead),
      lead.packageName ?? lead.packageId ?? "",
      lead.amountRub ?? 0,
      lead.manualBumpyCoinsAwardedTotal ?? 0,
      lead.bumpyCoinsWrittenOffTotal ?? 0,
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

  function renderLeadEditor(lead: TopupLead) {
    const draft = drafts[lead.id] ?? draftFromLead(lead);
    const hasLinkedClient = Boolean(lead.uid);
    const saving = savingLeadId === lead.id;

    return (
      <div className="rounded-2xl border border-relic/20 bg-[#07101d]/92 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="text-xs font-bold text-zinc-500">Сумма заказа</span>
            <input
              value={draft.amountRub}
              onChange={(event) => updateDraft(lead.id, { amountRub: event.target.value })}
              className="mt-2 w-full rounded-xl border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
              placeholder="0"
              inputMode="numeric"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-zinc-500">Статус</span>
            <select
              value={draft.status}
              onChange={(event) => updateStage(lead.id, event.target.value as OrderStageId)}
              className="mt-2 w-full rounded-xl border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
            >
              {orderStages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.id === "completed" ? "Заявка выполнена" : stage.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-bold text-zinc-500">Начислить Bumpy Coins</span>
            <input
              value={draft.manualBumpyCoins}
              onChange={(event) => updateDraft(lead.id, { manualBumpyCoins: event.target.value })}
              disabled={!hasLinkedClient}
              className="mt-2 w-full rounded-xl border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic disabled:cursor-not-allowed disabled:opacity-45"
              placeholder="+ coins"
              inputMode="numeric"
            />
          </label>
          <label className="block">
            <span className="text-xs font-bold text-zinc-500">Списать Bumpy Coins</span>
            <input
              value={draft.writeOffBumpyCoins}
              onChange={(event) => updateDraft(lead.id, { writeOffBumpyCoins: event.target.value })}
              disabled={!hasLinkedClient}
              className="mt-2 w-full rounded-xl border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic disabled:cursor-not-allowed disabled:opacity-45"
              placeholder="- coins"
              inputMode="numeric"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-bold text-zinc-500">Оплата / реквизиты</span>
            <textarea
              value={draft.paymentDetails}
              onChange={(event) => updateDraft(lead.id, { paymentDetails: event.target.value })}
              rows={3}
              className="mt-2 w-full rounded-xl border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
              placeholder="Ссылка на оплату или реквизиты"
            />
          </label>
          <label className="block sm:col-span-2">
            <span className="text-xs font-bold text-zinc-500">Заметка менеджера</span>
            <textarea
              value={draft.managerNote}
              onChange={(event) => updateDraft(lead.id, { managerNote: event.target.value })}
              rows={3}
              className="mt-2 w-full rounded-xl border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
              placeholder="Что увидит клиент или внутренняя заметка"
            />
          </label>
        </div>

        {!hasLinkedClient ? (
          <p className="mt-3 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs font-semibold leading-5 text-amber-100">
            Ручная заявка хранит имя только для таблицы. Чат, списание и начисление Bumpy Coins доступны только у заявок, созданных аккаунтом на сайте.
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void saveLead(lead)}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-relic px-4 py-2.5 font-black text-black transition disabled:cursor-wait disabled:opacity-60"
          >
            <CheckCircle2 size={16} />
            {saving ? "Сохраняю..." : "Сохранить"}
          </button>
          <button type="button" onClick={() => setEditingLeadId("")} className="rounded-xl border border-white/10 bg-black/25 px-4 py-2.5 font-bold text-zinc-300 transition hover:border-relic/30 hover:text-relic">
            Закрыть
          </button>
          {hasLinkedClient ? (
            <button
              type="button"
              onClick={() => router.push(`/orders/${lead.id}`)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-relic/30 bg-relic/10 px-4 py-2.5 font-bold text-relic"
            >
              <MessageSquare size={16} />
              Открыть заявку
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <GlassPanel className="p-4 sm:p-6">
      <div className="mb-5 rounded-2xl border border-relic/25 bg-[linear-gradient(135deg,rgba(47,124,255,0.13),rgba(4,8,14,0.72))] p-4 shadow-[0_0_34px_rgba(47,124,255,0.1)]">
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
          <button type="button" onClick={downloadCsv} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-relic/45 bg-relic px-4 py-2 text-sm font-black text-black shadow-[0_0_22px_rgba(47,124,255,0.24)] transition hover:bg-[#63a6ff]">
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

      <div className="mb-4 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-relic/18 bg-black/22 p-3">
          <p className="text-[11px] font-bold tracking-[0.12em] text-zinc-500">Заявок за месяц</p>
          <p className="mt-1 text-2xl font-black text-white">{monthLeads.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-400/18 bg-emerald-400/[0.07] p-3">
          <p className="text-[11px] font-bold tracking-[0.12em] text-zinc-500">Выполнено на сумму</p>
          <p className="mt-1 text-2xl font-black text-emerald-300">{completedAmount.toLocaleString("ru-RU")} ₽</p>
        </div>
      </div>

      <form onSubmit={createManualLead} className="mb-4 grid gap-2 rounded-xl border border-white/10 bg-black/20 p-3 lg:grid-cols-[0.8fr_1.6fr_2fr_auto]">
        <select value={manualService} onChange={(event) => setManualService(event.target.value as ServiceType)} className="rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic">
          <option value="donation">Донат</option>
          <option value="account_purchase">Покупка аккаунта</option>
          <option value="game_help">Помощь по игре</option>
        </select>
        <div className="rounded-md border border-white/10 bg-black/30 p-2">
          <input
            value={manualUserSearch}
            onChange={(event) => {
              setManualUserSearch(event.target.value);
              setManualSelectedUserUid("");
            }}
            placeholder="Найти клиента по нику, email или uid"
            className="w-full rounded-md border-white/10 bg-black/40 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
          />
          {selectedManualUser ? (
            <div className="mt-2 rounded-lg border border-relic/25 bg-relic/[0.08] px-3 py-2 text-xs text-zinc-300">
              <p className="font-black text-white">{profileDisplayName(selectedManualUser)}</p>
              <p className="mt-1 break-words text-zinc-500">{selectedManualUser.email || selectedManualUser.uid}</p>
              <p className="mt-1 text-relic">
                BP: {selectedManualUser.bpStatus ?? "bronze"} · Баланс: {(selectedManualUser.bumpyCoinsBalance ?? 0).toLocaleString("ru-RU")} BC
              </p>
            </div>
          ) : (
            <div className="mt-2 max-h-44 overflow-y-auto rounded-lg border border-white/10 bg-[#071019]/95">
              {filteredManualUsers.length > 0 ? (
                filteredManualUsers.map((user) => (
                  <button
                    key={user.uid}
                    type="button"
                    onClick={() => {
                      setManualSelectedUserUid(user.uid);
                      setManualUserSearch(profileDisplayName(user));
                    }}
                    className="block w-full border-b border-white/5 px-3 py-2 text-left text-xs transition last:border-b-0 hover:bg-relic/[0.12]"
                  >
                    <span className="block truncate font-black text-white">{profileDisplayName(user)}</span>
                    <span className="block truncate text-zinc-500">{user.email || user.uid}</span>
                    <span className="mt-1 block text-relic">
                      {user.bpStatus ?? "bronze"} · {(user.bumpyCoinsBalance ?? 0).toLocaleString("ru-RU")} BC
                    </span>
                  </button>
                ))
              ) : (
                <p className="px-3 py-3 text-xs text-zinc-500">Пользователь не найден.</p>
              )}
            </div>
          )}
        </div>
        <textarea value={manualNote} onChange={(event) => setManualNote(event.target.value)} rows={1} placeholder="Заметка менеджера / детали заявки" className="min-h-11 rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
        <button disabled={!selectedManualUser} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-relic px-4 py-2 font-bold text-black transition disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400">
          <Save size={16} />
          Создать
        </button>
      </form>

      {statusText ? <p className="mb-4 rounded-lg border border-relic/20 bg-relic/[0.08] p-3 text-sm text-zinc-300">{statusText}</p> : null}

      <div className="overflow-hidden rounded-xl border border-slate-500/25 bg-[#071019]/78 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_18px_55px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-2 border-b border-slate-500/20 bg-[#0d1624]/92 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-relic">Реестр заявок</p>
          </div>
          <span className="rounded-full border border-white/10 bg-black/28 px-3 py-1 text-xs font-semibold text-zinc-300">
            {formatMonthLabel(selectedMonth)} · {monthLeads.length} строк
          </span>
        </div>
        <div className="hidden max-h-[480px] overflow-auto md:block">
          <table className="min-w-full table-fixed border-separate border-spacing-0 text-left text-[13px]">
            <colgroup>
              <col className="w-[54px]" />
              <col className="w-[136px]" />
              <col className="w-[190px]" />
              <col className="w-[130px]" />
              <col />
              <col className="w-[116px]" />
              <col className="w-[148px]" />
              <col className="w-[170px]" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-[#0b1320]/98 text-[11px] uppercase tracking-[0.1em] text-relic backdrop-blur">
              <tr>
                <th className="border-b border-white/10 p-3 text-center">№</th>
                <th className="border-b border-white/10 p-3">Дата</th>
                <th className="border-b border-white/10 p-3">Клиент</th>
                <th className="border-b border-white/10 p-3">Услуга</th>
                <th className="border-b border-white/10 p-3">Заявка</th>
                <th className="border-b border-white/10 p-3">Сумма</th>
                <th className="border-b border-white/10 p-3">Статус</th>
                <th className="border-b border-white/10 p-3">Действия</th>
              </tr>
            </thead>
            <tbody>
              {monthLeads.map((lead, index) => {
                const draft = drafts[lead.id] ?? draftFromLead(lead);
                const stage = getOrderStage(draft.status);
                const completed = isCompletedOrder(draft.status);
                const editing = editingLeadId === lead.id;
                const hasLinkedClient = Boolean(lead.uid);

                return (
                  <Fragment key={lead.id}>
                    <tr className={`${completed ? "bg-emerald-400/[0.04]" : "bg-black/18"} transition hover:bg-relic/[0.06]`}>
                      <td className="border-b border-white/10 p-3 text-center align-middle font-semibold text-zinc-500">{index + 1}</td>
                      <td className="whitespace-nowrap border-b border-white/10 p-3 align-middle text-zinc-400">{formatDate(lead.createdAt?.seconds)}</td>
                      <td className="border-b border-white/10 p-3 align-middle">
                        <button
                          type="button"
                          onClick={() => (hasLinkedClient ? router.push(`/orders/${lead.id}`) : setEditingLeadId(lead.id))}
                          className="block max-w-full truncate text-left font-black text-white transition hover:text-relic"
                        >
                          {clientDisplayName(lead)}
                        </button>
                        <p className="mt-0.5 text-xs text-zinc-500">{hasLinkedClient ? "аккаунт на сайте" : "ручная заявка без чата"}</p>
                      </td>
                      <td className="whitespace-nowrap border-b border-white/10 p-3 align-middle font-semibold text-zinc-300">{serviceLabel(lead.serviceType)}</td>
                      <td className="border-b border-white/10 p-3 align-middle">
                        <p className="line-clamp-1 font-semibold text-white">{lead.packageName || lead.packageId || "Заявка"}</p>
                        {lead.comment ? <p className="mt-1 line-clamp-1 text-xs text-zinc-500">{lead.comment}</p> : null}
                      </td>
                      <td className="whitespace-nowrap border-b border-white/10 p-3 align-middle font-black text-white">{formatRub(Number(draft.amountRub) || lead.amountRub)}</td>
                      <td className="border-b border-white/10 p-3 align-middle">
                        <span className={`${completed ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-relic/25 bg-relic/[0.08] text-relic"} inline-flex rounded-full border px-3 py-1 text-xs font-bold`}>
                          {draft.status === "completed" ? "Выполнено" : stage.clientLabel}
                        </span>
                      </td>
                      <td className="border-b border-white/10 p-3 align-middle">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingLeadId(editing ? "" : lead.id)}
                            className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-xs font-bold text-zinc-200 transition hover:border-relic/40 hover:text-relic"
                          >
                            {editing ? "Скрыть" : "Редактировать"}
                          </button>
                          <button
                            type="button"
                            onClick={() => router.push(`/orders/${lead.id}`)}
                            disabled={!hasLinkedClient}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-relic/30 bg-relic/10 px-3 py-2 text-xs font-bold text-relic transition disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-zinc-600"
                          >
                            <MessageSquare size={14} />
                            {hasLinkedClient ? "Детали" : "Без чата"}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {editing ? (
                      <tr>
                        <td colSpan={8} className="border-b border-white/10 bg-black/14 p-4">
                          {renderLeadEditor(lead)}
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="grid max-h-[520px] gap-2 overflow-y-auto p-2 md:hidden">
          {monthLeads.map((lead, index) => {
            const draft = drafts[lead.id] ?? draftFromLead(lead);
            const stage = getOrderStage(draft.status);
            const completed = isCompletedOrder(draft.status);
            const editing = editingLeadId === lead.id;
            const hasLinkedClient = Boolean(lead.uid);

            return (
              <article key={lead.id} className={`${completed ? "border-emerald-400/25 bg-emerald-400/[0.05]" : "border-white/10 bg-black/22"} rounded-xl border p-3`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-500">№ {index + 1} · {formatDate(lead.createdAt?.seconds)}</p>
                    <button
                      type="button"
                      onClick={() => (hasLinkedClient ? router.push(`/orders/${lead.id}`) : setEditingLeadId(lead.id))}
                      className="mt-0.5 max-w-full text-left text-base font-black text-white transition hover:text-relic"
                    >
                      {clientDisplayName(lead)}
                    </button>
                    <p className="mt-0.5 text-xs font-semibold text-zinc-400">{serviceLabel(lead.serviceType)} · {hasLinkedClient ? "аккаунт" : "без чата"}</p>
                  </div>
                  <span className={`${completed ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200" : "border-relic/25 bg-relic/[0.08] text-relic"} shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-bold`}>
                    {draft.status === "completed" ? "Выполнено" : stage.clientLabel}
                  </span>
                </div>

                <div className="mt-2 rounded-lg border border-white/10 bg-black/18 px-3 py-2">
                  <div className="flex items-start justify-between gap-3">
                    <p className="line-clamp-1 font-bold text-white">{lead.packageName || lead.packageId || "Заявка"}</p>
                    <p className="shrink-0 font-black text-relic">{formatRub(Number(draft.amountRub) || lead.amountRub)}</p>
                  </div>
                  {lead.comment ? <p className="mt-1 line-clamp-1 text-xs text-zinc-500">{lead.comment}</p> : null}
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => router.push(`/orders/${lead.id}`)}
                    disabled={!hasLinkedClient}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-relic/30 bg-relic/10 px-3 py-2 text-xs font-bold text-relic transition disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/[0.03] disabled:text-zinc-600"
                  >
                    <MessageSquare size={15} />
                    {hasLinkedClient ? "Детали" : "Без чата"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingLeadId(editing ? "" : lead.id)}
                    className="rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-bold text-zinc-200"
                  >
                    {editing ? "Скрыть" : "Редактировать"}
                  </button>
                </div>

                {editing ? <div className="mt-3">{renderLeadEditor(lead)}</div> : null}
              </article>
            );
          })}
        </div>

        {monthLeads.length === 0 ? <p className="p-5 text-sm text-zinc-500">За выбранный месяц заявок нет.</p> : null}
      </div>
    </GlassPanel>
  );
}
