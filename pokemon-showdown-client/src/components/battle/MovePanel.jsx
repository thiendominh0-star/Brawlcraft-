import './MovePanel.css'

const TYPE_COLOR_MAP = {
	Shadow: '#7c3aed',
	Arcane: '#2563eb',
	Holy: '#d97706',
	Undead: '#6b7280',
	Dragon: '#dc2626',
	Nature: '#16a34a',
	'???': '#374151',
}

const CATEGORY_ICON = {
	Physical: '⚔',
	Special: '✦',
	Status: '◎',
}

/**
 * MovePanel Component
 * @param {Array} moves - Mảng move objects: [{id, name, type, category, pp, maxpp, disabled}]
 * @param {Function} onMove - Callback khi chọn move (index 1-4)
 * @param {boolean} disabled - Khóa toàn bộ panel
 */
export default function MovePanel({moves = [], onMove, disabled = false}) {
	if (!moves.length) {
		return (
			<div className="movepanel movepanel--empty">
				<span>Đang chờ...</span>
			</div>
		)
	}

	return (
		<div className={`movepanel ${disabled ? 'movepanel--disabled' : ''}`}>
			{moves.map((move, i) => {
				const color = TYPE_COLOR_MAP[move.type] || TYPE_COLOR_MAP['???']
				const isDisabled = disabled || move.disabled || move.pp === 0

				return (
					<button
						key={move.id || i}
						className={`movepanel__btn ${isDisabled ? 'movepanel__btn--disabled' : ''}`}
						style={{'--move-color': color}}
						onClick={() => !isDisabled && onMove && onMove(i + 1)}
						disabled={isDisabled}
						title={`${move.name} | PP: ${move.pp}/${move.maxpp}`}
					>
						<div className="movepanel__btn-left">
							<span className="movepanel__type-dot" />
							<span className="movepanel__name">{move.name || '—'}</span>
						</div>
						<div className="movepanel__btn-right">
							<span className="movepanel__category">{CATEGORY_ICON[move.category] || ''}</span>
							<span className="movepanel__type-badge">{move.type}</span>
							<span className="movepanel__pp">
								{move.pp !== undefined ? `${move.pp} PP` : ''}
							</span>
						</div>
					</button>
				)
			})}
		</div>
	)
}
