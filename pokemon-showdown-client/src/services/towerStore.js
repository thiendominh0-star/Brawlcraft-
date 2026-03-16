/**
 * towerStore.js
 * Quản lý danh sách các "Bản Mẫu Màn Chơi" (Stage Templates) cho chế độ Tower/Campaign.
 */

const STORAGE_KEY_TOWER = 'brawlcraft_tower_templates';

const DEFAULT_TEMPLATES = [
	{
		id: 'stage_martial_1',
		name: 'Quân Đoàn Cận Chiến',
		tier: 1,
		brawlers: ['noxphantom', 'seraphknight'],
		rewards: {exp: 100},
		lootChance: 10,
	},
	{
		id: 'stage_venom_2',
		name: 'Rừng Sinh Hóa',
		tier: 1,
		brawlers: ['bonecolossus', 'voidweaver'],
		rewards: {exp: 150},
		lootChance: 15,
	},
	{
		id: 'stage_boss_1',
		name: 'Thực Thể Vũ Trụ',
		tier: 'boss',
		brawlers: ['astraldrake'], // In the future, this could be a special Boss id
		rewards: {exp: 1000},
		lootChance: 100,
	}
];

export const loadTowerTemplates = () => {
	const data = localStorage.getItem(STORAGE_KEY_TOWER);
	if (data) {
		try {
			return JSON.parse(data);
		} catch (e) {
			console.error('Lỗi đọc Tower Templates:', e);
		}
	}
	return DEFAULT_TEMPLATES;
};

export const saveTowerTemplates = (templates) => {
	localStorage.setItem(STORAGE_KEY_TOWER, JSON.stringify(templates));
};

export const createBlankTemplate = () => ({
	id: '',
	name: 'Màn chơi mới',
	tier: 1,
	brawlers: [],
	rewards: {exp: 100},
	lootChance: 0,
});

/* =========================================================
   BOSS FORGE SECTION (Exclusive Tower Bosses)
   ========================================================= */
const STORAGE_KEY_BOSSES = 'brawlcraft_tower_bosses';

export const loadBosses = () => {
	const data = localStorage.getItem(STORAGE_KEY_BOSSES);
	if (data) return JSON.parse(data);
	return [];
};

export const saveBosses = (bosses) => {
	localStorage.setItem(STORAGE_KEY_BOSSES, JSON.stringify(bosses));
};

export const createBlankBoss = () => ({
	id: '',
	name: 'Trùm Vô Danh',
	types: ['Shadow'],
	abilities: ['No Ability'],
	imageUrl: '',
	baseStats: {hp: 500, atk: 150, def: 150, spa: 150, spd: 150, spe: 100},
	moves: [],
	isImmune: true // Miễn Khống Chế
});

/* =========================================================
   GLOBAL CONFIG SECTION (Tower Run Parameters)
   ========================================================= */
const STORAGE_KEY_GLOBAL_CONFIG = 'brawlcraft_tower_global_config';

export const loadTowerGlobalConfig = () => {
	const data = localStorage.getItem(STORAGE_KEY_GLOBAL_CONFIG);
	if (data) return JSON.parse(data);
	// Mặc định
	return { totalFloors: 10, baseLevel: 10, levelStep: 10 };
};

export const saveTowerGlobalConfig = (config) => {
	localStorage.setItem(STORAGE_KEY_GLOBAL_CONFIG, JSON.stringify(config));
};

/* =========================================================
   CAMPAIGN STATE (Player Progress Tracking)
   ========================================================= */
const STORAGE_KEY_CAMPAIGN_RUN = 'brawlcraft_campaign_run';
const STORAGE_KEY_CAMPAIGN_STAGE = 'brawlcraft_campaign_stage';

export const loadCampaignRun = () => {
	const data = localStorage.getItem(STORAGE_KEY_CAMPAIGN_RUN);
	return data ? JSON.parse(data) : null;
};

export const saveCampaignRun = (run) => {
	localStorage.setItem(STORAGE_KEY_CAMPAIGN_RUN, JSON.stringify(run));
};

export const clearCampaignRun = () => {
	localStorage.removeItem(STORAGE_KEY_CAMPAIGN_RUN);
	localStorage.removeItem(STORAGE_KEY_CAMPAIGN_STAGE);
};

export const loadCampaignCurrentStage = () => {
	const data = localStorage.getItem(STORAGE_KEY_CAMPAIGN_STAGE);
	return data ? parseInt(data, 10) : 1; // Mặc định ở Màn 1
};

export const saveCampaignCurrentStage = (stageIdx) => {
	localStorage.setItem(STORAGE_KEY_CAMPAIGN_STAGE, stageIdx.toString());
};
