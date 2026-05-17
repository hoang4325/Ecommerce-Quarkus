const puppeteer = require('puppeteer');

async function getYodyStructure() {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  try {
    await page.goto('https://yody.vn/ao-polo-nam', { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait a few seconds for hydration
    await new Promise(r => setTimeout(r, 4000));

    // Find all links containing an image and print their text, href, and classes
    const links = await page.evaluate(() => {
      const results = [];
      const anchors = Array.from(document.querySelectorAll('a'));
      anchors.forEach(a => {
        const href = a.getAttribute('href') || '';
        // Product URLs on Yody usually end with the product name and have a clean slug, e.g. /ao-polo-nam-...
        if (href.startsWith('/') && href.split('/').length === 2 && href.includes('-nam')) {
          const img = a.querySelector('img');
          const title = a.innerText.trim();
          if (img || title.length > 10) {
            results.push({
              href,
              title: title.substring(0, 100),
              imgSrc: img?.src || img?.getAttribute('data-src') || '',
              classes: a.className
            });
          }
        }
      });
      return results;
    });

    console.log(`Found ${links.length} potential product links!`);
    console.log('Sample links:', links.slice(0, 15));

  } catch (err) {
    console.log('Error:', err.message);
  }
  await browser.close();
}

getYodyStructure();
