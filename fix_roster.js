const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'pokemon-showdown-client/src/services/rosterStore.js');

let txt = fs.readFileSync(file, 'utf8');

// Vá lỗi các ký tự \n và \t bị dính dưới dạng chuỗi thô
txt = txt.replace(/\\n/g, '\n').replace(/\\t/g, '\t');

// Sửa hàm loadMoves bị lọt mất ở Script trước
txt = txt.replace(/return \[\]\r?\n\}/, 'return DEFAULT_MOVES.map(m => ({...m}))\n}');

fs.writeFileSync(file, txt);
console.log('Fixed syntax and restored proper Move mapping');
