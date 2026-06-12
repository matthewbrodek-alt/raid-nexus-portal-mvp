"use client";

import { CalendarDays, Gift, LayoutGrid, MessageSquarePlus, MessageSquareWarning, Newspaper, ShoppingBag, Table2, Users } from "lucide-react";
import { useState } from "react";
import { AdminCalendarEditor } from "@/components/admin/admin-calendar-editor";
import { AdminChatModeration } from "@/components/admin/admin-chat-moderation";
import { AdminContentForge } from "@/components/admin/admin-content-forge";
import { AdminCrmPanel } from "@/components/admin/admin-crm-panel";
import { AdminDonationOfferManager } from "@/components/admin/admin-donation-offer-manager";
import { AdminEventWidgetManager } from "@/components/admin/admin-event-widget-manager";
import { AdminMarketplaceManager } from "@/components/admin/admin-marketplace-manager";
import { AdminReviewManager } from "@/components/admin/admin-review-manager";
import { AdminUserManagement } from "@/components/admin/admin-user-management";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

const adminTabs = [
  {
    id: "crm",
    label: "Заявки / CRM",
    description: "Realtime-таблица заявок, статусы, суммы, Excel/CSV и история по месяцам.",
    Icon: Table2,
    component: <AdminCrmPanel />
  },
  {
    id: "users",
    label: "Пользователи",
    description: "Роли, BP-статусы, доступы, блокировки и администраторы.",
    Icon: Users,
    component: <AdminUserManagement />
  },
  {
    id: "content",
    label: "Контент",
    description: "Новости, герои, активность портала и эфирные материалы.",
    Icon: Newspaper,
    component: <AdminContentForge />
  },
  {
    id: "reviews",
    label: "Отзывы",
    description: "Отзывы пользователей и тестовые отзывы для бегущей строки на главной.",
    Icon: MessageSquarePlus,
    component: <AdminReviewManager />
  },
  {
    id: "donate",
    label: "Донат",
    description: "Наборы, цены, картинки и выгодные предложения для витрины.",
    Icon: Gift,
    component: <AdminDonationOfferManager />
  },
  {
    id: "events",
    label: "Виджеты",
    description: "Розыгрыши, таймеры и интерактивные события для игроков.",
    Icon: LayoutGrid,
    component: <AdminEventWidgetManager />
  },
  {
    id: "market",
    label: "Покупка аккаунта",
    description: "Стартовые, прокаченные аккаунты и аккаунты с осколками.",
    Icon: ShoppingBag,
    component: <AdminMarketplaceManager />
  },
  {
    id: "chat",
    label: "Чат / модерация",
    description: "Общий чат, блокировки, жалобы и подозрительные ссылки.",
    Icon: MessageSquareWarning,
    component: <AdminChatModeration />
  },
  {
    id: "calendar",
    label: "Календарь",
    description: "События по датам, изображения календаря и публикации.",
    Icon: CalendarDays,
    component: <AdminCalendarEditor />
  }
] as const;

type AdminTabId = (typeof adminTabs)[number]["id"];

export default function AdminDashboardPage() {
  const [activeTabId, setActiveTabId] = useState<AdminTabId>("crm");
  const activeTab = adminTabs.find((tab) => tab.id === activeTabId) ?? adminTabs[0];

  return (
    <ProtectedRoute allowedRoles={["admin", "owner"]}>
      <DashboardShell
        mode="admin"
        title={{ ru: "Админ-панель портала", en: "Portal admin panel" }}
        subtitle={{
          ru: "Рабочий центр разделен на понятные вкладки: заявки, пользователи, контент, донат, маркет, модерация и календарь.",
          en: "The operations center is split into clear tabs: orders, users, content, donate, marketplace, moderation and calendar."
        }}
      >
        <div className="grid gap-5 xl:grid-cols-[290px_minmax(0,1fr)]">
          <aside className="raid-ornate-panel h-fit p-3 xl:sticky xl:top-5">
            <p className="px-3 pb-3 text-xs font-bold uppercase tracking-[0.2em] text-relic">Admin sections</p>
            <div className="grid gap-2">
              {adminTabs.map(({ Icon, description, id, label }) => {
                const active = id === activeTabId;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTabId(id)}
                    data-active={active ? "true" : "false"}
                    className="group flex w-full items-start gap-3 rounded-2xl border border-white/[0.08] bg-black/20 p-3 text-left transition hover:border-relic/35 hover:bg-relic/[0.06] data-[active=true]:border-relic/55 data-[active=true]:bg-relic/[0.12] data-[active=true]:shadow-[inset_3px_0_0_rgba(231,193,106,0.78)]"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-relic/20 bg-black/30 text-relic transition group-hover:border-relic/45">
                      <Icon size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-bold text-white">{label}</span>
                      <span className="mt-1 block text-xs leading-5 text-zinc-500">{description}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="min-w-0">
            <div className="mb-4 rounded-[22px] border border-relic/18 bg-black/26 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-relic">{activeTab.label}</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{activeTab.description}</p>
            </div>
            {activeTab.component}
          </section>
        </div>
      </DashboardShell>
    </ProtectedRoute>
  );
}
