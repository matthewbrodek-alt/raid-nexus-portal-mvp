import type { ChampionMultiplierEntry } from "@/lib/data/champion-multipliers";

const officialLikeRussianNames: Record<string, string> = {
  "Alaz the Sunbearer": "Алаз Солнценосный",
  "Anaxia the Reborn": "Анаксия Возрожденная",
  "Androc the Glorious": "Андрок Славный",
  "Aphidus the Hivelord": "Афидус Повелитель Улья",
  Arbais: "Арбаис",
  Arbiter: "Арбитр",
  "Arix the Justiciar": "Арикс Юстициар",
  "Cardiel": "Кардиэль",
  "Claidna": "Клейдна",
  "Duchess Lilitu": "Герцогиня Лилиту",
  "Frolni the Mechanist": "Фролни Механист",
  "Galathir": "Галатир",
  "Gharol Bloodmaul": "Гарол Кровавая Кувалда",
  "Gizmak the Terrible": "Гизмак Ужасный",
  "Harima": "Харима",
  "Karnage the Anarch": "Карнаж Анарх",
  "Khoronar": "Хоронар",
  "Krisk the Ageless": "Криск Вневременный",
  "Krixia": "Криксия",
  "Lady Mikage": "Леди Микаге",
  "Lazarius the Incarnate": "Лазариус Воплощенный",
  "Marichka the Unbreakable": "Маричка Несокрушимая",
  "Mezomel Luperfang": "Мезомель Луперфанг",
  "Nais the Shadowthief": "Наис Похититель Теней",
  "Siegfrund the Nephilim": "Зигфрунд Нефилим",
  "Siphi the Lost Bride": "Сифи Потерянная Невеста",
  "Taras the Fierce": "Тарас Свирепый",
  "The Calamitus": "Каламитус",
  "Trunda Giltmallet": "Трунда Позолоченная Булава",
  "Valkyrie": "Валькирия",
  "Venus": "Венера",
  "Warlord": "Военачальник",
  "Wight King Narses": "Король нежити Нарсес",
  "Wight Queen Ankora": "Королева нежити Анкора",
  "Xenomorph": "Ксеноморф",
  "Yumeko": "Юмеко",
  "Zavia": "Завия",
  "Zinogre Blademaster": "Зиногр Мастер Клинка"
};

const russianAliases: Record<string, string[]> = {
  Arbiter: ["арба", "арбитр"],
  "Duchess Lilitu": ["герцогиня", "лилиту", "дюшес"],
  Harima: ["харима"],
  "Krisk the Ageless": ["криск"],
  "Lady Mikage": ["микаге", "леди микаге"],
  "Marichka the Unbreakable": ["маричка"],
  "Siphi the Lost Bride": ["сифи"],
  "Taras the Fierce": ["тарас"],
  "Trunda Giltmallet": ["трунда"],
  Warlord: ["варлорд", "военачальник"],
  Yumeko: ["юмеко"]
};

const replacements: Array<[RegExp, string]> = [
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

  for (const [pattern, replacement] of replacements) {
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

export function getChampionRussianName(champion: ChampionMultiplierEntry) {
  return champion.nameRu || getChampionRussianNameByEnglish(champion.nameEn);
}

export function getChampionRussianNameByEnglish(nameEn: string) {
  return officialLikeRussianNames[nameEn] || transliterateChampionName(nameEn);
}

export function getChampionAliases(champion: ChampionMultiplierEntry) {
  const russianName = getChampionRussianName(champion);

  return [
    champion.nameEn,
    champion.nameRu ?? "",
    russianName,
    transliterateChampionName(champion.nameEn),
    ...(russianAliases[champion.nameEn] ?? [])
  ].filter(Boolean);
}

export function getChampionSearchHaystack(champion: ChampionMultiplierEntry) {
  return normalizeChampionSearch(
    [
      ...getChampionAliases(champion),
      champion.rarity,
      champion.faction,
      ...champion.skills.map((skill) => `${skill.slot} ${skill.name} ${skill.multiplier} ${skill.form ?? ""}`)
    ].join(" ")
  );
}
