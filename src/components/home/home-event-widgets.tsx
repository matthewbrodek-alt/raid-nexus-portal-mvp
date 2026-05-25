"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, Gift, Trophy, X } from "lucide-react";
import { arrayUnion, collection, doc, increment, limit, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import type { PortalEventWidget } from "@/lib/types";

function getImageUrl(widget: PortalEventWidget) {
  return widget.image?.secureUrl || widget.image?.url || "";
}

function getTimeLeft(deadlineAt?: string) {
  const deadline = deadlineAt ? new Date(deadlineAt).getTime() : 0;
  const diff = deadline - Date.now();

  if (!deadline || diff <= 0) {
    return "Завершено";
  }

  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const minutes = Math.floor((diff % 3_600_000) / 60_000);

  if (days > 0) {
    return `${days}д ${hours}ч`;
  }

  return `${hours}ч ${minutes}м`;
}

function readDismissed() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    return JSON.parse(window.sessionStorage.getItem("raid-dismissed-event-widgets") ?? "[]") as string[];
  } catch {
    return [];
  }
}

function writeDismissed(ids: string[]) {
  window.sessionStorage.setItem("raid-dismissed-event-widgets", JSON.stringify(ids));
}

export function HomeEventWidgets() {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState<PortalEventWidget[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [expandedId, setExpandedId] = useState("");
  const [confirmedIds, setConfirmedIds] = useState<string[]>([]);
  const [leavingIds, setLeavingIds] = useState<string[]>([]);
  const [failedIds, setFailedIds] = useState<string[]>([]);
  const [now, setNow] = useState(0);

  useEffect(() => {
    setDismissed(readDismissed());
    setNow(Date.now());
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const widgetsQuery = query(collection(db, collections.eventWidgets), where("status", "==", "published"), limit(3));

    return onSnapshot(
      widgetsQuery,
      (snapshot) => {
        setWidgets(
          snapshot.docs
            .map((item) => ({ id: item.id, ...(item.data() as Omit<PortalEventWidget, "id">) }))
            .sort((a, b) => (a.deadlineAt ?? "").localeCompare(b.deadlineAt ?? ""))
        );
      },
      () => setWidgets([])
    );
  }, []);

  const visibleWidgets = useMemo(
    () =>
      widgets
        .filter((widget) => !dismissed.includes(widget.id))
        .filter((widget) => !user?.uid || !widget.participants?.includes(user.uid) || confirmedIds.includes(widget.id))
        .slice(0, 3),
    [confirmedIds, dismissed, user?.uid, widgets]
  );

  function closeWidget(widgetId: string) {
    const next = [...dismissed, widgetId];
    setDismissed(next);
    writeDismissed(next);
  }

  async function participate(widget: PortalEventWidget) {
    if (!user || widget.participants?.includes(user.uid)) {
      return;
    }

    try {
      await updateDoc(doc(db, collections.eventWidgets, widget.id), {
        participants: arrayUnion(user.uid),
        participantCount: increment(1),
        updatedAt: serverTimestamp()
      });
    } catch {
      setFailedIds((current) => (current.includes(widget.id) ? current : [...current, widget.id]));
      return;
    }

    setFailedIds((current) => current.filter((id) => id !== widget.id));
    setConfirmedIds((current) => (current.includes(widget.id) ? current : [...current, widget.id]));
    window.setTimeout(() => {
      setLeavingIds((current) => (current.includes(widget.id) ? current : [...current, widget.id]));
    }, 3200);
    window.setTimeout(() => {
      closeWidget(widget.id);
      setConfirmedIds((current) => current.filter((id) => id !== widget.id));
      setLeavingIds((current) => current.filter((id) => id !== widget.id));
    }, 3800);
  }

  if (!visibleWidgets.length) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-3 z-[60] w-[min(360px,calc(100vw-24px))] space-y-2 sm:bottom-6 sm:left-6">
      {visibleWidgets.map((widget) => {
        const imageUrl = getImageUrl(widget);
        const joined = Boolean(user && (widget.participants?.includes(user.uid) || confirmedIds.includes(widget.id)));
        const failed = failedIds.includes(widget.id);
        const expanded = expandedId === widget.id;
        const leaving = leavingIds.includes(widget.id);

        return (
          <div
            key={widget.id}
            className={`relative overflow-hidden rounded-[18px] border border-relic/35 bg-[#071019]/96 p-3 text-white shadow-[0_18px_70px_rgba(0,0,0,0.62),0_0_34px_rgba(200,154,61,0.16)] backdrop-blur-md transition-all duration-500 ${
              leaving ? "translate-y-4 scale-[0.98] opacity-0" : failed ? "translate-y-0 scale-100 border-blood/50 opacity-100" : "translate-y-0 scale-100 opacity-100"
            }`}
          >
            {imageUrl ? <img src={imageUrl} alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-28" /> : null}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#05070b]/95 via-[#05070b]/78 to-[#05070b]/52" />
            <div className="relative">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-relic/35 bg-relic/15 text-relic">
                  {joined ? <CheckCircle2 size={18} /> : <Gift size={18} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-white">{joined ? "Вы участвуете в событии" : widget.title || "Событие портала"}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-zinc-300">
                    {joined ? "Заявка на участие принята. Виджет исчезнет автоматически." : widget.comment}
                  </p>
                </div>
                <button type="button" onClick={() => closeWidget(widget.id)} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-black/30 text-zinc-400 hover:text-white">
                  <X size={14} />
                </button>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-relic/25 bg-black/35 px-2 py-1 text-xs font-bold text-relic">
                  <Clock3 size={13} />
                  {now ? getTimeLeft(widget.deadlineAt) : ""}
                </span>
                <button type="button" onClick={() => setExpandedId(expanded ? "" : widget.id)} className="text-xs font-bold uppercase tracking-[0.12em] text-relic hover:text-[#ffe0a0]">
                  {expanded ? "Скрыть" : "Подробнее"}
                </button>
              </div>

              {expanded ? (
                <div className="mt-3 rounded-xl border border-white/10 bg-black/35 p-3">
                  {widget.details ? <p className="text-xs leading-5 text-zinc-300">{widget.details}</p> : null}
                  {widget.winnerName ? (
                    <p className="mt-3 inline-flex items-center gap-2 rounded-lg border border-relic/25 bg-relic/10 px-3 py-2 text-xs font-bold text-relic">
                      <Trophy size={14} />
                      Победитель: {widget.winnerName}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div className="mt-3">
                {user ? (
                  <div className="grid gap-2">
                    <button
                      type="button"
                      onClick={() => void participate(widget)}
                      disabled={joined}
                      className="w-full rounded-xl bg-relic px-3 py-2 text-sm font-black text-black transition hover:bg-[#f0c766] disabled:cursor-default disabled:opacity-70"
                    >
                      {joined ? "Вы участвуете" : "Участвовать"}
                    </button>
                    {joined && widget.donationUrl ? (
                      <a
                        href={widget.donationUrl}
                        className="block w-full rounded-xl border border-relic/30 bg-black/35 px-3 py-2 text-center text-xs font-black uppercase tracking-[0.12em] text-relic transition hover:bg-relic/10"
                      >
                        Открыть донат-набор
                      </a>
                    ) : null}
                  </div>
                ) : (
                  <Link href="/login" className="block w-full rounded-xl bg-relic px-3 py-2 text-center text-sm font-black text-black transition hover:bg-[#f0c766]">
                    Войти для участия
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
