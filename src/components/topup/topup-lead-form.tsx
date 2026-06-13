"use client";

import Link from "next/link";
import { Paperclip, Send, WalletCards, X } from "lucide-react";
import { addDoc, collection, doc, getDocs, increment, query, serverTimestamp, setDoc, where, writeBatch } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useDonationOffers } from "@/components/donate/use-donation-offers";
import { GlassPanel } from "@/components/ui/glass-panel";
import { getClipboardImageFile } from "@/lib/browser/clipboard-image";
import { getDonationOfferTitle } from "@/lib/donation/offers";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { useLanguage } from "@/lib/i18n/use-language";
import { BUMPY_COINS_DISCOUNT_CAP } from "@/lib/referrals";

const MAX_SCREENSHOT_SIZE = 6 * 1024 * 1024;

const copy = {
  ru: {
    title: "Написать менеджеру",
    subtitle: "Выберите набор, добавьте комментарий и отправьте заявку. Ответ будет на странице заказа.",
    package: "Набор",
    comment: "Комментарий",
    screenshot: "Скриншот",
    screenshotHint: "PNG, JPG или WEBP до 6 МБ",
    screenshotTooLarge: "Скриншот должен быть до 6 МБ.",
    placeholder: "Нужен этот набор сегодня, скриншот приложил...",
    sending: "Отправка...",
    submit: "Отправить заявку",
    sent: "Заявка отправлена. Откроется страница заказа.",
    error: "Не удалось сохранить заявку. Проверь вход в аккаунт и доступ к базе.",
    noPackages: "Наборы появятся после добавления в админ-панели.",
    from: "от",
    rub: "₽"
  },
  en: {
    title: "Message manager",
    subtitle: "Choose a pack, add a comment and send the request. The reply appears on the order page.",
    package: "Pack",
    comment: "Comment",
    screenshot: "Screenshot",
    screenshotHint: "PNG, JPG or WEBP up to 6 MB",
    screenshotTooLarge: "Screenshot must be 6 MB or smaller.",
    placeholder: "Need this pack today, screenshot attached...",
    sending: "Sending...",
    submit: "Send request",
    sent: "Request sent. The order page will open.",
    error: "Could not save request. Check your account session and database access.",
    noPackages: "Packs will appear after they are added in the admin panel.",
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

type TopupLeadFormProps = {
  selectedPackageId?: string;
};

export function TopupLeadForm({ selectedPackageId }: TopupLeadFormProps = {}) {
  const { language, isRu } = useLanguage();
  const { profile, user } = useAuth();
  const router = useRouter();
  const donationOffers = useDonationOffers();
  const t = copy[language];
  const [packageId, setPackageId] = useState(selectedPackageId ?? "");
  const [comment, setComment] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [useBumpyCoins, setUseBumpyCoins] = useState(false);
  const [fileError, setFileError] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [activeManagerUid, setActiveManagerUid] = useState("");
  const submittingRef = useRef(false);

  useEffect(() => {
    if (selectedPackageId) {
      setPackageId(selectedPackageId);
    }
  }, [selectedPackageId]);

  useEffect(() => {
    if (selectedPackageId) {
      return;
    }

    if (donationOffers.length > 0 && (!packageId || !donationOffers.some((item) => item.id === packageId))) {
      setPackageId(donationOffers[0].id);
    }
  }, [donationOffers, packageId, selectedPackageId]);

  const selectedPackage = useMemo(
    () => donationOffers.find((item) => item.id === packageId) ?? donationOffers[0] ?? null,
    [donationOffers, packageId]
  );
  const bumpyCoinsBalance = Math.max(0, Math.floor(profile?.bumpyCoinsBalance ?? 0));
  const bumpyCoinsDiscount = useBumpyCoins && selectedPackage ? Math.min(bumpyCoinsBalance, selectedPackage.priceRub, BUMPY_COINS_DISCOUNT_CAP) : 0;
  const finalAmountRub = selectedPackage ? Math.max(0, selectedPackage.priceRub - bumpyCoinsDiscount) : 0;

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

  function handlePasteImage(event: React.ClipboardEvent<HTMLFormElement>) {
    const imageFile = getClipboardImageFile(event.clipboardData, `topup-${Date.now()}.png`);

    if (!imageFile) {
      return;
    }

    event.preventDefault();
    updateScreenshot(imageFile);
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

    if (submittingRef.current) {
      return;
    }

    if (!user?.uid) {
      setStatus("error");
      return;
    }

    if (!selectedPackage) {
      setStatus("error");
      return;
    }

    submittingRef.current = true;
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
        telegram: profile?.displayName || user.email || "",
        packageId,
        packageName: getDonationOfferTitle(selectedPackage, isRu),
        baseAmountRub: selectedPackage.priceRub,
        bumpyCoinsDiscount,
        amountRub: finalAmountRub,
        paymentMethod: "manager",
        comment,
        screenshotUrl: screenshot?.secureUrl ?? "",
        screenshotPublicId: screenshot?.publicId ?? "",
        screenshotName: screenshotFile?.name ?? "",
        serviceType: "donation",
        status: "new",
        source: "portal"
      };

      const batch = writeBatch(db);

      batch.set(topupRef, {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      if (bumpyCoinsDiscount > 0) {
        batch.update(doc(db, collections.users, user.uid), {
          bumpyCoinsBalance: increment(-bumpyCoinsDiscount),
          bumpyCoinsSpentTotal: increment(bumpyCoinsDiscount),
          updatedAt: serverTimestamp()
        });

        batch.set(doc(db, collections.bonusTransactions, `spent-${topupRef.id}`), {
          amountCoins: -bumpyCoinsDiscount,
          createdAt: serverTimestamp(),
          description: `Bumpy Coins discount: ${payload.packageName}`,
          leadId: topupRef.id,
          source: "discount",
          uid: user.uid
        });
      }

      await batch.commit();

      if (manager) {
        await setDoc(
          doc(db, "directThreads", threadId),
          {
            participants: [user.uid, manager.uid],
            topupLeadIds: [topupRef.id],
            lastMessageText: `Donation request: ${payload.packageName}`,
            lastMessageUid: user.uid,
            lastMessageAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );

        await addDoc(collection(db, "directThreads", threadId, "messages"), {
          uid: user.uid,
          displayName: profile?.displayName || user.email || "Raid Player",
          text: `Donation request sent.\nPack: ${payload.packageName}\nPayment: manager\nComment: ${comment || "-"}\nScreenshot: ${payload.screenshotUrl || "-"}`,
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

      await fetch("/api/webhook/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }).catch(() => undefined);

      setStatus("sent");
      setScreenshotFile(null);
      setFileError("");
      router.push(`/orders/${topupRef.id}`);
    } catch {
      setStatus("error");
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <GlassPanel className="p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="rounded-lg bg-relic/15 p-2.5 text-relic">
          <WalletCards />
        </span>
        <div>
          <h2 className="text-xl font-bold text-white">{t.title}</h2>
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

      <form className="space-y-4" onSubmit={submitLead} onPaste={handlePasteImage}>
        <label className="block space-y-2">
          <span className="text-sm text-zinc-300">{t.package}</span>
          <select
            value={selectedPackage ? selectedPackage.id : ""}
            onChange={(event) => setPackageId(event.target.value)}
            disabled={donationOffers.length === 0}
            className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
          >
            {donationOffers.length === 0 ? <option value="">{t.noPackages}</option> : null}
            {donationOffers.map((pack) => (
              <option key={pack.id} value={pack.id}>
                {getDonationOfferTitle(pack, isRu)} - {t.from} {pack.priceRub.toLocaleString("ru-RU")} {t.rub}
              </option>
            ))}
          </select>
        </label>

        {selectedPackage ? (
          <div className="rounded-xl border border-relic/20 bg-black/20 p-3">
            <label className="mb-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-white/10 bg-black/24 px-3 py-2 text-sm font-semibold text-zinc-300">
              <input
                type="checkbox"
                checked={useBumpyCoins}
                disabled={bumpyCoinsBalance <= 0}
                onChange={(event) => setUseBumpyCoins(event.target.checked)}
                className="rounded border-relic/30 bg-black/40 text-relic focus:ring-relic"
              />
              {isRu ? "Списать Bumpy Coins" : "Apply Bumpy Coins"}
            </label>
            <div className="grid gap-2 text-sm sm:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-black/25 p-3">
                <p className="text-xs text-zinc-500">{isRu ? "Цена набора" : "Pack price"}</p>
                <p className="mt-1 font-black text-white">{selectedPackage.priceRub.toLocaleString("ru-RU")} {t.rub}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-black/25 p-3">
                <p className="text-xs text-zinc-500">{isRu ? "Скидка" : "Discount"}</p>
                <p className="mt-1 font-black text-relic">-{bumpyCoinsDiscount.toLocaleString("ru-RU")} {t.rub}</p>
              </div>
              <div className="rounded-lg border border-relic/25 bg-relic/[0.08] p-3">
                <p className="text-xs text-zinc-500">{isRu ? "Итого к оплате" : "Final price"}</p>
                <p className="mt-1 font-black text-white">{finalAmountRub.toLocaleString("ru-RU")} {t.rub}</p>
              </div>
            </div>
          </div>
        ) : null}

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
            <label className="inline-flex max-w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-relic/30 px-4 py-2 text-sm font-semibold text-relic transition hover:border-relic hover:bg-relic/10">
              <Paperclip size={16} />
              <span className="min-w-0 whitespace-normal break-words text-left">{screenshotFile ? screenshotFile.name : t.screenshot}</span>
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
              <span className="min-w-0 break-words">{screenshotFile.name}</span>
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
          disabled={status === "sending" || status === "sent" || !user || !selectedPackage}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-relic px-4 py-2.5 font-semibold text-black transition hover:bg-[#8bbcff] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={18} />
          {status === "sending" ? t.sending : t.submit}
        </button>

        {status === "sent" ? (
          <p className="rounded-md border border-relic/20 bg-relic/[0.08] px-3 py-2 text-sm text-relic">
            {t.sent}
            <Link className="ml-2 font-bold underline underline-offset-4" href="/dashboard">
              {isRu ? "Мои заявки" : "My requests"}
            </Link>
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
    </GlassPanel>
  );
}
