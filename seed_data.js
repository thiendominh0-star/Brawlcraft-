const fs = require('fs');
const path = require('path');

const CHARACTERS_FILE = path.join(__dirname, 'data', 'characters.ts');
const MOVES_FILE = path.join(__dirname, 'data', 'moves.ts');

const newCharacters = `
	crimsonassassin: {
		num: 7,
		name: "Crimson Assassin",
		types: ["Shadow", "Dragon"],
		baseStats: { hp: 310, atk: 140, def: 60, spa: 50, spd: 65, spe: 130 },
		abilities: {0: "Swift Step"},
		weightkg: 60,
	},
	tidalshaman: {
		num: 8,
		name: "Tidal Shaman",
		types: ["Nature", "Arcane"],
		baseStats: { hp: 380, atk: 60, def: 85, spa: 110, spd: 120, spe: 80 },
		abilities: {0: "Arcane Mastery"},
		weightkg: 65,
	},
	ironsentinel: {
		num: 9,
		name: "Iron Sentinel",
		types: ["Holy"],
		baseStats: { hp: 450, atk: 90, def: 150, spa: 60, spd: 110, spe: 40 },
		abilities: {0: "Thick Hide"},
		weightkg: 400,
	},
	voidwalker: {
		num: 10,
		name: "Void Walker",
		types: ["Undead", "Shadow"],
		baseStats: { hp: 500, atk: 110, def: 90, spa: 100, spd: 90, spe: 50 },
		abilities: {0: "Berserker"},
		weightkg: 85,
	},
	astralweaver: {
		num: 11,
		name: "Astral Weaver",
		types: ["Arcane"],
		baseStats: { hp: 280, atk: 40, def: 70, spa: 150, spd: 85, spe: 115 },
		abilities: {0: "Arcane Mastery"},
		weightkg: 45,
	},
	stormdrake: {
		num: 12,
		name: "Storm Drake",
		types: ["Dragon", "Nature"],
		baseStats: { hp: 350, atk: 125, def: 85, spa: 105, spd: 85, spe: 100 },
		abilities: {0: "Thick Hide"},
		weightkg: 210,
	},
`;

const newMovesData = [
	// Physical Moves
	{id: 'crimsonblade', num: 101, name: 'Crimson Blade', type: 'Shadow', cat: 'Physical', pwr: 95, acc: 100, pp: 15, desc: "High crit chance."},
	{id: 'holybash', num: 102, name: 'Holy Bash', type: 'Holy', cat: 'Physical', pwr: 80, acc: 100, pp: 20, desc: "30% chance to flinch.", sec: {chance: 30, volatileStatus: 'flinch'}},
	{id: 'dragonsweep', num: 103, name: 'Dragon Sweep', type: 'Dragon', cat: 'Physical', pwr: 110, acc: 90, pp: 10, desc: "Hits all adjacent foes."},
	{id: 'naturefang', num: 104, name: 'Nature Fang', type: 'Nature', cat: 'Physical', pwr: 75, acc: 100, pp: 15, desc: "Heals 50% of damage dealt.", drain: [1, 2]},
	{id: 'undeadstrike', num: 105, name: 'Undead Strike', type: 'Undead', cat: 'Physical', pwr: 120, acc: 100, pp: 15, desc: "User takes recoil damage.", recoil: [33, 100]},
	{id: 'arcaneedge', num: 106, name: 'Arcane Edge', type: 'Arcane', cat: 'Physical', pwr: 90, acc: 100, pp: 15, desc: "Bypasses accuracy checks."},
	{id: 'voidcrush', num: 107, name: 'Void Crush', type: 'Undead', cat: 'Physical', pwr: 100, acc: 90, pp: 10, desc: "20% chance to lower DEF.", sec: {chance: 20, boosts: {def: -1}}},
	{id: 'ironfist', num: 108, name: 'Iron Fist', type: 'Holy', cat: 'Physical', pwr: 85, acc: 100, pp: 15, desc: "Power increases if user goes last."},
	{id: 'quickslash', num: 109, name: 'Quick Slash', type: 'Shadow', cat: 'Physical', pwr: 40, acc: 100, pp: 30, pri: 1, desc: "Usually goes first."},
	{id: 'savagebite', num: 110, name: 'Savage Bite', type: 'Dragon', cat: 'Physical', pwr: 65, acc: 95, pp: 15, desc: "Bite attack with 10% flinch.", sec: {chance: 10, volatileStatus: 'flinch'}},

	// Special Moves
	{id: 'astralbeam', num: 111, name: 'Astral Beam', type: 'Arcane', cat: 'Special', pwr: 90, acc: 100, pp: 15, desc: "10% chance to lower enemy SpD.", sec: {chance: 10, boosts: {spd: -1}}},
	{id: 'shadowburst', num: 112, name: 'Shadow Burst', type: 'Shadow', cat: 'Special', pwr: 130, acc: 90, pp: 5, desc: "Lowers user SpA by 2.", self: {boosts: {spa: -2}}},
	{id: 'divinewrath', num: 113, name: 'Divine Wrath', type: 'Holy', cat: 'Special', pwr: 100, acc: 100, pp: 10, desc: "Ignores target stat changes."},
	{id: 'tidalwave', num: 114, name: 'Tidal Wave', type: 'Nature', cat: 'Special', pwr: 95, acc: 100, pp: 10, desc: "Hits all adjacent targets."},
	{id: 'soulburn', num: 115, name: 'Soul Burn', type: 'Undead', cat: 'Special', pwr: 80, acc: 100, pp: 15, desc: "20% chance to burn target (reduces ATK).", sec: {chance: 20, status: 'brn'}},
	{id: 'dragonbreath', num: 116, name: 'Dragon Breath', type: 'Dragon', cat: 'Special', pwr: 60, acc: 100, pp: 20, desc: "30% chance to paralyze target.", sec: {chance: 30, status: 'par'}},
	{id: 'naturepulse', num: 117, name: 'Nature Pulse', type: 'Nature', cat: 'Special', pwr: 80, acc: 100, pp: 20, desc: "No additional effect."},
	{id: 'arcanestorm', num: 118, name: 'Arcane Storm', type: 'Arcane', cat: 'Special', pwr: 110, acc: 70, pp: 10, desc: "High power, low accuracy."},
	{id: 'holysmend', num: 119, name: 'Holy Smite', type: 'Holy', cat: 'Special', pwr: 60, acc: 100, pp: 25, desc: "Never misses."},
	{id: 'darkvoid', num: 120, name: 'Dark Void', type: 'Shadow', cat: 'Special', pwr: 120, acc: 80, pp: 5, desc: "Hits hard but might miss."},

	// Status Moves
	{id: 'healinglight', num: 121, name: 'Healing Light', type: 'Holy', cat: 'Status', pwr: 0, acc: 100, pp: 10, desc: "Heals user by 50% max HP.", heal: [1, 2]},
	{id: 'dragondance', num: 122, name: 'Dragon Dance', type: 'Dragon', cat: 'Status', pwr: 0, acc: 100, pp: 20, desc: "Raises user ATK and SPE by 1.", boosts: {atk: 1, spe: 1}},
	{id: 'arcaneshield', num: 123, name: 'Arcane Shield', type: 'Arcane', cat: 'Status', pwr: 0, acc: 100, pp: 15, desc: "Raises user DEF and SpD by 1.", boosts: {def: 1, spd: 1}},
	{id: 'naturegrowth', num: 124, name: 'Nature Growth', type: 'Nature', cat: 'Status', pwr: 0, acc: 100, pp: 15, desc: "Raises user SpA and SpD by 1.", boosts: {spa: 1, spd: 1}},
	{id: 'shadowcloak', num: 125, name: 'Shadow Cloak', type: 'Shadow', cat: 'Status', pwr: 0, acc: 100, pp: 15, desc: "Raises evasiveness by 1.", boosts: {evasion: 1}},
	{id: 'undeadcurse', num: 126, name: 'Undead Curse', type: 'Undead', cat: 'Status', pwr: 0, acc: 100, pp: 10, desc: "Curses target, dealing 1/4 HP damage per turn.", volatileStatus: 'curse'},
	{id: 'astraltrance', num: 127, name: 'Astral Trance', type: 'Arcane', cat: 'Status', pwr: 0, acc: 100, pp: 10, desc: "Raises user SpA by 2.", boosts: {spa: 2}},
	{id: 'holyward', num: 128, name: 'Holy Ward', type: 'Holy', cat: 'Status', pwr: 0, acc: 100, pp: 10, pri: 4, desc: "Protects user from all attacks this turn.", volatileStatus: 'protect'},
	{id: 'naturesgrace', num: 129, name: 'Nature Grace', type: 'Nature', cat: 'Status', pwr: 0, acc: 100, pp: 5, desc: "Heals entire team of status conditions."},
	{id: 'bloodpact', num: 130, name: 'Blood Pact', type: 'Shadow', cat: 'Status', pwr: 0, acc: 100, pp: 10, desc: "Raises ATK and SpA by 2, lowers DEF and SpD by 1.", boosts: {atk: 2, spa: 2, def: -1, spd: -1}},
];

let generatedMoves = '';
for (const m of newMovesData) {
	let extras = '';
	if (m.sec) {
		extras += `secondary: { chance: ${m.sec.chance}, `;
		if (m.sec.boosts) extras += `boosts: {${Object.entries(m.sec.boosts).map(([k, v]) => k + ':' + v).join(',')}} `;
		if (m.sec.status) extras += `status: '${m.sec.status}' `;
		if (m.sec.volatileStatus) extras += `volatileStatus: '${m.sec.volatileStatus}' `;
		extras += `}, `;
	}
	if (m.self) {
		extras += `self: { boosts: {${Object.entries(m.self.boosts).map(([k, v]) => k + ':' + v).join(',')}} }, `;
	}
	if (m.drain) extras += `drain: [${m.drain[0]}, ${m.drain[1]}], `;
	if (m.recoil) extras += `recoil: [${m.recoil[0]}, ${m.recoil[1]}], `;
	if (m.heal) extras += `target: "self", heal: [${m.heal[0]}, ${m.heal[1]}], `;
	if (m.boosts) extras += `target: "self", boosts: {${Object.entries(m.boosts).map(([k, v]) => k + ':' + v).join(',')}}, `;

	generatedMoves += `
	${m.id}: {
		num: ${m.num},
		accuracy: ${m.acc},
		basePower: ${m.pwr},
		category: "${m.cat}",
		name: "${m.name}",
		pp: ${m.pp},
		priority: ${m.pri || 0},
		flags: { protect: 1, mirror: 1 ${m.cat === 'Physical' ? ', contact: 1' : ''} },
		shortDesc: "${m.desc}",
		${m.cat === 'Status' && !extras.includes('target:') ? 'target: "normal",' : (extras.includes('target:') ? '' : 'target: "normal",')}
		type: "${m.type}",
		${extras}
	},`;
}

// 1. Update Characters
let charsStr = fs.readFileSync(CHARACTERS_FILE, 'utf8');
charsStr = charsStr.replace('};', newCharacters + '\\n};');
fs.writeFileSync(CHARACTERS_FILE, charsStr);

// 2. Update Moves
let movesStr = fs.readFileSync(MOVES_FILE, 'utf8');
movesStr = movesStr.replace('};', generatedMoves + '\\n};');
fs.writeFileSync(MOVES_FILE, movesStr);

console.log("SUCCESS: Injected 30 moves & 6 characters into original game database!");
