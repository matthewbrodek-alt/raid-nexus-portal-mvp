"use client";

import { CalendarClock, Save, Trash2 } from "lucide-react";
import { addDoc, collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { CloudinaryAsset } from "@/lib/cloudinary/types";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import type { PortalEventWidget } from "@/lib/types";

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
    throw new Error("Не удалось загрузить изображение.");
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

export function AdminEventWidgetManager() {
  const { profile } = useAuth();
  const [widgets, setWidgets] = useState<PortalEventWidget[]>([]);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [details, setDetails] = useState("");
  const [type, setType] = useState<PortalEventWidget["type"]>("event");
  const [deadlineAt, setDeadlineAt] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [gallery, setGallery] = useState<FileList | null>(null);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const widgetsQuery = query(collection(db, collections.eventWidgets), orderBy("createdAt", "desc"), limit(12));

    return onSnapshot(widgetsQuery, (snapshot) => {
      setWidgets(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<PortalEventWidget, "id">) })));
    });
  }, []);

  const activeWidgets = widgets.filter((item) => item.status !== "archived");

  async function createWidget(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) {
      return;
    }

    if (activeWidgets.length >= 3) {
      setStatus("Максимум 3 активных виджета. Удалите один из текущих перед созданием нового.");
      return;
    }

    setSaving(true);
    setStatus("");

    try {
      const cleanTitle = title.trim();
      const slug = slugify(cleanTitle || `event-${Date.now()}`);
      const cover = image ? await uploadWidgetImage(image, `${slug}/cover`) : null;
      const galleryFiles = Array.from(gallery ?? []).slice(0, 4);
      const galleryAssets = await Promise.all(galleryFiles.map((file, index) => uploadWidgetImage(file, `${slug}/gallery-${index + 1}`)));

      await addDoc(collection(db, collections.eventWidgets), {
        title: cleanTitle,
        comment: comment.trim(),
        details: details.trim(),
        type,
        deadlineAt: deadlineAt ? new Date(deadlineAt).toISOString() : "",
        status: "published",
        image: cover ? { ...cover, alt: cleanTitle } : null,
        gallery: galleryAssets.map((asset, index) => ({ ...asset, alt: `${cleanTitle} ${index + 1}` })),
        participants: [],
        participantCount: 0,
        createdBy: profile.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setTitle("");
      setComment("");
      setDetails("");
      setType("event");
      setDeadlineAt("");
      setImage(null);
      setGallery(null);
      setStatus("Виджет события опубликован.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось создать виджет.");
    } finally {
      setSaving(false);
    }
  }

  async function removeWidget(widgetId: string) {
    const confirmed = window.confirm("Удалить виджет события?");

    if (!confirmed) {
      return;
    }

    await deleteDoc(doc(db, collections.eventWidgets, widgetId));
    setStatus("Виджет удален.");
  }

  return (
    <GlassPanel className="p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <CalendarClock className="text-relic" />
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-relic">Event Widget</p>
          <h2 className="text-xl font-bold text-white sm:text-2xl">Компактные ивенты с таймером</h2>
        </div>
      </div>

      <form onSubmit={createWidget} className="grid gap-3 lg:grid-cols-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          placeholder="Название конкурса / предложения"
          className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
        />
        <select value={type} onChange={(event) => setType(event.target.value as PortalEventWidget["type"])} className="rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic">
          <option value="event">Ивент</option>
          <option value="contest">Конкурс</option>
          <option value="special">Спецпредложение</option>
        </select>
        <input
          value={deadlineAt}
          onChange={(event) => setDeadlineAt(event.target.value)}
          required
          type="datetime-local"
          className="rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic"
        />
        <input
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          placeholder="Короткий комментарий"
          className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
        />
        <textarea
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          rows={4}
          placeholder="Дополнительный текст, условия участия, награды"
          className="rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic lg:col-span-2"
        />
        <label className="text-sm text-zinc-300">
          Главное фото
          <input type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2 file:font-bold file:text-white" />
        </label>
        <label className="text-sm text-zinc-300">
          Дополнительные фото
          <input type="file" accept="image/*" multiple onChange={(event) => setGallery(event.target.files)} className="mt-2 block w-full text-sm text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2 file:font-bold file:text-white" />
        </label>
        <button disabled={saving || activeWidgets.length >= 3} className="inline-flex items-center justify-center gap-2 rounded-md bg-relic px-4 py-3 font-bold text-black disabled:opacity-60 lg:col-span-2">
          <Save size={16} />
          Опубликовать виджет
        </button>
      </form>

      {status ? <p className="mt-4 rounded-lg border border-relic/20 bg-relic/[0.08] p-3 text-sm text-zinc-300">{status}</p> : null}

      <div className="mt-5 grid gap-3 lg:grid-cols-3">
        {activeWidgets.map((widget) => (
          <div key={widget.id} className="rounded-lg border border-white/10 bg-black/25 p-3">
            <p className="truncate font-bold text-white">{widget.title}</p>
            <p className="mt-1 line-clamp-2 text-sm text-zinc-400">{widget.comment}</p>
            <p className="mt-2 text-xs text-relic">{widget.participantCount ?? widget.participants?.length ?? 0} участников</p>
            <button type="button" onClick={() => void removeWidget(widget.id)} className="mt-3 inline-flex items-center gap-2 rounded-md border border-blood/30 px-3 py-2 text-sm font-semibold text-ember hover:bg-blood/15">
              <Trash2 size={15} />
              Удалить
            </button>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
