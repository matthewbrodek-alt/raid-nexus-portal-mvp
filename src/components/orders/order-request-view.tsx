"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Clock,
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
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc
} from "firebase/firestore";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { GlassPanel } from "@/components/ui/glass-panel";
import { normalizeOrderStage, orderStages, type OrderStageId } from "@/lib/bp-status";
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
};

type OrderRequestViewProps = {
  leadId: string;
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

const visibleStages: OrderStageId[] = ["new", "payment", "in_progress", "completed"];

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
    managerNote: lead?.managerNote ?? ""
  };
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
  const [savingOrder, setSavingOrder] = useState(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const canManageOrder = profile?.role === "admin" || profile?.role === "owner";
  const activeStage = normalizeOrderStage(lead?.status);
  const activeIndex = activeStage === "cancelled" ? -1 : visibleStages.indexOf(activeStage);
  const activeLabel = stageCopy[activeStage][isRu ? "ru" : "en"];
  const canSend = Boolean(user?.uid && profile && (lead?.threadId || (canManageOrder && lead?.uid)) && (message.trim() || attachmentFile)) && !sending;

  const progressPercent = useMemo(() => {
    if (activeStage === "cancelled") {
      return 0;
    }

    return Math.max(0, Math.min(100, ((activeIndex + 1) / visibleStages.length) * 100));
  }, [activeIndex, activeStage]);

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
    if (!attachmentFile) {
      setAttachmentPreviewUrl("");
      return;
    }

    const objectUrl = URL.createObjectURL(attachmentFile);
    setAttachmentPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [attachmentFile]);

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

  async function saveOrderPanel() {
    if (!lead || !canManageOrder || !user?.uid) {
      return;
    }

    setSavingOrder(true);
    setManagerStatus("");

    try {
      const amountRub = Number(managerDraft.amountRub.replace(/[^\d.]/g, ""));
      const safeAmountRub = Number.isFinite(amountRub) ? amountRub : 0;
      const nextStatus = managerDraft.status;
      const currentStatus = normalizeOrderStage(lead.status);

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

      setManagerStatus(isRu ? "Заявка обновлена. Клиент увидит новый статус на этой странице." : "Request updated. Client will see the new status on this page.");
    } finally {
      setSavingOrder(false);
    }
  }

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = message.trim();
    if ((!text && !attachmentFile) || !user?.uid || !profile || !lead) {
      return;
    }

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
        className="mb-4 inline-flex items-center gap-2 rounded-xl border border-relic/35 bg-black/45 px-4 py-2 text-sm font-bold text-relic shadow-[0_0_22px_rgba(200,154,61,0.12)] transition hover:border-relic hover:bg-relic/10 hover:text-[#f4d784]"
      >
        <ArrowLeft size={16} />
        {isRu ? "Назад" : "Back"}
      </button>

      <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <GlassPanel className="p-5 sm:p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-relic">{isRu ? "Игровой заказ RAID" : "RAID game order"}</p>
          <h2 className="mt-2 font-[var(--font-cinzel)] text-3xl font-black text-white">
            {lead.packageName || lead.packageId || (isRu ? "Заявка на донат" : "Donation request")}
          </h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {isRu
              ? "Здесь собраны этапы заказа, сумма, детали оплаты и переписка по конкретной заявке."
              : "This page contains order stages, amount, payment details and request-specific communication."}
          </p>

          <div className="mt-6 rounded-2xl border border-relic/20 bg-black/25 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-white">{isRu ? "Прогресс заказа" : "Order progress"}</span>
              <span className="rounded-full border border-relic/30 bg-relic/10 px-3 py-1 text-xs font-bold text-relic">{activeLabel}</span>
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
                    <p className="mt-1 text-xs leading-5 text-zinc-500">{stageCopy[stage][isRu ? "hintRu" : "hintEn"]}</p>
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
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{isRu ? "Сумма заказа" : "Amount"}</p>
              <p className="mt-2 font-bold text-white">{(lead.amountRub ?? 0).toLocaleString("ru-RU")} ₽</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-4 sm:col-span-2">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{isRu ? "Оплата и информация от менеджера" : "Payment and manager information"}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                {lead.paymentDetails || lead.managerNote || (isRu ? "Менеджер скоро добавит детали заказа." : "Manager will add order details soon.")}
              </p>
            </div>
            {lead.comment ? (
              <div className="rounded-xl border border-white/10 bg-black/20 p-4 sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{isRu ? "Комментарий клиента" : "Client comment"}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{lead.comment}</p>
              </div>
            ) : null}
            {lead.screenshotUrl ? (
              <button
                type="button"
                onClick={() => setImagePreview({ url: lead.screenshotUrl || "", alt: isRu ? "Скриншот заявки" : "Request screenshot" })}
                className="rounded-xl border border-relic/20 bg-relic/10 p-4 text-left text-sm font-bold text-relic sm:col-span-2"
              >
                {isRu ? "Открыть прикрепленный скриншот" : "Open attached screenshot"}
              </button>
            ) : null}
          </div>

          {canManageOrder ? (
            <div className="mt-5 rounded-2xl border border-relic/24 bg-[#070d16]/88 p-4">
              <div className="mb-4 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-relic/35 bg-relic/10 text-relic">
                  <CreditCard size={18} />
                </span>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-relic">{isRu ? "Панель менеджера" : "Manager panel"}</p>
                  <h3 className="font-bold text-white">{isRu ? "Статус, сумма и реквизиты" : "Status, amount and payment details"}</h3>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {orderStages.map((stage) => (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => setManagerDraft((current) => ({ ...current, status: stage.id }))}
                    className={`rounded-xl border px-3 py-3 text-left transition ${
                      managerDraft.status === stage.id
                        ? "border-relic bg-relic/15 text-white shadow-[0_0_18px_rgba(200,154,61,0.14)]"
                        : "border-white/10 bg-black/25 text-zinc-400 hover:border-relic/35 hover:text-white"
                    }`}
                  >
                    <span className="text-sm font-black">{stageCopy[stage.id][isRu ? "ru" : "en"]}</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">{isRu ? "Сумма в BP-статус" : "BP amount"}</span>
                  <input
                    value={managerDraft.amountRub}
                    onChange={(event) => setManagerDraft((current) => ({ ...current, amountRub: event.target.value }))}
                    className="mt-2 w-full rounded-xl border-white/10 bg-black/35 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
                    placeholder="0"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">{isRu ? "Реквизиты / ссылка оплаты" : "Payment link/details"}</span>
                  <input
                    value={managerDraft.paymentDetails}
                    onChange={(event) => setManagerDraft((current) => ({ ...current, paymentDetails: event.target.value }))}
                    className="mt-2 w-full rounded-xl border-white/10 bg-black/35 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
                    placeholder={isRu ? "Ссылка, карта, комментарий по оплате" : "Link, card, payment comment"}
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">{isRu ? "Сообщение клиенту / заметка" : "Client note"}</span>
                  <textarea
                    value={managerDraft.managerNote}
                    onChange={(event) => setManagerDraft((current) => ({ ...current, managerNote: event.target.value }))}
                    rows={3}
                    className="mt-2 w-full rounded-xl border-white/10 bg-black/35 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
                    placeholder={isRu ? "Что клиент должен увидеть на странице заявки" : "What client should see on the request page"}
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={() => void saveOrderPanel()}
                disabled={savingOrder}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-relic px-4 py-3 font-black text-black transition hover:bg-[#f0c766] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save size={17} />
                {savingOrder ? (isRu ? "Сохраняю..." : "Saving...") : isRu ? "Сохранить статус заявки" : "Save request status"}
              </button>
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
                            <img src={attachmentUrl} alt={attachmentAlt} className="max-h-52 w-full object-cover" />
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
                  {attachmentPreviewUrl ? <img src={attachmentPreviewUrl} alt={attachmentFile.name} className="h-16 w-16 rounded-xl object-cover" /> : null}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-white">{attachmentFile.name}</p>
                    <p className="text-zinc-500">{isRu ? "Скриншот будет отправлен вместе с сообщением." : "Screenshot will be sent with the message."}</p>
                  </div>
                  <button type="button" onClick={() => setAttachmentFile(null)} className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-zinc-400 hover:text-white">
                    <X size={15} />
                  </button>
                </div>
              ) : null}

              <form onSubmit={sendMessage} onPaste={handlePasteImage} className="mt-4 flex gap-2">
                <label className="grid h-11 w-11 shrink-0 cursor-pointer place-items-center rounded-xl border border-white/10 bg-black/35 text-relic transition hover:border-relic/35 hover:bg-relic/10">
                  <ImagePlus size={18} />
                  <input type="file" accept="image/*" className="hidden" onChange={(event) => applySelectedFile(event.target.files?.[0])} />
                </label>
                <input
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder={isRu ? "Сообщение по заявке..." : "Request message..."}
                  className="min-w-0 flex-1 rounded-xl border-white/10 bg-black/35 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
                />
                <button
                  disabled={!canSend}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-relic text-black transition hover:bg-[#f2cf78] disabled:cursor-not-allowed disabled:opacity-50"
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
            <img src={imagePreview.url} alt={imagePreview.alt} className="max-h-[92vh] w-full object-contain" />
          </div>
        </div>
      ) : null}
    </>
  );
}
