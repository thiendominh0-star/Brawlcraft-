import { Dex } from '../sim/dex';
import type { ModdedBattleScriptsData, StatIDExceptHP } from '../sim/dex-data';
import type { BattleActions } from '../sim/battle-actions';
import type { Pokemon } from '../sim/pokemon';
import type { ActiveMove } from '../sim/dex-moves';

export const Scripts: ModdedBattleScriptsData = {
	gen: 9,
	actions: {
		/**
		 * 0 is a success dealing 0 damage, such as from False Swipe at 1 HP.
		 * Normal PS return value rules apply:
		 * undefined = success, null = silent failure, false = loud failure
		 */
		getDamage(
			this: BattleActions,
			source: Pokemon, target: Pokemon, move: string | number | ActiveMove,
			suppressMessages: boolean = false
		): number | undefined | null | false {
			if (typeof move === 'string') move = this.dex.getActiveMove(move);

			if (typeof move === 'number') {
				const basePower = move;
				move = new Dex.Move({
					basePower,
					type: '???',
					category: 'Physical',
					willCrit: false,
				}) as ActiveMove;
				move.hit = 0;
			}

			const activeMove = move as ActiveMove;

			if (!activeMove.ignoreImmunity || (activeMove.ignoreImmunity !== true && !activeMove.ignoreImmunity[activeMove.type])) {
				if (!target.runImmunity(activeMove.type, !suppressMessages)) {
					return false;
				}
			}

			if (activeMove.ohko) return target.maxhp;
			if (activeMove.damageCallback) return activeMove.damageCallback.call(this.battle, source, target);
			if (activeMove.damage === 'level') {
				return source.level;
			} else if (activeMove.damage) {
				return activeMove.damage;
			}

			const category = this.battle.getCategory(activeMove);

			let basePower: number | false | null = activeMove.basePower;
			if (activeMove.basePowerCallback) {
				basePower = activeMove.basePowerCallback.call(this.battle, source, target, activeMove);
			}
			if (!basePower) return basePower === 0 ? undefined : basePower;
			basePower = this.battle.clampIntRange(basePower, 1);

			let critMult;
			let critRatio = this.battle.runEvent('ModifyCritRatio', source, target, activeMove, activeMove.critRatio || 0);
			critRatio = this.battle.clampIntRange(critRatio, 0, 4);
			critMult = [0, 24, 8, 2, 1];

			const moveHit = target.getMoveHitData(activeMove);
			moveHit.crit = activeMove.willCrit || false;
			if (activeMove.willCrit === undefined) {
				if (critRatio) {
					moveHit.crit = this.battle.randomChance(1, critMult[critRatio]);
				}
			}

			if (moveHit.crit) {
				moveHit.crit = this.battle.runEvent('CriticalHit', target, null, activeMove);
			}

			// happens after crit calculation
			basePower = this.battle.runEvent('BasePower', source, target, activeMove, basePower, true);

			if (!basePower) return 0;
			basePower = this.battle.clampIntRange(basePower, 1);

			const isPhysical = activeMove.category === 'Physical';
			let attackStat: StatIDExceptHP = activeMove.overrideOffensiveStat || (isPhysical ? 'atk' : 'spa');
			const defenseStat: StatIDExceptHP = activeMove.overrideDefensiveStat || (isPhysical ? 'def' : 'spd');

			let atkBoosts = source.boosts[attackStat as keyof typeof source.boosts];
			let defBoosts = target.boosts[defenseStat as keyof typeof target.boosts];

			let ignoreNegativeOffensive = !!activeMove.ignoreNegativeOffensive;
			let ignorePositiveDefensive = !!activeMove.ignorePositiveDefensive;

			if (moveHit.crit) {
				ignoreNegativeOffensive = true;
				ignorePositiveDefensive = true;
			}
			const ignoreOffensive = !!(activeMove.ignoreOffensive || (ignoreNegativeOffensive && atkBoosts < 0));
			const ignoreDefensive = !!(activeMove.ignoreDefensive || (ignorePositiveDefensive && defBoosts > 0));

			if (ignoreOffensive) {
				atkBoosts = 0;
			}
			if (ignoreDefensive) {
				defBoosts = 0;
			}

			let attack = source.calculateStat(attackStat, atkBoosts, 1, source);
			let defense = target.calculateStat(defenseStat, defBoosts, 1, target);

			// @ts-ignore
			return this.modifyDamage(basePower, attack, defense, source, target, activeMove, suppressMessages);
		},

		modifyDamage(
			this: BattleActions,
			basePower: number, attack: number, defense: number, pokemon: Pokemon, target: Pokemon, move: ActiveMove, suppressMessages = false
		) {
			const tr = this.battle.trunc;
			if (!move.type) move.type = '???';
			const type = move.type;

			// V1 Custom IP Damage Formula
			// Physical damage: Base = SkillPower + AD, Final = Base * (100 / (100 + target Armor))
			// Magic damage: Base = SkillPower + AP, Final = Base * (100 / (100 + target MR))
			let baseDamage = basePower + attack;
			let finalDamage = baseDamage * (100 / (100 + defense));

			if (move.spreadHit) {
				// multi-target modifier (doubles only)
				const spreadModifier = this.battle.gameType === 'freeforall' ? 0.5 : 0.75;
				finalDamage = this.battle.modify(finalDamage, spreadModifier);
			}

			// weather modifier
			finalDamage = this.battle.runEvent('WeatherModifyDamage', pokemon, target, move, finalDamage);

			// crit - not a modifier
			const isCrit = target.getMoveHitData(move).crit;
			if (isCrit) {
				finalDamage = tr(finalDamage * (move.critModifier || 1.5));
			}

			// random factor - also not a modifier
			finalDamage = this.battle.randomizer(finalDamage);

			// STAB
			if (type !== '???') {
				let stab: number | [number, number] = 1;
				const isSTAB = move.forceSTAB || pokemon.hasType(type) || pokemon.getTypes(false, true).includes(type);
				if (isSTAB) {
					stab = 1.5;
				}
				finalDamage = this.battle.modify(finalDamage, stab);
			}

			// Custom Type Multipliers
			let typeMod = 0;

			// Re-calculate effectiveness by overriding the battle action's native function here.
			// Target can have up to 2 types.
			const targetTypes = target.getTypes();
			let multiplier = 1;

			for (const t of targetTypes) {
				const effectiveness = this.dex.getEffectiveness(type, t);
				if (effectiveness > 0) {
					multiplier *= 1.5; // Strong
					typeMod++;
				} else if (effectiveness < 0) {
					multiplier *= 0.75; // Weak
					typeMod--;
				}
			}

			target.getMoveHitData(move).typeMod = typeMod;
			if (typeMod > 0) {
				if (!suppressMessages) this.battle.add('-supereffective', target);
			}
			if (typeMod < 0) {
				if (!suppressMessages) this.battle.add('-resisted', target);
			}

			if (typeMod !== 0) {
				// Apply custom multiplier
				// If multiplier is like 2.25 or 1.125 or 0.5625 this truncates to integer math if using battle.modify, 
				// but for exact multipliers we can just use float multiplication and round at the very end.
				finalDamage = finalDamage * multiplier;
			}

			if (target.status === 'slp' && move.flags['catch']) {
				finalDamage = this.battle.modify(finalDamage, 2);
			}

			// final modifiers
			finalDamage = this.battle.runEvent('ModifyDamage', pokemon, target, move, finalDamage);

			if (move.isZOrMaxPowered && target.getMoveHitData(move).zBrokeProtect) {
				finalDamage = this.battle.modify(finalDamage, 0.25);
				this.battle.add('-zbroken', target);
			}

			// Generate 1 HP minimum for non-zero damage hits
			if (basePower && !Math.floor(finalDamage)) {
				return 1;
			}

			return Math.floor(finalDamage);
		},
	},
};
