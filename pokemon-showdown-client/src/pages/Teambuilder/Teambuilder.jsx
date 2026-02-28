import {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import CharacterCard from '../../components/shared/CharacterCard.jsx'
import {loadRoster} from '../../services/rosterStore.js'
import './Teambuilder.css'

export default function Teambuilder() {
	const navigate = useNavigate()
	const [roster, setRoster] = useState([])
	const [team, setTeam] = useState(() => {
		try {
			const saved = localStorage.getItem('brawlcraft_team')
			return saved ? JSON.parse(saved) : []
		} catch {return []}
	}) // max 6 slots
	const [selectedCharId, setSelectedCharId] = useState(null)
	const [searchText, setSearchText] = useState('')

	// Đọc roster từ localStorage (hoặc default) và trộn với Custom Brawler
	useEffect(() => {
		const adminRoster = loadRoster();
		let customRoster = [];
		try {
			const j = localStorage.getItem('brawlcraft_customs');
			if (j) customRoster = JSON.parse(j);
		} catch (e) { }
		setRoster([...customRoster, ...adminRoster]);
	}, [])

	const filteredRoster = roster.filter(char =>
		char.name.toLowerCase().includes(searchText.toLowerCase())
	)

	const addToTeam = (char) => {
		if (team.length >= 6) return
		if (team.find(c => c.id === char.id)) return
		setTeam(prev => [...prev, char])
	}

	const removeFromTeam = (id) => {
		setTeam(prev => prev.filter(c => c.id !== id))
	}

	const isInTeam = (id) => team.some(c => c.id === id)

	const handleSaveTeam = () => {
		localStorage.setItem('brawlcraft_team', JSON.stringify(team))
		navigate('/')
	}

	return (
		<div className="teambuilder">
			{/* Header */}
			<header className="teambuilder__header">
				<button className="btn btn-secondary teambuilder__back" onClick={() => navigate('/')}>
					← Back
				</button>
				<h1 className="teambuilder__title font-display">TEAMBUILDER</h1>
				<button
					className="btn btn-primary"
					onClick={() => navigate('/craft')}
					style={{marginLeft: 'auto', marginRight: '20px', backgroundColor: 'var(--accent-purple)', borderColor: 'var(--accent-purple)'}}
				>
					⚒ CRAFT NEW BRAWLER
				</button>
				<div className="teambuilder__team-count">
					<span>{team.length}</span><span className="teambuilder__team-count-max">/6</span>
				</div>
			</header>

			<div className="teambuilder__body">
				{/* Roster Grid */}
				<section className="teambuilder__roster">
					<div className="teambuilder__roster-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px'}}>
						<h2 className="teambuilder__section-title" style={{margin: 0}}>Roster ({filteredRoster.length})</h2>
						<input
							type="text"
							placeholder="Search by name..."
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							style={{padding: '0.4rem 0.8rem', borderRadius: '4px', border: '1px solid var(--border-subtle)', background: 'var(--bg-02)', color: 'var(--text-primary)', outline: 'none', maxWidth: '200px'}}
						/>
					</div>
					<div className="teambuilder__grid">
						{filteredRoster.map(char => (
							<div key={char.id} className="teambuilder__card-wrap">
								<CharacterCard
									character={char}
									selected={selectedCharId === char.id}
									onClick={() => setSelectedCharId(char.id === selectedCharId ? null : char.id)}
								/>
								<button
									className={`teambuilder__add-btn ${isInTeam(char.id) ? 'teambuilder__add-btn--in-team' : ''}`}
									onClick={() => isInTeam(char.id) ? removeFromTeam(char.id) : addToTeam(char)}
									title={isInTeam(char.id) ? 'Remove from team' : 'Add to team'}
								>
									{isInTeam(char.id) ? '✓ IN TEAM' : '+ ADD'}
								</button>
							</div>
						))}
					</div>
				</section>

				{/* Team Slots */}
				<aside className="teambuilder__sidebar">
					<h2 className="teambuilder__section-title">Your Team</h2>
					<div className="teambuilder__team-slots">
						{Array.from({length: 6}).map((_, i) => {
							const char = team[i]
							return (
								<div key={i} className={`teambuilder__slot ${!char ? 'teambuilder__slot--empty' : ''}`}>
									{char ? (
										<>
											<span className="teambuilder__slot-num">{i + 1}</span>
											<CharacterCard character={char} onClick={() => removeFromTeam(char.id)} />
											<button
												className="teambuilder__remove-btn"
												onClick={() => removeFromTeam(char.id)}
												title="Remove"
											>✕</button>
										</>
									) : (
										<span className="teambuilder__slot-placeholder">SLOT {i + 1}</span>
									)}
								</div>
							)
						})}
					</div>

					<button
						id="btn-save-team"
						className="btn btn-primary teambuilder__save-btn"
						disabled={team.length < 1}
						onClick={handleSaveTeam}
					>
						✓ Save Team
					</button>
				</aside>
			</div>
		</div>
	)
}
