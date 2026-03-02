import {useState, useEffect, useRef} from 'react'
import {useNavigate} from 'react-router-dom'
import CharacterCard from '../../components/shared/CharacterCard.jsx'
import {
	loadRoster, saveRoster, resetRoster, nameToId, createBlankChar, createBlankMove,
	AVAILABLE_TYPES, AVAILABLE_CATEGORIES, AVAILABLE_ABILITIES, AVAILABLE_ITEMS, STAT_KEYS, STAT_LABELS,
} from '../../services/rosterStore.js'
import './Admin.css'

const TYPE_COLOR = {
	Shadow: '#7c3aed', Arcane: '#2563eb', Holy: '#d97706',
	Undead: '#6b7280', Dragon: '#dc2626', Nature: '#16a34a',
}

const CATEGORY_ICON = {Physical: '⚔', Special: '✦', Status: '◎'}

export default function Admin() {
	const navigate = useNavigate()
	const [roster, setRoster] = useState([])
	const [editingId, setEditingId] = useState(null)
	const [form, setForm] = useState(createBlankChar())
	const [tab, setTab] = useState('info')           // 'info' | 'moves'
	const [saved, setSaved] = useState(false)
	const fileInputRef = useRef(null)

	useEffect(() => {setRoster(loadRoster())}, [])

	/* ---- Form helpers ---- */
	const setField = (key, val) => setForm(f => ({...f, [key]: val}))
	const setStat = (stat, val) => setForm(f => ({
		...f, baseStats: {...f.baseStats, [stat]: Math.max(1, Math.min(255, Number(val) || 0))},
	}))
	const toggleType = (t) => setForm(f => {
		const has = f.types.includes(t)
		if (has && f.types.length === 1) return f
		return {...f, types: has ? f.types.filter(x => x !== t) : [...f.types.slice(0, 1), t]}
	})

	/* ---- Moves helpers ---- */
	const getMoves = () => {
		const base = Array.isArray(form.moves) ? form.moves : []
		if (base.length === 0) return [createBlankMove(0)]
		return base
	}

	const setMoveField = (idx, key, val) => {
		const moves = getMoves()
		moves[idx] = {...moves[idx], [key]: val}
		setField('moves', moves)
	}

	const addMove = () => {
		const moves = getMoves()
		if (moves.length >= 10) return
		setField('moves', [...moves, createBlankMove(moves.length)])
	}

	const removeMove = (idx) => {
		const moves = getMoves()
		if (moves.length <= 1) return
		setField('moves', moves.filter((_, i) => i !== idx))
	}

	/* ---- Image ---- */
	const handleFileChange = (e) => {
		const file = e.target.files?.[0]
		if (!file) return
		setField('imageUrl', URL.createObjectURL(file))
	}

	/* ---- Edit / New ---- */
	const startEdit = (char) => {
		setEditingId(char.id)
		setForm({...char, moves: Array.isArray(char.moves) ? char.moves : []})
		setTab('info')
	}

	const startNew = () => {
		setEditingId(null)
		setForm(createBlankChar())
		setTab('info')
	}

	/* ---- Save ---- */
	const handleSave = async () => {
		if (!form.name.trim()) return
		const id = editingId || nameToId(form.name)
		let finalId = id
		const finalChar = {...form, id: finalId, name: form.name.trim(), moves: getMoves()}

		let newRoster
		if (editingId) {
			newRoster = roster.map(c => c.id === editingId ? finalChar : c)
		} else {
			if (roster.find(c => c.id === id)) finalChar.id = id + Date.now()
			newRoster = [...roster, finalChar]
		}

		saveRoster(newRoster)
		setRoster(newRoster)
		setSaved(true)

		// Call backend sync server
		try {
			const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/sync';
			const res = await fetch(apiUrl, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({roster: newRoster})
			})
			const data = await res.json()
			if (!data.success) {
				alert('Lỗi đồng bộ cấu hình Server: ' + data.error)
			}
		} catch (err) {
			console.error('Sync failed', err)
			alert('Không kết nối được Sync Server ở port 8001.')
		}

		setTimeout(() => setSaved(false), 2000)
		startNew()
	}

	/* ---- Delete ---- */
	const handleDelete = (id) => {
		if (!window.confirm('Xóa nhân vật này?')) return
		const newRoster = roster.filter(c => c.id !== id)
		saveRoster(newRoster)
		setRoster(newRoster)
		if (editingId === id) startNew()
	}

	/* ---- Reset ---- */
	const handleReset = () => {
		if (!window.confirm('Reset về danh sách mặc định?')) return
		setRoster(resetRoster())
		startNew()
	}

	const moves = getMoves()

	return (
		<div className="admin">
			{/* ===== Sidebar ===== */}
			<aside className="admin__sidebar">
				<header className="admin__sidebar-header">
					<button className="btn btn-secondary admin__back-btn" onClick={() => navigate('/')}>← Back</button>
					<h1 className="admin__title font-display">ADMIN</h1>
				</header>

				<div className="admin__roster-list">
					<div className="admin__roster-header">
						<span className="admin__label">ROSTER ({roster.length})</span>
						<button className="admin__new-btn" onClick={startNew}>+ NEW</button>
					</div>

					{roster.map(char => (
						<div
							key={char.id}
							className={`admin__roster-item ${editingId === char.id ? 'admin__roster-item--active' : ''}`}
							onClick={() => startEdit(char)}
						>
							<div className="admin__roster-avatar"
								style={{background: `color-mix(in srgb, ${TYPE_COLOR[char.types?.[0]]} 25%, var(--bg-03))`}}
							>
								{char.imageUrl
									? <img src={char.imageUrl} alt={char.name} className="admin__roster-img" />
									: <span style={{color: TYPE_COLOR[char.types?.[0]], fontFamily: 'var(--font-display)', fontWeight: 900}}>
										{char.name.slice(0, 2).toUpperCase()}
									</span>
								}
							</div>
							<div className="admin__roster-info">
								<span className="admin__roster-name">{char.name}</span>
								<span className="admin__roster-types">{char.types?.join(' / ')}</span>
							</div>
							<button className="admin__delete-btn"
								onClick={e => {e.stopPropagation(); handleDelete(char.id)}} title="Xóa">✕</button>
						</div>
					))}
				</div>

				<button className="admin__reset-btn" onClick={handleReset}>↺ Reset Default</button>
			</aside>

			{/* ===== Main ===== */}
			<main className="admin__main">
				<div className="admin__main-header">
					<h2 className="admin__form-title font-display">
						{editingId ? `EDIT: ${form.name || '...'}` : 'NEW CHARACTER'}
					</h2>
					{saved && <span className="admin__saved-badge">✓ Saved!</span>}

					{/* Tab switcher */}
					<div className="admin__tabs">
						<button
							className={`admin__tab ${tab === 'info' ? 'admin__tab--active' : ''}`}
							onClick={() => setTab('info')}
						>◈ Info</button>
						<button
							className={`admin__tab ${tab === 'moves' ? 'admin__tab--active' : ''}`}
							onClick={() => setTab('moves')}
						>⚔ Moves</button>
					</div>
				</div>

				{/* ---- TAB: INFO ---- */}
				{tab === 'info' && (
					<div className="admin__content">
						<form className="admin__form" onSubmit={e => {e.preventDefault(); handleSave()}}>
							{/* Name */}
							<div className="admin__field">
								<label className="admin__field-label">Name *</label>
								<input className="admin__input" type="text" value={form.name}
									onChange={e => setField('name', e.target.value)} placeholder="Tên nhân vật" maxLength={30} />
								{form.name && <span className="admin__field-hint">ID: {nameToId(form.name)}</span>}
							</div>

							{/* Ability */}
							<div className="admin__field">
								<label className="admin__field-label">Pool Đặc Tính (Abilities)</label>
								<div className="admin__type-grid">
									{AVAILABLE_ABILITIES.map(a => (
										<button key={a} type="button"
											className={`admin__type-btn ${form.abilities?.includes(a) ? 'admin__type-btn--active' : ''}`}
											style={{'--tc': '#f59e0b'}}
											onClick={() => {
												const has = form.abilities?.includes(a);
												if (has && form.abilities.length === 1) return;
												const newA = has ? form.abilities.filter(x => x !== a) : [...(form.abilities || []), a];
												setField('abilities', newA);
											}}>{a}</button>
									))}
								</div>
							</div>

							{/* Types */}
							<div className="admin__field">
								<label className="admin__field-label">Types (tối đa 2)</label>
								<div className="admin__type-grid">
									{AVAILABLE_TYPES.map(t => (
										<button key={t} type="button"
											className={`admin__type-btn ${form.types?.includes(t) ? 'admin__type-btn--active' : ''}`}
											style={{'--tc': TYPE_COLOR[t]}} onClick={() => toggleType(t)}>{t}</button>
									))}
								</div>
							</div>

							{/* Base Stats */}
							<div className="admin__field">
								<label className="admin__field-label">Base Stats</label>
								<div className="admin__stats-grid">
									{STAT_KEYS.map(stat => (
										<div key={stat} className="admin__stat-row">
											<label className="admin__stat-label">{STAT_LABELS[stat]}</label>
											<input type="range" min={1} max={255} value={form.baseStats?.[stat] || 0}
												onChange={e => setStat(stat, e.target.value)} className="admin__stat-slider" />
											<input type="number" min={1} max={255} value={form.baseStats?.[stat] || 0}
												onChange={e => setStat(stat, e.target.value)} className="admin__stat-number" />
										</div>
									))}
								</div>
								<div className="admin__bst-total">
									BST: <strong>{Object.values(form.baseStats || {}).reduce((a, b) => a + (b || 0), 0)}</strong>
								</div>
							</div>

							{/* Image */}
							<div className="admin__field">
								<label className="admin__field-label">Avatar (URL hoặc Upload)</label>
								<div className="admin__img-row">
									<input className="admin__input admin__input--url" type="text" value={form.imageUrl}
										onChange={e => setField('imageUrl', e.target.value)} placeholder="https://... hoặc để trống" />
									<button type="button" className="btn btn-secondary admin__upload-btn"
										onClick={() => fileInputRef.current?.click()}>📁 Upload</button>
									<input ref={fileInputRef} type="file" accept="image/*"
										style={{display: 'none'}} onChange={handleFileChange} />
								</div>
								{form.imageUrl && (
									<div className="admin__img-preview">
										<img src={form.imageUrl} alt="preview" onError={() => setField('imageUrl', '')} />
									</div>
								)}
							</div>

							<div className="admin__form-actions">
								<button type="submit" className="btn btn-primary" disabled={!form.name.trim()}>
									{editingId ? '✓ Update' : '+ Add Character'}
								</button>
								{editingId && (
									<button type="button" className="btn btn-secondary" onClick={startNew}>Cancel</button>
								)}
							</div>
						</form>

						{/* Preview */}
						<div className="admin__preview">
							<p className="admin__label">PREVIEW</p>
							<CharacterCard character={{...form, id: form.id || 'preview'}} />
						</div>
					</div>
				)}

				{/* ---- TAB: MOVES ---- */}
				{tab === 'moves' && (
					<div className="admin__moves-container">
						{!editingId && !form.name && (
							<p className="admin__moves-hint">Nhập tên nhân vật ở tab Info trước, sau đó thiết lập Moves.</p>
						)}

						<div className="admin__moves-grid">
							{moves.map((move, idx) => (
								<div
									key={idx}
									className="admin__move-card"
									style={{'--mc': TYPE_COLOR[move.type] || '#3b82f6'}}
								>
									{/* Move slot header */}
									<div className="admin__move-header">
										<span className="admin__move-slot-num">SLOT {idx + 1}</span>
										<div className="admin__move-badges">
											<span className="admin__move-category-badge">
												{CATEGORY_ICON[move.category]} {move.category}
											</span>
											<button className="admin__move-clear" onClick={() => removeMove(idx)} title="Xóa chiêu">✕</button>
										</div>
									</div>

									{/* Move Name */}
									<div className="admin__move-field">
										<label className="admin__move-label">Move Name</label>
										<input
											className="admin__move-input admin__move-input--name"
											type="text" value={move.name} maxLength={30}
											onChange={e => setMoveField(idx, 'name', e.target.value)}
											placeholder={`Chiêu thức ${idx + 1}`}
										/>
									</div>

									<div className="admin__move-row2">
										{/* Type */}
										<div className="admin__move-field">
											<label className="admin__move-label">Type</label>
											<select className="admin__move-select"
												value={move.type} onChange={e => setMoveField(idx, 'type', e.target.value)}
												style={{'--mc': TYPE_COLOR[move.type]}}
											>
												{AVAILABLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
											</select>
										</div>

										{/* Category */}
										<div className="admin__move-field">
											<label className="admin__move-label">Category</label>
											<select className="admin__move-select"
												value={move.category} onChange={e => setMoveField(idx, 'category', e.target.value)}>
												{AVAILABLE_CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICON[c]} {c}</option>)}
											</select>
										</div>
									</div>

									<div className="admin__move-stats">
										{/* Power */}
										<div className="admin__move-stat">
											<label className="admin__move-label">PWR</label>
											<input type="number" min={0} max={250}
												value={move.category === 'Status' ? '—' : move.power}
												disabled={move.category === 'Status'}
												onChange={e => setMoveField(idx, 'power', Number(e.target.value))}
												className="admin__move-stat-input"
											/>
										</div>

										{/* Accuracy */}
										<div className="admin__move-stat">
											<label className="admin__move-label">ACC</label>
											<input type="number" min={1} max={100} value={move.accuracy}
												onChange={e => setMoveField(idx, 'accuracy', Number(e.target.value))}
												className="admin__move-stat-input" />
										</div>

										{/* PP */}
										<div className="admin__move-stat">
											<label className="admin__move-label">PP</label>
											<input type="number" min={1} max={40} value={move.pp}
												onChange={e => setMoveField(idx, 'pp', Number(e.target.value))}
												className="admin__move-stat-input" />
										</div>
									</div>

									{/* Effect / Description */}
									<div className="admin__move-field">
										<label className="admin__move-label">Effect / Ghi chú</label>
										<input className="admin__move-input" type="text" value={move.effect}
											onChange={e => setMoveField(idx, 'effect', e.target.value)}
											placeholder="VD: Raises ATK by 1, May paralyze..." maxLength={80} />
									</div>
								</div>
							))}
						</div>

						{moves.length < 10 && (
							<button type="button" className="btn btn-secondary" onClick={addMove} style={{marginTop: '1rem', width: '100%'}}>
								+ Thêm Chiêu Thức vào Pool ({moves.length}/10)
							</button>
						)}

						{/* Save button */}
						<div className="admin__moves-footer">
							<button className="btn btn-primary" onClick={handleSave} disabled={!form.name.trim()}>
								{editingId ? '✓ Save Moves' : '+ Add Character with Moves'}
							</button>
							<p className="admin__moves-save-hint">Thay đổi sẽ được lưu vào localStorage.</p>
						</div>
					</div>
				)}
			</main>
		</div>
	)
}
