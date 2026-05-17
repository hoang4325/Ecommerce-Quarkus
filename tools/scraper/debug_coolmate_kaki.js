const puppeteer = require('puppeteer');

async function debugCoolmate() {
  console.log('Inspecting Coolmate kaki page structure...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  const url = 'https://www.coolmate.me/collection/quan-kaki-nam';
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    
    const items = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/product/"]'));
      return links.map(l => ({
        text: l.innerText.trim(),
        href: l.getAttribute('href')
      })).filter(l => l.text.length > 5);
    });
    
    console.log(`Found ${items.length} items on Coolmate:`);
    console.log(items.slice(0, 10));

  } catch (err) {
    console.log('Error:', err.message);
  }
  await browser.close();
}

debugCoolmate();
