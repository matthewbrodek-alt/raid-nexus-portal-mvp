export type ChampionDamageSkill = {
  slot: string;
  name: string;
  multiplier: string;
  form?: "Base Form" | "Alternate Form" | "Default";
};

export type ChampionMultiplierEntry = {
  nameEn: string;
  nameRu?: string;
  rarity: "Legendary" | "Mythical";
  faction: string;
  sourceUrl: string;
  skills: ChampionDamageSkill[];
};

export const championMultipliers = [
    {
        "nameEn":  "Alaz the Sunbearer",
        "rarity":  "Mythical",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-alaz-the-sunbearer-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Photon Ax",
                           "multiplier":  "2 DEF",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Rolling Thunder",
                           "multiplier":  "4.2 DEF",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Boltquake",
                           "multiplier":  "0.18 HP",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Solar Flare",
                           "multiplier":  "0.3 HP",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Anaxia the Reborn",
        "rarity":  "Mythical",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-anaxia-the-reborn-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Thirsting Sword",
                           "multiplier":  "4 DEF",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Deathplunge",
                           "multiplier":  "3.7 DEF",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "All-Consuming Roar",
                           "multiplier":  "4 DEF",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Blade Axel",
                           "multiplier":  "0.23 HP",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Frenzied Execution",
                           "multiplier":  "0.3 HP",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Soul Separator",
                           "multiplier":  "0.28 HP",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Androc the Glorious",
        "rarity":  "Mythical",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-androc-the-glorious-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Pride’s Bite",
                           "multiplier":  "3.3 DEF",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Radiant Claw",
                           "multiplier":  "3.5 DEF",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Gildthorn Assault",
                           "multiplier":  "3.3 DEF",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Palisade Breaker",
                           "multiplier":  "4 DEF",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Roar of Kitherus",
                           "multiplier":  "4.4 DEF (Non-Boss)",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Aphidus the Hivelord",
        "rarity":  "Mythical",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-aphidus-the-hivelord-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Blink Cut",
                           "multiplier":  "3.9 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Umbral Stingers",
                           "multiplier":  "4 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Blisterbug Horde",
                           "multiplier":  "4 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Crushing Pincers",
                           "multiplier":  "3.7 DEF",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Putrid Cocoon",
                           "multiplier":  "2.5 DEF",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Arachoa Moonspinner",
        "rarity":  "Mythical",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-arachoa-moonspinner-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Mesmeric Fangs",
                           "multiplier":  "3.3 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Moon-Spider Maw",
                           "multiplier":  "5.3 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Astral Ravage",
                           "multiplier":  "2.2 ATK",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Deaththread Spin",
                           "multiplier":  "1.7 ATK + 0.05 ENEMY MAX HP",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Gossamer Execution",
                           "multiplier":  "1.9 ATK",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Arbais the Stonethorn",
        "rarity":  "Mythical",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-arbais-the-stonethorn-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Bladegale",
                           "multiplier":  "3.75 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Boulder Hurl",
                           "multiplier":  "0.27 HP",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Briarburn",
                           "multiplier":  "0.25 HP",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Arne the White",
        "rarity":  "Mythical",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-arne-the-white-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Song of Steel",
                           "multiplier":  "4 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "White-Hot Rage",
                           "multiplier":  "6 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Tempest of Swords",
                           "multiplier":  "0.12 HP + 1.4 ATK",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Glacial Rupture",
                           "multiplier":  "0.35 HP + 1.4 ATK",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Ashnar Dragonsoul",
        "rarity":  "Mythical",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-ashnar-dragonsoul-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Ignition Arc",
                           "multiplier":  "0.09 HP",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Pyroclast Storm",
                           "multiplier":  "0.26 HP",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Thunderstar",
                           "multiplier":  "1.7 DEF",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Magma Geyser",
                           "multiplier":  "4.9 DEF (Single Target), 2.95 DEF (AoE Attack)",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Cataclysm Smash",
                           "multiplier":  "3.35 DEF",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Blood Marchioness Mina",
        "rarity":  "Mythical",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-blood-marchioness-mina-skill-mastery-equip-guide/",
        "skills":  [

                   ]
    },
    {
        "nameEn":  "Cinda Forgeheart",
        "rarity":  "Mythical",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-cinda-forgeheart-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Eruptive Blow",
                           "multiplier":  "?",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Breaker of Metals",
                           "multiplier":  "?",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "In Magma Clad",
                           "multiplier":  "?",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Hammerflame",
                           "multiplier":  "?",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Burning Tempest",
                           "multiplier":  "?",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Total Incineration",
                           "multiplier":  "?",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Embrys the Anomaly",
        "rarity":  "Mythical",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-embrys-the-anomaly-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Fetid Glaive",
                           "multiplier":  "0.19 HP",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "The Unmaking",
                           "multiplier":  "0.27 HP",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Unmaker’s Blade",
                           "multiplier":  "(0.25 + ACC/10000) HP",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Atomize",
                           "multiplier":  "(0.28 + ACC/10000)HP",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Fjorad Wolfheart",
        "rarity":  "Mythical",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-fjorad-wolfheart-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Bite of the Wolf",
                           "multiplier":  "2.6 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Wolfheart’s Rage",
                           "multiplier":  "5.6 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Rimecleave",
                           "multiplier":  "0.28 HP",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Icequake",
                           "multiplier":  "0.3 HP",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Disciple of Tormin",
                           "multiplier":  "0.37 HP",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Frolni the Mechanist",
        "rarity":  "Mythical",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-frolni-the-mechanist-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Seismic Quake",
                           "multiplier":  "0.23 HP",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Bloody Larceny",
                           "multiplier":  "0.34 HP",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Exterminate the Weak",
                           "multiplier":  "0.31 HP",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Arcs of Pain",
                           "multiplier":  "1.79 DEF",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Pulverizing Procedure",
                           "multiplier":  "5.31 DEF",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Galleus Bloodcrest",
        "rarity":  "Mythical",
        "faction":  "Skinwalkers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-galleus-bloodcrest-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Wing Clip",
                           "multiplier":  "3.6 DEF",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Cutting Jibe",
                           "multiplier":  "4.7 DEF",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Fulminous Screech",
                           "multiplier":  "4 DEF (Single-Target), 3 DEF (AoE)",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Sundered Sky",
                           "multiplier":  "4.5 DEF",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Sonic Torture",
                           "multiplier":  "4.7 DEF * (1 + 0.15 * Target’s Active Buffs)",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Gharol Bloodmaul",
        "rarity":  "Mythical",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-gharol-bloodmaul-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Foecrusher",
                           "multiplier":  "0.28 HP + ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Hammerquake",
                           "multiplier":  "0.25 HP + ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Magma Slam",
                           "multiplier":  "2.7 ATK + HP",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Calamitious Maul",
                           "multiplier":  "4 ATK + HP",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Gizmak the Terrible",
        "rarity":  "Mythical",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-gizmak-the-terrible-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Magma Hurl",
                           "multiplier":  "5.5 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Flames of Resentment",
                           "multiplier":  "5.8 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "KABOOM!",
                           "multiplier":  "0.23 HP + 0.7 DEF",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Hierophant Lazarius",
        "rarity":  "Mythical",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-hierophant-lazarius-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Phantom Cobra",
                           "multiplier":  "4 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Nest of Vipers",
                           "multiplier":  "3.8 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Lambent Trident",
                           "multiplier":  "2 ATK",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Destruction Surge",
                           "multiplier":  "3.4 ATK + (3.4 ATK * 0.15 * Total Allies Alive)",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Flame Vulcan",
                           "multiplier":  "2.5 ATK",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Joan the Luminant",
        "rarity":  "Mythical",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-joan-the-luminant-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Sacred Lance",
                           "multiplier":  "(6 + RES/1000) x ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Radiant Blades",
                           "multiplier":  "(2.9 + RES/1000) x ATK",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Pierced By Light",
                           "multiplier":  "(4.4 + RES/1000) x ATK",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Seraphic Swoop",
                           "multiplier":  "(2 + RES/1000) x ATK",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Karnage the Anarch",
        "rarity":  "Mythical",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-karnage-the-anarch-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Sufferslash",
                           "multiplier":  "2.3 (ATK + ACC)",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Devilish Accord",
                           "multiplier":  "3.5 (ATK + ACC)",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Trinity of Pain",
                           "multiplier":  "2.7 (ATK + ACC)",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Demon Stinger",
                           "multiplier":  "1.8 (ATK + ACC)",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Singularity of Pain",
                           "multiplier":  "4 (ATK + ACC)",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Infernal Stars",
                           "multiplier":  "2.5 (ATK + ACC)",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Komidus Darksmile",
        "rarity":  "Mythical",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-komidus-darksmile-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Stoke Anguish",
                           "multiplier":  "0.11 HP",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Agony Overwhelming",
                           "multiplier":  "0.22 HP",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Thief of Joy",
                           "multiplier":  "0.3 HP",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A4",
                           "name":  "Dramatis Miserae (Passive)",
                           "multiplier":  "0.3 HP",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Volatile Performer",
                           "multiplier":  "0.12 HP",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Explosive Showstopper",
                           "multiplier":  "0.25 HP",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Kurosa the Covetous",
        "rarity":  "Mythical",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-kurosa-the-covetous-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Surge Of Chaos",
                           "multiplier":  "3 ATK.",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Icon Of Havoc",
                           "multiplier":  "4 ATK",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Lady Mikage",
        "rarity":  "Mythical",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-lady-mikage-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Shadow Lash",
                           "multiplier":  "3.9 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Silkensnare",
                           "multiplier":  "3.8 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Nightmare Spider",
                           "multiplier":  "3.9 ATK",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Skittering Death",
                           "multiplier":  "3.8 ATK",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Mezomel Luperfang",
        "rarity":  "Mythical",
        "faction":  "Skinwalkers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-mezomel-luperfang-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Moonclaw",
                           "multiplier":  "4.05 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Scarlet Crescent",
                           "multiplier":  "2.8 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Spirit of the Pack",
                           "multiplier":  "2.5 ATK",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Life Shredder",
                           "multiplier":  "2.15 ATK",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Nais the Shadowthief",
        "rarity":  "Mythical",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-nais-the-shadowthief-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Allpiercer",
                           "multiplier":  "0.26 HP + 1.2 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Blackfeather Barrage",
                           "multiplier":  "0.3 HP + 1.85 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Thief’s Omen",
                           "multiplier":  "0.47 HP + 2.5 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Fae Talons",
                           "multiplier":  "0.13 HP",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Murder of Crows",
                           "multiplier":  "0.45 HP",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Nell Blackteeth",
        "rarity":  "Mythical",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-nell-blackteeth-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Entrapment",
                           "multiplier":  "5 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Sickle of Corruption",
                           "multiplier":  "5.2 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Bellyslash",
                           "multiplier":  "1 ATK",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Cut ‘Em Up",
                           "multiplier":  "(Total Crowd Control Debuffs * 6 ATK) + (Total Non Crowd Control Debuffs * 3 ATK)",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Feast of Terror",
                           "multiplier":  "3.9 ATK",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Night Queen Krixia",
        "rarity":  "Mythical",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-night-queen-krixia-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Swordspear Slash",
                           "multiplier":  "2 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Deathly Apparition",
                           "multiplier":  "4 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Bladewing",
                           "multiplier":  "2 ATK",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Rain of Damnation",
                           "multiplier":  "4 ATK",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Polara Fireheart",
        "rarity":  "Mythical",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-polara-fireheart-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Burning Zeal",
                           "multiplier":  "4 DEF + 1.2 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Faithful Conflagration",
                           "multiplier":  "1.8 DEF + 1.2 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Pyro Maxima",
                           "multiplier":  "4 DEF + 1.2 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Glacial Carve",
                           "multiplier":  "3 DEF + 0.8 ATK",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Iceblade Tempest",
                           "multiplier":  "3 DEF + 0.8 ATK",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Sabrael the Distant",
        "rarity":  "Mythical",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-sabrael-the-distant-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Hypnotic Bladework",
                           "multiplier":  "4 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Perfection in Motion",
                           "multiplier":  "2.2 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Sneer of Disdain",
                           "multiplier":  "2.2 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Wrath of Superiority",
                           "multiplier":  "1.5 ATK",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Pinions of Wrath",
                           "multiplier":  "2.5 ATK",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "You Will Weep",
                           "multiplier":  "2.1 ATK",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Siegfrund the Nephilim",
        "rarity":  "Mythical",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-siegfrund-the-nephilim-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Excoriating Edge",
                           "multiplier":  "2 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Seraphic Wave",
                           "multiplier":  "4.6 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Rage of the Nephilim",
                           "multiplier":  "6 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Burn It Out",
                           "multiplier":  "3 ATK",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Starsage Galathir",
        "rarity":  "Mythical",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-starsage-galathir-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Astral Storm",
                           "multiplier":  "3.5 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Uncreation Beam",
                           "multiplier":  "3.5 ATK",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Eclipse Rend",
                           "multiplier":  "5.5 ATK",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "The Calamitus",
        "rarity":  "Mythical",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-the-calamitus-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Reaping Cull",
                           "multiplier":  "2.1 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Horde of Calamity",
                           "multiplier":  "1.8 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Necroclysm",
                           "multiplier":  "4.8 ATK",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Fell Scythe",
                           "multiplier":  "4 ATK",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Final Testament",
                           "multiplier":  "4.2 ATK (1 + 0.1 Target Debuffs)",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Termination",
                           "multiplier":  "4.4 ATK",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Theodosia the Disgraced",
        "rarity":  "Mythical",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-theodosia-the-disgraced-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Serpentia’s Storm",
                           "multiplier":  "0.27 HP",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "I Will Find You",
                           "multiplier":  "0.29 HP",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Baleful Onslaught",
                           "multiplier":  "0.27 HP",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Toshiro the Bloody",
        "rarity":  "Mythical",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-toshiro-the-bloody-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Quick Draw",
                           "multiplier":  "2.8 ATK + 0.1 HP",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Sanguine Darts",
                           "multiplier":  "1.5 ATK + 0.1 HP",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Bloody Typhoon",
                           "multiplier":  "3.5 ATK + 0.1 HP",
                           "form":  "Base Form"
                       },
                       {
                           "slot":  "A1",
                           "name":  "Iai Cut",
                           "multiplier":  "0.16 HP + 0.7 ATK",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Drawn in Blood",
                           "multiplier":  "0.25 HP + 0.7 ATK",
                           "form":  "Alternate Form"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Withering Onslaught",
                           "multiplier":  "0.27 HP + 0.7 ATK",
                           "form":  "Alternate Form"
                       }
                   ]
    },
    {
        "nameEn":  "Abbess",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-abbess-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Arrow of Rebuke",
                           "multiplier":  "2.8 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Mass Impalement",
                           "multiplier":  "5.1 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Divine Wrath",
                           "multiplier":  "4.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Acelin the Stalwart",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-acelin-the-stalwart-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Hammer of Kaerok",
                           "multiplier":  "3.5 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Shield Crush",
                           "multiplier":  "DEF + Total Shield Removed By Unapplied Effect"
                       }
                   ]
    },
    {
        "nameEn":  "Acrizia",
        "rarity":  "Legendary",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-acrizia-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Unflagging Assault",
                           "multiplier":  "0.02 Enemy MAX HP or 2.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Battlefield Domination",
                           "multiplier":  "0.05 Enemy MAX HP or 2 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Shut Down",
                           "multiplier":  "0.05 Enemy MAX HP OR 3 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Admiral Blacktusk",
        "rarity":  "Legendary",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-admiral-blacktusk-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Blacktusk’s Ax",
                           "multiplier":  "3 DEF + 0.2 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Ailil",
        "rarity":  "Legendary",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-ailil-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Gnarled Scythe",
                           "multiplier":  "3.1 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Pierce the Carapace",
                           "multiplier":  "5 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Chill Wind of Autumn",
                           "multiplier":  "4.1 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Alatreon Blademaster",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-alatreon-blademaster-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Foresight Slash",
                           "multiplier":  "0.2 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Reaping Slash",
                           "multiplier":  "0.22 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Aleksandr the Sharpshooter",
        "rarity":  "Legendary",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-aleksandr-the-sharpshooter-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Arctic Warfare",
                           "multiplier":  "3.7 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Spraydown",
                           "multiplier":  "4.6 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Born to Win",
                           "multiplier":  "7 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Alice the Wanderer",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-alice-the-wanderer-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Vorpal Sword",
                           "multiplier":  "1.7 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Clockwork Cyclone",
                           "multiplier":  "4.2 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Queenslayer",
                           "multiplier":  "5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Alsgor Crimsonhorn",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-alsgor-crimsonhorn-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Thunderous Maul",
                           "multiplier":  "0.26 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Crack The Sky",
                           "multiplier":  "0.27 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Altan",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-altan-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Searing Blow",
                           "multiplier":  "3.4 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Wall of Flame",
                           "multiplier":  "5.6 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Amoch the First Satrap",
        "rarity":  "Legendary",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-amoch-the-first-satrap-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Satrap’s Secrets",
                           "multiplier":  "5.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Dragonkin Knowledge",
                           "multiplier":  "6.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Angar",
        "rarity":  "Legendary",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-angar-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Exacerbate",
                           "multiplier":  "0.12 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Infuriate",
                           "multiplier":  "0.27 HP"
                       }
                   ]
    },
    {
        "nameEn":  "April ONeil",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-april-oneil-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Breaking Story",
                           "multiplier":  "4 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Explosive Scoop",
                           "multiplier":  "5.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Aragaz Wyldking",
        "rarity":  "Legendary",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-aragaz-wyldking-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Wyldking Polearm",
                           "multiplier":  "0.26 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Sacrificial Ploy",
                           "multiplier":  "0.5 Target Current HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Cackle of Blades",
                           "multiplier":  "0.3 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Arashi the Riptide",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-arashi-the-riptide-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Concealed Blades",
                           "multiplier":  "0.14 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Nautical Assassin",
                           "multiplier":  "0.34 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Riptide’s Onslaught",
                           "multiplier":  "0.32 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Aratheia Corpseflower",
        "rarity":  "Legendary",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-aratheia-corpseflower-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Hexbloom",
                           "multiplier":  "3.8 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Capricious Spite",
                           "multiplier":  "2 ATK x (1 + 0.1 Enemy Hex Count)"
                       }
                   ]
    },
    {
        "nameEn":  "Arbiter",
        "rarity":  "Legendary",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-arbiter-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Gaze of Justice",
                           "multiplier":  "1.8 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Enforced Humility",
                           "multiplier":  "2.2 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Archbishop Pinthroy",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-archbishop-pinthroy-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Author of Fates",
                           "multiplier":  "4.7 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Holy Word",
                           "multiplier":  "4.8 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Arix",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-arix-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Deathly Arts",
                           "multiplier":  "0.22 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Thornchain Malison",
                           "multiplier":  "0.35 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Armanz the Magnificent",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-armanz-the-magnificent-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Wyrd Blade",
                           "multiplier":  "4 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Greatest Hits",
                           "multiplier":  "4.2 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Arnorn the Shining",
        "rarity":  "Legendary",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-arnorn-the-shining-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Shining Cleave",
                           "multiplier":  "1.75 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Glimmerforce",
                           "multiplier":  "2.7 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Wrath of Hrothglime",
                           "multiplier":  "3.4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Artak",
        "rarity":  "Legendary",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-artak-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Chaosrazor",
                           "multiplier":  "0.1 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Dogs Of War",
                           "multiplier":  "0.25 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Purifyre",
                           "multiplier":  "0.14 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Astralith",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-astralith-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Assault Leader",
                           "multiplier":  "3.6 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Heart Rot",
                           "multiplier":  "5.6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Astralon",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-astralon-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Hellbinder",
                           "multiplier":  "1.7 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Divine Immanence",
                           "multiplier":  "5.8 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Light of Sanctity",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Authoratrix Lamasu",
        "rarity":  "Legendary",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-authoratrix-lamasu-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Zephyr of Conquest",
                           "multiplier":  "2.7 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Ba Satha",
        "rarity":  "Legendary",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-ba-satha-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Death Roll",
                           "multiplier":  "0.24 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Staggering Heft",
                           "multiplier":  "0.27 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Bad-el-Kazar",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-bad-el-kazar-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Dark Sphere",
                           "multiplier":  "2.8 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Baerd the Broad",
        "rarity":  "Legendary",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-baerd-the-broad-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Fierce Friend",
                           "multiplier":  "4 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Thieving Axeman",
                           "multiplier":  "2 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Bucklan’s Strength",
                           "multiplier":  "4.8 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Balar the Lost",
        "rarity":  "Legendary",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-balar-the-lost-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Malignant Thorns",
                           "multiplier":  "3.8 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Twyster of Life",
                           "multiplier":  "5.5 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Monstrous Growth",
                           "multiplier":  "5.8 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Bambus Fourleaf",
        "rarity":  "Legendary",
        "faction":  "Skinwalkers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-bambus-fourleaf-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Bamboo Splinter",
                           "multiplier":  "3.8 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Grovetender",
                           "multiplier":  "5.6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Baron",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-baron-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Trample",
                           "multiplier":  "3.6 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Split Asunder",
                           "multiplier":  "5.5 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Righteous Charge",
                           "multiplier":  "3 ATK x (1 + 0.25 Buff)"
                       },
                       {
                           "slot":  "A4",
                           "name":  "Skypiercer",
                           "multiplier":  "4.3 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Basileus Roanas",
        "rarity":  "Legendary",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-basileus-roanas-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Bolts of Scorn",
                           "multiplier":  "3.6 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Triple Puncture",
                           "multiplier":  "1.8 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Majesty",
                           "multiplier":  "3.7 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Basim Ibn Ishaq",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-basim-ibn-ishaq-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Dagger Swirl",
                           "multiplier":  "2 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Up In Smoke",
                           "multiplier":  "4 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Winds Of Baghdad",
                           "multiplier":  "3.2 ATK"
                       },
                       {
                           "slot":  "A4",
                           "name":  "Everything Is Permitted (Passive)",
                           "multiplier":  "2 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Bayek",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-bayek-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Khopesh Strike",
                           "multiplier":  "3.3 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Desert Zephyr",
                           "multiplier":  "3.8 DEF"
                       },
                       {
                           "slot":  "A5",
                           "name":  "Everything Is Permitted (Passive)",
                           "multiplier":  "2 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Belanor",
        "rarity":  "Legendary",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-belanor-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Swordleader",
                           "multiplier":  "3.6 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Insurmountable",
                           "multiplier":  "4.2 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Overkill",
                           "multiplier":  "6.8 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Belletar Mage Slayer",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-belletar-mage-slayer-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Fume Ax",
                           "multiplier":  "0.22 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Slayer’s Roar",
                           "multiplier":  "0.22 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Belz the Reckoner",
        "rarity":  "Legendary",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-belz-the-reckoner-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Fiendfeller",
                           "multiplier":  "0.22 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Gift of Pain",
                           "multiplier":  "0.3 HP (Single-Target), 0.25 HP (AoE)"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Terra Breach",
                           "multiplier":  "0.27 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Big Un",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-big-un-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Head Splitter",
                           "multiplier":  "2.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Forward Charge",
                           "multiplier":  "3.6 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Molten Slag",
                           "multiplier":  "1.9 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Bivald of the Thorn",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-bivald-of-the-thorn-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Thorn Maul",
                           "multiplier":  "0.25 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Admonition of Barbs",
                           "multiplier":  "0.15 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Briar Nexus",
                           "multiplier":  "0.25 HP * (1 + 0.05 * Debuffs on enemy)"
                       }
                   ]
    },
    {
        "nameEn":  "Black Knight",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-black-knight-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Heavy Blow",
                           "multiplier":  "0.28 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Last Breath",
                           "multiplier":  "0.25 HP * (HP Percent Lost * 10 + 1)"
                       }
                   ]
    },
    {
        "nameEn":  "Bladechorister Caldor",
        "rarity":  "Legendary",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-bladechorister-caldor-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Daggersong",
                           "multiplier":  "2.4 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Rythm’s Crescendo",
                           "multiplier":  "5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Blind Seer",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-blind-seer-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Visions of Death",
                           "multiplier":  "1.3 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Blizaar the Howler",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-blizaar-the-howler-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Frozen Caltrops",
                           "multiplier":  "1.5 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Spike Blizzard",
                           "multiplier":  "4.3 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Bloodgorged",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-bloodgorged-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Break Defense",
                           "multiplier":  "2.2 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Raging Beast",
                           "multiplier":  "4 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Decapitate",
                           "multiplier":  "3.6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Bolint Freewalker",
        "rarity":  "Legendary",
        "faction":  "Skinwalkers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-bolint-freewalker-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Blockade Destroyer",
                           "multiplier":  "0.15 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Fracture Force",
                           "multiplier":  "0.5 HP (Single Target \u0026 AoE Attack)"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Hammer Of Onungburg",
                           "multiplier":  "0.15 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Boragar the Elder",
        "rarity":  "Legendary",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-boragar-the-elder-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Antique Staff",
                           "multiplier":  "0.3 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Brakus the Shifter",
        "rarity":  "Legendary",
        "faction":  "Skinwalkers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-brakus-the-shifter-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Innocent Blood",
                           "multiplier":  "3.75 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Full Moon Rampage",
                           "multiplier":  "0.97 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Hunter’s Howl",
                           "multiplier":  "2.3 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Brewguard Jeroboam",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-brewguard-jeroboam-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Stout Smash",
                           "multiplier":  "1.6 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "This Round’s On Me!",
                           "multiplier":  "0.15 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Bystophus",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-bystophus-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Horror",
                           "multiplier":  "3.3 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Shadow Strike",
                           "multiplier":  "3.2 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Crumble",
                           "multiplier":  "3.2 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Candraphon",
        "rarity":  "Legendary",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-candraphon-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Punish Hubris",
                           "multiplier":  "3 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Butcher’s Glee",
                           "multiplier":  "3.7 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Caoilte the Asharrow",
        "rarity":  "Legendary",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-caoilte-the-asharrow-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Asharrow",
                           "multiplier":  "3.7 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Falling Leaves",
                           "multiplier":  "2.1 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Torrential Pain",
                           "multiplier":  "3.9 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Cardiel",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-cardiel-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Cow the Wicked",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Cecilia the Red Hope",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-cecilia-the-red-hope-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Snow Hurricane",
                           "multiplier":  "3.6 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Verglas Wave",
                           "multiplier":  "2 DEF + 0.05 Enemy Max HP (Total ally above 50% HP)"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Yuletide Abeyance",
                           "multiplier":  "4.4 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Chaagur",
        "rarity":  "Legendary",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-chaagur-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Stupor",
                           "multiplier":  "3.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Venom Storm",
                           "multiplier":  "1.9 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Heart Stopper",
                           "multiplier":  "2.9 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Chalco the Blind",
        "rarity":  "Legendary",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-chalco-the-blind-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Blind Hunger",
                           "multiplier":  "1.8 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Inducer of Panic",
                           "multiplier":  "3 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Unrelenting Violence",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Cheshire Cat",
        "rarity":  "Legendary",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-cheshire-cat-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Phaseclaw",
                           "multiplier":  "(1 + SPD / 100) ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Feline Frenzy",
                           "multiplier":  "(0.5 SPD / 100) ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Grinning Helix",
                           "multiplier":  "(1 + SPD / 100) ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Chronicler Adelyn",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-chronicler-adelyn-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Equivalent Exchange",
                           "multiplier":  "5.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Cillian the Lucky",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-cillian-the-lucky-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Trip Up",
                           "multiplier":  "1.6 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Inflict Misfortune",
                           "multiplier":  "4.3 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Head Ringer",
                           "multiplier":  "5.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Claidna",
        "rarity":  "Legendary",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-claidna-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Touch of Slumber",
                           "multiplier":  "0.28 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Cleopterix",
        "rarity":  "Legendary",
        "faction":  "Skinwalkers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-cleopterix-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Death Dive",
                           "multiplier":  "3.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Feather Barrage",
                           "multiplier":  "4.5 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Sky Punishment",
                           "multiplier":  "4.7 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Corvis the Corruptor",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-corvis-the-corruptor-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Reductive Process",
                           "multiplier":  "3.1 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Medical Miracle",
                           "multiplier":  "1.9 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Field Research",
                           "multiplier":  "2 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Countess Lix",
        "rarity":  "Legendary",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-countess-lix-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Festering Caress",
                           "multiplier":  "1.6 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Mire of Misery",
                           "multiplier":  "1.15 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Time Dilation",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Craklin the Blackened",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-craklin-the-blackened-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A2",
                           "name":  "Blisterblast",
                           "multiplier":  "5.2 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Crohnam",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-crohnam-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Djinn Swords",
                           "multiplier":  "1.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Berserker’s Delight",
                           "multiplier":  "2 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Blazing Zephyr",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Cromax Moonblood",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-cromax-moonblood-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Lunar Lance",
                           "multiplier":  "3.3 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Moonlight Bonds",
                           "multiplier":  "4.5 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Blood Moon",
                           "multiplier":  "3.6 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Cruetraxa",
        "rarity":  "Legendary",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-cruetraxa-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Dire Perforation",
                           "multiplier":  "0.8 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Curse of Writhing",
                           "multiplier":  "6.9 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Crypt-King Graal",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-crypt-king-graal-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Brittleness Bane",
                           "multiplier":  "3.7 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Death Fires",
                           "multiplier":  "3.9 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Elemental Unity",
                           "multiplier":  "3.6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Cupidus",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-cupidus-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Heartbreaker",
                           "multiplier":  "2.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Flames of Passion",
                           "multiplier":  "4 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Flameout",
                           "multiplier":  "6.6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Danag Skullreap",
        "rarity":  "Legendary",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-danag-skullreap-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Shatter Confidence",
                           "multiplier":  "1.9 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Bane of Elves",
                           "multiplier":  "4.2 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Battle Flow",
                           "multiplier":  "5.9 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Deliana",
        "rarity":  "Legendary",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-deliana-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Heart Stealer",
                           "multiplier":  "0.22 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Withering Scorn",
                           "multiplier":  "0.35 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Know Your Place",
                           "multiplier":  "0.3 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Diamant Coppercoin",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-diamant-coppercoin-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "The Hand of Diamant",
                           "multiplier":  "3 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Charitable Donation",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Donatello",
        "rarity":  "Legendary",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-donatello-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Bo-Dacious Bash",
                           "multiplier":  "0.2 *HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Shellshocker",
                           "multiplier":  "0.24 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Dracomorph",
        "rarity":  "Legendary",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-dracomorph-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Seeping Pain",
                           "multiplier":  "3.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Poison Jaws",
                           "multiplier":  "1.3 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Drexthar Bloodtwin",
        "rarity":  "Legendary",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-drexthar-bloodtwin-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Eldritch Flames",
                           "multiplier":  "1 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Burning Lash",
                           "multiplier":  "5.2 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Drokgul the Gaunt",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-drokgul-the-gaunt-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Bonebreak Boulder",
                           "multiplier":  "0.2 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Duchess Lilitu",
        "rarity":  "Legendary",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-duchess-lilitu-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Abyssal Invocation",
                           "multiplier":  "1.7 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Dune Herald Zaharis",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-dune-herald-zaharis-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Hawstrike",
                           "multiplier":  "4.7 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "The Herald Speaks",
                           "multiplier":  "6.4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Dune Lord Greggor",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-dune-lord-greggor-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Desert Ax",
                           "multiplier":  "3.6 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Earthcleave",
                           "multiplier":  "3.8 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Edward Kenway",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-edward-kenway-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Privateer Blitz",
                           "multiplier":  "1.35 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Fan the Hammer",
                           "multiplier":  "2.15 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Between the Eyes",
                           "multiplier":  "6.5 ATK"
                       },
                       {
                           "slot":  "A4",
                           "name":  "Everything is Permitted (Passive)",
                           "multiplier":  "2 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Elder Skarg",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-elder-skarg-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Tide of Steel",
                           "multiplier":  "3 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Hunt the Marked",
                           "multiplier":  "2 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Elegaius",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-elegaius-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Spirits of Spite",
                           "multiplier":  "0.18 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Dead Stop",
                           "multiplier":  "0.27 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Ghost Rage",
                           "multiplier":  "0.2 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Elenaril",
        "rarity":  "Legendary",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-elenaril-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Searing Rebuke",
                           "multiplier":  "3.6 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Smolder",
                           "multiplier":  "4.7 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Elva Autumnborn",
        "rarity":  "Legendary",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-elva-autumnborn-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Scepter of Thriving",
                           "multiplier":  "4.8 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Emic Trunkheart",
        "rarity":  "Legendary",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-emic-trunkheart-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Earthroot Tendril",
                           "multiplier":  "0.24 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Vinequake",
                           "multiplier":  "0.27 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Eostrid Dreamsong",
        "rarity":  "Legendary",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-eostrid-dreamsong-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Slumber Wisp",
                           "multiplier":  "5.4 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Burst of Sprint",
                           "multiplier":  "4.9 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Errol",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-errol-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Blazing Sword",
                           "multiplier":  "3.9 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Helmbreaker",
                           "multiplier":  "1.85 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Negation",
                           "multiplier":  "5.2 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Esme the Dancer",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-esme-the-dancer-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Blade Juggler",
                           "multiplier":  "4.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Earthdancer",
                           "multiplier":  "4.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Ezio Auditore",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-ezio-auditore-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Eagle Dive",
                           "multiplier":  "4 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Da Vinci’s Design",
                           "multiplier":  "4 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Hidden Gun",
                           "multiplier":  "5 ATK"
                       },
                       {
                           "slot":  "A4",
                           "name":  "Everything Is Permitted (Passive)",
                           "multiplier":  "2 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Falmond Mournsword",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-falmond-mournsword-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Mournsword",
                           "multiplier":  "3.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "In Lumaya’s Name",
                           "multiplier":  "3.7 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Burning Courage",
                           "multiplier":  "6 ATK + (0.2 ATK * Removed Debuffs)"
                       }
                   ]
    },
    {
        "nameEn":  "Fatalis Blademaster",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-fatalis-blademaster-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Charged Slash",
                           "multiplier":  "0.22 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Wide Slash",
                           "multiplier":  "0.3 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Strong Wide Slash",
                           "multiplier":  "0.26 HP"
                       },
                       {
                           "slot":  "A4",
                           "name":  "True Charged Slash",
                           "multiplier":  "0.36 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Firrol the Barkhorn",
        "rarity":  "Legendary",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-firrol-the-barkhorn-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Clobbertrunk",
                           "multiplier":  "3.5 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Boreal Growth",
                           "multiplier":  "3.6 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "First Ax Tuskkor",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-first-ax-tuskkor-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Foe Mangler",
                           "multiplier":  "2 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Hatchet Barrage",
                           "multiplier":  "4 ATK x (1 + 0.1 x Active Buff Count)"
                       },
                       {
                           "slot":  "A3",
                           "name":  "First Ax’s Fury",
                           "multiplier":  "3 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Foli",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-foli-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Marked for Destruction",
                           "multiplier":  "0.9 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Biodisruptor",
                           "multiplier":  "1.5 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Sealed Fate",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Fortus",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-fortus-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Taste of Oblivion",
                           "multiplier":  "3 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Horrors Beyond",
                           "multiplier":  "3.8 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Astral Terrors",
                           "multiplier":  "(1 + 0.1 * Total Fear In Round) * 3.5 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Freyja Fateweaver",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-freyja-fateweaver-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Heittspear",
                           "multiplier":  "2.7 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Fu-Shan",
        "rarity":  "Legendary",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-fu-shan-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Howl",
                           "multiplier":  "4 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Frightful Claws",
                           "multiplier":  "2 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Shred",
                           "multiplier":  "1.8 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Fyna Blade of Aravia",
        "rarity":  "Legendary",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-fyna-blade-of-aravia-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Sword Through Time",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Gaellut Son of the Pact",
        "rarity":  "Legendary",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-gaellut-son-of-the-pact-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Beheading Strike",
                           "multiplier":  "0.23 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Gaellen Fury",
                           "multiplier":  "0.28 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Gaius the Gleeful",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-gaius-the-gleeful-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Chuckling Sickles",
                           "multiplier":  "1.8 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Explosive Wit",
                           "multiplier":  "2.9 ATK"
                       },
                       {
                           "slot":  "A4",
                           "name":  "Mad Bomber (Passive)",
                           "multiplier":  "5 ATK (Bomb)"
                       }
                   ]
    },
    {
        "nameEn":  "Gamuran",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-gamuran-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Seal Scroll",
                           "multiplier":  "2 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Thief of Blood",
                           "multiplier":  "3 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Gaspard the Accused",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-gaspard-the-accused-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Links Of Death",
                           "multiplier":  "2.3 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Wretched Guillotine",
                           "multiplier":  "4.1 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "You Stand Accused",
                           "multiplier":  "5.2 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Genzin",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-genzin-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Flowing Cuts",
                           "multiplier":  "1.3 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Steel Parting",
                           "multiplier":  "3.8 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Fated Vengeance",
                           "multiplier":  "5.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Georgid the Breaker",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-georgid-the-breaker-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Breaker Suite",
                           "multiplier":  "1.7 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "March of Tin",
                           "multiplier":  "4 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Deadly Ballet",
                           "multiplier":  "5.7 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Ghostborn",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-ghostborn-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Energy Bolt",
                           "multiplier":  "4.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Petrify",
                           "multiplier":  "1 ATK x (2 + SPD/100)"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Ancestral Spirits",
                           "multiplier":  "3.8 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Giath the Truthshield",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-giath-the-truthshield-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Revelation Spear",
                           "multiplier":  "3.4 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Truth Beheld",
                           "multiplier":  "3.7 DEF + (3.7 DEF * 0.05 * Total Duration Increased)"
                       }
                   ]
    },
    {
        "nameEn":  "Ginro the Stork",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-ginro-the-stork-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Plunging Beak",
                           "multiplier":  "3.3 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Befuddle",
                           "multiplier":  "4.9 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Glaicad of the Meltwater",
        "rarity":  "Legendary",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-glaicad-of-the-meltwater-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Boreal Bolt",
                           "multiplier":  "3.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Gliseah Soulguide",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-gliseah-soulguide-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Glittering Smash",
                           "multiplier":  "3.2 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Breath of Rime",
                           "multiplier":  "3.3 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Glorious Pallas",
        "rarity":  "Legendary",
        "faction":  "AR",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-glorious-pallas-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Spear of Serenity",
                           "multiplier":  "6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Gnishak Verminlord",
        "rarity":  "Legendary",
        "faction":  "Skinwalkers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-gnishak-verminlord-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Pestilent Censer",
                           "multiplier":  "1.2 ATK (5 ATK Bombs)"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Verminlord’s Command",
                           "multiplier":  "4.6 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Unclean Banquet",
                           "multiplier":  "4.5 ATK (5 ATK Bombs)"
                       }
                   ]
    },
    {
        "nameEn":  "Gnut",
        "rarity":  "Legendary",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-gnut-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Dwarven Might",
                           "multiplier":  "1.1 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Fury of the King",
                           "multiplier":  "3.5 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Blessed Bash",
                           "multiplier":  "1.5 DEF + 10% TARGET HP"
                       }
                   ]
    },
    {
        "nameEn":  "Goffred Brassclad",
        "rarity":  "Legendary",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-goffred-brassclad-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Mete Punishment",
                           "multiplier":  "1.8 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Concuss",
                           "multiplier":  "3.7 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Gomlok Skyhide",
        "rarity":  "Legendary",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-gomlok-skyhide-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Soulsuck Tendrils",
                           "multiplier":  "4.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Fateful Trickster",
                           "multiplier":  "5.8 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Wild Surge",
                           "multiplier":  "2.3 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Graazur Irongut",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-graazur-irongut-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Defend The Wall!",
                           "multiplier":  "3.1 DEF (Shield: 1.1 DEF)"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Healing Bombardment",
                           "multiplier":  "0.1 Enemy Max HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Let None Pass!",
                           "multiplier":  "4 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Gracchos Turn Drake",
        "rarity":  "Legendary",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-gracchos-turn-drake-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Chaff-Reaper",
                           "multiplier":  "0.23 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Culler of the Weak",
                           "multiplier":  "0.15 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Grand Oak Padraig",
        "rarity":  "Legendary",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-grand-oak-padraig-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Snakeroot",
                           "multiplier":  "3.3 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Granyt Doorkeep",
        "rarity":  "Legendary",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-granyt-doorkeep-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "You’re Barred!",
                           "multiplier":  "0.1 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Geode Haymaker",
                           "multiplier":  "0.27 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Demolisher Blow",
                           "multiplier":  "0.35 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Greathoof Loriaca",
        "rarity":  "Legendary",
        "faction":  "Skinwalkers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-greathoof-loriaca-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Deprive",
                           "multiplier":  "2.4 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Greathood Stampede",
                           "multiplier":  "4.1 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Greenwarden Ruarc",
        "rarity":  "Legendary",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-greenwarden-ruarc-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Sword of the Glades",
                           "multiplier":  "2.5 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Rust Consume You",
                           "multiplier":  "3.3 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Gretel Hagbane",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-gretel-hagbane-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Evil Undone",
                           "multiplier":  "3.8 ATK (Single Target), 2.4 ATK (AoE)"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Shadowseeker Bolts",
                           "multiplier":  "1.4 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Sacred Ritual",
                           "multiplier":  "4.1 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Grohak the Bloodied",
        "rarity":  "Legendary",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-grohak-the-bloodied-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Sap Swiftness",
                           "multiplier":  "1.9 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Unbound Anger",
                           "multiplier":  "3.7 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Lord of War",
                           "multiplier":  "5.9 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Gronjarr",
        "rarity":  "Legendary",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-gronjarr-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Pyro Pummel",
                           "multiplier":  "0.1 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Shatter Falsity",
                           "multiplier":  "0.15 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Grugtha Darkseer",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-grugtha-darkseer-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "If Looks Could Kill",
                           "multiplier":  "?"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Siroth’s Favoured",
                           "multiplier":  "?"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Bloody Poleax",
                           "multiplier":  "?"
                       }
                   ]
    },
    {
        "nameEn":  "Gurgoh the Augur",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-gurgoh-the-augur-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Icebreaker",
                           "multiplier":  "2 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Avalanche",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Gurptuk Moss-Beard",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-gurptuk-moss-beard-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Biotic Staff",
                           "multiplier":  "2.2 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Guurda Bogbrew",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-guurda-bogbrew-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Brew Mama",
                           "multiplier":  "3.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Rotlimb Decoction",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Gwyndolin the Silent",
        "rarity":  "Legendary",
        "faction":  "Skinwalkers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-gwyndolin-the-silent-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Talonrake",
                           "multiplier":  "1.1 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Sickle Boomerangs",
                           "multiplier":  "3.5 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Plumedart",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Hakkorhn Smashlord",
        "rarity":  "Legendary",
        "faction":  "Skinwalkers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-hakkorhn-smashlord-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Inhuman Force",
                           "multiplier":  "0.2 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Blood Offering",
                           "multiplier":  "0.28 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Hansel Witchhunter",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-hansel-witchhunter-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Purge All Evil",
                           "multiplier":  "3.5 ATK (Single Target), 2.3 ATK (AoE)"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Sanctified Knives",
                           "multiplier":  "2.8 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Baneful Burst",
                           "multiplier":  "3.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Harima",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-harima-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Debasement",
                           "multiplier":  "3.3 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Purgative Punishment",
                           "multiplier":  "1.6 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Celestial Awe",
                           "multiplier":  "3.9 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Harvest Jack",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-harvest-jack-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Harvest of Fear",
                           "multiplier":  "0.06 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Dreams to Ash",
                           "multiplier":  "0.16 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Lord of Terror",
                           "multiplier":  "0.21 HP"
                       }
                   ]
    },
    {
        "nameEn":  "He-Man",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-he-man-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Eternian Slash",
                           "multiplier":  "3 ATK + 0.12 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Luminous Cleave",
                           "multiplier":  "5.5 ATK + 0.15 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "I Have The Power!",
                           "multiplier":  "3.5 ATK + 0.2 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Hegemon",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-hegemon-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Grave’s Grasp",
                           "multiplier":  "1.7 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Numbing Chill",
                           "multiplier":  "3.7 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Helicath",
        "rarity":  "Legendary",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-helicath-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Pyroclastic Claw",
                           "multiplier":  "1.8 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Winds of the Pit",
                           "multiplier":  "3.8 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Helior",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-helior-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Sunshine Halberd",
                           "multiplier":  "3.2 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Solar Blessing",
                           "multiplier":  "3 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Hephraak",
        "rarity":  "Legendary",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-hephraak-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Hephraak’s Grin",
                           "multiplier":  "2.2 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Hephraak’s Scorn",
                           "multiplier":  "3.6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "High Keeper Prysma",
        "rarity":  "Legendary",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-high-keeper-prysma-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Sunburst Hail",
                           "multiplier":  "2.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Shining Blitz",
                           "multiplier":  "6.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Highmother Maud",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-highmother-maud-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Blessed Spear",
                           "multiplier":  "4.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Anointed Phalanx",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Hilvi the Rime Called",
        "rarity":  "Legendary",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-hilvi-the-rime-called-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Frostflame Torch",
                           "multiplier":  "2.6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Holsring",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-holsring-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Rampant Blows",
                           "multiplier":  "1.7 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Overthrow",
                           "multiplier":  "1.95 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Witchfinder",
                           "multiplier":  "1.75 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Hurndig",
        "rarity":  "Legendary",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-hurndig-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Lethal Lust",
                           "multiplier":  "4 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Arcane Tempest",
                           "multiplier":  "4.4 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Stasis Strike",
                           "multiplier":  "6.2 ATK (Single-Target) + 4 ATK (AoE)"
                       }
                   ]
    },
    {
        "nameEn":  "Ignatius",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-ignatius-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Skull Rattle",
                           "multiplier":  "3.8 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Battle Shout",
                           "multiplier":  "4.9 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Turn to Ash",
                           "multiplier":  "5.6 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Inithwe Bloodtwin",
        "rarity":  "Legendary",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-inithwe-bloodtwin-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Vitality Censure",
                           "multiplier":  "3.6 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "No Mercy",
                           "multiplier":  "1.6 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Tormenting Whispers",
                           "multiplier":  "3.6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Iron Brago",
        "rarity":  "Legendary",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-iron-brago-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Molten Pummeling",
                           "multiplier":  "3.6 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Fearless Charge",
                           "multiplier":  "5.1 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Battle Storm",
                           "multiplier":  "3.7 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Ishiyama the Immovable",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-ishiyama-the-immovable-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Burning Comet",
                           "multiplier":  "0.14 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Calculated Volley",
                           "multiplier":  "0.3 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Finish Them",
                           "multiplier":  "0.34 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Ithos",
        "rarity":  "Legendary",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-ithos-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Gouge",
                           "multiplier":  "3.8 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Outburst",
                           "multiplier":  "1.35 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Extinguish Life",
                           "multiplier":  "4.4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Iudex Artor",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-iudex-artor-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Censer Whirl",
                           "multiplier":  "3.4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Jagg Bonesaw",
        "rarity":  "Legendary",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-jagg-bonesaw-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Razorwheel",
                           "multiplier":  "3.7 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Shred The Flesh",
                           "multiplier":  "3 ATK + (3 ATK * 0.1 * Debuffs Transferred)"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Lacerating Tempest",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Jetni the Giant",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-jetni-the-giant-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Splinter Steel",
                           "multiplier":  "1.9 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Barrier Breach",
                           "multiplier":  "3.8 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Towering Might",
                           "multiplier":  "1.9 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Jingwon",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-jingwon-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Doom Exchange",
                           "multiplier":  "0.23 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Compound Calamity",
                           "multiplier":  "0.28 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Power Flare",
                           "multiplier":  "0.14 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Jintoro",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-jintoro-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Soul Drinker",
                           "multiplier":  "3.8 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Blood Freeze",
                           "multiplier":  "5.8 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Oni’s Rage",
                           "multiplier":  "5.7 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Kaja the Wry",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-kaja-the-wry-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Firecracker",
                           "multiplier":  "4.7 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Kalvalax",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-kalvalax-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Oozing Greatsword",
                           "multiplier":  "3.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Corruption Locus",
                           "multiplier":  "2 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Storm of Vitriol",
                           "multiplier":  "3.5 ATK + (Poison Count * 0.01 * Enemy Max HP)"
                       }
                   ]
    },
    {
        "nameEn":  "Kantra the Cyclone",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-kantra-the-cyclone-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Bane Hatchet",
                           "multiplier":  "1.6 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Chaos Tempest",
                           "multiplier":  "1 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Karato Foxhunter",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-karato-foxhunter-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Three Visitations",
                           "multiplier":  "1.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Bedevil",
                           "multiplier":  "6.5 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Suppression Ward",
                           "multiplier":  "4.65 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Karilon the Ringer",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-karilon-the-ringer-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Deathknell",
                           "multiplier":  "2.6 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Canticle of Cold",
                           "multiplier":  "3.2 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Kassandra",
        "rarity":  "Legendary",
        "faction":  "AR",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-kassandra-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "West Wind Rush",
                           "multiplier":  "1.35 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Spear Of Leonidas",
                           "multiplier":  "6.5 ATK"
                       },
                       {
                           "slot":  "A4",
                           "name":  "Everything Is Permitted (Passive)",
                           "multiplier":  "2 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Kawn Branchbreaker",
        "rarity":  "Legendary",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-kawn-branchbreaker-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Timbermarket",
                           "multiplier":  "3.5 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Barkbreaker",
                           "multiplier":  "3.9 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Keberon the Underflame",
        "rarity":  "Legendary",
        "faction":  "AR",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-keberon-the-underflame-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Fiery Rend",
                           "multiplier":  "1.8 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Searing Brand",
                           "multiplier":  "2.8 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Pyrenei Power",
                           "multiplier":  "4.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Keeyra the Watcher",
        "rarity":  "Legendary",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-keeyra-the-watcher-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Falling Star Crush",
                           "multiplier":  "3.6 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Smashing Spree",
                           "multiplier":  "3.8 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Kerin the Harvester",
        "rarity":  "Legendary",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-kerin-the-harvester-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Biting Infestation",
                           "multiplier":  "4.1 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Threshmaster",
                           "multiplier":  "7.5 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Sleepstingers",
                           "multiplier":  "5.4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Khoronar",
        "rarity":  "Legendary",
        "faction":  "Skinwalkers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-khoronar-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Flourish of Slaughter",
                           "multiplier":  "0.16 HP (without Minaya)"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Battle Waltz",
                           "multiplier":  "0.3 HP"
                       }
                   ]
    },
    {
        "nameEn":  "King Gallcobar",
        "rarity":  "Legendary",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-king-gallcobar-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Tanglestaff",
                           "multiplier":  "3.75 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Vitriolic Thorns",
                           "multiplier":  "4.2 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "King Garog",
        "rarity":  "Legendary",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-king-garog-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Gigantic Cleavers",
                           "multiplier":  "1.8 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Hack to Bits",
                           "multiplier":  "1.5 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Gore Maker",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Klaazag Keyhulk",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-klaazag-keyhulk-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Dreadtone",
                           "multiplier":  "3.3 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Seismic Dissonance",
                           "multiplier":  "2 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Knave of Hearts",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-knave-of-hearts-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Thornblade",
                           "multiplier":  "0.1 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Gallant Knave",
                           "multiplier":  "0.24 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Knosson the Bronze Bull",
        "rarity":  "Legendary",
        "faction":  "AR",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-knosson-the-bronze-bull-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Strength of Lakon",
                           "multiplier":  "0.23 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "By The Horns",
                           "multiplier":  "0.35 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Hard-earned Confidence",
                           "multiplier":  "0.27 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Konstantin the Dayborn",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-konstantin-the-dayborn-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Sword of Suns",
                           "multiplier":  "3.6 ATK (First Hit)"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Rune Shatter",
                           "multiplier":  "2.5 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Quietude",
                           "multiplier":  "6.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Korugar Death-Bell",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-korugar-death-bell-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Strange Animus",
                           "multiplier":  "0.21 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Bell’s Toll",
                           "multiplier":  "0.24 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Kosk of Two Skins",
        "rarity":  "Legendary",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-kosk-of-two-skins-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Envenomed Sickles",
                           "multiplier":  "1.9 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "They Will Regret…",
                           "multiplier":  "2.9 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Toxic Vitriol",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Kreela Witch-Arm",
        "rarity":  "Legendary",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-kreela-witch-arm-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Witchlight Barrier",
                           "multiplier":  "4.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Blinding Glow",
                           "multiplier":  "4.8 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "War Weirding",
                           "multiplier":  "4.45 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Krisk the Ageless",
        "rarity":  "Legendary",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-krisk-the-ageless-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Enter the Morass",
                           "multiplier":  "2 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Centuried Vigor",
                           "multiplier":  "3 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "KrokMar the Devourer",
        "rarity":  "Legendary",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-krokmar-the-devourer-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Meatsplitter",
                           "multiplier":  "0.18 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Gnashing Bog",
                           "multiplier":  "0.3 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Krokhad the Throatripper",
        "rarity":  "Legendary",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-krokhad-the-throatripper-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Hount-Tyrant",
                           "multiplier":  "2.2 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Festering Jaw",
                           "multiplier":  "3.3 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Dominant Predator",
                           "multiplier":  "3.8 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Kroz Wallbreaker",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-kroz-wallbreaker-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Pulverizing Pummel",
                           "multiplier":  "1.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Kyoku",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-kyoku-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "One-Eyed Beast",
                           "multiplier":  "1.6 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Blood Curdle",
                           "multiplier":  "3.3 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Lady Kimi",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-lady-kimi-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Lady’s Touch",
                           "multiplier":  "2.4 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Flurry of Petals",
                           "multiplier":  "4.2 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Lady Noelle",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-lady-noelle-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Icecrack staff",
                           "multiplier":  "5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Lady of Ireth",
        "rarity":  "Legendary",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-lady-of-ireth-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Fae Bolt",
                           "multiplier":  "3.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Lanakis the Chosen",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-lanakis-the-chosen-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Chosen’s Touch",
                           "multiplier":  "2.9 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Legate Teox",
        "rarity":  "Legendary",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-legate-teox-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Guerrilla Tactics",
                           "multiplier":  "2 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Draconic Retribution",
                           "multiplier":  "2.1 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Wrath of the Legion",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Leminisi the Gold Wing",
        "rarity":  "Legendary",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-leminisi-the-gold-wing-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Auric Talons",
                           "multiplier":  "2.1 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Intercept The Threat",
                           "multiplier":  "3 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Venerated Warrior",
                           "multiplier":  "2 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Leonardo",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-leonardo-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "New York Slice",
                           "multiplier":  "1.7 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Turtles Together",
                           "multiplier":  "3.4 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Leorius the Proud",
        "rarity":  "Legendary",
        "faction":  "Skinwalkers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-leorius-the-proud-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Lion’s Twinclaws",
                           "multiplier":  "1.65 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Rage of the Pride",
                           "multiplier":  "2 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Awesome Roar",
                           "multiplier":  "3.85 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Little Miss Annie",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-little-miss-annie-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Pretty Nails",
                           "multiplier":  "1.3 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Hollow Doll",
                           "multiplier":  "2.7 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Playdate",
                           "multiplier":  "5.7 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Loki the Deceiver",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-loki-the-deceiver-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Flames of Mischief",
                           "multiplier":  "3.6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Lonatharil",
        "rarity":  "Legendary",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-lonatharil-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Gallantry",
                           "multiplier":  "0.23 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Flicker Barrier",
                           "multiplier":  "0.25 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Longbeard",
        "rarity":  "Legendary",
        "faction":  "Skinwalkers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-longbeard-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Unstoppable Force",
                           "multiplier":  "4 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Brittleness Curse",
                           "multiplier":  "6.3 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Lord Champfort",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-lord-champfort-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Annihilating Hit",
                           "multiplier":  "0.2 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Earthshaker",
                           "multiplier":  "0.23 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Lord Entertainer Fabian",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-lord-entertainer-fabian-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Service In Death",
                           "multiplier":  "2 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Unwelcome Guest",
                           "multiplier":  "5.5 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Spectral Flourish",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Lord Shazar",
        "rarity":  "Legendary",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-lord-shazar-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Damnation",
                           "multiplier":  "1.3 ATK x (1 + 0.15 Debuff)"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Cruel Fate",
                           "multiplier":  "3.2 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Losan KLeth",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-losan-kleth-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Atrophic Ax",
                           "multiplier":  "3.3 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Finality Disc",
                           "multiplier":  "5 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Lugan the Steadfast",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-lugan-the-steadfast-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Crushing Blow",
                           "multiplier":  "0.26 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Mark of Silence",
                           "multiplier":  "0.3 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Lydia the Deathsiren",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-lydia-the-deathsiren-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Oppression",
                           "multiplier":  "3.75 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Siren’s Wail",
                           "multiplier":  "4 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Nullification",
                           "multiplier":  "3.2 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Lysanthir Beastbane",
        "rarity":  "Legendary",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-lysanthir-beastbane-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Echobolt",
                           "multiplier":  "1.55 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Wiley Hunter",
                           "multiplier":  "2.5 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Runed Snares",
                           "multiplier":  "1.9 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Lyssandra",
        "rarity":  "Legendary",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-lyssandra-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Transference",
                           "multiplier":  "4 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Exhaustion",
                           "multiplier":  "6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "MaShalled",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-mashalled-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Bloodsucker",
                           "multiplier":  "3.9 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Open Wounds",
                           "multiplier":  "6.6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Mad Hatter",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-mad-hatter-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Dastardly Distillation",
                           "multiplier":  "0.1 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Mixture Most Foul",
                           "multiplier":  "0.2 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Maranix",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-maranix-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Reaper’s Due",
                           "multiplier":  "1.9 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Excruciate",
                           "multiplier":  "4 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Inexortable End",
                           "multiplier":  "4.1 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Marichka the Unbreakable",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-marichka-the-unbreakable-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "United We Triumph",
                           "multiplier":  "3.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Marius the Gallant",
        "rarity":  "Legendary",
        "faction":  "Skinwalkers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-marius-the-gallant-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Auric Lance",
                           "multiplier":  "2.5 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Death or Glory",
                           "multiplier":  "1.2 DEF + 0.03 Enemy Max HP"
                       }
                   ]
    },
    {
        "nameEn":  "Martyr",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-martyr-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Rush",
                           "multiplier":  "3.4 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Suppression",
                           "multiplier":  "4 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Masahiro the Bell Monk",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-masahiro-the-bell-monk-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Ring of Dissonance",
                           "multiplier":  "?"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Redemptive Fervor",
                           "multiplier":  "?"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Humble Savior",
                           "multiplier":  "?"
                       }
                   ]
    },
    {
        "nameEn":  "Mathias Blackflail",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-mathias-blackflail-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Darken the Sky",
                           "multiplier":  "0.07 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Deathwhirl",
                           "multiplier":  "0.2 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Matriarch Zarguna",
        "rarity":  "Legendary",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-matriarch-zarguna-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Battlethrum",
                           "multiplier":  "0.13 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Maternal Force",
                           "multiplier":  "0.27 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Maulie Tankard",
        "rarity":  "Legendary",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-maulie-tankard-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Roast",
                           "multiplier":  "3.3 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Mavara the Web Diviner",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-mavara-the-web-diviner-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Strike on My Mark",
                           "multiplier":  "5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Michelangelo",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-michelangelo-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Boo-Yah!",
                           "multiplier":  "2 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Express Delivery!",
                           "multiplier":  "6 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Shell Cyclone",
                           "multiplier":  "5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Michinaki",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-michinaki-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Burning Bonds",
                           "multiplier":  "3.5 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Dire Whorl",
                           "multiplier":  "3.9 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Doubled Degeneracy",
                           "multiplier":  "2.1 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Mighty Ukko",
        "rarity":  "Legendary",
        "faction":  "Skinwalkers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-mighty-ukko-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Ukko Smash",
                           "multiplier":  "2.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Ukko’s Fury",
                           "multiplier":  "2 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Minaya",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-minaya-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Graceful Guide",
                           "multiplier":  "4.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Mending Ways",
                           "multiplier":  "5.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Mithrala Lifebane",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-mithrala-lifebane-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Libation of Pain",
                           "multiplier":  "2 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Sigil of Toxic Glory",
                           "multiplier":  "4 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Modo of the Peal",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-modo-of-the-peal-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Skull Clapper",
                           "multiplier":  "1.8 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Ear-Splitter",
                           "multiplier":  "3.8 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Peal of Breaking",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Morrigaine",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-morrigaine-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Haunt with Hesitation",
                           "multiplier":  "4.9 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Mortu-Macaab",
        "rarity":  "Legendary",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-mortu-macaab-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Stigmata",
                           "multiplier":  "4.8 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Falling from Grace",
                           "multiplier":  "1.1 ATK + 0.1 HP"
                       },
                       {
                           "slot":  "A4",
                           "name":  "Peril (Special)",
                           "multiplier":  "0.2 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Mother Cybele",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-mother-cybele-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Mask of Dread",
                           "multiplier":  "0.2 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Mountain King",
        "rarity":  "Legendary",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-mountain-king-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Thunder Cleave",
                           "multiplier":  "0.27 HP + 1 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Enchanted Axe",
                           "multiplier":  "0.3 HP + 1.8 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Regal Force",
                           "multiplier":  "0.35 HP + 1.8 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Nari the Lucky",
        "rarity":  "Legendary",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-nari-the-lucky-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Wee Flincher",
                           "multiplier":  "2.1 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Rainbow of Woe",
                           "multiplier":  "3.3 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Irresistable Wealth",
                           "multiplier":  "3.7 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Narma the Returned",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-narma-the-returned-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Hell Crescent",
                           "multiplier":  "4.9 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Weirding Dance",
                           "multiplier":  "6.5 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Toxin Trance",
                           "multiplier":  "6.8 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Nekhret the Great",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-nekhret-the-great-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Tomb Glaive",
                           "multiplier":  "1.3 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Nekmo Thaar",
        "rarity":  "Legendary",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-nekmo-thaar-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Steelmelt Acid",
                           "multiplier":  "1.8 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Planar Chains",
                           "multiplier":  "3.1 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Nethril",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-nethril-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Blood Harvest",
                           "multiplier":  "1.1 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Ghastly Horrors",
                           "multiplier":  "4.7 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Bat Swarm",
                           "multiplier":  "3.8 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Niamhe Spear of Nyresa",
        "rarity":  "Legendary",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-niamhe-spear-of-nyresa-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Woodspear",
                           "multiplier":  "4.1 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Cerulean Guard",
                           "multiplier":  "5.4 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Ninja",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-ninja-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Shatterbolt",
                           "multiplier":  "3.7 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Hailburn",
                           "multiplier":  "2 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Cyan Slash",
                           "multiplier":  "3 ATK (AoE), 3.95 ATK (Boss)"
                       }
                   ]
    },
    {
        "nameEn":  "Nobel",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-nobel-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Smell Fear",
                           "multiplier":  "3.9 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Harbinger",
                           "multiplier":  "4.82 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Dismay",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Noct the Paralyzer",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-noct-the-paralyzer-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Haze of Pain",
                           "multiplier":  "0.23 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Dreamer’s Demise",
                           "multiplier":  "0.25 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Nogdar the Headhunter",
        "rarity":  "Legendary",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-nogdar-the-headhunter-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Brutal Verdict",
                           "multiplier":  "3.3 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Gore Feast",
                           "multiplier":  "3.2 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Last Rites",
                           "multiplier":  "0.5 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Noldua the Gloaming",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-noldua-the-gloaming-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Shadestrike",
                           "multiplier":  "6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Norog",
        "rarity":  "Legendary",
        "faction":  "Skinwalkers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-norog-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Maul",
                           "multiplier":  "4 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Ice Pillar",
                           "multiplier":  "3.8 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Odin Faefather",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-odin-faefather-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Sting Of Gungnir",
                           "multiplier":  "5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Oella",
        "rarity":  "Legendary",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-oella-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Flutter Fluster",
                           "multiplier":  "4.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Onryo Ieyasu",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-onryo-ieyasu-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Exorcism Cutter",
                           "multiplier":  "1.8 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Violent Purification",
                           "multiplier":  "3 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Final Vengeance",
                           "multiplier":  "2.4 ATK"
                       },
                       {
                           "slot":  "A4",
                           "name":  "Onryo’s Duty (Passive)",
                           "multiplier":  "0.25 Damage Dealt"
                       }
                   ]
    },
    {
        "nameEn":  "Opardin Clanfather",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-opardin-clanfather-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Paired Hammers",
                           "multiplier":  "0.14 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Rally the Tribe",
                           "multiplier":  "0.27 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Osgrun the Defiler",
        "rarity":  "Legendary",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-osgrun-the-defiler-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Obsidian Blade",
                           "multiplier":  "4.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Packmaster Shyek",
        "rarity":  "Legendary",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-packmaster-shyek-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Kill Command",
                           "multiplier":  "0.2 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Pelagus the Wavewalker",
        "rarity":  "Legendary",
        "faction":  "AR",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-pelagus-the-wavewalker-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Wavethrust",
                           "multiplier":  "?"
                       }
                   ]
    },
    {
        "nameEn":  "Pelops the Victor",
        "rarity":  "Legendary",
        "faction":  "AR",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-pelops-the-victor-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Triumphant Blow",
                           "multiplier":  "0.25 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Gorgoa’s Bane",
                           "multiplier":  "0.4 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Pheidi Tealcrest",
        "rarity":  "Legendary",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-pheidi-tealcrest-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Zephyr Lance",
                           "multiplier":  "0.13 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "On Teal Wings",
                           "multiplier":  "0.21 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Phemo the Shepherd",
        "rarity":  "Legendary",
        "faction":  "AR",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-phemo-the-shepherd-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Hammer of Stone",
                           "multiplier":  "3.6 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Pontiff Augustin",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-pontiff-augustin-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Edenic Blades",
                           "multiplier":  "5.4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Praeva the Slitherer",
        "rarity":  "Legendary",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-praeva-the-slitherer-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Bolt of Affliction",
                           "multiplier":  "5.1 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Predator",
        "rarity":  "Legendary",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-predator-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Wrist Blades",
                           "multiplier":  "0.26 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Smart Disc",
                           "multiplier":  "0.19 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Combistick Throw",
                           "multiplier":  "0.38 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Prince Kymar",
        "rarity":  "Legendary",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-prince-kymar-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Phantom Fire",
                           "multiplier":  "3 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Abyssal Gaze",
                           "multiplier":  "3.6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Pythion",
        "rarity":  "Legendary",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-pythion-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Rapacious Staff",
                           "multiplier":  "3 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Pyxniel",
        "rarity":  "Legendary",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-pyxniel-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Mistress of Glamours",
                           "multiplier":  "3 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Grip of Winter",
                           "multiplier":  "4.3 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Icicle Barrage",
                           "multiplier":  "4.6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Queen Eva",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-queen-eva-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Cauterize",
                           "multiplier":  "3.2 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Ancient Curse",
                           "multiplier":  "2.8 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Energy Drain",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Queen of Hearts",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-queen-of-hearts-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Heartburst",
                           "multiplier":  "2.77 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Quintus the Triumphant",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-quintus-the-triumphant-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Encore Performance",
                           "multiplier":  "1.9 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Strip Away",
                           "multiplier":  "5.5 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Crowd Favorite",
                           "multiplier":  "3.8 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "R. Nergigante Archer",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-r-nergigante-archer-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Charged Shot",
                           "multiplier":  "3 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Spinning Shot",
                           "multiplier":  "3.1 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Rapid Shot",
                           "multiplier":  "3 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Rae",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-rae-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Corrode",
                           "multiplier":  "2.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Arcane Wave",
                           "multiplier":  "4.3 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Banish",
                           "multiplier":  "5.3 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Raf-Matab",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-raf-matab-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Elderspear",
                           "multiplier":  "0.22 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Stampede",
                           "multiplier":  "0.25 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Ragash",
        "rarity":  "Legendary",
        "faction":  "Skinwalkers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-ragash-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Tiger’s Greatclaws",
                           "multiplier":  "1.8 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Fur Typhoon",
                           "multiplier":  "4.3 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Raglin",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-raglin-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Repent",
                           "multiplier":  "1.6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Rakka Viletide",
        "rarity":  "Legendary",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-rakka-viletide-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Ichor of Life",
                           "multiplier":  "3.8 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Ramantu Drakesblood",
        "rarity":  "Legendary",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-ramantu-drakesblood-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Psychic Overload",
                           "multiplier":  "3.2 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Drake’s Fury",
                           "multiplier":  "1.8 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Blood Wings",
                           "multiplier":  "5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Raphael",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-raphael-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Sewer Skewer",
                           "multiplier":  "2.2 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Saismic Slam",
                           "multiplier":  "4.3 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Not Today, Knucklehead!",
                           "multiplier":  "2 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Rathalos Blademaster",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-rathalos-blademaster-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Spirit Thrust",
                           "multiplier":  "3.2 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Spirit Step Slash",
                           "multiplier":  "4 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Overhead Slash",
                           "multiplier":  "4.1 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Razelvarg",
        "rarity":  "Legendary",
        "faction":  "Skinwalkers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-razelvarg-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Hopping Mad",
                           "multiplier":  "(0.45 SPD / 100) ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Night of the Rabbit",
                           "multiplier":  "(1.5 + SPD / 100) ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Keep Up If You Can",
                           "multiplier":  "(1.5 + SPD / 100) ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Rhazin Scarhide",
        "rarity":  "Legendary",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-rhazin-scarhide-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Bone Sword",
                           "multiplier":  "1.5 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Shear",
                           "multiplier":  "6 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Bog Down",
                           "multiplier":  "4 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Richtoff the Bold",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-richtoff-the-bold-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Ruination",
                           "multiplier":  "1.7 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Bloodletting",
                           "multiplier":  "1.9 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Cursehold",
                           "multiplier":  "6.2 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Riho Bonespear",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-riho-bonespear-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Absorbtion",
                           "multiplier":  "4.3 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Pressure Points",
                           "multiplier":  "5.8 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Robar",
        "rarity":  "Legendary",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-robar-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Stunning Strength",
                           "multiplier":  "3.4 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Wild Swing",
                           "multiplier":  "4.3 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Merciless Assault",
                           "multiplier":  "4.2 ATK (Damage +50% against enemies under debuff)"
                       }
                   ]
    },
    {
        "nameEn":  "Ronda",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-ronda-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Flaming Flurry",
                           "multiplier":  "1.2 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Phase Rushdown",
                           "multiplier":  "1.9 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Fury Tremor",
                           "multiplier":  "1.9 ATK"
                       },
                       {
                           "slot":  "A4",
                           "name":  "In Your Corner (Passive)",
                           "multiplier":  "1.2 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Roric Wyrmbane",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-roric-wyrmbane-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Wyrmslayer Hammer",
                           "multiplier":  "1.75 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Dragon Rage",
                           "multiplier":  "3.5 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Scale Breaker",
                           "multiplier":  "4.7 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Roshcard the Tower",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-roshcard-the-tower-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Rebuke",
                           "multiplier":  "5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Sanction",
                           "multiplier":  "0.3 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Rotos the Lost Groom",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-rotos-the-lost-groom-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Terror Scourge",
                           "multiplier":  "1.9 ATK + 0.19 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Vitality Plunder",
                           "multiplier":  "3.5 ATK + 0.3 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Fated Destruction",
                           "multiplier":  "2.1 ATK + 0.19 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Roxam",
        "rarity":  "Legendary",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-roxam-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Chroma Shift",
                           "multiplier":  "3.8 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Jungle Ambush",
                           "multiplier":  "6.4 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Flicker Step",
                           "multiplier":  "6.4 ATK (Single-Target), 4 ATK (AoE)"
                       }
                   ]
    },
    {
        "nameEn":  "Royal Huntsman",
        "rarity":  "Legendary",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-royal-huntsman-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Confident Shot",
                           "multiplier":  "3.1 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Slaughter Volley",
                           "multiplier":  "3.6 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Dead Aim",
                           "multiplier":  "5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Ruel the Huntmaster",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-ruel-the-huntmaster-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Vile Arrows",
                           "multiplier":  "3.2 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Unleash the Hunt",
                           "multiplier":  "3 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Saito",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-saito-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Unbearable Assault",
                           "multiplier":  "1.35 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Enduring Warrior",
                           "multiplier":  "6.1 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Army Breaker",
                           "multiplier":  "7 ATK (Single-Target), 4.5 ATK (AoE)"
                       }
                   ]
    },
    {
        "nameEn":  "Samar Gemcursed",
        "rarity":  "Legendary",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-samar-gemcursed-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Crystal Flesh",
                           "multiplier":  "0.25 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Emerald Curse",
                           "multiplier":  "0.35 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Boon Supervision",
                           "multiplier":  "0.2 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Samson the Masher",
        "rarity":  "Legendary",
        "faction":  "Skinwalkers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-samson-the-masher-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Vanity Fists",
                           "multiplier":  "0.12 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Explosive Temper",
                           "multiplier":  "0.29 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Sanguine Maria",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-sanguine-maria-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Hematic Blades",
                           "multiplier":  "0.8 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Sanguine Fissure",
                           "multiplier":  "5 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Gorescream",
                           "multiplier":  "5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Scyl of the Drakes",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-scyl-of-the-drakes-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Drake’s Swiftness",
                           "multiplier":  "3.5 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Wingbeat Flurry",
                           "multiplier":  "1.55 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Searsha the Charred",
        "rarity":  "Legendary",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-searsha-the-charred-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Conflagrate",
                           "multiplier":  "1.4 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Blazing Panic",
                           "multiplier":  "4.3 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Senna Amberheart",
        "rarity":  "Legendary",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-senna-amberheart-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Amberthrust",
                           "multiplier":  "4.3 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Septimus",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-septimus-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Behead",
                           "multiplier":  "3.6 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Holy Sword",
                           "multiplier":  "2.5 ATK + 0.1 Enemy MAX HP"
                       }
                   ]
    },
    {
        "nameEn":  "Sethallia",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-sethallia-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Put to Flame",
                           "multiplier":  "5.4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Shamrock",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-shamrock-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Luck Swap",
                           "multiplier":  "2 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Shemnath",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-shemnath-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Bring to Ruin",
                           "multiplier":  "1.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Caryatid’s Curse",
                           "multiplier":  "1.8 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Humbled and Broken",
                           "multiplier":  "2.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Shirimani",
        "rarity":  "Legendary",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-shirimani-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Bolts of Cold",
                           "multiplier":  "1.4 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Ice Storm",
                           "multiplier":  "4.1 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Shredder",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-shredder-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Rage of Saki",
                           "multiplier":  "0.1 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Shadow Shinobi",
                           "multiplier":  "0.16 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "This Is True Ninjutsu",
                           "multiplier":  "0.27 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Shu-Zhen the Valorous",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-shu-zhen-the-valorous-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Spear of Providence",
                           "multiplier":  "3.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Sicia Flametongue",
        "rarity":  "Legendary",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-sicia-flametongue-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Towering Inferno",
                           "multiplier":  "1.05 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Flame Eruption",
                           "multiplier":  "3.7 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Firestorm Rite",
                           "multiplier":  "3.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Sigmund the Highshield",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-sigmund-the-highshield-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Fairer Fight",
                           "multiplier":  "3.75 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Battlefield Beacon",
                           "multiplier":  "2 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Siphi the Lost Bride",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-siphi-the-lost-bride-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Curse of Longing",
                           "multiplier":  "5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Sir Nicholas",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-sir-nicholas-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Boreal Blade",
                           "multiplier":  "0.28 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Polar Protection",
                           "multiplier":  "0.3 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Skartorsis",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-skartorsis-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Hand of Doom",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Skeletor",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-skeletor-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Havoc Scythe",
                           "multiplier":  "0.12 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Skull Comet",
                           "multiplier":  "0.32 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Skorid the Halfspawn",
        "rarity":  "Legendary",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-skorid-the-halfspawn-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Hexpyre",
                           "multiplier":  "3.7 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Anathema Burst",
                           "multiplier":  "3.8 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Infernal Malediction",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Skull Lord Var-Gall",
        "rarity":  "Legendary",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-skull-lord-var-gall-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Gleeful Ripping",
                           "multiplier":  "1.35 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Abyssal Clutch",
                           "multiplier":  "3.85 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Sniktraak",
        "rarity":  "Legendary",
        "faction":  "Skinwalkers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-sniktraak-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Misery Morningstar",
                           "multiplier":  "0.25 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Cloying Horror",
                           "multiplier":  "0.35 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Solanar the Gleaming",
        "rarity":  "Legendary",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-solanar-the-gleaming-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Solar Surge",
                           "multiplier":  "2.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Blazing Force",
                           "multiplier":  "6 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Unfettered Radiance",
                           "multiplier":  "6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Soulless",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-soulless-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Bewildering Blow",
                           "multiplier":  "3.6 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Wave of Despair",
                           "multiplier":  "3.9 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Reign of Terror",
                           "multiplier":  "4.9 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Staltus Dragonbane",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-staltus-dragonbane-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Axe of Glory",
                           "multiplier":  "1.9 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Drakehunter",
                           "multiplier":  "2.1 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Dragon Heart",
                           "multiplier":  "4 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Stokk the Broken",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-stokk-the-broken-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Doom Flasks",
                           "multiplier":  "2.4 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Volatile Mixture",
                           "multiplier":  "2.2 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Vengefire Flood",
                           "multiplier":  "4.4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Storm Herald Hekaton",
        "rarity":  "Legendary",
        "faction":  "AR",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-storm-herald-hekaton-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A2",
                           "name":  "Eye of the Storm",
                           "multiplier":  "4.7 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Strategos Islin",
        "rarity":  "Legendary",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-strategos-islin-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Doubleslash",
                           "multiplier":  "1.8 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Hindrance",
                           "multiplier":  "3.8 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Sulfuryion",
        "rarity":  "Legendary",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-sulfuryion-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Volcanic Rend",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Sun Wukong",
        "rarity":  "Legendary",
        "faction":  "Skinwalkers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-sun-wukong-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Gotcha!",
                           "multiplier":  "3.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Staff Of Wonder",
                           "multiplier":  "5 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Now You See Us",
                           "multiplier":  "3.8 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Supreme Athel",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-supreme-athel-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A2",
                           "name":  "Cold Company",
                           "multiplier":  "4.3 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Supreme Elhain",
        "rarity":  "Legendary",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-supreme-elhain-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Exemplar Of Strikes",
                           "multiplier":  "2 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Let None Live",
                           "multiplier":  "4 ATK * (1 + 0.1 Debuff Count)"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Crack Shot",
                           "multiplier":  "6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Supreme Galek",
        "rarity":  "Legendary",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-supreme-galek-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Exemplar of Rage",
                           "multiplier":  "2.1 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Bloodshed Tempest",
                           "multiplier":  "1.65 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Unreasoning Outburst",
                           "multiplier":  "4.6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Supreme Kael",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-supreme-kael-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Exemplar of Skill",
                           "multiplier":  "2.4 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Putrescene",
                           "multiplier":  "4.6 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Arcane Havoc",
                           "multiplier":  "4.4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Suzerain Katonn",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-suzerain-katonn-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Temporal Nova",
                           "multiplier":  "2.2 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Hex of Years",
                           "multiplier":  "3.7 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Banish From Time",
                           "multiplier":  "3.8 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Swarmspeaker Zyclic",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-swarmspeaker-zyclic-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Chitin Cutter",
                           "multiplier":  "3.8 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Ravening Multitude (4 turns)",
                           "multiplier":  "6 ATK (Single-Target), 4 ATK (AoE)"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Insectoid Feast (4 turns)",
                           "multiplier":  "(3 + (0.1 Debuff Count)) ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Sydax King Killer",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-sydax-king-killer-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Fleshcleaver",
                           "multiplier":  "?"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Brutal Decapitator",
                           "multiplier":  "?"
                       }
                   ]
    },
    {
        "nameEn":  "Taras the Fierce",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-taras-the-fierce-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Shatter Upon Us",
                           "multiplier":  "0.12 B_HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Hero’s Intercession",
                           "multiplier":  "0.35 B_HP (0.7 B_HP when Doubled)"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Constant Pressure",
                           "multiplier":  "0.26 B_HP"
                       }
                   ]
    },
    {
        "nameEn":  "Tatsu",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-tatsu-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Transference Slash",
                           "multiplier":  "1.8 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Wraith Explosion",
                           "multiplier":  "3.9 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Purgation Blade",
                           "multiplier":  "2.9 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Tatura Rimehide",
        "rarity":  "Legendary",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-tatura-rimehide-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Solar Ray",
                           "multiplier":  "3.8 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Otherworld Breach",
                           "multiplier":  "4.2 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Teela Goremane",
        "rarity":  "Legendary",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-teela-goremane-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Hexdrinker Scimitar",
                           "multiplier":  "0.2 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Pyre Strike",
                           "multiplier":  "0.22 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Life Worm",
                           "multiplier":  "0.2 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Tekteon Fissureflesh",
        "rarity":  "Legendary",
        "faction":  "AR",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-tekteon-fissureflesh-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Fissureblades",
                           "multiplier":  "HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Volcanic Presence",
                           "multiplier":  "HP"
                       }
                   ]
    },
    {
        "nameEn":  "Teodor the Savant",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-teodor-the-savant-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Vile Physick",
                           "multiplier":  "3.1 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Tetsuya the Deliverer",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-tetsuya-the-deliverer-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Rapid Laceration",
                           "multiplier":  "3.2 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Preternatural Tactician",
                           "multiplier":  "2 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Decisive Prescience",
                           "multiplier":  "5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Teumesia",
        "rarity":  "Legendary",
        "faction":  "Skinwalkers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-teumesia-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Fiery Battleaxe",
                           "multiplier":  "3.7 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Cunning Chaos",
                           "multiplier":  "4 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Burning Regret",
                           "multiplier":  "5.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "The Incarnate",
        "rarity":  "Legendary",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-the-incarnate-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Attack Intruder",
                           "multiplier":  "1.8 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Formation: Phalanx",
                           "multiplier":  "3.6 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Thea the Tomb Angel",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-thea-the-tomb-angel-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Befoulment",
                           "multiplier":  "2 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Hexreaper",
                           "multiplier":  "3.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Tholin Foulbeard",
        "rarity":  "Legendary",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-tholin-foulbeard-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Demonbreaker",
                           "multiplier":  "2.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Back to the Abyss",
                           "multiplier":  "2.4 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Rabid Fury",
                           "multiplier":  "2 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Thor Faehammer",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-thor-faehammer-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Wrath of Mjolnir",
                           "multiplier":  "1.9 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Fulminous Richochet",
                           "multiplier":  "5 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Hammer of Heaven",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Timit the Fool",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-timit-the-fool-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Carnival Hammer",
                           "multiplier":  "0.1 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Test Your Strength",
                           "multiplier":  "0.25 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Kegs of Dread",
                           "multiplier":  "0.27 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Titus Blackplume",
        "rarity":  "Legendary",
        "faction":  "Banner Lords",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-titus-blackplume-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Ravenblade",
                           "multiplier":  "3.5 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Student of War",
                           "multiplier":  "5.5 DEF * (1 + SHIELDS_TOTAL_VALUE/HP)"
                       }
                   ]
    },
    {
        "nameEn":  "Togron the Conjoined",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-togron-the-conjoined-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Mash and Mangle",
                           "multiplier":  "5.7 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Tomb Lord",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-tomb-lord-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Crippling Blows",
                           "multiplier":  "1.1 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Death Burst",
                           "multiplier":  "4.8 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Tormin the Cold",
        "rarity":  "Legendary",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-tormin-the-cold-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Rimefire",
                           "multiplier":  "2 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Iceberg Crush",
                           "multiplier":  "3 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Blizzard Rage",
                           "multiplier":  "3.8 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Tramaria",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-tramaria-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Nightmare Sludge",
                           "multiplier":  "3.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Stagnation Sickness",
                           "multiplier":  "4.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Tribune Herakletes",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-tribune-herakletes-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Snakebiter",
                           "multiplier":  "3.5 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Battle Resurrection",
                           "multiplier":  "5 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "For Valdemar!",
                           "multiplier":  "3.9 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Truath",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-truath-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Staff of Liferip",
                           "multiplier":  "0.2 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Gaze Upon Me",
                           "multiplier":  "0.27 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Trunda Giltmallet",
        "rarity":  "Legendary",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-trunda-giltmallet-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Golden Mallet",
                           "multiplier":  "1.9 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Cloak of Ages",
                           "multiplier":  "6 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Forge Rhythm",
                           "multiplier":  "3 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Tuhanarak",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-tuhanarak-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Sun’s Kiss",
                           "multiplier":  "4.1 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Radiant Suffering",
                           "multiplier":  "5.6 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Turvold",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-turvold-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Crackling Blade",
                           "multiplier":  "3 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Juggernaut",
                           "multiplier":  "3 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Tyrant Ixlimor",
        "rarity":  "Legendary",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-tyrant-ixlimor-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Feast of Flame",
                           "multiplier":  "2.5 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Hellfire Torrent",
                           "multiplier":  "3.6 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Ugir the Wyrmeater",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-ugir-the-wyrmeater-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Wyrmwrath",
                           "multiplier":  "0.23 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Earth Puncture",
                           "multiplier":  "0.25 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Ultan of the Shell",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-ultan-of-the-shell-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Under The Skin",
                           "multiplier":  "1.6 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Resurging Reversal",
                           "multiplier":  "5 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Somnolence Spores",
                           "multiplier":  "4.1 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Ultimate Deathknight",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-ultimate-deathknight-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Heckler of Legends",
                           "multiplier":  "3.5 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Rats Off To Ya",
                           "multiplier":  "4 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Underpriest Brogni",
        "rarity":  "Legendary",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-underpriest-brogni-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Deepcrystal Scourge",
                           "multiplier":  "6.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Cavern’s Grasp",
                           "multiplier":  "6.6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Urost the Soulcage",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-urost-the-soulcage-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Jagged Knuckles",
                           "multiplier":  "0.22 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Fetid Eruption",
                           "multiplier":  "0.24 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Ursuga Warcaller",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-ursuga-warcaller-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Gigantic Cudgel",
                           "multiplier":  "0.23 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Barrel Through",
                           "multiplier":  "0.23 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Uzol of the Jade",
        "rarity":  "Legendary",
        "faction":  "Dwarves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-uzol-of-the-jade-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Ruthless Axmaster",
                           "multiplier":  "3.7 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Stone-Hearted",
                           "multiplier":  "4 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Royal Fury",
                           "multiplier":  "5.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Valkanen",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-valkanen-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Dread Scythe",
                           "multiplier":  "3.6 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Hex of Blades",
                           "multiplier":  "4.2 ATK + (4.2 ATK * 0.1 * Debuff Count)"
                       }
                   ]
    },
    {
        "nameEn":  "Valkyrie",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-valkyrie-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Denigration",
                           "multiplier":  "1.7 ATK + 0.6 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Stand Firm",
                           "multiplier":  "3 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Varl the Destroyer",
        "rarity":  "Legendary",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-varl-the-destroyer-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Ravaging Leech",
                           "multiplier":  "3.8 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Lay Waste",
                           "multiplier":  "4 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Calamity Torrent",
                           "multiplier":  "5.6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Vasal of the Seal",
        "rarity":  "Legendary",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-vasal-of-the-seal-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Abyssal Seal",
                           "multiplier":  "0.25 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Infernal Darkness",
                           "multiplier":  "0.27 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Vault Keeper Wixwell",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-vault-keeper-wixwell-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Deadbolt",
                           "multiplier":  "1.5 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Tempest of Knowledge",
                           "multiplier":  "3.5 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Venalicia Thrallmother",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-venalicia-thrallmother-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Torturous Bolts",
                           "multiplier":  "2.1 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Purge The Impure",
                           "multiplier":  "6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Venus",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-venus-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Pining",
                           "multiplier":  "2.2 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Blind with Infatuation",
                           "multiplier":  "3.7 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Burning Passion",
                           "multiplier":  "4 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Vergumkaar",
        "rarity":  "Legendary",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-vergumkaar-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Bejeweled Bulk",
                           "multiplier":  "5 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Crushing Trample",
                           "multiplier":  "4.75 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Versulf the Grim",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-versulf-the-grim-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Stern Admonishing",
                           "multiplier":  "0.23 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Reign of Sorrow",
                           "multiplier":  "0.25 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Vestele Riverthorn",
        "rarity":  "Legendary",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-vestele-riverthorn-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Raging River",
                           "multiplier":  "1.7 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Erosive Force",
                           "multiplier":  "5.2 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Meltwater Flood",
                           "multiplier":  "3 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Visix the Unbowed",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-visix-the-unbowed-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Flanged Mace",
                           "multiplier":  "1.6 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Sinister Allies",
                           "multiplier":  "3.5 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Single Combat",
                           "multiplier":  "4.1 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Vitrius the Anointed",
        "rarity":  "Legendary",
        "faction":  "The Sacred Order",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-vitrius-the-anointed-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Holy Terror",
                           "multiplier":  "1.7 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Storm of Righteousness",
                           "multiplier":  "3.1 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "By My Hand!",
                           "multiplier":  "2.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Vizier Ovelis",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-vizier-ovelis-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Accursed Blades",
                           "multiplier":  "1.3 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Master of Misery",
                           "multiplier":  "2.7 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Vizier of Poisons",
                           "multiplier":  "6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Vizug the Noxious",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-vizug-the-noxious-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Render Flesh",
                           "multiplier":  "0.16 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Venge-fire",
                           "multiplier":  "0.26 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Despoiler of Anhelt",
                           "multiplier":  "0.29 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Vlad the Nightborn",
        "rarity":  "Legendary",
        "faction":  "Undead Hordes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-vlad-the-nightborn-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Thirsting Blade",
                           "multiplier":  "4 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Exsanguinate",
                           "multiplier":  "4.7 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Mind Shroud",
                           "multiplier":  "3.3 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Vulkanos Fumor",
        "rarity":  "Legendary",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-vulkanos-fumor-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Molten Blade",
                           "multiplier":  "3.5 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Flaming Terror",
                           "multiplier":  "3.6 DEF"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Demolition Burn",
                           "multiplier":  "(3 + (0.3 Total Burn Duration on Enemies)) DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Walking Tomb Dreng",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-walking-tomb-dreng-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Corpsefire",
                           "multiplier":  "0.11 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Exalted Pyre",
                           "multiplier":  "0.23 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Deaths Balance",
                           "multiplier":  "0.35 HP"
                       }
                   ]
    },
    {
        "nameEn":  "Wallmaster Othorion",
        "rarity":  "Legendary",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-wallmaster-othorion-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Skyfall Arrow",
                           "multiplier":  "2.5 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Falcon Shot",
                           "multiplier":  "1.5 ATK + 0.035 Enemy Max HP"
                       }
                   ]
    },
    {
        "nameEn":  "War Mother",
        "rarity":  "Legendary",
        "faction":  "Ogryn Tribes",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-war-mother-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Cry Havoc",
                           "multiplier":  "1.9 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Special Brew",
                           "multiplier":  "4.25 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Mother’s Touch",
                           "multiplier":  "4.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Warchief",
        "rarity":  "Legendary",
        "faction":  "Skinwalkers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-warchief-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Brutal Force",
                           "multiplier":  "1 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Marauder",
                           "multiplier":  "4.3 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Warlord",
        "rarity":  "Legendary",
        "faction":  "Orcs",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-warlord-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Bludgeon",
                           "multiplier":  "5 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Orcish Rituals",
                           "multiplier":  "5.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Wight King Narses",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-wight-king-narses-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Corruption Scepter",
                           "multiplier":  "0.24 HP"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Desecration Blast",
                           "multiplier":  "0.28 HP"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Spirits, Claim You",
                           "multiplier":  "0.2 HP + (0.2 HP * 0.1 * Total Active Buffs on Target) + (0.2 HP * 0.1 * Total Active Buffs on Self)"
                       }
                   ]
    },
    {
        "nameEn":  "Wight Queen Ankora",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-wight-queen-ankora-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Necrobolt",
                           "multiplier":  "5.6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Wurlim Frostking",
        "rarity":  "Legendary",
        "faction":  "Knights Revenant",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-wurlim-frostking-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Winds of Winter",
                           "multiplier":  "4 DEF"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Frostbite Blast",
                           "multiplier":  "4 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Wythir the Crowned",
        "rarity":  "Legendary",
        "faction":  "Demonspawn",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-wythir-the-crowned-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Soul’s Impalement",
                           "multiplier":  "2.8 DEF"
                       }
                   ]
    },
    {
        "nameEn":  "Xena Warrior Princess",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-xena-warrior-princess-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Sword of Redemption",
                           "multiplier":  "1.8 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Chakram Cyclone",
                           "multiplier":  "4 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Whip of Destiny",
                           "multiplier":  "4.1 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Xenomorph",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-xenomorph-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Tail Stab",
                           "multiplier":  "3.9 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Infestation",
                           "multiplier":  "5.9 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Rip and Claw",
                           "multiplier":  "(3.1 + (3.1 x 0.15 x Poison Count)) ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Xiloco the Encrusted",
        "rarity":  "Legendary",
        "faction":  "Lizardmen",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-xiloco-the-encrusted-skill-mastery-equip-guide/",
        "skills":  [

                   ]
    },
    {
        "nameEn":  "Yakarl the Scourge",
        "rarity":  "Legendary",
        "faction":  "Barbarians",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-yakarl-the-scourge-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Axe of Allwinter",
                           "multiplier":  "1.8 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Blizzard Rider",
                           "multiplier":  "6 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Glaciate",
                           "multiplier":  "3.8 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Yannica",
        "rarity":  "Legendary",
        "faction":  "High Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-yannica-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Even the Odds",
                           "multiplier":  "1.9 ATK (Single Target), 1.5 ATK (AoE)"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Baffling Speed",
                           "multiplier":  "6.3 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Elven Judgement",
                           "multiplier":  "3.6 ATK + 0.15 REMOVED SHIELD"
                       }
                   ]
    },
    {
        "nameEn":  "Yncensa Grail-bearer",
        "rarity":  "Legendary",
        "faction":  "Sylvan Watchers",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-yncensa-grail-bearer-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Battle Catalyst",
                           "multiplier":  "3 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Malignant Growth",
                           "multiplier":  "4.5 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Yoshi the Drunkard",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-yoshi-the-drunkard-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Strong Booze",
                           "multiplier":  "4.1 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Flaming Spirits",
                           "multiplier":  "2.6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Yukimasa Demon of Ice",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-yukimasa-demon-of-ice-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Winnowing Winter",
                           "multiplier":  "2.7 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Blizzard of Strikes",
                           "multiplier":  "4 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Stain The Snows",
                           "multiplier":  "5.8 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Yumeko",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-yumeko-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Wereclaws",
                           "multiplier":  "2.8 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Destiny’s Mirror",
                           "multiplier":  "6 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Zavia",
        "rarity":  "Legendary",
        "faction":  "Dark Elves",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-zavia-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Transfix",
                           "multiplier":  "1.1 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Poison Rain",
                           "multiplier":  "2 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Deadly Catalyst",
                           "multiplier":  "4.1 ATK"
                       }
                   ]
    },
    {
        "nameEn":  "Zinogre Blademaster",
        "rarity":  "Legendary",
        "faction":  "Shadowkin",
        "sourceUrl":  "https://ayumilove.net/raid-shadow-legends-zinogre-blademaster-skill-mastery-equip-guide/",
        "skills":  [
                       {
                           "slot":  "A1",
                           "name":  "Blade Combo",
                           "multiplier":  "1.2 ATK"
                       },
                       {
                           "slot":  "A2",
                           "name":  "Blade Strike",
                           "multiplier":  "1.4 ATK"
                       },
                       {
                           "slot":  "A3",
                           "name":  "Blade Spin",
                           "multiplier":  "1.5 ATK"
                       }
                   ]
    }
] as const satisfies ChampionMultiplierEntry[];
