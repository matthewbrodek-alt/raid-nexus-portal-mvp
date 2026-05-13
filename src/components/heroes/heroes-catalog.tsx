"use client";

import { X } from "lucide-react";
import { collection, deleteDoc, doc, onSnapshot, query, serverTimestamp, updateDoc, where } from "firebase/firestore";
import { useEffect, useState } from "react";
import { HeroCard } from "@/components/heroes/hero-card";
import { useAuth } from "@/components/auth/auth-provider";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import type { HeroProfile } from "@/lib/types";

type FirestoreHero = {
  slug?: string;
  name?: string;
  faction?: string;
  rarity?: string;
  role?: string;
  avatar?: { secureUrl?: string; url?: string };
  gallery?: Array<{ secureUrl?: string; url?: string }>;
  markdownComment?: string;
};

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

function roleLabel(value: string) {
  return raidRoles.find((role) => role.value === value)?.label ?? value;
}

function normalizeRarity(value?: string): HeroProfile["rarity"] {
  const lower = value?.toLowerCase();

  if (lower === "mythical") {
    return "Mythical";
  }

  if (lower === "epic") {
    return "Epic";
  }

  if (lower === "rare") {
    return "Rare";
  }

  return "Legendary";
}

export function HeroesCatalog() {
  const { profile } = useAuth();
  const [heroes, setHeroes] = useState<HeroProfile[]>([]);
  const [selectedHero, setSelectedHero] = useState<HeroProfile | null>(null);
  const [editName, setEditName] = useState("");
  const [editFaction, setEditFaction] = useState("");
  const [editRole, setEditRole] = useState("support");
  const [editComment, setEditComment] = useState("");
  const canManageHeroes = profile?.role === "admin" || profile?.role === "owner";

  useEffect(() => {
    const heroesQuery = query(collection(db, collections.heroes), where("isPublished", "==", true));

    return onSnapshot(heroesQuery, (snapshot) => {
      setHeroes(
        snapshot.docs.map((item) => {
          const data = item.data() as FirestoreHero;

          return {
            id: item.id,
            slug: data.slug ?? item.id,
            name: data.name ?? "Unknown Hero",
            faction: data.faction ?? "Unknown",
            rarity: normalizeRarity(data.rarity),
            role: data.role ?? "support",
            rating: 0,
            avatarUrl: data.avatar?.secureUrl ?? data.avatar?.url,
            galleryUrls: data.gallery?.map((asset) => asset.secureUrl ?? asset.url ?? "").filter(Boolean) ?? [],
            comment: data.markdownComment ?? "Описание пока не заполнено."
          };
        })
      );
    });
  }, []);

  function openHero(hero: HeroProfile) {
    setSelectedHero(hero);
    setEditName(hero.name);
    setEditFaction(hero.faction);
    setEditRole(raidRoles.some((role) => role.value === hero.role) ? hero.role : "support");
    setEditComment(hero.comment);
  }

  async function saveSelectedHero() {
    if (!selectedHero) {
      return;
    }

    await updateDoc(doc(db, collections.heroes, selectedHero.id), {
      name: editName.trim(),
      faction: editFaction || "Unknown",
      role: editRole,
      markdownComment: editComment.trim(),
      updatedAt: serverTimestamp()
    });
  }

  async function deleteSelectedHero() {
    if (!selectedHero || !window.confirm("Удалить героя из базы?")) {
      return;
    }

    await deleteDoc(doc(db, collections.heroes, selectedHero.id));
    setSelectedHero(null);
  }

  return (
    <>
      {heroes.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {heroes.map((hero) => (
            <button key={hero.id} type="button" onClick={() => openHero(hero)} className="block text-left transition hover:-translate-y-1">
              <HeroCard hero={hero} />
            </button>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-white/10 bg-black/25 p-6 text-center">
          <h2 className="text-2xl font-black text-white">База героев пока пустая</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Добавь героев через Content Forge в админ-панели. После этого их можно будет открывать, редактировать и удалять здесь.
          </p>
        </div>
      )}

      {selectedHero ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/78 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="mx-auto grid max-w-6xl gap-6 rounded-lg border border-white/10 bg-[#0d111b] p-4 shadow-2xl lg:grid-cols-[0.95fr_1.05fr]">
            <div
              className="min-h-[430px] rounded-lg border border-white/10 bg-gradient-to-br from-black via-[#1b0e18] to-[#391018] bg-cover bg-center p-5"
              style={
                selectedHero.avatarUrl
                  ? { backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.84)), url(${selectedHero.avatarUrl})` }
                  : undefined
              }
            >
              <div className="flex h-full flex-col justify-end">
                <p className="text-sm text-relic">{selectedHero.faction}</p>
                <h2 className="text-4xl font-black text-white">{selectedHero.name}</h2>
                <span className="mt-4 w-fit rounded-md border border-relic/30 bg-relic/10 px-3 py-2 text-sm font-bold text-relic">
                  {selectedHero.rarity}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 rounded-lg border border-white/10 bg-black/20 p-5">
                <div>
                  <h3 className="text-2xl font-black text-white">Комментарий</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-300">{selectedHero.comment}</p>
                </div>
                <button type="button" onClick={() => setSelectedHero(null)} className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/10 text-zinc-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              {canManageHeroes ? (
                <div className="space-y-3 rounded-lg border border-relic/20 bg-relic/[0.06] p-5">
                  <h3 className="text-xl font-black text-white">Админ-правка</h3>
                  <input value={editName} onChange={(event) => setEditName(event.target.value)} className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic" />
                  <select value={editFaction} onChange={(event) => setEditFaction(event.target.value)} className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic">
                    <option value="">Фракция</option>
                    {raidFactions.map((faction) => (
                      <option key={faction} value={faction}>
                        {faction}
                      </option>
                    ))}
                  </select>
                  <select value={editRole} onChange={(event) => setEditRole(event.target.value)} className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic">
                    {raidRoles.map((role) => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  <textarea value={editComment} onChange={(event) => setEditComment(event.target.value)} rows={4} className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic" />
                  <div className="grid gap-2 sm:grid-cols-2">
                    <button type="button" onClick={() => void saveSelectedHero()} className="rounded-md bg-relic px-4 py-2 font-bold text-black">
                      Сохранить
                    </button>
                    <button type="button" onClick={() => void deleteSelectedHero()} className="rounded-md border border-blood/30 bg-blood/10 px-4 py-2 font-bold text-ember">
                      Удалить
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="rounded-lg border border-white/10 bg-black/20 p-5">
                <h3 className="text-2xl font-black text-white">Галерея</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {selectedHero.galleryUrls.slice(0, 3).map((url, index) => (
                    <div key={url} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
                      <img src={url} alt={`${selectedHero.name} ${index + 1}`} className="aspect-[4/3] w-full object-cover" />
                    </div>
                  ))}
                  {selectedHero.galleryUrls.length === 0 ? (
                    <p className="col-span-full rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-zinc-400">Галерея пока не заполнена.</p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-black/20 p-5">
                <h3 className="text-2xl font-black text-white">Использование</h3>
                <p className="mt-3 text-sm leading-7 text-zinc-400">
                  Роль: {roleLabel(selectedHero.role)}. Рейтинг базы: {selectedHero.rating}/5. Блок готов для билдов, артефактов и заметок администратора.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
