"use client";

import { ExternalLink, Pencil, X } from "lucide-react";
import { collection, deleteDoc, doc, limit, onSnapshot, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { HeroCard } from "@/components/heroes/hero-card";
import { championMultipliers } from "@/lib/data/champion-multipliers";
import { getChampionRussianNameByEnglish, normalizeChampionSearch, transliterateChampionName } from "@/lib/data/champion-localization";
import { gestalChampions, type GestalChampion } from "@/lib/data/gestal-champions";
import { db } from "@/lib/firebase/client";
import { collections } from "@/lib/firebase/collections";
import { useLanguage } from "@/lib/i18n/use-language";
import type { HeroProfile } from "@/lib/types";

type FirestoreHero = {
  slug?: string;
  gestalId?: number;
  shortName?: string;
  name?: string;
  nameRu?: string;
  faction?: string;
  rarity?: string;
  rarityColor?: string;
  affinity?: string;
  aura?: string;
  role?: string;
  roles?: string[];
  rating?: number;
  avatar?: { secureUrl?: string; url?: string };
  avatarUrl?: string;
  portraitUrl?: string;
  borderUrl?: string;
  gallery?: Array<{ secureUrl?: string; url?: string }>;
  galleryUrls?: string[];
  markdownComment?: string;
  comment?: string;
  youtubeVideoId?: string;
  youtubeTitle?: string;
};

type HeroesCatalogProps = {
  affinityFilter?: string;
  factionFilter?: string;
  rarityFilter?: string;
  roleFilter?: string;
  searchQuery?: string;
};

const gestalCdnBaseUrl = "https://cdn.gestal.gg";
const heroesPageSize = 60;

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

const heroRarities: Array<{ value: HeroProfile["rarity"]; label: string }> = [
  { value: "Mythical", label: "Мифический" },
  { value: "Legendary", label: "Легендарный" },
  { value: "Epic", label: "Эпический" },
  { value: "Rare", label: "Редкий" }
];

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

  if (lower === "uncommon") {
    return "Uncommon";
  }

  if (lower === "common") {
    return "Common";
  }

  return "Legendary";
}

function getGestalAvatarUrl(slug: string) {
  return `${gestalCdnBaseUrl}/champions/${slug}/${slug}-avatar.webp`;
}

function getGestalPortraitUrl(slug: string) {
  return `${gestalCdnBaseUrl}/champions/${slug}/${slug}-portrait.webp`;
}

function getGestalBorderUrl(rarity: string) {
  return `${gestalCdnBaseUrl}/borders/${rarity.toLowerCase()}-border.webp`;
}

function mapGestalRoleToPortalRole(role?: string) {
  switch (role?.toLowerCase()) {
    case "attack":
      return "attack";
    case "defense":
      return "defense";
    case "hp":
      return "hp";
    default:
      return "support";
  }
}

function createGestalHero(champion: GestalChampion): HeroProfile {
  return {
    id: `gestal-${champion.id}`,
    gestalId: champion.id,
    source: "gestal",
    slug: champion.slug,
    shortName: champion.shortName,
    name: champion.name,
    nameRu: getChampionRussianNameByEnglish(champion.name),
    faction: champion.faction,
    rarity: normalizeRarity(champion.rarity),
    rarityColor: champion.rarityColor,
    affinity: champion.affinity,
    aura: champion.aura,
    role: mapGestalRoleToPortalRole(champion.roles[0]),
    roles: champion.roles,
    rating: 0,
    avatarUrl: getGestalAvatarUrl(champion.slug),
    portraitUrl: getGestalPortraitUrl(champion.slug),
    borderUrl: getGestalBorderUrl(champion.rarity),
    galleryUrls: [],
    comment: "Официальная карточка героя: аватар, портрет, фракция, редкость, стихия и роль."
  };
}

function sortHeroes(first: HeroProfile, second: HeroProfile) {
  const rarityRank: Record<string, number> = {
    Mythical: 0,
    Legendary: 1,
    Epic: 2,
    Rare: 3,
    Uncommon: 4,
    Common: 5
  };

  return (rarityRank[first.rarity] ?? 99) - (rarityRank[second.rarity] ?? 99) || first.name.localeCompare(second.name);
}

function formatRole(role: string, language: "ru" | "en") {
  if (language === "en") {
    return role;
  }

  const roles: Record<string, string> = {
    attack: "Атака",
    defense: "Защита",
    hp: "Здоровье",
    support: "Поддержка"
  };

  return roles[role.toLowerCase()] ?? role;
}

function formatAffinity(affinity: string | undefined, language: "ru" | "en") {
  if (!affinity) {
    return language === "ru" ? "Без стихии" : "No affinity";
  }

  if (language === "en") {
    return affinity;
  }

  const affinities: Record<string, string> = {
    magic: "Магия",
    force: "Сила",
    spirit: "Дух",
    void: "Тьма"
  };

  return affinities[affinity.toLowerCase()] ?? affinity;
}

function formatRarity(rarity: string, language: "ru" | "en") {
  if (language === "en") {
    return rarity;
  }

  const rarities: Record<string, string> = {
    mythical: "Мифический",
    legendary: "Легендарный",
    epic: "Эпический",
    rare: "Редкий",
    uncommon: "Необычный",
    common: "Обычный"
  };

  return rarities[rarity.toLowerCase()] ?? rarity;
}

function listFromText(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function numberFromText(value: string, fallback = 0) {
  const parsed = Number(value.replace(",", "."));

  return Number.isFinite(parsed) ? parsed : fallback;
}

function getHeroDocumentId(hero: HeroProfile) {
  if (hero.source === "firestore") {
    return hero.id;
  }

  if (hero.gestalId) {
    return `gestal-${hero.gestalId}`;
  }

  return hero.slug ? `gestal-${hero.slug}` : hero.id;
}

export function HeroesCatalog({ affinityFilter = "all", factionFilter = "all", rarityFilter = "all", roleFilter = "all", searchQuery = "" }: HeroesCatalogProps) {
  const { profile } = useAuth();
  const { language } = useLanguage();
  const [firestoreHeroes, setFirestoreHeroes] = useState<HeroProfile[]>([]);
  const [selectedHero, setSelectedHero] = useState<HeroProfile | null>(null);
  const [selectedScreenshot, setSelectedScreenshot] = useState("");
  const [editName, setEditName] = useState("");
  const [editNameRu, setEditNameRu] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editShortName, setEditShortName] = useState("");
  const [editGestalId, setEditGestalId] = useState("");
  const [editFaction, setEditFaction] = useState("");
  const [editRarity, setEditRarity] = useState<HeroProfile["rarity"]>("Legendary");
  const [editRarityColor, setEditRarityColor] = useState("");
  const [editAffinity, setEditAffinity] = useState("");
  const [editRole, setEditRole] = useState("support");
  const [editRoles, setEditRoles] = useState("");
  const [editAura, setEditAura] = useState("");
  const [editRating, setEditRating] = useState("0");
  const [editAvatarUrl, setEditAvatarUrl] = useState("");
  const [editPortraitUrl, setEditPortraitUrl] = useState("");
  const [editBorderUrl, setEditBorderUrl] = useState("");
  const [editGalleryUrls, setEditGalleryUrls] = useState("");
  const [editYoutubeVideoId, setEditYoutubeVideoId] = useState("");
  const [editYoutubeTitle, setEditYoutubeTitle] = useState("");
  const [editComment, setEditComment] = useState("");
  const [isEditingHero, setIsEditingHero] = useState(false);
  const [visibleCount, setVisibleCount] = useState(heroesPageSize);
  const canManageHeroes = profile?.role === "admin" || profile?.role === "owner";

  useEffect(() => {
    const heroesQuery = query(collection(db, collections.heroes), where("isPublished", "==", true), limit(120));

    return onSnapshot(
      heroesQuery,
      (snapshot) => {
        setFirestoreHeroes(
          snapshot.docs.map((item): HeroProfile => {
            const data = item.data() as FirestoreHero;

            return {
              id: item.id,
              source: "firestore",
              slug: data.slug ?? item.id,
              gestalId: data.gestalId,
              shortName: data.shortName,
              name: data.name ?? "Unknown Hero",
              nameRu: data.nameRu,
              faction: data.faction ?? "Unknown",
              rarity: normalizeRarity(data.rarity),
              rarityColor: data.rarityColor,
              affinity: data.affinity,
              aura: data.aura,
              role: data.role ?? "support",
              roles: data.roles?.length ? data.roles : [data.role ?? "support"],
              rating: data.rating ?? 0,
              avatarUrl: data.avatarUrl ?? data.avatar?.secureUrl ?? data.avatar?.url,
              portraitUrl: data.portraitUrl ?? data.avatarUrl ?? data.avatar?.secureUrl ?? data.avatar?.url,
              borderUrl: data.borderUrl,
              galleryUrls: data.galleryUrls?.length ? data.galleryUrls : data.gallery?.map((asset) => asset.secureUrl ?? asset.url ?? "").filter(Boolean) ?? [],
              youtubeVideoId: data.youtubeVideoId,
              youtubeTitle: data.youtubeTitle,
              comment: data.markdownComment ?? "Описание пока не заполнено."
            };
          })
        );
      },
      () => setFirestoreHeroes([])
    );
  }, []);

  const heroes = useMemo(() => {
    const officialHeroes = gestalChampions.map(createGestalHero);
    const customSlugs = new Set(firestoreHeroes.map((hero) => hero.slug).filter(Boolean));

    return [...firestoreHeroes, ...officialHeroes.filter((hero) => !customSlugs.has(hero.slug))].sort(sortHeroes);
  }, [firestoreHeroes]);

  function hydrateHeroEditForm(hero: HeroProfile) {
    setEditName(hero.name);
    setEditNameRu(hero.nameRu ?? getChampionRussianNameByEnglish(hero.name));
    setEditSlug(hero.slug ?? "");
    setEditShortName(hero.shortName ?? "");
    setEditGestalId(hero.gestalId ? String(hero.gestalId) : "");
    setEditFaction(hero.faction);
    setEditRarity(hero.rarity);
    setEditRarityColor(hero.rarityColor ?? "");
    setEditAffinity(hero.affinity ?? "");
    setEditRole(raidRoles.some((role) => role.value === hero.role) ? hero.role : "support");
    setEditRoles((hero.roles?.length ? hero.roles : [hero.role]).filter(Boolean).join(", "));
    setEditAura(hero.aura ?? "");
    setEditRating(String(hero.rating ?? 0));
    setEditAvatarUrl(hero.avatarUrl ?? "");
    setEditPortraitUrl(hero.portraitUrl ?? "");
    setEditBorderUrl(hero.borderUrl ?? "");
    setEditGalleryUrls(hero.galleryUrls.join("\n"));
    setEditYoutubeVideoId(hero.youtubeVideoId ?? "");
    setEditYoutubeTitle(hero.youtubeTitle ?? "");
    setEditComment(hero.comment);
  }

  function openHero(hero: HeroProfile) {
    setSelectedHero(hero);
    setIsEditingHero(false);
    hydrateHeroEditForm(hero);
  }

  function openHeroEditor(hero: HeroProfile) {
    setSelectedHero(hero);
    setIsEditingHero(true);
    hydrateHeroEditForm(hero);
  }

  async function saveSelectedHero() {
    if (!selectedHero || !canManageHeroes) {
      return;
    }

    const targetId = getHeroDocumentId(selectedHero);
    const roles = listFromText(editRoles);
    const nextSlug = selectedHero.source === "firestore" ? editSlug.trim() || selectedHero.slug || targetId : selectedHero.slug || editSlug.trim() || targetId;
    const nextGestalId = editGestalId.trim() ? numberFromText(editGestalId) : selectedHero.gestalId;
    const payload: Record<string, unknown> = {
      name: editName.trim(),
      nameRu: editNameRu.trim(),
      slug: nextSlug,
      gestalId: nextGestalId ?? null,
      shortName: editShortName.trim(),
      faction: editFaction.trim() || "Unknown",
      rarity: editRarity.toLowerCase(),
      rarityColor: editRarityColor.trim(),
      affinity: editAffinity.trim(),
      aura: editAura.trim(),
      role: editRole,
      roles: roles.length ? roles : [editRole],
      rating: numberFromText(editRating),
      avatarUrl: editAvatarUrl.trim(),
      portraitUrl: editPortraitUrl.trim(),
      borderUrl: editBorderUrl.trim(),
      galleryUrls: listFromText(editGalleryUrls).slice(0, 5),
      youtubeVideoId: editYoutubeVideoId.trim(),
      youtubeTitle: editYoutubeTitle.trim(),
      comment: editComment.trim(),
      markdownComment: editComment.trim(),
      isPublished: true,
      updatedAt: serverTimestamp()
    };

    if (selectedHero.source !== "firestore") {
      payload.createdAt = serverTimestamp();
    }

    await setDoc(doc(db, collections.heroes, targetId), payload, { merge: true });
    setSelectedHero({
      ...selectedHero,
      id: targetId,
      source: "firestore",
      slug: nextSlug,
      gestalId: nextGestalId,
      shortName: editShortName.trim(),
      name: editName.trim(),
      nameRu: editNameRu.trim(),
      faction: editFaction.trim() || "Unknown",
      rarity: editRarity,
      rarityColor: editRarityColor.trim(),
      affinity: editAffinity.trim(),
      aura: editAura.trim(),
      role: editRole,
      roles: roles.length ? roles : [editRole],
      rating: numberFromText(editRating),
      avatarUrl: editAvatarUrl.trim(),
      portraitUrl: editPortraitUrl.trim(),
      borderUrl: editBorderUrl.trim(),
      galleryUrls: listFromText(editGalleryUrls).slice(0, 5),
      youtubeVideoId: editYoutubeVideoId.trim(),
      youtubeTitle: editYoutubeTitle.trim(),
      comment: editComment.trim()
    });
    setIsEditingHero(false);
  }

  const filteredHeroes = useMemo(() => {
    const normalizedQuery = normalizeChampionSearch(searchQuery);

    return heroes.filter((hero) => {
      const matchesFaction = factionFilter === "all" || hero.faction === factionFilter;
      const matchesRarity = rarityFilter === "all" || hero.rarity === rarityFilter;
      const matchesAffinity = affinityFilter === "all" || hero.affinity === affinityFilter;
      const roleHaystack = [hero.role, ...(hero.roles ?? [])].map((role) => role.toLowerCase());
      const matchesRole = roleFilter === "all" || roleHaystack.includes(roleFilter.toLowerCase());

      if (!matchesFaction || !matchesRarity || !matchesAffinity || !matchesRole) {
        return false;
      }

      if (normalizedQuery.length < 2) {
        return true;
      }

      const haystack = normalizeChampionSearch(
        [
          hero.name,
          hero.nameRu ?? "",
          getChampionRussianNameByEnglish(hero.name),
          transliterateChampionName(hero.name),
          hero.faction,
          hero.role,
          hero.roles?.join(" ") ?? "",
          hero.rarity,
          hero.affinity ?? "",
          hero.aura ?? "",
          hero.comment
        ].join(" ")
      );

      return haystack.includes(normalizedQuery);
    });
  }, [affinityFilter, factionFilter, heroes, rarityFilter, roleFilter, searchQuery]);

  useEffect(() => {
    setVisibleCount(heroesPageSize);
  }, [affinityFilter, factionFilter, rarityFilter, roleFilter, searchQuery]);

  const visibleHeroes = filteredHeroes.slice(0, visibleCount);

  function getSelectedHeroName(hero: HeroProfile) {
    return language === "ru" ? hero.nameRu || getChampionRussianNameByEnglish(hero.name) : hero.name;
  }

  function getSelectedHeroRoles(hero: HeroProfile) {
    return hero.roles?.length ? hero.roles.map((role) => formatRole(role, language)).join(" / ") : formatRole(hero.role, language);
  }

  const selectedHeroMultiplier = useMemo(() => {
    if (!selectedHero) {
      return null;
    }

    const selectedName = normalizeChampionSearch(selectedHero.name);

    return championMultipliers.find((entry) => normalizeChampionSearch(entry.nameEn) === selectedName) ?? null;
  }, [selectedHero]);

  async function deleteSelectedHero() {
    if (!selectedHero || selectedHero.source !== "firestore" || !window.confirm("Удалить героя из базы?")) {
      return;
    }

    await deleteDoc(doc(db, collections.heroes, selectedHero.id));
    setIsEditingHero(false);
    setSelectedHero(null);
  }

  return (
    <>
      {filteredHeroes.length > 0 ? (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[18px] border border-relic/15 bg-black/25 px-4 py-3 text-sm text-zinc-300">
            <span>
              {language === "ru" ? "Найдено героев" : "Champions found"}: <strong className="text-relic">{filteredHeroes.length}</strong>
            </span>
            <span className="text-xs uppercase tracking-[0.18em] text-zinc-500">{language === "ru" ? "База героев" : "Hero database"}</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleHeroes.map((hero) => (
              <div key={hero.id} className="group/card relative">
                <button type="button" onClick={() => openHero(hero)} className="block w-full text-left transition hover:-translate-y-1">
                  <HeroCard hero={hero} />
                </button>
                {canManageHeroes ? (
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      openHeroEditor(hero);
                    }}
                    className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-xl border border-relic/40 bg-black/75 text-relic opacity-100 shadow-[0_0_24px_rgba(0,0,0,0.45)] backdrop-blur transition hover:bg-relic hover:text-black lg:opacity-0 lg:group-hover/card:opacity-100"
                    aria-label={language === "ru" ? "Редактировать героя" : "Edit champion"}
                  >
                    <Pencil size={16} />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          {visibleCount < filteredHeroes.length ? (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((current) => current + heroesPageSize)}
                className="rounded-2xl border border-relic/35 bg-relic/10 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-relic transition hover:bg-relic hover:text-black"
              >
                {language === "ru" ? "Показать еще" : "Load more"}
              </button>
            </div>
          ) : null}
        </>
      ) : (
        <div className="rounded-lg border border-white/10 bg-black/25 p-6 text-center">
          <h2 className="text-2xl font-black text-white">{heroes.length === 0 ? "База героев пока пустая" : "Герои не найдены"}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            {heroes.length === 0
              ? "Добавь героев через Content Forge в админ-панели. После этого их можно будет открывать, редактировать и удалять здесь."
              : "Измени поисковый запрос, фракцию или роль, чтобы увидеть другие карточки героев."}
          </p>
        </div>
      )}

      {selectedHero ? (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/78 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="mx-auto grid max-w-6xl gap-6 rounded-[24px] border border-relic/25 bg-[#070b12]/95 p-4 shadow-2xl shadow-black/70 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="relative min-h-[540px] overflow-hidden rounded-[22px] border border-relic/20 bg-[radial-gradient(circle_at_50%_18%,rgba(200,154,61,0.18),transparent_34%),linear-gradient(180deg,#101622_0%,#030509_100%)] p-5">
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/42 to-transparent" />
              {selectedHero.portraitUrl ? (
                <img
                  src={selectedHero.portraitUrl}
                  alt={getSelectedHeroName(selectedHero)}
                  loading="eager"
                  decoding="async"
                  className="absolute bottom-0 left-1/2 h-[94%] max-w-none -translate-x-1/2 object-contain drop-shadow-[0_28px_42px_rgba(0,0,0,0.78)]"
                  onError={(event) => {
                    if (!event.currentTarget.dataset.fallback && selectedHero.avatarUrl) {
                      event.currentTarget.dataset.fallback = "true";
                      event.currentTarget.src = selectedHero.avatarUrl;
                      event.currentTarget.className =
                        "absolute bottom-10 left-1/2 h-[70%] max-w-none -translate-x-1/2 object-contain drop-shadow-[0_28px_42px_rgba(0,0,0,0.78)]";
                      return;
                    }

                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : null}
              <div className="absolute left-5 top-5 flex items-center gap-3">
                {selectedHero.avatarUrl ? (
                  <img
                    src={selectedHero.avatarUrl}
                    alt=""
                    loading="eager"
                    decoding="async"
                    className="h-16 w-12 object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.65)]"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : null}
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-relic">{selectedHero.faction}</p>
                  <p className="text-xs text-zinc-400">{formatAffinity(selectedHero.affinity, language)} · {getSelectedHeroRoles(selectedHero)}</p>
                </div>
              </div>
              <div className="relative z-10 flex h-full flex-col justify-end">
                <h2 className="font-[var(--font-cinzel)] text-4xl font-black leading-tight text-white">{getSelectedHeroName(selectedHero)}</h2>
                {language === "ru" && getSelectedHeroName(selectedHero) !== selectedHero.name ? <p className="mt-1 text-sm text-zinc-300">{selectedHero.name}</p> : null}
                <span className="mt-4 w-fit rounded-xl border border-relic/30 bg-relic/10 px-3 py-2 text-sm font-bold text-relic">
                  {formatRarity(selectedHero.rarity, language)}
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4 rounded-[18px] border border-white/10 bg-black/20 p-5">
                <div>
                  <h3 className="text-2xl font-black text-white">Описание</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-300">
                    {selectedHero.comment}
                  </p>
                </div>
                <button type="button" onClick={() => setSelectedHero(null)} className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-white/10 text-zinc-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>

              <div className="rounded-[18px] border border-white/10 bg-black/20 p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-relic">{language === "ru" ? "Урон" : "Damage"}</p>
                    <h3 className="mt-1 text-2xl font-black text-white">{language === "ru" ? "Множители навыков" : "Skill multipliers"}</h3>
                  </div>
                  {selectedHeroMultiplier?.sourceUrl ? (
                    <a
                      href={selectedHeroMultiplier.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl border border-relic/25 bg-relic/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-relic transition hover:bg-relic hover:text-black"
                    >
                      <ExternalLink size={14} />
                      {language === "ru" ? "Источник" : "Source"}
                    </a>
                  ) : null}
                </div>

                {selectedHeroMultiplier ? (
                  <div className="mt-4 grid gap-2">
                    {selectedHeroMultiplier.skills.map((skill, index) => (
                      <div key={`${skill.slot}-${skill.name}-${index}`} className="grid gap-2 rounded-xl border border-relic/15 bg-black/25 p-3 text-sm sm:grid-cols-[82px_1fr_110px] sm:items-center">
                        <span className="font-black text-relic">{skill.slot}</span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-white">{skill.name}</span>
                          {"form" in skill && skill.form ? <span className="text-xs text-zinc-500">{skill.form}</span> : null}
                        </span>
                        <span className="font-black text-white">{skill.multiplier}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-400">
                    {language === "ru" ? "Множители пока не добавлены для этого героя." : "No multipliers have been added for this champion yet."}
                  </p>
                )}
              </div>

              {canManageHeroes ? (
                <div className="space-y-3 rounded-[18px] border border-relic/20 bg-relic/[0.06] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-xl font-black text-white">Админ-редактор героя</h3>
                    {!isEditingHero ? (
                      <button type="button" onClick={() => setIsEditingHero(true)} className="inline-flex items-center justify-center gap-2 rounded-md border border-relic/30 bg-black/30 px-4 py-2 text-sm font-bold text-relic hover:bg-relic hover:text-black">
                        <Pencil size={15} />
                        Редактировать
                      </button>
                    ) : null}
                  </div>

                  {isEditingHero ? (
                    <>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input value={editName} onChange={(event) => setEditName(event.target.value)} placeholder="English name" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
                        <input value={editNameRu} onChange={(event) => setEditNameRu(event.target.value)} placeholder="Русское имя" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
                        <input value={editSlug} onChange={(event) => setEditSlug(event.target.value)} placeholder="slug" disabled={selectedHero.source !== "firestore"} className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 disabled:opacity-50 focus:border-relic focus:ring-relic" />
                        <input value={editShortName} onChange={(event) => setEditShortName(event.target.value)} placeholder="Short name" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
                        <input value={editGestalId} onChange={(event) => setEditGestalId(event.target.value)} placeholder="Internal ID" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
                        <input value={editRarityColor} onChange={(event) => setEditRarityColor(event.target.value)} placeholder="Rarity color, например #f2c66d" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <select value={editFaction} onChange={(event) => setEditFaction(event.target.value)} className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic">
                          <option value="">Фракция</option>
                          {raidFactions.map((faction) => (
                            <option key={faction} value={faction}>
                              {faction}
                            </option>
                          ))}
                        </select>
                        <select value={editRarity} onChange={(event) => setEditRarity(event.target.value as HeroProfile["rarity"])} className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic">
                          {heroRarities.map((rarity) => (
                            <option key={rarity.value} value={rarity.value}>
                              {rarity.label}
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
                        <input value={editAffinity} onChange={(event) => setEditAffinity(event.target.value)} placeholder="Affinity: magic / force / spirit / void" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
                        <input value={editAura} onChange={(event) => setEditAura(event.target.value)} placeholder="Аура" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
                        <input value={editRating} onChange={(event) => setEditRating(event.target.value)} placeholder="Рейтинг" inputMode="decimal" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
                      </div>

                      <input value={editRoles} onChange={(event) => setEditRoles(event.target.value)} placeholder="Роли через запятую: attack, support" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />

                      <div className="grid gap-3 sm:grid-cols-2">
                        <input value={editAvatarUrl} onChange={(event) => setEditAvatarUrl(event.target.value)} placeholder="Avatar URL" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
                        <input value={editPortraitUrl} onChange={(event) => setEditPortraitUrl(event.target.value)} placeholder="Portrait / model URL" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
                        <input value={editBorderUrl} onChange={(event) => setEditBorderUrl(event.target.value)} placeholder="Border URL" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
                        <input value={editYoutubeVideoId} onChange={(event) => setEditYoutubeVideoId(event.target.value)} placeholder="YouTube video ID" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
                        <input value={editYoutubeTitle} onChange={(event) => setEditYoutubeTitle(event.target.value)} placeholder="YouTube title" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic sm:col-span-2" />
                      </div>

                      <textarea value={editGalleryUrls} onChange={(event) => setEditGalleryUrls(event.target.value)} rows={4} placeholder="До 5 ссылок на сборки героя, каждая с новой строки" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
                      <textarea value={editComment} onChange={(event) => setEditComment(event.target.value)} rows={5} placeholder="Описание героя" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />

                      <div className="grid gap-2 sm:grid-cols-3">
                        <button type="button" onClick={() => void saveSelectedHero()} className="rounded-md bg-relic px-4 py-2 font-bold text-black">
                          Сохранить
                        </button>
                        <button type="button" onClick={() => setIsEditingHero(false)} className="rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 font-bold text-zinc-200">
                          Отмена
                        </button>
                        {selectedHero.source === "firestore" ? (
                          <button type="button" onClick={() => void deleteSelectedHero()} className="rounded-md border border-blood/30 bg-blood/10 px-4 py-2 font-bold text-ember">
                            Удалить
                          </button>
                        ) : null}
                      </div>
                    </>
                  ) : (
                    <p className="text-sm leading-6 text-zinc-400">
                      Нажми «Редактировать» или карандаш на карточке, чтобы изменить все параметры героя. Для базовых героев будет создана админская версия без дубля карточки.
                    </p>
                  )}
                </div>
              ) : null}

              {canManageHeroes && selectedHero.id === "__legacy_disabled__" ? (
                <div className="space-y-3 rounded-[18px] border border-relic/20 bg-relic/[0.06] p-5">
                  <h3 className="text-xl font-black text-white">Админ-правка</h3>
                  <input value={editName} onChange={(event) => setEditName(event.target.value)} placeholder="English name" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
                  <input value={editNameRu} onChange={(event) => setEditNameRu(event.target.value)} placeholder="Русское имя" className="w-full rounded-md border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-relic focus:ring-relic" />
                  <select value={editFaction} onChange={(event) => setEditFaction(event.target.value)} className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic">
                    <option value="">Фракция</option>
                    {raidFactions.map((faction) => (
                      <option key={faction} value={faction}>
                        {faction}
                      </option>
                    ))}
                  </select>
                  <select value={editRarity} onChange={(event) => setEditRarity(event.target.value as HeroProfile["rarity"])} className="w-full rounded-md border-white/10 bg-black/30 text-white focus:border-relic focus:ring-relic">
                    {heroRarities.map((rarity) => (
                      <option key={rarity.value} value={rarity.value}>
                        {rarity.label}
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

              <div className="rounded-[18px] border border-white/10 bg-black/20 p-5">
                <h3 className="text-2xl font-black text-white">Сборка героя</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  {selectedHero.galleryUrls.slice(0, 5).map((url, index) => (
                    <button key={url} type="button" onClick={() => setSelectedScreenshot(url)} className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.04] transition hover:border-relic/50">
                      <img src={url} alt={`${selectedHero.name} ${index + 1}`} loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />
                    </button>
                  ))}
                  {selectedHero.galleryUrls.length === 0 ? (
                    <p className="col-span-full rounded-lg border border-white/10 bg-black/20 p-4 text-sm text-zinc-400">
                      {language === "ru" ? "Сборка героя пока не заполнена." : "Hero build is not filled yet."}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {selectedScreenshot ? (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/86 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="relative max-h-[92dvh] w-full max-w-5xl overflow-hidden rounded-[18px] border border-relic/25 bg-black shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedScreenshot("")}
              className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-[14px] border border-relic/35 bg-black/70 text-zinc-300 hover:text-white"
              aria-label="Закрыть скриншот"
            >
              <X size={18} />
            </button>
            <img src={selectedScreenshot} alt="Скриншот сборки героя" loading="eager" decoding="async" className="max-h-[92dvh] w-full object-contain" />
          </div>
        </div>
      ) : null}
    </>
  );
}
