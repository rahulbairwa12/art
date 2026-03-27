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
    // Go to the page and stop it before it finishes loading to inject localStorage
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
    
    // Inject localStorage
    const mockUser = {
        id: "dev_dGVzdEBleGFtLmNvbQ==",
        email: "dev_dGVzdEBleGFtLmNvbQ==@example.com",
        aud: "authenticated",
        role: "authenticated",
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {}
    };
    await page.evaluate((user) => {
        localStorage.setItem('dev_user', JSON.stringify(user));
    }, mockUser);
    
    console.log('Injected localStorage. Reloading page...');
    await page.reload({ waitUntil: 'networkidle2' });
    
    // Check if Open Theme button is available
    await new Promise(r => setTimeout(r, 2000));
    const openThemeBtn = await page.$('button:has-text("OPEN MY THEME"), button:has-text("OPEN THEME"), button:has-text("OPEN")');
    if (openThemeBtn) {
      console.log('Found Open Theme button, clicking...');
      await openThemeBtn.click();
      await new Promise(r => setTimeout(r, 5000));
      console.log('Waited 5 seconds after click.');
    } else {
        const elements = await page.$$('button');
        let clicked = false;
        for (const el of elements) {
            const text = await page.evaluate(el => el.textContent, el);
            if (text && text.toUpperCase().includes('OPEN')) {
                console.log('Found generic Open button, clicking...');
                await el.click();
                await new Promise(r => setTimeout(r, 5000));
                clicked = true;
                break;
            }
        }
        if (!clicked) console.log('Could not find open button.');
    }

  } catch (err) {
    console.log('Script Error:', err);
  } finally {
    await browser.close();
  }
})();
