function send(ws, msg) {
	ws.send(msg);
	console.log(`[SEND] ${msg}`);
}

const ws = new WebSocket('ws://localhost:8000/showdown/websocket');
const name = 'Bot' + Math.floor(Math.random() * 10000);
let roomId = '';

ws.onopen = () => {
	send(ws, `|/trn ${name},0`);

	// Create a valid team of 6 different characters to pass Species Clause
	const team = [
		'shadowblade||lifeorb|swiftstep|shadowslash,phantomstrike||||||100|',
		'arcanesniper||leftovers|arcanemastery|arcanebolt,magicsnipe||||||100|',
		'holyknight||choicescarf|thickhide|holysmite,sacredblade||||||100|',
		'undeadbrute||focussash|berserker|bonecrusher,deathgrip||||||100|',
		'dragonmage||lifeorb|arcanemastery|dragonpulse,wyrmfire||||||100|',
		'naturegolem||leftovers|thickhide|rockslam,gaiaburst||||||100|'
	].join(']');

	send(ws, `|/utm ${team}`);
	send(ws, '|/search gen9brawlcraftstandard');
};

ws.onmessage = (ev) => {
	const d = ev.data.toString();
	console.log("[RECV_RAW]", d.substring(0, 500));
	if (d.includes('>battle-')) {
		const match = d.match(/>(battle[^\n]+)/);
		if (match) roomId = match[1];
	}

	if (d.includes('|request|') && roomId) {
		setTimeout(() => {
			send(ws, `${roomId}|/choose move 1`);
		}, 3000);
	}
};

setTimeout(() => {console.log("Timeout 300s reached"); process.exit(0);}, 300000);
