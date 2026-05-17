const puppeteer = require('puppeteer');

async function debugCanifa() {
  console.log('Launching browser to debug Canifa...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const url = 'https://canifa.com/nam/ao-len.html';
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Print common selectors
    const results = await page.evaluate(() => {
      const selectors = [
        '.product-item',
        '.product-card',
        '.product-image',
        'div[class*="product"]',
        'a[class*="product"]',
        'img[class*="product"]'
      ];
      const counts = {};
      selectors.forEach(sel => {
        counts[sel] = document.querySelectorAll(sel).length;
      });
      return counts;
    });
    console.log('Selectors count on Canifa:', results);

    // Let's print some anchor links containing product details
    const links = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a'))
        .map(a => ({ href: a.getAttribute('href') || '', text: a.innerText.trim() }))
        .filter(l => l.href.includes('.html') && l.text.length > 5)
        .slice(0, 15);
    });
    console.log('Sample links:', links);

  } catch (err) {
    console.log('Error:', err.message);
  }
  await browser.close();
}

debugCanifa();
