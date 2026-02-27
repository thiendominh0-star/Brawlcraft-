// Không cần require('ws') vì Node 24 đã hỗ trợ Native WebSocket toàn cầu

function send(ws, msg) {
	ws.send(msg);
	console.log(`[SEND] ${msg}`);
}

async function run() {
	const ws1 = new WebSocket('ws://localhost:8000/showdown/websocket');
	const ws2 = new WebSocket('ws://localhost:8000/showdown/websocket');

	let roomId = null;

	const p1Name = 'PlayerA' + Math.floor(Math.random() * 1000);
	const p2Name = 'PlayerB' + Math.floor(Math.random() * 1000);

	ws1.addEventListener('open', () => {
		send(ws1, `|/trn ${p1Name},0`);
		send(ws1, '|/utm pikachu|||static|tackle,quickattack||||||100|');
		send(ws1, '|/search gen9theprototype');
	});

	ws2.addEventListener('open', () => {
		send(ws2, `|/trn ${p2Name},0`);
		send(ws2, '|/utm pikachu|||static|tackle,quickattack||||||100|');
		send(ws2, '|/search gen9theprototype');
	});

	ws1.addEventListener('message', (ev) => {
		console.log(`[WS1] ${ev.data}`);
		const d = ev.data.toString();
		if (d.includes('|init|battle')) {
			const roomLine = d.split('\n').find(l => l.startsWith('>battle-'));
			if (roomLine) {
				roomId = roomLine.substring(1).trim();
				console.log(`BATTLE STARTED! Room: ${roomId}`);
				// P1 forfeits directly!
				setTimeout(() => {
					send(ws1, `${roomId}|/forfeit`);
				}, 1000);
			}
		}

		if (d.includes(`|win|${p2Name}`)) {
			console.log(`PLAYER 2 (${p2Name}) WON! Checking ELO via ladder cmd...`);
			setTimeout(() => {
				send(ws1, '|/cmd laddertop gen9theprototype');
			}, 1000);
		}

		if (d.includes('|queryresponse|laddertop')) {
			console.log('LEADERBOARD UPDATE RECEIVED:');
			console.log(d);
			// Process complete
			process.exit(0);
		}
	});
}

run();
