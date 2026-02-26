export const Conditions: import('../sim/dex-conditions').ConditionDataTable = {
	brn: {
		name: 'brn', // Phỏng, Bỏng
		effectType: 'Status',
		onStart(target, source, sourceEffect) {
			if (sourceEffect && sourceEffect.effectType === 'Ability') {
				this.add('-status', target, 'brn', '[from] ability: ' + sourceEffect.name, `[of] ${source}`);
			} else {
				this.add('-status', target, 'brn');
			}
		},
		onModifyAtkPriority: 5,
		onModifyAtk(atk, pokemon, defender, move) {
			// Bị bỏng giảm 50% sát thương Vật lý
			return this.chainModify(0.5);
		},
		onResidualOrder: 10,
		onResidual(pokemon) {
			this.damage(pokemon.baseMaxhp / 16);
		},
	},
	par: {
		name: 'par', // Tê liệt
		effectType: 'Status',
		onStart(target, source, sourceEffect) {
			if (sourceEffect && sourceEffect.effectType === 'Ability') {
				this.add('-status', target, 'par', '[from] ability: ' + sourceEffect.name, `[of] ${source}`);
			} else {
				this.add('-status', target, 'par');
			}
		},
		onModifySpePriority: -101,
		onModifySpe(spe, pokemon) {
			// Tê liệt giảm 50% Tốc chạy
			return Math.floor(spe * 0.5);
		},
		onBeforeMovePriority: 1,
		onBeforeMove(pokemon) {
			// 25% cơ hội không tung được chiêu
			if (this.randomChance(1, 4)) {
				this.add('cant', pokemon, 'par');
				return false;
			}
		},
	},
	psn: {
		name: 'psn', // Trúng Độc
		effectType: 'Status',
		onStart(target, source, sourceEffect) {
			if (sourceEffect && sourceEffect.effectType === 'Ability') {
				this.add('-status', target, 'psn', '[from] ability: ' + sourceEffect.name, `[of] ${source}`);
			} else {
				this.add('-status', target, 'psn');
			}
		},
		onResidualOrder: 9,
		onResidual(pokemon) {
			this.damage(pokemon.baseMaxhp / 8); // Độc rút 1/8 máu mỗi vòng
		},
	},
	stun: {
		name: 'stun', // Choáng váng (Chỉ kéo dài 1 turn)
		effectType: 'Status',
		onStart(target, source, sourceEffect) {
			this.add('-status', target, 'stun');
			this.effectState.time = 1; // 1 lượt
		},
		onBeforeMovePriority: 10,
		onBeforeMove(pokemon, target, move) {
			pokemon.statusState.time--;
			if (pokemon.statusState.time < 0) {
				pokemon.cureStatus();
				return;
			}
			this.add('cant', pokemon, 'stun');
			return false; // Mất lượt
		},
		onEnd(target) {
			this.add('-curestatus', target, 'stun');
		},
	},
	bleeding: {
		name: 'bleeding', // Chảy máu (Chảy càng lúc càng đau)
		effectType: 'Status',
		onStart(target, source, sourceEffect) {
			this.effectState.stage = 1;
			this.add('-status', target, 'bleeding');
		},
		onResidualOrder: 9,
		onResidual(pokemon) {
			this.damage((pokemon.baseMaxhp / 16) * this.effectState.stage);
			if (this.effectState.stage < 4) {
				this.effectState.stage++; // Tối đa x4 damage chảy máu
			}
		},
	},
	regen: {
		name: 'regen', // Hồi máu liên tục (HoT - Volatile)
		effectType: 'Weather', // Giả lập như Weather buff trên 1 mục tiêu
		duration: 3,
		onStart(target) {
			this.add('-start', target, 'regen');
		},
		onResidualOrder: 5,
		onResidual(pokemon) {
			this.heal(pokemon.baseMaxhp / 8); // Hồi 12.5% mỗi turn
			this.add('-heal', pokemon, pokemon.getHealth, '[from] regen');
		},
		onEnd(target) {
			this.add('-end', target, 'regen');
		}
	}
};
