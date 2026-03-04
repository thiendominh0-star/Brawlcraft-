const fs = require('fs');
const path = require('path');

const ROSTER_FILE = path.join(__dirname, 'pokemon-showdown-client', 'src', 'services', 'rosterStore.js');

let content = fs.readFileSync(ROSTER_FILE, 'utf8');

const newBrawlers = `
	{
		id: 'crimsonassassin',
		name: 'Crimson Assassin',
		types: ['Shadow', 'Dragon'],
		abilities: ['Swift Step'],
		imageUrl: '',
		baseStats: {hp: 310, atk: 140, def: 60, spa: 50, spd: 65, spe: 130},
		moves: [],
	},
	{
		id: 'tidalshaman',
		name: 'Tidal Shaman',
		types: ['Nature', 'Arcane'],
		abilities: ['Arcane Mastery'],
		imageUrl: '',
		baseStats: {hp: 380, atk: 60, def: 85, spa: 110, spd: 120, spe: 80},
		moves: [],
	},
	{
		id: 'ironsentinel',
		name: 'Iron Sentinel',
		types: ['Holy'],
		abilities: ['Thick Hide'],
		imageUrl: '',
		baseStats: {hp: 450, atk: 90, def: 150, spa: 60, spd: 110, spe: 40},
		moves: [],
	},
	{
		id: 'voidwalker',
		name: 'Void Walker',
		types: ['Undead', 'Shadow'],
		abilities: ['Berserker'],
		imageUrl: '',
		baseStats: {hp: 500, atk: 110, def: 90, spa: 100, spd: 90, spe: 50},
		moves: [],
	},
	{
		id: 'astralweaver',
		name: 'Astral Weaver',
		types: ['Arcane'],
		abilities: ['Arcane Mastery'],
		imageUrl: '',
		baseStats: {hp: 280, atk: 40, def: 70, spa: 150, spd: 85, spe: 115},
		moves: [],
	},
	{
		id: 'stormdrake',
		name: 'Storm Drake',
		types: ['Dragon', 'Nature'],
		abilities: ['Thick Hide'],
		imageUrl: '',
		baseStats: {hp: 350, atk: 125, def: 85, spa: 105, spd: 85, spe: 100},
		moves: [],
	},
`;

const newMovesData = [
	{id: 'crimsonblade', name: 'Crimson Blade', type: 'Shadow', category: 'Physical', power: 95, accuracy: 100, pp: 15, effect: "High crit chance."},
	{id: 'holybash', name: 'Holy Bash', type: 'Holy', category: 'Physical', power: 80, accuracy: 100, pp: 20, effect: "30% chance to flinch."},
	{id: 'dragonsweep', name: 'Dragon Sweep', type: 'Dragon', category: 'Physical', power: 110, accuracy: 90, pp: 10, effect: "Hits all adjacent foes."},
	{id: 'naturefang', name: 'Nature Fang', type: 'Nature', category: 'Physical', power: 75, accuracy: 100, pp: 15, effect: "Heals 50% of damage dealt."},
	{id: 'undeadstrike', name: 'Undead Strike', type: 'Undead', category: 'Physical', power: 120, accuracy: 100, pp: 15, effect: "User takes recoil damage."},
	{id: 'arcaneedge', name: 'Arcane Edge', type: 'Arcane', category: 'Physical', power: 90, accuracy: 100, pp: 15, effect: "Bypasses accuracy checks."},
	{id: 'voidcrush', name: 'Void Crush', type: 'Undead', category: 'Physical', power: 100, accuracy: 90, pp: 10, effect: "20% chance to lower DEF."},
	{id: 'ironfist', name: 'Iron Fist', type: 'Holy', category: 'Physical', power: 85, accuracy: 100, pp: 15, effect: "Power increases if user goes last."},
	{id: 'quickslash', name: 'Quick Slash', type: 'Shadow', category: 'Physical', power: 40, accuracy: 100, pp: 30, effect: "Usually goes first."},
	{id: 'savagebite', name: 'Savage Bite', type: 'Dragon', category: 'Physical', power: 65, accuracy: 95, pp: 15, effect: "Bite attack with 10% flinch."},
	{id: 'astralbeam', name: 'Astral Beam', type: 'Arcane', category: 'Special', power: 90, accuracy: 100, pp: 15, effect: "10% chance to lower enemy SpD."},
	{id: 'shadowburst', name: 'Shadow Burst', type: 'Shadow', category: 'Special', power: 130, accuracy: 90, pp: 5, effect: "Lowers user SpA by 2."},
	{id: 'divinewrath', name: 'Divine Wrath', type: 'Holy', category: 'Special', power: 100, accuracy: 100, pp: 10, effect: "Ignores target stat changes."},
	{id: 'tidalwave', name: 'Tidal Wave', type: 'Nature', category: 'Special', power: 95, accuracy: 100, pp: 10, effect: "Hits all adjacent targets."},
	{id: 'soulburn', name: 'Soul Burn', type: 'Undead', category: 'Special', power: 80, accuracy: 100, pp: 15, effect: "20% chance to burn target (reduces ATK)."},
	{id: 'dragonbreath', name: 'Dragon Breath', type: 'Dragon', category: 'Special', power: 60, accuracy: 100, pp: 20, effect: "30% chance to paralyze target."},
	{id: 'naturepulse', name: 'Nature Pulse', type: 'Nature', category: 'Special', power: 80, accuracy: 100, pp: 20, effect: "No additional effect."},
	{id: 'arcanestorm', name: 'Arcane Storm', type: 'Arcane', category: 'Special', power: 110, accuracy: 70, pp: 10, effect: "High power, low accuracy."},
	{id: 'holysmend', name: 'Holy Smite', type: 'Holy', category: 'Special', power: 60, accuracy: 100, pp: 25, effect: "Never misses."},
	{id: 'darkvoid', name: 'Dark Void', type: 'Shadow', category: 'Status', power: 0, accuracy: 80, pp: 5, effect: "Hits hard but might miss."},
	{id: 'healinglight', name: 'Healing Light', type: 'Holy', category: 'Status', power: 0, accuracy: 100, pp: 10, effect: "Heals user by 50% max HP."},
	{id: 'dragondance', name: 'Dragon Dance', type: 'Dragon', category: 'Status', power: 0, accuracy: 100, pp: 20, effect: "Raises user ATK and SPE by 1."},
	{id: 'arcaneshield', name: 'Arcane Shield', type: 'Arcane', category: 'Status', power: 0, accuracy: 100, pp: 15, effect: "Raises user DEF and SpD by 1."},
	{id: 'naturegrowth', name: 'Nature Growth', type: 'Nature', category: 'Status', power: 0, accuracy: 100, pp: 15, effect: "Raises user SpA and SpD by 1."},
	{id: 'shadowcloak', name: 'Shadow Cloak', type: 'Shadow', category: 'Status', power: 0, accuracy: 100, pp: 15, effect: "Raises evasiveness by 1."},
	{id: 'undeadcurse', name: 'Undead Curse', type: 'Undead', category: 'Status', power: 0, accuracy: 100, pp: 10, effect: "Curses target, dealing 1/4 HP damage per turn."},
	{id: 'astraltrance', name: 'Astral Trance', type: 'Arcane', category: 'Status', power: 0, accuracy: 100, pp: 10, effect: "Raises user SpA by 2."},
	{id: 'holyward', name: 'Holy Ward', type: 'Holy', category: 'Status', power: 0, accuracy: 100, pp: 10, effect: "Protects user from all attacks this turn."},
	{id: 'naturesgrace', name: 'Nature Grace', type: 'Nature', category: 'Status', power: 0, accuracy: 100, pp: 5, effect: "Heals entire team of status conditions."},
	{id: 'bloodpact', name: 'Blood Pact', type: 'Shadow', category: 'Status', power: 0, accuracy: 100, pp: 10, effect: "Raises ATK/SPA by 2, lowers DEF/SPD by 1."},
];

const newMovesStr = newMovesData.map(m =>
	`\t{id: '${m.id}', name: '${m.name}', type: '${m.type}', category: '${m.category}', power: ${m.power}, accuracy: ${m.accuracy}, pp: ${m.pp}, effect: '${m.effect}', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },`
).join('\\n');

if (!content.includes('crimsonassassin')) {
	content = content.replace('] // DEFAULT_ROSTER_END', newBrawlers + '] // DEFAULT_ROSTER_END');

	// We need to find the array end for DEFAULT_ROSTER.
	// In rosterStore.js lines 11-96 is DEFAULT_ROSTER.
	content = content.replace('		],\\n\\t},\\n]', '		],\\n\\t},' + newBrawlers + '\\n]');

	// Let's add DEFAULT_MOVES
	const defaultMovesDefinition = `\\nconst DEFAULT_MOVES = [\\n${newMovesStr}\\n];\\n`;
	content = content.replace('export const AVAILABLE_TYPES', defaultMovesDefinition + 'export const AVAILABLE_TYPES');

	// And modify loadMoves to fallback to DEFAULT_MOVES
	content = content.replace('	return []\\n}\\n\\n/** Lưu Moves', '	return DEFAULT_MOVES.map(m => ({...m}))\\n}\\n\\n/** Lưu Moves');

	// Make resetRoster also reset moves!
	content = content.replace('export function resetRoster() {\\n\\tlocalStorage.removeItem(STORAGE_KEY)\\n\\treturn DEFAULT_ROSTER.map(c => ({...c}))\\n}',
		'export function resetRoster() {\\n\\tlocalStorage.removeItem(STORAGE_KEY)\\n\\tlocalStorage.removeItem(STORAGE_KEY_MOVES)\\n\\treturn DEFAULT_ROSTER.map(c => ({...c}))\\n}');

	fs.writeFileSync(ROSTER_FILE, content);
	console.log('rosterStore.js patched successfully!');
} else {
	console.log('rosterStore.js already patched.');
}
