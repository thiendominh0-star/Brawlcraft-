/**
 * showdownClient.js
 * WebSocket client cho Showdown Protocol Server
 * Giao tiếp với backend PS tại ws://localhost:8000
 */

const SERVER_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/showdown/websocket';

class ShowdownClient {
	constructor() {
		this.ws = null;
		this.listeners = {};
		this.connected = false;
		this.guestName = null;
		this.challstr = null;    // chuỗi challenge từ server
		this.currentBattle = null;
	}

	/** Kết nối tới server */
	connect() {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

		this.ws = new WebSocket(SERVER_URL);

		this.ws.onopen = () => {
			this.connected = true;
			console.log('[ShowdownClient] Connected to server');
			this._emit('connected');
		};

		this.ws.onmessage = (ev) => {
			this._parseMessage(ev.data);
		};

		this.ws.onclose = () => {
			this.connected = false;
			console.log('[ShowdownClient] Disconnected');
			this._emit('disconnected');
		};

		this.ws.onerror = (err) => {
			console.error('[ShowdownClient] Error:', err);
			this._emit('error', err);
		};
	}

	/** Đăng nhập khách */
	loginAsGuest(name) {
		const guestName = name || `Guest${Math.floor(Math.random() * 9000 + 1000)}`;
		this.guestName = guestName;
		// Giao thức PS: |/trn <username>,0,<challstr-response>
		this.send(`|/trn ${guestName},0`);
		this._emit('login', {name: guestName});
	}

	/** Cập nhật đội hình (utm = Use Team) */
	setTeam(teamFormat) {
		if (teamFormat) {
			this.send(`|/utm ${teamFormat}`);
		} else {
			this.send(`|/utm null`);
		}
	}

	/** Tìm trận */
	findBattle(formatId = 'gen9brawlcraftstandard', teamFormat = null) {
		if (teamFormat) this.setTeam(teamFormat);
		this.send(`|/search ${formatId}`);
	}

	/** Yêu cầu lấy Bảng xếp hạng Top 100 */
	fetchLeaderboard(formatId = 'gen9brawlcraftstandard') {
		this.send(`|/cmd laddertop ${formatId}`);
	}

	/** Hủy tìm trận */
	cancelSearch() {
		this.send(`|/cancelsearch`);
	}

	/** Gửi chiêu thức trong trận */
	makeMove(roomId, moveIndex) {
		this.send(`${roomId}|/choose move ${moveIndex}`);
	}

	/** Chọn nhân vật thay thế */
	makeSwitch(roomId, slotIndex) {
		this.send(`${roomId}|/choose switch ${slotIndex}`);
	}

	/** Gửi raw message */
	send(msg) {
		if (this.ws && this.ws.readyState === WebSocket.OPEN) {
			this.ws.send(msg);
		} else {
			console.warn('[ShowdownClient] Cannot send, not connected:', msg);
		}
	}

	/** Subscribe một event */
	on(event, callback) {
		if (!this.listeners[event]) this.listeners[event] = [];
		this.listeners[event].push(callback);
		// Return hàm unsubscribe
		return () => {
			this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
		};
	}

	/** Emit event nội bộ */
	_emit(event, data) {
		(this.listeners[event] || []).forEach(cb => cb(data));
	}

	/**
	 * Parse messages theo giao thức PS
	 * Messages có dạng:
	 *   >roomname\n|type|data...
	 * Hoặc global messages:
	 *   |type|data...
	 */
	_parseMessage(raw) {
		const lines = raw.split('\n');
		let roomId = '';

		for (const line of lines) {
			if (line.startsWith('>')) {
				roomId = line.slice(1).trim();
				continue;
			}

			if (!line.startsWith('|')) continue;

			const parts = line.slice(1).split('|');
			const type = parts[0];
			const args = parts.slice(1);

			switch (type) {
				case 'challstr':
					this.challstr = args.join('|');
					this._emit('challstr', this.challstr);
					break;

				case 'popup':
					window.alert(args.join('|').replace(/\|/g, '\n'));
					break;

				case 'updateuser':
					this._emit('updateuser', {
						name: args[0],
						named: args[1] === '1',
						avatar: args[2],
					});
					break;

				case 'init':
					if (args[0] === 'battle') {
						this.currentBattle = roomId;
						this._emit('battle:init', {roomId});
					}
					break;

				case 'request':
					try {
						const request = JSON.parse(args[0]);
						this._emit('battle:request', {roomId, request});
					} catch (e) { /* ignore */}
					break;

				case 'turn':
					this._emit('battle:turn', {roomId, turn: parseInt(args[0])});
					break;

				case 'queryresponse':
					// args[0] là queryType (vd 'laddertop'), args[1] là JSON payload
					if (args[0] === 'laddertop') {
						try {
							const payload = JSON.parse(args[1]);
							// payload là mảng: [formatId, htmlString]
							this._emit('laddertop', {formatId: payload[0], html: payload[1]});
						} catch (e) { /* ignore */}
					}
					break;

				case 'poke':
					this._emit('battle:poke', {roomId, player: args[0], details: args[1], item: args[2]});
					break;

				case 'switch':
				case 'drag':
				case 'replace':
					this._emit('battle:switch', {roomId, pokemon: args[0], details: args[1], hpText: args[2]});
					break;

				case '-damage':
					this._emit('battle:damage', {roomId, pokemon: args[0], hpText: args[1], condition: args[2]});
					break;

				case '-heal':
					this._emit('battle:heal', {roomId, pokemon: args[0], hpText: args[1]});
					break;

				case 'move':
					this._emit('battle:move', {roomId, pokemon: args[0], move: args[1], target: args[2]});
					break;

				case '-supereffective':
					this._emit('battle:supereffective', {roomId, target: args[0]});
					break;

				case '-resisted':
					this._emit('battle:resisted', {roomId, target: args[0]});
					break;

				case '-crit':
					this._emit('battle:crit', {roomId});
					break;

				case 'faint':
					this._emit('battle:faint', {roomId, pokemon: args[0]});
					break;

				case 'win':
					this._emit('battle:win', {roomId, winner: args[0]});
					break;

				case 'tie':
					this._emit('battle:tie', {roomId});
					break;

				case 'error':
					this._emit('server:error', args.join('|'));
					break;

				default:
					// Không handle thì bỏ qua
					break;
			}
		}
	}

	disconnect() {
		if (this.ws) {
			this.ws.close();
			this.ws = null;
		}
	}
}

// Singleton instance
const client = new ShowdownClient();
export default client;
