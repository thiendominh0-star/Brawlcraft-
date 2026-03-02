import {useState, useEffect} from 'react'
import {AVAILABLE_ITEMS} from '../../services/rosterStore.js'
import './BrawlerConfigModal.css'

export default function BrawlerConfigModal({baseChar, existingConfig, onSave, onClose}) {
	// Initialize states based on existingConfig (if editing) or baseChar (if fresh add)
	const [ability, setAbility] = useState(existingConfig?.ability || baseChar.abilities?.[0] || 'No Ability')
	const [item, setItem] = useState(existingConfig?.item || 'No Item')

	// existingConfig.moves contains the selected full move objects. Let's extract their IDs to pre-fill
	const initialSelectedMoveIds = existingConfig?.moves?.map(m => m.id) || []
	const [selectedMoves, setSelectedMoves] = useState(initialSelectedMoveIds)

	const toggleMove = (moveId) => {
		if (selectedMoves.includes(moveId)) {
			setSelectedMoves(selectedMoves.filter(id => id !== moveId))
		} else {
			if (selectedMoves.length >= 4) return
			setSelectedMoves([...selectedMoves, moveId])
		}
	}

	const handleSave = () => {
		if (selectedMoves.length < 1) {
			alert('Chọn ít nhất 1 chiêu thức!')
			return
		}
		const finalMoves = selectedMoves.map(id => baseChar.moves.find(m => m.id === id)).filter(Boolean)
		onSave({
			...baseChar, // keep base stats, types, etc
			ability,
			item,
			moves: finalMoves, // override moves with selected ones
			uid: existingConfig?.uid || `unit_${Date.now()}` // Unique ID for team slot tracking
		})
	}

	return (
		<div className="brawler-modal-backdrop">
			<div className="brawler-modal animate-fadeInUp">
				<header className="brawler-modal__header">
					<h2 className="font-display">CONFIGURE: {baseChar.name.toUpperCase()}</h2>
					<button onClick={onClose} className="brawler-modal__close">✕</button>
				</header>
				<div className="brawler-modal__body">
					{/* Ability Select */}
					<div className="brawler-modal__field">
						<label>Ability (Kỹ năng Nội tại)</label>
						<select value={ability} onChange={e => setAbility(e.target.value)} className="brawler-modal__select">
							{(baseChar.abilities || ['No Ability']).map(a => <option key={a} value={a}>{a}</option>)}
						</select>
					</div>

					{/* Item Select */}
					<div className="brawler-modal__field">
						<label>Held Item (Trang bị hỗ trợ)</label>
						<select value={item} onChange={e => setItem(e.target.value)} className="brawler-modal__select">
							{AVAILABLE_ITEMS.map(i => <option key={i} value={i}>{i}</option>)}
						</select>
					</div>

					{/* Move Pool */}
					<div className="brawler-modal__field">
						<label>Move Pool ({selectedMoves.length}/4 selected)</label>
						<div className="brawler-modal__moves">
							{(baseChar.moves || []).map(m => {
								const isSelected = selectedMoves.includes(m.id)
								return (
									<div
										key={m.id}
										className={`brawler-modal__move ${isSelected ? 'brawler-modal__move--selected' : ''}`}
										onClick={() => toggleMove(m.id)}
									>
										<div className="brawler-modal__move-info">
											<span className="brawler-modal__move-name">{m.name}</span>
											<span className="brawler-modal__move-type">{m.type}</span>
										</div>
										<div className="brawler-modal__move-sub">
											{m.category} | PWR: {m.power > 0 ? m.power : '—'} | ACC: {m.accuracy}%
										</div>
									</div>
								)
							})}
						</div>
					</div>
				</div>
				<footer className="brawler-modal__footer">
					<button className="btn btn-secondary" onClick={onClose} style={{flex: 1}}>CANCEL</button>
					<button className="btn btn-primary" onClick={handleSave} style={{flex: 2}}>✓ CONFIRM & ADD</button>
				</footer>
			</div>
		</div>
	)
}
