const fs = require('fs');

const brawlersJson = fs.readFileSync('frontend_30_brawlers.json', 'utf8');
const movesJson = fs.readFileSync('frontend_30_moves.json', 'utf8');

const file = 'pokemon-showdown-client/src/services/rosterStore.js';
let txt = fs.readFileSync(file, 'utf8');

// Replace DEFAULT_ROSTER array
const idxRosterStart = txt.indexOf('const DEFAULT_ROSTER = [');
const idxRosterEnd = txt.indexOf('\nconst DEFAULT_MOVES', idxRosterStart);
if (idxRosterStart !== -1 && idxRosterEnd !== -1) {
	txt = txt.slice(0, idxRosterStart) + 'const DEFAULT_ROSTER = ' + brawlersJson + '\n' + txt.slice(idxRosterEnd);
}

// Replace DEFAULT_MOVES array
const idxMovesStart = txt.indexOf('const DEFAULT_MOVES = [');
const idxMovesEnd = txt.indexOf('\nexport const AVAILABLE_TYPES', idxMovesStart);
if (idxMovesStart !== -1 && idxMovesEnd !== -1) {
	txt = txt.slice(0, idxMovesStart) + 'const DEFAULT_MOVES = ' + movesJson + '\n' + txt.slice(idxMovesEnd);
}

// Replace AVAILABLE_TYPES
txt = txt.replace(/export const AVAILABLE_TYPES = \[.*?\]/, `export const AVAILABLE_TYPES = ['Shadow', 'Arcane', 'Holy', 'Undead', 'Dragon', 'Nature', 'Mecha', 'Plasma', 'Cosmic', 'Frost', 'Inferno', 'Tempest', 'Venom', 'Martial', 'Illusion']`);

fs.writeFileSync(file, txt);
console.log('Successfully injected Frontend data into rosterStore.js');
