import {useState, useEffect} from 'react';
import client from '../../services/showdownClient';
import './Leaderboard.css';

export default function Leaderboard({connected, format = 'gen9brawlcraftstandard'}) {
	const [html, setHtml] = useState('');

	useEffect(() => {
		if (!connected) return;

		// Fetch leaderboard info
		client.fetchLeaderboard(format);

		// Optional: Refresh periodically every 30s
		const interval = setInterval(() => {
			client.fetchLeaderboard(format);
		}, 30000);

		const unsub = client.on('laddertop', (data) => {
			if (data.formatId === format) {
				setHtml(data.html);
			}
		});

		return () => {
			clearInterval(interval);
			unsub();
		};
	}, [connected, format]);

	if (!html) return null;

	return (
		<div className="home-leaderboard animate-fadeInUp">
			<div className="leaderboard-glass">
				<h2 className="leaderboard-title">🏆 BRAWLCRAFT TOP 100</h2>
				<div
					className="leaderboard-content"
					dangerouslySetInnerHTML={{__html: html}}
				/>
			</div>
		</div>
	);
}
