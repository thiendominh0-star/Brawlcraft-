export const Moves: import('../sim/dex-moves').MoveDataTable = {
	tackle: {
		num: 33,
		accuracy: 100,
		basePower: 40,
		category: "Physical",
		name: "Tackle",
		pp: 35,
		priority: 0,
		flags: { contact: 1, protect: 1, mirror: 1 },
		target: "normal",
		type: "Normal",
		contestType: "Tough",
	},
	quickattack: {
		num: 98,
		accuracy: 100,
		basePower: 40,
		category: "Physical",
		name: "Quick Attack",
		pp: 30,
		priority: 1,
		flags: { contact: 1, protect: 1, mirror: 1 },
		target: "normal",
		type: "Normal",
		contestType: "Cool",
	}
};
