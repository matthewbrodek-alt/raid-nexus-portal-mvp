import { Bot, DatabaseZap, RadioTower, ShieldAlert } from "lucide-react";
import { AdminUserManagement } from "@/components/admin/admin-user-management";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { GlassPanel } from "@/components/ui/glass-panel";
import { adminDashboard } from "@/lib/data/dashboard";

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "owner"]}>
      <DashboardShell
        mode="admin"
        title="Админ-панель портала"
        subtitle="Операционный центр для новостей, календаря Hero-секции, базы героев, модерации, n8n automations, CRM-таблиц и управления администраторами."
      >
        <div className="grid gap-4 md:grid-cols-4">
          {adminDashboard.pulse.map((item) => (
            <GlassPanel key={item.label} className="p-5">
              <p className="text-sm text-zinc-400">{item.label}</p>
              <p className="mt-3 text-4xl font-black text-white">{item.value}</p>
              <p className="mt-2 text-sm text-relic">{item.trend}</p>
            </GlassPanel>
          ))}
        </div>

        <div className="mt-6">
          <AdminUserManagement />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <GlassPanel className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <DatabaseZap className="text-relic" />
              <h2 className="text-2xl font-bold text-white">Content Forge</h2>
            </div>
            <div className="space-y-3">
              {adminDashboard.contentOps.map((item) => (
                <div key={item.title} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-lg border border-white/10 bg-black/25 p-4">
                  <p className="font-semibold text-white">{item.title}</p>
                  <span className="rounded-full border border-relic/20 px-3 py-1 text-xs text-relic">{item.type}</span>
                  <span className="text-xs text-zinc-400">{item.status}</span>
                </div>
              ))}
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <ShieldAlert className="text-ember" />
              <h2 className="text-2xl font-bold text-white">Moderation Radar</h2>
            </div>
            <div className="space-y-3">
              {adminDashboard.moderationQueue.map((item) => (
                <div key={`${item.target}-${item.reason}`} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-white">{item.target}</p>
                    <span className="rounded-full bg-blood/20 px-3 py-1 text-xs text-ember">{item.priority}</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-400">{item.reason}</p>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <Bot className="text-relic" />
              <h2 className="text-2xl font-bold text-white">n8n Command Chain</h2>
            </div>
            <p className="text-sm leading-7 text-zinc-400">
              Webhook принимает заявки, нормализует payload, отправляет Telegram-уведомление менеджеру,
              пишет лид в CRM и возвращает пользователю `leadId`.
            </p>
            <div className="mt-5 rounded-lg border border-relic/20 bg-relic/[0.08] p-4 text-sm text-zinc-300">
              Workflow file: <span className="font-semibold text-relic">n8n/workflows/raid-portal-automation.json</span>
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="mb-5 flex items-center gap-3">
              <RadioTower className="text-relic" />
              <h2 className="text-2xl font-bold text-white">CRM Tables</h2>
            </div>
            <div className="space-y-3">
              {adminDashboard.crmTables.map((table) => (
                <div key={table.name} className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-black/25 p-4">
                  <div>
                    <p className="font-semibold text-white">{table.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">{table.source}</p>
                  </div>
                  <p className="text-sm text-relic">{table.freshness}</p>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
