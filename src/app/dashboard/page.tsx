import { MessageSquare, ScrollText, Swords } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { CryptoWalletCard } from "@/components/dashboard/crypto-wallet-card";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RecommendedDonation } from "@/components/dashboard/recommended-donation";
import { StatCard } from "@/components/dashboard/stat-card";
import { GlassPanel } from "@/components/ui/glass-panel";
import { userDashboard } from "@/lib/data/dashboard";
import Link from 'next/link';

export default function UserDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardShell
        mode="user"
        title="Личный кабинет игрока"
        subtitle="Персональный зал управления: активность, заявки, быстрый доступ к чатам, Hero DB, рекомендациям и крипто-оплате."
      >
        <div className="grid gap-4 md:grid-cols-4">
          {userDashboard.stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <RecommendedDonation {...userDashboard.recommendedDonation} />
          <CryptoWalletCard {...userDashboard.wallet} />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <Swords className="text-relic" />
              <h2 className="text-2xl font-bold text-white">Commander Profile</h2>
            </div>
            <div className="rounded-lg border border-relic/20 bg-relic/[0.08] p-4">
              <p className="text-sm text-zinc-400">Фокус недели</p>
              <p className="mt-2 text-xl font-bold text-white">{userDashboard.commander.focus}</p>
              <p className="mt-4 text-sm text-relic">Resonance score: {userDashboard.commander.resonance}%</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
  {/* Заменили <a> на <Link> */}
  <Link 
    href="/chat" 
    className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-300 transition hover:text-white"
  >
    <MessageSquare className="mb-3 text-relic" />
    Быстро открыть чат
  </Link>

  {/* Заменили <a> на <Link> */}
  <Link 
    href="/heroes" 
    className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-300 transition hover:text-white"
  >
    <ScrollText className="mb-3 text-relic" />
    Вернуться в Hero DB
  </Link>
</div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <h2 className="text-2xl font-bold text-white">История заявок</h2>
            <div className="mt-5 space-y-3">
              {userDashboard.topupHistory.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/25 p-4">
                  <div>
                    <p className="font-semibold text-white">{lead.title}</p>
                    <p className="mt-1 text-xs text-zinc-500">{lead.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-relic">{lead.amount}</p>
                    <p className="mt-1 text-xs text-zinc-400">{lead.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
