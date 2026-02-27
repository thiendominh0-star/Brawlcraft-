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
	const [connected, setConnected] = useState(false)
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
	}, [navigate, user])

	const handleFindMatch = () => {
		if (status === 'searching') {
			client.cancelSearch()
			setStatus('idle')
			return
		}

		let teamData = []
		try {
			const saved = localStorage.getItem('prototype_team')
			if (saved) teamData = JSON.parse(saved)
		} catch (e) { /* ignore */}

		if (!teamData || teamData.length === 0) {
			alert('Vui lòng tạo đội hình trong Teambuilder trước khi tìm trận!')
			return
		}

		if (!connected) {
			setStatus('connecting')
			client.connect()
		} else {
			setStatus('searching')
			const packedTeam = packTeamForShowdown(teamData)
			client.findBattle('gen9theprototype', packedTeam)
		}
	}

	const handleLogout = () => {
		logout()
		client.disconnect()
		navigate('/login')
	}

	// If rendering before redirect happens
	if (!user) return null

	return (
		<div className="home">
			<div className="home__grid-bg" aria-hidden />
			<div className="home__gradient-orb home__gradient-orb--1" aria-hidden />
			<div className="home__gradient-orb home__gradient-orb--2" aria-hidden />

			<Leaderboard connected={connected} />

			<div className="home__content animate-fadeInUp">
				<header className="home__header">
					<div className="home__logo">
						<span className="home__logo-icon">⚔</span>
					</div>
					<h1 className="home__title font-display">THE PROTOTYPE</h1>
					<p className="home__subtitle">Competitive Battle Arena</p>
				</header>

				{playerName && (
					<div className="home__player-chip animate-fadeIn">
						<span className="home__player-dot" />
						<span>{playerName} {user.isAdmin && <strong style={{color: 'var(--accent-blue)'}}>(Admin)</strong>}</span>
					</div>
				)}

				<div className="home__actions">
					<button
						id="btn-find-match"
						className={`btn btn-primary btn-lg home__find-btn ${status === 'searching' ? 'home__find-btn--searching' : ''}`}
						onClick={handleFindMatch}
						disabled={status === 'connecting'}
					>
						{status === 'idle' && '⚔ FIND MATCH'}
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
