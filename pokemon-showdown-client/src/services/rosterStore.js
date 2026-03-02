/**
 * rosterStore.js
 * Quản lý danh sách nhân vật, lưu vào localStorage.
 * Trang Admin ghi -> Teambuilder đọc từ đây.
 */

const STORAGE_KEY = 'brawlcraft_roster'

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
]

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
		cost: {type: 'none', value: 0}, // Trả trước: 'hp' (trừ %hp hiện tại), 'none'
		drawback: {type: 'none', stat: 'atk', stage: 1}, // Trả sau: 'stat' (self-drop), 'recoil' (% dmg), 'none'
		secondary: {chance: 100, type: 'none', target: 'enemy', stat: 'def', stage: 1, volatile: 'none'}, // Effect: 'stat' (buff/debuff), 'status' (burn/para), 'volatile' (flinch)
		effect: '', // Text mô tả sinh tự động
	}
}
