import { AdminCalendarEditor } from "@/components/admin/admin-calendar-editor";
import { AdminChatModeration } from "@/components/admin/admin-chat-moderation";
import { AdminContentForge } from "@/components/admin/admin-content-forge";
import { AdminCrmPanel } from "@/components/admin/admin-crm-panel";
import { AdminDonationOfferManager } from "@/components/admin/admin-donation-offer-manager";
import { AdminEventWidgetManager } from "@/components/admin/admin-event-widget-manager";
import { AdminMarketplaceManager } from "@/components/admin/admin-marketplace-manager";
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
        title={{ ru: "Админ-панель портала", en: "Portal admin panel" }}
        subtitle={{
          ru: "Операционный центр для новостей, героев, календаря акций, маркетплейса, модерации, CRM и личных диалогов с игроками.",
          en: "Operations center for news, heroes, event calendar, marketplace, moderation, CRM and direct player dialogs."
        }}
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
          <AdminDonationOfferManager />
        </div>

        <div className="mt-6">
          <AdminEventWidgetManager />
        </div>

        <div className="mt-6">
          <AdminMarketplaceManager />
        </div>

        <div className="mt-6">
          <AdminChatModeration />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <AdminCalendarEditor />
          <AdminCrmPanel />
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
