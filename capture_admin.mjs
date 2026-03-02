import puppeteer from 'puppeteer';

(async () => {
	try {
		console.log('Launching browser...');
		const browser = await puppeteer.launch({
			headless: 'new', // or true
			args: ['--no-sandbox', '--disable-setuid-sandbox']
		});
		const page = await browser.newPage();
		await page.setViewport({width: 1280, height: 1080});

		console.log('Navigating to admin...');
		await page.goto('http://localhost:5173/admin', {waitUntil: 'networkidle2'});

		// Xử lý Login nếu có
		const needsLogin = await page.$('input[type="password"]');
		if (needsLogin) {
			console.log('Logging in...');
			await page.type('input[type="text"]', 'admin');
			await page.type('input[type="password"]', 'admin');
			await page.click('button[type="submit"]');
			await page.waitForNavigation({waitUntil: 'networkidle2'}).catch(() => console.log('nav timeout'));
		}

		console.log('Waiting for character cards...');
		await page.waitForSelector('.shared__char-card, .admin__char-card', {timeout: 5000}).catch(() => { });

		console.log('Clicking the first character...');
		const cards = await page.$$('.shared__char-card, .admin__char-card');
		if (cards.length > 0) {
			await cards[0].click();
			await new Promise(r => setTimeout(r, 1000));
		}

		console.log('Scrolling to moves and adding a move...');
		await page.evaluate(() => {
			const buttons = Array.from(document.querySelectorAll('button'));
			const addMoveBtn = buttons.find(b => b.textContent.includes('Move') || b.textContent.includes('Chiêu'));
			if (addMoveBtn) addMoveBtn.click();
		});
		await new Promise(r => setTimeout(r, 1000));

		console.log('Modifying move fields...');
		// Kích hoạt các Select Form của Base Info / Cost / Drawback / Effect
		await page.evaluate(() => {
			const selects = Array.from(document.querySelectorAll('select'));

			// Set Category to Physical
			const catSelect = selects.find(sel => sel.innerHTML.includes('Status') && sel.innerHTML.includes('Physical'));
			if (catSelect) {
				catSelect.value = 'Physical';
				catSelect.dispatchEvent(new Event('change', {bubbles: true}));
			}

			// Set Cost to HP
			const costSelect = selects.find(sel => sel.innerHTML.includes('Trừ % HP'));
			if (costSelect) {
				costSelect.value = 'hp';
				costSelect.dispatchEvent(new Event('change', {bubbles: true}));
			}

			// Set Drawback to Stat
			const drawbackSelect = selects.find(sel => sel.innerHTML.includes('Tự giảm Chỉ số'));
			if (drawbackSelect) {
				drawbackSelect.value = 'stat';
				drawbackSelect.dispatchEvent(new Event('change', {bubbles: true}));
			}

			// Set Secondary to Stat
			const secSelect = selects.find(sel => sel.innerHTML.includes('Tăng/Giảm Chỉ Số') || sel.innerHTML.includes('Choáng'));
			if (secSelect) {
				secSelect.value = 'stat';
				secSelect.dispatchEvent(new Event('change', {bubbles: true}));
			}
		});
		await new Promise(r => setTimeout(r, 500));

		// Điền số cho các ô Input được đẻ ra
		await page.evaluate(() => {
			const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
			inputs.forEach(inp => {
				if (inp.placeholder === '% HP' || inp.title === 'Tỉ lệ vỡ effect %') {
					inp.value = 30;
					inp.dispatchEvent(new Event('change', {bubbles: true}));
				}
			});
		});
		await new Promise(r => setTimeout(r, 1000));

		console.log('Taking screenshot...');
		const screenshotPath = 'C:/Users/IT-THIEN/.gemini/antigravity/brain/06e1fd4d-a4a6-4986-a68c-f23b12b0944b/admin_move_forge_real.png';
		await page.screenshot({path: screenshotPath, fullPage: true});
		console.log('Screenshot saved to ' + screenshotPath);

		await browser.close();
	} catch (e) {
		console.error(e);
		process.exit(1);
	}
})();
