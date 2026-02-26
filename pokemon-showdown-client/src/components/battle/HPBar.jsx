import './HPBar.css'

const TYPE_COLORS = {
	shadow: 'var(--type-shadow)',
	arcane: 'var(--type-arcane)',
	holy: 'var(--type-holy)',
	undead: 'var(--type-undead)',
	dragon: 'var(--type-dragon)',
	nature: 'var(--type-nature)',
}

/**
 * HPBar Component
 * @param {number} hp - HP hiện tại
 * @param {number} maxHp - HP tối đa
 * @param {string} name - Tên nhân vật
 * @param {string} type - Loại nhân vật (shadow, arcane, ...)
 * @param {boolean} isPlayer - true = bên trái (player), false = bên phải (enemy)
 */
export default function HPBar({hp, maxHp, name, type = 'shadow', isPlayer = true}) {
	const pct = maxHp > 0 ? Math.max(0, (hp / maxHp) * 100) : 0

	let barColor = 'var(--hp-high)'
	if (pct <= 50) barColor = 'var(--hp-medium)'
	if (pct <= 25) barColor = 'var(--hp-low)'

	const typeColor = TYPE_COLORS[type] || TYPE_COLORS.shadow

	return (
		<div className={`hpbar ${isPlayer ? 'hpbar--player' : 'hpbar--enemy'}`}>
			<div className="hpbar__header">
				<span className="hpbar__name">{name}</span>
				<span className="hpbar__hp-text" style={{color: barColor}}>
					{hp} / {maxHp}
				</span>
			</div>

			<div className="hpbar__track">
				{/* Type accent bar */}
				<div
					className="hpbar__type-accent"
					style={{background: typeColor}}
				/>
				{/* HP fill */}
				<div
					className="hpbar__fill"
					style={{
						width: `${pct}%`,
						background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
						boxShadow: pct > 0 ? `0 0 8px ${barColor}66` : 'none',
					}}
				/>
			</div>

			<div className="hpbar__pct-label">
				<span style={{color: barColor}}>{Math.round(pct)}%</span>
			</div>
		</div>
	)
}
