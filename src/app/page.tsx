import Link from "next/link";
import {
  Crown,
  MessageCircle,
  Newspaper,
  Shield,
  ShoppingBag
} from "lucide-react";
import { ActionCalendar } from "@/components/calendar/action-calendar";
import { HomeBackgroundVideo } from "@/components/home/home-background-video";
import { HomeBroadcast } from "@/components/home/home-broadcast";
import { LatestNewsRail } from "@/components/home/latest-news-rail";
import { Navigation } from "@/components/layout/navigation";
import { getEnabledModules } from "@/lib/config/site-modules";
import { raidEvents } from "@/lib/data/mock";

const moduleIcons = {
  topup: "coins",
  useful: "zap",
  marketplace: "shoppingBag",
  heroes: "database",
  chat: "messageSquare"
} as const;

const navSections = getEnabledModules("public")
  .filter((module) => module.id in moduleIcons)
  .map((module) => ({
    label: module.label,
    href: module.route,
    icon: moduleIcons[module.id as keyof typeof moduleIcons]
  }));

const quickLinks = [
  { label: "Новости", href: "#news", icon: Newspaper },
  { label: "Герои", href: "/heroes", icon: Shield },
  { label: "Чат", href: "/chat", icon: MessageCircle },
  { label: "Маркет", href: "/marketplace", icon: ShoppingBag },
  { label: "Донат", href: "/topup", icon: Crown }
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030609] text-pale">
      <HomeBackgroundVideo />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[#030609]/70" />
      <Navigation sections={navSections} />

      <div className="raid-mobile-shell relative z-10 mx-auto w-full max-w-7xl px-3 pb-10 pt-4 sm:px-6 lg:px-8">
        <section id="news" className="grid gap-4 lg:grid-cols-[1.18fr_0.82fr]">
          <LatestNewsRail />
          <div className="grid gap-4">
            <ActionCalendar events={raidEvents} />
            <HomeBroadcast />
          </div>
        </section>

        <section className="raid-ornate-panel mt-4 p-4 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.42em] text-relic">Быстрый доступ</p>
          <div className="mt-4 grid grid-cols-5 gap-2 sm:gap-4">
            {quickLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="group flex min-h-[86px] min-w-0 flex-col items-center justify-center gap-2 border border-relic/45 bg-black/35 px-2 py-3 text-center shadow-[inset_0_0_18px_rgba(216,168,71,0.08)] transition hover:-translate-y-0.5 hover:border-relic hover:bg-relic/10 sm:min-h-[118px]"
                >
                  <Icon className="h-7 w-7 text-relic transition group-hover:scale-110 sm:h-10 sm:w-10" />
                  <span className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-relic sm:text-sm">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
