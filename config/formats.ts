export const Formats: import('../sim/dex-formats').FormatList = [
	{
		section: "Custom Project",
	},
	{
		name: "[Gen 9] Brawlcraft Standard",
		desc: "Chế độ sử dụng Brawler mặc định. Không dùng Brawler tự chế.",
		mod: 'gen9',
		rated: true,
		ruleset: [
			'Cancel Mod',
			'Max Team Size = 6',
			'Picked Team Size = 6',
			'Default Level = 100',
		],
	},
	{
		name: "[Gen 9] Brawlcraft Custom",
		desc: "Chế độ cho phép mang 1 Brawler Tự chế vào team.",
		mod: 'gen9',
		rated: true,
		ruleset: [
			'Cancel Mod',
			'Max Team Size = 6',
			'Picked Team Size = 6',
			'Default Level = 100',
		],
		onValidateSet(set) {
			if (set.name.startsWith('C-')) {
				const parts = set.name.split('-');
				if (parts.length >= 9) {
					const stats = parts.slice(2, 8).map(Number);
					const sum = stats.reduce((a, b) => a + b, 0);
					if (sum !== 500) return [`${parts[1]} có tổng BST là ${sum} (Yêu cầu đúng 500!).`];
					for (const stat of stats) {
						if (stat < 50 || stat > 120) return [`${parts[1]} có chỉ số ${stat} sai quy định (50-120).`];
					}
					// Cũng kiểm duyệt hệ Moves
				}
			}
		},
		onBegin() {
			for (const pokemon of this.getAllPokemon()) {
				if (pokemon.name.startsWith('C-')) {
					const parts = pokemon.name.split('-');
					if (parts.length >= 9) {
						const hp = parseInt(parts[2]), atk = parseInt(parts[3]), def = parseInt(parts[4]);
						const spa = parseInt(parts[5]), spd = parseInt(parts[6]), spe = parseInt(parts[7]);
						const type = parts[8];

						// Tạo 1 shallow copy của species để tránh stack overflow
						const newSpecies: any = Object.assign({}, pokemon.species);
						newSpecies.baseStats = { hp, atk, def, spa, spd, spe };
						newSpecies.types = [type];
						newSpecies.name = parts[1];
						pokemon.species = newSpecies;

						const oldMaxHP = pokemon.maxhp;
						const ivHP = pokemon.set.ivs?.hp ?? 31;
						const evHP = pokemon.set.evs?.hp ?? 0;
						pokemon.baseMaxhp = Math.floor(Math.floor(2 * hp + ivHP + Math.floor(evHP / 4) + 100) * pokemon.level / 100 + 10);
						pokemon.maxhp = pokemon.baseMaxhp;
						pokemon.hp = pokemon.maxhp; // Start at full HP

						(pokemon as any).name = parts[1];
					}
				}
			}
		}
	},
];
