const fs = require('fs');
const file = 'pokemon-showdown-client/src/services/rosterStore.js';
let txt = fs.readFileSync(file, 'utf8');

const newBrawlers = `,
	{
		id: 'crimsonassassin',
		name: 'Crimson Assassin',
		types: ['Shadow', 'Dragon'],
		abilities: ['Swift Step'],
		imageUrl: '',
		baseStats: {hp: 310, atk: 140, def: 60, spa: 50, spd: 65, spe: 130},
		moves: [],
	},
	{
		id: 'tidalshaman',
		name: 'Tidal Shaman',
		types: ['Nature', 'Arcane'],
		abilities: ['Arcane Mastery'],
		imageUrl: '',
		baseStats: {hp: 380, atk: 60, def: 85, spa: 110, spd: 120, spe: 80},
		moves: [],
	},
	{
		id: 'ironsentinel',
		name: 'Iron Sentinel',
		types: ['Holy'],
		abilities: ['Thick Hide'],
		imageUrl: '',
		baseStats: {hp: 450, atk: 90, def: 150, spa: 60, spd: 110, spe: 40},
		moves: [],
	},
	{
		id: 'voidwalker',
		name: 'Void Walker',
		types: ['Undead', 'Shadow'],
		abilities: ['Berserker'],
		imageUrl: '',
		baseStats: {hp: 500, atk: 110, def: 90, spa: 100, spd: 90, spe: 50},
		moves: [],
	},
	{
		id: 'astralweaver',
		name: 'Astral Weaver',
		types: ['Arcane'],
		abilities: ['Arcane Mastery'],
		imageUrl: '',
		baseStats: {hp: 280, atk: 40, def: 70, spa: 150, spd: 85, spe: 115},
		moves: [],
	},
	{
		id: 'stormdrake',
		name: 'Storm Drake',
		types: ['Dragon', 'Nature'],
		abilities: ['Thick Hide'],
		imageUrl: '',
		baseStats: {hp: 350, atk: 125, def: 85, spa: 105, spd: 85, spe: 100},
		moves: [],
	}`;

if (!txt.includes('crimsonassassin')) {
	const idxMoves = txt.indexOf('const DEFAULT_MOVES = [');
	if (idxMoves !== -1) {
		const lastBracketIdx = txt.lastIndexOf(']', idxMoves);
		if (lastBracketIdx !== -1) {
			txt = txt.slice(0, lastBracketIdx) + newBrawlers + '\n' + txt.slice(lastBracketIdx);
			fs.writeFileSync(file, txt);
			console.log('Successfully injected Brawlers via slicing');
		} else {
			console.error('Không tìm thấy ngoặc ]');
		}
	} else {
		console.error('Không tìm thấy DEFAULT_MOVES');
	}
} else {
	console.log('Already injected');
}
