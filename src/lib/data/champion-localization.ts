import type { ChampionMultiplierEntry } from "@/lib/data/champion-multipliers";
import { raidLegendsRussianNames } from "@/lib/data/raid-legends-russian-names";

const manualRussianNameOverrides: Record<string, string> = {
  "Tekteon Fissureflesh": "Тектеон Фиссурфлеш"
};

const russianAliases: Record<string, string[]> = {
  Arbiter: ["арба", "арбитр"],
  "Duchess Lilitu": ["герцогиня", "лилиту", "дюшес"],
  Harima: ["харима"],
  "Joan the Luminant": ["джоан", "джоан озаренная"],
  "Lady Mikage": ["микаге", "леди микаге"],
  "Marichka the Unbreakable": ["маричка"],
  "Siphi the Lost Bride": ["сифи"],
  "Taras the Fierce": ["тарас"],
  "Tekteon Fissureflesh": ["тектеон", "тектеон фиссурфлеш"],
  "Trunda Giltmallet": ["трунда"],
  Warlord: ["варлорд", "военачальник"],
  Yumeko: ["юмеко"]
};

const transliterationPairs: Array<[RegExp, string]> = [
  [/tion/g, "шн"],
  [/sion/g, "жн"],
  [/ch/g, "ч"],
  [/sh/g, "ш"],
  [/th/g, "т"],
  [/ph/g, "ф"],
  [/kh/g, "х"],
  [/ck/g, "к"],
  [/qu/g, "кв"],
  [/x/g, "кс"],
  [/ya/g, "я"],
  [/yu/g, "ю"],
  [/yo/g, "ё"],
  [/ye/g, "е"],
  [/oo/g, "у"],
  [/ee/g, "и"]
];

const characterMap: Record<string, string> = {
  a: "а",
  b: "б",
  c: "к",
  d: "д",
  e: "е",
  f: "ф",
  g: "г",
  h: "х",
  i: "и",
  j: "дж",
  k: "к",
  l: "л",
  m: "м",
  n: "н",
  o: "о",
  p: "п",
  q: "к",
  r: "р",
  s: "с",
  t: "т",
  u: "у",
  v: "в",
  w: "в",
  y: "й",
  z: "з"
};

function titleCase(value: string) {
  return value.replace(/\S+/g, (word) => word.charAt(0).toUpperCase() + word.slice(1));
}

export function normalizeChampionSearch(value: string) {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]+/gi, " ")
    .trim();
}

export function transliterateChampionName(value: string) {
  let prepared = value.toLowerCase();

  for (const [pattern, replacement] of transliterationPairs) {
    prepared = prepared.replace(pattern, replacement);
  }

  const transliterated = prepared
    .split("")
    .map((character) => characterMap[character] ?? character)
    .join("")
    .replace(/\bте\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return titleCase(transliterated);
}

export function formatEnglishChampionName(nameEn: string) {
  return nameEn.replace(/\bthe\b/g, "The");
}

export function getChampionRussianName(champion: ChampionMultiplierEntry) {
  return champion.nameRu || getChampionRussianNameByEnglish(champion.nameEn);
}

export function getChampionRussianNameByEnglish(nameEn: string) {
  return raidLegendsRussianNames[nameEn] || manualRussianNameOverrides[nameEn] || transliterateChampionName(nameEn);
}

export function getChampionAliases(champion: ChampionMultiplierEntry) {
  const russianName = getChampionRussianName(champion);

  return [
    champion.nameEn,
    formatEnglishChampionName(champion.nameEn),
    champion.nameRu ?? "",
    russianName,
    transliterateChampionName(champion.nameEn),
    ...(russianAliases[champion.nameEn] ?? [])
  ].filter(Boolean);
}

export function getChampionSearchHaystack(champion: ChampionMultiplierEntry) {
  return normalizeChampionSearch([...getChampionAliases(champion), champion.rarity, champion.faction].join(" "));
}
