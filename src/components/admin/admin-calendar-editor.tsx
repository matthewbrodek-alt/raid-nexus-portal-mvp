"use client";

import { CalendarPlus, Save, Trash2 } from "lucide-react";
import { addDoc, collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/glass-panel";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

type CalendarItem = {
  id: string;
  title?: string;
  description?: string;
  type?: string;
  date?: string;
  isPublished?: boolean;
};

export function AdminCalendarEditor() {
  const [events, setEvents] = useState<CalendarItem[]>([]);
  const [editingId, setEditingId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("tournament");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const calendarQuery = query(collection(db, collections.heroCalendar), orderBy("createdAt", "desc"), limit(12));

    return onSnapshot(calendarQuery, (snapshot) => {
      setEvents(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<CalendarItem, "id">) })));
    });
  }, []);

  function resetForm() {
    setEditingId("");
    setTitle("");
    setDescription("");
    setDate("");
    setType("tournament");
  }

  function editEvent(event: CalendarItem) {
    setEditingId(event.id);
    setTitle(event.title ?? "");
    setDescription(event.description ?? "");
    setDate(event.date ?? "");
    setType(event.type ?? "tournament");
  }

  async function saveEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = {
      title: title.trim(),
      description: description.trim(),
      date: date.trim(),
      type,
      isPublished: true,
      updatedAt: serverTimestamp()
    };

    if (editingId) {
      await updateDoc(doc(db, collections.heroCalendar, editingId), payload);
      setStatus("Акция обновлена.");
    } else {
      await addDoc(collection(db, collections.heroCalendar), {
        ...payload,
        heroIds: [],
        priority: 1,
        createdAt: serverTimestamp()
      });
      setStatus("Акция добавлена.");
    }

    resetForm();
  }

  async function removeEvent(eventId: string) {
    const confirmed = window.confirm("Удалить акцию из календаря?");

    if (!confirmed) {
      return;
    }

    await deleteDoc(doc(db, collections.heroCalendar, eventId));
    setStatus("Акция удалена.");
  }

  return (
    <GlassPanel className="p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <CalendarPlus className="text-relic" />
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-relic">Event Forge</p>
          <h2 className="text-2xl font-bold text-white">Редактор календаря акций</h2>
        </div>
      </div>

      <form onSubmit={saveEvent} className="space-y-3">
        <input value={title} onChange={(event) => setTitle(event.target.value)} required placeholder="Название акции" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
        <input value={date} onChange={(event) => setDate(event.target.value)} placeholder="Дата / период" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
        <select value={type} onChange={(event) => setType(event.target.value)} className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic">
          <option value="summon">Summon</option>
          <option value="tournament">Tournament</option>
          <option value="fusion">Fusion</option>
          <option value="topup">Top-up</option>
        </select>
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} required placeholder="Описание акции" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
        <div className="grid gap-2 sm:grid-cols-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-md bg-relic px-4 py-3 font-bold text-black">
            <Save size={16} />
            {editingId ? "Сохранить" : "Добавить"}
          </button>
          <button type="button" onClick={resetForm} className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-zinc-300 hover:text-white">
            Очистить
          </button>
        </div>
      </form>

      {status ? <p className="mt-3 rounded-md border border-relic/20 bg-relic/[0.08] p-3 text-sm text-zinc-300">{status}</p> : null}

      <div className="mt-5 max-h-[360px] space-y-2 overflow-y-auto pr-1">
        {events.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/25 p-3">
            <button type="button" onClick={() => editEvent(item)} className="min-w-0 text-left">
              <p className="truncate font-semibold text-white">{item.title}</p>
              <p className="truncate text-xs text-zinc-500">{item.date || "без даты"} · {item.type}</p>
            </button>
            <button type="button" onClick={() => void removeEvent(item.id)} className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-blood/30 text-ember hover:bg-blood/15">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
