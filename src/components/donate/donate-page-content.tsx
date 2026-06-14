"use client";

import { Coins, Info, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useDonationOffers } from "@/components/donate/use-donation-offers";
import { TopupLeadForm } from "@/components/topup/topup-lead-form";
import { GlassPanel } from "@/components/ui/glass-panel";
import { getDonationOfferImageUrl, getDonationOfferTitle } from "@/lib/donation/offers";
import { useLanguage } from "@/lib/i18n/use-language";

const content = {
  ru: {
    title: "Донат RAID",
    subtitle: "Напишите менеджеру, что нужно купить. Готовые наборы ниже работают как витрина и подсказки, но не ограничивают заказ.",
    coinsTitle: "Ваш баланс Bumpy Coins",
    coinsNote: "1 Bumpy Coin = 1 рубль скидки. Списать можно при отправке заявки.",
    packsTitle: "Витрина готовых наборов",
    packsHint: "Набор можно выбрать одним кликом, но можно отправить и нестандартный заказ: два набора, редкий оффер, скриншот из магазина или просьбу уточнить цену.",
    instructionTitle: "Как оформить",
    instructionText: "Оставьте комментарий менеджеру, при необходимости приложите скриншот магазина и нажмите «Отправить заявку». После этого откроется страница заказа, где менеджер обновит этап, сумму, реквизиты и ответит в чате.",
    from: "от",
    rub: "₽",
    noOffers: "Наборы пока не добавлены. Админ может добавить их в разделе управления донатом."
  },
  en: {
    title: "RAID Donate",
    subtitle: "Message the manager with what you need. Ready packs below are a showcase and quick hints, not a required choice.",
    coinsTitle: "Your Bumpy Coins balance",
    coinsNote: "1 Bumpy Coin = 1 ruble discount. You can apply it when submitting the request.",
    packsTitle: "Ready pack showcase",
    packsHint: "You can pick a pack in one click, or send a custom request: two packs, a rare offer, a shop screenshot, or a price check.",
    instructionTitle: "How it works",
    instructionText: "Leave a comment for the manager, optionally attach an in-game shop screenshot and press Send request. A dedicated order page opens where the manager updates stage, amount, payment details and replies in chat.",
    from: "from",
    rub: "RUB",
    noOffers: "No packs yet. An admin can add them in donation management."
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
      <GlassPanel className="p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-center">
          <div>
            <p className="text-xs font-bold tracking-[0.18em] text-relic">RAID TOP-UP</p>
            <h1 className="mt-2 font-[var(--font-display)] text-3xl font-light leading-tight text-white sm:text-4xl">{t.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">{t.subtitle}</p>
          </div>

          <div className="rounded-2xl border border-relic/20 bg-black/24 p-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-relic/25 bg-relic/10 text-relic">
                <Coins size={18} />
              </span>
              <div>
                <p className="text-xs font-bold tracking-[0.12em] text-zinc-500">{t.coinsTitle}</p>
                <p className="text-2xl font-black text-white">{bumpyCoinsBalance.toLocaleString("ru-RU")}</p>
              </div>
            </div>
            <p className="mt-2 text-xs leading-5 text-zinc-500">{t.coinsNote}</p>
          </div>
        </div>
      </GlassPanel>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-4">
          <GlassPanel className="p-4">
            <div className="mb-3 flex items-center gap-2">
              <ShoppingBag size={18} className="text-relic" />
              <h2 className="font-[var(--font-display)] text-2xl font-light text-white">{t.packsTitle}</h2>
            </div>
            <p className="mb-4 text-sm leading-6 text-zinc-400">{t.packsHint}</p>

            {donationOffers.length === 0 ? (
              <p className="rounded-xl border border-relic/20 bg-black/20 p-4 text-sm leading-6 text-zinc-400">{t.noOffers}</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2 2xl:grid-cols-3">
                {donationOffers.map((pack) => {
                  const imageUrl = getDonationOfferImageUrl(pack);
                  const selected = selectedPackageId === pack.id;

                  return (
                    <button
                      key={pack.id}
                      type="button"
                      onClick={() => setSelectedPackageId((current) => (current === pack.id ? "" : pack.id))}
                      className={`group flex min-h-[74px] items-center gap-3 rounded-2xl border p-2.5 text-left transition hover:-translate-y-0.5 hover:border-relic/70 ${
                        selected ? "border-relic/80 bg-relic/[0.08] ring-1 ring-relic/35" : "border-relic/18 bg-black/18"
                      }`}
                    >
                      <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-relic/18 bg-black/30 text-relic">
                        {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" /> : <ShoppingBag size={20} />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block break-words text-sm font-black text-white">{getDonationOfferTitle(pack, isRu)}</span>
                        <span className="mt-1 block text-sm font-bold text-relic">
                          {t.from} {pack.priceRub.toLocaleString("ru-RU")} {t.rub}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </GlassPanel>

          <GlassPanel className="p-4">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-relic/25 bg-relic/10 text-relic">
                <Info size={18} />
              </span>
              <div>
                <h2 className="font-[var(--font-display)] text-2xl font-light text-white">{t.instructionTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{t.instructionText}</p>
              </div>
            </div>
          </GlassPanel>
        </div>

        <TopupLeadForm selectedPackageId={selectedPackageId} onSelectedPackageIdChange={setSelectedPackageId} />
      </section>
    </div>
  );
}
