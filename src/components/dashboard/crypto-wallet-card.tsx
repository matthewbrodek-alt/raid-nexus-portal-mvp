import { Bitcoin, Copy, WalletCards } from "lucide-react";
import { GlassPanel } from "@/components/ui/glass-panel";

type CryptoWalletCardProps = {
  btc: string;
  usdt: string;
  pendingInvoice: string;
};

export function CryptoWalletCard({ btc, usdt, pendingInvoice }: CryptoWalletCardProps) {
  const wallets = [
    { label: "BTC", address: btc, Icon: Bitcoin },
    { label: "USDT TRC20", address: usdt, Icon: WalletCards }
  ];

  return (
    <GlassPanel className="p-6">
      <div className="mb-5 flex items-center gap-3">
        <span className="rounded-lg bg-blood/20 p-3 text-ember blood-ring">
          <WalletCards />
        </span>
        <div>
          <h2 className="text-2xl font-bold text-white">Crypto Vault</h2>
          <p className="text-sm text-zinc-400">BTC / USDT оплата с привязкой к заявке.</p>
        </div>
      </div>
      <div className="space-y-3">
        {wallets.map(({ label, address, Icon }) => (
          <div key={label} className="rounded-lg border border-white/10 bg-black/25 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm font-semibold text-relic">
                <Icon size={16} />
                {label}
              </span>
              <Copy size={15} className="text-zinc-500" />
            </div>
            <p className="break-all text-xs text-zinc-300">{address}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 rounded-md border border-relic/20 bg-relic/[0.08] px-3 py-2 text-sm text-zinc-300">
        Pending invoice: <span className="font-semibold text-relic">{pendingInvoice}</span>
      </p>
    </GlassPanel>
  );
}
