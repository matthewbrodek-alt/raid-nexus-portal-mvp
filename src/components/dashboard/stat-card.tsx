import { GlassPanel } from "@/components/ui/glass-panel";

type StatCardProps = {
  label: string;
  value: string;
  detail: string;
};

export function StatCard({ label, value, detail }: StatCardProps) {
  return (
    <GlassPanel className="min-w-0 p-5">
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="mt-3 text-3xl font-black text-white sm:text-4xl">{value}</p>
      <p className="mt-2 text-sm leading-5 text-relic">{detail}</p>
    </GlassPanel>
  );
}
