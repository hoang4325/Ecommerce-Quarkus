const puppeteer = require('puppeteer');

async function debugYody() {
  console.log('Launching browser to debug Yody.vn classes...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const url = 'https://yody.vn/ao-polo-nam';
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Print common selectors
    const results = await page.evaluate(() => {
      const selectors = [
        '.product-block',
        '.product-item',
        '.product-card',
        '.pro-loop',
        'div[class*="product"]',
        'a[class*="product"]',
        'h3 a',
        '.price'
      ];
      const counts = {};
      selectors.forEach(sel => {
        counts[sel] = document.querySelectorAll(sel).length;
      });
      return counts;
    });
    console.log('Selectors count on Yody:', results);

    // Let's find some links that might be product titles
    const links = await page.evaluate(() => {
      const allLinks = Array.from(document.querySelectorAll('a'));
      return allLinks.filter(l => l.innerText.trim().length > 10 && (l.getAttribute('href') || '').includes('-nam'))
        .map(l => ({
          href: l.getAttribute('href'),
          text: l.innerText.trim(),
          parentClasses: l.parentElement?.className
        })).slice(0, 10);
    });
    console.log('Sample links:', links);

    // Let's print any element that has a class with "product"
    const productClasses = await page.evaluate(() => {
      const elWithClass = Array.from(document.querySelectorAll('*[class*="product"]')).slice(0, 20);
      return elWithClass.map(el => ({ tag: el.tagName, class: el.className }));
    });
    console.log('Sample product-related classes:', productClasses);

  } catch (err) {
    console.log(`Error:`, err.message);
  }
  await browser.close();
}

debugYody();
