import { ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { MarketFilter } from "@/components/market/market-filter";
import { GlassPanel } from "@/components/ui/glass-panel";
import { marketplaceHighlights } from "@/lib/data/mock";

export default function MarketplacePage() {
  return (
    <PageShell
      eyebrow="Marketplace"
      title="Магазин аккаунтов"
      description="Отдельная витрина аккаунтов с фильтрами по Void, количеству легендарок, уровню и ключевым героям."
    >
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <MarketFilter />
        <p className="text-sm text-zinc-400">Следующий шаг: подключить Firestore query + indexes из схемы.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {marketplaceHighlights.map((account) => (
          <GlassPanel key={account.id} className="p-5">
            <div className="mb-5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{account.title}</h2>
                <p className="mt-1 text-sm text-zinc-400">Level {account.level}</p>
              </div>
              <p className="text-2xl font-black text-relic">${account.price}</p>
            </div>
            <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-md border border-white/10 bg-black/25 p-3">
                <p className="text-zinc-500">Legendary</p>
                <p className="font-bold text-white">{account.legendaryCount}</p>
              </div>
              <div className="rounded-md border border-white/10 bg-black/25 p-3">
                <p className="text-zinc-500">Void</p>
                <p className="font-bold text-white">{account.voidCount}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {account.tags.map((tag) => (
                <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-300">
                  {tag}
                </span>
              ))}
            </div>
            <button className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-relic/30 bg-relic/10 px-4 py-2 text-sm font-semibold text-relic transition hover:bg-relic/15">
              <ShieldCheck size={16} />
              Зарезервировать
            </button>
          </GlassPanel>
        ))}
      </div>
    </PageShell>
  );
}
