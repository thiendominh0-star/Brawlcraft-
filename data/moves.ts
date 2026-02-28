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
	},
	struggle: {
		num: 165,
		accuracy: true,
		basePower: 50,
		category: "Physical",
		name: "Struggle",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		flags: { contact: 1, protect: 1, mirror: 1 },
		target: "randomNormal",
		type: "Normal",
	},
	// Shadow
	shadowslash: { num: 1001, accuracy: 100, basePower: 90, category: "Physical", name: "Shadow Slash", pp: 15, priority: 0, flags: { contact: 1, protect: 1, mirror: 1 }, target: "normal", type: "Shadow" },
	darkveil: { num: 1002, accuracy: 100, basePower: 0, category: "Status", name: "Dark Veil", pp: 10, priority: 0, flags: { snatch: 1 }, boosts: { def: 1 }, target: "self", type: "Shadow" },
	phantomstrike: { num: 1003, accuracy: 90, basePower: 110, category: "Physical", name: "Phantom Strike", pp: 10, priority: 0, flags: { contact: 1, protect: 1, mirror: 1 }, critRatio: 2, target: "normal", type: "Shadow" },
	nightfall: { num: 1004, accuracy: 100, basePower: 80, category: "Special", name: "Nightfall", pp: 15, priority: 0, flags: { protect: 1, mirror: 1 }, target: "normal", type: "Shadow" },

	// Arcane
	arcanebolt: { num: 1005, accuracy: 100, basePower: 95, category: "Special", name: "Arcane Bolt", pp: 15, priority: 0, flags: { protect: 1, mirror: 1 }, target: "normal", type: "Arcane" },
	magicsnipe: { num: 1006, accuracy: 85, basePower: 120, category: "Special", name: "Magic Snipe", pp: 8, priority: -1, flags: { protect: 1, mirror: 1 }, target: "normal", type: "Arcane" },
	runicshield: { num: 1007, accuracy: 100, basePower: 0, category: "Status", name: "Runic Shield", pp: 10, priority: 0, flags: { snatch: 1 }, boosts: { spd: 1 }, target: "self", type: "Arcane" },
	manaleak: { num: 1008, accuracy: 100, basePower: 75, category: "Special", name: "Mana Leak", pp: 20, priority: 0, flags: { protect: 1, mirror: 1 }, secondary: { chance: 100, boosts: { spa: -1 } }, target: "normal", type: "Arcane" },

	// Holy
	holysmite: { num: 1009, accuracy: 100, basePower: 85, category: "Physical", name: "Holy Smite", pp: 15, priority: 0, flags: { contact: 1, protect: 1, mirror: 1 }, target: "normal", type: "Holy" },
	divineshield: { num: 1010, accuracy: 100, basePower: 0, category: "Status", name: "Divine Shield", pp: 10, priority: 0, flags: { snatch: 1 }, boosts: { def: 1, spd: 1 }, target: "self", type: "Holy" },
	radianceburst: { num: 1011, accuracy: 90, basePower: 100, category: "Special", name: "Radiance Burst", pp: 10, priority: 0, flags: { protect: 1, mirror: 1 }, secondary: { chance: 30, status: 'brn' }, target: "normal", type: "Holy" },
	sacredblade: { num: 1012, accuracy: 95, basePower: 110, category: "Physical", name: "Sacred Blade", pp: 10, priority: 0, flags: { contact: 1, protect: 1, mirror: 1 }, critRatio: 2, target: "normal", type: "Holy" },

	// Undead
	bonecrusher: { num: 1013, accuracy: 95, basePower: 100, category: "Physical", name: "Bone Crusher", pp: 10, priority: 0, flags: { contact: 1, protect: 1, mirror: 1 }, secondary: { chance: 50, boosts: { def: -1 } }, target: "normal", type: "Undead" },
	deathgrip: { num: 1014, accuracy: 80, basePower: 120, category: "Physical", name: "Death Grip", pp: 8, priority: 0, flags: { contact: 1, protect: 1, mirror: 1 }, target: "normal", type: "Undead" },
	plagueaura: { num: 1015, accuracy: 100, basePower: 0, category: "Status", name: "Plague Aura", pp: 10, priority: 0, flags: { protect: 1, reflectable: 1, mirror: 1 }, status: 'psn', target: "normal", type: "Undead" },
	tombstomp: { num: 1016, accuracy: 100, basePower: 80, category: "Physical", name: "Tomb Stomp", pp: 15, priority: 0, flags: { contact: 1, protect: 1, mirror: 1 }, target: "normal", type: "Undead" },

	// Dragon
	dragonpulse: { num: 406, accuracy: 100, basePower: 95, category: "Special", name: "Dragon Pulse", pp: 15, priority: 0, flags: { protect: 1, pulse: 1, mirror: 1, distance: 1 }, target: "any", type: "Dragon" },
	arcanedrain: { num: 1017, accuracy: 100, basePower: 75, category: "Special", name: "Arcane Drain", pp: 15, priority: 0, flags: { protect: 1, mirror: 1, heal: 1 }, drain: [1, 2], target: "normal", type: "Arcane" },
	wyrmfire: { num: 1018, accuracy: 80, basePower: 130, category: "Special", name: "Wyrm Fire", pp: 8, priority: 0, flags: { protect: 1, mirror: 1 }, target: "normal", type: "Dragon" },
	timewarp: { num: 1019, accuracy: 100, basePower: 0, category: "Status", name: "Time Warp", pp: 8, priority: 0, flags: { snatch: 1 }, boosts: { spe: 2 }, target: "self", type: "Arcane" },

	// Nature
	rockslam: { num: 1020, accuracy: 100, basePower: 90, category: "Physical", name: "Rock Slam", pp: 15, priority: 0, flags: { contact: 1, protect: 1, mirror: 1 }, target: "normal", type: "Nature" },
	thornwall: { num: 1021, accuracy: 100, basePower: 0, category: "Status", name: "Thorn Wall", pp: 10, priority: 0, flags: { snatch: 1 }, boosts: { def: 2 }, target: "self", type: "Nature" },
	gaiaburst: { num: 1022, accuracy: 90, basePower: 110, category: "Special", name: "Gaia Burst", pp: 10, priority: 0, flags: { protect: 1, mirror: 1 }, target: "normal", type: "Nature" },
	entangle: { num: 1023, accuracy: 100, basePower: 0, category: "Status", name: "Entangle", pp: 10, priority: 0, flags: { protect: 1, reflectable: 1, mirror: 1 }, boosts: { spe: -2 }, target: "normal", type: "Nature" },
	holyblessing: { num: 1024, accuracy: true, basePower: 0, category: "Status", name: "Holy Blessing", pp: 10, priority: 0, flags: { snatch: 1, heal: 1 }, heal: [1, 2], target: "self", type: "Holy" },
};
