"use client";

import Link from "next/link";
import { addDoc, collection, deleteDoc, doc, limit, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { MessageCircle, Megaphone, Send, Trash2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { GlassPanel } from "@/components/ui/glass-panel";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

type ClanAnnouncement = {
  id: string;
  uid?: string;
  authorName?: string;
  title?: string;
  text?: string;
  createdAt?: { seconds?: number };
};

function formatDate(item: ClanAnnouncement) {
  if (!item.createdAt?.seconds) {
    return "только что";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(item.createdAt.seconds * 1000));
}

export function ClanBoard() {
  const { profile, user } = useAuth();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [announcements, setAnnouncements] = useState<ClanAnnouncement[]>([]);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const canModerate = profile?.role === "admin" || profile?.role === "owner";

  useEffect(() => {
    const announcementsQuery = query(collection(db, collections.clanAnnouncements), orderBy("createdAt", "desc"), limit(50));

    return onSnapshot(announcementsQuery, (snapshot) => {
      setAnnouncements(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<ClanAnnouncement, "id">) })));
    });
  }, []);

  async function createAnnouncement(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!user || !profile) {
      setStatus("Чтобы разместить объявление, войди в личный кабинет.");
      return;
    }

    setSaving(true);
    setStatus("");

    try {
      await addDoc(collection(db, collections.clanAnnouncements), {
        uid: user.uid,
        authorName: profile.displayName || profile.email,
        title: title.trim(),
        text: text.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setTitle("");
      setText("");
      setStatus("Объявление опубликовано.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось опубликовать объявление.");
    } finally {
      setSaving(false);
    }
  }

  async function removeAnnouncement(item: ClanAnnouncement) {
    if (!user || (item.uid !== user.uid && !canModerate)) {
      return;
    }

    await deleteDoc(doc(db, collections.clanAnnouncements, item.id));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <GlassPanel className="p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-[16px] border border-relic/30 bg-relic/12 text-relic">
            <Megaphone size={22} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-relic">Clan Board</p>
            <h2 className="text-2xl font-black text-white">Объявление клана</h2>
          </div>
        </div>

        {user ? (
          <form onSubmit={createAnnouncement} className="space-y-3">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              maxLength={80}
              placeholder="Название объявления"
              className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
            />
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              required
              maxLength={700}
              rows={7}
              placeholder="Текст объявления: набор в клан, требования, контакты, расписание..."
              className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
            />
            <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-relic px-4 py-3 font-bold text-black disabled:opacity-60">
              <Send size={16} />
              Опубликовать
            </button>
          </form>
        ) : (
          <div className="rounded-[18px] border border-relic/18 bg-black/28 p-4 text-sm leading-6 text-zinc-400">
            Размещать объявления могут зарегистрированные участники. <Link href="/login" className="font-semibold text-relic">Войти</Link>
          </div>
        )}

        {status ? <p className="mt-4 rounded-lg border border-relic/20 bg-relic/[0.08] p-3 text-sm text-zinc-300">{status}</p> : null}
      </GlassPanel>

      <GlassPanel className="p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-relic">Recruiting</p>
            <h2 className="text-2xl font-black text-white">Доска объявлений</h2>
          </div>
          <Users className="text-relic" />
        </div>

        <div className="max-h-[680px] space-y-3 overflow-y-auto pr-1">
          {announcements.map((item) => (
            <article key={item.id} className="rounded-[18px] border border-relic/18 bg-black/28 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-relic">{item.authorName || "Raid Player"} · {formatDate(item)}</p>
                  <h3 className="mt-2 break-words text-xl font-black text-white">{item.title}</h3>
                </div>
                {user && (item.uid === user.uid || canModerate) ? (
                  <button type="button" onClick={() => void removeAnnouncement(item)} className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-blood/30 text-ember hover:bg-blood/15" aria-label="Удалить объявление">
                    <Trash2 size={16} />
                  </button>
                ) : null}
              </div>
              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-zinc-300">{item.text}</p>
              {item.uid && item.uid !== user?.uid ? (
                <Link
                  href={user ? `/chat?user=${item.uid}` : "/login"}
                  className="mt-4 inline-flex items-center gap-2 rounded-md border border-relic/30 bg-relic/10 px-3 py-2 text-sm font-semibold text-relic transition hover:bg-relic hover:text-black"
                >
                  <MessageCircle size={16} />
                  Написать автору
                </Link>
              ) : null}
            </article>
          ))}

          {announcements.length === 0 ? (
            <div className="rounded-[18px] border border-white/10 bg-black/24 p-5 text-sm text-zinc-500">
              Объявлений пока нет. Первое объявление появится здесь сразу после публикации.
            </div>
          ) : null}
        </div>
      </GlassPanel>
    </div>
  );
}
