import { Gem, Sparkles } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";

type RecommendedDonationProps = {
  packageName: string;
  price: string;
  reason: string;
  match: number;
};

export function RecommendedDonation({ packageName, price, reason, match }: RecommendedDonationProps) {
  return (
    <GlassPanel className="relative overflow-hidden p-6">
      <div className="absolute right-4 top-4 text-relic/20">
        <Gem size={92} />
      </div>
      <div className="relative">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-relic/30 bg-relic/10 px-3 py-1 text-xs text-relic">
          <Sparkles size={14} />
          AI recommendation
        </div>
        <h2 className="text-2xl font-bold text-white">{packageName}</h2>
        <p className="mt-2 text-4xl font-black text-relic">{price}</p>
        <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-300">{reason}</p>
        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs text-zinc-400">
            <span>Совпадение с интересами</span>
            <span>{match}%</span>
          </div>
          <div className="h-2 rounded-full bg-black/40">
            <div className="h-2 rounded-full bg-gradient-to-r from-relic to-ember" style={{ width: `${match}%` }} />
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
