import { CalendarDays, Flame, Gift } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { RaidEvent } from "@/lib/types";

type ActionCalendarProps = {
  events: RaidEvent[];
};

export function ActionCalendar({ events }: ActionCalendarProps) {
  const activeEvent = events[0];

  return (
    <GlassPanel className="p-5 shadow-glow">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-relic">Hero Section</p>
          <h2 className="mt-2 text-2xl font-bold text-white">Календарь акций</h2>
        </div>
        <span className="rounded-lg bg-blood/20 p-3 text-ember blood-ring">
          <CalendarDays />
        </span>
      </div>

      <div className="rounded-lg border border-relic/20 bg-relic/[0.08] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-relic">{activeEvent.date}</p>
            <h3 className="mt-2 text-xl font-bold text-white">{activeEvent.title}</h3>
            <p className="mt-2 text-sm leading-6 text-zinc-300">{activeEvent.description}</p>
          </div>
          <Flame className="shrink-0 text-ember" />
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {events.slice(1).map((event) => (
          <div key={event.title} className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/20 p-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-white/[0.05] text-relic">
              <Gift size={18} />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <h4 className="font-semibold text-white">{event.title}</h4>
                <span className="text-xs text-zinc-500">{event.date}</span>
              </div>
              <p className="truncate text-sm text-zinc-400">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
