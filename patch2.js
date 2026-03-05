const fs = require('fs');
const file = 'pokemon-showdown-client/src/services/rosterStore.js';
let txt = fs.readFileSync(file, 'utf8');

const newBrawlers = `\t{
\t\tid: 'crimsonassassin',
\t\tname: 'Crimson Assassin',
\t\ttypes: ['Shadow', 'Dragon'],
\t\tabilities: ['Swift Step'],
\t\timageUrl: '',
\t\tbaseStats: {hp: 310, atk: 140, def: 60, spa: 50, spd: 65, spe: 130},
\t\tmoves: [],
\t},
\t{
\t\tid: 'tidalshaman',
\t\tname: 'Tidal Shaman',
\t\ttypes: ['Nature', 'Arcane'],
\t\tabilities: ['Arcane Mastery'],
\t\timageUrl: '',
\t\tbaseStats: {hp: 380, atk: 60, def: 85, spa: 110, spd: 120, spe: 80},
\t\tmoves: [],
\t},
\t{
\t\tid: 'ironsentinel',
\t\tname: 'Iron Sentinel',
\t\ttypes: ['Holy'],
\t\tabilities: ['Thick Hide'],
\t\timageUrl: '',
\t\tbaseStats: {hp: 450, atk: 90, def: 150, spa: 60, spd: 110, spe: 40},
\t\tmoves: [],
\t},
\t{
\t\tid: 'voidwalker',
\t\tname: 'Void Walker',
\t\ttypes: ['Undead', 'Shadow'],
\t\tabilities: ['Berserker'],
\t\timageUrl: '',
\t\tbaseStats: {hp: 500, atk: 110, def: 90, spa: 100, spd: 90, spe: 50},
\t\tmoves: [],
\t},
\t{
\t\tid: 'astralweaver',
\t\tname: 'Astral Weaver',
\t\ttypes: ['Arcane'],
\t\tabilities: ['Arcane Mastery'],
\t\timageUrl: '',
\t\tbaseStats: {hp: 280, atk: 40, def: 70, spa: 150, spd: 85, spe: 115},
\t\tmoves: [],
\t},
\t{
\t\tid: 'stormdrake',
\t\tname: 'Storm Drake',
\t\ttypes: ['Dragon', 'Nature'],
\t\tabilities: ['Thick Hide'],
\t\timageUrl: '',
\t\tbaseStats: {hp: 350, atk: 125, def: 85, spa: 105, spd: 85, spe: 100},
\t\tmoves: [],
\t}`;

if (!txt.includes('crimsonassassin')) {
	txt = txt.replace(/\\t\\},\\r?\\n\\]/, '\\t},\\n' + newBrawlers + '\\n]');
	fs.writeFileSync(file, txt);
	console.log('Fixed Brawlers Array');
}
