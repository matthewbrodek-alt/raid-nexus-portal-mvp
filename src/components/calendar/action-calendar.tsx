import { CalendarDays, Flame, Gift, Sparkles } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { RaidEvent } from "@/lib/types";

type ActionCalendarProps = {
  events: RaidEvent[];
};

const typeStyles: Record<RaidEvent["type"], string> = {
  summon: "from-violet-600/35 to-fuchsia-500/10 text-violet-200",
  tournament: "from-amber-500/35 to-red-500/10 text-amber-100",
  topup: "from-emerald-500/30 to-cyan-500/10 text-emerald-100",
  fusion: "from-red-600/30 to-orange-500/10 text-orange-100"
};

export function ActionCalendar({ events }: ActionCalendarProps) {
  const activeEvent = events[0];

  if (!activeEvent) {
    return null;
  }

  return (
    <GlassPanel className="overflow-hidden p-5 shadow-glow">
      <div className="mb-5 flex min-w-0 items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm uppercase tracking-[0.24em] text-relic">Raid Events</p>
          <h2 className="mt-2 break-words text-2xl font-black leading-tight text-white">Календарь акций</h2>
        </div>
        <span className="shrink-0 rounded-lg bg-blood/20 p-3 text-ember blood-ring">
          <CalendarDays />
        </span>
      </div>

      <div className="relative overflow-hidden rounded-lg border border-relic/20 bg-gradient-to-br from-amber-500/20 via-red-900/25 to-violet-950/40 p-4">
        <Sparkles className="absolute right-5 top-5 text-relic/50" />
        <div className="relative flex min-w-0 items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="break-words text-sm font-bold text-relic">{activeEvent.date}</p>
            <h3 className="mt-2 break-words text-2xl font-black leading-tight text-white">{activeEvent.title}</h3>
            <p className="mt-2 break-words text-sm leading-6 text-zinc-200">{activeEvent.description}</p>
          </div>
          <Flame className="shrink-0 text-ember" />
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {events.slice(1).map((event) => (
          <div key={event.title} className={`flex min-w-0 items-start gap-3 rounded-lg border border-white/10 bg-gradient-to-r ${typeStyles[event.type]} p-3`}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-black/30 text-relic">
              <Gift size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                <h4 className="min-w-0 break-words font-bold leading-snug text-white">{event.title}</h4>
                <span className="break-words text-xs text-zinc-300">{event.date}</span>
              </div>
              <p className="mt-1 break-words text-sm leading-5 text-zinc-300">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
