const http = require('http');

const sampleData = {
	roster: [
		{
			id: "testchar",
			name: "Test Character",
			types: ["Shadow", "Fire"],
			baseStats: {hp: 300, atk: 120, def: 100, spa: 50, spd: 80, spe: 110},
			moves: [
				{
					name: "Shadow Slash",
					type: "Shadow",
					category: "Physical",
					power: 90,
					accuracy: 100,
					pp: 15,
					effect: "High crit ratio"
				}
			]
		}
	]
};

const req = http.request(
	'http://localhost:8001/sync',
	{
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		}
	},
	(res) => {
		let raw = '';
		res.on('data', c => raw += c);
		res.on('end', () => {
			console.log('Response:', raw);
		});
	}
);

req.on('error', console.error);
req.write(JSON.stringify(sampleData));
req.end();
