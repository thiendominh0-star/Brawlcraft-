import {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {loadRoster} from '../../services/rosterStore.js'
import './Teambuilder.css'

export default function Teambuilder() {
	const navigate = useNavigate()
	const [roster, setRoster] = useState([])
	const [teams, setTeams] = useState(() => {
		try {
			const raw = localStorage.getItem('brawlcraft_teams')
			if (raw) return JSON.parse(raw)
			return []
		} catch {return []}
	})

	const [currentTeamId, setCurrentTeamId] = useState(null)
	const [selectingSlot, setSelectingSlot] = useState(null) // 0-5
	const [showBackup, setShowBackup] = useState(false)
	const [backupText, setBackupText] = useState('')
	const [searchQuery, setSearchQuery] = useState('')

	useEffect(() => {
		const adminRoster = loadRoster();
		let customRoster = [];
		try {
			const j = localStorage.getItem('brawlcraft_customs');
			if (j) customRoster = JSON.parse(j);
		} catch (e) { }
		setRoster([...customRoster, ...adminRoster]);
	}, [])

	const saveTeams = (newTeams) => {
		setTeams(newTeams)
		localStorage.setItem('brawlcraft_teams', JSON.stringify(newTeams))
	}

	const createNewTeam = () => {
		const newTeam = {
			id: `team_${Date.now()}`,
			name: `Untitled ${teams.length + 1}`,
			format: 'gen9brawlcraftstandard',
			brawlers: []
		}
		const updated = [...teams, newTeam]
		saveTeams(updated)
		setCurrentTeamId(newTeam.id)
	}

	const deleteTeam = (id, e) => {
		e.stopPropagation()
		if (!window.confirm('Delete this team?')) return
		saveTeams(teams.filter(t => t.id !== id))
	}

	const duplicateTeam = (t, e) => {
		e.stopPropagation()
		const clone = JSON.parse(JSON.stringify(t))
		clone.id = `team_${Date.now()}`
		clone.name = clone.name + ' (Copy)'
		saveTeams([...teams, clone])
	}

	const activeTeam = teams.find(t => t.id === currentTeamId)

	const updateActiveTeam = (updates) => {
		const newTeams = teams.map(t => t.id === currentTeamId ? {...t, ...updates} : t)
		saveTeams(newTeams)
	}

	const handleSelectBrawler = (char) => {
		const newBrawler = {
			id: char.id,
			uid: Date.now().toString(),
			name: char.name,
			item: '',
			ability: char.abilities?.[0] || 'No Ability',
			moves: []
		}

		let currentBrawlers = [...activeTeam.brawlers]
		currentBrawlers[selectingSlot] = newBrawler
		updateActiveTeam({brawlers: currentBrawlers})
		setSelectingSlot(null)
	}

	const updateBrawler = (index, updates) => {
		let currentBrawlers = [...activeTeam.brawlers]
		currentBrawlers[index] = {...currentBrawlers[index], ...updates}
		updateActiveTeam({brawlers: currentBrawlers})
	}

	const updateBrawlerMove = (brawlerIndex, moveIndex, moveId) => {
		const brawler = activeTeam.brawlers[brawlerIndex]
		const charData = roster.find(c => c.id === brawler.id)
		const moveData = charData.moves.find(m => m.id === moveId)

		let newMoves = [...brawler.moves]
		if (moveData) {
			newMoves[moveIndex] = moveData
		} else {
			newMoves.splice(moveIndex, 1) // Remove
		}
		updateBrawler(brawlerIndex, {moves: newMoves})
	}

	const removeBrawler = (index) => {
		if (!window.confirm('Remove this Brawler?')) return
		let currentBrawlers = [...activeTeam.brawlers]
		currentBrawlers.splice(index, 1)
		updateActiveTeam({brawlers: currentBrawlers})
	}

	// View: Backup/Restore Modal
	if (showBackup) {
		return (
			<div className="teambuilder">
				<header className="teambuilder__header">
					<button className="btn btn-secondary" onClick={() => setShowBackup(false)}>← Back</button>
					<h1 className="teambuilder__title font-display">Backup / Restore</h1>
				</header>
				<div style={{padding: '20px', maxWidth: '800px', margin: '0 auto', color: 'white'}}>
					<p>Copy text below to backup, or paste valid JSON array to restore:</p>
					<textarea
						style={{width: '100%', height: '300px', background: 'var(--bg-02)', color: 'var(--text-primary)', padding: '10px', fontFamily: 'monospace'}}
						value={backupText || JSON.stringify(teams)}
						onChange={e => setBackupText(e.target.value)}
					/>
					<div style={{marginTop: '20px', display: 'flex', gap: '10px'}}>
						<button className="btn btn-success" onClick={() => {
							try {
								const parsed = JSON.parse(backupText)
								if (Array.isArray(parsed)) {
									saveTeams(parsed)
									alert('Teams restored successfully!')
									setShowBackup(false)
								} else throw new Error()
							} catch (e) {
								alert('Invalid format. Must be JSON array of teams.')
							}
						}}>Save Restored Teams</button>
					</div>
				</div>
			</div>
		)
	}

	// View: Roster Selection Mode
	if (selectingSlot !== null) {
		const filteredRoster = roster.filter(char => char.name.toLowerCase().includes(searchQuery.toLowerCase()))

		return (
			<div className="teambuilder">
				<header className="teambuilder__header" style={{display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap'}}>
					<div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
						<button className="btn btn-secondary" onClick={() => {setSelectingSlot(null); setSearchQuery('');}}>← Cancel</button>
						<h1 className="teambuilder__title font-display" style={{margin: 0}}>Select a Brawler</h1>
					</div>
					<input
						className="admin__input"
						type="text"
						placeholder="🔍 Search hero by name..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						style={{marginLeft: 'auto', width: '100%', maxWidth: '300px', padding: '10px', flex: '1 1 200px'}}
					/>
				</header>
				<div className="tb-roster-grid" style={{padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px'}}>
					{filteredRoster.map(char => (
						<div key={char.id} className="tb-roster-card" onClick={() => {handleSelectBrawler(char); setSearchQuery('');}}>
							<div className="tb-avatar" style={{background: 'var(--bg-03)', padding: '10px', borderRadius: '4px', textAlign: 'center', cursor: 'pointer'}}>
								<h3 style={{color: 'var(--accent-purple)', margin: 0}}>{char.name}</h3>
								<div style={{fontSize: '0.8rem', color: '#999'}}>{char.types.join('/')}</div>
							</div>
						</div>
					))}
					{filteredRoster.length === 0 && (
						<div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--text-muted)'}}>
							No brawlers found matching "{searchQuery}"
						</div>
					)}
				</div>
			</div>
		)
	}

	// View: Team List Mode
	if (!currentTeamId) {
		return (
			<div className="teambuilder">
				<header className="teambuilder__header">
					<button className="btn btn-secondary" onClick={() => navigate('/')}>
						🏠 Home
					</button>
					<h1 className="teambuilder__title font-display">Teambuilder</h1>
				</header>
				<div className="tb-list-container" style={{padding: '20px', maxWidth: '800px', margin: '0 auto', width: '100%'}}>
					<h2 style={{marginBottom: '15px'}}>All teams ({teams.length})</h2>
					<div style={{display: 'flex', gap: '10px', marginBottom: '20px'}}>
						<button className="btn btn-primary" onClick={createNewTeam}>
							<b>+</b> New Team
						</button>
					</div>

					<div className="tb-team-rows">
						{teams.map(t => (
							<div key={t.id} className="tb-team-row" style={{display: 'flex', alignItems: 'stretch', background: 'var(--bg-02)', border: '1px solid var(--border-default)', borderRadius: '4px', marginBottom: '10px', overflow: 'hidden'}}>
								<div style={{flex: 1, padding: '10px', cursor: 'pointer', transition: 'background 0.2s'}} onClick={() => setCurrentTeamId(t.id)} title="Click to edit">
									<div style={{fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--accent-blue)'}}>[{t.format}] {t.name}</div>
									<div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
										{t.brawlers.map((b, i) => (
											<div key={i} style={{fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{b.name.slice(0, 3).toUpperCase()}</div>
										))}
									</div>
								</div>
								<div style={{display: 'flex', alignItems: 'center', background: 'var(--bg-03)', borderLeft: '1px solid var(--border-default)', padding: '0 10px', gap: '10px'}}>
									<button onClick={(e) => duplicateTeam(t, e)} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem'}} title="Duplicate">📋</button>
									<button onClick={(e) => deleteTeam(t.id, e)} style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem'}} title="Delete">🗑</button>
								</div>
							</div>
						))}
					</div>

					<div style={{marginTop: '30px', borderTop: '2px dotted var(--border-strong)', paddingTop: '20px'}}>
						<p style={{fontSize: '0.9rem', color: 'var(--text-muted)'}}>Clearing your cookies (specifically, <code>localStorage</code>) will delete your teams. Backup to be sure you don't lose them.</p>
						<button className="btn btn-secondary" onClick={() => {setBackupText(''); setShowBackup(true)}}>
							Backup/Restore all teams
						</button>
					</div>
				</div>
			</div>
		)
	}

	// View: Team Edit Mode (Roster)
	return (
		<div className="teambuilder">
			<header className="teambuilder__header">
				<button className="btn btn-secondary" onClick={() => setCurrentTeamId(null)}>
					← List
				</button>
				<input
					className="admin__input"
					type="text"
					value={activeTeam.name}
					onChange={e => updateActiveTeam({name: e.target.value})}
					style={{marginLeft: '10px', width: '250px'}}
				/>
				<button
					className="btn btn-primary"
					onClick={() => navigate('/craft')}
					style={{marginLeft: 'auto', marginRight: '20px'}}
				>
					⚒ CRAFT BRAWLER
				</button>
			</header>

			<div className="tb-builder-body" style={{padding: '20px', maxWidth: '1000px', margin: '0 auto', width: '100%'}}>
				<div style={{marginBottom: '20px'}}>
					<label style={{fontWeight: 'bold', marginRight: '10px', color: 'var(--text-primary)'}}>Format:</label>
					<select className="admin__input" value={activeTeam.format} onChange={e => updateActiveTeam({format: e.target.value})} style={{width: '250px'}}>
						<option value="gen9brawlcraftstandard">BrawlCraft Standard</option>
						<option value="gen9brawlcraftcustom">BrawlCraft Custom</option>
					</select>
				</div>

				<div className="tb-team-slots">
					{activeTeam.brawlers.map((brawler, index) => {
						const charData = roster.find(c => c.id === brawler.id)
						if (!charData) return null
						const maxHP = charData.baseStats.hp;
						const stats = charData.baseStats;

						return (
							<div key={brawler.uid} className="tb-slot-row" style={{background: 'var(--bg-02)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '15px', marginBottom: '15px', display: 'flex', gap: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.5)'}}>
								{/* Avatar & Basic Info */}
								<div style={{width: '200px'}}>
									<input className="admin__input" value={brawler.name} onChange={e => updateBrawler(index, {name: e.target.value})} style={{width: '100%', marginBottom: '10px'}} />
									<div onClick={() => setSelectingSlot(index)} style={{height: '120px', background: 'var(--bg-01)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '1px solid var(--border-subtle)', borderRadius: '4px', overflow: 'hidden'}}>
										{charData.imageUrl ? <img src={charData.imageUrl} alt={charData.name} style={{maxHeight: '100%', maxWidth: '100%', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.1))'}} /> : <span style={{fontWeight: '900', fontSize: '1.5rem', color: 'var(--accent-blue)', fontFamily: 'var(--font-display)', letterSpacing: '0.1em'}}>{charData.name.slice(0, 3).toUpperCase()}</span>}
									</div>
								</div>

								{/* Middle: Details, Item, Ability */}
								<div style={{display: 'flex', flexDirection: 'column', gap: '10px', width: '220px'}}>
									<div style={{flex: 1, border: '1px solid var(--border-subtle)', padding: '8px', borderRadius: '4px', background: 'var(--bg-03)', fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
										<div><b style={{color: 'var(--text-primary)'}}>Types:</b> {charData.types.join(' / ')}</div>
									</div>
									<div style={{display: 'flex', gap: '10px'}}>
										<div style={{flex: 1}}>
											<label style={{fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase'}}>Item</label>
											<input className="admin__input" type="text" value={brawler.item} onChange={e => updateBrawler(index, {item: e.target.value})} style={{width: '100%', padding: '6px'}} placeholder="e.g. Life Orb" />
										</div>
										<div style={{flex: 1}}>
											<label style={{fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase'}}>Ability</label>
											<select className="admin__input" value={brawler.ability} onChange={e => updateBrawler(index, {ability: e.target.value})} style={{width: '100%', padding: '6px'}}>
												{charData.abilities && charData.abilities.map(a => <option key={a} value={a}>{a}</option>)}
												{(!charData.abilities || charData.abilities.length === 0) && <option value="No Ability">No Ability</option>}
											</select>
										</div>
									</div>
								</div>

								{/* Moves */}
								<div style={{width: '200px'}}>
									<label style={{fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase'}}>Moves</label>
									<div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
										{[0, 1, 2, 3].map(mIdx => (
											<select className="admin__input" key={mIdx} value={brawler.moves[mIdx]?.id || ''} onChange={(e) => updateBrawlerMove(index, mIdx, e.target.value)} style={{padding: '6px'}}>
												<option value="">- Select move -</option>
												{charData.moves.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
											</select>
										))}
									</div>
								</div>

								{/* Stats */}
								<div style={{flex: 1, position: 'relative'}}>
									<button style={{position: 'absolute', top: -5, right: -5}} className="teambuilder__remove-btn" onClick={() => removeBrawler(index)}>✕</button>
									<label style={{fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)', textTransform: 'uppercase'}}>Stats</label>
									<div style={{fontSize: '0.8rem', marginTop: '8px'}}>
										<div style={{display: 'flex', marginBottom: '4px', alignItems: 'center'}}><div style={{width: '35px', color: 'var(--text-secondary)', fontWeight: 'bold'}}>HP</div><div style={{flex: 1, background: 'var(--bg-01)', height: '8px', borderRadius: '4px', overflow: 'hidden'}}><div style={{width: `${Math.min(100, (stats.hp / 255) * 100)}%`, background: 'var(--hp-high)', height: '100%'}}></div></div><div style={{width: '35px', textAlign: 'right', color: 'var(--text-primary)'}}>{stats.hp}</div></div>
										<div style={{display: 'flex', marginBottom: '4px', alignItems: 'center'}}><div style={{width: '35px', color: 'var(--text-secondary)', fontWeight: 'bold'}}>Atk</div><div style={{flex: 1, background: 'var(--bg-01)', height: '8px', borderRadius: '4px', overflow: 'hidden'}}><div style={{width: `${Math.min(100, (stats.atk / 255) * 100)}%`, background: 'var(--hp-medium)', height: '100%'}}></div></div><div style={{width: '35px', textAlign: 'right', color: 'var(--text-primary)'}}>{stats.atk}</div></div>
										<div style={{display: 'flex', marginBottom: '4px', alignItems: 'center'}}><div style={{width: '35px', color: 'var(--text-secondary)', fontWeight: 'bold'}}>Def</div><div style={{flex: 1, background: 'var(--bg-01)', height: '8px', borderRadius: '4px', overflow: 'hidden'}}><div style={{width: `${Math.min(100, (stats.def / 255) * 100)}%`, background: 'var(--hp-medium)', height: '100%'}}></div></div><div style={{width: '35px', textAlign: 'right', color: 'var(--text-primary)'}}>{stats.def}</div></div>
										<div style={{display: 'flex', marginBottom: '4px', alignItems: 'center'}}><div style={{width: '35px', color: 'var(--text-secondary)', fontWeight: 'bold'}}>SpA</div><div style={{flex: 1, background: 'var(--bg-01)', height: '8px', borderRadius: '4px', overflow: 'hidden'}}><div style={{width: `${Math.min(100, (stats.spa / 255) * 100)}%`, background: 'var(--accent-cyan)', height: '100%'}}></div></div><div style={{width: '35px', textAlign: 'right', color: 'var(--text-primary)'}}>{stats.spa}</div></div>
										<div style={{display: 'flex', marginBottom: '4px', alignItems: 'center'}}><div style={{width: '35px', color: 'var(--text-secondary)', fontWeight: 'bold'}}>SpD</div><div style={{flex: 1, background: 'var(--bg-01)', height: '8px', borderRadius: '4px', overflow: 'hidden'}}><div style={{width: `${Math.min(100, (stats.spd / 255) * 100)}%`, background: 'var(--accent-cyan)', height: '100%'}}></div></div><div style={{width: '35px', textAlign: 'right', color: 'var(--text-primary)'}}>{stats.spd}</div></div>
										<div style={{display: 'flex', marginBottom: '4px', alignItems: 'center'}}><div style={{width: '35px', color: 'var(--text-secondary)', fontWeight: 'bold'}}>Spe</div><div style={{flex: 1, background: 'var(--bg-01)', height: '8px', borderRadius: '4px', overflow: 'hidden'}}><div style={{width: `${Math.min(100, (stats.spe / 255) * 100)}%`, background: 'var(--accent-purple)', height: '100%'}}></div></div><div style={{width: '35px', textAlign: 'right', color: 'var(--text-primary)'}}>{stats.spe}</div></div>
									</div>
								</div>
							</div>
						)
					})}

					{activeTeam.brawlers.length < 6 && (
						<button style={{width: '100%', padding: '20px', background: 'var(--bg-02)', border: '2px dashed var(--border-strong)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: 'var(--text-secondary)', fontSize: '1.2rem', transition: 'all 0.2s', ...({':hover': {background: 'var(--bg-03)', borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)'}})}} onClick={() => setSelectingSlot(activeTeam.brawlers.length)} className="tb-add-brawler-btn">
							+ ADD BRAWLER SLOT
						</button>
					)}
				</div>
			</div>
		</div>
	)
}
