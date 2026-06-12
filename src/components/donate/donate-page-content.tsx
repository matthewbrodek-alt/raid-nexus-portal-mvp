"use client";

import { Coins, Gem, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useDonationOffers } from "@/components/donate/use-donation-offers";
import { TopupLeadForm } from "@/components/topup/topup-lead-form";
import { GlassPanel } from "@/components/ui/glass-panel";
import { getDonationOfferImageUrl, getDonationOfferTitle } from "@/lib/donation/offers";
import { useLanguage } from "@/lib/i18n/use-language";

const content = {
  ru: {
    eyebrow: "Донат",
    title: "Игровые наборы RAID",
    description: "Выберите набор, приложите скриншот магазина и напишите менеджеру. Заявка сразу появится в рабочей CRM-панели сайта.",
    coinsTitle: "Bumpy Coins",
    coinsNote: "1 Bumpy Coin = 1 рубль скидки. Можно списать до 10 000 за заявку.",
    instructionTitle: "Написать менеджеру",
    instructionText: "После отправки заявки откроется отдельная страница заказа: там менеджер обновит этап, сумму и ответит в чате.",
    from: "от",
    rub: "₽",
    noOffers: "Пока нет опубликованных наборов. Администратор может добавить их в разделе управления донатом."
  },
  en: {
    eyebrow: "Donate",
    title: "RAID Game Packs",
    description: "Choose a pack, attach an in-game shop screenshot and message the manager. The request appears in the internal CRM panel.",
    coinsTitle: "Bumpy Coins",
    coinsNote: "1 Bumpy Coin = 1 ruble discount. Up to 10,000 can be used per request.",
    instructionTitle: "Message manager",
    instructionText: "After submitting, a dedicated order page opens: manager updates stages, amount and replies in chat.",
    from: "from",
    rub: "RUB",
    noOffers: "No published packs yet. An administrator can add them in donation management."
  }
};

export function DonatePageContent() {
  const { language, isRu } = useLanguage();
  const { profile } = useAuth();
  const donationOffers = useDonationOffers();
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const t = content[language];
  const bumpyCoinsBalance = Math.max(0, Math.floor(profile?.bumpyCoinsBalance ?? 0));

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const packageFromUrl = searchParams.get("package") ?? searchParams.get("pack") ?? "";

    if (packageFromUrl) {
      setSelectedPackageId(packageFromUrl);
    }
  }, []);

  return (
    <div className="space-y-5">
      <GlassPanel className="relative overflow-hidden p-5 sm:p-6">
        <div className="pointer-events-none absolute right-4 top-4 text-relic/10">
          <Gem size={112} />
        </div>
        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_310px] lg:items-end">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-relic">{t.eyebrow}</p>
            <h1 className="mt-3 font-[var(--font-display)] text-4xl font-light leading-tight text-white sm:text-5xl">{t.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-300">{t.description}</p>
          </div>
          <div className="rounded-[18px] border border-relic/24 bg-black/28 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-relic/30 bg-relic/10 text-relic">
                <Coins size={20} />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-zinc-500">{t.coinsTitle}</p>
                <p className="text-2xl font-black text-white">{bumpyCoinsBalance.toLocaleString("ru-RU")}</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-zinc-500">{t.coinsNote}</p>
          </div>
        </div>
      </GlassPanel>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-4">
          <div className="rounded-[22px] border border-relic/18 bg-black/24 p-4">
            <h2 className="font-[var(--font-display)] text-2xl font-light text-white">{t.instructionTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{t.instructionText}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
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
                  className={`group relative min-h-[168px] overflow-hidden rounded-[18px] border p-4 text-left shadow-[inset_0_0_24px_rgba(36,89,145,0.1),0_14px_32px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:border-relic/70 ${
                    selected ? "border-relic/80 ring-1 ring-relic/45" : "border-[#223348]"
                  }`}
                >
                  <span className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(circle_at_76%_54%,rgba(200,154,61,0.2),transparent_34%),linear-gradient(135deg,rgba(7,14,24,0.96),rgba(7,18,33,0.86))]" />
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt=""
                      className="pointer-events-none absolute inset-0 z-[1] h-full w-full object-cover opacity-[0.82] transition duration-300 group-hover:scale-[1.04] group-hover:opacity-100"
                    />
                  ) : (
                    <span className="pointer-events-none absolute bottom-4 right-4 z-[1] text-relic/20">
                      <Sparkles size={72} />
                    </span>
                  )}
                  <span className="pointer-events-none absolute inset-0 z-[2] bg-[linear-gradient(90deg,rgba(5,10,17,0.9),rgba(5,10,17,0.58)_54%,rgba(5,10,17,0.22)_100%),linear-gradient(180deg,rgba(5,10,17,0.08),rgba(5,10,17,0.62))]" />
                  <span className="relative z-10 flex min-h-[136px] flex-col justify-between">
                    <span>
                      <span className="text-[11px] font-bold tracking-[0.18em] text-relic">{pack.tag}</span>
                      <span className="mt-2 block max-w-[78%] text-xl font-black leading-tight text-white">
                        {getDonationOfferTitle(pack, isRu)}
                      </span>
                      {pack.comment ? <span className="mt-1 block max-w-[76%] text-xs leading-5 text-zinc-300">{pack.comment}</span> : null}
                    </span>
                    <span className="inline-flex w-fit rounded-md border border-relic/25 bg-black/45 px-3 py-1.5 text-base font-black text-relic">
                      {t.from} {pack.priceRub.toLocaleString("ru-RU")} {t.rub}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <TopupLeadForm selectedPackageId={selectedPackageId} />
      </section>
    </div>
  );
}
