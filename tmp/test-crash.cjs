const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('BROWSER CONSOLE ERROR:', msg.text());
  });
  page.on('pageerror', err => {
    console.log('BROWSER PAGE ERROR:', err.message);
  });

  try {
    await page.goto('http://localhost:3000');
    // Wait for the email input
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'test@example.com');
    await page.click('button[type="submit"]');

    // Wait for OTP input
    await page.waitForSelector('.gap-2 input'); // First OTP slot
    await page.keyboard.type('000000');
    
    // Login might happen automatically or need button click
    await new Promise(r => setTimeout(r, 2000));
    
    // Check if Open Theme button is available
    const openThemeBtn = await page.$('button:has-text("OPEN MY THEME"), button:has-text("OPEN THEME")');
    if (openThemeBtn) {
      await openThemeBtn.click();
      await new Promise(r => setTimeout(r, 2000));
    } else {
        // Try selecting by text content if the previous fails
        const elements = await page.$$('button');
        for (const el of elements) {
            const text = await page.evaluate(el => el.textContent, el);
            if (text && text.toUpperCase().includes('OPEN')) {
                await el.click();
                await new Promise(r => setTimeout(r, 2000));
                break;
            }
        }
    }

  } catch (err) {
    console.log('Script Error:', err);
  } finally {
    await browser.close();
  }
})();
