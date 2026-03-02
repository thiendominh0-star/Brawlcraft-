import {useState, useEffect, useCallback, useRef} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useToast} from '../../components/shared/ToastProvider.jsx'
import client from '../../services/showdownClient.js'
import {loadRoster} from '../../services/rosterStore.js'
import './Match.css'

function parseHPText(hpText) {
	if (!hpText || hpText.includes('fnt')) return {hp: 0, maxHp: 0, fainted: true}
	const [a, b] = hpText.split('/')
	return {hp: parseInt(a) || 0, maxHp: parseInt(b) || parseInt(a) || 100, fainted: false}
}

export default function Match() {
	const {roomId} = useParams()
	const navigate = useNavigate()
	const {addToast} = useToast()

	const [myId, setMyId] = useState('') // 'p1' or 'p2'
	const [myTeam, setMyTeam] = useState([]) // Array of pokemon objects
	const [enemyTeam, setEnemyTeam] = useState([])
	const [activeMy, setActiveMy] = useState(null)
	const [activeEnemy, setActiveEnemy] = useState(null)

	const [roster, setRoster] = useState([])
	const [moves, setMoves] = useState([])
	const [turn, setTurn] = useState(0)
	const [waiting, setWaiting] = useState(true)
	const [battleLog, setBattleLog] = useState([])
	const [winner, setWinner] = useState(null)
	const logRef = useRef(null)

	// Animation States
	const [animatingMy, setAnimatingMy] = useState('') // 'attack' | 'hit' | ''
	const [animatingEnemy, setAnimatingEnemy] = useState('') // 'attack' | 'hit' | ''

	const decodedRoomId = decodeURIComponent(roomId)

	const appendLog = useCallback((msg) => {
		setBattleLog(prev => [...prev.slice(-50), msg])
	}, [])

	useEffect(() => {
		const adminRoster = loadRoster();
		let customRoster = [];
		try {
			const j = localStorage.getItem('brawlcraft_customs');
			if (j) customRoster = JSON.parse(j);
		} catch (e) { }
		setRoster([...customRoster, ...adminRoster]);
	}, [])

	useEffect(() => {
		const unsubs = [
			client.on('battle:request', ({roomId: r, request}) => {
				if (r !== decodedRoomId) return
				if (request.side) setMyId(request.side.id) // Get 'p1' or 'p2'

				if (request.active?.length > 0) {
					const activeMoves = request.active[0].moves || []
					setMoves(activeMoves.map((m, i) => ({
						id: m.id || String(i),
						name: m.move || '???',
						type: m.type || 'Normal',
						pp: m.pp,
						maxpp: m.maxpp,
						disabled: m.disabled || false,
					})))
					setWaiting(false)
				} else if (request.forceSwitch) {
					// Need to pick a pokemon to switch
					setWaiting(false)
				}

				if (request.side?.pokemon?.length > 0) {
					const newMyTeam = request.side.pokemon.map(p => {
						const [name] = p.details.split(',')
						const {hp, maxHp, fainted} = parseHPText(p.condition)
						return {ident: p.ident, name: name.trim(), hp, maxHp, fainted, active: p.active}
					})
					setMyTeam(newMyTeam)
					const active = newMyTeam.find(p => p.active)
					if (active) setActiveMy({...active, type: active.name.toLowerCase().replace(/\s+/g, '')})
				}
			}),

			client.on('battle:poke', ({roomId: r, player, details}) => {
				if (r !== decodedRoomId) return
				// We populate enemy team (or my team if request not arrived yet)
				const [name] = details.split(',')
				if (player !== myId) {
					setEnemyTeam(prev => {
						if (prev.find(p => p.name === name.trim())) return prev;
						return [...prev, {name: name.trim(), hp: 100, maxHp: 100, fainted: false, active: false}]
					})
				}
			}),

			client.on('battle:turn', ({roomId: r, turn: t}) => {
				if (r !== decodedRoomId) return
				setTurn(t)
				setWaiting(true)
				appendLog(`── Turn ${t} ──`)
			}),

			client.on('battle:switch', ({roomId: r, pokemon, details, hpText}) => {
				if (r !== decodedRoomId) return
				const isMe = pokemon.startsWith(myId)
				const {hp, maxHp, fainted} = parseHPText(hpText)
				const [rawName] = details.split(',')
				let displayName = rawName.trim()
				let displayType = displayName.toLowerCase().replace(/\s+/g, '')

				if (isMe) {
					setActiveMy({name: displayName, hp, maxHp: maxHp || 100, type: displayType, fainted})
					setMyTeam(prev => prev.map(p => p.name === displayName ? {...p, hp, maxHp, fainted, active: true} : {...p, active: false}))
					appendLog(`Go! ${displayName}!`)
				} else {
					setActiveEnemy({name: displayName, hp, maxHp: maxHp || 100, type: displayType, fainted})
					setEnemyTeam(prev => {
						const existing = prev.find(p => p.name === displayName)
						if (existing) return prev.map(p => p.name === displayName ? {...p, hp, maxHp, fainted, active: true} : {...p, active: false})
						return [...prev.map(p => ({...p, active: false})), {name: displayName, hp, maxHp: maxHp || 100, fainted, active: true}]
					})
					appendLog(`Opponent sent out ${displayName}!`)
				}
			}),

			client.on('battle:damage', ({roomId: r, pokemon, hpText, condition}) => {
				if (r !== decodedRoomId) return
				const isMe = pokemon.startsWith(myId)
				const {hp, maxHp, fainted} = parseHPText(hpText)

				if (isMe) {
					setActiveMy(prev => prev ? {...prev, hp, maxHp: maxHp || prev.maxHp, fainted} : prev)
					setMyTeam(prev => prev.map(p => p.active ? {...p, hp, maxHp: maxHp || p.maxHp, fainted} : p))
					setAnimatingMy('hit')
					setTimeout(() => setAnimatingMy(''), 500)
				} else {
					setActiveEnemy(prev => prev ? {...prev, hp, maxHp: maxHp || prev.maxHp, fainted} : prev)
					setEnemyTeam(prev => prev.map(p => p.active ? {...p, hp, maxHp: maxHp || p.maxHp, fainted} : p))
					setAnimatingEnemy('hit')
					setTimeout(() => setAnimatingEnemy(''), 500)
				}
			}),

			client.on('battle:heal', ({roomId: r, pokemon, hpText}) => {
				if (r !== decodedRoomId) return
				const isMe = pokemon.startsWith(myId)
				const {hp, maxHp, fainted} = parseHPText(hpText)
				if (isMe) {
					setActiveMy(prev => prev ? {...prev, hp, maxHp: maxHp || prev.maxHp, fainted} : prev)
					setMyTeam(prev => prev.map(p => p.active ? {...p, hp, maxHp: maxHp || p.maxHp, fainted} : p))
				} else {
					setActiveEnemy(prev => prev ? {...prev, hp, maxHp: maxHp || prev.maxHp, fainted} : prev)
					setEnemyTeam(prev => prev.map(p => p.active ? {...p, hp, maxHp: maxHp || p.maxHp, fainted} : p))
				}
			}),

			client.on('battle:move', ({roomId: r, pokemon, move}) => {
				if (r !== decodedRoomId) return
				// format: p1a: Name
				const isMe = pokemon.startsWith(myId)
				const nameParts = pokemon.split(' ')
				const name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : pokemon
				appendLog(`${name} used ${move}!`)

				// Trigger Attack Animation
				if (isMe) {
					setAnimatingMy('attack')
					setTimeout(() => setAnimatingMy(''), 500)
				} else {
					setAnimatingEnemy('attack')
					setTimeout(() => setAnimatingEnemy(''), 500)
				}
			}),

			client.on('battle:supereffective', () => {appendLog('It\'s super effective!'); addToast('⚡ Super Effective!', 'crit', 2000)}),
			client.on('battle:resisted', () => {appendLog('Not very effective...')}),
			client.on('battle:crit', () => {appendLog('Critical hit!'); addToast('💥 Critical Hit!', 'crit', 2000)}),

			client.on('battle:faint', ({roomId: r, pokemon}) => {
				if (r !== decodedRoomId) return
				const nameParts = pokemon.split(' ')
				const name = nameParts.length > 1 ? nameParts.slice(1).join(' ') : pokemon
				appendLog(`${name} fainted!`)
				addToast(`☠ ${name} fainted!`, 'faint', 3000)
				const isMe = pokemon.startsWith(myId)
				if (isMe) {
					setActiveMy(prev => prev ? {...prev, fainted: true, hp: 0} : prev)
					setMyTeam(prev => prev.map(p => p.active ? {...p, fainted: true, hp: 0} : p))
				} else {
					setActiveEnemy(prev => prev ? {...prev, fainted: true, hp: 0} : prev)
					setEnemyTeam(prev => prev.map(p => p.active ? {...p, fainted: true, hp: 0} : p))
				}
			}),

			client.on('battle:win', ({roomId: r, winner: w}) => {
				if (r !== decodedRoomId) return
				setWinner(w)
				appendLog(`🏆 ${w} wins!`)
				setWaiting(true)
			})
		]
		return () => unsubs.forEach(u => u?.())
	}, [decodedRoomId, appendLog, addToast, myId])

	useEffect(() => {
		if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
	}, [battleLog])

	const handleAction = useCallback((type, index) => {
		if (waiting) return
		setWaiting(true)
		if (type === 'move') client.makeMove(decodedRoomId, index)
		if (type === 'switch') client.makeSwitch(decodedRoomId, index)
	}, [waiting, decodedRoomId])

	// Lấy Image/Màu từ Roster
	const getCharImage = (name) => {
		const c = roster.find(x => x.name === name)
		return c?.imageUrl || ''
	}
	const getCharType = (name) => {
		const c = roster.find(x => x.name === name)
		return c?.types?.[0] || 'Normal'
	}

	const getTypeColor = (type) => {
		const colors = {
			'Shadow': '#705898', 'Arcane': '#F85888', 'Holy': '#F8D030',
			'Undead': '#705848', 'Dragon': '#7038F8', 'Nature': '#78C850', 'Normal': '#A8A878'
		}
		return colors[type] || colors['Normal']
	}

	return (
		<div style={{minHeight: '100dvh', background: '#333', display: 'flex', flexDirection: 'column', color: '#fff', fontFamily: 'sans-serif'}}>
			{/* Top Bar */}
			<header style={{background: '#1a1a1a', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #555'}}>
				<button onClick={() => navigate('/')} style={{background: '#444', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer'}}>← Surrender / Leave</button>
				<div style={{fontWeight: 'bold', letterSpacing: '2px'}}>{winner ? `🏆 ${winner} WINNER 🏆` : turn > 0 ? `TURN ${turn}` : 'PREPARING BATTLE...'}</div>
				<div style={{width: '120px', textAlign: 'right'}}>{waiting && turn > 0 && !winner ? '🕒 Waiting...' : ''}</div>
			</header>

			{/* 3-Column Layout */}
			<div style={{flex: 1, display: 'flex', overflow: 'hidden'}}>

				{/* Left Column: My Team */}
				<aside style={{width: '250px', background: '#222', borderRight: '1px solid #444', display: 'flex', flexDirection: 'column'}}>
					<div style={{background: '#111', padding: '10px', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #444'}}>MY TEAM</div>
					<div style={{padding: '10px', flex: 1, overflowY: 'auto'}}>
						{myTeam.map((p, i) => (
							<div key={i} style={{display: 'flex', alignItems: 'center', background: p.active ? '#3c5a78' : '#333', margin: '5px 0', padding: '10px', borderRadius: '4px', opacity: p.fainted ? 0.4 : 1}}>
								<div style={{width: '40px', height: '40px', background: '#555', borderRadius: '50%', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', border: `2px solid ${getTypeColor(getCharType(p.name))}`}}>
									{getCharImage(p.name) ? <img src={getCharImage(p.name)} style={{height: '100%'}} /> : <span style={{fontSize: '0.7rem', fontWeight: 'bold'}}>{p.name.slice(0, 3).toUpperCase()}</span>}
								</div>
								<div style={{marginLeft: '10px', flex: 1}}>
									<div style={{fontWeight: 'bold', fontSize: '0.9rem'}}>{p.name} {p.active && '(Active)'}</div>
									<div style={{width: '100%', background: '#111', height: '6px', marginTop: '5px', borderRadius: '3px'}}>
										<div style={{width: `${Math.max(0, (p.hp / p.maxHp) * 100)}%`, background: p.hp / p.maxHp > 0.5 ? '#5cb85c' : p.hp / p.maxHp > 0.2 ? '#f0ad4e' : '#d9534f', height: '100%', borderRadius: '3px'}}></div>
									</div>
									<div style={{fontSize: '0.7rem', color: '#aaa', marginTop: '2px'}}>{p.hp}/{p.maxHp} HP</div>
								</div>
							</div>
						))}
					</div>
				</aside>

				{/* Center Column: Arena & Controls */}
				<main style={{flex: 1, display: 'flex', flexDirection: 'column'}}>
					{/* Arena */}
					<div style={{flex: 1, position: 'relative', background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 50%, #8FBC8F 50%, #2E8B57 100%)', display: 'flex', flexDirection: 'column'}}>

						{/* Enemy Field */}
						<div style={{flex: 1, position: 'relative'}}>
							{activeEnemy && !activeEnemy.fainted && (
								<div style={{position: 'absolute', top: '20%', right: '20%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
									{/* Info Box */}
									<div style={{background: 'rgba(0,0,0,0.7)', padding: '5px 15px', borderRadius: '4px', border: '2px solid #555', minWidth: '200px', marginBottom: '10px'}}>
										<div style={{fontWeight: 'bold', fontSize: '1.2rem', textShadow: '1px 1px 0 #000'}}>{activeEnemy.name}</div>
										<div style={{width: '100%', background: '#333', height: '10px', marginTop: '5px', borderRadius: '5px', overflow: 'hidden', border: '1px solid #111'}}>
											<div style={{width: `${Math.max(0, (activeEnemy.hp / activeEnemy.maxHp) * 100)}%`, background: activeEnemy.hp / activeEnemy.maxHp > 0.5 ? '#5cb85c' : activeEnemy.hp / activeEnemy.maxHp > 0.2 ? '#f0ad4e' : '#d9534f', height: '100%', transition: 'width 0.5s ease-out, background 0.3s'}}></div>
										</div>
										<div style={{textAlign: 'right', fontSize: '0.8rem'}}>{Math.floor((activeEnemy.hp / activeEnemy.maxHp) * 100)}%</div>
									</div>

									{/* Sprite */}
									<div
										className={animatingEnemy === 'attack' ? 'anim-attack-reverse' : animatingEnemy === 'hit' ? 'anim-hit' : ''}
										style={{width: '150px', height: '150px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', filter: 'drop-shadow(0px 10px 5px rgba(0,0,0,0.5))', zIndex: 10}}
									>
										{getCharImage(activeEnemy.name) ? <img src={getCharImage(activeEnemy.name)} style={{maxHeight: '100%'}} /> : <div style={{width: '120px', height: '120px', background: getTypeColor(getCharType(activeEnemy.name)), borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '3px solid #fff', fontSize: '1.5rem', fontWeight: 'bold', color: '#000'}}>{activeEnemy.name.slice(0, 2).toUpperCase()}</div>}
									</div>
								</div>
							)}
						</div>

						{/* My Field */}
						<div style={{flex: 1, position: 'relative'}}>
							{activeMy && !activeMy.fainted && (
								<div style={{position: 'absolute', bottom: '10%', left: '15%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
									{/* Sprite */}
									<div
										className={animatingMy === 'attack' ? 'anim-attack' : animatingMy === 'hit' ? 'anim-hit' : ''}
										style={{width: '180px', height: '180px', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', filter: 'drop-shadow(0px 15px 5px rgba(0,0,0,0.6))', zIndex: 10}}
									>
										{getCharImage(activeMy.name) ? <img src={getCharImage(activeMy.name)} style={{maxHeight: '100%'}} /> : <div style={{width: '140px', height: '140px', background: getTypeColor(getCharType(activeMy.name)), borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '4px solid #fff', fontSize: '2rem', fontWeight: 'bold', color: '#000'}}>{activeMy.name.slice(0, 2).toUpperCase()}</div>}
									</div>

									{/* Info Box */}
									<div style={{background: 'rgba(0,0,0,0.85)', padding: '10px 20px', borderRadius: '4px', border: `3px solid ${getTypeColor(getCharType(activeMy.name))}`, minWidth: '250px', marginTop: '-30px', zIndex: 11, boxShadow: '0 4px 10px rgba(0,0,0,0.5)'}}>
										<div style={{fontWeight: 'bold', fontSize: '1.3rem'}}>{activeMy.name}</div>
										<div style={{width: '100%', background: '#333', height: '12px', marginTop: '8px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #111'}}>
											<div style={{width: `${Math.max(0, (activeMy.hp / activeMy.maxHp) * 100)}%`, background: activeMy.hp / activeMy.maxHp > 0.5 ? '#5cb85c' : activeMy.hp / activeMy.maxHp > 0.2 ? '#f0ad4e' : '#d9534f', height: '100%', transition: 'width 0.5s ease-out, background 0.3s'}}></div>
										</div>
										<div style={{textAlign: 'right', fontSize: '0.9rem', marginTop: '4px'}}>{activeMy.hp} / {activeMy.maxHp} HP</div>
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Action Panel */}
					<div style={{height: '250px', background: '#1e1e1e', borderTop: '2px solid #555', display: 'flex', flexDirection: 'column'}}>
						<div style={{padding: '5px 20px', background: '#111', fontSize: '0.9rem', color: '#ccc', borderBottom: '1px solid #333'}}>What will <b>{activeMy?.name || 'you'}</b> do?</div>

						<div style={{display: 'flex', flex: 1}}>
							{/* Move Grid */}
							<div style={{flex: 2, padding: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '15px', borderRight: '1px solid #333'}}>
								{!waiting && !winner && moves.length > 0 && moves.map((m, i) => (
									<button
										key={m.id}
										disabled={m.disabled}
										onClick={() => handleAction('move', i + 1)}
										style={{background: `linear-gradient(to bottom, ${getTypeColor(m.type)}, #222)`, border: `2px solid ${getTypeColor(m.type)}`, borderRadius: '6px', color: '#fff', fontWeight: 'bold', fontSize: '1.1rem', cursor: m.disabled ? 'not-allowed' : 'pointer', opacity: m.disabled ? 0.5 : 1, display: 'flex', flexDirection: 'column', padding: '10px 15px', justifyContent: 'space-between', boxShadow: 'inset 0 2px 5px rgba(255,255,255,0.2), 0 4px 6px rgba(0,0,0,0.4)'}}
									>
										<div style={{textAlign: 'left'}}>{m.name}</div>
										<div style={{display: 'flex', justifyContent: 'space-between', width: '100%', fontSize: '0.8rem', marginTop: '5px', opacity: 0.9}}>
											<span>{m.type}</span>
											<span>PP: {m.pp}/{m.maxpp}</span>
										</div>
									</button>
								))}
								{waiting && <div style={{gridColumn: '1/3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#888'}}>Waiting for opponent...</div>}
								{winner && <div style={{gridColumn: '1/3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', color: '#888'}}>Battle Finished.</div>}
							</div>

							{/* Switch / Actions */}
							<div style={{flex: 1, padding: '15px', background: '#252525'}}>
								<div style={{fontWeight: 'bold', color: '#aaa', marginBottom: '10px'}}>SWITCH BRAWLER</div>
								<div style={{display: 'flex', flexWrap: 'wrap', gap: '8px'}}>
									{myTeam.map((p, idx) => {
										// Client indexes switches starting from 1 up to 6
										if (p.active) return null;
										return (
											<button
												key={idx}
												disabled={waiting || p.fainted}
												onClick={() => handleAction('switch', idx + 1)}
												style={{width: 'calc(50% - 4px)', padding: '8px', background: p.fainted ? '#444' : '#3c5a78', border: '1px solid #555', color: '#fff', borderRadius: '4px', cursor: (waiting || p.fainted) ? 'not-allowed' : 'pointer', fontSize: '0.8rem', opacity: p.fainted ? 0.5 : 1}}
											>
												<span style={{display: 'block', fontWeight: 'bold'}}>{p.name.slice(0, 6)}..</span>
												<span style={{display: 'block', fontSize: '0.7rem'}}>{p.hp}/{p.maxHp} HP</span>
											</button>
										)
									})}
								</div>
							</div>
						</div>
					</div>
				</main>

				{/* Right Column: Enemy Team & Log */}
				<aside style={{width: '280px', background: '#222', borderLeft: '1px solid #444', display: 'flex', flexDirection: 'column'}}>
					<div style={{background: '#111', padding: '10px', textAlign: 'center', fontWeight: 'bold', borderBottom: '1px solid #444'}}>OPPONENT'S TEAM</div>

					{/* Enemy Slots (Pre-rendered slots if unknown) */}
					<div style={{padding: '10px', display: 'flex', flexWrap: 'wrap', gap: '5px', borderBottom: '1px solid #333'}}>
						{[0, 1, 2, 3, 4, 5].map(i => {
							const p = enemyTeam[i];
							if (p) {
								return (
									<div key={i} title={`${p.name} - ${p.hp}%`} style={{width: '40px', height: '40px', background: p.active ? '#a94442' : '#444', border: `2px solid ${getTypeColor(getCharType(p.name))}`, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '0.6rem', fontWeight: 'bold', opacity: p.fainted ? 0.3 : 1}}>
										{p.name.slice(0, 3).toUpperCase()}
									</div>
								)
							}
							return <div key={i} style={{width: '40px', height: '40px', background: '#333', border: '2px solid #444', borderRadius: '50%'}}></div>
						})}
					</div>

					{/* Log Console */}
					<div style={{flex: 1, display: 'flex', flexDirection: 'column', padding: '10px', overflow: 'hidden'}}>
						<div style={{fontWeight: 'bold', fontSize: '0.8rem', color: '#aaa', marginBottom: '5px'}}>BATTLE LOG</div>
						<div ref={logRef} style={{flex: 1, overflowY: 'auto', background: '#111', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', lineHeight: '1.4', fontFamily: 'monospace', color: '#ddd', scrollBehavior: 'smooth'}}>
							{battleLog.map((log, i) => (
								<div key={i} style={{marginBottom: '4px', color: log.includes('fainted') ? '#d9534f' : log.includes('super effective') ? '#f0ad4e' : log.includes('Turn') ? '#5bc0de' : '#ddd'}}>
									{log}
								</div>
							))}
						</div>
					</div>
				</aside>

			</div>
		</div>
	)
}
