"use client";

import { Filter } from "lucide-react";

export function MarketFilter() {
  return (
    <form className="grid gap-2 rounded-lg border border-white/10 bg-white/[0.04] p-2 sm:grid-cols-[120px_120px_120px_auto]">
      <select className="rounded-md border-white/10 bg-black/40 text-sm text-white focus:border-relic focus:ring-relic" defaultValue="void">
        <option value="void">Void: any</option>
        <option value="yes">Void heroes</option>
        <option value="no">No void</option>
      </select>
      <input className="rounded-md border-white/10 bg-black/40 text-sm text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" placeholder="Legendary" />
      <input className="rounded-md border-white/10 bg-black/40 text-sm text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" placeholder="Level" />
      <button className="inline-flex items-center justify-center gap-2 rounded-md bg-relic px-4 py-2 text-sm font-semibold text-black transition hover:bg-[#f0c766]">
        <Filter size={16} />
        Фильтр
      </button>
    </form>
  );
}
