const fs = require('fs');

const brawlersPath = 'frontend_30_brawlers.json';
const movesPath = 'frontend_30_moves.json';
const rosterStorePath = 'pokemon-showdown-client/src/services/rosterStore.js';

let brawlers = JSON.parse(fs.readFileSync(brawlersPath, 'utf8'));
let moves = JSON.parse(fs.readFileSync(movesPath, 'utf8'));

// 1. Gán lại Kỹ Năng (Move)
for (let brawler of brawlers) {
	let validMoves = [];
	for (let move of moves) {
		// A. Nếu là Kỹ Năng Độc Quyền của người khác => Bỏ qua
		if (move.isSignature && move.signatureBrawler !== brawler.id) continue;

		// B. Liên kết Chiêu thức vào Pool nếu Đủ điều kiện: 
		// Điều kiện 1: Là tuyệt kỹ Universal (không phân hệ, hoặc hệ Martial chung)
		// Phân nhóm Universal: Ta ngầm quy ước chiêu không phải Signature mà hệ Basic như Martial The Strike, hoặc Guard.
		// Ở đây ta cứ ghép nếu move category Universal hoặc Move trùng hệ.

		let isUniversal = move.target === "self" && move.name === "Guard"; // ví dụ Guard
		if (!move.isSignature && move.desc === "Universal Move") isUniversal = true;

		let matchType = brawler.types.includes(move.type);

		if (isUniversal || matchType || (move.isSignature && move.signatureBrawler === brawler.id)) {
			// Push copy của move vào Array của char
			validMoves.push(JSON.parse(JSON.stringify(move)));
		}
	}

	brawler.moves = validMoves;
}

// 2. Cập nhật Lại JSON File Mẫu
fs.writeFileSync(brawlersPath, JSON.stringify(brawlers, null, 2));
console.log(`Đã nạp thành công Move Pool Cỡ Lớn cho ${brawlers.length} Brawlers vào File JSON.`);

// 3. Inject Vào RosterStore
let txt = fs.readFileSync(rosterStorePath, 'utf8');
const idxRosterStart = txt.indexOf('const DEFAULT_ROSTER = [');
const idxRosterEnd = txt.indexOf('\nconst DEFAULT_MOVES', idxRosterStart);
if (idxRosterStart !== -1 && idxRosterEnd !== -1) {
	txt = txt.slice(0, idxRosterStart) + 'const DEFAULT_ROSTER = ' + JSON.stringify(brawlers, null, 2) + '\n' + txt.slice(idxRosterEnd);
	fs.writeFileSync(rosterStorePath, txt);
	console.log('Đã Inject Căng Mảng Kỹ Năng vào Roster Store UI!');
}
