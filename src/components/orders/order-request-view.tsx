"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  ImagePlus,
  MessageCircle,
  Save,
  Send,
  ShieldCheck,
  X
} from "lucide-react";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { GlassPanel } from "@/components/ui/glass-panel";
import { normalizeOrderStage, type OrderStageId } from "@/lib/bp-status";
import { getClipboardImageFile } from "@/lib/browser/clipboard-image";
import type { CloudinaryAsset } from "@/lib/cloudinary/types";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { useLanguage } from "@/lib/i18n/use-language";
import { markNotificationSeen } from "@/lib/notifications/seen-state";

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
  packageId?: string;
  paymentMethod?: string;
  paymentDetails?: string;
  managerNote?: string;
  comment?: string;
  amountRub?: number;
  requestedBumpyCoinsUse?: boolean;
  requestedBumpyCoinsAvailable?: number;
  lastBumpyCoinsWrittenOff?: number;
  bumpyCoinsWrittenOffTotal?: number;
  lastBumpyCoinsCredited?: number;
  bumpyCoinsCreditedTotal?: number;
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
  attachment?: {
    secureUrl?: string;
    url?: string;
    alt?: string;
  } | null;
  createdAt?: FirestoreTime;
};

type ImagePreview = {
  url: string;
  alt: string;
};

type ManagerDraft = {
  amountRub: string;
  status: OrderStageId;
  paymentDetails: string;
  managerNote: string;
  writeOffBumpyCoins: string;
  creditBumpyCoins: string;
};

type OrderRequestViewProps = {
  leadId: string;
};

type ClientWallet = {
  bumpyCoinsBalance?: number;
  bumpyCoinsEarnedTotal?: number;
  bumpyCoinsSpentTotal?: number;
  displayName?: string;
  email?: string;
};

const stageCopy: Record<OrderStageId, { ru: string; en: string; hintRu: string; hintEn: string }> = {
  new: {
    ru: "Заявка создана",
    en: "Request created",
    hintRu: "Клиент отправил заявку, менеджер проверяет данные.",
    hintEn: "Client sent the request, manager is checking details."
  },
  payment: {
    ru: "Оплата заказа",
    en: "Payment",
    hintRu: "Менеджер добавил реквизиты или ссылку на оплату.",
    hintEn: "Manager added payment details or a payment link."
  },
  in_progress: {
    ru: "Выполнение работы",
    en: "In progress",
    hintRu: "Заказ принят в работу.",
    hintEn: "The order is being handled."
  },
  completed: {
    ru: "Заявка выполнена",
    en: "Completed",
    hintRu: "Работа завершена.",
    hintEn: "Work is completed."
  },
  cancelled: {
    ru: "Отменена",
    en: "Cancelled",
    hintRu: "Заявка отменена.",
    hintEn: "Request was cancelled."
  }
};

function getSeconds(value?: FirestoreTime) {
  return value?.seconds ?? 0;
}

function directThreadId(firstUid: string, secondUid: string) {
  return [firstUid, secondUid].sort().join("__");
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

function draftFromLead(lead: TopupLead | null): ManagerDraft {
  return {
    amountRub: typeof lead?.amountRub === "number" ? String(lead.amountRub) : "",
    status: normalizeOrderStage(lead?.status),
    paymentDetails: lead?.paymentDetails ?? "",
    managerNote: lead?.managerNote ?? "",
    writeOffBumpyCoins: "",
    creditBumpyCoins: ""
  };
}

function formatRub(value?: number) {
  return `${Math.max(0, Math.floor(value ?? 0)).toLocaleString("ru-RU")} ₽`;
}

function formatCoins(value?: number) {
  return `${Math.max(0, Math.floor(value ?? 0)).toLocaleString("ru-RU")} BC`;
}

async function uploadOrderImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "chat");
  formData.append("publicId", `order-screenshots/${Date.now()}-${file.name.replace(/[^a-z0-9.]+/gi, "-")}`);

  const response = await fetch("/api/cloudinary/upload", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Не удалось загрузить изображение.");
  }

  return (await response.json()) as CloudinaryAsset;
}

async function writeOffBumpyCoinsForLead(lead: TopupLead, amountCoins: number, managerUid: string) {
  if (!lead.uid || amountCoins <= 0) {
    return 0;
  }

  const requestedCoins = Math.floor(amountCoins);

  if (requestedCoins <= 0) {
    return 0;
  }

  const userRef = doc(db, collections.users, lead.uid);
  const userSnapshot = await getDoc(userRef);
  const userData = userSnapshot.exists() ? (userSnapshot.data() as { bumpyCoinsBalance?: number }) : {};
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
    managerUid,
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

async function creditBumpyCoinsForLead(lead: TopupLead, amountCoins: number, managerUid: string) {
  if (!lead.uid || amountCoins <= 0) {
    return 0;
  }

  const safeCoins = Math.floor(amountCoins);

  if (safeCoins <= 0) {
    return 0;
  }

  const userRef = doc(db, collections.users, lead.uid);

  await setDoc(doc(db, collections.bonusTransactions, `credit-${lead.id}-${Date.now()}`), {
    amountCoins: safeCoins,
    createdAt: serverTimestamp(),
    description: `Manager Bumpy Coins credit: ${lead.packageName ?? lead.packageId ?? lead.id}`,
    leadId: lead.id,
    managerUid,
    source: "manager_manual_credit",
    uid: lead.uid
  });

  await updateDoc(userRef, {
    bumpyCoinsBalance: increment(safeCoins),
    bumpyCoinsEarnedTotal: increment(safeCoins),
    updatedAt: serverTimestamp()
  });

  await updateDoc(doc(db, collections.topupLeads, lead.id), {
    lastBumpyCoinsCredited: safeCoins,
    bumpyCoinsCreditedTotal: increment(safeCoins),
    updatedAt: serverTimestamp()
  });

  return safeCoins;
}

export function OrderRequestView({ leadId }: OrderRequestViewProps) {
  const { isRu } = useLanguage();
  const { profile, user } = useAuth();
  const router = useRouter();
  const [lead, setLead] = useState<TopupLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [attachmentPreviewUrl, setAttachmentPreviewUrl] = useState("");
  const [imagePreview, setImagePreview] = useState<ImagePreview | null>(null);
  const [managerDraft, setManagerDraft] = useState<ManagerDraft>(() => draftFromLead(null));
  const [managerStatus, setManagerStatus] = useState("");
  const [clientWallet, setClientWallet] = useState<ClientWallet | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const sendingRef = useRef(false);
  const savingOrderRef = useRef(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const canManageOrder = profile?.role === "admin" || profile?.role === "owner";
  const hasLinkedClient = Boolean(lead?.uid);
  const activeStage = normalizeOrderStage(lead?.status);
  const activeLabel = stageCopy[activeStage][isRu ? "ru" : "en"];
  const canSend = Boolean(user?.uid && profile && (lead?.threadId || (canManageOrder && lead?.uid)) && (message.trim() || attachmentFile)) && !sending;
  const clientCoinsBalance = Math.max(0, Math.floor(clientWallet?.bumpyCoinsBalance ?? 0));
  const clientCoinsEarned = Math.max(0, Math.floor(clientWallet?.bumpyCoinsEarnedTotal ?? 0));
  const clientCoinsSpent = Math.max(0, Math.floor(clientWallet?.bumpyCoinsSpentTotal ?? 0));
  const statusTone =
    activeStage === "completed"
      ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-200"
      : activeStage === "cancelled"
        ? "border-red-400/35 bg-red-400/10 text-red-200"
        : "border-relic/35 bg-relic/10 text-relic";

  useEffect(() => {
    const leadRef = doc(db, collections.topupLeads, leadId);

    return onSnapshot(
      leadRef,
      (snapshot) => {
        const nextLead = snapshot.exists() ? { id: snapshot.id, ...(snapshot.data() as Omit<TopupLead, "id">) } : null;
        setLead(nextLead);
        setManagerDraft(draftFromLead(nextLead));
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

    const messagesQuery = query(collection(db, "directThreads", lead.threadId, "messages"), orderBy("createdAt", "asc"), limit(120));

    return onSnapshot(
      messagesQuery,
      (snapshot) => setMessages(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<OrderMessage, "id">) }))),
      () => setMessages([])
    );
  }, [lead?.managerUid, lead?.threadId, user?.uid]);

  useEffect(() => {
    if (!lead?.uid) {
      setClientWallet(null);
      return;
    }

    return onSnapshot(
      doc(db, collections.users, lead.uid),
      (snapshot) => setClientWallet(snapshot.exists() ? (snapshot.data() as ClientWallet) : null),
      () => setClientWallet(null)
    );
  }, [lead?.uid]);

  useEffect(() => {
    if (!attachmentFile) {
      setAttachmentPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(attachmentFile);
    setAttachmentPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [attachmentFile]);

  useEffect(() => {
    const node = messagesRef.current;

    if (!node) {
      return;
    }

    window.requestAnimationFrame(() => {
      node.scrollTo({ top: node.scrollHeight, behavior: "auto" });
    });
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

  useEffect(() => {
    if (!canManageOrder || !lead?.uid || !user?.uid || (lead.threadId && lead.managerUid === user.uid)) {
      return;
    }

    void ensureManagerThread();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- adding ensureManagerThread would recreate the effect on each render.
  }, [canManageOrder, lead?.managerUid, lead?.threadId, lead?.uid, user?.uid]);

  async function ensureManagerThread() {
    if (!lead || !user?.uid || !canManageOrder) {
      return lead?.threadId ?? "";
    }

    if (!lead.uid) {
      setManagerStatus(isRu ? "У клиента нет аккаунта на сайте, диалог открыть нельзя." : "Client has no site account, dialog cannot be opened.");
      return "";
    }

    const threadId = lead.threadId || directThreadId(lead.uid, user.uid);

    await setDoc(
      doc(db, "directThreads", threadId),
      {
        participants: arrayUnion(lead.uid, user.uid),
        topupLeadIds: arrayUnion(lead.id),
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    if (!lead.threadId || lead.managerUid !== user.uid) {
      await updateDoc(doc(db, collections.topupLeads, lead.id), {
        threadId,
        managerUid: user.uid,
        updatedAt: serverTimestamp()
      });
    }

    return threadId;
  }

  function applySelectedFile(file?: File) {
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setManagerStatus(isRu ? "Можно прикреплять только изображения." : "Only images can be attached.");
      return;
    }

    if (file.size > 6 * 1024 * 1024) {
      setManagerStatus(isRu ? "Изображение должно быть до 6 МБ." : "Image must be 6 MB or smaller.");
      return;
    }

    setAttachmentFile(file);
  }

  function handlePasteImage(event: React.ClipboardEvent<HTMLElement>) {
    const imageFile = getClipboardImageFile(event.clipboardData, `order-${leadId}-${Date.now()}.png`);

    if (!imageFile) {
      return;
    }

    event.preventDefault();
    applySelectedFile(imageFile);
  }

  async function saveOrderPanel(statusOverride?: OrderStageId) {
    if (savingOrderRef.current) {
      return;
    }

    if (!lead || !canManageOrder || !user?.uid) {
      return;
    }

    savingOrderRef.current = true;
    setSavingOrder(true);
    setManagerStatus("");

    try {
      const amountRub = Number(managerDraft.amountRub.replace(/[^\d.]/g, ""));
      const safeAmountRub = Number.isFinite(amountRub) ? amountRub : 0;
      const writeOffCoins = Number((managerDraft.writeOffBumpyCoins ?? "").replace(/[^\d.]/g, ""));
      const safeWriteOffCoins = Number.isFinite(writeOffCoins) ? writeOffCoins : 0;
      const creditCoins = Number((managerDraft.creditBumpyCoins ?? "").replace(/[^\d.]/g, ""));
      const safeCreditCoins = Number.isFinite(creditCoins) ? creditCoins : 0;
      const nextStatus = statusOverride ?? managerDraft.status;
      const currentStatus = normalizeOrderStage(lead.status);

      if (!lead.uid && (safeWriteOffCoins > 0 || safeCreditCoins > 0)) {
        setManagerStatus(
          isRu
            ? "Bumpy Coins нельзя начислить или списать: заявка не связана с аккаунтом на сайте."
            : "Bumpy Coins cannot be credited or written off: this request is not linked to a site account."
        );
        return;
      }

      await updateDoc(doc(db, collections.topupLeads, lead.id), {
        amountRub: safeAmountRub,
        status: nextStatus,
        paymentDetails: managerDraft.paymentDetails.trim(),
        managerNote: managerDraft.managerNote.trim(),
        processedBy: profile?.uid ?? "",
        updatedAt: serverTimestamp()
      });

      const threadId = await ensureManagerThread();

      if (threadId && currentStatus !== nextStatus) {
        await addDoc(collection(db, "directThreads", threadId, "messages"), {
          uid: user?.uid,
          displayName: profile?.displayName || "Raid Manager",
          text: `${isRu ? "Статус заявки обновлен" : "Request status updated"}: ${stageCopy[nextStatus][isRu ? "ru" : "en"]}`,
          topupLeadId: lead.id,
          system: true,
          createdAt: serverTimestamp()
        });
      }

      const writtenOffCoins = await writeOffBumpyCoinsForLead(lead, safeWriteOffCoins, user.uid);
      const creditedCoins = await creditBumpyCoinsForLead(lead, safeCreditCoins, user.uid);
      setManagerDraft((current) => ({ ...current, status: nextStatus, writeOffBumpyCoins: "", creditBumpyCoins: "" }));

      const coinNotes = [
        writtenOffCoins > 0 ? (isRu ? `списано ${formatCoins(writtenOffCoins)}` : `${formatCoins(writtenOffCoins)} written off`) : "",
        creditedCoins > 0 ? (isRu ? `начислено ${formatCoins(creditedCoins)}` : `${formatCoins(creditedCoins)} credited`) : ""
      ].filter(Boolean);

      setManagerStatus(
        coinNotes.length > 0
          ? isRu
            ? `Заявка обновлена: ${coinNotes.join(", ")}.`
            : `Request updated: ${coinNotes.join(", ")}.`
          : isRu
            ? "Заявка обновлена. Клиент увидит новый статус на этой странице."
            : "Request updated. Client will see the new status on this page."
      );
    } finally {
      savingOrderRef.current = false;
      setSavingOrder(false);
    }
  }

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (sendingRef.current) {
      return;
    }

    const text = message.trim();
    if ((!text && !attachmentFile) || !user?.uid || !profile || !lead) {
      return;
    }

    sendingRef.current = true;
    setSending(true);
    setManagerStatus("");

    try {
      const threadId = canManageOrder ? await ensureManagerThread() : lead.threadId;

      if (!threadId) {
        return;
      }

      const uploadedAttachment = attachmentFile ? await uploadOrderImage(attachmentFile) : null;
      const lastMessageText = text || (isRu ? "Скриншот" : "Screenshot");

      await setDoc(
        doc(db, "directThreads", threadId),
        {
          participants: arrayUnion(...[lead.uid, lead.managerUid, user.uid].filter(Boolean)),
          topupLeadIds: arrayUnion(lead.id),
          lastMessageText,
          lastMessageUid: user.uid,
          lastMessageAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );

      await addDoc(collection(db, "directThreads", threadId, "messages"), {
        uid: user.uid,
        displayName: profile.displayName || "Raid Player",
        text,
        topupLeadId: lead.id,
        attachment: uploadedAttachment
          ? {
              publicId: uploadedAttachment.publicId,
              secureUrl: uploadedAttachment.secureUrl,
              url: uploadedAttachment.url ?? uploadedAttachment.secureUrl,
              alt: attachmentFile?.name ?? "Order screenshot"
            }
          : null,
        createdAt: serverTimestamp()
      });

      setMessage("");
      setAttachmentFile(null);
    } finally {
      sendingRef.current = false;
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
    <>
      <button
        type="button"
        onClick={() => {
          if (window.history.length > 1) {
            router.back();
            return;
          }

          router.push("/dashboard");
        }}
        className="mb-4 inline-flex items-center gap-2 rounded-xl border border-relic/35 bg-black/45 px-4 py-2 text-sm font-bold text-relic shadow-[0_0_22px_rgba(47,124,255,0.12)] transition hover:border-relic hover:bg-relic/10 hover:text-[#b8d7ff]"
      >
        <ArrowLeft size={16} />
        {isRu ? "Назад" : "Back"}
      </button>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <GlassPanel className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-bold tracking-[0.18em] text-relic">{isRu ? "Заказ RAID" : "RAID order"}</p>
              <h2 className="mt-2 text-3xl font-black text-white">
                {lead.packageName || lead.packageId || (isRu ? "Заявка на игровой набор" : "Game pack request")}
              </h2>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusTone}`}>{activeLabel}</span>
          </div>

          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {isRu
              ? "Заявка теперь работает как рабочий диалог с менеджером: детали заказа, сумма и Bumpy Coins обновляются здесь."
              : "This request now works as a manager workspace: order details, amount and Bumpy Coins are updated here."}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-bold tracking-[0.14em] text-zinc-500">{isRu ? "Сумма" : "Amount"}</p>
              <p className="mt-2 text-2xl font-black text-white">{formatRub(lead.amountRub)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-bold tracking-[0.14em] text-zinc-500">{isRu ? "Списано" : "Written off"}</p>
              <p className="mt-2 text-2xl font-black text-sky-300">{formatCoins(lead.bumpyCoinsWrittenOffTotal)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-bold tracking-[0.14em] text-zinc-500">{isRu ? "Начислено" : "Credited"}</p>
              <p className="mt-2 text-2xl font-black text-emerald-300">{formatCoins(lead.bumpyCoinsCreditedTotal)}</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-bold tracking-[0.14em] text-zinc-500">{isRu ? "Информация для клиента" : "Client information"}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                {lead.paymentDetails || lead.managerNote || (isRu ? "Менеджер ответит в диалоге и добавит детали заказа." : "Manager will answer in the dialog and add order details.")}
              </p>
            </div>

            {lead.comment ? (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs font-bold tracking-[0.14em] text-zinc-500">{isRu ? "Комментарий клиента" : "Client comment"}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{lead.comment}</p>
              </div>
            ) : null}

            {lead.screenshotUrl ? (
              <button
                type="button"
                onClick={() => setImagePreview({ url: lead.screenshotUrl || "", alt: isRu ? "Скриншот заявки" : "Request screenshot" })}
                className="w-full rounded-2xl border border-relic/20 bg-relic/10 p-4 text-left text-sm font-bold text-relic transition hover:border-relic/45 hover:bg-relic/15"
              >
                {isRu ? "Открыть прикрепленный скриншот клиента" : "Open client screenshot"}
              </button>
            ) : null}
          </div>

          {canManageOrder ? (
            <div className="mt-5 rounded-2xl border border-relic/24 bg-[#070d16]/88 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-relic/35 bg-relic/10 text-relic">
                    <CreditCard size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-bold tracking-[0.16em] text-relic">{isRu ? "Панель менеджера" : "Manager panel"}</p>
                    <h3 className="font-bold text-white">{isRu ? "Решение по заявке" : "Request decision"}</h3>
                  </div>
                </div>
                <span className="rounded-xl border border-sky-400/25 bg-sky-400/10 px-3 py-2 text-xs font-black text-sky-200">
                  {isRu ? "Доступно" : "Available"}: {formatCoins(clientCoinsBalance)}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                  <p className="text-xs text-zinc-500">{isRu ? "Баланс клиента" : "Client balance"}</p>
                  <p className="mt-1 text-lg font-black text-white">{formatCoins(clientCoinsBalance)}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                  <p className="text-xs text-zinc-500">{isRu ? "Всего начислено" : "Total earned"}</p>
                  <p className="mt-1 text-lg font-black text-emerald-300">{formatCoins(clientCoinsEarned)}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/25 p-3">
                  <p className="text-xs text-zinc-500">{isRu ? "Всего списано" : "Total spent"}</p>
                  <p className="mt-1 text-lg font-black text-sky-300">{formatCoins(clientCoinsSpent)}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold tracking-[0.14em] text-zinc-500">{isRu ? "Сумма заказа" : "Order amount"}</span>
                  <input
                    value={managerDraft.amountRub}
                    onChange={(event) => setManagerDraft((current) => ({ ...current, amountRub: event.target.value }))}
                    className="mt-2 w-full rounded-xl border-white/10 bg-black/35 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
                    placeholder="0"
                    inputMode="numeric"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold tracking-[0.14em] text-zinc-500">{isRu ? "Списать Bumpy Coins" : "Write off Bumpy Coins"}</span>
                  <input
                    value={managerDraft.writeOffBumpyCoins}
                    onChange={(event) => setManagerDraft((current) => ({ ...current, writeOffBumpyCoins: event.target.value }))}
                    disabled={!hasLinkedClient}
                    className="mt-2 w-full rounded-xl border-white/10 bg-black/35 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic disabled:cursor-not-allowed disabled:opacity-45"
                    placeholder={isRu ? `до ${clientCoinsBalance}` : `up to ${clientCoinsBalance}`}
                    inputMode="numeric"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold tracking-[0.14em] text-zinc-500">{isRu ? "Начислить Bumpy Coins" : "Credit Bumpy Coins"}</span>
                  <input
                    value={managerDraft.creditBumpyCoins}
                    onChange={(event) => setManagerDraft((current) => ({ ...current, creditBumpyCoins: event.target.value }))}
                    disabled={!hasLinkedClient}
                    className="mt-2 w-full rounded-xl border-white/10 bg-black/35 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic disabled:cursor-not-allowed disabled:opacity-45"
                    placeholder="0"
                    inputMode="numeric"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold tracking-[0.14em] text-zinc-500">{isRu ? "Реквизиты / оплата" : "Payment details"}</span>
                  <input
                    value={managerDraft.paymentDetails}
                    onChange={(event) => setManagerDraft((current) => ({ ...current, paymentDetails: event.target.value }))}
                    className="mt-2 w-full rounded-xl border-white/10 bg-black/35 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
                    placeholder={isRu ? "Ссылка, карта или короткая инструкция" : "Link, card or short instruction"}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs font-bold tracking-[0.14em] text-zinc-500">{isRu ? "Заметка клиенту" : "Client note"}</span>
                  <textarea
                    value={managerDraft.managerNote}
                    onChange={(event) => setManagerDraft((current) => ({ ...current, managerNote: event.target.value }))}
                    rows={3}
                    className="mt-2 w-full rounded-xl border-white/10 bg-black/35 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
                    placeholder={isRu ? "Что клиент увидит на странице заявки" : "What client will see on this request page"}
                  />
                </label>
              </div>

              {!hasLinkedClient ? (
                <p className="mt-3 rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-2 text-xs font-semibold leading-5 text-amber-100">
                  {isRu
                    ? "Это ручная заявка без аккаунта на сайте. Диалог и операции Bumpy Coins для нее недоступны."
                    : "This is a manual request without a linked site account. Chat and Bumpy Coins operations are unavailable."}
                </p>
              ) : null}

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => void saveOrderPanel()}
                  disabled={savingOrder}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-relic/35 bg-relic/10 px-4 py-3 font-black text-relic transition hover:bg-relic/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save size={17} />
                  {savingOrder ? (isRu ? "Сохраняю..." : "Saving...") : isRu ? "Сохранить" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => void saveOrderPanel("completed")}
                  disabled={savingOrder}
                  className="rounded-xl bg-emerald-400 px-4 py-3 font-black text-black transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isRu ? "Завершить" : "Complete"}
                </button>
                <button
                  type="button"
                  onClick={() => void saveOrderPanel("cancelled")}
                  disabled={savingOrder}
                  className="rounded-xl border border-red-400/35 bg-red-400/10 px-4 py-3 font-black text-red-200 transition hover:bg-red-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isRu ? "Отменить" : "Cancel"}
                </button>
              </div>
            </div>
          ) : null}
        </GlassPanel>

        <GlassPanel className="flex h-[680px] max-h-[calc(100vh-140px)] flex-col p-5 sm:h-[760px] sm:p-6 xl:sticky xl:top-6">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-relic/35 bg-relic/10 text-relic">
              <MessageCircle size={19} />
            </span>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-relic">{isRu ? "Диалог по заявке" : "Request dialog"}</p>
              <h3 className="text-xl font-black text-white">{isRu ? "Связь с менеджером" : "Manager chat"}</h3>
            </div>
          </div>

          {!lead.threadId && !canManageOrder ? (
            <div className="grid flex-1 place-items-center rounded-2xl border border-white/10 bg-black/25 p-5 text-center text-sm leading-6 text-zinc-400">
              <div>
                <ShieldCheck className="mx-auto mb-3 text-relic" />
                {isRu ? "Менеджер будет назначен после проверки заявки." : "Manager will be assigned after request review."}
              </div>
            </div>
          ) : (
            <>
              <div ref={messagesRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain rounded-2xl border border-white/10 bg-black/25 p-4">
                {messages.map((item) => {
                  const own = item.uid === user?.uid;
                  const attachmentUrl = item.attachment?.secureUrl ?? item.attachment?.url;
                  const attachmentAlt = item.attachment?.alt ?? "Order screenshot";

                  return (
                    <div key={item.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[84%] rounded-2xl border px-4 py-3 ${own ? "border-relic/30 bg-relic/20" : "border-white/10 bg-white/[0.05]"}`}>
                        <p className="text-xs font-bold text-relic">{own ? (isRu ? "Вы" : "You") : item.displayName || (isRu ? "Менеджер" : "Manager")}</p>
                        {attachmentUrl ? (
                          <button
                            type="button"
                            onClick={() => setImagePreview({ url: attachmentUrl, alt: attachmentAlt })}
                            className="mt-2 block overflow-hidden rounded-xl border border-white/10"
                          >
                            <img src={attachmentUrl} alt={attachmentAlt} loading="lazy" decoding="async" className="max-h-52 w-full object-cover" />
                          </button>
                        ) : null}
                        {item.text ? <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-white">{item.text}</p> : null}
                        <p className="mt-2 text-right text-[11px] text-zinc-500">{formatDate(item.createdAt?.seconds, isRu)}</p>
                      </div>
                    </div>
                  );
                })}
                {messages.length === 0 ? (
                  <div className="grid h-full min-h-[260px] place-items-center text-center text-sm leading-6 text-zinc-500">
                    {isRu ? "Сообщений пока нет. Напишите по заявке или прикрепите скриншот." : "No messages yet. Send a request message or attach a screenshot."}
                  </div>
                ) : null}
              </div>

              {attachmentFile ? (
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-relic/20 bg-black/35 p-3 text-xs text-zinc-300">
                  {attachmentPreviewUrl ? <img src={attachmentPreviewUrl} alt={attachmentFile.name} loading="lazy" decoding="async" className="h-16 w-16 rounded-xl object-cover" /> : null}
                  <div className="min-w-0 flex-1">
                    <p className="break-words font-semibold text-white">{attachmentFile.name}</p>
                    <p className="text-zinc-500">{isRu ? "Скриншот будет отправлен вместе с сообщением." : "Screenshot will be sent with the message."}</p>
                  </div>
                  <button type="button" onClick={() => setAttachmentFile(null)} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-zinc-400 hover:text-white">
                    <X size={15} />
                  </button>
                </div>
              ) : null}

              <form onSubmit={sendMessage} onPaste={handlePasteImage} className="mt-4 flex items-center gap-2">
                <label className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl border border-white/10 bg-black/35 text-relic transition hover:border-relic/35 hover:bg-relic/10">
                  <ImagePlus size={18} />
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => applySelectedFile(event.target.files?.[0])} />
                </label>
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={isRu ? "Написать сообщение" : "Write a message"}
                  className="h-11 min-w-0 flex-1 rounded-xl border-white/10 bg-black/35 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
                />
                <button
                  disabled={!canSend}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-relic text-black transition hover:bg-[#8bbcff] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={isRu ? "Отправить" : "Send"}
                >
                  <Send size={18} />
                </button>
              </form>
            </>
          )}

          {managerStatus ? <p className="mt-3 rounded-xl border border-relic/20 bg-relic/[0.08] p-3 text-sm text-zinc-300">{managerStatus}</p> : null}
        </GlassPanel>
      </div>

      {imagePreview ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="relative max-h-[92vh] max-w-5xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b101b] shadow-2xl">
            <button
              type="button"
              onClick={() => setImagePreview(null)}
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-black/60 text-zinc-300 transition hover:text-white"
              aria-label={isRu ? "Закрыть изображение" : "Close image"}
            >
              <X size={18} />
            </button>
            <img src={imagePreview.url} alt={imagePreview.alt} loading="eager" decoding="async" className="max-h-[92vh] w-full object-contain" />
          </div>
        </div>
      ) : null}
    </>
  );
}
