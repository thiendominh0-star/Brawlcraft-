export const Characters: import('../sim/dex-species').SpeciesDataTable = {
	shadowblade: {
		num: 1,
		name: "Shadow Blade",
		types: ["Assassin", "Fiend"],
		baseStats: { hp: 400, atk: 90, def: 30, spa: 20, spd: 30, spe: 80 },
		weightkg: 60,
	},
	arcanesniper: {
		num: 2,
		name: "Arcane Sniper",
		types: ["Marksman", "Mage"],
		baseStats: { hp: 350, atk: 85, def: 25, spa: 85, spd: 25, spe: 70 },
		weightkg: 50,
	},
	holyknight: {
		num: 3,
		name: "Holy Knight",
		types: ["Paladin", "Cleric"],
		baseStats: { hp: 600, atk: 50, def: 80, spa: 40, spd: 80, spe: 30 },
		weightkg: 120,
	},
	undeadbrute: {
		num: 4,
		name: "Undead Brute",
		types: ["Zombie", "Juggernaut"],
		baseStats: { hp: 800, atk: 70, def: 60, spa: 10, spd: 40, spe: 20 },
		weightkg: 200,
	},
	dragonmage: {
		num: 5,
		name: "Dragon Mage",
		types: ["Dragon", "Mage"],
		baseStats: { hp: 500, atk: 40, def: 50, spa: 95, spd: 50, spe: 60 },
		weightkg: 150,
	},
	naturegolem: {
		num: 6,
		name: "Nature Golem",
		types: ["Construct", "Elemental"],
		baseStats: { hp: 700, atk: 60, def: 90, spa: 50, spd: 70, spe: 10 },
		weightkg: 500,
	},
};
