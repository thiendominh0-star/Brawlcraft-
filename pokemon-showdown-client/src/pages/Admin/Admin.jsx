import {useState, useEffect, useRef, useMemo} from 'react'
import {useNavigate} from 'react-router-dom'
import {
	loadRoster, saveRoster, resetRoster, nameToId, createBlankChar, createBlankMove,
	loadMoves, saveMoves,
	AVAILABLE_TYPES, AVAILABLE_CATEGORIES, AVAILABLE_ABILITIES, AVAILABLE_ITEMS, STAT_KEYS, STAT_LABELS, AVAILABLE_STATS
} from '../../services/rosterStore.js'
import {
	loadTowerTemplates, saveTowerTemplates, createBlankTemplate, 
	loadBosses, saveBosses, createBlankBoss,
	loadTowerGlobalConfig, saveTowerGlobalConfig
} from '../../services/towerStore.js'
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

	const [towerTemplates, setTowerTemplates] = useState([])
	const [expandedTemplateId, setExpandedTemplateId] = useState(null) // Accordion state
	const [towerGlobalConfig, setTowerGlobalConfig] = useState({ totalFloors: 10, baseLevel: 10, levelStep: 10 })

	const [bosses, setBosses] = useState([])
	const [editingBossId, setEditingBossId] = useState(null)
	const [formBoss, setFormBoss] = useState(createBlankBoss())

	const [tab, setTab] = useState('info') // For brawler: 'info' | 'moves'
	const [searchMove, setSearchMove] = useState('')
	const [saved, setSaved] = useState(false)

	useEffect(() => {
		setRoster(loadRoster())
		setCustomMoves(loadMoves())
		setTowerTemplates(loadTowerTemplates())
		setBosses(loadBosses())
		setTowerGlobalConfig(loadTowerGlobalConfig())
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

	// --- Tower Logic ---
	const updateTemplate = (id, field, value) => {
		const newTemplates = towerTemplates.map(t => t.id === id ? {...t, [field]: value} : t);
		setTowerTemplates(newTemplates);
		saveTowerTemplates(newTemplates);
	}
	const updateTemplateReward = (id, key, value) => {
		const newTemplates = towerTemplates.map(t => {
			if (t.id === id) return {...t, rewards: {...t.rewards, [key]: value}}
			return t;
		});
		setTowerTemplates(newTemplates);
		saveTowerTemplates(newTemplates);
	}
	const addTemplate = () => {
		const newT = createBlankTemplate();
		newT.id = 'stage_' + Date.now();
		const newTemplates = [...towerTemplates, newT];
		setTowerTemplates(newTemplates);
		saveTowerTemplates(newTemplates);
		setExpandedTemplateId(newT.id);
	}
	const deleteTemplate = (id) => {
		if (!window.confirm('Xóa Khối Màn Chơi này?')) return;
		const newTemplates = towerTemplates.filter(t => t.id !== id);
		setTowerTemplates(newTemplates);
		saveTowerTemplates(newTemplates);
	}
	const toggleBrawlerInTemplate = (templateId, brawlerId) => {
		const newTemplates = towerTemplates.map(t => {
			if (t.id === templateId) {
				const has = t.brawlers.includes(brawlerId);
				const brawlers = has ? t.brawlers.filter(id => id !== brawlerId) : [...t.brawlers, brawlerId];
				return {...t, brawlers};
			}
			return t;
		});
		setTowerTemplates(newTemplates);
		saveTowerTemplates(newTemplates);
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

	const startEditBoss = (b) => {
		setEditingBossId(b.id)
		setFormBoss({...b, moves: Array.isArray(b.moves) ? b.moves : []})
		setTab('info')
	}
	const startNewBoss = () => {
		setEditingBossId(null)
		setFormBoss(createBlankBoss())
		setTab('info')
	}

	const toggleMoveForBrawler = (moveObj) => {
		const hasMove = form.moves.find(m => m.id === moveObj.id)
		if (hasMove) {
			setField('moves', form.moves.filter(m => m.id !== moveObj.id))
		} else {
			setField('moves', [...form.moves, moveObj])
		}
	}
	const toggleMoveForBoss = (moveObj) => {
		const hasMove = formBoss.moves.find(m => m.id === moveObj.id)
		if (hasMove) {
			setFormBoss(f => ({...f, moves: f.moves.filter(m => m.id !== moveObj.id)}))
		} else {
			setFormBoss(f => ({...f, moves: [...(f.moves || []), moveObj]}))
		}
	}

	const handleSave = async () => {
		let newRoster = [...roster]
		let newCustomMoves = [...customMoves]
		let newBosses = [...bosses]

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
		} else if (viewMode === 'moves') {
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
		} else if (viewMode === 'bosses') {
			if (!formBoss.name.trim()) return
			const id = editingBossId || nameToId(formBoss.name)
			let finalBoss = {...formBoss, id, name: formBoss.name.trim()}
			if (editingBossId) {
				newBosses = bosses.map(c => c.id === editingBossId ? finalBoss : c)
			} else {
				if (bosses.find(c => c.id === id)) finalBoss.id = id + Date.now()
				newBosses = [...bosses, finalBoss]
			}
			saveBosses(newBosses)
			setBosses(newBosses)
			startNewBoss()
		}

		setSaved(true)

		// Call backend sync server
		try {
			const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001/sync'
			const res = await fetch(apiUrl, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({
					roster: newRoster, 
					customMoves: newCustomMoves, 
					towerBosses: newBosses,
					towerTemplates,
					towerGlobalConfig
				})
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
					<div style={{display: 'flex', gap: '5px', background: 'var(--bg-01)', padding: '5px', borderRadius: '8px', border: '1px solid var(--border-default)', flexWrap: 'wrap'}}>
						<button className={`btn ${viewMode === 'brawlers' ? 'btn-primary' : 'btn-secondary'}`} style={{flex: 1, padding: '5px', fontSize: '0.85rem'}} onClick={() => {setViewMode('brawlers'); startNewBrawler()}}>Brawlers</button>
						<button className={`btn ${viewMode === 'moves' ? 'btn-primary' : 'btn-secondary'}`} style={{flex: 1, padding: '5px', fontSize: '0.85rem'}} onClick={() => {setViewMode('moves'); startNewMove()}}>Chiêu</button>
						<button className={`btn ${viewMode === 'bosses' ? 'btn-primary' : 'btn-secondary'}`} style={{flex: 1, padding: '5px', fontSize: '0.85rem'}} onClick={() => {setViewMode('bosses'); startNewBoss()}}>Bosses</button>
						<button className={`btn ${viewMode === 'tower' ? 'btn-primary' : 'btn-secondary'}`} style={{flex: 1, padding: '5px', fontSize: '0.85rem'}} onClick={() => setViewMode('tower')}>Tower</button>
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
				) : viewMode === 'bosses' ? (
					<div className="admin__roster-list">
						<div className="admin__roster-header">
							<span className="admin__label">EXCLUSIVE BOSSES ({bosses.length})</span>
							<button className="admin__new-btn" style={{background: '#b91c1c'}} onClick={startNewBoss}>+ FORGE</button>
						</div>
						{bosses.map(char => (
							<div key={char.id} className={`admin__roster-item ${editingBossId === char.id ? 'admin__roster-item--active' : ''}`} onClick={() => startEditBoss(char)}>
								<div className="admin__roster-avatar" style={{background: '#7f1d1d', border: '1px solid #ef4444'}}>
									{char.imageUrl ? <img src={char.imageUrl} alt={char.name} className="admin__roster-img" /> : <span style={{color: '#f87171', fontFamily: 'var(--font-display)', fontWeight: 900}}>{char.name.slice(0, 2).toUpperCase()}</span>}
								</div>
								<div className="admin__roster-info">
									<span className="admin__roster-name" style={{color: '#fca5a5'}}>{char.name} {char.isImmune && '👑'}</span>
									<span className="admin__roster-types">{char.types?.join(' / ')}</span>
								</div>
								<button className="admin__delete-btn" onClick={e => {
									e.stopPropagation();
									if (window.confirm('Hủy diệt Boss này?')) {
										const nb = bosses.filter(b => b.id !== char.id);
										saveBosses(nb);
										setBosses(nb);
										if (editingBossId === char.id) startNewBoss();
									}
								}} title="Xóa">✕</button>
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

				{(viewMode === 'brawlers' || viewMode === 'moves') && <button className="admin__reset-btn" style={{marginTop: 'auto'}} onClick={handleReset}>↺ Reset Default</button>}
			</aside>

			<main className="admin__main">
				<div className="admin__main-header">
					<h2 className="admin__form-title font-display">
						{viewMode === 'brawlers'
							? (editingId ? `EDIT: ${form.name || '...'}` : 'NEW BRAWLER')
							: viewMode === 'moves' ? (editingMoveId ? `EDIT: ${formMove.name || '...'}` : 'NEW CUSTOM MOVE')
								: viewMode === 'bosses' ? (editingBossId ? `FORGE BOSS: ${formBoss.name || '...'}` : 'NEW BOSS')
									: 'TOWER SPIRE BUILDER'
						}
					</h2>
					{saved && <span className="admin__saved-badge">✓ Saved!</span>}

					{(viewMode === 'brawlers' || viewMode === 'bosses') && (
						<div className="admin__tabs">
							<button className={`admin__tab ${tab === 'info' ? 'admin__tab--active' : ''}`} onClick={() => setTab('info')}>◈ Cơ bản</button>
							<button className={`admin__tab ${tab === 'moves' ? 'admin__tab--active' : ''}`} onClick={() => setTab('moves')}>⚔ Kỹ năng ({viewMode === 'bosses' ? formBoss.moves?.length : form.moves?.length || 0}/4)</button>
						</div>
					)}
					{viewMode === 'tower' && (
						<button className="btn btn-primary" onClick={addTemplate}>+ THÊM MÀN CHƠI</button>
					)}
				</div>

				{viewMode === 'tower' ? (
					<div className="admin__tower-accordion animate-fadeInUp" style={{padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', height: '100%', overflowY: 'auto'}}>
						<div style={{background: 'var(--bg-02)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-default)'}}>
							<h3 style={{color: 'var(--accent-blue)', margin: '0 0 10px 0'}}>GLOBAL CONFIG (Công Thức Sinh Tháp)</h3>
							<div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
								<div className="admin__form-group" style={{flex: 1}}>
									<label className="admin__label">Tổng Số Tầng (Floors)</label>
									<input type="number" className="admin__input" value={towerGlobalConfig.totalFloors} onChange={e => {
										const newConfig = {...towerGlobalConfig, totalFloors: Number(e.target.value)}
										setTowerGlobalConfig(newConfig)
										saveTowerGlobalConfig(newConfig)
									}} />
								</div>
								<div className="admin__form-group" style={{flex: 1}}>
									<label className="admin__label">Cấp Độ Bắt Đầu (Base Level)</label>
									<input type="number" className="admin__input" value={towerGlobalConfig.baseLevel} onChange={e => {
										const newConfig = {...towerGlobalConfig, baseLevel: Number(e.target.value)}
										setTowerGlobalConfig(newConfig)
										saveTowerGlobalConfig(newConfig)
									}} />
								</div>
								<div className="admin__form-group" style={{flex: 1}}>
									<label className="admin__label">Cấp Tăng Thêm Mỗi Tầng (Step)</label>
									<input type="number" className="admin__input" value={towerGlobalConfig.levelStep} onChange={e => {
										const newConfig = {...towerGlobalConfig, levelStep: Number(e.target.value)}
										setTowerGlobalConfig(newConfig)
										saveTowerGlobalConfig(newConfig)
									}} />
								</div>
							</div>
						</div>

						{towerTemplates.length === 0 && <div style={{color: 'var(--text-muted)'}}>Chưa có màn chơi nào. Bấm nút + để thêm.</div>}
						{towerTemplates.map((t, idx) => (
							<div key={t.id} className="tower-acc-item" style={{background: 'var(--bg-02)', border: '1px solid var(--border-strong)', borderRadius: '8px', overflow: 'hidden'}}>
								<div className="tower-acc-header" onClick={() => setExpandedTemplateId(expandedTemplateId === t.id ? null : t.id)} style={{padding: '15px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: expandedTemplateId === t.id ? 'var(--bg-03)' : 'transparent', borderBottom: expandedTemplateId === t.id ? '1px solid var(--border-default)' : 'none'}}>
									<div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
										<span style={{fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-primary)'}}>{idx + 1}. {t.name}</span>
										<span style={{background: t.tier === 'boss' ? '#dc2626' : 'var(--accent-blue)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold'}}>{t.tier === 'boss' ? 'BOSS' : `TIER ${t.tier}`}</span>
										<span style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>{t.brawlers.length} Brawlers</span>
									</div>
									<div style={{display: 'flex', gap: '10px'}}>
										<button className="btn btn-secondary" onClick={(e) => {e.stopPropagation(); deleteTemplate(t.id);}}>Xóa</button>
										<span style={{transform: expandedTemplateId === t.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', fontSize: '1.2rem'}}>▼</span>
									</div>
								</div>

								{expandedTemplateId === t.id && (
									<div className="tower-acc-body" style={{padding: '20px'}}>
										<div style={{display: 'flex', gap: '20px', flexWrap: 'wrap'}}>
											{/* Config Cột Trái */}
											<div style={{flex: 1, minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '15px'}}>
												<div className="admin__form-group">
													<label className="admin__label">Tên Màn Chơi</label>
													<input type="text" className="admin__input" value={t.name} onChange={e => updateTemplate(t.id, 'name', e.target.value)} />
												</div>
												<div className="admin__form-group">
													<label className="admin__label">Cụm Phân Nhóm (Tier)</label>
													<select className="admin__input" value={t.tier} onChange={e => updateTemplate(t.id, 'tier', e.target.value === 'boss' ? 'boss' : Number(e.target.value))}>
														<option value={1}>Cụm 1 (Tầng 1-3)</option>
														<option value={2}>Cụm 2 (Tầng 4-6)</option>
														<option value={3}>Cụm 3 (Tầng 7-9)</option>
														<option value={"boss"}>Cụm BOSS</option>
													</select>
												</div>
												<div style={{background: 'var(--bg-01)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-default)'}}>
													<h4 style={{color: '#fbbf24', marginBottom: '10px', fontSize: '0.9rem'}}>REWARDS (PHẦN THƯỞNG)</h4>
													<div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
														<label className="admin__label" style={{margin: 0, width: '80px'}}>EXP Base:</label>
														<input type="number" className="admin__input" style={{flex: 1}} value={t.rewards.exp} onChange={e => updateTemplateReward(t.id, 'exp', Number(e.target.value))} />
													</div>
													<div style={{display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px'}}>
														<label className="admin__label" style={{margin: 0, width: '80px'}}>Loot (%):</label>
														<input type="number" className="admin__input" style={{flex: 1}} value={t.lootChance} onChange={e => updateTemplate(t.id, 'lootChance', Number(e.target.value))} />
													</div>
												</div>
											</div>

											{/* Chọn Tướng Cột Phải */}
											<div style={{flex: 2, minWidth: '300px'}}>
												<label className="admin__label" style={{marginBottom: '10px', display: 'block'}}>ĐỘI HÌNH VỆ SĨ ({t.brawlers.length})</label>
												<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px'}}>
													{roster.map(b => {
														const isSelected = t.brawlers.includes(b.id);
														return (
															<div key={b.id} onClick={() => toggleBrawlerInTemplate(t.id, b.id)} style={{
																padding: '10px', cursor: 'pointer', textAlign: 'center', borderRadius: '8px',
																border: `2px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border-default)'}`,
																background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-01)'
															}}>
																<div style={{fontSize: '2rem', marginBottom: '5px'}}>{b.name.slice(0, 2).toUpperCase()}</div>
																<div style={{fontSize: '0.8rem', fontWeight: 'bold'}}>{b.name}</div>
																{isSelected && <div style={{fontSize: '0.7rem', color: 'var(--accent-blue)', marginTop: '5px'}}>✓ ĐÃ CHỌN</div>}
															</div>
														)
													})}
												</div>
											</div>
										</div>
									</div>
								)}
							</div>
						))}
					</div>
				) : (viewMode === 'brawlers' || viewMode === 'bosses') ? (
					<div className="admin__form-content animate-fadeInUp">
						{tab === 'info' && (
							<div className="admin__form-grid">
								<div className="admin__form-group">
									<label className="admin__label">Name</label>
									<input type="text" className="admin__input" value={viewMode === 'bosses' ? formBoss.name : form.name} onChange={e => {
										if (viewMode === 'bosses') setFormBoss(f => ({...f, name: e.target.value}))
										else setField('name', e.target.value)
									}} placeholder="Tên..." />
								</div>
								<div className="admin__form-group">
									<label className="admin__label">Image URL / Model</label>
									<input type="text" className="admin__input" value={viewMode === 'bosses' ? formBoss.imageUrl : form.imageUrl} onChange={e => {
										if (viewMode === 'bosses') setFormBoss(f => ({...f, imageUrl: e.target.value}))
										else setField('imageUrl', e.target.value)
									}} placeholder="https://..." />
								</div>
								<div className="admin__form-group admin__form-group--full">
									<label className="admin__label">Types (Chọn tối đa 2)</label>
									<div className="admin__types-grid">
										{AVAILABLE_TYPES.map(t => {
											const currentForm = viewMode === 'bosses' ? formBoss : form;
											const hasType = currentForm.types.includes(t);
											return (
												<button key={t} className={`admin__type-btn ${hasType ? `type-${t.toLowerCase()} active` : ''}`} onClick={() => {
													if (viewMode === 'bosses') {
														if (hasType && formBoss.types.length === 1) return;
														setFormBoss(f => ({...f, types: hasType ? f.types.filter(x => x !== t) : [...f.types.slice(0, 1), t]}));
													} else {
														toggleType(t);
													}
												}}>{t}</button>
											)
										})}
									</div>
								</div>
								<div className="admin__form-group">
									<label className="admin__label">Abilities (Đặc tính)</label>
									<div style={{display: 'flex', flexDirection: 'column', gap: '5px'}}>
										{(viewMode === 'bosses' ? formBoss : form).abilities.map((ab, i) => (
											<div key={i} style={{display: 'flex', gap: '5px'}}>
												<select className="admin__input" value={ab} onChange={e => {
													const newAb = [...(viewMode === 'bosses' ? formBoss : form).abilities]
													newAb[i] = e.target.value
													if (viewMode === 'bosses') setFormBoss(f => ({...f, abilities: newAb}))
													else setField('abilities', newAb)
												}}>
													{AVAILABLE_ABILITIES.map(a => <option key={a} value={a}>{a}</option>)}
												</select>
												{(viewMode === 'bosses' ? formBoss : form).abilities.length > 1 && <button className="btn btn-secondary" style={{padding: '5px'}} onClick={() => {
													if (viewMode === 'bosses') setFormBoss(f => ({...f, abilities: f.abilities.filter((_, idx) => idx !== i)}))
													else setField('abilities', form.abilities.filter((_, idx) => idx !== i))
												}}>✕</button>}
											</div>
										))}
										{(viewMode === 'bosses' ? formBoss : form).abilities.length < 3 && <button className="btn btn-secondary" style={{padding: '5px'}} onClick={() => {
											if (viewMode === 'bosses') setFormBoss(f => ({...f, abilities: [...f.abilities, 'No Ability']}))
											else setField('abilities', [...form.abilities, 'No Ability'])
										}}>+ Thêm Slot</button>}
									</div>
								</div>

								{viewMode === 'bosses' && (
									<div className="admin__form-group admin__form-group--full" style={{background: 'rgba(239, 68, 68, 0.1)', padding: '15px', borderRadius: '8px', border: '1px solid #ef4444'}}>
										<label className="admin__label" style={{color: '#f87171'}}>Cơ Chế Khổng Lồ (Exclusive Traits)</label>
										<label style={{display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 'bold'}}>
											<input type="checkbox" checked={formBoss.isImmune} onChange={e => setFormBoss(f => ({...f, isImmune: e.target.checked}))} style={{width: '20px', height: '20px', accentColor: '#dc2626'}} />
											Màng Lọc Vũ Trụ (Miễn Khống Chế, Miễn Trúng Độc, Miễn Choáng)
										</label>
									</div>
								)}

								<div className="admin__form-group admin__form-group--full">
									<label className="admin__label" style={{display: 'flex', justifyContent: 'space-between'}}>
										<span>Base Stats</span>
										<span style={{color: 'var(--text-secondary)'}}>Tổng: {Object.values((viewMode === 'bosses' ? formBoss : form).baseStats).reduce((a, b) => a + b, 0)}</span>
									</label>
									<div className="admin__stats-grid">
										{STAT_KEYS.map(key => (
											<div key={key} className="admin__stat-item">
												<label className="admin__stat-label">{STAT_LABELS[key]}</label>
												<input type="number" min={1} max={viewMode === 'bosses' ? 9999 : 255} className="admin__input admin__stat-input" value={(viewMode === 'bosses' ? formBoss : form).baseStats[key]} onChange={e => {
													const val = Math.max(1, Math.min(viewMode === 'bosses' ? 9999 : 255, Number(e.target.value) || 0))
													if (viewMode === 'bosses') setFormBoss(f => ({...f, baseStats: {...f.baseStats, [key]: val}}))
													else setStat(key, val)
												}} />
											</div>
										))}
									</div>
								</div>
							</div>
						)}

						{tab === 'moves' && (
							<div className="admin__moves" style={{padding: '0'}}>
								<p style={{color: 'var(--text-secondary)', marginBottom: '15px'}}>Click chọn từ kho Kỹ Năng (Custom Moves) bên dưới để làm Vốn chiêu thức cho {(viewMode === 'bosses' ? 'Boss' : 'Brawler')} này. (Chọn được {(viewMode === 'bosses' ? formBoss.moves?.length : form.moves?.length) || 0} / 4 Kỹ năng)</p>
								<div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px'}}>
									{customMoves.map(m => {
										const currentForm = viewMode === 'bosses' ? formBoss : form;
										const isEquipped = currentForm.moves.some(equipped => equipped.id === m.id)
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
												onClick={() => viewMode === 'bosses' ? toggleMoveForBoss(m) : toggleMoveForBrawler(m)}
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
					<button className="btn btn-primary btn-lg" onClick={handleSave} disabled={(viewMode === 'brawlers' && !form.name.trim()) || (viewMode === 'bosses' && !formBoss.name.trim()) || (viewMode === 'moves' && !formMove.name.trim())} style={{width: '100%', maxWidth: '400px'}}>
						{viewMode === 'brawlers'
							? (editingId ? '✓ CẬP NHẬT BRAWLER' : '+ TẠO MỚI BRAWLER')
							: viewMode === 'bosses' ? (editingBossId ? '✓ CẬP NHẬT ĐẠI TRÙM' : '+ ĐÚC ĐẠI TRÙM MỚI')
								: viewMode === 'moves' ? (editingMoveId ? '✓ CẬP NHẬT CHIÊU THỨC' : '+ TẠO MỚI CHIÊU THỨC')
									: '✓ CẬP NHẬT CẤU HÌNH THÁP LÊN SERVER'
						}
					</button>
					<p className="admin__moves-save-hint" style={{marginTop: '10px'}}>{viewMode === 'brawlers' ? 'Thay đổi sẽ được ghim vào LocalStorage / Tải lên Backend 8001.' : viewMode === 'moves' ? 'Chiêu thức của Hệ thống sẽ chia sẻ cho toàn bộ Tướng.' : viewMode === 'bosses' ? 'Trùm Độc Quyền chỉ lưu trong Admin và Tháp, không hiển thị ở Teambuilder.' : 'Nhấn nút lưu để ghi đè công thức Tháp và cấu hình Màn chơi vào Engine Game (Backend).'}</p>
				</div>
			</main>
		</div>
	)
}
