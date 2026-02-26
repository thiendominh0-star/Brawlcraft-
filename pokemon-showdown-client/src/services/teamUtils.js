/**
 * teamUtils.js
 * Chuyển đổi dữ liệu đội hình từ Frontend (rosterStore) sang định dạng Showdown
 */

export function packTeamForShowdown(clientTeam) {
	if (!clientTeam || !clientTeam.length) return null;

	// Định dạng Packed Team của Showdown:
	// name|species|item|ability|moves|nature|evs|gender|ivs|shiny|level|happiness,pokeball,hpType]...

	return clientTeam.map(char => {
		const name = char.name || '';
		const species = char.name || '';
		// Bỏ khoảng trắng trong tên Item và Ability để map đúng id (VD: Life Orb -> lifeorb)
		const item = char.item ? char.item.replace(/\s+/g, '') : '';
		const ability = char.ability ? char.ability.replace(/\s+/g, '') : '';

		// Xử lý moves (lấy ID cơ bản từ tên)
		let moves = (char.moves || []).slice(0, 4)
			.filter(m => m && m.name)
			.map(m => m.name.toLowerCase().replace(/[^a-z0-9]/g, ''));

		if (moves.length === 0) moves = ['struggle'];
		const movesStr = moves.join(',');

		const nature = '';
		const evs = '';
		const gender = '';
		const ivs = '';
		const shiny = '';
		const level = '100';

		return `${name}|${species}|${item}|${ability}|${movesStr}|${nature}|${evs}|${gender}|${ivs}|${shiny}|${level}|`;
	}).join(']');
}
