"use client";

import Link from "next/link";
import { BadgeCheck, FileText, MessageSquare, Palette, ScrollText, Send, Swords } from "lucide-react";
import { collection, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { StatCard } from "@/components/dashboard/stat-card";
import { GlassPanel } from "@/components/ui/glass-panel";
import { avatarPresets, getBpProgress, getOrderStage, isCompletedOrder, normalizeOrderStage, orderStages } from "@/lib/bp-status";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

type TopupLead = {
  id: string;
  packageName?: string;
  packageId?: string;
  serviceType?: string;
  amountRub?: number;
  status?: string;
  managerUid?: string;
  threadId?: string;
  paymentDetails?: string;
  managerNote?: string;
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

function formatRub(value: number) {
  return `${value.toLocaleString("ru-RU")} ₽`;
}

function formatLeadAmount(lead: TopupLead) {
  return typeof lead.amountRub === "number" && lead.amountRub > 0 ? formatRub(lead.amountRub) : "сумма уточняется";
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

function serviceLabel(type?: string) {
  if (type === "account_purchase") {
    return "Покупка аккаунта";
  }

  if (type === "game_help") {
    return "Помощь по игре";
  }

  return "Донат";
}

function avatarFallback(displayName?: string) {
  return (displayName || "BP").slice(0, 2).toUpperCase();
}

export function UserDashboardContent() {
  const { profile, refreshProfile, user } = useAuth();
  const [topupLeads, setTopupLeads] = useState<TopupLead[]>([]);
  const [forumThreads, setForumThreads] = useState<ForumThread[]>([]);
  const [directThreads, setDirectThreads] = useState<DirectThread[]>([]);
  const [avatarStatus, setAvatarStatus] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const topupQuery = query(collection(db, collections.topupLeads), where("uid", "==", user.uid));
    const forumQuery = query(collection(db, collections.forumThreads), where("authorId", "==", user.uid));
    const directQuery = query(collection(db, "directThreads"), where("participants", "array-contains", user.uid));

    const unsubTopups = onSnapshot(
      topupQuery,
      (snapshot) => {
        setTopupLeads(
          snapshot.docs
            .map((item) => ({ id: item.id, ...(item.data() as Omit<TopupLead, "id">) }))
            .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
        );
      },
      () => setTopupLeads([])
    );
    const unsubForum = onSnapshot(
      forumQuery,
      (snapshot) => {
        setForumThreads(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<ForumThread, "id">) })));
      },
      () => setForumThreads([])
    );
    const unsubDirect = onSnapshot(
      directQuery,
      (snapshot) => {
        setDirectThreads(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<DirectThread, "id">) })));
      },
      () => setDirectThreads([])
    );

    return () => {
      unsubTopups();
      unsubForum();
      unsubDirect();
    };
  }, [user?.uid]);

  const totalSpentRub = useMemo(
    () => topupLeads.filter((lead) => isCompletedOrder(lead.status)).reduce((sum, lead) => sum + (lead.amountRub ?? 0), 0),
    [topupLeads]
  );
  const bpProgress = useMemo(() => getBpProgress(totalSpentRub), [totalSpentRub]);
  const selectedAvatar = avatarPresets.find((item) => item.id === profile?.avatarPreset) ?? avatarPresets[0];
  const avatarUrl = profile?.avatarUrl || selectedAvatar.url;
  const activityCount = profile?.activityStats?.messagesCount ?? directThreads.length;
  const completedCount = topupLeads.filter((lead) => isCompletedOrder(lead.status)).length;

  const stats = useMemo(
    () => [
      {
        label: "BP-статус",
        value: bpProgress.status.shortLabel,
        detail: `${formatRub(totalSpentRub)} накоплено`
      },
      {
        label: "Заявки",
        value: String(topupLeads.length),
        detail: topupLeads[0]?.status ? `последняя: ${getOrderStage(topupLeads[0].status).clientLabel}` : "пока нет заявок"
      },
      {
        label: "Чаты",
        value: String(activityCount),
        detail: directThreads.length ? `${directThreads.length} личных диалогов` : "пока нет диалогов"
      },
      {
        label: "История заявок",
        value: String(completedCount),
        detail: `${topupLeads.length} всего`
      }
    ],
    [activityCount, bpProgress.status.shortLabel, completedCount, directThreads.length, topupLeads, totalSpentRub]
  );

  async function selectAvatar(presetId: string) {
    if (!user?.uid) {
      return;
    }

    const preset = avatarPresets.find((item) => item.id === presetId);

    if (!preset) {
      return;
    }

    setAvatarStatus("Сохраняем аватар...");
    await updateDoc(doc(db, collections.users, user.uid), {
      avatarPreset: preset.id,
      avatarUrl: preset.url,
      avatarFrame: bpProgress.status.id,
      bpStatus: bpProgress.status.id,
      totalSpentRub,
      updatedAt: new Date()
    });
    await refreshProfile();
    setAvatarStatus("Аватар обновлен.");
  }

  async function uploadCustomAvatar(file?: File | null) {
    if (!user?.uid || !file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setAvatarStatus("Выберите изображение для аватара.");
      return;
    }

    setAvatarUploading(true);
    setAvatarStatus("Загружаем аватар...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "users");
      formData.append("publicId", `avatars/${user.uid}-${Date.now()}-${file.name.replace(/[^a-z0-9.]+/gi, "-")}`);

      const response = await fetch("/api/cloudinary/upload", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error("Не удалось загрузить изображение.");
      }

      const asset = (await response.json()) as { secureUrl?: string; url?: string };
      const nextAvatarUrl = asset.secureUrl || asset.url || "";

      if (!nextAvatarUrl) {
        throw new Error("Сервис не вернул ссылку на изображение.");
      }

      await updateDoc(doc(db, collections.users, user.uid), {
        avatarPreset: "custom",
        avatarUrl: nextAvatarUrl,
        avatarFrame: bpProgress.status.id,
        bpStatus: bpProgress.status.id,
        totalSpentRub,
        updatedAt: new Date()
      });
      await refreshProfile();
      setAvatarStatus("Аватар обновлен.");
    } catch (caughtError) {
      setAvatarStatus(caughtError instanceof Error ? caughtError.message : "Не удалось обновить аватар.");
    } finally {
      setAvatarUploading(false);
    }
  }

  return (
    <>
      <GlassPanel className="mb-6 overflow-hidden p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="flex items-center gap-4">
            <span className={`grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-2xl border-2 bg-relic/15 text-xl font-black text-relic ${bpProgress.status.frameClass}`}>
              {avatarUrl ? <img src={avatarUrl} alt={profile?.displayName ?? "Avatar"} className="h-full w-full object-cover" /> : avatarFallback(profile?.displayName)}
            </span>
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-relic/25 bg-relic/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-relic">
                <BadgeCheck size={14} />
                {bpProgress.status.label}
              </p>
              <h2 className="mt-3 truncate text-2xl font-black text-white">{profile?.displayName ?? profile?.email}</h2>
              {profile?.avatarHiddenByAdmin ? (
                <p className="mt-3 rounded-lg border border-blood/35 bg-blood/10 px-3 py-2 text-sm font-semibold text-red-200">
                  Ваш аватар скрыт администратором и не отображается другим пользователям.
                </p>
              ) : null}
              <p className="mt-1 text-sm text-zinc-400">BP - уровень аккаунта. Сумма выполненных заявок повышает статус.</p>
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm text-zinc-400">Накоплено</p>
                <p className="text-3xl font-black text-relic">{formatRub(totalSpentRub)}</p>
              </div>
              <p className="text-right text-sm text-zinc-400">
                {bpProgress.nextTotalRub ? `До следующего статуса: ${formatRub(bpProgress.remainingRub)}` : "Максимальный статус"}
              </p>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-black/45">
              <span className="block h-full rounded-full bg-gradient-to-r from-[#a97142] via-[#e7c16a] to-[#9ee7ff]" style={{ width: `${bpProgress.progressPercent}%` }} />
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-500">
              <span>Bronze</span>
              <span>100k Silver</span>
              <span>300k Gold</span>
              <span>777777 Platinum</span>
            </div>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="mb-6 p-5 sm:p-6">
        <div className="mb-4 flex items-center gap-3">
          <Palette className="text-relic" />
          <div>
            <h2 className="text-xl font-bold text-white">Аватар и рамка</h2>
            <p className="text-sm text-zinc-400">Аватар можно выбрать только из списка. Рамка зависит от BP-статуса.</p>
          </div>
        </div>
        <label className="mb-5 flex cursor-pointer flex-col gap-2 rounded-xl border border-relic/18 bg-black/24 p-4 text-sm text-zinc-300 transition hover:border-relic/45 sm:flex-row sm:items-center sm:justify-between">
          <span>
            <span className="block font-semibold text-white">Загрузить свой аватар</span>
            <span className="mt-1 block text-xs text-zinc-500">PNG/JPG/WebP до 6 MB</span>
          </span>
          <span className="rounded-lg bg-relic px-4 py-2 text-center font-black text-black">{avatarUploading ? "Загрузка..." : "Выбрать файл"}</span>
          <input type="file" accept="image/*" className="hidden" disabled={avatarUploading} onChange={(event) => void uploadCustomAvatar(event.target.files?.[0])} />
        </label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {avatarPresets.map((preset) => {
            const active = preset.id === selectedAvatar.id;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => void selectAvatar(preset.id)}
                className={`rounded-xl border p-3 text-left transition ${active ? "border-relic bg-relic/12" : "border-white/10 bg-black/24 hover:border-relic/45"}`}
              >
                <span className={`grid h-14 w-14 place-items-center overflow-hidden rounded-xl border-2 text-sm font-black text-relic ${bpProgress.status.frameClass}`}>
                  {preset.url ? <img src={preset.url} alt={preset.label} className="h-full w-full object-cover" /> : preset.label.slice(0, 2).toUpperCase()}
                </span>
                <span className="mt-2 block text-sm font-semibold text-white">{preset.label}</span>
              </button>
            );
          })}
        </div>
        {avatarStatus ? <p className="mt-3 text-sm text-relic">{avatarStatus}</p> : null}
      </GlassPanel>

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
              Гайды и инструменты
            </Link>
          </div>
        </GlassPanel>

        <GlassPanel className="p-5 sm:p-6">
          <h2 className="text-xl font-bold text-white sm:text-2xl">Мои заявки</h2>
          <div className="mt-5 max-h-[520px] space-y-3 overflow-y-auto pr-1">
            {topupLeads.map((lead) => {
              const activeStage = normalizeOrderStage(lead.status);

              return (
                <div key={lead.id} className="rounded-xl border border-white/10 bg-black/25 p-4">
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-start">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-relic">{serviceLabel(lead.serviceType)}</p>
                      <p className="mt-1 truncate font-semibold text-white">{lead.packageName ?? lead.packageId ?? "Заявка"}</p>
                      <p className="mt-1 break-all text-xs text-zinc-500">{lead.id}{leadTime(lead) ? ` · ${leadTime(lead)}` : ""}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-bold text-relic">{formatLeadAmount(lead)}</p>
                      <p className="mt-1 text-xs text-zinc-400">{getOrderStage(lead.status).clientLabel}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-4">
                    {orderStages.slice(0, 4).map((stage) => {
                      const currentIndex = orderStages.findIndex((item) => item.id === activeStage);
                      const stageIndex = orderStages.findIndex((item) => item.id === stage.id);
                      const active = activeStage === stage.id;
                      const passed = currentIndex >= stageIndex && activeStage !== "cancelled";

                      return (
                        <div key={stage.id} className={`rounded-lg border p-3 ${active ? "border-relic bg-relic/12 text-white" : passed ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200" : "border-white/10 bg-black/18 text-zinc-500"}`}>
                          <p className="text-[11px] font-bold leading-4">{stage.clientLabel}</p>
                        </div>
                      );
                    })}
                  </div>

                  {lead.paymentDetails ? (
                    <div className="mt-3 rounded-lg border border-relic/20 bg-relic/[0.07] p-3 text-sm leading-6 text-zinc-300">
                      <span className="font-semibold text-relic">Оплата: </span>
                      {lead.paymentDetails}
                    </div>
                  ) : null}

                  {lead.managerNote ? <p className="mt-3 text-sm leading-6 text-zinc-400">{lead.managerNote}</p> : null}

                  {lead.managerUid ? (
                    <Link className="mt-3 inline-flex text-sm font-semibold text-relic hover:text-white" href={`/chat?user=${lead.managerUid}`}>
                      Открыть чат с менеджером
                    </Link>
                  ) : null}
                </div>
              );
            })}
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
