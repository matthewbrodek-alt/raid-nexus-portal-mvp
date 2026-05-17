"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import type { RaidEvent } from "@/lib/types";

type CalendarItem = RaidEvent & {
  id?: string;
  isPublished?: boolean;
};

type ActionCalendarProps = {
  events: RaidEvent[];
};

const monthNames = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь"
];

const weekdays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

function parseEventDay(date?: string) {
  if (!date) {
    return null;
  }

  const iso = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    return Number(iso[3]);
  }

  const firstNumber = date.match(/\d{1,2}/);
  return firstNumber ? Number(firstNumber[0]) : null;
}

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

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

export function ActionCalendar({ events }: ActionCalendarProps) {
  const [month, setMonth] = useState(() => new Date());
  const [adminEvents, setAdminEvents] = useState<CalendarItem[]>([]);

  useEffect(() => {
    const calendarQuery = query(collection(db, collections.heroCalendar), where("isPublished", "==", true));

    return onSnapshot(calendarQuery, (snapshot) => {
      setAdminEvents(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<CalendarItem, "id">) })));
    });
  }, []);

  const calendarEvents = adminEvents.length ? adminEvents : events;
  const days = useMemo(() => buildMonthDays(month), [month]);
  const eventByDay = useMemo(() => {
    const map = new Map<number, CalendarItem[]>();

    for (const event of calendarEvents) {
      const day = parseEventDay(event.date);

      if (!day) {
        continue;
      }

      map.set(day, [...(map.get(day) ?? []), event as CalendarItem]);
    }

    return map;
  }, [calendarEvents]);

  function moveMonth(delta: number) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  return (
    <div className="raid-ornate-panel p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="font-[var(--font-cinzel)] text-base font-black uppercase tracking-[0.34em] text-relic">Календарь акций</p>
          <p className="mt-1 text-sm text-zinc-500">
            {monthNames[month.getMonth()]} {month.getFullYear()}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => moveMonth(-1)}
            className="raid-glow-button grid h-10 w-10 place-items-center border border-relic/20 bg-black/28 text-relic"
            aria-label="Предыдущий месяц"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => moveMonth(1)}
            className="raid-glow-button grid h-10 w-10 place-items-center border border-relic/20 bg-black/28 text-relic"
            aria-label="Следующий месяц"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-bold uppercase tracking-[0.12em] text-relic/80">
        {weekdays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1.5">
        {days.map((day, index) => {
          const dayEvents = day ? eventByDay.get(day) ?? [] : [];
          const hasEvent = dayEvents.length > 0;

          return (
            <div
              key={`${day ?? "empty"}-${index}`}
              className={`min-h-[64px] rounded-[14px] border p-1.5 text-left ${
                day
                  ? hasEvent
                    ? "border-relic/45 bg-relic/[0.12] shadow-[0_0_20px_rgba(216,168,71,0.12)]"
                    : "border-white/10 bg-black/20"
                  : "border-transparent bg-transparent"
              }`}
            >
              {day ? (
                <>
                  <span className={`text-xs font-bold ${hasEvent ? "text-relic" : "text-zinc-500"}`}>{day}</span>
                  {hasEvent ? (
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 2).map((event) => (
                        <p key={`${event.title}-${event.date}`} className="line-clamp-2 text-[10px] font-semibold leading-3 text-white">
                          {event.title}
                        </p>
                      ))}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
