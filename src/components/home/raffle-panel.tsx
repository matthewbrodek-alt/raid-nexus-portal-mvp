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
  const isLight = theme === "light";
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
  const backgroundImage = isLight ? imageUrl("/images/raffle/raffle-panel-light.PNG") : imageUrl("/images/raffle/raffle-panel-dark.PNG");

  return (
    <section
      className={`raid-raffle-panel relative min-h-[168px] overflow-hidden rounded-[26px] border p-3 shadow-[0_22px_70px_rgba(0,0,0,0.42)] sm:p-4 ${
        isLight
          ? "border-[#bed8ff] bg-[rgba(244,250,255,0.88)] text-[#122033] shadow-[0_22px_58px_rgba(75,126,180,0.18)]"
          : "border-[rgba(122,70,255,0.45)] bg-[#070a16] text-white"
      }`}
    >
      <div
        className="raid-raffle-background pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage }}
      />
      <div
        className={`raid-raffle-base-overlay pointer-events-none absolute inset-0 ${
          isLight
            ? "bg-[linear-gradient(90deg,rgba(247,251,255,0.72)_0%,rgba(235,245,255,0.54)_52%,rgba(224,235,255,0.16)_100%)]"
            : "bg-[linear-gradient(90deg,rgba(7,10,22,0.72)_0%,rgba(14,12,42,0.52)_48%,rgba(14,8,28,0.12)_100%)]"
        }`}
      />
      <div
        className={`raid-raffle-glow-overlay pointer-events-none absolute inset-0 ${
          isLight
            ? "bg-[radial-gradient(circle_at_13%_24%,rgba(70,98,186,0.08),transparent_22%),radial-gradient(circle_at_86%_34%,rgba(153,80,255,0.08),transparent_28%)]"
            : "bg-[radial-gradient(circle_at_13%_24%,rgba(133,54,255,0.14),transparent_20%),radial-gradient(circle_at_86%_34%,rgba(255,47,126,0.1),transparent_27%)]"
        }`}
      />

      <div className="relative z-[3] flex min-h-[144px] flex-col justify-between gap-2.5">
        <div className="pr-[30%] sm:pr-[34%]">
          <div className="min-w-0">
            <h2 className={`raid-raffle-title text-[1.12rem] font-black leading-[1.08] sm:text-[1.35rem] ${isLight ? "text-[#102036]" : "text-white"}`}>{title}</h2>
            <p className={`raid-raffle-description mt-1.5 line-clamp-2 max-w-[24rem] text-[0.76rem] font-semibold leading-4 sm:text-[0.82rem] sm:leading-5 ${isLight ? "text-[#2d3d52]" : "text-zinc-300"}`}>
              {description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pr-[28%] sm:pr-[32%]">
          <span
            className={`raid-raffle-date-pill inline-flex min-h-7 items-center gap-1.5 rounded-lg border px-2.5 text-[0.68rem] font-bold backdrop-blur-sm ${
              isLight ? "border-[#c8dcf7] bg-white/72 text-[#27384c]" : "border-white/10 bg-black/38 text-zinc-200"
            }`}
          >
            <Clock3 size={13} className="text-[#9b7aff]" />
            <span>{labels.endLabel}</span>
            <span className={isLight ? "text-[#52657c]" : "text-zinc-400"}>
              {raffleDate.toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", { day: "2-digit", month: "long" })}
            </span>
          </span>

          <div
            className={`raid-raffle-timer-shell inline-flex min-h-8 items-center gap-1 rounded-xl border px-2 py-1.5 backdrop-blur-md ${
              isLight ? "border-[#c5d9f3] bg-white/78 text-[#102036] shadow-[0_8px_22px_rgba(75,126,180,0.13)]" : "border-white/10 bg-black/42 text-white"
            }`}
          >
            {[
              [timeLeft.days, language === "ru" ? "дн" : "d"],
              [timeLeft.hours, language === "ru" ? "ч" : "h"],
              [timeLeft.minutes, language === "ru" ? "м" : "m"],
              [timeLeft.seconds, language === "ru" ? "с" : "s"]
            ].map(([value, label], index) => (
              <span key={label} className="inline-flex items-baseline gap-0.5 whitespace-nowrap">
                {index > 0 ? <span className={`mx-0.5 text-[0.62rem] ${isLight ? "text-[#93a5ba]" : "text-zinc-500"}`}>•</span> : null}
                <span className={`raid-raffle-timer-value text-[0.78rem] font-black leading-none ${isLight ? "text-[#102036]" : "text-white"}`}>{String(value).padStart(2, "0")}</span>
                <span className={`raid-raffle-timer-label text-[0.56rem] font-bold leading-none ${isLight ? "text-[#65758a]" : "text-zinc-400"}`}>{label}</span>
              </span>
            ))}
          </div>
        </div>

        <div
          className={`raid-raffle-stats grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border p-2.5 backdrop-blur-sm ${
            isLight ? "border-[#d1e2f7] bg-white/76 shadow-[0_12px_34px_rgba(80,120,170,0.12)]" : "border-white/10 bg-black/42"
          }`}
        >
          <div className="grid min-w-0 grid-cols-2 gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <Gem className="shrink-0 text-[#ff375f]" size={20} />
              <div className="min-w-0">
                <p className={`raid-raffle-stat-label ${isLight ? "truncate text-[0.62rem] leading-none text-[#68788c]" : "truncate text-[0.62rem] leading-none text-zinc-400"}`}>{labels.prizeLabel}</p>
                <p className={`raid-raffle-stat-value ${isLight ? "mt-1 truncate text-[0.78rem] font-black leading-none text-[#102036]" : "mt-1 truncate text-[0.78rem] font-black leading-none text-white"}`}>{prizeFund}</p>
              </div>
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <Users className="shrink-0 text-[#a56bff]" size={20} />
              <div className="min-w-0">
                <p className={`raid-raffle-stat-label ${isLight ? "truncate text-[0.62rem] leading-none text-[#68788c]" : "truncate text-[0.62rem] leading-none text-zinc-400"}`}>{labels.winnersLabel}</p>
                <p className={`raid-raffle-stat-value ${isLight ? "mt-1 text-[0.78rem] font-black leading-none text-[#102036]" : "mt-1 text-[0.78rem] font-black leading-none text-white"}`}>{winnerCount}</p>
              </div>
            </div>
          </div>

          <Link
            href={href}
            className="raid-raffle-cta inline-flex min-h-9 items-center justify-center gap-2 rounded-xl bg-[#6d2cff] px-4 py-2 text-xs font-black text-white shadow-[0_0_30px_rgba(109,44,255,0.38)] transition hover:bg-[#7c3dff]"
          >
            {labels.cta}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <div className={`pointer-events-none absolute inset-0 rounded-[26px] ring-1 ring-inset ${isLight ? "ring-[#8ebcff]/28" : "ring-white/10"}`} />
    </section>
  );
}
