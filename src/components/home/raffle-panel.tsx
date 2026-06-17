"use client";

import Link from "next/link";
import { ArrowRight, Clock3, Gem, Trophy, Users } from "lucide-react";
import { collection, limit, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "@/lib/theme/use-theme";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { getNextRaffleInfo, getRaffleTimeLeft, RAFFLE_PRIZE } from "@/lib/raffle";
import { useLanguage, type Language } from "@/lib/i18n/use-language";
import type { PortalEventWidget } from "@/lib/types";

const fallbackCopy: Record<
  Language,
  {
    title: string;
    description: string;
    endLabel: string;
    prizeLabel: string;
    winnersLabel: string;
    cta: string;
  }
> = {
  ru: {
    title: "Розыгрыш рубинов",
    description: "Участвуй и получай шанс выиграть игровые наборы с рубинами.",
    endLabel: "До конца:",
    prizeLabel: "Призовой фонд",
    winnersLabel: "Победителей",
    cta: "Участвовать"
  },
  en: {
    title: "Ruby Giveaway",
    description: "Join for a chance to win in-game ruby packs.",
    endLabel: "Ends in:",
    prizeLabel: "Prize pool",
    winnersLabel: "Winners",
    cta: "Join"
  }
};

function getWidgetDate(widget?: PortalEventWidget | null) {
  const rawDate = widget?.deadlineAt || widget?.startsAt;
  const date = rawDate ? new Date(rawDate) : getNextRaffleInfo().date;

  return Number.isNaN(date.getTime()) ? getNextRaffleInfo().date : date;
}

function getActiveRaffle(widgets: PortalEventWidget[], now: Date) {
  const active = widgets
    .filter((widget) => widget.status === "published" && widget.type === "contest")
    .filter((widget) => getWidgetDate(widget).getTime() > now.getTime())
    .sort((first, second) => getWidgetDate(first).getTime() - getWidgetDate(second).getTime());

  return active[0] ?? null;
}

export function RafflePanel() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const labels = fallbackCopy[language];
  const [widgets, setWidgets] = useState<PortalEventWidget[]>([]);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const widgetsQuery = query(collection(db, collections.eventWidgets), where("status", "==", "published"), limit(24));

    return onSnapshot(
      widgetsQuery,
      (snapshot) => {
        setWidgets(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<PortalEventWidget, "id">) })));
      },
      () => setWidgets([])
    );
  }, []);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const raffle = useMemo(() => getActiveRaffle(widgets, now ?? new Date()), [now, widgets]);
  const fallbackRaffle = useMemo(() => getNextRaffleInfo(now ?? new Date()), [now]);
  const raffleDate = raffle ? getWidgetDate(raffle) : fallbackRaffle.date;
  const timeLeft = useMemo(() => (now ? getRaffleTimeLeft(raffleDate, now) : { days: 0, hours: 0, minutes: 0, seconds: 0 }), [now, raffleDate]);
  const title = raffle?.title?.trim() || labels.title;
  const description = raffle?.comment?.trim() || labels.description;
  const prizeFund = raffle?.prizeFund?.trim() || RAFFLE_PRIZE;
  const winnerCount = Math.max(1, Math.floor(raffle?.winnerCount ?? 5));
  const href = raffle?.id ? `/raffle?event=${raffle.id}` : "/raffle";
  const backgroundImage = theme === "light" ? "url('/images/raffle/raffle-panel-light.png')" : "url('/images/raffle/raffle-panel-dark.png')";

  return (
    <section
      className="relative overflow-hidden rounded-[28px] border border-[rgba(122,70,255,0.45)] bg-[#070a16] p-5 text-white shadow-[0_24px_80px_rgba(0,0,0,0.42)] sm:p-7"
      style={{
        backgroundImage,
        backgroundPosition: "center",
        backgroundSize: "cover"
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,10,22,0.96)_0%,rgba(14,12,42,0.88)_42%,rgba(14,8,28,0.28)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_26%,rgba(133,54,255,0.32),transparent_22%),radial-gradient(circle_at_72%_45%,rgba(255,47,126,0.18),transparent_30%)]" />

      <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="flex min-w-0 gap-4 sm:gap-5">
          <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full border border-[#9a6cff]/40 bg-[#220c46]/60 text-[#ff4fac] shadow-[0_0_44px_rgba(137,63,255,0.42)] sm:h-24 sm:w-24">
            <Gem size={46} />
          </span>

          <div className="min-w-0">
            <h2 className="text-2xl font-black leading-tight text-white sm:text-3xl">{title}</h2>
            <p className="mt-3 max-w-md text-sm font-semibold leading-6 text-zinc-300">{description}</p>
          </div>
        </div>

        <div className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-sm lg:w-[240px]">
          <div className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-200">
              <Clock3 size={16} className="text-[#9b7aff]" />
              {labels.endLabel}
            </span>
            <span className="text-xs text-zinc-400">
              {raffleDate.toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", { day: "2-digit", month: "long" })}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {[
              [timeLeft.days, language === "ru" ? "дн" : "d"],
              [timeLeft.hours, language === "ru" ? "ч" : "h"],
              [timeLeft.minutes, language === "ru" ? "м" : "m"],
              [timeLeft.seconds, language === "ru" ? "с" : "s"]
            ].map(([value, label]) => (
              <span key={label} className="rounded-xl border border-[#38507e] bg-[rgba(8,13,28,0.88)] px-2 py-2 text-center">
                <span className="block text-lg font-black text-white">{String(value).padStart(2, "0")}</span>
                <span className="mt-0.5 block text-[10px] font-bold uppercase text-zinc-400">{label}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="grid gap-3 rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-sm sm:grid-cols-[minmax(0,1fr)_minmax(0,0.75fr)_auto] lg:col-span-2">
          <div className="flex min-w-0 items-center gap-3 sm:border-r sm:border-white/10 sm:pr-4">
            <Gem className="shrink-0 text-[#ff375f]" size={26} />
            <div className="min-w-0">
              <p className="text-xs text-zinc-400">{labels.prizeLabel}</p>
              <p className="mt-1 truncate text-base font-black text-white">{prizeFund}</p>
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-3">
            <Users className="shrink-0 text-[#a56bff]" size={27} />
            <div>
              <p className="text-xs text-zinc-400">{labels.winnersLabel}</p>
              <p className="mt-1 text-base font-black text-white">{winnerCount}</p>
            </div>
          </div>

          <Link
            href={href}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#6d2cff] px-6 py-3 text-sm font-black text-white shadow-[0_0_34px_rgba(109,44,255,0.42)] transition hover:bg-[#7c3dff]"
          >
            {labels.cta}
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-inset ring-white/10" />
      <Trophy className="pointer-events-none absolute right-5 top-5 hidden text-white/10 sm:block" size={34} />
    </section>
  );
}
