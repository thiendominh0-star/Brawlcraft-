export const Items: import('../sim/dex-items').ItemDataTable = {
	lifeorb: {
		name: "Life Orb",
		spritenum: 249,
		fling: {
			basePower: 30,
		},
		onModifyDamage(damage, source, target, move) {
			return this.chainModify([5324, 4096]); // ~1.3x Tăng 30% Damage
		},
		onAfterMoveSecondarySelf(source, target, move) {
			if (source && source !== target && move && move.category !== 'Status') {
				this.damage(source.baseMaxhp / 10, source, source, this.dex.items.get('lifeorb')); // Trừ 10% HP
			}
		},
		num: 270,
		gen: 4,
	},
	leftovers: {
		name: "Leftovers",
		spritenum: 228,
		fling: {
			basePower: 10,
		},
		onResidualOrder: 5,
		onResidualSubOrder: 4,
		onResidual(pokemon) {
			this.heal(pokemon.baseMaxhp / 16); // Hồi 1/16 máu mỗi lượt
		},
		num: 234,
		gen: 2,
	},
	choicescarf: {
		name: "Choice Scarf",
		spritenum: 68,
		fling: {
			basePower: 10,
		},
		onStart(pokemon) {
			if (pokemon.volatiles['choicelock']) return;
			// Ghi nợ: Choicelock mechanic
		},
		onModifySpePriority: 1,
		onModifySpe(spe, pokemon) {
			return this.chainModify(1.5); // Tăng 50% Tốc độ
		},
		isChoice: true,
		num: 287,
		gen: 4,
	},
	focussash: {
		name: "Focus Sash",
		spritenum: 145,
		fling: {
			basePower: 10,
		},
		onDamagePriority: -40,
		onDamage(damage, target, source, effect) {
			if (target.hp === target.maxhp && damage >= target.hp && effect && effect.effectType === 'Move') {
				if (target.useItem()) {
					return target.hp - 1; // Giữ lại 1HP nếu bị hit KO từ 100% máu
				}
			}
		},
		num: 275,
		gen: 4,
	},
};
