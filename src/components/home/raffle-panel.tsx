"use client";

import Link from "next/link";
import { ArrowRight, Clock3, Gem, Users } from "lucide-react";
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

function imageUrl(value: string) {
  return `url("${value.replace(/"/g, "%22")}")`;
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
  const backgroundImage = theme === "light" ? imageUrl("/images/raffle/raffle-panel-light.png") : imageUrl("/images/raffle/raffle-panel-dark.png");
  const leftArtImage = theme === "light" ? imageUrl("/images/raffle/raffle-left-light.png") : imageUrl("/images/raffle/raffle-left-dark.png");
  const uploadedArt = raffle?.image?.secureUrl || raffle?.image?.url;
  const rightArtImage = uploadedArt
    ? imageUrl(uploadedArt)
    : theme === "light"
      ? imageUrl("/images/raffle/raffle-right-light.png")
      : imageUrl("/images/raffle/raffle-right-dark.png");

  return (
    <section
      className="relative min-h-[168px] overflow-hidden rounded-[26px] border border-[rgba(122,70,255,0.45)] bg-[#070a16] p-3 text-white shadow-[0_22px_70px_rgba(0,0,0,0.42)] sm:p-4"
      style={{
        backgroundImage,
        backgroundPosition: "center",
        backgroundSize: "cover"
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(7,10,22,0.98)_0%,rgba(14,12,42,0.9)_48%,rgba(14,8,28,0.54)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_13%_24%,rgba(133,54,255,0.26),transparent_20%),radial-gradient(circle_at_86%_34%,rgba(255,47,126,0.18),transparent_27%)]" />
      <div
        className="pointer-events-none absolute right-0 top-0 z-[1] h-full w-[48%] bg-contain bg-right-center bg-no-repeat opacity-95"
        style={{ backgroundImage: rightArtImage }}
      />
      <div className="pointer-events-none absolute bottom-0 right-0 z-[2] h-full w-[45%] bg-[linear-gradient(90deg,rgba(7,10,22,0)_0%,rgba(7,10,22,0.12)_42%,rgba(7,10,22,0.84)_100%)]" />

      <div className="relative z-[3] flex min-h-[144px] flex-col justify-between gap-2.5">
        <div className="grid grid-cols-[52px_minmax(0,1fr)] gap-3 pr-[30%] sm:grid-cols-[60px_minmax(0,1fr)] sm:pr-[34%]">
          <span
            className="grid h-[52px] w-[52px] shrink-0 place-items-center overflow-hidden rounded-full border border-[#9a6cff]/40 bg-[#220c46]/70 bg-contain bg-center bg-no-repeat text-[#ff4fac] shadow-[0_0_28px_rgba(137,63,255,0.34)] sm:h-[60px] sm:w-[60px]"
            style={{ backgroundImage: leftArtImage }}
          >
            <Gem className="drop-shadow-[0_0_16px_rgba(255,75,172,0.55)]" size={28} />
          </span>

          <div className="min-w-0">
            <h2 className="text-[1.12rem] font-black leading-[1.08] text-white sm:text-[1.35rem]">{title}</h2>
            <p className="mt-1.5 line-clamp-2 max-w-[24rem] text-[0.76rem] font-semibold leading-4 text-zinc-300 sm:text-[0.82rem] sm:leading-5">{description}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pr-[28%] sm:pr-[32%]">
          <span className="inline-flex min-h-7 items-center gap-1.5 rounded-lg border border-white/10 bg-black/38 px-2.5 text-[0.68rem] font-bold text-zinc-200 backdrop-blur-sm">
            <Clock3 size={13} className="text-[#9b7aff]" />
            <span>{labels.endLabel}</span>
            <span className="text-zinc-400">
              {raffleDate.toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", { day: "2-digit", month: "long" })}
            </span>
          </span>

          <div className="grid grid-cols-4 gap-1">
            {[
              [timeLeft.days, language === "ru" ? "дн" : "d"],
              [timeLeft.hours, language === "ru" ? "ч" : "h"],
              [timeLeft.minutes, language === "ru" ? "м" : "m"],
              [timeLeft.seconds, language === "ru" ? "с" : "s"]
            ].map(([value, label]) => (
              <span key={label} className="min-w-[37px] rounded-lg border border-[#38507e] bg-[rgba(8,13,28,0.88)] px-1 py-1 text-center">
                <span className="block text-xs font-black leading-none text-white">{String(value).padStart(2, "0")}</span>
                <span className="mt-0.5 block text-[8px] font-bold uppercase leading-none text-zinc-400">{label}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border border-white/10 bg-black/42 p-2.5 backdrop-blur-sm">
          <div className="grid min-w-0 grid-cols-2 gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Gem className="shrink-0 text-[#ff375f]" size={20} />
              <div className="min-w-0">
                <p className="truncate text-[0.62rem] leading-none text-zinc-400">{labels.prizeLabel}</p>
                <p className="mt-1 truncate text-[0.78rem] font-black leading-none text-white">{prizeFund}</p>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <Users className="shrink-0 text-[#a56bff]" size={20} />
              <div className="min-w-0">
                <p className="truncate text-[0.62rem] leading-none text-zinc-400">{labels.winnersLabel}</p>
                <p className="mt-1 text-[0.78rem] font-black leading-none text-white">{winnerCount}</p>
              </div>
            </div>
          </div>

          <Link
            href={href}
            className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl bg-[#6d2cff] px-4 py-2 text-xs font-black text-white shadow-[0_0_30px_rgba(109,44,255,0.38)] transition hover:bg-[#7c3dff]"
          >
            {labels.cta}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[26px] ring-1 ring-inset ring-white/10" />
    </section>
  );
}
