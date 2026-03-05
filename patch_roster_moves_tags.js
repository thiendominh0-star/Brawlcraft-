const fs = require('fs');

// Đọc ds move đã patch tag Signature
const movesJson = fs.readFileSync('frontend_30_moves.json', 'utf8');

const file = 'pokemon-showdown-client/src/services/rosterStore.js';
let txt = fs.readFileSync(file, 'utf8');

// Replace DEFAULT_MOVES array in rosterStore
// Tìm điểm đầu
const idxMovesStart = txt.indexOf('const DEFAULT_MOVES = [');
// Tìm điểm kết thúc của mảng (dòng export const AVAILABLE_TYPES)
const idxMovesEnd = txt.indexOf('\nexport const AVAILABLE_TYPES', idxMovesStart);

if (idxMovesStart !== -1 && idxMovesEnd !== -1) {
	txt = txt.slice(0, idxMovesStart) + 'const DEFAULT_MOVES = ' + movesJson + '\n' + txt.slice(idxMovesEnd);
}

fs.writeFileSync(file, txt);
console.log('Successfully injected Tagged Moves into rosterStore.js');
