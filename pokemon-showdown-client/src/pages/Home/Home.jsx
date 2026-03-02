import {useState, useEffect, useRef} from 'react'
import {useNavigate} from 'react-router-dom'
import client from '../../services/showdownClient.js'
import {packTeamForShowdown} from '../../services/teamUtils.js'
import {getCurrentUser, logout} from '../../services/authStore.js'
import Leaderboard from './Leaderboard.jsx'
import './Home.css'

const STATUS_LABELS = {
	idle: 'READY',
	connecting: 'CONNECTING...',
	searching: 'FINDING MATCH...',
}

export default function Home() {
	const navigate = useNavigate()
	const user = getCurrentUser()

	const [status, setStatus] = useState('idle')
	const [playerName, setPlayerName] = useState(user ? user.displayName : '')
	const [connected, setConnected] = useState(client.connected || false)
	const [teams, setTeams] = useState([])
	const [selectedTeamId, setSelectedTeamId] = useState('')
	const [selectedFormat, setSelectedFormat] = useState('gen9brawlcraftstandard')
	const cleanups = useRef([])

	useEffect(() => {
		// If not logged in, redirect handled by ProtectedRoute, but just in case
		if (!user) return

		const unsubs = [
			client.on('connected', () => {
				setConnected(true)
				setStatus('idle')
				// Login with displayName
				client.loginAsGuest(user.displayName)
			}),
			client.on('disconnected', () => {
				setConnected(false)
				setStatus('idle')
			}),
			client.on('updateuser', ({name}) => {
				setPlayerName(name)
			}),
			client.on('battle:init', ({roomId}) => {
				navigate(`/battle/${encodeURIComponent(roomId)}`)
			}),
		]
		cleanups.current = unsubs
		return () => unsubs.forEach(u => u?.())
	}, [navigate, user, selectedFormat])

	useEffect(() => {
		// Load teams from localStorage
		try {
			const saved = localStorage.getItem('brawlcraft_teams')
			if (saved) {
				const ts = JSON.parse(saved)
				setTeams(ts)
				if (ts.length > 0) {
					setSelectedTeamId(ts[0].id)
				}
			} else {
				// Fallback if not migrated yet
				const oldSaved = localStorage.getItem('brawlcraft_team')
				if (oldSaved) {
					const ts = [{id: 't1', name: 'My First Team', format: 'gen9brawlcraftstandard', brawlers: JSON.parse(oldSaved)}]
					setTeams(ts)
					setSelectedTeamId('t1')
				} else {
					// AUTO INJECT FOR TESTING
					const ts = [{
						id: 't1', name: 'Test Team', format: 'gen9brawlcraftstandard',
						brawlers: [
							{uid: "1", id: "shadowblade", name: "Shadow Blade", types: ["Shadow"], ability: "Swift Step", item: "Life Orb", moves: [{id: "shadowslash", name: "Shadow Slash", type: "Shadow", category: "Physical", power: 90, accuracy: 100}], baseStats: {hp: 340, atk: 120, def: 80, spa: 70, spd: 75, spe: 110}},
							{uid: "2", id: "arcanesniper", name: "Arcane Sniper", types: ["Arcane"], ability: "Arcane Mastery", item: "Leftovers", moves: [{id: "arcanebolt", name: "Arcane Bolt", type: "Arcane", category: "Special", power: 95, accuracy: 100}], baseStats: {hp: 290, atk: 85, def: 65, spa: 130, spd: 80, spe: 120}},
							{uid: "3", id: "holyknight", name: "Holy Knight", types: ["Holy"], ability: "Thick Hide", item: "Choice Scarf", moves: [{id: "holysmite", name: "Holy Smite", type: "Holy", category: "Physical", power: 85, accuracy: 100}], baseStats: {hp: 420, atk: 105, def: 115, spa: 75, spd: 110, spe: 70}},
							{uid: "4", id: "undeadbrute", name: "Undead Brute", types: ["Undead"], ability: "Berserker", item: "Focus Sash", moves: [{id: "bonecrusher", name: "Bone Crusher", type: "Undead", category: "Physical", power: 100, accuracy: 95}], baseStats: {hp: 480, atk: 135, def: 130, spa: 40, spd: 60, spe: 45}},
							{uid: "5", id: "dragonmage", name: "Dragon Mage", types: ["Dragon", "Arcane"], ability: "Arcane Mastery", item: "Life Orb", moves: [{id: "dragonpulse", name: "Dragon Pulse", type: "Dragon", category: "Special", power: 95, accuracy: 100}], baseStats: {hp: 310, atk: 80, def: 70, spa: 145, spd: 90, spe: 105}},
							{uid: "6", id: "naturegolem", name: "Nature Golem", types: ["Nature"], ability: "Thick Hide", item: "Leftovers", moves: [{id: "rockslam", name: "Rock Slam", type: "Nature", category: "Physical", power: 90, accuracy: 100}], baseStats: {hp: 400, atk: 100, def: 140, spa: 60, spd: 120, spe: 35}}
						]
					}];
					setTeams(ts);
					setSelectedTeamId('t1');
					localStorage.setItem('brawlcraft_teams', JSON.stringify(ts));
				}
			}
		} catch (e) { /* ignore */}

	}, [])

	const handleFindMatch = () => {
		if (status === 'searching') {
			client.cancelSearch()
			setStatus('idle')
			return
		}

		const selectedTeam = teams.find(t => t.id === selectedTeamId)

		if (!selectedTeam || !selectedTeam.brawlers || selectedTeam.brawlers.length === 0) {
			alert('Vui lòng chọn một đội hình hợp lệ trong Teambuilder trước khi tìm trận!')
			return
		}

		if (!connected) {
			setStatus('connecting')
			client.connect()
		} else {
			setStatus('searching')
			const packedTeam = packTeamForShowdown(selectedTeam.brawlers)
			client.findBattle(selectedFormat, packedTeam)
		}
	}

	const handleLogout = () => {
		logout()
		client.disconnect()
		navigate('/login')
	}

	const hasTeam = teams.length > 0 && selectedTeamId !== '' && teams.find(t => t.id === selectedTeamId)?.brawlers?.length > 0

	// If rendering before redirect happens
	if (!user) return null

	return (
		<div className="home">
			<div className="home__grid-bg" aria-hidden />
			<div className="home__gradient-orb home__gradient-orb--1" aria-hidden />
			<div className="home__gradient-orb home__gradient-orb--2" aria-hidden />

			<Leaderboard connected={connected} format={selectedFormat} />

			<div className="home__content animate-fadeInUp">
				<header className="home__header">
					<div className="home__logo">
						<span className="home__logo-icon">⚔</span>
					</div>
					<h1 className="home__title font-display">BRAWLCRAFT</h1>
					<p className="home__subtitle">Competitive Battle Arena</p>
				</header>

				{playerName && (
					<div className="home__player-chip animate-fadeIn">
						<span className="home__player-dot" />
						<span>{playerName} {user.isAdmin && <strong style={{color: 'var(--accent-blue)'}}>(Admin)</strong>}</span>
					</div>
				)}

				<div className="home__actions">
					<div className="home__format-select-wrapper">
						<select
							className="home__format-select"
							value={selectedFormat}
							onChange={e => setSelectedFormat(e.target.value)}
							disabled={status !== 'idle'}
						>
							<option value="gen9brawlcraftstandard">BrawlCraft Standard</option>
							<option value="gen9brawlcraftcustom">BrawlCraft Custom</option>
						</select>

						{/* Team selector */}
						{teams.length > 0 && (
							<select
								className="home__format-select"
								value={selectedTeamId}
								onChange={e => setSelectedTeamId(e.target.value)}
								disabled={status !== 'idle'}
								style={{borderTop: 'none', borderRadius: '0', background: 'var(--bg-02)'}}
							>
								{teams.map(t => (
									<option key={t.id} value={t.id}>{t.name} ({t.brawlers?.length || 0}/6)</option>
								))}
							</select>
						)}
					</div>

					<button
						id="btn-find-match"
						className={`btn btn-primary btn-lg home__find-btn ${status === 'searching' ? 'home__find-btn--searching' : ''}`}
						onClick={handleFindMatch}
						disabled={status === 'connecting'}
					>
						{status === 'idle' && (connected ? '⚔ BATTLE!' : '⚔ FIND MATCH')}
						{status === 'connecting' && '◌ CONNECTING...'}
						{status === 'searching' && '✕ CANCEL SEARCH'}
					</button>

					{!connected && status === 'idle' && (
						<button
							id="btn-connect"
							className="btn btn-secondary"
							onClick={() => {
								setStatus('connecting')
								client.connect()
							}}
						>
							▸ Connect Server
						</button>
					)}

					<button
						id="btn-teambuilder"
						className="btn btn-secondary"
						onClick={() => navigate('/teambuilder')}
					>
						◈ Teambuilder
					</button>

					{user.isAdmin && (
						<button
							id="btn-admin"
							className="btn btn-secondary home__admin-btn"
							onClick={() => navigate('/admin')}
						>
							⚙ Admin
						</button>
					)}

					<button
						id="btn-logout"
						className="btn btn-secondary"
						style={{borderColor: 'var(--accent-red)', color: 'var(--accent-red)'}}
						onClick={handleLogout}
					>
						⍈ Logout
					</button>
				</div>

				{status !== 'idle' && (
					<div className="home__status animate-fadeIn">
						<span className={`home__status-dot home__status-dot--${status}`} />
						<span>{STATUS_LABELS[status]}</span>
					</div>
				)}

				<div className="home__conn-status">
					<span className={`home__conn-dot ${connected ? 'home__conn-dot--on' : ''}`} />
					<span className="home__conn-label">
						{connected ? `Server: localhost:8000` : 'Disconnected'}
					</span>
				</div>
			</div>
		</div>
	)
}
