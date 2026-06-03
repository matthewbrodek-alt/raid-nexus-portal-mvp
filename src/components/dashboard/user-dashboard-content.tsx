"use client";

import Link from "next/link";
import { BadgeCheck, Check, ClipboardCopy, Coins, FileText, MessageSquare, Palette, ScrollText, Send, Swords, Users } from "lucide-react";
import { collection, doc, limit, onSnapshot, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { StatCard } from "@/components/dashboard/stat-card";
import { GlassPanel } from "@/components/ui/glass-panel";
import { copyTextToClipboard } from "@/lib/browser/clipboard";
import { getBpProgress, getOrderStage, isCompletedOrder, normalizeOrderStage, orderStages } from "@/lib/bp-status";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import {
  avatarFrames,
  getAvatarFrameClass,
  getAvailableAvatarFrames,
  getAvailableNicknameStyles,
  getNicknameClass,
  normalizeAvatarFrame,
  normalizeNicknameStyle,
  type AvatarFrameId,
  type NicknameStyleId
} from "@/lib/profile-cosmetics";
import { makeReferralCode, makeReferralLink, normalizeReferralCode, REFERRAL_REWARD_RATE } from "@/lib/referrals";

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

type BonusTransaction = {
  id: string;
  amountCoins?: number;
  createdAt?: { seconds?: number };
  description?: string;
  source?: string;
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
  const [bonusTransactions, setBonusTransactions] = useState<BonusTransaction[]>([]);
  const [origin, setOrigin] = useState("");
  const [referralNotice, setReferralNotice] = useState("");
  const [avatarStatus, setAvatarStatus] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [displayNameDraft, setDisplayNameDraft] = useState("");
  const [selectedAvatarFrame, setSelectedAvatarFrame] = useState<AvatarFrameId>("none");
  const [selectedNicknameStyle, setSelectedNicknameStyle] = useState<NicknameStyleId>("plain");
  const [cosmeticStatus, setCosmeticStatus] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!user?.uid) {
      return;
    }

    const topupQuery = query(collection(db, collections.topupLeads), where("uid", "==", user.uid), limit(120));
    const forumQuery = query(collection(db, collections.forumThreads), where("authorId", "==", user.uid), limit(60));
    const directQuery = query(collection(db, "directThreads"), where("participants", "array-contains", user.uid), limit(80));
    const bonusQuery = query(collection(db, collections.bonusTransactions), where("uid", "==", user.uid), limit(120));

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
    const unsubBonus = onSnapshot(
      bonusQuery,
      (snapshot) => {
        setBonusTransactions(
          snapshot.docs
            .map((item) => ({ id: item.id, ...(item.data() as Omit<BonusTransaction, "id">) }))
            .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0))
        );
      },
      () => setBonusTransactions([])
    );

    return () => {
      unsubTopups();
      unsubForum();
      unsubDirect();
      unsubBonus();
    };
  }, [user?.uid]);

  const totalSpentRub = useMemo(
    () => topupLeads.filter((lead) => isCompletedOrder(lead.status)).reduce((sum, lead) => sum + (lead.amountRub ?? 0), 0),
    [topupLeads]
  );
  const bpProgress = useMemo(() => getBpProgress(totalSpentRub), [totalSpentRub]);
  const avatarUrl = profile?.avatarUrl || "";
  const canUseAdminFrame = profile?.role === "admin" || profile?.role === "owner";
  const availableAvatarFrames = useMemo(() => getAvailableAvatarFrames(bpProgress.status.id, canUseAdminFrame), [bpProgress.status.id, canUseAdminFrame]);
  const availableNicknameStyles = useMemo(() => getAvailableNicknameStyles(bpProgress.status.id), [bpProgress.status.id]);
  const activeAvatarFrame = normalizeAvatarFrame(profile?.avatarFrame ?? selectedAvatarFrame, bpProgress.status.id, canUseAdminFrame);
  const activeNicknameStyle = normalizeNicknameStyle(profile?.nicknameStyle ?? selectedNicknameStyle, bpProgress.status.id);
  const activeAvatarFrameClass = getAvatarFrameClass(activeAvatarFrame, bpProgress.status.id);
  const activeNicknameClass = getNicknameClass(activeNicknameStyle, bpProgress.status.id);
  const activityCount = profile?.activityStats?.messagesCount ?? directThreads.length;
  const completedCount = topupLeads.filter((lead) => isCompletedOrder(lead.status)).length;
  const referralCode = normalizeReferralCode(profile?.referralCode);
  const referralLink = makeReferralLink(origin, referralCode);
  const bumpyBalance = profile?.bumpyCoinsBalance ?? 0;
  const bumpyEarnedTotal = profile?.bumpyCoinsEarnedTotal ?? 0;

  useEffect(() => {
    if (!profile) {
      return;
    }

    setDisplayNameDraft(profile.displayName || profile.email || "");
    setSelectedAvatarFrame(normalizeAvatarFrame(profile.avatarFrame, bpProgress.status.id, canUseAdminFrame));
    setSelectedNicknameStyle(normalizeNicknameStyle(profile.nicknameStyle, bpProgress.status.id));
  }, [bpProgress.status.id, canUseAdminFrame, profile]);

  useEffect(() => {
    if (!user?.uid || !profile || referralCode) {
      return;
    }

    const nextCode = makeReferralCode(profile.displayName || profile.email || "Raid Player", user.uid);

    void Promise.all([
      updateDoc(doc(db, collections.users, user.uid), {
        referralCode: nextCode,
        bumpyCoinsBalance: profile.bumpyCoinsBalance ?? 0,
        bumpyCoinsEarnedTotal: profile.bumpyCoinsEarnedTotal ?? 0,
        bumpyCoinsSpentTotal: profile.bumpyCoinsSpentTotal ?? 0,
        updatedAt: serverTimestamp()
      }),
      setDoc(
        doc(db, collections.referralCodes, nextCode),
        {
          code: nextCode,
          ownerUid: user.uid,
          ownerEmail: profile.email,
          ownerDisplayName: profile.displayName,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      )
    ])
      .then(() => refreshProfile())
      .catch(() => undefined);
  }, [profile, referralCode, refreshProfile, user?.uid]);

  useEffect(() => {
    if (!user?.uid || !profile || !referralCode) {
      return;
    }

    void setDoc(
      doc(db, collections.referralCodes, referralCode),
      {
        code: referralCode,
        ownerUid: user.uid,
        ownerEmail: profile.email,
        ownerDisplayName: profile.displayName,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    ).catch(() => undefined);
  }, [profile, referralCode, user?.uid]);

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
        avatarFrame: normalizeAvatarFrame(selectedAvatarFrame, bpProgress.status.id, canUseAdminFrame),
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

  async function saveProfileCosmetics() {
    if (!user?.uid || !profile) {
      return;
    }

    const nextDisplayName = displayNameDraft.trim().replace(/\s+/g, " ").slice(0, 28);

    if (nextDisplayName.length < 2) {
      setCosmeticStatus("Никнейм должен быть не короче 2 символов.");
      return;
    }

    const nextFrame = normalizeAvatarFrame(selectedAvatarFrame, bpProgress.status.id, canUseAdminFrame);
    const nextStyle = normalizeNicknameStyle(selectedNicknameStyle, bpProgress.status.id);

    try {
      await updateDoc(doc(db, collections.users, user.uid), {
        displayName: nextDisplayName,
        avatarFrame: nextFrame,
        nicknameStyle: nextStyle,
        bpStatus: bpProgress.status.id,
        totalSpentRub,
        updatedAt: serverTimestamp()
      });
      await refreshProfile();
      setCosmeticStatus("Оформление профиля сохранено.");
      window.setTimeout(() => setCosmeticStatus(""), 2400);
    } catch {
      setCosmeticStatus("Не удалось сохранить оформление профиля.");
    }
  }

  async function copyReferralLink() {
    if (!referralLink) {
      return;
    }

    await copyTextToClipboard(referralLink);
    setReferralNotice("Реферальная ссылка скопирована.");
    window.setTimeout(() => setReferralNotice(""), 2200);
  }

  return (
    <>
      <GlassPanel className="mb-6 overflow-hidden p-5 sm:p-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div className="flex items-center gap-4">
            <span className={`grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-xl border-2 bg-relic/15 text-xl font-black text-relic ${activeAvatarFrameClass}`}>
              {avatarUrl ? <img src={avatarUrl} alt={profile?.displayName ?? "Avatar"} className="h-full w-full rounded-lg object-cover" /> : avatarFallback(profile?.displayName)}
            </span>
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 rounded-full border border-relic/25 bg-relic/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-relic">
                <BadgeCheck size={14} />
                {bpProgress.status.label}
              </p>
              <h2 className={`mt-3 truncate text-2xl font-black ${activeNicknameClass}`}>{profile?.displayName ?? profile?.email}</h2>
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
            <p className="text-sm text-zinc-400">Загрузите свой аватар. Рамка зависит от BP-статуса.</p>
          </div>
        </div>
        <label className="mb-5 flex cursor-pointer flex-col gap-2 rounded-xl border border-relic/[0.18] bg-black/24 p-4 text-sm text-zinc-300 transition hover:border-relic/45 sm:flex-row sm:items-center sm:justify-between">
          <span>
            <span className="block font-semibold text-white">Загрузить свой аватар</span>
            <span className="mt-1 block text-xs text-zinc-500">PNG/JPG/WebP до 6 MB</span>
          </span>
          <span className="rounded-lg bg-relic px-4 py-2 text-center font-black text-black">{avatarUploading ? "Загрузка..." : "Выбрать файл"}</span>
          <input type="file" accept="image/*" className="hidden" disabled={avatarUploading} onChange={(event) => void uploadCustomAvatar(event.target.files?.[0])} />
        </label>
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <label className="block">
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-relic">Никнейм</span>
            <input
              value={displayNameDraft}
              onChange={(event) => setDisplayNameDraft(event.target.value)}
              maxLength={28}
              className="mt-2 w-full rounded-xl border-relic/20 bg-black/35 text-white placeholder:text-zinc-600 focus:border-relic focus:ring-relic"
              placeholder="Ваш никнейм"
            />
          </label>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-relic">Подсветка ника</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {availableNicknameStyles.map((style) => {
                const selected = selectedNicknameStyle === style.id;

                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedNicknameStyle(style.id)}
                    className={`rounded-xl border px-3 py-2 text-left text-sm font-black transition ${
                      selected
                        ? "border-relic bg-relic/20 shadow-[0_0_24px_rgba(231,193,106,0.22)] ring-1 ring-relic/45"
                        : "border-white/10 bg-black/45 opacity-55 saturate-50 hover:border-relic/35 hover:opacity-100 hover:saturate-100"
                    }`}
                  >
                    <span className={selected ? style.className : "text-zinc-500"}>{style.label}</span>
                  </button>
                );
              })}
            </div>
            {bpProgress.status.id === "bronze" || bpProgress.status.id === "silver" ? (
              <p className="mt-2 text-xs text-zinc-500">RGB-подсветка открывается с Gold BP.</p>
            ) : null}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-relic">Рамка аватара</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {avatarFrames.filter((frame) => !frame.adminOnly || canUseAdminFrame).map((frame) => {
              const unlocked = availableAvatarFrames.some((item) => item.id === frame.id);
              const selected = selectedAvatarFrame === frame.id;

              return (
                <button
                  key={frame.id}
                  type="button"
                  disabled={!unlocked}
                  onClick={() => setSelectedAvatarFrame(frame.id)}
                  className={`rounded-xl border p-3 text-left transition ${
                    selected
                      ? "border-relic bg-relic/20 shadow-[0_0_26px_rgba(231,193,106,0.22)] ring-1 ring-relic/45"
                      : unlocked
                        ? "border-white/10 bg-black/45 opacity-55 saturate-50 hover:border-relic/35 hover:opacity-100 hover:saturate-100"
                        : "border-white/10 bg-black/30 opacity-35 grayscale"
                  } disabled:cursor-not-allowed disabled:opacity-45`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`relative grid h-11 w-11 place-items-center rounded-xl border-2 bg-gradient-to-br transition ${
                        selected ? "scale-105 shadow-[0_0_18px_rgba(231,193,106,0.35)]" : "scale-95"
                      } ${frame.previewClassName} ${frame.className}`}
                    >
                      {selected ? (
                        <span className="absolute -bottom-1 -left-1 z-10 grid h-5 w-5 place-items-center rounded-md border border-[#b8ff7a]/70 bg-[#133d12] text-[#7dff54] shadow-[0_0_14px_rgba(70,255,84,0.42)]">
                          <Check size={13} strokeWidth={3} />
                        </span>
                      ) : null}
                    </span>
                    <span>
                      <span className={`block text-sm font-black ${selected ? "text-white" : "text-zinc-500"}`}>{frame.label}</span>
                      <span className="text-xs text-zinc-500">{unlocked ? "Доступно" : `С ${frame.minStatus} BP`}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-xl border border-relic/20 bg-black/24 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-white">Предпросмотр</p>
            <p className={`mt-1 text-xl font-black ${getNicknameClass(selectedNicknameStyle, bpProgress.status.id)}`}>{displayNameDraft || profile?.displayName}</p>
          </div>
          <button
            type="button"
            onClick={() => void saveProfileCosmetics()}
            className="rounded-xl bg-relic px-5 py-3 font-black text-black transition hover:bg-[#f0c766]"
          >
            Сохранить оформление
          </button>
        </div>
        {cosmeticStatus ? <p className="mt-3 text-sm text-relic">{cosmeticStatus}</p> : null}
        {avatarStatus ? <p className="mt-3 text-sm text-relic">{avatarStatus}</p> : null}
      </GlassPanel>

      <div className="mb-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <GlassPanel className="p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <Users className="text-relic" />
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-relic">Referral Program</p>
              <h2 className="text-xl font-bold text-white sm:text-2xl">Реферальная программа</h2>
            </div>
          </div>
          <p className="text-sm leading-6 text-zinc-400">
            Приглашай игроков на портал. Когда приглашенный игрок оплачивает и менеджер переводит заявку в статус выполнена, тебе начисляется {Math.round(REFERRAL_REWARD_RATE * 100)}% от суммы заказа в Bumpy Coins.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="rounded-xl border border-relic/20 bg-black/25 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Твой код</p>
              <p className="mt-2 break-all font-mono text-lg font-black text-relic">{referralCode || "создается..."}</p>
              <p className="mt-2 break-all text-xs text-zinc-500">{referralLink || "Ссылка появится после создания кода."}</p>
            </div>
            <button
              type="button"
              onClick={() => void copyReferralLink()}
              disabled={!referralLink}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-relic/35 bg-relic/[0.12] px-5 py-4 font-bold text-relic transition hover:bg-relic hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ClipboardCopy size={18} />
              Скопировать
            </button>
          </div>
          {referralNotice ? <p className="mt-3 text-sm font-semibold text-relic">{referralNotice}</p> : null}
        </GlassPanel>

        <GlassPanel className="p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-3">
            <Coins className="text-relic" />
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-relic">Bumpy Coins</p>
              <h2 className="text-xl font-bold text-white sm:text-2xl">Бонусный баланс</h2>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-xl border border-relic/20 bg-relic/[0.08] p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Доступно</p>
              <p className="mt-2 text-3xl font-black text-relic">{bumpyBalance.toLocaleString("ru-RU")}</p>
              <p className="mt-1 text-xs text-zinc-500">1 Bumpy Coin = 1 рубль скидки</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/22 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Начислено всего</p>
              <p className="mt-2 text-2xl font-black text-white">{bumpyEarnedTotal.toLocaleString("ru-RU")}</p>
            </div>
          </div>
          <div className="mt-4 max-h-32 space-y-2 overflow-y-auto pr-1">
            {bonusTransactions.slice(0, 6).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm">
                <span className="truncate text-zinc-400">{item.description ?? "Referral reward"}</span>
                <span className="shrink-0 font-bold text-relic">+{item.amountCoins ?? 0}</span>
              </div>
            ))}
            {bonusTransactions.length === 0 ? <p className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-zinc-500">Бонусов пока нет.</p> : null}
          </div>
        </GlassPanel>
      </div>

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
                        <div key={stage.id} className={`rounded-lg border p-3 ${active ? "border-relic bg-relic/[0.12] text-white" : passed ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200" : "border-white/10 bg-black/18 text-zinc-500"}`}>
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
                  <Link className="ml-0 mt-3 inline-flex rounded-lg border border-relic/30 bg-relic/10 px-3 py-2 text-sm font-semibold text-relic transition hover:border-relic hover:bg-relic/20 sm:ml-3" href={`/orders/${lead.id}`}>
                    Открыть страницу заявки
                  </Link>
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
