const puppeteer = require('puppeteer');

async function testYodyPuppeteer() {
  console.log('Launching browser to test Yody paginated hydration...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  const url = 'https://yody.vn/ao-len-nam?page=2';
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 5000)); // wait for client-side hydration
    
    // Extract products using the DOM or by evaluating window properties
    const products = await page.evaluate(() => {
      // In Nuxt, we can check window.__NUXT__ or the actual DOM product nodes
      // Let's find all product cards by looking for text containing 'đ' and an image
      const items = [];
      const cards = Array.from(document.querySelectorAll('a')).filter(a => {
        const href = a.getAttribute('href') || '';
        return href.startsWith('/') && href.split('/').length === 2 && href.includes('-nam');
      });
      
      cards.forEach(card => {
        const title = card.innerText.trim();
        const img = card.querySelector('img');
        if (title.length > 10 && img) {
          items.push({
            title: title.substring(0, 100),
            imgSrc: img.src || img.getAttribute('data-src') || ''
          });
        }
      });
      return items;
    });

    console.log(`Found ${products.length} products via Puppeteer on page 2!`);
    console.log('Sample:', products.slice(0, 5));

  } catch (err) {
    console.log('Error:', err.message);
  }
  await browser.close();
}

testYodyPuppeteer();
