const puppeteer = require('puppeteer');

async function debugTorano() {
  console.log('Inspecting Torano sweaters structure...');
  const browser = await puppeteer.launch({ 
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const url = 'https://torano.vn/collections/ao-len';
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    const count = await page.evaluate(() => {
      return document.querySelectorAll('.product-loop').length;
    });
    console.log('Product loop elements found:', count);

  } catch (err) {
    console.log('Error:', err.message);
  }
  await browser.close();
}

debugTorano();
