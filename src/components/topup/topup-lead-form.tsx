"use client";

import Link from "next/link";
import { Camera, CreditCard, MessageCircle, Paperclip, Send, ShieldCheck, Timer, WalletCards, X } from "lucide-react";
import { addDoc, collection, doc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { GlassPanel } from "@/components/ui/glass-panel";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { useLanguage } from "@/lib/i18n/use-language";

const donationPackages = [
  { id: "monthly-rubies", ru: "Рубины на месяц", en: "Monthly Rubies", priceRub: 900, tag: "best start" },
  { id: "monthly-pack-small", ru: "Ежемесячный набор", en: "Monthly Pack", priceRub: 2700, tag: "daily value" },
  { id: "forge-pass-base", ru: "Пропуск кузни без уровней", en: "Forge Pass", priceRub: 1800, tag: "forge" },
  { id: "energy-day", ru: "Энергичный набор дня", en: "Energy Day Pack", priceRub: 1800, tag: "energy" },
  { id: "forge-pass-25", ru: "Пропуск кузни +25 уровней", en: "Forge Pass +25", priceRub: 3600, tag: "fast pass" },
  { id: "monthly-pack-big", ru: "Ежемесячный набор XL", en: "Monthly Pack XL", priceRub: 4500, tag: "premium" },
  { id: "rebirth-path", ru: "Путь возрождения", en: "Path of Rebirth", priceRub: 1800, tag: "event" },
  { id: "hero-pass-predator", ru: "Пропуск героя: Хищник", en: "Hero Pass: Predator", priceRub: 3600, tag: "hero pass" }
];

const MAX_SCREENSHOT_SIZE = 6 * 1024 * 1024;

const copy = {
  ru: {
    title: "Заявка на донат",
    subtitle: "Форма отправляет заявку менеджеру через подключенный webhook.",
    telegram: "Telegram",
    package: "Набор",
    payment: "Оплата",
    manager: "Через менеджера",
    comment: "Комментарий",
    screenshot: "Скриншот",
    screenshotHint: "PNG, JPG или WEBP до 6 МБ",
    screenshotTooLarge: "Скриншот должен быть до 6 МБ.",
    directTelegram: "Написать менеджеру в Telegram",
    placeholder: "Прикреплю скриншот магазина, нужен этот набор сегодня...",
    sending: "Отправка...",
    submit: "Отправить заявку",
    sent: "Заявка отправлена. Менеджер получит уведомление.",
    error: "Не удалось отправить заявку. Проверь webhook URL и активность workflow.",
    from: "от",
    rub: "₽"
  },
  en: {
    title: "Donation request",
    subtitle: "The form sends a request to the manager through your connected webhook.",
    telegram: "Telegram",
    package: "Pack",
    payment: "Payment",
    manager: "Manager assisted",
    comment: "Comment",
    screenshot: "Screenshot",
    screenshotHint: "PNG, JPG or WEBP up to 6 MB",
    screenshotTooLarge: "Screenshot must be 6 MB or smaller.",
    directTelegram: "Message manager in Telegram",
    placeholder: "I will attach a shop screenshot, need this pack today...",
    sending: "Sending...",
    submit: "Send request",
    sent: "Request sent. Manager will receive it.",
    error: "Could not send request. Check webhook URL and workflow status.",
    from: "from",
    rub: "RUB"
  }
};

type ManagerProfile = {
  uid: string;
  email: string;
  displayName?: string;
  role?: string;
};

type UploadedScreenshot = {
  publicId: string;
  secureUrl: string;
  url?: string;
};

function directThreadId(firstUid: string, secondUid: string) {
  return [firstUid, secondUid].sort().join("__");
}

async function findManager() {
  const usersSnapshot = await getDocs(query(collection(db, collections.users), where("status", "==", "active")));
  const managers = usersSnapshot.docs
    .map((item) => item.data() as ManagerProfile)
    .filter((item) => item.role === "owner" || item.role === "admin")
    .sort((a, b) => {
      if (a.role === b.role) {
        return (a.email ?? "").localeCompare(b.email ?? "");
      }

      return a.role === "owner" ? -1 : 1;
    });

  return managers[0] ?? null;
}

export function TopupLeadForm() {
  const { language, isRu } = useLanguage();
  const { user } = useAuth();
  const t = copy[language];
  const [telegram, setTelegram] = useState("");
  const [packageId, setPackageId] = useState(donationPackages[0].id);
  const [paymentMethod, setPaymentMethod] = useState("manager");
  const [comment, setComment] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [activeManagerUid, setActiveManagerUid] = useState("");
  const managerTelegramUrl = process.env.NEXT_PUBLIC_MANAGER_TELEGRAM_URL ?? "";

  const selectedPackage = useMemo(
    () => donationPackages.find((item) => item.id === packageId) ?? donationPackages[0],
    [packageId]
  );

  const serviceSteps = [
    { Icon: Camera, label: isRu ? "Скриншот набора" : "Pack screenshot" },
    { Icon: CreditCard, label: isRu ? "Счёт менеджера" : "Manager invoice" },
    { Icon: Timer, label: isRu ? "5-10 минут без очереди" : "5-10 min if no queue" }
  ];

  function updateScreenshot(file: File | null) {
    setFileError("");

    if (!file) {
      setScreenshotFile(null);
      return;
    }

    if (file.size > MAX_SCREENSHOT_SIZE) {
      setScreenshotFile(null);
      setFileError(t.screenshotTooLarge);
      return;
    }

    setScreenshotFile(file);
  }

  async function uploadScreenshot(file: File): Promise<UploadedScreenshot> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "topup");

    const response = await fetch("/api/cloudinary/upload", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error("Screenshot upload failed");
    }

    return (await response.json()) as UploadedScreenshot;
  }

  async function submitLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user?.uid) {
      setStatus("error");
      return;
    }

    setStatus("sending");

    try {
      const manager = await findManager();
      setActiveManagerUid(manager?.uid ?? "");
      const topupRef = doc(collection(db, collections.topupLeads));
      const threadId = manager ? directThreadId(user.uid, manager.uid) : "";
      const screenshot = screenshotFile ? await uploadScreenshot(screenshotFile) : null;
      const payload = {
        uid: user.uid,
        leadId: topupRef.id,
        managerUid: manager?.uid ?? "",
        threadId,
        telegram,
        packageId,
        packageName: isRu ? selectedPackage.ru : selectedPackage.en,
        amountRub: selectedPackage.priceRub,
        paymentMethod,
        comment,
        screenshotUrl: screenshot?.secureUrl ?? "",
        screenshotPublicId: screenshot?.publicId ?? "",
        screenshotName: screenshotFile?.name ?? "",
        status: "new",
        source: "portal"
      };

      await setDoc(topupRef, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      if (manager) {
        await setDoc(
          doc(db, "directThreads", threadId),
          {
            participants: [user.uid, manager.uid],
            participantEmails: [user.email ?? "", manager.email],
            topupLeadIds: [topupRef.id],
            lastMessageText: `Donation request: ${payload.packageName}`,
            lastMessageAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );

        await addDoc(collection(db, "directThreads", threadId, "messages"), {
          uid: user.uid,
          displayName: user.email ?? telegram,
          text: `Donation request sent.\nPack: ${payload.packageName}\nPayment: ${paymentMethod}\nComment: ${comment || "-"}\nScreenshot: ${payload.screenshotUrl || "-"}`,
          topupLeadId: topupRef.id,
          attachment: screenshot
            ? {
                publicId: screenshot.publicId,
                secureUrl: screenshot.secureUrl,
                url: screenshot.url ?? screenshot.secureUrl,
                alt: screenshotFile?.name ?? "Donation screenshot"
              }
            : null,
          createdAt: serverTimestamp()
        });
      }

      const response = await fetch("/api/n8n/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("webhook rejected request");
      }

      setStatus("sent");
      setScreenshotFile(null);
      setFileError("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <GlassPanel className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="rounded-lg bg-relic/15 p-3 text-relic">
          <WalletCards />
        </span>
        <div>
          <h2 className="text-2xl font-bold text-white">{t.title}</h2>
          <p className="text-sm text-zinc-400">{t.subtitle}</p>
        </div>
      </div>

      {!user ? (
        <div className="mb-5 rounded-lg border border-relic/25 bg-relic/[0.08] p-4 text-sm leading-6 text-zinc-300">
          <p>
            {isRu
              ? "Для заявки нужно войти в аккаунт. После отправки менеджер сможет ответить вам в личном чате на сайте."
              : "Sign in to send a request. After submitting it, the manager can reply in your private site chat."}
          </p>
          <Link href="/login" className="mt-3 inline-flex rounded-md bg-relic px-4 py-2 font-bold text-black">
            {isRu ? "Войти" : "Sign in"}
          </Link>
        </div>
      ) : null}

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        {serviceSteps.map(({ Icon, label }) => (
          <div key={label} className="rounded-lg border border-white/10 bg-black/25 p-3 text-sm text-zinc-300">
            <Icon className="mb-2 text-relic" size={18} />
            {label}
          </div>
        ))}
      </div>

      <form className="space-y-4" onSubmit={submitLead}>
        <label className="block space-y-2">
          <span className="text-sm text-zinc-300">{t.telegram}</span>
          <input
            required
            value={telegram}
            onChange={(event) => setTelegram(event.target.value)}
            placeholder="@username"
            className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block space-y-2">
            <span className="text-sm text-zinc-300">{t.package}</span>
            <select
              value={packageId}
              onChange={(event) => setPackageId(event.target.value)}
              className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
            >
              {donationPackages.map((pack) => (
                <option key={pack.id} value={pack.id}>
                  {isRu ? pack.ru : pack.en} - {t.from} {pack.priceRub.toLocaleString("ru-RU")} {t.rub}
                </option>
              ))}
            </select>
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-zinc-300">{t.payment}</span>
            <select
              value={paymentMethod}
              onChange={(event) => setPaymentMethod(event.target.value)}
              className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
            >
              <option value="manager">{t.manager}</option>
            </select>
          </label>
        </div>

        <label className="block space-y-2">
          <span className="text-sm text-zinc-300">{t.comment}</span>
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            rows={4}
            placeholder={t.placeholder}
            className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
          />
        </label>

        <div className="rounded-lg border border-relic/20 bg-black/20 p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-white">{t.screenshot}</p>
              <p className="text-xs text-zinc-500">{t.screenshotHint}</p>
            </div>
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-md border border-relic/30 px-4 py-2 text-sm font-semibold text-relic transition hover:border-relic hover:bg-relic/10">
              <Paperclip size={16} />
              {screenshotFile ? screenshotFile.name : t.screenshot}
              <input
                key={screenshotFile?.name ?? "empty"}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(event) => updateScreenshot(event.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          {screenshotFile ? (
            <div className="mt-3 flex items-center justify-between rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-zinc-300">
              <span className="min-w-0 truncate">{screenshotFile.name}</span>
              <button
                type="button"
                className="ml-3 rounded-full p-1 text-zinc-400 transition hover:bg-white/10 hover:text-white"
                onClick={() => updateScreenshot(null)}
                aria-label="Remove screenshot"
              >
                <X size={14} />
              </button>
            </div>
          ) : null}

          {fileError ? <p className="mt-2 text-xs text-ember">{fileError}</p> : null}
        </div>

        <button
          disabled={status === "sending" || !user}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-relic px-4 py-3 font-semibold text-black transition hover:bg-[#f0c766] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={18} />
          {status === "sending" ? t.sending : t.submit}
        </button>

        {managerTelegramUrl ? (
          <a
            href={managerTelegramUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-relic/35 px-4 py-3 font-semibold text-relic transition hover:border-relic hover:bg-relic/10"
          >
            <MessageCircle size={18} />
            {t.directTelegram}
          </a>
        ) : null}

        {status === "sent" ? (
          <p className="rounded-md border border-relic/20 bg-relic/[0.08] px-3 py-2 text-sm text-relic">
            {t.sent}
            {activeManagerUid ? (
              <Link className="ml-2 font-bold underline underline-offset-4" href={`/chat?user=${activeManagerUid}`}>
                {isRu ? "Открыть чат" : "Open chat"}
              </Link>
            ) : null}
          </p>
        ) : null}
        {status === "error" ? (
          <p className="rounded-md border border-blood/30 bg-blood/20 px-3 py-2 text-sm text-ember">
            {t.error}
          </p>
        ) : null}
      </form>

      <div className="mt-5 flex items-start gap-2 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-sm leading-6 text-zinc-400">
        <ShieldCheck className="mt-0.5 shrink-0 text-relic" size={18} />
        {isRu
          ? "Данные заявки передаются только менеджеру для покупки доступных в игровом магазине наборов."
          : "Request data is shared only with the manager to buy packs available in the in-game shop."}
      </div>
    </GlassPanel>
  );
}

export { donationPackages };
