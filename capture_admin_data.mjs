import {chromium} from 'playwright';

(async () => {
	const browser = await chromium.launch({headless: true});
	const page = await browser.newPage();

	try {
		await page.goto('http://localhost:5173/admin', {waitUntil: 'networkidle'});

		// Chờ bảng dữ liệu load (API trả về)
		await page.waitForTimeout(2000);

		// 1. Chụp Move Forge (Chiêu thức)
		// Click Tab Chiêu Thức nếu có (nếu nút bấm là "Moves" / "Chiêu Thức" form component)
		const moveTab = await page.$('button:has-text("Chiêu Thức"), button:has-text("Moves")');
		if (moveTab) await moveTab.click();
		await page.waitForTimeout(500);

		// Click vô Form Select 
		const selectMove = await page.$('select[name="moveSelect"], select');
		if (selectMove) {
			await selectMove.focus();
		}

		await page.screenshot({path: 'C:/Users/IT-THIEN/.gemini/antigravity/brain/06e1fd4d-a4a6-4986-a68c-f23b12b0944b/admin_moves_data.png', fullPage: true});
		console.log('Saved admin_moves_data.png');

		// Bấm Esc để nhả select
		await page.keyboard.press('Escape');
		await page.waitForTimeout(500);

		// 2. Chụp Brawlers
		const brawlerTab = await page.$('button:has-text("Brawlers"), button:has-text("Tướng")');
		if (brawlerTab) await brawlerTab.click();
		await page.waitForTimeout(500);

		await page.screenshot({path: 'C:/Users/IT-THIEN/.gemini/antigravity/brain/06e1fd4d-a4a6-4986-a68c-f23b12b0944b/admin_brawlers_data.png', fullPage: true});
		console.log('Saved admin_brawlers_data.png');

	} catch (err) {
		console.error('Lỗi khi chụp:', err);
	} finally {
		await browser.close();
	}
})();
