import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UserDashboardContent } from "@/components/dashboard/user-dashboard-content";

export default function UserDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardShell
        mode="user"
        title="Личный кабинет"
        subtitle="Персональный центр игрока: заявки, активность, форумные треды, чат и быстрый доступ к базе героев."
      >
        <UserDashboardContent />
      </DashboardShell>
    </ProtectedRoute>
  );
}
