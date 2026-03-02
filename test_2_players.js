const https = require('https');

const SERVER_URL = 'ws://localhost:8000/showdown/websocket';

async function verifyMultiplayer() {
	console.log('--- STARTING 2 PLAYERS MATCHMAKING VERIFICATION ---');
	const p1 = new WebSocket(SERVER_URL);
	const p2 = new WebSocket(SERVER_URL);

	let p1Matched = false;
	let p2Matched = false;

	const team = [
		'shadowblade||lifeorb|swiftstep|shadowslash,phantomstrike||||||100|',
		'arcanesniper||leftovers|arcanemastery|arcanebolt,magicsnipe||||||100|',
		'holyknight||choicescarf|thickhide|holysmite,sacredblade||||||100|',
		'undeadbrute||focussash|berserker|bonecrusher,deathgrip||||||100|',
		'dragonmage||lifeorb|arcanemastery|dragonpulse,wyrmfire||||||100|',
		'naturegolem||leftovers|thickhide|rockslam,gaiaburst||||||100|'
	];
	const botTeam = team.join(']');

	const handleMessages = (ws, playerNum, id) => {
		ws.addEventListener('open', () => {
			console.log(`[P${playerNum}] MỞ KẾT NỐI, GỬI USERNAME VÀ TÌM TRẬN...`);
			ws.send(`|/trn ${id},0`);
			ws.send(`|/utm ${botTeam}`);
			ws.send(`|/search gen9brawlcraftstandard`);
		});

		ws.addEventListener('message', (event) => {
			const raw = event.data.toString();
			console.log(`[P${playerNum}]`, raw);
			const lines = raw.split('\n');
			let roomId = 'lobby';

			for (const line of lines) {
				if (line.startsWith('>')) {
					roomId = line.slice(1).trim();
				}
				if (roomId.startsWith('battle-')) {
					if (playerNum === 1 && !p1Matched) {
						p1Matched = true;
						console.log(`\n✅ [P1] LANCELOT SAYS: SUCCESSFULLY ENTERED BATTLE ROOM: ${roomId}`);
					}
					if (playerNum === 2 && !p2Matched) {
						p2Matched = true;
						console.log(`✅ [P2] MERLIN SAYS: SUCCESSFULLY ENTERED BATTLE ROOM: ${roomId}\n`);
					}
				}
			}
		});
	};

	handleMessages(p1, 1, 'Lancelot Test');
	handleMessages(p2, 2, 'Merlin Test');

	// Wait timeout to close test
	setTimeout(() => {
		if (p1Matched && p2Matched) {
			console.log('🎉 VERIFICATION PASSED: BOTH PLAYERS FOUND THE MATCH AND RECEIVED BATTLE INSTANCE!');
		} else {
			console.log('❌ VERIFICATION FAILED: TIMEOUT WAITING FOR MATCH!');
		}
		p1.close();
		p2.close();
		process.exit(0);
	}, 4000);
}

verifyMultiplayer();
