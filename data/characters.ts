export const Characters: import('../sim/dex-species').SpeciesDataTable = {
	pikachu: {
		num: 25,
		name: "Pikachu",
		types: ["Electric"],
		baseStats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 },
		abilities: { 0: "No Ability", H: "Berserker" },
		weightkg: 6,
	},
	arcanesniper: {
		num: 1002,
		name: "Arcane Sniper",
		types: ["Arcane"],
		baseStats: { hp: 70, atk: 110, def: 70, spa: 110, spd: 70, spe: 120 },
		abilities: { 0: "No Ability" },
		weightkg: 40,
	},
	shadowblade: {
		num: 1001,
		name: "Shadow Blade",
		types: ["Shadow"],
		baseStats: { hp: 80, atk: 120, def: 80, spa: 60, spd: 70, spe: 110 },
		abilities: { 0: "No Ability" },
		weightkg: 50,
	}
};
