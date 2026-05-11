"use client";

import { Camera, CreditCard, Send, ShieldCheck, Timer, WalletCards } from "lucide-react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
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

const copy = {
  ru: {
    title: "Заявка на донат",
    subtitle: "Форма отправляет заявку в уже подключенный n8n webhook и Bitrix CRM.",
    telegram: "Telegram",
    package: "Набор",
    payment: "Оплата",
    manager: "Через менеджера",
    comment: "Комментарий",
    placeholder: "Прикреплю скриншот магазина, нужен этот набор сегодня...",
    sending: "Отправка...",
    submit: "Отправить заявку",
    sent: "Заявка отправлена. Менеджер получит уведомление через n8n/Bitrix CRM.",
    error: "Не удалось отправить заявку. Проверь webhook URL и активность workflow в n8n.",
    from: "от",
    rub: "₽"
  },
  en: {
    title: "Donation request",
    subtitle: "The form sends a lead to your connected n8n webhook and Bitrix CRM.",
    telegram: "Telegram",
    package: "Pack",
    payment: "Payment",
    manager: "Manager assisted",
    comment: "Comment",
    placeholder: "I will attach a shop screenshot, need this pack today...",
    sending: "Sending...",
    submit: "Send request",
    sent: "Request sent. Manager will receive it through n8n/Bitrix CRM.",
    error: "Could not send request. Check webhook URL and n8n workflow status.",
    from: "from",
    rub: "RUB"
  }
};

export function TopupLeadForm() {
  const { language, isRu } = useLanguage();
  const { user } = useAuth();
  const t = copy[language];
  const [telegram, setTelegram] = useState("");
  const [packageId, setPackageId] = useState(donationPackages[0].id);
  const [paymentMethod, setPaymentMethod] = useState("usdt");
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const selectedPackage = useMemo(
    () => donationPackages.find((item) => item.id === packageId) ?? donationPackages[0],
    [packageId]
  );
  const serviceSteps = [
    { Icon: Camera, label: isRu ? "Скриншот набора" : "Pack screenshot" },
    { Icon: CreditCard, label: isRu ? "Счёт менеджера" : "Manager invoice" },
    { Icon: Timer, label: isRu ? "5-10 минут без очереди" : "5-10 min if no queue" }
  ];

  async function submitLead(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");

    try {
      const payload = {
        uid: user?.uid ?? "guest",
        telegram,
        packageId,
        packageName: isRu ? selectedPackage.ru : selectedPackage.en,
        amountRub: selectedPackage.priceRub,
        paymentMethod,
        comment,
        status: "new",
        source: "portal"
      };

      if (user?.uid) {
        await addDoc(collection(db, collections.topupLeads), {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      const response = await fetch("/api/n8n/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("n8n webhook rejected request");
      }

      setStatus("sent");
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
              <option value="usdt">USDT TRC20</option>
              <option value="btc">BTC</option>
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

        <button
          disabled={status === "sending"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-relic px-4 py-3 font-semibold text-black transition hover:bg-[#f0c766] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Send size={18} />
          {status === "sending" ? t.sending : t.submit}
        </button>

        {status === "sent" ? (
          <p className="rounded-md border border-relic/20 bg-relic/[0.08] px-3 py-2 text-sm text-relic">
            {t.sent}
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
          ? "Данные аккаунта передаются только менеджеру для покупки доступных в игровом магазине наборов. В продакшене поле игровых данных должно храниться зашифрованным."
          : "Account data is shared only with the manager to buy packs available in the in-game shop. In production, game account fields must be encrypted."}
      </div>
    </GlassPanel>
  );
}

export { donationPackages };
