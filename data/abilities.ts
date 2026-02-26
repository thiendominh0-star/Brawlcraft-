export const Abilities: import('../sim/dex-abilities').AbilityDataTable = {
	noability: {
		isNonstandard: "Past",
		flags: {},
		name: "No Ability",
		rating: 0.1,
		num: 0,
	},
	// 1. Berserker (Cuồng Nộ): Tăng 50% sát thương Vật lý khi lượng HP dưới 50%
	berserker: {
		onModifyAtkPriority: 5,
		onModifyAtk(atk, attacker, defender, move) {
			if (attacker.hp <= attacker.maxhp / 2) {
				this.debug('Berserker boost');
				return this.chainModify(1.5);
			}
		},
		flags: {},
		name: "Berserker",
		rating: 3,
		num: 1,
	},
	// 2. Arcane Mastery (Làm Chủ Ma Pháp): Đòn đánh phép thuật có 30% tỷ lệ gây Bỏng (brn)
	arcanemastery: {
		onModifyMove(move, attacker, defender) {
			if (move.category === 'Special') {
				if (!move.secondaries) move.secondaries = [];
				for (const secondary of move.secondaries) {
					if (secondary.status === 'brn') return;
				}
				move.secondaries.push({
					chance: 30,
					status: 'brn',
					ability: this.dex.abilities.get('arcanemastery'),
				});
			}
		},
		flags: {},
		name: "Arcane Mastery",
		rating: 3,
		num: 2,
	},
	// 3. Thick Hide (Da Dày): Giảm 25% sát thương nhận vào từ các đòn đánh Vật lý
	thickhide: {
		onSourceModifyDamage(damage, source, target, move) {
			if (move.category === 'Physical') {
				this.debug('Thick Hide damage reduction');
				return this.chainModify(0.75);
			}
		},
		flags: { breakable: 1 },
		name: "Thick Hide",
		rating: 3.5,
		num: 3,
	},
	// 4. Swift Step (Bước Chân Nhanh): Tốc độ tăng gấp 1.5 lần, vô hiệu hoá các chiêu ưu tiên (+) của địch đánh vào bản thân
	swiftstep: {
		onModifySpe(spe, pokemon) {
			return this.chainModify(1.5);
		},
		onTryHit(target, source, move) {
			if (target !== source && move.priority > 0) {
				this.add('-immune', target, '[from] ability: Swift Step');
				return null;
			}
		},
		flags: { breakable: 1 },
		name: "Swift Step",
		rating: 4,
		num: 4,
	}
};
