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

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "owner"]}>
      <DashboardShell
        mode="admin"
        title={{ ru: "Админ-панель портала", en: "Portal admin panel" }}
        subtitle={{
          ru: "Операционный центр для новостей, героев, календаря событий, маркетплейса, модерации, заявок и личных диалогов с игроками.",
          en: "Operations center for news, heroes, event calendar, marketplace, moderation, orders and direct player dialogs."
        }}
      >
        <div>
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

        <div className="mt-6">
          <AdminCrmPanel />
        </div>

        <div className="mt-6">
          <AdminCalendarEditor />
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
