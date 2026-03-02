import {useState, useMemo} from 'react';
import {useNavigate} from 'react-router-dom';
import './CraftRoom.css';

// BST = Cơ sở tổng chỉ số (Base Stat Total) = 500
const MAX_BST = 500;
const MIN_STAT = 50;
const MAX_STAT = 120;

const ALL_TYPES = ['Shadow', 'Arcane', 'Holy', 'Undead', 'Dragon', 'Nature', 'Steel', 'Fire', 'Water'];

export default function CraftRoom() {
	const navigate = useNavigate();

	const [brawlerName, setBrawlerName] = useState('Custom Brawler');
	const [selectedTypes, setSelectedTypes] = useState(['Shadow']);
	const [stats, setStats] = useState({
		hp: 80,
		atk: 80,
		def: 80,
		spa: 80,
		spd: 80,
		spe: 100
	});

	const currentBST = useMemo(() => {
		return Object.values(stats).reduce((a, b) => a + b, 0);
	}, [stats]);

	const handleToggleType = (type) => {
		if (selectedTypes.includes(type)) {
			if (selectedTypes.length > 1) {
				setSelectedTypes(selectedTypes.filter(t => t !== type));
			}
		} else if (selectedTypes.length < 2) {
			setSelectedTypes([...selectedTypes, type]);
		}
	};

	const pointsRemaining = MAX_BST - currentBST;

	const handleStatChange = (statName, val) => {
		const num = parseInt(val) || MIN_STAT;
		const clamped = Math.max(MIN_STAT, Math.min(MAX_STAT, num));

		// Check if increasing would exceed MAX_BST
		const diff = clamped - stats[statName];
		if (pointsRemaining - diff < 0 && diff > 0) {
			// Can't increase further
			const maxAllowed = stats[statName] + pointsRemaining;
			setStats(prev => ({...prev, [statName]: maxAllowed}));
			return;
		}

		setStats(prev => ({...prev, [statName]: clamped}));
	};

	const validateBrawlerInput = () => {
		if (currentBST !== MAX_BST) {
			alert(`❌ KHÔNG HỢP LỆ! Tổng chỉ số hiện tại là ${currentBST}/${MAX_BST} (Đang thừa ${pointsRemaining} điểm).`);
			return false;
		}
		const hasOutOfBounds = Object.values(stats).some(val => val < MIN_STAT || val > MAX_STAT);
		if (hasOutOfBounds) {
			alert(`❌ KHÔNG HỢP LỆ! Mỗi chỉ số phải nằm trong khoảng từ ${MIN_STAT} đến ${MAX_STAT}.`);
			return false;
		}
		alert(`✅ HỢP LỆ! Brawler "${brawlerName}" (Hệ ${selectedTypes.join('/')}, Tổng ${currentBST} BST) đã đạt chuẩn Server!`);
		return true;
	};

	const saveBrawler = () => {
		if (currentBST !== MAX_BST) {
			alert(`❌ Bạn phải sử dụng toàn bộ ${MAX_BST} điểm chỉ số! (Đang thừa ${pointsRemaining} điểm)`);
			return;
		}
		const hasOutOfBounds = Object.values(stats).some(val => val < MIN_STAT || val > MAX_STAT);
		if (hasOutOfBounds) {
			alert(`❌ KHÔNG HỢP LỆ! Mỗi chỉ số phải nằm trong khoảng từ ${MIN_STAT} đến ${MAX_STAT}.`);
			return;
		}

		const customBrawler = {
			id: 'custom_' + Date.now(),
			isCustom: true,
			name: brawlerName,
			species: brawlerName,
			types: selectedTypes,
			baseStats: stats,
			abilities: {0: 'Pressure'}, // Mặc định trước
			moves: ['tackle', 'quickattack'], // Mặc định trước
			level: 100,
			item: '',
		};

		// Lưu vào LocalStorage
		let existing = [];
		try {
			const j = localStorage.getItem('brawlcraft_customs');
			if (j) existing = JSON.parse(j);
		} catch (e) { }

		existing.push(customBrawler);
		localStorage.setItem('brawlcraft_customs', JSON.stringify(existing));

		alert('Chế tạo Brawler thành công!');
		navigate('/teambuilder');
	};

	return (
		<div className="craft-room">
			<div className="craft-room__header animate-fadeInDown">
				<button className="btn btn-secondary" onClick={() => navigate('/teambuilder')}>
					← Back
				</button>
				<h1 className="font-display">⚒ BRAWLER FORGE</h1>
				<div className="craft-room__points">
					ĐIỂM KHẢ DỤNG: <span className={pointsRemaining === 0 ? 'text-success' : 'text-warning'}>{pointsRemaining}</span> / {MAX_BST}
				</div>
			</div>

			<div className="craft-room__body animate-fadeInUp">
				<div className="craft-panel craft-panel--info">
					<h3>THÔNG TIN BRAWLER</h3>
					<div className="form-group">
						<label>Tên Brawler</label>
						<input
							type="text"
							value={brawlerName}
							onChange={(e) => setBrawlerName(e.target.value)}
							maxLength={18}
						/>
					</div>

					<div className="form-group">
						<label>Hệ (Types - Chọn tối đa 2)</label>
						<div className="type-grid">
							{ALL_TYPES.map(type => (
								<button
									key={type}
									className={`type-btn type-btn--${type.toLowerCase()} ${selectedTypes.includes(type) ? 'active' : ''}`}
									onClick={() => handleToggleType(type)}
								>
									{type}
								</button>
							))}
						</div>
					</div>
				</div>

				<div className="craft-panel craft-panel--stats">
					<h3>PHÂN BỔ CHỈ SỐ LÕI (50 - 120)</h3>
					<div className="stats-list">
						{Object.entries(stats).map(([key, val]) => (
							<div className="stat-row" key={key}>
								<div className="stat-label">{key.toUpperCase()}</div>
								<div className="stat-slider">
									<input
										type="range"
										min={MIN_STAT}
										max={MAX_STAT}
										value={val}
										onChange={(e) => handleStatChange(key, e.target.value)}
									/>
								</div>
								<div className="stat-value">
									<input
										type="number"
										min={MIN_STAT}
										max={MAX_STAT}
										value={val}
										onChange={(e) => handleStatChange(key, e.target.value)}
									/>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="craft-room__footer">
				<button className="btn btn-secondary btn-lg" onClick={validateBrawlerInput} style={{marginRight: '15px'}}>
					✓ VALIDATE BRAWLER
				</button>
				<button className="btn btn-primary btn-lg" onClick={saveBrawler}>
					⚒ CHẾ TẠO BRAWLER NÀY
				</button>
			</div>
		</div>
	);
}
