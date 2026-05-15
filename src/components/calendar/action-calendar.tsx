import { CalendarDays, ChevronRight } from "lucide-react";
import type { RaidEvent } from "@/lib/types";

type ActionCalendarProps = {
  events: RaidEvent[];
};

export function ActionCalendar({ events }: ActionCalendarProps) {
  const activeEvent = events[0];

  if (!activeEvent) {
    return null;
  }

  return (
    <div className="raid-ornate-panel p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="font-[var(--font-cinzel)] text-base font-black uppercase tracking-[0.34em] text-relic">Календарь акций</p>
        <button type="button" className="raid-glow-button inline-flex items-center gap-1 border border-transparent px-2 py-1 text-xs font-bold uppercase tracking-[0.14em] text-relic/90">
          <span>Все события</span>
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid gap-3">
        <div className="raid-glow-button grid grid-cols-[72px_1fr_auto] items-center gap-4 border border-relic/18 bg-black/32 p-3 sm:grid-cols-[86px_1fr_auto] sm:p-4">
          <span className="relative z-10 grid h-16 w-16 place-items-center border border-ember/35 bg-blood/30 text-ember sm:h-20 sm:w-20">
            <CalendarDays size={32} />
          </span>
          <div className="relative z-10 min-w-0">
            <h3 className="break-words font-[var(--font-cinzel)] text-lg font-semibold leading-tight text-white sm:text-xl">{activeEvent.title}</h3>
            <p className="mt-1 break-words text-sm text-zinc-400">{activeEvent.date}</p>
          </div>
          <span className="relative z-10 hidden text-xs font-black uppercase tracking-[0.18em] text-ember sm:block">Сейчас</span>
        </div>

        {events.slice(1, 3).map((event) => (
          <div key={`${event.title}-${event.date}`} className="raid-glow-button grid grid-cols-[52px_1fr] items-center gap-3 border border-white/10 bg-black/25 p-3">
            <span className="relative z-10 grid h-12 w-12 place-items-center border border-relic/25 bg-relic/10 text-relic">
              <CalendarDays size={22} />
            </span>
            <div className="relative z-10 min-w-0">
              <h4 className="break-words font-[var(--font-cinzel)] font-semibold leading-tight text-white">{event.title}</h4>
              <p className="mt-1 break-words text-sm text-zinc-500">{event.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
