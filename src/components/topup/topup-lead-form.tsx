"use client";

import Link from "next/link";
import { Paperclip, Send, WalletCards, X } from "lucide-react";
import { addDoc, collection, doc, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
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

const MAX_SCREENSHOT_SIZE = 6 * 1024 * 1024;

const copy = {
  ru: {
    title: "Написать менеджеру",
    subtitle: "Опишите, какой набор или услуга нужны. Готовый набор можно выбрать, но это необязательно.",
    package: "Готовый набор",
    customPackage: "Нестандартный заказ / уточнить у менеджера",
    comment: "Комментарий",
    screenshot: "Скриншот",
    screenshotHint: "PNG, JPG или WEBP до 6 МБ",
    screenshotTooLarge: "Скриншот должен быть до 6 МБ.",
    placeholder: "Например: нужен нестандартный набор, два оффера, помогите подобрать выгодный вариант...",
    sending: "Отправка...",
    submit: "Отправить заявку",
    sent: "Заявка отправлена. Откроется страница заказа.",
    error: "Не удалось сохранить заявку. Проверь вход в аккаунт и доступ к базе.",
    noPackages: "Готовых наборов пока нет, но заявку менеджеру можно отправить вручную.",
    coinsRequest: "Хочу использовать Bumpy Coins",
    coinsRequestHint: "Менеджер согласует сумму списания и применит ее вручную по обстоятельствам заказа.",
    availableCoins: "Доступно",
    priceReference: "Ориентир по цене",
    from: "от",
    rub: "₽"
  },
  en: {
    title: "Message manager",
    subtitle: "Describe the pack or service you need. Picking a ready pack is optional.",
    package: "Ready pack",
    customPackage: "Custom request / ask manager",
    comment: "Comment",
    screenshot: "Screenshot",
    screenshotHint: "PNG, JPG or WEBP up to 6 MB",
    screenshotTooLarge: "Screenshot must be 6 MB or smaller.",
    placeholder: "Example: custom pack, two offers, help me choose the best option...",
    sending: "Sending...",
    submit: "Send request",
    sent: "Request sent. The order page will open.",
    error: "Could not save request. Check your account session and database access.",
    noPackages: "No ready packs yet, but you can still message the manager manually.",
    coinsRequest: "I want to use Bumpy Coins",
    coinsRequestHint: "The manager will confirm and apply the discount manually based on the request.",
    availableCoins: "Available",
    priceReference: "Price reference",
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
  onSelectedPackageIdChange?: (packageId: string) => void;
};

export function TopupLeadForm({ selectedPackageId, onSelectedPackageIdChange }: TopupLeadFormProps = {}) {
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
    setPackageId(selectedPackageId ?? "");
  }, [selectedPackageId]);

  const selectedPackage = useMemo(
    () => donationOffers.find((item) => item.id === packageId) ?? null,
    [donationOffers, packageId]
  );
  const bumpyCoinsBalance = Math.max(0, Math.floor(profile?.bumpyCoinsBalance ?? 0));
  const requestPackageName = selectedPackage ? getDonationOfferTitle(selectedPackage, isRu) : t.customPackage;

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
        email: user.email ?? "",
        clientName: profile?.displayName || user.email || "Raid Player",
        leadId: topupRef.id,
        managerUid: manager?.uid ?? "",
        threadId,
        telegram: profile?.displayName || user.email || "",
        packageId: selectedPackage?.id ?? "custom",
        packageName: requestPackageName,
        baseAmountRub: selectedPackage?.priceRub ?? 0,
        amountRub: selectedPackage?.priceRub ?? 0,
        requestedBumpyCoinsUse: useBumpyCoins,
        requestedBumpyCoinsAvailable: useBumpyCoins ? bumpyCoinsBalance : 0,
        bumpyCoinsDiscount: 0,
        paymentMethod: "manager",
        comment,
        screenshotUrl: screenshot?.secureUrl ?? "",
        screenshotPublicId: screenshot?.publicId ?? "",
        screenshotName: screenshotFile?.name ?? "",
        serviceType: "donation",
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
            onChange={(event) => {
              setPackageId(event.target.value);
              onSelectedPackageIdChange?.(event.target.value);
            }}
            className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
          >
            <option value="">{donationOffers.length === 0 ? t.noPackages : t.customPackage}</option>
            {donationOffers.map((pack) => (
              <option key={pack.id} value={pack.id}>
                {getDonationOfferTitle(pack, isRu)} - {t.from} {pack.priceRub.toLocaleString("ru-RU")} {t.rub}
              </option>
            ))}
          </select>
        </label>

        {selectedPackage ? (
          <div className="rounded-xl border border-relic/20 bg-black/20 p-3">
            <p className="text-xs text-zinc-500">{t.priceReference}</p>
            <p className="mt-1 font-black text-white">{selectedPackage.priceRub.toLocaleString("ru-RU")} {t.rub}</p>
          </div>
        ) : null}

        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={useBumpyCoins}
            disabled={bumpyCoinsBalance <= 0}
            onChange={(event) => setUseBumpyCoins(event.target.checked)}
            className="mt-1 rounded border-relic/30 bg-black/40 text-relic focus:ring-relic"
          />
          <span>
            <span className="block font-bold text-white">{t.coinsRequest}</span>
            <span className="mt-1 block text-xs leading-5 text-zinc-500">
              {t.availableCoins}: {bumpyCoinsBalance.toLocaleString("ru-RU")} Bumpy Coins. {t.coinsRequestHint}
            </span>
          </span>
        </label>

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
          disabled={status === "sending" || status === "sent" || !user}
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
