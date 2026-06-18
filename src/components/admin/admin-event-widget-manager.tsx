"use client";

import { Archive, CalendarClock, Eye, Gift, ListChecks, RotateCcw, Save, Trophy, X } from "lucide-react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { CloudinaryAsset } from "@/lib/cloudinary/types";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import type { UserProfile } from "@/lib/auth/types";
import type { PortalEventWidget } from "@/lib/types";

type ParticipantProfile = Pick<UserProfile, "uid" | "displayName" | "email" | "bpStatus">;

const emptyForm = {
  comment: "Участвуй и получай шанс выиграть игровые наборы с рубинами!",
  deadlineAt: "",
  details: "",
  donationUrl: "",
  placement: "main",
  prizeFund: "5 паков рубинов",
  startsAt: "",
  title: "Розыгрыш рубинов",
  winnerCount: "5"
};

async function uploadWidgetImage(file: File, publicId: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", "event-widgets");
  formData.append("publicId", publicId);

  const response = await fetch("/api/cloudinary/upload", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(payload?.error ?? "Не удалось загрузить изображение.");
  }

  return (await response.json()) as CloudinaryAsset;
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

function toInputDateTime(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function formatDate(value?: string) {
  if (!value) {
    return "дата не задана";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "дата не задана";
  }

  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "long",
    year: "numeric"
  });
}

function getWidgetDate(widget: PortalEventWidget) {
  const rawDate = widget.deadlineAt || widget.startsAt;
  const date = rawDate ? new Date(rawDate) : new Date(0);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function shuffle<T>(items: T[]) {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

export function AdminEventWidgetManager() {
  const { profile } = useAuth();
  const [widgets, setWidgets] = useState<PortalEventWidget[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [viewingWidget, setViewingWidget] = useState<PortalEventWidget | null>(null);
  const [participantProfiles, setParticipantProfiles] = useState<Record<string, ParticipantProfile>>({});

  useEffect(() => {
    const widgetsQuery = query(collection(db, collections.eventWidgets), orderBy("createdAt", "desc"), limit(40));

    return onSnapshot(widgetsQuery, (snapshot) => {
      setWidgets(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<PortalEventWidget, "id">) })));
    });
  }, []);

  const contestWidgets = useMemo(() => widgets.filter((item) => item.type === "contest"), [widgets]);
  const activeRaffles = useMemo(
    () =>
      contestWidgets
        .filter((item) => item.status !== "archived")
        .sort((first, second) => getWidgetDate(first).getTime() - getWidgetDate(second).getTime()),
    [contestWidgets]
  );
  const archivedRaffles = useMemo(
    () =>
      contestWidgets
        .filter((item) => item.status === "archived")
        .sort((first, second) => getWidgetDate(second).getTime() - getWidgetDate(first).getTime()),
    [contestWidgets]
  );
  const mainRaffles = useMemo(() => activeRaffles.filter((item) => (item.placement ?? "main") === "main"), [activeRaffles]);
  const floatingRaffles = useMemo(() => activeRaffles.filter((item) => item.placement === "floating"), [activeRaffles]);

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId("");
    setImage(null);
  }

  function editWidget(widget: PortalEventWidget) {
    setEditingId(widget.id);
    setForm({
      comment: widget.comment ?? "",
      deadlineAt: toInputDateTime(widget.deadlineAt),
      details: widget.details ?? "",
      donationUrl: widget.donationUrl ?? "",
      placement: widget.placement ?? "main",
      prizeFund: widget.prizeFund ?? "5 паков рубинов",
      startsAt: toInputDateTime(widget.startsAt),
      title: widget.title ?? "Розыгрыш рубинов",
      winnerCount: String(widget.winnerCount ?? 5)
    });
    setImage(null);
    setStatus("Редактирование активного розыгрыша.");
  }

  async function saveWidget(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) {
      return;
    }

    if (!form.deadlineAt) {
      setStatus("Укажи дату окончания розыгрыша.");
      return;
    }

    setSaving(true);
    setStatus("");

    try {
      const cleanTitle = form.title.trim() || "Розыгрыш рубинов";
      const slug = slugify(cleanTitle || `raffle-${Date.now()}`);
      const uploadedImage = image ? await uploadWidgetImage(image, `${slug}/cover-${Date.now()}`) : null;
      const winnerCount = Math.max(1, Math.floor(Number(form.winnerCount) || 1));
      const payload = {
        comment: form.comment.trim(),
        deadlineAt: new Date(form.deadlineAt).toISOString(),
        details: form.details.trim(),
        donationUrl: form.donationUrl.trim(),
        prizeFund: form.prizeFund.trim() || "5 паков рубинов",
        placement: form.placement === "floating" ? ("floating" as const) : ("main" as const),
        startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : "",
        status: "published" as const,
        title: cleanTitle,
        type: "contest" as const,
        winnerCount,
        updatedAt: serverTimestamp(),
        ...(uploadedImage ? { image: { ...uploadedImage, alt: cleanTitle } } : {})
      };

      if (editingId) {
        await updateDoc(doc(db, collections.eventWidgets, editingId), payload);
        setStatus("Розыгрыш обновлен.");
      } else {
        await addDoc(collection(db, collections.eventWidgets), {
          ...payload,
          createdAt: serverTimestamp(),
          createdBy: profile.uid,
          participantCount: 0,
          participants: [],
          winnerName: "",
          winnerUid: "",
          winnerUids: [],
          winners: []
        });
        setStatus("Розыгрыш опубликован.");
      }

      resetForm();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось сохранить розыгрыш.");
    } finally {
      setSaving(false);
    }
  }

  async function archiveWidget(widget: PortalEventWidget) {
    await updateDoc(doc(db, collections.eventWidgets, widget.id), {
      archivedAt: serverTimestamp(),
      status: "archived",
      updatedAt: serverTimestamp()
    });
    setStatus("Розыгрыш перемещен в историю.");
  }

  async function restoreWidget(widget: PortalEventWidget) {
    await updateDoc(doc(db, collections.eventWidgets, widget.id), {
      status: "published",
      updatedAt: serverTimestamp()
    });
    setStatus("Розыгрыш снова опубликован.");
  }

  async function removeWidget(widgetId: string) {
    const confirmed = window.confirm("Удалить розыгрыш навсегда?");

    if (!confirmed) {
      return;
    }

    await deleteDoc(doc(db, collections.eventWidgets, widgetId));
    setStatus("Розыгрыш удален.");
  }

  async function getParticipantProfile(uid: string) {
    const userSnapshot = await getDoc(doc(db, collections.users, uid));
    const userProfile = userSnapshot.exists() ? (userSnapshot.data() as UserProfile) : null;

    return {
      bpStatus: userProfile?.bpStatus,
      displayName: userProfile?.displayName || userProfile?.email || uid,
      email: userProfile?.email ?? "",
      uid
    };
  }

  async function openParticipants(widget: PortalEventWidget) {
    setViewingWidget(widget);
    const participants = widget.participants ?? [];
    const profiles = await Promise.all(participants.map((uid) => getParticipantProfile(uid).catch(() => ({ uid, displayName: uid, email: "" }))));
    setParticipantProfiles(Object.fromEntries(profiles.map((item) => [item.uid, item])));
  }

  async function pickWinners(widget: PortalEventWidget) {
    const participants = Array.from(new Set(widget.participants ?? []));

    if (!participants.length) {
      setStatus("У этого розыгрыша пока нет участников.");
      return;
    }

    const winnerCount = Math.max(1, Math.floor(widget.winnerCount ?? 1));
    const winnerUids = shuffle(participants).slice(0, Math.min(winnerCount, participants.length));
    const winners = await Promise.all(
      winnerUids.map(async (uid) => {
        const participant = await getParticipantProfile(uid).catch(() => ({ uid, displayName: uid, email: "" }));

        return {
          displayName: participant.displayName,
          email: participant.email,
          pickedAtIso: new Date().toISOString(),
          uid
        };
      })
    );

    await updateDoc(doc(db, collections.eventWidgets, widget.id), {
      winnerName: winners[0]?.displayName ?? "",
      winnerPickedAt: serverTimestamp(),
      winnerUid: winnerUids[0] ?? "",
      winnerUids,
      winners,
      updatedAt: serverTimestamp()
    });

    setStatus(`Победителей выбрано: ${winners.length}`);
  }

  function renderRaffleCard(widget: PortalEventWidget, archived = false) {
    const participantCount = widget.participantCount ?? widget.participants?.length ?? 0;
    const winnersCount = widget.winnerUids?.length ?? widget.winners?.length ?? (widget.winnerUid ? 1 : 0);
    const placementLabel = (widget.placement ?? "main") === "floating" ? "Всплывающий виджет" : "Основной блок";

    return (
      <div key={widget.id} className="rounded-2xl border border-relic/20 bg-black/20 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-black text-white">{widget.title || "Розыгрыш рубинов"}</p>
            <p className="mt-1 text-sm text-zinc-400">{formatDate(widget.deadlineAt)}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            <span className="rounded-full border border-relic/25 px-3 py-1 text-xs font-bold text-relic">
              {archived ? "История" : "Активен"}
            </span>
            <span className="rounded-full border border-[#2f7cff]/25 bg-[#2f7cff]/10 px-3 py-1 text-[0.68rem] font-bold text-[#8bbcff]">
              {placementLabel}
            </span>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-zinc-400">{widget.comment}</p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <span className="rounded-xl border border-white/10 bg-black/20 p-3">
            <span className="block text-xs text-zinc-500">Фонд</span>
            <span className="mt-1 block font-black text-white">{widget.prizeFund || "5 паков рубинов"}</span>
          </span>
          <span className="rounded-xl border border-white/10 bg-black/20 p-3">
            <span className="block text-xs text-zinc-500">Участники</span>
            <span className="mt-1 block font-black text-white">{participantCount}</span>
          </span>
          <span className="rounded-xl border border-white/10 bg-black/20 p-3">
            <span className="block text-xs text-zinc-500">Победители</span>
            <span className="mt-1 block font-black text-white">{winnersCount || widget.winnerCount || 1}</span>
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => editWidget(widget)} className="rounded-xl border border-relic/25 px-3 py-2 text-sm font-bold text-relic hover:bg-relic/10">
            Редактировать
          </button>
          <button type="button" onClick={() => void openParticipants(widget)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-zinc-200 hover:border-relic/25">
            <Eye size={15} />
            Участники
          </button>
          <button type="button" onClick={() => void pickWinners(widget)} className="inline-flex items-center gap-2 rounded-xl border border-[#7a46ff]/35 px-3 py-2 text-sm font-bold text-[#b998ff] hover:bg-[#7a46ff]/10">
            <Trophy size={15} />
            Выбрать
          </button>
          {archived ? (
            <button type="button" onClick={() => void restoreWidget(widget)} className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/25 px-3 py-2 text-sm font-bold text-emerald-200 hover:bg-emerald-400/10">
              <RotateCcw size={15} />
              Вернуть
            </button>
          ) : (
            <button type="button" onClick={() => void archiveWidget(widget)} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-zinc-300 hover:border-relic/25">
              <Archive size={15} />
              В историю
            </button>
          )}
          <button type="button" onClick={() => void removeWidget(widget.id)} className="rounded-xl border border-blood/30 px-3 py-2 text-sm font-bold text-ember hover:bg-blood/10">
            Удалить
          </button>
        </div>
      </div>
    );
  }

  return (
    <GlassPanel className="p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <CalendarClock className="text-relic" />
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-relic">Giveaway manager</p>
          <h2 className="text-xl font-bold text-white sm:text-2xl">Управление розыгрышами</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Настрой основной розыгрыш над календарем и отдельный всплывающий виджет: даты, призы, победителей и участников.
          </p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <form onSubmit={saveWidget} className="rounded-2xl border border-relic/20 bg-black/20 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="font-black text-white">{editingId ? "Редактирование розыгрыша" : "Новый розыгрыш"}</p>
            {editingId ? (
              <button type="button" onClick={resetForm} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-zinc-300">
                Сбросить
              </button>
            ) : null}
          </div>

          <div className="grid gap-3">
            <input
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              required
              placeholder="Название"
              className="rounded-xl border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
            />
            <input
              value={form.comment}
              onChange={(event) => updateField("comment", event.target.value)}
              placeholder="Короткое описание"
              className="rounded-xl border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
            />
            <label className="space-y-2 text-sm text-zinc-300">
              Место показа
              <select
                value={form.placement}
                onChange={(event) => updateField("placement", event.target.value)}
                className="w-full rounded-xl border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
              >
                <option value="main">Основной блок над календарем</option>
                <option value="floating">Всплывающий виджет с коротким сроком</option>
              </select>
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-zinc-300">
                Дата старта
                <input
                  value={form.startsAt}
                  onChange={(event) => updateField("startsAt", event.target.value)}
                  type="datetime-local"
                  className="w-full rounded-xl border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
                />
              </label>
              <label className="space-y-2 text-sm text-zinc-300">
                Дата окончания
                <input
                  value={form.deadlineAt}
                  onChange={(event) => updateField("deadlineAt", event.target.value)}
                  required
                  type="datetime-local"
                  className="w-full rounded-xl border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={form.prizeFund}
                onChange={(event) => updateField("prizeFund", event.target.value)}
                placeholder="Количество паков / призовой фонд"
                className="rounded-xl border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
              />
              <input
                value={form.winnerCount}
                onChange={(event) => updateField("winnerCount", event.target.value)}
                min={1}
                type="number"
                placeholder="Количество победителей"
                className="rounded-xl border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
              />
            </div>
            <input
              value={form.donationUrl}
              onChange={(event) => updateField("donationUrl", event.target.value)}
              placeholder="Ссылка на донат-набор или страницу акции, если нужна"
              className="rounded-xl border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
            />
            <textarea
              value={form.details}
              onChange={(event) => updateField("details", event.target.value)}
              rows={4}
              placeholder="Подробное описание / условия / служебная заметка"
              className="rounded-xl border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
            />
            <label className="text-sm text-zinc-300">
              Дополнительная картинка для истории/служебного просмотра
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setImage(event.target.files?.[0] ?? null)}
                className="mt-2 block w-full text-sm text-zinc-300 file:mr-3 file:rounded-xl file:border-0 file:bg-relic file:px-4 file:py-2 file:font-bold file:text-black"
              />
            </label>
            <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-relic px-4 py-3 font-bold text-black disabled:opacity-60">
              <Save size={16} />
              {editingId ? "Сохранить изменения" : "Опубликовать розыгрыш"}
            </button>
          </div>
        </form>

        <div className="space-y-5">
          {status ? <p className="rounded-xl border border-relic/20 bg-relic/[0.08] p-3 text-sm text-zinc-300">{status}</p> : null}

          <section>
            <div className="mb-3 flex items-center gap-2">
              <Gift size={18} className="text-relic" />
              <h3 className="font-black text-white">Основной розыгрыш над календарем</h3>
            </div>
            <div className="grid max-h-[360px] gap-3 overflow-y-auto pr-1">
              {mainRaffles.length ? mainRaffles.map((widget) => renderRaffleCard(widget)) : <p className="rounded-2xl border border-white/10 p-4 text-sm text-zinc-400">Основной розыгрыш пока не задан.</p>}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <Gift size={18} className="text-[#b998ff]" />
              <h3 className="font-black text-white">Всплывающий розыгрыш-виджет</h3>
            </div>
            <div className="grid max-h-[360px] gap-3 overflow-y-auto pr-1">
              {floatingRaffles.length ? floatingRaffles.map((widget) => renderRaffleCard(widget)) : <p className="rounded-2xl border border-white/10 p-4 text-sm text-zinc-400">Виджет не опубликован. Он появится только если выбрать место показа “Всплывающий виджет”.</p>}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2">
              <ListChecks size={18} className="text-relic" />
              <h3 className="font-black text-white">История розыгрышей</h3>
            </div>
            <div className="grid max-h-[360px] gap-3 overflow-y-auto pr-1">
              {archivedRaffles.length ? archivedRaffles.map((widget) => renderRaffleCard(widget, true)) : <p className="rounded-2xl border border-white/10 p-4 text-sm text-zinc-400">Архив пока пуст.</p>}
            </div>
          </section>
        </div>
      </div>

      {viewingWidget ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-3xl overflow-hidden rounded-[28px] border border-relic/20 bg-[#07101d] shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-relic">Участники и победители</p>
                <h3 className="mt-1 text-2xl font-black text-white">{viewingWidget.title}</h3>
              </div>
              <button type="button" onClick={() => setViewingWidget(null)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-zinc-300 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[62vh] overflow-y-auto p-5">
              {(viewingWidget.participants ?? []).length ? (
                <div className="grid gap-2">
                  {(viewingWidget.participants ?? []).map((uid, index) => {
                    const participant = participantProfiles[uid];
                    const isWinner = Boolean(viewingWidget.winnerUids?.includes(uid) || viewingWidget.winnerUid === uid);

                    return (
                      <div key={uid} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                        <div className="min-w-0">
                          <p className="font-bold text-white">
                            {index + 1}. {participant?.displayName ?? uid}
                          </p>
                          <p className="mt-1 truncate text-xs text-zinc-500">{participant?.email || uid}</p>
                        </div>
                        {isWinner ? (
                          <span className="inline-flex items-center gap-2 rounded-full border border-relic/25 bg-relic/10 px-3 py-1 text-xs font-black text-relic">
                            <Trophy size={14} />
                            Победитель
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="rounded-2xl border border-white/10 p-5 text-zinc-400">Участников пока нет.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </GlassPanel>
  );
}
