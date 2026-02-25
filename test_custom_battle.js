const Sim = require('./dist/sim');

const battle = new Sim.Battle({
	formatid: 'gen9theprototype',
});

battle.setPlayer('p1', {
	name: 'Player 1',
	team: [
		{species: 'shadowblade', moves: ['assassinate', 'poisondagger'], level: 100},
	],
});

battle.setPlayer('p2', {
	name: 'Player 2',
	team: [
		{species: 'arcanesniper', moves: ['arcaneshot', 'headshot'], level: 100},
	],
});

console.log("=== Battle Start ===");
try {
	// Pass team preview
	battle.makeChoices('team 1', 'team 1');
	// Execute turn 1
	battle.makeChoices('move 1', 'move 1');
} catch (e) {
	console.error("Choice error:", e.message);
}

console.log("=== Battle Log ===");
console.log(battle.log.join('\n'));

console.log("\n=== Final HP ===");
console.log("P1 (Shadow Blade): " + battle.p1.pokemon[0].hp + " / " + battle.p1.pokemon[0].maxhp);
console.log("P2 (Arcane Sniper): " + battle.p2.pokemon[0].hp + " / " + battle.p2.pokemon[0].maxhp);
