"use client";

import { CalendarDays, X } from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { useLanguage, type Language } from "@/lib/i18n/use-language";
import type { RaidEvent } from "@/lib/types";

type CalendarItem = RaidEvent & {
  id?: string;
  isPublished?: boolean;
};

type ActionCalendarProps = {
  events: RaidEvent[];
};

type EventRange = {
  event: CalendarItem;
  startDay: number;
  endDay: number;
  startDate: Date;
  endDate: Date;
};

const copy: Record<
  Language,
  {
    eyebrow: string;
    empty: string;
    scheduleTitle: string;
    eventColumn: string;
    close: string;
    eventTypes: Record<string, string>;
  }
> = {
  ru: {
    eyebrow: "Календарь акций",
    empty: "Событий пока нет",
    scheduleTitle: "Календарь событий",
    eventColumn: "Событие",
    close: "Закрыть календарь",
    eventTypes: {
      summon: "Призыв",
      tournament: "Турнир",
      fusion: "Слияние",
      topup: "Донат"
    }
  },
  en: {
    eyebrow: "Event Calendar",
    empty: "No events yet",
    scheduleTitle: "Event Calendar",
    eventColumn: "Event",
    close: "Close calendar",
    eventTypes: {
      summon: "Summon",
      tournament: "Tournament",
      fusion: "Fusion",
      topup: "Top-up"
    }
  }
};

function buildMonthDays(month: Date) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: Array<number | null> = [];

  for (let index = 0; index < startOffset; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }

  while (cells.length < 42) {
    cells.push(null);
  }

  return cells.slice(0, 42);
}

function parseIsoDate(value?: string) {
  if (!value) {
    return null;
  }

  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function parseLegacyDateRange(event: CalendarItem, month: Date) {
  const isoDates = event.date?.match(/\d{4}-\d{2}-\d{2}/g);

  if (isoDates?.length) {
    const start = parseIsoDate(isoDates[0]);
    const end = parseIsoDate(isoDates[1]) ?? start;

    if (start && end) {
      return { start, end };
    }
  }

  const numericDays = event.date?.match(/\d{1,2}/g)?.map(Number).filter((day) => day >= 1 && day <= 31) ?? [];

  if (!numericDays.length) {
    return null;
  }

  const startDay = numericDays[0];
  const endDay = numericDays.length > 1 ? numericDays[1] : startDay;

  return {
    start: new Date(month.getFullYear(), month.getMonth(), startDay),
    end: new Date(month.getFullYear(), month.getMonth(), endDay)
  };
}

function resolveEventRange(event: CalendarItem, month: Date): EventRange | null {
  let startDate = parseIsoDate(event.startDate);
  let endDate = parseIsoDate(event.endDate) ?? startDate;

  if (!startDate || !endDate) {
    const legacyRange = parseLegacyDateRange(event, month);
    startDate = legacyRange?.start ?? null;
    endDate = legacyRange?.end ?? startDate;
  }

  if (!startDate || !endDate) {
    return null;
  }

  if (endDate < startDate) {
    [startDate, endDate] = [endDate, startDate];
  }

  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  if (endDate < monthStart || startDate > monthEnd) {
    return null;
  }

  return {
    event,
    startDay: startDate < monthStart ? 1 : startDate.getDate(),
    endDay: endDate > monthEnd ? monthEnd.getDate() : endDate.getDate(),
    startDate,
    endDate
  };
}

function formatPeriod(range: EventRange, language: Language) {
  const locale = language === "ru" ? "ru-RU" : "en-US";

  if (range.startDate.toDateString() === range.endDate.toDateString()) {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(range.startDate);
  }

  return `${new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" }).format(range.startDate)} - ${new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short"
  }).format(range.endDate)}`;
}

function formatMonth(month: Date, language: Language) {
  return new Intl.DateTimeFormat(language === "ru" ? "ru-RU" : "en-US", {
    month: "long",
    year: "numeric"
  }).format(month);
}

function formatWeekday(date: Date, language: Language) {
  return new Intl.DateTimeFormat(language === "ru" ? "ru-RU" : "en-US", {
    weekday: "short"
  })
    .format(date)
    .replace(".", "");
}

export function ActionCalendar({ events }: ActionCalendarProps) {
  const { language } = useLanguage();
  const [monthOffset, setMonthOffset] = useState<0 | 1>(0);
  const [adminEvents, setAdminEvents] = useState<CalendarItem[]>([]);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const baseMonth = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);
  const month = useMemo(() => new Date(baseMonth.getFullYear(), baseMonth.getMonth() + monthOffset, 1), [baseMonth, monthOffset]);
  const monthOptions = useMemo(
    () => [
      { offset: 0 as const, month: baseMonth },
      { offset: 1 as const, month: new Date(baseMonth.getFullYear(), baseMonth.getMonth() + 1, 1) }
    ],
    [baseMonth]
  );

  useEffect(() => {
    const calendarQuery = query(collection(db, collections.heroCalendar), where("isPublished", "==", true));

    return onSnapshot(calendarQuery, (snapshot) => {
      setAdminEvents(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<CalendarItem, "id">) })));
    });
  }, []);

  const calendarEvents = adminEvents.length ? adminEvents : events;
  const days = useMemo(() => buildMonthDays(month), [month]);
  const monthDayNumbers = useMemo(() => {
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, index) => index + 1);
  }, [month]);
  const monthEventRanges = useMemo(
    () =>
      calendarEvents
        .map((event) => resolveEventRange(event as CalendarItem, month))
        .filter((range): range is EventRange => Boolean(range)),
    [calendarEvents, month]
  );
  const eventByDay = useMemo(() => {
    const map = new Map<number, EventRange[]>();

    for (const range of monthEventRanges) {
      for (let day = range.startDay; day <= range.endDay; day += 1) {
        map.set(day, [...(map.get(day) ?? []), range]);
      }
    }

    return map;
  }, [monthEventRanges]);

  function openTimeline(day?: number) {
    setSelectedDay(day ?? null);
    setTimelineOpen(true);
  }

  return (
    <>
      <div className="raid-ornate-panel p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-[var(--font-cinzel)] text-base font-black uppercase tracking-[0.34em] text-relic">{copy[language].eyebrow}</p>
              <button type="button" onClick={() => openTimeline()} className="mt-1 text-left text-sm text-zinc-500 transition hover:text-relic">
                {formatMonth(month, language)}
              </button>
            </div>
            <button
              type="button"
              onClick={() => openTimeline()}
              className="raid-glow-button grid h-11 w-11 shrink-0 place-items-center border border-relic/20 bg-black/28 text-relic"
              aria-label={copy[language].scheduleTitle}
            >
              <CalendarDays size={18} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {monthOptions.map((item) => (
              <button
                key={item.offset}
                type="button"
                onClick={() => setMonthOffset(item.offset)}
                className={`raid-glow-button border px-3 py-2 text-left transition ${
                  monthOffset === item.offset ? "border-relic/55 bg-relic/[0.15] text-white" : "border-relic/16 bg-black/24 text-zinc-400 hover:text-relic"
                }`}
              >
                <span className="block text-xs font-semibold">{formatMonth(item.month, language)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-relic/80">
          {Array.from({ length: 7 }, (_, index) => {
            const day = formatWeekday(new Date(2026, 0, 5 + index), language);

            return <div key={day}>{day}</div>;
          })}
        </div>

        <div className="mt-2 grid grid-cols-7 gap-1.5">
          {days.map((day, index) => {
            const dayEvents = day ? eventByDay.get(day) ?? [] : [];
            const hasEvent = dayEvents.length > 0;

            return (
              <button
                key={`${day ?? "empty"}-${index}`}
                type="button"
                disabled={!day}
                onClick={() => day && openTimeline(day)}
                className={`h-[58px] overflow-hidden rounded-[14px] border p-1.5 text-left transition sm:h-[64px] ${
                  day
                    ? hasEvent
                      ? "border-relic/45 bg-relic/[0.12] shadow-[0_0_20px_rgba(216,168,71,0.12)] hover:border-relic"
                      : "border-white/10 bg-black/20 hover:border-relic/25"
                    : "border-transparent bg-transparent"
                }`}
              >
                {day ? (
                  <>
                    <span className={`text-xs font-bold ${hasEvent ? "text-relic" : "text-zinc-500"}`}>{day}</span>
                    {hasEvent ? (
                      <span className="mt-1 flex min-w-0 items-center gap-1">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-relic" />
                        <span className="truncate text-[10px] font-semibold leading-3 text-white">{dayEvents[0]?.event.title}</span>
                        {dayEvents.length > 1 ? <span className="shrink-0 text-[10px] font-bold text-relic">+{dayEvents.length - 1}</span> : null}
                      </span>
                    ) : null}
                  </>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {timelineOpen ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/82 px-3 py-5 backdrop-blur-sm sm:px-4 sm:py-8" role="dialog" aria-modal="true">
          <div className="flex min-h-full items-center justify-center">
            <div className="raid-ornate-panel mx-auto w-full max-w-6xl overflow-hidden bg-[#071019]">
              <div className="flex items-start justify-between gap-4 border-b border-relic/20 p-4 sm:p-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.34em] text-relic">{formatMonth(month, language)}</p>
                  <h2 className="raid-title-metal mt-2 text-3xl font-black">{copy[language].scheduleTitle}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setTimelineOpen(false)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border border-relic/40 bg-black/45 text-zinc-300 transition hover:text-white"
                  aria-label={copy[language].close}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[74dvh] overflow-auto p-3 sm:p-5">
                <div className="min-w-[980px] overflow-hidden rounded-[18px] border border-relic/24 bg-black/30">
                  <div className="grid grid-cols-[190px_1fr] border-b border-relic/18 bg-relic/[0.08]">
                    <div className="border-r border-relic/18 p-3 text-xs font-black uppercase tracking-[0.18em] text-relic">{copy[language].eventColumn}</div>
                    <div className="grid" style={{ gridTemplateColumns: `repeat(${monthDayNumbers.length}, minmax(42px, 1fr))` }}>
                      {monthDayNumbers.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => setSelectedDay(day)}
                          className={`border-r border-relic/12 px-1 py-2 text-center text-[11px] font-bold leading-4 transition last:border-r-0 ${
                            selectedDay === day ? "bg-relic/25 text-white" : "text-zinc-300 hover:bg-relic/10"
                          }`}
                        >
                          <span className="block">{formatWeekday(new Date(month.getFullYear(), month.getMonth(), day), language)}</span>
                          <span className="block text-relic">{day}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {monthEventRanges.length ? (
                    monthEventRanges.map((range, index) => (
                      <div key={`${range.event.id ?? range.event.title}-${index}`} className="grid min-h-[74px] grid-cols-[190px_1fr] border-b border-relic/12 last:border-b-0">
                        <div className="border-r border-relic/18 bg-black/20 p-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-relic">{copy[language].eventTypes[range.event.type] ?? range.event.type}</p>
                          <p className="mt-1 line-clamp-2 font-[var(--font-cinzel)] text-base font-black text-white">{range.event.title}</p>
                          <p className="mt-1 text-xs text-zinc-500">{formatPeriod(range, language)}</p>
                        </div>
                        <div
                          className="relative grid bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)]"
                          style={{ gridTemplateColumns: `repeat(${monthDayNumbers.length}, minmax(42px, 1fr))` }}
                        >
                          {selectedDay ? (
                            <span
                              className="pointer-events-none row-start-1 h-full bg-relic/[0.08]"
                              style={{ gridColumn: `${selectedDay} / ${selectedDay + 1}` }}
                            />
                          ) : null}
                          <span
                            className="my-auto flex h-9 items-center rounded-r-[12px] rounded-l-[6px] border border-relic/35 bg-[#173222]/95 px-3 text-xs font-bold text-white shadow-[0_0_22px_rgba(200,154,61,0.14)]"
                            style={{ gridColumn: `${range.startDay} / ${range.endDay + 1}` }}
                          >
                            <span className="line-clamp-1">{range.event.description || range.event.title}</span>
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-sm text-zinc-500">{copy[language].empty}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
