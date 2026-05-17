const puppeteer = require('puppeteer');

async function debugCanifaKaki() {
  console.log('Inspecting Canifa Kaki page structure...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  const url = 'https://canifa.com/nam/quan-kaki.html';
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 3000));
    
    const elements = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.product-item, [class*="product-item"]'));
      return cards.map(c => ({
        className: c.className,
        html: c.innerHTML.substring(0, 300)
      }));
    });
    
    console.log(`Found ${elements.length} matching elements:`);
    console.log(elements.slice(0, 3));

  } catch (err) {
    console.log('Error:', err.message);
  }
  await browser.close();
}

debugCanifaKaki();
