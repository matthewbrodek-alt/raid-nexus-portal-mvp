"use client";

import { Bot, Clock, Gem, MessageSquareText, ScrollText, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useDonationOffers } from "@/components/donate/use-donation-offers";
import { TopupLeadForm } from "@/components/topup/topup-lead-form";
import { GlassPanel } from "@/components/ui/glass-panel";
import { getDonationOfferImageUrl, getDonationOfferTitle } from "@/lib/donation/offers";
import { useLanguage } from "@/lib/i18n/use-language";

const content = {
  ru: {
    eyebrow: "Донат",
    title: "Донат Raid: Shadow Legends",
    description:
      "Темный fantasy-раздел для покупки игровых наборов через менеджера: рубины, энергия, пропуски, ежедневные наборы и ивентовые предложения.",
    priceNote: "Цены ориентировочные, по публичному прайсу Luuke Donate на Raid Shadow Legends. Финальный счёт подтверждает менеджер.",
    orderTitle: "Как проходит заказ",
    steps: [
      "Сделайте скриншот нужного набора в игровом магазине.",
      "Отправьте заявку с Telegram и комментарием менеджеру.",
      "Менеджер проверит набор, цену и выставит счёт.",
      "После оплаты покупка выполняется через вход в аккаунт Plarium.",
      "Обычно выполнение занимает 5-10 минут без очереди, при нагрузке до 30-60 минут."
    ],
    faqTitle: "Важно",
    faq: [
      "Купить можно только наборы, доступные на вашем аккаунте.",
      "Для покупки по ID в Raid механики нет, нужен доступ Plarium.",
      "Если включена 2FA, менеджеру потребуется код подтверждения.",
      "Данные игрового аккаунта должны храниться в зашифрованном виде."
    ],
    from: "от",
    rub: "₽",
    noOffers: "Пока нет опубликованных наборов. Администратор может добавить их в разделе управления донатом."
  },
  en: {
    eyebrow: "Donate",
    title: "Raid: Shadow Legends Donate",
    description:
      "Dark fantasy donation section for manager-assisted in-game purchases: rubies, energy, passes, daily packs and event offers.",
    priceNote: "Prices are approximate, based on the public Luuke Donate Raid Shadow Legends price list. Final invoice is confirmed by manager.",
    orderTitle: "How ordering works",
    steps: [
      "Take a screenshot of the pack available in your in-game shop.",
      "Send a request with Telegram contact and comment.",
      "Manager checks the pack, price and sends an invoice.",
      "After payment, purchase is made through Plarium account login.",
      "Usually it takes 5-10 minutes without queue, up to 30-60 minutes during load."
    ],
    faqTitle: "Important",
    faq: [
      "Only packs available on your account can be purchased.",
      "Raid has no ID-only donation flow, Plarium access is required.",
      "If 2FA is enabled, manager will need the verification code.",
      "Game account data should be stored encrypted."
    ],
    from: "from",
    rub: "RUB",
    noOffers: "No published packs yet. An administrator can add them in donation management."
  }
};

export function DonatePageContent() {
  const { language, isRu } = useLanguage();
  const donationOffers = useDonationOffers();
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const t = content[language];
  const integrationCards = [
    {
      Icon: Bot,
      title: isRu ? "Панель менеджера" : "Manager panel",
      text: isRu ? "Заявка сохраняется на сайте и попадает в общую таблицу админов." : "Request is saved on-site and appears in the shared admin table."
    },
    {
      Icon: MessageSquareText,
      title: "Telegram",
      text: isRu ? "Менеджер получает контакт и детали заказа." : "Manager receives contact and order details."
    },
    {
      Icon: ShieldCheck,
      title: t.faqTitle,
      text: t.faq.join(" ")
    }
  ];

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const packageFromUrl = searchParams.get("package") ?? searchParams.get("pack") ?? "";

    if (packageFromUrl) {
      setSelectedPackageId(packageFromUrl);
    }
  }, []);

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <GlassPanel className="relative overflow-hidden p-6">
            <div className="absolute right-4 top-4 text-relic/10">
              <Gem size={140} />
            </div>
            <div className="relative">
              <p className="text-sm uppercase tracking-[0.24em] text-relic">{t.eyebrow}</p>
              <h1 className="mt-3 font-[var(--font-cinzel)] text-4xl font-black text-white sm:text-5xl">
                {t.title}
              </h1>
              <p className="mt-4 text-base leading-8 text-zinc-300">{t.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Rubies", "Energy", "Forge Pass", "Hero Pass", "Daily Packs"].map((tag) => (
                  <span key={tag} className="rounded-full border border-relic/25 bg-relic/10 px-3 py-1 text-xs text-relic">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </GlassPanel>

          <div className="grid gap-4 sm:grid-cols-2">
            {donationOffers.length === 0 ? (
              <div className="rounded-[18px] border border-relic/20 bg-black/30 p-5 text-sm leading-6 text-zinc-400 sm:col-span-2">
                {t.noOffers}
              </div>
            ) : null}
            {donationOffers.map((pack) => {
              const imageUrl = getDonationOfferImageUrl(pack);
              const selected = selectedPackageId === pack.id;

              return (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => setSelectedPackageId(pack.id)}
                  className={`group relative min-h-[218px] overflow-hidden rounded-[18px] border p-5 text-left shadow-[inset_0_0_24px_rgba(36,89,145,0.14),0_18px_40px_rgba(0,0,0,0.34)] transition hover:-translate-y-0.5 hover:border-relic/70 ${
                    selected ? "border-relic/80 ring-1 ring-relic/45" : "border-[#223348]"
                  }`}
                >
                  <span className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_78%_56%,rgba(200,154,61,0.24),transparent_34%),linear-gradient(135deg,rgba(7,14,24,0.96),rgba(7,18,33,0.9))]" />
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt=""
                      className="pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-[1.04] group-hover:opacity-95"
                    />
                  ) : (
                    <span className="pointer-events-none absolute bottom-5 right-5 z-[1] text-relic/20">
                      <Sparkles size={92} />
                    </span>
                  )}
                  <span className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(90deg,rgba(5,10,17,0.9),rgba(5,10,17,0.62)_48%,rgba(5,10,17,0.18)_100%),linear-gradient(180deg,rgba(5,10,17,0.08),rgba(5,10,17,0.62))]" />
                  <span className="relative z-10 flex min-h-[178px] flex-col justify-between">
                    <span>
                      <span className="text-xs font-bold uppercase tracking-[0.24em] text-relic">{pack.tag}</span>
                      <span className="mt-3 block max-w-[76%] text-2xl font-black leading-tight text-white">
                        {getDonationOfferTitle(pack, isRu)}
                      </span>
                      {pack.comment ? (
                        <span className="mt-2 block max-w-[74%] text-sm leading-6 text-zinc-200">{pack.comment}</span>
                      ) : null}
                    </span>
                    <span className="inline-flex w-fit rounded-md border border-relic/25 bg-black/45 px-3 py-2 text-xl font-black text-relic">
                      {t.from} {pack.priceRub.toLocaleString("ru-RU")} {t.rub}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <p className="text-xs leading-6 text-zinc-500">{t.priceNote}</p>
        </div>

        <TopupLeadForm selectedPackageId={selectedPackageId} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <GlassPanel className="p-6">
          <div className="mb-5 flex items-center gap-3">
            <Clock className="text-relic" />
            <h2 className="text-2xl font-bold text-white">{t.orderTitle}</h2>
          </div>
          <div className="space-y-3">
            {t.steps.map((step, index) => (
              <div key={step} className="flex gap-3 rounded-lg border border-white/10 bg-black/25 p-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-relic text-sm font-black text-black">
                  {index + 1}
                </span>
                <p className="text-sm leading-6 text-zinc-300">{step}</p>
              </div>
            ))}
          </div>
        </GlassPanel>

        <div className="grid gap-4">
          {integrationCards.map(({ Icon, title, text }) => (
            <GlassPanel key={title} className="p-5">
              <div className="flex gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-relic/15 text-relic">
                  <Icon />
                </span>
                <div>
                  <h2 className="font-semibold text-white">{title}</h2>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
                </div>
              </div>
            </GlassPanel>
          ))}
        </div>
      </section>

      <GlassPanel className="p-6">
        <div className="flex items-start gap-3">
          <ScrollText className="mt-1 shrink-0 text-relic" />
          <p className="text-sm leading-7 text-zinc-400">
            {isRu
              ? "Этот раздел использует публичную информацию о типах доната и примерных ценах как ориентир. Для продакшена цены лучше хранить в Firestore и редактировать из админ-панели."
              : "This section uses public donation types and approximate prices as a reference. For production, prices should live in Firestore and be edited from admin panel."}
          </p>
        </div>
      </GlassPanel>
    </div>
  );
}
