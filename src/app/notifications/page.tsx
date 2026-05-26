import { ProtectedRoute } from "@/components/auth/protected-route";
import { PageShell } from "@/components/layout/page-shell";
import { NotificationCenter } from "@/components/notifications/notification-center";

export default function NotificationsPage() {
  return (
    <ProtectedRoute>
      <PageShell
        eyebrow={{ ru: "Системные сигналы", en: "System signals" }}
        title={{ ru: "Уведомления", en: "Notifications" }}
        description={{
          ru: "Личные сообщения, обновления заявок и горячие предложения доната собраны отдельно от общего чата.",
          en: "Private messages, request updates and hot donation offers are separated from the global chat."
        }}
      >
        <NotificationCenter />
      </PageShell>
    </ProtectedRoute>
  );
}
