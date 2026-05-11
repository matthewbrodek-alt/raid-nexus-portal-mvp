import { Bot } from "lucide-react";
import { AdminChatModeration } from "@/components/admin/admin-chat-moderation";
import { AdminContentForge } from "@/components/admin/admin-content-forge";
import { AdminCrmPanel } from "@/components/admin/admin-crm-panel";
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

        <div className="mt-6">
          <AdminContentForge />
        </div>

        <div className="mt-6">
          <AdminChatModeration />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <GlassPanel className="p-5 sm:p-6">
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

          <AdminCrmPanel />
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
