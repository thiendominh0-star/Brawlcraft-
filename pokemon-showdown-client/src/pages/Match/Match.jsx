import {useState, useEffect, useCallback, useRef} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import HPBar from '../../components/battle/HPBar.jsx'
import MovePanel from '../../components/battle/MovePanel.jsx'
import {useToast} from '../../components/shared/ToastProvider.jsx'
import client from '../../services/showdownClient.js'
import './Match.css'

const DEFAULT_POKEMON_STATE = {
	name: '???',
	hp: 100,
	maxHp: 100,
	type: 'shadow',
	moves: [],
}

function parseHPText(hpText) {
	// Format: "241/341" or "0 fnt"
	if (!hpText || hpText.includes('fnt')) return {hp: 0, maxHp: 0}
	const [a, b] = hpText.split('/')
	return {hp: parseInt(a) || 0, maxHp: parseInt(b) || parseInt(a) || 100}
}

export default function Match() {
	const {roomId} = useParams()
	const navigate = useNavigate()
	const {addToast} = useToast()

	const [myPokemon, setMyPokemon] = useState({...DEFAULT_POKEMON_STATE, name: 'Waiting...'})
	const [enemyPokemon, setEnemyPokemon] = useState({...DEFAULT_POKEMON_STATE, name: 'Waiting...'})
	const [moves, setMoves] = useState([])
	const [turn, setTurn] = useState(0)
	const [waiting, setWaiting] = useState(true)  // Chờ server request
	const [battleLog, setBattleLog] = useState([])
	const [winner, setWinner] = useState(null)
	const logRef = useRef(null)

	const decodedRoomId = decodeURIComponent(roomId)

	const appendLog = useCallback((msg) => {
		setBattleLog(prev => [...prev.slice(-50), msg])
	}, [])

	useEffect(() => {
		const unsubs = [
			// Server gửi yêu cầu chọn chiêu thức
			client.on('battle:request', ({roomId: r, request}) => {
				if (r !== decodedRoomId) return

				if (request.active?.length > 0) {
					const activeMoves = request.active[0].moves || []
					setMoves(activeMoves.map((m, i) => ({
						id: m.id || `move${i}`,
						name: m.move || '???',
						type: m.type || '???',
						category: m.category || 'Physical',
						pp: m.pp,
						maxpp: m.maxpp,
						disabled: m.disabled || false,
					})))
					setWaiting(false)
				}

				// Cập nhật tên nhân vật của mình
				if (request.side?.pokemon?.length > 0) {
					const active = request.side.pokemon.find(p => p.active)
					if (active) {
						const [name] = active.details.split(',')
						const [hp, maxHp] = (active.condition?.split('/') || ['100', '100'])
						setMyPokemon(prev => ({
							...prev,
							name,
							hp: parseInt(hp) || 0,
							maxHp: parseInt(maxHp) || 100,
							type: name.toLowerCase().replace(/\s+/g, ''),
						}))
					}
				}
			}),

			// Turn mới
			client.on('battle:turn', ({roomId: r, turn: t}) => {
				if (r !== decodedRoomId) return
				setTurn(t)
				setWaiting(true)
				appendLog(`── Turn ${t} ──`)
			}),

			// Damage
			client.on('battle:damage', ({roomId: r, pokemon, hpText}) => {
				if (r !== decodedRoomId) return
				const {hp, maxHp} = parseHPText(hpText)
				const isEnemy = pokemon.startsWith('p2')
				if (isEnemy) {
					setEnemyPokemon(prev => ({...prev, hp, maxHp: maxHp || prev.maxHp}))
				} else {
					setMyPokemon(prev => ({...prev, hp, maxHp: maxHp || prev.maxHp}))
				}
			}),

			// Switch
			client.on('battle:switch', ({roomId: r, pokemon, details, hpText}) => {
				if (r !== decodedRoomId) return
				const isEnemy = pokemon.startsWith('p2')
				const {hp, maxHp} = parseHPText(hpText)

				const [rawName] = details.split(',')
				let displayName = rawName
				let displayType = 'normal'

				if (rawName.startsWith('C-')) {
					const parts = rawName.split('-')
					if (parts.length >= 9) {
						displayName = parts[1]
						displayType = parts[8].toLowerCase()
					}
				} else {
					displayType = rawName.toLowerCase().replace(/\s+/g, '')
				}

				if (isEnemy) {
					setEnemyPokemon(prev => ({...prev, name: displayName, hp, maxHp: maxHp || prev.maxHp, type: displayType}))
					appendLog(`Opponent sent out ${displayName}!`)
				} else {
					setMyPokemon(prev => ({...prev, name: displayName, hp, maxHp: maxHp || prev.maxHp, type: displayType}))
					appendLog(`Go! ${displayName}!`)
				}
			}),

			// Heal
			client.on('battle:heal', ({roomId: r, pokemon, hpText}) => {
				if (r !== decodedRoomId) return
				const {hp, maxHp} = parseHPText(hpText)
				const isEnemy = pokemon.startsWith('p2')
				if (isEnemy) {
					setEnemyPokemon(prev => ({...prev, hp, maxHp: maxHp || prev.maxHp}))
				} else {
					setMyPokemon(prev => ({...prev, hp, maxHp: maxHp || prev.maxHp}))
				}
			}),

			// Move used
			client.on('battle:move', ({roomId: r, pokemon, move}) => {
				if (r !== decodedRoomId) return
				appendLog(`${pokemon} used ${move}`)
			}),

			// Super effective
			client.on('battle:supereffective', ({roomId: r}) => {
				if (r !== decodedRoomId) return
				appendLog('It\'s super effective!')
				addToast('⚡ Super Effective!', 'crit', 2000)
			}),

			// Resisted
			client.on('battle:resisted', ({roomId: r}) => {
				if (r !== decodedRoomId) return
				appendLog('Not very effective...')
			}),

			// Crit
			client.on('battle:crit', ({roomId: r}) => {
				if (r !== decodedRoomId) return
				appendLog('Critical hit!')
				addToast('💥 Critical Hit!', 'crit', 2000)
			}),

			// Enemy name from move log
			client.on('battle:move', ({roomId: r, pokemon, move}) => {
				if (r !== decodedRoomId) return
				if (pokemon.startsWith('p2a:')) {
					const name = pokemon.replace('p2a: ', '')
					setEnemyPokemon(prev => ({...prev, name}))
				}
			}),

			// Faint
			client.on('battle:faint', ({roomId: r, pokemon}) => {
				if (r !== decodedRoomId) return
				appendLog(`${pokemon} fainted!`)
				addToast(`☠ ${pokemon} fainted!`, 'faint', 3000)
			}),

			// Winner
			client.on('battle:win', ({roomId: r, winner: w}) => {
				if (r !== decodedRoomId) return
				setWinner(w)
				appendLog(`🏆 ${w} wins!`)
			}),
		]

		return () => unsubs.forEach(u => u?.())
	}, [decodedRoomId, appendLog, addToast])

	// Auto-scroll log
	useEffect(() => {
		if (logRef.current) {
			logRef.current.scrollTop = logRef.current.scrollHeight
		}
	}, [battleLog])

	const handleMove = useCallback((moveIndex) => {
		if (waiting) return
		setWaiting(true)
		client.makeMove(decodedRoomId, moveIndex)
	}, [waiting, decodedRoomId])

	return (
		<div className="match">
			{/* Top bar */}
			<header className="match__topbar">
				<button className="btn btn-secondary match__leave-btn" onClick={() => navigate('/')}>
					← Leave
				</button>
				<div className="match__turn-info font-display">
					{winner ? `🏆 ${winner} wins!` : turn > 0 ? `TURN ${turn}` : 'BATTLE START'}
				</div>
				<div className="match__waiting-badge">
					{waiting && !winner ? (
						<span className="match__waiting-dot" />
					) : null}
				</div>
			</header>

			{/* Arena */}
			<div className="match__arena">
				{/* Decorative grid */}
				<div className="match__arena-grid" aria-hidden />

				{/* Enemy side (top) */}
				<div className="match__side match__side--enemy animate-slideRight">
					<div className="match__fighter match__fighter--enemy">
						<div
							className="match__fighter-avatar"
							style={{'--fc': 'var(--type-arcane)'}}
						>
							<span>{enemyPokemon.name.slice(0, 2).toUpperCase()}</span>
							<div className="match__fighter-glow" />
						</div>
					</div>
					<div className="match__hpbar-wrap">
						<HPBar
							hp={enemyPokemon.hp}
							maxHp={enemyPokemon.maxHp}
							name={enemyPokemon.name}
							type={enemyPokemon.type}
							isPlayer={false}
						/>
					</div>
				</div>

				{/* VS divider */}
				<div className="match__vs-line" aria-hidden>
					<div className="match__vs-dot" />
				</div>

				{/* Player side (bottom) */}
				<div className="match__side match__side--player animate-fadeInUp">
					<div className="match__hpbar-wrap">
						<HPBar
							hp={myPokemon.hp}
							maxHp={myPokemon.maxHp}
							name={myPokemon.name}
							type={myPokemon.type}
							isPlayer={true}
						/>
					</div>
					<div className="match__fighter match__fighter--player">
						<div
							className="match__fighter-avatar match__fighter-avatar--player"
							style={{'--fc': 'var(--type-shadow)'}}
						>
							<span>{myPokemon.name.slice(0, 2).toUpperCase()}</span>
							<div className="match__fighter-glow" />
						</div>
					</div>
				</div>
			</div>

			{/* Battle Log */}
			<div className="match__log panel" ref={logRef}>
				{battleLog.length === 0 ? (
					<span className="match__log-empty">Battle log will appear here...</span>
				) : (
					battleLog.map((line, i) => (
						<p key={i} className={`match__log-line ${line.startsWith('──') ? 'match__log-line--turn' : ''}`}>
							{line}
						</p>
					))
				)}
			</div>

			{/* Move Panel */}
			{!winner ? (
				<MovePanel
					moves={moves}
					onMove={handleMove}
					disabled={waiting}
				/>
			) : (
				<div className="match__over-panel">
					<p className="match__over-text font-display">🏆 {winner} WINS</p>
					<button className="btn btn-primary" onClick={() => navigate('/')}>
						→ Back to Lobby
					</button>
				</div>
			)}
		</div>
	)
}
