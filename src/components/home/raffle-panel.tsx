"use client";

import Link from "next/link";
import { Clock3, Gem, Gift, Trophy } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getNextRaffleInfo, getRaffleTimeLeft, RAFFLE_PRIZE, type RaffleInfo } from "@/lib/raffle";
import { useLanguage, type Language } from "@/lib/i18n/use-language";

const copy: Record<
  Language,
  {
    title: string;
    description: string;
    nextIn: string;
    prize: string;
    schedule: string;
    cta: string;
  }
> = {
  ru: {
    title: "Следующий розыгрыш",
    description: "Не упусти возможность принять участие в розыгрыше. В месяц проходит 4 события по 5 паков рубинов.",
    nextIn: "До старта",
    prize: "Приз",
    schedule: "4 розыгрыша в месяц",
    cta: "Участвовать"
  },
  en: {
    title: "Next Giveaway",
    description: "Do not miss your chance to join. Every month has 4 events with 5 ruby subscriptions each.",
    nextIn: "Starts in",
    prize: "Prize",
    schedule: "4 giveaways per month",
    cta: "Join"
  }
};

export function RafflePanel() {
  const { language } = useLanguage();
  const labels = copy[language];
  const [raffle, setRaffle] = useState<RaffleInfo | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const timeLeft = useMemo(() => (raffle && now ? getRaffleTimeLeft(raffle.date, now) : { days: 0, hours: 0, minutes: 0, seconds: 0 }), [now, raffle]);

  useEffect(() => {
    setRaffle(getNextRaffleInfo());
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="raid-ornate-panel relative overflow-hidden p-5 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_15%,rgba(231,193,106,0.13),transparent_30%),linear-gradient(135deg,rgba(43,17,10,0.34),transparent_48%)]" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="raid-title-metal text-3xl font-black">{labels.title}</h2>
          </div>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] border border-relic/35 bg-black/35 text-relic shadow-[0_0_24px_rgba(200,154,61,0.18)]">
            <Trophy size={22} />
          </span>
        </div>

        <p className="mt-4 text-sm leading-6 text-zinc-300">{labels.description}</p>

        <div className="mt-5 rounded-[20px] border border-relic/24 bg-black/36 p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-relic">
              <Clock3 size={16} />
              {labels.nextIn}
            </span>
            <span className="min-w-20 text-right text-xs text-zinc-500">
              {raffle ? raffle.date.toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", { day: "2-digit", month: "long" }) : "..."}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {[
              [timeLeft.days, language === "ru" ? "дн" : "d"],
              [timeLeft.hours, language === "ru" ? "ч" : "h"],
              [timeLeft.minutes, language === "ru" ? "м" : "m"],
              [timeLeft.seconds, language === "ru" ? "с" : "s"]
            ].map(([value, label]) => (
              <span key={label} className="rounded-[14px] border border-relic/18 bg-[#050a12] px-2 py-3 text-center">
                <span className="block font-[var(--font-cinzel)] text-2xl font-black text-white">{String(value).padStart(2, "0")}</span>
                <span className="mt-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-500">{label}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[18px] border border-relic/18 bg-black/28 p-4">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-relic">
              <Gem size={15} />
              {labels.prize}
            </p>
            <p className="mt-2 font-black text-white">{RAFFLE_PRIZE}</p>
          </div>
          <div className="rounded-[18px] border border-relic/18 bg-black/28 p-4">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-relic">
              <Gift size={15} />
              Event
            </p>
            <p className="mt-2 font-black text-white">{labels.schedule}</p>
          </div>
        </div>

        <Link href="/raffle" className="raid-glow-button mt-5 flex w-full items-center justify-center gap-2 border border-relic/45 bg-relic px-5 py-4 text-sm font-black uppercase tracking-[0.16em] text-black transition hover:bg-[#f0c766]">
          {labels.cta}
        </Link>
      </div>
    </section>
  );
}
