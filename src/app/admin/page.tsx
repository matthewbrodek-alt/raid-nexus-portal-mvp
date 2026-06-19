"use client";

import { CalendarDays, Gift, LayoutGrid, MessageSquarePlus, MessageSquareWarning, Newspaper, ShoppingBag, Swords, Table2, Users } from "lucide-react";
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
    description: "Новости, активность портала, соцсети, смайлики и эфирные материалы.",
    Icon: Newspaper,
    component: <AdminContentForge mode="content" />
  },
  {
    id: "heroes",
    label: "Герои",
    description: "Добавление героев, редактирование карточек, сборок, множителей и форм.",
    Icon: Swords,
    component: <AdminContentForge mode="heroes" />
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
        <div className="space-y-5">
          <nav className="raid-ornate-panel sticky top-3 z-20 p-3 backdrop-blur-xl" aria-label="Разделы админ-панели">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-bold tracking-[0.16em] text-relic">Разделы админ-панели</p>
                <p className="mt-1 text-xs text-zinc-500">{activeTab.description}</p>
              </div>
              <select
                value={activeTabId}
                onChange={(event) => setActiveTabId(event.target.value as AdminTabId)}
                className="w-full rounded-xl border border-white/10 bg-black/35 px-3 py-2 text-sm font-bold text-white outline-none focus:border-relic lg:hidden"
                aria-label="Выбрать раздел админ-панели"
              >
                {adminTabs.map(({ id, label }) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-3 hidden gap-2 overflow-x-auto pb-1 lg:flex">
              {adminTabs.map(({ Icon, description, id, label }) => {
                const active = id === activeTabId;

                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveTabId(id)}
                    data-active={active ? "true" : "false"}
                    title={description}
                    className="group flex min-w-[170px] items-center gap-2 rounded-2xl border border-white/[0.08] bg-black/20 px-3 py-2 text-left transition hover:border-relic/35 hover:bg-relic/[0.06] data-[active=true]:border-relic/55 data-[active=true]:bg-relic/[0.12] data-[active=true]:shadow-[inset_0_-3px_0_rgba(99,166,255,0.78)]"
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-relic/20 bg-black/30 text-relic transition group-hover:border-relic/45">
                      <Icon size={17} />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-white">{label}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          <section className="min-w-0">
            <div className="mb-4 rounded-[22px] border border-relic/18 bg-black/26 p-4 lg:hidden">
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
