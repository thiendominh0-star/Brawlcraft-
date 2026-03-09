import {useState, useEffect, useRef, useMemo} from 'react'
import {useNavigate} from 'react-router-dom'
import {
	loadRoster, saveRoster, resetRoster, nameToId, createBlankChar, createBlankMove,
	loadMoves, saveMoves,
	AVAILABLE_TYPES, AVAILABLE_CATEGORIES, AVAILABLE_ABILITIES, AVAILABLE_ITEMS, STAT_KEYS, STAT_LABELS, AVAILABLE_STATS
} from '../../services/rosterStore.js'
import './Admin.css'

const TYPE_COLOR = {
	Shadow: '#7c3aed', Arcane: '#2563eb', Holy: '#d97706',
	Undead: '#6b7280', Dragon: '#dc2626', Nature: '#16a34a',
}
const CATEGORY_ICON = {Physical: '⚔', Special: '✦', Status: '◎'}

export default function Admin() {
	const navigate = useNavigate()
	const [viewMode, setViewMode] = useState('brawlers') // 'brawlers' | 'moves'

	const [roster, setRoster] = useState([])
	const [editingId, setEditingId] = useState(null)
	const [form, setForm] = useState(createBlankChar())

	const [customMoves, setCustomMoves] = useState([])
	const [editingMoveId, setEditingMoveId] = useState(null)
	const [formMove, setFormMove] = useState(createBlankMove())

	const [tab, setTab] = useState('info') // For brawler: 'info' | 'moves'
	const [searchMove, setSearchMove] = useState('')
	const [saved, setSaved] = useState(false)

	useEffect(() => {
		setRoster(loadRoster())
		setCustomMoves(loadMoves())
	}, [])

	// --- Form Brawler ---
	const setField = (key, val) => setForm(f => ({...f, [key]: val}))
	const setStat = (stat, val) => setForm(f => ({
		...f, baseStats: {...f.baseStats, [stat]: Math.max(1, Math.min(255, Number(val) || 0))},
	}))
	const toggleType = (t) => setForm(f => {
		const has = f.types.includes(t)
		if (has && f.types.length === 1) return f
		return {...f, types: has ? f.types.filter(x => x !== t) : [...f.types.slice(0, 1), t]}
	})

	// --- Form Move ---
	const setMoveField = (key, val) => setFormMove(f => ({...f, [key]: val}))
	const setMoveNestedField = (parentKey, childKey, val) => {
		setFormMove(f => ({
			...f,
			[parentKey]: {...(f[parentKey] || {}), [childKey]: val}
		}))
	}

	const generateMoveDescription = (move) => {
		let parts = []
		parts.push(`[${move.category}] ${move.category === 'Status' ? '—' : move.power + ' DMG'} | ${move.accuracy}% ACC | Pri: ${move.priority > 0 ? '+' : ''}${move.priority}`)
		if (move.cost?.type === 'hp' && move.cost?.value > 0) {
			const hpType = move.cost.hp_type === 'max' ? 'Max HP' : 'HP hiện tại'
			parts.push(`Cost: Hi sinh ${move.cost.value}% ${hpType}.`)
		} else if (move.cost?.type === 'faint') {
			parts.push(`Cost: Tự sát sau khi dùng chiêu.`)
		} else if (move.cost?.type === 'charge') {
			parts.push(`Cost: Tụ khí 1 lượt trước khi đánh.`)
		} else if (move.cost?.type === 'pp') {
			parts.push(`Cost: Tiêu hao ${move.cost.value || 1} PP.`)
		}
		if (move.drawback?.type === 'stat') {
			parts.push(`Drawback: Tự giảm ${move.drawback.stage} bậc ${move.drawback.stat.toUpperCase()}.`)
		}
		const sec = move.secondary
		if (sec && sec.type !== 'none') {
			let effText = `${sec.chance}% cơ hội`
			if (sec.type === 'stat') {
				const effAction = sec.stage > 0 ? 'tăng' : 'giảm'
				effText += ` ${effAction} ${Math.abs(sec.stage)} bậc ${sec.stat.toUpperCase()} của ${sec.target === 'self' ? 'Bản thân' : 'Mục tiêu'}.`
			} else if (sec.type === 'volatile' && sec.volatile === 'flinch') {
				effText += ` gây Choáng (Flinch) mục tiêu trong 1 hiệp.`
			}
			parts.push(effText)
		}
		return parts.join(' ')
	}

	// Navigation
	const startEditBrawler = (char) => {
		setEditingId(char.id)
		setForm({...char, moves: Array.isArray(char.moves) ? char.moves : []})
		setTab('info')
	}
	const startNewBrawler = () => {
		setEditingId(null)
		setForm(createBlankChar())
		setTab('info')
	}

	const startEditMove = (m) => {
		setEditingMoveId(m.id)
		setFormMove({...m})
	}
	const startNewMove = () => {
		setEditingMoveId(null)
		setFormMove(createBlankMove())
	}

	const toggleMoveForBrawler = (moveObj) => {
		const hasMove = form.moves.find(m => m.id === moveObj.id)
		if (hasMove) {
			setField('moves', form.moves.filter(m => m.id !== moveObj.id))
		} else {
			setField('moves', [...form.moves, moveObj])
		}
	}

	const handleSave = async () => {
		let newRoster = [...roster]
		let newCustomMoves = [...customMoves]

		if (viewMode === 'brawlers') {
			if (!form.name.trim()) return
			const id = editingId || nameToId(form.name)
			let finalChar = {...form, id, name: form.name.trim()}
			if (editingId) {
				newRoster = roster.map(c => c.id === editingId ? finalChar : c)
			} else {
				if (roster.find(c => c.id === id)) finalChar.id = id + Date.now()
				newRoster = [...roster, finalChar]
			}
			saveRoster(newRoster)
			setRoster(newRoster)
			startNewBrawler()
		} else {
			if (!formMove.name.trim()) return
			const id = editingMoveId || nameToId(formMove.name)
			let finalMove = {...formMove, id, name: formMove.name.trim()}
			if (editingMoveId) {
				newCustomMoves = customMoves.map(m => m.id === editingMoveId ? finalMove : m)
			} else {
				if (customMoves.find(m => m.id === id)) finalMove.id = id + Date.now()
				newCustomMoves = [...customMoves, finalMove]
			}
			saveMoves(newCustomMoves)
			setCustomMoves(newCustomMoves)

			// Also update any brawlers that might have this old move equipped
			newRoster = newRoster.map(char => {
				const updatedMoves = char.moves.map(m => m.id === finalMove.id ? finalMove : m)
				return {...char, moves: updatedMoves}
			})
			saveRoster(newRoster)
			setRoster(newRoster)

			startNewMove()
		}

		setSaved(true)

		// Call backend sync server
		try {
			const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/sync'
			const res = await fetch(apiUrl, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({roster: newRoster, customMoves: newCustomMoves})
			})
			const data = await res.json()
			if (!data.success) alert('Lỗi đồng bộ cấu hình Server: ' + data.error)
		} catch (err) {
			console.error('Sync failed', err)
			alert('Không kết nối được Sync Server ở port 8001.')
		}

		setTimeout(() => setSaved(false), 2000)
	}

	const handleDelete = (id) => {
		if (viewMode === 'brawlers') {
			if (!window.confirm('Xóa nhân vật này?')) return
			const newRoster = roster.filter(c => c.id !== id)
			saveRoster(newRoster)
			setRoster(newRoster)
			if (editingId === id) startNewBrawler()
		} else {
			if (!window.confirm('Xóa kỹ năng này? Nhân vật đang dùng nó cũng sẽ bị xóa khỏi danh sách chiêu!')) return
			const newCustomMoves = customMoves.filter(m => m.id !== id)
			saveMoves(newCustomMoves)
			setCustomMoves(newCustomMoves)

			const newRoster = roster.map(char => ({
				...char, moves: char.moves.filter(m => m.id !== id)
			}))
			saveRoster(newRoster)
			setRoster(newRoster)

			if (editingMoveId === id) startNewMove()
		}
	}

	const handleReset = () => {
		if (!window.confirm('Reset về danh sách mặc định?')) return
		setRoster(resetRoster())
		startNewBrawler()
	}

	const filteredMovesSide = customMoves.filter(m => m.name.toLowerCase().includes(searchMove.toLowerCase()) || m.type.toLowerCase().includes(searchMove.toLowerCase()))

	return (
		<div className="admin">
			<aside className="admin__sidebar">
				<header className="admin__sidebar-header" style={{flexDirection: 'column', alignItems: 'stretch', gap: '10px'}}>
					<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
						<button className="btn btn-secondary admin__back-btn" onClick={() => navigate('/')}>← Back</button>
						<h1 className="admin__title font-display" style={{fontSize: '1.5rem', margin: 0}}>ADMIN</h1>
					</div>
					<div style={{display: 'flex', gap: '5px', background: 'var(--bg-01)', padding: '5px', borderRadius: '8px', border: '1px solid var(--border-default)'}}>
						<button className={`btn ${viewMode === 'brawlers' ? 'btn-primary' : 'btn-secondary'}`} style={{flex: 1, padding: '5px', fontSize: '0.9rem'}} onClick={() => {setViewMode('brawlers'); startNewBrawler()}}>Brawlers</button>
						<button className={`btn ${viewMode === 'moves' ? 'btn-primary' : 'btn-secondary'}`} style={{flex: 1, padding: '5px', fontSize: '0.9rem'}} onClick={() => {setViewMode('moves'); startNewMove()}}>Chiêu Thức</button>
					</div>
				</header>

				{viewMode === 'brawlers' ? (
					<div className="admin__roster-list">
						<div className="admin__roster-header">
							<span className="admin__label">ROSTER ({roster.length})</span>
							<button className="admin__new-btn" onClick={startNewBrawler}>+ NEW</button>
						</div>
						{roster.map(char => (
							<div key={char.id} className={`admin__roster-item ${editingId === char.id ? 'admin__roster-item--active' : ''}`} onClick={() => startEditBrawler(char)}>
								<div className="admin__roster-avatar" style={{background: `color-mix(in srgb, ${TYPE_COLOR[char.types?.[0]]} 25%, var(--bg-03))`}}>
									{char.imageUrl ? <img src={char.imageUrl} alt={char.name} className="admin__roster-img" /> : <span style={{color: TYPE_COLOR[char.types?.[0]], fontFamily: 'var(--font-display)', fontWeight: 900}}>{char.name.slice(0, 2).toUpperCase()}</span>}
								</div>
								<div className="admin__roster-info">
									<span className="admin__roster-name">{char.name}</span>
									<span className="admin__roster-types">{char.types?.join(' / ')}</span>
								</div>
								<button className="admin__delete-btn" onClick={e => {e.stopPropagation(); handleDelete(char.id)}} title="Xóa">✕</button>
							</div>
						))}
					</div>
				) : (
					<div className="admin__roster-list">
						<div className="admin__roster-header" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '10px'}}>
							<div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
								<span className="admin__label">MOVES ({customMoves.length})</span>
								<button className="admin__new-btn" onClick={startNewMove}>+ NEW</button>
							</div>
							<input type="text" className="admin__input" placeholder="🔍 Tìm theo Tên/Hệ..." value={searchMove} onChange={e => setSearchMove(e.target.value)} style={{width: '100%', padding: '8px'}} />
						</div>
						{filteredMovesSide.map(m => (
							<div key={m.id} className={`admin__roster-item ${editingMoveId === m.id ? 'admin__roster-item--active' : ''}`} onClick={() => startEditMove(m)} style={{padding: '10px', display: 'flex'}}>
								<div style={{display: 'flex', flexDirection: 'column', flex: 1}}>
									<div style={{fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
										<span>{m.name || 'Untiled'}</span>
										<span style={{color: TYPE_COLOR[m.type], fontSize: '1rem', textShadow: '0 0 5px rgba(0,0,0,0.5)'}} title={m.category}>{CATEGORY_ICON[m.category]}</span>
									</div>
									<div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{m.type} | {m.category}</div>
								</div>
								<button className="admin__delete-btn" onClick={e => {e.stopPropagation(); handleDelete(m.id)}} title="Xóa">✕</button>
							</div>
						))}
					</div>
				)}

				{viewMode === 'brawlers' && <button className="admin__reset-btn" style={{marginTop: 'auto'}} onClick={handleReset}>↺ Reset Default</button>}
			</aside>

			<main className="admin__main">
				<div className="admin__main-header">
					<h2 className="admin__form-title font-display">
						{viewMode === 'brawlers'
							? (editingId ? `EDIT: ${form.name || '...'}` : 'NEW BRAWLER')
							: (editingMoveId ? `EDIT: ${formMove.name || '...'}` : 'NEW CUSTOM MOVE')
						}
					</h2>
					{saved && <span className="admin__saved-badge">✓ Saved!</span>}

					{viewMode === 'brawlers' && (
						<div className="admin__tabs">
							<button className={`admin__tab ${tab === 'info' ? 'admin__tab--active' : ''}`} onClick={() => setTab('info')}>◈ Cơ bản</button>
							<button className={`admin__tab ${tab === 'moves' ? 'admin__tab--active' : ''}`} onClick={() => setTab('moves')}>⚔ Kỹ năng ({form.moves?.length || 0}/4)</button>
						</div>
					)}
				</div>

				{viewMode === 'brawlers' ? (
					<div className="admin__form-content animate-fadeInUp">
						{tab === 'info' && (
							<div className="admin__form-grid">
								{/* Basic Info (same as before) */}
								<div className="admin__form-group">
									<label className="admin__label">Name</label>
									<input type="text" className="admin__input" value={form.name} onChange={e => setField('name', e.target.value)} placeholder="Tên nhân vật..." />
								</div>
								<div className="admin__form-group">
									<label className="admin__label">Image URL / Model</label>
									<input type="text" className="admin__input" value={form.imageUrl} onChange={e => setField('imageUrl', e.target.value)} placeholder="https://..." />
								</div>
								<div className="admin__form-group admin__form-group--full">
									<label className="admin__label">Types (Chọn tối đa 2)</label>
									<div className="admin__types-grid">
										{AVAILABLE_TYPES.map(t => (
											<button key={t} className={`admin__type-btn ${form.types.includes(t) ? `type-${t.toLowerCase()} active` : ''}`} onClick={() => toggleType(t)}>{t}</button>
										))}
									</div>
								</div>
								<div className="admin__form-group">
									<label className="admin__label">Abilities (Đặc tính)</label>
									<div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
										{form.abilities.map((ab, i) => (
											<div key={i} style={{display: 'flex', gap: '5px'}}>
												<select className="admin__input" value={ab} onChange={e => {
													const newAb = [...form.abilities]
													newAb[i] = e.target.value
													setField('abilities', newAb)
												}}>
													{AVAILABLE_ABILITIES.map(a => <option key={a} value={a}>{a}</option>)}
												</select>
												{form.abilities.length > 1 && <button className="btn btn-secondary" style={{padding: '5px'}} onClick={() => setField('abilities', form.abilities.filter((_, idx) => idx !== i))}>✕</button>}
											</div>
										))}
										{form.abilities.length < 3 && <button className="btn btn-secondary" style={{padding: '5px'}} onClick={() => setField('abilities', [...form.abilities, 'No Ability'])}>+ Thêm Slot</button>}
									</div>
								</div>
								<div className="admin__form-group admin__form-group--full">
									<label className="admin__label" style={{display: 'flex', justifyContent: 'space-between'}}>
										<span>Base Stats</span>
										<span style={{color: 'var(--text-secondary)'}}>Tổng: {Object.values(form.baseStats).reduce((a, b) => a + b, 0)} / 500</span>
									</label>
									<div className="admin__stats-grid">
										{STAT_KEYS.map(key => (
											<div key={key} className="admin__stat-item">
												<label className="admin__stat-label">{STAT_LABELS[key]}</label>
												<input type="number" min={1} max={255} className="admin__input admin__stat-input" value={form.baseStats[key]} onChange={e => setStat(key, e.target.value)} />
											</div>
										))}
									</div>
								</div>
							</div>
						)}

						{tab === 'moves' && (
							<div className="admin__moves" style={{padding: '0'}}>
								<p style={{color: 'var(--text-secondary)', marginBottom: '15px'}}>Click chọn từ kho Kỹ Năng (Custom Moves) bên dưới để làm Vốn chiêu thức cho Brawler này. (Chọn được {form.moves?.length || 0} / 4 Kỹ năng)</p>
								<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px'}}>
									{customMoves.map(m => {
										const isEquipped = form.moves.some(equipped => equipped.id === m.id)
										return (
											<div
												key={m.id}
												style={{
													padding: '12px',
													border: `2px solid ${isEquipped ? 'var(--accent-blue)' : 'var(--border-default)'}`,
													background: isEquipped ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-02)',
													borderRadius: '8px',
													cursor: 'pointer',
													boxShadow: isEquipped ? '0 0 10px rgba(59,130,246,0.3)' : 'none',
													transition: 'all 0.2s'
												}}
												onClick={() => toggleMoveForBrawler(m)}
											>
												<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px'}}>
													<strong style={{color: 'var(--text-primary)', fontSize: '1.1rem'}}>{m.name}</strong>
													{isEquipped ? <span style={{color: 'var(--accent-blue)', fontWeight: 'bold'}}>✓ Đã chọn</span> : <span style={{color: 'var(--text-muted)'}}>+ Chọn</span>}
												</div>
												<div style={{fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '8px', alignItems: 'center'}}>
													<div style={{background: TYPE_COLOR[m.type], width: '12px', height: '12px', borderRadius: '50%'}}></div>
													<span>{m.type}</span>
													<span style={{color: 'var(--accent-blue)'}}>{CATEGORY_ICON[m.category]} {m.category}</span>
												</div>
												<div style={{fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px'}}>
													Dmg: {m.category === 'Status' ? '-' : m.power} | Acc: {m.accuracy}% | PP: {m.pp}
												</div>
											</div>
										)
									})}
									{customMoves.length === 0 && <div style={{gridColumn: '1/-1', color: 'var(--accent-red)', padding: '20px', background: 'var(--bg-03)', borderRadius: '8px', textAlign: 'center'}}>Kho Kỹ Năng đang trống. Xin hãy nhấn chuyển sang Tab "Chiêu Thức" để tạo chiêu thức mới trước!</div>}
								</div>
							</div>
						)}
					</div>
				) : (
					<div className="admin__moves animate-fadeInUp">
						<div className="admin__move-item" style={{background: 'var(--bg-02)', border: '1px solid var(--border-strong)', flex: 1}}>
							<div className="admin__move-header">
								<input type="text" className="admin__move-name-input" placeholder="Tên Chiêu Thức..." value={formMove.name} onChange={e => setMoveField('name', e.target.value)} />
								<select className="admin__move-select" style={{background: TYPE_COLOR[formMove.type], color: 'white', fontWeight: 'bold'}} value={formMove.type} onChange={e => setMoveField('type', e.target.value)}>
									{AVAILABLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
								</select>
								<select className="admin__move-select" value={formMove.category} onChange={e => {setMoveField('category', e.target.value); if (e.target.value === 'Status') setMoveField('power', 0);}}>
									{AVAILABLE_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICON[c]} {c}</option>)}
								</select>
							</div>

							<div className="admin__move-stats" style={{flexWrap: 'wrap'}}>
								<div className="admin__move-stat">
									<label className="admin__move-label">PWR (Sát thương)</label>
									<input type="number" min={0} max={250} value={formMove.category === 'Status' ? 0 : formMove.power} disabled={formMove.category === 'Status'} onChange={e => setMoveField('power', Number(e.target.value))} className="admin__move-stat-input" />
								</div>
								<div className="admin__move-stat">
									<label className="admin__move-label">ACC (Chính xác)</label>
									<input type="number" min={1} max={100} value={formMove.accuracy} onChange={e => setMoveField('accuracy', Number(e.target.value))} className="admin__move-stat-input" />
								</div>
								<div className="admin__move-stat">
									<label className="admin__move-label">PRI (Lượt)</label>
									<input type="number" min={-6} max={6} value={formMove.priority || 0} onChange={e => setMoveField('priority', Number(e.target.value))} className="admin__move-stat-input" />
								</div>
								<div className="admin__move-stat">
									<label className="admin__move-label">PP</label>
									<input type="number" min={1} max={40} value={formMove.pp} onChange={e => setMoveField('pp', Number(e.target.value))} className="admin__move-stat-input" />
								</div>
							</div>

							<hr style={{margin: '20px 0', borderColor: 'var(--border-default)'}} />

							{/* Signature Move config */}
							<div style={{background: 'var(--bg-01)', padding: '15px', borderRadius: '4px', border: '1px solid var(--border-default)', marginTop: '15px'}}>
								<div style={{fontSize: '0.8rem', fontWeight: 'bold', color: '#fbbf24', marginBottom: '10px', textTransform: 'uppercase'}}>✨ ĐẶC QUYỀN (SIGNATURE MOVE)</div>
								<div style={{display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap'}}>
									<label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 'bold'}}>
										<input type="checkbox" checked={formMove.isSignature || false} onChange={e => {
											setMoveField('isSignature', e.target.checked);
											if (!e.target.checked) setMoveField('signatureBrawler', '');
										}} style={{width: '20px', height: '20px', accentColor: '#fbbf24'}} />
										Kỹ Năng Độc Bản
									</label>
									{formMove.isSignature && (
										<select className="admin__move-select" style={{flex: 1, minWidth: '200px', borderColor: '#fbbf24', outline: 'none'}} value={formMove.signatureBrawler || ''} onChange={e => setMoveField('signatureBrawler', e.target.value)}>
											<option value="">-- Chọn Tướng Khóa Độc Quyền --</option>
											{roster.map(char => <option key={char.id} value={char.id}>{char.name}</option>)}
										</select>
									)}
								</div>
							</div>

							{/* Conditions (Optional) */}
							<div style={{background: 'var(--bg-01)', padding: '15px', borderRadius: '4px', border: '1px solid var(--border-default)', marginTop: '15px'}}>
								<div style={{fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-red)', marginBottom: '10px', textTransform: 'uppercase'}}>CONDITION</div>
								<div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
									{/* Cost */}
									<div style={{flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '4px'}}>
										<label className="admin__move-label" style={{color: 'var(--text-secondary)'}}>COST</label>
										<select className="admin__move-select" value={formMove.cost?.type || 'none'} onChange={e => {
											const val = e.target.value; setMoveNestedField('cost', 'type', val)
											if (val === 'hp') {setMoveNestedField('cost', 'hp_type', 'current'); setMoveNestedField('cost', 'value', 10);}
											else if (val === 'pp') {setMoveNestedField('cost', 'value', 3);}
										}}>
											<option value="none">Không</option>
											<option value="hp">Hi sinh % Máu (HP / Max HP)</option>
											<option value="faint">Tự sát (Faint)</option>
											<option value="charge">Tụ khí 1 lượt (Charge)</option>
											<option value="pp">Tiêu hao Năng lượng Kép (Extra PP)</option>
										</select>
										{formMove.cost?.type === 'hp' && (
											<div style={{display: 'flex', gap: '5px', marginTop: '5px'}}>
												<select className="admin__move-select" style={{padding: '6px', flex: 1}} value={formMove.cost.hp_type || 'current'} onChange={e => setMoveNestedField('cost', 'hp_type', e.target.value)}>
													<option value="current">HP hiện tại</option>
													<option value="max">Max HP</option>
												</select>
												<input type="number" className="admin__input" style={{padding: '6px', width: '80px'}} min={1} max={99} value={formMove.cost.value || 0} onChange={e => setMoveNestedField('cost', 'value', Number(e.target.value))} placeholder="%" />
											</div>
										)}
										{formMove.cost?.type === 'pp' && (
											<input type="number" className="admin__input" style={{padding: '6px', marginTop: '5px'}} min={1} max={20} value={formMove.cost.value || 1} onChange={e => setMoveNestedField('cost', 'value', Number(e.target.value))} placeholder="Tốn bao nhiêu PP?" />
										)}
									</div>
									{/* Drawback */}
									<div style={{flex: 1, minWidth: '250px', display: 'flex', flexDirection: 'column', gap: '4px'}}>
										<label className="admin__move-label" style={{color: 'var(--text-secondary)'}}>DRAWBACK</label>
										<select className="admin__move-select" value={formMove.drawback?.type || 'none'} onChange={e => setMoveNestedField('drawback', 'type', e.target.value)}>
											<option value="none">Không</option>
											<option value="stat">Tự giảm Chỉ số cơ bản</option>
										</select>
										{formMove.drawback?.type === 'stat' && (
											<div style={{display: 'flex', gap: '5px', marginTop: '5px'}}>
												<select className="admin__move-select" style={{padding: '6px', flex: 1}} value={formMove.drawback.stat || 'atk'} onChange={e => setMoveNestedField('drawback', 'stat', e.target.value)}>
													{AVAILABLE_STATS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
												</select>
												<input type="number" className="admin__input" style={{padding: '6px', width: '80px'}} min={1} max={6} value={formMove.drawback.stage || 1} onChange={e => setMoveNestedField('drawback', 'stage', Number(e.target.value))} title="Số bậc" placeholder="Bậc" />
											</div>
										)}
									</div>
								</div>
							</div>

							{/* Secondary Effect */}
							<div style={{background: 'var(--bg-01)', padding: '15px', borderRadius: '4px', border: '1px solid var(--border-default)', marginTop: '15px'}}>
								<div style={{fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--accent-blue)', marginBottom: '10px', textTransform: 'uppercase'}}>SECONDARY EFFECT</div>
								<div style={{display: 'flex', gap: '10px', marginBottom: '8px', flexWrap: 'wrap'}}>
									<select className="admin__move-select" style={{flex: 1, minWidth: '200px'}} value={formMove.secondary?.type || 'none'} onChange={e => setMoveNestedField('secondary', 'type', e.target.value)}>
										<option value="none">Không</option>
										<option value="stat">Tăng/Giảm Chỉ Số của Địch hoặc Bản thân</option>
										<option value="volatile">Khống chế (Flinch)</option>
									</select>
									{formMove.secondary?.type !== 'none' && (
										<input type="number" className="admin__input" style={{width: '90px', padding: '6px'}} min={1} max={100} value={formMove.secondary?.chance || 100} onChange={e => setMoveNestedField('secondary', 'chance', Number(e.target.value))} placeholder="Tỉ lệ %" />
									)}
								</div>
								{formMove.secondary?.type === 'stat' && (
									<div style={{display: 'flex', gap: '5px', marginTop: '5px'}}>
										<select className="admin__move-select" style={{padding: '6px', flex: 1}} value={formMove.secondary.target || 'enemy'} onChange={e => setMoveNestedField('secondary', 'target', e.target.value)}>
											<option value="enemy">Kẻ địch</option>
											<option value="self">Bản thân</option>
										</select>
										<select className="admin__move-select" style={{padding: '6px', flex: 1}} value={formMove.secondary.stat || 'def'} onChange={e => setMoveNestedField('secondary', 'stat', e.target.value)}>
											{AVAILABLE_STATS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
										</select>
										<input type="number" className="admin__input" style={{padding: '6px', width: '80px'}} min={-6} max={6} value={formMove.secondary.stage || -1} onChange={e => setMoveNestedField('secondary', 'stage', Number(e.target.value))} title="Số bậc (-/+)" placeholder="Bậc" />
									</div>
								)}
								{formMove.secondary?.type === 'volatile' && (
									<div style={{display: 'flex', gap: '5px', marginTop: '5px'}}>
										<select className="admin__move-select" style={{padding: '6px', flex: 1}} value={formMove.secondary.volatile || 'none'} onChange={e => setMoveNestedField('secondary', 'volatile', e.target.value)}>
											<option value="none">-- Chọn hiệu ứng --</option>
											<option value="flinch">Choáng ngắt chiêu (Flinch) 1 turn</option>
										</select>
									</div>
								)}
							</div>

							<div className="admin__move-field" style={{background: 'rgba(59, 130, 246, 0.1)', padding: '15px', borderLeft: '3px solid var(--accent-blue)', borderRadius: '0 4px 4px 0', marginTop: '20px'}}>
								<label className="admin__move-label" style={{color: 'var(--accent-blue)', fontWeight: 'bold'}}>MÔ TẢ TỰ ĐỘNG (AUTO-GENERATED)</label>
								<div style={{fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginTop: '8px', fontStyle: 'italic', fontWeight: '500'}}>
									"{generateMoveDescription(formMove)}"
								</div>
							</div>
						</div>
					</div>
				)}

				<div className="admin__moves-footer" style={{marginTop: 'auto', paddingTop: '20px', paddingBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
					<button className="btn btn-primary btn-lg" onClick={handleSave} disabled={viewMode === 'brawlers' ? !form.name.trim() : !formMove.name.trim()} style={{width: '100%', maxWidth: '400px'}}>
						{viewMode === 'brawlers'
							? (editingId ? '✓ CẬP NHẬT BRAWLER' : '+ TẠO MỚI BRAWLER')
							: (editingMoveId ? '✓ CẬP NHẬT CHIÊU THỨC' : '+ TẠO MỚI CHIÊU THỨC')
						}
					</button>
					<p className="admin__moves-save-hint" style={{marginTop: '10px'}}>{viewMode === 'brawlers' ? 'Thay đổi sẽ được ghim vào LocalStorage / Tải lên Backend 8001.' : 'Chiêu thức của Hệ thống sẽ chia sẻ cho toàn bộ Tướng.'}</p>
				</div>
			</main>
		</div>
	)
}
