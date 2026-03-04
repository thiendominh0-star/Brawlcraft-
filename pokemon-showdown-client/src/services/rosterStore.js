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
		id: 'shadowblade',
		name: 'Shadow Blade',
		types: ['Shadow'],
		abilities: ['Swift Step'],
		imageUrl: '',
		baseStats: {hp: 340, atk: 120, def: 80, spa: 70, spd: 75, spe: 110},
		moves: [
			{id: 'shadowslash', name: 'Shadow Slash', type: 'Shadow', category: 'Physical', power: 90, accuracy: 100, pp: 15, effect: ''},
			{id: 'darkveil', name: 'Dark Veil', type: 'Shadow', category: 'Status', power: 0, accuracy: 100, pp: 10, effect: 'Raises user DEF by 1'},
			{id: 'phantomstrike', name: 'Phantom Strike', type: 'Shadow', category: 'Physical', power: 110, accuracy: 90, pp: 10, effect: 'High crit ratio'},
			{id: 'nightfall', name: 'Nightfall', type: 'Shadow', category: 'Special', power: 80, accuracy: 100, pp: 15, effect: ''},
		],
	},
	{
		id: 'arcanesniper',
		name: 'Arcane Sniper',
		types: ['Arcane'],
		abilities: ['Arcane Mastery'],
		imageUrl: '',
		baseStats: {hp: 290, atk: 85, def: 65, spa: 130, spd: 80, spe: 120},
		moves: [
			{id: 'arcanebolt', name: 'Arcane Bolt', type: 'Arcane', category: 'Special', power: 95, accuracy: 100, pp: 15, effect: ''},
			{id: 'magicsnipe', name: 'Magic Snipe', type: 'Arcane', category: 'Special', power: 120, accuracy: 85, pp: 8, effect: 'Always strikes last'},
			{id: 'runicshield', name: 'Runic Shield', type: 'Arcane', category: 'Status', power: 0, accuracy: 100, pp: 10, effect: 'Raises user SPD by 1'},
			{id: 'manaleak', name: 'Mana Leak', type: 'Arcane', category: 'Special', power: 75, accuracy: 100, pp: 20, effect: 'Lowers target SPA by 1'},
		],
	},
	{
		id: 'holyknight',
		name: 'Holy Knight',
		types: ['Holy'],
		abilities: ['Thick Hide'],
		imageUrl: '',
		baseStats: {hp: 420, atk: 105, def: 115, spa: 75, spd: 110, spe: 70},
		moves: [
			{id: 'holysmite', name: 'Holy Smite', type: 'Holy', category: 'Physical', power: 85, accuracy: 100, pp: 15, effect: ''},
			{id: 'divineshield', name: 'Divine Shield', type: 'Holy', category: 'Status', power: 0, accuracy: 100, pp: 10, effect: 'Raises user DEF+SPD by 1'},
			{id: 'radianceburst', name: 'Radiance Burst', type: 'Holy', category: 'Special', power: 100, accuracy: 90, pp: 10, effect: 'May burn target'},
			{id: 'sacredblade', name: 'Sacred Blade', type: 'Holy', category: 'Physical', power: 110, accuracy: 95, pp: 10, effect: 'High crit ratio'},
		],
	},
	{
		id: 'undeadbrute',
		name: 'Undead Brute',
		types: ['Undead'],
		abilities: ['Berserker'],
		imageUrl: '',
		baseStats: {hp: 480, atk: 135, def: 130, spa: 40, spd: 60, spe: 45},
		moves: [
			{id: 'bonecrusher', name: 'Bone Crusher', type: 'Undead', category: 'Physical', power: 100, accuracy: 95, pp: 10, effect: 'May lower target DEF'},
			{id: 'deathgrip', name: 'Death Grip', type: 'Undead', category: 'Physical', power: 120, accuracy: 80, pp: 8, effect: ''},
			{id: 'plagueaura', name: 'Plague Aura', type: 'Undead', category: 'Status', power: 0, accuracy: 100, pp: 10, effect: 'Poisons target'},
			{id: 'tombstomp', name: 'Tomb Stomp', type: 'Undead', category: 'Physical', power: 80, accuracy: 100, pp: 15, effect: ''},
		],
	},
	{
		id: 'dragonmage',
		name: 'Dragon Mage',
		types: ['Dragon', 'Arcane'],
		abilities: ['Arcane Mastery', 'Swift Step'],
		imageUrl: '',
		baseStats: {hp: 310, atk: 80, def: 70, spa: 145, spd: 90, spe: 105},
		moves: [
			{id: 'dragonpulse', name: 'Dragon Pulse', type: 'Dragon', category: 'Special', power: 95, accuracy: 100, pp: 15, effect: ''},
			{id: 'arcanedrain', name: 'Arcane Drain', type: 'Arcane', category: 'Special', power: 75, accuracy: 100, pp: 15, effect: 'Heals 50% of damage dealt'},
			{id: 'wyrmfire', name: 'Wyrm Fire', type: 'Dragon', category: 'Special', power: 130, accuracy: 80, pp: 8, effect: ''},
			{id: 'timewarp', name: 'Time Warp', type: 'Arcane', category: 'Status', power: 0, accuracy: 100, pp: 8, effect: 'User moves first next turn'},
		],
	},
	{
		id: 'naturegolem',
		name: 'Nature Golem',
		types: ['Nature'],
		abilities: ['Thick Hide'],
		imageUrl: '',
		baseStats: {hp: 400, atk: 100, def: 140, spa: 60, spd: 120, spe: 35},
		moves: [
			{id: 'rockslam', name: 'Rock Slam', type: 'Nature', category: 'Physical', power: 90, accuracy: 100, pp: 15, effect: ''},
			{id: 'thornwall', name: 'Thorn Wall', type: 'Nature', category: 'Status', power: 0, accuracy: 100, pp: 10, effect: 'Raises user DEF by 2'},
			{id: 'gaiaburst', name: 'Gaia Burst', type: 'Nature', category: 'Special', power: 110, accuracy: 90, pp: 10, effect: ''},
			{id: 'entangle', name: 'Entangle', type: 'Nature', category: 'Status', power: 0, accuracy: 100, pp: 10, effect: 'Lowers target SPE by 2'},
		],
	},
,
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
	}
]


const DEFAULT_MOVES = [
	{id: 'crimsonblade', name: 'Crimson Blade', type: 'Shadow', category: 'Physical', power: 95, accuracy: 100, pp: 15, effect: 'High crit chance.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'holybash', name: 'Holy Bash', type: 'Holy', category: 'Physical', power: 80, accuracy: 100, pp: 20, effect: '30% chance to flinch.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'dragonsweep', name: 'Dragon Sweep', type: 'Dragon', category: 'Physical', power: 110, accuracy: 90, pp: 10, effect: 'Hits all adjacent foes.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'naturefang', name: 'Nature Fang', type: 'Nature', category: 'Physical', power: 75, accuracy: 100, pp: 15, effect: 'Heals 50% of damage dealt.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'undeadstrike', name: 'Undead Strike', type: 'Undead', category: 'Physical', power: 120, accuracy: 100, pp: 15, effect: 'User takes recoil damage.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'arcaneedge', name: 'Arcane Edge', type: 'Arcane', category: 'Physical', power: 90, accuracy: 100, pp: 15, effect: 'Bypasses accuracy checks.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'voidcrush', name: 'Void Crush', type: 'Undead', category: 'Physical', power: 100, accuracy: 90, pp: 10, effect: '20% chance to lower DEF.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'ironfist', name: 'Iron Fist', type: 'Holy', category: 'Physical', power: 85, accuracy: 100, pp: 15, effect: 'Power increases if user goes last.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'quickslash', name: 'Quick Slash', type: 'Shadow', category: 'Physical', power: 40, accuracy: 100, pp: 30, effect: 'Usually goes first.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'savagebite', name: 'Savage Bite', type: 'Dragon', category: 'Physical', power: 65, accuracy: 95, pp: 15, effect: 'Bite attack with 10% flinch.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'astralbeam', name: 'Astral Beam', type: 'Arcane', category: 'Special', power: 90, accuracy: 100, pp: 15, effect: '10% chance to lower enemy SpD.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'shadowburst', name: 'Shadow Burst', type: 'Shadow', category: 'Special', power: 130, accuracy: 90, pp: 5, effect: 'Lowers user SpA by 2.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'divinewrath', name: 'Divine Wrath', type: 'Holy', category: 'Special', power: 100, accuracy: 100, pp: 10, effect: 'Ignores target stat changes.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'tidalwave', name: 'Tidal Wave', type: 'Nature', category: 'Special', power: 95, accuracy: 100, pp: 10, effect: 'Hits all adjacent targets.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'soulburn', name: 'Soul Burn', type: 'Undead', category: 'Special', power: 80, accuracy: 100, pp: 15, effect: '20% chance to burn target (reduces ATK).', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'dragonbreath', name: 'Dragon Breath', type: 'Dragon', category: 'Special', power: 60, accuracy: 100, pp: 20, effect: '30% chance to paralyze target.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'naturepulse', name: 'Nature Pulse', type: 'Nature', category: 'Special', power: 80, accuracy: 100, pp: 20, effect: 'No additional effect.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'arcanestorm', name: 'Arcane Storm', type: 'Arcane', category: 'Special', power: 110, accuracy: 70, pp: 10, effect: 'High power, low accuracy.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'holysmend', name: 'Holy Smite', type: 'Holy', category: 'Special', power: 60, accuracy: 100, pp: 25, effect: 'Never misses.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'darkvoid', name: 'Dark Void', type: 'Shadow', category: 'Status', power: 0, accuracy: 80, pp: 5, effect: 'Hits hard but might miss.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'healinglight', name: 'Healing Light', type: 'Holy', category: 'Status', power: 0, accuracy: 100, pp: 10, effect: 'Heals user by 50% max HP.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'dragondance', name: 'Dragon Dance', type: 'Dragon', category: 'Status', power: 0, accuracy: 100, pp: 20, effect: 'Raises user ATK and SPE by 1.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'arcaneshield', name: 'Arcane Shield', type: 'Arcane', category: 'Status', power: 0, accuracy: 100, pp: 15, effect: 'Raises user DEF and SpD by 1.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'naturegrowth', name: 'Nature Growth', type: 'Nature', category: 'Status', power: 0, accuracy: 100, pp: 15, effect: 'Raises user SpA and SpD by 1.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'shadowcloak', name: 'Shadow Cloak', type: 'Shadow', category: 'Status', power: 0, accuracy: 100, pp: 15, effect: 'Raises evasiveness by 1.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'undeadcurse', name: 'Undead Curse', type: 'Undead', category: 'Status', power: 0, accuracy: 100, pp: 10, effect: 'Curses target, dealing 1/4 HP damage per turn.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'astraltrance', name: 'Astral Trance', type: 'Arcane', category: 'Status', power: 0, accuracy: 100, pp: 10, effect: 'Raises user SpA by 2.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'holyward', name: 'Holy Ward', type: 'Holy', category: 'Status', power: 0, accuracy: 100, pp: 10, effect: 'Protects user from all attacks this turn.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'naturesgrace', name: 'Nature Grace', type: 'Nature', category: 'Status', power: 0, accuracy: 100, pp: 5, effect: 'Heals entire team of status conditions.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
	{id: 'bloodpact', name: 'Blood Pact', type: 'Shadow', category: 'Status', power: 0, accuracy: 100, pp: 10, effect: 'Raises ATK/SPA by 2, lowers DEF/SPD by 1.', cost: {type: 'none'}, drawback: {type: 'none'}, secondary: {type: 'none'} },
];
export const AVAILABLE_TYPES = ['Shadow', 'Arcane', 'Holy', 'Undead', 'Dragon', 'Nature']
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
		cost: {type: 'none'}, // Mặc định là none (Không có optional)
		drawback: {type: 'none'}, // Không có drawback optional
		secondary: {type: 'none'}, // Không có effect optional
		effect: '',
	}
}
