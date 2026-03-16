/**
 * towerGenerator.js
 * Tiện ích sinh chuỗi Tháp Nhỏ (Tower Run) theo phong cách Roguelike.
 * Sử dụng Stage Templates từ towerStore.js
 */

import {loadTowerTemplates, loadTowerGlobalConfig} from './towerStore.js';

/**
 * Sinh ra một Tower Run mới gồm số tầng tuỳ biến do Admin gán.
 */
export const generateTowerRun = () => {
	const templates = loadTowerTemplates();
	const config = loadTowerGlobalConfig();
	const TOTAL_FLOORS = config.totalFloors || 10;
	const BASE_LEVEL = config.baseLevel || 10;
	const LEVEL_STEP = config.levelStep || 10;

	// Phân loại template theo Tier
	const tier1 = templates.filter(t => t.tier === 1);
	const tier2 = templates.filter(t => t.tier === 2);
	const tier3 = templates.filter(t => t.tier === 3);
	const bossTemplates = templates.filter(t => t.tier === 'boss');

	const run = [];

	for (let floor = 1; floor <= TOTAL_FLOORS; floor++) {
		let pool = [];
		let isBoss = false;

		// Phân bổ Tier theo tầng (Giả định 10 tầng)
		// Tầng 1-3: Tier 1
		// Tầng 4-6: Tier 2
		// Tầng 7-9: Tier 3
		// Tầng 10: Boss

		if (floor === TOTAL_FLOORS) {
			pool = bossTemplates;
			isBoss = true;
		} else if (floor >= 7) {
			pool = tier3.length > 0 ? tier3 : (tier2.length > 0 ? tier2 : tier1);
		} else if (floor >= 4) {
			pool = tier2.length > 0 ? tier2 : tier1;
		} else {
			pool = tier1.length > 0 ? tier1 : templates; // Fallback
		}

		// Nếu pool vẫn rỗng do Admin chưa tạo Màn chơi nào
		if (!pool || pool.length === 0) {
			run.push({
				floorNumber: floor,
				isBoss,
				templateId: 'placeholder',
				name: `Tầng ${floor} (Trống)`,
				enemyLevel: BASE_LEVEL + (floor * LEVEL_STEP),
				brawlers: [],
				rewards: {exp: 100 * floor},
				lootChance: 10
			});
			continue;
		}

		// Pick ngẫu nhiên 1 template từ Pool
		const chosenTemplate = pool[Math.floor(Math.random() * pool.length)];

		// Tính toán Level tự động dựa trên vị trí Tầng (Floor)
		const enemyLevel = BASE_LEVEL + (floor * LEVEL_STEP);

		run.push({
			floorNumber: floor,
			isBoss,
			templateId: chosenTemplate.id,
			name: chosenTemplate.name,
			enemyLevel,
			brawlers: chosenTemplate.brawlers,
			rewards: chosenTemplate.rewards,
			lootChance: chosenTemplate.lootChance
		});
	}

	return run;
};

/**
 * Lưu quá trình Leo Tháp vào Local Storage
 */
const STORAGE_KEY_CURRENT_RUN = 'brawlcraft_current_run';

export const saveTowerRun = (runState) => {
	localStorage.setItem(STORAGE_KEY_CURRENT_RUN, JSON.stringify(runState));
};

export const loadTowerRun = () => {
	const data = localStorage.getItem(STORAGE_KEY_CURRENT_RUN);
	if (data) return JSON.parse(data);
	return null;
};
