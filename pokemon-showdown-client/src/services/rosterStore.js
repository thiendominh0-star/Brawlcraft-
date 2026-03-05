/**
 * rosterStore.js
 * Quản lý danh sách nhân vật, lưu vào localStorage.
 * Trang Admin ghi -> Teambuilder đọc từ đây.
 */

const STORAGE_KEY = 'brawlcraft_roster'
const STORAGE_KEY_MOVES = 'brawlcraft_moves'

// Default roster - dùng khi localStorage chưa có dữ liệu
const DEFAULT_ROSTER = [
  {
    "id": "noxphantom",
    "name": "Nox Phantom",
    "types": [
      "Shadow",
      "Illusion"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 250,
      "atk": 110,
      "def": 50,
      "spa": 50,
      "spd": 50,
      "spe": 120
    },
    "moves": []
  },
  {
    "id": "voidweaver",
    "name": "Void Weaver",
    "types": [
      "Shadow",
      "Cosmic"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 400,
      "atk": 50,
      "def": 80,
      "spa": 90,
      "spd": 110,
      "spe": 60
    },
    "moves": []
  },
  {
    "id": "arcanearchmage",
    "name": "Arcane Archmage",
    "types": [
      "Arcane"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 220,
      "atk": 40,
      "def": 50,
      "spa": 120,
      "spd": 90,
      "spe": 110
    },
    "moves": []
  },
  {
    "id": "runicgolem",
    "name": "Runic Golem",
    "types": [
      "Arcane",
      "Mecha"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 350,
      "atk": 70,
      "def": 120,
      "spa": 60,
      "spd": 110,
      "spe": 50
    },
    "moves": []
  },
  {
    "id": "seraphknight",
    "name": "Seraph Knight",
    "types": [
      "Holy",
      "Martial"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 300,
      "atk": 100,
      "def": 100,
      "spa": 60,
      "spd": 80,
      "spe": 90
    },
    "moves": []
  },
  {
    "id": "oracleoflight",
    "name": "Oracle of Light",
    "types": [
      "Holy"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 380,
      "atk": 40,
      "def": 70,
      "spa": 90,
      "spd": 110,
      "spe": 85
    },
    "moves": []
  },
  {
    "id": "lichking",
    "name": "Lich King",
    "types": [
      "Undead",
      "Frost"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 280,
      "atk": 60,
      "def": 75,
      "spa": 115,
      "spd": 120,
      "spe": 80
    },
    "moves": []
  },
  {
    "id": "bonecolossus",
    "name": "Bone Colossus",
    "types": [
      "Undead",
      "Nature"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 450,
      "atk": 110,
      "def": 110,
      "spa": 50,
      "spd": 60,
      "spe": 40
    },
    "moves": []
  },
  {
    "id": "crimsonwyrm",
    "name": "Crimson Wyrm",
    "types": [
      "Dragon",
      "Inferno"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 320,
      "atk": 125,
      "def": 90,
      "spa": 70,
      "spd": 80,
      "spe": 95
    },
    "moves": []
  },
  {
    "id": "astraldrake",
    "name": "Astral Drake",
    "types": [
      "Dragon",
      "Cosmic"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 310,
      "atk": 80,
      "def": 80,
      "spa": 130,
      "spd": 90,
      "spe": 105
    },
    "moves": []
  },
  {
    "id": "gaiatitan",
    "name": "Gaia Titan",
    "types": [
      "Nature",
      "Martial"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 420,
      "atk": 115,
      "def": 115,
      "spa": 60,
      "spd": 80,
      "spe": 55
    },
    "moves": []
  },
  {
    "id": "florasylph",
    "name": "Flora Sylph",
    "types": [
      "Nature",
      "Illusion"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 260,
      "atk": 60,
      "def": 70,
      "spa": 100,
      "spd": 110,
      "spe": 115
    },
    "moves": []
  },
  {
    "id": "cyberblade09",
    "name": "Cyberblade 09",
    "types": [
      "Mecha",
      "Shadow"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 270,
      "atk": 115,
      "def": 80,
      "spa": 50,
      "spd": 70,
      "spe": 120
    },
    "moves": []
  },
  {
    "id": "aegisbastion",
    "name": "Aegis Bastion",
    "types": [
      "Mecha",
      "Plasma"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 350,
      "atk": 70,
      "def": 130,
      "spa": 100,
      "spd": 90,
      "spe": 40
    },
    "moves": []
  },
  {
    "id": "reactorcore",
    "name": "Reactor Core",
    "types": [
      "Plasma"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 320,
      "atk": 95,
      "def": 95,
      "spa": 95,
      "spd": 95,
      "spe": 95
    },
    "moves": []
  },
  {
    "id": "voltstalker",
    "name": "Volt Stalker",
    "types": [
      "Plasma",
      "Tempest"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 240,
      "atk": 100,
      "def": 60,
      "spa": 90,
      "spd": 65,
      "spe": 130
    },
    "moves": []
  },
  {
    "id": "nebulaweaver",
    "name": "Nebula Weaver",
    "types": [
      "Cosmic",
      "Arcane"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 300,
      "atk": 50,
      "def": 80,
      "spa": 125,
      "spd": 110,
      "spe": 95
    },
    "moves": []
  },
  {
    "id": "starfirecolossus",
    "name": "Starfire Colossus",
    "types": [
      "Cosmic",
      "Inferno"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 400,
      "atk": 120,
      "def": 90,
      "spa": 70,
      "spd": 80,
      "spe": 70
    },
    "moves": []
  },
  {
    "id": "glacierknight",
    "name": "Glacier Knight",
    "types": [
      "Frost",
      "Martial"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 350,
      "atk": 115,
      "def": 115,
      "spa": 50,
      "spd": 80,
      "spe": 65
    },
    "moves": []
  },
  {
    "id": "cryomage",
    "name": "Cryo Mage",
    "types": [
      "Frost",
      "Illusion"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 280,
      "atk": 50,
      "def": 70,
      "spa": 110,
      "spd": 90,
      "spe": 110
    },
    "moves": []
  },
  {
    "id": "ignisdemon",
    "name": "Ignis Demon",
    "types": [
      "Inferno",
      "Undead"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 260,
      "atk": 80,
      "def": 60,
      "spa": 115,
      "spd": 80,
      "spe": 105
    },
    "moves": []
  },
  {
    "id": "vulcanbrute",
    "name": "Vulcan Brute",
    "types": [
      "Inferno",
      "Mecha"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 380,
      "atk": 120,
      "def": 110,
      "spa": 60,
      "spd": 75,
      "spe": 60
    },
    "moves": []
  },
  {
    "id": "galezephyr",
    "name": "Gale Zephyr",
    "types": [
      "Tempest"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 240,
      "atk": 90,
      "def": 60,
      "spa": 90,
      "spd": 70,
      "spe": 140
    },
    "moves": []
  },
  {
    "id": "stormbringer",
    "name": "Storm Bringer",
    "types": [
      "Tempest",
      "Cosmic"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 330,
      "atk": 70,
      "def": 85,
      "spa": 110,
      "spd": 85,
      "spe": 100
    },
    "moves": []
  },
  {
    "id": "toxicarachne",
    "name": "Toxic Arachne",
    "types": [
      "Venom",
      "Illusion"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 270,
      "atk": 90,
      "def": 70,
      "spa": 80,
      "spd": 110,
      "spe": 115
    },
    "moves": []
  },
  {
    "id": "oozemutant",
    "name": "Ooze Mutant",
    "types": [
      "Venom",
      "Nature"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 390,
      "atk": 80,
      "def": 120,
      "spa": 85,
      "spd": 60,
      "spe": 45
    },
    "moves": []
  },
  {
    "id": "ironmonk",
    "name": "Iron Monk",
    "types": [
      "Martial",
      "Holy"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 360,
      "atk": 120,
      "def": 110,
      "spa": 50,
      "spd": 90,
      "spe": 40
    },
    "moves": []
  },
  {
    "id": "swiftassassin",
    "name": "Swift Assassin",
    "types": [
      "Martial",
      "Tempest"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 250,
      "atk": 120,
      "def": 60,
      "spa": 50,
      "spd": 60,
      "spe": 115
    },
    "moves": []
  },
  {
    "id": "miragefox",
    "name": "Mirage Fox",
    "types": [
      "Illusion",
      "Arcane"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 250,
      "atk": 60,
      "def": 60,
      "spa": 115,
      "spd": 80,
      "spe": 115
    },
    "moves": []
  },
  {
    "id": "nightmarefiend",
    "name": "Nightmare Fiend",
    "types": [
      "Illusion",
      "Shadow"
    ],
    "abilities": [
      "No Ability"
    ],
    "imageUrl": "",
    "baseStats": {
      "hp": 290,
      "atk": 110,
      "def": 70,
      "spa": 110,
      "spd": 70,
      "spe": 90
    },
    "moves": []
  }
]

const DEFAULT_MOVES = [
  {
    "id": "phantomambush",
    "name": "Phantom Ambush",
    "type": "Shadow",
    "category": "Physical",
    "basePower": 80,
    "accuracy": 100,
    "priority": 1,
    "target": "normal",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "noxphantom"
  },
  {
    "id": "shadowtangle",
    "name": "Shadow Tangle",
    "type": "Shadow",
    "category": "Status",
    "basePower": 0,
    "accuracy": 90,
    "priority": 0,
    "target": "normal",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "voidweaver"
  },
  {
    "id": "manadetonation",
    "name": "Mana Detonation",
    "type": "Arcane",
    "category": "Special",
    "basePower": 130,
    "accuracy": 100,
    "priority": 0,
    "target": "allAdjacentFoes",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "arcanearchmage"
  },
  {
    "id": "runicovercharge",
    "name": "Runic Overcharge",
    "type": "Arcane",
    "category": "Status",
    "basePower": 0,
    "accuracy": true,
    "priority": 0,
    "target": "self",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "runicgolem"
  },
  {
    "id": "divinesmite",
    "name": "Divine Smite",
    "type": "Holy",
    "category": "Physical",
    "basePower": 90,
    "accuracy": 100,
    "priority": 0,
    "target": "normal",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "seraphknight"
  },
  {
    "id": "aegisaura",
    "name": "Aegis Aura",
    "type": "Holy",
    "category": "Status",
    "basePower": 0,
    "accuracy": true,
    "priority": 0,
    "target": "allySide",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "oracleoflight"
  },
  {
    "id": "soulharvest",
    "name": "Soul Harvest",
    "type": "Undead",
    "category": "Special",
    "basePower": 70,
    "accuracy": 100,
    "priority": 0,
    "target": "normal",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "lichking"
  },
  {
    "id": "gravepulverize",
    "name": "Grave Pulverize",
    "type": "Undead",
    "category": "Physical",
    "basePower": 120,
    "accuracy": 100,
    "priority": 0,
    "target": "normal",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "bonecolossus"
  },
  {
    "id": "dragonswrath",
    "name": "Dragons Wrath",
    "type": "Dragon",
    "category": "Physical",
    "basePower": 100,
    "accuracy": 100,
    "priority": 0,
    "target": "normal",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "crimsonwyrm"
  },
  {
    "id": "meteordive",
    "name": "Meteor Dive",
    "type": "Dragon",
    "category": "Special",
    "basePower": 140,
    "accuracy": 90,
    "priority": 0,
    "target": "allAdjacentFoes",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "astraldrake"
  },
  {
    "id": "quagmirequake",
    "name": "Quagmire Quake",
    "type": "Nature",
    "category": "Physical",
    "basePower": 90,
    "accuracy": 100,
    "priority": 0,
    "target": "allAdjacentFoes",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "gaiatitan"
  },
  {
    "id": "sporecloud",
    "name": "Spore Cloud",
    "type": "Nature",
    "category": "Status",
    "basePower": 0,
    "accuracy": 100,
    "priority": 0,
    "target": "normal",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "florasylph"
  },
  {
    "id": "vibroslash",
    "name": "Vibro Slash",
    "type": "Mecha",
    "category": "Physical",
    "basePower": 75,
    "accuracy": 100,
    "priority": 0,
    "target": "normal",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "cyberblade09"
  },
  {
    "id": "orbitalcannon",
    "name": "Orbital Cannon",
    "type": "Plasma",
    "category": "Special",
    "basePower": 150,
    "accuracy": 100,
    "priority": 0,
    "target": "normal",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "aegisbastion"
  },
  {
    "id": "meltdown",
    "name": "Meltdown",
    "type": "Plasma",
    "category": "Special",
    "basePower": 250,
    "accuracy": 100,
    "priority": 0,
    "target": "allAdjacent",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "reactorcore"
  },
  {
    "id": "plasmachain",
    "name": "Plasma Chain",
    "type": "Plasma",
    "category": "Special",
    "basePower": 80,
    "accuracy": 100,
    "priority": 0,
    "target": "normal",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "voltstalker"
  },
  {
    "id": "singularity",
    "name": "Singularity",
    "type": "Cosmic",
    "category": "Special",
    "basePower": 100,
    "accuracy": 100,
    "priority": 0,
    "target": "allAdjacentFoes",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "nebulaweaver"
  },
  {
    "id": "supernovasmash",
    "name": "Supernova Smash",
    "type": "Cosmic",
    "category": "Physical",
    "basePower": 120,
    "accuracy": 100,
    "priority": 0,
    "target": "normal",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "starfirecolossus"
  },
  {
    "id": "zeropointstrike",
    "name": "Zero Point Strike",
    "type": "Frost",
    "category": "Physical",
    "basePower": 85,
    "accuracy": 100,
    "priority": 0,
    "target": "normal",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "glacierknight"
  },
  {
    "id": "flashfreeze",
    "name": "Flash Freeze",
    "type": "Frost",
    "category": "Status",
    "basePower": 0,
    "accuracy": 100,
    "priority": 0,
    "target": "normal",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "cryomage"
  },
  {
    "id": "hellfirerain",
    "name": "Hellfire Rain",
    "type": "Inferno",
    "category": "Special",
    "basePower": 95,
    "accuracy": 100,
    "priority": 0,
    "target": "allAdjacentFoes",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "ignisdemon"
  },
  {
    "id": "thermitepunch",
    "name": "Thermite Punch",
    "type": "Inferno",
    "category": "Physical",
    "basePower": 100,
    "accuracy": 100,
    "priority": 0,
    "target": "normal",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "vulcanbrute"
  },
  {
    "id": "hurricanekick",
    "name": "Hurricane Kick",
    "type": "Tempest",
    "category": "Physical",
    "basePower": 70,
    "accuracy": 100,
    "priority": 1,
    "target": "normal",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "galezephyr"
  },
  {
    "id": "thunderstrikecloud",
    "name": "Thunderstrike Cloud",
    "type": "Tempest",
    "category": "Special",
    "basePower": 110,
    "accuracy": 70,
    "priority": 0,
    "target": "normal",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "stormbringer"
  },
  {
    "id": "venomousfang",
    "name": "Venomous Fang",
    "type": "Venom",
    "category": "Physical",
    "basePower": 50,
    "accuracy": 100,
    "priority": 0,
    "target": "normal",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "toxicarachne"
  },
  {
    "id": "acidicvomit",
    "name": "Acidic Vomit",
    "type": "Venom",
    "category": "Special",
    "basePower": 80,
    "accuracy": 100,
    "priority": 0,
    "target": "normal",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "oozemutant"
  },
  {
    "id": "zencounter",
    "name": "Zen Counter",
    "type": "Martial",
    "category": "Physical",
    "basePower": 0,
    "accuracy": 100,
    "priority": -5,
    "target": "scripted",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "ironmonk"
  },
  {
    "id": "flurrystrikes",
    "name": "Flurry Strikes",
    "type": "Martial",
    "category": "Physical",
    "basePower": 25,
    "accuracy": 90,
    "priority": 0,
    "target": "normal",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "swiftassassin"
  },
  {
    "id": "mindshatter",
    "name": "Mind Shatter",
    "type": "Illusion",
    "category": "Special",
    "basePower": 80,
    "accuracy": 100,
    "priority": 0,
    "target": "normal",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "miragefox"
  },
  {
    "id": "dreameater",
    "name": "Dream Eater",
    "type": "Illusion",
    "category": "Special",
    "basePower": 100,
    "accuracy": 100,
    "priority": 0,
    "target": "normal",
    "desc": "Signature Move",
    "isSignature": true,
    "signatureBrawler": "nightmarefiend"
  },
  {
    "id": "strike",
    "name": "Strike",
    "type": "Martial",
    "category": "Physical",
    "basePower": 50,
    "accuracy": 100,
    "priority": 0,
    "target": "normal",
    "desc": "Universal Move",
    "isSignature": false,
    "signatureBrawler": ""
  },
  {
    "id": "blast",
    "name": "Blast",
    "type": "Plasma",
    "category": "Special",
    "basePower": 60,
    "accuracy": 100,
    "priority": 0,
    "target": "normal",
    "desc": "Universal Move",
    "isSignature": false,
    "signatureBrawler": ""
  },
  {
    "id": "guard",
    "name": "Guard",
    "type": "Holy",
    "category": "Status",
    "basePower": 0,
    "accuracy": true,
    "priority": 0,
    "target": "self",
    "desc": "Universal Move",
    "isSignature": false,
    "signatureBrawler": ""
  }
]

export const AVAILABLE_TYPES = ['Shadow', 'Arcane', 'Holy', 'Undead', 'Dragon', 'Nature', 'Mecha', 'Plasma', 'Cosmic', 'Frost', 'Inferno', 'Tempest', 'Venom', 'Martial', 'Illusion']
export const AVAILABLE_CATEGORIES = ['Physical', 'Special', 'Status']
export const AVAILABLE_ABILITIES = ['Berserker', 'Arcane Mastery', 'Thick Hide', 'Swift Step', 'No Ability']
export const AVAILABLE_ITEMS = ['Life Orb', 'Leftovers', 'Choice Scarf', 'Focus Sash', 'No Item']

export const STAT_KEYS = ['hp', 'atk', 'def', 'spa', 'spd', 'spe']
export const STAT_LABELS = {hp: 'HP', atk: 'ATK', def: 'DEF', spa: 'SPA', spd: 'SPD', spe: 'SPE'}
export const AVAILABLE_STATS = ['atk', 'def', 'spa', 'spd', 'spe', 'accuracy', 'evasion']

/** Đọc roster từ localStorage, fallback về DEFAULT nếu rỗng */
export function loadRoster() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (e) { /* ignore */}
  return DEFAULT_ROSTER.map(c => ({...c}))
}

/** Lưu roster vào localStorage */
export function saveRoster(roster) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(roster))
}

/** Reset về DEFAULT */
export function resetRoster() {
  localStorage.removeItem(STORAGE_KEY)
  return DEFAULT_ROSTER.map(c => ({...c}))
}

/** Đọc Moves từ localStorage */
export function loadMoves() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MOVES)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) return parsed
    }
  } catch (e) { /* ignore */}
  return DEFAULT_MOVES.map(m => ({...m}))
}

/** Lưu Moves vào localStorage */
export function saveMoves(moves) {
  localStorage.setItem(STORAGE_KEY_MOVES, JSON.stringify(moves))
}

/** Tạo ID từ tên (slug) */
export function nameToId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || `char${Date.now()}`
}

/** Tạo một nhân vật rỗng mới */
export function createBlankChar() {
  return {
    id: '',
    name: '',
    types: ['Shadow'],
    abilities: ['No Ability'],
    item: 'No Item',
    imageUrl: '',
    baseStats: {hp: 300, atk: 100, def: 80, spa: 80, spd: 80, spe: 80},
    moves: [createBlankMove()],
  }
}

/** Tạo một move rỗng */
export function createBlankMove(slotIndex = 0) {
  return {
    id: `move_${Date.now()}_${slotIndex}`,
    name: '',
    type: 'Shadow',
    category: 'Physical',
    power: 80,
    accuracy: 100,
    priority: 0,
    pp: 15,
    isSignature: false,
    signatureBrawler: '',
    cost: {type: 'none'}, // Mặc định là none (Không có optional)
    drawback: {type: 'none'}, // Không có drawback optional
    secondary: {type: 'none'}, // Không có effect optional
    effect: '',
  }
}
