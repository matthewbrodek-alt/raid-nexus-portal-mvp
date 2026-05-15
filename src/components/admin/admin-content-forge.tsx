"use client";

import Link from "next/link";
import { ExternalLink, ImagePlus, Newspaper, Plus, Save, ShoppingBag, Trash2 } from "lucide-react";
import { addDoc, collection, deleteDoc, doc, getDoc, limit, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { GlassPanel } from "@/components/ui/glass-panel";
import type { CloudinaryAsset } from "@/lib/cloudinary/types";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

const raidFactions = [
  "Banner Lords",
  "High Elves",
  "The Sacred Order",
  "Barbarians",
  "Ogryn Tribes",
  "Lizardmen",
  "Skinwalkers",
  "Orcs",
  "Demonspawn",
  "Undead Hordes",
  "Dark Elves",
  "Knight Revenant",
  "Dwarves",
  "Shadowkin",
  "Sylvan Watchers",
  "The Nyresan Union"
];

const raidRoles = [
  { value: "support", label: "Поддержка" },
  { value: "attack", label: "Атака" },
  { value: "defense", label: "Защита" },
  { value: "hp", label: "Здоровье" }
];

type ManagedHero = {
  id: string;
  name?: string;
  faction?: string;
  role?: string;
  markdownComment?: string;
  isPublished?: boolean;
};

type PortalOffer = {
  id: string;
  title?: string;
  comment?: string;
  status?: string;
};

async function uploadImage(file: File, publicId: string, folder = "heroes") {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);
  formData.append("publicId", publicId);

  const response = await fetch("/api/cloudinary/upload", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    throw new Error("Не удалось загрузить изображение в Cloudinary.");
  }

  return (await response.json()) as CloudinaryAsset;
}

export function AdminContentForge() {
  const { profile } = useAuth();
  const [newsTitle, setNewsTitle] = useState("");
  const [newsSummary, setNewsSummary] = useState("");
  const [newsBody, setNewsBody] = useState("");
  const [newsImage, setNewsImage] = useState<File | null>(null);
  const [heroName, setHeroName] = useState("");
  const [heroFaction, setHeroFaction] = useState("");
  const [heroRole, setHeroRole] = useState("support");
  const [heroDescription, setHeroDescription] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [gallery, setGallery] = useState<FileList | null>(null);
  const [managedHeroes, setManagedHeroes] = useState<ManagedHero[]>([]);
  const [editingHeroId, setEditingHeroId] = useState("");
  const [editHeroName, setEditHeroName] = useState("");
  const [editHeroFaction, setEditHeroFaction] = useState("");
  const [editHeroRole, setEditHeroRole] = useState("");
  const [editHeroDescription, setEditHeroDescription] = useState("");
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastVideoUrl, setBroadcastVideoUrl] = useState("");
  const [broadcastBackgroundImageUrl, setBroadcastBackgroundImageUrl] = useState("");
  const [offerTitle, setOfferTitle] = useState("");
  const [offerComment, setOfferComment] = useState("");
  const [offerImage, setOfferImage] = useState<File | null>(null);
  const [managedOffers, setManagedOffers] = useState<PortalOffer[]>([]);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const crmUrl = process.env.NEXT_PUBLIC_CRM_URL ?? "#";

  useEffect(() => {
    const heroesQuery = query(collection(db, collections.heroes), orderBy("createdAt", "desc"), limit(12));

    return onSnapshot(heroesQuery, (snapshot) => {
      setManagedHeroes(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<ManagedHero, "id">) })));
    });
  }, []);

  useEffect(() => {
    const offersQuery = query(collection(db, collections.portalOffers), orderBy("createdAt", "desc"), limit(12));

    return onSnapshot(offersQuery, (snapshot) => {
      setManagedOffers(snapshot.docs.map((item) => ({ id: item.id, ...(item.data() as Omit<PortalOffer, "id">) })));
    });
  }, []);

  useEffect(() => {
    void getDoc(doc(db, collections.siteSettings, "homeBroadcast")).then((snapshot) => {
      const data = snapshot.data() as { title?: string; videoUrl?: string; backgroundImageUrl?: string } | undefined;
      setBroadcastTitle(data?.title ?? "Боевой эфир");
      setBroadcastVideoUrl(data?.videoUrl ?? "https://www.youtube.com/embed/MhsY9Uvcx7E");
      setBroadcastBackgroundImageUrl(data?.backgroundImageUrl ?? "");
    });
  }, []);

  async function saveBroadcast(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) {
      return;
    }

    setSaving(true);
    setStatus("");

    try {
      await setDoc(
        doc(db, collections.siteSettings, "homeBroadcast"),
        {
          title: broadcastTitle.trim() || "Боевой эфир",
          videoUrl: broadcastVideoUrl.trim(),
          backgroundImageUrl: broadcastBackgroundImageUrl.trim(),
          updatedBy: profile.uid,
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
      setStatus("Настройки Raid Broadcast сохранены.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось сохранить Raid Broadcast.");
    } finally {
      setSaving(false);
    }
  }

  async function createNews(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) {
      return;
    }

    setSaving(true);
    setStatus("");

    try {
      const title = newsTitle.trim();
      const slug = slugify(title);
      const coverImage = newsImage ? await uploadImage(newsImage, `${slug}/cover`, "news") : null;

      await addDoc(collection(db, collections.news), {
        title,
        slug,
        summary: newsSummary.trim(),
        markdownBody: newsBody.trim(),
        coverImage: coverImage
          ? {
              ...coverImage,
              alt: title
            }
          : null,
        tags: ["hero"],
        status: "published",
        createdBy: profile.uid,
        publishedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      await addDoc(collection(db, collections.heroCalendar), {
        title,
        description: newsSummary.trim(),
        type: "tournament",
        heroIds: [],
        priority: 1,
        isPublished: true,
        createdBy: profile.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setNewsTitle("");
      setNewsSummary("");
      setNewsBody("");
      setNewsImage(null);
      setStatus("Новость добавлена в news и heroCalendar.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось добавить новость.");
    } finally {
      setSaving(false);
    }
  }

  async function createOffer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile) {
      return;
    }

    setSaving(true);
    setStatus("");

    try {
      const title = offerTitle.trim();
      const slug = slugify(title);
      const image = offerImage ? await uploadImage(offerImage, `${slug}/cover`, "offers") : null;

      await addDoc(collection(db, collections.portalOffers), {
        title,
        comment: offerComment.trim(),
        image: image
          ? {
              ...image,
              alt: title
            }
          : null,
        status: "published",
        createdBy: profile.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setOfferTitle("");
      setOfferComment("");
      setOfferImage(null);
      setStatus("Карточка активности опубликована.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось добавить карточку активности.");
    } finally {
      setSaving(false);
    }
  }

  async function removeOffer(offerId: string) {
    const confirmed = window.confirm("Удалить карточку активности?");

    if (!confirmed) {
      return;
    }

    await deleteDoc(doc(db, collections.portalOffers, offerId));
    setStatus("Карточка активности удалена.");
  }

  function startEditHero(hero: ManagedHero) {
    setEditingHeroId(hero.id);
    setEditHeroName(hero.name ?? "");
    setEditHeroFaction(hero.faction ?? "");
    setEditHeroRole(raidRoles.some((role) => role.value === hero.role) ? hero.role ?? "support" : "support");
    setEditHeroDescription(hero.markdownComment ?? "");
  }

  async function saveHeroEdits() {
    if (!editingHeroId) {
      return;
    }

    setSaving(true);
    setStatus("");

    try {
      await updateDoc(doc(db, collections.heroes, editingHeroId), {
        name: editHeroName.trim(),
        faction: editHeroFaction.trim() || "Unknown",
        role: editHeroRole,
        markdownComment: editHeroDescription.trim(),
        updatedAt: serverTimestamp()
      });
      setEditingHeroId("");
      setStatus("Герой обновлен.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось обновить героя.");
    } finally {
      setSaving(false);
    }
  }

  async function removeHero(heroId: string) {
    const confirmed = window.confirm("Удалить героя из базы?");

    if (!confirmed) {
      return;
    }

    await deleteDoc(doc(db, collections.heroes, heroId));
    setStatus("Герой удален.");
  }

  async function createHero(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile || !avatar) {
      setStatus("Добавь имя героя и главное фото.");
      return;
    }

    setSaving(true);
    setStatus("");

    try {
      const name = heroName.trim();
      const slug = slugify(name);
      const avatarAsset = await uploadImage(avatar, `${slug}/avatar`);
      const galleryFiles = Array.from(gallery ?? []).slice(0, 3);
      const galleryAssets = await Promise.all(
        galleryFiles.map((file, index) => uploadImage(file, `${slug}/gallery-${index + 1}`))
      );

      await addDoc(collection(db, collections.heroes), {
        name,
        slug,
        faction: heroFaction.trim() || "Unknown",
        affinity: "void",
        rarity: "legendary",
        role: heroRole,
        avatar: {
          ...avatarAsset,
          alt: name
        },
        gallery: galleryAssets.map((asset, index) => ({
          ...asset,
          alt: `${name} screenshot ${index + 1}`,
          sortOrder: index + 1
        })),
        markdownComment: heroDescription.trim(),
        ratings: {
          arena: 0,
          clanBoss: 0,
          hydra: 0,
          dungeon: 0
        },
        tags: [heroRole, heroFaction.trim()].filter(Boolean),
        isPublished: true,
        createdBy: profile.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setHeroName("");
      setHeroFaction("");
      setHeroRole("support");
      setHeroDescription("");
      setAvatar(null);
      setGallery(null);
      setStatus("Герой добавлен в heroes.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Не удалось добавить героя.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <GlassPanel className="p-5 sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <ImagePlus className="shrink-0 text-relic" />
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-relic">Content Forge</p>
            <h2 className="text-xl font-bold text-white sm:text-2xl">Контент и герои</h2>
          </div>
        </div>
        <Link
          href={crmUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-md border border-relic/30 bg-relic/10 px-4 py-2 text-sm font-semibold text-relic transition hover:bg-relic/15"
        >
          <ExternalLink size={16} />
          Открыть CRM
        </Link>
      </div>

      <form onSubmit={saveBroadcast} className="mb-5 space-y-3 rounded-lg border border-relic/25 bg-black/25 p-4">
        <div className="flex items-center gap-2 text-white">
          <Save size={18} className="text-relic" />
          <h3 className="font-semibold">Raid Broadcast</h3>
        </div>
        <div className="grid gap-3 lg:grid-cols-3">
          <input
            value={broadcastTitle}
            onChange={(event) => setBroadcastTitle(event.target.value)}
            placeholder="Название видео-блока"
            className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
          />
          <input
            value={broadcastVideoUrl}
            onChange={(event) => setBroadcastVideoUrl(event.target.value)}
            placeholder="YouTube embed/link или /videos/broadcast.mp4"
            className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
          />
          <input
            value={broadcastBackgroundImageUrl}
            onChange={(event) => setBroadcastBackgroundImageUrl(event.target.value)}
            placeholder="Фоновая картинка: /images/raid-bg.jpg"
            className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
          />
        </div>
        <p className="text-xs leading-5 text-zinc-500">
          Фон теперь статичный. Если нужна своя картинка, положи файл в public/images и укажи путь вида /images/raid-bg.jpg. Ссылка проигрывателя может быть YouTube или прямой mp4/webm.
        </p>
        <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-md bg-relic px-4 py-3 font-bold text-black disabled:opacity-60">
          <Save size={16} />
          Сохранить Broadcast
        </button>
      </form>

      <form onSubmit={createOffer} className="mb-5 space-y-3 rounded-lg border border-relic/25 bg-black/25 p-4">
        <div className="flex items-center gap-2 text-white">
          <ShoppingBag size={18} className="text-relic" />
          <h3 className="font-semibold">Активность портала / Special Offers</h3>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <input
            value={offerTitle}
            onChange={(event) => setOfferTitle(event.target.value)}
            required
            placeholder="Название карточки"
            className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
          />
          <input
            value={offerComment}
            onChange={(event) => setOfferComment(event.target.value)}
            required
            placeholder="Комментарий / короткое описание"
            className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic"
          />
        </div>
        <label className="block text-sm text-zinc-300">
          Картинка карточки
          <input type="file" accept="image/*" required onChange={(event) => setOfferImage(event.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2 file:font-bold file:text-white" />
        </label>
        <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-md bg-relic px-4 py-3 font-bold text-black disabled:opacity-60">
          <Save size={16} />
          Опубликовать карточку активности
        </button>

        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {managedOffers.map((offer) => (
            <div key={offer.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/25 p-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-white">{offer.title ?? "Без названия"}</p>
                <p className="truncate text-xs text-zinc-500">{offer.comment ?? "Без комментария"}</p>
              </div>
              <button type="button" onClick={() => void removeOffer(offer.id)} className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-blood/30 text-ember hover:bg-blood/15">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </form>

      <div className="grid gap-5 xl:grid-cols-2">
        <form onSubmit={createNews} className="space-y-3 rounded-lg border border-white/10 bg-black/20 p-4">
          <div className="flex items-center gap-2 text-white">
            <Newspaper size={18} className="text-relic" />
            <h3 className="font-semibold">Новость в Hero-секцию</h3>
          </div>
          <input value={newsTitle} onChange={(event) => setNewsTitle(event.target.value)} required placeholder="Заголовок новости" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
          <input value={newsSummary} onChange={(event) => setNewsSummary(event.target.value)} required placeholder="Краткое описание" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
          <label className="block text-sm text-zinc-300">
            Картинка новости
            <input type="file" accept="image/*" onChange={(event) => setNewsImage(event.target.files?.[0] ?? null)} className="mt-2 block w-full text-sm text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2 file:font-bold file:text-white" />
          </label>
          <textarea value={newsBody} onChange={(event) => setNewsBody(event.target.value)} rows={5} placeholder="Текст новости / markdown" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
          <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-relic px-4 py-3 font-bold text-black disabled:opacity-60">
            <Save size={16} />
            Опубликовать
          </button>
        </form>

        <form onSubmit={createHero} className="space-y-3 rounded-lg border border-white/10 bg-black/20 p-4">
          <div className="flex items-center gap-2 text-white">
            <Plus size={18} className="text-relic" />
            <h3 className="font-semibold">Добавить героя</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input value={heroName} onChange={(event) => setHeroName(event.target.value)} required placeholder="Имя героя" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
            <select value={heroFaction} onChange={(event) => setHeroFaction(event.target.value)} required className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic">
              <option value="">Фракция</option>
              {raidFactions.map((faction) => (
                <option key={faction} value={faction}>
                  {faction}
                </option>
              ))}
            </select>
          </div>
          <select value={heroRole} onChange={(event) => setHeroRole(event.target.value)} className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic">
            {raidRoles.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
          <label className="block text-sm text-zinc-300">
            Главное фото
            <input type="file" accept="image/*" onChange={(event) => setAvatar(event.target.files?.[0] ?? null)} required className="mt-2 block w-full text-sm text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-relic file:px-3 file:py-2 file:font-bold file:text-black" />
          </label>
          <label className="block text-sm text-zinc-300">
            3 дополнительных фото
            <input type="file" accept="image/*" multiple onChange={(event) => setGallery(event.target.files)} className="mt-2 block w-full text-sm text-zinc-300 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-2 file:font-bold file:text-white" />
          </label>
          <textarea value={heroDescription} onChange={(event) => setHeroDescription(event.target.value)} rows={5} placeholder="Комментарий / описание героя" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
          <button disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-relic px-4 py-3 font-bold text-black disabled:opacity-60">
            <Save size={16} />
            Добавить в heroes
          </button>
        </form>
      </div>

      {status ? <p className="mt-4 rounded-lg border border-relic/20 bg-relic/[0.08] p-3 text-sm text-zinc-300">{status}</p> : null}

      <div className="mt-6 rounded-lg border border-white/10 bg-black/20 p-4">
        <h3 className="text-lg font-bold text-white">Редактор героев</h3>
        <div className="mt-4 grid gap-3 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
            {managedHeroes.map((hero) => (
              <div key={hero.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-black/25 p-3">
                <button type="button" onClick={() => startEditHero(hero)} className="min-w-0 text-left">
                  <p className="truncate font-semibold text-white">{hero.name ?? "Без имени"}</p>
                  <p className="truncate text-xs text-zinc-500">{hero.faction ?? "Unknown"} · {hero.role ?? "support"}</p>
                </button>
                <button type="button" onClick={() => void removeHero(hero.id)} className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-blood/30 text-ember hover:bg-blood/15">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {managedHeroes.length === 0 ? <p className="text-sm text-zinc-500">Героев из Firestore пока нет.</p> : null}
          </div>

          <div className="space-y-3 rounded-lg border border-white/10 bg-black/25 p-3">
            <input value={editHeroName} onChange={(event) => setEditHeroName(event.target.value)} placeholder="Имя героя" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
            <select value={editHeroFaction} onChange={(event) => setEditHeroFaction(event.target.value)} className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic">
              <option value="">Фракция</option>
              {raidFactions.map((faction) => (
                <option key={faction} value={faction}>
                  {faction}
                </option>
              ))}
            </select>
            <select value={editHeroRole} onChange={(event) => setEditHeroRole(event.target.value)} className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic">
              {raidRoles.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <textarea value={editHeroDescription} onChange={(event) => setEditHeroDescription(event.target.value)} rows={5} placeholder="Описание" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
            <button type="button" disabled={!editingHeroId || saving} onClick={() => void saveHeroEdits()} className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-relic px-4 py-3 font-bold text-black disabled:opacity-60">
              <Save size={16} />
              Сохранить героя
            </button>
          </div>
        </div>
      </div>
    </GlassPanel>
  );
}
