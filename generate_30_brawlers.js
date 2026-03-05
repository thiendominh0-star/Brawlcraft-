const fs = require('fs');

const brawlers = [
	// Shadow
	{name: 'Nox Phantom', types: ['Shadow', 'Illusion'], baseStats: {hp: 250, atk: 110, def: 50, spa: 50, spd: 50, spe: 120}},
	{name: 'Void Weaver', types: ['Shadow', 'Cosmic'], baseStats: {hp: 400, atk: 50, def: 80, spa: 90, spd: 110, spe: 60}},
	// Arcane
	{name: 'Arcane Archmage', types: ['Arcane'], baseStats: {hp: 220, atk: 40, def: 50, spa: 120, spd: 90, spe: 110}},
	{name: 'Runic Golem', types: ['Arcane', 'Mecha'], baseStats: {hp: 350, atk: 70, def: 120, spa: 60, spd: 110, spe: 50}},
	// Holy
	{name: 'Seraph Knight', types: ['Holy', 'Martial'], baseStats: {hp: 300, atk: 100, def: 100, spa: 60, spd: 80, spe: 90}},
	{name: 'Oracle of Light', types: ['Holy'], baseStats: {hp: 380, atk: 40, def: 70, spa: 90, spd: 110, spe: 85}},
	// Undead
	{name: 'Lich King', types: ['Undead', 'Frost'], baseStats: {hp: 280, atk: 60, def: 75, spa: 115, spd: 120, spe: 80}},
	{name: 'Bone Colossus', types: ['Undead', 'Nature'], baseStats: {hp: 450, atk: 110, def: 110, spa: 50, spd: 60, spe: 40}},
	// Dragon
	{name: 'Crimson Wyrm', types: ['Dragon', 'Inferno'], baseStats: {hp: 320, atk: 125, def: 90, spa: 70, spd: 80, spe: 95}},
	{name: 'Astral Drake', types: ['Dragon', 'Cosmic'], baseStats: {hp: 310, atk: 80, def: 80, spa: 130, spd: 90, spe: 105}},
	// Nature
	{name: 'Gaia Titan', types: ['Nature', 'Martial'], baseStats: {hp: 420, atk: 115, def: 115, spa: 60, spd: 80, spe: 55}},
	{name: 'Flora Sylph', types: ['Nature', 'Illusion'], baseStats: {hp: 260, atk: 60, def: 70, spa: 100, spd: 110, spe: 115}},
	// Mecha
	{name: 'Cyberblade 09', types: ['Mecha', 'Shadow'], baseStats: {hp: 270, atk: 115, def: 80, spa: 50, spd: 70, spe: 120}},
	{name: 'Aegis Bastion', types: ['Mecha', 'Plasma'], baseStats: {hp: 350, atk: 70, def: 130, spa: 100, spd: 90, spe: 40}},
	// Plasma
	{name: 'Reactor Core', types: ['Plasma'], baseStats: {hp: 320, atk: 95, def: 95, spa: 95, spd: 95, spe: 95}},
	{name: 'Volt Stalker', types: ['Plasma', 'Tempest'], baseStats: {hp: 240, atk: 100, def: 60, spa: 90, spd: 65, spe: 130}},
	// Cosmic
	{name: 'Nebula Weaver', types: ['Cosmic', 'Arcane'], baseStats: {hp: 300, atk: 50, def: 80, spa: 125, spd: 110, spe: 95}},
	{name: 'Starfire Colossus', types: ['Cosmic', 'Inferno'], baseStats: {hp: 400, atk: 120, def: 90, spa: 70, spd: 80, spe: 70}},
	// Frost
	{name: 'Glacier Knight', types: ['Frost', 'Martial'], baseStats: {hp: 350, atk: 115, def: 115, spa: 50, spd: 80, spe: 65}},
	{name: 'Cryo Mage', types: ['Frost', 'Illusion'], baseStats: {hp: 280, atk: 50, def: 70, spa: 110, spd: 90, spe: 110}},
	// Inferno
	{name: 'Ignis Demon', types: ['Inferno', 'Undead'], baseStats: {hp: 260, atk: 80, def: 60, spa: 115, spd: 80, spe: 105}},
	{name: 'Vulcan Brute', types: ['Inferno', 'Mecha'], baseStats: {hp: 380, atk: 120, def: 110, spa: 60, spd: 75, spe: 60}},
	// Tempest
	{name: 'Gale Zephyr', types: ['Tempest'], baseStats: {hp: 240, atk: 90, def: 60, spa: 90, spd: 70, spe: 140}},
	{name: 'Storm Bringer', types: ['Tempest', 'Cosmic'], baseStats: {hp: 330, atk: 70, def: 85, spa: 110, spd: 85, spe: 100}},
	// Venom
	{name: 'Toxic Arachne', types: ['Venom', 'Illusion'], baseStats: {hp: 270, atk: 90, def: 70, spa: 80, spd: 110, spe: 115}},
	{name: 'Ooze Mutant', types: ['Venom', 'Nature'], baseStats: {hp: 390, atk: 80, def: 120, spa: 85, spd: 60, spe: 45}},
	// Martial
	{name: 'Iron Monk', types: ['Martial', 'Holy'], baseStats: {hp: 360, atk: 120, def: 110, spa: 50, spd: 90, spe: 40}},
	{name: 'Swift Assassin', types: ['Martial', 'Tempest'], baseStats: {hp: 250, atk: 120, def: 60, spa: 50, spd: 60, spe: 115}},
	// Illusion
	{name: 'Mirage Fox', types: ['Illusion', 'Arcane'], baseStats: {hp: 250, atk: 60, def: 60, spa: 115, spd: 80, spe: 115}},
	{name: 'Nightmare Fiend', types: ['Illusion', 'Shadow'], baseStats: {hp: 290, atk: 110, def: 70, spa: 110, spd: 70, spe: 90}},
];

let charsRaw = `export const Characters: import('../sim/dex-species').CharacterDataTable = {\n`;

for (let b of brawlers) {
	let id = b.name.toLowerCase().replace(/[^a-z0-9]/g, '');
	charsRaw += `\t${id}: {\n`;
	charsRaw += `\t\tnum: ${Math.floor(Math.random() * 1000) + 1000},\n`;
	charsRaw += `\t\tname: "${b.name}",\n`;
	charsRaw += `\t\ttypes: ${JSON.stringify(b.types)},\n`;
	charsRaw += `\t\tbaseStats: ${JSON.stringify(b.baseStats)},\n`;
	charsRaw += `\t\tabilities: {0: "No Ability"},\n`;
	charsRaw += `\t\tweightkg: 50,\n`;
	charsRaw += `\t},\n`;
}
charsRaw += `};\n`;

fs.writeFileSync('data/characters.ts', charsRaw);
console.log('Successfully written data/characters.ts');

const frontendData = brawlers.map(b => ({
	id: b.name.toLowerCase().replace(/[^a-z0-9]/g, ''),
	name: b.name,
	types: b.types,
	abilities: ['No Ability'],
	imageUrl: '',
	baseStats: b.baseStats,
	moves: []
}));

fs.writeFileSync('frontend_30_brawlers.json', JSON.stringify(frontendData, null, 2));
console.log('Successfully written frontend_30_brawlers.json');
