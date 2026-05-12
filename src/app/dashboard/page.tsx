import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { UserDashboardContent } from "@/components/dashboard/user-dashboard-content";

export default function UserDashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardShell
        mode="user"
        title={{ ru: "Личный кабинет", en: "Dashboard" }}
        subtitle={{
          ru: "Персональный центр игрока: заявки, активность, форумные треды, чат и быстрый доступ к базе героев.",
          en: "Player command center: requests, activity, forum threads, chat and quick access to the hero database."
        }}
      >
        <UserDashboardContent />
      </DashboardShell>
    </ProtectedRoute>
  );
}
