const fs = require('fs');

const movesData = [
	{name: 'Phantom Ambush', type: 'Shadow', category: 'Physical', bp: 80, acc: 100, target: 'normal', props: {priority: 1, flags: {contact: 1, protect: 1, mirror: 1}}},
	{name: 'Shadow Tangle', type: 'Shadow', category: 'Status', bp: 0, acc: 90, target: 'normal', props: {volatileStatus: 'partiallytrapped', flags: {protect: 1, mirror: 1}}},

	{name: 'Mana Detonation', type: 'Arcane', category: 'Special', bp: 130, acc: 100, target: 'allAdjacentFoes', props: {self: {boosts: {spa: -2}}, flags: {protect: 1, mirror: 1}}},
	{name: 'Runic Overcharge', type: 'Arcane', category: 'Status', bp: 0, acc: true, target: 'self', props: {heal: [1, 1], volatileStatus: 'mustrecharge', flags: {heal: 1, snatch: 1}}},

	{name: 'Divine Smite', type: 'Holy', category: 'Physical', bp: 90, acc: 100, target: 'normal', props: {secondary: {chance: 30, self: {onHit: "function(pokemon) { pokemon.cureStatus(); }"}}, flags: {contact: 1, protect: 1, mirror: 1}}},
	{name: 'Aegis Aura', type: 'Holy', category: 'Status', bp: 0, acc: true, target: 'allySide', props: {sideCondition: 'safeguard', flags: {snatch: 1}}},

	{name: 'Soul Harvest', type: 'Undead', category: 'Special', bp: 70, acc: 100, target: 'normal', props: {drain: [1, 2], flags: {protect: 1, mirror: 1}}},
	{name: 'Grave Pulverize', type: 'Undead', category: 'Physical', bp: 120, acc: 100, target: 'normal', props: {recoil: [33, 100], flags: {contact: 1, protect: 1, mirror: 1}}},

	{name: 'Dragons Wrath', type: 'Dragon', category: 'Physical', bp: 100, acc: 100, target: 'normal', props: {ignoreDefensive: true, secondary: {chance: 30, status: 'brn'}, flags: {contact: 1, protect: 1, mirror: 1}}},
	{name: 'Meteor Dive', type: 'Dragon', category: 'Special', bp: 140, acc: 90, target: 'allAdjacentFoes', props: {self: {volatileStatus: 'mustrecharge'}, flags: {protect: 1, mirror: 1}}},

	{name: 'Quagmire Quake', type: 'Nature', category: 'Physical', bp: 90, acc: 100, target: 'allAdjacentFoes', props: {secondary: {chance: 100, boosts: {spe: -1}}, flags: {protect: 1, mirror: 1}}},
	{name: 'Spore Cloud', type: 'Nature', category: 'Status', bp: 0, acc: 100, target: 'normal', props: {status: 'slp', flags: {powder: 1, protect: 1, reflectable: 1, mirror: 1}}},

	{name: 'Vibro Slash', type: 'Mecha', category: 'Physical', bp: 75, acc: 100, target: 'normal', props: {critRatio: 2, flags: {contact: 1, protect: 1, mirror: 1}}},
	{name: 'Orbital Cannon', type: 'Plasma', category: 'Special', bp: 150, acc: 100, target: 'normal', props: {flags: {charge: 1, protect: 1, mirror: 1}, onTryMove: "function(attacker, defender, move) { if (attacker.removeVolatile(move.id)) { return; } this.add('-prepare', attacker, move.name); attacker.addVolatile('twoturnmove', defender); return null; }"}},

	{name: 'Meltdown', type: 'Plasma', category: 'Special', bp: 250, acc: 100, target: 'allAdjacent', props: {selfdestruct: 'always', flags: {protect: 1, mirror: 1}}},
	{name: 'Plasma Chain', type: 'Plasma', category: 'Special', bp: 80, acc: 100, target: 'normal', props: {secondary: {chance: 30, status: 'par'}, basePowerCallback: "function (pokemon, target, move) { if (target.status === 'par') return move.basePower * 2; return move.basePower; }", flags: {protect: 1, mirror: 1}}},

	{name: 'Singularity', type: 'Cosmic', category: 'Special', bp: 100, acc: 100, target: 'allAdjacentFoes', props: {onHit: "function () { this.add('-clearallboost'); for (const pokemon of this.getAllActive()) { pokemon.clearBoosts(); } }", flags: {protect: 1, mirror: 1}}},
	{name: 'Supernova Smash', type: 'Cosmic', category: 'Physical', bp: 120, acc: 100, target: 'normal', props: {recoil: [33, 100], secondary: {chance: 50, volatileStatus: 'flinch'}, flags: {contact: 1, protect: 1, mirror: 1}}},

	{name: 'Zero Point Strike', type: 'Frost', category: 'Physical', bp: 85, acc: 100, target: 'normal', props: {ignoreDefensive: true, flags: {contact: 1, protect: 1, mirror: 1}}},
	{name: 'Flash Freeze', type: 'Frost', category: 'Status', bp: 0, acc: 100, target: 'normal', props: {boosts: {spe: -2, spd: -1}, flags: {protect: 1, reflectable: 1, mirror: 1}}},

	{name: 'Hellfire Rain', type: 'Inferno', category: 'Special', bp: 95, acc: 100, target: 'allAdjacentFoes', props: {secondary: {chance: 50, status: 'brn'}, basePowerCallback: "function (pokemon, target, move) { if (target.status === 'brn') return move.basePower * 1.5; return move.basePower; }", flags: {protect: 1, mirror: 1}}},
	{name: 'Thermite Punch', type: 'Inferno', category: 'Physical', bp: 100, acc: 100, target: 'normal', props: {secondary: {chance: 100, status: 'brn'}, flags: {contact: 1, punch: 1, protect: 1, mirror: 1}}},

	{name: 'Hurricane Kick', type: 'Tempest', category: 'Physical', bp: 70, acc: 100, target: 'normal', props: {priority: 1, forceSwitch: true, flags: {contact: 1, protect: 1, mirror: 1}}},
	{name: 'Thunderstrike Cloud', type: 'Tempest', category: 'Special', bp: 110, acc: 70, target: 'normal', props: {onModifyMove: "function(move, pokemon, target) { if (target && target.status === 'par') { move.accuracy = true; } }", flags: {protect: 1, mirror: 1}}},

	{name: 'Venomous Fang', type: 'Venom', category: 'Physical', bp: 50, acc: 100, target: 'normal', props: {secondary: {chance: 100, status: 'tox'}, flags: {bite: 1, contact: 1, protect: 1, mirror: 1}}},
	{name: 'Acidic Vomit', type: 'Venom', category: 'Special', bp: 80, acc: 100, target: 'normal', props: {secondary: {chance: 100, boosts: {spd: -1}}, flags: {protect: 1, mirror: 1}}},

	{name: 'Zen Counter', type: 'Martial', category: 'Physical', bp: 0, acc: 100, target: 'scripted', props: {priority: -5, flags: {contact: 1, protect: 1}, damageCallback: "function (pokemon, target) { let lastAttackedBy = pokemon.getLastAttackedBy(); if (!lastAttackedBy || !lastAttackedBy.thisTurn || !this.queue.willMove(lastAttackedBy.pokemon)) return false; if (lastAttackedBy.move && lastAttackedBy.move.category === 'Physical') { return lastAttackedBy.damage * 2; } return false; }"}},
	{name: 'Flurry Strikes', type: 'Martial', category: 'Physical', bp: 25, acc: 90, target: 'normal', props: {multihit: [2, 5], flags: {contact: 1, protect: 1, mirror: 1}}},

	{name: 'Mind Shatter', type: 'Illusion', category: 'Special', bp: 80, acc: 100, target: 'normal', props: {overrideDefensiveStat: 'def', flags: {protect: 1, mirror: 1}}},
	{name: 'Dream Eater', type: 'Illusion', category: 'Special', bp: 100, acc: 100, target: 'normal', props: {drain: [1, 2], onTryImmunity: "function (target) { return target.status === 'slp' || target.hasAbility('comatose'); }", flags: {protect: 1, mirror: 1}}}
];

let exportCode = `export const Moves: import('../sim/dex-moves').MoveDataTable = {\n`;

let idCounter = 200;

for (let move of movesData) {
	let id = move.name.toLowerCase().replace(/[^a-z0-9]/g, '');
	let accVal = typeof move.acc === 'boolean' ? move.acc : move.acc;

	exportCode += `\t${id}: {\n`;
	exportCode += `\t\tnum: ${idCounter++},\n`;
	exportCode += `\t\taccuracy: ${accVal},\n`;
	exportCode += `\t\tbasePower: ${move.bp},\n`;
	exportCode += `\t\tcategory: "${move.category}",\n`;
	exportCode += `\t\tname: "${move.name}",\n`;
	exportCode += `\t\tpp: 10,\n`;
	exportCode += `\t\tpriority: ${move.props.priority || 0},\n`;
	exportCode += `\t\ttype: "${move.type}",\n`;
	exportCode += `\t\ttarget: "${move.target}",\n`;

	// Inject custom props
	for (const [key, value] of Object.entries(move.props)) {
		if (key === 'priority' || key === 'target') continue; // already handled
		if (typeof value === 'string' && value.startsWith('function')) {
			exportCode += `\t\t${key}: ${value},\n`;
		} else if (typeof value === 'object') {
			exportCode += `\t\t${key}: ${JSON.stringify(value)},\n`;
		} else {
			exportCode += `\t\t${key}: ${value},\n`;
		}
	}

	exportCode += `\t\tshortDesc: "Signature Move",\n`;
	exportCode += `\t},\n`;
}

// Thêm các moves phổ thông đơn giản (Universal Moves)
const universalMoves = [
	{name: "Strike", type: "Martial", category: "Physical", bp: 50, acc: 100},
	{name: "Blast", type: "Plasma", category: "Special", bp: 60, acc: 100},
	{name: "Guard", type: "Holy", category: "Status", bp: 0, acc: true, target: "self", props: {boosts: {def: 1, spd: 1}}}
];

for (let move of universalMoves) {
	let id = move.name.toLowerCase().replace(/[^a-z0-9]/g, '');
	exportCode += `\t${id}: {\n`;
	exportCode += `\t\tnum: ${idCounter++},\n`;
	exportCode += `\t\taccuracy: ${move.acc},\n`;
	exportCode += `\t\tbasePower: ${move.bp},\n`;
	exportCode += `\t\tcategory: "${move.category}",\n`;
	exportCode += `\t\tname: "${move.name}",\n`;
	exportCode += `\t\tpp: 20,\n`;
	exportCode += `\t\tpriority: 0,\n`;
	exportCode += `\t\ttype: "${move.type}",\n`;
	exportCode += `\t\ttarget: "${move.target || 'normal'}",\n`;

	if (move.props) {
		for (const [key, value] of Object.entries(move.props)) {
			exportCode += `\t\t${key}: ${JSON.stringify(value)},\n`;
		}
	}

	exportCode += `\t\tflags: {protect: 1, mirror: 1},\n`;
	exportCode += `\t\tshortDesc: "Universal move.",\n`;
	exportCode += `\t},\n`;
}

exportCode += `};\n`;

fs.writeFileSync('data/moves.ts', exportCode);
console.log('Successfully written data/moves.ts');

const frontendMoves = movesData.map(m => ({
	id: m.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
	name: m.name,
	type: m.type,
	category: m.category,
	basePower: m.bp,
	accuracy: m.acc,
	priority: m.props.priority || 0,
	target: m.target,
	desc: 'Signature Move'
}));

const universalFrontend = universalMoves.map(m => ({
	id: m.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
	name: m.name,
	type: m.type,
	category: m.category,
	basePower: m.bp,
	accuracy: m.acc,
	priority: 0,
	target: m.target || 'normal',
	desc: 'Universal Move'
}));

fs.writeFileSync('frontend_30_moves.json', JSON.stringify(frontendMoves.concat(universalFrontend), null, 2));
console.log('Successfully written frontend_30_moves.json');
