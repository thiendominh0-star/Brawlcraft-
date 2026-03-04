const fs = require('fs');

const enrichments = {
	shadowslash: {critRatio: 2},
	darkveil: {boosts: {def: 1}, target: 'self'},
	phantomstrike: {critRatio: 2},
	nightfall: {secondary: {chance: 30, volatileStatus: 'flinch'}},
	arcanebolt: {secondary: {chance: 10, boosts: {spd: -1}}},
	magicsnipe: {priority: -1},
	runicshield: {boosts: {spd: 1}, target: 'self'},
	manaleak: {secondary: {chance: 100, boosts: {spa: -1}}},
	holysmite: {accuracy: true},
	divineshield: {boosts: {def: 1, spd: 1}, target: 'self'},
	radianceburst: {secondary: {chance: 30, status: 'brn'}},
	sacredblade: {critRatio: 2},
	bonecrusher: {secondary: {chance: 20, boosts: {def: -1}}},
	deathgrip: {secondary: {chance: 100, volatileStatus: 'partiallytrapped'}},
	plagueaura: {status: 'psn', target: 'normal'},
	tombstomp: {secondary: {chance: 30, volatileStatus: 'flinch'}},
	dragonpulse: {},
	arcanedrain: {drain: [1, 2]},
	wyrmfire: {self: {boosts: {spa: -2}}},
	timewarp: {boosts: {spe: 2}, target: 'self'},
	rockslam: {secondary: {chance: 30, volatileStatus: 'confusion'}},
	thornwall: {boosts: {def: 2}, target: 'self'},
	gaiaburst: {self: {boosts: {spe: -1}}},
	entangle: {boosts: {spe: -2}, target: 'normal'},

	crimsonblade: {critRatio: 2},
	holybash: {secondary: {chance: 30, volatileStatus: 'flinch'}},
	dragonsweep: {target: 'allAdjacentFoes'},
	naturefang: {drain: [1, 2]},
	undeadstrike: {recoil: [33, 100]},
	arcaneedge: {accuracy: true},
	voidcrush: {secondary: {chance: 20, boosts: {def: -1}}},
	ironfist: {basePowerCallback: "function (pokemon, target, move) { if (this.queue.willMove(target)) return move.basePower; this.debug('iron fist boost'); return move.basePower * 1.5; }"},
	quickslash: {priority: 1},
	savagebite: {flags: {bite: 1, contact: 1, protect: 1, mirror: 1}, secondary: {chance: 10, volatileStatus: 'flinch'}},
	astralbeam: {secondary: {chance: 10, boosts: {spd: -1}}},
	shadowburst: {self: {boosts: {spa: -2}}},
	divinewrath: {ignoreDefensive: true, ignoreEvasion: true},
	tidalwave: {target: 'allAdjacentFoes'},
	soulburn: {secondary: {chance: 20, status: 'brn'}},
	dragonbreath: {secondary: {chance: 30, status: 'par'}},
	naturepulse: {flags: {pulse: 1, protect: 1, mirror: 1}},
	holysmend: {accuracy: true},
	darkvoid: {status: 'slp', target: 'allAdjacentFoes'},
	healinglight: {heal: [1, 2], target: 'self'},
	dragondance: {boosts: {atk: 1, spe: 1}, target: 'self'},
	arcaneshield: {boosts: {def: 1, spd: 1}, target: 'self'},
	naturegrowth: {boosts: {spa: 1, spd: 1}, target: 'self'},
	shadowcloak: {boosts: {evasion: 1}, target: 'self'},
	undeadcurse: {volatileStatus: 'curse', target: 'normal'},
	astraltrance: {boosts: {spa: 2}, target: 'self'},
	holyward: {priority: 4, volatileStatus: 'protect', target: 'self'},
	naturesgrace: {onHit: "function (pokemon) { this.add('-cureteam', pokemon, '[from] move: Nature Grace'); for (const ally of pokemon.side.pokemon) { ally.cureStatus(); } }"},
	bloodpact: {boosts: {atk: 2, spa: 2, def: -1, spd: -1}, target: 'self'},
};

let code = fs.readFileSync('data/moves.ts', 'utf8');

for (const [key, props] of Object.entries(enrichments)) {
	const regex = new RegExp(`(\\t${key}: \\{[\\s\\S]*?\\n\\t\\},?)`, 'g');

	code = code.replace(regex, (match) => {
		let endStr = '\n\t},';
		if (!match.endsWith(endStr)) endStr = match.substring(match.length - 4);

		let innerCode = match.substring(0, match.length - endStr.length);

		let injected = '';
		for (const [propKey, propVal] of Object.entries(props)) {
			if (innerCode.includes(`\n\t\t${propKey}:`)) continue;

			if (typeof propVal === 'string') {
				if (propVal.startsWith('function')) {
					injected += `\n\t\t${propKey}: ${propVal},`;
				} else {
					injected += `\n\t\t${propKey}: "${propVal}",`;
				}
			} else if (typeof propVal === 'object') {
				injected += `\n\t\t${propKey}: ${JSON.stringify(propVal)},`;
			} else {
				injected += `\n\t\t${propKey}: ${propVal},`;
			}
		}

		if (props.target === 'self') {
			innerCode = innerCode.replace(/\n\t\ttarget:\s*"normal",?/g, '');
		}

		return innerCode + injected + endStr;
	});
}

fs.writeFileSync('data/moves.ts', code);
console.log("Moves logic injected successfully!");
