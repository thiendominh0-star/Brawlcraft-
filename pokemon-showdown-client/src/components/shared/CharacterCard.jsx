import './CharacterCard.css'

const TYPE_COLOR_MAP = {
	shadow: {color: '#7c3aed', label: 'Shadow'},
	arcane: {color: '#2563eb', label: 'Arcane'},
	holy: {color: '#d97706', label: 'Holy'},
	undead: {color: '#6b7280', label: 'Undead'},
	dragon: {color: '#dc2626', label: 'Dragon'},
	nature: {color: '#16a34a', label: 'Nature'},
}

/**
 * CharacterCard - thẻ nhân vật dùng trong Teambuilder
 * @param {Object} character - { id, name, types, hp, atk, def, spa, spd, spe }
 * @param {boolean} selected - có đang được chọn không
 * @param {Function} onClick - callback khi click
 */
export default function CharacterCard({character, selected = false, onClick}) {
	if (!character) return null

	const mainType = TYPE_COLOR_MAP[character.types?.[0]?.toLowerCase()] || TYPE_COLOR_MAP.shadow
	const initials = character.name?.slice(0, 2).toUpperCase() || '??'

	return (
		<div
			className={`charcard ${selected ? 'charcard--selected' : ''}`}
			style={{'--char-color': mainType.color}}
			onClick={onClick}
			role="button"
			tabIndex={0}
			onKeyDown={e => e.key === 'Enter' && onClick?.()}
		>
			{/* Halo glow khi selected */}
			{selected && <div className="charcard__selected-ring" />}

			{/* Avatar placeholder */}
			<div className="charcard__avatar">
				<span className="charcard__initials">{initials}</span>
				<div className="charcard__avatar-glow" />
			</div>

			{/* Info */}
			<div className="charcard__info">
				<span className="charcard__name">{character.name}</span>
				{character.ability && <span className="charcard__ability">⚡ {character.ability}</span>}
				{character.item && <span className="charcard__item">🎒 {character.item}</span>}
				<div className="charcard__types">
					{character.types?.map(t => {
						const typeInfo = TYPE_COLOR_MAP[t?.toLowerCase()] || {color: '#374151', label: t}
						return (
							<span
								key={t}
								className="charcard__type-badge"
								style={{'--type-badge-color': typeInfo.color}}
							>
								{typeInfo.label}
							</span>
						)
					})}
				</div>
			</div>

			{/* Stats mini radar-style bars */}
			{character.baseStats && (
				<div className="charcard__stats">
					{Object.entries(character.baseStats).map(([stat, val]) => (
						<div key={stat} className="charcard__stat-row">
							<span className="charcard__stat-label">{stat.toUpperCase()}</span>
							<div className="charcard__stat-track">
								<div
									className="charcard__stat-fill"
									style={{width: `${Math.min(100, (val / 255) * 100)}%`}}
								/>
							</div>
							<span className="charcard__stat-val">{val}</span>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
