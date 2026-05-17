const puppeteer = require('puppeteer');

async function debugCoolmate() {
  console.log('Launching browser to test Coolmate scraping logic...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const url = 'https://www.coolmate.me/collection/ao-thun';
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    const products = await page.evaluate(() => {
      const items = [];
      const nameLinks = Array.from(document.querySelectorAll('a[href*="/product/"]'));
      
      const seen = new Set();
      nameLinks.forEach(link => {
        const href = link.getAttribute('href');
        const baseHref = href.split('?')[0];
        if (seen.has(baseHref)) return;
        
        const title = link.innerText.trim();
        if (title.length < 5 || title.includes('\n') || title === 'NEW' || title === 'BÁN CHẠY') return;
        
        let price = '250.000 đ';
        let img = '';
        
        let parent = link.parentElement;
        for (let i = 0; i < 4; i++) {
          if (!parent) break;
          
          if (price === '250.000 đ') {
            const priceEls = Array.from(parent.querySelectorAll('div, span, p')).filter(el => {
              const text = el.innerText.trim();
              return text.includes('đ') && /\d/.test(text) && text.length < 25 && !text.includes('\n');
            });
            if (priceEls.length > 0) {
              price = priceEls[0].innerText.trim();
            }
          }
          
          if (!img) {
            const imgEls = parent.querySelectorAll('img');
            if (imgEls.length > 0) {
              img = imgEls[0].getAttribute('data-src') || imgEls[0].getAttribute('src') || imgEls[0].src;
            }
          }
          
          parent = parent.parentElement;
        }
        
        if (title && price && img && (img.includes('coolmate') || img.includes('uploads') || img.includes('n7media'))) {
          seen.add(baseHref);
          items.push({ name: title, price, image: img });
        }
      });
      return items;
    });
    console.log(`Scraped ${products.length} products! Sample:`, products.slice(0, 5));

  } catch (err) {
    console.log(`Error:`, err.message);
  }
  await browser.close();
}

debugCoolmate();
