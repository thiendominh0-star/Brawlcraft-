import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as child_process from 'child_process';
import { Utils } from '../../lib';

const DATA_DIR = path.join(__dirname, '../../../data');

export const PluginServer = http.createServer((req, res) => {
	// CORS headers
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

	if (req.method === 'OPTIONS') {
		res.writeHead(204);
		res.end();
		return;
	}

	if (req.method === 'POST' && req.url === '/sync') {
		let body = '';
		req.on('data', chunk => {
			body += chunk.toString();
		});
		req.on('end', () => {
			try {
				if (!body) throw new Error("Empty body");
				const roster = JSON.parse(body);
				writeCharactersFile(roster);
				writeMovesFile(roster);

				// 1. Build lại Typescript sang JS
				child_process.execSync('node build', { cwd: path.join(__dirname, '../../../') });

				// 2. Clear cache Node.js để nạp bản mới
				Utils.clearRequireCache({ exclude: ['/lib/process-manager'] });

				// 3. Hotpatch Engine (giống lệnh /hotpatch formats)
				global.Dex = require('../../sim/dex').Dex;
				Rooms.global.formatList = '';
				if (global.TeamValidatorAsync) void TeamValidatorAsync.PM.respawn();
				if (global.Rooms && Rooms.PM) void Rooms.PM.respawn();
				if (global.Teams) global.Teams = require('../../sim/teams').Teams;
				if (global.Rooms) Rooms.global.sendAll(Rooms.global.formatListText);

				console.log('[AdminSync Plugin] Đồng bộ và Hotpatch thành công!');

				res.writeHead(200, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ success: true }));
			} catch (err: any) {
				console.error('[AdminSync Plugin Error]', err);
				res.writeHead(500, { 'Content-Type': 'application/json' });
				res.end(JSON.stringify({ success: false, error: err.message }));
			}
		});
	} else {
		res.writeHead(404);
		res.end();
	}
});

// Khởi chạy server ở port 8001
PluginServer.listen(8001, () => {
	console.log('[AdminSync Plugin] Đang lắng nghe luồng đồng bộ tại http://localhost:8001');
});

// Hàm ghi file Characters
function writeCharactersFile(roster: any[]) {
	let content = `export const Characters: import('../sim/dex-species').SpeciesDataTable = {\n`;

	roster.forEach((char, index) => {
		const id = char.id || `char${index}`;
		const name = char.name || 'Unknown';
		const types = JSON.stringify(char.types || ['Normal']);
		const bs = char.baseStats || { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 };
		const abilitiesArr = (char.abilities && char.abilities.length > 0) ? char.abilities : ['No Ability'];
		let abilitiesStr = '{';
		abilitiesArr.forEach((ab: string, idx: number) => {
			const key = idx === 0 ? '0' : idx === 1 ? '1' : idx === 2 ? 'H' : 'S';
			abilitiesStr += `${key}: ${JSON.stringify(ab)}`;
			if (idx < abilitiesArr.length - 1) abilitiesStr += ', ';
		});
		abilitiesStr += '}';

		content += `\t${id}: {\n`;
		content += `\t\tnum: ${index + 1},\n`;
		content += `\t\tname: ${JSON.stringify(name)},\n`;
		content += `\t\ttypes: ${types},\n`;
		content += `\t\tbaseStats: { hp: ${bs.hp}, atk: ${bs.atk}, def: ${bs.def}, spa: ${bs.spa}, spd: ${bs.spd}, spe: ${bs.spe} },\n`;
		content += `\t\tabilities: ${abilitiesStr},\n`;
		content += `\t\tweightkg: 100,\n`;
		content += `\t},\n`;
	});

	content += `};\n`;
	fs.writeFileSync(path.join(DATA_DIR, 'characters.ts'), content, 'utf-8');
}

// Hàm ghi file Moves
function writeMovesFile(roster: any[]) {
	let content = `export const Moves: import('../sim/dex-moves').MoveDataTable = {\n`;
	let moveIndex = 1;

	roster.forEach(char => {
		if (!char.moves || !Array.isArray(char.moves)) return;

		content += `\t// --- Moves của ${char.name} ---\n`;
		char.moves.forEach((move: any) => {
			if (!move.name) return;
			const moveId = move.name.toLowerCase().replace(/[^a-z0-9]/g, '');

			content += `\t${moveId}: {\n`;
			content += `\t\tnum: ${moveIndex++},\n`;
			content += `\t\taccuracy: ${move.accuracy || 100},\n`;
			content += `\t\tbasePower: ${move.power || 0},\n`;
			content += `\t\tcategory: ${JSON.stringify(move.category || 'Physical')},\n`;
			content += `\t\tname: ${JSON.stringify(move.name)},\n`;
			content += `\t\tpp: ${move.pp || 10},\n`;
			content += `\t\tpriority: ${move.priority || 0},\n`;
			content += `\t\tflags: { protect: 1, mirror: 1 ${move.category === 'Physical' ? ', contact: 1' : ''} },\n`;

			// Custom Data của BRAWLCRAFT
			if (move.cost && move.cost.type !== 'none') {
				content += `\t\tcost: ${JSON.stringify(move.cost)},\n`;
			}
			if (move.drawback && move.drawback.type !== 'none') {
				content += `\t\tdrawback: ${JSON.stringify(move.drawback)},\n`;
			}
			if (move.secondary && move.secondary.type !== 'none') {
				content += `\t\tsecondary: ${JSON.stringify(move.secondary)},\n`;
			}

			content += `\t\tshortDesc: ${JSON.stringify(move.effect || '')},\n`;
			content += `\t\ttarget: "normal",\n`;
			content += `\t\ttype: ${JSON.stringify(move.type || 'Normal')},\n`;
			content += `\t},\n\n`;
		});
	});

	content += `};\n`;
	fs.writeFileSync(path.join(DATA_DIR, 'moves.ts'), content, 'utf-8');
}
