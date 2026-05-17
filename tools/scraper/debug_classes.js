const puppeteer = require('puppeteer');

async function debugClasses() {
  console.log('Launching browser to debug HTML classes...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const urls = [
    'https://torano.vn/collections/ao-thun',
    'https://torano.vn/collections/quan-short',
    'https://torano.vn/collections/quan-kaki-basic',
    'https://torano.vn/collections/ao-len'
  ];

  for (const url of urls) {
    console.log(`\n===========================================`);
    console.log(`URL: ${url}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Let's print some common selectors
      const results = await page.evaluate(() => {
        const selCount = {};
        const selectors = [
          '.product-loop',
          '.product-block',
          '.product-item',
          '.pro-loop',
          '.col-xs-6',
          'div[class*="product"]',
          'div[class*="loop"]'
        ];
        selectors.forEach(sel => {
          selCount[sel] = document.querySelectorAll(sel).length;
        });
        return selCount;
      });
      console.log('Selectors count:', results);

      // Let's print the first few div class names
      const firstClasses = await page.evaluate(() => {
        const divs = Array.from(document.querySelectorAll('div[class]')).slice(0, 30);
        return divs.map(d => d.className).filter(c => c && c.includes('product') || c.includes('loop') || c.includes('col-'));
      });
      console.log('Div classes containing key terms (sample):', [...new Set(firstClasses)].slice(0, 10));

    } catch (err) {
      console.log(`Error loading URL:`, err.message);
    }
  }
  await browser.close();
}

debugClasses();
