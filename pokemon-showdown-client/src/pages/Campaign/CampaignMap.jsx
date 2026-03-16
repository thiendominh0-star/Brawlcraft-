import {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {
	loadCampaignRun,
	saveCampaignRun,
	loadCampaignCurrentStage,
	saveCampaignCurrentStage,
	clearCampaignRun
} from '../../services/towerStore.js'
import {generateTowerRun} from '../../services/towerGenerator.js'
import './CampaignMap.css'

export default function CampaignMap() {
	const navigate = useNavigate()
	const [run, setRun] = useState(null)
	const [currentStage, setCurrentStage] = useState(1) // 1-indexed

	useEffect(() => {
		// 1. Tải Lộ trình hiện tại, nếu không có thì Sinh Mới!
		let savedRun = loadCampaignRun()
		if (!savedRun || savedRun.length === 0) {
			savedRun = generateTowerRun() // Sinh ra run 10-12 tầng tuỳ admin config
			saveCampaignRun(savedRun)
			saveCampaignCurrentStage(1) // Reset về Màn 1
		}
		
		setRun(savedRun)
		setCurrentStage(loadCampaignCurrentStage())
	}, [])

	if (!run) return <div className="campaign-loader">Đang tạo bản đồ chiến dịch...</div>

	// Map runs from bottom (1) to top (end) visually? Or top to bottom?
	// Tùy thiết kế: Đảo ngược mảng để Tầng 1 nằm dưới cùng (Scroll Bottom -> Top)
	const reversedRun = [...run].reverse()
	const totalStages = run.length

	const handleBattleClick = (stageInfo, stageIdx) => {
		// handle BATTLE logic mapping later
		console.log('Bắt đầu trận đấu tại Màn:', stageIdx, stageInfo)
		alert(`Vào Trận: Màn ${stageIdx} - Gặp địch: ${stageInfo.name}`)
	}

	const handleResetCampaign = () => {
		if (window.confirm("Bạn có chắc muốn hủy bỏ Lộ trình này để sinh Lộ trình mới?")) {
			clearCampaignRun()
			window.location.reload()
		}
	}

	return (
		<div className="campaign-wrapper">
			<div className="campaign-header">
				<button className="btn btn-secondary back-btn" onClick={() => navigate('/')}>⟵ VỀ NHÀ</button>
				<h1 className="campaign-title font-display">CHIẾN DỊCH PVE</h1>
				<button className="btn btn-danger reset-btn" onClick={handleResetCampaign}>⟲ LÀM LẠI</button>
			</div>

			<div className="campaign-map-container">
				{/* Loop qua Tầng ngược để render từ trên xuống dưới (Nhưng số nhỏ ở dưới) */}
				{reversedRun.map((stageInfo, index) => {
					// Actual floor index from 1 to totalStages
					const floorNumber = totalStages - index
					
					const isCleared = floorNumber < currentStage
					const isCurrent = floorNumber === currentStage
					const isLocked = floorNumber > currentStage

					return (
						<div 
							key={floorNumber} 
							className={`campaign-node ${isCleared ? 'cleared' : ''} ${isCurrent ? 'current' : ''} ${isLocked ? 'locked' : ''} ${stageInfo.isBoss ? 'boss-node' : ''}`}
						>
							<div className="node-connector" />
							
							<div className="node-content">
								<div className="node-floor-label">MÀN {floorNumber}</div>
								
								<div className="node-details">
									<h2 className="node-name">
										{stageInfo.isBoss ? '🔥 Ác Mộng Vực Sâu' : stageInfo.name}
									</h2>
									<p className="node-enemies-info">
										{stageInfo.isBoss 
											? `1 ĐẠI TRÙM LV.${stageInfo.enemyLevel}` 
											: `${stageInfo.brawlers ? stageInfo.brawlers.length : 0} VỆ SĨ LV.${stageInfo.enemyLevel}`
										}
									</p>
								</div>

								<div className="node-action">
									{isCleared && <span className="cleared-badge">✓ Đã Qua</span>}
									{isLocked && <span className="locked-badge">🔒 Khóa</span>}
									{isCurrent && (
										<button 
											className="btn btn-primary battle-btn pulse-anim"
											onClick={() => handleBattleClick(stageInfo, floorNumber)}
										>
											⚔ CHIẾN
										</button>
									)}
								</div>
							</div>
						</div>
					)
				})}
				<div className="map-start-point">TRẠI TÂN BINH</div>
			</div>
		</div>
	)
}
