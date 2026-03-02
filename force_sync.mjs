import http from 'http';
import fs from 'fs';
import path from 'path';

const file = fs.readFileSync(path.join(process.cwd(), 'pokemon-showdown-client', 'src', 'services', 'rosterStore.js'), 'utf-8');
const match = file.match(/const DEFAULT_ROSTER = (\[[\s\S]*?\])\s*export const/);

if (!match) {
	console.log('Không lấy được DEFAULT_ROSTER');
	process.exit(1);
}

// eval để parse chuỗi JS thành Object
const roster = eval(match[1]);

const req = http.request('http://localhost:8001/sync', {
	method: 'POST',
	headers: {'Content-Type': 'application/json'}
}, (res) => {
	let data = '';
	res.on('data', chunk => data += chunk);
	res.on('end', () => console.log('SYNC RESULT:', data));
});

req.on('error', console.error);
req.write(JSON.stringify(roster));
req.end();
