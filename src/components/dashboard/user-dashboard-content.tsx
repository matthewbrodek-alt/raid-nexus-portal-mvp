"use client";

import Link from "next/link";
import { FileText, MessageSquare, ScrollText, Send, Swords } from "lucide-react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { StatCard } from "@/components/dashboard/stat-card";
import { GlassPanel } from "@/components/ui/glass-panel";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

type TopupLead = {
  id: string;
  packageName?: string;
  packageId?: string;
  amountRub?: number;
  status?: string;
  createdAt?: { seconds?: number };
};

type ForumThread = {
  id: string;
  title?: string;
  category?: string;
};

type DirectThread = {
  id: string;
  lastMessageText?: string;
};

function formatLeadAmount(lead: TopupLead) {
  return typeof lead.amountRub === "number" ? `${lead.amountRub.toLocaleString("ru-RU")} ₽` : "на проверке";
}

function leadTime(lead: TopupLead) {
  if (!lead.createdAt?.seconds) {
    return "";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(lead.createdAt.seconds * 1000));
}

export function UserDashboardContent() {
  const { profile, user } = useAuth();
  const [topupLeads, setTopupLeads] = useState<TopupLead[]>([]);
  const [forumThreads, setForumThreads] = useState<ForumThread[]>([]);
  const [directThreads, setDirectThreads] = useState<DirectThread[]>([]);

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const topupQuery = query(collection(db, collections.topupLeads), where("uid", "==", user.uid));
    const forumQuery = query(collection(db, collections.forumThreads), where("authorId", "==", user.uid));
    const directQuery = query(collection(db, "directThreads"), where("participants", "array-contains", user.uid));

    const unsubTopups = onSnapshot(topupQuery, (snapshot) => {
      setTopupLeads(
        snapshot.docs
          .map((item) => ({ id: item.id, ...(item.data() as Omit<TopupLead, "id">) }))
          .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
      );
    });
    const unsubForum = onSnapshot(forumQuery, (snapshot) => {
      setForumThreads(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<ForumThread, "id">) })));
    });
    const unsubDirect = onSnapshot(directQuery, (snapshot) => {
      setDirectThreads(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<DirectThread, "id">) })));
    });

    return () => {
      unsubTopups();
      unsubForum();
      unsubDirect();
    };
  }, [user?.uid]);

  const activityCount = profile?.activityStats?.messagesCount ?? directThreads.length;
  const stats = useMemo(
    () => [
      {
        label: "Активность",
        value: String(activityCount),
        detail: directThreads.length ? `${directThreads.length} личных диалогов` : "данные из профиля"
      },
      {
        label: "Заявки",
        value: String(topupLeads.length),
        detail: topupLeads[0]?.status ? `последняя: ${topupLeads[0].status}` : "пока нет заявок"
      },
      {
        label: "Форум",
        value: String(forumThreads.length),
        detail: forumThreads[0]?.title ?? "пока нет тредов"
      },
      {
        label: "История заявок",
        value: String(topupLeads.filter((lead) => lead.status === "done" || lead.status === "paid").length),
        detail: `${topupLeads.length} всего`
      }
    ],
    [activityCount, directThreads.length, forumThreads, topupLeads]
  );

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <GlassPanel className="p-5 sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <Swords className="shrink-0 text-relic" />
            <h2 className="text-xl font-bold text-white sm:text-2xl">Быстрые действия</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link className="min-w-0 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-300 transition hover:border-relic/40 hover:text-white" href="/chat">
              <MessageSquare className="mb-3 text-relic" />
              Открыть чат
            </Link>
            <Link className="min-w-0 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-300 transition hover:border-relic/40 hover:text-white" href="/heroes">
              <ScrollText className="mb-3 text-relic" />
              База героев
            </Link>
            <Link className="min-w-0 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-300 transition hover:border-relic/40 hover:text-white" href="/topup">
              <Send className="mb-3 text-relic" />
              Создать заявку
            </Link>
            <Link className="min-w-0 rounded-lg border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-300 transition hover:border-relic/40 hover:text-white" href="/useful">
              <FileText className="mb-3 text-relic" />
              Новости и гайды
            </Link>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5 sm:p-6">
          <h2 className="text-xl font-bold text-white sm:text-2xl">История заявок</h2>
          <div className="mt-5 space-y-3">
            {topupLeads.map((lead) => (
              <div key={lead.id} className="grid gap-3 rounded-lg border border-white/10 bg-black/25 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-white">{lead.packageName ?? lead.packageId ?? "Заявка на донат"}</p>
                  <p className="mt-1 break-all text-xs text-zinc-500">{lead.id}{leadTime(lead) ? ` · ${leadTime(lead)}` : ""}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="font-bold text-relic">{formatLeadAmount(lead)}</p>
                  <p className="mt-1 text-xs text-zinc-400">{lead.status ?? "new"}</p>
                </div>
              </div>
            ))}
            {topupLeads.length === 0 ? (
              <p className="rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-zinc-400">
                Заявок пока нет. Создай первую заявку в разделе доната.
              </p>
            ) : null}
          </div>
        </GlassPanel>
      </div>
    </>
  );
}
