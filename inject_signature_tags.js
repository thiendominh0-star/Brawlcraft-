const fs = require('fs');

const movesDataRaw = fs.readFileSync('frontend_30_moves.json', 'utf8');
let movesData = JSON.parse(movesDataRaw);

// 30 Tướng ban đầu và Chiêu độc quyền tương ứng
const brawlerSignatures = {
	'shadowslash': 'shadowblade', // fallback
	'phantomambush': 'noxphantom',
	'shadowtangle': 'voidweaver',
	'manadetonation': 'arcanearchmage',
	'runicovercharge': 'runicgolem',
	'divinesmite': 'seraphknight',
	'aegisaura': 'oracleoflight',
	'soulharvest': 'lichking',
	'gravepulverize': 'bonecolossus',
	'dragonswrath': 'crimsonwyrm',
	'meteordive': 'astraldrake',
	'quagmirequake': 'gaiatitan',
	'sporecloud': 'florasylph',
	'vibroslash': 'cyberblade09',
	'orbitalcannon': 'aegisbastion',
	'meltdown': 'reactorcore',
	'plasmachain': 'voltstalker',
	'singularity': 'nebulaweaver',
	'supernovasmash': 'starfirecolossus',
	'zeropointstrike': 'glacierknight',
	'flashfreeze': 'cryomage',
	'hellfirerain': 'ignisdemon',
	'thermitepunch': 'vulcanbrute',
	'hurricanekick': 'galezephyr',
	'thunderstrikecloud': 'stormbringer',
	'venomousfang': 'toxicarachne',
	'acidicvomit': 'oozemutant',
	'zencounter': 'ironmonk',
	'flurrystrikes': 'swiftassassin',
	'mindshatter': 'miragefox',
	'dreameater': 'nightmarefiend'
};

// Cập nhật tag isSignature cho frontend data
movesData = movesData.map(m => {
	if (brawlerSignatures[m.id]) {
		return {
			...m,
			isSignature: true,
			signatureBrawler: brawlerSignatures[m.id]
		};
	} else {
		return {
			...m,
			isSignature: false,
			signatureBrawler: ''
		};
	}
});

fs.writeFileSync('frontend_30_moves.json', JSON.stringify(movesData, null, 2));
console.log('Update frontend_30_moves.json successfully.');

// Cập nhật tag cho backend moves.ts
let backendMoves = fs.readFileSync('data/moves.ts', 'utf8');

for (const [moveId, brawlerId] of Object.entries(brawlerSignatures)) {
	// Find the definition block for moveId
	const moveDefRegex = new RegExp(`\\t${moveId}: \\{[\\s\\S]*?\\t\\},`, 'g');

	backendMoves = backendMoves.replace(moveDefRegex, (match) => {
		// Insert tags before shortDesc
		if (!match.includes('isSignature: true')) {
			return match.replace(/\\t\\tshortDesc:/, `\\t\\tisSignature: true,\\n\\t\\tsignatureBrawler: '${brawlerId}',\\n\\t\\tshortDesc:`);
		}
		return match;
	});
}

// Bơm tag false cho Universal Moves
const universalMoves = ['strike', 'blast', 'guard', 'crimsonblade', 'holybash', 'dragonsweep', 'naturefang', 'undeadstrike', 'arcaneedge', 'voidcrush', 'ironfist', 'quickslash', 'savagebite', 'astralbeam', 'shadowburst', 'divinewrath', 'tidalwave', 'soulburn', 'dragonbreath', 'naturepulse', 'arcanestorm', 'holysmend', 'darkvoid', 'healinglight', 'dragondance', 'arcaneshield', 'naturegrowth', 'shadowcloak', 'undeadcurse', 'astraltrance', 'holyward', 'naturesgrace', 'bloodpact'];

for (const moveId of universalMoves) {
	const moveDefRegex = new RegExp(`\\t${moveId}: \\{[\\s\\S]*?\\t\\},`, 'g');
	backendMoves = backendMoves.replace(moveDefRegex, (match) => {
		if (!match.includes('isSignature:')) {
			return match.replace(/\\t\\tshortDesc:/, `\\t\\tisSignature: false,\\n\\t\\tshortDesc:`);
		}
		return match;
	});
}

fs.writeFileSync('data/moves.ts', backendMoves);
console.log('Update backend data/moves.ts successfully.');
