function send(ws, msg) {
	ws.send(msg);
	console.log(`[SEND] ${msg}`);
}

async function run() {
	const ws1 = new WebSocket('ws://localhost:8000/showdown/websocket');
	const ws2 = new WebSocket('ws://localhost:8000/showdown/websocket');

	let roomId = null;

	const p1Name = 'Tester1' + Math.floor(Math.random() * 1000);
	const p2Name = 'Tester2' + Math.floor(Math.random() * 1000);

	ws1.onopen = () => {
		send(ws1, `|/trn ${p1Name},0`);
		// C-Tên-HP-ATK-DEF-SPA-SPD-SPE-Type
		// 80+80+80+80+80+100 = 500
		send(ws1, '|/utm C-Lucifer-80-80-80-80-80-100-Shadow|pikachu|||tackle,quickattack||||||100|]pikachu||||tackle||||||100|]pikachu||||tackle||||||100|]pikachu||||tackle||||||100|]pikachu||||tackle||||||100|]pikachu||||tackle||||||100|');
		send(ws1, '|/search gen9brawlcraftcustom');
	};

	ws2.onopen = () => {
		send(ws2, `|/trn ${p2Name},0`);
		send(ws2, '|/utm pikachu||||tackle||||||100|]pikachu||||tackle||||||100|]pikachu||||tackle||||||100|]pikachu||||tackle||||||100|]pikachu||||tackle||||||100|]pikachu||||tackle||||||100|');
		send(ws2, '|/search gen9brawlcraftcustom');
	};

	ws1.onmessage = (ev) => {
		const d = ev.data.toString();
		if (d.includes('|init|battle')) {
			const roomLine = d.split('\n').find(l => l.startsWith('>battle-'));
			if (roomLine) {
				roomId = roomLine.substring(1).trim();
				console.log(`BATTLE STARTED! Room: ${roomId}`);
				// P1 gửi lệnh log ra battle state
			}
		}

		if (d.includes(`|poke|p1|Custom Brawler`) || d.includes('|poke|p1|Lucifer')) {
			console.log("==> SPOTTED CUSTOM BRAWLER IN BATTLE: " + d);
		}

		if (d.includes('BATTLE STARTED!')) {
			setTimeout(() => {process.exit(0);}, 500);
		}
	};

	ws2.onmessage = (ev) => {
		const d = ev.data.toString();
		if (d.includes('|popup|Your team was rejected')) {
			console.error('WS2 TEAM REJECTED:', d);
			process.exit(1);
		}
		if (d.includes('|popup|You are limited')) {
			console.error('WS2 REJECTED:', d);
			process.exit(1);
		}
	};

	// Giữ process sống 15 giây
	setTimeout(() => {console.log("Timeout 15s reached"); process.exit(0);}, 15000);
}

run();
