const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

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
    
    await page.reload({ waitUntil: 'networkidle2' });
    
    // Check if Open Theme button is available and click it
    await new Promise(r => setTimeout(r, 2000));
    const elements = await page.$$('button');
    let clicked = false;
    for (const el of elements) {
        const text = await page.evaluate(el => el.textContent, el);
        if (text && text.toUpperCase().includes('OPEN MY THEME')) {
            await el.click();
            clicked = true;
            break;
        }
    }
    
    if (clicked) {
        // Wait for potential crash to render
        await new Promise(r => setTimeout(r, 2000));
        
        // Extract ErrorBoundary text
        const errorText = await page.evaluate(() => {
            const details = document.querySelector('details');
            return details ? details.innerText : 'No error boundary found on page.';
        });
        console.log('--- CRASH LOG ---');
        console.log(errorText);
        console.log('-----------------');
    } else {
        console.log('Could not find OPEN MY THEME button.');
    }

  } catch (err) {
    console.log('Script Error:', err);
  } finally {
    await browser.close();
  }
})();
