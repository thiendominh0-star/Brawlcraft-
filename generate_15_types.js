const fs = require('fs');

const types = [
	'Shadow', 'Arcane', 'Holy', 'Undead', 'Dragon', 'Nature',
	'Mecha', 'Plasma', 'Cosmic', 'Frost', 'Inferno', 'Tempest',
	'Venom', 'Martial', 'Illusion'
];

/// "Khắc chế": x deals 2x to y (y takes 2x from x).
/// "Kỵ": x takes 2x from y.

const matchups = {
	Shadow: {Kỵ: ['Holy', 'Illusion']},
	Arcane: {Kỵ: ['Shadow', 'Mecha']},
	Holy: {Kỵ: ['Venom', 'Plasma']},
	Undead: {Kỵ: ['Holy', 'Inferno']},
	Dragon: {Kỵ: ['Frost', 'Cosmic']},
	Nature: {Kỵ: ['Inferno', 'Frost']},
	Mecha: {Kỵ: ['Tempest', 'Plasma']},
	Plasma: {Kỵ: ['Cosmic', 'Nature']},
	Cosmic: {Kỵ: ['Shadow', 'Arcane']},
	Frost: {Kỵ: ['Inferno', 'Mecha']},
	Inferno: {Kỵ: ['Tempest', 'Cosmic']},
	Tempest: {Kỵ: ['Nature', 'Dragon']},
	Venom: {Kỵ: ['Mecha', 'Undead']},
	Martial: {Kỵ: ['Arcane', 'Illusion']},
	Illusion: {Kỵ: ['Shadow', 'Mecha']}
};

let typechartRaw = `export const TypeChart: import('../sim/dex-data').TypeDataTable = {\n`;
for (const t of types) {
	let key = t.toLowerCase();
	typechartRaw += `\t${key}: {\n\t\tdamageTaken: {\n`;
	for (const defenseType of types) {
		// If 't' takes 2x from 'defenseType', then defenseType is in 't's Kỵ array
		if (matchups[t].Kỵ.includes(defenseType)) {
			typechartRaw += `\t\t\t${defenseType}: 1,\n`; // 1 is SE (Super Effective) in Showdown
		} else {
			typechartRaw += `\t\t\t${defenseType}: 0,\n`;
		}
	}
	typechartRaw += `\t\t},\n\t},\n`;
}
typechartRaw += `};\n`;

fs.writeFileSync('data/typechart.ts', typechartRaw);
console.log('Successfully generated typechart.ts with 15 Types!');
